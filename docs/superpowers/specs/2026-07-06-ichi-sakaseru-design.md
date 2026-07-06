# Ichi「咲かせる」Phase 1 設計

作成: 2026-07-06 / モデル: Opus 4.8 (effort xhigh)

## 目的

Ichi（花図鑑・`website/flora/`）に遊びレイヤー「咲かせる」を追加する。
HiNa コレクションの第4体験原則「遊んで跡を残す」を、Hare「筆あそび」の**対称版**として実装する。
- Hare = 筆で書く（`fude.js`）／Ichi = **なぞって花を咲かせる**（`hana.js`）
指でなぞった軌跡に、種から花がSVG/Canvasで芽吹くように咲き、庭が育つ。
Phase 1 は「咲かせる」体験の完成＋咲いた庭を「押し花」として1枚に保存（PNG）まで。

一輪挿し（生け花）・絵本への派生は Phase 2 以降（本Phaseのスコープ外・YAGNI）。

## 採用アプローチ（A案・CEO承認済み）

Canvas 2D・Hare対称・手続き的な花スタンプ。`fude.js` のストローク・サンプリング＋
スタンプ＋PNG保存の骨格を流用し、「インク」を「手続き的に描く花」に置換する。
- 最大化: 体験の対称性・実績あるエンジン流用・「その場でコードが生成」というNOCTA思想・保存の自然な接続
- 捨てる: 花の写実性（様式化された手続き花。写実は図鑑の実写側が担う）

## アーキテクチャ・ファイル構成

- 新規 `website/flora/hana.js`（`window.NoctaHana`・~350行想定）
  - 公開: `NoctaHana.mount(canvas, opts) -> { setSeason, clear, press, dispose }`
    - `canvas`: 描画先 canvas 要素
    - `opts.reduce`: prefers-reduced-motion（true で開花アニメ省略・即満開）
    - `setSeason(name)`: 'spring'|'summer'|'autumn'|'winter' でパレット切替
    - `clear()`: 庭を消す（呼び出し側が掃引アニメ後に呼ぶ）
    - `press() -> dataURL`: 押し花処理した PNG の dataURL を返す
    - `dispose()`: rAF停止・pointerリスナ解除
- 変更 `website/flora/index.html`
  - cover に「咲かせる」CTA（Hareの「色に浸る」と対称）
  - 全画面の咲かせるビュー（canvas＋ツールバー: 季節セレクタ／真っさらにする／押し花にする／閉じる）
  - `hana.js` を通常 script で読み込み（`?v=1`）
- 既存 `zukan-core.js`（i18n・お気に入り・目次）はそのまま。咲かせるは独立レイヤー

## 咲かせる操作（なぞる→芽吹く）

- pointerdown/move/up で軌跡取得。距離ベースで等間隔サンプリング（一定距離 `STEP` ごとに花1つを「咲かせ予約」）。点ごとに咲かせると過密になるため距離間引き（fudeのスタンプ間隔と同法）
- 各花は `bloom: 0→1` を ~700ms のイージング（easeOutCubic）でアニメ: scale・花びら開き角・わずかな回転。`requestAnimationFrame` ループで bloom<1 の花を毎フレーム再描画、全て満開になったら再描画停止（省電力）
- なぞる速度で花サイズが変わる（速い=小さい/遅い=大きい。fudeの速度依存線幅の対称）。花形・向き・色に決定論的な揺らぎ（indexベースのLCG）
- 咲いた花は配列 `flowers[]` に蓄積。上限 `MAX_FLOWERS=400`、超過で先頭から間引き（性能）

## 手続き的な花の描画（Canvas 2D）

- 花1つ = 中心（花芯）＋N枚の花びら（ベジェ/弧）。花形4種:
  - `sakura`（5弁・先に切れ込み）／`kiku`（多弁・細い花びら12〜16枚）／`tulip`（筒状3〜4弁）／`komori`（小花・丸弁5枚・勿忘草風）
