# Ichi Phase 2a「質感と時間」Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ichi「咲かせる」のチープさを解消し瞑想の起点にする — 花びらの脱ベタ塗り・背景の空気・奥行き・微風・遅さの報酬化・呼吸のテンポ・入退場の儀式（提案書A層+B-1〜3）。

**Architecture:** 現行 Canvas 2D の `website/flora/hana.js` の延長。drawFlower をグラデーション描画に、createGarden に depth/vigor/sway/tempo/farewell を追加、背景は press() を汚さぬよう `.hana-stage` の CSS 側に分離、儀式は index.html の fade と hana の farewell で。

**Tech Stack:** Vanilla JS(IIFE)・Canvas 2D・Playwright・Node。ビルドなし。

## Global Constraints

- ビルドなし・素のJS(IIFE)・相対パス・website配下のみ変更。`git add` はファイル明示（`-A`禁止）。
- コミット trailer: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`。
- 既存 hana スイート（util12/flower8/engine8/press7/mount20/integration7=62）＋ iro19/fude23/zukan36 を回帰維持。
- **press() を汚さない**: flower canvas は透明背景（花のみ）維持。背景(A-2)は `.hana-stage` の CSS に置く。
- reduce（prefers-reduced-motion）で微風・フェード・farewellアニメを省略し即時。
- 花総数上限 MAX_FLOWERS=400 維持。微風の常時rAFは約30fpsスロットル。
- キャッシュバスター: hana.js を変更するので index.html の読込を `./hana.js?v=2` に更新。
- scratchpad実パス: `/private/tmp/claude-501/-Users-fghmacbook013-NOCTA/d33a3808-dccb-490e-8426-ee5196f85bf3/scratchpad`
- 検証・Codexはリポジトリ内（`cd /Users/fghmacbook013/NOCTA/project_NOCTA`）で。
- Playwrightハーネスは website をルート配信し `page.setContent()`＋絶対URLで hana.js を読む（既存 verify-hana-*.js 参照）。website配下に一時ファイルを残さない。

---

### Task 1: 花びらの脱ベタ塗り（A-1・drawFlower）＋色ヘルパ

drawFlower を単色fillからグラデーション＋半透明＋花びら毎ゆらぎに。vigor/depth 引数を追加（本タスクは既定 vigor=1,depth=0 で質感のみ）。

**Files:**
- Modify: `website/flora/hana.js`（色ヘルパ追加・petal/drawFlower 差し替え）
- Test: `<scratchpad>/verify-hana-a1.js`（Playwright・グラデ確認＋スクショ）

**Interfaces:**
- Produces（`NoctaHana._` にも露出）:
  - `hexToRgb(hex) -> {r,g,b}` / `rgba(rgb, a) -> 'rgba(..)'` / `mixRgb(a,b,t) -> {r,g,b}`
  - `drawFlower(ctx, o)` の o に `vigor?:number(0..1,既定1)`, `depth?:number(0..1,既定0)` を追加。
    既定値では概ね従来の見た目＋グラデ質感。

- [ ] **Step 1: 失敗するテストを書く**

`verify-hana-a1.js`: 600x200 canvas に4形を bloom=1,vigor=1,depth=0 で描画。検証:
(a) 各花の花びら領域で「付け根付近のピクセル」と「先端付近のピクセル」の色/alphaが**有意に異なる**（グラデの証拠。単色fillならほぼ同一→fail）。(b) canvas非空率>3%。(c) スクショ `hana-a1.png`。(d) エラー0。
Run: `node <scratchpad>/verify-hana-a1.js`
Expected: FAIL（現状は単色→付け根と先端が同色）

- [ ] **Step 2: 色ヘルパを追加**

hana.js IIFE 内（`easeOutCubic` の近く）に追加し `_` 露出に足す:

```js
  function hexToRgb(hex) {
    var h = String(hex).replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
  }
  function rgba(c, a) { return 'rgba(' + Math.round(c.r) + ',' + Math.round(c.g) + ',' + Math.round(c.b) + ',' + a + ')'; }
  function mixRgb(a, b, t) { return { r: a.r+(b.r-a.r)*t, g: a.g+(b.g-a.g)*t, b: a.b+(b.b-a.b)*t }; }
