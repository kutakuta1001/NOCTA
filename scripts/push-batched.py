#!/usr/bin/env python3
"""push-batched — 画像の多い変更を、小さなコミットに分けて 1 件ずつ push する。

この Mac からは数 MB を超える push が途中で切れる（HTTP 408・2026-10-25。回線を変えても同じで原因は未特定）。
1.5MB ほどに分ければ通るため、画像を先に小分けで送り、画像を指すデータは最後に送る。
途中で止まっても、ページが届いていない画像を指すことはない。

使い方:
  push-batched.py --assets DIR [--then FILE ...] -m 件名 [--trailer 行 ...] [--dry-run] [--yes]

  --assets DIR   画像のフォルダ（追加・変更された画像を小分けにする。消えた画像は最後のコミットに入れる）
  --then FILE    画像のあとに送るファイル（データなど）
  -m 件名        最後のコミットの件名。画像のコミットは「件名（画像 i/n）」になる
  --trailer 行   すべてのコミットの末尾に付ける行（Co-Authored-By など）
  --batch-mb N   1 コミットの画像の合計の上限（既定 1.5）
  --dry-run      分け方を表示するだけで、何も変えない
  --yes          push 前の確認を省く

まだ push していないコミットが先にあれば、それも 1 件ずつ送る。
紹介ページとカード説明文（docs/tools-page-copy.md の対象）は扱わない。文言監査（copy-audit-guard）を通すため。

終了コード: 0 = すべて送れた / 1 = 途中で止まった（残りは手元にある）/ 3 = 前提を満たさない
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
ASSET_EXT = {".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg", ".mp4", ".webm"}
MAX_FILE_MB = 1.0  # CLAUDE.md「1 ファイル 1MB を超えるものは、入れる前に置き場所を相談する」
RETRIES = 3


def plan_batches(files, limit):
    """[(path, size)] を、合計が limit バイト以下の組に分ける。並びは保つ。"""
    batches, cur, total = [], [], 0
    for path, size in files:
        if cur and total + size > limit:
            batches.append(cur)
            cur, total = [], 0
        cur.append(path)
        total += size
    if cur:
        batches.append(cur)
    return batches


def git(*args, check=True):
    r = subprocess.run(["git", *args], cwd=REPO, capture_output=True, text=True)
    if check and r.returncode != 0:
        raise SystemExit(f"git {' '.join(args)} が失敗しました:\n{r.stderr.strip()}")
    return r


def unpushed():
    return git("rev-list", "--reverse", "origin/main..HEAD").stdout.split()


def changes(folder):
    """folder の下の (追加・変更, 削除) を返す。"""
    out = git("status", "--porcelain=v1", "-z", "--untracked-files=all", "--", folder).stdout
    added, deleted = [], []
    for entry in filter(None, out.split("\0")):
        code, path = entry[:2], entry[3:]
        (deleted if "D" in code else added).append(path)
    return sorted(added), sorted(deleted)


def audit_targets():
    text = (REPO / "docs/tools-page-copy.md").read_text(encoding="utf-8")
    m = re.search(r"```json copy-audit-config\n(.*?)\n```", text, re.S)
    cfg = json.loads(m.group(1)) if m else {}
    return set(cfg.get("intro_pages", [])) | {cfg.get("card_file", "")}


def push_to(commit):
    """commit まで送る。エラーが出ても実際に届いていれば成功とみなす。"""
    for attempt in range(1, RETRIES + 1):
        git("push", "-q", "origin", f"{commit}:refs/heads/main", check=False)
        git("fetch", "-q", "origin")
        if git("rev-parse", "origin/main").stdout.strip() == commit:
            return True
        print(f"  送れませんでした（{attempt}/{RETRIES}）")
    return False


def commit(paths, message, trailers):
    git("add", "--", *paths)
    body = message + ("\n\n" + "\n".join(trailers) if trailers else "")
    git("commit", "-q", "-m", body)
    return git("rev-parse", "HEAD").stdout.strip()


def main(argv=None):
    p = argparse.ArgumentParser(description="画像の多い変更を小分けにして push する")
    p.add_argument("--assets", required=True)
    p.add_argument("--then", nargs="*", default=[])
    p.add_argument("-m", dest="subject", required=True)
    p.add_argument("--trailer", action="append", default=[])
    p.add_argument("--batch-mb", type=float, default=1.5)
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--yes", action="store_true")
    a = p.parse_args(argv)

    def stop(msg):
        print(msg, file=sys.stderr)
        return 3

    if git("rev-parse", "--abbrev-ref", "HEAD").stdout.strip() != "main":
        return stop("main ブランチで実行してください")
    if git("diff", "--cached", "--quiet", check=False).returncode != 0:
        return stop("ステージに別の変更があります。外してから実行してください（git restore --staged <file>）")
    git("fetch", "-q", "origin")
    if git("rev-list", "--count", "HEAD..origin/main").stdout.strip() != "0":
        return stop("GitHub 側に手元にないコミットがあります。先に git pull で取り込んでください")

    added, deleted = changes(a.assets)
    then = [f for f in a.then if git("status", "--porcelain", "--", f).stdout.strip()]
    blocked = audit_targets()
    for f in added + deleted + then:
        if f in blocked or f.endswith(".html"):
            return stop(f"{f} は文言監査の対象になりうるため、このスクリプトでは送りません")
    for f in added:
        if Path(f).suffix.lower() not in ASSET_EXT:
            return stop(f"{f} は画像・動画ではありません。--then に指定してください")
    sizes = [(f, (REPO / f).stat().st_size) for f in added]
    big = [f for f, s in sizes if s > MAX_FILE_MB * 1024 * 1024]
    if big:
        return stop("1MB を超えるファイルがあります。置き場所を CEO に相談してください:\n  " + "\n  ".join(big))

    batches = plan_batches(sizes, int(a.batch_mb * 1024 * 1024))
    final = then + deleted
    pending = unpushed()
    print(f"先に送る未 push のコミット: {len(pending)} 件")
    print(f"画像のコミット: {len(batches)} 件（追加・変更 {len(added)} ファイル・合計 {sum(s for _, s in sizes) / 1e6:.1f}MB）")
    print(f"最後のコミット: {len(then)} ファイル＋消えた画像 {len(deleted)} 件" if final else "最後のコミット: なし")
    if not (pending or batches or final):
        print("送るものはありません")
        return 0
    if a.dry_run:
        return 0
    if not a.yes and input("GitHub の main に送ります（本番サイトが更新されます）。よろしいですか [y/N] ").strip().lower() != "y":
        print("やめました。何も変えていません")
        return 0

    for c in pending:
        if not push_to(c):
            print(f"未 push のコミット {c[:7]} が送れませんでした。大きすぎる場合は分け直してください", file=sys.stderr)
            return 1
    for i, batch in enumerate(batches, 1):
        c = commit(batch, f"{a.subject}（画像 {i}/{len(batches)}）", a.trailer)
        if not push_to(c):
            print(f"画像 {i}/{len(batches)} で止まりました。残りは手元にあります。"
                  "通らないときは GitHub の画面からアップロードしてください（tools/journey/README.md）", file=sys.stderr)
            return 1
        print(f"画像 {i}/{len(batches)} を送りました")
    if final:
        c = commit(final, a.subject, a.trailer)
        if not push_to(c):
            print("最後のコミットが送れませんでした。手元にあります", file=sys.stderr)
            return 1
    print("すべて送りました")
    return 0


if __name__ == "__main__":
    sys.exit(main())
