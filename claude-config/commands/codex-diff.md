---
description: Codex CLI で未コミット差分をコードレビューする（コミット前の最終チェック）
allowed-tools: Bash
---

# /codex-diff — コードレビュー by Codex CLI

未コミットの変更（`git diff HEAD`）を Codex CLI にレビューさせ、結果を要約してください。

## 手順

1. `~/.claude/scripts/codex-review.sh diff` を Bash で実行する（既定で ChatGPT Plus 連携を使う）
   - **認証フォールバック**: 終了コードが 75、または出力に `CODEX_AUTH_FAILED` が含まれる場合、ChatGPT Plus 連携が切れている。**勝手に従量課金へ切り替えず、必ずユーザーに確認する**: 「ChatGPT Plus 連携が切れています。`codex login` で再ログインしますか、それとも今回はAPI従量課金（CODEX_AUTH=apikey）で実行しますか？」
   - ユーザーが従量課金を承認した場合のみ `CODEX_AUTH=apikey ~/.claude/scripts/codex-review.sh diff` で再実行する
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
