# AIコーディングエージェント モデル棲み分け参考資料

最終更新: 2026-09-06 rev.8
次回レビュー推奨: 新モデルリリース時 または 3ヶ月ごと（`/model-review` スキルを使う）

このファイルはプロジェクト横断のグローバル参考資料。
新しいプロジェクト環境を作る際に CLAUDE.md のモデル設定の初期値として使う。

## 他ターミナル・他プロジェクトへの伝播方法

| 方法 | 伝播範囲 | タイミング |
|------|---------|-----------|
| `~/.claude/CLAUDE.md` G-01 を更新 | **全ターミナル・全プロジェクトに即時** | /model-review 承認後に手動更新 |
| このファイル（model-lineup.md）を参照 | 明示的に Read したセッションのみ | `/model-review` 実行時 |
| `/model-review` スキル自体 | 全ターミナルで実行可能（共通スキル） | 任意のタイミング |
| 新プロジェクト CLAUDE.md テンプレート | 新規プロジェクト作成時のみ | 末尾テンプレートをコピー |

---

## Claude Code — モデル一覧と用途（2026-09-06 rev.8）

| モデル | 用途 | コスト（入力/出力/MTok） | コンテキスト | 最大出力 |
|--------|------|--------------------------|------------|---------|
| **Haiku 4.5** | 調査・短いファイル生成・ドキュメント更新 | $1 / $5 | 200k | 64k |
| **Sonnet 5** | 仕様書・草稿・コード生成（デフォルト） | $3 / $15 | 1M | 128k |
| **Opus 5** | 重要設計レビュー・複雑コード・クリティーク（Critic 既定） | $5 / $25 | 1M | 128k |
| Opus 5 Fast | 上記と同等知能を高速実行（`/fast`） | $10 / $50 | 1M | 128k |
| **Fable 5.1** | 深い推論が必要なタスク・最上位エスカレーション | $10 / $50（キャッシュ読取 $0.25 = 2.5%） | 1M | 128k |
| Fable 5（レガシー） | 旧最上位。5.1 へ移行済み | $10 / $50 | 1M | 128k |
| Opus 4.8（レガシー） | 旧 Critic。Opus 5 障害時のフォールバック | $5 / $25 | 1M | 128k |

**モデルID:** `claude-haiku-4-5-20251001` / `claude-sonnet-5` / `claude-opus-5` / `claude-fable-5-1` / `claude-opus-4-8` / `claude-fable-5`

Sonnet 5 の導入価格 $2/$10 は **2026-08-31 で終了**し、現在は通常価格 $3/$15。

### Opus 5 特記事項（2026-07-29 追加・Critic 既定に採用）
- **2026-07-24 GA**（`claude-opus-5`）。Opus 4.8 と同価格（$5/$25）で性能向上
- 適応的思考あり・拡張思考なし。ナレッジカットオフ: **2026年5月**（4.8 の2026年1月から前進）
- SWE-bench Pro: **79.2%**（4.8 の 69.2% から +10pt・Fable 5 の 80% にほぼ並ぶ）※報道値・公式ページでの再確認推奨
- SWE-bench Verified 96.0% / Frontier-Bench v0.1 43.3%（4.8 の 21.1% から倍増）。公式の位置づけは「Fable 5 のフロンティア知能に半額で肉薄」
- Claude Code v2.1.219 で**デフォルト Opus モデルに切替済み**。`/fast` 対象は Opus 5・4.8（4.7 は除外・Fast $10/$50）
- effort デフォルト high（Claude API・Claude Code）。Batch API ヘッダー `output-300k-2026-03-24` で最大300k出力可能

### Opus 4.8 特記事項（レガシー・2026-07-29 に Critic 役を Opus 5 へ移譲）
- 適応的思考あり・拡張思考なし（`temperature`/`top_p`/`top_k` 非対応・設定すると400エラー）
- ナレッジカットオフ: 2026年1月（トレーニングデータカットオフ: 2026年1月）
- SWE-bench Pro: **69.2%**（2026-05-29時点の最高スコア）
- Batch API ヘッダー `output-300k-2026-03-24` で最大300k出力可能
- `/fast` コマンドで Fastモード切替（同一知能・約2.5倍高速）
- **公式掲載確認済み**（2026-06-04）: `platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-8`
- 4.7からの主な改善: 長時間エージェントコーディング強化（コンパクション後の復帰向上）・ツール呼び出し漏れ削減・reasoning effort calibration
- 新機能: mid-conversation system messages（betaヘッダー不要）・プロンプトキャッシュ最小長 **1,024 tokens**（4.7より短縮）

