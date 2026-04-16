# ベストプラクティスレビュー（インボックス一括）
日付: 2026-04-16
次回レビュー推奨: 2026-05-16 以降（インボックスに5件貯まったら）
ソース:
- https://x.com/i/status/2038286026284667239
- https://x.com/i/status/2039840802504077655
- https://x.com/i/status/2041489622061273471
- https://x.com/i/status/2042601431409267004
- https://x.com/i/status/2042237392510484504
- https://x.com/i/status/2042555449116102988
- https://x.com/i/status/2042758779301957823
- https://x.com/i/status/2042241063612502162
除外URL: なし
インジェクション検査: 実施済み（検出: 0件）

---

## 要約（3行以内）
今回はトークン最適化・CLAUDE.md運用・新MCP/ツール情報が中心。NOCTAの既存ルール（R-09モデル使い分け・CLAUDE.md階層・auto-memory・Plan Mode）はすでに業界ベストプラクティスと一致していることが確認できた。未実装として注目度が高いのは「vidIQ MCP（YouTubeデータ直結）」と「DESIGN.md（HP制作の一貫性向上）」の2点。

---

## NOCTAへの適用提案（未実装のもののみ）

| 優先度 | 対象 | 現状 | 提案内容 | 参照記事 |
|--------|------|------|----------|---------|
| 高 | セッション運用 | /compact の記載のみ | 「Edit prompt（追加メッセージではなく元プロンプトを編集）」「15〜20メッセージで新チャット+要約ペースト」をセッション運用欄に追記 | claude-usage-limits-10-tips |
| 高 | MCP管理（CLAUDE.md） | 必要時のみ有効化として空欄 | vidIQ MCPを「/phase1-trend強化オプション」として追記。無料ベータ中の今が試す好機 | vidiq-mcp-youtube |
| 中 | website/CLAUDE.md | デザイン規則はindex.htmlに分散 | NOCTAブランドのDESIGN.mdを1枚作成する提案。楽曲LP・新ページ追加時の設計効率が向上 | design-md-for-ai |
| 中 | drafts/article-notes | 現在ファイル保存のみ | LLM Wikiパターンをarticle-notesに適用。index.md + log.mdを追加してObsidianで可視化 | llm-wiki-obsidian |
| 低 | SLASH COMMANDS | /simplify 未記載 | /simplify（フェーズ完了後のリファクタリング指示）をコマンド一覧に追記 | claudecode-best-practice-matome |
| 低 | セキュリティ設定 | R-02/R-03でルール定義済み | Claude Code設定画面のDenyリストに危険コマンドを明示的に登録（確認推奨） | claude-code-9-settings |

---

## 記事ごとの主要ポイント

| 記事 | 要点（30文字以内） |
|------|-----------------|
| x.com/.../2038286026284667239 | Editで履歴肥大化防止・15〜20件で新チャット |
| x.com/.../2039840802504077655 | Claude Code全87Tipsの日本語解説 |
| x.com/.../2041489622061273471 | xurl（公式X CLI）はxmcpより軽量 |
| x.com/.../2042601431409267004 | ハッカソン優勝の27エージェント環境OSS |
| x.com/.../2042237392510484504 | DESIGN.md=AIに渡せる1枚のデザイン憲法 |
| x.com/.../2042555449116102988 | Denyリスト設定後にAuto Modeで3〜5倍速 |
| x.com/.../2042758779301957823 | vidIQ MCPでYouTubeデータ直結・無料ベータ |
| x.com/.../2042241063612502162 | LLM WikiはRAGと違い知識がコンパイル蓄積 |

---

## インスピレーションメモ
（今すぐ使わなくてもよい。楽になる・創造的になる・楽しくなる可能性があるもの）

- vidIQ MCP — NOCTAの音楽カテゴリで競合チャンネル・バズ動画をリアルタイム分析でき、/phase1-trendが格段に強化されそう（参照: x.com/.../2042758779301957823）
- LLM Wiki + Obsidian — article-notesをObsidianで育てると「NOCTAナレッジウィキ」として過去ノウハウがどんどん検索・参照できるようになりそう（参照: x.com/.../2042241063612502162）
- /voice コマンド — SynthVのパラメータ調整をキーボードなしで口頭指示できるようになるかも（参照: x.com/.../2039840802504077655）
- DESIGN.md — NOCTAのブランドデザインをDESIGN.md化しておくと、次の楽曲LP・アーティストページが2分でできるようになりそう（参照: x.com/.../2042237392510484504）
- everything-claude-code — AgentShieldのセキュリティテスト1,282件というスケールは、NOCTAスキルの品質保証の参考になりそう（参照: x.com/.../2042601431409267004）

---

## セキュリティ・安全性への影響
（変更が必要な場合のみ記載）

vidIQ MCPのURLをClaude.ai Connectorsに追加する場合は、読み取り専用ツールのみ許可することを確認すること。書き込み系ツール（動画の操作等）がある場合はALLOWLISTで制限する（R-03準拠）。

---

## 適用しない理由がある項目

- **xurl への移行**: xmcpはポート8000で安定稼働中。移行コストに対するメリットが現時点では不明確。xmcp障害時の代替として記録に留める。
- **everything-claude-code の直接導入**: NOCTAは音楽制作特化の構成であり、コード開発向けの27エージェント体制は過剰。スキル設計の参考として閲覧するに留める。
- **/schedule によるクラウド定期実行**: NOCTAのワークフローはCEO主導のセッション型であり、無人定期実行のユースケースは現在想定外。

---

## CEOが確認すべき事項

1. **vidIQ MCPを試したいか**: 無料ベータ中の今が機会。claude.ai/settings/connectors でMCPサーバーURL（https://mcp.vidiq.com/mcp）を追加するだけ。/phase1-trendを強化できる。試すならCLAUDE.mdのMCP管理セクションに追記したい。
2. **DESIGN.md作成の優先度**: 次の楽曲LP制作前にNOCTAブランドのDESIGN.mdを1枚作っておくと、今後の作業が楽になる。作業指示があればいつでも着手可能。
3. **セキュリティDenyリストの確認**: Claude Code設定画面でDenyリストを確認・設定しているか。R-02/R-03の論理ルールを設定ファイルにも反映することで誤操作をハード的に防止できる。
