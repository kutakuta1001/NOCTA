---
title: "Obsidian × Claude Code の落とし穴——AI全自動化でVaultがゴミ箱化する問題"
url: "https://x.com/i/status/2047628297086144940"
date: "2026-04-26"
domain: "x.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
バズっているObsidian × Claude Code「JARVIS構築」記事への反論スレッド。AI全自動化によりObsidianが「自分の思考の器」から「AIのゴミ箱」に変質するリスクを指摘。解決策は人間の思考とAIの作業領域を物理的に分離すること（`.agents/`フォルダ分離）。

## 主なポイント
- 全自動化の罠: AIが整理・分類・リンク作成・概要生成まで担うと「他人の思考」がVaultに混入し劣化する
- Obsidianの本質は「Sharpen your thinking」。考える工程は人間が握り、処理する工程のみAIに渡す
- コウモリ問題: フォルダ分類が多すぎると「どこに入れるか迷う」ノートが必ず発生→分けすぎ禁止
- AI作業領域を `.agents/` 隠しフォルダに分離→人間のGUI画面にAI生成物が表示されない構造
- AIに任せていい仕事: データ分析・定型文書下書き・情報検索要約。人間がやるべき: メモの情報処理・リンク構築・フォルダ設計・品質判断

## NOCTAへの関連メモ
NOCTAの記憶設計（CLAUDE.md + ~/.claude/projects/memory/）はすでにAI領域と人間の判断領域が分離されている。memory/内のAI自動記憶と、CEOが手動更新するCLAUDE.mdのMEMORYセクションの役割分担を明確にしておくとVault同様の問題を防げる。
