"""書き出し: 作者が選んだ写真だけを、位置情報を消した縮小版と公開データにする。

順番（計画書 K1）: 一時フォルダで全部作って検査 → 新しい画像を img/ に足す → データを 1 回で差し替える → 使わなくなった画像を消す。
どこで止まっても、公開データは前のものか新しいもののどちらかで、参照する画像は必ずある。
"""
import io
import json
import os
import re
import shutil
import subprocess
import time
from dataclasses import dataclass, field
from pathlib import Path

from PIL import Image, ImageCms, ImageOps, IptcImagePlugin

from jr import ingest, regions, timeutil  # noqa: F401  ingest は HEIC を開けるようにする

LARGE_EDGE = 1600
THUMB_EDGE = 480
QUALITY = 82
MAX_BYTES = 1_000_000
JOURNEY_DIR = Path("website") / "the-first-flower" / "journey"
DATA_NAME = "tff-journey-data.js"
IMG_NAME_RE = re.compile(r"^[a-f0-9]{16}(-s)?\.jpg$")
TOP_KEYS = {"schemaVersion", "regions", "photos"}
HEADER = """/**
 * tff-journey-data.js
 * The First Flower — 旅の地図の公開データ（作者が選んだ写真だけ）
 *
 * tools/journey の export が書く。手で直すときは項目を増やさない（journey-core.js の検証で弾かれる）。
 * 形: regions[] = { id, kind: "pref" | "country" | "place", parentId, name, photoIds }、
 *     photos{}  = { src, thumb, w, h, taken: "YYYY-MM" | null, caption: 文字列 | null, alt }
 */
"""


@dataclass
class ExportReport:
    ok: bool = False
    reasons: list = field(default_factory=list)
    regions: int = 0
    photos: int = 0
    cleanup_failed: list = field(default_factory=list)


def _snapshot(conn):
    """公開する地域と写真を決める。地点は親が公開されるときだけ出す。"""
    sel = {}
    for pid, rid, sha in conn.execute("SELECT photo_id, region_id, variant_sha256 FROM region_choices WHERE selected = 1 ORDER BY updated_at, photo_id"):
        sel.setdefault(rid, []).append((pid, sha))
    place_rows = {r[0]: r for r in conn.execute("SELECT id, parent_id, name FROM places")}
    reps = {}
    for parent, pid in conn.execute("SELECT parent_id, photo_id FROM representatives ORDER BY parent_id, ord"):
        reps.setdefault(parent, []).append(pid)
    variant = {}
    for items in sel.values():
        for pid, sha in items:
            variant.setdefault(pid, sha)

    out = []
    parents = sorted({rid for rid in sel if not rid.startswith("place-")} | set(reps) |
                     {place_rows[p][1] for p in sel if p in place_rows})
    for rid in parents:
        own = [pid for pid, _ in sel.get(rid, [])]
        child_ids = [p for p in place_rows if place_rows[p][1] == rid]
        child_selected = {pid for c in child_ids for pid, _ in sel.get(c, [])}
        photo_ids = [p for p in reps.get(rid, []) if p in child_selected] if reps.get(rid) else own
        if not 2 <= len(photo_ids) <= 3:
            continue
        out.append({"id": rid, "kind": regions.kind(rid), "parentId": None, "name": regions.name(rid), "photoIds": photo_ids})
        for c in sorted(child_ids):
            ids = [pid for pid, _ in sel.get(c, [])]
            if 2 <= len(ids) <= 3:
                out.append({"id": c, "kind": "place", "parentId": rid, "name": place_rows[c][2], "photoIds": ids})
    return out, variant


def validate_export(data):
    """書き出し専用の厳しい検証（計画書 K2）。問題の一覧を返す（空なら OK）。"""
    errs = []
    if set(data) != TOP_KEYS:
        errs.append("最上位の項目が違う: " + ",".join(sorted(set(data) ^ TOP_KEYS)))
    regs = data.get("regions", [])
    photos = data.get("photos", {})
    ids = {r.get("id") for r in regs}
    referenced = set()
    for r in regs:
        pids = r.get("photoIds", [])
        if not 2 <= len(pids) <= 3:
            errs.append(f"{r.get('id')}: 写真が 2〜3 枚でない")
        if len(set(pids)) != len(pids):
            errs.append(f"{r.get('id')}: 写真が重複している")
        referenced.update(pids)
        if r.get("kind") == "place" and r.get("parentId") not in ids:
            errs.append(f"{r.get('id')}: 親の地域がデータにない")
    for extra in set(photos) - referenced:
        errs.append(f"{extra}: どの地域からも参照されていない")
    for missing in referenced - set(photos):
        errs.append(f"{missing}: 写真の情報がない")
    return errs


def _node_validate(repo_root, data):
    core = Path(repo_root) / JOURNEY_DIR / "journey-core.js"
    script = ("const core=require(process.argv[1]);let s='';process.stdin.on('data',d=>s+=d);"
              "process.stdin.on('end',()=>{process.stdout.write(JSON.stringify(core.validateJourney(JSON.parse(s))));});")
    try:
        r = subprocess.run(["node", "-e", script, str(core)], input=json.dumps(data), capture_output=True, text=True, timeout=30)
        res = json.loads(r.stdout)
        return res["ok"], res["errors"]
    except Exception as e:
        return False, [f"journey-core.js の検証を実行できない: {e}"]


