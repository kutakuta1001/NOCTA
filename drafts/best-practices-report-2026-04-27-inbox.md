# ベストプラクティスレビュー（インボックス一括）
日付: 2026-04-27
次回レビュー推奨: 2026-05-27以降（インボックスに5件貯まったら）
ソース:
  [docs.anthropic.com] リリースノート v2.1.118（hooks type:mcp_tool）
  [docs.anthropic.com] Claude Code overview（クラウドスケジュール済みタスク）
  [docs.anthropic.com] リリースノート v2.1.119（prUrlTemplate）
  https://x.com/DataChaz/status/2046351105274392670
  https://x.com/Joestar_sann/status/2048322964048019490
  https://x.com/Amu_Lab__/status/2048371519114379279
除外URL: なし

## 要約（3行以内）
今回の共通テーマは「Claude Codeのクラウド化・自動化強化・設定最適化」の3点。
hooks から MCP ツールを直接呼び出せる機能（v2.1.118）とクラウドスケジュール済みタスクが特に重要で、NOCTAの夜間自動化に直結する。
claude-code-setup 公式プラグインも現在の設定棚卸しのツールとして活用余地がある。

## NOCTAへの適用提案（未実装のもののみ）
| 優先度 | 対象 | 現状 | 提案内容 | 参照記事 |
|--------|------|------|----------|---------|
| 中 | CLAUDE.md セッション運用表 | クラウドスケジュール済みタスク未記載 | 「夜間長時間タスク実行」行を追加。PCオフでも継続可能な旨を記載 | docs.anthropic.com/overview |
| 中 | CLAUDE.md MCP管理セクション | DenyリストHooksのみ記載 | hooks type:"mcp_tool" の活用例（SVP生成後通知・ファイル更新後バックアップ）をHooks活用TIPSとして追記 | docs.anthropic.com/v2.1.118 |
| 低 | CLAUDE.md スキル設計原則 | skill-creator プラグインのみ記載 | claude-code-setup プラグイン（設定全般の棚卸し・最適化提案）を追記 | x.com/Amu_Lab__ |

## 記事ごとの主要ポイント
| 記事 | 要点（30文字以内） |
|------|-----------------|
| docs.anthropic.com/v2.1.118 | hooks→MCP直接呼び出し可能に |
| docs.anthropic.com/overview | PCオフで継続のクラウドタスク |
| docs.anthropic.com/v2.1.119 | prUrlTemplate・GitHub Enterprise対応 |
| x.com/DataChaz | Boris Cherny自身が5-10並列実行 |
| x.com/Joestar_sann | タスク別context file作成が最重要 |
| x.com/Amu_Lab__ | 公式プラグインで設定自動最適化 |

## インスピレーションメモ
- クラウドスケジュール済みタスク — 夜間PCオフで大型SVP生成・/best-practices-review 自動実行ができそう（楽になりそう）（参照: docs.anthropic.com/overview）
- boris cherny 5-10 agents並列 — /phase2-music・/phase4-release 以外でも積極的な並列エージェント活用の余地がありそう（創造的になりそう）（参照: x.com/DataChaz）
- claude-code-setup プラグイン — NOCTAの設定をスキャンさせると見落としていた最適化提案が出てきそう（楽しくなりそう）（参照: x.com/Amu_Lab__）

## セキュリティ・安全性への影響
なし（変更不要）。

## 適用しない理由がある項目
- prUrlTemplate（v2.1.119）: NOCTAはGitHubのみ使用のため現時点では不要
- Boris Cherny tips（Agent並列）: 既にR-09・AGENTS セクションでAgent Teams設計済み。追加提案なし

## CEOが確認すべき事項
1. **クラウドスケジュール済みタスクの活用**: PCオフでも継続実行できるAnthropicインフラ上のタスク機能が追加。/best-practices-review や大型SVP生成を夜間に走らせるユースケースで有効。CLAUDE.md セッション運用表への追記を推奨。
2. **hooks type:mcp_tool の設定検討**: v2.1.118以降、settings.json のhooksからMCPツールを直接呼び出せる。「svpファイル生成完了→macOS通知」「blog-data.js更新→Notionメモ自動記録」のような自動化が設計可能。現在はDenyリストのみhooks設定済み。
3. **claude-code-setup プラグインの試用**: Anthropic公式プラグイン「claude-code-setup」でNOCTAリポジトリをスキャンすると、現在の設定に対する改善提案が得られる可能性がある。CLAUDE.mdのskill-creatorと並べて記載する価値あり。
