---
title: "v2.1.158: Bedrock/Vertex/Foundry でオートモード対応"
url: ""
date: "2026-06-04"
domain: "docs.anthropic.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約

v2.1.158 で Amazon Bedrock・Google Vertex AI・Microsoft Foundry 経由でオートモード（Opus 4.7/4.8）が使用可能になった。`CLAUDE_CODE_ENABLE_AUTO_MODE=1` でオプトイン。

## 主なポイント

- エンタープライズ向けクラウドプロバイダー経由でのオートモード利用が解放された
- 環境変数 `CLAUDE_CODE_ENABLE_AUTO_MODE=1` を設定するだけで有効化
- Opus 4.7/4.8 が対象

## NOCTAへの関連メモ

NOCTAは直接 Anthropic API を使用しているため、現時点では無関係。将来的に法人アカウントや RTX 3090 環境でクラウドAPI を切り替える場合に参照。
