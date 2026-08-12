---
title: "Claude Codeを「なんとなく使ってる」から卒業する。Best Practiceを全部まとめた"
url: "https://x.com/i/status/2039840802504077655"
date: "2026-04-16"
domain: "x.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
github.com/shanraisshan/claude-code-best-practice（スター3万超）の全87TipsをClaude Code初〜中級者向けに解説した包括的スレッド。CLAUDE.md育て方、プランモード、Subagents、Skills、Hooks、Pluginsの全6拡張機能を体系化。有名ワークフロー（Superpowers/Spec Kit/Get Shit Done）の比較も含む。

## 主なポイント
- プロンプト: Edit→再生成で履歴スタックを防ぐ。「仕切り直し」プロンプトで中途半端なパッチを排除
- 計画: Plan Mode（Shift+Tab）でコード生成前に方針確認。要件はClaudeにインタビューさせて仕様書化
- CLAUDE.md: 毎日更新、@記法で外部ファイル参照、.claude/rules/でルール分割、lessons learned記録
- Skills: Commandsは「自分で呼び出すもの」、Skillsは「Claudeが状況に応じて自動参照するもの」の使い分け
- /simplify でフェーズ完了後にリファクタリングを挟む（NOCTA未実装）
- /voice（音声入力）、/remote-control（モバイルから操作）、/schedule（クラウド定期実行）

## NOCTAへの関連メモ
CLAUDE.mdの@記法・ルール分割・auto-memory・lessons learnedはすでに実装済み。/simplifyコマンドと/voiceコマンドはNOCTAのSLASH COMMANDSに未記載のため、検討価値がある。
