# ベストプラクティスレビュー（インボックス一括）
日付: 2026-04-13
次回レビュー推奨: 2026-05-13 以降（インボックスに5件貯まったら）
ソース（xmcp・全9件）:
- https://x.com/msjiaozhu/status/2041698840236245396
- https://x.com/lucianlamp/status/2042495111578460422
- https://x.com/socialwithaayan/status/2042993563555037688
- https://x.com/sukh_saroy/status/2043199144429531433
- https://x.com/techwith_ram/status/2042094378592923907
- https://x.com/SuguruKun_ai/status/2043558219055071485
- https://x.com/tsumotokai/status/2043339982317011455
- https://x.com/aisearchio/status/2042446695678750882
- https://x.com/StepFun_ai/status/2041918654439141652
除外URL: なし（手動インボックス9件は内容空欄のためスキップ）

---

## 要約（3行以内）
今回は「claude-code-best-practice リポジトリ（84 tips）」と「ACE-Step 1.5 XL 正式リリース」の2つが主要テーマ。前者は NOCTA のスキル・CLAUDE.md 設計の精度を引き上げる公式水準のリソースであり、後者は R-12 に記載済みの ACE-Step が XL 版（4B・24GB VRAM・MIT）にアップグレードされた事実を確認。外部モデル委託パターン（Claude をオーケストレーターとして使う構成）も注目すべき実践例として浮上した。

---

## NOCTAへの適用提案（未実装のもののみ）

| 優先度 | 対象 | 現状 | 提案内容 | 参照 |
|--------|------|------|----------|------|
| 高 | CLAUDE.md / スキル | claude-code-best-practice リポジトリへの言及なし | references/ に同リポジトリ（84 tips・Boris Cherny 知見）を参照ファイルとして追加し、スキル改善の都度参照する運用を確立する | @sukh_saroy/@SuguruKun_ai/@tsumotokai |
| 中 | CLAUDE.md R-12 | 「ACE-Step 1.5」と記載 | 「ACE-Step 1.5 XL（4B DiT・24GB VRAM フルクオリティ・MIT）」に更新。RTX 3090（24GB）で最高品質動作可能、MIT で商用利用可という情報を明記 | @StepFun_ai/@aisearchio |
| 低 | CLAUDE.md 参考リソース | Anthropic 公式講座への言及なし | 「Claude Code in Action」（Anthropic 公式無料講座）を参考リソースとして記載 | @socialwithaayan |

---

## 記事ごとの主要ポイント

| 記事 | 要点（30文字以内） |
|------|-----------------|
| @msjiaozhu | CC 学習順序: slash→memory→skills→hooks→MCP |
| @lucianlamp | CLAUDE.md で外部モデル委託を制御 |
| @socialwithaayan | Anthropic 無料12講座（CC in Action含む）|
| @sukh_saroy | claude-code-best-practice 84 tips・999いいね |
| @techwith_ram | skills vs agents vs commands の使い分け |
| @SuguruKun_ai | Boris Cherny 知見まとめ（日本語・354いいね）|
| @tsumotokai | 同リポジトリの実読感想（日本語・49いいね）|
| @aisearchio | ACE-Step 1.5 XL が Suno v5 を超えた |
| @StepFun_ai | ACE-Step 1.5 XL: 4B / 12〜24GB / MIT |

---

## インスピレーションメモ

- 外部モデル委託パターン（GLM5.1でコーディング・Codexでレビュー） — Claude をオーケストレーターに限定し、コスト最適化や専門化を実現する構成。NOCTA が将来マルチモデル化する際の設計参考に（参照: x.com/lucianlamp/...）
- claude-code-best-practice の /powerup コマンド — Claude Code v2.1.90 以降でインタラクティブな学習レッスンが内蔵された模様。スキル設計の学習効率を上げる可能性（別収集ツイートより）
- skills vs agents vs commands 比較表 — 84 tips リポジトリに収録されている8リポジトリ比較表。NOCTA スキル設計の定期見直しチェックリストとして活用できそう

---

## セキュリティ・安全性への影響

外部モデル委託パターン（@lucianlamp の GLM5.1/Codex 活用）については、外部 API へのコード送信が発生するため、NOCTA の楽曲仕様書・歌詞データを外部モデルに渡す際は著作権・秘密保持の観点から慎重に判断すること。現状は Anthropic モデルのみ使用しており問題なし。

---

## 適用しない理由がある項目

- 外部モデル委託（R-09 拡張）: NOCTA はAnthropicモデルのみで運用が安定しており、現時点で多モデル化のメリットが薄い。コスト・品質・秘密保持の観点から現状維持が妥当。

---

## CEOが確認すべき事項

1. **claude-code-best-practice リポジトリ**（GitHub: 19.7K stars）を一度確認し、NOCTA の CLAUDE.md / スキル設計に活かせる tips があるか目を通すことを推奨。Boris Cherny（Claude Code 開発責任者）の知見が含まれる公式水準のリソース。
2. **R-12 の ACE-Step 表記更新**: 「ACE-Step 1.5 XL（4B・RTX 3090 で最高品質・MIT）」に更新してよいか確認。変更は1行のみ。
