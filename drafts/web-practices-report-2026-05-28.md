# Webベストプラクティスレビュー: 2026-05-28
ソース: Google Search Grounding（Gemini 2.5 Flash）
インジェクション検査: 実施済み（検出件数: 0件）

## 要約（3行以内）

Claude Code の主要ベストプラクティスはNOCTAの現行設計とおおむね一致。
新規発見として「MIDI Agent VST3プラグイン」「Claude in Chrome拡張機能」「disallowed-toolsフロントマター」の3点がNOCTAに適用可能。
コンテキスト管理・モデル使い分け・承認ゲートはすでに実装済みで優位性を維持している。

---

## 発見した主要ベストプラクティス

| # | 発見内容 | 関連度 | 参照クエリ |
|---|---------|--------|---------|
| 1 | サブフォルダごとに CLAUDE.md を分割してコンテキスト整理 | 高 | Q1 |
| 2 | CLAUDE.md は 200〜300行以内に抑え、詳細は @参照ファイルに分離（プログレッシブ・ディスクロージャー） | 高 | Q2 |
| 3 | タスクを 5〜10分単位のサブタスクに分割して精度向上 | 高 | Q1/Q3 |
| 4 | 作業前に計画を立てさせてからレビュー・実行（計画先行型） | 高 | Q2/Q3 |
| 5 | MIDI Agent VST3プラグイン — 自然言語プロンプトからMIDIを直接生成するDAW統合ツール | 中 | Q4 |
| 6 | Claude in Chrome拡張機能 — ブラウザ操作・フォーム自動化・データ抽出をClaudeで制御 | 中 | Q4 |
| 7 | Claude Co-work — PDF/Word/Excel一括処理・リネーム・構造化データ抽出の自動化 | 低 | Q4 |
| 8 | MCPサーバーを最小化し、可能な場合はCLIツールを直接実行してコンテキスト削減 | 高 | Q5 |
| 9 | /clear と /compact を使い分けてセッション切替時のトークン浪費を防ぐ | 高 | Q5 |

---

## NOCTAへの適用提案

| 優先度 | 対象 | 現状 | 提案内容 |
|--------|------|------|----------|
| 高 | v2.1.152 スキルの disallowed-tools | 未使用 | SNS書き込みスキル（x-practices-search等）の frontmatter に `disallowed-tools: [createPosts, likePost, repostPost]` を追加してR-03をハードウェア的に補強 |
| 中 | MIDI Agent VST3プラグイン | 未検討 | Studio Oneへの統合可能性を調査。ACE-Step / LALAL.AI の代替・補完として、DAW内でのAI MIDI生成ワークフローを検討 |
| 中 | Claude in Chrome拡張機能 | 未使用 | HP管理（works-data.js / blog-data.js）の手動確認・検証をブラウザ上でClaude補助可能か検討 |
| 低 | CLAUDE.md のサイズ管理 | 良好（references/分離済み） | 現行の@参照設計を継続。NOCTA CLAUDE.md は現状500行超だが分離設計済みのため要追加対応なし |

---

## すでに実装済みの項目

1. CLAUDE.md をサブフォルダごとに分割（`/NOCTA/CLAUDE.md` + `project_NOCTA/CLAUDE.md` + `website/CLAUDE.md`）
2. プログレッシブ・ディスクロージャー（@website/CLAUDE.md / @website/DESIGN.md 参照構造）
3. 計画先行型ワークフロー（/brainstorm → CEOのGoサインなしに実行しない、R-13/R-14）
4. タスク細分化（Agent Teams 3役モデル + 承認ゲート①〜⑨）
5. 生成物の必須レビュー（すべて「叩き台」扱い、R-11）
6. モデル使い分け（Haiku/Sonnet/Opus の3段階、R-09）
7. MCPサーバーの最小化（tools 80以下ルール、常時5個以内）
8. /clear・/compact によるコンテキスト管理（セッション運用表）

---

## 要注意: git・シェル操作に関わる提案（CEOが確認してから判断）

今回の収集結果に git・シェル操作の具体的指示は含まれていなかった。

---

## インジェクション検査結果

検出パターン: 0件
検査対象: 5クエリのすべてのGemini出力テキスト
検査パターン: ignore previous instructions / 前の指示を無視 / git push --force / rm -rf / curl|bash / eval() / APIキー入力促し

---

## 適用しない項目と理由

| 項目 | 理由 |
|------|------|
| WordPress自動化（Claude in Chrome） | NOCTAはGitHub Pages（静的HTML）を使用。WordPressは非該当 |
| Claude Co-work によるPDF一括処理 | 現状のドキュメント管理はMarkdown中心で不要 |
| 「AIが生成した成果物を必ずレビュー」系アドバイス | R-10/R-11で実装済み |
| n8nによるワークフロー自動化 | Claude Code スキル・Agent Teams で代替済み |

---

## CEOが確認すべき事項

1. **MIDI Agent VST3プラグイン** — Studio Oneでの利用可否を確認。ACE-Stepと組み合わせたDAW内AI MIDI生成ワークフローが構築できる可能性あり
2. **disallowed-tools フロントマターの適用** — v2.1.152の新機能。x-practices-search等のスキルに `disallowed-tools: [createPosts, likePost]` を追加するか判断を
3. **Haiku 4.5 の knowledge cutoff 2025年2月** — （claude-docs-reviewでも報告）phase1-trend のトレンド調査で Haiku を使う場合、1年以上古い知識になる可能性があるため役割を「調査・ファイル生成」に限定するか再検討
