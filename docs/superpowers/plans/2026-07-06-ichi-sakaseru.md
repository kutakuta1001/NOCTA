# Ichi「咲かせる」Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 花図鑑 Ichi に、指でなぞった軌跡に手続き的な花が芽吹く「咲かせる」遊びと、咲いた庭を「押し花」PNGに保存する体験を追加する（Hare「筆あそび」の対称版）。

**Architecture:** Hare の `fude.js`（Canvas 2D・ストローク距離サンプリング＋スタンプ＋PNG保存）の骨格を写経した新規 `website/flora/hana.js`（`window.NoctaHana`）を作る。インクの代わりに、なぞりの軌跡上へ一定距離ごとに手続き花を「つぼみ→満開」でアニメ開花させ、庭として蓄積。押し花保存は庭を平面化＋和紙合成して `toDataURL('image/png')`。`flora/index.html` に「咲かせる」CTA と全画面ビューを追加し、開閉は既存 `zukan-core.js` の dialog 機構に載せる。

**Tech Stack:** Vanilla JS（ビルドなし）、Canvas 2D、Pointer Events、Playwright（swiftshader 不要・通常 chromium で可）、Node（純粋関数の単体テスト）。

## Global Constraints

- ビルドなし。`<script src>` で読み込む素の JS（ESM 不要）。`hana.js` は IIFE で `window.NoctaHana` を公開（`fude.js` と同形式）。
- パス規則: すべて相対パス（`./hana.js` 等）。絶対パス禁止（GitHub Pages）。
- `git add` は `website/` 以下と `docs/superpowers/` のみ明示指定。`git add -A` / `.` 禁止。実画像・バイナリを追加しない。
- 外部入力（将来の mount opts）に対する XSS 対策として、DOM 挿入する文字列は `fude.js` の `escAttr` と同等のエスケープを通す。
- コミット trailer: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`。
- 共有スクリプト変更時はキャッシュバスター `?v=N`。新規 `hana.js` は `?v=1`。
- 既存 Playwright スイート（iro 19 / fude 23 / zukan 36 / gem3d 11 / shapes 13 / hybrid 15）を回帰させない。
- 検証・Codex は必ずリポジトリ内（`cd /Users/fghmacbook013/NOCTA/project_NOCTA`）で実行。
- scratchpad 実パス: `/private/tmp/claude-501/-Users-fghmacbook013-NOCTA/d33a3808-dccb-490e-8426-ee5196f85bf3/scratchpad`
- Phase 1 スコープ: 「なぞって咲かせる」＋「押し花保存(PNG)」のみ。一輪挿し/生け花/絵本、24種個別連動、葉茎の作り込み、localStorageギャラリーは Phase 2 以降（実装しない）。
- 命名: ページ内は単独名「Ichi」。エンジンは `NoctaHana`。保存ファイル名は `ichi-<season>.png`。

## 検証手法（CanvasのグラフィクスTDD）

- 純粋関数（パレット選択・easing・距離サンプラ・rng）は Node で `assert` の通常TDD。
- Canvas描画・操作は Playwright ハーネス（既存 `verify-fude.js` と同型・簡易HTTPサーバ+chromium）。「テスト」= canvasの非空ピクセル比率／サンプル点の色／保存dataURLのMIME／状態フラグ／スクショ目視。
- chromium 起動は既定でよい（WebGL不要）。既存 `verify-fude.js` のサーバ雛形を流用する。

---

### Task 1: hana.js の純粋関数（パレット・rng・easing・距離サンプラ）

描画から切り離した基盤関数。`window.NoctaHana` を IIFE で作り、テスト用にヘルパを `NoctaHana._` にも露出する。

**Files:**
- Create: `website/flora/hana.js`
- Test: `<scratchpad>/test-hana-util.js`（Node assert）

**Interfaces:**
- Produces（`window.NoctaHana._` に露出）:
  - `SEASONS`: `{ spring:{petals:[hex,hex], core:hex, ground:hex}, summer:{...}, autumn:{...}, winter:{...} }`
  - `makeRng(seed:number) -> ()=>number`（0..1 LCG）
  - `hashSeed(str)->number`
  - `easeOutCubic(t:number)->number`
  - `shouldSpawn(distAccum:number, step:number) -> boolean`（累積距離が step を超えたか）
  - `pickForm(rng)->('sakura'|'kiku'|'tulip'|'komori')`

- [ ] **Step 1: 失敗するテストを書く**

```js
// test-hana-util.js
const assert = require('assert'), vm = require('vm'), fs = require('fs');
const code = fs.readFileSync('/Users/fghmacbook013/NOCTA/project_NOCTA/website/flora/hana.js','utf8');
const ctx = { window:{} }; vm.createContext(ctx); vm.runInContext(code, ctx);
const H = ctx.window.NoctaHana._;
assert.deepStrictEqual(Object.keys(H.SEASONS).sort(), ['autumn','spring','summer','winter']);
for (const k of Object.keys(H.SEASONS)) {
  const s = H.SEASONS[k];
  assert.ok(Array.isArray(s.petals) && s.petals.length >= 2, k+' petals');
  assert.ok(/^#[0-9a-fA-F]{6}$/.test(s.core), k+' core hex');
  assert.ok(/^#[0-9a-fA-F]{6}$/.test(s.ground), k+' ground hex');
}
const rng = H.makeRng(123); const a = rng(), b = rng();
assert.ok(a>=0 && a<1 && b>=0 && b<1 && a!==b, 'rng range/varies');
assert.strictEqual(H.makeRng(123)(), a, 'rng deterministic by seed');
assert.strictEqual(H.easeOutCubic(0), 0); assert.strictEqual(H.easeOutCubic(1), 1);
assert.ok(H.easeOutCubic(0.5) > 0.5, 'easeOut front-loaded');
assert.strictEqual(H.shouldSpawn(30, 24), true);
assert.strictEqual(H.shouldSpawn(10, 24), false);
assert.ok(['sakura','kiku','tulip','komori'].includes(H.pickForm(H.makeRng(1))));
console.log('PASS: hana-util', 12);
```

- [ ] **Step 2: 実行して失敗を確認**

Run: `node <scratchpad>/test-hana-util.js`
Expected: FAIL（`Cannot read properties of undefined (reading 'SEASONS')` — 未実装）

- [ ] **Step 3: 最小実装を書く**

```js
// website/flora/hana.js
/**
 * NOCTA Ichi — 咲かせる（hana）
 * なぞった軌跡に手続き花が芽吹き、庭が育つ。押し花としてPNG保存。
 * Hare fude.js の対称版（Canvas 2D・ストローク距離サンプリング＋スタンプ＋保存）。
 * 提供: window.NoctaHana.mount(container, opts) → { detach }
 */
(function () {
  'use strict';

  /* 季節パレット: 花びら候補色・花芯色・淡い地色 */
  var SEASONS = {
    spring: { petals: ['#F7CAC9', '#F4A6C0', '#FBE3E8'], core: '#E8B923', ground: '#FBF3F1' },
    summer: { petals: ['#4E5EA8', '#7FA8D8', '#E8F0FF'], core: '#F2ECE0', ground: '#EEF3FA' },
    autumn: { petals: ['#E17A47', '#C0395B', '#E8B923'], core: '#7B1113', ground: '#F7EDE2' },
    winter: { petals: ['#FFFFFF', '#E8E0D0', '#D6E4EE'], core: '#B8B4AE', ground: '#F4F2EC' }
  };

  function makeRng(seed) {
    var s = (seed >>> 0) || 1;
    return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  }
  function hashSeed(str) {
    var h = 2166136261 >>> 0; str = String(str || '');
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function easeOutCubic(t) { var u = 1 - t; return 1 - u * u * u; }
  function shouldSpawn(distAccum, step) { return distAccum >= step; }
  var FORMS = ['sakura', 'kiku', 'tulip', 'komori'];
  function pickForm(rng) { return FORMS[Math.floor(rng() * FORMS.length) % FORMS.length]; }

  /* テスト用に純粋関数を露出（描画は後続タスクで追加） */
  window.NoctaHana = { _: { SEASONS: SEASONS, makeRng: makeRng, hashSeed: hashSeed, easeOutCubic: easeOutCubic, shouldSpawn: shouldSpawn, pickForm: pickForm } };
})();
```

- [ ] **Step 4: 実行して成功を確認**

Run: `node <scratchpad>/test-hana-util.js`
Expected: `PASS: hana-util 12`

- [ ] **Step 5: Commit**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/flora/hana.js
git commit -m "feat(ichi): 咲かせるの純粋関数(季節パレット/rng/easing/距離サンプラ)"
```

---

### Task 2: 手続き花の描画 `drawFlower`（4形）

Canvas に1つの花を描く純関数的ルーチン。`bloom`（0..1）で開花度、`rot`で向き、`palette`で配色。

**Files:**
- Modify: `website/flora/hana.js`
- Test: `<scratchpad>/verify-hana-flower.js`（Playwright・4形を並べて描画→非空ピクセル＋色確認＋スクショ）

**Interfaces:**
- Consumes: `SEASONS`, `makeRng`。
- Produces（内部関数・`NoctaHana._.drawFlower` に露出してテスト）:
  - `drawFlower(ctx, opts)`：`opts = { x, y, r, rot, bloom, form, palette, rng }`。中心(x,y)に半径 r で花を描く。`bloom` で花びらの開き・スケール。戻り値なし。

- [ ] **Step 1: Playwright 描画テストを書く（失敗する）**

`verify-hana-flower.js`: scratchpad にハーネス HTML（`./hana.js?v=1` を読み、600x200 canvas に4形を bloom=1 で横並び描画する小スクリプトを内包）を作り、chromium で開いて (a) canvas 非空ピクセル率 > 3%、(b) 各形の中心付近に花びら色が乗る、(c) スクショ `hana-flowers.png` 保存、(d) コンソールエラー0 を確認。既存 `<scratchpad>/verify-fude.js` のサーバ雛形（website ルート配信）を流用。ハーネス HTML は website/flora 配下に一時作成せず scratchpad に置き、サーバのルーティングで `/hana.js` は website から、ハーネスは scratchpad から配信する（website 配下に一時ファイルを残さない）。
Run: `node <scratchpad>/verify-hana-flower.js`
Expected: FAIL（`drawFlower` 未実装）

- [ ] **Step 2: drawFlower を実装（4形）**

`window.NoctaHana` の IIFE 内、`pickForm` の後に追加。`_` にも `drawFlower` を足す。

```js
  /* 花びら1枚を中心から放射方向に描く（涙形をベジェで） */
  function petal(ctx, len, wid) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(wid, -len * 0.4, wid, -len * 0.85, 0, -len);
    ctx.bezierCurveTo(-wid, -len * 0.85, -wid, -len * 0.4, 0, 0);
    ctx.closePath();
  }
  function drawFlower(ctx, o) {
    var bloom = Math.max(0, Math.min(1, o.bloom));
    if (bloom <= 0.001) return;
    var r = o.r * (0.35 + 0.65 * bloom);          /* つぼみ(小)→満開(大) */
    var pal = o.palette, rng = o.rng || makeRng(1);
    var petalColor = pal.petals[Math.floor(rng() * pal.petals.length) % pal.petals.length];
    var form = o.form;
    var counts = { sakura: 5, kiku: 14, tulip: 4, komori: 5 };
    var n = counts[form] || 5;
    var openAng = (0.55 + 0.45 * bloom);           /* 開き具合 */
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate(o.rot || 0);
    for (var i = 0; i < n; i++) {
      ctx.save();
      ctx.rotate((i / n) * Math.PI * 2);
      ctx.scale(openAng, openAng);
      ctx.fillStyle = petalColor;
      ctx.globalAlpha = 0.92;
      if (form === 'kiku') { petal(ctx, r * 1.25, r * 0.12); }
      else if (form === 'tulip') { petal(ctx, r * 1.05, r * 0.42); }
      else if (form === 'komori') { /* 丸弁 */ ctx.beginPath(); ctx.arc(0, -r * 0.6, r * 0.42, 0, Math.PI * 2); }
      else { /* sakura: 先に切れ込み */ petal(ctx, r, r * 0.34); }
      ctx.fill();
      if (form === 'sakura') { /* 切れ込みを地色で */ ctx.fillStyle = pal.ground; ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * 0.09, -r * 0.8); ctx.lineTo(-r * 0.09, -r * 0.8); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    }
    /* 花芯 */
    ctx.fillStyle = pal.core; ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(0, 0, r * (form === 'kiku' ? 0.28 : 0.2), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
```

`_` 露出に `drawFlower: drawFlower` を追加。

- [ ] **Step 3: テスト実行→成功、スクショ目視**

Run: `node <scratchpad>/verify-hana-flower.js`
Expected: PASS（4形が非空・花びら色検出・スクショ保存）。スクショ `hana-flowers.png` を目視し「花に見える」ことを確認。見えなければ counts/openAng/petal 形状を調整（このタスク内で反復可）。

- [ ] **Step 4: Commit**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/flora/hana.js
git commit -m "feat(ichi): 手続き花の描画drawFlower(桜/菊/チューリップ/小花)"
```

---

### Task 3: 咲かせるエンジン（ストローク→開花アニメ）

pointer 操作で軌跡を距離サンプリングし、花を bloom アニメで咲かせ庭に蓄積する。

**Files:**
- Modify: `website/flora/hana.js`
- Test: `<scratchpad>/verify-hana-engine.js`（Playwright・canvasドラッグ→花増加・reduced-motion即満開）

**Interfaces:**
- Consumes: `drawFlower`, `SEASONS`, `makeRng`, `hashSeed`, `easeOutCubic`, `shouldSpawn`, `pickForm`。
- Produces（内部）: `createGarden(canvas, opts) -> { setSeason(name), clear(), press()->dataURL, snapshotCount()->number, detach() }`
  - `opts.reduce`（bool）で開花アニメ省略・即満開。
  - `snapshotCount()` はテスト用（現在の花数）。`press()` は Task 4 で実装（本タスクは空スタブで dataURL を返すだけでよい）。

- [ ] **Step 1: 失敗するテストを書く**

`verify-hana-engine.js`: ハーネスに canvas を置き `createGarden` を使う小スクリプトを内包。chromium で canvas 上を pointer で複数点ドラッグ（`page.mouse.move`/`down`/`up`）→ (a) `snapshotCount()` が 3 以上に増える、(b) canvas 非空ピクセルが増える、(c) `?reduce=1`（ハーネスで opts.reduce=true）時はドラッグ直後（アニメ待ちなし）で花が満開（非空ピクセル即増）、(d) コンソールエラー0。
Run: `node <scratchpad>/verify-hana-engine.js`
Expected: FAIL（`createGarden` 未実装）

- [ ] **Step 2: createGarden を実装**

`window.NoctaHana` IIFE 内に追加。

```js
  var MAX_FLOWERS = 400, STEP = 26;   /* 距離サンプリング間隔(px) */
  function createGarden(canvas, opts) {
    opts = opts || {};
    var reduce = !!opts.reduce;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var seasonName = opts.season || 'spring';
    var flowers = [];        /* {x,y,r,rot,form,palette,seed,bornT,dur} */
    var rafId = null, running = false;
    var seedCounter = 1;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      redraw();
    }
    function now() { return (typeof performance !== 'undefined' ? performance.now() : Date.now()); }

    function redraw() {
      var rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      var t = now();
      for (var i = 0; i < flowers.length; i++) {
        var f = flowers[i];
        var bloom = reduce ? 1 : Math.min(1, easeOutCubic((t - f.bornT) / f.dur));
        drawFlower(ctx, { x: f.x, y: f.y, r: f.r, rot: f.rot, bloom: bloom, form: f.form, palette: SEASONS[seasonName], rng: makeRng(f.seed) });
      }
    }
    function anyBlooming() {
      if (reduce) return false;
      var t = now();
      for (var i = 0; i < flowers.length; i++) { if (t - flowers[i].bornT < flowers[i].dur) return true; }
      return false;
    }
    function loop() {
      redraw();
      if (anyBlooming()) { rafId = requestAnimationFrame(loop); } else { running = false; rafId = null; }
    }
    function kick() { if (!running && !reduce) { running = true; rafId = requestAnimationFrame(loop); } else { redraw(); } }

    function spawn(x, y, speed) {
      var rng = makeRng(seedCounter);
      var f = {
        x: x, y: y,
        r: 12 + (1 - Math.min(1, speed / 2)) * 22,   /* 遅い=大 / 速い=小 */
        rot: rng() * Math.PI * 2,
        form: pickForm(rng),
        seed: seedCounter++,
        bornT: now(),
        dur: 700
      };
      flowers.push(f);
      if (flowers.length > MAX_FLOWERS) flowers.shift();
      kick();
    }

    /* pointer 操作 */
    var drawing = false, last = null, accum = 0;
    function local(e) { var r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, t: (e.timeStamp || now()) }; }
    function begin(e) { drawing = true; var p = local(e); last = p; accum = 0; spawn(p.x, p.y, 0); if (canvas.setPointerCapture) { try { canvas.setPointerCapture(e.pointerId); } catch (_) {} } }
    function move(e) {
      if (!drawing) return;
      var p = local(e), dx = p.x - last.x, dy = p.y - last.y, d = Math.sqrt(dx * dx + dy * dy);
      accum += d;
      var dt = Math.max(1, p.t - last.t), speed = d / dt;
      while (shouldSpawn(accum, STEP)) { accum -= STEP; spawn(p.x, p.y, speed); }
      last = p;
    }
    function end() { drawing = false; last = null; }

    canvas.addEventListener('pointerdown', begin);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('pointerleave', end);
    var onWinResize = function () { resize(); };
    window.addEventListener('resize', onWinResize);
    resize();

    return {
      setSeason: function (name) { if (SEASONS[name]) { seasonName = name; redraw(); } },
      clear: function () { flowers = []; redraw(); },
      press: function () { return canvas.toDataURL('image/png'); },  /* Task 4 で押し花処理に差し替え */
      snapshotCount: function () { return flowers.length; },
      detach: function () {
        running = false; if (rafId) cancelAnimationFrame(rafId);
        canvas.removeEventListener('pointerdown', begin);
        canvas.removeEventListener('pointermove', move);
        canvas.removeEventListener('pointerup', end);
        canvas.removeEventListener('pointercancel', end);
        canvas.removeEventListener('pointerleave', end);
        window.removeEventListener('resize', onWinResize);
      }
    };
  }
```

`window.NoctaHana` に `createGarden: createGarden` を公開に追加（`{ _: {...}, createGarden: createGarden }`）。

- [ ] **Step 3: テスト実行→成功**

Run: `node <scratchpad>/verify-hana-engine.js`
Expected: PASS（ドラッグで花3+・非空増加・reduce即満開・エラー0）

- [ ] **Step 4: Commit**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/flora/hana.js
git commit -m "feat(ichi): 咲かせるエンジン(距離サンプリング→開花アニメ・庭蓄積)"
```

---

### Task 4: 押し花保存 `press()`

咲いた庭を平面化＋和紙合成＋ラベルして PNG dataURL を返す。

**Files:**
- Modify: `website/flora/hana.js`（`createGarden` の `press` を差し替え）
- Test: `<scratchpad>/verify-hana-press.js`（Playwright・press が data:image/png を返す＋スクショ目視）

**Interfaces:**
- Consumes: `flowers`, `SEASONS`, `drawFlower`, `seasonName`。
- Produces: `press() -> string`（`data:image/png;base64,...`）。押し花処理済みの別 canvas から出力。

- [ ] **Step 1: 失敗するテストを書く**

`verify-hana-press.js`: ドラッグで数輪咲かせ、`press()` の戻り値が `data:image/png` で始まり長さ 1000 超であることを確認。返った dataURL を `<img>` に載せてスクショ `hana-press.png` 保存し目視（和紙地・花・ラベルが写る）。コンソールエラー0。
Run: `node <scratchpad>/verify-hana-press.js`
Expected: FAIL（press は現状 canvas 素の toDataURL でラベル/和紙なし → dataURL 長さや目視で不足。まず「和紙地＋ラベル付き」を期待にしてfailさせる: 出力 canvas に地色ピクセル(ground)が四隅に存在することをassertし、素のtoDataURL（四隅透明）でfailにする）

- [ ] **Step 2: press を押し花処理に差し替え**

`createGarden` 内の `press` を次に置換。ラベル文言は季節名（日本語）。

```js
      press: function () {
        var rect = canvas.getBoundingClientRect();
        var w = Math.round(rect.width), h = Math.round(rect.height);
        var pal = SEASONS[seasonName];
        var out = document.createElement('canvas'); out.width = w; out.height = h;
        var octx = out.getContext('2d');
        /* 和紙地 */
        octx.fillStyle = pal.ground; octx.fillRect(0, 0, w, h);
        /* 花を平面化・退色して合成: 縦を少し潰し、彩度を落とすため半透明の地色を上掛け */
        octx.save();
        octx.translate(0, h * 0.06); octx.scale(1, 0.88);   /* 押された平面化 */
        octx.globalAlpha = 0.92;
        octx.drawImage(canvas, 0, 0, w, h);
        octx.restore();
        octx.save(); octx.globalAlpha = 0.10; octx.fillStyle = '#6b5f4a'; octx.fillRect(0, 0, w, h); octx.restore(); /* 退色の沈み */
        /* 細い枠 */
        octx.strokeStyle = 'rgba(60,54,42,0.35)'; octx.lineWidth = Math.max(1, w * 0.004);
        octx.strokeRect(w * 0.03, h * 0.03, w * 0.94, h * 0.94);
        /* 季節ラベル＋署名 */
        var labels = { spring: '春', summer: '夏', autumn: '秋', winter: '冬' };
        octx.fillStyle = 'rgba(40,36,30,0.72)';
        octx.font = '600 ' + Math.round(w * 0.028) + 'px "Shippori Mincho","EB Garamond",serif';
        octx.textAlign = 'left'; octx.textBaseline = 'bottom';
        octx.fillText((labels[seasonName] || '') + ' の 押し花', w * 0.05, h * 0.955);
        octx.textAlign = 'right';
        octx.fillText('Ichi', w * 0.95, h * 0.955);
        return out.toDataURL('image/png');
      },
```

（reduce 時の「押すアニメ」は Task 5 の UI 側で扱う。エンジンの press は静的出力に専念）

- [ ] **Step 3: テスト実行→成功、スクショ目視**

Run: `node <scratchpad>/verify-hana-press.js`
Expected: PASS（data:image/png・四隅に地色・長さ十分）。`hana-press.png` を目視し「押し花らしい」ことを確認。弱ければ退色/平面化率を調整。

- [ ] **Step 4: Commit**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/flora/hana.js
git commit -m "feat(ichi): 押し花保存(和紙合成・平面化退色・季節ラベル)"
```

---

### Task 5: mount + ツールバーUI + 押すアニメ + detach

`NoctaHana.mount(container, opts)` が咲かせるビュー（canvas＋ツールバー）を container 内に構築し、`{ detach }` を返す。

**Files:**
- Modify: `website/flora/hana.js`（`buildUi` と `mount` を追加・公開を `mount` に）
- Test: `<scratchpad>/verify-hana-mount.js`（Playwright・ツールバー描画/季節切替/クリア/保存/モバイル）

**Interfaces:**
- Consumes: `createGarden`。
- Produces（`window.NoctaHana.mount`）: `mount(container, opts) -> { detach() }`。
  - container 内に `.hana-canvas`（描画）、季節チップ4（`.hana-season` data-season）、`.hana-clear`（真っさら）、`.hana-press`（押し花にする）を生成。
  - 押し花にする → `garden.press()` の dataURL を `<a download="ichi-<season>.png">` でダウンロード（fude の savePng と同じ手法）。reduce でなければ押す前に canvas を一瞬 `transform:scaleY(.88)` して戻す軽い「押す」感（CSSトランジション）。
  - detach で garden.detach＋生成DOM除去。

- [ ] **Step 1: 失敗するテストを書く**

`verify-hana-mount.js`: 空の container を持つハーネスで `NoctaHana.mount(container,{season:'spring'})` を呼び、(a) `.hana-canvas`・季節チップ4・`.hana-clear`・`.hana-press` が生成、(b) 別の季節チップをクリック→ドラッグで咲かせた花のサンプル色が春と変わる、(c) `.hana-clear` クリックで花数0（`window.__hanaCount` 等の観測フックを mount が更新）、(d) `.hana-press` クリックでダウンロード（`page.on('download')` を捕捉 or dataURL 生成をフックで確認）、(e) 375px でツールバー要素が可視、(f) コンソールエラー0。
Run: `node <scratchpad>/verify-hana-mount.js`
Expected: FAIL（`mount` 未実装）

- [ ] **Step 2: buildUi + mount を実装**

`window.NoctaHana` IIFE 内に追加。DOM文字列にユーザ入力は無いが、将来のため季節名は固定配列から取り、`escAttr` 相当は不要（定数のみ）。

```js
  function buildUi(container) {
    container.innerHTML =
      '<div class="hana-stage"><canvas class="hana-canvas"></canvas></div>' +
      '<div class="hana-tools" role="group" aria-label="咲かせる道具">' +
        '<div class="hana-seasons">' +
          '<button type="button" class="hana-season is-on" data-season="spring">春</button>' +
          '<button type="button" class="hana-season" data-season="summer">夏</button>' +
          '<button type="button" class="hana-season" data-season="autumn">秋</button>' +
          '<button type="button" class="hana-season" data-season="winter">冬</button>' +
        '</div>' +
        '<button type="button" class="hana-clear">真っさらにする</button>' +
        '<button type="button" class="hana-press">押し花にする</button>' +
      '</div>';
  }

  function mount(container, opts) {
    opts = opts || {};
    var reduce = opts.reduce || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    buildUi(container);
    var canvas = container.querySelector('.hana-canvas');
    var garden = createGarden(canvas, { reduce: reduce, season: opts.season || 'spring' });
    function publishCount() { if (typeof window !== 'undefined') window.__hanaCount = garden.snapshotCount(); }
    var countTimer = setInterval(publishCount, 200);

    var onClick = function (e) {
      var s = e.target.closest('.hana-season');
      if (s) {
        container.querySelectorAll('.hana-season').forEach(function (b) { b.classList.remove('is-on'); });
        s.classList.add('is-on');
        garden.setSeason(s.getAttribute('data-season'));
        return;
      }
      if (e.target.closest('.hana-clear')) {
        var stage = container.querySelector('.hana-stage');
        if (stage && !reduce) { stage.classList.add('hana-sweep'); setTimeout(function () { stage.classList.remove('hana-sweep'); }, 900); }
        garden.clear(); publishCount(); return;
      }
      if (e.target.closest('.hana-press')) {
        var season = (container.querySelector('.hana-season.is-on') || {}).getAttribute ? container.querySelector('.hana-season.is-on').getAttribute('data-season') : 'spring';
        var doSave = function () {
          var url = garden.press();
          var a = document.createElement('a'); a.href = url; a.download = 'ichi-' + season + '.png';
          document.body.appendChild(a); a.click); document.body.removeChild(a);
        };
        if (!reduce) { canvas.style.transition = 'transform 260ms ease'; canvas.style.transform = 'scaleY(0.9)'; setTimeout(function () { canvas.style.transform = ''; doSave(); }, 280); }
        else doSave();
        return;
      }
    };
    container.addEventListener('click', onClick);

    return {
      detach: function () {
        clearInterval(countTimer);
        container.removeEventListener('click', onClick);
        garden.detach();
        container.innerHTML = '';
      }
    };
  }

  window.NoctaHana.mount = mount;
  window.NoctaHana.createGarden = createGarden;
