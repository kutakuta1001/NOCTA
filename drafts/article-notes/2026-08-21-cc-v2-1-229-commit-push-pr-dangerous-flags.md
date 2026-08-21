---
title: "Claude Code v2.1.229 — /commit-push-pr で危険フラグが自動承認されなくなった"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-08-21"
domain: "github.com"
tags: [best-practices, claude-code, security, source:manual]
---

## 要約

v2.1.229 で、バンドルスキル `/commit-push-pr` の挙動が変更された。
危険なフラグ（`--force`・`--amend`・`--no-verify` 等）を伴う git / gh コマンドが自動承認されなくなり、
個別の承認を要するようになった。

## 主なポイント

- これは「修正・仕様変更の報告」であり、危険なコマンドの実行を勧める内容ではない
- バンドルスキルが暗黙に持っていた自動承認の範囲が狭まった。安全側への変更
- 同バージョンでは、ワークフローのファンアウトが同一プレフィックスの兄弟エージェントをずらしてプロンプトキャッシュを再利用する改善も入った

## NOCTAへの関連メモ

NOCTA は `~/.claude/settings.json` の `permissions.deny` で `git push --force` / `git reset --hard` /
`git clean -f` / `git rebase` を実行不可にしており、この変更より厳しい状態を既に維持している。
git 運用の変更提案にあたるため、レポートでは要注意項目として分離する。
