---
title: "Claude Code CHANGELOG v2.1.271 — omitClaudeMd でサブエージェントを CLAUDE.md なしで起動"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-09-27"
domain: "github.com"
tags: [best-practices, claude-code, changelog, subagents, source:manual]
---

## 要約（3〜5行）
エージェント定義の frontmatter と `--agents` JSON に `omitClaudeMd` が追加された。
指定したカスタム / プラグインサブエージェントは user・project・local の CLAUDE.md を読まずに起動する（managed policy は読む）。
同バージョンで動的ワークフローが使用制限到達時に一時停止→自動再開するようになり、medium の規模目安が15→10エージェントに下がった。

## 主なポイント
- `omitClaudeMd: true` で CLAUDE.md 3層（グローバル・プロジェクト・正本）をサブエージェントのプロンプトから外せる
- auto mode ではサブエージェントの報告が専用の hand-back 呼び出しとして分類器レビューを受けるようになった
- Monitor の監視は必ず期限付き（最大30分・`-p` は10分）に変更
- 動的ワークフローの既定サイズは Pro で small、medium は10エージェント未満

## NOCTAへの関連メモ
NOCTA のエージェントは reviewer 6体・designer 3体・director 3体など役割が閉じたものが多い。これらは CLAUDE.md の
承認ゲート表や git 運用を読む必要がなく、`omitClaudeMd` で1体あたり数千トークンを削れる。
ただし R-02 / R-03 / R-04 の禁止事項は CLAUDE.md 経由で伝わっているため、外す場合は各エージェント定義に必要な禁止事項を明記してから。
