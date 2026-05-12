---
title: "@Sabrina_Ramonov のツイート — 5 layers of god mode CLAUDE CODE"
url: "https://x.com/Sabrina_Ramonov/status/2051784000830595503"
date: "2026-05-12"
domain: "x.com"
tags: [best-practices, source:xmcp]
---

## 要約（3〜5行）
Claude Codeの「god mode」を5層構造で整理したツイート。
memory（CLAUDE.md）→ extensions（skills/MCPs/hooks）→ automation（scheduled prompts/recurring agents）
→ intelligence（subagents/model routing）→ pipeline の順に積み上げる設計思想を提示。
model routing で「haiku for cheap, opus for hard」という表現が端的にまとまっている。

## 主なポイント
- Layer 1 memory: CLAUDE.md によるセッション横断コンテキスト
- Layer 2 extensions: skills / MCPs / hooks
- Layer 3 automation: scheduled prompts / recurring agents
- Layer 4 intelligence: subagents + model routing（haiku cheap / opus hard）
- Layer 5 pipeline: 複数レイヤーを組み合わせたワークフロー全体

## NOCTAへの関連メモ
NOCTAはこの5層すべてを実装済み。R-09のモデルルーティング方針・スキル設計・Agent Teams構成がこのフレームワークとほぼ一致しており、現在の設計が正しい方向であることの外部検証になる。
