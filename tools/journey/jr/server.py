"""選ぶ画面のサーバー。127.0.0.1 だけで待ち受け、自分の Mac の中からしか開けない（計画書 K9）。

DB はリクエストごとに開く（K7）。写真は登録済みの ID でだけ返し、任意のパスは受け付けない。
"""
import json
import math
import re
import secrets
import sqlite3
import threading
import webbrowser
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from jr import candidates, places, previews, regions, store

UI_DIR = Path(__file__).resolve().parent.parent / "ui"
STATIC = {"/": ("index.html", "text/html; charset=utf-8"), "/app.js": ("app.js", "text/javascript; charset=utf-8"),
          "/app.css": ("app.css", "text/css; charset=utf-8")}
PHOTO_ID_RE = re.compile(r"^[a-f0-9]{16}$")
REGION_RE = re.compile(r"^(JP-(0[1-9]|[1-3][0-9]|4[0-7])|[A-Z]{2}|place-[a-z0-9-]+)$")
GROUP_RE = re.compile(r"^day-\d{4}-\d{2}-\d{2}(-more)?$")
MAX_BODY = 64 * 1024
MAX_CAPTION = 200
MAX_PLACE_NAME = 40
PAGE = 30
MAX_SELECTED = 3
MONTH_RE = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")
SCENIC_T = 0.5  # 日ごとの確認で「景色の写真」と数える景色らしさ


class BadRequest(Exception):
    pass


class Conflict(Exception):
    pass


def _region_name(conn, rid):
    if rid.startswith("place-"):
        row = conn.execute("SELECT name FROM places WHERE id = ?", (rid,)).fetchone()
        return row[0] if row else rid
    return regions.name(rid)


def api_regions(conn, q):
    ids = {r[0] for r in conn.execute(
        "SELECT region_id FROM regions WHERE status = 'resolved' UNION SELECT region_id FROM overrides "
        "UNION SELECT region_id FROM review_groups WHERE status = 'confirmed' AND region_id IS NOT NULL")}
    out = []
    for rid in ids:
        out.append({"id": rid, "name": _region_name(conn, rid), "kind": regions.kind(rid), "parent_id": None,
                    "photos": len(candidates.members(conn, rid)), "selected": _selected_count(conn, rid)})
    for pid, parent, name in conn.execute("SELECT id, parent_id, name FROM places"):
        out.append({"id": pid, "name": name, "kind": "place", "parent_id": parent,
                    "photos": len(candidates.members(conn, pid)), "selected": _selected_count(conn, pid)})
    out.sort(key=lambda r: (-r["photos"], r["id"]))
    return {"regions": out}


def _selected_count(conn, rid):
    return conn.execute("SELECT COUNT(*) FROM region_choices WHERE region_id = ? AND selected = 1", (rid,)).fetchone()[0]


def _photo_info(conn, pid, rid):
    ts = conn.execute("SELECT taken_utc FROM photos WHERE id = ?", (pid,)).fetchone()[0]
    ch = conn.execute("SELECT selected FROM region_choices WHERE photo_id = ? AND region_id = ?", (pid, rid)).fetchone()
    ed = conn.execute("SELECT caption FROM photo_editorial WHERE photo_id = ?", (pid,)).fetchone()
    return {"id": pid, "taken_utc": ts, "selected": bool(ch and ch[0]), "caption": (ed[0] if ed else None) or ""}


def api_candidates(conn, q):
    """候補。page=N で (N+1)×20 枚まで出す（「もっと見る」）。"""
    rid = _region_param(q)
    limit = candidates.LIMIT * (_page(q) + 1)
    ids = candidates.for_region(conn, rid, limit=limit + 1)
    return {"region": rid, "name": _region_name(conn, rid), "selected": _selected_count(conn, rid),
            "has_more": len(ids) > limit, "photos": [_photo_info(conn, pid, rid) for pid in ids[:limit]]}


