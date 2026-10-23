---
title: "Best practices for Claude Code（code.claude.com）"
url: "https://code.claude.com/docs/en/best-practices"
date: "2026-10-24"
domain: "code.claude.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約（3〜5行）
公式ベストプラクティスの更新点。auto mode が全プランで組み込みの開始権限モードになり、検証の強さが4段で整理され、敵対的レビューの過剰設計への注意と、`/doctor` による CLAUDE.md 削除案が追記された。

## 主なポイント
- v2.1.283 以降、auto mode が全プランで対話ターミナル・VS Code の開始権限モード
- 検証の4段: 1プロンプト内 → `/goal` 条件 → Stop hook → 検証サブエージェント / 動的ワークフロー。`/verify` で動作中のアプリを確認
- 敵対的レビューは頼めば何か見つけるため、正しさと要件に関わる穴だけを挙げさせ、残りは任意扱いにする
- git 管理下の CLAUDE.md に `/doctor` を実行するとコードから導ける内容の削除案を出す

## NOCTAへの関連メモ
/persona-review・/codex-review の指示文と、2027-02 のゼロベース見直しに直接使える。
