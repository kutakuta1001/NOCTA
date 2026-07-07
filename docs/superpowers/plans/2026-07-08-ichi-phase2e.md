# Ichi Phase 2e「草花の標本 — 自生と標本化」Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development。実装SA=Sonnet、レビュー=Codex（CEO指定・ブランチ差分を各段2周）。Steps は checkbox（`- [ ]`）。

**Goal:** 花に加え草花4種（草・つる/シダ/レースフラワー・種穂/小花の群れ）を手続き生成で生やし、庭が自生（充実で停止）し、押すと暖かい生成り地の植物標本ボードに自動構成される。今のコンセプト（引き算・遅さ・一回性・ゴールなし・無音）は不変。

**Architecture:** hana.js の延長。庭の要素に `kind` を持たせ、drawEntity(ctx,o) が o.kind で drawFlower（既存不変）/ drawSprig/drawFern/drawUmbel/drawFloret に分岐。spawn になぞり時の花/緑ミックス、ambient auto-growth スケジューラ（nextSproutT・restingCount 停止）、風/sway/種パーティクルの kind 対応。2e-2 で press() を標本ボード自動構成に置換。index.html は cache-buster のみ。

**Tech Stack:** Vanilla JS(IIFE)・Canvas 2D・Web Audio API・Playwright。ビルドなし・相対パス・website配下のみ。

## Global Constraints
- ビルドなし・IIFE・相対パス・website配下のみ。`git add` はファイル明示（`-A`/`.` 禁止）。website/flora/hana.js と website/flora/index.html のみが対象（テストは scratchpad・git管理外）。
- コミット trailer: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`。
- 既存不変: drawFlower（'flower'経路）・既存4→7形・shed（散り）・leaves（葉）・大輪（spawnGrand r82-104）・風（16-34秒・sway・onWind音）・なぞり音onSpawn・farewell・seed（各花モード）・reduce時は風/散り/自生なし。既存 press の透明前提。
- 既存回帰スイート維持: util12/forms14/seed13/engine2 9/press7/mount2 10/perflower12/phase2b19/season11/oto14/kaze10/taika14/hizuke7/kyou12/integration2 15/leaf13/wind2 17 ＋ iro19/fude23/zukan36。
- 総数上限は既存 MAX_FLOWERS=400 を全 kind 合算で踏襲。自生待機は setTimeout（rAFを起こさない）。reduce時 needLoop=false 維持。
- 既存ヘルパ流用: `makeRng(seed)` `easeOutCubic(t)` `hexToRgb` `rgba(rgbObj,alpha)` `mixRgb(a,b,t)` `petal(ctx,len,wid)`（しずく形・先端は -y 方向）。庭の地色は既存変数 `ground`（rgbオブジェクト）。パレットは `palette`（`.accent` 等）。
- キャッシュバスター: 2e-2 完了時に `hana.js?v=6` → `hana.js?v=7`。
- scratchpad実パス: `/private/tmp/claude-501/-Users-fghmacbook013-NOCTA/d33a3808-dccb-490e-8426-ee5196f85bf3/scratchpad`。Playwrightはwebsite配信+setContent+絶対URL（既存 verify-hana-*.js 流用）。node --check・node実行はリポジトリ内で（シェルcwdは /Users/fghmacbook013/NOCTA にリセットされる）。
- Codexレビュー: リポジトリ内 `~/.claude/scripts/codex-review.sh custom "<prompt>"` で `git diff main...HEAD` を対象（各段=T5-T6/T? で2周）。

---

## 段階 2e-1: 草花4種と生える・散る・風

### Task 1: kind基盤 + drawEntity分岐 + drawSprig（草・つる）

**Files:** Modify `website/flora/hana.js`／Test `<scratchpad>/verify-hana-phase2e.js`

**Interfaces:**
- Produces: `drawEntity(ctx, o)` — o.kind が undefined/'flower' なら drawFlower(ctx,o)、それ以外は kind別描画へ分岐。redraw の描画呼び出しを drawFlower→drawEntity に置換（呼び出し規約は drawFlower と同一: ctx は既に要素中心へ translate＋sway 済み・各描画関数が内部で ctx.rotate(o.rot) する）。
- Produces: `drawSprig(ctx, o)` — 草・つる。o は {rng, r, rot, bloom, palette} を持つ。

- [ ] **Step 1: 失敗テスト** `verify-hana-phase2e.js` を新規作成（既存 verify-hana-leaf.js のハーネス＝website配信+setContent+絶対URL+canvasにdrawを流す方式を流用）:
  (a) 空 canvas に対し drawEntity(ctx,{kind:'sprig', rng:makeRng(1), r:60, rot:0, bloom:1, palette:<春>}) を呼ぶと、セージ緑近傍（#6E7A55±40）のピクセルが 50px 以上出る。
  (b) drawEntity(ctx,{kind:'flower',...既存flower形...}) と drawFlower(ctx,同じo) が同一結果（緑基盤の差分なし=drawEntity は flower を素通し）。kind 未指定でも flower 経路。
  (c) drawEntity(ctx,{kind:'sprig',bloom:0,...}) は bloom=0 で描画面積ほぼ0（開花前は生えていない）。
  (d) エラー0。Run→FAIL（drawEntity/drawSprig 未定義）。

- [ ] **Step 2: drawEntity 追加＋redraw配線**。drawFlower の直後に:
```js
    function drawEntity(ctx, o) {
      var k = o.kind;
      if (!k || k === 'flower') { drawFlower(ctx, o); return; }
      if (k === 'sprig')  { drawSprig(ctx, o);  return; }
      if (k === 'fern')   { drawFern(ctx, o);   return; }
      if (k === 'umbel')  { drawUmbel(ctx, o);  return; }
      if (k === 'floret') { drawFloret(ctx, o); return; }
      drawFlower(ctx, o);   /* 未知kindは花にフォールバック */
    }
