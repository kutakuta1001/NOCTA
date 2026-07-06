# Gyu 3D宝石 パストレーシング・ハイブリッド Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gyuの3D宝石に「静止時パストレーシング現像」を足し、手を止めるとCycles級の内部干渉・多重反射・分散を持つ本物同然の静止画へ収束させる（動=PBR / 静=パストレース のハイブリッド）。

**Architecture:** 現行 `gem3d.js`（MeshPhysicalMaterial + Bloom composer）はそのまま「動」モードとして維持。新規 `gem3d-pathtracer.js`（`three-gpu-pathtracer` の `WebGLPathTracer` ラッパ）を、宝石が静止しかつ対応端末のときだけ遅延importし、別canvasへ累積描画してPBR canvasの上にクロスフェード。傾け入力で即PBR復帰・PT破棄。環境光は既存ショーケースの emissive ライトカードを実光源として流用。

**Tech Stack:** three.js 0.180.0（既存・importmap CDN ESM）、three-mesh-bvh、three-gpu-pathtracer（新規・jsdelivr ESM）、Playwright（swiftshader WebGL2 検証）、Codex CLI レビュー。

## Global Constraints

- ビルドなし。ESM は `<script type="importmap">` + jsdelivr CDN で解決する（既存方針）。
- パス規則: すべて相対パス（`./gem3d-pathtracer.js` 等）。絶対パス禁止（GitHub Pages）。
- `git add` は `website/` 以下のファイルのみ明示指定。`git add -A` / `.` 禁止。実画像・バイナリをgitに追加しない（HDRI等の外部バイナリは同梱せず手続き的環境で代替）。
- three系のバージョンは全て 0.180.0 系に整合させる。three-gpu-pathtracer / three-mesh-bvh は 0.180 と互換なバージョンにピン留めする（Phase 0 で確定）。
- コミット trailer: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`。
- 共有スクリプト変更時はキャッシュバスター `?v=N` を上げる。
- 既存 Playwright スイート（gem3d 11 / kazasu 12 / zukan 36 / iro 19 / fude 23）と形状スイート（13）を全緑で維持。回帰させない。
- 検証は必ずリポジトリ内（`cd /Users/fghmacbook013/NOCTA/project_NOCTA`）で行う。Codex は同ディレクトリから実行（非gitディレクトリからだと git diff が失敗する）。
- 破壊的操作禁止（deny: git push --force / reset --hard / rm -rf 等）。
- モデル: 本計画の実装は Opus 4.8 + effort xhigh を推奨（グラフィクス・長時間エージェント作業）。

## 検証手法の注記（グラフィクスのTDD適応）

ピクセル完全一致のユニットテストは3D描画に不向きなため、本計画の「テスト」は
**Playwright統合ハーネス**（canvas生成・コンソールエラー0・キャンバスの非空ピクセル比率・
状態遷移フラグの露出）と**スクリーンショット目視**で構成する。各タスクの test は
`scratchpad` に置く Playwright スクリプト（既存 `verify-*.js` と同型の簡易HTTPサーバ+chromium）とする。
純粋関数（対応判定・settle判定）は Node 単体で assert できるので通常のTDDにする。

---

### Task 0: スパイク — CDN互換性とパストレーサ実走の確認（撤退判断ゲート）

このタスクは本計画全体の前提を de-risk する。ここが通らなければ Phase 1 以降に進まない。

**Files:**
- Create: `/private/tmp/.../scratchpad/pt-spike.html`（scratchpad・コミットしない使い捨て検証ページ）
- Create: `/private/tmp/.../scratchpad/verify-pt-spike.js`（Playwright）

**Interfaces:**
- Produces: 「three-gpu-pathtracer@X.Y.Z が three@0.180.0 と互換」「WebGLPathTracer APIが使える」「dispersion対応の有無」「swiftshaderで実走可否」の4事実。これらを Phase 1 の import URL とAPI形状の確定に使う。

- [ ] **Step 1: 互換バージョンを調べる**

jsdelivr で `three-gpu-pathtracer` と `three-mesh-bvh` の three@0.180 互換版を確認する。
Run: `curl -s "https://data.jsdelivr.com/v1/packages/npm/three-gpu-pathtracer" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);console.log(j.versions.slice(0,8).map(v=>v.version).join(' '))})"`
Expected: バージョン一覧が出る。README/peerDeps で three 0.180 対応の版を選ぶ（新しめの `0.0.x`）。決めた版番号をこのタスクにメモする。

- [ ] **Step 2: スパイク用HTMLを書く**

