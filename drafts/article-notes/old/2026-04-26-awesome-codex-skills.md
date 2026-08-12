---
title: "awesome-codex-skills — Codex向けスキル集キュレーション"
url: "https://github.com/ComposioHQ/awesome-codex-skills"
date: "2026-04-26"
domain: "github.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Codex CLI/API向けの実用スキルを厳選したオープンソースキュレーション集（ComposioHQ作成）。Slack投稿・GitHub操作・Notion連携など1000以上のアプリとの連携スキルを収録。SKILL.mdフォーマット規約が明確で、Claude Codeのスキル設計にも応用できる。

## 主なポイント
- SKILL.mdフォーマット: YAMLフロントマター（name / description） + 実行手順のMarkdown
- `description` には発動タイミングを網羅的に記載（いつ使うかを明示する）
- 詳細参照情報は `references/` に分離し段階的開示でコンテキスト効率を維持
- スキルカテゴリ: 開発・コードレビュー / 生産性・Notion / 文章作成 / データ分析 / ユーティリティ
- Claude CodeのCOMMANDS形式と構造が類似（NOCTAの `~/.claude/commands/` と互換性あり）

## NOCTAへの関連メモ
NOCTAのスキル設計はすでにCLAUDE.md記載のサイズ制限（500行以内・references/分離）と一致している。awesome-codex-skillsのカテゴリ分類（開発/生産性/コンテンツ/データ）をNOCTAスキルの整理・命名に参照できる。
