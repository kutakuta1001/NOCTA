# Webベストプラクティスレビュー: 2026-05-12
ソース: Google Search Grounding（Gemini 2.5 Flash）
インジェクション検査: 実施済み（検出件数: 0件）

## 要約（3行以内）

CLAUDE.mdの「60行以内」推奨がNOCTAの現状（300行超）と乖離している点が最大の発見。
コンテキスト80%到達前のcompact実行という具体的指標と、PostToolUseフックの自動リント活用が新規の適用候補。
その他の主要ベストプラクティス（計画モード・モデル使い分け・/clear・パススコープ）はすでに実装済み。

---

## 発見した主要ベストプラクティス

| # | 発見内容 | 関連度 | 参照元 |
|---|---------|--------|--------|
| 1 | CLAUDE.mdは60行以内に抑える（最大300行）。Claudeが推測できる内容は書かない | 高 | Gemini Q1/Q2 |
| 2 | コンテキスト使用率80%到達前にcompact実行（具体的指標として新規） | 高 | Gemini Q5 |
| 3 | 検証方法（テスト・期待出力・完了条件）をClaudeに提供するとパフォーマンスが劇的に向上 | 高 | Gemini Q2 |
| 4 | PostToolUseフックでファイル変更後に自動リント・型チェックを実行 | 中 | Gemini Q4 |
| 5 | Claude Routinesが外部サービス（Slack/Gmail/Calendar/Notion）と連携可能 | 中 | Gemini Q4 |
| 6 | プラグインシステムがプロジェクトスタックを自動検出し最適MCP推薦 | 中 | Gemini Q4 |
| 7 | パススコープルール: 特定ディレクトリのCLAUDE.mdは該当作業時のみ読込 | 高 | Gemini Q5 |

---

## NOCTAへの適用提案

| 優先度 | 対象 | 現状 | 提案内容 |
|--------|------|------|----------|
| 高 | CLAUDE.md長さ | 約400行（NOCTA/CLAUDE.md）+ 別ファイル多数 | 「常時有効ルール」のみ残してスキルに移す整理を検討。R-01〜R-15のうち、特定フェーズ限定のルールはスキルファイルへ |
| 高 | コンテキスト監視 | 「15〜20メッセージでcompact」という行数目安 | 「80%到達前にcompact」という使用率指標も並記する（セッション運用セクション更新候補）|
| 中 | PostToolUseフック | website作業後の検証は手動 | website/ ファイル編集後に website-reviewer エージェントを自動起動するhookを検討 |
| 中 | /goal コマンド活用 | 長期タスクはhandoff.mdで手動管理 | /phase2-music・/phase4-releaseなど多ターンタスクで /goal を使い完了条件を事前設定 |
| 低 | Claude Routines外部連携 | Channels機能は記載済み | Notion/Google Calendar連携は将来フェーズ4（SNS管理）の自動化に検討可能 |

---

## すでに実装済みの項目

1. **計画モード活用** — セッション運用欄に「COST POLICY」「Plan Mode」として記載済み
2. **CLAUDE.md 2ファイル階層（パススコープ）** — `/NOCTA/CLAUDE.md` と `website/CLAUDE.md` で実施済み
3. **モデル使い分け** — R-09で Haiku/Sonnet/Opus の3段階設定済み
4. **タスク細分化・3Cルール** — R-13「Concise・Contextual・Constrained」として実装済み
5. **/clear・/compact** — セッション運用セクションに明記済み
6. **Routines/schedule** — /schedule スキル・/loop スキルで対応済み
7. **早期フィードバック・中断** — R-10・R-13でCEO判断優先ルール設定済み

---

## 要注意: git・シェル操作に関わる提案（CEOが内容を確認してから判断）

今回の収集結果にgit操作・シェルコマンドに関する提案は含まれていませんでした。

---

## インジェクション検査結果

危険パターン検出: 0件
検査済みパターン: ignore previous instructions / 前の指示を無視 / git push --force / git reset --hard / rm -rf / curl|bash / eval() / APIキー入力要求

---

## 適用しない項目と理由

| 項目 | 理由 |
|------|------|
| Ableton Live向けスクリプト生成 | NOCTAはStudio One Pro使用（Ableton Live不使用） |
| Microsoft Word アドイン活用 | NOCTAのドキュメント管理はmarkdown/Claude Code CLIで完結 |
| 「Computer Use」ブラウザ自動化 | HP更新はCLI経由で完結・視覚的ブラウザ操作は不要 |
| プラグインスタック自動検出 | 現状のMCP構成（5個以内）で十分・複雑化リスクあり |

---

## CEOが確認すべき事項

1. **CLAUDE.md の整理**: 「60行以内推奨」に対して現状は約400行。削減する場合、R-01〜R-15のどのルールをスキルに移すかをCEOが判断する（例: R-07/R-11/R-12はフェーズ限定のため移動候補）
2. **コンテキスト80%指標**: 現在の「15〜20メッセージでcompact」に加えて数値指標を使う場合、セッション運用セクションへの記述追加が必要
3. **PostToolUseフックの自動reviewer起動**: website-reviewerエージェントを自動起動するhookを導入するか判断（設定済みhookとの競合確認が必要）