scratchpad に、importmap で three / three-mesh-bvh / three-gpu-pathtracer を解決し、
ブリリアント相当の簡単なガラス球（MeshPhysicalMaterial transmission:1, ior:2.42, dispersion:0.7）を
`WebGLPathTracer` で数十サンプル累積して canvas に出す最小ページを作る。

```html
<!doctype html><meta charset="utf-8">
<script type="importmap">{ "imports": {
  "three": "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js",
  "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/",
  "three-mesh-bvh": "https://cdn.jsdelivr.net/npm/three-mesh-bvh@<VER>/build/index.module.js",
  "three-gpu-pathtracer": "https://cdn.jsdelivr.net/npm/three-gpu-pathtracer@<VER>/build/index.module.js"
}}</script>
<div id="c" style="width:600px;height:600px"></div>
<script type="module">
import * as THREE from 'three';
import { WebGLPathTracer, GradientEquirectTexture } from 'three-gpu-pathtracer';
const host=document.getElementById('c');
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setSize(600,600); host.appendChild(renderer.domElement);
const scene=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(40,1,0.1,100); cam.position.set(0,0,4);
const env=new GradientEquirectTexture(); env.topColor.set(0xffffff); env.bottomColor.set(0x222222); env.update();
scene.environment=env;
const mat=new THREE.MeshPhysicalMaterial({transmission:1,thickness:1.5,ior:2.42,roughness:0,metalness:0});
if('dispersion' in mat) mat.dispersion=0.7;
const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(1,0),mat); scene.add(mesh);
// 光源として emissive 板を1枚
const lc=new THREE.Mesh(new THREE.PlaneGeometry(4,4),new THREE.MeshBasicMaterial({color:0xffffff}));
lc.position.set(2,2,3); lc.lookAt(0,0,0); lc.material.toneMapped=false; scene.add(lc);
const pt=new WebGLPathTracer(renderer);
pt.setScene(scene,cam);
let n=0; window.__ptSamples=0; window.__ptError='';
try{ (function loop(){ if(n<40){ pt.renderSample(); n++; window.__ptSamples=n; requestAnimationFrame(loop);} else { window.__ptDone=true; } })(); }
catch(e){ window.__ptError=String(e); }
window.__ptDispersion = ('dispersion' in mat);
</script>
```

（`<VER>` は Step 1 で決めた版に置換）

- [ ] **Step 3: Playwrightで実走確認**

scratchpad に verify-pt-spike.js を書き、swiftshader WebGL2 でページを開き、
`window.__ptSamples` が増える／`window.__ptDone` が true／`window.__ptError` が空／canvasが非空ピクセルを持つ ことを確認、スクショ保存、`window.__ptDispersion` を出力する。
Run: `cd .../scratchpad && node verify-pt-spike.js`
Expected: `SAMPLES>=40 ERROR='' DISPERSION=true|false CANVAS=drawn` のような出力とスクショ。
- **もし swiftshader で失敗**: `--use-gl=angle` 等を試す。それでも不可なら「PTはCIヘッドレスで実走不可・実GPU目視前提」と結論し log 明記（撤退はしない。フォールバック検証で緑を取る方針へ）。
- **もし import 自体が失敗（互換性NG）**: 別バージョンを2つまで試す。全滅なら **撤退**: CEOに「three-gpu-pathtracer が three@0.180 と非互換。(a) three をダウングレード (b) 軸2の自前シェーダ (c) 軸3プリレンダー のどれにするか」を確認。

- [ ] **Step 4: 結論をスペックに追記**

決定した import URL・バージョン・API形状（`WebGLPathTracer` / `renderSample` の有無）・dispersion対応・swiftshader可否を
`docs/superpowers/specs/2026-07-06-gyu-pathtracer-hybrid-design.md` の末尾「## スパイク結論」に追記。
Run: なし（Editで追記）。

- [ ] **Step 5: Commit**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add docs/superpowers/specs/2026-07-06-gyu-pathtracer-hybrid-design.md docs/superpowers/plans/2026-07-06-gyu-pathtracer-hybrid.md
git commit -m "docs(gems): パストレーサ・ハイブリッドの設計/計画とスパイク結論"
```

---

### Task 1: 対応判定と settle 判定（純粋関数・単体テスト）

パストレーサを使うか、いつ「静止」とみなすかの判定を、描画から切り離した純粋関数にする。

**Files:**
- Create: `website/gems/gem3d-pt-util.js`（純粋関数のみ・three非依存）
- Test: `/private/tmp/.../scratchpad/test-pt-util.js`（Node assert）

**Interfaces:**
- Produces:
  - `NoctaGemPTUtil.canPathtrace(env) -> boolean`（env = `{ webgl2, reduce, coarse, lowCores, floatBuf }`、全条件ANDで true）
  - `NoctaGemPTUtil.isStill(s) -> boolean`（s = `{ autoSpin, dTarget, msSinceTilt }`。`!autoSpin && dTarget < 0.002 && msSinceTilt > 500` で true）
  - グローバル `window.NoctaGemPTUtil`（ESMではなく通常scriptで読めるよう UMD 風に `window` へ露出）

- [ ] **Step 1: 失敗するテストを書く**

```js
// test-pt-util.js
const assert = require('assert');
const vm = require('vm');
const fs = require('fs');
const code = fs.readFileSync(__dirname + '/../../NOCTA/project_NOCTA/website/gems/gem3d-pt-util.js', 'utf8');
const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(code, ctx);
const U = ctx.window.NoctaGemPTUtil;

