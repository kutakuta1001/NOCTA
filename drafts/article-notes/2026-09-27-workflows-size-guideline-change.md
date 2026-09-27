---
title: "Claude Code 動的ワークフロー — 規模目安が medium 10未満に変更、Pro は small が既定"
url: "https://code.claude.com/docs/ja/workflows"
date: "2026-09-27"
domain: "code.claude.com"
tags: [best-practices, claude-code, workflows, cost, source:manual]
---

## 要約（3〜5行）
サイズガイドラインの既定と値が変わった。既定は medium（v2.1.219 以前は unrestricted）、v2.1.271 以降 Pro プランでは small。
medium の目安は15から10エージェント未満に下がった。small は5未満、large は50未満、unrestricted は目安なし。
`/config workflowSizeGuideline=small` か settings の `workflowSizeGuideline` で固定でき、settings 側が `/config` より優先される。

## 主なポイント
- ガイドラインは上限ではなく助言。プロンプトで別の規模を求めれば上書きされる
- 自分で値を選ぶとそのエージェント数が「Large workflow」警告の閾値25を置き換える
- ランタイム上限（同時16・1実行1,000エージェント・parallel/pipeline 1呼び出し4,096件）は設定に関係なく適用
- 同時エージェント数は `CLAUDE_CODE_WORKFLOW_MAX_CONCURRENT_AGENTS`（1〜256・v2.1.269）で変更可

## NOCTAへの関連メモ
2026-08-05 に旧値（既定 unrestricted・medium 15）で収集済み。本セッションの案内も「medium — 10エージェント未満」になっている。
COST POLICY の「動的ワークフローは CEO が明示的に要求した場合のみ」は変わらないが、使う場合の規模感を10未満で見積もる。
