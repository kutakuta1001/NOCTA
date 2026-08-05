---
title: "[changelog v2.1.221] バックグラウンドセッションが作業保全のため自動で commit/push するよう変更"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-08-05"
domain: "github.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.221 でバックグラウンドセッションの終了時挙動が変わり、作業を失わないために自動でコミットと push を行うようになった。draft PR はタスクが必要とする場合のみ作成し、CLAUDE.md に書かれた git 指示には従う。最後に必ず「作業がどこにあるか」を報告して終わる。

## 主なポイント
- バックグラウンドセッションは作業保全のため commit と push を既定で実行する
- CLAUDE.md の git 指示は尊重されるが、「push しない」という指示が明示されていなければ push される
- draft PR の作成はタスク次第（常時ではない）
- 終了時に成果物の場所を必ず報告する

## NOCTAへの関連メモ
NOCTA では `main` への push が GitHub Actions を起動して本番サイト（GitHub Pages）を更新する。`website/` を触るバックグラウンドセッションが走ると CEO 確認前にサイトが公開更新される経路になるため、website/CLAUDE.md に「バックグラウンドセッションでも push しない」を明記するか、website 作業にバックグラウンドセッションを使わない運用が必要。同日の /web-practices-review で「hooks による自動 push は採用しない」と結論した直後に、Claude Code 側が既定でそれを行う仕様になっていた点に注意。
