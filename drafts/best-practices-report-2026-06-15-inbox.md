# ベストプラクティスレビュー（インボックス一括）
日付: 2026-06-15
次回レビュー推奨: 2026-07-15 以降（インボックスに5件貯まったら）
ソース（処理14件）:
- manual 7件（公式ドキュメント / CHANGELOG 由来・本セッションの /claude-docs-review で収集）
- xmcp 7件（X収集ツイート）
除外URL: なし（インジェクション検出0件・WebFetch不要のため取得失敗0件）

## 要約（3行以内）
今回のソースは「Claude Code 運用の成熟化（セルフレビュー・safe-mode・多段サブエージェント）」「新モデル Fable 5/Mythos 5 の登場」「AI音楽の制作スタックと権利リスク（ACE-Step・MusicMint転載）」の3テーマに集約される。
NOCTA の CLAUDE.md は基盤（CLAUDE.md/スキル/hooks/サブエージェント/承認ゲート）を既に網羅しており、新規の大改訂は不要。
追記候補は「--safe-mode のトラブルシュート手段」「エージェント出力前セルフレビューの明文化」「AI楽曲の無断転載モニタリング観点」の3点。

## NOCTAへの適用提案（未実装のもののみ）
| 優先度 | 対象 | 現状 | 提案内容 | 参照記事 |
|--------|------|------|----------|---------|
| 高 | CLAUDE.md セッション運用表 | --safe-mode 未記載 | 「設定起因の起動不具合切り分け: `claude --safe-mode`（CLAUDE.md/hooks/plugins/skills/MCP を全無効化）」を追記 | changelog v2.1.169 |
| 中 | copyright-agent / legal_check | 自作楽曲の無断転載対策が未定義 | リリース楽曲のウォーターマーク・出典明記・転載モニタリング方針を legal_check の確認項目に追加 | x.com/SoiyaChannel（MusicMint） |
| 中 | 各エージェントの出力規律 | 起案→批評・承認ゲートはあるが「提示前セルフレビュー」は未明文化 | 主要エージェント（lyric-poet/music-spec-writer 等）に「提示前セルフチェック観点」を1〜2行追加 | x.com/0x_rody |
| 低 | R-13 / PVパイプライン | ACE-Step 運用Tips・T2V候補が限定的 | ACE-Step の「サウンド/構造分離」を仕様書→生成設計に応用。LTX 2.3 を T2V比較候補に追加検討 | x.com/deAPI_, x.com/seizuresalad |

## 記事ごとの主要ポイント
| 記事 | 要点（30文字以内） |
|------|-----------------|
| x.com/0x_rody | 出力前にセルフレビューさせる設定 |
| x.com/akhilesh9235 | 必須コマンド26個（本文にリストなし） |
| x.com/TAIKI_PCyoutube | 日本語Claude Code完全入門 |
| x.com/Igor_Buinevici | Anthropic無料コース（公式学習） |
| x.com/deAPI_ | ACE-Step1.5 サウンド/構造を分離 |
| x.com/seizuresalad | 音先行のAI音楽→映像スタック |
| x.com/SoiyaChannel | MusicMintがSUNO楽曲を無断転載 |
| platform.claude.com/models | Fable5/Mythos5 登場・Opus4.8 effort既定high |
| github.com CHANGELOG | safe-mode/5階層subagent/enforceModels |

## インスピレーションメモ
- `--safe-mode` — hooks や CLAUDE.md をいじって壊した時に一発で素の状態へ戻せて、デバッグが楽になりそう（参照: changelog v2.1.169）
- ACE-Step「サウンド/構造分離」 — 歌詞固定でジャンルだけ差し替え試行ができ、編曲の方向性比較が楽しくなりそう（参照: x.com/deAPI_）
- サブエージェント5階層ネスト — 大型フェーズで調査→設計→実装→検証を深い階層に分解でき、Agent Teams 設計の自由度が上がりそう（参照: changelog v2.1.172）
- 提示前セルフレビュー — エージェントが叩き台を出す前に自己点検することで、CEOレビューの往復が減って制作がスムーズになりそう（参照: x.com/0x_rody）

## セキュリティ・安全性への影響
- インジェクション検査: 14件すべてパス（危険パターン検出0件）
- enforceAvailableModels（v2.1.175）は managed/エンタープライズ向け設定。個人運用の NOCTA には不要。
- --safe-mode はトラブルシュート専用で破壊的操作を含まない。安全に追記可能。

## 適用しない理由がある項目
- Claude Fable 5 / Mythos 5 のモデル棲み分け再議論: CEO確認により Fable 5 は現在利用不可のためスキップ。利用可能になった時点で /model-review を再検討（model-lineup.md は据え置き）。
- enforceAvailableModels: managed設定でありスタッフゼロ個人運用に不要。
- 26 essential commands / 完全入門 / 無料コース: 既存運用が入門段階を超えており新規知見は薄い。学習リソースとして記録のみ。

## CEOが確認すべき事項
1. CLAUDE.md セッション運用表への `--safe-mode` 追記を承認するか（手動編集が必要・自動変更はしない）。
2. copyright-agent / legal_check への「AI楽曲の無断転載モニタリング」観点追加を行うか。
3. 主要エージェントへの「提示前セルフレビュー」明文化を行うか（手戻り削減 vs 記述増加のトレードオフ）。
4. Web収集（/web-practices-review）は今回 Gemini API 過負荷でほぼ失敗。次回 weekly-check 時に再実行するか。
