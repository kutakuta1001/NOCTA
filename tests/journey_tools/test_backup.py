"""バックアップ用の整理（backup）のテスト。入力は変えず、ハードリンクで年月ごとに並べる。"""
import csv
import os
import unittest

from tests.journey_tools.helpers import make_jpeg, make_sidecar, tmpdir

from jr import backup, ingest, store

TS = 1352872417  # 2012-11-14 JST


class BackupTest(unittest.TestCase):
    def setUp(self):
        base = tmpdir()
        self.root = base / "Takeout"
        self.dest = base / "library"
        self.conn = store.connect(base / "s.db")

    def ingest(self):
        ingest.run(self.conn, [("takeout", self.root)])

    def files(self):
        return sorted(str(p.relative_to(self.dest)) for p in self.dest.rglob("*") if p.is_file())

    def test_backup_one_file_per_photo(self):
        a = make_jpeg(self.root / "2012 年の写真" / "IMG_1.jpg")
        make_sidecar(a, ts=TS)
        b = make_jpeg(self.root / "屋久島" / "IMG_1.jpg")
        make_sidecar(b, ts=TS)
        self.ingest()
        backup.run(self.conn, self.dest)
        jpgs = [f for f in self.files() if f.endswith(".jpg")]
        self.assertEqual(jpgs, ["2012/2012-11/2012-11-14_IMG_1.jpg"])

    def test_backup_hardlink(self):
        a = make_jpeg(self.root / "2012" / "IMG_1.jpg")
        make_sidecar(a, ts=TS)
        self.ingest()
        backup.run(self.conn, self.dest)
        self.assertEqual(os.stat(self.dest / "2012/2012-11/2012-11-14_IMG_1.jpg").st_ino, os.stat(a).st_ino)

    def test_backup_name_collision(self):
        a = make_jpeg(self.root / "x" / "IMG_1.jpg", color=(1, 1, 1))
        make_sidecar(a, ts=TS)
        b = make_jpeg(self.root / "y" / "IMG_1.jpg", color=(2, 2, 2))
        make_sidecar(b, ts=TS + 60)
        self.ingest()
        backup.run(self.conn, self.dest)
        jpgs = [f for f in self.files() if f.endswith(".jpg")]
        self.assertEqual(len(jpgs), 2)
        self.assertEqual(len(set(jpgs)), 2)

    def test_backup_keeps_sidecar(self):
        a = make_jpeg(self.root / "2012" / "IMG_1.jpg")
        make_sidecar(a, ts=TS, lat=43.2, lng=141.0)
        self.ingest()
        backup.run(self.conn, self.dest)
        self.assertIn("2012/2012-11/2012-11-14_IMG_1.jpg.json", self.files())

    def test_backup_edited_and_video(self):
        a = make_jpeg(self.root / "2012" / "IMG_1.jpg")
        make_sidecar(a, ts=TS)
        make_jpeg(self.root / "2012" / "IMG_1-編集済み.jpg", color=(9, 9, 9))
        v = self.root / "2012" / "MOV_1.mp4"
        v.write_bytes(b"\x00\x00\x00\x18ftypmp42video")
        make_sidecar(v, ts=TS)
        self.ingest()
        backup.run(self.conn, self.dest)
        names = self.files()
        self.assertIn("2012/2012-11/2012-11-14_IMG_1-編集済み.jpg", names)
        self.assertIn("2012/2012-11/2012-11-14_MOV_1.mp4", names)

    def test_backup_pending_folder(self):
        make_jpeg(self.root / "2006" / "lost.jpg", color=(7, 7, 7))
        self.ingest()
        backup.run(self.conn, self.dest)
        self.assertIn("_未整理/Takeout/2006/lost.jpg", self.files())

    def test_backup_manifest_and_readme(self):
        a = make_jpeg(self.root / "2012 年の写真" / "IMG_1.jpg")
        make_sidecar(a, ts=TS)
        b = make_jpeg(self.root / "屋久島" / "IMG_1.jpg")
        make_sidecar(b, ts=TS)
        self.ingest()
        r = backup.run(self.conn, self.dest)
        rows = list(csv.DictReader(open(self.dest / "manifest.csv", encoding="utf-8")))
        row = next(x for x in rows if x["置き先"].endswith("IMG_1.jpg"))
        self.assertEqual(len(row["元の場所"].split(" | ")), 2)
        self.assertIn("HDD", (self.dest / "README.txt").read_text(encoding="utf-8"))
        self.assertEqual(r["photos"], 1)

    def test_backup_rerun_new_same_name(self):
        a = make_jpeg(self.root / "x" / "IMG_1.jpg", color=(1, 1, 1))
        make_sidecar(a, ts=TS + 3600)
        self.ingest()
        backup.run(self.conn, self.dest)
        b = make_jpeg(self.root / "y" / "IMG_1.jpg", color=(2, 2, 2))
        make_sidecar(b, ts=TS)  # 同じ日・同じ名前で、時刻が早い別の写真があとから来た
        self.ingest()
        backup.run(self.conn, self.dest)
        jpgs = [self.dest / f for f in self.files() if f.endswith(".jpg")]
        self.assertEqual(len(jpgs), 2)
        self.assertEqual({os.stat(p).st_ino for p in jpgs}, {os.stat(a).st_ino, os.stat(b).st_ino})

    def test_backup_unknown_extension(self):
        raw = self.root / "2014" / "DSC_1.NEF"
        raw.parent.mkdir(parents=True)
        raw.write_bytes(b"raw-bytes")
        self.ingest()
        backup.run(self.conn, self.dest)
        self.assertIn("_未整理/Takeout/2014/DSC_1.NEF", self.files())

    def test_backup_input_untouched(self):
        a = make_jpeg(self.root / "2012" / "IMG_1.jpg")
        make_sidecar(a, ts=TS)
        before = sorted(p.name for p in self.root.rglob("*"))
        self.ingest()
        backup.run(self.conn, self.dest)
        self.assertEqual(sorted(p.name for p in self.root.rglob("*")), before)


if __name__ == "__main__":
    unittest.main()
