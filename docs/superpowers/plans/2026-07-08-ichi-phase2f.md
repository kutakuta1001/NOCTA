# Ichi Phase 2f「休むと草が生える・突風で真っさら」Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development。実装SA=Sonnet、レビュー=Codex（CEO指定・ブランチ差分を2周）。Steps は checkbox（`- [ ]`）。

**Goal:** ①約3秒アイドルで未タップの空いた場所に草が自生し始める（以後数秒ごと・充実で停止）②「真っさらにする」で強い突風が吹き全要素が風向きに散って庭が空になる（音ON時は強い風音）。コンセプト不変。

**Architecture:** hana.js の延長。既存の自生（scheduleSprout/maybeSprout/armSproutTimer・Phase2e）をアイドル駆動に調整＋ambientSprout の場所バイアス。clear() を突風演出（既存 petals パーティクルのバースト＋onGust コールバック）に置換。mount に otoPlayGust（強い風音）。index.html は cache-buster のみ。

**Tech Stack:** Vanilla JS(IIFE)・Canvas 2D・Web Audio API・Playwright。ビルドなし。

## Global Constraints
- ビルドなし・IIFE・相対パス・website配下のみ。`git add` はファイル明示（`-A`/`.` 禁止）。website/flora/hana.js と website/flora/index.html のみ対象（テストは scratchpad・git管理外）。
- コミット trailer: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`。
- 既存不変: 草花4種描画・なぞりミックス・風(16-34秒・sway・onWind音)・散り(花)・長押し大輪・farewell(ビュー退場)・seed・押し花標本ボード(press)・reduce時は自生/風/散り/gust演出なし。既存 drawFlower('flower'経路)・押し花透明でなくdataURL返し不変。
- 数値: IDLE_MS=3000・SPROUT_INTERVAL=3000〜6000ms・RESTING_COUNT=28(既存)・GUST_MAX=180・突風音 gain≈0.06/長さ≈2.2s。
- 既存回帰スイート維持: util12/forms14/seed13/engine2 9/press7/mount2 10/perflower12/phase2b19/season11/oto14/kaze10/taika14/hizuke7/kyou12/integration2 15/leaf13/wind2 17/phase2e92 ＋ iro19/fude23/zukan36。
- 既存 setTimeout 駆動の自生・detach clearTimeout・reduce時 needLoop=false は維持。
- キャッシュバスター: T3 完了時 `hana.js?v=7` → `hana.js?v=8`。
- scratchpad実パス: `/private/tmp/claude-501/-Users-fghmacbook013-NOCTA/d33a3808-dccb-490e-8426-ee5196f85bf3/scratchpad`。Playwrightはwebsite配信+setContent+絶対URL（既存 verify-hana-*.js 流用）。node --check/node はリポジトリ内で実行（cwdは /Users/fghmacbook013/NOCTA にリセット）。
- Codexレビュー: リポジトリ内 `~/.claude/scripts/codex-review.sh custom "<prompt>"` で `git diff main...HEAD`（T3で2周）。

---

### Task 1: F1 休むと草が生える（自生をアイドル駆動に＋場所バイアス）

**Files:** Modify `website/flora/hana.js`／Test `<scratchpad>/verify-hana-phase2f.js`

**Interfaces:**
- Consumes: 既存 `scheduleSprout(t)`/`maybeSprout(t)`/`armSproutTimer()`/`ambientSprout()`/`nextSproutT`/`RESTING_COUNT`/`flowers[]`・ポインタハンドラ（begin/move/end/tap・なぞりspawn）・`now()`・`reduce`・`farewelling`。
- Produces: `lastInteractT`（最後の操作時刻）。アイドル駆動の自生（IDLE_MS後に開始・SPROUT_INTERVAL毎・操作でリセット）。ambientSprout の場所バイアス。テスト用に `__fastGrow` は IDLE_MS/interval を短縮（例 IDLE 400ms・interval 400ms）。

- [ ] **Step 1: 失敗テスト** `verify-hana-phase2f.js`（既存 verify-hana-phase2e.js の自生テスト手法＝__fastGrow・時間送りを流用）:
  (a) 操作直後は生えない: mount→なぞり/タップ→IDLE_MS未満の時間送りで entityCount 増えない。
  (b) アイドルで生える: 操作後 IDLE_MS 経過で1つ芽吹き、以後 interval ごとに増える。RESTING_COUNT で頭打ち。
  (c) 操作でリセット: 芽吹き直前に再操作すると、その操作から IDLE_MS 未満は生えない（lastInteractT 更新の証拠）。
  (d) 場所バイアス: 既知の位置にタップ→アイドル芽吹きした要素の座標が、タップ位置（や既存要素）から一定距離以上離れている（空いた場所を選ぶ）。
  (e) reduce時は生えない。
  Run→FAIL。

- [ ] **Step 2: lastInteractT 追跡**。createGarden の state に `var lastInteractT = now();` を追加。ポインタ操作の入口（begin/tap・なぞり中の spawn を呼ぶ箇所・move）で `lastInteractT = now();` を更新し、`scheduleSprout(now());`（＝次芽吹きを操作起点で後ろ倒し）＋`armSproutTimer();`（タイマー貼り直し）を呼ぶ。既存ハンドラ名は実コードを Read して特定（例: begin/move/end/onPointer…）。

- [ ] **Step 3: 自生をアイドル駆動に**。
`scheduleSprout(t)` を「操作からの待ち」に合わせる:
```js
    var IDLE_MS = fastGrow ? 400 : 3000;
    var SPROUT_MIN = fastGrow ? 400 : 3000, SPROUT_SPAN = fastGrow ? 400 : 3000;   /* interval 3-6秒 */
    function scheduleSprout(t) { nextSproutT = t + (SPROUT_MIN + Math.random() * SPROUT_SPAN); }
