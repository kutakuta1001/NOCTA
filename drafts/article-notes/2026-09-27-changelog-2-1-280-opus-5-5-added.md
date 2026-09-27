---
title: "Claude Code CHANGELOG v2.1.280 — Claude Opus 5.5 追加・既定 Opus に昇格"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-09-27"
domain: "github.com"
tags: [best-practices, claude-code, changelog, models, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.280 で Claude Opus 5.5（`claude-opus-5-5`）が追加され、`/model` の既定 Opus になった。
1M コンテキスト・$4/$20 per MTok・キャッシュ読取 $0.20/MTok。Opus 5 の $5/$25 から入出力とも2割下がり、
知識カットオフは Fable 5.1 と同じ2026年6月。

## 主なポイント
- 新モデル ID は `claude-opus-5-5`。`/model` ピッカーの Opus 行から「(1M context)」表記が消えた（1M が標準になったため）
- 価格 $4/$20 は Sonnet 5（$2/$10）の2倍、Fable 5.1（$10/$50）の4割
- 同バージョンで `CLAUDE_CODE_MAX_MCP_DESCRIPTION_LENGTH` が追加され、MCP ツール説明の2,048文字上限を変えられる
- 以前保存した `/effort` 設定は新モデルに引き継がれず、Opus 5.5 は既定 effort（medium）で開始する

## NOCTAへの関連メモ
R-09 は批評・承認ゲート直前レビュー・SVP 生成を Opus 5 に割り当てている。Opus 5.5 は安くて新しいので置き換え候補だが、
既定 effort が medium のため、批評品質を保つには `/effort high` かエージェント定義の `effort:` 明示が必要。/model-review の対象。
