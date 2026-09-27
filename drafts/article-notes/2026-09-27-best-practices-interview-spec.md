---
title: "Claude Code ベストプラクティス — Claude にインタビューさせて SPEC.md を書かせる"
url: "https://code.claude.com/docs/ja/best-practices"
date: "2026-09-27"
domain: "code.claude.com"
tags: [best-practices, claude-code, workflow, source:manual]
---

## 要約（3〜5行）
「効果的にコミュニケーションする」節に「Claude にあなたにインタビューさせる」が加わった。大きな機能では最小限のプロンプトで始め、
AskUserQuestion ツールで技術実装・UI/UX・エッジケース・トレードオフを深掘りさせ、全部カバーしたら SPEC.md に仕様を書かせる。
仕様ができたら新しいセッションで実装する。仕様は関連ファイルとインターフェースを名指しし、スコープ外を述べ、E2E 検証手順で終わるのが最も有用。

## 主なポイント
- 推奨プロンプト: 「[概要]を作りたい。AskUserQuestion で詳細にインタビューして。明白な質問はせず、考えていない難所を掘って。全部カバーしたら SPEC.md に書いて」
- 実装は新セッションで行い、クリーンなコンテキストと書かれた仕様を参照させる
- 仕様を正確にする時間は、実装を見守る時間より見返りが大きい
- Plan Mode の `Ctrl+G` で計画をエディタで直接編集してから進めることもできる

## NOCTAへの関連メモ
R-14 の `/brainstorm`（各フェーズ開始前に対話して合意）と同じ思想の公式版。違いは「仕様をファイルに落として新セッションで実装する」点。
NOCTA の brainstorm は合意を handoff.md に残すが、`docs/superpowers/specs/` に SPEC 形式で残せば `/phase2-music` の入力精度が上がる。
