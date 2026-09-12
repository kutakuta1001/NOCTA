---
description: Codex CLI で計画書の設計レビューを実行する（バグ・セキュリティ・保守性を第三者視点で指摘）
argument-hint: <plan-file-path>
allowed-tools: Bash
---

# /codex-review — 設計レビュー by Codex CLI

引数で指定された計画書ファイルを Codex CLI にレビューさせ、結果を要約してください。

**入力**: `$ARGUMENTS` （計画書のパス、例: `docs/superpowers/plans/2026-04-18-seeds-m1-fts5.md`）

## 手順

1. `~/.claude/scripts/codex-review.sh plan "$ARGUMENTS"` を Bash で実行する（既定で ChatGPT Plus 連携を使う）
   - **失敗時は従量課金へ切り替えない（定額のみの方針・2026-09-12 決定）。** スクリプトが定額枠のモデルを順に試したうえで停止しているため、`CODEX_AUTH=apikey` での再実行を提案してはならない（提案してもスクリプトが拒否する）
   - 終了コード 75 または出力に `CODEX_AUTH_FAILED` が含まれる場合、ユーザーに次を伝えて判断を仰ぐ: 「Codex の定額枠で使えるモデルがありませんでした。`npm install -g @openai/codex@latest` で CLI を更新するか、`codex login` で再ログインしてください。今回は Claude 側（Opus 5 / `/persona-review`）でレビューを代替できます」
2. Codex が出力した指摘を読む
3. 🔴 Critical の指摘は必ず計画書に反映する案を提示する
4. 🟡 Warning は採否を判断して理由を添えて提案する
5. 🟢 Nit は軽く触れるだけで良い
6. 最終的な反映方針をユーザーに確認してから計画書を編集する

## 出力フォーマット

```
## Codex レビュー結果サマリー
- 🔴 Critical: <件数> — <主な指摘>
- 🟡 Warning: <件数> — <主な指摘>
- 🟢 Nit: <件数>

## 反映方針
1. <採用する指摘と対応案>
2. ...

## 却下する指摘と理由
- <指摘> — <なぜ採用しないか>

→ この方針で計画書を更新してよいですか？
```

## 注意

- Codex CLI の出力が長い場合は要点だけ抜粋
- 単なる好みの違いはスルーして良い
- 計画書が間違っていない前提で食い違う場合は、ユーザーに判断を仰ぐ
