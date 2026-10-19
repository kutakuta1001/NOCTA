"""取り込み（ingest）のテスト。実行: $VENV/bin/python -m unittest discover -s tests/journey_tools -t . -v"""
import unittest

from tests.journey_tools.helpers import make_jpeg, make_sidecar, tmpdir

from PIL import Image
from jr import ingest, store


def gps_exif(lat, lng, when="2016:03:01 21:00:00"):
    img = Image.new("RGB", (4, 4))
    ex = img.getexif()
    ex.get_ifd(0x8769)[36867] = when
    gps = ex.get_ifd(0x8825)
    gps[1] = "N" if lat >= 0 else "S"
    gps[2] = (abs(int(lat)), int(abs(lat) * 60) % 60, 0.0)
    gps[3] = "E" if lng >= 0 else "W"
    gps[4] = (abs(int(lng)), int(abs(lng) * 60) % 60, 0.0)
    return ex


class MatchSidecarTest(unittest.TestCase):
    def test_match_plain(self):
        self.assertEqual(ingest.match_sidecar("IMG_1.jpg", ["IMG_1.jpg.supplemental-metadata.json", "IMG_2.jpg.supplemental-metadata.json"]),
                         ["IMG_1.jpg.supplemental-metadata.json"])

    def test_match_numbered(self):
        self.assertEqual(ingest.match_sidecar("IMG_1(1).jpg", ["IMG_1.jpg.supplemental-metadata.json", "IMG_1.jpg.supplemental-metadata(1).json"]),
                         ["IMG_1.jpg.supplemental-metadata(1).json"])

    def test_match_edited(self):
        self.assertEqual(ingest.match_sidecar("IMG_1-編集済み.jpg", ["IMG_1.jpg.supplemental-metadata.json"]),
                         ["IMG_1.jpg.supplemental-metadata.json"])

    def test_match_truncated(self):
        media = "5674541_576945877_1large_very_long_name.jpg"
        js = media + ".supplemental-me.json"
        self.assertEqual(ingest.match_sidecar(media, [js, "other.jpg.supplemental-metadata.json"]), [js])

    def test_match_ambiguous(self):
        media = "abcdefghijklmnopqrstuvwxyz0123.jpg"
        a = media + ".supplemental-metad.json"
        b = media + ".supplemental-me.json"
        self.assertEqual(sorted(ingest.match_sidecar(media, [a, b])), sorted([a, b]))


