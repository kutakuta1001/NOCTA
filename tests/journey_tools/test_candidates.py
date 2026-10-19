"""候補作り（assess・candidates）のテスト。モデルは偽の Scorer に差し替える。"""
import json
import unittest

import numpy as np

from tests.journey_tools.helpers import make_jpeg, tmpdir

from jr import assess, candidates, store

T = 1456801200  # 2016-03-01 12:00 JST
DAY = 86400


def vec(i, n=8):
    v = np.zeros(n, dtype=np.float32)
    v[i % n] = 1.0
    return v


class FakeScorer:
    version = "fake-1"

    def __init__(self, broken=()):
        self.calls = 0
        self.broken = set(broken)

    def score(self, images):
        self.calls += len(images)
        return [{"landscape": 0.8, "person": 0.1, "crowd": 0.2, "embedding": vec(0)} for _ in images]


class Base(unittest.TestCase):
    def setUp(self):
        self.home = tmpdir()
        self.conn = store.connect(self.home / "s.db")

    def photo(self, pid, landscape=0.5, person=0.1, flags=(), emb=None, ts=T, people=0, region="JP-01", crowd=0.0):
        sha = (pid * 64)[:64]
        self.conn.execute("INSERT INTO photos(id, sha256, lkey, taken_utc, lat, lng, people) VALUES (?,?,?,?,?,?,?)",
                          (pid, sha, pid, ts, 43.2, 141.0, people))
        self.conn.execute("INSERT INTO photo_variants(photo_id, sha256, path, role) VALUES (?,?,?, 'original')", (pid, sha, "/x/" + pid))
        self.conn.execute("INSERT INTO regions(photo_id, region_id, status) VALUES (?,?, 'resolved')", (pid, region))
        e = (emb if emb is not None else vec(hash(pid))).astype(np.float32).tobytes()
        self.conn.execute("INSERT INTO assessments(sha256, version, status, flags, landscape, person, blur, embedding, crowd) VALUES (?,?,?,?,?,?,?,?,?)",
                          (sha, "v1", "ok", json.dumps(list(flags)), landscape, person, 100.0, e, crowd))
        return pid


