# ベストプラクティスレビュー（インボックス一括）
日付: 2026-04-26
次回レビュー推奨: 2026-05-26以降（インボックスに5件貯まったら）
ソース（取得成功）: qiita.com × 2 / zenn.dev × 1 / github.com × 1 / x.com × 7（テキスト直接）
除外URL: https://x.com/i/status/2047705124743659867（取得失敗・402）
インジェクション検出: 0件

---

## 要約（3行以内）

11件のうち「ハーネスエンジニアリング」「Claude Design」「Obsidianの落とし穴」「情報収集4手法」がNOCTAワークフローと高い関連性を持つ。Claude CodeのOpus 4.7運用・初期設定順序・スキル設計規約はNOCTAでほぼ実装済みで「現状確認」バッチ。AI-MV制作パイプライン（Dreamina Seedance 2.0 + ACE-Step）は将来のPV制作強化に直結する新情報。

---

## NOCTAへの適用提案（未実装のもののみ）

| 優先度 | 対象 | 現状 | 提案内容 | 参照記事 |
|--------|------|------|----------|---------|
| 中 | SLASH COMMANDS | `/design-status`・`/lp-create` 等は記載済み | `Claude Design` をHP管理セクションのSLASH COMMANDSに追加。`/design-create [種別]` または既存の `/lp-create` に Claude Design使用オプションを追記 | claude-design-complete-guide |
| 中 | R-04（外部ツール） | Suno/Runway/Klingを記載済み | `Dreamina Seedance 2.0`（T2V）をPV制作ツール選択肢としてR-04またはR-12リストに追加 | ai-mv-gpt-image2-ace-step |
| 低 | /phase1-trend | xmcp（searchPostsRecent）で実施中 | `/last30days` スキル（GitHub 2万星・Reddit/X/YouTube同時検索・ClawHubから導入）を `/phase1-trend` の補完ツールとして CLAUDE.md MCP管理セクションに記載 | information-collection-4-methods |
| 低 | R-13（対話してから作業する） | 3Cルール（Concise・Contextual・Constrained）記載済み | 「初回プロンプトにGoal + Constraints + Acceptance criteriaを一括して渡す」という具体例をR-13に追記 | opus-47-stop-doing-6-things |

---

## 記事ごとの主要ポイント

| 記事 | 要点（30文字以内） |
|------|-----------------|
| qiita/harness-engineering | skills/hooks/MCPがハーネスの3層 |
| zenn/claude-code-github-actions | @claudeメンション自動PR対応 |
| x.com/claude-code-obsidian | 記憶設計がAI活用の次フェーズ |
| x.com/gpt-image-2-workflow | スキルへのスタイルテンプレ組み込み |
| github/awesome-codex-skills | SKILL.md規約（description発動条件明記） |
| qiita/opus-47-stop-doing-6-things | 初回に目的+制約+完了条件を一括 |
| x.com/claude-design-complete-guide | Design Systems=CLAUDE.mdのデザイン版 |
| x.com/obsidian-ai-pitfalls | .agents/でAI領域と人間領域を物理分離 |
| x.com/information-collection-4-methods | /last30days+Routines+Grokのサイクル |
| x.com/claude-code-initial-setup-order | 設定順序: CLAUDE.md→settings→hooks→MCP |
| x.com/ai-mv-gpt-image2-ace-step | Seedance 2.0+GPT Image 2+ACE-Step PV |

---

## インスピレーションメモ
（今すぐ使わなくてもよい。楽になる・創造的になる・楽しくなる可能性があるもの）

- **claude-obsidian の `/autoresearch`** — トピックを指定するだけで3〜5ラウンドのWeb調査を自律実行し結果をWikiに保存。`/phase1-trend` の深掘り調査フェーズを自律化できそう（参照: x.com/2046930094695043199）
- **`/last30days` スキル（ClawHub配布）** — Reddit/X/YouTube/TikTokを同時走査し2〜8分でバズレポート生成。NOCTAのトレンド収集が半自動化されて楽になりそう（参照: x.com/2044704524125057504）
- **Claude Design の Design Systems × CLAUDE.md連携** — CLAUDE.mdのブランド情報をDesign Systemに一度登録すれば、全デザインにNOCTAブランドが自動適用。SNSグラフィック・LPを量産するとき楽しくなりそう（参照: x.com/2047837100389876200）
- **Dreamina Seedance 2.0（T2V）** — Kling 3.0 Proの代替T2Vとして。fisheye lensなど演出表現の幅が広がりPV制作がより創造的になりそう（参照: x.com/XVisualneuFX）
- **Routines（Claude Code定期実行）** — `claude-docs-review` や `x-practices-search` をRoutinesで毎週自動実行する設定にできれば、ベストプラクティス収集が完全自動化されて楽になりそう（参照: x.com/2044704524125057504）

---

## セキュリティ・安全性への影響

なし。全11件にインジェクションパターン検出なし。github.com / qiita.com / zenn.dev の公式サイトからの取得のため信頼性高い。

---

## 適用しない理由がある項目

| 項目 | 理由 |
|------|------|
| LLM Wiki方式（Obsidian × claude-obsidian） | トークンコストが増大する。NOCTAはCLAUDE.md + memory/ファイルで十分機能している |
| awesome-codex-skills スキル集のインストール | Codex向けスキルはClaude Codeと互換性が異なる可能性。個別スキルは参考にするが一括導入しない |
| Claude Code GitHub Actions のセットアップ | Claude Code Maxプランが必要。現状コスト対効果を確認してから判断 |

---

## CEOが確認すべき事項

1. **Claude Design の試用**: claude.ai/design（Webのみ）で無料枠あり。使用制限は週リセット。NOCTAのDesign SystemにCLAUDE.mdの情報を登録して試してみる価値あり
2. **Dreamina Seedance 2.0 の評価**: Kling 3.0 Proと比較してPV制作に使えるか確認。ACE-Step 1.5 XLとの組み合わせでフルAI-MVパイプラインが構成できる可能性
3. **`/last30days` スキルの試用**: ClawHubからインストールし `/phase1-trend` での活用を検討。Reddit/YouTube同時検索は既存の xmcp 単体より情報量が多い
