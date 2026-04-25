---
title: "GPT Image 2 — 1プロンプト最大8枚・2K解像度・アスペクト比3:1〜1:3"
url: "https://openai.com/blog/gpt-image-2"
date: "2026-04-25"
domain: "openai.com"
tags: [best-practices, openai, source:manual]
---

## 要約（3〜5行）
GPT Image 2は1プロンプトで最大8枚の一貫性ある画像を生成できる。解像度は2K、アスペクト比は3:1〜1:3まで対応。
SNS各プラットフォームのフォーマット（横長・縦長・正方形）を一括生成できる。

## 主なポイント
- 1プロンプトで最大8枚生成（バリエーション比較に有効）
- 最大2K解像度（高品質なアートワーク・サムネイル制作可能）
- アスペクト比 3:1〜1:3（Twitter/Instagram/YouTube各フォーマット対応）
- /visual-promptの G1/G2/G3 バリエーションを1回のプロンプトで生成可能

## NOCTAへの関連メモ
実装済み: /visual-promptスキルでG1/G2/G3の3バリエーションを生成するフロー確立済み。ただし「1プロンプトで8枚同時生成」機能はChatGPT Plusの手動生成フローでも使える。次回 /visual-prompt 実行時にG1〜G3を別々ではなく1プロンプトで8枚生成する方法を試す価値あり。
