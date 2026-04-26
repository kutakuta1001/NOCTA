---
title: "ClaudeCode × Obsidian 完全解説（第二の脳・LLM Wiki）"
url: "https://x.com/i/status/2046930094695043199"
date: "2026-04-26"
domain: "x.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code × ObsidianでAndrej Karpathy提唱の「LLM Wiki」を構築する方法の完全解説スレッド。記憶の設計なしにAIを使うのは「記憶喪失の派遣社員」状態。CLAUDE.mdへの情報蓄積と `ingest` コマンドによる自動Wiki構築で、使えば使うほど精度が上がる「記憶の複利」を実現する。

## 主なポイント
- AI活用の進化: ツール選び → プロンプト工夫 → ハーネス構築 → **記憶の設計**（現在）
- Vault構造: `.raw/`（生素材投入） / `wiki/`（AI自動構築） / `outputs/`（成果物）
- `obsidian-skills`（Obsidian CEO開発・25k stars）+ `claude-obsidian`（LLM Wikiパターン実装・2.5k stars）の組み合わせ
- `ingest [file]` で素材→8〜15個のWikiページを自動生成。`hot.md`（直近コンテキストキャッシュ）で大規模Vaultでもトークンコスト一定
- 3記憶方式の比較: LLM Wiki（複利最強）/ NotebookLM（使い切り型）/ CLAUDE.md（行動定義型）

## NOCTAへの関連メモ
NOCTAはCLAUDE.md方式で運用中。LLM Wiki方式はトークンコストが増大するため、NOCTAには現在のCLAUDE.md + project記憶ファイル方式が適切。ただし `claude-obsidian` の `/autoresearch` スキルは `/phase1-trend` の強化手段として将来的に検討価値あり。
