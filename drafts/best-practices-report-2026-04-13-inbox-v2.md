# ベストプラクティスレビュー（インボックス一括）
日付: 2026-04-13（第2回・docs エントリ分）
次回レビュー推奨: 2026-05-13 以降（インボックスに5件貯まったら）
ソース（docs.anthropic.com・全9件）:
- [docs.anthropic.com] モデル一覧 × 3件
- [docs.anthropic.com] CHANGELOG × 4件
- [docs.anthropic.com] Claude Code 概要 × 2件
除外URL: なし

---

## 要約（3行以内）
今回は `/claude-docs-review` が収集した Anthropic 公式ドキュメント由来の9件をレビュー。最大の発見は **Opus 4.6 の価格が旧比1/3（$5/$25/MTok）に低下**したことで、NOCTA の R-09 コスト判断の前提が変わった。v2.1.94 の「デフォルト effort: high」も有料ユーザーへの影響があり、コスト管理手段として `/effort` コマンドの活用を追記する価値がある。

---

## NOCTAへの適用提案（未実装のもののみ）

| 優先度 | 対象 | 現状 | 提案内容 | 参照 |
|--------|------|------|----------|------|
| 高 | CLAUDE.md R-09 | 「Opus は品質重要な場面に限定」（コスト理由）と記載 | R-09 に「Opus 4.6 は $5/$25/MTok（Sonnet 4.5 の約1.7倍・旧 Opus 比 1/3）」を補足。利用判断の根拠を明確化。svp-generator でのより積極的な Opus 活用を検討 | models-opus46-price-drop |
| 中 | CLAUDE.md COST POLICY | Plan Mode/Subagent/Agent Teams の使い分けのみ | `/effort low` または `/effort medium` を単純タスク（handoff 更新・短いファイル生成）時のコスト削減手段として COST POLICY 表に1行追記 | changelog-v2194-effort-high-default |
| 低 | CLAUDE.md セッション運用 | `/agents` タブの言及なし | セッション運用表に「`/agents`: 実行中サブエージェント一覧（Agent Teams の状態確認）」を追記 | changelog-v2197-agents-tab |
| 低 | CLAUDE.md SLASH COMMANDS | `/schedule` の記載なし | セッション運用または定型コマンド表に `/schedule`（クラウドスケジュールタスク作成）を追記 | overview-schedule-cloud-tasks |

---

## 記事ごとの主要ポイント

| 記事 | 要点（30文字以内） |
|------|-----------------|
| モデル一覧 / Opus価格 | Opus 4.6 が $5/$25/MTok に低下 |
| モデル一覧 / 1Mコンテキスト | Opus/Sonnet が 1M token（ベータ） |
| モデル一覧 / Opus出力上限 | Opus 4.6 最大出力 128K（Sonnet の2倍） |
| CHANGELOG v2.1.101 | permissions.deny バグ修正済み |
| CHANGELOG v2.1.97 CJK | 日本語入力後 / @メンション使用可に |
| CHANGELOG v2.1.97 agents | /agents タブでサブエージェント管理 |
| CHANGELOG v2.1.94 effort | デフォルト effort が high に変更 |
| 概要 / schedule | /schedule でクラウドタスク自動化 |
| 概要 / Homebrew | 2 cask あり・自動更新なし |

---

## インスピレーションメモ

- `/schedule` 定期実行 — `/x-practices-search` を週次自動化して inbox を常に補充できそう（参照: docs.anthropic.com/overview）
- クラウドスケジュールタスク — NOCTA リリース後に「1週間後に SNS エンゲージメント分析」を自動実行できるかも（analytics-agent を定期起動）
- Channels 機能 — Telegram/Discord に NOCTA 完成楽曲のリリース通知を飛ばす自動化の参考に（PC 操作不要で受け取れる）

---

## セキュリティ・安全性への影響

- **v2.1.101 permissions.deny バグ**: hooks + `permissions.deny` を使用している場合、v2.1.101 以降への更新後に動作確認を推奨。以前は hooks の `ask` 決定が `deny` に上書きされていた可能性がある。NOCTA の `settings.json` に `permissions.deny` を設定している場合は確認タイミングとして活用すること。

---

## 適用しない理由がある項目

- **1M トークン コンテキスト（ベータ）**: Claude Code CLI 経由の通常会話では直接影響しない。将来的な大型ファイル生成時に参考情報として残す。
- **Homebrew 2 cask の使い分け**: CLAUDE.md より参照ファイル（references/）での管理が適切。

---

## CEOが確認すべき事項

1. **R-09 の Opus コスト補足（高優先度）**: Opus 4.6 が $5/$25/MTok（Sonnet の約1.7倍）に。旧 Opus 4.0/4.1（$15/$75）から大幅低下。「Opus はコストが高いから限定使用」という暗黙の前提が変わったため、R-09 の記述に現在の価格水準を補足することを推奨。
2. **`/effort` コマンドの認知**: デフォルト effort が "high" になったため、単純タスク時に `/effort medium` や `/effort low` を使うとトークン消費を削減できる。COST POLICY への追記を検討。
3. **Claude Code バージョン確認**: v2.1.97 の CJK 修正・v2.1.101 の permissions.deny バグ修正を受けるために、最新版への更新を確認してください。`claude --version` で確認可能。
