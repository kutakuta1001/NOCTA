---
title: "@lucianlamp のツイート"
url: "https://x.com/lucianlamp/status/2042495111578460422"
date: "2026-04-13"
domain: "x.com"
tags: [best-practices, claude-code, source:xmcp]
---

## 要約（3〜5行）
Superpowers スキルを Claude Code ワークフローに組み込み、CLAUDE.md で subagent の挙動を制御する実践例（日本語）。コーディング処理は GLM5.1、各種レビューは Codex に外部委託。Claude はオーケストレーター、Claude Code はハーネスとして機能させる構成。

## 主なポイント
- CLAUDE.md で subagent driven スキルの動作ポリシーを定義できる
- モデル別役割分担: GLM5.1（コーディング）/ Codex（レビュー）/ Claude（オーケストレーター）
- Claude Code はハーネス（実行基盤）として機能し、他モデルへの委託が可能

## NOCTAへの関連メモ
NOCTA の R-09 はモデル選択をHaiku/Sonnet/Opus に限定しているが、外部モデル（Codex等）への委託パターンは将来的な拡張候補。コスト削減または特定タスクの専門化が必要になった際に検討余地がある。
