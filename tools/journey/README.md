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
```

## テスト

```bash
$VENV/bin/python -m unittest discover -s tests/journey_tools -t . -v
```
