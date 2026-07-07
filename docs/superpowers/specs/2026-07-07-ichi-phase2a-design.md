# Ichi Phase 2a「質感と時間」設計

作成: 2026-07-07 / モデル: Opus 4.8 / 承認: 提案書 `drafts/ichi-refinement-proposal.md` をCEO承認
状態: 実装計画へ

## 目的

Ichi「咲かせる」の「チープさ」を解消し、瞑想の起点にふさわしい質感と時間を与える。
提案書 §3 の A層（質感）+ B-1〜B-3（瞑想メカニクス）を実装する。
B-4（散る花）は Phase 2b、B-5（音）・C層は Phase 2c/バックログ（本Phaseスコープ外）。

憲法（提案書 §2・全変更に適用）: 引き算が上質／遅さを報酬に／二度と同じ画にしない／
ゴールを作らない／無音でも成立。

## スコープ（Phase 2a の8項目）

- A-1 花びらの脱ベタ塗り（グラデーション＋半透明の重なり＋花びら毎の微ゆらぎ）
- A-2 背景に空気（季節連動の光だまり。**flower canvasとは別レイヤー**）
- A-3 奥行き（花に前後の層＝空気遠近: 奥は小さく淡く柔らか）
- A-4 グレイン（低opacityノイズoverlay・既存 `.grain` 流用）
- A-5 開花後の微風（咲いた花が完全静止せず、ゆるやかに揺れる）
- B-1 遅さの報酬化（ゆっくりなぞるほど大きく豊かに深い色・速いと小さく淡くまばら）
- B-2 呼吸のテンポ（開花を約1.5秒に緩め、急がない時間を体現）
- B-3 入退場の儀式（入場: 暗闇から一輪浮かぶフェードイン／退場: 花が静かに閉じてから暗転）

## アーキテクチャ上の要点（非自明な設計判断）

### 1. 背景（A-2）は flower canvas と分離する — press() を汚さないため
- 現状 press() は flower canvas を washi 地に drawImage して押し花を作る。flower canvas は
  透明背景（花のみ）である前提。
- したがって A-2 の「夜の庭の空気」は flower canvas に描かず、**`.hana-stage` の CSS 背景**
  （season連動の radial-gradient）として置く。flower canvas は透明のまま上に重ねる。
- season 切替時に hana.js が `.hana-stage` の背景を更新する（インラインstyle）。
- 結果: press() は従来通り透明な花のみを washi に合成でき、押し花は汚れない。

### 2. A-5 微風は「開いている間ずっと rAF を回す」— 省電力停止と両立させる
- 現状は「全花が満開 → rAF停止」（省電力）。A-5 は満開後も揺れ続ける必要があり、これと衝突する。
- 解決: 微風を入れるため、**view が開いている間は rAF を回し続ける**。ただし:
  - reduce-motion 時は微風なし＝満開後停止（従来の省電力）を維持。
  - 負荷対策: 微風の再描画を **約30fps にスロットル**（前フレームから33ms未満ならスキップ）。
    MAX_FLOWERS=400 と合わせ、drawFlower 呼び出し回数を抑える。
  - 微風は drawFlower に渡す rot に `sin(t * w + phase)` の微小オフセット（±約2°）を足すだけ。
    追加の path コストはゼロ（rot が変わるのみ）。花ごとに phase/周期を決定論シードで散らす。
- detach で確実に rAF 停止（既存の running/rafId 管理を踏襲）。

### 3. B-3 退場の儀式は mount 返り値に farewell を足す
- 現状 index.html closeHana は即 detach → hidden。
- 花が静かに閉じてから閉じるため、mount 返り値に `farewell(done)` を追加:
  各花の bloom を 1→0 へ約800msで戻すアニメを走らせ、完了後に `done()` を呼ぶ。
  index.html は `hanaInstance.farewell(function(){ closeの実処理 })` を呼ぶ。
  reduce-motion 時は farewell は即 done()（アニメ省略）。
- 入場: `#hana-view` に opacity フェードイン（CSS transition）＋ mount 時に中央へ一輪だけ
  「招待の花」を自動 spawn（ゆっくり開く）。ユーザーが触れ始めたら以後は通常。

## 各項目の実装方針（パラメータは計画で確定）

### A-1 花びらの脱ベタ塗り（drawFlower）
- 各花びらを単色 fill → **linearGradient**（付け根=濃いpetalColor → 先端=淡く白/地色寄り・低alpha）に。
  `ctx.createLinearGradient(0,0, 0,-len)`。花びらは -y 方向に伸びるためこの軸で階調。
- 花びら毎に petalColor を微調整（rngで色相±・明度±の小揺らぎ）＝ベタ感の解消。
- 重なりは globalAlpha（約0.9）で半透明にし、花びら同士の重なりに濃淡が出るように。
- 花芯も単色 → 微グラデ（中心明→縁濃）。

### A-2 背景（.hana-stage の CSS）
- `radial-gradient(ellipse at 50% 62%, <season光だまり> 0%, <暗> 55%, #0A0906 100%)`。
  光だまり色は season の petals[0] or ground を暗く落とした warm/cool。
