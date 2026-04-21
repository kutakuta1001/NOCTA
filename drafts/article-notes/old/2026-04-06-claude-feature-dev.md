---
title: "Claude Codeのfeature-devプラグインが『動くは動くんだけど...』を解決してくれた話"
url: "https://zenn.dev/atamaplus/articles/claude-feature-dev"
date: "2026-04-06"
tags: [best-practices, claude-code]
---

## 要約

素のClaude Codeは既存コードベースの理解不足により、共通関数の見落としやプロジェクト規約無視のコードを生成しがちだった。
feature-devプラグインは「7フェーズ構造化ワークフロー」と「3専門エージェント（code-explorer / code-architect / code-reviewer）」の分業体制で、計画から実装・レビューまで一貫対応する。
コードベース調査後に適切な質問が入るため、最小限のプロンプトでも高品質なアウトプットが得られるようになった。

## 主なポイント

- コードベース調査→質問→実装の順番を守ることで「プロンプト情報だけで突っ走る」問題を防止
- 小規模修正には不要、中規模タスクに最適、大規模案件はDesign Doc分解後に利用推奨
- トークン消費増加と待機時間延長がトレードオフ。タスク規模に応じた選別が重要
- 3エージェント（探索・設計・レビュー）の分担がそれぞれ特化した品質チェックを実現

## NOCTAへの関連メモ

NOCTAで使っている Superpowers の subagent-driven-development と思想が共通（探索→設計→実装→レビュー）。既存コードへの変更時（website/index.html 改修など）でコードベース調査フェーズを意識するとfix率がさらに下がる可能性あり。