class IngestTest(unittest.TestCase):
    def setUp(self):
        self.home = tmpdir()
        self.root = tmpdir()
        self.conn = store.connect(self.home / "state.db")

    def run_ingest(self, kind="takeout", **kw):
        return ingest.run(self.conn, [(kind, self.root)], **kw)

    def count(self, table, where="1=1", args=()):
        return self.conn.execute(f"SELECT COUNT(*) FROM {table} WHERE {where}", args).fetchone()[0]

    def test_ingest_dedupes(self):
        a = make_jpeg(self.root / "2012 年の写真" / "IMG_1.jpg")
        make_sidecar(a, lat=43.2, lng=141.0)
        b = make_jpeg(self.root / "屋久島" / "IMG_1.jpg")
        make_sidecar(b, lat=43.2, lng=141.0)
        c = make_jpeg(self.root / "2014" / "IMG_9.jpg", color=(1, 2, 3))
        make_sidecar(c)
        r = self.run_ingest()
        self.assertEqual(self.count("photos"), 2)
        self.assertEqual(r.duplicates, 1)
        albums = [row[0] for row in self.conn.execute("SELECT album FROM photo_albums")]
        self.assertEqual(albums, ["屋久島"])

    def test_ingest_edited_variant(self):
        e = make_jpeg(self.root / "地図用" / "IMG_1-編集済み.jpg", color=(9, 9, 9))
        r1 = self.run_ingest()
        self.assertEqual(self.count("photos"), 0)  # 情報ファイルがない編集版だけでは保留
        self.assertEqual(r1.pending, 1)
        o = make_jpeg(self.root / "地図用" / "IMG_1.jpg")
        make_sidecar(o, ts=1400000000)
        self.run_ingest()
        self.assertEqual(self.count("photos"), 1)
        roles = sorted(r[0] for r in self.conn.execute("SELECT role FROM photo_variants"))
        self.assertEqual(roles, ["edited", "original"])
        self.assertEqual(self.conn.execute("SELECT taken_utc FROM photos").fetchone()[0], 1400000000)
        self.assertEqual(self.count("pending_files"), 0)
        self.assertTrue(e.exists())

    def test_ingest_no_geo_is_null(self):
        a = make_jpeg(self.root / "2009" / "DSC_1.jpg")
        make_sidecar(a, lat=0.0, lng=0.0)
        self.run_ingest()
        self.assertEqual(self.conn.execute("SELECT lat, lng FROM photos").fetchone(), (None, None))

    def test_ingest_people_flag(self):
        a = make_jpeg(self.root / "2015" / "P.jpg")
        make_sidecar(a, people=["誰か"])
        self.run_ingest()
        self.assertEqual(self.conn.execute("SELECT people FROM photos").fetchone()[0], 1)

    def test_ingest_pending(self):
        make_jpeg(self.root / "x" / "nosidecar.jpg", color=(1, 1, 1))
        b = make_jpeg(self.root / "x" / "bad.jpg", color=(2, 2, 2))
        make_sidecar(b, raw="{broken")
        media = "abcdefghijklmnopqrstuvwxyz0123.jpg"
        c = make_jpeg(self.root / "x" / media, color=(3, 3, 3))
        make_sidecar(c, json_name=media + ".supplemental-metad.json")
        make_sidecar(c, json_name=media + ".supplemental-me.json")
        r = self.run_ingest()
        self.assertEqual(self.count("photos"), 0)
        self.assertEqual(r.pending, 3)
        reasons = sorted(row[0] for row in self.conn.execute("SELECT reason FROM pending_files"))
        self.assertEqual(reasons, ["ambiguous_sidecar", "bad_json", "no_sidecar"])

    def test_ingest_rerun_idempotent(self):
        a = make_jpeg(self.root / "2012" / "IMG_1.jpg")
        make_sidecar(a)
        self.run_ingest()
        self.run_ingest()
        self.assertEqual(self.count("photos"), 1)
        self.assertEqual(self.count("photo_variants"), 1)
        self.assertEqual(self.count("source_files"), 2)

    def test_ingest_photos_app_exif(self):
        make_jpeg(self.root / "trip" / "a.jpg", exif=gps_exif(40.71, -74.0))
        make_jpeg(self.root / "trip" / "b.jpg", color=(5, 5, 5))
        r = self.run_ingest(kind="photos_app")
        lat, lng, ts = self.conn.execute("SELECT lat, lng, taken_utc FROM photos").fetchone()
        self.assertAlmostEqual(lat, 40.7, places=1)
        self.assertAlmostEqual(lng, -74.0, places=1)
        self.assertIsNotNone(ts)
        self.assertEqual(r.pending, 1)

    def test_ingest_takeout_bad_json_not_exif(self):
        a = make_jpeg(self.root / "x" / "a.jpg", exif=gps_exif(40.71, -74.0))
        make_sidecar(a, raw="{broken")
        self.run_ingest()
        self.assertEqual(self.count("photos"), 0)

    def test_ingest_source_files(self):
        a = make_jpeg(self.root / "x" / "a.jpg")
        make_sidecar(a)
        v = self.root / "x" / "m.mp4"
        v.write_bytes(b"\x00\x00\x00\x18ftypmp42")
        make_sidecar(v)
        make_jpeg(self.root / "x" / "lost.jpg", color=(7, 7, 7))
        self.run_ingest()
        status = sorted(r[0] for r in self.conn.execute("SELECT status FROM source_files WHERE path NOT LIKE '%.json'"))
        self.assertEqual(status, ["pending", "photo", "video"])

    def test_ingest_short_id_collision(self):
        a = make_jpeg(self.root / "x" / "a.jpg")
        make_sidecar(a, ts=1)
        b = make_jpeg(self.root / "x" / "b.jpg", color=(3, 3, 3))
        make_sidecar(b, ts=2)
        names = {}

        def fake_hash(path):
            names[path.name] = True
            return ("0" * 16) + ("a" if path.name == "a.jpg" else "b") * 48

        with self.assertRaises(ingest.IdCollision):
            self.run_ingest(hasher=fake_hash)


if __name__ == "__main__":
    unittest.main()