assert.strictEqual(U.canPathtrace({webgl2:true,reduce:false,coarse:false,lowCores:false,floatBuf:true}), true, 'full support→true');
assert.strictEqual(U.canPathtrace({webgl2:false,reduce:false,coarse:false,lowCores:false,floatBuf:true}), false, 'no webgl2→false');
assert.strictEqual(U.canPathtrace({webgl2:true,reduce:true,coarse:false,lowCores:false,floatBuf:true}), false, 'reduce→false');
assert.strictEqual(U.canPathtrace({webgl2:true,reduce:false,coarse:true,lowCores:false,floatBuf:true}), false, 'coarse(mobile)→false');
assert.strictEqual(U.canPathtrace({webgl2:true,reduce:false,coarse:false,lowCores:true,floatBuf:true}), false, 'lowCores→false');
assert.strictEqual(U.canPathtrace({webgl2:true,reduce:false,coarse:false,lowCores:false,floatBuf:false}), false, 'no floatBuf→false');

assert.strictEqual(U.isStill({autoSpin:true, dTarget:0, msSinceTilt:9999}), false, 'autospin→not still');
assert.strictEqual(U.isStill({autoSpin:false, dTarget:0.05, msSinceTilt:9999}), false, 'moving→not still');
assert.strictEqual(U.isStill({autoSpin:false, dTarget:0.001, msSinceTilt:200}), false, 'recent tilt→not still');
assert.strictEqual(U.isStill({autoSpin:false, dTarget:0.001, msSinceTilt:600}), true, 'settled→still');
console.log('PASS: pt-util 10 assertions');
```

- [ ] **Step 2: 実行して失敗を確認**

Run: `node /private/tmp/.../scratchpad/test-pt-util.js`
Expected: FAIL（`Cannot read properties of undefined` — ファイル未作成）

- [ ] **Step 3: 最小実装を書く**

```js
// website/gems/gem3d-pt-util.js
/* Gyu パストレーサ・ハイブリッドの純粋関数（three非依存・window露出でテスト容易に）。
   対応判定と「静止」判定を描画から切り離す。 */
(function (root) {
  function canPathtrace(e) {
    if (!e) return false;
    return !!e.webgl2 && !e.reduce && !e.coarse && !e.lowCores && !!e.floatBuf;
  }
  function isStill(s) {
    if (!s || s.autoSpin) return false;
    return s.dTarget < 0.002 && s.msSinceTilt > 500;
  }
  root.NoctaGemPTUtil = { canPathtrace: canPathtrace, isStill: isStill };
})(typeof window !== 'undefined' ? window : this);
```

- [ ] **Step 4: 実行して成功を確認**

Run: `node /private/tmp/.../scratchpad/test-pt-util.js`
Expected: `PASS: pt-util 10 assertions`

- [ ] **Step 5: Commit**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/gems/gem3d-pt-util.js
git commit -m "feat(gems): パストレーサ対応判定・静止判定の純粋関数を追加"
```

---

### Task 2: パストレーサ・ラッパ `gem3d-pathtracer.js`

`WebGLPathTracer` をGyuの都合に合わせて包む。gem3d.js から遅延importされるESMモジュール。

**Files:**
- Create: `website/gems/gem3d-pathtracer.js`（ESM）
- Test: `/private/tmp/.../scratchpad/verify-pt-module.js`（Playwright・swiftshader）

**Interfaces:**
- Consumes: three（importmap）、three-gpu-pathtracer（`WebGLPathTracer`, `GradientEquirectTexture`）、Task 0 で確定した import URL/API。
- Produces: default export でない名前付き export `createDeveloper(opts) -> developer`
  - `opts = { renderer, scene, camera, maxSamples }`（renderer/scene/camera は gem3d.js の既存インスタンスを共有）
  - `developer.reset()`: 累積をゼロに戻す（カメラ・シーン変更後に呼ぶ）
  - `developer.renderSample() -> number`: 1サンプル進め、進捗 0..1（=samples/maxSamples）を返す
  - `developer.getCanvas() -> HTMLCanvasElement`: PT出力のcanvas（gem3d.jsがオーバレイに使う）
  - `developer.dispose()`: PT関連GPUリソースを解放
  - モジュールは `window` を汚さない（純粋ESM）

