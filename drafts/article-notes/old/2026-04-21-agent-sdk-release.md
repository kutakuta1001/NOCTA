---
title: "Claude Code Agent SDK リリース — カスタムエージェント構築が可能に"
url: "https://docs.anthropic.com/ja/docs/claude-code/overview"
date: "2026-04-21"
domain: "docs.anthropic.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code のツール群（Bash, Read, Write, Glob, Grep等）をそのまま活用した
カスタムエージェントをSDK経由で構築できるようになった。
これによりClaude Codeと同じツールアクセス権を持つ独自エージェントを
コード生成・音楽制作ワークフローに特化させて作れる。

## 主なポイント
- Agent SDK: Claude Codeのツールを外部コードから呼び出せる
- カスタムエージェント構築: プロジェクト固有のワークフローをエージェント化可能
- 既存のClaude Code権限モデルを継承
- subagent_type パラメータでエージェントタイプを指定可能

## NOCTAへの関連メモ
NOCTAの音楽制作特化エージェント（svp-generator / lyric-poet等）をAgent SDK化すると、
Claude Code UIを介さずにスクリプトから呼び出せる。将来の自動化パイプラインの基盤になりうる。
