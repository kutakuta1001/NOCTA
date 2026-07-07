# Ichi 各花からの咲かせる Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox syntax.

**Goal:** 図鑑の各花セクション(24種)から「この花を咲かせる」で入場し、その花の色と似た輪郭で咲かせられるようにする（図鑑↔遊びの橋・提案書C-3）。

**Architecture:** 手続き花形を4→7に拡張(star/layered/bell追加)、createGarden にシード(seed={form,accentColor,seasonName})対応、各花セクションに入口ボタンを追加し openHana(i) でシード起動。汎用CTAは自由制作として存置。

**Tech Stack:** Vanilla JS(IIFE)・Canvas 2D・Playwright。ビルドなし。

## Global Constraints

- ビルドなし・素のJS(IIFE)・相対パス・website配下のみ。`git add`はファイル明示(`-A`禁止)。
- コミット trailer: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`。
- 既存 hana スイート(util12/flower8/engine2 9/press7/mount2 10/a1 8/integration2 15)＋iro19/fude23/zukan36 回帰維持。
- 既存4形(sakura/kiku/tulip/komori)・form未指定時の描画は不変に保つ。汎用CTA(seedなし)は従来挙動維持。
- press()を汚さない(flower canvas透明維持)。reduce対応維持。
- キャッシュバスター: hana.js変更で index.html を `./hana.js?v=3` に更新。
- scratchpad実パス: `/private/tmp/claude-501/-Users-fghmacbook013-NOCTA/d33a3808-dccb-490e-8426-ee5196f85bf3/scratchpad`
- 検証・Codexはリポジトリ内で。Playwrightは website ルート配信+page.setContent+絶対URL(既存verify-hana-*.js参照)。

## 確定データ（この計画で使う具体値）

### 季節導出 seasonFromFlower(f): birthMonths[0] を月バケットへ
spring={3,4,5} / summer={6,7,8} / autumn={9,10,11} / winter={12,1,2}。既定 spring。

### 24花→hanaForm マッピング（flora-data.js の各件に `hanaForm` を付与）
- sakura: 桜, コスモス
- komori: 梅, 紫陽花, ラベンダー, 朝顔, 金木犀
- tulip: チューリップ
- layered: 椿, 牡丹, 芍薬, バラ, 蓮, 山茶花
- bell: すずらん, 藤, ユリ（カサブランカ）, シクラメン
- kiku: ひまわり, 彼岸花, 菊
- star: 花菖蒲, 桔梗, 水仙

---

### Task 1: 新3形 star / layered / bell（drawFlower）

**Files:** Modify `website/flora/hana.js`（drawFlower の form 分岐）／Test `<scratchpad>/verify-hana-forms.js`

**Interfaces:** drawFlower(o.form) が 'star'|'layered'|'bell' を受け付ける（既存4形は不変）。counts に追加。

- [ ] **Step 1: 失敗テスト**：`verify-hana-forms.js` で 7形(sakura/kiku/tulip/komori/star/layered/bell)を横並び描画。star/layered/bell が非空(現状は既定sakura扱いで star等の分岐がない→ 3形が sakura と同一になる)。「star の輪郭が sakura と異なる（外周ピクセル分布差）」等で fail 判定。スクショ `hana-forms.png`。Run→FAIL。

- [ ] **Step 2: drawFlower に3形を実装**。`counts` と form分岐に追加:

```js
    var counts = { sakura: 5, kiku: 14, tulip: 4, komori: 5, star: 5, layered: 8, bell: 6 };
```
花びら描画分岐（既存 if/else 群）に追加（`petal`/`arc` を流用）:
```js
      else if (form === 'star') { petal(ctx, r * 1.15, r * 0.16); }               /* 尖った細弁 */
      else if (form === 'bell') { petal(ctx, r * 1.3, r * 0.30); }                /* 細長く反る弁 */
      else if (form === 'layered') { ctx.beginPath(); ctx.arc(0, -r * 0.55, r * 0.4, 0, Math.PI * 2); } /* 丸弁(外層) */
