"""地域の判定（geo）と現地時刻のテスト。"""
import os
import unittest

from tests.journey_tools.helpers import tmpdir

from shapely.geometry import box
from jr import geo, store, timeutil

# 35.0〜35.1 度の 2 つの正方形（A が西、B が東。境界は経度 135.1）
A = ("JP-26", box(135.0, 35.0, 135.1, 35.1))
B = ("JP-25", box(135.1, 35.0, 135.2, 35.1))
KM_LNG = 111.32 * 0.8192  # 北緯 35 度での経度 1 度あたりの km


class AssignTest(unittest.TestCase):
    def setUp(self):
        self.b = geo.Boundaries([A, B])

    def test_assign_inside(self):
        r = self.b.assign(35.05, 135.05)
        self.assertEqual((r.status, r.region_id), ("resolved", "JP-26"))

    def test_assign_near_border(self):
        r = self.b.assign(35.05, 135.1 - 0.2 / KM_LNG)
        self.assertEqual(r.status, "needs_review")
        self.assertIsNone(r.region_id)
        self.assertEqual(r.candidates, ["JP-26", "JP-25"])

    def test_assign_on_border(self):
        r = self.b.assign(35.05, 135.1)
        self.assertEqual(r.status, "needs_review")
        self.assertEqual(sorted(r.candidates), ["JP-25", "JP-26"])

    def test_assign_sea_near(self):
        r = self.b.assign(35.05, 134.99)  # A の西 約 0.9km
        self.assertEqual(r.status, "needs_review")
        self.assertEqual(r.candidates[0], "JP-26")

    def test_assign_equidistant(self):
        r = self.b.assign(35.1 + 0.01, 135.1)  # 北の海上、A と B から同じ距離
        self.assertEqual(r.status, "needs_review")
        self.assertIsNone(r.region_id)
        self.assertEqual(sorted(r.candidates), ["JP-25", "JP-26"])

    def test_assign_far(self):
        self.assertEqual(self.b.assign(36.0, 140.0).status, "unknown")

    def test_assign_none(self):
        self.assertEqual(self.b.assign(None, None).status, "unknown")


class RunTest(unittest.TestCase):
    def setUp(self):
        self.conn = store.connect(tmpdir() / "s.db")
        for pid, lat, lng in [("p1", 35.05, 135.05), ("p2", 35.05, 135.15), ("p3", None, None)]:
            self.conn.execute("INSERT INTO photos(id, sha256, lkey, taken_utc, lat, lng) VALUES (?,?,?,?,?,?)",
                              (pid, pid + "sha", pid, 1456794000, lat, lng))

    def test_run_writes_regions(self):
        geo.run(self.conn, geo.Boundaries([A, B]))
        rows = dict(self.conn.execute("SELECT photo_id, region_id FROM regions WHERE status='resolved'"))
        self.assertEqual(rows, {"p1": "JP-26", "p2": "JP-25"})

    def test_override_wins(self):
        self.conn.execute("INSERT INTO overrides(photo_id, region_id) VALUES ('p1', 'JP-13')")
        geo.run(self.conn, geo.Boundaries([A, B]))
        self.assertEqual(self.conn.execute("SELECT region_id, status FROM regions WHERE photo_id='p1'").fetchone(), ("JP-13", "resolved"))