class CandidatesTest(Base):
    def test_people_excluded(self):
        self.photo("a", flags=["people_tag"])
        self.photo("b", person=0.7, flags=["person"])
        self.photo("c")
        self.assertEqual(candidates.for_region(self.conn, "JP-01"), ["c"])

    def test_allow_excluded_comes_back(self):
        self.photo("a", flags=["people_tag"])
        self.conn.execute("INSERT INTO region_choices(photo_id, region_id, allow_excluded) VALUES ('a', 'JP-01', 1)")
        self.assertEqual(candidates.for_region(self.conn, "JP-01"), ["a"])
        self.assertEqual(candidates.excluded(self.conn, "JP-01"), [])

    def test_dark_kept(self):
        self.photo("a", flags=["dark"])
        self.assertEqual(candidates.for_region(self.conn, "JP-01"), ["a"])

    def test_near_duplicates_dropped(self):
        for i, pid in enumerate("abcde"):
            self.photo(pid, landscape=0.9 - i * 0.01, emb=vec(0) + np.float32(0.001 * i), ts=T + i * DAY)
        self.assertEqual(candidates.for_region(self.conn, "JP-01"), ["a"])

    def test_day_cap(self):
        for i in range(10):
            self.photo(f"p{i}", landscape=0.9 - i * 0.01, emb=vec(i, 16))
        self.assertEqual(len(candidates.for_region(self.conn, "JP-01")), 4)

    def test_limit_20(self):
        for i in range(30):
            self.photo(f"p{i:02d}", emb=vec(i, 32), ts=T + i * DAY)
        self.assertEqual(len(candidates.for_region(self.conn, "JP-01")), 20)

    def test_crowd_only_when_short(self):
        for i in range(15):
            self.photo(f"q{i:02d}", landscape=0.5, emb=vec(i, 64), ts=T + i * DAY)
        for i in range(10):
            self.photo(f"c{i:02d}", landscape=0.99, crowd=0.9, emb=vec(20 + i, 64), ts=T + (30 + i) * DAY)
        got = candidates.for_region(self.conn, "JP-01")
        self.assertEqual(len(got), 20)
        self.assertTrue(all(p.startswith("q") for p in got[:15]))
        self.assertEqual(sum(p.startswith("c") for p in got), 5)

    def test_no_crowd_when_enough(self):
        for i in range(25):
            self.photo(f"q{i:02d}", landscape=0.5, emb=vec(i, 64), ts=T + i * DAY)
        self.photo("crowd", landscape=0.99, crowd=0.9, emb=vec(40, 64), ts=T + 50 * DAY)
        self.assertNotIn("crowd", candidates.for_region(self.conn, "JP-01"))

    def test_similar_090_dropped(self):
        a = np.zeros(8, dtype=np.float32); a[0] = 1.0
        b = np.zeros(8, dtype=np.float32); b[0] = 0.9; b[1] = 0.4359  # コサイン 0.90
        self.photo("a", landscape=0.9, emb=a)
        self.photo("b", landscape=0.8, emb=b, ts=T + 9 * DAY)
        self.assertEqual(candidates.for_region(self.conn, "JP-01"), ["a"])

    def test_rejected_never_again(self):
        self.photo("a")
        self.conn.execute("INSERT INTO photo_editorial(photo_id, rejected) VALUES ('a', 1)")
        self.assertEqual(candidates.for_region(self.conn, "JP-01"), [])

    def test_selected_always_included(self):
        for i in range(25):
            self.photo(f"p{i:02d}", landscape=0.9, emb=vec(i, 32), ts=T + i * DAY)
        self.photo("low", landscape=0.01, emb=vec(31, 32), ts=T + 40 * DAY)
        self.conn.execute("INSERT INTO region_choices(photo_id, region_id, selected) VALUES ('low', 'JP-01', 1)")
        got = candidates.for_region(self.conn, "JP-01")
        self.assertIn("low", got)
        self.assertEqual(len(got), 20)

    def test_confirmed_group_member_counts(self):
        sha = "z" * 64
        self.conn.execute("INSERT INTO photos(id, sha256, lkey, taken_utc) VALUES ('z', ?, 'z', ?)", (sha, T))
        self.conn.execute("INSERT INTO photo_variants(photo_id, sha256, path, role) VALUES ('z', ?, '/x/z', 'original')", (sha,))
        self.conn.execute("INSERT INTO assessments(sha256, version, status, flags, landscape, person, blur, embedding) VALUES (?,?,?,?,?,?,?,?)",
                          (sha, "v1", "ok", "[]", 0.5, 0.1, 100.0, vec(5).tobytes()))
        self.conn.execute("INSERT INTO review_groups(group_id, local_day, status, region_id) VALUES ('g', '2016-03-01', 'confirmed', 'JP-26')")
        self.conn.execute("INSERT INTO review_group_members(group_id, photo_id) VALUES ('g', 'z')")
        self.assertEqual(candidates.for_region(self.conn, "JP-26"), ["z"])