```

注意: 上記 `a.click);` は誤記防止のため実装時は `a.click();` とする（Step 3 のテストで必ず捕捉）。

- [ ] **Step 3: テスト実行→成功（モバイル含む）**

Run: `node <scratchpad>/verify-hana-mount.js`
Expected: PASS（ツールバー生成・季節切替で色変化・クリアで0・保存でdownload・375px可視・エラー0）

- [ ] **Step 4: Commit**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/flora/hana.js
git commit -m "feat(ichi): mount+ツールバー(季節/真っさら/押し花にする)+押すアニメ+detach"
```

---

### Task 6: flora/index.html への統合（CTA・全画面ビュー・i18n・CSS）

「咲かせる」への入口と全画面ビューを図鑑ページに組み込み、開閉を zukan-core の dialog に載せる。

**Files:**
- Modify: `website/flora/index.html`
- Test: `<scratchpad>/verify-hana-integration.js`（Playwright・CTA→ビュー→なぞる→閉じる、回帰）

**Interfaces:**
- Consumes: `window.NoctaHana.mount`、`zukan-core.js` の dialog 開閉（`registerDialog` があれば利用、無ければ最小の open/close ＋ inert/focusで実装。iro/index.html の筆あそび開閉と同形にする）。
- Produces: cover の「咲かせる」CTA と `#hana-view` ダイアログ。

