---
title: "/less-permission-prompts スキル: 権限許可リストを自動提案"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-04-18"
domain: "github.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.113 で `/less-permission-prompts` スキルが追加された。読み取り専用の Bash/MCP ツール呼び出しを自動スキャンし、`settings.json` の `permissions.allow` に追加すべき候補リストを提案する。毎回表示される権限確認ダイアログの頻度を削減し、作業効率を向上させる。

## 主なポイント
- cat / ls / read 等の読み取り専用ツールを自動検出して許可リスト候補を生成
- 実行後に `settings.json` の `permissions.allow` への追加を提案（手動で確認・適用）
- Deny リストと組み合わせることでセキュリティと効率のバランスを最適化できる
- v2.1.113 で追加

## NOCTAへの関連メモ
NOCTA の settings.json 権限設定を `/less-permission-prompts` で一度スキャンすることを推奨。Deny リスト（CLAUDE.md セキュリティ設定）と並行して使うと安全性を保ちながら許可プロンプトを削減できる。
