# Webベストプラクティスレビュー: 2026-03-29
ソース: Google Search Grounding（Gemini 2.5 Flash）/ 5クエリ

## 要約（3行以内）
CLAUDE.mdの構造化・Plan Mode活用・コンテキスト管理の3点が特に強調されていた。
NOCTAはモデル使い分け・スラッシュコマンド・フェーズ承認など主要プラクティスをすでに実装済み。
未対応の有効な施策として「@importによるCLAUDE.md分割」「/contextの定期確認習慣」が挙がった。

---

## 発見した主要ベストプラクティス

| # | 発見内容 | 関連クエリ |
|---|---------|-----------|
| 1 | CLAUDE.mdはグローバル（~/.claude/）とプロジェクト固有に分け、**@importsで関連ドキュメントを参照**させると肥大化を防げる | CLAUDE.md tips |
| 2 | 複雑なタスク前に**Plan Mode（Shift+Tab / Ctrl+G）**を使い計画をレビューしてから実行する | CLAUDE.md tips |
| 3 | `/context` でコンテキスト使用量を確認し、不要なMCPは `/mcp` で随時無効化する | Context management |
| 4 | CLAUDE.mdは**約500行以下**に保ち、詳細手順はスキル・サブエージェントに委任する | Context management |
| 5 | Claudeが間違いを犯したら都度CLAUDE.mdに**フィードバックを追記**して再発防止する | CLAUDE.md tips |
| 6 | 楽曲ジャンル・ムード・テンポ・キーなど**音楽固有パラメータ**をプロンプトに明示する | AI agent workflow |
| 7 | マルチエージェント並列実行時はOpus（創造）/ Sonnet（推論）/ Haiku（機械的操作）で役割分担する | AI agent workflow |
| 8 | **関連タスク完了ごとに `/clear`** でコンテキストをリセット、長時間セッションは `/compact` で圧縮 | Context management |

---

## NOCTAへの適用提案

| 優先度 | 対象 | 現状 | 提案内容 |
|--------|------|------|----------|
| 高 | CLAUDE.md構造 | ルール・エージェント・ガイドをすべて1ファイルに記載 | `@imports`でエージェント定義・コードマップを外部ファイルに切り出し、CLAUDE.md本体をさらに軽量化する |
| 高 | 作業習慣 | 大きな実装前にブレインストーミングはしているが、Plan Modeは未活用 | `/phase2-music`・`/phase4-release`等の複雑フェーズ前にPlan Modeを先に起動する習慣を追加 |
| 中 | コンテキスト管理 | `/music-reset-context`スキルはあるが、使用量の定期確認はしていない | セッション中盤（メッセージ数が増えたと感じたら）に `/context` コマンドで残量を確認する |
| 中 | CLAUDE.mdの改善サイクル | Claudeが間違いを犯した場合のルール追記フローが未整備 | 「Claudeが繰り返しミスした場合はCLAUDE.mdに追記する」をR-16として明文化する |
| 低 | 音楽指示の精度 | コード進行・BPMは数値で書いているが、ムード・質感の語彙が曖昧になることがある | 楽曲仕様書テンプレートに `feeling:` `texture:` `reference_track:` フィールドを追加する |

---

## すでに実装済みの項目

1. **モデル使い分け（R-09）** — Haiku/Sonnet/Opusをタスク種別で明確に定義済み
2. **スラッシュコマンドによる定型作業の自動化** — /blog-publish・/phase*・/best-practices-review等19本のスキル
3. **承認ゲートによる段階的レビュー** — 9ゲートで「計画→確認→実行」のサイクルを強制
4. **Context節約（R-05）** — セッション開始時はcontext.md・handoff.mdのみ読む
5. **CLAUDE.md 185行以内** — 推奨500行以下を大幅に下回っている
6. **並列エージェント実行** — /phase2-music（2並列）・/phase4-release（4並列）で実装済み
7. **タスク細分化とフェーズ分割** — フェーズ1〜5の5段階フロー

---

## 適用しない項目とその理由

| 項目 | 理由 |
|------|------|
| IDE拡張機能（VS Code等）のリアルタイムエラー連携 | NOCTA HPはHTML/JS/CSS静的サイトで型エラー等の恩恵が少ない |
| 音声入力（ディクテーション）によるプロンプト作成 | 現在の作業スタイルに合わない |
| 音楽再生フック（`/play`・`/next`コマンド） | Studio Oneで直接操作するため不要 |
| ARCHITECTURE.md・CONVENTIONS.md の追加作成 | CLAUDE.mdのCODEMAPセクションで代替済み |

---

## CEOが確認すべき事項

1. **@imports活用の検討** — CLAUDE.mdのエージェント定義をインポート参照方式に変更するか。現状の1ファイル集約で問題なければ現状維持でOK
2. **Plan Mode活用の習慣化** — `/phase2-music`等の複雑フェーズ前にShift+TabでPlan Modeを起動してみる価値あり。体験してみてから判断を
3. **CLAUDE.md改善サイクルのルール化** — 同じミスが繰り返された場合の追記ルールをR-16として追加するか

---

## 参考：今回使用した検索クエリ

1. `Claude Code best practices 2025`
2. `Claude Code CLAUDE.md tips workflow site:zenn.dev OR site:note.com OR site:reddit.com`
3. `AI coding agent workflow productivity tips 2025`
4. `Claude Code hooks skills slash commands automation`
5. `Claude Code context management cost optimization`
