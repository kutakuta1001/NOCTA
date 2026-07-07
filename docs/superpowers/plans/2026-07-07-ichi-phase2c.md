# Ichi Phase 2c「五感と一回性」Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development。実装サブエージェントは Sonnet、コードレビューは Codex（CEO指定）。

**Goal:** 5つの体験 — なぞり音（生成音・デフォルトオフ）／風の一吹き／長押しで大輪／今日の一花から咲かせる／押し花に日付 — を追加する。

**Architecture:** hana.js の延長。エンジン(createGarden)は音を知らず `onSpawn` コールバックのみ公開し、mount 側が oto（Web Audio）を接続。風・長押しは createGarden 内。press に漢数字日付。index.html は今日カード導線と seed.nameJa。

**Tech Stack:** Vanilla JS(IIFE)・Canvas 2D・Web Audio API・Playwright。ビルドなし。

## Global Constraints

- ビルドなし・素のJS(IIFE)・相対パス・website配下のみ。`git add` ファイル明示。
- コミット trailer: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`。
- 既存 hana スイート(forms14/seed13/engine2 9/press7/mount2 10/perflower12/phase2b19/season11/a1 8/integration2 15)＋iro19/fude23/zukan36 回帰維持。
- **音はデフォルトオフ・トグルonのユーザージェスチャでのみ AudioContext 生成/resume・detachでclose・オフ中はノード一切生成しない**。
- reduce-motion: 風なし・長押し大輪は即満開で提供・音はトグル依存（reduceと独立）。
- 既存挙動不変: 通常spawn/散る花/微風/farewell/招待花/seed/press透明前提。パーティクル上限120尊重。
- キャッシュバスター: `hana.js?v=5`。
- scratchpad実パス: `/private/tmp/claude-501/-Users-fghmacbook013-NOCTA/d33a3808-dccb-490e-8426-ee5196f85bf3/scratchpad`。Playwrightはwebsite配信+setContent+絶対URL（既存verify-hana-*.js流用）。
- テスト内部フラグ: `opts.__fastWind`（風間隔短縮）は本番未使用。wind/taika のランダムはブラウザ Math.random() 可。
- Codexレビューはリポジトリ内で `~/.claude/scripts/codex-review.sh diff`（T6で2周・Critical必修正）。

---

### Task 1: なぞり音（oto・デフォルトオフ）

**Files:** Modify `website/flora/hana.js`／Test `<scratchpad>/verify-hana-oto.js`

**Interfaces:**
- createGarden(opts) に `opts.onSpawn(f)` — spawn 毎に花オブジェクトを渡して呼ぶ（未指定なら何もしない）。
- buildUi のツールバー（.hana-clear の隣）に `<button type="button" class="hana-oto" aria-pressed="false">音を添える</button>`。
- mount 内 oto: `{ enabled:false, ctx:null, lastT:0, play(size) }`。トグルクリックで enabled 反転・初回onで `new (window.AudioContext||window.webkitAudioContext)()`・ラベルを「音を消す」に。mount の detach で `if(oto.ctx) oto.ctx.close()`。
- テスト観測用に `window.__hanaOto = { played: n, ctxCreated: bool }` を mount が更新（デバッグフック・既存 __hanaCount と同流儀）。

- [ ] **Step 1: 失敗テスト** `verify-hana-oto.js`: (a) mount直後 `__hanaOto.ctxCreated===false`（デフォルトオフ・ctx未生成） (b) .hana-oto クリック→ctxCreated true・aria-pressed true (c) なぞる→`__hanaOto.played` が増える (d) 再クリックでoff→なぞってもplayed増えない (e) detach後エラーなし (f) コンソールエラー0。Run→FAIL。

- [ ] **Step 2: 実装**。createGarden の spawn 末尾（kick前）に `if (opts.onSpawn) { try { opts.onSpawn(f); } catch(_){} }`。mount に oto:

```js
    var oto = { enabled: false, ctx: null, lastT: 0, played: 0 };
    function otoPublish() { if (typeof window !== 'undefined') window.__hanaOto = { played: oto.played, ctxCreated: !!oto.ctx }; }
    function otoPlay(f) {
      if (!oto.enabled || !oto.ctx) return;
      var t = oto.ctx.currentTime;
      if ((t - oto.lastT) < 0.09) return;              /* 最小発音間隔90ms */
      oto.lastT = t;
      /* 鈴/水滴の間の短い減衰音。花が大きいほど低く（440〜880Hz帯） */
      var size01 = Math.max(0, Math.min(1, (f.r - 10) / 40));
      var freq = 830 - size01 * 370;
      var g = oto.ctx.createGain();
      g.gain.setValueAtTime(0.05, t);
      g.gain.exponentialRampToValueAtTime(0.0004, t + 0.5);
      g.connect(oto.ctx.destination);
      var o1 = oto.ctx.createOscillator(); o1.type = 'sine'; o1.frequency.setValueAtTime(freq, t);
      var o2 = oto.ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.setValueAtTime(freq * 2.01, t);
      var g2 = oto.ctx.createGain(); g2.gain.value = 0.25; o2.connect(g2); g2.connect(g);
      o1.connect(g);
      o1.start(t); o2.start(t); o1.stop(t + 0.55); o2.stop(t + 0.55);
      oto.played++; otoPublish();
    }
