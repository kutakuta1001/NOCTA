# Ichi Phase 2f「休むと草が生える・突風で真っさら」設計

作成: 2026-07-08 / モデル: Opus 4.8 / 実装SA: Sonnet・レビュー: Codex（CEO指定）
承認: CEO 2依頼（①約3秒アイドルで未タップ位置に草が生える ②クリア時に突風で全部散る）
CEO判断: F1ペース=3秒で生え始め・以後数秒ごとに1つ（充実まで）／F2=音ON時に強い風音を鳴らす
状態: 実装計画へ

## 目的（CEOの2依頼）

1. タップした所以外に、**約3秒待つと（タップしない場所に）勝手に草が生える**ギミック。
2. 「真っさらにする」時、ただ消えるのではなく、**強い突風が吹いて全部の花が散っていく**演出。

憲法（継承・不変）: 引き算が上質・遅さの報酬・一回性・ゴールなし・無音でも成立。

## 設計要点

### F1: 休むと草が生える（自生をアイドル駆動に）

Phase 2e の自生（固定18〜34秒スケジュール・ユーザー操作と無関係）を、**アイドル駆動**に変える。

- **アイドル判定**: 最後のポインタ操作（begin/move/tap/なぞりspawn）時刻を `lastInteractT` に記録。
  `now() - lastInteractT >= IDLE_MS`（IDLE_MS=3000）で「休んでいる」とみなす。
- **ペース**: アイドル成立で最初の芽吹き→以後アイドルが続く限り `SPROUT_INTERVAL`（3000〜6000ms）ごとに1つずつ、
  庭が `RESTING_COUNT`（28・既存）に達するまで。操作があれば `lastInteractT` を更新し、次の芽吹きは操作から3秒後に後ろ倒し（＝操作中は生えない）。
- **場所**: 「タップしない場所」に生やす。候補点を数点ランダムに採り、**既存の花／直近ポインタ位置から最も遠い**候補を選ぶ（空いた場所を優先）。
- 芽吹く種類は緑・小花優先（既存 ambientSprout の方針を踏襲）。芽吹きは無音（既存通り）。
- reduce時・farewell/gust中は生えない。既存の setTimeout 駆動（armSproutTimer・rAF停止中も起床）・detach clear・RESTING停止は維持。
- 実装は既存 scheduleSprout/maybeSprout/armSproutTimer を「アイドル基準」に調整（新規タイマー系を増やさない）。

### F2: 突風で真っさら（クリア演出）

現状 `clear()` は即 `flowers=[]; petals=[]` して消すだけ。これを**突風演出**に変える。

- **非reduce時**: clear() で強い突風を発生させ、全要素を風向きに一斉に散らす:
  - 各花・緑から花びら／葉の粒子を**バースト放出**（既存 petals パーティクルを流用）。粒子は風向き（wind.dir）に
    強い水平速度＋わずかな上下で流れ、既存の寿命で画面外へ流れて消える。花は色付き花びら、緑は緑の粒子。
  - `flowers = []` を即実行（花は粒子になって「吹き飛んだ」）。粒子は既存ループで飛んで自然に消滅→庭が空になる。
  - 粒子数は上限を突風用に一時拡張（例 GUST_MAX=180・要素×数枚をこの範囲でバースト）。1.5〜2秒で流れ切る速度設定。
  - 強い風（wind.until/strength/dir）も併発し、演出の一貫性を出す。
  - `opts.onGust()` コールバックを1回呼ぶ（mount が強い風音を鳴らす）。
- **reduce時**: 演出なしで即クリア（`flowers=[]; petals=[]; redraw()`）。
- 既存 farewell（ビュー退場アニメ）とは別物。gust は clear ボタン起点で庭内に閉じる。needLoop は粒子がある間 true で自然にアニメ→空。

### 音（F2・音ON時のみ）

- mount に `otoPlayGust()` を追加。既存 otoPlayWind（ホワイトノイズ→lowpass520→gain0.03/1.8s）の**強化版**:
  gain を大きく（例 0.06）・やや長く（例 2.2s）・立ち上がりを速く（一陣の突風感）。ノード終了時 disconnect（リーク防止・既存踏襲）。
- createGarden に `onGust: otoPlayGust` を渡す（onWind と同パターン）。デフォルトは音オフなので**無音のまま視覚で成立**。

## 変更ファイル

- `website/flora/hana.js`: lastInteractT 追跡＋ポインタハンドラでの更新／自生をアイドル駆動に調整／ambientSprout の場所バイアス／clear() を突風演出に（バースト粒子・onGust・reduce即時）／GUST_MAX。
- `website/flora/index.html`: `hana.js?v=7` → `hana.js?v=8`（cache-buster のみ）。
- mount（hana.js内）: otoPlayGust 追加・createGarden へ onGust 配線。

## 検証設計（Playwright + Codex）

- 新規 `verify-hana-phase2f.js`:
  (a) アイドル自生: `__fastGrow`（IDLE_MS/interval短縮）で、操作後 IDLE_MS 未満では生えず、IDLE_MS 経過後に芽吹く。以後 interval ごとに増える。RESTING_COUNT で停止。
  (b) 操作でリセット: 芽吹き前に操作すると、その操作から IDLE_MS 経過するまで生えない。
  (c) 場所バイアス: タップ位置の近くではなく、空いた場所（既存要素から離れた位置）に芽吹く（芽吹き座標と直近タップ/花との距離を観測）。
  (d) 突風クリア（非reduce）: clear() で flowers が即0になり、petals（バースト粒子）が増え、風向きに流れて数十フレームで空になる。onGust が1回呼ばれる（音ON時 __hanaOto に gust カウンタ増）。
  (e) 突風の音: 音ON＋clear で `__hanaOto.gust` 増、音OFFでは増えない。
  (f) reduce: clear は即時（粒子バーストなし・即0）。自生なし。
  (g) エラー0。
- 既存 hana スイート（util/forms/seed/engine2/press/mount2/perflower/phase2b/season/oto/kaze/taika/hizuke/kyou/integration2/leaf/wind2/phase2e）＋iro/fude/zukan 回帰維持。
  特に phase2e の自生テスト（__fastGrow）はアイドル駆動化に伴い期待値更新の可能性→報告。kaze/wind2/oto の既存風・音は不変。
- コードレビュー: Codex（`codex-review.sh custom` でブランチ差分・2周・Critical必修正）。
- スクショ/実機目視: アイドル3秒での芽吹き・突風で花が流れて消える様子（CEO最終採否）。

## リスク

| リスク | 対応 |
|---|---|
| 自生が3秒で頻繁すぎ瞑想性を損なう | interval 3〜6秒・RESTING停止・操作で3秒リセット。数値は目視調整可 |
| アイドル駆動で常時rAF/タイマー暴走 | setTimeout駆動維持・操作でre-arm・reduce/detachで停止。Codexでライフサイクル確認 |
| 突風バーストで粒子過多→カクつき | GUST_MAX(180)で上限・要素×数枚に制限・寿命で流れ切る |
| clear演出中に再操作/再clear/farewellの競合 | gust中の状態管理（既存 farewelling と同様のガード）・reduce即時 |
| 既存 phase2e 自生テストの退行 | アイドル駆動化に伴う正当な期待値更新のみ・報告事項に明記 |
| 突風音がうるさい | gain0.06・音ON時のみ・デフォルト無音 |