def _to_srgb(im):
    icc = im.info.get("icc_profile")
    if icc:
        try:
            src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
            dst = ImageCms.createProfile("sRGB")
            return ImageCms.profileToProfile(im, src, dst, outputMode="RGB")
        except Exception:
            pass
    return im.convert("RGB")


def _encode(src, dst, edge):
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        im = _to_srgb(im)
        if max(im.size) > edge:
            im.thumbnail((edge, edge), Image.LANCZOS)
        clean = Image.new("RGB", im.size)
        clean.paste(im)  # 元の info（exif・xmp・icc など）を持ち越さない
        clean.save(dst, "JPEG", quality=QUALITY, optimize=True)
        return clean.size


def _check_clean(path):
    problems = []
    with Image.open(path) as im:
        if len(im.getexif()):
            problems.append("EXIF")
        for k in ("xmp", "XML:com.adobe.xmp", "icc_profile", "photoshop"):
            if k in im.info:
                problems.append(k)
        if IptcImagePlugin.getiptcinfo(im) is not None:
            problems.append("IPTC")
    if path.stat().st_size >= MAX_BYTES:
        problems.append("1MB 以上")
    return problems


def _write_data(path, data):
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(HEADER + "const TFF_JOURNEY = " + json.dumps(data, ensure_ascii=False, allow_nan=False, indent=2) + ";\n", encoding="utf-8")
    os.replace(tmp, path)


def run(conn, home, repo_root, validate=None):
    home, repo_root = Path(home), Path(repo_root)
    report = ExportReport()
    lock = home / "export.lock"
    try:
        fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    except FileExistsError:
        report.reasons.append("別の書き出しが動いている（export.lock）")
        return report
    try:
        os.write(fd, str(os.getpid()).encode())
        os.close(fd)
        return _run(conn, home, repo_root, validate, report)
    finally:
        lock.unlink(missing_ok=True)


def _run(conn, home, repo_root, validate, report):
    regs, variant = _snapshot(conn)
    used = []
    for r in regs:
        for pid in r["photoIds"]:
            if pid not in used:
                used.append(pid)
    staging = home / "staging" / str(int(time.time() * 1000))
    staging.mkdir(parents=True)
    photos = {}
    try:
        for pid in used:
            sha = variant.get(pid)
            row = conn.execute("SELECT path FROM photo_variants WHERE sha256 = ?", (sha,)).fetchone()
            if not row:
                report.reasons.append(f"{pid}: 採用したときの版が見つからない")
                return report
            w, h = _encode(row[0], staging / f"{pid}.jpg", LARGE_EDGE)
            _encode(row[0], staging / f"{pid}-s.jpg", THUMB_EDGE)
            ts, lat, lng = conn.execute("SELECT taken_utc, lat, lng FROM photos WHERE id = ?", (pid,)).fetchone()
            cap = conn.execute("SELECT caption FROM photo_editorial WHERE photo_id = ?", (pid,)).fetchone()
            first = next(r for r in regs if pid in r["photoIds"])
            photos[pid] = {
                "src": f"img/{pid}.jpg", "thumb": f"img/{pid}-s.jpg", "w": w, "h": h,
                "taken": timeutil.local(ts, lat, lng)[0].strftime("%Y-%m") if ts is not None else None,
                "caption": (cap[0] if cap and cap[0] else None),
                "alt": f"{first['name']}の景色",
            }
        for f in staging.iterdir():
            bad = _check_clean(f)
            if bad:
                report.reasons.append(f"{f.name}: {', '.join(bad)} が残っている")
        data = {"schemaVersion": 1, "regions": regs, "photos": photos}
        report.reasons += validate_export(data)
        ok, errs = (validate or (lambda d: _node_validate(repo_root, d)))(data)
        if not ok:
            report.reasons += ["journey-core.js: " + e for e in errs]
        expected = {p["src"][4:] for p in photos.values()} | {p["thumb"][4:] for p in photos.values()}
        if {f.name for f in staging.iterdir()} != expected:
            report.reasons.append("書き出した画像と公開データが一致しない")
        if report.reasons:
            return report

        journey = repo_root / JOURNEY_DIR
        img = journey / "img"
        img.mkdir(parents=True, exist_ok=True)
        for f in sorted(staging.iterdir()):  # (1) 新しい画像を足す
            dst = img / f.name
            if not dst.exists() or dst.read_bytes() != f.read_bytes():
                tmp = img / (f.name + ".tmp")
                shutil.copyfile(f, tmp)
                os.replace(tmp, dst)
        try:
            _write_data(journey / DATA_NAME, data)  # (2) データを 1 回で差し替える
        except OSError as e:
            report.reasons.append(f"公開データを書けなかった: {e}")
            return report
        for f in img.iterdir():  # (3) 使わなくなった画像を消す（失敗しても公開は成功）
            if IMG_NAME_RE.match(f.name) and f.name not in expected:
                try:
                    f.unlink()
                except OSError as e:
                    report.cleanup_failed.append(f"{f.name}: {e}")
        report.ok = True
        report.regions = len(regs)
        report.photos = len(photos)
        return report
    finally:
        shutil.rmtree(staging, ignore_errors=True)