```
createGarden 呼びに `onSpawn: otoPlay` を追加。onClick 委譲に `.hana-oto` 分岐（enabled反転・初回onでctx生成/resume・ラベル/aria-pressed更新・otoPublish）。detach で `try { if (oto.ctx) oto.ctx.close(); } catch(_){}`。buildUi に音ボタン追加（i18nは後続でよい・日本語固定で可）。

- [ ] **Step 3: テスト成功＋回帰**（mount2 10/perflower12/phase2b19/season11/integration2 15）。ボタン追加で mount2 のUI数assertが落ちる場合は新仕様に更新し報告。

- [ ] **Step 4: Commit** `feat(ichi): なぞり音(咲く瞬間の生成音・デフォルトオフ・Web Audio)`

---

### Task 2: 風の一吹き（kaze）

**Files:** Modify `website/flora/hana.js`／Test `<scratchpad>/verify-hana-kaze.js`

**Interfaces:** createGarden 内部のみ（API不変）。`opts.__fastWind`（テスト用・風間隔を約1.2秒に短縮）。

- [ ] **Step 1: 失敗テスト** `verify-hana-kaze.js`: mount `{__fastWind:true}` で数輪咲かせ待つ→(a) 風イベント中、全花が同方向に傾く（風前後のフレーム差が通常微風の差より大きい・または位相同期を画素で近似）(b) 加齢済み花があるとき風でパーティクルが余分に増える (c) reduce時は__fastWindでも風なし (d) エラー0。Run→FAIL。

- [ ] **Step 2: 実装**。createGarden 状態:
```js
    var wind = { until: 0, start: 0, dir: 1, strength: 0 };
    var nextWindT = 0; var fastWind = !!opts.__fastWind;
    function scheduleWind(t) { nextWindT = t + (fastWind ? 1200 : (40000 + Math.random() * 50000)); }
```
resize後の初期化付近で `scheduleWind(now())`。redraw 冒頭（tを得た後・非reduce・非farewell時）:
```js
      if (!reduce && !farewelling && t >= nextWindT) {
        wind.start = t; wind.until = t + 2500; wind.dir = Math.random() < 0.5 ? -1 : 1;
        wind.strength = 0.6 + Math.random() * 0.4;
        scheduleWind(t);
        /* 加齢期の花から最大3輪、花びらを1枚余分に舞わせる（風方向へ強めのドリフト） */
        var blown = 0;
        for (var wi = 0; wi < flowers.length && blown < 3; wi++) {
          var wf = flowers[wi];
          if (wf.maxShed > 0 && wf.shed < wf.maxShed && petals.length < PART_MAX) {
            petals.push({ x: wf.x, y: wf.y - wf.r * 0.4, vx: wind.dir * (0.05 + Math.random() * 0.04), vy: 0.015 + Math.random() * 0.015,
              rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.006, r: wf.r * 0.42,
              color: currentPalette().petals[0], bornT: t, life: 2800 });
            wf.shed++; blown++;
          }
        }
      }
      var windAmt = 0;
      if (t < wind.until) {
        var wp = (t - wind.start) / 2500;                     /* 0..1 */
        windAmt = Math.sin(Math.PI * Math.min(1, wp)) * wind.strength;  /* ease in-out */
      }
