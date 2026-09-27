---
title: "Claude Code ベストプラクティス — auto mode が Pro / Max / Team の既定開始権限モードに"
url: "https://code.claude.com/docs/ja/best-practices"
date: "2026-09-27"
domain: "code.claude.com"
tags: [best-practices, claude-code, permissions, source:manual]
---

## 要約（3〜5行）
権限設定の節が更新され、Pro / Max / Team プランでは auto mode が対話ターミナルと VS Code の組み込み開始権限モードになった。
別の分類器モデルがほとんどの操作をレビューし、スコープ逸脱・未知のインフラ・敵対的コンテンツ由来の操作だけをブロックする。
他プランは Manual モード。Manual でも auto でも、権限ホワイトリストとサンドボックスで中断を減らせる。

## 主なポイント
- auto mode は v2.1.283 でテレメトリ無効 / サードパーティプロバイダの対話セッションでも既定になった（`permissions.defaultMode` が優先）
- 分類器はサーバー側実行が既定（`CLAUDE_CODE_AUTO_MODE_SERVER=0` で opt out）
- auto mode の拒否メッセージはブロックしたルール名を含み、「別の安全な方法を試して無関係な作業を終えてから聞く」よう Claude に促す
- `/insights` に「auto mode なら何回の権限プロンプトを処理できたか」の推定が出る（v2.1.281）

## NOCTAへの関連メモ
NOCTA は bypassPermissions を user settings に置いている（dontAsk は auto-deny なので不可）。auto mode は「分類器が危険だけ止める」中間案で、
approved-guard hook と deny ルールを残したまま bypass から auto に下げる選択肢になる。ただし分類器のブロックが xmcp や FFmpeg 操作に
どう作用するかは試してから判断する必要がある。
