---
title: "Message Batches API のベータヘッダで最大300k出力トークン"
url: "https://platform.claude.com/docs/ja/docs/about-claude/models"
date: "2026-08-21"
domain: "platform.claude.com"
tags: [best-practices, source:manual]
---

## 要約

公式モデル一覧の注記によると、比較表の最大出力値（Opus 5 / Sonnet 5 は128kトークン）は
同期 Messages API に適用される値である。
Message Batches API では `output-300k-2026-03-24` ベータヘッダを使うことで、
Opus 5・Opus 4.8・Opus 4.7・Opus 4.6・Sonnet 5・Sonnet 4.6 が最大300k出力トークンをサポートする。

## 主なポイント

- 同期 API の128kは上限ではなく、バッチ処理では300kまで引き上げられる
- 対象は Opus 4.6 以降と Sonnet 4.6 以降。Haiku 4.5 は含まれない
- ベータヘッダの日付付き識別子（`2026-03-24`）を明示的に指定する必要がある

## NOCTAへの関連メモ

R-09 は「出力が64k tokens超見込みのタスク」を Opus 5 への切替通知が必要な場面に挙げている。
Claude Code での作業では同期 API の128k上限が効くため、大量出力を1回で得る設計は避け、
分割して出力する現行の方針（差分・追記を優先）が妥当だと裏付けられる。