- [ ] **Step 1: Playwright統合テストを書く（失敗する）**

`verify-pt-module.js`: gemsのローカルサーバを立て、テスト専用の小さなHTMLを注入する代わりに、
scratchpad に `pt-module-harness.html` を作り、そこから `import('/gems/gem3d-pathtracer.js?v=1')` して
`createDeveloper` を既存rendererで動かし、`renderSample()` を30回呼んで進捗が単調増加し、
`getCanvas()` が非空、コンソールエラー0、`dispose()` 後に例外が出ないことを確認する。
（ハーネスHTMLは importmap を持ち、簡単なシーン1個を渡す。）
Run: `cd .../scratchpad && node verify-pt-module.js`
Expected: FAIL（モジュール未実装）

- [ ] **Step 2: モジュールを実装する**

```js
// website/gems/gem3d-pathtracer.js
/**
 * NOCTA Gyu — 3D宝石パストレーサ（静止時の「現像」）
 * WebGLPathTracer(three-gpu-pathtracer) を Gyu 用に包む。gem3d.js から遅延importされる。
 * 既存の renderer/scene/camera を共有し、累積収束した宝石の静止画を別canvasに描く。
 */
import { WebGLPathTracer } from 'three-gpu-pathtracer';

export function createDeveloper(opts) {
  var renderer = opts.renderer;
  var scene = opts.scene;
  var camera = opts.camera;
  var maxSamples = opts.maxSamples || 160;

  var pt = new WebGLPathTracer(renderer);
  pt.tiles.set(2, 2);            /* 1フレームを分割してGPU占有時間を抑える */
  pt.renderScale = 1.0;
  pt.setScene(scene, camera);

  var samples = 0;

  return {
    reset: function () { pt.reset(); samples = 0; },
    renderSample: function () {
      if (samples < maxSamples) { pt.renderSample(); samples++; }
      return Math.min(1, samples / maxSamples);
    },
    getCanvas: function () { return renderer.domElement; },
    dispose: function () {
      try { if (pt.dispose) pt.dispose(); } catch (e) {}
    }
  };
}
```

※ Task 0 の結論で `WebGLPathTracer` が `renderer.domElement` に直接描くのか専用ターゲットかを確定し、
`getCanvas` の返す対象を合わせる（PTが既存rendererのcanvasを乗っ取る場合は、PBRとcanvasを分ける必要がある→Step 3で対処）。

- [ ] **Step 3: PBRとPTのcanvas分離を確定する**

`WebGLPathTracer` は渡した renderer の canvas に描く。PBRも同じ renderer を使うと競合するため、
**PT専用の別 WebGLRenderer + 別canvas** を作る方針に固定する（scene/cameraは共有可）。
実装を次のように直す:

```js
export function createDeveloper(opts) {
  var srcRenderer = opts.renderer;      /* サイズ参照用 */
  var scene = opts.scene, camera = opts.camera;
  var maxSamples = opts.maxSamples || 160;
  var size = new (opts.THREE.Vector2)(); srcRenderer.getSize(size);

  var ptRenderer = new opts.THREE.WebGLRenderer({ antialias: false, alpha: true });
  ptRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  ptRenderer.setSize(size.x, size.y);

  var pt = new WebGLPathTracer(ptRenderer);
  pt.tiles.set(2, 2);
  pt.setScene(scene, camera);
  var samples = 0;
  return {
    reset: function () { pt.reset(); samples = 0; },
    renderSample: function () { if (samples < maxSamples) { pt.renderSample(); samples++; } return Math.min(1, samples / maxSamples); },
    getCanvas: function () { return ptRenderer.domElement; },
    dispose: function () { try { if (pt.dispose) pt.dispose(); } catch (e) {} try { ptRenderer.dispose(); if (ptRenderer.forceContextLoss) ptRenderer.forceContextLoss(); } catch (e) {} }
  };
}
```

（`opts.THREE` で three名前空間を受け取り、モジュール側の重複import回避。gem3d.js が渡す。）

- [ ] **Step 4: テストを実行して成功を確認**

Run: `cd .../scratchpad && node verify-pt-module.js`
Expected: `PASS | 進捗単調増加 | canvas非空 | エラー0 | dispose OK`
（swiftshaderでPTが走らない場合は Task 0 の結論に従い、このテストを「モジュールが読めてcreateDeveloperが例外を投げない／renderSampleがnumberを返す」までに緩め、実描画は実GPU目視とする。log でその旨を明示。）