- [ ] **Step 1: 失敗する統合テストを書く**

`verify-hana-integration.js`: `/flora/` を開き、(a) 「咲かせる」CTA が cover に存在、(b) クリックで `#hana-view` が開く（hidden 解除）、(c) view 内 `.hana-canvas` をドラッグで花が増える（非空ピクセル増）、(d) 閉じる×で view が hidden、図鑑に戻る、(e) 通しでコンソールエラー0。
Run: `node <scratchpad>/verify-hana-integration.js`
Expected: FAIL（CTA・view 未実装）

- [ ] **Step 2: index.html に CSS・CTA・view・i18n・読込を追加**

iro/index.html の `.fude-cta` / `.fude-sweep` / 筆あそび開閉を参照し、対称に実装する。具体的に:
1. `<head>` の scripts に `<script src="./hana.js?v=1"></script>` を追加（zukan-core の後）。
2. CSS: `.hana-cta`（cover の CTA・`.fude-cta` と同スタイル）、`#hana-view`（`position:fixed;inset:0;z-index:70;background:#0A0906;` の全画面）、`.hana-stage`（canvas ラッパ・`flex:1`）、`.hana-canvas`（`width:100%;height:100%;touch-action:none;`）、`.hana-tools`（下部ツールバー・チップ/ボタン）、`.hana-season.is-on`（選択中）、`.hana-sweep`（iro の `.fude-sweep` と同じ掃引アニメ・`@media (prefers-reduced-motion)` フォールバック込み）。
3. HTML: cover の「今日の一花」付近に `<button class="hana-cta" id="hana-open">咲かせて遊ぶ →</button>`。body 末尾付近に `<div id="hana-view" role="dialog" aria-modal="true" aria-label="咲かせる" hidden><button class="index-close" id="hana-close" aria-label="閉じる">×</button><div id="hana-mount"></div></div>`。
4. i18n: `"cover.sakaseru": { ja:"咲かせて遊ぶ →", en:"Play — make flowers bloom →" }` を i18n 辞書に追加し、CTA に `data-i18n` 付与。
5. スクリプト（既存の DOMContentLoaded ブロック内）:

