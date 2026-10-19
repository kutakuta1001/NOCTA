"""取り込み。入力フォルダは読むだけで、書き換え・移動・削除はしない。

takeout: 写真ごとの情報ファイル（*.supplemental-metadata*.json）から撮影時刻・撮影場所・人の印を読む。
         情報ファイルが無い・壊れている・候補が 2 つ以上のものは EXIF で代わりにせず保留にする。
photos_app: 写真そのものの EXIF（DateTimeOriginal・GPS）を読む。日時が無ければ保留。
"""
import datetime as dt
import hashlib
import json
import re
from dataclasses import dataclass
from pathlib import Path

from PIL import Image

try:
    import pillow_heif

    pillow_heif.register_heif_opener()
except ImportError:  # HEIC を読めないだけで、ほかは動く
    pass

IMAGE_EXT = {".jpg", ".jpeg", ".png", ".heic", ".gif", ".jfif", ".webp"}
VIDEO_EXT = {".mp4", ".mov", ".avi", ".3gp", ".m4v"}
EDITED_RE = re.compile(r"^(?P<stem>.*)-編集済み(?P<ext>\.[^.]+)$")
NUMBERED_RE = re.compile(r"^(?P<stem>.*)\((?P<n>\d+)\)(?P<ext>\.[^.]+)$")
SIDECAR_RE = re.compile(r"\.json$")
TRUNC_MIN = 12  # 途中で切れた情報ファイル名とみなす最短の長さ（短すぎる前方一致を避ける）
YEAR_FOLDER_RE = re.compile(r"^(\d{4} 年の写真|\d{4}([-\s].*)?)$")
JST = dt.timezone(dt.timedelta(hours=9))


class IdCollision(Exception):
    """写真 ID（SHA-256 の先頭 16 桁）が、中身の違う 2 ファイルでぶつかった。"""


@dataclass
class IngestReport:
    added: int = 0
    duplicates: int = 0
    pending: int = 0
    videos: int = 0


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def _original_name(media_name):
    m = EDITED_RE.match(media_name)
    return m.group("stem") + m.group("ext") if m else media_name


def match_sidecar(media_name, json_names, media_names=None):
    """メディアのファイル名に対応する情報ファイル名の候補を返す（0・1・2 件以上）。

    media_names（同じフォルダのメディア名）を渡すと、メディア名の途中で切れた情報ファイル名も、
    そのフォルダで一意に決まるときだけ拾う。
    """
    base = _original_name(media_name)
    whole = [base + ".supplemental-metadata.json", base + ".json"]  # 元の名前に (1) を含む写真
    hits = [j for j in whole if j in json_names]
    if hits:
        return hits[:1]
    num = ""
    m = NUMBERED_RE.match(base)
    if m:
        base = m.group("stem") + m.group("ext")
        num = "(" + m.group("n") + ")"
    stem_only = base.rsplit(".", 1)[0] if "." in base else base
    exact = [base + ".supplemental-metadata" + num + ".json", base + num + ".json",
             stem_only + ".supplemental-metadata" + num + ".json"]  # 拡張子のない情報ファイル名もある
    hits = [j for j in exact if j in json_names]
    if hits:
        return hits[:1]
    target = base + ".supplemental-metadata"
    found = []
    for j in json_names:
        stem = j[:-5] if j.endswith(".json") else j
        jnum = ""
        mm = re.match(r"^(.*)(\(\d+\))$", stem)
        if mm:
            stem, jnum = mm.group(1), mm.group(2)
        if jnum != num or len(stem) < TRUNC_MIN or stem == target:
            continue
        if target.startswith(stem) and len(stem) > len(base):
            found.append(j)
        elif media_names is not None and len(stem) <= len(base) and base.startswith(stem):
            owners = [m for m in media_names if _original_name(m).startswith(stem)]
            if len({_original_name(m) for m in owners}) == 1:
                found.append(j)
    return found


def _read_sidecar(path):
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    ts = data.get("photoTakenTime", {}).get("timestamp")
    if ts is None:
        raise ValueError("photoTakenTime がない")
    lat = lng = None
    for key in ("geoData", "geoDataExif"):
        g = data.get(key) or {}
        la, lo = g.get("latitude"), g.get("longitude")
        if la is not None and lo is not None and (abs(la) > 1e-4 or abs(lo) > 1e-4):
            lat, lng = float(la), float(lo)
            break
    return {
        "title": data.get("title") or "",
        "taken_utc": int(ts),
        "lat": lat,
        "lng": lng,
        "people": 1 if data.get("people") else 0,
    }