```
花の sway 計算に加算（depth浅いほど強く）:
```js
        var sway = reduce ? 0 : (0.035 * Math.sin(t * f.swayW + f.swayPhase) + windAmt * 0.12 * wind.dir * (1 - f.depth * 0.6));
```

- [ ] **Step 3: テスト成功＋回帰**（phase2b19/engine2 9 等）。

- [ ] **Step 4: Commit** `feat(ichi): 風の一吹き(時折庭に風が通り全花がそよぎ花びらが舞う)`

---

### Task 3: 長押しで大輪（taika）

**Files:** Modify `website/flora/hana.js`／Test `<scratchpad>/verify-hana-taika.js`

**Interfaces:** createGarden 内部（API不変）。

- [ ] **Step 1: 失敗テスト** `verify-hana-taika.js`: (a) pointerdownして動かさず700ms→花数が+1され、その花が大きい（canvas描画面積が単タップより明確に大）(b) pointerdown→すぐ10px move→700ms待ちでは大輪出ない（キャンセル）(c) reduce時も長押しで大輪（即満開）(d) エラー0。Run→FAIL。

- [ ] **Step 2: 実装**。createGarden の pointer 系に:
```js
    var holdTimer = null, holdPos = null;
    function clearHold() { if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; } holdPos = null; }
    function spawnGrand(x, y) {
      var rng = makeRng(seedCounter);
      var f = { x: x, y: y,
        r: 40 + rng() * 12, baseRot: rng() * Math.PI * 2,
        form: seed ? seed.form : pickForm(rng), seed: seedCounter++,
        bornT: now(), dur: 3500, depth: 0, vigor: 1,
        swayPhase: rng() * Math.PI * 2, swayW: 0.0005 + rng() * 0.0004,
        holdMs: 20000 + rng() * 10000, shed: 0, nextShedT: 0, maxShed: 0 };
      flowers.push(f); if (flowers.length > MAX_FLOWERS) flowers.shift();
      if (opts.onSpawn) { try { opts.onSpawn(f); } catch(_){} }
      kick();
    }
```
begin に: `holdPos = { x: p.x, y: p.y }; holdTimer = setTimeout(function () { if (holdPos) spawnGrand(holdPos.x, holdPos.y); clearHold(); }, 600);`
move に（冒頭・drawing判定後）: `if (holdPos) { var hdx = p.x - holdPos.x, hdy = p.y - holdPos.y; if (hdx*hdx + hdy*hdy > 64) clearHold(); }`
end/pointercancel/leave に `clearHold();`。detach にも `clearHold();`（timer残留防止）。
（fastAge時の holdMs は spawn と同基準にするなら `fastAge?600:...` を流用。）

- [ ] **Step 3: テスト成功＋回帰**（engine2/phase2b/oto/kaze）。

- [ ] **Step 4: Commit** `feat(ichi): 長押しで大輪(動かず待つと特別な一輪がゆっくり開く)`

---

### Task 4: 押し花に日付（＋seed.nameJa）

**Files:** Modify `website/flora/hana.js`・`website/flora/index.html`（seed構築に nameJa）／Test `<scratchpad>/verify-hana-hizuke.js`

**Interfaces:** press() のラベルが「<季節|花名> の 押し花 · <漢数字月日>」に。seed に `nameJa`（index.html の onOpen で `f.title` を渡す）。

- [ ] **Step 1: 失敗テスト** `verify-hana-hizuke.js`: (a) `NoctaHana._.kanjiDate(7,7)==='七月七日'`・`kanjiDate(12,31)==='十二月三十一日'`・`kanjiDate(1,21)==='一月二十一日'`（純関数）(b) 非seed press のラベル描画が従来より長い（日付分・画素幅比較 or ラベル領域の非空幅増）(c) seed(nameJa:'薔薇') の press が生成される（エラーなし・dataURL 有効）(d) エラー0。Run→FAIL。

- [ ] **Step 2: 実装**。IIFE に:
```js
  var KANJI_NUM = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  function kanjiNum(n) {
    if (n <= 10) return KANJI_NUM[n];
    if (n < 20) return '十' + KANJI_NUM[n - 10];
    return KANJI_NUM[Math.floor(n / 10)] + '十' + (n % 10 ? KANJI_NUM[n % 10] : '');
  }
  function kanjiDate(m, d) { return kanjiNum(m) + '月' + kanjiNum(d) + '日'; }
