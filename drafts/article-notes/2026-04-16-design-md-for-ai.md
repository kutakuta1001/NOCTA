---
title: "非デザイナーがDESIGN.mdを使ったら、Apple風LPと楽天風ECが2分でできた話"
url: "https://x.com/i/status/2042237392510484504"
date: "2026-04-16"
domain: "x.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
DESIGN.md（デザインルールをMarkdown1枚にまとめたファイル）をClaude Codeに渡すだけで、指定ブランド風のLPが2分で生成できるという実証記事。Googleが自社ツールStitchでDESIGN.mdを推進したことで世界的に普及中。Apple・Airbnb・LinearなどのDESIGN.mdがOSSで公開されており、getdesign.mdで取得可能。

## 主なポイント
- DESIGN.md = 色・フォント・余白・コンポーネントルールをMarkdown1枚に集約したファイル
- getdesign.md でApple/Airbnb/Linearなど主要ブランドのDESIGN.mdを取得可能
- awesome-design-md（github.com/VoltAgent/awesome-design-md）: 英語ブランド版
- awesome-design-md-jp（github.com/kzhrknt/awesome-design-md-jp）: 日本語UI向け（SmartHR/freee/note/メルカリ等）
- 手順: DESIGN.mdをプロジェクトフォルダに置く → 「このDESIGN.mdをもとにLPを作って」だけ
- 制限: 動的コンポーネント・アニメーションはカバー外。本物そっくりにはならない

## NOCTAへの関連メモ
NOCTAのHP管理（website/CLAUDE.md）において、独自ブランドのDESIGN.mdを作成すると新しいページやセクション追加時の一貫性が向上する。現在はindex.htmlにTailwindクラスで直接スタイルを定義しているが、DESIGN.mdを一枚置くことで将来のLPや楽曲専用ページ制作を効率化できる。
