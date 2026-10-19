"""縮小画像（長辺 512px）。判定とは別に作れる（計画書 K6）。ファイル名は版の SHA-256。"""
from pathlib import Path

from PIL import Image, ImageOps

from jr import ingest  # noqa: F401  HEIC を開けるようにする

PREVIEW_EDGE = 512


def current_variant(conn, photo_id):
    """表示に使う版: 編集版があれば編集版、なければ元。(sha256, path) を返す。"""
    row = conn.execute(
        "SELECT sha256, path FROM photo_variants WHERE photo_id = ? ORDER BY role = 'edited' DESC, path LIMIT 1",
        (photo_id,)).fetchone()
    return (row[0], Path(row[1])) if row else (None, None)


def preview_path(home, sha):
    return Path(home) / "cache" / (sha + ".jpg")


def make(src, dst):
    dst.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im).convert("RGB")
        im.thumbnail((PREVIEW_EDGE, PREVIEW_EDGE))
        tmp = dst.with_suffix(".tmp")
        im.save(tmp, "JPEG", quality=85)
        tmp.replace(dst)
    return dst


def ensure(conn, home, photo_id):
    sha, src = current_variant(conn, photo_id)
    if sha is None:
        raise FileNotFoundError(photo_id)
    dst = preview_path(home, sha)
    if not dst.exists():
        make(src, dst)
    return sha, dst


def run(conn, home, photo_ids):
    done = failed = 0
    for pid in photo_ids:
        try:
            ensure(conn, home, pid)
            done += 1
        except Exception:
            failed += 1
    return {"done": done, "failed": failed}
