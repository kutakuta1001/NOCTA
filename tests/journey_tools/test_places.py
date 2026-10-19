"""地点の提案（places）のテスト。"""
import unittest

from tests.journey_tools.helpers import tmpdir

from jr import places, store


class PlacesTest(unittest.TestCase):
    def setUp(self):
        self.conn = store.connect(tmpdir() / "s.db")
        self.n = 0

    def add(self, lat, lng, region="JP-01", k=1):
        for _ in range(k):
            self.n += 1
            pid = f"p{self.n:05d}"
            self.conn.execute("INSERT INTO photos(id, sha256, lkey, taken_utc, lat, lng) VALUES (?,?,?,0,?,?)", (pid, pid, pid, lat, lng))
            self.conn.execute("INSERT INTO regions(photo_id, region_id, status) VALUES (?,?, 'resolved')", (pid, region))

    def test_propose_dense_cell(self):
        self.add(43.197, 140.994, k=200)  # 小樽運河
        self.add(43.06, 141.35, k=20)     # 札幌（少ない）
        got = places.propose(self.conn)
        self.assertEqual(len(got), 1)
        self.assertEqual(got[0].parent_id, "JP-01")
        self.assertEqual(got[0].count, 200)
        self.assertAlmostEqual(got[0].lat, 43.197, places=2)

    def test_propose_sparse(self):
        for i in range(30):
            self.add(43.0 + i * 0.1, 141.0, k=10)
        self.assertEqual(places.propose(self.conn), [])

    def test_propose_skips_existing_place(self):
        self.add(43.197, 140.994, k=200)
        places.create(self.conn, "JP-01", "小樽", 43.197, 140.994, 3.0)
        self.assertEqual(places.propose(self.conn), [])

    def test_create_id(self):
        a = places.create(self.conn, "JP-01", "小樽", 43.19, 140.99, 3.0)
        b = places.create(self.conn, "JP-01", "美瑛", 43.58, 142.46, 5.0)
        c = places.create(self.conn, "US", "New York", 40.71, -74.0, 10.0)
        self.assertEqual((a, b, c), ("place-01-1", "place-01-2", "place-new-york"))
        self.assertEqual(self.conn.execute("SELECT name FROM places WHERE id = ?", (a,)).fetchone()[0], "小樽")


if __name__ == "__main__":
    unittest.main()