```

- [ ] **Step 3: petal はそのまま・drawFlower を差し替え**

`drawFlower` 全体を次に置換（`petal` 関数は現状維持）:

```js
  function drawFlower(ctx, o) {
    var bloom = Math.max(0, Math.min(1, o.bloom));
    if (bloom <= 0.001) return;
    var vigor = (typeof o.vigor === 'number') ? o.vigor : 1;   /* 0=速い/淡, 1=遅い/豊か */
    var depth = (typeof o.depth === 'number') ? o.depth : 0;   /* 0=手前, 1=奥 */
    var r = o.r * (0.35 + 0.65 * bloom) * (1 - depth * 0.4);
    var pal = o.palette, rng = o.rng || makeRng(1);
    var baseA = (0.60 + 0.32 * vigor) * (1 - depth * 0.45);    /* 豊か/手前ほど濃い */
    var ground = hexToRgb(pal.ground);
    var form = o.form;
    var counts = { sakura: 5, kiku: 14, tulip: 4, komori: 5 };
    var n = counts[form] || 5;
    var openAng = (0.55 + 0.45 * bloom);
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate(o.rot || 0);
    if (depth > 0.5) { ctx.shadowColor = rgba(hexToRgb(pal.petals[0]), 0.5); ctx.shadowBlur = r * 0.5; } /* 奥は柔らかく */
    for (var i = 0; i < n; i++) {
      ctx.save();
      ctx.rotate((i / n) * Math.PI * 2);
      ctx.scale(openAng, openAng);
      /* 花びら毎の色ゆらぎ（ベタ感の解消） */
      var baseCol = hexToRgb(pal.petals[Math.floor(rng() * pal.petals.length) % pal.petals.length]);
      var jitter = (rng() - 0.5) * 24;
      var pc = { r: baseCol.r + jitter, g: baseCol.g + jitter * 0.6, b: baseCol.b + jitter * 0.4 };
      var len = (form === 'kiku') ? r * 1.25 : (form === 'tulip') ? r * 1.05 : r;
      /* 付け根=濃 → 先端=淡・地色寄り・低alpha（光の透過感） */
      var grad = ctx.createLinearGradient(0, 0, 0, -len);
      grad.addColorStop(0, rgba(pc, baseA));
      grad.addColorStop(0.6, rgba(pc, baseA * 0.92));
      grad.addColorStop(1, rgba(mixRgb(pc, ground, 0.55), baseA * 0.38));
      ctx.fillStyle = grad;
      if (form === 'kiku') { petal(ctx, r * 1.25, r * 0.12); }
      else if (form === 'tulip') { petal(ctx, r * 1.05, r * 0.42); }
      else if (form === 'komori') { ctx.beginPath(); ctx.arc(0, -r * 0.6, r * 0.42, 0, Math.PI * 2); }
      else { petal(ctx, r, r * 0.34); }
      ctx.fill();
      if (form === 'sakura') { ctx.fillStyle = rgba(ground, baseA * 0.9); ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * 0.09, -r * 0.8); ctx.lineTo(-r * 0.09, -r * 0.8); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    }
    ctx.shadowBlur = 0;
    /* 花芯: 中心明→縁濃のラジアル */
    var coreR = r * (form === 'kiku' ? 0.28 : 0.2);
    var core = hexToRgb(pal.core);
    var cg = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR);
    cg.addColorStop(0, rgba(mixRgb(core, { r: 255, g: 255, b: 255 }, 0.4), 1));
    cg.addColorStop(1, rgba(core, 1));
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(0, 0, coreR, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
```

`_` 露出に `hexToRgb,rgba,mixRgb` を追加（`drawFlower` は既存済み）。

- [ ] **Step 4: テスト実行→成功、スクショ目視**

Run: `node <scratchpad>/verify-hana-a1.js`
Expected: PASS。`hana-a1.png` を目視し「花びらに光の階調が出て、なお花に見える」ことを確認（付け根が薄すぎたら baseA 下限を上げる）。回帰: `node <scratchpad>/verify-hana-flower.js`（8/8・単色前提のassertがあれば緩める。既存はピクセル非空/色検出中心なので通る想定。落ちたら該当assertを「花びら色域が存在」に更新）。

- [ ] **Step 5: Commit**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/flora/hana.js
git commit -m "feat(ichi): 花びらをグラデーション+半透明+花びら毎ゆらぎに(A-1脱ベタ塗り)"
```

---

### Task 2: createGarden 刷新（A-3奥行き・A-5微風・B-1遅さ報酬・B-2呼吸テンポ・farewell）

エンジンの spawn/move/redraw/loop を刷新し、depth/vigor/sway を花に持たせ、テンポを緩め、退場アニメ farewell を追加。

**Files:**
- Modify: `website/flora/hana.js`（createGarden 内）
- Test: `<scratchpad>/verify-hana-engine2.js`（Playwright）

**Interfaces:**
- Consumes: drawFlower(vigor,depth)（Task 1）。
- Produces: createGarden 返り値に `farewell(done)` を追加（既存 setSeason/clear/press/snapshotCount/detach は維持）。
  flower オブジェクトに `depth,vigor,swayPhase,swayW,baseRot` を追加。`dur` を 1500 に。

- [ ] **Step 1: 失敗するテストを書く**

`verify-hana-engine2.js`（既存 verify-hana-engine.js 流用）:
(a) **遅いなぞり**（move間の時間大）と**速いなぞり**（時間小）で、生成された花の平均サイズ/濃さが異なる（遅い＞速い）。観測: `g` にテスト用 `__lastFlowerMeta()` を付けるのは避け、代わりに canvas 非空ピクセルの総量や平均輝度差で近似、または `snapshotCount` と描画結果の比較。簡便には「遅い10ストロークと速い10ストロークで最終非空ピクセル面積が遅い方が大」。
(b) **微風**: reduce=false で全花満開後（2秒待ち）も、100ms 間隔の2フレームで canvas ピクセルに微差がある（sway継続の証拠）。reduce=true では2秒後の2フレームが同一（停止）。
(c) **farewell**: 数輪咲かせ `g.farewell(cb)` を呼ぶと、cb が呼ばれ、その時点で全花 bloom が縮小（非空ピクセルが呼び出し前より減少）。reduce時は即 cb。
(d) エラー0。
Run: `node <scratchpad>/verify-hana-engine2.js`
Expected: FAIL

- [ ] **Step 2: spawn を刷新（depth/vigor/sway/tempo）**

`spawn` を次に置換:

```js
    function spawn(x, y, speed) {
      var rng = makeRng(seedCounter);
      var vmax = 2.2;
      var vigor = 1 - Math.min(1, speed / vmax);      /* 遅い=1(豊か) / 速い=0(淡) */
      var depth = rng();                              /* 0..1 空気遠近 */
      var f = {
        x: x, y: y,
        r: (14 + vigor * 22) * (0.9 + rng() * 0.2),   /* 遅い=大 */
        baseRot: rng() * Math.PI * 2,
        form: pickForm(rng),
        seed: seedCounter++,
        bornT: now(),
        dur: 1500,                                    /* B-2 呼吸テンポ(開花を緩める) */
        depth: depth,
        vigor: vigor,
        swayPhase: rng() * Math.PI * 2,
        swayW: 0.0006 + rng() * 0.0006                /* 微風の角速度(rad/ms) */
      };
      /* 奥(depth大)を先に描くため depth 降順で挿入 */
      var idx = flowers.length;
      while (idx > 0 && flowers[idx - 1].depth < f.depth) idx--;
      flowers.splice(idx, 0, f);
      if (flowers.length > MAX_FLOWERS) flowers.shift();
      kick();
    }
```

- [ ] **Step 3: redraw に sway/depth/vigor、loop を常時化＋30fpsスロットル、farewell 状態**

createGarden 冒頭の状態に `var farewelling = false, farewellT = 0, lastFrameT = 0;` を追加。
`redraw` を置換:

```js
    function redraw() {
      var rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      var t = now();
      for (var i = 0; i < flowers.length; i++) {
        var f = flowers[i];
        var bloom;
        if (farewelling) {
          bloom = Math.max(0, 1 - (t - farewellT) / 800);        /* 退場: 1→0 */
        } else {
          bloom = reduce ? 1 : Math.min(1, easeOutCubic((t - f.bornT) / f.dur));
        }
        var sway = reduce ? 0 : 0.035 * Math.sin(t * f.swayW + f.swayPhase); /* A-5 微風 */
        drawFlower(ctx, {
          x: f.x, y: f.y, r: f.r, rot: f.baseRot + sway, bloom: bloom,
          form: f.form, palette: SEASONS[seasonName], rng: makeRng(f.seed),
          vigor: f.vigor, depth: f.depth
        });
      }
    }
```

`loop`/`kick`/`anyBlooming` を「view開中は継続・30fpsスロットル・reduceは満開停止」に:

```js
    function needLoop() {
      if (farewelling) return true;
      if (reduce) {                       /* reduce: 開花中のみ回す(微風なし=満開で停止) */
        var t = now();
        for (var i = 0; i < flowers.length; i++) { if (t - flowers[i].bornT < flowers[i].dur) return true; }
        return false;
      }
      return true;                        /* 非reduce: 微風のため開中は常時 */
    }
    function loop() {
      var t = now();
      if (t - lastFrameT >= 33) { lastFrameT = t; redraw(); }  /* 約30fpsスロットル */
      if (needLoop()) { rafId = requestAnimationFrame(loop); } else { running = false; rafId = null; }
    }
    function kick() { if (!running) { running = true; lastFrameT = 0; rafId = requestAnimationFrame(loop); } else { /* 継続中 */ } }
```

（注: reduce時は kick 後 needLoop が false になり次第停止するので従来の省電力を維持。非reduceは開中継続。）

- [ ] **Step 4: move の effStep（B-1 速いとまばら）**

`move` の STEP 使用箇所を速度依存に。`var effStep = STEP * (1 + Math.min(1.6, speed * 0.9));` を計算し、`need`/`while`/`accum` の STEP を effStep に置換:

```js
      var ux = dx / d, uy = dy / d;
      var effStep = STEP * (1 + Math.min(1.6, speed * 0.9));   /* 速いほど間隔広=まばら */
      var need = effStep - accum;
      if (need > d) { accum += d; last = p; return; }
      var s = need;
      while (s <= d) { spawn(last.x + ux * s, last.y + uy * s, speed); s += effStep; }
      accum = d - (s - effStep);
      last = p;
```

- [ ] **Step 5: farewell を返り値に追加**

`return { ... }` に追加（detach の前）:

```js
      farewell: function (done) {
        if (reduce || flowers.length === 0) { if (done) done(); return; }
        farewelling = true; farewellT = now(); kick();
        setTimeout(function () { if (done) done(); }, 820);
      },
```

- [ ] **Step 6: テスト実行→成功**

Run: `node <scratchpad>/verify-hana-engine2.js`
Expected: PASS。回帰: `node <scratchpad>/verify-hana-engine.js`（8/8。挙動変更で落ちるassertは新仕様に更新: 例「満開後停止」を前提にしたものは非reduceでは継続に変わる→テスト側を reduce 前提に直すか engine2 に集約）。`node <scratchpad>/verify-hana-press.js`（7/7・pressは不変）。

- [ ] **Step 7: Commit**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/flora/hana.js
git commit -m "feat(ichi): 奥行き/微風/遅さの報酬/呼吸テンポ/退場farewellをエンジンに(A-3,A-5,B-1,B-2)"
```

---

### Task 3: mount 儀式＋季節背景（A-2 hana側・B-3入場招待花・farewell配線）

mount で入場の招待花を1輪出し、setSeason で `.hana-stage` 背景を季節連動、farewell を index から呼べるよう返す。

**Files:**
- Modify: `website/flora/hana.js`（mount / setSeason 周辺）
- Test: `<scratchpad>/verify-hana-mount2.js`

**Interfaces:**
- Consumes: createGarden.farewell（Task 2）。
- Produces: mount 返り値に `farewell(done)` を追加（既存 detach 維持）。setSeason が `.hana-stage` 背景を更新。mount 時に中央へ招待花1輪を spawn。

- [ ] **Step 1: 失敗するテストを書く**

`verify-hana-mount2.js`: mount 直後 (a) `window.__hanaCount>=1`（招待花）。(b) 季節チップ切替で `.hana-stage` の `background` インラインstyleが変わる。(c) mount返り値に `farewell` 関数があり、呼ぶと done コールバックが呼ばれる。(d) エラー0。
Expected: FAIL

- [ ] **Step 2: setSeason に背景適用・招待花・farewell 配線**

`buildUi` 後、背景を適用するヘルパと季節→光だまり色マップを mount に追加。createGarden は既に setSeason を持つが、背景更新は mount 側（DOM）で行う。mount を次のように拡張（該当部を追記/差し替え）:

```js
  var SEASON_GLOW = {
    spring: 'rgba(120,70,90,0.40)', summer: 'rgba(50,70,120,0.40)',
    autumn: 'rgba(120,70,40,0.42)', winter: 'rgba(90,96,110,0.36)'
  };
  function applyStageBg(container, season) {
    var stage = container.querySelector('.hana-stage');
    if (stage) stage.style.background =
      'radial-gradient(ellipse 70% 60% at 50% 62%, ' + (SEASON_GLOW[season] || SEASON_GLOW.spring) +
      ' 0%, rgba(14,12,9,0.85) 55%, #0A0906 100%)';
  }
```

mount 内: `createGarden` 生成直後に `applyStageBg(container, opts.season||'spring');`。
onClick の季節切替分岐に `applyStageBg(container, s.getAttribute('data-season'));` を追加。
mount 末尾で招待花を spawn するため、createGarden に**中央へ1輪咲かせる内部関数を叩く手段**が必要。
最小実装: createGarden 返り値に `invite()` を足す（中央座標に1輪 spawn・ゆっくり dur）か、
mount から canvas 中央の pointer を模さず、createGarden に `invite` を追加:

createGarden 返り値に追加:
```js
      invite: function () {
        var rect = canvas.getBoundingClientRect();
        spawn(rect.width / 2, rect.height * 0.5, 0);
        flowers[flowers.length - 1].dur = 2500;   /* 招待はさらにゆっくり */
      },
```
mount 返り値に `farewell` を委譲:
```js
    return {
      farewell: function (done) { garden.farewell(done); },
      detach: function () { ...既存... }
    };
```
mount 内 `createGarden` 後: `if (!reduce) garden.invite();`（reduce時は招待アニメ省略・空庭で開始）。

- [ ] **Step 3: テスト実行→成功**

Run: `node <scratchpad>/verify-hana-mount2.js` → PASS。回帰: `node <scratchpad>/verify-hana-mount.js`（20/20。招待花で初期count>=1になる点が既存assertと矛盾するなら該当を更新）。

- [ ] **Step 4: Commit**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/flora/hana.js
git commit -m "feat(ichi): 入場の招待花・季節連動の背景・farewell配線(A-2,B-3)"
```

---

### Task 4: index.html 統合（A-2 CSS・A-4 グレイン・B-3 フェード・closeHana→farewell・v=2）

**Files:**
- Modify: `website/flora/index.html`
- Test: `<scratchpad>/verify-hana-integration2.js`

**Interfaces:**
- Consumes: mount().farewell（Task 3）。

- [ ] **Step 1: 失敗するテストを書く**

`verify-hana-integration2.js`: `/flora/` で (a) `#hana-view` に opacity トランジション（開いた後 computed opacity≈1・閉じる過程で<1になる瞬間があるか、または style に transition 定義）。(b) `.hana-grain` 要素が存在。(c) 閉じる×で「花が閉じてから」hidden になる（farewell 経由: クリック直後は hidden=false のまま少し保持→その後 hidden）。(d) 既存の開く/なぞる/エラー0 を維持。
Expected: FAIL

- [ ] **Step 2: index.html を更新**

1. `.hana-stage` の初期 CSS に `transition:background 0.6s ease;` を足す（背景はhana.jsが上書き）。
2. `#hana-view` に `opacity:0; transition:opacity 0.9s ease;` と、開いている時用 `#hana-view:not([hidden]){ opacity:1; }`（または JS で open時に `style.opacity=1`）。reduced-motion で transition 無効化のメディアクエリ。
3. `.hana-grain` を `#hana-view` 内に追加（既存HP `.grain` と同じ SVG feTurbulence・`position:absolute;inset:0;opacity:0.045;mix-blend-mode:overlay;pointer-events:none;z-index:1;`。canvas(z:適宜)より上・tools より下にならないよう z 調整、ツールバー操作を邪魔しない）。HTML: `<div id="hana-view" ...><button close><div class="hana-grain"></div><div id="hana-mount"></div></div>`。
4. `<script src="./hana.js?v=1">` → `?v=2`。
5. closeHana を farewell 経由に:

```js
  function closeHana() {
    if (hanaInstance && hanaInstance.farewell) {
      var inst = hanaInstance; hanaInstance = null;
      inst.farewell(function () { inst.detach(); if (hanaView) hanaView.hidden = true; document.body.style.overflow = ''; });
    } else {
      if (hanaInstance) { hanaInstance.detach(); hanaInstance = null; }
      if (hanaView) hanaView.hidden = true; document.body.style.overflow = '';
    }
  }
```

（registerDialog を使っている場合は onClose で farewell を挟む形に。二重close防止に hanaInstance=null を先に。）
openHana は `hanaView.hidden=false` 後に（reduceでなければ）`hanaView.style.opacity='1'` をrAFで設定しフェードイン。

- [ ] **Step 3: テスト実行→成功＋回帰**

Run: `node <scratchpad>/verify-hana-integration2.js` → PASS。
回帰: `cd <scratchpad> && node verify-hana-integration.js && node verify-iro.js && node verify-fude.js && node verify-zukan.js`（7/19/23/36 維持）。

- [ ] **Step 4: Commit**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/flora/index.html
git commit -m "feat(ichi): 背景の空気・グレイン・入退場フェード・farewell閉じ(A-2,A-4,B-3)"
```

---

### Task 5: 総合検証・Codex・公開・ドキュメント

**Files:** Modify `handoff.md`・`website/DESIGN-NOTES.md`

- [ ] **Step 1: 全スイート**

Run: `cd <scratchpad>` で hana 全（util/flower/engine/engine2/press/mount/mount2/a1/integration/integration2）＋ iro/fude/zukan。全緑。落ちた既存assertは新仕様へ更新した旨を報告に記録。

- [ ] **Step 2: 質感スクショ目視ゲート**

`<scratchpad>/shot-hana-view.js`（既存）で咲かせビューを撮り、A-1グラデ・A-2背景・A-3奥行き・微風が効いた「チープでない」画になっているか目視。弱い項目はパラメータ微調整（担当タスクに戻す）。

- [ ] **Step 3: Codex レビュー2周（リポジトリ内）**

Run: `cd /Users/fghmacbook013/NOCTA/project_NOCTA && ~/.claude/scripts/codex-review.sh diff`。Critical必ず修正。website/flora と docs のみ add（他セッション変更を含めない）。

- [ ] **Step 4: main 取り込み・push**

feature ブランチで実装している場合、main へ必要ファイルのみ取り込み（`git checkout main; git checkout <branch> -- website/flora/hana.js website/flora/index.html docs/...`）。混入ゼロを確認しコミット・push。

- [ ] **Step 5: デプロイ監視・ライブ確認**

`gh run list`→failureなら`gh run rerun`。success後 `curl` で `hana.js?v=2` 200・`/flora/` に `hana-grain` 反映を確認。

- [ ] **Step 6: handoff / DESIGN-NOTES 更新（R-06準拠）＋ G-06 デブリーフ**

handoff 1行。DESIGN-NOTES §7 Ichi に「Phase 2a 質感と時間（実装済み）」追記。デブリーフ（盲点・判断・次=Phase 2b散る花/2c音・確認質問・次回テンプレ）。

---

## Self-Review 結果

**Spec coverage:** A-1→T1 / A-3,A-5,B-1,B-2,farewell→T2 / A-2(hana),B-3招待→T3 / A-2(CSS),A-4,B-3フェード,closeHana→T4 / 検証・公開→T5。全項目に対応タスクあり。B-4/B-5/C層は非目標（spec通り）。

**Placeholder scan:** パラメータ（baseA下限・swayAmp・effStep係数・SEASON_GLOW色）は具体値を記載。TBDなし。テストの観測手段は「近似で可」と明記（グラフィクスTDDの性質上）。

**Type consistency:** `drawFlower(o{...,vigor,depth})` T1定義→T2で vigor/depth 付き呼び出し一致。createGarden 返り値 `farewell/invite` T2/T3定義→T3 mount・T4 index で使用一致。`applyStageBg(container,season)` T3内一貫。season キー spring/summer/autumn/winter 一貫。

## リスク要約
1. A-5 常時rAFの負荷 → 30fpsスロットル＋MAX400＋reduce停止。T5スクショ/実機確認。
2. A-1 グラデで花が「ぼやける」→ 付け根baseA維持・T1スクショで調整。
3. 既存62項目のうち「満開後停止」「初期count0」前提のassertは新仕様（微風継続・招待花）と衝突 → 各Tで該当assertを新仕様に更新し報告に明記（テストを仕様に追従させる・機能の後退ではない）。
4. press()背景混入 → 背景は.hana-stage(CSS)分離を厳守（T3/T4）。T5で press 出力を確認。
