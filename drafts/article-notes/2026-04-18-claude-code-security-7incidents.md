---
title: "Claude Codeのセキュリティ事故7選と防止策"
url: "https://qiita.com/masa_ClaudeCodeLab/items/8c22966fbd3c125c53dc"
date: "2026-04-18"
domain: "qiita.com"
tags: [best-practices, qiita, claude-code, source:manual]
---

## 要約（3〜5行）
Claude Code の実際のセキュリティ事故7事例（.env 流出・本番DB削除・全ファイル消失・認証情報ログ漏洩・API無限ループ課金・強制プッシュによるコミット消失・過度な権限付与）と具体的な防止策をまとめた Qiita 記事。「事故の多くはAIの暴走ではなくセキュリティ設定の後回しが原因」が主旨。

## 主なポイント
- `.env` の `.gitignore` 設定 + Gitフックで流出防止
- `settings.json` の `permissions.deny` で `rm -rf` 等の危険コマンドを拒否
- APIリトライには指数バックオフ + 最大試行回数設定
- `git push --force` の代わりに `--force-with-lease` を推奨
- 最小権限の原則（必要なロールのみ付与）
- 30分の初期設定で大きな事故を防げる

## NOCTAへの関連メモ
CLAUDE.md セキュリティ設定（Deny リスト）との照合推奨。現在の Deny リスト（`git push --force` / `rm -rf` 等）は記事の推奨内容と一致している。API無限ループ防止（/phase2-music の Agent Teams コスト制御）や .env 管理の再確認に活用できる。