```
`layered` は八重にするため、外周ループ後に**内層**を追加描画（花芯の前に）:
```js
    if (form === 'layered') {
      var inner = 5;
      for (var j = 0; j < inner; j++) {
        ctx.save();
        ctx.rotate((j / inner) * Math.PI * 2 + Math.PI / inner);   /* 外層と半ピッチずらす */
        ctx.scale(openAng * 0.62, openAng * 0.62);
        var ic = hexToRgb(pal.petals[Math.floor(rng() * pal.petals.length) % pal.petals.length]);
        var ig = ctx.createLinearGradient(0, 0, 0, -r * 0.7);
        ig.addColorStop(0, rgba(ic, baseA)); ig.addColorStop(1, rgba(mixRgb(ic, ground, 0.5), baseA * 0.5));
        ctx.fillStyle = ig; ctx.beginPath(); ctx.arc(0, -r * 0.45, r * 0.34, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }
```
（挿入位置は「花びらループ後・`ctx.shadowBlur=0` の後・花芯描画の前」。rng消費順が既存4形に影響しないよう、layered分岐のみで追加rng呼びすることを確認。star/bell は既存petal流用でrng追加消費なし。）

- [ ] **Step 3: テスト成功＋スクショ目視**。7形が視覚的に区別でき花に見える。star=尖り/bell=細長/layered=八重。回帰 verify-hana-flower.js(8/8)・verify-hana-a1.js(8/8)・verify-hana-engine2.js(9/9)。

- [ ] **Step 4: Commit** `git add website/flora/hana.js` → `feat(ichi): 花形にstar/layered/bellを追加(24種の輪郭に近づける)`

---

### Task 2: createGarden/mount のシード対応

**Files:** Modify `website/flora/hana.js`／Test `<scratchpad>/verify-hana-seed.js`

**Interfaces:** `mount(container, { seed })` と `createGarden(canvas, { seed })`。`seed = { form, accentColor, seasonName, name }`。seed時: spawnはpickForm不使用でseed.form固定・palette=deriveSeededPalette(accent,seasonName)・季節チップ非表示・招待花seed形。seedなしは従来。

- [ ] **Step 1: 失敗テスト**：`verify-hana-seed.js`。(a) `NoctaHana.mount(el,{seed:{form:'layered',accentColor:'#C41E3A',seasonName:'summer',name:'バラ'}})` 後、なぞると咲く花のサンプル色が #C41E3A 近傍(赤系)で、形が layered(八重の丸弁分布)。(b) seed時 `.hana-seasons` が非表示(display:none or 無)。(c) seedなし mount は季節チップ表示・従来通り。Run→FAIL。

- [ ] **Step 2: deriveSeededPalette と createGarden seed 対応**。IIFE内に追加:
```js
  function deriveSeededPalette(accentHex, seasonName) {
    var base = SEASONS[seasonName] || SEASONS.spring;
    var a = hexToRgb(accentHex);
    var lighten = mixRgb(a, { r: 255, g: 255, b: 255 }, 0.28);
    var tint = mixRgb(a, hexToRgb(base.ground), 0.45);
    function toHex(c){ return '#'+[c.r,c.g,c.b].map(function(v){return ('0'+Math.round(v).toString(16)).slice(-2);}).join(''); }
    return { petals: [accentHex, toHex(lighten), toHex(tint)], core: base.core, ground: base.ground };
  }
```
createGarden(opts): 冒頭で `var seed = opts.seed || null;` を持ち、`seasonName` は seed?seed.seasonName:opts.season。spawn の form/palette を分岐:
```js
      form: seed ? seed.form : pickForm(rng),
```
redraw の drawFlower に渡す palette を `seed ? deriveSeededPalette(seed.accentColor, seasonName) : SEASONS[seasonName]` に（deriveは呼び出し毎でなく seed 時に1回作ってクロージャ保持し使い回す。redraw内で再生成しない）。press() も同 palette を使う（seed時は花色で押し花・ground/labelは季節）。setSeason は seed 時 no-op（背景も固定）。

- [ ] **Step 3: mount の seed 配線**。mount(container,opts): `var seed = opts.seed||null;` を createGarden に渡す。buildUi 後、seed時は `.hana-seasons` を隠す（`container.querySelector('.hana-seasons').style.display='none'`）。招待花は seed 時も invite（seed.form で中央に咲く＝createGardenがseed.form使用済み）。applyStageBg は seed?seed.seasonName:(opts.season||'spring')。

- [ ] **Step 4: テスト成功**。回帰: verify-hana-mount2.js(10/10)・verify-hana-integration2.js(15/15)・verify-hana-press.js(7/7)。

- [ ] **Step 5: Commit** `feat(ichi): 咲かせるにシード対応(その花の色・形・季節で固定)`

---

### Task 3: flora-data hanaForm ×24 ＋ index 各花入口

**Files:** Modify `website/flora/flora-data.js`（hanaForm×24）・`website/flora/index.html`（ボタン/seasonFromFlower/openHana(i)/委譲/i18n/?v=3）／Test `<scratchpad>/verify-hana-perflower.js`

**Interfaces:** Consumes mount({seed})（T2）。

- [ ] **Step 1: 失敗テスト**：`verify-hana-perflower.js`（website配信・/flora/ 実開）。(a) 各花セクションに `.hana-sow` ボタンが24個 (b) 3番目のボタン(椿=layered/#D64A6E)クリックで #hana-view 開き、なぞると赤紫系の layered が咲く (c) seed時 季節チップ非表示 (d) 汎用CTA(#hana-open)は従来通り(チップ表示) (e) エラー0。Run→FAIL。

- [ ] **Step 2: flora-data.js に hanaForm 付与**（上記マッピングの通り24件）。各花オブジェクトに `hanaForm: "<form>",` を追加（accentColor の近くに）。

- [ ] **Step 3: index.html**。
  1. `seasonFromFlower(f)`（birthMonths[0]→bucket・既定spring）を DOMContentLoaded 内ヘルパに追加。
  2. section.innerHTML のボタン行（fav-btn 群と同 div 内・末尾）に:
     `'<button type="button" class="hana-sow" data-sakaseru="' + i + '" data-i18n="meta.sow" aria-label="' + escAttr(f.title + 'を咲かせる') + '">この花を咲かせる</button>'`
  3. CSS `.hana-sow`（`.gem-chip`調・`border:1px solid var(--gem);color:var(--gem);`・hoverでうっすら塗り・小さめ）。
  4. i18n 辞書に `"meta.sow": { ja:"この花を咲かせる", en:"Sow this flower" }`。
  5. openHana を引数対応に:
```js
  function openHana(flowerIdx) {
    if (!window.NoctaHana || !hanaView) return;
    var seed = null;
    if (typeof flowerIdx === 'number' && typeof NOCTA_FLORA !== 'undefined' && NOCTA_FLORA[flowerIdx]) {
      var f = NOCTA_FLORA[flowerIdx];
      seed = { form: f.hanaForm || 'sakura', accentColor: f.accentColor, seasonName: seasonFromFlower(f), name: f.titleEn };
    }
    hanaDialog.open();
    hanaInstance = window.NoctaHana.mount(hanaMount, seed ? { seed: seed } : {});
  }
```
     （registerDialog経由の開閉は現行踏襲。hanaDialog.open()→onOpenでmountしている場合は、seedを渡す経路をopenHana(idx)に集約。現行の openHana/onOpen 実装に合わせて最小改修。）
  6. 委譲: 既存のクリック委譲（またはdocument）に `var sow=e.target.closest('.hana-sow'); if(sow){ openHana(parseInt(sow.getAttribute('data-sakaseru'),10)); return; }`。汎用CTA `#hana-open` は `openHana()`（引数なし=seedなし）。
  7. `hana.js?v=2` → `?v=3`。

- [ ] **Step 4: テスト成功＋回帰**：verify-hana-perflower.js PASS。`cd <scratchpad> && node verify-hana-integration2.js && node verify-iro.js && node verify-fude.js && node verify-zukan.js`（15/19/23/36維持）。

- [ ] **Step 5: Commit** `git add website/flora/flora-data.js website/flora/index.html` → `feat(ichi): 各花セクションから「この花を咲かせる」入口(hanaForm×24)`

---

### Task 4: 総合検証・レビュー・公開・docs

- [ ] **Step 1**: 全 hana スイート＋iro/fude/zukan 緑。
- [ ] **Step 2**: スクショ目視 — 各花入場(例: バラ=赤layered/桔梗=紫star/ひまわり=黄kiku)で「その花っぽい色・形」で咲くか。
- [ ] **Step 3**: 最終ブランチレビュー（Opus・requesting-code-review）。Critical/Important修正。
- [ ] **Step 4**: main へ必要ファイルのみ取込(hana.js/flora-data.js/index.html/docs)・混入ゼロ確認・push。
- [ ] **Step 5**: デプロイ監視・失敗時rerun・`hana.js?v=3`ライブ確認。
- [ ] **Step 6**: handoff 1行・DESIGN-NOTES §7 Ichi に per-flower入場追記・G-06デブリーフ。

---

## Self-Review 結果

**Spec coverage:** 新3形→T1 / seed対応(色・形・季節固定・チップ非表示)→T2 / 24 hanaForm＋各花入口＋openHana seeded→T3 / 検証公開→T4。全項目対応。
**Placeholder scan:** hanaFormマッピング24件・新形コード・deriveSeededPalette・seasonバケットは具体値。openHana は「現行onOpen実装に合わせ最小改修」と明記（現行がregisterDialog onOpenでmountしているため、実装者は現行を読んで seed 経路を通す）。
**Type consistency:** `mount({seed})`・`createGarden({seed})`・`seed={form,accentColor,seasonName,name}` はT2定義→T3使用一致。`hanaForm` はflora-data(T3)→openHana(T3)→mount(T2)へ。form名(star/layered/bell)はT1定義→T2/T3使用一致。
**リスク:** 新形の見た目・seed色の視認性はTスクショゲート。24付与漏れは既定sakuraフォールバック＋検証(a)。既存4形/seedなしの不変維持を各Tで回帰確認。
