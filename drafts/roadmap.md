# NOCTA ロードマップ

作成日: 2026-06-16（multi-domain 体制へ改訂）
更新方針: 各領域ストリームごとにタスクを管理。完了タスクは各領域内で末尾へ。フェーズ進行・承認ゲート通過時に更新。

---

## アイデンティティ（現状）

NOCTA は「楽曲制作会社」から **Music × Visual × Words × Code の複数領域クリエイティブスタジオ**へ発展した。
HP のタグラインとリブランド（多領域・遊び哲学「遊ぶことで人生を彩ろう」）がこの実態を表している。

**重要な前提**: 楽曲制作は「停滞」ではなく「CEO ペースで進む1ストリーム」。
他の領域（Apps・Visual・Words・Code）は楽曲の進捗に依存せず、独立して出力を続ける。
したがって本ロードマップは単一のボトルネックではなく、**並行する領域ストリーム**として管理する。

現在の出力規模:
- Music（Works）: 6件（NuWord=現行オリジナル / 他はポートフォリオ）
- Apps: 4本ライブ（NuWord still / Seed / Verse / inner canvas）
- Visual: 14作品（Works/Art/Music・NFT連動）
- Words: ブログ3記事 + HP/LP

---

## ストリーム別ロードマップ

### Code / Web（HP・基盤）— 最も活発

| タスク | 担当 | 状態 | メモ |
|---|---|---|---|
| brand_assets.html / brandkit.html を現行パレットで再生成 | AI | 完了(2026-06-16) | 2ページを brandkit.html へ統合・multi-domain/単一シルバーで再生成。brand_assets.html 削除。要ブラウザ確認→push |
| デッドCSS（`.vocaloid-*` 等）除去 | AI | 完了(2026-06-16) | index.html から vocaloid/cute-underline/shimmer/star-float/dot-divider/vgreen-glow を除去。要push |
| `~/research/` を Obsidian Vault に追加 | CEO | 任意 | リサーチ蓄積の閲覧性向上 |
| 完了: NOCTA LP（猫モチーフ）・デザイン正本化・HP 英語対応 | — | 済 | 2026-06 |

### Apps（プロダクト）— 4本ライブ・収益化フェーズへ

| タスク | 担当 | 状態 | メモ |
|---|---|---|---|
| 汎用収益化キット（Gumroad手順・ライセンス発行運用・購入導線）設計 | AI | 完了(2026-06-16) | drafts/monetization-kit/。still=Tier1クライアントゲート実装済(push済) |
| 収益化基盤 still（汎用ゲート移行） | AI | 完了(2026-06-16) | nocta-license-gate.js へ移行・push済。商品作成で課金可（Supabase不要） |
| 収益化基盤 inner-canvas/Seed/Verse（Supabase権限A） | AI | 実装済・未デプロイ(2026-06-16) | entitlements+gumroad-webhook(共有Supabase)・useEntitlement・PremiumGate。3アプリ同一Supabase。未push |
| Gumroad「NOCTA all-access」商品作成＋Ping URL設定 | CEO | 未実施 | 課金開始の起点。still はこれだけで可、Vercel系は下のSupabaseデプロイも必要 |
| Supabaseデプロイ（migration+gumroad-webhook+secret・1回で3アプリ分） | CEO | 未実施 | 本番共有DBへの変更のため CEO 実行。nner-canvas repoから `supabase db push`＋`functions deploy` |
| プレミアム機能の選定→各アプリで PremiumGate 適用 | CEO/AI | 後回し（プロダクト成熟後） | 何を有料にするか未定。プロダクトが完成に近づいてから決定・適用。基盤は実装済みで囲むだけ |
| BUY_URL を各repoで商品URLに差し替え | CEO/AI | 商品作成後 | still index.html / nner-canvas・memo-app の PremiumGate |
| 瞑想BGM素材集（5トラック）→ 各アプリへの BGM 組み込み設計・実装（別Mac） | CEO/AI | 設計待ち | MP3 は `outputs/audio/meditation/`（gitignore対象） |
| 4アプリ（still/Seed/Verse/inner canvas）の継続改善・新機能 | CEO/AI | 随時 | 稼働中。利用フィードバックを起点に |

#### Gyu 3D宝石「本物に近づける」— 将来の工夫（現在ステイ・2026-07-06）

