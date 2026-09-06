---
title: "Claude Code CHANGELOG v2.1.260 — パスに括弧を含む権限ルールが無視される不具合を修正"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-09-06"
domain: "github.com"
tags: [best-practices, claude-code, changelog, security, source:manual]
---

## 要約（3〜5行）
パスに括弧を含む `Edit` / `Write` / `Read` の権限ルールが「無効」として落とされ、
read-only を意図したフォルダが実際には書き込み可能になっていた不具合が修正された。
あわせて、コンパイル不能なパターン（閉じられていない `[` など）を1つ含むと
すべてのファイル編集が `Invalid regular expression` で失敗する問題も修正された。

## 主なポイント
- 症状は「deny ルールを書いたのに効いていない」という静かな失敗で、気づきにくい
- 閉じ括弧の後にテキストがあるルール（`Bash(ls) x` など）は無効設定として報告されるようになった
- Windows 形式の `Edit(C:\dir\(name)\**)` は `\(` がエスケープされた括弧として読まれるため、曖昧さのない書き方を提案するエラーが出る
- deny ルール1つの書式ミスが全体を壊しうるという構造は残っている

## NOCTAへの関連メモ
R-02 は保護対象ディレクトリへの書き込みを `permissions.deny` の Edit ルールと `approved-guard` hook の二重で塞いでいる。
NOCTA のパスに括弧は含まれないため直接の影響はないが、
「deny ルールは書いただけでは効いているとは限らない」という前提が確認された。
CLAUDE.md スリム化検証（2026-08-12）で実セッションの deny 動作を確認したのは正しい手順だった。
