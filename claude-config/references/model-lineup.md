# AIコーディングエージェント モデル棲み分け参考資料

最終更新: 2026-10-24 rev.11
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

## Claude Code — モデル一覧と用途（2026-10-24 rev.11）

| モデル | 用途 | コスト（入力/出力/MTok） | コンテキスト | 最大出力 |
|--------|------|--------------------------|------------|---------|
| **Haiku 4.5** | 調査・短いファイル生成・ドキュメント更新 | $1 / $5 | 200k | 64k |
| **Sonnet 5.5** | 仕様書・草稿・コード生成（デフォルト・2026-10-24 rev.11 で Sonnet 5 から交代。エージェント定義は別名 `sonnet` のまま） | $2 / $10（キャッシュ読取 $0.10 = 5%） | 1M | 128k |
| Sonnet 5（レガシー） | 旧起案者（2026-07-04〜2026-10-24） | $2 / $10 | 1M | 128k |
| **Opus 5.5** | 重要設計レビュー・複雑コード・クリティーク（Critic 既定・2026-09-27 rev.10 で Opus 5 から交代・**effort high を明示**） | $4 / $20（キャッシュ読取 $0.20 = 5%） | 1M | 128k |
| Opus 5 Fast | Opus 5 と同等知能を高速実行（`/fast`）。Opus 5.5 の `/fast` 対応は未確認 | $10 / $50 | 1M | 128k |
| **Fable 5.1** | 深い推論が必要なタスク・最上位エスカレーション | $10 / $50（キャッシュ読取 $0.25 = 2.5%） | 1M | 128k |
| Fable 5（レガシー） | 旧最上位。5.1 へ移行済み | $10 / $50 | 1M | 128k |
| Opus 5（レガシー） | 旧 Critic（2026-07-29〜2026-09-27）。Opus 5.5 障害時のフォールバック | $5 / $25 | 1M | 128k |

**モデルID:** `claude-haiku-4-5-20251001` / `claude-sonnet-5-5` / `claude-sonnet-5`（レガシー） / `claude-opus-5-5` / `claude-fable-5-1` / `claude-opus-5`（レガシー） / `claude-fable-5`（レガシー）

**Sonnet 5 の $2/$10 は標準価格として確定した（2026-09-12 訂正）。** 公式料金ページの注記:
「$2/$10という料金は、リリース時に2026年8月31日までの導入価格として発表されましたが、現在は標準価格となっています。
以前に予定されていた2026年9月1日の$3/$15への値上げは行われません。」
rev.8 の「2026-08-31 で終了し現在は $3/$15」は誤り。値上げ予定を確認したまま実施の有無を再確認しなかったことが原因。
これにより Opus 5 との価格差は 1.67倍 → **2.5倍**。起案を Sonnet 5 に寄せる経済合理性は rev.8 想定より強い。
（rev.10: Critic が Opus 5.5（$4/$20）に交代し差は2倍に縮んだが、起案を Sonnet 5 に置く方針は維持）

### Opus 5.5 特記事項（2026-09-27 rev.10 で Critic 既定に採用・CEO 承認）
- `claude-opus-5-5`。Claude Code v2.1.280 で追加され**既定の Opus モデル**に。公式モデル一覧の現行4本（Fable 5.1 / Opus 5.5 / Sonnet 5 / Haiku 4.5）に入り、Opus 5 は Legacy へ
- 価格 **$4/$20**（Opus 5 の2割安・Fable 5.1 の4割）。**キャッシュ読取は基本入力の5%（$0.20/MTok）**で Sonnet 5 と同額。Batch 50%オフ・`output-300k-2026-03-24` ベータ対応
- 1M コンテキスト・128k 出力・**信頼できる知識カットオフ 2026年6月（Fable 5.1 と同じ）**。適応的思考（常時オン）・拡張思考なし
- **既定 effort は `medium`**（Fable 5.1 / Sonnet 5 は high）。Claude Code v2.1.280 で `/effort` がモデル別保存になったため、Opus 5.5 を選んだ直後は medium で動く。
  **批評用途では `/effort high` 以上、またはエージェント定義の `effort: high` を必ず明示する（rev.10 の採用条件）**
- 公式推奨: 「ほとんどのワークロードは Opus 5.5 から始め、高度な推論・長期エージェント作業、または Opus 5.5 を高 effort で回しても評価が基準に届かない場合に Fable 5.1」
- SWE-bench Pro: **未確認**（2026-09-27 時点で公式モデル一覧に記載なし。前身 Opus 5 は 79.2%。次回レビューで確認）
- 廃止コミット: **2027-09-22 以降**（現行4モデル中で最長）
- `/fast` 対応は未確認（Claude Code の案内は Opus 5 / 4.8 のまま）
- 移行ガイド: `platform.claude.com/docs/ja/models/opus-5-5/migration-guide`
- Fable 5.1 との使い分け: カットオフは同じ。Opus 5.5 優位は価格（4割）とレイテンシ（Moderate 対 Slower）、Fable 5.1 優位は SWE-bench Pro 81.2% とキャッシュ読取2.5%。深い推論は Fable 5.1 という CEO 方針を維持

