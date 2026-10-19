"""地域ごとの候補（20 枚まで）と、作者の採否の保存（計画書 K4）。"""
import json
import time

import numpy as np

from jr import geo, previews, timeutil

LIMIT = 20
PER_DAY = 4         # 同じ現地日から取る上限
SIMILAR = 0.93      # 埋め込みのコサイン類似度がこれ以上なら似た写真として飛ばす
EXCLUDE_FLAGS = {"people_tag", "person", "blurry"}  # 暗い写真（dark）は外さない（夜景を落とさない）


def members(conn, region_id):
    if region_id.startswith("place-"):
        place = conn.execute("SELECT parent_id, lat, lng, radius_km FROM places WHERE id = ?", (region_id,)).fetchone()
        if not place:
            return []
        parent, plat, plng, radius = place
        out = []
        for pid, lat, lng in conn.execute(
                "SELECT p.id, p.lat, p.lng FROM photos p WHERE p.id IN (" + _region_sql() + ")", (parent,) * 3):
            if lat is not None and plat is not None and geo.haversine_km(lat, lng, plat, plng) <= radius:
                out.append(pid)
        out += [r[0] for r in conn.execute("SELECT photo_id FROM place_members WHERE place_id = ?", (region_id,))]
        return sorted(set(out))
    return [r[0] for r in conn.execute(_region_sql(), (region_id,) * 3)]


def _region_sql():
    return ("SELECT photo_id FROM regions WHERE status = 'resolved' AND region_id = ? "
            "UNION SELECT photo_id FROM overrides WHERE region_id = ? "
            "UNION SELECT m.photo_id FROM review_group_members m JOIN review_groups g ON g.group_id = m.group_id "
            "  WHERE g.status = 'confirmed' AND g.region_id = ?")


def _rows(conn, region_id):
    """候補の材料: (photo_id, landscape, flags, embedding, 現地日, selected, allow_excluded)。却下した写真は除く。"""
    out = []
    for pid in members(conn, region_id):
        sha, _ = previews.current_variant(conn, pid)
        a = conn.execute("SELECT landscape, flags, embedding FROM assessments WHERE sha256 = ? AND status = 'ok'", (sha,)).fetchone()
        if not a:
            continue
        ed = conn.execute("SELECT rejected FROM photo_editorial WHERE photo_id = ?", (pid,)).fetchone()
        if ed and ed[0]:
            continue
        ch = conn.execute("SELECT selected, allow_excluded FROM region_choices WHERE photo_id = ? AND region_id = ?",
                          (pid, region_id)).fetchone() or (0, 0)
        ts, lat, lng = conn.execute("SELECT taken_utc, lat, lng FROM photos WHERE id = ?", (pid,)).fetchone()
        day = timeutil.local(ts, lat, lng)[0].strftime("%Y-%m-%d") if ts is not None else "?"
        emb = np.frombuffer(a[2], dtype=np.float32) if a[2] else None
        out.append((pid, a[0] or 0.0, set(json.loads(a[1] or "[]")), emb, day, ch[0], ch[1]))
    return out


def for_region(conn, region_id, limit=LIMIT, per_day=PER_DAY, similar=SIMILAR):
    rows = _rows(conn, region_id)
    picked, embs, per = [], [], {}
    for pid, _, _, emb, day, sel, _ in rows:
        if sel:
            picked.append(pid)
            per[day] = per.get(day, 0) + 1
            if emb is not None:
                embs.append(emb / (np.linalg.norm(emb) or 1))
    pool = [r for r in rows if not r[5] and (r[6] or not (r[2] & EXCLUDE_FLAGS))]
    pool.sort(key=lambda r: (-r[1], r[0]))
    for pid, _, _, emb, day, _, _ in pool:
        if len(picked) >= limit:
            break
        if per.get(day, 0) >= per_day:
            continue
        if emb is not None:
            e = emb / (np.linalg.norm(emb) or 1)
            if any(float(e @ o) >= similar for o in embs):
                continue
            embs.append(e)
        picked.append(pid)
        per[day] = per.get(day, 0) + 1
    return picked


def excluded(conn, region_id):
    return [(r[0], sorted(r[2] & EXCLUDE_FLAGS)) for r in _rows(conn, region_id)
            if (r[2] & EXCLUDE_FLAGS) and not r[6]]


def _ensure_choice(conn, photo_id, region_id):
    conn.execute("INSERT OR IGNORE INTO region_choices(photo_id, region_id, updated_at) VALUES (?,?,?)",
                 (photo_id, region_id, int(time.time())))


def set_choice(conn, photo_id, region_id, selected):
    _ensure_choice(conn, photo_id, region_id)
    sha = previews.current_variant(conn, photo_id)[0] if selected else None
    if selected:
        conn.execute("UPDATE region_choices SET selected = 1, variant_sha256 = ?, updated_at = ? WHERE photo_id = ? AND region_id = ?",
                     (sha, int(time.time()), photo_id, region_id))
    else:
        conn.execute("UPDATE region_choices SET selected = 0, updated_at = ? WHERE photo_id = ? AND region_id = ?",
                     (int(time.time()), photo_id, region_id))


def set_allow_excluded(conn, photo_id, region_id, allow=True):
    _ensure_choice(conn, photo_id, region_id)
    conn.execute("UPDATE region_choices SET allow_excluded = ? WHERE photo_id = ? AND region_id = ?", (1 if allow else 0, photo_id, region_id))


def _ensure_editorial(conn, photo_id):
    conn.execute("INSERT OR IGNORE INTO photo_editorial(photo_id) VALUES (?)", (photo_id,))


def set_caption(conn, photo_id, caption):
    _ensure_editorial(conn, photo_id)
    conn.execute("UPDATE photo_editorial SET caption = ? WHERE photo_id = ?", (caption or None, photo_id))


def set_rejected(conn, photo_id, rejected=True):
    _ensure_editorial(conn, photo_id)
    conn.execute("UPDATE photo_editorial SET rejected = ? WHERE photo_id = ?", (1 if rejected else 0, photo_id))