def _ratio(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return float(v[0]) / float(v[1])


def _read_exif(path):
    with Image.open(path) as im:
        ex = im.getexif()
    sub = ex.get_ifd(0x8769)
    when = sub.get(36867) or ex.get(306)
    if not when:
        return None
    local = dt.datetime.strptime(str(when).strip(), "%Y:%m:%d %H:%M:%S")
    off = sub.get(36881)
    tz = JST
    if off and re.match(r"^[+-]\d{2}:\d{2}$", str(off)):
        sign = 1 if str(off)[0] == "+" else -1
        h, mi = int(str(off)[1:3]), int(str(off)[4:6])
        tz = dt.timezone(sign * dt.timedelta(hours=h, minutes=mi))
    lat = lng = None
    gps = ex.get_ifd(0x8825)
    if gps.get(2) and gps.get(4):
        def deg(v):
            return _ratio(v[0]) + _ratio(v[1]) / 60 + _ratio(v[2]) / 3600
        lat = deg(gps[2]) * (-1 if gps.get(1) == "S" else 1)
        lng = deg(gps[4]) * (-1 if gps.get(3) == "W" else 1)
        if not off:  # オフセットの記録がなければ、撮影場所のタイムゾーンで読む
            from jr import timeutil

            zone = timeutil._zone_at(round(lat, 2), round(lng, 2))
            if zone is not None:
                tz = zone
    return {
        "title": Path(path).name,
        "taken_utc": int(local.replace(tzinfo=tz).timestamp()),
        "lat": lat,
        "lng": lng,
        "people": 0,
    }


def _size(path):
    try:
        with Image.open(path) as im:
            return im.size
    except Exception:
        return (None, None)


def _is_album(folder_name):
    return not YEAR_FOLDER_RE.match(folder_name)


def _folders(root):
    return sorted(p for p in [root, *root.rglob("*")] if p.is_dir())


def _sidecar_index(roots):
    """Takeout は書き出しが分かれると、写真と情報ファイルが別の書き出しに入る。
    すべての takeout の入力について「入力からの相対フォルダ → {情報ファイル名: パス}」をまとめる。"""
    index = {}
    for kind, root in roots:
        if kind != "takeout":
            continue
        root = Path(root)
        for folder in _folders(root):
            rel = str(folder.relative_to(root))
            for f in folder.iterdir():
                if f.is_file() and SIDECAR_RE.search(f.name):
                    index.setdefault(rel, {}).setdefault(f.name, f)
    return index


def run(conn, roots, hasher=sha256_file):
    report = IngestReport()
    index = _sidecar_index(roots)
    for kind, root in roots:
        root = Path(root)
        for folder in _folders(root):
            files = sorted(f for f in folder.iterdir() if f.is_file())
            json_names = index.get(str(folder.relative_to(root)), {})
            # 元の写真を先に、編集版をあとに処理する（編集版を元にまとめるため）
            media = [f for f in files if f.suffix.lower() in IMAGE_EXT | VIDEO_EXT]
            media.sort(key=lambda f: (EDITED_RE.match(f.name) is not None, f.name))
            names = [f.name for f in media]
            for f in media:
                _ingest_one(conn, kind, root, folder, f, json_names, hasher, report, media_names=names)
            # 写真・動画・情報ファイル以外も台帳に載せる（バックアップで漏らさない）
            for f in files:
                if f.suffix.lower() not in IMAGE_EXT | VIDEO_EXT and not SIDECAR_RE.search(f.name):
                    conn.execute(
                        "INSERT OR REPLACE INTO source_files(path, root, kind, sha256, role, status) VALUES (?,?,?,?,?,?)",
                        (str(f), str(root), kind, hasher(f), "other", "other"))
            for f in files:
                if SIDECAR_RE.search(f.name):
                    conn.execute(
                        "INSERT OR IGNORE INTO source_files(path, root, kind, role, status) VALUES (?,?,?,?,?)",
                        (str(f), str(root), kind, "sidecar", "sidecar"))
    return report


def _pending(conn, kind, root, path, sha, reason, report):
    conn.execute("INSERT OR REPLACE INTO pending_files(path, reason) VALUES (?,?)", (str(path), reason))
    conn.execute(
        "INSERT OR REPLACE INTO source_files(path, root, kind, sha256, role, status) VALUES (?,?,?,?,?,?)",
        (str(path), str(root), kind, sha, "other", "pending"))
    report.pending += 1


def _ingest_one(conn, kind, root, folder, f, json_names, hasher, report, media_names=()):
    is_video = f.suffix.lower() in VIDEO_EXT
    role = "edited" if EDITED_RE.match(f.name) else "original"
    sha = hasher(f)
    meta, sidecar = None, None
    if kind == "takeout":
        cands = match_sidecar(f.name, list(json_names), media_names=media_names)
        if len(cands) > 1:
            return _pending(conn, kind, root, f, sha, "ambiguous_sidecar", report)
        if not cands:
            return _pending(conn, kind, root, f, sha, "no_sidecar", report)
        sidecar = json_names[cands[0]]
        try:
            meta = _read_sidecar(sidecar)
        except (ValueError, json.JSONDecodeError, OSError):
            return _pending(conn, kind, root, f, sha, "bad_json", report)
        lkey = "takeout:" + _original_name(meta["title"] or f.name) + "@" + str(meta["taken_utc"])
    else:
        if is_video:
            meta = None
        else:
            try:
                meta = _read_exif(f)
            except Exception:
                meta = None
        if meta is None:
            return _pending(conn, kind, root, f, sha, "no_time", report)
        lkey = "sha:" + sha

    if is_video:
        conn.execute(
            "INSERT OR REPLACE INTO source_files(path, root, kind, sha256, sidecar_path, role, taken_utc, status) VALUES (?,?,?,?,?,?,?,?)",
            (str(f), str(root), kind, sha, str(sidecar) if sidecar else None, "video", meta["taken_utc"] if meta else None, "video"))
        report.videos += 1
        return

    conn.execute("DELETE FROM pending_files WHERE path = ?", (str(f),))
    existing_variant = conn.execute("SELECT photo_id FROM photo_variants WHERE sha256 = ?", (sha,)).fetchone()
    status = "photo"
    if existing_variant:
        photo_id = existing_variant[0]
        status = "duplicate"
        known = conn.execute("SELECT 1 FROM source_files WHERE path = ?", (str(f),)).fetchone()
        if not known:
            report.duplicates += 1
    else:
        row = conn.execute("SELECT id FROM photos WHERE lkey = ?", (lkey,)).fetchone()
        if row and role == "original" and conn.execute(
                "SELECT 1 FROM photo_variants WHERE photo_id = ? AND role = 'original'", (row[0],)).fetchone():
            # 名前と撮影時刻が同じでも中身の違う別の写真（一括アップロードなど）は別の写真にする
            lkey = lkey + "#" + sha[:16]
            row = None
        if row:
            photo_id = row[0]
        else:
            photo_id = sha[:16]
            clash = conn.execute("SELECT sha256 FROM photos WHERE id = ?", (photo_id,)).fetchone()
            if clash and clash[0] != sha:
                raise IdCollision(f"{photo_id}: {f}")
            w, h = _size(f)
            conn.execute(
                "INSERT INTO photos(id, sha256, lkey, taken_utc, lat, lng, people, width, height) VALUES (?,?,?,?,?,?,?,?,?)",
                (photo_id, sha, lkey, meta["taken_utc"], meta["lat"], meta["lng"], meta["people"], w, h))
            report.added += 1
        conn.execute("INSERT INTO photo_variants(photo_id, sha256, path, role) VALUES (?,?,?,?)", (photo_id, sha, str(f), role))
    if _is_album(folder.name) and folder != Path(root):
        conn.execute("INSERT OR IGNORE INTO photo_albums(photo_id, album) VALUES (?,?)", (photo_id, folder.name))
    conn.execute(
        "INSERT OR REPLACE INTO source_files(path, root, kind, sha256, sidecar_path, role, photo_id, taken_utc, status) VALUES (?,?,?,?,?,?,?,?,?)",
        (str(f), str(root), kind, sha, str(sidecar) if sidecar else None, role, photo_id, meta["taken_utc"], status))