### Sonnet 5 特記事項（旧 Sonnet 4.6 から移行・2026-07-04）
- 適応的思考あり・拡張思考なし（Opus 4.8 と同様）
- ナレッジカットオフ: **2026年1月**（4.6の2025年8月から前進）
- 最大出力 **128k**（4.6の64kから倍増）
- **導入価格 $2/$10（2026-08-31まで）**。以降は $3/$15
- Batch API ヘッダー `output-300k-2026-03-24` で最大300k出力可能
- モデルID `claude-sonnet-5`（Sonnet 4.6 は Legacy 落ち・`claude-sonnet-4-6` は当面利用可だが移行推奨）

### Fable 5.1 特記事項（2026-09-06 rev.8 で Fable 5 から交代）
- `claude-fable-5-1`。**既定の Fable モデル**（Claude Code v2.1.257 で追加）。Fable 5 は Legacy へ
- 適応的思考（常時ON）・拡張思考なし。**ナレッジカットオフ 2026年6月**・1M コンテキスト・128k 出力
- 価格 $10/$50（Opus 5 の倍）。ただし**プロンプトキャッシュ読み取りが基本入力価格の2.5%**（$0.25/MTok）で、
  他モデルの10%より大幅に安い（Mythos 5.1 も同条件）。長時間セッションでは表示価格の差より実コスト差が縮む
- **カットオフが Opus 5（2026年5月）を追い越した。** rev.7 まで「Fable はカットオフが古いので最新仕様は Opus 5」を
  使い分けの根拠にしていたが、この根拠は消滅。残る Opus 5 優位は**価格（半額）とトークン消費量（Fable 系は約30%多い）**のみ
- **デフォルトにはしない**。公式ガイダンスは「ほとんどのワークロードは Opus 5 から始め、
  高度な推論や長期エージェント作業、または高 effort の Opus 5 の評価が不十分な場合に Fable 5.1」
- Coding Agent Index（Artificial Analysis）: **Fable 5.1 = 70**（GPT-6 Astra 67 より上）
- 廃止コミット: **2027-09-01 以降**（現行4モデル中で最も長い）
- 輸出管理による断続提供リスクは残るため、恒常的に当てにできる最上位 fallback は Opus 5。詳細 [[project_fable5_unavailable]]
- NOCTA 用途（CEO 方針・2026-07-29 決定 / 2026-09-06 に 5.1 へ更新）: **深い推論が必要なタスクでは Fable 5.1 を第一候補**とする
  （超重要クリティーク・歌詞/PVコンセプトの最終判断・複雑な設計判断）
- Mythos 5 / Mythos 5.1 は Project Glasswing 招待制・防御的サイバーセキュリティ限定（一般利用不可・棲み分け対象外）

### Haiku 4.5 特記事項
- 拡張思考対応あり
- ナレッジカットオフ: **2025年2月**（古い。トレンド判断は Sonnet 5 以上に委ねる）
- トレーニングデータカットオフ: 2025年7月

### 廃止コミット（Anthropic 運営プラットフォーム・rev.8 更新）

| モデル | 廃止は早くとも |
|---|---|
| Fable 5.1 | 2027-09-01 |
| Opus 5 | 2027-07-24 |
| Sonnet 5 | 2027-06-30 |
| **Haiku 4.5** | **2026-10-15**（現行4モデル中で唯一1年以内。後継の登場を見込んでおく） |

Amazon Bedrock と Google Cloud は独自の日程を設定する。

### 廃止予定（要注意）
- Claude Opus 4.1（`claude-opus-4-1-20250805`）→ **2026年8月5日 廃止予定**（Opus 5 へ移行）
- Claude Sonnet 4 / Opus 4（`claude-sonnet-4-20250514` / `claude-opus-4-20250514`）→ 2026年6月15日 廃止済み
- Claude Haiku 3（`claude-3-haiku-20240307`）→ 2026年4月19日 廃止済み
- Legacy 化（利用可だが移行推奨）: **Fable 5（2026-09 の Fable 5.1 リリースに伴い）** / **Opus 4.8（2026-07-24 の Opus 5 リリースに伴い）** / Sonnet 4.6 / Opus 4.7 / Opus 4.6 / Sonnet 4.5 / Opus 4.5

