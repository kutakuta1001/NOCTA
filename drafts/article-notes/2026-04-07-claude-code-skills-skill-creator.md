---
title: "【Claude Code】 Skillsを自作しよう！skill-creatorの最新の導入方法"
url: "https://zenn.dev/lv/articles/b772312d6abf35"
date: "2026-04-07"
domain: "zenn.dev"
tags: [best-practices, zenn, claude-code]
---

## 要約（3〜5行）

Anthropic 公式が提供する「skill-creator」というメタスキルを使って、カスタム Skills を効率的に作成・テスト・改善するプロセスを解説。skill-creator はユーザーへのヒアリング→スキル自動生成→検証→改善までを循環的に回す「スキルを作るためのスキル」。マーケットプレイス登録→プラグインインストール→再起動の3ステップで導入可能。

## 主なポイント

- **skill-creator とは**: Anthropic 公式の「メタスキル」。ユーザーヒアリング→自動生成→テスト→改善のサイクルを自動化する
- **description フィールドが最重要**: Claude が「このスキルを使うべきか」を判断する唯一のトリガー。他のすべてより優先度が高い（NOCTA では既に全スキルに実装済み）
- **3層リソース構造**: `scripts/`（実行スクリプト）/ `references/`（参照ドキュメント）/ `assets/`（静的ファイル）に分けることで、コンテキストウィンドウを効率的に利用する
- **SKILL.md 500行以内制限**: スキルファイルは500行以内に収め、詳細は参照ファイルへ段階的開示することでシステムパフォーマンスを保全する
- **導入手順**: マーケットプレイス登録→ example-skills プラグインインストール→ Claude Code 再起動（3ステップ）

## NOCTAへの関連メモ

NOCTA の全スキルに description フィールドを追加済みで、このガイドのベストプラクティスと一致。「SKILL.md 500行以内」は NOCTA の一部スキル（best-practices-review 等）が超過している可能性があり要確認。skill-creator を使えば新スキル（例: /phase5-golive の改善版）を対話的に自動生成できる。3層リソース構造は現在 NOCTA のスキルには未適用のため、複雑なスキルを追加する際の設計指針になる。
