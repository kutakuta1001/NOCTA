---
title: "Claude Code CHANGELOG v2.1.284〜v2.1.309"
url: "https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md"
date: "2026-10-24"
domain: "github.com"
tags: [best-practices, claude-code, changelog, source:manual]
---

## 要約（3〜5行）
v2.1.284〜v2.1.309 の変更点から NOCTA に関わる6項目。新モデル2本（Sonnet 5.5・Haiku 5.5）が既定の Sonnet / Haiku に昇格し、deny 迂回の修正・巨大 CLAUDE.md の部分読み込み・圧縮後のスキル一覧再送・`/auto-mode-setup` が入った。

## 主なポイント
- Sonnet 5.5（`claude-sonnet-5-5`）: $2/$10・キャッシュ読取 $0.10（v2.1.284 追加、v2.1.296 で単価訂正）
- Haiku 5.5（`claude-haiku-5-5`）: $0.10/$0.50、100K 超は $0.50/$2.50（v2.1.293）
- v2.1.309: サブシェルを含む Bash リダイレクトが `Edit(path)` deny をすり抜ける不具合・sandbox `denyWrite` のシンボリックリンク不具合を修正
- v2.1.309: サイズ上限超えのネスト CLAUDE.md は先頭のみ読込
- v2.1.304: 圧縮後にスキル一覧を再送・`/reload-skills` は差分のみ・スキル hook 上限1,024件
- v2.1.304: `/auto-mode-setup`（プロジェクトと直近セッションから auto mode 分類器に環境を教える）

## NOCTAへの関連メモ
エージェント定義の `model: sonnet` / `model: haiku` は別名のため、Sonnet 5.5 / Haiku 5.5 へ自動で切り替わっている。R-09 の表記と実際の割当がずれている。