class AssessTest(Base):
    def add_file_photo(self, pid, color=(100, 120, 140)):
        path = make_jpeg(self.home / "in" / (pid + ".jpg"), size=(600, 400), color=color)
        sha = (pid * 64)[:64]
        self.conn.execute("INSERT INTO photos(id, sha256, lkey, taken_utc, lat, lng) VALUES (?,?,?,?,?,?)", (pid, sha, pid, T, 43.2, 141.0))
        self.conn.execute("INSERT INTO photo_variants(photo_id, sha256, path, role) VALUES (?,?,?, 'original')", (pid, sha, str(path)))
        self.conn.execute("INSERT INTO regions(photo_id, region_id, status) VALUES (?, 'JP-01', 'resolved')", (pid,))
        return path, sha

    def test_assess_skips_done(self):
        self.add_file_photo("a")
        s = FakeScorer()
        assess.run(self.conn, self.home, s, "v1")
        assess.run(self.conn, self.home, s, "v1")
        self.assertEqual(s.calls, 1)

    def test_assess_bad_image_continues(self):
        path, _ = self.add_file_photo("a")
        path.write_bytes(b"not an image")
        self.add_file_photo("b")
        assess.run(self.conn, self.home, FakeScorer(), "v1")
        st = dict(self.conn.execute("SELECT substr(sha256,1,1), status FROM assessments"))
        self.assertEqual(st, {"a": "failed", "b": "ok"})

    def test_assess_missing_cache_rebuilt(self):
        _, sha = self.add_file_photo("a")
        assess.run(self.conn, self.home, FakeScorer(), "v1")
        cache = self.home / "cache" / (sha + ".jpg")
        self.assertTrue(cache.exists())
        cache.unlink()
        s = FakeScorer()
        assess.run(self.conn, self.home, s, "v1")
        self.assertTrue(cache.exists())
        self.assertEqual(s.calls, 1)

    def test_assess_dark_flag(self):
        self.add_file_photo("a", color=(5, 5, 8))
        assess.run(self.conn, self.home, FakeScorer(), "v1")
        flags = json.loads(self.conn.execute("SELECT flags FROM assessments").fetchone()[0])
        self.assertIn("dark", flags)

    def test_targets_include_days_without_suggestion(self):
        sha = "g" * 64
        self.conn.execute("INSERT INTO photos(id, sha256, lkey, taken_utc) VALUES ('g', ?, 'g', ?)", (sha, T))
        self.conn.execute("INSERT INTO review_groups(group_id, local_day) VALUES ('day-2009-03-05', '2009-03-05')")
        self.conn.execute("INSERT INTO review_group_members(group_id, photo_id) VALUES ('day-2009-03-05', 'g')")
        self.assertIn("g", assess.default_targets(self.conn))

    def test_assess_writes_crowd(self):
        self.add_file_photo("a")
        assess.run(self.conn, self.home, FakeScorer(), "v1")
        self.assertEqual(self.conn.execute("SELECT crowd FROM assessments").fetchone()[0], 0.2)

    def test_rescore_fills_crowd_from_embedding(self):
        self.photo("z")
        self.conn.execute("UPDATE assessments SET crowd = NULL")
        n = assess.rescore_crowd(self.conn, lambda embs: [0.7 for _ in embs])
        self.assertEqual(n, 1)
        self.assertEqual(self.conn.execute("SELECT crowd FROM assessments").fetchone()[0], 0.7)

    def test_rerun_keeps_decisions(self):
        self.add_file_photo("a")
        self.conn.execute("INSERT INTO photo_editorial(photo_id, caption) VALUES ('a', '運河の夜')")
        self.conn.execute("INSERT INTO region_choices(photo_id, region_id, selected) VALUES ('a', 'JP-01', 1)")
        self.conn.execute("INSERT INTO overrides(photo_id, region_id) VALUES ('a', 'JP-01')")
        assess.run(self.conn, self.home, FakeScorer(), "v1")
        assess.run(self.conn, self.home, FakeScorer(), "v2")
        self.assertEqual(self.conn.execute("SELECT caption FROM photo_editorial").fetchone()[0], "運河の夜")
        self.assertEqual(self.conn.execute("SELECT selected FROM region_choices").fetchone()[0], 1)
        self.assertEqual(self.conn.execute("SELECT COUNT(*) FROM overrides").fetchone()[0], 1)

    def test_reject_unselects_everywhere(self):
        self.add_file_photo("a")
        candidates.set_choice(self.conn, "a", "JP-01", selected=True)
        candidates.set_choice(self.conn, "a", "place-01-1", selected=True)
        candidates.set_rejected(self.conn, "a", True)
        self.assertEqual(self.conn.execute("SELECT SUM(selected) FROM region_choices WHERE photo_id='a'").fetchone()[0], 0)

    def test_unselect_keeps_caption(self):
        self.add_file_photo("a")
        candidates.set_choice(self.conn, "a", "JP-01", selected=True)
        candidates.set_caption(self.conn, "a", "運河の夜")
        candidates.set_choice(self.conn, "a", "JP-01", selected=False)
        self.assertEqual(self.conn.execute("SELECT selected FROM region_choices").fetchone()[0], 0)
        self.assertEqual(self.conn.execute("SELECT caption FROM photo_editorial").fetchone()[0], "運河の夜")


if __name__ == "__main__":
    unittest.main()
