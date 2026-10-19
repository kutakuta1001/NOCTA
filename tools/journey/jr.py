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


def cmd_geo(cfg, args):
    from jr import geo

    conn = store.connect(cfg.db_path)
    counts = geo.run(conn, geo.Boundaries.load(cfg.home))
    print("地域の判定:", counts)
    print("写真の多い地域（上位 15）:")
    for rid, n in conn.execute("SELECT region_id, COUNT(*) FROM regions WHERE status='resolved' GROUP BY 1 ORDER BY 2 DESC LIMIT 15"):
        print(f"  {rid}: {n}")


def cmd_suggest(cfg, args):
    from jr import suggest

    conn = store.connect(cfg.db_path)
    s = suggest.run(conn)
    print(f"確認グループ: {s['groups']}（同じ日の推定あり {s['with_day']} / アルバム名の候補あり {s['with_album']}）")


def cmd_assess(cfg, args):
    from jr import assess

    conn = store.connect(cfg.db_path)
    t = time.time()

    def progress(done, total):
        if done % 640 < assess.BATCH or done == total:
            print(f"  {done}/{total}（{time.time() - t:.0f} 秒）", flush=True)

    s = assess.run(conn, cfg.home, assess.ClipScorer(), assess.ASSESS_VERSION, progress=progress)
    print(f"判定: ok {s['ok']} / 失敗 {s['failed']} / 済み {s['skipped']}（{time.time() - t:.0f} 秒）")


REPO_ROOT = Path(__file__).resolve().parents[2]


def cmd_serve(cfg, args):
    from jr import server

    url, httpd = server.serve(cfg.db_path, cfg.home, port=int(args[0]) if args else 0, repo_root=REPO_ROOT)
    print("選ぶ画面を開きました。開かないときはこの URL をブラウザで開いてください（この Mac の中だけで開けます）:")
    print(url)
    print("終わるときは Ctrl+C")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass


def cmd_export(cfg, args):
    from jr import export

    r = export.run(store.connect(cfg.db_path), cfg.home, REPO_ROOT)
    if r.ok:
        print(f"書き出しました: {r.regions} 地域・{r.photos} 枚")
    else:
        print("書き出せませんでした（公開ファイルは前のまま）:")
        for x in r.reasons:
            print("  " + x)
    for x in r.cleanup_failed:
        print("  掃除できなかった画像: " + x)


def cmd_backup(cfg, args):
    from jr import backup

    dest = Path(args[0]).expanduser() if args else cfg.home / "library"
    c = backup.run(store.connect(cfg.db_path), dest)
    print(f"整理しました: 写真 {c['photos']} 枚（編集版を含め {c['variants']} ファイル）・動画 {c['videos']} 本・未整理 {c['unsorted']} 件")
    print(f"このフォルダを丸ごと HDD にコピーすれば OK です: {dest}")


def cmd_rescore(cfg, args):
    from jr import assess

    n = assess.rescore_crowd(store.connect(cfg.db_path), assess.ClipScorer().crowd)
    print(f"人の写り具合を {n} 枚分つけ直しました（画像は読み直していません）")


COMMANDS = {"backup": cmd_backup, "rescore": cmd_rescore, "ingest": cmd_ingest, "geo": cmd_geo, "suggest": cmd_suggest, "assess": cmd_assess,
            "serve": cmd_serve, "export": cmd_export}


def main(argv=None):
    p = argparse.ArgumentParser(description="旅の地図の道具")
    p.add_argument("command", choices=sorted(COMMANDS))
    args, rest = p.parse_known_args(argv)
    cfg = config.load()
    COMMANDS[args.command](cfg, rest)


if __name__ == "__main__":
    main()