- 各花形は `drawFlower(ctx, x, y, r, rot, bloom, palette, formIndex)` で描画。花びらは中心から放射、`bloom` で開き角と半径をスケール
- 配色は季節パレットから花芯色＋花びら色を選ぶ。葉/茎は Phase 1 では省略可（花のみで成立）

## 季節パレット

Phase 1 は季節パレット4種（各: 花びら2〜3色＋花芯色＋背景の淡い地色）:
- `spring` 淡紅（桜色 #F7CAC9 系＋菜の花の黄芯）
- `summer` 水青（露草 #4E5EA8・白）
- `autumn` 琥珀/朱（金木犀 #E17A47・紅）
- `winter` 白/銀（水仙の白＋銀 #B8B4AE）
24種の個別連動は Phase 2 以降。花形は季節内でランダム/巡回。

## 押し花保存（Phase 1 の到達点）

「押し花にする」→ 咲かせた庭を押し花処理して PNG dataURL を返す:
1. **押すアニメ**（signature moment）: 全花を短時間で少し平面化（縦scaleを0.8程度に）＋色を沈める ~500ms
2. 和紙テクスチャ背景（fudeの紙と同系の生成りベース＋淡いノイズ）に合成
3. 花をわずかに退色・multiply気味に（押された質感）
4. 細い枠＋小さな季節ラベル（例「春 の 押し花」）＋署名的な小さな「Ichi」
5. `canvas.toDataURL('image/png')` を返し、呼び出し側がダウンロード（fudeの保存フローと同じ）

## UI・入口

- flora cover に「咲かせる」CTA。押すと全画面咲かせるビュー（`#hana-view`）表示
- ツールバー: 季節セレクタ（4チップ）／真っさらにする（fudeと同じ掃引クリアアニメ `.hana-sweep`）／押し花にする（保存）／閉じる×
- 閉じるで図鑑に戻る。i18n は data-i18n 準拠（zukan-core と整合）

## 配慮

- `prefers-reduced-motion`: 開花・押すアニメを省略し即満開/即押し花
- pointer events でタッチ対応。`touch-action:none`
- 花総数上限 400・DPR上限で描画。1 canvas（オフスクリーン不要）
- 閉じる/dispose で rAF停止・リスナ解除（リーク防止）

## 検証設計

Playwright `verify-hana.js`（`verify-fude.js` と同型・chromium）:
- (a) 咲かせるビューを開ける
- (b) canvas上をドラッグ（なぞる）で花canvasに非空ピクセルが増える
- (c) 季節切替で配色が変わる（サンプルピクセルの色相変化）
- (d) 真っさらにするで canvas がクリア
- (e) 押し花にするで PNG dataURL（`data:image/png`）が生成される
- (f) reduced-motion で即満開（アニメ待ちなしで花が出る）
- (g) モバイル375pxでツールバー表示
- (h) 通しでコンソールエラー0
- 既存スイート（zukan/iro/fude/gem3d/hybrid）を回帰させない

## 非目標（YAGNI・Phase 2 以降）

- 一輪挿し（生け花）・絵本への派生
- 24種の個別花との連動（種を選んで咲かせる）
- 花の写実化・葉/茎の作り込み・BGM
- 保存した押し花のギャラリー/localStorage 蓄積（Phase 1 は単発保存）

## リスク

| リスク | 対応 |
|---|---|
| 手続き花が「花に見えない」 | 花形4種を早期にスクショ目視で調整。桜/菊など輪郭が明快な形を優先 |
| なぞりが過密で重い | 距離間引き STEP＋総数上限 400。満開後は再描画停止 |
| 押し花処理が「押し花らしくない」 | 平面化＋退色＋和紙＋枠で質感。早期スクショ確認で調整 |
| fude.js との重複 | ストローク・サンプリングとPNG保存の共通部分は hana.js に写経（過度な共通化はせず独立性優先。負債になれば後で抽出） |
