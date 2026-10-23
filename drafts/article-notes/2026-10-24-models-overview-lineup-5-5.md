---
title: "Models overview（platform.claude.com）"
url: "https://platform.claude.com/docs/en/about-claude/models/overview"
date: "2026-10-24"
domain: "platform.claude.com"
tags: [best-practices, claude-code, models, source:manual]
---

## 要約（3〜5行）
現行ラインナップが Fable 5.1 / Opus 5.5 / Sonnet 5.5 / Haiku 5.5 の4本になり、Sonnet 5・Haiku 4.5 は Legacy へ。4本とも 1M コンテキスト・最大出力128k・知識カットオフ2026年6月。

## 主なポイント
- 既定 effort: Fable 5.1 high / Opus 5.5 medium / Sonnet 5.5 high / Haiku 5.5 medium
- Sonnet 5.5 は thinking を `disabled` にできない（`between_tools` のみ）
- キャッシュ読取: Fable 5.1 2.5% / Opus 5.5・Sonnet 5.5 5% / 他10%
- 廃止予定: Sonnet 5.5 は2027-09-28以降・Haiku 5.5 は2027-10-07以降

## NOCTAへの関連メモ
R-09 の「Fable 5.1 はカットオフで Opus 5 を上回る」記述は、全モデルが2026年6月になったため根拠として使えない。
