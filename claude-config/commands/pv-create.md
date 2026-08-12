---
name: pv-create
description: Use when creating a promotional video for NOCTA. Handles storyboard design, Runway video prompts, and FFmpeg assembly of clips into a final PV.
---

# /pv-create — NOCTA PV制作スキル

## 概要

NOCTA用プロモーション映像を3フェーズで制作する。

| フェーズ | 担当 | 内容 |
|---|---|---|
| **story** | Claude Code | 絵コンテ・シーン構成・尺の設計 |
| **prompt** | Claude Code | Runway Web UI 用の動画プロンプト生成 |
| **edit** | Claude Code + FFmpeg | クリップ結合・BGM合成・クロスフェード |
| 動画生成 | **CEO** | Runway Web アプリで手動実行（API不使用） |

## ディレクトリ規約

```
outputs/pv/
├── images/
│   ├── key/           ← CEO が配置（主人公・キービジュアル）
│   └── sub/           ← CEO が配置（背景・補助カット）
├── clips/
│   └── scene01.mp4 … ← CEO が Runway からダウンロードして配置
├── pv_edit.py         ← FFmpeg ラッパースクリプト
└── {project}_promo.mp4

drafts/
└── pv_storyboard.md

outputs/prompts/
└── pv-video-prompts.md
```

## 使い方

```
/pv-create story [project_name]    # Phase 1
/pv-create prompt                  # Phase 2
/pv-create edit [bgm_path]         # Phase 3
/pv-create                         # 現在の状態を診断して次のフェーズを提案
```

---

## 引数なし: 状態診断

1. `outputs/pv/images/` に画像があるか確認
2. `drafts/pv_storyboard.md` の有無と承認状態を確認
3. `outputs/pv/clips/` にクリップがあるか確認
4. 次に実行すべきフェーズを提案する

---

## Phase 1: story（絵コンテ設計）

### 手順

1. `outputs/pv/images/` 以下の画像ファイルを Glob で列挙する
2. 各画像を Read tool で確認し、内容・雰囲気・色調を把握する
3. NOCTA のブランド（深夜・星・音楽・内省・パステル）と画像の世界観を照合する
4. 以下の要素を含む絵コンテを設計する:
   - シーン数と順序（オープニング→展開→クライマックス→エンディング構成を基本）
   - 各シーンの使用画像ファイルパス
   - 尺（秒数）: 5 or 10
   - カメラワーク指示（英語・Runway prompt に転用）
   - トランジション: crossfade / cut
   - シーンのムード
5. `drafts/pv_storyboard.md` に保存する
6. **CEO に確認を取る（Goサインなしに Phase 2 に進まない）**

### pv_storyboard.md フォーマット

```markdown
# PV絵コンテ: {project_name}
作成日: YYYY-MM-DD
総尺目安: XX秒
承認: （未承認）

| # | ファイル | 尺 | カメラ指示 | トランジション | ムード |
|---|---|---|---|---|---|
| 01 | key/image01.png | 10s | slow zoom in | crossfade 1s | opening: 静寂 |
| 02 | key/image02.png | 5s  | gentle pan right | crossfade 1s | 展開 |
```

---

## Phase 2: prompt（Runway 用動画プロンプト生成）

### 前提条件チェック

- `drafts/pv_storyboard.md` が存在すること
- ファイル内の「承認:」行が「未承認」以外であること

### 手順

1. `pv_storyboard.md` を Read する
2. 各シーンに対して Runway Gen4 Turbo 向けプロンプトを生成する:
   - **prompt_text**: カメラワーク + ムード + 動き（英語・50〜100語）
   - **duration**: 5 or 10
   - **ratio**: `1280:720`（横）または `720:1280`（縦・スマホ向け）
3. `outputs/prompts/pv-video-prompts.md` に保存する
4. **CEO に Runway での手動生成を依頼する**
5. 完了後、`outputs/pv/clips/scene01.mp4` の命名規則で配置を依頼する

### pv-video-prompts.md フォーマット

```markdown
# Runway 動画生成プロンプト: {project_name}

## Scene 01 — opening
画像: outputs/pv/images/key/image01.png
Duration: 10s | Ratio: 1280:720

**prompt_text（Runway に貼り付け）:**
> A girl standing under wisteria, petals drifting slowly downward,
> gentle cinematic zoom in, soft purple bokeh, dreamy slow motion,
> melancholic and beautiful, painterly anime style

保存先: outputs/pv/clips/scene01.mp4
---
```

---

## Phase 3: edit（FFmpeg 結合・BGM 合成）

### 前提条件チェック

- `outputs/pv/clips/scene*.mp4` が存在すること
- `pv_storyboard.md` のシーン数と一致していること
- `outputs/pv/pv_edit.py` が存在すること（なければ CODEMAP から再生成）

### 手順

1. clips/ 内の `scene*.mp4` を確認し、storyboard の順番と照合する
2. BGM パスを確認する（引数 or CEO に確認）
3. 以下のコマンドを組み立てて **CEO に実行を提案する**:

```bash
python3 outputs/pv/pv_edit.py \
  outputs/pv/clips \
  outputs/pv/{project}_promo.mp4 \
  --bgm {bgm_path} \
  --fade 1.0
```

4. スクリプトは実行前に FFmpeg コマンドを表示して `y/N` で確認を求める
5. 完了後、CEO に最終 PV の確認を依頼する

### pv_edit.py の対応内容

| 問題 | 対応 |
|---|---|
| `n==1` エッジケース | `[nv0]` を直接 map（フィルタラベル不要） |
| Runway 無音クリップ | ffprobe で音声有無を確認 → 無音は `anullsrc` で補完 |
| xfade offset のずれ | ffprobe 実尺から offset を計算 |
| 映像/音声タイミングずれ | 音声も `acrossfade` でクロスフェード |
| 解像度・fps 不一致 | `scale/fps/settb/format` で 1280×720/30fps/yuv420p に正規化 |

---

## 承認ゲート

| # | タイミング | CEO が判断すること |
|---|---|---|
| ① | Phase 1 完了後 | シーン順・尺・全体構成が意図と合っているか |
| ② | Phase 2 完了後 | Runway で動画生成 → clips/ に配置完了を合図 |
| ③ | Phase 3 完了後 | 最終 PV の映像・音・テンポ確認・修正指示 |

---

## IMPORTANT

- Runway API は使用しない（CEO が Web アプリで手動実行）
- `outputs/approved/` への自動書き込み禁止（R-02）
- 実画像・動画ファイルは git に追加しない
- FFmpeg は `pv_edit.py` 経由で実行し、直接 Bash 実行しない
- CEO の Goサインなしに次フェーズに進まない（R-13）