```js
  /* ---- 咲かせる（Ichi の遊びレイヤー） ---- */
  var hanaInstance = null;
  var hanaView = document.getElementById('hana-view');
  var hanaMount = document.getElementById('hana-mount');
  function openHana() {
    if (!window.NoctaHana || !hanaView) return;
    hanaView.hidden = false;
    document.body.style.overflow = 'hidden';
    hanaInstance = window.NoctaHana.mount(hanaMount, {});
    var btn = document.getElementById('hana-close'); if (btn) btn.focus();
  }
  function closeHana() {
    if (hanaInstance) { hanaInstance.detach(); hanaInstance = null; }
    if (hanaView) hanaView.hidden = true;
    document.body.style.overflow = '';
  }
  var ho = document.getElementById('hana-open'); if (ho) ho.addEventListener('click', openHana);
  var hc = document.getElementById('hana-close'); if (hc) hc.addEventListener('click', closeHana);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && hanaView && !hanaView.hidden) closeHana(); });
```

（既存の zukan-core に `registerDialog` があればそれを使い focus-trap/inert を委譲する。無ければ上記の最小実装＋`document.body.style.overflow` ロックで可。iro の筆あそびと同じ挙動に合わせる。）

- [ ] **Step 3: テスト実行→成功**

Run: `node <scratchpad>/verify-hana-integration.js`
Expected: PASS（CTA→open→なぞる→close・エラー0）

