# Ichi Phase 2d「大輪・葉の装飾・風の実感」Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development。実装SA=Sonnet、レビュー=Codex（CEO指定）。

**Goal:** ①長押し大輪を約2倍サイズに ②咲いた花の一部に葉が生え押し花の装飾になる ③風を視覚で強め音ON時は「そよ風」音を足す。

**Architecture:** hana.js の延長。葉は drawFlower に描画（花のrot/swayに追従・pressに自動反映）、大輪は spawnGrand の r 拡大、風は頻度/強度/枚数の調整＋ onWind コールバック→ oto のノイズ風音。index.html は cache-buster のみ。

**Tech Stack:** Vanilla JS(IIFE)・Canvas 2D・Web Audio API・Playwright。ビルドなし。

## Global Constraints
- ビルドなし・IIFE・相対パス・website配下のみ。`git add` ファイル明示。
- コミット trailer: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`。
- 既存 hana スイート（forms14/seed13/engine2 9/press7/mount2 10/perflower12/phase2b19/season11/oto14/kaze10/taika14/hizuke7/kyou12/integration2 15）＋iro19/fude23/zukan36 回帰維持。
- 既存不変: 通常花/なぞり/散る花/微風/farewell/seed/press透明前提/既存4→7形/shed=0。音はデフォルトオフ・onのユーザージェスチャでのみctx生成。reduce時 風・風音なし（葉は静的に付く）。
- キャッシュバスター `hana.js?v=6`。
- scratchpad実パス: `/private/tmp/claude-501/-Users-fghmacbook013-NOCTA/d33a3808-dccb-490e-8426-ee5196f85bf3/scratchpad`。Playwrightはwebsite配信+setContent+絶対URL（既存verify-hana-*.js流用）。
- Codexレビューはリポジトリ内 `~/.claude/scripts/codex-review.sh custom "<prompt>"` でブランチ差分（git diff main...HEAD）を対象に（T3で2周）。

---

### Task 1: 葉の装飾＋大輪サイズ2倍（drawFlower / spawn / spawnGrand）

**Files:** Modify `website/flora/hana.js`／Test `<scratchpad>/verify-hana-leaf.js`

**Interfaces:** flower に `leaves: [{ang,len}]`（0〜2枚）。drawFlower が o.leaves を描く（未指定は従来通り葉なし）。spawnGrand の r 拡大。

- [ ] **Step 1: 失敗テスト** `verify-hana-leaf.js`:
  (a) drawFlower に leaves を渡すと、渡さない時よりセージ緑(#6E7A55近傍)ピクセルが増える（葉が描かれる証拠）
  (b) 一定数(例30)なぞって咲かせると、葉付き花が1つ以上（シーンにセージ緑が出る）
  (c) 長押し大輪の r が拡大（大輪の描画bbox半径が旧spawnGrand上限52より明確に大・snapshotCountで大輪特定 or 描画面積比）かつ大輪は葉付き
  (d) 既存: leaves未指定のdrawFlowerは従来と同一（緑ピクセル0）
  (e) エラー0。Run→FAIL。

- [ ] **Step 2: drawFlower に葉描画**。花びらループの前（`ctx.rotate(o.rot||0)` 直後・shadow設定の前）に:
```js
    if (o.leaves && o.leaves.length) {
      var greenBase = { r: 0x6E, g: 0x7A, b: 0x55 };   /* セージグリーン */
      for (var li = 0; li < o.leaves.length; li++) {
        var lf = o.leaves[li];
        ctx.save();
        ctx.rotate(lf.ang);
        ctx.scale(openAng, openAng);
        var ll = r * (lf.len || 1.2);
        var lg = ctx.createLinearGradient(0, 0, 0, -ll);
        lg.addColorStop(0, rgba(greenBase, 0.82));
        lg.addColorStop(1, rgba(mixRgb(greenBase, ground, 0.5), 0.42));
        ctx.fillStyle = lg;
        petal(ctx, ll, ll * 0.32);                 /* しずく形の葉 */
        ctx.fill();
        ctx.strokeStyle = rgba(mixRgb(greenBase, { r: 0, g: 0, b: 0 }, 0.25), 0.4);
        ctx.lineWidth = Math.max(0.5, ll * 0.02);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -ll * 0.9); ctx.stroke();  /* 葉脈 */
        ctx.restore();
      }
    }
```
（花のtranslate/rotate内なのでsway/風で花と一緒に揺れる。花びらより先に描くので葉は花の背後から覗く。）

- [ ] **Step 3: spawn に葉付与・spawnGrand 拡大**。
spawn の flower オブジェクト生成後（push前）に:
```js
      var leafN = (rng() < 0.5) ? (rng() < 0.4 ? 2 : 1) : 0;   /* 約半数に1〜2枚 */
      f.leaves = [];
      for (var lk = 0; lk < leafN; lk++) {
        f.leaves.push({ ang: (lk === 0 ? 2.35 : -2.35) + (rng() - 0.5) * 0.5, len: 1.05 + rng() * 0.5 });
      }
```
spawnGrand: `r: 82 + rng() * 22`（旧40+rng*12から約2倍）に変更し、直後に葉を必ず2枚:
```js
      f.leaves = [{ ang: 2.3, len: 1.25 }, { ang: -2.3, len: 1.15 }];
