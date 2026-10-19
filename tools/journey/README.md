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
$VENV/bin/python tools/journey/jr.py serve     # 選ぶ画面を開く（127.0.0.1 だけ。Ctrl+C で終わる）
$VENV/bin/python tools/journey/jr.py export    # 選んだ写真を公開ファイルに書き出す（画面の「公開データを書き出す」と同じ）
$VENV/bin/python tools/journey/jr.py backup    # バックアップ用に重複なしで並べる（~/Pictures/nocta-journey/library）
```

## テスト

```bash
$VENV/bin/python -m unittest discover -s tests/journey_tools -t . -v
```
