# Ichi Phase 2b「無常と季節」Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** 咲かせた庭に無常（花びらが落ち花が盛りを過ぎる）を与え、図鑑を今日の季節と連動させ余白を増やす（提案書 B-4+C-2+C-1）。

**Architecture:** Canvas 2D の hana.js の延長。createGarden に落下パーティクル配列＋花の加齢状態、drawFlower に shed(落とした花びら数) 引数。図鑑は index.html で今日の季節連動と余白。庭（花）は自動消滅させない（安全側）。

**Tech Stack:** Vanilla JS(IIFE)・Canvas 2D・Playwright。ビルドなし。

## Global Constraints

- ビルドなし・素のJS(IIFE)・相対パス・website配下のみ。`git add` ファイル明示(`-A`禁止)。
- コミット trailer: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`。
- 既存 hana スイート(util/flower/forms14/seed13/engine2 9/press7/mount2 10/perflower12/a1 8/integration2 15)＋iro19/fude23/zukan36 回帰維持。
- **drawFlower の shed 既定0で既存描画は完全不変**。seedなし/seedあり両モードの既存挙動を壊さない。press()は透明canvas前提を維持(和紙合成不変)。
- reduce-motion: 加齢・落下・パーティクルを一切行わず従来通り静的。
- パーティクル上限120・30fpsスロットル(既存)維持。庭(花)は自動で消さない。
- キャッシュバスター: hana.js変更で index.html を `./hana.js?v=4`。
- scratchpad実パス: `/private/tmp/claude-501/-Users-fghmacbook013-NOCTA/d33a3808-dccb-490e-8426-ee5196f85bf3/scratchpad`。検証・Codexはリポジトリ内。Playwrightはwebsite配信+setContent+絶対URL。
- 花のパーティクルは transient なので `Math.random()`(ブラウザ)使用可（決定論rngは花本体のみ）。

---

### Task 1: 散る花 — 落下パーティクル＋花の加齢（B-4）

**Files:** Modify `website/flora/hana.js`／Test `<scratchpad>/verify-hana-phase2b.js`

**Interfaces:** drawFlower(o.shed?:number=0) 追加。createGarden は変更（返り値API不変）。テスト短縮用 `opts.__fastAge`(bool) を mount/createGarden が受ける（本番未使用）。

- [ ] **Step 1: 失敗テスト**：`verify-hana-phase2b.js`。mount に `{__fastAge:true}`（hold≈600ms・shed間隔≈250ms に短縮）で数輪咲かせ2〜3秒待つ→(a) 花びらが落ちる=canvasに落下パーティクルが出る＆花の花びら数が減る(n-shed) (b) さらに待つとパーティクルがフェード消滅 (c) reduce時は`__fastAge`でも加齢/落下なし(花不変) (d) press()が背景含まず出る (e) エラー0。dispatchEventでpointer。Run→FAIL。

- [ ] **Step 2: drawFlower に shed 引数**。花びらループの上限を変更:
```js
    var shed = (typeof o.shed === 'number' && o.shed > 0) ? Math.min(o.shed, n - 1) : 0;  /* 最低1枚は残す */
    for (var i = 0; i < n - shed; i++) {
```
（他は不変。shed=0で従来同一。layered内層/花芯は据え置き。）

- [ ] **Step 3: createGarden に加齢＋パーティクル**。
spawn の flower オブジェクトに追加（`dur` 等の近く）:
```js
        holdMs: (opts.__fastAge ? 600 : (12000 + rng() * 10000)),   /* 満開後この時間で加齢開始 */
        shed: 0, nextShedT: 0, maxShed: 0,   /* maxShedはredraw初回に n*0.4 で確定 */
```
createGarden 冒頭状態に追加: `var petals = []; var fastAge = !!opts.__fastAge; var lastAgeT = 0; var PART_MAX = 120;`
`FORM_COUNTS`（drawFlowerと同じ counts）を createGarden からも参照できるよう、drawFlower外の共通定数にするか、`petalCount(form)` ヘルパを IIFE に用意（drawFlower も使う）:
```js
  var FORM_COUNTS = { sakura: 5, kiku: 14, tulip: 4, komori: 5, star: 5, layered: 8, bell: 6 };
  function petalCount(form) { return FORM_COUNTS[form] || 5; }
```
（drawFlower の `var counts = {...}; var n = counts[form]||5;` を `var n = petalCount(form);` に置換。）

redraw のループ内（drawFlower 呼び出しの直前後）に加齢処理を追加:
```js
      /* 加齢＝花びらを1枚ずつ落とす（無常）。reduce時は行わない */
      if (!reduce && !farewelling) {
        if (f.maxShed === 0) f.maxShed = Math.max(1, Math.floor(petalCount(f.form) * 0.4));
        var age0 = f.bornT + f.dur + f.holdMs;    /* 加齢開始時刻 */
        if (t >= age0 && f.shed < f.maxShed && t >= f.nextShedT) {
          if (petals.length < PART_MAX) {
            var pcol = SEASONS_or_seedPalette_petal(f);   /* 下記 currentPalette().petals[0] を使う */
            petals.push({
              x: f.x, y: f.y - f.r * 0.5, vx: (Math.random() - 0.5) * 0.02,
              vy: 0.02 + Math.random() * 0.02, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.004,
              r: f.r * 0.42, color: pcol, bornT: t, life: 2500
            });
          }
          f.shed++;
          f.nextShedT = t + (fastAge ? 250 : (2500 + Math.random() * 3000));
        }
      }
```
drawFlower 呼び出しに `shed: f.shed` を追加。`pcol` はパレットの主花びら色 = `currentPalette().petals[0]`（seed/非seedで既に currentPalette がある。無ければ SEASONS[seasonName].petals[0]）。

redraw 末尾（花描画ループの後）にパーティクル更新＋描画:
```js
      /* 落下花びらパーティクル */
      var dt = lastAgeT ? Math.min(100, t - lastAgeT) : 16; lastAgeT = t;
      for (var pi = petals.length - 1; pi >= 0; pi--) {
        var q = petals[pi];
        var qage = t - q.bornT;
        if (qage >= q.life) { petals.splice(pi, 1); continue; }
        q.vy += 0.00002 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.rot += q.vr * dt;
        var qa = (1 - qage / q.life) * 0.85;
        ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot);
        var qc = hexToRgb(q.color);
        var qg = ctx.createLinearGradient(0, 0, 0, -q.r);
        qg.addColorStop(0, rgba(qc, qa)); qg.addColorStop(1, rgba(qc, qa * 0.3));
        ctx.fillStyle = qg; petal(ctx, q.r, q.r * 0.34); ctx.fill(); ctx.restore();
      }