def api_excluded(conn, q):
    rid = _region_param(q)
    page = _page(q)
    rows = candidates.excluded(conn, rid)
    return {"region": rid, "total": len(rows),
            "photos": [{"id": pid, "flags": flags} for pid, flags in rows[page * PAGE:(page + 1) * PAGE]]}


def api_groups(conn, q):
    status = q.get("status", ["open"])[0]
    if status not in ("open", "confirmed", "not_trip"):
        raise BadRequest("status")
    has = q.get("has_suggestion", ["1"])[0]
    if has not in ("1", "0", "any"):
        raise BadRequest("has_suggestion")
    cond = "" if has == "any" else (" AND " + ("" if has == "1" else "NOT ") +
                                    "EXISTS (SELECT 1 FROM region_suggestions s WHERE s.group_id = g.group_id)")
    args = [status]
    month = q.get("month", [""])[0]
    if month:
        if not MONTH_RE.match(month):
            raise BadRequest("month は YYYY-MM")
        cond += " AND g.local_day LIKE ?"
        args.append(month + "-%")
    page = _page(q)
    # 景色の写真（景色らしく、人が写っていない）が多い日を上に並べる
    sql = ("SELECT g.group_id, g.local_day, g.region_id, (SELECT COUNT(*) FROM review_group_members m WHERE m.group_id = g.group_id), "
           "(SELECT COUNT(DISTINCT m.photo_id) FROM review_group_members m JOIN photo_variants v ON v.photo_id = m.photo_id "
           " JOIN assessments a ON a.sha256 = v.sha256 WHERE m.group_id = g.group_id AND a.status = 'ok' "
           " AND a.landscape >= ? AND COALESCE(a.crowd, 0) < ?) AS scenic "
           "FROM review_groups g WHERE g.status = ?" + cond + " ORDER BY scenic DESC, g.local_day DESC LIMIT ? OFFSET ?")
    out = []
    for gid, day, rid, n, scenic in conn.execute(sql, (SCENIC_T, candidates.CROWD_T, *args, PAGE, page * PAGE)).fetchall():
        sample = [r[0] for r in conn.execute(
            "SELECT m.photo_id FROM review_group_members m LEFT JOIN photo_variants v ON v.photo_id = m.photo_id "
            "LEFT JOIN assessments a ON a.sha256 = v.sha256 WHERE m.group_id = ? "
            "GROUP BY m.photo_id ORDER BY MAX(COALESCE(a.landscape, 0)) DESC, m.photo_id LIMIT 6", (gid,))]
        sugg = [{"region_id": r, "name": _region_name(conn, r), "source": s, "votes": v} for r, s, v in conn.execute(
            "SELECT region_id, source, votes FROM region_suggestions WHERE group_id = ? ORDER BY votes DESC", (gid,))]
        out.append({"group_id": gid, "day": day, "count": n, "scenic": scenic, "region_id": rid, "sample": sample, "suggestions": sugg})
    return {"groups": out}


# 要確認: 県境・海上（needs_review）と、撮影場所はあるのにどの地域からも遠い写真（unknown）
REVIEW_WHERE = ("JOIN photos p ON p.id = r.photo_id WHERE (r.status = 'needs_review' OR (r.status = 'unknown' AND p.lat IS NOT NULL)) "
                "AND r.photo_id NOT IN (SELECT photo_id FROM overrides)")


def api_review(conn, q):
    page = _page(q)
    out = []
    for pid, cands in conn.execute("SELECT r.photo_id, r.candidates FROM regions r " + REVIEW_WHERE +
                                   " ORDER BY r.photo_id LIMIT ? OFFSET ?", (PAGE, page * PAGE)).fetchall():
        out.append({"id": pid, "candidates": [{"id": c, "name": _region_name(conn, c)} for c in json.loads(cands or "[]")]})
    total = conn.execute("SELECT COUNT(*) FROM regions r " + REVIEW_WHERE).fetchone()[0]
    return {"total": total, "photos": out}