---

## 起案→批評フロー（推奨パターン）

```
Sonnet 5（草稿起案）→ Opus 5（批評・代替案提示）→ ユーザー（最終選択）
※ 深い推論が必要な案件・Opus 5 の判断が割れた場合は Fable 5.1 にエスカレーション
```

適用場面: 歌詞選択前・PVコンセプト承認前・CLAUDE.md等の重要設計変更時

---

## Codex CLI（OpenAI）— モデル一覧（rev.5 ベース・2026-09-06 に gpt-6-astra を追記）

| モデル | 適した用途 | 備考 |
|--------|-----------|------|
| **gpt-6-astra** | GPT-6 世代のフラッグシップ。複雑・高負荷な作業 | **コードレビュー用途はこれ**（`/codex-review` 既定・effort high）。$10/$50・1.05M・カットオフ2026-04-30。要 Codex CLI 0.153.4+ |
| **gpt-5.6 Sol** | 前世代フラッグシップ（最上位） | **$4/$20**。2026-07-09 GA。alias `gpt-5.6` で API から呼べる（Codex CLI では階層名必須）。CLI が古い環境向けフォールバック |
| **gpt-5.6 Terra** | バランス型（中位） | **$2/$12** |
| **gpt-5.6 Luna** | 軽量・最下位。高頻度・低レイテンシ向け | **$0.20/$1.20**。Sol級の推論は「overkill」な用途向け |
| **gpt-5.5** | 汎用・前世代フラッグシップ | 2026-04-24 より API Key で利用可能。GPT-5.6 GA後も稼働継続 |
| **gpt-5.4** | 前世代汎用・コーディング統合版 | Codex 機能を統合した最初の mainline モデル |
| **gpt-5.4-mini** | 軽量・高速タスク | 低コスト |
| **gpt-5.4-nano** | 最軽量・最低コスト | $0.05/$0.40/MTok（Haiku 4.5 相当の位置づけ） |
| **gpt-5.3-codex** | 複雑なエンジニアリングタスク | コード特化・エージェント型コーディング最高性能 |
| **gpt-5.3-codex-spark** | リアルタイム反復・インクリメンタル修正 | 速度重視 |

### GPT-6 特記事項（2026-09-06 rev.8 で確定）
- Codex のモデル一覧で **priority 1**。階層名は不要で `gpt-6-astra` 単体指定で通る（GPT-5.6 の Sol/Terra/Luna と違う）
- 公式説明: "Our most capable model for complex, demanding work."
- **価格 $10/$50**（Fable 5.1 と同額・GPT-5.6 Sol の2.5倍）
- **コンテキスト 1.05M・最大出力 128K・カットオフ 2026年4月30日**
  ※ Codex CLI の `models_cache.json` は 272,000 と申告する。CLI 上の制限と API 上限が異なるため両方記録する
- 推論レベルが6段階に拡張: **low / medium / high / xhigh / max / ultra**（モデル既定は low）。
  `ultra` は「最大推論＋タスクの自動委譲」。速度ティア `fast`（2倍速・使用量増）も選択可
- Codex CLI **0.153.4 以降**で ChatGPT Plus 経由の利用可（検証済み 2026-09-06）。0.144.6 では 400 拒否
- **リリース状況: GA 未達。** 2026-09-03 限定プレビュー公開 → 09-04 に有料ユーザーへ制限版を提供
  （サイバーセキュリティ等の一部プロンプトを拒否する）。API と ChatGPT 有料層の正式提供は「coming days」告知のみ。
  NOCTA が使えているのは ChatGPT Plus 経由の早期提供分
- 専門モデルとして GPT-5.6-Cyber / Daybreak Red / Daybreak Blue（サイバーセキュリティ）が別枠で存在する
- API のモデル一覧から **gpt-5.5 / gpt-5.4 系 / gpt-5.3-codex 系が消えている**（Codex CLI のキャッシュには
  gpt-5.5 / gpt-5.4-mini が残存）。API 非提供化と CLI 側の継続提供が併存している可能性。次回レビューで再確認

### ベンチマーク: GPT-6 Astra（2026-09-06 調査）
**SWE-bench Pro は OpenAI が未公表**のため、他指標で評価する。

