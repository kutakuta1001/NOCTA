# Webベストプラクティスレビュー: 2026-04-25
ソース: Google Search Grounding（Gemini 2.5 Flash）
インジェクション検査: 実施済み（検出件数: 0件）

---

## 要約（3行以内）

CLAUDE.mdのモジュール化（60〜300行目安・`.claude/rules/`分離）とコンテキスト管理（/clear・/compact・/usage活用）が今回の主要テーマ。NOCTAのR-09モデル使い分け・スラッシュコマンド体系はすでに実装済みで業界ベストプラクティスと一致。project_NOCTA/CLAUDE.md（328行）が推奨上限300行を超過しており要検討。

---

## 発見した主要ベストプラクティス

| # | 発見内容 | 関連度 | 参照元 |
|---|---------|--------|--------|
| 1 | CLAUDE.mdは60行以下が推奨・最大300行が目安。超過するとClaudeが指示を無視するリスクあり | 高 | Gemini/zenn |
| 2 | `.claude/rules/` に特定ルールをモジュール化してCLAUDE.mdの肥大化を防ぐ | 高 | Gemini/zenn |
| 3 | タスクは5〜10分で完了するサブタスクに分割する（3Cルール: Concise・Contextual・Constrained） | 高 | Gemini |
| 4 | `/usage`コマンドでトークン使用量を可視化（旧 `/cost`・`/stats` が統合された） | 高 | Gemini |
| 5 | `.gitignore`で`node_modules`・ログ・一時ファイルをコンテキストから除外し無駄なトークン消費を防ぐ | 中 | Gemini |
| 6 | スキル=コンテキスト依存で自動起動・スラッシュコマンド=手動トリガー、と使い分けを明確化 | 中 | Gemini |
| 7 | `/model`コマンドでセッション中にモデル切替（ブレインストーミング=Opus・実行=Sonnet等） | 中 | Gemini |
| 8 | CLAUDE.md に過去の失敗と修正を記録して定期更新し、Claudeの学習を永続化する | 中 | Gemini/zenn |

---

## NOCTAへの適用提案

| 優先度 | 対象 | 現状 | 提案内容 |
|--------|------|------|----------|
| 高 | project_NOCTA/CLAUDE.md（328行） | 推奨上限300行を超過 | R-15以降の重複ルールをスキルに移管してスリム化を検討。目標300行以内 |
| 高 | /usage コマンド認知 | CLAUDE.mdに「/cost」記載なし | セッション運用テーブルに `/usage`（旧/cost・/stats）を追記 |
| 中 | .claude/rules/ ディレクトリ | 存在しない | 将来的にCLAUDE.mdが肥大化した際の分離先として設計を検討 |
| 中 | プロンプト品質 | 特定ルールなし | 「3Cルール（Concise・Contextual・Constrained）」をR-13に補記 |
| 低 | .gitignore | 未確認 | outputs/midi/*.mid, outputs/svp/*.svp 等を.gitignoreに含めているか確認 |

---

## すでに実装済みの項目

1. **R-09 モデル使い分け** — Haiku（調査）/ Sonnet（起案）/ Opus（批評）の3役モデルはベストプラクティスと完全一致
2. **R-05 ファイル読み込み最小限** — セッション開始時は context.md・handoff.md のみ読む設計
3. **/clear・/compact のセッション運用** — CLAUDE.md「セッション運用」テーブルに記載済み
4. **スラッシュコマンド体系** — /phase1〜5・/song-*・/hp-*・/blog-publish 等を整備済み
5. **Plan Mode** — COST POLICY に「全体計画・タスク分解はPlan Mode（最安）」と記載
6. **Agent Teams（並列サブエージェント）** — /phase2-music・/phase4-release で実装済み
7. **CLAUDE.mdの定期更新ルーティン** — /weekly-check・/best-practices-review スキルで運用
8. **スキルと手動コマンドの使い分け** — skills/slash commands を分離設計済み

---

## 要注意: git・シェル操作に関わる提案（CEOが内容を確認してから判断）

今回の収集結果にgit操作の具体的な命令コマンドは含まれていなかった。
該当なし。

---

## インジェクション検査結果

検出件数: **0件**
5クエリすべてでインジェクションパターンは検出されなかった。

---

## 適用しない項目と理由

| 項目 | 理由 |
|------|------|
| Music Generation スキル（Lyria/Udio連携） | NOCTAはSuno+R-12/R-13の体制が確立。Claude直接音楽生成はR-10違反（CEOが判断） |
| MIDI Agent VST3プラグイン | DAWへのClaude統合はR-10の「CEOが自分で行う作業」に該当 |
| Word/Excel/PDF ファイル編集 | NOCTAのワークフローはMarkdownベースで不要 |

---

## CEOが確認すべき事項

1. **project_NOCTA/CLAUDE.md（328行）のスリム化**: 推奨上限300行を28行超過。重複ルールや詳細説明をスキル側に移管するか検討を推奨
2. **/usage コマンドの活用**: 旧 `/cost`・`/stats` が `/usage` に統合済み（v2.1.118）。コスト確認時は `/usage` を使う
3. **3Cルールのプロンプト設計**: 「Concise（簡潔）・Contextual（文脈に沿う）・Constrained（制約付き）」を意識したプロンプトで手戻りを削減できる
