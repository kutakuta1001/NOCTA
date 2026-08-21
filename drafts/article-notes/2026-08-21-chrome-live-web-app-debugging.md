---
title: "Chrome 連携でライブ Web アプリをデバッグする"
url: "https://code.claude.com/docs/ja/overview"
date: "2026-08-21"
domain: "code.claude.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約

Claude Code 概要ページの統合先一覧に「ライブ Web アプリケーションをデバッグする → Chrome」が挙げられている。
公式ベストプラクティスでも、UI 変更の検証手段として「ブラウザスクリーンショットをデザインと比較する」ことが
Claude 自身が実行できるチェックの例に含まれている。

## 主なポイント

- 「デザイン画像を貼り、実装後に結果のスクリーンショットを撮って元と比較し、差分を列挙して修正する」という指示形式が推奨されている
- スクリーンショット比較はテストやビルド終了コードと並ぶ「検証可能なシグナル」として扱われている
- 目視確認を人間から Claude 側に移せるため、無人実行の精度が上がる

## NOCTAへの関連メモ

NOCTA の HP 作業は `website-reviewer` エージェントがデータ整合性（CIDv1 の文字数・相対パス・構文エラー）を検証するが、
見た目の検証は CEO の目視に依存している。Chrome 連携を入れれば、
R-17 のデザインスキルで作った UI が意図どおり描画されているかを Claude 側で確認できる。
