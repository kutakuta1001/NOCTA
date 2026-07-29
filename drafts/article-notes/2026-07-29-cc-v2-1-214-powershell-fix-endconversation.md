---
title: "[changelog v2.1.214] Windows PowerShell 権限バイパス脆弱性修正・EndConversation 追加"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-07-29"
domain: "github.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
v2.1.214 で Windows PowerShell の権限チェックをバイパスできる脆弱性が修正された（要アップデート）。また EndConversation ツールが追加された。

## 主なポイント
- Windows 環境では v2.1.214 以降への更新が必須（権限チェックバイパスの修正）
- macOS ネイティブインストールは自動更新のため通常は対応不要
- EndConversation ツール追加（会話終了用・限定的な用途）

## NOCTAへの関連メモ
NOCTA は macOS（Darwin）+ ネイティブインストールのため直接影響なし。セキュリティ修正が権限モデル層で続いている点は bypassPermissions 運用の再確認材料。