### Opus 5 特記事項（レガシー・2026-09-27 rev.10 に Critic 役を Opus 5.5 へ移譲・フォールバック）
- **2026-07-24 GA**（`claude-opus-5`）。Opus 4.8 と同価格（$5/$25）で性能向上
- 適応的思考あり・拡張思考なし。ナレッジカットオフ: **2026年5月**（4.8 の2026年1月から前進）
- SWE-bench Pro: **79.2%**（4.8 の 69.2% から +10pt・Fable 5 の 80% にほぼ並ぶ）※報道値・公式ページでの再確認推奨
- SWE-bench Verified 96.0% / Frontier-Bench v0.1 43.3%（4.8 の 21.1% から倍増）。公式の位置づけは「Fable 5 のフロンティア知能に半額で肉薄」
- Claude Code v2.1.219 でデフォルト Opus モデルになり、v2.1.280 で Opus 5.5 に交代（rev.10）。`/fast` 対象は Opus 5・4.8（4.7 は除外・Fast $10/$50）
- effort デフォルト high（Claude API・Claude Code）。Batch API ヘッダー `output-300k-2026-03-24` で最大300k出力可能

### Opus 4.8 特記事項（レガシー・2026-07-29 に Critic 役を Opus 5 へ移譲・2026-09-27 rev.10 でフォールバック役も Opus 5 へ移り一覧表から削除）
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
- **価格 $2/$10（標準価格として確定）**。キャッシュ読取 $0.20・Batch $1/$5。予定されていた $3/$15 への値上げは中止された
- Batch API ヘッダー `output-300k-2026-03-24` で最大300k出力可能
- モデルID `claude-sonnet-5`（Sonnet 4.6 は Legacy 落ち・`claude-sonnet-4-6` は当面利用可だが移行推奨）

### Fable 5.1 特記事項（2026-09-06 rev.8 で Fable 5 から交代）
- `claude-fable-5-1`。**既定の Fable モデル**（Claude Code v2.1.257 で追加）。Fable 5 は Legacy へ
- 適応的思考（常時ON）・拡張思考なし。**ナレッジカットオフ 2026年6月**・1M コンテキスト・128k 出力
- 価格 $10/$50（Opus 5.5 の2.5倍）。ただし**プロンプトキャッシュ読み取りが基本入力価格の2.5%**（$0.25/MTok）で、
  他モデルの10%より大幅に安い（Mythos 5.1 も同条件）。長時間セッションでは表示価格の差より実コスト差が縮む
- **カットオフが Opus 5（2026年5月）を追い越した。** rev.7 まで「Fable はカットオフが古いので最新仕様は Opus 5」を
  使い分けの根拠にしていたが、この根拠は消滅。残る Opus 5 優位は**価格（半額）とトークン消費量（Fable 系は約30%多い）**のみ
- rev.10 で Critic が Opus 5.5 に交代。Opus 5.5 のカットオフは Fable 5.1 と同じ2026年6月。Opus 5.5 優位は**価格（$4/$20 = Fable 5.1 の4割）とレイテンシ（Moderate）**、
  Fable 5.1 優位は **SWE-bench Pro 81.2%（Opus 5.5 は未確認）**とキャッシュ読取2.5%
- **デフォルトにはしない**。公式ガイダンスは「ほとんどのワークロードは Opus 5.5 から始め、
  高度な推論や長期エージェント作業、または高 effort の Opus 5.5 の評価が不十分な場合に Fable 5.1」（rev.10 で Opus 5 → 5.5 に更新）
- Coding Agent Index（Artificial Analysis）: **Fable 5.1 = 70**（GPT-6 Astra 67 より上）
- **SWE-bench Pro: 81.2%**（Anthropic システムカード値・2026-09-12 確認）。Fable 5 の 80.0% を上回り首位。
  rev.8 の「未確認」を解消。一部の外部記事が Fable 5.1 に 80.0% を当てているが、それは Fable 5 の6月時点の値