| 指標 | GPT-6 Astra | 比較対象 |
|---|---|---|
| Deep SWE | 74.1% | Claude Opus 5 = 73.7% / GPT-5.6 Sol = 72.7% |
| Coding Agent Index（Deep SWE + Terminal Bench + リポジトリQA の合成） | 67 | **Claude Fable 5.1 = 70** |
| 総合コーディング（183モデル中） | 4位・75.3/100 | — |

「generational leap」と宣伝されたが、コーディング指標での前世代からの伸びは1.4pt 程度に留まる。
Fable 5.1 には Coding Agent Index で劣る。
出典: Artificial Analysis / Vellum / MindStudio（いずれも2026-09 時点）

### GPT-5.6 特記事項（2026-07-21 追加）
- 2026-06-26 限定プレビュー（政府審査済み）→ **2026-07-09 GA**（ChatGPT・API・Codex・GitHub Copilot 全対応）
- 命名規則: 数字（5.6）が世代、Sol/Terra/Luna が恒久的な階層名。**階層名から性能を誤読しやすい**（"Luna"を最上位と誤認した実例あり）。正しい序列は **Sol > Terra > Luna**
- ChatGPT Plus 連携（Codex CLI）で使うには階層名の指定が必須。単体の `gpt-5.6` は非対応（400エラー）
- Codex CLI 0.144.0 以降で ChatGPT Plus 経由の利用可能（検証済み 2026-07-21）

### 廃止予定（OpenAI）
- GPT-4.5 → 2026年6月27日 廃止予定
- o3 → 2026年8月26日 廃止予定

### SWE-bench Pro 比較（2026-07-29 時点の値・rev.8 で注記追加）

| モデル | SWE-bench Pro |
|--------|--------------|
| Fable 5 | **80%** |
| Claude Opus 5 | **79.2%**（報道値） |
| Claude Opus 4.8 | 69.2% |
| GPT-5.6 Sol | 64.6% |
| GPT-5.5 | 58.6% |
| GPT-6 Astra | **未公表**（OpenAI が SWE-bench Pro を出していない） |
| Claude Fable 5.1 | 未確認 |

**設計レビュー・コードレビュー → Claude Opus 5 を推奨**（Claude系フラッグシップが依然優位）。

⚠️ **rev.8 の注意**: GPT-6 Astra と Fable 5.1 は SWE-bench Pro の値がないため、この表だけでは新旧世代を比較できない。
別指標（Deep SWE / Coding Agent Index）では両者の差は小さく、Astra 67 対 Fable 5.1 70 で Claude 系がなお優位
（上記「ベンチマーク: GPT-6 Astra」節を参照）。
**ベンチマーク差が縮んでいるため、`/codex-review` を使う理由はスコア優位ではなく「別ベンダーの別の失敗モードを見る」ことにある**
（2026-09-06 CEO 判断で astra 維持）。

---

## Claude Code vs Codex 棲み分け判断フロー

```
タスクが来たら:

1. NOCTAワークフロー（スキル実行・CLAUDE.md更新・フェーズ進行）
   → Claude Code 一択

2. SVPファイル生成・HP作業・Agent Teams
   → Claude Code Opus 5（/effort xhigh）

3. 設計レビュー・コードレビュー（複雑な判断）
   → Claude Code Opus 5（SWE-bench Pro 79.2% > GPT-5.6 Sol 64.6%）
   → 深い推論が必要な場合は Fable 5.1（CEO 方針・2026-07-29 決定 / 2026-09-06 に 5.1 へ更新）
   → 第三者視点が欲しい場合は Codex CLI の gpt-6-astra（effort high）。スコア優位ではなく別ベンダーの失敗モードを見る目的

4. 外部ツールのプロンプト設計
   → Claude Code Sonnet 5

5. 短い1ファイル修正・単純なコード補完
   → IDE内補完（Copilot等）で完結
   → または Codex gpt-5.3-codex-spark（リアルタイム反復）

6. 長い複雑なエンジニアリングタスク（Claude Code以外で完結させたい場合）
   → Codex gpt-5.3-codex
```

---

## その他ツールとの棲み分け