- [ ] **Step 4: 既存スイート回帰確認**

Run: `cd <scratchpad> && node verify-iro.js && node verify-fude.js && node verify-zukan.js`
Expected: iro 19 / fude 23 / zukan 36 すべて維持。

- [ ] **Step 5: Commit**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/flora/index.html
git commit -m "feat(ichi): flora indexに咲かせるCTA・全画面ビュー・i18nを統合"
```

---

### Task 7: 総合検証・Codex・公開・ドキュメント

**Files:**
- Modify: `handoff.md`（末尾追記1行）、`website/DESIGN-NOTES.md`（§7 Ichi 更新）
- Test: 全 Playwright スイート

- [ ] **Step 1: 全スイート実行**

Run: `cd <scratchpad> && for f in verify-hana-util.js? ; do :; done; node test-hana-util.js && for f in verify-hana-flower.js verify-hana-engine.js verify-hana-press.js verify-hana-mount.js verify-hana-integration.js verify-iro.js verify-fude.js verify-zukan.js; do echo "== $f =="; node "$f" 2>&1 | tail -1; done`
Expected: 全て緑（hana系＋既存 iro/fude/zukan 維持）。

- [ ] **Step 2: Codex レビュー2周（リポジトリ内）**

Run: `cd /Users/fghmacbook013/NOCTA/project_NOCTA && ~/.claude/scripts/codex-review.sh diff`
Critical は必ず修正。website/flora と docs のみ add（他セッションの未コミット変更を含めない）。2周目で Critical 0 を確認。

- [ ] **Step 3: コミット・push**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/flora/ docs/superpowers/
git commit -m "feat(ichi): 咲かせるPhase1（なぞって咲かせる+押し花保存）"
git push origin main
```