- [ ] **Step 5: Commit**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/gems/gem3d-pathtracer.js
git commit -m "feat(gems): パストレーサ・ラッパ gem3d-pathtracer.js を追加"
```

---

### Task 3: importmap 追加とモジュール到達性

three-mesh-bvh / three-gpu-pathtracer を本番の importmap に載せ、gem3d-pathtracer.js が解決できるようにする。

**Files:**
- Modify: `website/gems/index.html:17-24`（importmap）
- Test: `/private/tmp/.../scratchpad/verify-importmap.js`（Playwright）

**Interfaces:**
- Consumes: Task 0 のバージョン。
- Produces: 本番ページで `import('three-gpu-pathtracer')` が解決可能な状態。

- [ ] **Step 1: テストを書く（失敗する）**

`verify-importmap.js`: `/gems/` を開き、`page.evaluate` で `await import('three-gpu-pathtracer')` を試み、
モジュールに `WebGLPathTracer` が含まれることを確認。
Run: `node verify-importmap.js`
Expected: FAIL（importmapに未登録で解決不可）

- [ ] **Step 2: importmap を更新**

```html
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/",
    "three-mesh-bvh": "https://cdn.jsdelivr.net/npm/three-mesh-bvh@<VER>/build/index.module.js",
    "three-gpu-pathtracer": "https://cdn.jsdelivr.net/npm/three-gpu-pathtracer@<VER>/build/index.module.js"
  }
}
</script>
```

- [ ] **Step 3: テストを実行して成功を確認**

Run: `node verify-importmap.js`
Expected: `PASS | three-gpu-pathtracer 解決OK | WebGLPathTracer あり`

- [ ] **Step 4: Commit**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/gems/index.html
git commit -m "feat(gems): importmapにthree-mesh-bvh/three-gpu-pathtracerを追加"
```

---

### Task 4: gem3d.js に状態機械とクロスフェードを統合

「動=PBR / 静=PT現像」の切替を gem3d.js のループに組み込む。gem3d-pt-util.js と gem3d-pathtracer.js を使う。

**Files:**
- Modify: `website/gems/gem3d.js`（loop/setTilt/mount/detach。おおよそ 625-709 行帯）
- Modify: `website/gems/index.html`（gem3d-pt-util.js を通常scriptで読み込む1行追加、`?v` 更新）
- Test: `/private/tmp/.../scratchpad/verify-gem3d-hybrid.js`（Playwright）

**Interfaces:**
- Consumes: `window.NoctaGemPTUtil.canPathtrace/isStill`（Task 1）、`createDeveloper`（Task 2・動的import）。
- Produces: mount の返り値に診断用 `getRenderMode() -> 'pbr'|'developing'|'still'` を追加（テストが状態を観測するため）。

- [ ] **Step 1: 失敗する統合テストを書く**

`verify-gem3d-hybrid.js`: `/gems/` でダイヤを開き、
(a) 初期は autospin 中で `getRenderMode()==='pbr'`、
(b) 手を触れず数秒待つと autospin が止まり `developing`→`still` に遷移（PTcanvasが可視・opacity>0.9）、
(c) 傾け入力(setTilt)を送ると即 `pbr` に戻りPTcanvasが非表示、
(d) 通しでコンソールエラー0。
非対応環境（後述の強制フラグ `?nopt=1`）では常に `pbr` のまま。
Run: `node verify-gem3d-hybrid.js`
Expected: FAIL（getRenderMode 未実装）

- [ ] **Step 2: settle 追跡とモード状態を mount に追加**

`setTilt` に「最後に傾いた時刻」を記録し、autospin を一定時間で自動停止させ、loop で isStill を評価する。

```js
// mount() 内、既存の targetRX/curRX 群の近く
var lastTiltMs = 0;                 /* 直近setTilt時刻 */
var spinUntilMs = (typeof performance!=='undefined'?performance.now():Date.now()) + 5000; /* autospin継続 */
var renderMode = 'pbr';             /* 'pbr'|'developing'|'still' */
var developer = null, devReq = false, ptCanvas = null, devProgress = 0;

function nowMs(){ return (typeof performance!=='undefined'?performance.now():Date.now()); }
```

`setTilt` を拡張:

```js
function setTilt(nx, ny) {
  targetRY = nx * 0.9; targetRX = ny * 0.7;
  autoSpin = false;
  lastTiltMs = nowMs();
  if (renderMode !== 'pbr') switchToPbr();  /* 現像中でも即PBR復帰 */
}
```

- [ ] **Step 3: PBR/PT切替関数と対応判定を実装**

