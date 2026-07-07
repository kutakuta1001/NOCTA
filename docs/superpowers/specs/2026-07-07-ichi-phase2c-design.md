# Ichi Phase 2c「五感と一回性」設計

作成: 2026-07-07 / モデル: Fable 5（設計）・実装サブエージェント: Sonnet・レビュー: Codex
承認: CEO「体験の提案を5つ考えて全て実行して」
状態: 実装計画へ

## 目的

Phase 2a/2b で得た質感と無常の上に、5つの体験を足す。いずれも提案書の原則
（引き算・遅さの報酬・一回性・ゴールなし・無音でも成立）に整合する。

1. なぞり音（oto）— 咲く瞬間の小さな生成音・デフォルトオフ
2. 風の一吹き（kaze）— 時折庭に風が通り全花がそよぎ花びらが舞う
3. 長押しで大輪（taika）— 動かず長押しでその場に特別な一輪がゆっくり開く
4. 今日の一花から咲かせる（kyou）— カバーの今日カードからその花のシードで入場
5. 押し花に日付（hizuke）— 押し花PNGに漢数字の日付（seed時は花の名前も）

非目標: 一輪挿し/絵本・環境音BGM・ギャラリー/localStorage・bell造形磨き（別途）。

## 各機能の設計要点

### 1. なぞり音（hana.js）
- Web Audio: spawn 時に短い減衰音（sine 基音 + わずかな triangle 倍音・約0.5秒 exp 減衰・
  鈴/水滴の間）。ピッチは花の大きさで変える（大きい花=低い・小さい花=高い。基準 660Hz±）。
  音量は小さく（gain ≈0.05）。連打防止に最小発音間隔 90ms・同時発音は生成後放置（短寿命）。
- **デフォルトオフ**。ツールバーに「音」トグルボタン（.hana-oto・「音を添える/音を消す」）。
  オンにするクリックがユーザージェスチャなので、その時に AudioContext を生成/resume する
  （自動再生制限に適合）。detach で close。オフ中は一切ノードを作らない。
- 実装: mount 内に小さな oto オブジェクト {enabled, ctx, play(size)}。createGarden に
  `opts.onSpawn(flower)` コールバックを追加し、mount が oto.play を接続する（エンジンは音を知らない）。
- reduce-motion と独立（音は別軸・ユーザーが明示的にオンにした場合のみ鳴る）。

### 2. 風の一吹き（hana.js / createGarden）
- 状態 `wind = { until: 0, dir: ±1, strength: 0..1 }`。非reduce時、次の風時刻 `nextWindT`
  （40〜90秒ランダム・初回も同様）に達すると風が吹く: 約2.5秒間、easeで立ち上がり収まる。
- redraw の sway 計算に風項を加算: `sway += wind強度 * 0.12 * dir * ease(t)`（全花同方向・
  depth が浅い花ほど強く）。
- 風の瞬間、加齢期に達している花（shed<maxShed）から最大3輪、花びらを1枚ずつ余分に放出
  （既存パーティクル再利用・vx を風方向に強めに）。PART_MAX 尊重。
- reduce: 風なし。farewell 中: 風なし。

### 3. 長押しで大輪（hana.js / createGarden）
- begin で位置記録＋600msタイマー。move で閾値(8px)超えたら解除・up/cancel/leave で解除。
- 達成時: その場に特別な一輪 `spawnGrand(x,y)` — r は通常の約2倍（40〜52px）・dur 3500ms・
  vigor=1固定・depth=0（手前）・form はモード準拠（seed時 seed.form / 非seed時ランダム）。
- 通常の begin 即 spawn（タップの一輪）は既存挙動のまま。大輪はその上に追加で咲く。
- reduce: 長押し達成で即満開の大輪（アニメなし・機能自体は提供）。

### 4. 今日の一花から咲かせる（index.html）
- カバーの「今日の一花」カード内に小さな導線「この花を咲かせる →」（.hana-sow-today）。
  クリックで `openHana(todayIdx)`（既存の buildToday が使う todayIndex を保持して使う）。
  カード本体のクリック（jumpTo でその花のセクションへ）は既存のまま・導線は stopPropagation。
- i18n: 既存 `meta.sow` を流用（「この花を咲かせる」）。

### 5. 押し花に日付（hana.js press()）
- 左下ラベルを「<季節> の 押し花 · <月日>」に。月日は漢数字（例「七月七日」）。
  変換は小関数 `kanjiDate(month, day)`（一〜十二月・一〜三十一日。十位の合成: 21→二十一）。
- seed 時は季節の代わりに花の名前: 「薔薇 の 押し花 · 七月七日」。そのため seed に
  `nameJa`（flora-data の title）を追加（index.html の seed 構築で渡す）。nameJa 無ければ従来。
- ファイル名は既存（ichi-<season>.png）維持。

## 変更ファイル
- `website/flora/hana.js`: onSpawn コールバック・oto・wind・spawnGrand/長押し・press日付・seed.nameJa
- `website/flora/index.html`: .hana-oto はhana.js buildUi内なのでhana側／今日カード導線（.hana-sow-today）／seed構築に nameJa／`hana.js?v=5`

## 検証設計
- 新規 Playwright `verify-hana-phase2c.js`:
  (a) 音: トグルonでAudioContext生成・spawn時にオシレータが作られる（AudioContext/oscillator呼びを
      ラップして観測 or oto に `__played` カウンタ露出）。デフォルトはoffでctx未生成。
  (b) 風: `__fastWind` 内部フラグ（テスト用・風間隔短縮）で全花のsway位相が同方向に振れる
      （2フレームの画素差が通常微風より大きい）＋加齢花から余分なパーティクル。
  (c) 長押し: pointerdown後動かさず650ms→大きな一輪（花数+1・大サイズ）。moveでキャンセル。
  (d) 今日カード: .hana-sow-today が存在しクリックで #hana-view が開き今日の花の色で咲く。
  (e) 押し花: press() dataURL を画像化し下部ラベル領域に日付分の描画幅が増えている
      （文字幅比較 or 単純に「押し花が従来どおり生成される」+目視）。
  (f) reduce: 風・音（off時）が無効。エラー0。
- 既存 hana スイート＋iro/fude/zukan 回帰維持。
- コードレビューは **Codex**（`~/.claude/scripts/codex-review.sh diff` をリポジトリ内で・2周・
  Critical必修正）。最終マージ判断はコントローラ。

## リスク
| リスク | 対応 |
|---|---|
| 音が安っぽい/うるさい | gain小・短い減衰・最小間隔90ms。デフォルトオフ。CEOが実機で判断できるようトグル明示 |
| 風で花が「揺れすぎ」 | 強度0.12・2.5秒ease・頻度40-90s。スクショ/目視で調整 |
| 長押しがタップ誤発火 | 8px閾値・600ms。既存タップ一輪と重複しても違和感なし(その場に大輪が重なる) |
| 今日カード導線がカードクリックと競合 | stopPropagation・小さな別ボタン |
| AudioContextリーク | detachでclose・オフ中は未生成 |
