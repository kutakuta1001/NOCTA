"""撮影場所のない写真を現地日ごとの確認グループにまとめ、地域の候補を付ける（計画書 K5）。

候補は複数持ち、自動では決めない。確認済み（confirmed / not_trip）のグループには触れない。
"""
from collections import Counter, defaultdict

from jr import regions, timeutil


def _day(ts, lat, lng):
    return timeutil.local(ts, lat, lng)[0].strftime("%Y-%m-%d")


def run(conn):
    rows = conn.execute(
        "SELECT p.id, p.taken_utc, p.lat, p.lng, r.status, r.region_id FROM photos p "
        "LEFT JOIN regions r ON r.photo_id = p.id "
        "LEFT JOIN overrides o ON o.photo_id = p.id "
        "WHERE p.taken_utc IS NOT NULL AND o.photo_id IS NULL").fetchall()
    votes = defaultdict(Counter)
    loose = defaultdict(list)
    for pid, ts, lat, lng, status, rid in rows:
        if status == "resolved":
            votes[_day(ts, lat, lng)][rid] += 1
        elif lat is None:
            loose[_day(ts, None, None)].append(pid)
    albums = defaultdict(list)
    for pid, album in conn.execute("SELECT photo_id, album FROM photo_albums"):
        albums[pid].append(album)

    closed = {g for (g,) in conn.execute("SELECT group_id FROM review_groups WHERE status != 'open'")}
    grouped = {p for (p,) in conn.execute(
        "SELECT m.photo_id FROM review_group_members m JOIN review_groups g ON g.group_id = m.group_id WHERE g.status != 'open'")}
    stats = {"groups": 0, "with_day": 0, "with_album": 0}
    conn.execute("BEGIN")
    for day, pids in sorted(loose.items()):
        gid = "day-" + day
        new = [p for p in pids if p not in grouped]
        if gid in closed:
            # 確認したグループは組み替えない。あとから増えた写真は別のグループに入れる
            if not new:
                continue
            gid = gid + "-more"
            if gid in closed:
                continue
        conn.execute("INSERT OR IGNORE INTO review_groups(group_id, local_day) VALUES (?,?)", (gid, day))
        conn.execute("DELETE FROM review_group_members WHERE group_id = ?", (gid,))
        conn.execute("DELETE FROM region_suggestions WHERE group_id = ?", (gid,))
        for p in new:
            conn.execute("INSERT INTO review_group_members(group_id, photo_id) VALUES (?,?)", (gid, p))
        for rid, n in votes.get(day, {}).items():
            conn.execute("INSERT INTO region_suggestions(group_id, region_id, source, votes) VALUES (?,?,?,?)", (gid, rid, "day", n))
        hint = Counter()
        for p in new:
            for album in albums.get(p, []):
                for rid in regions.ALBUM_HINTS.get(album, []):
                    hint[rid] += 1
        for rid, n in hint.items():
            conn.execute("INSERT INTO region_suggestions(group_id, region_id, source, votes) VALUES (?,?,?,?)", (gid, rid, "album", n))
        stats["groups"] += 1
        stats["with_day"] += 1 if votes.get(day) else 0
        stats["with_album"] += 1 if hint else 0
    conn.execute("COMMIT")
    return stats