```
`maybeSprout(t)` をアイドル判定に:
```js
    function maybeSprout(t) {
      if (t < nextSproutT) return false;
      /* まだ操作から IDLE_MS 経っていなければ、芽吹かず「操作+IDLE_MS」まで待つ */
      if (t - lastInteractT < IDLE_MS) { nextSproutT = lastInteractT + IDLE_MS; return false; }
      scheduleSprout(t);                                   /* 次周期を前進(busy-loop防止) */
      if (reduce || farewelling) return false;
      if (flowers.length >= RESTING_COUNT || flowers.length >= MAX_FLOWERS) return false;
      ambientSprout();
      kick();
      return true;
    }
```
（初期 armSproutTimer/scheduleSprout 呼び出し・redraw保険発火・detach clear は既存のまま。gust中は farewelling同様に生えないよう、gust状態があれば条件に追加＝Task2と整合。）

- [ ] **Step 4: ambientSprout の場所バイアス**。ambientSprout 内で、候補位置を数点（例5点）ランダム生成し、**既存 flowers と lastInteract 位置から最も遠い**候補を採用:
```js
      var best = null, bestD = -1;
      for (var c = 0; c < 5; c++) {
        var cx = rect.width * (0.1 + Math.random() * 0.8), cy = rect.height * (0.15 + Math.random() * 0.75);
        var d = 1e9;
        for (var fi = 0; fi < flowers.length; fi++) { var dx = flowers[fi].x - cx, dy = flowers[fi].y - cy; d = Math.min(d, dx * dx + dy * dy); }
        if (lastPointer) { var px = lastPointer.x - cx, py = lastPointer.y - cy; d = Math.min(d, px * px + py * py); }
        if (d > bestD) { bestD = d; best = { x: cx, y: cy }; }
      }
      var x = best.x, y = best.y;