```js
var ptEnv = {
  webgl2: (renderer.capabilities && renderer.capabilities.isWebGL2) || false,
  reduce: reduce,
  coarse: (typeof window.matchMedia==='function' && window.matchMedia('(pointer: coarse)').matches),
  lowCores: lowCores,
  floatBuf: !!(renderer.extensions && renderer.extensions.get('EXT_color_buffer_float'))
};
var ptAllowed = !!(window.NoctaGemPTUtil && window.NoctaGemPTUtil.canPathtrace(ptEnv)) && !opts.noPt;

function switchToPbr() {
  renderMode = 'pbr';
  if (ptCanvas) ptCanvas.style.opacity = '0';
  if (developer) developer.reset();
  devProgress = 0;
}

function beginDevelop() {
  if (!ptAllowed) return;
  renderMode = 'developing';
  if (developer) { developer.reset(); return; }
  if (devReq) return; devReq = true;
  import('./gem3d-pathtracer.js?v=1').then(function (mod) {
    if (!running || renderMode !== 'developing') return;
    developer = mod.createDeveloper({ THREE: THREE, renderer: renderer, scene: scene, camera: camera, maxSamples: 160 });
    ptCanvas = developer.getCanvas();
    ptCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity .4s ease;pointer-events:none;';
    container.appendChild(ptCanvas);
  }).catch(function () { ptAllowed = false; renderMode = 'pbr'; });
}
```

- [ ] **Step 4: loop に状態遷移と現像を組み込む**

```js
function loop() {
  if (!running) return;
  rafId = requestAnimationFrame(loop);
  var dt = clock.getDelta();
  if (autoSpin && nowMs() > spinUntilMs) autoSpin = false;   /* 一定時間でautospin停止→静止へ */
  curRX += (targetRX - curRX) * 0.09;
  curRY += (targetRY - curRY) * 0.09;
  if (mesh) {
    mesh.rotation.x = baseTiltX + curRX;
    mesh.rotation.y = curRY + (autoSpin ? clock.elapsedTime * 0.25 : 0);
  }

  var dTarget = Math.abs(targetRX-curRX) + Math.abs(targetRY-curRY);
  var still = window.NoctaGemPTUtil && window.NoctaGemPTUtil.isStill({ autoSpin: autoSpin, dTarget: dTarget, msSinceTilt: nowMs()-lastTiltMs });

  if (ptAllowed && still && renderMode === 'pbr') beginDevelop();

  if (renderMode === 'developing' && developer) {
    /* PT側はカメラ固定前提。PBRのmesh回転をPTシーンにも反映するためカメラ・meshは共有済み。
       静止した瞬間の姿勢で累積するので、develop開始時に一度reset済み */
    devProgress = developer.renderSample();
    if (ptCanvas) ptCanvas.style.opacity = String(Math.min(1, devProgress * 3));  /* 序盤で素早く出す */
    if (devProgress >= 1) renderMode = 'still';
    /* PBRも裏で回してよいが、静止中は負荷削減のためPBR描画はスキップしてPTに委ねる */
    return;
  }

  if (composer) composer.render();
  else renderer.render(scene, camera);
}
```

※ PTは mesh の現在の world 変換を読む。develop 中に mesh 回転は止まっている（still判定済み）ので像はブレない。

- [ ] **Step 5: detach と return を更新**

```js
// detach() 内、renderer.dispose() の前に
if (developer) { try { developer.dispose(); } catch(e){} developer = null; }
if (ptCanvas && ptCanvas.parentNode) ptCanvas.parentNode.removeChild(ptCanvas);
```

```js
return {
  setTilt: setTilt, resize: resize, isReady: function(){return true;},
  getRenderMode: function(){ return renderMode; },   /* テスト・診断用 */
  detach: /* 既存 + 上記PT解放 */
};
```

- [ ] **Step 6: index.html に pt-util を読み込む**

`gems-data.js` の script 近く（`gem3d.js` は動的importなので pt-util は通常scriptで先に読む）:

```html
<script src="./gem3d-pt-util.js?v=1"></script>
```

そして gem3d のキャッシュバスターを上げる（`gem3d.js?v=4`）。

- [ ] **Step 7: テストを実行して成功を確認**

Run: `node verify-gem3d-hybrid.js`
Expected: `PASS | 初期pbr | 静止でdeveloping→still | 傾けで即pbr | エラー0`（swiftshaderでPT不走なら、対応判定を`?nopt`で切りPBR維持を緑にし、実GPU目視へ）