| ツール | 適した用途 | Claude Code との違い |
|--------|-----------|-------------------|
| GitHub Copilot | IDE内補完・単純補完 | コンテキスト薄い・単発 |
| Cursor | ファイル単位の反復編集 | プロジェクト全体の文脈把握は弱い |
| Codex CLI | OpenAI系タスク・ChatGPT auth環境 | CLAUDE.md連携なし |
| Claude Design（claude.ai/design） | LP・マーケ素材・スライド | Web版のみ・使用枠独立 |

---

## コスト最適化指針

| 状況 | 推奨 |
|------|------|
| 全体計画・タスク分解 | Plan Mode |
| 単発タスク | Subagent |
| 複数領域の並列作業 | Agent Teams（大型フェーズのみ・2〜3回/プロジェクト） |
| 単純タスク（handoff更新・短いファイル生成） | `/effort low` または `/effort medium` |
| 重要レビュー | `/effort xhigh` |

---

## Agent Teams 3役モデル

| 役割 | 担当 | 推奨モデル |
|------|------|-----------|
| explorer（調査） | 情報収集・トレンド分析 | Haiku 4.5 |
| architect（設計） | 仕様書・構成決定・草稿 | Sonnet 5 |
| executor（実行） | ファイル生成・実装 | Sonnet 5 / 品質重要な場面は Opus 5 |

---

## 変更履歴

| 日付 | 変更内容 | 議論のポイント |
|------|---------|--------------|
| 2026-05-29 | 初版作成。Opus 4.8 採用決定。Codex 棲み分け確定。 | SWE-bench Pro 比較（Opus 4.8 69.2% > GPT-5.5 58.6%）により設計レビューは Claude Code に集約。ChatGPT auth 問題で GPT-5.5 はデフォルト利用不可。 |
| 2026-05-29 rev.2 | スペック補完・GPT-5.5 auth 修正・GPT-5.4-nano 追加・廃止予定追記。Opus 4.8 有料先行リリースを確認。 | Opus 4.8 は公式ドキュメント未掲載だが有料ユーザー先行提供で動作確認済み。GPT-5.5 が 2026-04-24 より API Key で利用可能になったが SWE-bench 差は維持。棲み分けは変更なし。 |
| 2026-06-04 rev.3 | Opus 4.8 の公式ドキュメント掲載を確認。新機能（mid-conversation system messages・キャッシュ最小長1,024 tokens）・改善点を追記。CLAUDE.md セッション運用に `/effort` 保持と Routines を追加。 | Opus 4.8 が正式に `whats-new-claude-4-8` ページに掲載。有料先行から正式公開へ移行確認。棲み分けは変更なし。 |
| 2026-07-04 rev.4 | デフォルト起案者を Sonnet 4.6 → **Sonnet 5** に移行。**Fable 5**（2026-06-09 GA）を最上位エスカレーション枠として追加。GPT-5.6（Sol/Terra/Luna・限定プレビュー）を Codex 欄に追記（様子見）。Opus 4.1 廃止予定（8/5）・Sonnet 4.6 等の Legacy 化を反映。 | Sonnet 5 は 4.6 の上位互換（出力64k→128k・カットオフ2025年8月→2026年1月・導入価格$2/$10）。Fable 5 は $10/$50 と高額のためデフォルトにせず手動エスカレーション。コーディング設計レビューは引き続き Opus 4.8 が公式推奨。GPT-5.6 は GA前・ベンチ未公表で棲み分け変更は保留。 |
| 2026-07-21 rev.5 | GPT-5.6 GA（2026-07-09）を反映。**階層の序列誤認を訂正**: 前回記録は Sol=フラッグシップ/Luna=軽量で正しかったが、別経路の情報で Luna=最上位と誤って伝わり `/review` `/review-diff` の既定モデルが一時 `gpt-5.6-luna` に設定される事故が発生。複数の外部ソース（価格・ベンチマーク一致）で Sol が最上位と再確認し `gpt-5.6-sol` に修正。SWE-bench Pro に Fable 5（80%）・GPT-5.6 Sol（64.6%）を追加。 | 階層名（Sol/Terra/Luna）は性能の直感に反するため、今後このファイルを唯一の正として参照する。GPT-5.6 Sol は SWE-bench Pro で Opus 4.8 に届かず、コードレビュー既定は Codex 側でも Claude Opus 4.8 推奨を維持。Codex CLI（gpt-5.6-sol）は Codex 独自の Coding Agent Index で強みがあるため `/review-diff` の第三者レビュー用途としては継続採用。 |
| 2026-09-06 rev.8 | **Fable 5 → Fable 5.1（`claude-fable-5-1`）へ交代**（CEO 承認）。GPT-6 Astra の価格・スペック・ベンチマーク・GA 状況を確定。**GPT-5.6 3階層の価格を訂正**（Sol $5/$30→$4/$20・Terra $2.50/$15→$2/$12・Luna $1/$6→$0.20/$1.20）。Sonnet 5 の導入価格が2026-08-31 で終了したことを反映。廃止コミット表を追加（Haiku 4.5 が2026-10-15 で唯一1年以内）。`/codex-review` の既定は astra 維持を決定。 | **Fable 5.1 でカットオフが逆転**（2026年6月 > Opus 5 の2026年5月）し、rev.7 までの「Fable はカットオフが古いので最新仕様は Opus 5」という使い分け根拠が消滅。CEO 判断で根拠を価格（半額）とトークン消費量（30%増）に差し替えた。GPT-6 Astra は SWE-bench Pro を OpenAI が未公表で、Deep SWE 74.1%（Opus 5 は73.7%）・Coding Agent Index 67（Fable 5.1 は70）と差は僅か。**`/codex-review` を使う理由をスコア優位から「別ベンダーの別の失敗モードを見ること」へ再定義**した上で astra を維持（ChatGPT Plus 定額のため API 価格差はコストに影響しない）。GPT-5.6 の価格誤りは rev.5 から2ヶ月間放置されていた。 |
| 2026-09-06 部分更新 | Codex CLI を 0.144.6 → **0.153.4** に更新し、**`gpt-6-astra`** を `/codex-review` `/codex-diff` の既定モデルに採用（effort **high** を明示指定）。GPT-6 特記事項を追記。CLIバージョン追随の自動検知を `codex-review.sh` と `/weekly-check` に実装。 | astra はサーバー側で提供開始済みだったが CLI が9バージョン遅れており、CEO の勘だけが検知手段だった。同じ取りこぼしを防ぐため検知を機構化。価格・ベンチマーク・GA日は未調査のため rev 番号を上げず、冒頭の最終更新日も据え置いた（同日の rev.8 で確定させた）。 |
| 2026-07-29 rev.6 | **Opus 5（`claude-opus-5`・2026-07-24 GA）を Critic 既定に採用**。Opus 4.8 はレガシー/フォールバックへ。Fable 5 の「2026-07-07 以降利用不可想定」を「GA 継続・終了日未定」に訂正し、**深い推論タスクでは Fable 5 を第一候補**とする CEO 方針を明記。SWE-bench Pro に Opus 5（79.2%・報道値）を追加。OpenAI 側は変更なし。 | Opus 5 は 4.8 と同価格（$5/$25）で SWE-bench Pro +10pt・カットオフ2026年5月・Claude Code のデフォルト Opus も 5 に切替済みのため交代を即決。Fable 5（80%）と Opus 5（79.2%）はほぼ並ぶが、CEO 判断により深い推論用途は Fable 5 優先を維持（提供継続が確認されたため）。 |