```

- [ ] **Step 4: needLoop にパーティクル**：
```js
      return flowers.length > 0 || petals.length > 0;
```
（reduce分岐は従来 false のまま。farewelling時 true のまま。）clear()/farewell時 `petals = [];` も追加（庭を消す時は落下も消す）。

- [ ] **Step 5: mount に __fastAge を透過**：`createGarden(canvas, { reduce, season, seed, __fastAge: opts.__fastAge })`。

- [ ] **Step 6: テスト成功＋目視**。`verify-hana-phase2b.js` PASS。回帰: forms14/seed13/engine2 9/press7/mount2 10/perflower12/a1 8。スクショで落下の頻度・淡さを確認（散らかりすぎたら shed間隔/40%/life調整）。

- [ ] **Step 7: Commit** `git add website/flora/hana.js` → `feat(ichi): 散る花(花びらが落ち花が盛りを過ぎる・無常)`

---

### Task 2: 今日の季節連動（C-2）＋図鑑の余白（C-1）

**Files:** Modify `website/flora/index.html`／Test `<scratchpad>/verify-hana-season.js`

**Interfaces:** Consumes mount({season})（既存）。

- [ ] **Step 1: 失敗テスト**：`verify-hana-season.js`（/flora/実開）。(a) 汎用CTA「咲かせて遊ぶ」で開くと、なぞった花の色が**今日の季節パレット**に一致（テストは `new Date()` の月から期待季節を計算し、咲いた花のサンプル色がその季節のpetals域か検証）(b) 各花入口(.hana-sow)の色は花のaccentColorのまま(季節連動に影響されない) (c) カバーに淡い季節色の要素/スタイルが在る (d) 既存の開閉・なぞり・エラー0。Run→FAIL。

- [ ] **Step 2: index.html — currentSeason と 汎用CTA の today season**。
DOMContentLoaded 内に:
```js
    function currentSeason() {
      var m = new Date().getMonth() + 1;
      if (m >= 3 && m <= 5) return 'spring';
      if (m >= 6 && m <= 8) return 'summer';
      if (m >= 9 && m <= 11) return 'autumn';
      return 'winter';
    }
