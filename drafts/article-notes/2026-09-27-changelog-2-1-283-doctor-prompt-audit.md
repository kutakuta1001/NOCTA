---
title: "Claude Code CHANGELOG v2.1.283 — /doctor prompt-audit で CLAUDE.md・スキル・エージェントを監査"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-09-27"
domain: "github.com"
tags: [best-practices, claude-code, changelog, skills, source:manual]
---

## 要約（3〜5行）
`/doctor prompt-audit`（`/checkup prompt-audit` も同じ）が追加された。CLAUDE.md・スキル・エージェント・コマンドを走査し、
旧モデル向けに書かれたプロンプト記法、存在しないパス、存在しないコマンド、互いに矛盾する指示を報告する。
2026-08-05 に `claude-api` スキルの `prompt-audit` サブコマンドとして収集したものが、設定全体を対象にする本体機能になった。

## 主なポイント
- 古いパス・古いコマンド・矛盾する指示ファイルがレポートの先頭に出る（v2.1.283 の改善）
- Claude Code が公式に文書化している thinking キーワードは誤検知しない
- 対象は CLAUDE.md ファイル群・スキル・エージェント・コマンド。NOCTA の `~/.claude/commands/` 60本超と `agents/` 30体超がそのまま入力になる
- 同バージョンで `/context` が MCP サーバー instructions を独立行で計上するようになった

## NOCTAへの関連メモ
スキル設計節の「6ヶ月ごとにゼロベースで見直す（次回 2027-02）」の入力に使える。前回収集時は未実行のまま。
`/skill-doctor`（未使用スキルの可視化）と組み合わせると、剪定と記法更新を同じ回で片付けられる。
