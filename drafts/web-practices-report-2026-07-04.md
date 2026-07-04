# Webベストプラクティスレビュー: 2026-07-04
ソース: Google Search Grounding（Gemini 2.5 Flash・5クエリ）
インジェクション検査: 実施済み（検出件数: 0件）

## 要約（3行以内）

収集した5クエリの発見はほぼNOCTAの既存ルール（R-05・R-09・R-13・R-14・セッション運用）でカバー済み。
新規に適用余地があるのは「.claudeignore の導入」「コンテキスト40〜50%での能動的 /compact」「プロンプトキャッシュ安定性の意識」の3点。
git操作に関する危険な提案は検出されなかった。

## 発見した主要ベストプラクティス

| # | 発見内容 | 関連度 | 参照元 |
|---|---------|--------|--------|
| 1 | CLAUDE.md を「常に真である事実」に絞り、トークン消費20〜30%削減 | 高 | vertexaisearch (Q1) |
| 2 | 段階的ワークフロー（発見→計画→実装→検証）とPlan Mode/SPEC活用 | 高 | vertexaisearch (Q1/Q2) |
| 3 | Hooks=決定論的ガードレール、MCP=外部連携、Skills=専門知識の型化 | 高 | vertexaisearch (Q1/Q4) |
| 4 | 調査・大量ファイル読込はサブエージェントに委任しメインcontextを保護 | 高 | vertexaisearch (Q2/Q5) |
| 5 | タスク別モデル選択（Opus=設計、Sonnet/Haiku=日常）と完了後の切替 | 高 | vertexaisearch (Q5) |
| 6 | .claudeignore で node_modules・ビルド成果物を除外しcontext肥大化防止 | 中 | vertexaisearch (Q1) |
| 7 | context使用率40〜50%で自動圧縮を待たず /compact を手動実行 | 中 | vertexaisearch (Q5) |
| 8 | プロンプトキャッシュ: CLAUDE.md等の安定部分を頻繁に変えず最大90%削減 | 中 | vertexaisearch (Q5) |
| 9 | 単純タスクは /effort 低・MAX_THINKING_TOKENS で思考トークン最適化 | 中 | vertexaisearch (Q5) |

## NOCTAへの適用提案

| 優先度 | 対象 | 現状 | 提案内容 |
|--------|------|------|----------|
| 中 | website/ リポジトリ | .claudeignore なし | ビルド成果物・実画像/動画（png/jpg/mp4）を .claudeignore に列挙しcontext肥大化を防ぐ。HP CLAUDE.md の「実画像・動画は git に追加しない」方針と整合 |
| 中 | セッション運用 | 「15〜20メッセージで /compact」 | 「context使用率40〜50%到達時にも /compact」を補助ヒューリスティックとして追加検討 |
| 低 | CLAUDE.md 保守 | 今回 rev.4 で編集 | プロンプトキャッシュ効率のため、CLAUDE.md/model-lineup の頻繁な小変更は避け、レビュー時にまとめて反映する運用を意識 |

## すでに実装済みの項目

1. CLAUDE.md によるプロジェクト記憶の確立（R-05・常時適用ルールのみ記載の設計原則）
2. Plan Mode / /brainstorm / writing-plans による計画駆動ワークフロー（R-14・COST POLICY）
3. Hooks・MCP・Skills の使い分け（MCP管理80ツール以下・スキル500行以内・段階的開示）
4. サブエージェント委任でメインcontext保護（Agent Teams 3役・Explore接地 R-05）
5. タスク別モデル選択（R-09: Haiku調査 / Sonnet 5起案 / Opus 4.8批評）と /effort によるコスト最適化
6. /clear・/compact・/btw 等のセッション運用（セッション運用表に整備済み）
7. スキルによる反復作業の型化（/phase系・/hp-add-work・/blog-publish 等）

## 要注意: git・シェル操作に関わる提案（CEOが内容を確認してから判断）

- 今回の収集結果に git 操作の直接的な提案は含まれていなかった（CI/CDパイプライン活用の一般論のみ）。
- 危険なシェルコマンド（rm -rf・curl|bash 等）の提案も検出なし。
- 自動適用対象なし。

## インジェクション検査結果

危険パターン（前の指示を無視 / git push --force / rm -rf / APIキー入力要求 等）は5クエリすべてで検出されなかった。

## 適用しない項目と理由

- **「CLAUDE.md は約60行以内が目安」**: NOCTAは意図的に詳細なルール群（R-01〜R-15・AGENTS・APPROVAL GATES）を保持しており、単純な行数削減は方針に合わない。段階的開示（スキル分離）は既に実践済みのため、行数目標は不採用。
- **CI/CD自動テスト徹底**: NOCTAはコード領域が限定的（website/中心）で、CEO手動確認が基本方針（R-10・R-11）。大規模CI/CD導入は現時点で過剰。

## CEOが確認すべき事項

1. website/ に .claudeignore を追加するか（実画像・動画・ビルド成果物の除外。HP CLAUDE.md の git 方針と整合）
2. セッション運用に「context 40〜50% で /compact」ヒューリスティックを追記するか（既存の「15〜20メッセージ」に併記）