---

## 新プロジェクト向け CLAUDE.md 初期値テンプレート

```markdown
## モデル使い分け（R-09 相当）
- Haiku 4.5: 調査・短いファイル生成（最安・ナレッジカットオフ2025年2月・廃止は早くとも2026-10-15）
- Sonnet 5: 草稿・コード生成（デフォルト・$3/$15/MTok）
- Opus 5: 重要設計レビュー・複雑なコード・クリティーク（$5/$25/MTok・/effort xhigh 推奨）
- Fable 5.1: 深い推論が必要なタスク・最上位エスカレーション（$10/$50/MTok・手動選択）

起案→批評フロー: Sonnet 5 草稿 → Opus 5 批評 → ユーザー最終選択
※ Opus 5 を優先する根拠は価格（Fable 5.1 の半額）とトークン消費量（Fable 系は約30%多い）。カットオフは Fable 5.1 の方が新しい
```

---

## CLAUDE.md から移した詳細（2026-08-05 のスリム化で吸収）

### モデル仕様

| | Fable 5.1 | Opus 5 | Sonnet 5 | Haiku 4.5 |
|---|---|---|---|---|
| ID | `claude-fable-5-1` | `claude-opus-5` | `claude-sonnet-5` | `claude-haiku-4-5-20251001` |
| 価格（入力/出力 per MTok） | $10 / $50 | $5 / $25 | $3 / $15 | $1 / $5 |
| キャッシュ読み取り | **入力の2.5%**（$0.25） | 入力の10%（$0.50） | 入力の10%（$0.30） | 入力の10%（$0.10） |
| コンテキスト | 1M | 1M | 1M | 200k |
| 最大出力 | 128k | 128k | 128k | 64k |
| 信頼できる知識カットオフ | **2026年6月** | 2026年5月 | 2026年1月 | 2025年2月 |
| 拡張思考 | なし | なし | なし | あり |
| 適応的思考 | あり（常にオン） | あり | あり | なし |
| 既定 effort | high | high | high | 非対応 |
| 廃止は早くとも | 2027-09-01 | 2027-07-24 | 2027-06-30 | **2026-10-15** |
| レイテンシ | 遅い | 中程度 | 速い | 最速 |