```
redraw 内で各 flower を描く箇所の `drawFlower(ctx, f)` を `drawEntity(ctx, f)` に置換（sway/translate ラッパはそのまま）。press() 内の drawFlower 呼びも drawEntity に置換（2e-2 まで press は現状レイアウトだが緑も写るように）。
（Task 2 で drawFern/drawUmbel/drawFloret を定義するまで、それらの kind は spawn で発生しないので drawEntity の当該分岐は未使用。定義前に呼ばれないことを Task 3 の spawn で保証する。）

- [ ] **Step 3: drawSprig 実装**（reference・Step4のスクショで視覚調整可）。花の描画群の近くに:
```js
    var GREEN = { r: 0x6E, g: 0x7A, b: 0x55 };   /* セージグリーン（葉と共通） */
    function greenGrad(ctx, len, rng) {
      var g = ctx.createLinearGradient(0, 0, 0, -len);
      g.addColorStop(0, rgba(GREEN, 0.82));
      g.addColorStop(1, rgba(mixRgb(GREEN, ground, 0.5), 0.42));
      return g;
    }
    function drawSprig(ctx, o) {
      var rng = o.rng, open = easeOutCubic(Math.min(1, o.bloom || 0)), r = o.r;
      if (open < 0.02) return;
      ctx.rotate(o.rot || 0);
      var segs = 5 + Math.floor(rng() * 3);
      var segLen = (r * 1.7 / segs) * open;
      var curve = (rng() - 0.5) * 0.45;
      var ang = -Math.PI / 2 + (rng() - 0.5) * 0.4, px = 0, py = 0;
      var pts = [{ x: 0, y: 0 }];
      for (var s = 0; s < segs; s++) { ang += curve; px += Math.cos(ang) * segLen; py += Math.sin(ang) * segLen; pts.push({ x: px, y: py }); }
      ctx.strokeStyle = rgba(mixRgb(GREEN, ground, 0.15), 0.7);
      ctx.lineWidth = Math.max(0.6, r * 0.045);
      ctx.beginPath(); ctx.moveTo(0, 0);
      for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
      for (var j = 1; j < pts.length; j++) {
        var side = (j % 2 === 0) ? 1 : -1;
        var lang = Math.atan2(pts[j].y - pts[j - 1].y, pts[j].x - pts[j - 1].x) + side * 1.05;
        var ll = r * 0.30 * open * (0.7 + rng() * 0.5);
        ctx.save();
        ctx.translate(pts[j].x, pts[j].y); ctx.rotate(lang - Math.PI / 2);  /* petalは-y向き→枝に沿わせる */
        ctx.fillStyle = greenGrad(ctx, ll, rng);
        petal(ctx, ll, ll * 0.42); ctx.fill();
        ctx.restore();
      }
    }
