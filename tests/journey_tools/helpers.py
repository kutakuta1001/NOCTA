"""旅の地図の道具のテスト用の共通部品（合成の Takeout フォルダと画像を作る）。"""
import json
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO / "tools" / "journey"))

from PIL import Image  # noqa: E402


def make_jpeg(path, size=(120, 80), color=(120, 160, 200), exif=None):
    path.parent.mkdir(parents=True, exist_ok=True)
    img = Image.new("RGB", size, color)
    if exif is not None:
        img.save(path, "JPEG", exif=exif)
    else:
        img.save(path, "JPEG")
    return path


def make_sidecar(media_path, json_name=None, ts=1352872417, lat=0.0, lng=0.0, people=None, raw=None):
    name = json_name or (media_path.name + ".supplemental-metadata.json")
    p = media_path.parent / name
    if raw is not None:
        p.write_text(raw, encoding="utf-8")
        return p
    data = {
        "title": media_path.name,
        "photoTakenTime": {"timestamp": str(ts)},
        "geoData": {"latitude": lat, "longitude": lng},
    }
    if lat or lng:
        data["geoDataExif"] = {"latitude": lat, "longitude": lng}
    if people:
        data["people"] = [{"name": n} for n in people]
    p.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    return p


def tmpdir():
    return Path(tempfile.mkdtemp())
