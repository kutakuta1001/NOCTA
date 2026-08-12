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
   - **認証フォールバック**: 終了コードが 75、または出力に `CODEX_AUTH_FAILED` が含まれる場合、ChatGPT Plus 連携が切れている。**勝手に従量課金へ切り替えず、必ずユーザーに確認する**: 「ChatGPT Plus 連携が切れています。`codex login` で再ログインしますか、それとも今回はAPI従量課金（CODEX_AUTH=apikey）で実行しますか？」
   - ユーザーが従量課金を承認した場合のみ `CODEX_AUTH=apikey ~/.claude/scripts/codex-review.sh plan "$ARGUMENTS"` で再実行する
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