- hana.js `setSeason` と mount 初期化で `.hana-stage` に適用。

### A-3 奥行き（spawn / drawFlower）
- spawn 時に `depth ∈ [0,1]`（0=手前,1=奥）を rngで付与。
- drawFlower に depth を渡し: 奥ほど scale↓（×0.6〜1.0）・alpha↓（×0.55〜1.0）・
  edgeを柔らかく（奥のみ軽い shadowBlur を花色で、DoF風。手前は付けない）。
- 描画順: 奥（depth大）を先に。redraw で depth 降順に一度ソート（bloom中のみ・400で軽い）。
  もしくは spawn時にdepthで配列挿入位置を決める。実装しやすい方を計画で確定。

### A-4 グレイン（index.html）
- `#hana-view` 内に `.hana-grain`（既存HP `.grain` と同じ SVG feTurbulence・opacity 0.045・
  mix-blend-mode:overlay・pointer-events:none・z-index は canvas と tools の間で最前景化しない）。

### A-5 微風（createGarden loop）
- 上記アーキ2の通り。各花に `swayPhase`（rng）・`swayW`（周期ゆらぎ）。
  redraw の rot に `baseRot + swayAmp*sin(t*swayW + swayPhase)`（swayAmp≈0.035rad）。
- loop は view開中は継続（reduce時のみ満開停止）。30fpsスロットル。

### B-1 遅さの報酬化（spawn / move / drawFlower）
- move: なぞり速度が速いほど STEP を広げる（まばら）。`effStep = STEP * (1 + min(1.5, speed*k))`。
- spawn: `vigor = 1 - min(1, speed/vmax)`（0=速い,1=遅い）。
  vigor で size（既存踏襲）＋ alpha ＋ 色の濃さ（淡い時は ground寄りにmix）を決める。
  drawFlower に vigor を渡し petal の gradient 濃度/alpha に反映。
- 「速いと罰する」のでなく「遅いと豊かになる」方向（Pause 知見）。

### B-2 呼吸のテンポ（dur）
- 開花 dur 700ms → 約1500ms（easeOutCubic）。急かさない。招待の花はさらにゆっくり（約2500ms）。

### B-3 入退場の儀式（mount / index.html）
- 入場: `#hana-view` opacity 0→1（CSS transition 約900ms）。mount で中央に招待の花を1輪 spawn。
- 退場: `farewell(done)` で全花 bloom 1→0（約800ms）→ done。index.html が closeHana から呼ぶ。
- reduce-motion: フェード・farewell アニメは省略（即時）。

## 変更ファイル

- `website/flora/hana.js`: drawFlower（A-1,A-3,B-1）/ createGarden（A-3,A-5,B-1,B-2 + farewell）/
  setSeason（A-2 背景適用）/ mount（B-3 招待花・farewell公開）
- `website/flora/index.html`: `.hana-stage` 背景の初期CSS・`.hana-grain`（A-4）・`#hana-view`
  フェードイン（B-3）・closeHana から farewell 経由に変更・`hana.js?v=2` にキャッシュバスター更新

## 非目標（Phase 2a では触らない）

- B-4 散る花（Phase 2b）／B-5 音（2c）／C-1〜C-3 図鑑側（2b/2c）
- 一輪挿し・絵本（バックログ）／WebGL化・Kuwaharaフィルター（将来・コスト大）
- 24種個別連動（C-3・後段）

## 検証設計

- 既存 hana スイート（util12 / flower8 / engine8 / press7 / mount20 / integration7 = 62）を回帰維持。
- 追加 Playwright（`verify-hana-phase2a.js`）: (a) 花びらにグラデーション（中心と先端でピクセル色が異なる）
  (b) `.hana-stage` 背景が season 切替で色変化 (c) 微風で満開後もフレーム間で微差（rAF継続の確認・
  reduce時は停止） (d) 遅い/速いなぞりで花サイズ・濃度が変わる (e) farewell で花が閉じる（bloom縮小）
  (f) reduce-motion で微風・フェード・farewell が省略され即時 (g) press() が背景を含まず従来どおり
  (h) コンソールエラー0。
- 質感は Phase 2a 全体のスクショ目視ゲート（実装フェーズで確認）。
- Codex レビュー（差分）＋ subagent per-task レビュー。

## リスク

| リスク | 対応 |
|---|---|
| A-5 の常時rAFで負荷 | 30fpsスロットル＋MAX_FLOWERS 400＋reduce時停止。スクショ/実機で確認 |
| A-1 グラデで「ぼやけて花に見えない」 | 付け根は濃く保つ。早期スクショ目視で階調調整 |
| press() に背景が混入 | 背景は .hana-stage(CSS)に分離、flower canvasは透明維持（アーキ1）。検証(g)で担保 |
| farewell 中に再操作/多重close | farewell 実行中フラグで二重起動防止・pointer無効化 |
| 既存62項目の回帰 | 各タスクで回帰確認・最終スイート |
