---
title: "Claude Code CHANGELOG v2.1.280 — Pro / Team の既定モデルが Opus に・effort はモデル別保存"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-09-27"
domain: "github.com"
tags: [best-practices, claude-code, changelog, cost, source:manual]
---

## 要約（3〜5行）
Pro と Team Standard プランの既定モデルが Sonnet から Opus に変わり、Max / Team Premium / Enterprise と揃った。
あわせて `/effort` の保存がモデル別になり、モデル別化される前に保存した値は Opus 5.5 のような新モデルに適用されない。
Opus 4.7 / 4.8 / Fable 5 が launch 既定 effort を `/effort` より優先していた挙動も廃止された。

## 主なポイント
- 既定モデルが Opus になったため、意識せず Sonnet を使っていた作業のコストが上がる可能性がある
- 新モデルは選ぶまで既定 effort で始まる。Opus 5.5 は medium、Fable 5.1 / Sonnet 5 は high
- `-p` / Agent SDK / プロジェクト設定の `effortLevel` / モデル別レベルが、旧モデルの launch 既定に負けなくなった
- v2.1.267 で `effort:` frontmatter がコマンド・スキル・サブエージェントで効くようになった修正と合わせて、effort はスキル単位で宣言できる

## NOCTAへの関連メモ
G-01 の「単純タスクは low、標準は high、最重要は xhigh」は `/effort` の手動切替を前提にしている。
モデルを Opus 5.5 に切り替えた瞬間に medium へ戻るため、スキルの frontmatter に `effort:` を書くか、
`/effort high` を一度打ち直す運用にしないと意図した推論深さにならない。
