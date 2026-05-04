---
title: "LLMの限界を突破する『AIエージェントの記憶』：2026年最前線論文と世界覇権争いから読み解くアーキテクチャの全貌"
url: "https://note.com/betaitohuman/n/nffecc168f4d3"
date: "2026-05-04"
domain: "note.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
AIエージェントが「応答するマシン」から「経験から学び続ける認知的エンティティ」へ変貌するためのエージェントメモリ技術を解剖するサーベイ記事。
「ステートレス性の呪縛」という根本的アーキテクチャ欠陥を指摘し、RAGとは異なる「時間的連続性」を持つメモリの必要性を論じる。
arxiv 2512.13564 "Memory in the Age of AI Agents"論文をベースに、形態×機能×動態の3次元フレームワークで整理している。

## 主なポイント
- ステートレス性の克服が現世代AIの最大課題。記憶を忘れるアーキテクチャは「欠陥」として再定義される
- 3次元分類: 形態（トークン/パラメトリック/潜在）× 機能（事実/経験/ワーキング）× 動態（形成/進化/検索）
- CompassMem・MAGMA・Mem0・Titans・AgentOS等が次世代エージェントメモリの主要実装
- RAGは「検索の効率化」だがエージェントメモリは「経験の蓄積」と明確に区別

## NOCTAへの関連メモ
Claude CodeのAuto-memory（`~/.claude/projects/.../memory/`）設計の理論的裏付けとなる記事。NOCTAが既に実践している「記憶の3分類（feedback/project/reference/user）」は論文の機能分類と対応しており、設計方針の正当性が確認できる。