- [ ] **Step 4: デプロイ監視・失敗時再実行・ライブ確認**

`gh run list` で最新 run を監視、failure なら `gh run rerun <id>`。success 後に `curl` で `hana.js?v=1` が 200・`/flora/` に「咲かせ」CTA が反映を確認。

- [ ] **Step 5: handoff / DESIGN-NOTES 更新**

handoff に1行（R-06）。DESIGN-NOTES §7 の Ichi 行を「咲かせる（実装済み・hana.js）」に更新し、Hare 対称・押し花保存・Phase 2（一輪挿し/絵本）を追記。

- [ ] **Step 6: G-06 デブリーフ**

盲点（手続き花の写実限界・押し花質感・モバイル操作感）・判断・次の一手（一輪挿し/絵本・24種連動）・確認質問・次回依頼テンプレを提示。

---

## Self-Review 結果

**Spec coverage:**
- なぞって咲かせる（距離サンプリング＋開花アニメ）→ Task 3 ✓
- 手続き花4形 → Task 2 ✓
- 季節パレット4 → Task 1（データ）＋Task 5（切替UI）✓
- 押し花保存（和紙・平面化・ラベル・PNG）→ Task 4 ✓
- 入口CTA・全画面ビュー・真っさら掃引・閉じる → Task 5（ツール）＋Task 6（統合）✓
- reduced-motion・モバイル・性能上限 → Task 3（reduce/MAX_FLOWERS）＋Task 5/6（UI）✓
- 検証（verify-hana-*）→ 各Task＋Task 7 ✓
- 非目標（一輪挿し/絵本/24種連動/localStorage）→ スコープ外明記 ✓

**Placeholder scan:** Task 5 Step 2 に意図的な誤記注意書き（`a.click);`→`a.click();`）あり。実装時修正を明記済み。他に TBD/TODO なし。

**Type consistency:** `createGarden(canvas,opts)->{setSeason,clear,press,snapshotCount,detach}` は Task 3 定義、Task 4（press差替）・Task 5（mount が利用）で一致。`drawFlower(ctx,{x,y,r,rot,bloom,form,palette,rng})` は Task 2 定義・Task 3 で同シグネチャ呼び出し。`mount(container,opts)->{detach}` は Task 5 定義・Task 6 で利用一致。季節キー `spring/summer/autumn/winter` 全タスク一貫。

## リスク要約（実装者向け）

1. 手続き花が「花に見えない」→ Task 2 のスクショ目視で counts/petal を早期調整。ここが体験の要。
2. press の押し花質感 → Task 4 のスクショ目視で退色/平面化率を調整。
3. fude.js との重複は許容（写経で独立性優先）。共通化は負債化してから抽出。
4. 既存 iro/fude/zukan スイートを常に回帰確認（Task 6/7）。
