---
title: "[changelog v2.1.221] zsh の [[ ]] 正規表現条件式で Bash ツールの権限チェックを回避できる脆弱性を修正"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-08-05"
domain: "github.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.221 で、zsh の `[[ ]]` 正規表現条件式の中に隠したコマンドが Bash ツールの権限チェックを通らずに実行できる問題を修正した。該当するコマンドは権限プロンプトを表示するようになった。同バージョンでは Windows の PowerShell 側でも、クォート文字を含むパスの権限チェック不備が修正されている。

## 主なポイント
- zsh の `[[ ]]` 内に隠れたコマンドが権限チェックをすり抜けていた
- 修正後は該当コマンドが必ず承認プロンプトを出す
- 同種の修正が PowerShell（Windows・パス内クォート）にも入っている
- v2.1.221 未満のバージョンは影響を受ける

## NOCTAへの関連メモ
CEO 環境のシェルは zsh なので直接該当する。NOCTA は `permissions.deny` に `rm -rf` / `git push --force` / `git reset --hard` / `git clean -f` / `git rebase` を設定してハード的に守っているが、この経路はそのガードを回り込める可能性があった。アップデートが最優先（deny リストの前提そのものが崩れる種類の不備）。
