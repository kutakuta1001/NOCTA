"""撮影場所のない写真の確認グループと地域の候補（suggest）のテスト。"""
import unittest

from tests.journey_tools.helpers import tmpdir

from jr import store, suggest

# 2016-03-01 12:00 JST
T = 1456801200


class SuggestTest(unittest.TestCase):
    def setUp(self):
        self.conn = store.connect(tmpdir() / "s.db")

    def photo(self, pid, region=None, lat=None, lng=None, ts=T, album=None):
        self.conn.execute("INSERT INTO photos(id, sha256, lkey, taken_utc, lat, lng) VALUES (?,?,?,?,?,?)",
                          (pid, pid + "sha", pid, ts, lat, lng))
        if region:
            self.conn.execute("INSERT INTO regions(photo_id, region_id, status) VALUES (?,?, 'resolved')", (pid, region))
        else:
            self.conn.execute("INSERT INTO regions(photo_id, region_id, status) VALUES (?, NULL, 'unknown')", (pid,))
        if album:
            self.conn.execute("INSERT INTO photo_albums(photo_id, album) VALUES (?,?)", (pid, album))

    def suggestions(self, group="day-2016-03-01"):
        return sorted(self.conn.execute("SELECT region_id, source, votes FROM region_suggestions WHERE group_id=?", (group,)))

    def test_suggest_votes_day(self):
        for i in range(3):
            self.photo(f"a{i}", region="JP-01", lat=43.2, lng=141.0)
        self.photo("b0", region="JP-26", lat=35.0, lng=135.7)
        self.photo("n0")
        suggest.run(self.conn)
        self.assertEqual(self.suggestions(), [("JP-01", "day", 3), ("JP-26", "day", 1)])
        members = [r[0] for r in self.conn.execute("SELECT photo_id FROM review_group_members")]
        self.assertEqual(members, ["n0"])

    def test_suggest_album_hint(self):
        self.photo("n0", album="屋久島")
        suggest.run(self.conn)
        self.assertEqual(self.suggestions(), [("JP-46", "album", 1)])

    def test_suggest_two_album_candidates(self):
        self.photo("n0", album="白神山地")
        suggest.run(self.conn)
        self.assertEqual([r[0] for r in self.suggestions()], ["JP-02", "JP-05"])

    def test_suggest_keeps_confirmed(self):
        self.photo("n0")
        suggest.run(self.conn)
        self.conn.execute("UPDATE review_groups SET status='confirmed', region_id='JP-13'")
        self.photo("n1")  # 同じ日にあとから増えた写真
        suggest.run(self.conn)
        members = sorted(r[0] for r in self.conn.execute("SELECT photo_id FROM review_group_members WHERE group_id='day-2016-03-01'"))
        self.assertEqual(members, ["n0"])
        self.assertEqual(self.conn.execute("SELECT status, region_id FROM review_groups WHERE group_id='day-2016-03-01'").fetchone(),
                         ("confirmed", "JP-13"))
        self.assertEqual(self.conn.execute("SELECT COUNT(*) FROM review_group_members WHERE photo_id='n1'").fetchone()[0], 1)

    def test_resolved_photos_not_grouped(self):
        self.photo("a0", region="JP-01", lat=43.2, lng=141.0)
        suggest.run(self.conn)
        self.assertEqual(self.conn.execute("SELECT COUNT(*) FROM review_group_members").fetchone()[0], 0)


if __name__ == "__main__":
    unittest.main()
