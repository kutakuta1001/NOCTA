---
title: "[code.claude.com] 動的ワークフロー — /effort ultracode が新設（xhigh + 自動ワークフロー化）"
url: "https://code.claude.com/docs/ja/workflows"
date: "2026-08-05"
domain: "code.claude.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
`ultracode` は `xhigh` の推論努力と自動ワークフローオーケストレーションを組み合わせた設定。`/effort ultracode` でオンにすると、Claude は実質的なタスクごとにワークフローを計画し、こちらが要求するのを待たなくなる。1つのリクエストが複数のワークフロー（理解用・変更用・検証用）に分かれることもある。セッション単位で、新セッションではリセットされる。`claude --effort ultracode` で起動時から有効化も可能（v2.1.203 以降）。

## 主なポイント
- `/effort ultracode` = xhigh + 全実質タスクの自動ワークフロー化
- プロンプトにキーワード `ultracode` を含めれば単発タスクだけワークフロー化できる（effort は変えない）
- 「ワークフローを使う」等の自然言語リクエストも同じオプトインとして扱われる
- 各リクエストのトークン消費と所要時間は低い effort より大きくなる
- ルーチンワークに戻るときは `/effort high` に落とす
- ultracode がオンのセッションは「Large workflow」警告を表示しない（既に大規模実行にオプトイン済みとみなされる）
- `/config` の Ultracode キーワードトリガーでキーワード発動を無効化できる

## NOCTAへの関連メモ
CLAUDE.md とグローバル CLAUDE.md は `/effort` の水準を low / medium / high / xhigh の4段階として記載しており、ultracode が抜けている。NOCTA でコスト最重視の運用をしている以上、「ultracode は既定では使わない」を明示しておく方が安全（キーワード `ultracode` を含む文章を書くだけで発動しうるため、意図しない大規模実行の入口になる）。逆に CLAUDE.md スリム化の一括適用や website 全体の監査など、対象が多く機械的な作業には適合する。