```
`_` 露出に kanjiDate 追加。press() のラベル:
```js
        var today = new Date();
        var dateLabel = kanjiDate(today.getMonth() + 1, today.getDate());
        var head = (seed && seed.nameJa) ? seed.nameJa : (labels[seasonName] || '');
        octx.fillText(head + ' の 押し花 · ' + dateLabel, w * 0.05, h * 0.955);
```
index.html の onOpen seed 構築に `nameJa: f.title` を追加。

- [ ] **Step 3: テスト成功＋回帰**（press7 は文言変更で落ちる場合、新ラベル仕様に更新し報告）。

- [ ] **Step 4: Commit** `feat(ichi): 押し花に漢数字の日付(seed時は花の名前)`

---

### Task 5: 今日の一花から咲かせる（index.html）

**Files:** Modify `website/flora/index.html`／Test `<scratchpad>/verify-hana-kyou.js`

**Interfaces:** Consumes openHana(idx)（既存）。buildToday が使う today の idx を保持。

- [ ] **Step 1: 失敗テスト** `verify-hana-kyou.js`: (a) 今日カード内に `.hana-sow-today` が存在 (b) クリックで #hana-view が開き（カードのjumpToは発火しない）今日の花の accentColor 系で咲く (c) カード本体クリックは従来通り該当セクションへスクロール (d) エラー0。Run→FAIL。

- [ ] **Step 2: 実装**。buildToday（今日カード生成箇所）で idx を変数に保持し、カード内 HTML 末尾に:
```js
        '<button type="button" class="hana-sow-today" data-i18n="meta.sow" aria-label="' + escAttr(f.title + 'を咲かせる') + '">この花を咲かせる →</button>'
```
CSS `.hana-sow-today`（today-card 内の小さなリンク調・var(--gem)系ではなくカード配色に合わせ淡く）。クリックは `stopPropagation()` して `openHana(idx)`。`hana.js?v=4`→`?v=5` もこのタスクで。

- [ ] **Step 3: テスト成功＋回帰**（integration2 15/season11/zukan36）。

- [ ] **Step 4: Commit** `feat(ichi): 今日の一花から咲かせる導線＋hana.js?v=5`

---

### Task 6: 総合検証・Codexレビュー・公開・docs

- [ ] **Step 1**: 全 hana スイート＋iro/fude/zukan 緑。
- [ ] **Step 2**: スクショ/実機的目視（音トグルUI・風・長押し大輪・今日導線・押し花日付）。
- [ ] **Step 3**: **Codexレビュー2周**（リポジトリ内 `~/.claude/scripts/codex-review.sh diff`）。Critical必修正・Warning採否判断・2周目でCritical 0。
- [ ] **Step 4**: main へ必要ファイルのみ取込（hana.js/index.html/docs）・混入ゼロ・push。
- [ ] **Step 5**: デプロイ監視・失敗時rerun・`hana.js?v=5`ライブ確認。
- [ ] **Step 6**: handoff 1行・DESIGN-NOTES §7 Phase2c追記・G-06デブリーフ。

---

## Self-Review 結果

**Spec coverage:** oto→T1 / kaze→T2 / taika→T3 / hizuke+nameJa→T4 / kyou→T5 / 検証・Codex・公開→T6。5体験すべて対応。
**Placeholder scan:** 周波数/gain/間隔/風強度/長押し閾値/漢数字は具体値。i18n は音ボタンのみ日本語固定可と明記。
**Type consistency:** `opts.onSpawn(f)` T1定義→T3 spawnGrand でも呼ぶ。`__fastWind` T2のみ。`kanjiDate` T4定義・`_`露出。`seed.nameJa` T4(hana)→T4(index)受け渡し。`openHana(idx)` 既存→T5使用。
**リスク:** 音の質・風の強さ・長押し誤発火は spec リスク表。press7/mount2 の既存assertは新仕様更新の可能性を各タスクに明記。
