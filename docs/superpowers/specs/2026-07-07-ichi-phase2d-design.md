# Ichi Phase 2d「大輪・葉の装飾・風の実感」設計

作成: 2026-07-07 / モデル: Opus 4.8 / 実装SA: Sonnet・レビュー: Codex（CEO指定）
承認: CEO 3依頼（大輪2倍・葉などの装飾・風を分かりやすく）
状態: 実装計画へ

## 目的（CEOの3依頼）

1. 長押しの大輪を今の約2倍サイズまで大きく。
2. 花のドラッグで咲く→散るのと同様に、花の近くに葉などの装飾が生え、押し花の装飾になる。
3. 風が気づきにくかった → 視覚を強め、音ON時は「そよ風」の音を足す（現状は視覚のみ・頻度控えめ・無音）。

憲法（継承）: 引き算が上質・遅さの報酬・一回性・ゴールなし・無音でも成立。

## 設計要点

### 1. 大輪サイズ2倍（spawnGrand）
- 現在 `r: 40 + rng()*12`（40〜52px）→ `r: 82 + rng()*22`（82〜104px・約2倍）。他（dur3500/vigor1/depth0）は不変。
- canvas内に収まる範囲で問題なし。通常花・なぞり花は不変。

### 2. 葉の装飾（drawFlower / spawn）
- spawn 時、`rng() < 0.5` の花に葉を 1〜2枚付与（花オブジェクトに `leaves: [{ang, len, side}]`）。
  大輪(spawnGrand)は葉が映えるので必ず2枚付ける。
- 葉は花の**根元付近・花より奥（先に描画）**に、しずく形（既存 petal 流用）で描く。花のrot/swayに
  追従するので風でも一緒に揺れる（drawFlower内で描けば自動）。
- 色は季節・花色に依らない落ち着いた**セージグリーン**（`#6E7A55` 基調・半透明）。暗い庭でも花と調和し、
  緑があることで「植物」感と押し花らしさが出る。bloom に連動して葉も開く（scale）。
- 押し花への反映: drawFlower が葉も描くため、press() の canvas 取り込みで自動的に葉入りの構図になる（追加処理不要）。
- reduce時も葉は静的に付く（葉は装飾であり動きではない）。

### 3. 風の実感（createGarden / oto）
- **頻度**: `nextWindT` 間隔 40000〜90000ms → **16000〜34000ms**（もっと出会える）。
- **強度**: sway への風項係数 0.12 → **0.2**、舞う花びら枚数 最大3 → **5**。
- **音（音ON時のみ）**: 風の瞬間に「そよ風」= フィルタ済みホワイトノイズを ~1.8秒、緩いgainエンベロープ
  （lowpass ~500Hz・gain ~0.03）で鳴らす。デフォルトは音オフなので**無音のまま視覚で分かる**ことを保証。
  - エンジンは音を知らない: createGarden に `opts.onWind()` コールバックを追加し、mount が oto.playWind に接続。
- reduce時: 風なし（視覚も音も）。

## 変更ファイル
- `website/flora/hana.js`: spawnGrand の r / spawn の葉付与 / drawFlower の葉描画 / 風の頻度・強度・枚数 / onWind コールバック / oto.playWind（ノイズ音）
- `website/flora/index.html`: なし（hana内で完結）。ただし `hana.js?v=6` に更新。

## 検証設計（Playwright + Codex）
- 新規 `verify-hana-phase2d.js`:
  (a) 長押し大輪の r が拡大（描画面積が旧比 明確に大・または snapshotで大輪の半径測定）
  (b) 葉: 一定数咲かせると葉付き花が存在する（drawFlower単体 or シーンにセージ緑ピクセルが出る）。大輪は必ず葉付き。
  (c) 風: `__fastWind` で風発火時、そよぎ・舞う枚数が増（旧比でフレーム差/パーティクル増）。頻度短縮の反映。
  (d) 風音: 音ON＋`__fastWind`で風発火時 onWind→oto.playWind が呼ばれ `__hanaOto.wind` カウンタ増（音OFFでは鳴らない）。
  (e) reduce: 葉は付くが風・風音なし。press に葉が写る（透明前提維持）。
  (f) エラー0。
- 既存 hana スイート（forms/seed/engine2/press/mount2/perflower/phase2b/season/oto/kaze/taika/hizuke/kyou/integration2）＋iro/fude/zukan 回帰維持。既存4→7形/shed=0/seed/press不変。
- コードレビュー: **Codex**（`codex-review.sh custom` でブランチ差分・2周・Critical必修正）。

## リスク
| リスク | 対応 |
|---|---|
| 葉の緑が暗い庭・花色から浮く | セージ緑を半透明・花より奥。スクショ目視で調整 |
| 大輪が大きすぎ画面を圧迫 | 82〜104pxは全画面canvasで妥当。目視確認 |
| 風の強度上げで「揺れすぎ」 | 0.2・1.8秒ease。目視で調整可 |
| 風音がうるさい/安っぽい | lowpass・gain0.03・1.8s。音ONの人のみ・デフォルト無音 |
| onWind/oto のリーク | oto.ctx は既存の生成/close管理を流用・ノイズbufferは短寿命 |
