---
title: "Claude Code 動的ワークフロー — 使用制限到達でランが一時停止し、リセット後に自動再開"
url: "https://code.claude.com/docs/ja/workflows"
date: "2026-09-27"
domain: "code.claude.com"
tags: [best-practices, claude-code, workflows, cost, source:manual]
---

## 要約（3〜5行）
v2.1.271 以降、ワークフローのエージェントが claude.ai の使用制限に達すると、そのエージェントを失敗させずランが一時停止する。
制限リセット直後に待機中エージェントが再実行され、ランは自動で続く。タスクパネルと `/workflows` ヘッダにリセット時刻が出る。
条件は4つ全部: 対話セッションで claude.ai サブスク・`autoContinueAtUsageLimit` オン・24時間以内にリセット・待機2回まで（3回目は失敗）。

## 主なポイント
- `claude -p` / Agent SDK / バックグラウンドセッション / Remote Control / Agent Teams のチームメイトでは一時停止せず失敗扱い
- 週次制限はリセットが24時間より先になり得るため対象外
- 待機中に `autoContinueAtUsageLimit` をオフにすると待機が終わりエージェントは失敗する
- ランの保存結果は `~/.claude/projects/` のセッションディレクトリに残り、`claude --resume` 後の再起動で再生できる

## NOCTAへの関連メモ
NOCTA の COST POLICY は Agent Teams を `/phase2-music` と `/phase4-release` の2回に限定している。ワークフローを使う場合は
対話セッションで回せば使用制限で丸ごと失敗しない。バックグラウンド運用（`claude --bg`）では失敗扱いになる点は運用ルールに書く価値がある。
