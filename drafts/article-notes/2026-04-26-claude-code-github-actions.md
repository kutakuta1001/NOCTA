---
title: "Claude Code GitHub Actionsを使いこなせ！"
url: "https://zenn.dev/acntechjp/articles/3f361da473eac8"
date: "2026-04-26"
domain: "zenn.dev"
tags: [best-practices, zenn, claude-code, source:manual]
---

## 要約（3〜5行）
GitHubのPRやIssueで `@claude` メンションするだけでClaude Codeが自動応答・コード変更を行うClaude Code GitHub Actionsの解説記事。Anthropic APIまたはMAX Subscription対応で、3ステップのセットアップで動作する。2025年7月からMAX Subscription認証方式も追加。

## 主なポイント
- GitHub App（権限付与）+ GitHub Actions（実行エンジン）の2層構造
- セットアップ3ステップ: Claude GitHub AppインストールBIL → APIキーをSecretに設定 → `.github/workflows/claude.yml` 配置
- `issue_comment` / `pull_request_review_comment` など複数トリガーイベントをYAMLで定義可能
- MAX Subscription対応: `claude setup-token` でOAuthトークンを取得しSecretとして登録
- Bunランタイム上で実行。PRコメントに `@claude` と書くだけで自動コード変更が発動

## NOCTAへの関連メモ
website/ への変更PRで自動コードレビューをClaude Code GitHub Actionsで実装できる。現在CLAUDE.mdに「GitHub Code Review（GitHub App）」として記載済みだが、具体的なセットアップ手順の参考になる。