- 廃止コミット: **2027-09-01 以降**（rev.9 まで最長。rev.10 で Opus 5.5 の 2027-09-22 が最長に）
- 輸出管理による断続提供リスクは残るため、恒常的に当てにできる最上位 fallback は Opus 5.5。詳細 [[project_fable5_unavailable]]
- NOCTA 用途（CEO 方針・2026-07-29 決定 / 2026-09-06 に 5.1 へ更新）: **深い推論が必要なタスクでは Fable 5.1 を第一候補**とする
  （超重要クリティーク・歌詞/PVコンセプトの最終判断・複雑な設計判断）
- Mythos 5 / Mythos 5.1 は Project Glasswing 招待制・防御的サイバーセキュリティ限定（一般利用不可・棲み分け対象外）

### Haiku 4.5 特記事項
- 拡張思考対応あり
- ナレッジカットオフ: **2025年2月**（古い。トレンド判断は Sonnet 5 以上に委ねる）
- トレーニングデータカットオフ: 2025年7月

### 廃止コミット（Anthropic 運営プラットフォーム・rev.10 更新）

| モデル | 廃止は早くとも |
|---|---|
| Fable 5.1 | 2027-09-01 |
| **Opus 5.5** | **2027-09-22**（現行4モデル中で最長） |
| Opus 5（レガシー） | 2027-07-24 |
| Sonnet 5 | 2027-06-30 |
| **Haiku 4.5** | **2026-10-15**（現行4モデル中で唯一1年以内。後継の登場を見込んでおく） |

Amazon Bedrock と Google Cloud は独自の日程を設定する。

### 廃止予定（要注意）
- Claude Opus 4.1（`claude-opus-4-1-20250805`）→ **2026年8月5日 廃止済み**（Bedrock / Google Cloud を除く）
- Claude Sonnet 4 / Opus 4（`claude-sonnet-4-20250514` / `claude-opus-4-20250514`）→ 2026年6月15日 廃止済み
- Claude Haiku 3（`claude-3-haiku-20240307`）→ 2026年4月19日 廃止済み
- Legacy 化（利用可だが移行推奨）: **Opus 5（2026-09 の Opus 5.5 リリースに伴い・rev.10）** / **Fable 5（2026-09 の Fable 5.1 リリースに伴い）** / **Opus 4.8（2026-07-24 の Opus 5 リリースに伴い）** / Sonnet 4.6 / Opus 4.7 / Opus 4.6 / Sonnet 4.5 / Opus 4.5

---

## 起案→批評フロー（推奨パターン）

```
Sonnet 5.5（草稿起案）→ Opus 5.5（批評・代替案提示・effort high 以上を明示）→ ユーザー（最終選択）
※ 深い推論が必要な案件・Opus 5.5 の判断が割れた場合は Fable 5.1 にエスカレーション
```

適用場面: 歌詞選択前・PVコンセプト承認前・CLAUDE.md等の重要設計変更時

---

## Codex CLI（OpenAI）— モデル一覧（2026-09-27 rev.10 で GPT-6 Sol / Luna と gpt-5.5 の廃止日を追記）