```

- [ ] **Step 4: テスト成功＋スクショ**。`verify-hana-phase2e.js` PASS。回帰: forms14/press7/engine2 9/leaf13。スクショで草・つるが自然に見えることを確認（不自然なら segLen/curve/葉サイズを調整）。

- [ ] **Step 5: Commit** `git add website/flora/hana.js`（＋テストは管理外）→ `feat(ichi): 草花の基盤(kind分岐drawEntity)＋草・つる(sprig)描画`

---

### Task 2: drawFern + drawUmbel + drawFloret（残り3種）

**Files:** Modify `website/flora/hana.js`／Test `<scratchpad>/verify-hana-phase2e.js`（拡張）

**Interfaces:**
- Produces: `drawFern(ctx,o)` `drawUmbel(ctx,o)` `drawFloret(ctx,o)`（引数規約は drawSprig と同一）。

- [ ] **Step 1: 失敗テスト追加**。verify-hana-phase2e.js に:
  (a) drawEntity(kind:'fern'/'umbel'/'floret', bloom:1) 各々でセージ緑（floretは花色）ピクセルが出る。
  (b) 各 kind とも bloom=0 で描画面積ほぼ0。
  (c) drawUmbel は放射状（中心から複数方向にピクセルが広がる＝上下左右いずれにも緑）。
  (d) drawFloret は palette.accent 近傍の色（小花＝花色）が出る（緑だけでない）。
  Run→該当FAIL。

- [ ] **Step 2: drawFern 実装**（羽状フロンド）:
```js
    function drawFern(ctx, o) {
      var rng = o.rng, open = easeOutCubic(Math.min(1, o.bloom || 0)), r = o.r;
      if (open < 0.02) return;
      ctx.rotate(o.rot || 0);
      var len = r * 1.8 * open;
      ctx.strokeStyle = rgba(mixRgb(GREEN, ground, 0.1), 0.7);
      ctx.lineWidth = Math.max(0.6, r * 0.04);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -len); ctx.stroke();   /* 中軸rachis */
      var pairs = 6 + Math.floor(rng() * 3);
      for (var p = 1; p <= pairs; p++) {
        var t = p / (pairs + 1);
        var y = -len * t;
        var pl = r * 0.5 * (1 - t * 0.7) * open;   /* 先端ほど小さい小葉 */
        for (var sd = -1; sd <= 1; sd += 2) {
          ctx.save();
          ctx.translate(0, y);
          ctx.rotate(sd * (1.15) - Math.PI / 2);   /* 左右へ張り出す */
          ctx.fillStyle = greenGrad(ctx, pl, rng);
          petal(ctx, pl, pl * 0.3); ctx.fill();
          ctx.restore();
        }
      }
    }
```

- [ ] **Step 3: drawUmbel 実装**（レースフラワー・放射）:
```js
    function drawUmbel(ctx, o) {
      var rng = o.rng, open = easeOutCubic(Math.min(1, o.bloom || 0)), r = o.r;
      if (open < 0.02) return;
      ctx.rotate(o.rot || 0);
      var rays = 9 + Math.floor(rng() * 6);
      var rad = r * 1.1 * open;
      var stem = rgba(mixRgb(GREEN, ground, 0.2), 0.5);
      var tipCol = rgba(mixRgb(GREEN, { r: 0xF0, g: 0xEA, b: 0xD8 }, 0.55), 0.8);  /* 生成り寄りの小花 */
      ctx.strokeStyle = stem; ctx.lineWidth = Math.max(0.4, r * 0.02);
      for (var i = 0; i < rays; i++) {
        var a = -Math.PI / 2 + (i / rays) * Math.PI * 2 * 0.5 - Math.PI * 0.25;  /* 半球状に広げる */
        a += (rng() - 0.5) * 0.25;
        var rr = rad * (0.7 + rng() * 0.4);
        var ex = Math.cos(a) * rr, ey = Math.sin(a) * rr;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.fillStyle = tipCol;
        ctx.beginPath(); ctx.arc(ex, ey, Math.max(0.6, r * 0.05), 0, Math.PI * 2); ctx.fill();
      }
    }
