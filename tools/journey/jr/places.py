"""地点（「北海道 › 小樽」の小樽）の提案と作成。名前は作者が付ける。"""
import math
import re
from collections import defaultdict
from dataclasses import dataclass

from jr import geo

MIN_PHOTOS = 150
CELL_KM = 5.0
MAX_RADIUS_KM = 50.0


@dataclass
class Proposal:
    parent_id: str
    lat: float
    lng: float
    radius_km: float
    count: int


def _cell(lat, lng, cell_km):
    y = lat * 110.57
    x = lng * 111.32 * math.cos(math.radians(lat))
    return (math.floor(y / cell_km), math.floor(x / cell_km))


def propose(conn, min_photos=MIN_PHOTOS, cell_km=CELL_KM):
    by_region = defaultdict(lambda: defaultdict(list))
    for pid, rid, lat, lng in conn.execute(
            "SELECT p.id, r.region_id, p.lat, p.lng FROM photos p JOIN regions r ON r.photo_id = p.id "
            "WHERE r.status = 'resolved' AND p.lat IS NOT NULL"):
        by_region[rid][_cell(lat, lng, cell_km)].append((lat, lng))
    existing = conn.execute("SELECT parent_id, lat, lng, radius_km FROM places").fetchall()
    out = []
    for rid, cells in sorted(by_region.items()):
        dense = {c for c, pts in cells.items() if len(pts) >= min_photos}
        seen = set()
        for start in sorted(dense):
            if start in seen:
                continue
            stack, cluster = [start], []
            seen.add(start)
            while stack:  # 隣どうし（8 方向）の濃いマスを 1 つにまとめる
                c = stack.pop()
                cluster.append(c)
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        n = (c[0] + dy, c[1] + dx)
                        if n in dense and n not in seen:
                            seen.add(n)
                            stack.append(n)
            pts = [p for c in cluster for p in cells[c]]
            clat = sum(p[0] for p in pts) / len(pts)
            clng = sum(p[1] for p in pts) / len(pts)
            if any(par == rid and plat is not None and geo.haversine_km(clat, clng, plat, plng) <= r
                   for par, plat, plng, r in existing):
                continue
            radius = max(geo.haversine_km(clat, clng, la, lo) for la, lo in pts)
            out.append(Proposal(rid, clat, clng, round(min(max(radius, 1.0), MAX_RADIUS_KM), 1), len(pts)))
    return sorted(out, key=lambda p: -p.count)


def _slug(name):
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return s if s and name.isascii() else None


def create(conn, parent_id, name, lat, lng, radius_km):
    slug = _slug(name)
    if slug and not conn.execute("SELECT 1 FROM places WHERE id = ?", ("place-" + slug,)).fetchone():
        pid = "place-" + slug
    else:
        base = parent_id[3:] if parent_id.startswith("JP-") else parent_id.lower()
        n = 1
        while conn.execute("SELECT 1 FROM places WHERE id = ?", (f"place-{base}-{n}",)).fetchone():
            n += 1
        pid = f"place-{base}-{n}"
    conn.execute("INSERT INTO places(id, parent_id, name, lat, lng, radius_km) VALUES (?,?,?,?,?,?)",
                 (pid, parent_id, name, lat, lng, radius_km))
    return pid
