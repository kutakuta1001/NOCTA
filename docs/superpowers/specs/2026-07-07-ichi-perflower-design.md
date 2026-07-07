# Ichi 各花からの咲かせる（Per-Flower Sow）設計

作成: 2026-07-07 / モデル: Opus 4.8
状態: 実装計画へ（CEO依頼: 各花の場所から入場・その花に似た輪郭で咲く）

## 目的

現状「咲かせる」への入口はカバー上部の汎用CTA1つのみ。これに加え、**図鑑の各花セクション
（24種）から「この花を咲かせる」で入場**でき、入場した花の**色とおおよその輪郭**でなぞって
咲かせられるようにする。図鑑（眺める）と遊び（咲かせる）を繋ぐ（提案書 C-3 の実装）。

## スコープ

- 各花セクションに per-flower 入口ボタンを追加（汎用CTAは自由制作として残す）
- **シード付き咲かせるモード**: 入場した花の accentColor・その花に似た form・その花の季節に固定。
  なぞって咲く花はすべてその花（色・形）になる。季節チップはシード時は非表示。
- 「似た輪郭」のため手続き花形を4→7に拡張し、24種を最適formにマッピング。

非目標: 24種それぞれ固有の完全再現（写実）・写真シルエット抽出・音（Phase 2c）・散る花（Phase 2b）。

## 花形の拡張（4→7）

現: `sakura`(5弁・切れ込み) / `kiku`(多弁・細) / `tulip`(4弁・幅広) / `komori`(丸弁5)
追加:
- `star`（星形・尖った5弁）— 桔梗・りんどう・カタクリ等
- `layered`（多重・丸弁を2層＝八重）— 椿・薔薇・牡丹・アネモネ等
- `bell`（釣鐘/百合・細長く外に反る弁）— 百合・チューリップ寄り・釣鐘草等

drawFlower に form 追加。既存のグラデ/半透明/vigor/depth はそのまま適用。

## 24種→form マッピング（flora-data.js に `hanaForm` フィールド追加）

各花に best-fit form を付与（例・実装時に flora-data の24件を確認して確定）:
- 桜/梅/桃系 → sakura ／ ひまわり/コスモス/マーガレット/菊 → kiku
- チューリップ → tulip または bell ／ 勿忘草/かすみ草系 → komori
- 桔梗/りんどう → star ／ 椿/薔薇/牡丹/ダリア → layered ／ 百合/水仙 → bell
- 不明・その他は形の近い既存formにフォールバック（既定 sakura）

## シード付きモードのデータフロー

- 各セクションボタン → `openHana(i)`（i=花index）→ `NoctaHana.mount(container, { seed: SEED })`。
  `SEED = { form, accentColor, seasonName, name }`。
  - `form`: flora-data の `hanaForm`
  - `accentColor`: flora-data の accentColor
  - `seasonName`: 花の季節から導出（`seasonFromFlower(f)`: birthMonths[0] か season文字列の先頭月→spring/summer/autumn/winter）
- createGarden(opts): `opts.seed` があれば
  - spawn は pickForm を使わず `seed.form` 固定、palette は「seed.accentColor を主色にした派生パレット」
    （petals=[accent, lighten(accent,0.25), mix(accent,white,0.5)], core=季節coreを流用, ground=季節ground）
  - setSeason は無効（シード時は季節固定）。背景 applyStageBg は seasonName で適用。
- buildUi: seed 時は季節チップ(.hana-seasons)を非表示（その花で描くモードのため）。
- 汎用CTA（seed なし）は従来通り（4→7 form ランダム・季節チップ有効）。

## 各花セクションの入口ボタン

section.innerHTML のボタン行（fav-btn・chips と同列）に:
`<button class="hana-sow" data-sakaseru="i" ...>この花を咲かせる</button>`
（`.hana-cta` と調和する控えめなスタイル・花色 var(--gem) を用いる）。
click は既存の委譲で `openHana(i)`。i18n: `meta.sow`（ja:「この花を咲かせる」/ en:「Sow this flower」）。

## 変更ファイル

- `website/flora/hana.js`: drawFlower に3形追加 / createGarden に seed 対応（spawn form・palette固定）/
  mount に seed 受け取り・季節チップ非表示・招待花を seed form で / `deriveSeededPalette(accent, seasonName)` 追加
- `website/flora/flora-data.js`: 各24件に `hanaForm` 追加
- `website/flora/index.html`: 各セクションに「この花を咲かせる」ボタン / `seasonFromFlower` / openHana(i) seeded /
  委譲配線 / i18n `meta.sow` / `hana.js?v=3`

## 検証設計

- 新規 Playwright `verify-hana-perflower.js`: (a) 各花セクションに `.hana-sow` ボタンが存在（24個）
  (b) ボタンクリックで #hana-view が開き、なぞると seed.form の花が seed.accentColor 系で咲く
  （サンプル色が花の accentColor 近傍・form が固定）(c) seed 時に季節チップが非表示
  (d) 汎用CTAは従来通り（季節チップ有効・4〜7形ランダム）(e) 3新形が描画される（drawFlower単体で star/layered/bell が非空）(f) エラー0。
- 既存 hana スイート（util/flower/engine2/press/mount2/integration2）＋ iro/fude/zukan 回帰維持。
  drawFlower の form 追加で既存assertが壊れないこと（form未指定は既定 sakura のまま）。
- 新3形は Task でスクショ目視ゲート。

## リスク

| リスク | 対応 |
|---|---|
| 新3形が「似ていない/花に見えない」 | Task でスクショ目視・counts/形状調整。24種の割当は「近い形」で割り切り（写実は非目標） |
| seed パレットが暗背景で見えにくい | deriveSeededPalette で accent を主色＋明色tintを混ぜ視認性確保。スクショ確認 |
| 24件 hanaForm 付与漏れ | 既定 sakura フォールバック。全件付与を検証(a)で担保 |
| 既存 drawFlower 回帰 | form未指定/既存4形の描画は不変に保つ |
