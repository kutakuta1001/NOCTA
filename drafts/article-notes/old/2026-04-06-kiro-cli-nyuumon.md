---
title: "Kiro CLI に入門"
url: "https://dev.classmethod.jp/articles/kiro-cli-nyuumon/"
date: "2026-04-06"
tags: [best-practices, ai-coding-tool, kiro]
---

## 要約

AWS製ターミナルAIエージェントツール「Kiro CLI」（Amazon Q Developer CLIの後継）の入門ガイド。
JSONファイルによるカスタムエージェント設定（ツール制限・システムプロンプト・コンテキスト・自動許可）が強みで、.kiro/agents/ ディレクトリで管理する。
Free Tierユーザーは学習対象となるため、コンテンツ共有・テレメトリを無効化することが推奨されている。

## 主なポイント

- カスタムエージェントをJSONで細粒度制御できる（Claude Code の agents/*.md に相当）
- セキュリティ設定（テレメトリ無効化）を初期設定で行うことを推奨
- MCPサーバー統合・定型プロンプト・チェックポイント機能あり
- Tangent Mode（脱線機能）はサイドの調査を本流と分離できる独自機能
- Claude Code との差別化は組み込みAWSツールとターミナルUI

## NOCTAへの関連メモ

Claude Code との直接比較として参考になるが、AWS依存のため NOCTA への移行価値は低い。Tangent Mode の発想（脱線を本流から分離）は Claude Code の /btw コマンドと同思想。エージェントのJSON設定粒度は ~/.claude/agents/ のMDファイルより細かく、将来の参考になりうる。
