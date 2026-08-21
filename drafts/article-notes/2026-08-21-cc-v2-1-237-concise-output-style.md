---
title: "Claude Code v2.1.237 — 組み込み出力スタイル Concise の追加"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-08-21"
domain: "github.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約

v2.1.237 で組み込み出力スタイル「Concise」が追加された。
結果から述べ、前置きとナレーションを省く一方、作業自体は同じ徹底度で行うと説明されている。
`/config` の Output style から選択する。

## 主なポイント

- 「作業の質は変えず、報告の冗長さだけを削る」という位置づけ。省力版ではない
- 出力トークンが減るためコストにも効く。長い報告が多い運用では差が出る
- カスタム出力スタイル・プロジェクト出力スタイルが会話中に既定の語調へ戻る不具合も同バージョンで修正された

## NOCTAへの関連メモ

NOCTA のルールは R-06（handoff.md は1〜3行）・R-08（ドキュメントに絵文字を使わない）と簡潔さを志向している。
Concise はこの方向と一致するため、既定スタイルとして試す価値がある。
ただし G-06 の納品デブリーフ（盲点・判断理由・比較示唆）は分量を要するため、両立するかは実地確認が必要。
