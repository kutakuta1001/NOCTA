---
description: Codex CLI で未コミット差分をコードレビューする（コミット前の最終チェック）
allowed-tools: Bash
---

# /codex-diff — コードレビュー by Codex CLI

未コミットの変更（`git diff HEAD`）を Codex CLI にレビューさせ、結果を要約してください。

## 手順

1. `~/.claude/scripts/codex-review.sh diff` を Bash で実行する（既定で ChatGPT Plus 連携を使う）
   - **失敗時は従量課金へ切り替えない（定額のみの方針・2026-09-12 決定）。** スクリプトが定額枠のモデルを順に試したうえで停止しているため、`CODEX_AUTH=apikey` での再実行を提案してはならない（提案してもスクリプトが拒否する）
   - 終了コード 75 または出力に `CODEX_AUTH_FAILED` が含まれる場合、ユーザーに次を伝えて判断を仰ぐ: 「Codex の定額枠で使えるモデルがありませんでした。`npm install -g @openai/codex@latest` で CLI を更新するか、`codex login` で再ログインしてください。今回は Claude 側（Opus 5 / `/persona-review`）でレビューを代替できます」
2. Codex の出力を読む
3. 🔴 Critical は**必ず修正してからコミット**。該当箇所を Edit で修正する
4. 🟡 Warning は採否を判断。採用なら修正、却下なら理由を残す
5. 🟢 Nit は時間があれば対応
6. 修正が終わったら再度 `/codex-diff` で再チェックするか、コミットに進む

## 出力フォーマット

```
## Codex レビュー結果サマリー
- 🔴 Critical: <件数>
- 🟡 Warning: <件数>
- 🟢 Nit: <件数>

## 対応プラン
1. **[Critical]** <file:line> — <修正内容>
2. **[Warning]** <file:line> — <採否と対応>
3. ...

→ この順に修正してよいですか？
```

## 注意

- Critical がある場合は**絶対にコミット前に修正**。未修正のままコミットしない
- Codex の指摘が明らかに間違っている場合はユーザーに確認
- 修正後に再度 /codex-diff でもう一度確認するのを推奨
