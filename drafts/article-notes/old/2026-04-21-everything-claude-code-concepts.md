---
title: "everything-claude-codeの設計思想 — 『考え方』をわかりやすく解説"
url: "https://zenn.dev/tmasuyama1114/articles/everything-claude-code-concepts"
date: "2026-04-21"
domain: "zenn.dev"
tags: [best-practices, zenn, claude-code, source:manual]
---

## 要約（3〜5行）
Anthropicハッカソン優勝者の設定集（everything-claude-code）の背後にある設計思想を解説した記事。
核心は「AIに渡す情報全体を管理するコンテキストエンジニアリング」。
専門家チーム（サブエージェント）・マニュアル整備（rules/skills）・hooks確実実行・MCP管理・コンテキスト制御の5軸で構成。

## 主なポイント
- **専門家チームモデル**: planner/code-reviewer/security-reviewer/tdd-guide のような特化サブエージェントを使い、各エージェントには「最小限のツールだけ」を与える
- **マニュアル整備**: security.md/coding-style.md/testing.md のような専門分野別ドキュメントを一度整備すると毎回の説明不要に
- **hooks確実性**: hooksは「コンテキスト縮小リスクなく確実に実行される」イベントトリガー。console.log検出やフォーマット自動化など
- **MCP管理**: 20〜30個登録・プロジェクトごと10個以下有効化・有効ツール80個以下が推奨モデル
- **コンテキストエンジニアリング**: プロンプトの書き方だけでなく「AIに渡す情報全体を管理する」という根本思想

## NOCTAへの関連メモ
CLAUDE.mdのR-05（情報の最小化）・MCP管理・Agent Teams 3役モデルはすでにこの思想に沿っている。
未実装の改善余地は「各エージェントへのツール権限の明示的制限」と「SynthV・Studio One専門知識のドキュメント分離」。
