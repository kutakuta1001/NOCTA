"""旅の地図の道具の入口。使い方は tools/journey/README.md。

    $VENV/bin/python tools/journey/jr.py <ingest|geo|suggest|previews|assess|serve|export|backup>
"""
import argparse
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from jr import config, store  # noqa: E402


def cmd_ingest(cfg, args):
    from jr import ingest

    conn = store.connect(cfg.db_path)
    t = time.time()
    r = ingest.run(conn, cfg.roots)
    print(f"取り込み: 新しい写真 {r.added} / 重複 {r.duplicates} / 保留 {r.pending} / 動画 {r.videos}（{time.time() - t:.0f} 秒）")
    print(f"写真の合計: {conn.execute('SELECT COUNT(*) FROM photos').fetchone()[0]}")
    for reason, n in conn.execute("SELECT reason, COUNT(*) FROM pending_files GROUP BY reason ORDER BY 2 DESC"):
        print(f"  保留 {reason}: {n}")


COMMANDS = {"ingest": cmd_ingest}


def main(argv=None):
    p = argparse.ArgumentParser(description="旅の地図の道具")
    p.add_argument("command", choices=sorted(COMMANDS))
    args, rest = p.parse_known_args(argv)
    cfg = config.load()
    COMMANDS[args.command](cfg, rest)


if __name__ == "__main__":
    main()
