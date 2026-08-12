---
title: "@IAmAaronWill — Claude Code /strategy フォルダ・CLAUDE.md・subagent構成ガイド"
url: "https://x.com/IAmAaronWill/status/2046978768825143655"
date: "2026-04-25"
domain: "x.com"
tags: [best-practices, source:xmcp]
---

## 要約（3〜5行）
Claude Code導入後の標準的なフォルダ構成とワークフロー構築手順。/strategy フォルダでビジネス方向性を管理し、CLAUDE.mdにオファー・ターゲット・ボイスを記述、commandsフォルダでスラッシュコマンド体系を構築、copywriterサブエージェントをGmail/Notion/Driveと連携させる構成。

## 主なポイント
- `/strategy` フォルダ: CLAUDE.md、ICPプロファイル、声のトーン定義を格納
- commands フォルダ: ビジネス固有のスラッシュコマンドを格納
- copywriter subagent: SNS文案・メール文案の自動生成に特化
- Gmail・Notion・Drive との MCP 連携でコンテンツ管理を自動化

## NOCTAへの関連メモ
NOCTAでは CLAUDE.md・`~/.claude/commands/`・agents/が既に構築済み。copywriter subagentの概念はsns-batch-agent（フェーズ4）に対応。/strategy フォルダ相当は PROJECT CONTEXT セクションで代替している。Gmail/Drive連携はR-03（自動投稿禁止）の範囲内で参照先として検討可能。