```
onOpen の seed 構築で、`flowerIdx` が数値でない（＝汎用CTA）ときは `mount(..., { season: currentSeason() })` を渡す（seedなし時に today season を指定）:
```js
        hanaInstance = window.NoctaHana.mount(document.getElementById('hana-mount'),
          seed ? { seed: seed } : { season: currentSeason() });
```

- [ ] **Step 3: カバーの淡い季節色（C-2の図鑑側・ごく淡く）**。
cover に季節色のごく淡い径向グラデを1枚重ねる（既存の暗темテーマを壊さない）:
```js
    var SEASON_TINT = { spring:'rgba(150,70,90,0.06)', summer:'rgba(60,80,130,0.06)', autumn:'rgba(140,80,40,0.06)', winter:'rgba(90,96,110,0.05)' };
    var cover = document.getElementById('cover');
    if (cover) { var tint=document.createElement('div'); tint.setAttribute('aria-hidden','true');
      tint.style.cssText='position:absolute;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 70% 60% at 50% 40%,'+(SEASON_TINT[currentSeason()]||SEASON_TINT.spring)+' 0%,transparent 70%);';
      cover.insertBefore(tint, cover.firstChild); }
```
（z-index:0でカバーの前景テキスト(z-10等)より背面。既存レイアウト非破壊。）

- [ ] **Step 4: C-1 余白（軽微・低リスク）**。各花セクションの縦余白をわずかに増やし、チップを軽くする。既存 `.gem-chip` の padding や section の py を微増する CSS のみ（HTML構造・zukanの生成は非変更）。例: セクション内テキスト列の要素間 margin を少し広げる／`.gem-chip` の背景をより淡く。**zukan36 回帰を必ず確認**。過度なら見送り可（その旨報告）。

- [ ] **Step 5: `hana.js?v=3` → `?v=4`**。

- [ ] **Step 6: テスト成功＋回帰**：verify-hana-season.js PASS。`cd <scratchpad> && node verify-hana-perflower.js && node verify-hana-integration2.js && node verify-iro.js && node verify-fude.js && node verify-zukan.js`（12/15/19/23/36維持）。

- [ ] **Step 7: Commit** `git add website/flora/index.html` → `feat(ichi): 今日の季節と連動(汎用咲かせる/カバー淡色)＋図鑑の余白(C-2,C-1)`

---

### Task 3: 総合検証・レビュー・公開・docs

- [ ] **Step 1**: 全 hana スイート＋iro/fude/zukan 緑。
- [ ] **Step 2**: 散る花のスクショ目視（落下の頻度・淡さ・花が盛りを過ぎる佇まい）。汎用咲かせるが今日の季節で開くか。
- [ ] **Step 3**: 最終ブランチレビュー（Opus・requesting-code-review）。特に「可視性/タイミング/リーク/reduce網羅/既存不変（shed=0）」。Critical/Important修正。
- [ ] **Step 4**: main へ必要ファイルのみ取込(hana.js/index.html/docs)・混入ゼロ確認・push。
- [ ] **Step 5**: デプロイ監視・失敗時rerun・`hana.js?v=4`ライブ確認。
- [ ] **Step 6**: handoff 1行・DESIGN-NOTES §7 Ichi に Phase2b追記・G-06デブリーフ。

---

## Self-Review 結果

**Spec coverage:** B-4散る花(particles/加齢/drawFlower shed/needLoop/reduce)→T1 / C-2季節連動(currentSeason/汎用today/カバー淡色)→T2 / C-1余白→T2 / 検証公開→T3。全対応。庭自動消滅は非目標（明記）。
**Placeholder scan:** particle params・holdMs・maxShed(40%)・PART_MAX(120)・SEASON_TINT・shed間隔は具体値。`__fastAge` はテスト短縮用の内部フラグと明記。C-1は「過度なら見送り可」を明記(低リスク優先)。`SEASONS_or_seedPalette_petal(f)` は `currentPalette().petals[0]` を使うと本文明記。
**Type consistency:** drawFlower(o.shed) T1定義→redraw呼びで `shed:f.shed` 一致。petalCount(form)/FORM_COUNTS を drawFlowerとredrawで共用。mount({season}) 既存・T2で currentSeason() 供給。particles配列は createGarden内クローズ・needLoop/clear/farewellで参照一致。
**リスク:** 落下頻度/負荷/C-1回帰/pressの一瞬混入 は spec リスク表の通り。各Tでスクショ・回帰確認。
