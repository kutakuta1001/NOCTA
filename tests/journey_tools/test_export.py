"""書き出し（export）のテスト。位置情報を消すこと・途中で失敗しても前の公開が残ることを確かめる。"""
import io
import json
import re
import shutil
import unittest
from pathlib import Path
from unittest import mock

from tests.journey_tools.helpers import REPO, tmpdir

from PIL import Image, ImageCms, IptcImagePlugin
from jr import export, store

T = 1456801200


def rich_jpeg(path, size=(2400, 1600), orientation=None, corners=False):
    """GPS・XMP・IPTC・ICC を入れた JPEG を作る。"""
    path.parent.mkdir(parents=True, exist_ok=True)
    im = Image.new("RGB", size, (90, 120, 160))
    if corners:
        w, h = size
        for (x, y), c in {(0, 0): (255, 0, 0), (w - 1, 0): (0, 255, 0), (0, h - 1): (0, 0, 255), (w - 1, h - 1): (255, 255, 0)}.items():
            for dx in range(min(10, w)):
                for dy in range(min(10, h)):
                    im.putpixel((min(max(x - dx if x else x + dx, 0), w - 1), min(max(y - dy if y else y + dy, 0), h - 1)), c)
    ex = im.getexif()
    gps = ex.get_ifd(0x8825)
    gps[1], gps[2], gps[3], gps[4] = "N", (43.0, 11.0, 0.0), "E", (140.0, 59.0, 0.0)
    if orientation:
        ex[274] = orientation
    icc = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()
    xmp = b'<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF><rdf:Description exif:GPSLatitude="43,11N"/></rdf:RDF></x:xmpmeta>'
    buf = io.BytesIO()
    im.save(buf, "JPEG", exif=ex, icc_profile=icc, xmp=xmp)
    data = buf.getvalue()
    # IPTC（APP13）を SOI の直後に差し込む
    iptc = b"\x1c\x02\x5a\x00\x05Otaru"
    app13_body = b"Photoshop 3.0\x008BIM\x04\x04\x00\x00" + len(iptc).to_bytes(4, "big") + iptc
    app13 = b"\xff\xed" + (len(app13_body) + 2).to_bytes(2, "big") + app13_body
    path.write_bytes(data[:2] + app13 + data[2:])
    return path


def has_iptc(path):
    with Image.open(path) as im:
        return IptcImagePlugin.getiptcinfo(im) is not None


