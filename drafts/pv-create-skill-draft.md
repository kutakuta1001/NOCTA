# /pv-create — NOCTA PV制作スキル（ドラフト）

## 概要

NOCTA用プロモーション映像を3フェーズで制作する。
動画生成はCEOがRunway WebアプリでGUI手動実行（API不使用）。
Claude Codeは絵コンテ設計・動画プロンプト生成・FFmpeg編集を担当。

---

## ディレクトリ規約

```
outputs/pv/
├── images/
│   ├── key/         ← CEOが配置（主人公・キービジュアル）
│   └── sub/         ← CEOが配置（背景・補助カット）
├── clips/           ← CEOがRunwayからダウンロードして配置
│   └── scene01.mp4 … scene0N.mp4
└── {project}_promo.mp4  ← FFmpeg最終出力

drafts/
└── pv_storyboard.md ← Phase1出力

outputs/prompts/
└── pv-video-prompts.md ← Phase2出力
```

---

## 使い方

```
/pv-create story [project_name]   # Phase1: 絵コンテ設計
/pv-create prompt                 # Phase2: Runway用動画プロンプト生成
/pv-create edit [bgm_path]        # Phase3: FFmpeg結合・BGM合成
```

引数なしで実行した場合は現在の状態を診断して次のphaseを提案する。

---

## Phase 1: story（絵コンテ設計）

### 手順

1. `outputs/pv/images/` 以下の画像ファイルを再帰的に列挙する
2. 各画像を Read tool で確認し、内容・雰囲気を把握する
3. NOCTAのブランド（深夜・星・音楽・内省）と画像の世界観を照合する
4. 以下の要素を含む絵コンテを設計する:
   - シーン数と順序（オープニング→展開→クライマックス→エンディング構成を基本）
   - 各シーンの使用画像ファイルパス
   - 尺（秒数）: 5秒 or 10秒
   - カメラワーク指示（Runway prompt用）: slow zoom in / gentle pan right / fade in 等
   - トランジション種別: crossfade / cut / dissolve
   - シーンのムード・テキスト（オプション）
5. `drafts/pv_storyboard.md` に保存する
6. **CEOに確認を取る（GoサインなしにPhase2に進まない）**

### 出力フォーマット（pv_storyboard.md）

```markdown
# PV絵コンテ: {project_name}
作成日: YYYY-MM-DD
総尺: XX秒

| # | ファイル | 尺 | カメラ指示 | トランジション | ムード |
|---|---|---|---|---|---|
| 01 | key/image01.png | 10s | slow zoom in | crossfade 1s | opening: 静寂 |
| 02 | key/image02.png | 5s | gentle pan right | crossfade 1s | 展開: 動き始める |
...
```

---

## Phase 2: prompt（Runway用動画プロンプト生成）

### 前提条件チェック

- `drafts/pv_storyboard.md` が存在すること
- CEO承認済みであること（ファイル内に「承認」記載を確認）

### 手順

1. `pv_storyboard.md` を読み込む
2. 各シーンについて Runway Gen4 Turbo 向けの動画プロンプトを生成する:
   - prompt_text: カメラワーク + ムード + 動きの指示（英語・50〜100語）
   - duration: 5 or 10
   - ratio: "1280:720"（横）or "720:1280"（縦・スマホ向け）
3. `outputs/prompts/pv-video-prompts.md` に保存する
4. **CEOへRunwayでの動画生成を依頼する（APIは使わない）**
5. 完了後、クリップを `outputs/pv/clips/scene01.mp4` の命名規則で配置するよう依頼する

### 出力フォーマット（pv-video-prompts.md）

```markdown
# Runway 動画生成プロンプト: {project_name}

## Scene 01 — opening
画像: outputs/pv/images/key/image01.png
Duration: 10s | Ratio: 1280:720

**Runway prompt_text:**
> A girl standing under wisteria, petals drifting slowly downward,
> gentle cinematic zoom in, soft purple bokeh, dreamy slow motion,
> melancholic and beautiful, painterly anime style

保存先: outputs/pv/clips/scene01.mp4
---
```

---

## Phase 3: edit（FFmpeg結合・BGM合成）

### 前提条件チェック

- `outputs/pv/clips/` に `scene*.mp4` が存在すること
- `pv_storyboard.md` のシーン順と一致していること
- BGMファイルが指定されていること（引数 or storyboardに記載）

### 手順

1. clips/ 内のファイルを storyboard の順番通りに並べる
2. 全クリップの解像度・フレームレートを ffprobe で確認・統一する
3. xfadeトランジション付きの concat フィルターを組み立てる
4. BGMを volume=0.3 でミックスする（映像音声 volume=1.0）
5. 出力: `outputs/pv/{project}_promo.mp4`（H.264 / AAC）
6. CEOに完成を報告する

### FFmpegコマンド設計

```python
# pv_edit.py（Claude Codeが生成・実行）
import subprocess, os, glob

def build_ffmpeg_command(clips, bgm_path, output_path, fade_duration=1.0):
    """
    clips: [('outputs/pv/clips/scene01.mp4', 10), ...]  # (path, duration_sec)
    bgm_path: 'path/to/bgm.mp3'
    output_path: 'outputs/pv/nocta_promo.mp4'
    """
    n = len(clips)
    inputs = []
    for path, _ in clips:
        inputs += ['-i', path]
    if bgm_path:
        inputs += ['-i', bgm_path]

    # xfade filter chain
    filter_parts = []
    prev = '[0:v]'
    for i in range(1, n):
        offset = sum(d for _, d in clips[:i]) - fade_duration * i
        tag = f'[v{i}]'
        filter_parts.append(
            f"{prev}[{i}:v]xfade=transition=fade:duration={fade_duration}:offset={offset}{tag}"
        )
        prev = tag

    # audio mix
    audio_inputs = ''.join(f'[{i}:a]' for i in range(n))
    filter_parts.append(f"{audio_inputs}concat=n={n}:v=0:a=1[ca]")
    if bgm_path:
        filter_parts.append(f"[ca]volume=1.0[va];[{n}:a]volume=0.3[ba];[va][ba]amix=inputs=2:duration=first[outa]")
        audio_map = '[outa]'
    else:
        audio_map = '[ca]'

    cmd = ['ffmpeg', '-y'] + inputs + [
        '-filter_complex', ';'.join(filter_parts),
        '-map', prev,
        '-map', audio_map,
        '-c:v', 'libx264', '-crf', '18', '-preset', 'slow',
        '-c:a', 'aac', '-b:a', '192k',
        '-shortest', output_path
    ]
    return cmd
```

---

## 承認ゲート

| # | タイミング | 内容 |
|---|---|---|
| ① | Phase1完了後 | 絵コンテのシーン順・尺・構成確認 |
| ② | Phase2完了後 | Runwayでの動画生成 + clips/配置完了の合図 |
| ③ | Phase3完了後 | 最終PV確認・修正指示 |

---

## IMPORTANT

- Runway APIは使用しない（CEOがWebアプリで手動実行）
- `outputs/approved/` への自動書き込み禁止（R-02）
- 実画像・動画ファイルはgitに追加しない（website/CLAUDE.md規則準用）
- FFmpegコマンドは実行前にCEOに確認を取る（破壊的上書きリスク）
