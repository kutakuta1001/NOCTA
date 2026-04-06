# ベストプラクティスレビュー（インボックス一括）
日付: 2026-04-06
ソース:
- https://zenn.dev/atamaplus/articles/claude-feature-dev
- https://zenn.dev/aki_think/articles/978556f1652aa6
- https://developers.openai.com/blog/designing-delightful-frontends-with-gpt-5-4
- https://dev.classmethod.jp/articles/kiro-cli-nyuumon/
- https://qiita.com/nogataka/items/c2e73515e65533986421

除外URL: なし（インジェクション検査完了・全件クリア）

---

## 要約（3行以内）

今回の5記事の共通テーマは「AIコーディングツールの規律化」。強力になったAIが「思いつき実装」に走りがちな問題に対し、探索→設計→実装→検証の多段階フローで品質を担保するアプローチが複数の記事で論じられた。
NOCTAはSuperpowersプラグインの導入・サブエージェント設計・スキル/エージェント二層構造など先行実践済みの項目が多く、現在の設計が業界トレンドと一致していることを確認できた。
即時適用価値があるのは「常時ルール vs 状況限定スキルの明示化」と「既存コード変更時の調査フェーズ追記」の2点。

---

## NOCTAへの適用提案

| 優先度 | 対象 | 現状 | 提案内容 | 参照記事 |
|--------|------|------|----------|---------|
| 高 | CLAUDE.md R-05 | 「セッション開始時は context.md と handoff.md のみ読む」とある | 「既存コードへの変更・機能追加を行う場合は、変更対象ファイルのコードベース調査フェーズ（Read → 関連ファイル把握）を実装前に必ず設ける」を R-05 の補足として追加 | claude-feature-dev |
| 高 | CLAUDE.md スキル説明 | スキルの使い分け説明がない | 「CLAUDE.md には常時適用ルールのみ記載。状況限定のワークフローはスキル（~/.claude/commands/）に分離する」というコンテキストエンジニアリング原則を RULES か CODEMAP セクションに1行追記 | 978556f1652aa6 |
| 中 | /visual-prompt スキル | プロンプト生成時の制約定義が任意 | プロンプト冒頭に「色数・スタイル・禁止要素」の制約を先に定義するステップを追加。ムードボード相当の参考作品URLも求めるよう改修 | designing-delightful-frontends |
| 低 | CLAUDE.md セッション運用 | /btw の説明が1行のみ | Kiro CLI の Tangent Mode（脱線を本流から分離）と同じ思想であることを注記し、「調査・質問には /btw を積極活用」という推奨文を追加 | kiro-cli-nyuumon |
| 低 | Superpowers スキル全般 | 既に導入済み | 現状で十分。本記事は思想的背景の理解用として article-notes に保存済み | c2e73515e65533986421 |

---

## 記事ごとの主要ポイント

| URL | 要点（30文字以内） |
|-----|-----------------|
| zenn.dev/.../claude-feature-dev | 既存コード調査→質問→実装の3段階 |
| zenn.dev/.../978556f1652aa6 | 常時ルールとSkillsの二層分離 |
| developers.openai.com/...gpt-5-4 | 制約先行・ムードボードで精度向上 |
| classmethod.jp/.../kiro-cli | /btw と同思想の脱線機能あり |
| qiita.com/.../c2e73515... | Superpowers 思想の解説記事 |

---

## セキュリティ・安全性への影響

Kiro CLI（AWS製）の記事で「Free Tierユーザーは学習対象となるため、テレメトリ・コンテンツ共有を初期設定で無効化すること」が推奨されていた。
Claude Code 側でも類似の設定（usage data の共有設定）があれば確認を推奨。NOCTAの運用には直接影響しない。

---

## 適用しない理由がある項目

- **GPT-5.4 フロントエンド設計手法**（OpenAI固有のツール・API依存のため）
- **Kiro CLI 移行**（AWS依存・Claude Code との並列維持は管理コスト増のためROI低）
- **Superpowers 追加導入**（既に実践済みのため）

---

## CEOが確認すべき事項

1. **CLAUDE.md R-05 補足追記**: 「既存コードへの変更時は変更対象の事前調査フェーズを設ける」という1行を R-05 に追加することで、website 改修時の fix 率をさらに下げられる可能性がある。適用するかどうかを確認してください。
2. **スキル vs CLAUDE.md の二層分離原則の明文化**: 「常時ルール = CLAUDE.md、状況限定 = スキルファイル」を1行明記すると将来のスキル設計方針が一貫する。CODEMAP または RULES セクションへの追記を検討してください。
