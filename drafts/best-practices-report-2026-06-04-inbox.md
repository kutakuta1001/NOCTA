# ベストプラクティスレビュー（インボックス一括）
日付: 2026-06-04
次回レビュー推奨: 2026-07-04 以降（インボックスに5件貯まったら）
ソース: manual 7件（docs changelog）/ xmcp 8件（X/Twitter）
除外URL: なし（全件インジェクション検査通過）

---

## 要約

Claude Code v2.1.158〜162 の新機能と、公式ドキュメントの新カテゴリ（Routines・Agent SDK）が主なトピック。xmcp 収集では「hooks は保証・CLAUDE.md はお願い」という設計思想と「ハーネス設計がモデル性能より重要」という論点が NOCTA 現行設計を再確認する形で浮上した。Sonnet 4/Opus 4 廃止（2026-06-15）まで残り11日だが NOCTA には影響なし。

---

## NOCTAへの適用提案（未実装のもののみ）

| 優先度 | 対象 | 現状 | 提案内容 | 参照記事 |
|--------|------|------|----------|---------|
| 高 | セッション運用 | `/effort` は毎回手動設定 | v2.1.162 で `/effort` 選択がデフォルト保持されるようになった。重要タスク専用の effort 設定を1回だけ行えば引き継がれる。CLAUDE.md セッション運用テーブルに「effort 設定 \| `/effort [level]` — 保存後は次回起動も引き継ぎ」を追加する | 2026-06-04-changelog-v2-1-162-effort-default |
| 高 | Opus 4.8 監視 | CLAUDE.md は claude-opus-4-8 を採用（2026-05-29 確認） | 公式ドキュメントに Opus 4.8 の掲載なし（有料先行アクセス）。次回 `/model-review` 実行日（2026-06-28）まで継続使用し、公開ドキュメント掲載の有無を確認する | 2026-06-04-docs-anthropic-models-opus47 |
| 中 | セッション運用 | /weekly-check はCEOが手動実行 | Routines (`/schedule`) で /weekly-check の定期実行を自動化できる可能性。CLAUDE.md セッション運用テーブルに「定期タスク \| Routines: `/schedule` → Anthropicインフラで実行（マシンOFF可）」を追記候補 | 2026-06-04-docs-anthropic-routines |
| 中 | Agent Teams デバッグ | 進行停止時の原因が不明 | `claude agents --json` の `waitingFor` フィールドで Agent Teams のブロック原因を確認できる。デバッグ手順として CLAUDE.md または handoff.md に記録する | 2026-06-04-changelog-v2-1-162-agents-waitingfor |
| 低 | 新プロジェクト初期設定 | CLAUDE.md は手作業で記述 | `claude-code-setup`（Anthropic公式プラグイン）がコードベースを解析して CLAUDE.md・hooks の初期構成を提案する。2曲目以降の新プロジェクト立ち上げ時に試す価値あり | 2026-06-04-uslab1994-claude-code-setup |

---

## 記事ごとの主要ポイント

| 記事 | 要点（30文字以内） |
|------|-----------------|
| v2.1.162 effort-default | /effort 選択がデフォルト保持 |
| v2.1.162 agents-waitingfor | waitingFor でブロック原因可視化 |
| v2.1.158 automode | Bedrock/Vertex 向け・NOCTAは無関係 |
| docs models opus47 | Opus 4.8 は公式未掲載（有料先行） |
| docs routines | /schedule でAnthropicインフラ定期実行 |
| docs agent-sdk | コードでカスタムエージェント構築可能 |
| docs slack | Slack連携・NOCTAは個人のため不要 |
| @dunik_7 hooks | hooks=保証・CLAUDE.md=お願い |
| @uslab1994 setup | claude-code-setup で CLAUDE.md 自動提案 |
| @LaboNft harness | ハーネス設計>モデル性能 |
| @bkarishma360 agentic | タスク分解がエージェント設計の核心 |
| @sho_blog11 agent | 本文途切れ・具体示唆なし |
| @RimoApp mcp | Rimo MCP・NOCTA無関係 |
| @victormustar ace | ACE-Step 品質が実用レベルに達した証言 |
| @acedatacloud suno | Ace で Suno API 統合（ACE-Stepとは別） |

---

## インスピレーションメモ

- **Routines + /phase1-trend** — 週次トレンド収集を完全自動化できそう（マシンOFF夜間実行・月曜朝に結果確認）（参照: code.claude.com/docs）
- **Agent SDK + 音楽パイプライン** — trend-analyst→music-spec-writer→lyric-poet の依存関係をコードレベルで制御できるようになるかも（将来・参照: code.claude.com/docs）
- **claude-code-setup** — NOCTA の CLAUDE.md 構成を新曲プロジェクトに自動適用するテンプレート生成に使えるかも（参照: x.com/uslab1994）

---

## セキュリティ・安全性への影響

特記事項なし。全15件インジェクション検査通過。

---

## 適用しない項目と理由

- **v2.1.158 オートモード**: NOCTA は Anthropic API 直接使用のため Bedrock/Vertex は無関係
- **Agent SDK**: 現行 YAML エージェント設計で十分。大規模自動化が必要になった段階で再評価
- **Slack 連携**: 個人プロジェクトのため不要
- **Rimo MCP**: 会議議事録ツール・NOCTA の用途なし
- **@bkarishma360 / @sho_blog11**: 入門的内容・本文不完全のため具体適用なし

---

## CEOが確認すべき事項

1. **`/effort` のデフォルト保持**: v2.1.162 から `/effort xhigh` を一度設定すると次回起動後も維持されます。重要タスク前に毎回 `/effort xhigh` を手動設定していた場合、この動作変更を把握してください（コスト増加に注意）。CLAUDE.md のセッション運用テーブルへの追記を推奨します。
2. **Sonnet 4 / Opus 4 廃止（2026-06-15）**: NOCTA は未使用のため影響なし。念のため確認してください。
3. **Routines（/schedule）の有効化**: マシンOFF時も /weekly-check を自動実行できます。Claude Code Desktop または Web の `/schedule` で設定可能。サブスクリプション要件を確認後、導入を検討してください。
