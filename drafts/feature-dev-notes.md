# feature-dev スキル 調査メモ

調査日: 2026-04-21

---

## スキル概要

`/feature-dev` は superpowers プラグインに含まれる7フェーズ構成のソフトウェア機能開発ワークフロー。
マイクロエクゼキューション目的・継続的な機能追加・エンジニアリングフローへの直接組み込みを想定して設計されている。

インストール場所: `~/.claude/plugins/marketplaces/claude-plugins-official/plugins/feature-dev/`

---

## フェーズ構成

| # | フェーズ | 内容 |
|---|---|---|
| 1 | Discovery | 何を作るか明確化。要件・制約・目的を確認 |
| 2 | Codebase Exploration | code-explorer を2〜3体並列起動し、既存コードを多角的に深掘り |
| 3 | Clarifying Questions | 曖昧点を全て潰す（**最重要・スキップ禁止**）。ユーザー回答を待ってから次へ |
| 4 | Architecture Design | code-architect を2〜3体並列起動し、複数の設計案と推奨を提示 |
| 5 | Implementation | **ユーザー承認後のみ**実装開始。既存規約に厳密に従う |
| 6 | Quality Review | code-reviewer を3体並列起動（DRY/バグ/規約の3軸）。対応方針をユーザーが決定 |
| 7 | Summary | 変更ファイル・意思決定・次のアクションを文書化 |

---

## 専用エージェント（3体）

| エージェント | 役割 | ツール |
|---|---|---|
| code-explorer | 既存コードをトレースし、類似機能・アーキテクチャ・パターンを調査 | Read, Grep, Glob 等（読み取り専用） |
| code-architect | 設計案を立案。ファイルパス・コンポーネント設計・データフロー・実装手順を出力 | Read, Grep, Glob, WebSearch 等 |
| code-reviewer | バグ・DRY/エレガンス・プロジェクト規約の3軸でコードレビュー | Read, Grep 等（読み取り専用） |

---

## NOCTAフローへの適合性

| 領域 | 適合 | 理由 |
|---|---|---|
| 楽曲制作フロー（Phase 1〜5） | 不要 | コードベース探索の概念がない。/brainstorm + エージェントチームで同等フローが完結 |
| HP/ウェブサイト更新 | 不要 | 現状はデータファイル追記のみ。7フェーズは過剰 |
| 新規ソフトウェア開発 | **有効** | コードベースを持つアプリ・ツール・API開発には直接的に機能する |

### 既存NOCTAスキルとの重複

| feature-dev フェーズ | NOCTAの既存手段 |
|---|---|
| Phase 1（Discovery） | `/brainstorm`（R-13） |
| Phase 3（Clarifying） | `/brainstorm` の対話フェーズ |
| Phase 6（Quality Review） | `superpowers:code-reviewer` エージェント |

---

## 導入推奨条件

以下のいずれかに該当する場合は組み込みを推奨:

1. NOCTAプラットフォームとして新規Webアプリ/APIを開発する（楽曲配信・ファン向けサービス等）
2. HPをデータファイル更新以上の規模で改修する（新セクション・CMS統合・動的機能追加等）
3. コードを持つソフトウェアの大規模システム設計フェーズに入っている

---

## 使い方（該当時）

```
/feature-dev [機能の説明]
```

例:
```
/feature-dev Add user authentication with OAuth
/feature-dev NOCTAサイトに楽曲プレーヤー機能を追加する
```

Phase 1から自動的にガイドされる。

---

## 結論

feature-devは「ソフトウェアを作るワークフロー」であり「音楽を作るワークフロー」ではない。
NOCTAが純粋な音楽制作プロジェクトである間は不要。
ソフトウェア開発の比重が高まる初期フェーズに入ったタイミングで導入する。