```
`lastPointer`（直近ポインタ座標）を begin/move/tap で記録（無ければ距離条件から除外）。

- [ ] **Step 5: テスト成功＋回帰**。phase2f PASS。回帰（scratchpad）: `node verify-hana-phase2e.js`（自生テストがアイドル駆動化で落ちたら**正当な期待値更新のみ**行い報告）・`node verify-hana-engine2.js` `node verify-hana-mount2.js` `node verify-hana-kaze.js` `node verify-hana-wind2.js` `node verify-hana-integration2.js` 全緑。detach後にタイマー残らないことを担保。

- [ ] **Step 6: Commit** `git add website/flora/hana.js` → `feat(ichi): 休むと草が生える(約3秒アイドルで未タップの空き場所に自生)`

---

### Task 2: F2 突風で真っさら（クリア演出＋強い風音）

**Files:** Modify `website/flora/hana.js`／Test `<scratchpad>/verify-hana-phase2f.js`（拡張）

**Interfaces:**
- Consumes: 既存 `clear()`（現状 flowers=[];petals=[];redraw()）・`petals[]` パーティクル配列（{x,y,vx,vy,rot,vr,r,color/kind,bornT,life}）・`wind` state・`reduce`・`hexToRgb`/`currentPalette`・`GREEN`。
- Produces: clear() の突風演出（バースト粒子・強い wind・`opts.onGust()` 呼び）。`GUST_MAX`。mount に `otoPlayGust()`・createGarden へ `onGust` 配線・`__hanaOto.gust` カウンタ。

- [ ] **Step 1: 失敗テスト追加** verify-hana-phase2f.js:
  (a) 非reduce: 花を数輪作り clear()→flowers が即0・petals（バースト粒子）が増える・数十フレーム送ると petals も減って空。
  (b) onGust: 音ON＋clear で `window.__hanaOto.gust` が増える。音OFFでは増えない。
  (c) reduce: clear() で即 flowers=0・petals=0（バーストなし）。
  Run→FAIL。

- [ ] **Step 2: clear() を突風演出に**。
```js
      clear: function () {
        if (reduce) { flowers = []; petals = []; redraw(); if (opts.onGust) { try { opts.onGust(); } catch (_) {} } return; }
        /* 強い突風: 全要素を風向きに散らす */
        var dir = (Math.random() < 0.5) ? 1 : -1;
        wind.dir = dir; wind.strength = 1; wind.start = now(); wind.until = now() + 1800;
        for (var i = 0; i < flowers.length && petals.length < GUST_MAX; i++) {
          var f = flowers[i];
          var isGreen = (f.kind && f.kind !== 'flower');
          var burst = isGreen ? 2 : 3;
          for (var b = 0; b < burst && petals.length < GUST_MAX; b++) {
            petals.push({
              x: f.x + (Math.random() - 0.5) * f.r, y: f.y - f.r * 0.4,
              vx: dir * (0.6 + Math.random() * 0.7), vy: -0.15 + Math.random() * 0.35,
              rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.02,
              r: f.r * (isGreen ? 0.3 : 0.42),
              color: isGreen ? { r: 0x6E, g: 0x7A, b: 0x55 } : hexToRgb(currentPalette().petals[0]),
              kind: isGreen ? 'seed' : undefined, bornT: now(), life: 1600 + Math.random() * 500
            });
          }
        }
        flowers = [];                                   /* 花は吹き飛んだ→粒子が流れて消える */
        if (opts.onGust) { try { opts.onGust(); } catch (_) {} }
        kick();                                          /* rAFを起こして粒子アニメ */
      },
```
（粒子の color 型は既存描画分岐に合わせる: 既存 seed粒子は {r,g,b} オブジェクト・花びらは hex文字列 or hexToRgb 済み。**既存パーティクル描画のcolor取り扱いを Read で確認し、burst粒子の color/kind をその分岐に正しく載せる**。既存花びら・種の見た目は不変に保つ。速度 vx はフレーム係数に注意し 1.5〜2秒で画面外へ流れる値に調整。gust中に自生しないよう Task1 の maybeSprout ガードと整合。）

- [ ] **Step 3: otoPlayGust（強い風音）＋配線**。mount の otoPlayWind の近くに、強化版を追加:
```js
    function otoPlayGust() {
      if (!oto.enabled || !oto.ctx) return;
      var ctx = oto.ctx, t = ctx.currentTime, dur = 2.2;
      var buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      var src = ctx.createBufferSource(); src.buffer = buf;
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(700, t);
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.06, t + 0.25);       /* 一陣の立ち上がり(速い) */
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      src.connect(lp); lp.connect(g); g.connect(ctx.destination);
      src.start(t); src.stop(t + dur);
      src.onended = function () { try { src.disconnect(); lp.disconnect(); g.disconnect(); } catch (_) {} };
      oto.gust = (oto.gust || 0) + 1; otoPublish();
    }