class ExportTest(unittest.TestCase):
    def setUp(self):
        self.home = tmpdir()
        self.repo = tmpdir()
        journey = self.repo / "website" / "the-first-flower" / "journey"
        journey.mkdir(parents=True)
        shutil.copy(REPO / "website" / "the-first-flower" / "journey" / "journey-core.js", journey / "journey-core.js")
        self.journey = journey
        self.conn = store.connect(self.home / "s.db")
        self.n = 0

    def photo(self, region, path=None, **kw):
        self.n += 1
        pid = f"{self.n:016x}"
        sha = pid * 4
        path = path or rich_jpeg(self.home / "in" / f"{pid}.jpg", **kw)
        self.conn.execute("INSERT INTO photos(id, sha256, lkey, taken_utc, lat, lng) VALUES (?,?,?,?,?,?)", (pid, sha, pid, T, 43.19, 140.99))
        self.conn.execute("INSERT INTO photo_variants(photo_id, sha256, path, role) VALUES (?,?,?, 'original')", (pid, sha, str(path)))
        self.conn.execute("INSERT INTO region_choices(photo_id, region_id, selected, variant_sha256) VALUES (?,?,1,?)", (pid, region, sha))
        return pid

    def run_export(self, **kw):
        return export.run(self.conn, self.home, self.repo, **kw)

    def data(self):
        text = (self.journey / "tff-journey-data.js").read_text(encoding="utf-8")
        return json.loads(re.search(r"const TFF_JOURNEY = (.*);\s*$", text, re.S).group(1))

    def images(self):
        return sorted(p.name for p in (self.journey / "img").glob("*.jpg"))

    def test_export_strips_metadata(self):
        a = self.photo("JP-01")
        self.photo("JP-01")
        src = self.home / "in" / f"{a}.jpg"
        with Image.open(src) as im:
            self.assertTrue(im.getexif().get_ifd(0x8825))
            self.assertIn("xmp", im.info)
            self.assertIn("icc_profile", im.info)
        self.assertTrue(has_iptc(src))
        r = self.run_export()
        self.assertTrue(r.ok, r.reasons)
        files = list((self.journey / "img").glob("*.jpg"))
        self.assertEqual(len(files), 4)
        for f in files:
            with Image.open(f) as im:
                self.assertEqual(len(im.getexif()), 0, f.name)
                self.assertNotIn("xmp", im.info)
                self.assertNotIn("icc_profile", im.info)
            self.assertFalse(has_iptc(f))
            self.assertNotIn(b"GPS", f.read_bytes())

    def test_export_rotation_applied(self):
        a = self.photo("JP-01", size=(120, 80), orientation=6, corners=True)
        self.photo("JP-01")
        self.assertTrue(self.run_export().ok)
        with Image.open(self.journey / "img" / f"{a}.jpg") as im:
            w, h = im.size
            self.assertLess(w, h)
            # Orientation 6 は時計回りに 90 度。元の左下（青）が新しい左上に来る
            r, g, b = im.getpixel((2, 2))
            self.assertGreater(b, 150)
            self.assertLess(r, 100)

    def test_export_no_upscale(self):
        a = self.photo("JP-01", size=(300, 200))
        self.photo("JP-01")
        self.assertTrue(self.run_export().ok)
        with Image.open(self.journey / "img" / f"{a}.jpg") as im:
            self.assertEqual(max(im.size), 300)

    def test_export_size_limit(self):
        self.photo("JP-01")
        self.photo("JP-01")
        self.assertTrue(self.run_export().ok)
        for f in (self.journey / "img").glob("*.jpg"):
            self.assertLess(f.stat().st_size, 1_000_000)
            with Image.open(f) as im:
                self.assertEqual(max(im.size), 480 if f.name.endswith("-s.jpg") else 1600)

    def test_export_publishes_only_2_to_3(self):
        self.photo("JP-01")
        self.photo("JP-01")
        self.photo("JP-26")
        self.assertTrue(self.run_export().ok)
        d = self.data()
        self.assertEqual([r["id"] for r in d["regions"]], ["JP-01"])
        self.assertEqual(len(d["photos"]), 2)
        self.assertEqual(d["regions"][0]["name"], "北海道")
        p = next(iter(d["photos"].values()))
        self.assertEqual(p["taken"], "2016-03")
        self.assertEqual(p["alt"], "北海道の景色")

    def test_export_removes_unselected(self):
        a = self.photo("JP-01")
        self.photo("JP-01")
        self.photo("JP-01")
        self.assertTrue(self.run_export().ok)
        self.assertEqual(len(self.images()), 6)
        self.conn.execute("UPDATE region_choices SET selected = 0 WHERE photo_id = ?", (a,))
        self.assertTrue(self.run_export().ok)
        self.assertEqual(len(self.images()), 4)
        self.assertNotIn(a + ".jpg", self.images())

    def test_export_keeps_previous_on_failure(self):
        self.photo("JP-01")
        self.photo("JP-01")
        self.assertTrue(self.run_export().ok)
        before_data = (self.journey / "tff-journey-data.js").read_text(encoding="utf-8")
        before_imgs = self.images()
        self.photo("JP-26")
        self.photo("JP-26")
        r = self.run_export(validate=lambda data: (False, ["x"]))
        self.assertFalse(r.ok)
        self.assertEqual((self.journey / "tff-journey-data.js").read_text(encoding="utf-8"), before_data)
        self.assertEqual(self.images(), before_imgs)

    def test_export_failure_at_data_write(self):
        self.photo("JP-01")
        self.photo("JP-01")
        self.assertTrue(self.run_export().ok)
        before = (self.journey / "tff-journey-data.js").read_text(encoding="utf-8")
        before_imgs = set(self.images())
        self.photo("JP-26")
        self.photo("JP-26")
        with mock.patch.object(export, "_write_data", side_effect=OSError("disk full")):
            r = self.run_export()
        self.assertFalse(r.ok)
        self.assertEqual((self.journey / "tff-journey-data.js").read_text(encoding="utf-8"), before)
        self.assertTrue(before_imgs <= set(self.images()))

    def test_export_lock(self):
        (self.home / "export.lock").write_text("busy")
        r = self.run_export()
        self.assertFalse(r.ok)
        self.assertIn("lock", " ".join(r.reasons))

    def test_export_uses_selected_variant(self):
        a = self.photo("JP-01", size=(2400, 1600))
        self.photo("JP-01")
        edited = rich_jpeg(self.home / "in" / "edited.jpg", size=(1000, 1000))
        self.conn.execute("INSERT INTO photo_variants(photo_id, sha256, path, role) VALUES (?, 'e' || ?, ?, 'edited')", (a, "x" * 63, str(edited)))
        self.assertTrue(self.run_export().ok)
        with Image.open(self.journey / "img" / f"{a}.jpg") as im:
            self.assertEqual(im.size, (1600, 1067))

    def test_export_caption_is_json_string(self):
        a = self.photo("JP-01")
        self.photo("JP-01")
        self.conn.execute("INSERT INTO photo_editorial(photo_id, caption) VALUES (?, ?)", (a, '</script><b>"'))
        self.assertTrue(self.run_export().ok)
        self.assertEqual(self.data()["photos"][a]["caption"], '</script><b>"')

    def test_export_place_with_representatives(self):
        self.conn.execute("INSERT INTO places(id, parent_id, name, lat, lng, radius_km) VALUES ('place-01-1', 'JP-01', '小樽', 43.19, 140.99, 3)")
        a = self.photo("place-01-1")
        b = self.photo("place-01-1")
        for i, pid in enumerate((a, b)):
            self.conn.execute("INSERT INTO representatives(parent_id, photo_id, ord) VALUES ('JP-01', ?, ?)", (pid, i))
        self.assertTrue(self.run_export().ok)
        d = self.data()
        self.assertEqual(sorted(r["id"] for r in d["regions"]), ["JP-01", "place-01-1"])
        self.assertEqual(next(r for r in d["regions"] if r["id"] == "place-01-1")["parentId"], "JP-01")


