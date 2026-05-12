# ベストプラクティスレビュー（インボックス一括）
日付: 2026-05-12
次回レビュー推奨: 2026-06-12以降（インボックスに5件貯まったら）
ソース: docs.anthropic.com（manual 5件）+ x.com tweets（xmcp 6件）
除外URL: なし（インジェクション検出 0件・取得失敗 0件）

---

## 要約（3行以内）

v2.1.133〜139の新機能（/goal・Agent View・hooks+effort）はNOCTAのCLAUDE.md未記載で適用候補。
Opus 4.7の実質コンテキスト容量（≒555k words）はSonnet 4.6より少ない点がSVP生成時に影響しうる。
ツイート群はNOCTAの5層設計・CLAUDE.md投資・ace-step-ui採用方針すべてを外部から追認した。

---

## NOCTAへの適用提案（未実装のもののみ）

| 優先度 | 対象 | 現状 | 提案内容 | 参照記事 |
|--------|------|------|----------|---------|
| 高 | セッション運用 | 記載なし | /goalコマンドを追記（完了条件設定・複数ターン自動継続） | 2026-05-12-changelog-v2139-goal-command |
| 高 | セッション運用 or SLASH COMMANDS | 記載なし | Agent Viewを追記（全セッション一覧監視・/agent-view） | 2026-05-12-changelog-v2139-agent-view |
| 中 | R-09（モデル使い分け） | 「1M tokens」のみ | Opus 4.7に「≒555k words（新トークナイザー）」の注記を追加 | 2026-05-12-models-opus47-tokenizer |
| 中 | R-09（Hooksセクション or メモ） | effort.levelに未言及 | hooksからCLAUDE_EFFORT環境変数を受け取れることを記録 | 2026-05-12-changelog-v2133-hooks-effort-level |
| 低 | R-09（Haikuの説明） | 「最安・200k」のみ | Haiku 4.5が拡張思考対応である旨を一行追記 | 2026-05-12-models-haiku45-extended-thinking |

---

## 記事ごとの主要ポイント

| 記事 | 要点 |
|------|-----|
| v2.1.133 hooks+effort | hooksでCLAUDE_EFFORTを参照しeffort分岐可能に |
| v2.1.139 /goal | 完了条件設定・複数ターン自動継続 |
| v2.1.139 Agent View | 全バックグラウンドセッションを1画面で一覧 |
| Opus 4.7 tokenizer | 1M tokens≒555k words（Sonnet 4.6の750kより少ない） |
| Haiku 4.5 thinking | 拡張思考あり・適応的思考なし・200k context |
| @Sabrina_Ramonov | 5層モデル（memory→extensions→automation→intelligence→pipeline）|
| @SantiTorAI | Claudeユーザーの7%のみがCC利用・367エンゲージ確認 |
| @Oluwaphilemon1 | claude-code-best-practice 84 tips（Boris Cherny監修） |
| @ClaudeCode_love | 12の知識が日本でバズ・68ブックマーク |
| @yuruto23 | CLAUDE.md資産は他ツール連携でも有効・30分でCC+Codex統合 |
| @StarHistoryHQ | ace-step-ui 3.1K⭐・Suno代替ローカル生成が成熟段階へ |

---

## インスピレーションメモ
（今すぐ使わなくてもよい。楽になる・創造的になる・楽しくなる可能性があるもの）

- /goal + Agent View — 夜間に複数エージェントを起動して翌朝全成果物が揃う「夜間自動制作」ワークフローが現実的になってきた（参照: v2.1.139）
- ace-step-ui 3.1K⭐ — ローカル音楽生成が成熟段階へ。NuWord次作でSuno代替として本格試用するタイミングが来た（参照: x.com/StarHistoryHQ）
- hooks + CLAUDE_EFFORT — フェーズごとに自動でeffortを切り替えるhookを設計すると、コマンド1つでフェーズ最適モデルに自動切替できる（参照: v2.1.133）
- Claude Code 7%ユーザー — NOCTAの先進性を発信する際に「Claudeユーザーの93%が使っていないClaude Codeをフル活用」というメッセージとして使える（参照: x.com/SantiTorAI）

---

## セキュリティ・安全性への影響

なし（今回の収集内容にセキュリティ変更は含まれない）

---

## 適用しない理由がある項目

| 項目 | 理由 |
|------|------|
| CC + Codex 両用（@yuruto23） | NOCTAはClaude Code単独で完結しており、Codex導入は現時点で不要 |
| claude-code-best-practice 84 tips | referencesスキルに既に記録済み（重複） |
| 12の知識（@ClaudeCode_love） | NOCTAのCLAUDE.mdに全12概念が既に実装済み |
| @Sabrina_Ramonov 5層モデル | NOCTAは5層すべてを実装済み（外部検証として記録のみ） |

---

## CEOが確認すべき事項

1. **CLAUDE.mdへの追記 3点**: セッション運用セクションに「/goal（完了条件設定・複数ターン継続）」「Agent View（全セッション一覧 /agent-view）」を追記するか判断してください
2. **R-09への注記 2点**: Opus 4.7に「≒555k words（新トークナイザー）」、Haiku 4.5に「拡張思考対応あり」を追加するか判断してください
3. **ace-step-ui 試用タイミング**: 3.1K⭐に成長したことを踏まえ、NuWord完成後の次作でローカル音楽生成（R-12）を本格試用するか判断してください