現状の到達点: 動=リアルタイムPBR / 静=パストレース「現像」のハイブリッド。手を止めると
`three-gpu-pathtracer@0.0.24` が多重反射・内部干渉模様を1〜3秒で現像。外周輪郭は環境反射＋背後の
光だまりで黒背景から分離。デスクトップ先行（非対応端末はPBR維持）。設計/計画:
`docs/superpowers/{specs,plans}/2026-07-06-gyu-pathtracer-hybrid*.md`。
**CEO判断でGyuの更新は一旦ステイ**。以下は再開時の候補（効果度＝本物感への寄与）。

| # | 工夫 | アクション | 効果度 | 依存・リスク |
|---|---|---|---|---|
| 1 | ファイア（分散）を現像に戻す | three-gpu-pathtracer の新版で dispersion/スペクトル対応が入ったか確認→対応版なら更新。無ければRGB3経路の擬似分散パスを検討 | 高（虹の閃光は宝石の華・現状PTでは消えている） | ライブラリ更新のthree互換再確認。カスタムは重い |
| 2 | 現像のノイズ除去 | 対応GPUでサンプル増、または収束後に軽いデノイズ/バイラテラルパス。粒状感を除きシャープに | 高（現状300サンプルで粒が残る） | サンプル増は現像時間増。デノイズ実装コスト |
| 3 | 実写HDRI環境 | CC0のジュエリースタジオHDRIを小さく圧縮同梱 or 手続きマルチライトを精緻化。反射・映り込みの複雑さを上げる | 高（記事の最重要点＝環境の複雑さ） | バイナリをgitに置く方針の可否をCEO確認。容量 |
| 4 | ファセット高精度化 | カット別に実スター/アッパーガードル数・テーブル/キュレット比率をGIA基準へ | 中（きらめきの密度） | ジオメトリ生成の複雑化。要検証 |
| 5 | 接地・台座の反射 | 宝石の下に薄い反射面レイヤ（磨いた台に映る淡い像） | 中（置かれている実在感） | PT/PBR両対応の設計 |
| 6 | インクルージョン（内包物） | 媒質に極薄のボリュームノイズ／内部テクスチャで生の石らしさ | 中（過剰は禁物・繊細な調整） | WebGLで媒質ノイズは難。控えめに |
| 7 | 現像にBloom/グレア | PT出力の明部に軽いbloomを足しきらめきを強調 | 中（静止画の華やかさ） | PT出力への後処理パス追加 |
| 8 | モバイル向けプリレンダー（軸3） | Playwrightでビルド時にパストレース済みターンテーブル（AVIF 72–120枚/石）を生成・配信、傾け=スクラブ | 中〜高（全端末で最高画質・実行時GPU負荷ゼロ） | 石ごと再生成が必要・容量2〜4MB/石。Gyuの「その場生成」思想と要相談 |
| 9 | 石別の色精度・リムライト精緻化 | 一部様式化した accentColor を実GIA色へ寄せる／環境horizonバンドで縁の分離をさらに調整 | 低〜中（仕上げ） | 微調整レベル |

進め方メモ: 再開時はまず #1（ファイア復活）と #2（デノイズ）が費用対効果高。#3（HDRI）は#1/#2と相乗。
#8はモバイル体験を一段引き上げるが独立フェーズ。着手前に `/brainstorm` で1〜2軸に絞る。

### Visual（AIアート・PV・NFT）

| タスク | 担当 | 状態 | メモ |
|---|---|---|---|
| NOCTA Visual 01 PV | CEO/AI | ペンディング(2026-06-16) | Kling/Runway は品質不足で停止。代替の HTMLストーリーボード試作も「今は意味が薄い」と判断しペンディング。試作は drafts/pv-storyboard-html/ に保管（本番未反映）。設計: docs/superpowers/specs/2026-06-16-nocta-visual-01-storyboard-design.md |
| 新規ビジュアル作品の継続制作 → `/visual-add` で HP 反映 | CEO/AI | 随時 | 現在14作品 |

### Words（ブログ・文章）

| タスク | 担当 | 状態 | メモ |
|---|---|---|---|
| ブログ記事の継続執筆 → `/blog-publish` | CEO/AI | 随時 | 現在3記事。多領域スタジオの発信チャネル |

### Music（楽曲）— CEO ペースの1ストリーム

