---
title: "Claude Code /schedule: クラウドスケジュール済みタスク（PC オフでも動作）"
url: "https://docs.anthropic.com/ja/docs/claude-code/overview"
date: "2026-04-13"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code に `/schedule` コマンドでクラウドスケジュール済みタスクを作成できる機能が追加された。
Anthropic が管理するインフラ上で実行されるため、ローカル PC がオフの場合でも継続して動作する。
Web・デスクトップアプリ・CLI のいずれからでも作成可能。
定期的な PR レビュー・夜間 CI 障害分析・週次依存関係監査などの自動化に利用できる。

## 主なポイント
- `/schedule` コマンドで作成（Web・デスクトップ・CLI から）
- Anthropic インフラで実行 → PC オフ時も動作継続
- 用途例: 朝の PR レビュー・夜間 CI 分析・週次依存関係監査・定期ドキュメント同期
- デスクトップスケジュール済みタスクもあり（こちらはローカル実行・ローカルファイルアクセス可）

## NOCTAへの関連メモ
将来的に `/x-practices-search` の定期自動実行や、リリース後の SNS 分析自動化に活用できる候補機能。現時点では月次の /best-practices-review が手動運用だが、定期スケジュール化することで運用負荷を下げられる可能性がある。
