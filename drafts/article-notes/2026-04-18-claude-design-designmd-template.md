---
title: "@nozmen: Claude Design で DESIGN.md を使いデザインDNAを全出力に継承"
url: "https://x.com/nozmen/status/2045254526559740210"
date: "2026-04-18"
domain: "x.com"
tags: [best-practices, source:xmcp]
---

## 要約（3〜5行）
Claude Design（Anthropic 新製品）で `DESIGN.md` を活用する方法。`getdesign.md` のテンプレートからスペーシング・タイポグラフィ・カラートークン・コンポーネントルールを定義した DESIGN.md を作成すると、すべての新しい出力にデザインの「DNA」が引き継がれる。インスピレーションから一貫したデザインシステムへの昇格が可能になる。

## 主なポイント
- `DESIGN.md`: Claude Design 用のデザインシステム定義ファイル
- `getdesign.md` テンプレート（公式）から生成可能
- 定義内容: スペーシング・タイポグラフィ・カラートークン・コンポーネントルール
- 一度定義すると全出力に自動的にデザインDNAが反映される
- CLAUDE.md のデザイン版として機能する

## NOCTAへの関連メモ
NOCTA の website/ は Tailwind CSS + ブランドカラー（website/CLAUDE.md）で管理されているが、DESIGN.md として独立ファイル化すると Claude Design での HP ビジュアル制作・バナー・SNS 画像生成時に一貫したブランドデザインを維持できる。`/visual-prompt` スキルと組み合わせると Midjourney/Kling 用プロンプトにも NOCTA のデザイン DNA を埋め込める可能性がある。