| タスク | 担当 | 状態 | メモ |
|---|---|---|---|
| NuWord ゲート⑤: SynthV で `vocal_draft.svp` を Render → 声の質感確認 | CEO | 一時停止（CEOペース） | 498ノート生成済み。`ニューワールド` Phoneme 要確認 |
| 通過後 → ゲート④ MIDIデモ → Studio One アレンジ確定 → フェーズ3（PV）以降 | CEO | 待ち | 楽曲は急がず、CEO の手が空いたときに進める |

---

## 重み付け（2026-06-16 提案・CEO合意）

次の2〜4週間の注力配分。multi-domain ゆえ定期的に見直す。

| 優先 | ストリーム | 重み | 何を最大化／何を捨てるか |
|---|---|---|---|
| 1 | Apps / 収益化 | 40% | 最大化: 初の実収益。技術ゲート（ライセンス認証・keygen.html）は実装済みで残りは商品作成と発行フローのみ＝最小労力で最大レバレッジ。捨てる: 新機能開発は後回し |
| 2 | Words / ブログ | 25% | 最大化: 低コストで多領域ストーリーと発見性を維持。音楽停止中のモメンタム。捨てる: 大型企画は持たない |
| 3 | Visual | 20% | 最大化: 新作は安価・継続でHPが育つ。捨てる: PVは品質が出るツール待ちでペンディング維持 |
| 4 | Code/Web | 10% | 成熟済み。バグ・改善要望が出たときだけ反応的に |
| 5 | Music | 5% | CEOペース厳守。こちらからは押さない |

直近の単一推奨アクション: NuWord still の収益化キット着手（他アプリ Seed/Verse/inner canvas でも再利用できる汎用設計）。

---

## 横断的な意思決定（CEO 判断待ち）

| 論点 | メモ |
|---|---|
| Claude Design System 設定 | **決定: DOCOMO R&D 企業アカウントを使用（2026-06-16）**。次: 企業アカウントの Claude Design で Design System に NOCTA の CLAUDE.md/ブランドトークンを登録しブランド自動適用。留意: NOCTA のデザイン作業物は企業ワークスペースの共有範囲に置かれる |
| 各領域の重み付け（次にどの領域に注力するか） | 上記「重み付け」セクションに明示（2026-06-16 合意） |

---

## 継続運用（ルーティン）

| タスク | 頻度 | メモ |
|---|---|---|
| 週次ベストプラクティスルーティン（`/weekly-check`） | 3日/週1 | 直近 2026-06-15 完了 |
| 新モデルリリース時 `/model-review` | 随時 | 現状 Opus 4.8 が最上位 |

---

## バックログ（将来）

- 2曲目の着手判断（song/ ブランチ運用を開始する方針。NuWord に依存しない）
- ACE-Step 1.5 XL / Khala 1.0 / Mureka V9 のローカル・代替音源生成の品質比較（RTX 3090 環境）
- アプリの新規プロダクト企画（NuWord シリーズの拡張 or 新ライン）
- フィーチャーリスト構造化の導入（harness エンジニアリング知見より）

---

## 完了済み（直近）

- 2026-06-16: NOCTA LP 完成（猫ストーリーモチーフ）・footer/Contact コピー刷新（push済）
- 2026-06-15: DESIGN.md ライブ実態へ正本化・廃止カラー全クリーン・引き継ぎ書整備（push済）
- 2026-06-04: HP 全面リデザイン（EB Garamond・シルバー×オフホワイト）・frontend-design 統合
- 2026-04-30: HP 英語対応・NuWord still PWA 化・Gumroad ライセンスゲート実装・4アプリ HP 反映
- 2026-02〜03: NuWord フェーズ1〜2-C（トレンド分析・楽曲仕様書・歌詞A選択・SVP生成）

---

## 追記 2026-07-11: HiNaコレクション戦略（Code/Web ストリーム）

図鑑3部作 HiNa(Gyu宝石36/Ichi花24/Hare色48・共通zukan-core・銀猫)を「収穫」フェーズへ。戦略詳細: drafts/hina-collection-strategy.md（Codex4往復で策定）。
- 完了(2026-07-11): コンセプトページ website/hina/ 公開＋誕生HiNa(12ヶ月の贈り物棚・?m=・PNG)＋HP導線。
- 次: 誕生色/祝福文12本のCEO選択(3枚パイロット1/5/10が基準)→残9仕上げ。反応(保存/贈与の定性)を見て H2棚札拡張・今日のHiNa・Hare/Gyu成果物の格統一へ。収益化は引きが出てから(H4)。
