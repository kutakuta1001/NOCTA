---
title: "v2.1.142: Fast mode のデフォルトが Opus 4.7 に変更"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-05-18"
domain: "github.com"
tags: [best-practices, source:manual]
---

## 要約
Claude Code v2.1.142 で Fast mode（/fast）のデフォルトモデルが Opus 4.6 から Opus 4.7 に変更された。Fast mode はモデルをダウングレードせず高速出力を提供する機能で、ベースモデルが最新の Opus 4.7 に更新されたことで品質・知識カットオフが向上する。

## 主なポイント
- Fast mode デフォルト: claude-opus-4-6 → claude-opus-4-7（v2.1.142）
- Opus 4.7 は知識カットオフ 2026年1月・エージェント型コーディングで Opus 4.6 より大幅改善
- /fast はトグルで有効化・Opus モデル専用機能（モデルのダウングレードはしない）

## NOCTAへの関連メモ
Claude Code のシステム情報「Fast mode uses Opus 4.6」が古い可能性がある。CLAUDE.md には Fast mode の記述がないため直接影響なし。/fast を使う場合は Opus 4.7 で動作することを認識しておく。