def api_rejected(conn, q):
    page = _page(q)
    rows = conn.execute("SELECT photo_id FROM photo_editorial WHERE rejected = 1 ORDER BY photo_id LIMIT ? OFFSET ?", (PAGE, page * PAGE)).fetchall()
    total = conn.execute("SELECT COUNT(*) FROM photo_editorial WHERE rejected = 1").fetchone()[0]
    return {"total": total, "photos": [{"id": r[0]} for r in rows]}


def api_proposals(conn, q):
    return {"proposals": [p.__dict__ | {"parent_name": _region_name(conn, p.parent_id)} for p in places.propose(conn)]}


def api_region_names(conn, q):
    out = [{"id": k, "name": v} for k, v in regions.PREFS.items()] + [{"id": k, "name": v} for k, v in regions.COUNTRIES.items()]
    out += [{"id": pid, "name": name, "parent_id": parent} for pid, parent, name in conn.execute("SELECT id, parent_id, name FROM places")]
    return {"regions": out}


def post_decision(conn, b):
    pid, rid = _photo(conn, b.get("photo_id")), _region(b.get("region_id"))
    caption = b.get("caption")
    if caption is not None and (not isinstance(caption, str) or len(caption) > MAX_CAPTION):
        raise BadRequest("caption")
    conn.execute("BEGIN IMMEDIATE")
    try:
        if b.get("selected") is True:
            already = conn.execute("SELECT selected FROM region_choices WHERE photo_id = ? AND region_id = ?", (pid, rid)).fetchone()
            others = conn.execute("SELECT COUNT(*) FROM region_choices WHERE region_id = ? AND selected = 1 AND photo_id != ?", (rid, pid)).fetchone()[0]
            if not (already and already[0]) and others >= MAX_SELECTED:
                raise Conflict("この地域はもう 3 枚選んでいます")
            candidates.set_choice(conn, pid, rid, True)
        elif b.get("selected") is False:
            candidates.set_choice(conn, pid, rid, False)
        if isinstance(b.get("rejected"), bool):
            candidates.set_rejected(conn, pid, b["rejected"])
            if b["rejected"]:
                candidates.set_choice(conn, pid, rid, False)
        if isinstance(b.get("allow_excluded"), bool):
            candidates.set_allow_excluded(conn, pid, rid, b["allow_excluded"])
        if caption is not None:
            candidates.set_caption(conn, pid, caption.strip())
        conn.execute("COMMIT")
    except Exception:
        conn.execute("ROLLBACK")
        raise
    return {"ok": True, "selected": _selected_count(conn, rid)}


def post_group(conn, b):
    gid = b.get("group_id")
    if not isinstance(gid, str) or not GROUP_RE.match(gid):
        raise BadRequest("group_id")
    rid = b.get("region_id")
    if rid is not None:
        _region(rid)
    n = conn.execute("UPDATE review_groups SET status = ?, region_id = ? WHERE group_id = ?",
                     ("confirmed" if rid else "not_trip", rid, gid)).rowcount
    if not n:
        raise BadRequest("group_id")
    return {"ok": True}


def post_override(conn, b):
    pid, rid = _photo(conn, b.get("photo_id")), _region(b.get("region_id"))
    conn.execute("INSERT OR REPLACE INTO overrides(photo_id, region_id) VALUES (?,?)", (pid, rid))
    conn.execute("UPDATE regions SET region_id = ?, status = 'resolved' WHERE photo_id = ?", (rid, pid))
    return {"ok": True}


def post_place(conn, b):
    parent = _region(b.get("parent_id"))
    name = b.get("name")
    if not isinstance(name, str) or not name.strip() or len(name) > MAX_PLACE_NAME:
        raise BadRequest("name")
    lat, lng, radius = (_finite(b.get(k)) for k in ("lat", "lng", "radius_km"))
    if not (-90 <= lat <= 90 and -180 <= lng <= 180 and 0.1 <= radius <= 50):
        raise BadRequest("座標か半径")
    return {"ok": True, "id": places.create(conn, parent, name.strip(), lat, lng, radius)}


