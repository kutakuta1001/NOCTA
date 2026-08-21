---
title: "スキルの disable-model-invocation で手動トリガー限定にする"
url: "https://code.claude.com/docs/ja/best-practices"
date: "2026-08-21"
domain: "code.claude.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約

公式ベストプラクティスによると、スキルの frontmatter に `disable-model-invocation: true` を書くと
Claude が状況に応じて自動的に呼び出すことをやめ、ユーザーが `/skill-name` で明示的に起動したときだけ実行される。
副作用のあるワークフローで手動トリガーしたい場合に使う、と説明されている。

## 主なポイント

- スキルは既定では「関連するとき Claude が自動適用する」。副作用があるものは自動起動されると困る
- CLAUDE.md の文章による禁止（「〜まで実行しない」）は指示だが、この設定は機構による保証に近い
- 公式は「フックは決定論的であり、アクションが発生することを保証する」と対比している。同じ発想の予防側

## NOCTAへの関連メモ

R-12 は「CEO が『アレンジOKです』と明示するまで `/phase2-svp` を実行しない」と文章で定めている。
`disable-model-invocation: true` を `phase2-svp` の SKILL.md に付ければ、
モデルの自動起動そのものを封じられる。同じ性質のスキル（phase5-golive・blog-publish・song-finish 等）も候補。