```

- [ ] **Step 4: テスト成功＋スクショ目視**。`verify-hana-leaf.js` PASS。回帰: forms14/press7/engine2 9/phase2b19/taika14。スクショで葉が花に自然に添い、大輪が大きく、押し花に葉が写ることを確認。

- [ ] **Step 5: Commit** `git add website/flora/hana.js` → `feat(ichi): 葉の装飾(花の根元に葉が生え押し花を彩る)＋長押し大輪を約2倍に`

---

### Task 2: 風の実感（視覚強化＋音ON時のそよ風音）

**Files:** Modify `website/flora/hana.js`／Test `<scratchpad>/verify-hana-wind2.js`

**Interfaces:** createGarden に `opts.onWind()` コールバック追加。mount が oto.playWind を接続。`__hanaOto` に `wind` カウンタ追加。

- [ ] **Step 1: 失敗テスト** `verify-hana-wind2.js`:
  (a) 頻度短縮の反映（`nextWindT` の間隔が新レンジ相当・`__fastWind`で発火）
  (b) 風発火時の舞う花びらが増（加齢花から最大5枚・旧3より多い）＋そよぎが強い（sway振れ大）
  (c) 音ON＋`__fastWind`で風発火時 `__hanaOto.wind` が増える（onWind→playWind）。音OFFでは増えない。
  (d) reduce時は風・風音なし
  (e) エラー0。Run→FAIL。

- [ ] **Step 2: 風の頻度・強度・枚数**。
`scheduleWind` の間隔: `40000 + Math.random()*50000` → `16000 + Math.random()*18000`（16〜34秒）。
風発火ブロックの舞う枚数上限 `blown < 3` → `blown < 5`。
sway の風項係数 `windAmt * 0.12 * ...` → `windAmt * 0.2 * ...`。
風発火ブロック末尾に `if (opts.onWind) { try { opts.onWind(); } catch(_){} }`。

- [ ] **Step 3: oto に playWind（ノイズ風音）**。mount の oto 付近に:
```js
    function otoPlayWind() {
      if (!oto.enabled || !oto.ctx) return;
      var ctx = oto.ctx, t = ctx.currentTime, dur = 1.8;
      var buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;   /* ホワイトノイズ */
      var src = ctx.createBufferSource(); src.buffer = buf;
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(520, t);
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.03, t + 0.5);          /* そよ風の立ち上がり */
      g.gain.linearRampToValueAtTime(0.0001, t + dur);        /* 収まり */
      src.connect(lp); lp.connect(g); g.connect(ctx.destination);
      src.start(t); src.stop(t + dur);
      oto.wind = (oto.wind || 0) + 1; otoPublish();
    }
```
`otoPublish` の window.__hanaOto に `wind: oto.wind || 0` を追加。createGarden 呼びに `onWind: otoPlayWind` を追加。

- [ ] **Step 4: テスト成功＋回帰**（oto14/kaze10/phase2b19/engine2 9・音・風関連）。既存 kaze の枚数assertが3前提なら5に更新し報告。

- [ ] **Step 5: Commit** `git add website/flora/hana.js` → `feat(ichi): 風を実感しやすく(頻度短縮・そよぎ強化・舞う枚数増)＋音ON時のそよ風音`

---

### Task 3: 総合検証・Codex2周・公開・docs

- [ ] **Step 1**: 全 hana スイート＋iro/fude/zukan 緑。`hana.js?v=6` に更新（index.html）＋ `verify-hana-integration2.js` 等でv=6反映確認。
- [ ] **Step 2**: スクショ目視（葉付き花・大輪・風の強まり）。
- [ ] **Step 3**: **Codexレビュー2周**（`codex-review.sh custom` でブランチ差分・website/flora/hana.js中心）。Critical必修正・2周目Critical 0。
- [ ] **Step 4**: main へ必要ファイルのみ取込（hana.js/index.html/docs）・混入ゼロ・push。
- [ ] **Step 5**: デプロイ監視・失敗時rerun・`hana.js?v=6`ライブ確認。
- [ ] **Step 6**: handoff 1行・DESIGN-NOTES §7 Phase2d追記・G-06デブリーフ。

---

## Self-Review 結果
**Spec coverage:** 大輪2倍→T1 / 葉の装飾→T1 / 風の視覚強化→T2 / 風音→T2 / 検証公開→T3。3依頼すべて対応。
**Placeholder scan:** 葉の色(#6E7A55)・角度(±2.35)・大輪r(82+22)・風頻度(16-34s)・係数(0.2)・枚数(5)・風音(lowpass520/gain0.03/1.8s)は具体値。
**Type consistency:** flower.leaves は spawn/spawnGrand が付与→drawFlower(o.leaves)が読む。opts.onWind() は createGarden(T2)→mount(otoPlayWind接続)。__hanaOto.wind は otoPlayWind→テスト。既存 onSpawn/oto と同パターン。
**リスク:** 葉の緑・大輪サイズ・風強度・風音はスクショ/目視ゲート（spec リスク表）。既存assert(kaze枚数3)は新仕様5に更新の可能性を明記。