def post_representatives(conn, b):
    parent = _region(b.get("parent_id"))
    ids = b.get("photo_ids")
    if not isinstance(ids, list) or not 2 <= len(ids) <= MAX_SELECTED or len(set(ids)) != len(ids):
        raise BadRequest("photo_ids は 2〜3 枚")
    ids = [_photo(conn, p) for p in ids]
    child_selected = {r[0] for r in conn.execute(
        "SELECT c.photo_id FROM region_choices c JOIN places p ON p.id = c.region_id WHERE p.parent_id = ? AND c.selected = 1", (parent,))}
    if not set(ids) <= child_selected:
        raise BadRequest("代表は地点で選んだ写真から")
    conn.execute("DELETE FROM representatives WHERE parent_id = ?", (parent,))
    for i, p in enumerate(ids):
        conn.execute("INSERT INTO representatives(parent_id, photo_id, ord) VALUES (?,?,?)", (parent, p, i))
    return {"ok": True}


def _finite(v):
    if not isinstance(v, (int, float)) or isinstance(v, bool) or not math.isfinite(v):
        raise BadRequest("数値")
    return float(v)


def _region(v):
    if not isinstance(v, str) or not REGION_RE.match(v):
        raise BadRequest("region_id")
    return v


def _region_param(q):
    return _region(q.get("region", [""])[0])


def _page(q):
    p = q.get("page", ["0"])[0]
    if not p.isdigit():
        raise BadRequest("page")
    return int(p)


def _photo(conn, v):
    if not isinstance(v, str) or not PHOTO_ID_RE.match(v):
        raise BadRequest("photo_id")
    if not conn.execute("SELECT 1 FROM photos WHERE id = ?", (v,)).fetchone():
        raise BadRequest("photo_id")
    return v


GET_API = {"/api/regions": api_regions, "/api/candidates": api_candidates, "/api/excluded": api_excluded,
           "/api/groups": api_groups, "/api/region_names": api_region_names, "/api/rejected": api_rejected, "/api/review": api_review, "/api/places/proposals": api_proposals}
POST_API = {"/api/decision": post_decision, "/api/group": post_group, "/api/override": post_override,
            "/api/place": post_place, "/api/representatives": post_representatives}


class ReassessJob:
    """確認した写真の判定を裏で 1 本だけ走らせる（計画書 K6）。"""

    def __init__(self, db_path, home):
        self.db_path, self.home = db_path, home
        self.lock = threading.Lock()
        self.state = {"running": False, "done": 0, "total": 0, "error": None}
        self.thread = None

    def start(self):
        with self.lock:
            if self.state["running"]:
                return self.state
            self.state = {"running": True, "done": 0, "total": 0, "error": None}
            self.thread = threading.Thread(target=self._run, daemon=True)
            self.thread.start()
            return self.state

    def _run(self):
        try:
            from jr import assess

            conn = store.connect(self.db_path)

            def progress(done, total):
                self.state.update(done=done, total=total)

            assess.run(conn, self.home, assess.ClipScorer(), assess.ASSESS_VERSION, progress=progress)
        except Exception as e:  # 画面に理由を出す
            self.state["error"] = str(e)[:200]
        finally:
            self.state["running"] = False


