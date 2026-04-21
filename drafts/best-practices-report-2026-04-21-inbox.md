# ベストプラクティスレビュー（インボックス一括）
日付: 2026-04-21
次回レビュー推奨: 2026-05-21以降（インボックスに5件貯まったら）
処理件数: 9件（manual: 8件 / xmcp: 1件）
未処理のまま残す件数: 7件（xmcp: 7件 → 次回に繰り越し）
除外URL: なし（インジェクション未検出・全件取得成功）

## 要約（3行以内）
今回は「モデルID廃止・移行」「hooks 2つの変更（if フィールド追加・file_path 絶対パス化）」が主軸。
CLAUDE.mdのR-09はモデル移行済みだが、Opus 4.7の128k出力制限の明記と、既存hooks設定の確認（破壊的変更）が実務上の優先事項。
Agent SDK・Channels・AIデザインツールは将来の自動化・モバイル化の布石として注目。

## NOCTAへの適用提案（未実装のもののみ）

| 優先度 | 対象 | 現状 | 提案内容 | 参照記事 |
|--------|------|------|----------|---------|
| 高 | hooks設定 | file_path使用hookが未確認 | v2.1.113でfile_pathが絶対パス化。~/.claude/settings.jsonのhookスクリプトを確認・修正 | hooks-filepath-absolute-v2113 |
| 高 | R-09 | Opus使用条件に出力量記述なし | 「出力が64k超見込みのタスクはOpus 4.7を優先」を追記。SVP生成・長文仕様書で実用的 | opus47-128k-output |
| 中 | hooks設定 | `if`フィールド未活用 | v2.1.110の`if`フィールドで`Bash(git *)`時のみ確認hookを発火。git安全ルール強化 | hooks-if-field-v2110 |
| 中 | 全スキル・エージェント定義 | 旧モデルID確認未実施 | claude-3-haiku-20240307 / claude-sonnet-4-20250514 / claude-opus-4-20250514 が廃止済み or 廃止予定。~/.claude/配下のファイルをスキャン | sonnet4-opus4-deprecated-jun2026 |
| 低 | Claude Codeバージョン | v2.1.116対応未確認 | `claude --version`でv2.1.116以降かチェック。以降ならMCP起動高速化が自動適用 | mcp-startup-optimization-v2116 |

## 記事ごとの主要ポイント

| 記事 | 要点（30文字以内） |
|------|-----------------|
| haiku-3-deprecated | Haiku 3廃止・4.5移行済みを確認 |
| sonnet4-opus4-deprecated-jun2026 | 2026-06-15廃止・旧IDチェック |
| opus47-128k-output | Opus 4.7出力128k・Sonnetの2倍 |
| agent-sdk-release | Claude CodeツールをSDKで呼び出せる |
| channels-feature | Telegram/DiscordからClaude操作 |
| mcp-startup-optimization-v2116 | MCP遅延ロードで起動高速化 |
| hooks-filepath-absolute-v2113 | file_path絶対パス化（破壊的変更） |
| hooks-if-field-v2110 | if条件で特定ツール時のみhook発火 |
| opus47-design-tool-announcement | Opus 4.7+AIデザインツール予告 |

## インスピレーションメモ
（今すぐ使わなくてもよい。楽になる・創造的になる・楽しくなる可能性があるもの）

- Channels機能 — TelegramからNOCTAプロジェクト状況をモバイル確認・コマンド送信できるかも（参照: docs.anthropic.com/channels）
- Agent SDK — svp-generator・lyric-poetをスクリプトからバッチ実行できるようになれば制作自動化の基盤に（参照: docs.anthropic.com/agent-sdk）
- Anthropicデザインツール — the-first-flower / NuWordのLPやSNSバナーがプロンプト1行で生成できるようになりそう（参照: x.com/pankajkumar_dev/2044281458999865495）

## セキュリティ・安全性への影響

**【要対応】hooks file_path 絶対パス化（v2.1.113）**
PreToolUse/PostToolUse hookスクリプトが相対パスで条件分岐していた場合、
v2.1.113以降では動作しなくなる。NOCTA hooks設定を確認する。

## 適用しない理由がある項目

- **Channels機能（Telegram/Discord）**: 現フェーズでは不要。セキュリティ設定の整備が必要なため導入は将来に
- **Agent SDK**: 現在のCLAUDE.md + スキルで十分。将来の自動化パイプライン設計時に再検討
- **Anthropic AIデザインツール**: 正式リリース後に試用判断（2026-04-21時点では予告段階）

## CEOが確認すべき事項

1. `~/.claude/settings.json` の hooks 設定を開き、`file_path` を参照するスクリプトがあれば絶対パス対応に修正（v2.1.113破壊的変更・優先度高）
2. CLAUDE.md R-09 に「出力が64k超見込みのタスク（498ノートSVP等）はOpus 4.7を優先」を追記するか判断
3. `~/.claude/commands/` および `~/.claude/agents/` に旧モデルID（claude-3-haiku-20240307等）が残っていないかスキャン（`grep -r "claude-3-haiku-20240307" ~/.claude/` で確認可）
4. xmcp インボックスの残り7件は次回 /best-practices-review を実行する際に処理（5件超えで実行推奨）
