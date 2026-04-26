---
title: "Opus 4.7の登場で「これはもうやめろ」と言い始めた6つのこと"
url: "https://qiita.com/ot12/items/06420caf41a34a910c53"
date: "2026-04-26"
domain: "qiita.com"
tags: [best-practices, qiita, claude-code, source:manual]
---

## 要約（3〜5行）
Opus 4.7の登場により、Claude Codeの開発者・公式が推奨しなくなった6つの使い方を整理した記事。「細かく指示するほど賢い」という従来の前提が覆り、初回プロンプトに目的・制約・完了条件を全て含める方式への転換が推奨される。Effort Levelはmax常用を避けxhighをデフォルトに。

## 主なポイント
- ペアプロ型の細かい逐次指示は廃止。初回プロンプトにGoal + Constraints + Acceptance criteriaを一括して渡す
- Effort Level: `max` は過剰思考リスクあり→ `xhigh` がデフォルト推奨（大半のコーディングはxhighで最適）
- `--dangerously-skip-permissions` → Auto ModeまたはSkill `/fewer-permission-prompts` で安全に置き換え
- Focus Modeで結果のみ表示・Recapsでセッション復帰時にサマリー自動表示（見守り不要のUI設計へ）
- 「最も効果の高い施策」はClaudeが自己検証できる体制（テスト・スクリーンショット・期待出力）の提供

## NOCTAへの関連メモ
CLAUDE.mdのR-09（モデル使い分け）にすでにxhigh推奨を記載済み。初回プロンプトへのGoal+Constraints+AC一括渡しはNOCTAのブレインストーミングフェーズ（R-13・/brainstorm）で既に実践中。