| モデル | 適した用途 | 備考 |
|--------|-----------|------|
| **gpt-6-astra** | GPT-6 世代のフラッグシップ。複雑・高負荷な作業 | **コードレビュー用途はこれ**（`/codex-review` 既定・effort high）。$10/$50・キャッシュ入力 $1.00（10%）・1.05M・カットオフ2026-04-30。要 Codex CLI 0.153.4+ |
| **gpt-6-sol**（定額フォールバック1番目・2026-10-24 採用） | GPT-6 世代の中位。複雑なコーディングとエージェント | **$2/$10**（キャッシュ入力 $0.20）・1.05M・128K・カットオフ 2026-04-20。Codex CLI 0.157.0 で追加。**2026-10-22 にローカル models_cache.json へ掲載（priority 4）、2026-10-24 に ChatGPT Plus 経由の動作を確認**（CLI 0.164.0） |
| `gpt-6.1-sol`（監視中） | gpt-6-sol の改良版 | 2026-09-29 の DevDay で公開。API のモデル一覧では Sol はこの 6.1 だけが載る（$2/$10・カットオフ 2026-04-30）。**ローカルの models_cache.json には未掲載**（2026-10-24 時点）。掲載され動作を確認したら gpt-6-sol と差し替える |
| **gpt-6-luna**（監視中） | GPT-6 世代の軽量。高頻度・低コスト | **$0.10/$0.50**（キャッシュ入力 $0.01）・カットオフ 2026-05-18。Codex CLI 0.157.0 で追加。ローカルキャッシュ未掲載。従量課金枠の固定モデル（現 gpt-5.6-luna）の差替候補 |
| **gpt-5.6 Sol** | 前世代フラッグシップ（最上位） | **$4/$20**（キャッシュ入力 $0.40）。カットオフ 2026-02-16。2026-07-09 GA。alias `gpt-5.6` で API から呼べる（Codex CLI では階層名必須）。CLI が古い環境向けフォールバック |
| **gpt-5.6 Terra** | バランス型（中位） | **$2/$12**（キャッシュ入力 $0.20）。カットオフ 2026-02-16 |
| **gpt-5.6 Luna** | 軽量・最下位。高頻度・低レイテンシ向け | **$0.20/$1.20**（キャッシュ入力 $0.02）。カットオフ 2026-02-16。Sol級の推論は「overkill」な用途向け |
| ~~gpt-5.5~~ | 汎用・前世代フラッグシップ | **2026-10-14 に Codex で廃止。ローカルのモデル一覧からも消えた（2026-10-24 確認）。** 定額フォールバック鎖から外し、`gpt-6-sol → gpt-5.6-sol` に変更した（rev.11・CEO 承認） |
| ~~gpt-5.4~~ | 前世代汎用・コーディング統合版 | **API モデル一覧から消滅（2026-09-12 確認）。** 新規採用しない |
| ~~gpt-5.4-mini~~ | 軽量・高速タスク | **API モデル一覧・CLI キャッシュの双方から消滅（2026-09-12 確認）** |
| ~~gpt-5.4-nano~~ | 最軽量・最低コスト | **API モデル一覧から消滅（2026-09-12 確認）。** 旧価格 $0.05/$0.40/MTok |
| ~~gpt-5.3-codex~~ | 複雑なエンジニアリングタスク | **API モデル一覧から消滅**するも価格ページには残存（$1.75/$14・2026-09-12 確認）。提供状況が不透明なため新規採用しない |
| ~~gpt-5.3-codex-spark~~ | リアルタイム反復・インクリメンタル修正 | **API モデル一覧から消滅（2026-09-12 確認）** |
| `gpt-reserve`（未公開・監視中） | 「Fast and affordable agentic coding model.」と自称 | **公式ドキュメント・価格ページに未掲載。** Codex CLI 0.154.0 のキャッシュに priority 3 / `visibility: "hide"` / `supported_in_api: true` で出現。既定 effort medium・effort は low〜max（astra の `ultra` なし）。内部テンプレートは「an agent based on GPT-5」と記述。**採用しない。次回レビューで追跡** |

### GPT-6 特記事項（2026-09-06 rev.8 で確定）
- Codex のモデル一覧で **priority 1**。階層名は不要で `gpt-6-astra` 単体指定で通る（GPT-5.6 の Sol/Terra/Luna と違う）
- 公式説明: "Our most capable model for complex, demanding work."
- **価格 $10/$50**（Fable 5.1 と同額・GPT-5.6 Sol の2.5倍）
- **コンテキスト 1.05M・最大出力 128K・カットオフ 2026年4月30日**
  ※ Codex CLI の `models_cache.json` は 272,000 と申告する。CLI 上の制限と API 上限が異なるため両方記録する
- 推論レベルが6段階に拡張: **low / medium / high / xhigh / max / ultra**（モデル既定は low）。
  `ultra` は「最大推論＋タスクの自動委譲」。速度ティア `fast`（2倍速・使用量増）も選択可
- Codex CLI **0.153.4 以降**で ChatGPT Plus 経由の利用可（検証済み 2026-09-06）。0.144.6 では 400 拒否
- **リリース状況: 正式提供へ移行（2026-09-12 確認・rev.8 の「GA 未達」を更新）。**
  2026-09-03 に段階ロールアウト開始（サイバーセキュリティプログラム参加企業が先行）→ 翌日以降 ChatGPT Plus / Pro / Business /
  Enterprise と OpenAI API・Microsoft Azure・AWS Bedrock へ拡大。**公式 API ドキュメントにフラッグシップとして掲載され、
  API 価格も公開済み**（$10/$50・キャッシュ入力 $1.00）。早期提供分依存というリスク注記は不要になった
- 専門モデルとして GPT-5.6-Cyber / Daybreak Red / Daybreak Blue（サイバーセキュリティ）が別枠で存在する
- API のモデル一覧から **gpt-5.5 / gpt-5.4 系 / gpt-5.3-codex 系が消えている件は 2026-09-12 に再確認し確定。**
  CLI キャッシュ側も gpt-5.4-mini が消え、残るのは gpt-5.5（priority 12）のみ。gpt-5.3-codex は価格ページにだけ残存（$1.75/$14）。
  **API 非提供化が先に進み、CLI キャッシュと価格ページが遅れて追随している**という理解でよい。判断フローからは削除した

