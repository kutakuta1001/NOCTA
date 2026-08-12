---
title: "@DanKornas のツイート — 長時間セッションの文脈喪失対策テンプレ集（settings / hooks / slash commands / CLAUDE.md）"
url: "https://x.com/DanKornas/status/2085449811923283976"
date: "2026-08-12"
domain: "x.com"
tags: [best-practices, claude-code, source:xmcp]
---

## 要約（3〜5行）
長い Claude Code セッションは、指示と決定事項がチャット間で保持されない限りプロジェクトの文脈を失う、という問題設定。それに対してスターター設定・hooks・スラッシュコマンド・CLAUDE.md テンプレートを提供するリポジトリの紹介。利用者はリポジトリのファイルをプロジェクトへコピーする。いいね18・リポスト5・ブックマーク29。

## 主なポイント
- 問題は「指示と決定がチャット間で保持されないこと」
- 対策セットは settings / hooks / slash commands / CLAUDE.md の4点
- 導入方法はファイルをプロジェクトへコピーする方式

## NOCTAへの関連メモ
NOCTA はこの4点をすべて自前で整備済み（settings.json・hooks 3本・スキル51本・CLAUDE.md 正本）なので、テンプレート自体の必要性はない。ただし「決定事項の保持」という観点では NOCTA には固有の仕組みがある: handoff.md（1〜3行の完了事実と次アクション）と auto-memory（14件）と SDD の ledger。今回のスリム化作業では ledger が実際に「どのタスクで何を裁定したか」の記録として機能し、コンパクションを跨いだ復旧地図になった。テンプレより NOCTA の既存3層の方が用途が明確。
