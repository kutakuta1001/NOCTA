"""地域の判定。日本は都道府県、海外は国（Natural Earth v5.1.1・パブリックドメイン）。決まりは計画書 K11。"""
import json
import math
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path

from shapely import STRtree
from shapely.geometry import Point, shape
from shapely.ops import nearest_points

NE_BASE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.1/geojson/"
ADMIN1 = "ne_10m_admin_1_states_provinces.geojson"
ADMIN0 = "ne_50m_admin_0_countries.geojson"
INNER_KM = 0.5   # ほかの地域の境界からこれより近ければ要確認
NEAR_KM = 3.0    # どこにも含まれないとき、これより近い地域を候補にする
TIE_KM = 0.05    # これより差が小さい距離は同じとみなす


@dataclass
class RegionResult:
    status: str                      # resolved / needs_review / unknown
    region_id: str = None
    candidates: list = field(default_factory=list)


def haversine_km(lat1, lng1, lat2, lng2):
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = p2 - p1, math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


class Boundaries:
    def __init__(self, regions):
        """regions: [(region_id, shapely geometry（経度, 緯度）)]"""
        self.ids = [r[0] for r in regions]
        self.geoms = [r[1] for r in regions]
        self.tree = STRtree(self.geoms)

    @classmethod
    def load(cls, home):
        d = Path(home) / "geo"
        d.mkdir(parents=True, exist_ok=True)
        for name in (ADMIN1, ADMIN0):
            if not (d / name).exists():
                urllib.request.urlretrieve(NE_BASE + name, d / name)
        regions = []
        for f in json.loads((d / ADMIN1).read_text(encoding="utf-8"))["features"]:
            p = f["properties"]
            if p.get("iso_a2") == "JP" and str(p.get("iso_3166_2", "")).startswith("JP-"):
                regions.append((p["iso_3166_2"], shape(f["geometry"])))
        for f in json.loads((d / ADMIN0).read_text(encoding="utf-8"))["features"]:
            p = f["properties"]
            code = p.get("ISO_A2")
            if code in (None, "-99"):
                code = p.get("ISO_A2_EH")
            if code in (None, "-99", "JP"):
                continue
            regions.append((code, shape(f["geometry"])))
        return cls(regions)

    def _distance_km(self, idx, lat, lng):
        g = self.geoms[idx]
        q = nearest_points(g.boundary, Point(lng, lat))[0]
        return haversine_km(lat, lng, q.y, q.x)

    def _nearby(self, lat, lng, km):
        deg = km / 111.0 / max(math.cos(math.radians(lat)), 0.1)
        idxs = self.tree.query(Point(lng, lat).buffer(deg))
        out = []
        for i in sorted(set(int(i) for i in idxs)):
            d = self._distance_km(i, lat, lng)
            if d <= km:
                out.append((d, self.ids[i]))
        return sorted(out)

    def assign(self, lat, lng):
        if lat is None or lng is None:
            return RegionResult("unknown")
        p = Point(lng, lat)
        idxs = sorted(set(int(i) for i in self.tree.query(p)))
        inside = [i for i in idxs if self.geoms[i].covers(p)]
        if len(inside) >= 2:
            return RegionResult("needs_review", None, [self.ids[i] for i in inside])
        if len(inside) == 1:
            own = self.ids[inside[0]]
            others = [(d, rid) for d, rid in self._nearby(lat, lng, INNER_KM) if rid != own]
            if not others:
                return RegionResult("resolved", own, [own])
            return RegionResult("needs_review", None, [own] + [rid for _, rid in others])
        near = self._nearby(lat, lng, NEAR_KM)
        if not near:
            return RegionResult("unknown")
        return RegionResult("needs_review", None, [rid for _, rid in near])


def assign(b, lat, lng):
    return b.assign(lat, lng)


def run(conn, b):
    from jr import timeutil

    counts = {"resolved": 0, "needs_review": 0, "unknown": 0}
    overrides = dict(conn.execute("SELECT photo_id, region_id FROM overrides"))
    rows = conn.execute("SELECT id, taken_utc, lat, lng FROM photos").fetchall()
    conn.execute("BEGIN")
    for pid, ts, lat, lng in rows:
        if pid in overrides:
            r = RegionResult("resolved", overrides[pid], [overrides[pid]])
        else:
            r = b.assign(lat, lng)
        counts[r.status] += 1
        conn.execute("INSERT OR REPLACE INTO regions(photo_id, region_id, status, candidates) VALUES (?,?,?,?)",
                     (pid, r.region_id, r.status, json.dumps(r.candidates)))
        if ts is not None:
            tz, src = timeutil.zone_name(ts, lat, lng)
            conn.execute("UPDATE photos SET tz = ?, tz_source = ? WHERE id = ?", (tz, src, pid))
    conn.execute("COMMIT")
    return counts