### GPT-6 Sol / Luna（2026-09-27 rev.10 で追加・採用判断待ち）
- 公式 API ドキュメントに掲載: **gpt-6-sol** $2/$10・1.05M・128K・カットオフ 2026-04-20（「複雑なコーディングとエージェント」）、
  **gpt-6-luna** $0.10/$0.50・カットオフ 2026-05-18（「コスト効率重視の高量タスク」）。GPT-5.6 Sol（$4/$20）の半額で世代が1つ新しい
- Codex CLI **0.157.0（2026-09-25）**で追加（Amazon Bedrock 対応・旧モデルの移行プロンプト同梱）。0.157.1 が 2026-09-26 リリース。NOCTA は 2026-09-27 に 0.157.1 へ更新済み
- **ローカル `~/.codex/models_cache.json`（2026-09-27 11:39 更新）には未掲載。** 掲載は gpt-6-astra（p1）/ gpt-reserve（p3・hide）/ gpt-5.6-sol（p4）/
  gpt-5.6-terra（p7）/ gpt-5.6-luna（p8）/ gpt-5.5（p12・**2026-10-14 廃止**・移行先 gpt-5.6-sol）/ codex-auto-review（p43・hide）
- 判断待ち事項（CEO）: (1) 定額フォールバック鎖を `gpt-6-astra → gpt-6-sol → gpt-5.6-sol` に変えるか（gpt-5.5 廃止対応）。**変更前に ChatGPT Plus 経由で gpt-6-sol の動作確認が必要**。
  (2) 従量課金枠の固定モデルを gpt-5.6-luna → gpt-6-luna にするか（既定無効は維持）
- 階層名の序列は GPT-5.6 と同じ Sol > Terra > Luna。**Astra は GPT-6 だけの最上位名**で 5.6 世代には存在しない
- 価格ページの残存: gpt-5.3-codex $1.75/$14・o3 $2/$8 は前回と同じ（提供状況は不透明のまま）

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

### OpenAI の新規専門モデル（2026-09-12 rev.9 で追加・棲み分け対象外だが記録）

- **GPT-Image-2.5 Sunburst / Flare**（スナップショット `gpt-image-2.5-{sunburst,flare}-2026-09-08`）。
  Sunburst = 編集精度優先の最上位、Flare = 高速な日常生成。エンドポイントは `v1/images/generations` と `v1/images/edits`（inpainting 対応）。
  quality は low / medium / high / **xhigh / max** / auto。課金はトークン制で**レートは GPT Image 2 と同一**
  （テキスト入力 $5・画像入力 $8・画像出力 $30 / MTok）。同コストで上位モデルに移行できる。
  **NOCTA の visual-prompter / `/visual-prompt` は GPT Image 2 前提のため、詳細と移行判断は `nocta-tools.md` 側で扱う**
- **GPT-Rosalind**（ライフサイエンス特化）・GPT-Live-1 / GPT-Realtime（音声）・各種文字起こしモデル。NOCTA の用途に該当なし

### GPT-5.6 特記事項（2026-07-21 追加）
- 2026-06-26 限定プレビュー（政府審査済み）→ **2026-07-09 GA**（ChatGPT・API・Codex・GitHub Copilot 全対応）
- 命名規則: 数字（5.6）が世代、Sol/Terra/Luna が恒久的な階層名。**階層名から性能を誤読しやすい**（"Luna"を最上位と誤認した実例あり）。正しい序列は **Sol > Terra > Luna**
- ChatGPT Plus 連携（Codex CLI）で使うには階層名の指定が必須。単体の `gpt-5.6` は非対応（400エラー）
- Codex CLI 0.144.0 以降で ChatGPT Plus 経由の利用可能（検証済み 2026-07-21）

### 廃止予定（OpenAI）
- GPT-4.5 → 2026年6月27日 廃止予定
- o3 → 2026年8月26日 廃止予定

### SWE-bench Pro 比較（2026-09-27 rev.10 更新）

| モデル | SWE-bench Pro |
|--------|--------------|
| **Claude Fable 5.1** | **81.2%**（Anthropic システムカード値・2026-09-12 確認） |
| Claude Opus 5.5 | **未確認**（2026-09-27 時点・公式モデル一覧に記載なし。次回レビューで確認） |
| Fable 5 | 80.0% |
| Claude Opus 5 | **79.2%**（報道値・公式ページでの再確認は未了） |
| Claude Opus 4.8 | 69.2% |
| GPT-5.6 Sol | 64.6% |
| GPT-5.5 | 58.6% |
| GPT-6 Astra | **未公表**（OpenAI が SWE-bench Pro を出していない） |

**設計レビュー・コードレビュー → Claude Opus 5.5（effort high 以上）を推奨**（Claude系フラッグシップが依然優位。Opus 5.5 の SWE-bench Pro は未確認だが Opus 5 79.2% の後継）。

