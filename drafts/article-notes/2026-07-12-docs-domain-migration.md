---
title: "ドキュメント構成 — docs.anthropic.comがplatform.claude.com/code.claude.comへ移転"
url: "https://code.claude.com/docs/ja/overview"
date: "2026-07-12"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
`docs.anthropic.com`配下のドキュメントが、API/モデル関連は`platform.claude.com`、Claude Code関連は`code.claude.com`へ301リダイレクトで移転していた。Claude Codeのリリースノートページ（`/release-notes/claude-code`）は最終的にGitHubの`CHANGELOG.md`へ307リダイレクトされる構成になっている。

## 主なポイント
- `docs.anthropic.com/*/docs/about-claude/*` → `platform.claude.com/docs/*/docs/about-claude/*`
- `docs.anthropic.com/*/docs/claude-code/*` → `code.claude.com/docs/*/*`
- `docs.anthropic.com/*/release-notes/claude-code` → `platform.claude.com/...` → 最終的に`github.com/anthropics/claude-code/blob/main/CHANGELOG.md`
- リダイレクトは自動追従可能（WebFetchは各段のリダイレクト先を提示する）

## NOCTAへの関連メモ
`/claude-docs-review`スキルに直接ハードコードされているURL（`docs.anthropic.com/ja/...`）は現状もリダイレクト経由で正常に機能するため緊急の修正は不要。ただし今後フェッチ回数を1回減らす最適化として、スキル内のURLを移転先（`platform.claude.com`・`code.claude.com`）に更新する余地がある（低優先度）。
