# ベストプラクティスレビュー（インボックス一括）
日付: 2026-05-04
次回レビュー推奨: 2026-06-04以降（インボックスに5件貯まったら）
ソース:
  https://note.com/betaitohuman/n/nffecc168f4d3 （取得成功）
  https://arxiv.org/abs/2512.13564 （取得成功）
  https://github.com/Shichun-Liu/Agent-Memory-Paper-List （取得成功）
  https://x.com/i/status/2049871598883115376 （本文直接）
  https://x.com/i/status/2043643311039426670 （本文直接）
  [docs.anthropic.com] CHANGELOG v2.1.126 × 4件 （本文直接）
  https://x.com/ceo_biomira/status/2048831453698629679 （本文直接・xmcp）
  https://x.com/filicroval/status/2050945978296107268 （本文直接・xmcp）
  https://x.com/sumika45379/status/2049300317934964938 （本文直接・xmcp）
  https://x.com/Alacritic_Super/status/2049644203299541001 （本文直接・xmcp）
  https://x.com/skar_connect/status/2049335123607441859 （本文直接・xmcp）
除外URL: なし

## 要約（3行以内）
今回のメインテーマは「AIエージェントのメモリ3分類」「Claude Code課金最適化」「ACE-Step UI具体化」の3本柱。
arxivとnote.comのエージェントメモリサーベイがNOCTAのAuto-memory設計の理論的裏付けを提供した。
ACE-Step UIのステム分離機能がLALAL.AI代替候補として浮上し、R-12の具体的更新機会となった。

## NOCTAへの適用提案（未実装のもののみ）
| 優先度 | 対象 | 現状 | 提案内容 | 参照記事 |
|--------|------|------|----------|---------|
| 高 | CLAUDE.md R-12 | 「ACE-Step 1.5 XL」と記載のみ | ACE-Step UIのUIプロジェクト「fspecii」を明記し、ステム分離機能がLALAL.AI代替になりうることを注記 | x.com/skar_connect/status/2049335123607441859 |
| 中 | CLAUDE.md R-09 | Opus 4.7の最大出力「128k tokens」のみ記載 | Batch API betaヘッダー（output-300k-2026-03-24）でOpus 4.7/Sonnet 4.6が最大300k出力可能と追記 | docs CHANGELOG v2.1.126 |
| 中 | CLAUDE.md セッション運用テーブル | claude project purgeコマンドなし | 「状態一括削除: `claude project purge [path]`（transcripts/tasks/config一括削除）」を運用テーブルに追加 | docs CHANGELOG v2.1.126 |
| 低 | /lp-createスキル | GPT Image 2活用は記載あり | モック→詳細プロンプト自動生成→Claude Code実装の2段階フローを組み込む（実装一貫性向上） | x.com/i/status/2049871598883115376 |

## 記事ごとの主要ポイント
| 記事 | 要点（30文字以内） |
|------|-----------------|
| note.com/betaitohuman/nffecc168f4d3 | エージェントメモリ3次元分類サーベイ |
| arxiv.org/abs/2512.13564 | Memory in Age of AI Agents論文 |
| github.com/Shichun-Liu/Agent-Memory-Paper-List | エージェントメモリ論文150本+リスト |
| x.com/i/2049871598883115376 | GI2→モック→UIの6ステップワークフロー |
| x.com/i/2043643311039426670 | Claude Code記憶3分類マネジメント活用 |
| [docs] Batch API 300k | betaヘッダーでOpus/Sonnet 300k対応 |
| [docs] claude project purge | 状態一括削除コマンド追加 |
| [docs] context:fork deferred tools | スキルfrontmatterのバグ修正 |
| [docs] Mac sleep stream timeout | Macスリープ後タイムアウト修正 |
| x.com/ceo_biomira/... | CLAUDE.md+subagentでトークン1/4削減 |
| x.com/filicroval/... | Boris Cherny 84tips高評価再確認 |
| x.com/sumika45379/... | 非エンジニア向けClaude Code Tips発信者 |
| x.com/Alacritic_Super/... | ACE-Step UI fspecii・Suno代替 |
| x.com/skar_connect/... | ACE-Step UIステム分離・4分楽曲対応 |

## インスピレーションメモ
- ACE-Step UIのステム分離 — LALAL.AI依存をローカル完結に置き換えられるかもしれない（参照: x.com/skar_connect/status/2049335123607441859）
- エージェントメモリの3分類（事実/経験/手続き） — NOCTAのmemoryファイルをこの分類で整理し直すと楽曲間知識継承が向上しそう（参照: arxiv.org/abs/2512.13564）
- Codex Guide モック→詳細プロンプト→実装 — /lp-createでGPT Image 2のモックをコンテキストに含めるとLP品質が向上しそう（参照: x.com/i/status/2049871598883115376）
- @sumika45379 のClaude Code日本語Tips — 非エンジニア視点の知見がNOCTAワークフロー改善のヒントになりそう（参照: x.com/sumika45379/status/2049300317934964938）

## セキュリティ・安全性への影響
変更が必要な事項はなし。

## 適用しない理由がある項目
- Codex CLIへのtest委譲（@ceo_biomira パターン）: NOCTAはCodex CLI未導入のため現時点では不適用

## CEOが確認すべき事項
1. **R-12 ACE-Step UI（fspecii）の確認**: `github.com/fspecii` でUIプロジェクトを確認し、RTX 3090環境でステム分離機能が実際に使えるか検証してみてください
2. **Batch API 300k出力ベータ**: 大型SVP生成時にBatch API経由で300k出力が必要なケースがあるか確認してください（通常用途では128kで十分なはず）
3. **@sumika45379 フォロー検討**: 非エンジニア向けClaude Code実運用Tips発信者。CEOの立場に近い視点からの知見が得られる可能性があります
4. **CLAUDE.md R-09/R-12/セッション運用テーブルの更新**: 適用提案「高/中」3件を反映するかどうか判断してください