**rev.9 の注意**: Fable 5.1 の値は確定した（81.2%）が、**GPT-6 Astra は依然 SWE-bench Pro を公表していない**ため、
この表で Claude 系と GPT-6 世代を直接比較することはできない。別指標（Deep SWE / Coding Agent Index）では
Astra 67 対 Fable 5.1 70 で Claude 系がなお優位（上記「ベンチマーク: GPT-6 Astra」節を参照）。
**ベンチマーク差が縮んでいるため、`/codex-review` を使う理由はスコア優位ではなく「別ベンダーの別の失敗モードを見る」ことにある**
（2026-09-06 CEO 判断で astra 維持）。

---

## Claude Code vs Codex 棲み分け判断フロー

```
タスクが来たら:

1. NOCTAワークフロー（スキル実行・CLAUDE.md更新・フェーズ進行）
   → Claude Code 一択

2. SVPファイル生成・HP作業・Agent Teams
   → Claude Code Opus 5.5（/effort xhigh）

3. 設計レビュー・コードレビュー（複雑な判断）
   → Claude Code Opus 5.5（effort high 以上。前身 Opus 5 の SWE-bench Pro 79.2% > GPT-5.6 Sol 64.6%）
   → 深い推論が必要な場合は Fable 5.1（SWE-bench Pro 81.2% で首位・CEO 方針 2026-07-29 決定 / 2026-09-06 に 5.1 へ更新）
   → 第三者視点が欲しい場合は Codex CLI の gpt-6-astra（effort high）。スコア優位ではなく別ベンダーの失敗モードを見る目的

4. 外部ツールのプロンプト設計
   → Claude Code Sonnet 5.5

5. 短い1ファイル修正・単純なコード補完
   → IDE内補完（Copilot等）で完結
   → または Claude Code Haiku 4.5（`/effort low`）
   ※ rev.8 まで推奨していた Codex gpt-5.3-codex-spark は API モデル一覧から消滅したため削除（2026-09-12）

6. 長い複雑なエンジニアリングタスク（Claude Code以外で完結させたい場合）
   → Codex gpt-6-astra（effort high 以上）
   ※ rev.8 まで推奨していた gpt-5.3-codex は API モデル一覧から消滅したため削除（2026-09-12）
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

### 設定で上限を固定する（Claude Code 2.1.267 / 2.1.269・2026-09-12 rev.9 で追加）

`/effort` の指定漏れによる超過は手動運用では防げない。以下は settings.json / 環境変数で機構的に上限を掛けられる。

| 設定 | 効果 | 導入バージョン |
|---|---|---|
| `maxEffortLevel` | effort の上限をキャップする（Bedrock / Vertex / Foundry を含む全プロバイダ） | 2.1.267 |
| `CLAUDE_CODE_WORKFLOW_MAX_CONCURRENT_AGENTS` | 動的ワークフローの同時実行エージェント数を制限（1〜256） | 2.1.269 |
| エージェント / スキル frontmatter の `effort:` | モデル切替後に既定 effort へ落ちる問題（Opus 5.5 は medium）を機構で防ぐ。`/effort` はモデル別保存になり、旧モデルの launch 既定に負けなくなった | 2.1.267 / 2.1.280 |

具体値の決定は別作業。NOCTA では `ultracode` を既定で使わない方針（COST POLICY）と組み合わせて検討する。

---

## Agent Teams 3役モデル

| 役割 | 担当 | 推奨モデル |
|------|------|-----------|
| explorer（調査） | 情報収集・トレンド分析 | Haiku 4.5 |
| architect（設計） | 仕様書・構成決定・草稿 | Sonnet 5.5 |
| executor（実行） | ファイル生成・実装 | Sonnet 5.5 / 品質重要な場面は Opus 5.5（effort high） |

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
| 2026-09-12 rev.9 | **Sonnet 5 の価格を $3/$15 → $2/$10 に訂正**（値上げ中止が公式確定）。**Fable 5.1 の SWE-bench Pro 81.2% を確定**（rev.8 の「未確認」を解消・首位）。**GPT-6 Astra を「GA 未達」から正式提供へ更新**（公式 API ドキュメント掲載・価格公開を確認）。gpt-5.5 / 5.4 系 / 5.3-codex 系の API 消滅を確定し、判断フロー5・6 から削除。未公開モデル `gpt-reserve` を監視項目として記録。GPT-Image-2.5 Sunburst / Flare を追記。GPT-5.6 のカットオフ（2026-02-16）とキャッシュ入力価格を補完。Opus 4.1 を廃止済みへ。`maxEffortLevel` / `CLAUDE_CODE_WORKFLOW_MAX_CONCURRENT_AGENTS` をコスト最適化指針に追加。 | **rev.8 最大の誤りは Sonnet 5 の価格。** 値上げ予告（2026-09-01 から $3/$15）を確認した時点で確定扱いにし、実施の有無を再確認しなかった。予告は予告として記録し、発効日を過ぎたら実施を確認する手順に改める。結果として Opus 5 との価格差は 1.67倍 → 2.5倍 で、起案を Sonnet 5 に寄せる根拠は想定より強い。Fable 5.1 が SWE-bench Pro でも首位（81.2% > Opus 5 79.2%）になり、「深い推論は Fable 5.1」という CEO 方針に数値の裏付けが付いた（Opus 5 を既定に残す根拠は価格半額とトークン消費30%減のみ）。GPT-6 Astra は正式提供に移行したが SWE-bench Pro は未公表のままで、`/codex-review` を astra で回す理由は rev.8 で再定義した「別ベンダーの別の失敗モードを見る」のまま変更なし。モデルラインアップ自体（Claude 4本・廃止コミット日）とエージェント割当は変更なし。 |
| 2026-09-27 rev.10 | **Opus 5 → Opus 5.5（`claude-opus-5-5`）へ Critic 既定を交代**（CEO 承認）。Opus 5 はレガシー / フォールバックへ、Opus 4.8 を一覧表から削除。Opus 5.5 の仕様（$4/$20・キャッシュ読取5%・1M・128k・カットオフ2026年6月・既定 effort medium・廃止 2027-09-22）を追記。**GPT-6 Sol / Luna**（Codex CLI 0.157.0 で追加・ローカルキャッシュ未掲載）と **gpt-5.5 の Codex 廃止日 2026-10-14** を記録。Codex フォールバック鎖の変更は CEO 判断待ち。Claude Code v2.1.280 の「effort モデル別保存」と frontmatter `effort:` をコスト指針に追加。 | Opus 5.5 は Opus 5 より2割安く、カットオフが Fable 5.1 と同じ2026年6月に揃い、公式推奨も「ほとんどは Opus 5.5」に変わったため交代を即決。**採用条件は effort high の明示**: 既定が medium のため、批評系エージェント定義（lyric-critic / concept-critic / svp-generator）と `/effort` で high を指定しないと Opus 5 時代より浅い推論になる。SWE-bench Pro は未公表で、Fable 5.1（81.2%）を深い推論の第一候補に置く CEO 方針は維持。OpenAI 側は GPT-6 Sol が 5.6 Sol の半額で登場したが、ローカルキャッシュ未掲載のため採用は動作確認後に判断する。 |
| 2026-10-24 rev.11 | **起案者を Sonnet 5 → Sonnet 5.5（`claude-sonnet-5-5`）へ交代**（CEO 承認・エージェント定義は別名 `sonnet` のまま）。**Codex の定額フォールバック鎖を `gpt-6-astra → gpt-6-sol → gpt-5.6-sol` に変更**（gpt-5.5 の 2026-10-14 廃止を受けて・CEO 承認）。gpt-6-sol の ChatGPT Plus 経由の動作を確認。gpt-6.1-sol を監視項目に追加。 | Sonnet 5.5 は Sonnet 5 と同価格（$2/$10）で SWE-bench Pro 81.3%（Sonnet 5 は 63.2%・外部集計値）。別名 `sonnet` で指定しているエージェントは Claude Code 側の既定変更（v2.1.284）で既に 5.5 で動いていたため、表記を実態に合わせた。Haiku 5.5 の採否と、Opus 5.5（SWE-bench Pro 89.9%・外部集計値）が Fable 5.1（81.2%）を上回った件の扱いは CEO 判断待ち。 |

---

## 新プロジェクト向け CLAUDE.md 初期値テンプレート

```markdown
## モデル使い分け（R-09 相当）
- Haiku 4.5: 調査・短いファイル生成（最安・ナレッジカットオフ2025年2月・廃止は早くとも2026-10-15）
- Sonnet 5.5: 草稿・コード生成（デフォルト・$2/$10/MTok）
- Opus 5.5: 重要設計レビュー・複雑なコード・クリティーク（$4/$20/MTok・既定 effort は medium のため /effort high 以上を明示）
- Fable 5.1: 深い推論が必要なタスク・最上位エスカレーション（$10/$50/MTok・手動選択）

