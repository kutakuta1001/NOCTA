# 旅の地図の道具（tools/journey）

The First Flower の「旅の一枚」ページ（`website/the-first-flower/journey/`）に載せる写真を、Google Takeout の書き出しから選ぶための道具。Mac の上だけで動き、写真をどこにも送らない。

- 設計書: `docs/superpowers/specs/2026-10-18-tff-journey-map-design.md`
- 計画書: `docs/superpowers/plans/2026-10-19-tff-journey-picker.md`

## 置き場所

| もの | 場所 |
|---|---|
| 入力（読むだけ） | `~/Downloads/Takeout`、`~/Downloads/Takeout-2`（`JOURNEY_ROOTS` で変更） |
| 状態・キャッシュ・境界データ・venv | `~/Pictures/nocta-journey/`（`JOURNEY_HOME` で変更）。git に入れない |
| 公開ファイル | `website/the-first-flower/journey/img/` と `tff-journey-data.js`（`export` だけが書く） |

`JOURNEY_ROOTS` は `:` 区切り。各フォルダの前に `takeout:` か `photos_app:` を付ける（付けなければ takeout）。
例: `JOURNEY_ROOTS=takeout:$HOME/Downloads/Takeout:photos_app:$HOME/Pictures/2026-11-旅行`

## 環境づくり（初回だけ）

```bash
uv venv --python 3.12 ~/Pictures/nocta-journey/venv
uv pip install --python ~/Pictures/nocta-journey/venv/bin/python -r tools/journey/requirements.txt
VENV=~/Pictures/nocta-journey/venv
```

## 実行の順番

```bash
$VENV/bin/python tools/journey/jr.py ingest    # 取り込み（重複を除く・保留を数える）
$VENV/bin/python tools/journey/jr.py geo       # 地域の判定（初回は境界データを取得）
$VENV/bin/python tools/journey/jr.py suggest   # 撮影場所のない写真を日ごとにまとめ、地域の候補を付ける
$VENV/bin/python tools/journey/jr.py assess    # 景色らしさ・人・ブレ・暗さの判定（初回はモデルを取得。止めても続きから）
$VENV/bin/python tools/journey/jr.py rescore   # 人の写り具合を保存済みの埋め込みから付け直す（判定の加減を変えたとき）
$VENV/bin/python tools/journey/jr.py serve     # 選ぶ画面を開く（127.0.0.1 だけ。Ctrl+C で終わる）
$VENV/bin/python tools/journey/jr.py export    # 選んだ写真を公開ファイルに書き出す（画面の「公開データを書き出す」と同じ）
$VENV/bin/python tools/journey/jr.py backup    # バックアップ用に重複なしで並べる（~/Pictures/nocta-journey/library）
```

## 写真を選ぶ流れ

1. `serve` で画面を開く
2. 「日ごとの確認」で、撮影場所のない写真の日に地域を付ける（候補のある日から）
3. 「場所の要確認」で、県境や海の上の写真に地域を付ける
4. 「候補を作り直す」を押す（地域を付けた写真の判定）
5. 「地域ごとに選ぶ」で、各地域 2〜3 枚を選ぶ。ひとことは選んだ枠に書く
6. 写真が多い地域は「地点」で名前を付けて地点にし、地点ごとに選んでから、地域の代表 2〜3 枚を選ぶ
7. 「公開データを書き出す」→ `website/the-first-flower/journey/` が更新される。サイトに出すには git でコミットして push する

## 写真を足すとき（新しい旅のあと）

- Takeout をもう一度書き出したら、`JOURNEY_ROOTS` に足して `ingest → geo → suggest → assess` を回す。重複は自動で除かれ、選んだ結果は残る
- 写真アプリから書き出した写真なら、`JOURNEY_ROOTS=photos_app:<そのフォルダ>` を足す（撮影情報入りの JPEG / HEIC）

## バックアップ

`backup` で `~/Pictures/nocta-journey/library/` に重複なしで並ぶ（ハードリンクなので Mac の容量はほぼ増えない）。このフォルダを丸ごと HDD にコピーすればよい。Takeout のフォルダを消しても、library の中身は残る。

## 候補の並び方（2026-10-19 CEO 決定）

- 人のいない写真を先に並べる。人が写っている写真（人混みの街を含む）は、人のいない写真で 20 枚に足りないときだけ出る（`candidates.CROWD_T`）
- 似た写真は 1 枚にする（`candidates.SIMILAR` = 0.88）。同じ日からは 4 枚まで（`PER_DAY`）
- アメリカは州で 西部 / 東部 / ハワイ の地点に分ける（`regions.SUBREGIONS`。分け方を変えたら `geo` を回し直す）

## テスト

```bash
$VENV/bin/python -m unittest discover -s tests/journey_tools -t . -v
```
