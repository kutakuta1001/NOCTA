---
title: "Agent SDK 一般公開: カスタムエージェント構築・独自オーケストレーション対応"
url: "https://code.claude.com/docs/ja/overview"
date: "2026-04-18"
domain: "code.claude.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約（3〜5行）
Claude Code の Agent SDK が一般公開（GA）された。Claude Code が持つツール群（Bash・ファイル操作・WebFetch 等）を活用したカスタムエージェントを、独自のオーケストレーションロジックや権限設定で構築できる。既存の Agent Teams パターンを超えた高度な自動化が可能になる。

## 主なポイント
- Agent SDK が GA（一般公開）に移行
- Claude Code のツールをベースにカスタムエージェントを独自設計可能
- 独自のオーケストレーション・権限モデルを持てる
- 既存の Agent Teams（subagent 利用）とは別に、より低レベルな制御が可能

## NOCTAへの関連メモ
現在の NOCTA Agent Teams（/phase2-music・/phase4-release）は Claude Code の組み込み subagent 機能で十分。Agent SDK は将来的に handoff 自動化や承認ゲート管理エージェントの独自実装時に検討価値がある。
