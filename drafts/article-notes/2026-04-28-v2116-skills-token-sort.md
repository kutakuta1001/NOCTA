---
title: "Claude Code v2.1.116 — /skills メニューでトークン数ソート・大型セッション高速化"
url: "https://docs.anthropic.com/release-notes/claude-code"
date: "2026-04-28"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
v2.1.116 で `/skills` メニューに `t` キーによるトークン数ソート機能が追加された。
`/resume` が大型セッション（40MB+）で最大67%高速化。
Thinking UI にスピナーが追加され進捗が可視化。

## 主なポイント
- `/skills` メニューで `t` キー → 推定トークン数順にスキルをソート（サイズ管理の効率化）
- `/resume` 大型セッション（40MB+）で最大67%高速化（CLAUDE.md にも記載済み）
- Thinking UI: "still thinking" / "thinking more" / "almost done thinking" のスピナー表示
- `/doctor`: Claude 応答中でも開閉可能に
- セキュリティ: サンドボックス自動許可が `rm`/`rmdir` で `/` や `$HOME` などの危険パスをバイパスしない強化

## NOCTAへの関連メモ
NOCTA のスキルファイルは「500行以内」を目安にしている（CLAUDE.md 記載）。`/skills` の t ソートでスキルのトークンコストを確認し、大きいスキルを `references/` に分離するリファクタリングに活用できる。
