---
title: "@dunik_7: CLAUDE.md は polite request、hooks は guarantee"
url: "https://x.com/dunik_7/status/2060036450217836664"
date: "2026-06-04"
domain: "x.com"
tags: [best-practices, source:xmcp]
---

## 要約

「CLAUDE.md は礼儀正しいお願いだ。Claude は時々読む。hooks は保証だ。Claude には選択肢がない。PreToolUse / PostToolUse hooks はほとんどの人が触れない設定だが、固定のタイミングで自動実行されスキップできないシェルスクリプトだ。」

## 主なポイント

- CLAUDE.md の指示は Claude が「読む」ことを期待するだけで、無視されることがある
- hooks（PreToolUse / PostToolUse）は「保証」であり、スキップ不可
- CLAUDE.md には常時適用ルールを、必須実行事項は hooks に移すのが正しい設計

## NOCTAへの関連メモ

NOCTAの CLAUDE.md（R-02: approved/ に触れない、R-03: SNS自動投稿しない）は現状 CLAUDE.md のみで守られているが、より重要なルールは hooks の deny リストにハード的に実装済み（settings.json）。このツイートの設計思想はすでに NOCTA で部分的に実装されている。R-02/R-03 の hooks 化を将来的に検討する価値あり。