class SubregionTest(unittest.TestCase):
    def test_us_states_to_places(self):
        us = ("US", box(-125.0, 25.0, -66.0, 49.0))
        states = [("US-CA", box(-125.0, 32.0, -114.0, 42.0)), ("US-NY", box(-80.0, 40.0, -72.0, 45.0))]
        b = geo.Boundaries([A, B, us], subdivisions={"US": states})
        conn = store.connect(tmpdir() / "s.db")
        for pid, lat, lng in [("la", 34.05, -118.24), ("ny", 40.71, -74.0)]:
            conn.execute("INSERT INTO photos(id, sha256, lkey, taken_utc, lat, lng) VALUES (?,?,?,?,?,?)", (pid, pid + "s", pid, 1456794000, lat, lng))
        geo.run(conn, b)
        members = dict(conn.execute("SELECT photo_id, place_id FROM place_members"))
        self.assertEqual(members, {"la": "place-us-west", "ny": "place-us-east"})
        self.assertEqual(dict(conn.execute("SELECT id, name FROM places")), {"place-us-west": "西部", "place-us-east": "東部"})
        geo.run(conn, b)  # 再実行しても重複しない
        self.assertEqual(conn.execute("SELECT COUNT(*) FROM place_members").fetchone()[0], 2)


class HokkaidoTest(unittest.TestCase):
    def test_hokkaido_areas(self):
        from jr import regions
        points = {
            "札幌": (43.062, 141.354, "doo"), "小樽": (43.19, 140.99, "doo"), "室蘭": (42.315, 140.974, "doo"),
            "登別": (42.41, 141.10, "doo"), "滝川": (43.557, 141.91, "doo"),
            "函館": (41.769, 140.729, "donan"), "江差": (41.869, 140.127, "donan"), "長万部": (42.51, 140.37, "donan"),
            "旭川": (43.771, 142.365, "dohoku"), "美瑛": (43.588, 142.467, "dohoku"), "富良野": (43.342, 142.383, "dohoku"),
            "稚内": (45.415, 141.673, "dohoku"), "留萌": (43.94, 141.637, "dohoku"),
            "帯広": (42.924, 143.196, "doto"), "釧路": (42.985, 144.381, "doto"), "北見": (43.807, 143.894, "doto"),
            "知床": (44.07, 145.0, "doto"),
        }
        for name, (lat, lng, area) in points.items():
            self.assertEqual(regions.hokkaido_area(lat, lng), area, name)

    def test_hokkaido_places_created(self):
        hok = ("JP-01", box(139.0, 41.0, 146.0, 46.0))
        b = geo.Boundaries([hok])
        conn = store.connect(tmpdir() / "s.db")
        conn.execute("INSERT INTO photos(id, sha256, lkey, taken_utc, lat, lng) VALUES ('hk', 'hks', 'hk', 0, 41.769, 140.729)")
        geo.run(conn, b)
        self.assertEqual(conn.execute("SELECT place_id FROM place_members").fetchone()[0], "place-hokkaido-donan")
        self.assertEqual(conn.execute("SELECT name, parent_id FROM places").fetchone(), ("道南", "JP-01"))


class TimeTest(unittest.TestCase):
    def test_local_day_overseas(self):
        # ニューヨーク、UTC 2016-03-02 03:00 → 現地 2016-03-01 22:00
        local, src = timeutil.local(1456887600, 40.71, -74.0)
        self.assertEqual(local.strftime("%Y-%m-%d"), "2016-03-01")
        self.assertEqual(src, "geo")

    def test_local_no_geo_is_tokyo(self):
        local, src = timeutil.local(1456887600, None, None)
        self.assertEqual(local.strftime("%Y-%m-%d %H"), "2016-03-02 12")
        self.assertEqual(src, "assumed_tokyo")


@unittest.skipUnless(os.path.exists(os.path.expanduser("~/Pictures/nocta-journey/geo/ne_10m_admin_1_states_provinces.geojson")), "境界データがない")
class RealPointsTest(unittest.TestCase):
    def test_real_points(self):
        from pathlib import Path
        b = geo.Boundaries.load(Path("~/Pictures/nocta-journey").expanduser())
        self.assertEqual(b.assign(43.1997, 140.9947).region_id, "JP-01")  # 小樽運河
        self.assertEqual(b.assign(35.0094, 135.6668).region_id, "JP-26")  # 嵐山
        self.assertEqual(b.assign(22.2830, 114.1588).region_id, "HK")     # 香港


if __name__ == "__main__":
    unittest.main()
