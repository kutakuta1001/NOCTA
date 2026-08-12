---
title: "[changelog v2.1.223] /review が /code-review のエイリアスに変更"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-08-12"
domain: "github.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.223 で `/review` が `/code-review` のエイリアスになった。`/code-review` は現在の diff または PR をレビューし、`/code-review <level> <pr#>` の形式で効力レベルと対象を指定できる。深いクラウドレビューは `/code-review ultra`。効力レベルを省略した場合は前回入力したレベルを再利用する。

## 主なポイント
- `/review` は組み込みの `/code-review` のエイリアスになった
- `/code-review ultra` でクラウドレビュー、レベル省略時は前回のレベルを踏襲
- v2.1.215 で `/verify` と `/code-review` が自動実行されなくなり明示呼び出し制になった流れの続き

## NOCTAへの関連メモ
NOCTA は `/review`（Codex CLI で計画書をレビュー）と `/review-diff`（未コミット差分をレビュー）を自作しており、`/review` が組み込みコマンドと同名衝突している。ユーザースキルが優先される可能性は高いが、`/review` を叩いたときに Codex ではなく組み込みのクラウドレビューが起動すると「ChatGPT Plus 定額での第三者レビュー」という設計意図が崩れ、Claude Code の使用枠を消費する。次に `/review` を使うときにどちらが起動するか実地確認が必要。衝突を避けるなら自作側を `/codex-review` 等へ改名する選択肢もある。
