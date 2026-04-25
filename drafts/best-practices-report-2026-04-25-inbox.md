# ベストプラクティスレビュー（インボックス一括）
日付: 2026-04-25
次回レビュー推奨: 2026-05-25以降（インボックスに5件貯まったら）
ソース: docs.anthropic.com（CHANGELOG v2.1.117〜119 / モデル一覧 / Claude Code概要）全9件テキスト直接参照
除外URL: なし（インジェクション検出0件・取得失敗0件）

---

## 要約（3行以内）

v2.1.117〜119の3バージョンでClaude Codeに複数の実用改善が入った。主要テーマは「セッション運用コマンドの整理（/usage統合）」「コンテキスト管理の強化（Opus 4.7の1M窓修正・/resume高速化）」「エージェント・Hook連携の拡張（permissionMode/フォーク型/MCP直呼び出し）」の3つ。NOCTAのCLAUDE.mdは機能追加への対応が数か所残っている。

---

## NOCTAへの適用提案（未実装のもののみ）

| 優先度 | 対象 | 現状 | 提案内容 | 参照記事 |
|--------|------|------|----------|---------|
| 高 | CLAUDE.md セッション運用テーブル | `/cost`・`/stats` 記載なし | `/usage`（旧/cost・/stats統合）を追加。コスト確認はこれ1本 | v2118-usage-command |
| 高 | R-09 Opus 4.7の仕様 | 最大出力128kのみ記載 | コンテキストウィンドウが1M（修正済み）を明記。Haiku 4.5は200kの対比も加える | opus47-sonnet46-1m-context / v2117-opus47-context-bug-fix |
| 中 | CLAUDE.md セッション運用テーブル | `/teleport` 未記載 | 「Web/iOSセッションをCLIへ転送」として追記。外出先→スタジオの引き継ぎに活用 | teleport-command |
| 中 | CLAUDE.md セッション運用テーブル | `claude --resume`（選択）のみ | 要約オプションの説明を補記（最大67%高速・長期プロジェクト再開向け） | v2117-resume-summary |
| 低 | CLAUDE.md AGENTS テーブル | FORK_SUBAGENT未記載 | Agent Teams起動時のオプションとして `CLAUDE_CODE_FORK_SUBAGENT=1` を補記 | v2117-fork-subagent |
| 低 | エージェント定義ファイル | permissionMode未明記 | `~/.claude/agents/` の各定義ファイルに `permissionMode` を明示することを検討 | v2119-agent-permissionmode-config |

---

## 記事ごとの主要ポイント

| 記事 | 要点（30文字以内） |
|------|-----------------|
| CHANGELOG v2.1.119 | --agentでpermissionMode自動適用 |
| CHANGELOG v2.1.118 (hooks) | HooksからMCPツール直呼び出し |
| CHANGELOG v2.1.118 (usage) | /cost・/statsが/usageに統合 |
| CHANGELOG v2.1.117 (context) | Opus 4.7コンテキスト1M修正 |
| CHANGELOG v2.1.117 (fork) | フォーク型サブエージェント有効化 |
| CHANGELOG v2.1.117 (resume) | /resume高速化・要約オプション追加 |
| モデル一覧（context window） | Opus/Sonnet 1M・Haiku 200k |
| モデル一覧（batches） | Batches APIで300k出力対応 |
| Claude Code概要（teleport） | Web/iOS→CLIセッション転送 |

---

## インスピレーションメモ

- **Hooks + xmcp MCP連携** — PreToolUse hookからxmcpのsearchPostsRecentを直接呼び出してフェーズ1トレンド収集を自動化できるかも（参照: v2118-hooks-mcp-tool）
- **Message Batches API** — SNSカレンダー1ヶ月分やSVP大量生成をBatches APIで50%コスト削減＋300k出力で一気に生成できる可能性（参照: message-batches-300k-output）
- **フォーク型サブエージェント** — /phase2-musicでトレンド分析の文脈を全エージェントが共有しながら並列起草できる。楽曲コンセプトの一貫性向上に使えそう（参照: v2117-fork-subagent）
- **/teleport × スタジオワーク** — 外出中にモバイルで楽曲コンセプトをClaude Codeと詰めて、スタジオ到着後すぐCLIで続きからSVP生成に入れる（参照: teleport-command）

---

## セキュリティ・安全性への影響

なし（今回の変更はすべて機能追加・バグ修正）

---

## 適用しない理由がある項目

| 項目 | 理由 |
|------|------|
| Message Batches API（300k出力） | 非同期APIのためリアルタイム確認が必要なSVP生成・承認フローには不向き。将来の大量バッチ生成時に検討 |
| FORK_SUBAGENT（Agent Teams） | コンテキスト消費増大リスクあり。/phase2-music・/phase4-releaseでテストしてから判断推奨 |
| エージェントpermissionMode明示 | 現状の動作に問題なし。新エージェント追加時に合わせて対応でよい |

---

## CEOが確認すべき事項

1. **CLAUDE.md セッション運用テーブルへの `/usage` 追記**: 旧 `/cost`・`/stats` が v2.1.118 以降は `/usage` に統合済み。すぐに更新すべき（2つのレビューで同じ指摘）
2. **R-09のOpus 4.7 コンテキストウィンドウ1M明記**: v2.1.117のバグ修正でOpus 4.7の実際のウィンドウが1Mに戻った。「128k出力」との区別（出力=128k・入力含むウィンドウ=1M）を明記するとR-09の精度が上がる
3. **/teleport・/resume要約オプションのセッション運用追記**: 中優先度。外出先でのモバイル制作ワークフローが可能になる機能。使う頻度に応じて追記検討