- [ ] **Step 8: Commit**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/gems/gem3d.js website/gems/index.html
git commit -m "feat(gems): 静止時パストレース現像のハイブリッド状態機械を統合"
```

---

### Task 5: 環境光を「現像」向けに強化（emissiveライトカードをPTシーンへ）

パストレーサが宝石内部の干渉模様を出すには、環境に明暗の複雑さが要る。既存ショーケースの
emissiveライトカードは既にsceneに入っているが、PBR用の envMap（PMREM）としてのみ効いている。
PTシーンでそれらが実光源として働くことを保証し、必要なら数を増やす。

**Files:**
- Modify: `website/gems/gem3d.js`（`buildShowcaseScene`/mount のライト配置。~280-341 行帯）
- Test: `/private/tmp/.../scratchpad/verify-pt-shapes.js` 再利用 + スクショ比較

**Interfaces:**
- Consumes: 既存 `buildShowcaseScene()`。
- Produces: mount の `scene` に emissive ライトカードが実体として存在し、PTがそれを光源として拾える状態（PBRの見た目は不変に保つ）。

- [ ] **Step 1: 現状の光源がPTシーンにあるか確認するテスト**

`page.evaluate` で mount 後の scene を辿り、emissive（MeshBasicMaterial かつ toneMapped:false）メッシュが
3つ以上 scene 直下にあることを確認する簡易チェックを verify-gem3d-hybrid.js に追記。
Run: `node verify-gem3d-hybrid.js`
Expected: 既存実装では envScene は PMREM 生成専用で scene に add されていない可能性 → FAIL。

- [ ] **Step 2: ライトカードを描画シーンにも配置**

`buildShowcaseScene()` の生成物は PMREM 用（envScene）。これとは別に、PTが拾える実光源として
主要なライトカード数枚を `scene` にも add する（`toneMapped:false`・PBRの見た目を壊さないよう
`envMapIntensity` との二重加算に注意し、PBR時はライトカードを `visible=false`、PT develop開始時に `visible=true`、
PBR復帰で `visible=false` に切替）。

```js
// mount内、envScene構築の後
var ptLights = buildShowcaseScene();     /* PT用に実体のライト群を別途生成 */
ptLights.visible = false;                /* PBR時は見せない（PMREMで足りるため） */
scene.add(ptLights);
// beginDevelop時: ptLights.visible = true;  switchToPbr時: ptLights.visible = false;
```

（`ptLights` は Group。develop/pbr 切替で visible をトグル。detach で traverse dispose。）

- [ ] **Step 3: テストを実行して成功を確認**

Run: `node verify-gem3d-hybrid.js`
Expected: PASS（emissive群がscene配下に存在、PBR時visible=false / develop時true）。

- [ ] **Step 4: 実GPUで現像スクショ目視（手動確認ポイント）**

Run: `node verify-pt-develop-shot.js`（新規・PTを数百ms走らせスクショ）
Expected: 現像後のダイヤに内部の複雑な模様・ファイアが出る（Phase 3 PBRとの差分をスクショ2枚並べて確認）。
swiftshaderで不可なら CEO のマシンでのライブ目視に委ねる旨を log 明記。

- [ ] **Step 5: Commit**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/gems/gem3d.js
git commit -m "feat(gems): 現像用にemissiveライトカードをPTシーンへ実体配置"
```

---

### Task 6: 先行改善（透過解像度・石別thickness/attenuation）

PT非対応端末でもPBRの質を底上げする、どの道効く改善。

**Files:**
- Modify: `website/gems/gem3d.js`（renderer設定 ~446-452 行帯、makeMaterial ~378-400 行帯）
- Test: 既存 `verify-gem3d.js` + `verify-p3-shapes.js` 全緑維持

**Interfaces:**
- Consumes: gemData.hardness（既存）。
- Produces: 見た目の底上げのみ（APIは不変）。

- [ ] **Step 1: 透過解像度スケールを上げる**

```js
// renderer生成直後（setSizeの近く）
if ('transmissionResolutionScale' in renderer) renderer.transmissionResolutionScale = 1.0; /* 既定より下げない・必要なら1.0維持 */
```
（three 0.180 の既定値を確認し、下がっていれば1.0へ。屈折像のシャープさに効く。）

- [ ] **Step 2: 石別 thickness / attenuationDistance**

```js
// makeMaterial transparent プリセット内
var depth = 1.6 + (gemData.dispersion ? 0 : 0);          /* 基本 */
mat.thickness = 1.8;                                     /* 既存維持 */
/* 濃色石ほど吸収を強め、淡色石は光を通す（Beer-Lambert的な個体差） */
var lum = (color.r + color.g + color.b) / 3;
mat.attenuationDistance = 1.4 + lum * 2.0;               /* 暗い石=短い=濃い / 明るい石=長い=淡い */
```

- [ ] **Step 3: 既存スイートで回帰確認**

