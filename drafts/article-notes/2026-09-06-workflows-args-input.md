---
title: "動的ワークフロー — 保存したワークフローに args で入力を渡す"
url: "https://code.claude.com/docs/ja/workflows"
date: "2026-09-06"
domain: "code.claude.com"
tags: [best-practices, claude-code, workflows, source:manual]
---

## 要約（3〜5行）
保存したワークフローは `args` パラメータで入力を受け取れる。スクリプトは `args` というグローバルとして読む。
これにより、実行するたびにスクリプトを編集する代わりに、呼び出し時に調査質問・対象パスのリスト・設定オブジェクトを渡せる。
Claude はリストを構造化データとして渡すため、スクリプト側は解析なしで配列・オブジェクトメソッドを直接呼べる。
`args` が省略された場合、グローバルはスクリプト内で `undefined` になる。

## 主なポイント
- 呼び出し例: 「Run /triage-issues on issues 1024, 1025, and 1030」でリストが構造化データとして渡る
- 保存場所は `.claude/workflows/`（プロジェクト・共有）と `~/.claude/workflows/`（個人・全プロジェクト）
- 同名の場合はプロジェクトワークフローが優先される
- モノレポでは作業ディレクトリに最も近い `.claude/workflows/` のものが実行される

## NOCTAへの関連メモ
COST POLICY は「動的ワークフローは CEO が明示的に要求した場合にのみ使う」「承認ゲートを含む工程を1つのワークフローにまとめてはならない」と定めている。
`args` は「対象が多く同じ処理を繰り返す機械的作業」（COST POLICY の該当条件）を再利用可能にする仕組みで、
たとえば複数の Visual 作品の IPFS ハッシュ検証のような定型処理をワークフロー化する際に使える。
現時点で NOCTA に保存済みワークフローはない。
