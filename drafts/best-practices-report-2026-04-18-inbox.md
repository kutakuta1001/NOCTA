# ベストプラクティスレビュー（インボックス一括）
日付: 2026-04-18（第3回 - 5件）
次回レビュー推奨: 2026-05-18以降（インボックスに5件貯まったら）
ソース:
  [manual] x.com/i/2043463258762629222（DeNA南場会長「10人×AI」戦略）
  [manual] qiita.com/masa_ClaudeCodeLab（Claude Code セキュリティ事故7選）
  [manual] x.com/i/2044707793337528701（Vibe Coding 完全ガイド）
  [xmcp] x.com/nozmen（Claude Design × DESIGN.md テンプレート）
  [xmcp] x.com/benscharfstein（Claude Design Figma AI 代替評価）
除外URL: なし（Qiita 記事内の rm -rf / git push --force 言及は教育目的の文脈・通過）

---

## 要約（3行以内）
Claude Design と DESIGN.md による「デザインDNA継承」が今回の最大トピック。NOCTAの website/ ブランド管理と /visual-prompt ワークフローへの組み込みに直接活用できる。DeNA/Vibe Coding の記事からは「一度に一つ・ノートを残す」原則がNOCTAの既存ルール（R-06/R-14/承認ゲート）を外部から検証するものとして確認できた。

---

## NOCTAへの適用提案（未実装のもののみ）

| 優先度 | 対象 | 現状 | 提案内容 | 参照記事 |
|--------|------|------|----------|---------|
| 高 | website/ | デザイン定義が website/CLAUDE.md に混在 | `website/DESIGN.md` を getdesign.md テンプレートで作成し、スペーシング・タイポグラフィ・カラートークン・コンポーネントルールを独立管理。Claude Design 連携の基盤に | 2026-04-18-claude-design-designmd-template.md |
| 中 | R-04 / HP管理 | Midjourney/Kling のみ記載 | Claude Design を視覚制作ツールの選択肢として追記。/visual-prompt スキルと組み合わせた NOCTA ブランド一貫ビジュアル生成フローの設計 | 2026-04-18-claude-design-paper-figma-alternative.md |
| 低 | AGENTS / コスト管理 | API無限ループの上限設定なし | Agent Teams（/phase2-music・/phase4-release）実行時に最大試行回数・タイムアウトを設定する旨を COST POLICY に補足 | 2026-04-18-claude-code-security-7incidents.md |

---

## 記事ごとの主要ポイント

| 記事 | 要点（30文字以内） |
|------|-----------------|
| DeNA南場「10人×AI」戦略 | Devin 80%+Claude Code 15%+人間5% |
| Qiita セキュリティ事故7選 | Deny リスト・最小権限で30分防止 |
| Vibe Coding 完全ガイド | notes.md常時保存・一度に一つ原則 |
| DESIGN.md × Claude Design | デザインDNAを全出力に継承 |
| Claude Design Figma代替 | Opus 4.7駆動・実用評価済み |

---

## インスピレーションメモ

- **DESIGN.md + /visual-prompt** — NOCTA のブランドカラー・フォントを DESIGN.md に定義すれば、Midjourney/Kling プロンプトに毎回指定しなくても自動でブランド一貫のビジュアルが生成できるようになるかも（参照: x.com/nozmen）
- **Claude Design** — 楽曲ジャケット・SNS バナーを Claude Design で直接生成できれば Midjourney の操作工数ゼロになりそう（参照: x.com/benscharfstein）
- **Devin ハイブリッド構成** — 将来的に定型ファイル変換（MIDI フォーマット・SVP テンプレート展開）を自律エージェントに委ねることで、CEO が音楽制作に集中できる時間が増えそう（参照: x.com/2043463258762629222）

---

## セキュリティ・安全性への影響

- Qiita 記事の「認証情報のログ記録」事故（プロンプト直書きトークンがログ残存）: NOCTAの GEMINI_API_KEY は ~/.claude/settings.json の `env` セクションに記載（git 管理外）。プロンプトへの直書きではないため問題なし。
- 「API無限ループ課金」: Agent Teams 実行時の注意点として認識要。現状 COST POLICY に上限設定の記載なし。

---

## 適用しない理由がある項目

- **DeNA の Devin 導入**: NOCTA は現状 Claude Code のみで十分。Devin は将来的な選択肢として参照にとどめる。
- **Vibe Coding のプロジェクト段階**: NOCTA CEO はすでに制作経験豊富。入門的な内容は不要。
- **.env 流出防止 / git push --force 防止**: 既に Deny リスト・settings.json で対応済み。

---

## CEOが確認すべき事項

1. **`website/DESIGN.md` を作成するか？** — getdesign.md テンプレートから NOCTA のブランドカラー・Tailwind 設定を DESIGN.md として書き出すと、Claude Design や /visual-prompt の呼び出し時に毎回ブランド指定が不要になります。
2. **Claude Design を試すか？** — 2026-04-17 リリースの新ツール（Opus 4.7 駆動）。楽曲ジャケットや SNS バナー制作への活用可能性を確認する価値があります。Claude Pro アカウントがあれば追加費用なしで試せます。
