---
description: ターミナルから画像生成する（ChatGPTと同じ gpt-image-1 / Gemini。ブラウザ不要でアプリ用アセット・アイコン・ヒーロー画像を作成）
argument-hint: <プロンプト> [--quality low|medium|high] [--size WxH] [--out パス]
allowed-tools: Bash, Read
---

# /image-gen — 画像生成 by gpt-image-1 / Gemini

`$ARGUMENTS` を画像生成プロンプトとして `~/.claude/scripts/image-gen.py` で画像を生成してください。

## 手順

1. 引数からプロンプトとオプションを読み取る。出力先の指定がなければ、プロジェクト内の適切な場所（Webアプリなら `public/` 等）を提案するか、カレントディレクトリに保存する
2. `python3 ~/.claude/scripts/image-gen.py "<プロンプト>" [オプション]` を Bash で実行する（生成に30〜120秒かかる）
3. 生成された画像を Read で表示して確認する
4. 意図と違う場合はプロンプトを改善して再生成するか、`--input <生成済み画像>` の編集モードで修正指示を出す

## オプション早見表

| 用途 | オプション |
|---|---|
| 通常・ラフ確認（**既定**・約$0.01/枚） | `--quality low`（指定不要） |
| 品質を上げたいとき（約$0.04/枚） | `--quality medium` |
| 本番アセット（約$0.17/枚） | `--quality high` |
| 横長（LP ヒーロー等） | `--size 1536x1024` |
| 縦長（モバイル・ポスター） | `--size 1024x1536` |
| 複数案を比較 | `-n 3 --quality low` |
| 既存画像の修正 | `--input <元画像パス>` + 修正指示をプロンプトに |
| Gemini で生成（無料枠・写実系） | `--provider gemini` |

## プロンプトのコツ

- スタイルを明示する（フラットアイコン / 水彩 / 写実 / ピクセルアート など）
- 用途を伝える（「Webアプリのヒーロー画像」「ファビコン用」）。主用途は HP・Webアプリ用画像（LP ヒーローは `--size 1536x1024` が定番）
- 背景色・構図・余白の指定は日本語でそのまま書いて良い
- 複数案が欲しいときは `-n 3` でラフを出し（既定 low なので安い）、選んだ案だけ `--quality high` で再生成する

## 注意

- APIキーは環境変数 `OPENAI_API_KEY` → `~/memo-app/.env.local` の順で自動解決される（値を表示しない）
- コストはスクリプトが `COST(approx)` として表示する。high 品質の連発は事前にユーザーへ確認する
- gpt-image-1 が 403 を返す場合は `--model-id dall-e-3` か `--provider gemini` にフォールバックする
- ファビコン等の複数サイズ展開が必要なら、生成後に `ffmpeg -i in.png -vf scale=32:32 out-32.png` で縮小する
