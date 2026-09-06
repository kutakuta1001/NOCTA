---
title: "@Nagi_storymusic のツイート — Midjourney v8.2 の Edit 機能で画像を合成する手順"
url: "https://x.com/Nagi_storymusic/status/2094211485098815640"
date: "2026-09-06"
domain: "x.com"
tags: [best-practices, x, visual, midjourney, source:xmcp]
---

## 要約（3〜5行）
Midjourney v8.2 に Edit 機能が追加され、日本語の指示でも意図した編集ができるようになったという報告。
手順は (1) GPT-image で作った文字画像と Midjourney で作ったキャラクター画像を用意、
(2) Midjourney 画像右側の Edit 機能を使う、(3) プロンプトで指示、という3段構成。
いいね133・RT14で、今回のビジュアル系収集で最も反応が大きい。

## 主なポイント
- 異なるツールの出力（GPT-image の文字 + Midjourney の絵）を Midjourney 側で合成する流れ
- 日本語指示に対応している
- 「こうして欲しいのに、ができるようになった」という評価で、従来は指示の反映が難しかったことが示唆される
- 正式な機能名は投稿者も把握していない

## NOCTAへの関連メモ
R-04 により Midjourney を直接実行せず、`outputs/prompts/` にプロンプト文書を生成する運用。
この手順は「文字要素を別ツールで作って合成する」という工程分割で、
visual-prompter が生成するプロンプト文書の構成に反映できる可能性がある
（ロゴ・タイトル文字を含むビジュアルを1回のプロンプトで作らせず、2段階に分ける）。
NOCTA の Visual 領域は GPT Image 2 / Kling を主軸にしているため、Midjourney 固有の機能の優先度は中程度。
