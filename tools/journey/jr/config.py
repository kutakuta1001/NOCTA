"""設定。写真・状態・キャッシュはリポジトリの外の JOURNEY_HOME に置く。"""
import os
from dataclasses import dataclass
from pathlib import Path

DEFAULT_HOME = Path.home() / "Pictures" / "nocta-journey"
DEFAULT_ROOTS = "takeout:" + str(Path.home() / "Downloads" / "Takeout") + ":takeout:" + str(Path.home() / "Downloads" / "Takeout-2")
KINDS = ("takeout", "photos_app")


@dataclass
class Config:
    home: Path
    roots: list  # [(kind, Path)]

    @property
    def db_path(self):
        return self.home / "state.db"


def parse_roots(text):
    """`takeout:/a:photos_app:/b:/c` → [("takeout", /a), ("photos_app", /b), ("takeout", /c)]。"""
    parts = [p for p in text.split(":") if p]
    roots, kind = [], None
    for p in parts:
        if p in KINDS:
            kind = p
            continue
        roots.append((kind or "takeout", Path(p).expanduser()))
        kind = None
    return roots


def load():
    home = Path(os.environ.get("JOURNEY_HOME", DEFAULT_HOME)).expanduser()
    home.mkdir(parents=True, exist_ok=True)
    return Config(home=home, roots=parse_roots(os.environ.get("JOURNEY_ROOTS", DEFAULT_ROOTS)))
