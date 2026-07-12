---
title: "Agent Skills — 本番環境対応エンジニアリングスキル集（addyosmani）"
url: "https://github.com/addyosmani/agent-skills"
date: "2026-07-12"
domain: "github.com"
tags: [best-practices, source:xmcp]
---

## 要約（3〜5行）
AIコーディングエージェント向けの「本番品質」エンジニアリングワークフローを構造化したスキル集。`/spec` → `/plan` → `/build` → `/test` → `/review` → `/ship` の8スラッシュコマンドと24のライフサイクルスキル、4つのエージェントペルソナ（code-reviewer / test-engineer / security-auditor / web-performance-auditor）を提供。Cursor・Codex・Copilot等マルチツール対応。

## 主なポイント
- スペック定義→計画→実装→検証→レビュー→デプロイの一貫したライフサイクルをスキルとしてエンコード
- `/webperf`（パフォーマンス監査）、`/code-simplify`（簡潔化）など専門スキルも含む
- 4エージェントペルソナがシニアエンジニアの規律を代替
- `npx skills add addyosmani/agent-skills` または `/plugin marketplace add` で導入

## NOCTAへの関連メモ
NOCTAのwebsite/コード領域には`/code-review` `/simplify` `/security-review`など類似スキルが既に存在する。本リポジトリのcode-reviewer/security-auditorペルソナ設計は、website/変更時のレビュー体制（GitHub Code Review App併用）を補強する際の構成参考になる。直ちの導入は不要（既存スキルで概ねカバー済み）。