def make_handler(db_path, home, repo_root, token, port_ref, job):
    class Handler(BaseHTTPRequestHandler):
        server_version = "jr"
        sys_version = ""

        def log_message(self, *args):  # トークンを含む URL をログに出さない
            pass

        def _send(self, status, body=b"", ctype="application/json; charset=utf-8", extra=None):
            self.send_response(status)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("Referrer-Policy", "no-referrer")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("Content-Security-Policy", "default-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'")
            for k, v in (extra or {}).items():
                self.send_header(k, v)
            self.end_headers()
            self.wfile.write(body)

        def _json(self, status, obj):
            self._send(status, json.dumps(obj, ensure_ascii=False).encode())

        def _host_ok(self):
            return self.headers.get("Host") == f"127.0.0.1:{port_ref[0]}"

        def _cookie_ok(self):
            c = SimpleCookie(self.headers.get("Cookie", ""))
            return "jr_t" in c and secrets.compare_digest(c["jr_t"].value, token)

        def do_GET(self):
            if not self._host_ok():
                return self._send(403)
            u = urlparse(self.path)
            q = parse_qs(u.query)
            if u.path == "/" and "t" in q:
                if not secrets.compare_digest(q["t"][0], token):
                    return self._send(403)
                return self._send(303, extra={"Location": "/", "Set-Cookie": f"jr_t={token}; HttpOnly; SameSite=Strict; Path=/"})
            if not self._cookie_ok():
                return self._send(403)
            if u.path in STATIC:
                name, ctype = STATIC[u.path]
                return self._send(200, (UI_DIR / name).read_bytes(), ctype)
            if u.path.startswith("/img/"):
                return self._img(u.path[5:])
            if u.path == "/api/reassess":
                return self._json(200, job.state)
            fn = GET_API.get(u.path)
            if not fn:
                return self._send(404)
            return self._call(lambda conn: fn(conn, q))

        def do_POST(self):
            if not self._host_ok() or not self._cookie_ok():
                return self._send(403)
            if self.headers.get("Origin") != f"http://127.0.0.1:{port_ref[0]}":
                return self._send(403)
            u = urlparse(self.path)
            length = int(self.headers.get("Content-Length") or 0)
            if length > MAX_BODY or not (self.headers.get("Content-Type") or "").startswith("application/json"):
                return self._json(400, {"error": "本文は 64KB までの JSON"})
            try:
                body = json.loads(self.rfile.read(length) or b"{}")
                if not isinstance(body, dict):
                    raise ValueError
            except ValueError:
                return self._json(400, {"error": "JSON が読めない"})
            if u.path == "/api/reassess":
                return self._json(200, job.start())
            if u.path == "/api/export":
                from jr import export

                def do_export(conn):
                    r = export.run(conn, home, repo_root)
                    return {"ok": r.ok, "reasons": r.reasons, "regions": r.regions, "photos": r.photos, "cleanup_failed": r.cleanup_failed}
                return self._call(do_export)
            fn = POST_API.get(u.path)
            if not fn:
                return self._send(404)
            return self._call(lambda conn: fn(conn, body))

        def _call(self, fn):
            conn = store.connect(db_path)
            try:
                return self._json(200, fn(conn))
            except BadRequest as e:
                return self._json(400, {"error": str(e)})
            except Conflict as e:
                return self._json(409, {"error": str(e)})
            except sqlite3.OperationalError as e:
                return self._json(503, {"error": "ほかの処理が使用中です。少し待ってからもう一度押してください: " + str(e)[:80]})
            except Exception as e:  # 想定外でも理由を画面に返す
                return self._json(500, {"error": "処理できませんでした: " + str(e)[:120]})
            finally:
                conn.close()

        def _img(self, pid):
            if not PHOTO_ID_RE.match(pid):
                return self._send(404)
            conn = store.connect(db_path)
            try:
                if not conn.execute("SELECT 1 FROM photos WHERE id = ?", (pid,)).fetchone():
                    return self._send(404)
                try:
                    _, path = previews.ensure(conn, home, pid)
                except Exception:
                    return self._send(404)
                return self._send(200, path.read_bytes(), "image/jpeg")
            finally:
                conn.close()

    return Handler


def serve(db_path, home, port=0, repo_root=None, open_browser=True):
    token = secrets.token_urlsafe(24)
    port_ref = [port]
    job = ReassessJob(db_path, home)
    httpd = ThreadingHTTPServer(("127.0.0.1", port), make_handler(db_path, Path(home), Path(repo_root or "."), token, port_ref, job))
    port_ref[0] = httpd.server_address[1]
    url = f"http://127.0.0.1:{port_ref[0]}/?t={token}"
    if open_browser:
        webbrowser.open(url)
    return url, httpd
