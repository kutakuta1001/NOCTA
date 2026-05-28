---
title: "[changelog v2.1.149] /usage がカテゴリ別コスト内訳を表示"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-05-28"
domain: "github.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.149 で `/usage` コマンドがスキル・サブエージェント・プラグイン・MCP 別のコスト内訳を表示できるようになった。
従来はトークン合計しか確認できなかったが、どのコンポーネントがコストを消費しているかが可視化された。
Agent Teams 実行後のコスト分析精度が大幅に向上する。

## 主なポイント
- `/usage` で「スキル別」「サブエージェント別」「プラグイン別」「MCP別」のコスト内訳が確認できる
- どのスキルやエージェントが高コストかを特定し、コスト最適化のターゲットを絞れる
- NOCTA COST POLICY（Agent Teams は phase2-music と phase4-release の2回のみ推奨）の判断根拠が数値化できる

## NOCTAへの関連メモ
phase2-music・phase4-release 実行後に `/usage` でカテゴリ別内訳を確認し、高コストコンポーネントを記録しておくとAgent Teams設計の改善に役立つ。