- Fable 系は Opus 4.7 導入のトークナイザを使うため、同じテキストで約30%多いトークンを生成する。表示価格以上に実効コストが高い
- **Fable 5.1 の知識カットオフ（2026年6月）は Opus 5（2026年5月）より新しい**（rev.7 までの逆の記述は Fable 5 時代のもので失効）。
  Opus 5 を選ぶ根拠は**価格が半額（$5/$25 対 $10/$50）とトークン消費量が約30%少ないこと**に限られる
- キャッシュ読み取りは Fable 5.1 と Mythos 5.1 のみ2.5%。長時間セッションでは価格差2倍という印象より実コスト差は小さい
- Batch API の `output-300k-2026-03-24` ベータヘッダー使用時は Opus 5 / Sonnet 5 ともに最大300k出力
- Opus 5 / Sonnet 5 は Claude API と Claude Code で effort 既定が `high`
- temperature / top_p / top_k は非対応（非デフォルト値で400エラー）。`thinking: {type: "adaptive"}` + `/effort` で制御する
- `/fast` は Opus 5 / Opus 4.8 が対象（Fast モード $10/$50）
- Opus 4.8（`claude-opus-4-8`）はレガシー。Opus 5 障害時のフォールバック
- Claude Mythos 5（`claude-mythos-5`）は Project Glasswing の招待制で一般提供なし。選択できないため棲み分けの対象外

### Opus 5 切替通知ルール

以下のタイミングでは作業を始める前に「Opus 5 への切り替えを推奨します: `/model claude-opus-5`」と通知し、CEO の確認を待つ。
切り替え不要と言われたらそのまま続ける。

- superpowers スキル使用時（全種・brainstorming / systematic-debugging / writing-plans / subagent-driven-development / dispatching-parallel-agents 等）
- 歌詞レビュー（承認ゲート③直前）・PVコンセプトレビュー（承認ゲート⑥直前）
- SVP生成（`/phase2-svp` 実行前）
- CLAUDE.md 等の重要設計変更のクリティーク
- Agent Teams のレビューフェーズ（quality-listener・concept-critic）
- 出力が 64k tokens 超になる見込みの大型タスク

最重要レビュー（③歌詞・⑥PVコンセプト）とコーディング系タスク（SVP生成・HP作業・Agent Teams起動）には `/effort xhigh` を付与する。
hooks から `CLAUDE_EFFORT` 環境変数を参照できる（v2.1.133〜）。

### Agent Teams のモデル割当

3役モデル: explorer（調査）→ Haiku / architect（設計）→ Sonnet 5 / executor（実行）→ Sonnet 5（品質重要な場面は Opus 5）。

| エージェント | フェーズ | モデル |
|---|---|---|
| trend-analyst | 1 | Sonnet 5 |
| music-spec-writer / lyric-poet | 2-A | Sonnet 5（起案） |
| lyric-critic（③直前） | 2-B | Opus 5（批評） |
| svp-generator | 2-C | Opus 5 |
| quality-listener | 2-D | Sonnet 5 |
| concept-director / visual-prompter | 3 | Sonnet 5（起案） |
| concept-critic（⑥直前） | 3-R | Opus 5（批評） |
| sns-batch-agent / press-release-writer / copyright-agent | 4 | Sonnet 5 |
| analytics-agent | 4 | Haiku |

### デザインの既定

クリーム背景・セリフ体（NuWord のデザイン言語と一致・Opus 4.8 からの運用ノウハウを踏襲）。
