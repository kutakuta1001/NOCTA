---
title: "Claude Code概要 — Dispatch機能: モバイルからデスクトップセッションへタスク送信"
url: "https://docs.anthropic.com/ja/docs/claude-code/overview"
date: "2026-04-25"
domain: "docs.anthropic.com"
tags: [best-practices, anthropic, claude-code, source:manual]
---

## 要約（3〜5行）
Dispatch機能を使うと、モバイルデバイスから稼働中のデスクトップセッションへタスクをプッシュできる。
外出先でスマートフォンからSNS投稿文の生成・handoff更新・簡単な調査タスクを指示し、帰宅後に結果を確認するワークフローが可能。

## 主なポイント
- モバイル（iOS/Android）からデスクトップClaude Codeセッションへタスクを非同期送信
- デスクトップ側のセッションが稼働中である必要がある
- /teleport・/desktopとセットで「マルチデバイスシームレスワークフロー」を構成する

## NOCTAへの関連メモ
外出中にスマートフォンで楽曲タイトル案や歌詞メモをDispatchで送信→スタジオのデスクトップで結果を受け取る、という非同期制作ワークフローが構築できる。SNS投稿文のドラフト依頼も移動中に送れる。インスピレーション捕捉の速度が上がる。