起案→批評フロー: Sonnet 5.5 草稿 → Opus 5.5 批評（effort high） → ユーザー最終選択
※ Opus 5.5 を優先する根拠は価格（Fable 5.1 の4割）とレイテンシ。カットオフは両者とも2026年6月。SWE-bench Pro は Fable 5.1 が首位（81.2%・Opus 5.5 は未確認）
```

---

## CLAUDE.md から移した詳細（2026-08-05 のスリム化で吸収）

### モデル仕様

| | Fable 5.1 | Opus 5.5 | Sonnet 5 | Haiku 4.5 |
|---|---|---|---|---|
| ID | `claude-fable-5-1` | `claude-opus-5-5` | `claude-sonnet-5` | `claude-haiku-4-5-20251001` |
| 価格（入力/出力 per MTok） | $10 / $50 | **$4 / $20** | **$2 / $10** | $1 / $5 |
| キャッシュ読み取り | **入力の2.5%**（$0.25） | **入力の5%**（$0.20） | 入力の10%（$0.20） | 入力の10%（$0.10） |
| コンテキスト | 1M | 1M | 1M | 200k |
| 最大出力 | 128k | 128k | 128k | 64k |
| 信頼できる知識カットオフ | **2026年6月** | **2026年6月** | 2026年1月 | 2025年2月 |
| 拡張思考 | なし | なし | なし | あり |
| 適応的思考 | あり（常にオン） | あり（常にオン） | あり | なし |
| 既定 effort | high | **medium** | high | 非対応 |
| 廃止は早くとも | 2027-09-01 | 2027-09-22 | 2027-06-30 | **2026-10-15** |
| レイテンシ | 遅い | 中程度 | 速い | 最速 |

- Fable 系は Opus 4.7 導入のトークナイザを使うため、同じテキストで約30%多いトークンを生成する。表示価格以上に実効コストが高い
- **Fable 5.1 と Opus 5.5 の知識カットオフは同じ2026年6月**（rev.10）。Opus 5.5 を選ぶ根拠は**価格（$4/$20 対 $10/$50）とレイテンシ**、
  Fable 5.1 を選ぶ根拠は **SWE-bench Pro 81.2%（Opus 5.5 は未確認・前身 Opus 5 は 79.2%）**とキャッシュ読取2.5%。
  旧記述（Opus 5 は価格半額・トークン消費30%少）は Opus 5 のレガシー化で失効
- キャッシュ読み取りは Fable 5.1 と Mythos 5.1 が2.5%、**Opus 5.5 が5%**、他は10%。長時間セッションでは表示価格差より実コスト差は小さい
- Batch API の `output-300k-2026-03-24` ベータヘッダー使用時は Opus 5.5 / Opus 5 / Sonnet 5 ともに最大300k出力
- Fable 5.1 / Sonnet 5 は effort 既定が `high`、**Opus 5.5 は `medium`**。Claude Code v2.1.280 から `/effort` はモデル別保存で、新モデルは既定値から始まる
- temperature / top_p / top_k は非対応（非デフォルト値で400エラー）。`thinking: {type: "adaptive"}` + `/effort` で制御する
- `/fast` は Opus 5 / Opus 4.8 が対象（Fast モード $10/$50）。Opus 5.5 の対応は未確認
- Opus 5（`claude-opus-5`）はレガシー。Opus 5.5 障害時のフォールバック。Opus 4.8 は一覧から外した（rev.10）
- Claude Mythos 5（`claude-mythos-5`）は Project Glasswing の招待制で一般提供なし。選択できないため棲み分けの対象外

### Opus 5.5 切替通知ルール

以下のタイミングでは作業を始める前に「Opus 5.5 への切り替えを推奨します: `/model claude-opus-5-5`（effort high 以上）」と通知し、CEO の確認を待つ。
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

3役モデル: explorer（調査）→ Haiku / architect（設計）→ Sonnet 5.5 / executor（実行）→ Sonnet 5.5（品質重要な場面は Opus 5.5・effort high）。

| エージェント | フェーズ | モデル |
|---|---|---|
| trend-analyst | 1 | Sonnet 5 |
| music-spec-writer / lyric-poet | 2-A | Sonnet 5（起案） |
| lyric-critic（③直前） | 2-B | Opus 5.5（批評・effort high） |
| svp-generator | 2-C | Opus 5.5（effort high） |
| quality-listener | 2-D | Sonnet 5 |
| concept-director / visual-prompter | 3 | Sonnet 5（起案） |
| concept-critic（⑥直前） | 3-R | Opus 5.5（批評・effort high） |
| sns-batch-agent / press-release-writer / copyright-agent | 4 | Sonnet 5 |
| analytics-agent | 4 | Haiku |

### デザインの既定

クリーム背景・セリフ体（NuWord のデザイン言語と一致・Opus 4.8 からの運用ノウハウを踏襲）。
