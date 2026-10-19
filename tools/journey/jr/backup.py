"""バックアップ用の整理: 重複をなくした写真と動画を「年 / 年月 / 年月日_元の名前」に並べる。

入力は変えない。ハードリンク（同じ中身に別の名前を足すだけ）なので Mac の容量はほとんど増えない。
並べたフォルダを丸ごと外付けの HDD にコピーすれば、中身（実体）がコピーされる。
"""
import csv
import os
from collections import defaultdict
from pathlib import Path

from jr import timeutil

UNSORTED = "_未整理"
README = """このフォルダは、Google フォトの書き出し（Takeout）から重複をなくして整理した写真と動画です。

- 写真: {photos} 枚（編集版を含むファイル数 {variants}）
- 動画: {videos} 本
- 日時の分からないもの・情報ファイルのないもの: {unsorted} 件（{unsorted_dir}/ に元のフォルダ構成で入っています）
- 作った日: {made}

このフォルダを丸ごと外付けの HDD にコピーすれば、バックアップは完了です。
写真の横の .json は Google フォトの情報ファイル（撮影日時・撮影場所など）です。
manifest.csv に、各ファイルの置き先と元の場所（重複していた場所をすべて）を書いています。
"""


def _link(src, dst):
    dst.parent.mkdir(parents=True, exist_ok=True)
    os.link(src, dst)


def _free(dst, src, used):
    """その名前に置いてよいか: 今回まだ使っておらず、既にあるなら同じ実体（前回の backup で置いたもの）。"""
    if str(dst) in used:
        return False
    return not dst.exists() or os.path.samefile(src, dst)


def _place(dst, src, sha, used):
    """名前がぶつかったら _<SHA の先頭 6 桁>（さらにぶつかれば連番）を足す。"""
    cand, n = dst, 0
    while not _free(cand, src, used):
        n += 1
        cand = dst.with_name(dst.stem + "_" + sha[:6] + ("" if n == 1 else f"_{n}") + dst.suffix)
    used.add(str(cand))
    return cand


def run(conn, dest):
    dest = Path(dest)
    dest.mkdir(parents=True, exist_ok=True)
    sources = defaultdict(list)
    for path, sha in conn.execute("SELECT path, sha256 FROM source_files WHERE sha256 IS NOT NULL ORDER BY path"):
        sources[sha].append(path)
    first = next(iter(sources.values()), [None])[0]
    if first and os.stat(first).st_dev != os.stat(dest).st_dev:
        raise OSError(f"{dest} は写真と別のディスクにあるため、ハードリンクで並べられない。写真と同じディスクの場所を指定してください")

    used, manifest = set(), []
    counts = {"photos": 0, "variants": 0, "videos": 0, "unsorted": 0}
    sidecars = dict(conn.execute("SELECT sha256, sidecar_path FROM source_files WHERE sidecar_path IS NOT NULL"))

    def put(src, folder, name, sha):
        dst = _place(dest / folder / name, src, sha, used)
        if not dst.exists():
            _link(src, dst)
        side = sidecars.get(sha)
        if side and Path(side).exists():
            js = dst.with_name(dst.name + ".json")
            if not js.exists():
                _link(side, js)
        manifest.append({"置き先": str(dst.relative_to(dest)), "sha256": sha, "元の場所": " | ".join(sources.get(sha, [str(src)]))})

    for pid, ts, lat, lng in conn.execute("SELECT id, taken_utc, lat, lng FROM photos ORDER BY taken_utc, id").fetchall():
        local = timeutil.local(ts, lat, lng)[0]
        folder = f"{local:%Y}/{local:%Y-%m}"
        for sha, path in conn.execute("SELECT sha256, path FROM photo_variants WHERE photo_id = ? ORDER BY role != 'original', path", (pid,)):
            put(path, folder, f"{local:%Y-%m-%d}_{Path(path).name}", sha)
            counts["variants"] += 1
        counts["photos"] += 1

    seen = set()
    for path, root, sha, ts, status in conn.execute(
            "SELECT path, root, sha256, taken_utc, status FROM source_files WHERE status IN ('video', 'pending', 'other') ORDER BY path").fetchall():
        if sha in seen:
            continue
        seen.add(sha)
        if status == "video" and ts is not None:
            local = timeutil.local(ts, None, None)[0]
            put(path, f"{local:%Y}/{local:%Y-%m}", f"{local:%Y-%m-%d}_{Path(path).name}", sha)
            counts["videos"] += 1
        else:
            rel = Path(path).relative_to(root)
            put(path, Path(UNSORTED) / Path(root).name / rel.parent, rel.name, sha)
            counts["unsorted"] += 1

    with open(dest / "manifest.csv", "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["置き先", "sha256", "元の場所"])
        w.writeheader()
        w.writerows(manifest)
    import datetime as dt

    (dest / "README.txt").write_text(README.format(made=dt.date.today().isoformat(), unsorted_dir=UNSORTED, **counts), encoding="utf-8")
    return counts