```
`otoPublish` の window.__hanaOto に `gust: oto.gust || 0` を追加。createGarden 呼びに `onGust: otoPlayGust` を追加。

- [ ] **Step 4: テスト成功＋回帰**。phase2f PASS。回帰: `node verify-hana-oto.js`（__hanaOto 形が増えるので既存assert確認・必要なら更新報告）・`node verify-hana-kaze.js` `node verify-hana-wind2.js` `node verify-hana-phase2b.js` `node verify-hana-engine2.js` `node verify-hana-mount2.js` `node verify-hana-integration2.js` `node verify-hana-press.js` 全緑。既存 clear を使うテスト（あれば）の期待値を突風仕様へ更新し報告。

- [ ] **Step 5: Commit** `git add website/flora/hana.js` → `feat(ichi): 真っさらにする時に突風で全要素が散る演出＋音ON時の強い風音`

---

### Task 3: 総合検証・Codex2周・公開・docs

- [ ] **Step 1**: 全 hana スイート（既存＋phase2e＋phase2f）＋iro/fude/zukan 緑。`hana.js?v=7`→`?v=8`（index.html）。node --check OK。
- [ ] **Step 2**: スクショ/実機目視（3秒アイドルでの芽吹き・突風で花が流れて消える）。
- [ ] **Step 3**: **Codexレビュー2周**（`codex-review.sh custom` でブランチ差分・hana.js中心）。重点: (a)アイドル自生のタイマーライフサイクル/リーク/暴走・操作リセットの正しさ (b)gustのバースト粒子が GUST_MAX を超えない・粒子色型が既存描画と整合・gust中の自生/再clear/farewell競合 (c)onGust/otoPlayGust のリーク・音OFF時無音 (d)reduce網羅（自生/gust演出なし・即クリア）(e)既存(風・散り・press・farewell・seed)への退行。Critical必修正・2周目Critical 0。
- [ ] **Step 4**: main へ必要ファイルのみ取込（hana.js/index.html/docs）・混入ゼロ（`git diff main...HEAD --stat` 確認）・push。
- [ ] **Step 5**: デプロイ監視・失敗時rerun・`hana.js?v=8` ライブ確認（index参照＋live hana.js に otoPlayGust/lastInteractT マーカー）。
- [ ] **Step 6**: handoff 1行・DESIGN-NOTES §7 Phase2f追記・G-06デブリーフ。

---

## Self-Review 結果
**Spec coverage:** F1 アイドル自生(3秒・場所バイアス)→T1 / F2 突風クリア(バースト粒子・reduce即時)→T2 / 強い風音→T2 / 検証公開docs→T3。2依頼を網羅。
**Placeholder scan:** IDLE_MS3000・interval3-6s・RESTING28・GUST_MAX180・gust音gain0.06/2.2s/lp700・burst枚数(花3緑2)・粒子速度/寿命は具体値。reference実装は「既存パーティクル色型/ハンドラ名を Read で確認して整合」と明示。
**Type consistency:** lastInteractT/lastPointer は createGarden state・ポインタハンドラが更新→maybeSprout/ambientSprout が参照。onGust は createGarden(T2)→mount(otoPlayGust)。__hanaOto.gust は otoPlayGust→テスト。burst粒子は既存 petals 形（color/kind）に整合。既存 scheduleSprout/maybeSprout/armSproutTimer/ambientSprout/kick/wind/petals を流用。
**リスク:** アイドルタイマー暴走→setTimeout駆動維持＋操作re-arm＋reduce/detach停止をT1/T3で確認。gust粒子過多→GUST_MAX上限。既存 phase2e自生・oto テストの期待値更新は報告事項として明記。視覚/音は目視ゲート。
