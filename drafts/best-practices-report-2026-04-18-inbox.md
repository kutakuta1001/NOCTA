# ベストプラクティスレビュー（インボックス一括）
日付: 2026-04-18（第2回 - 先頭9件）
次回レビュー推奨: 2026-05-18以降（インボックスに5件貯まったら）
ソース:
  [manual] platform.claude.com（Sonnet4/Opus4 廃止予定 2026-06-15）
  [manual] code.claude.com（Agent SDK GA・GitHub Code Review）
  [manual] github.com/anthropics CHANGELOG v2.1.111（effort xhigh）
  [xmcp] x.com/grant4uatro（MPC Sample + Studio One ミックスワークフロー）
  [xmcp] x.com/victormustar（ACE-Step 1.5 オープンソースデモ公開）
  [xmcp] x.com/bridgebench（Opus 4.7 ローンチ確認）
  [xmcp] x.com/ArtificialAnlys（Opus 4.7 Intelligence Index トップ）
  [xmcp] x.com/bridgemindai（Opus 4.7 self-review デフォルト・CursorBench 58→70）
除外URL: なし

---

## 要約（3行以内）
Opus 4.7 の self-review デフォルト化と Intelligence Index トップ評価により、R-09 の Drafter/Critic パターン（Opus を批評者として使う設計）の妥当性が客観的に裏付けられた。`/effort xhigh` の追加により Opus 4.7 の最大性能引き出し方法が明確になった。GitHub Code Review の GA により website/ PR への自動レビューが実現可能になった。

---

## NOCTAへの適用提案（未実装のもののみ）

| 優先度 | 対象 | 現状 | 提案内容 | 参照記事 |
|--------|------|------|----------|---------|
| 高 | R-09（Opus 4.7 Critic 使用ガイド） | effort xhigh の記載なし | 承認ゲート最重要レビュー時（③歌詞・⑥PVコンセプト）に `/effort xhigh` を付与する旨を R-09 に追記 | 2026-04-18-opus47-effort-xhigh-level.md |
| 中 | SLASH COMMANDS HP管理セクション | GitHub Code Review 記載なし | `/github-code-review` または GitHub App 連携による website/ PR 自動レビューの有効化を HP管理セクションに追記 | 2026-04-18-github-code-review-cloud-pr.md |
| 低 | R-12（ACE-Step 活用） | オンラインデモの言及なし | 「ローカル環境構築前に公式オンラインデモで品質確認」を R-12 の補足として追記 | 2026-04-18-ace-step-15-open-source-demo.md |

---

## 記事ごとの主要ポイント

| 記事 | 要点（30文字以内） |
|------|-----------------|
| Sonnet4/Opus4 廃止 2026-06-15 | NOCTA 4.6/4.7 使用中・影響なし |
| Agent SDK GA | 独自エージェント構築可能に |
| GitHub Code Review GA | 全PRで自動クラウドレビュー |
| effort xhigh（v2.1.111） | Opus 4.7 最大性能引き出し |
| MPC + Studio One ワークフロー | ステム移行ミックスの参考 |
| ACE-Step 1.5 デモ公開 | オンラインで無料試用可能 |
| Opus 4.7 ローンチ確認 | BridgeBench ベンチ最速予告 |
| Opus 4.7 Intelligence Index 57 | GPT-5.4・Gemini 3.1 Pro と並ぶ |
| Opus 4.7 self-review デフォルト | ハルシネーション低減・批評精度向上 |

---

## インスピレーションメモ

- **Agent SDK** — handoff.md 自動更新・承認ゲート通知を独自エージェントで実装できるかも（参照: code.claude.com/docs）
- **ACE-Step 1.5 デモ** — Suno との品質比較を手軽にオンラインで試せるようになった。NOCTA サウンドの方向性確認に使えそう（参照: x.com/victormustar）
- **Opus 4.7 self-review デフォルト** — lyric-critic・concept-critic エージェントが「指摘の正確さ」を自己検証してから返すため、CEO の判断コストが下がる可能性（参照: x.com/bridgemindai）

---

## セキュリティ・安全性への影響

変更が必要な項目なし。

---

## 適用しない理由がある項目

- **Sonnet 4 / Opus 4（-20250514版）廃止**: NOCTA は Sonnet 4.6 / Opus 4.7 使用中。影響なし。念のため `.mcp.json` の確認を推奨。
- **Agent SDK GA（即時適用）**: 現状の Agent Teams で NOCTA のワークフローは十分。将来的な高度自動化時に再検討。
- **Opus 4.7 ベンチマーク複数エントリ（bridgebench・ArtificialAnlys・bridgemindai）**: R-09 の設計判断を裏付けるデータとして記録。CLAUDE.md への変更は不要。

---

## CEOが確認すべき事項

1. **R-09 に `/effort xhigh` を追加するか？** — 承認ゲート直前（③歌詞・⑥PVコンセプト）の最重要レビュー時のみ `/effort xhigh` を使う旨を明記すると、CEOとエージェント双方で最高品質レビューのタイミングが統一できます。
2. **GitHub Code Review（GitHub App）を website/ PR に有効化するか？** — Claude Code Max サブスクライバー向けの GitHub App 連携で、PR 作成時に自動コードレビューが走ります。HP 更新の品質チェック自動化として有効です。
3. **ACE-Step 1.5 オンラインデモ URL を R-12 に追記するか？** — ローカル環境（RTX 3090）構築前に品質確認できる手段として補足できます。
