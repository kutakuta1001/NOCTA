---
title: "CHANGELOG v2.1.139 — /goalコマンド追加"
url: "https://docs.anthropic.com/ja/release-notes/claude-code"
date: "2026-05-12"
domain: "docs.anthropic.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.139で `/goal` コマンドが追加された。
セッション開始時に完了条件を設定すると、複数ターンにわたってその条件を目指してClaudeが自動継続する。
長期タスクの「ゴール管理」に活用できる新機能。

## 主なポイント
- `/goal [完了条件テキスト]` でセッション全体のゴールを設定できる
- 複数ターンにわたってゴールを目指して自動継続する
- 同バージョンで Agent View（全セッション一覧）も追加
- マウススクロール速度調整・プラグイン詳細表示・トランスクリプト改善も含む

## NOCTAへの関連メモ
/phase2-music・/phase4-releaseなど多ターンスキル実行時に `/goal` で完了条件を事前設定することで、途中でセッションが切れても再開しやすくなる。セッション運用セクションへの追記候補。