```

- [ ] **Step 4: drawFloret 実装**（小花の群れ・花色）:
```js
    function drawFloret(ctx, o) {
      var rng = o.rng, open = easeOutCubic(Math.min(1, o.bloom || 0)), r = o.r;
      if (open < 0.02) return;
      ctx.rotate(o.rot || 0);
      var acc = hexToRgb(o.palette.accent);
      var n = 3 + Math.floor(rng() * 4);
      for (var f = 0; f < n; f++) {
        var fx = (rng() - 0.5) * r * 1.4, fy = (rng() - 0.5) * r * 1.4;
        var fr = r * 0.22 * open * (0.7 + rng() * 0.5);
        ctx.save(); ctx.translate(fx, fy);
        var petals = 5;
        ctx.fillStyle = rgba(mixRgb(acc, { r: 0xF0, g: 0xEA, b: 0xD8 }, 0.25), 0.85);
        for (var pp = 0; pp < petals; pp++) {
          ctx.save(); ctx.rotate((pp / petals) * Math.PI * 2);
          petal(ctx, fr, fr * 0.5); ctx.fill(); ctx.restore();
        }
        ctx.fillStyle = rgba(mixRgb(acc, { r: 0xC4, g: 0x94, b: 0x2A }, 0.4), 0.9);  /* 芯 */
        ctx.beginPath(); ctx.arc(0, 0, fr * 0.28, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }
```

- [ ] **Step 5: テスト成功＋スクショ**。phase2e 全 PASS。回帰: forms14/leaf13/press7。スクショで4種が自然に見えること（floretは花色・umbelは繊細・fernは羽状）を確認。

- [ ] **Step 6: Commit** `git add website/flora/hana.js` → `feat(ichi): シダ/レースフラワー/小花の群れ(fern/umbel/floret)描画を追加`

---

### Task 3: なぞりミックス生成 + 自生（restingCount停止）

**Files:** Modify `website/flora/hana.js`／Test `<scratchpad>/verify-hana-phase2e.js`（拡張）

**Interfaces:**
- Consumes: 既存 spawn(x,y,speed)・createGarden の state（flowers[]・now()・reduce・farewelling）・MAX_FLOWERS。
- Produces: spawn が kind を選ぶ（花主役・緑約35%）。ambient scheduler（nextSproutT・GROW_INTERVAL・RESTING_COUNT）。テスト用 `opts.__fastGrow`（自生間隔短縮）＋getter `entityCount()`（flowers.length）。

- [ ] **Step 1: 失敗テスト追加**:
  (a) なぞりミックス: reduce=false で 40回 spawn すると、flowers 配列に kind==='flower' と kind!=='flower'（緑）が**両方**存在し、花が過半（flower >= 緑）。
  (b) 自生: `__fastGrow` 有効で mount し時間を進める（既存の時間送り手法＝rAF/フェイククロック）と entityCount が増加し、**RESTING_COUNT 付近で頭打ち**（それ以上時間を進めても大きく増えない・無限増殖しない）。自生で増える kind は緑/floret 優先（flowerだけにならない）。
  (c) reduce=true では自生が発生しない（時間を進めても entityCount 増えない）。
  (d) farewelling 中は自生しない。
  Run→FAIL。

- [ ] **Step 2: spawn に kind 選択**。spawn(x,y,speed) 内の flower 生成時、kind を決める:
```js
      /* 花が主役・約35%を緑に。速いなぞり(speed大)は軽い緑(sprig/umbel)、遅いは花/シダ/floret寄り */
      var kind = 'flower';
      var gr = rng();
      if (gr < 0.35) {
        var fast = (speed || 0) > 0.6;
        if (fast) kind = (rng() < 0.5) ? 'sprig' : 'umbel';
        else      kind = ['sprig', 'fern', 'floret', 'umbel'][Math.floor(rng() * 4)];
      }
      f.kind = kind;
```
（f は既存 flower オブジェクト。kind 以外のフィールドは共用。緑は shed を発生させない＝maxShed=0 に強制するか、shed ロジックが kind!=='flower' をスキップするようにする。散る対象は花のみ・umbelの種は Task 4。）

- [ ] **Step 3: 自生スケジューラ**。createGarden 内、風スケジューラの近くに:
```js
    var RESTING_COUNT = 28;                 /* 自生が止まる充実度（緑含む要素数） */
    var GROW_INTERVAL = fastGrow ? 500 : null;   /* fastGrowは0.5秒毎、本番は下でランダム */
    var nextSproutT = 0; var fastGrow = !!opts.__fastGrow;
    function scheduleSprout(t) { nextSproutT = t + (fastGrow ? 500 : (18000 + Math.random() * 18000)); }
    function ambientSprout() {
      if (reduce || farewelling) return;
      if (flowers.length >= RESTING_COUNT || flowers.length >= MAX_FLOWERS) return;   /* 充実で停止 */
      var rect = canvas.getBoundingClientRect();
      var x = rect.width * (0.1 + Math.random() * 0.8), y = rect.height * (0.15 + Math.random() * 0.75);
      var rng2 = makeRng(seedCounter);
      var kind = ['sprig', 'fern', 'floret', 'umbel'][Math.floor(rng2() * 4)];   /* 自生は緑/小花優先 */
      var f = { x: x, y: y, r: 26 + rng2() * 20, rot: (rng2() - 0.5) * 0.7, kind: kind,
        form: pickForm(rng2), seed: seedCounter++, rng: makeRng(seedCounter),
        palette: currentPalette(), bornT: now(), dur: 2600, depth: 0.2 + rng2() * 0.4,
        vigor: 0.8, bloom: 0, swayPhase: rng2() * Math.PI * 2, swayW: 0.0005 + rng2() * 0.0004,
        holdMs: 999999, shed: 0, nextShedT: 0, maxShed: 0, leaves: [] };
      flowers.push(f); if (flowers.length > MAX_FLOWERS) flowers.shift();
      /* 自生は音を鳴らさない(onSpawnを呼ばない)＝静かに芽吹く */
    }
```
redraw のループ内（風判定の近く）に自生発火を追加（rAF が回っている間に判定）:
```js
      if (!reduce && !farewelling && flowers.length < RESTING_COUNT && t >= nextSproutT) {
        ambientSprout(); scheduleSprout(t);
      }
```
さらに「充実まで達しても rAF を止めない」問題を避けるため、**自生の待機は rAF ではなく setTimeout で起こす**設計とする:
needLoop が false になり rAF が止まっても、`sproutTimer = setTimeout` で次の自生時刻に一度だけ redraw を蹴る（reduce時は張らない）。detach で clearTimeout。
（実装方針: mount/createGarden 開始時に scheduleSprout(now()) と `armSproutTimer()` を呼ぶ。armSproutTimer は次sproutまでの遅延で setTimeout→ambientSprout→needLoop再評価→再arm。RESTING_COUNT 到達中は arm を長め/停止し、要素が減ったら再開。）

- [ ] **Step 4: getter とテスト成功**。createGarden の返り値に `entityCount: function(){ return flowers.length; }` を追加。phase2e 全 PASS。回帰: engine2 9/phase2b19/kaze10/wind2 17/mount2 10/integration2 15/taika14。自生の setTimeout が detach で確実に止まることを mount2 系で確認（リーク・幽霊タイマーなし）。

- [ ] **Step 5: Commit** `git add website/flora/hana.js` → `feat(ichi): なぞりに花+緑ミックス＋庭の自生(充実で停止・setTimeout駆動)`

---

### Task 4: 風/sway/種パーティクルの kind 対応

**Files:** Modify `website/flora/hana.js`／Test `<scratchpad>/verify-hana-phase2e.js`（拡張）

**Interfaces:**
- Consumes: 既存 sway（風項係数0.2）・petals パーティクル配列・wind ブロック。
- Produces: 緑の sway（umbel は軽く大きく揺れる）。umbel の種パーティクル（petals に `color` フィールド追加・緑/生成り）。

- [ ] **Step 1: 失敗テスト追加**:
  (a) 風発火時、kind==='umbel' の要素の sway 振れが flower より大きい（軽い）。
  (b) 風発火時、umbel から種パーティクルが出る（petals に緑系 color を持つ要素が追加される）。既存花の花びらパーティクルは従来色（color 未指定→従来描画）。
  (c) reduce=true では種飛び・sway なし。
  Run→FAIL。

- [ ] **Step 2: sway の kind 係数**。sway 計算箇所で kind により係数を変える:
```js
      var swayK = (f.kind === 'umbel') ? 1.6 : (f.kind === 'sprig' || f.kind === 'fern') ? 1.2 : 1.0;
      /* 既存 windAmt*0.2*wind.dir*(1-depth*0.6) に swayK を乗ずる */
```

- [ ] **Step 3: umbel の種パーティクル**。風発火ブロック（既存の花の shed 舞いの近く）で、kind==='umbel' かつ open>0.6 の要素から種を放つ:
```js
      if (f.kind === 'umbel' && (f.bloom||0) > 0.6 && seeds < 3 && Math.random() < 0.5) {
        petals.push({ x: f.x, y: f.y - f.r*0.5, vx: wind.dir*(0.3+Math.random()*0.4), vy: -0.1+Math.random()*0.2,
          life: 1, r: 1.4 + Math.random()*1.2, rot: Math.random()*6.28,
          color: rgba(mixRgb(GREEN, { r:0xF0,g:0xEA,b:0xD8 }, 0.5), 0.8) });   /* 種＝緑/生成り */
        seeds++;
      }
```
パーティクル描画箇所で `p.color ? p.color : <既存花びら色>` を使うよう分岐（既存花びらは color 未指定なので不変）。落下・減衰・上限120は既存共用。

- [ ] **Step 4: テスト成功＋スクショ**。phase2e 全 PASS。回帰: kaze10/wind2 17/phase2b19/taika14/engine2 9。スクショで風時に草・umbel がそよぎ種が舞うことを確認。

- [ ] **Step 5: Commit** `git add website/flora/hana.js` → `feat(ichi): 草/レースフラワーが風にそよぎ種穂から種が舞う`

---

## 段階 2e-2: 押し花＝標本ボード自動構成

### Task 5: press() を標本ボード（beige地・余白配置・退色・ラベル）に置換

**Files:** Modify `website/flora/hana.js`／Test `<scratchpad>/verify-hana-phase2e.js`（拡張）

**Interfaces:**
- Consumes: 既存 press()（現状は庭を平面化して PNG 返す）・drawEntity・flowers[]・seed・kanjiDate。
- Produces: press() が標本ボードを構成した dataURL を返す（署名不変: 引数なし・dataURL返し・透明前提は不要になり beige地）。

- [ ] **Step 1: 失敗テスト追加** `verify-hana-phase2e.js`:
  (a) 数十回なぞって花＋緑を作り press() を呼ぶと、返り値 canvas の地が**生成り(beige, 例 R>200,G>190,B>150 かつ暖色)**主体（暗い庭色でない）。
  (b) 要素が**重ならず余白をあけて**配置（サンプル格子で「要素塊」が複数の離れた領域に分かれて存在＝1箇所に密集していない）。
  (c) 退色: 標本上の花色が、庭表示時よりわずかに彩度/明度が低い（同一 seed 比較で平均彩度が下がる）。
  (d) 日付ラベル相当の描画（隅にテキスト or それを示すピクセル）。seed 花名モードでは花名を含む（`press({label検証用}` ではなく、内部 label 文字列を返すテスト用フック `snapshotLabel()` を用意して検証）。
  (e) 要素が0〜数個でも成立（空/少数でエラーにならず beige地が返る）。
  (f) エラー0。Run→FAIL。

- [ ] **Step 2: 標本構成の実装**。press() を次の構成に置換（既存の「現状平面化」は削除）:
  - 出力 canvas を作り、beige グラデ地（例 `#E4D9C4`→`#D8C3A6`）＋微かな紙ノイズ（既存グレインがあれば流用・なければ薄い点）。
  - 庭の flowers[] から代表を選抜: 大きい花を 2〜4輪、緑（sprig/fern/umbel）を数本、floret/小花を数塊。要素が多い場合は間引く（重なり回避のため上限 ~14 配置）。
  - 配置: canvas を余白マージン付きの緩いグリッド（例 4x4 セル・各セル中心±ジッタ）に、決定的乱数（makeRng(seedForBoard)）でセルへ割り当て、要素同士が最小距離以上離れるよう配置。sprig/つるは要素間の空きに曲線で置く。
  - 各要素は drawEntity で描くが、`pressed=true` 相当の描画補正（影なし・彩度と明度を down・輪郭わずかに締める）。実装は press 用の描画で ctx.filter や色補正、もしくは要素の palette を退色版に mix（`mixRgb(col, {r:0xB0,g:0xA8,b:0x98}, 0.18)` 等）してから drawEntity。
  - ラベル: 隅に控えめなセリフ体テキスト。文言 = seed時「<花名Ja> の 標本 · <漢数字日付>」／汎用時「<季節Ja> の 標本 · <漢数字日付>」。既存 kanjiDate(m,d) を流用。大見出し装飾は抑制（引き算）。
  - 戻り値は dataURL（既存呼び出し側＝ダウンロード/表示は不変）。
  - 少数/空フォールバック: 要素0でも beige地＋ラベルのみで返す。
  - テスト用フック: `snapshotLabel: function(){ return lastPressLabel; }` を返り値に追加（(d)検証用・実挙動に影響なし）。

- [ ] **Step 3: テスト成功＋スクショ目視**。phase2e 全 PASS。回帰: press7（既存 press テストが「透明地」を前提にしていたら、標本仕様=beige地へ期待値更新し**報告**する。既存の「押し花に葉/花が写る」意図は維持）。他 hana スイート＋iro/fude/zukan 全緑。スクショで参考1/2 のような疎な標本レイアウト・退色・余白・ラベルを確認（窮屈/重なりがあればマージン・上限・最小距離を調整）。

- [ ] **Step 4: Commit** `git add website/flora/hana.js` → `feat(ichi): 押し花を植物標本ボードに自動構成(生成り地・余白配置・退色・日付ラベル)`

---

### Task 6: 総合検証・Codex2周・公開・docs

- [ ] **Step 1**: 全 hana スイート（util/forms/seed/engine2/press/mount2/perflower/phase2b/season/oto/kaze/taika/hizuke/kyou/integration2/leaf/wind2/phase2e）＋iro/fude/zukan 緑。`hana.js?v=6`→`?v=7`（index.html）。node --check OK。
- [ ] **Step 2**: スクショ目視（草花4種・自生の落ち着き・風時のそよぎと種・標本ボード）。
- [ ] **Step 3**: **Codexレビュー2周**（`codex-review.sh custom` でブランチ差分・website/flora/hana.js中心）。重点: (a) 自生 setTimeout のライフサイクル/リーク（detach・farewell・reopen）(b) needLoop と自生の相互作用で常時rAF暴走がないか (c) kind 追加で drawFlower/press/既存風・散りに退行がないか (d) 標本 press の少数/空フォールバック・重なり (e) reduce 網羅（自生/風/散り/種なし・緑は静的）。Critical必修正・2周目Critical 0。
- [ ] **Step 4**: main へ必要ファイルのみ取込（hana.js/index.html/docs）・混入ゼロ（`git add` 明示・`git diff main...HEAD --stat` で2ファイル+docsのみ確認）・push。
- [ ] **Step 5**: デプロイ監視・失敗時rerun・`hana.js?v=7` ライブ確認（index参照＋live hana.js に drawSprig/ambientSprout/標本press マーカー）。
- [ ] **Step 6**: handoff 1行・DESIGN-NOTES §7 Phase2e追記・G-06デブリーフ。

---

## Self-Review 結果
**Spec coverage:** 草花4種→T1(sprig)+T2(fern/umbel/floret) / 生える(なぞりミックス＋自生・充実停止)→T3 / 散る・風の緑対応(sway・種)→T4 / 標本ボード自動構成＋beige→T5 / 検証公開docs→T6。specの全要点を網羅。
**Placeholder scan:** 緑色(#6E7A55)・自生間隔(18-36秒/fast0.5秒)・充実(RESTING_COUNT=28)・なぞり緑比率(35%)・sway係数(umbel1.6/草1.2)・種上限・標本地(#E4D9C4→#D8C3A6)・配置上限(~14)・退色mix値・ラベル文言は具体値。reference実装は「Step4スクショで視覚調整可」と明示（創作描画のため）。
**Type consistency:** entity.kind は spawn/ambientSprout が付与→drawEntity が分岐→drawFlower(既存不変)。__fastGrow/entityCount/snapshotLabel は createGarden 返り値。petals.color は Task4 追加で既存花びらは未指定=不変。press は dataURL 返し据え置き（地のみ beige 化）。既存ヘルパ名（makeRng/easeOutCubic/rgba/mixRgb/petal/hexToRgb/kanjiDate/pickForm/currentPalette）を統一使用。
**リスク:** 自生の常時rAF→setTimeout駆動＋充実停止＋detach clearTimeout を T3/T6 で必須確認。press 退行→press7 の期待値更新は報告事項として明記。視覚品質はスクショ目視ゲート（T1/T2/T4/T5）。