class ValidateExportTest(unittest.TestCase):
    def base(self):
        p = {"src": "img/aaaaaaaaaaaaaaaa.jpg", "thumb": "img/aaaaaaaaaaaaaaaa-s.jpg", "w": 1, "h": 1, "taken": None, "caption": None, "alt": "x"}
        q = dict(p, src="img/bbbbbbbbbbbbbbbb.jpg", thumb="img/bbbbbbbbbbbbbbbb-s.jpg")
        return {"schemaVersion": 1,
                "regions": [{"id": "JP-01", "kind": "pref", "parentId": None, "name": "北海道", "photoIds": ["aaaaaaaaaaaaaaaa", "bbbbbbbbbbbbbbbb"]}],
                "photos": {"aaaaaaaaaaaaaaaa": p, "bbbbbbbbbbbbbbbb": q}}

    def test_validate_export_accepts(self):
        self.assertEqual(export.validate_export(self.base()), [])

    def test_validate_export_rejects(self):
        d = self.base(); d["private"] = {"lat": 1}
        self.assertTrue(export.validate_export(d))
        d = self.base(); d["photos"]["cccccccccccccccc"] = dict(d["photos"]["aaaaaaaaaaaaaaaa"])
        self.assertTrue(export.validate_export(d))
        d = self.base(); d["regions"][0]["photoIds"] = ["aaaaaaaaaaaaaaaa", "aaaaaaaaaaaaaaaa"]
        self.assertTrue(export.validate_export(d))
        d = self.base(); d["regions"].append({"id": "place-01-1", "kind": "place", "parentId": "JP-02", "name": "x", "photoIds": ["aaaaaaaaaaaaaaaa", "bbbbbbbbbbbbbbbb"]})
        self.assertTrue(export.validate_export(d))
        d = self.base(); d["regions"][0]["photoIds"] = ["aaaaaaaaaaaaaaaa"]
        self.assertTrue(export.validate_export(d))


if __name__ == "__main__":
    unittest.main()
