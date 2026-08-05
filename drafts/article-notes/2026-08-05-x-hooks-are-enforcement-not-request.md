---
title: "@ClaudeCode_aca のツイート — Hooks は「お願い」ではなく「強制」。CLAUDE.md のルールは「だいたい」しか守られない"
url: "https://x.com/ClaudeCode_aca/status/2083145653627363709"
date: "2026-08-05"
domain: "x.com"
tags: [best-practices, claude-code, source:xmcp]
---

## 要約（3〜5行）
CLAUDE.md を作っただけで止まっている人がほとんどだという指摘。CLAUDE.md のルールは「だいたい」守られるが、Hooks は100%確実に実行される、という対比が主旨。加えて `.claudeignore` による機密ファイル除外、許可設定の3段階運用、MCP による外部連携を挙げている。いいね50・リポスト8・ブックマーク53。

## 主なポイント
- CLAUDE.md = 確率的に守られる指示 / Hooks = 決定論的に実行される強制
- `.claudeignore` で機密ファイルをコンテキストから除外できる
- 許可設定は3段階で運用する
- 公式ベストプラクティスの「例外なしで毎回発生する必要があるアクションには hooks を使う」と一致

## NOCTAへの関連メモ
NOCTA の R-01〜R-15 はすべて CLAUDE.md 上の論理ルールで、hooks による強制はゼロ。特に R-02（approved/ には触れない）と R-03（SNS を自動投稿しない）は破られたときの被害が大きいのに、確率的な遵守に依存している。`permissions.deny` には破壊的 git と `rm -rf` が入っているが approved/ への Write は入っていない。「被害が不可逆なルールだけ hooks / deny に降ろす」という切り分けが、CLAUDE.md スリム化と同時にやるべき作業として見えてくる（ルールを消すのではなく実効性のある層へ移す）。