Run: `cd .../scratchpad && node verify-gem3d.js && node verify-p3-shapes.js`
Expected: `11/11` と `13/13` 維持、スクショに破綻なし。

- [ ] **Step 4: Commit**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/gems/gem3d.js
git commit -m "feat(gems): 透過解像度と石別thickness/attenuationでPBRを底上げ"
```

---

### Task 7: 総合検証・Codex・公開・ドキュメント

**Files:**
- Modify: `handoff.md`（末尾追記）、`website/DESIGN-NOTES.md`（§7 追記）
- Test: 全 Playwright スイート

- [ ] **Step 1: 全スイート実行**

Run: `cd .../scratchpad && for f in verify-gem3d.js verify-p3-shapes.js verify-gem3d-hybrid.js verify-kazasu.js verify-zukan.js verify-iro.js verify-fude.js; do node "$f"; done`
Expected: 全て緑（gem3d 11 / shapes 13 / hybrid / kazasu 12 / zukan 36 / iro 19 / fude 23）。

- [ ] **Step 2: Codex レビュー2周（リポジトリ内で実行）**

Run: `cd /Users/fghmacbook013/NOCTA/project_NOCTA && ~/.claude/scripts/codex-review.sh diff`
Critical は必ず修正。gems以外の別セッション変更（drafts/article-notes削除・silver-sit.png等）は
本コミットに含めない（website/gems と docs のみ add）。2周目でCritical 0を確認。

- [ ] **Step 3: キャッシュバスター最終確認**

`gem3d.js?v=4` / `gem3d-pt-util.js?v=1` / `gem3d-pathtracer.js?v=1` が index.html と動的import文で整合しているか grep 確認。
Run: `grep -n "?v=" website/gems/index.html website/gems/gem3d.js`

- [ ] **Step 4: コミット・push**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/gems/ docs/superpowers/
git commit -m "feat(gems): Gyu 3D宝石 パストレース・ハイブリッド（静止時現像）"
git push origin main
```

- [ ] **Step 5: デプロイ監視・失敗時再実行・ライブ確認**

GitHub Actions が一時失敗することがある（`Deployment failed, try again later.`）。
`gh run list` で最新 run を監視し、failure なら `gh run rerun <id>`。success 後に
`curl` で `gem3d.js?v=4` と importmap の three-gpu-pathtracer が本番反映を確認。

- [ ] **Step 6: handoff / DESIGN-NOTES 更新（R-06準拠1行 + §7追記）**

handoff.md 末尾に1行、DESIGN-NOTES §7 の Gyu 項に「静止時パストレース現像（ハイブリッド）」を追記。

- [ ] **Step 7: G-06 デブリーフ**

盲点（PT非対応端末の体験・現像待ちUX・GPU負荷）・判断・次の一手（Ichi咲かせる / 全36石展開 / モバイル向けプリレンダー軸3）・確認質問・次回依頼テンプレを提示。

---

## Self-Review 結果

**Spec coverage:** スペックの各項目 → タスク対応:
- ハイブリッド状態機械 → Task 1, 4 ✓
- パストレーサ導入 → Task 0（スパイク）, 2 ✓
- importmap/CDN → Task 3 ✓
- 環境光（emissive流用）→ Task 5 ✓
- 対応判定・フォールバック → Task 1, 4 ✓
- 先行改善（透過解像度・thickness）→ Task 6 ✓
- 検証・Codex・公開・ドキュメント → Task 7 ✓
- 非目標（プリレンダー・HDRIバイナリ・全36石）→ 明記しスコープ外 ✓

**Placeholder scan:** `<VER>` は Task 0 の成果物で確定する明示プレースホルダ（スパイク前は確定不能なため意図的）。それ以外の TODO/TBD なし。

**Type consistency:** `createDeveloper({THREE,renderer,scene,camera,maxSamples})` → `{reset,renderSample,getCanvas,dispose}` は Task 2 と Task 4 で一致。`canPathtrace(env)`/`isStill(s)` の引数キーは Task 1 定義と Task 4 呼び出しで一致。`getRenderMode()` の値 `'pbr'|'developing'|'still'` は Task 4 内で一貫。

## リスク要約（実装者向け）

1. **Task 0 が最重要ゲート**。CDN互換・API形状・swiftshader可否が全てここで決まる。ここを飛ばさない。
2. PTは**別renderer/別canvas**で描き、PBRのcanvasと競合させない（Task 2 Step 3で確定）。
3. 傾け入力への**即応**（PT破棄→PBR）を最優先。現像は「おまけの贅沢」であり操作を止めてはならない。
4. detach での**PT GPUリソース解放**を怠るとライトボックス開閉でGPUメモリが枯渇する。
