# Ichi Phase 2g「自動で仕上がる草花の一枚」Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development。実装SA=Sonnet、レビュー=Codex（CEO指定・ブランチ差分を2周）。Steps は checkbox（`- [ ]`）。

**Goal:** 放置（アイドル）で庭が自動的に、大小の花＋緑を画面いっぱいに密に構成し、背景が暗い光の庭→明るい生成りへ移ろい、完成形（FILL_TARGET）まで育って静かに落ち着く＝勝手に参考画像のような美術的な一枚に仕上がる。タップ追加・突風クリアは維持。

**Architecture:** hana.js の延長。既存アイドル駆動自生（Phase2f）を拡張＝FILL_TARGET 28→44・ambientSprout のサイズ/配分/配置を大きく美術的に。庭の充実度 fillRatio で `.hana-stage` 背景を暗→生成り lerp、明地では花描画を軽く押し花寄りに補正。index.html は cache-buster のみ。

**Tech Stack:** Vanilla JS(IIFE)・Canvas 2D・Web Audio API・Playwright。ビルドなし。

## Global Constraints
- ビルドなし・IIFE・相対パス・website配下のみ。`git add` はファイル明示（`-A`/`.` 禁止）。website/flora/hana.js と website/flora/index.html のみ対象（テストは scratchpad・git管理外）。
- コミット trailer: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`。
- 既存不変: 草花4種描画・なぞりミックス・風(16-34秒/sway/onWind音)・散り(花)・長押し大輪・farewell・seed・press(押し花標本ボードbeige・独立)・突風クリア(clear)・アイドル駆動(IDLE_MS3000/操作リセット/pointerleaveは非操作)・__noSprout・reduce時は自生/背景移ろい/風/散りなし。既存 drawFlower('flower'経路)は不変。
- 数値: FILL_TARGET=44・大輪級 r70〜100・中 r40〜65・小/緑 r26〜46・緑比率~40%・生成りbeige目標 #E4D9C4〜#DED3BC・IDLE_MS3000/interval3-6s(既存)・MAX_FLOWERS400(既存上限)。
- 既存回帰スイート維持: util12/forms14/seed13/engine2 9/press7/mount2 10/perflower12/phase2b19/season11/oto14/kaze10/taika14/hizuke7/kyou12/integration2 15/leaf13/wind2 17/phase2e92/phase2f33 ＋ iro19/fude23/zukan36。
- 既存 setTimeout 駆動自生・detach clearTimeout・reduce時 needLoop=false 維持。
- キャッシュバスター: T3完了時 `hana.js?v=8`→`hana.js?v=9`。
- scratchpad実パス: `/private/tmp/claude-501/-Users-fghmacbook013-NOCTA/d33a3808-dccb-490e-8426-ee5196f85bf3/scratchpad`。Playwrightはwebsite配信+setContent+絶対URL（既存 verify-hana-*.js 流用）。node --check/node はリポジトリ内で実行。
- Codexレビュー: `~/.claude/scripts/codex-review.sh custom "<prompt>"` で `git diff main...HEAD`（T3で2周）。

---

### Task 1: 自生を画面いっぱいの構成に（FILL_TARGET拡張＋サイズ/配分/配置）

**Files:** Modify `website/flora/hana.js`／Test `<scratchpad>/verify-hana-phase2g.js`

**Interfaces:**
- Consumes: 既存 `RESTING_COUNT`(28)・`ambientSprout()`・`maybeSprout()`・`flowers[]`・`pickForm`/`makeRng`/`currentPalette`/`seedCounter`・場所バイアス（候補5点最遠）。
- Produces: `FILL_TARGET`(44) が自生の停止基準（RESTING_COUNT を置換 or 併存）。ambientSprout がサイズ強弱（大輪級/中/小・緑混在）で芽吹く。テスト用 `entityCount`(既存)・`snapshotSizes`（要素rの配列・大小確認用）。

- [ ] **Step 1: 失敗テスト** `verify-hana-phase2g.js`（既存 verify-hana-phase2f.js / phase2e.js の __fastGrow・時間送り手法を流用）:
  (a) __fastGrow で放置すると entityCount が **44付近**まで増え、そこで停止（44を大きく超えない・例 <=46）。
  (b) 自生要素に **大輪級（r>=70）が1つ以上**含まれ、かつサイズに強弱がある（最大r/最小r >= 1.6）。全部小さくない。
  (c) 花:緑の比率が「花主役」（flower >= 緑）。
  (d) reduce では増えない。
  Run→FAIL。

- [ ] **Step 2: FILL_TARGET 導入**。`RESTING_COUNT=28` を `FILL_TARGET=44` に置換（or `var FILL_TARGET=44` を追加し、maybeSprout/ambient の停止判定を FILL_TARGET に。__noSprout・reduce ガードは不変）。停止判定箇所（`flowers.length >= RESTING_COUNT`）をすべて FILL_TARGET に統一。

- [ ] **Step 3: ambientSprout のサイズ/配分**。芽吹く要素の r とkind を、fill を彩る配分に:
```js
      /* 大小のリズム: 大輪級を時々・中サイズの花・小花/緑で隙間を埋める。花が主役(緑~40%)。 */
      var rr = makeRng(seedCounter);
      var roll = rr();
      var kind, size;
      if (roll < 0.15) { kind = 'flower'; size = 70 + rr() * 30; }          /* 主役の大輪級 r70-100 */
      else if (roll < 0.60) { kind = 'flower'; size = 40 + rr() * 25; }      /* 中サイズの花 r40-65 */
      else { kind = ['sprig','fern','umbel','floret'][Math.floor(rr()*4)]; size = 26 + rr() * 20; } /* 緑/小花 r26-46 */
      /* f.r = size; f.kind = kind; …既存 ambientSprout の要素生成に反映(他フィールドは既存踏襲) */
```
（既存 ambientSprout の flower オブジェクト生成に size/kind を反映。緑は maxShed=0・散らない既存方針を維持。onSpawn を呼ばない=無音も維持。）

- [ ] **Step 4: 配置（大要素の重なり緩和）**。既存の候補5点最遠バイアスに、**大きい要素(size>=70)のときは候補数を増やす/最小距離を大きめに**して過度な重なりを避ける（小要素・緑は隙間を埋めてよい）。密度44でも大輪が団子にならないこと。

- [ ] **Step 5: テスト成功＋スクショ**。phase2g PASS。回帰（scratchpad）: `node verify-hana-phase2e.js`（FILL_TARGET変更で自生テストの期待値=28→44 を正当更新し報告）・`node verify-hana-phase2f.js`（同）・`node verify-hana-engine2.js` `node verify-hana-mount2.js` `node verify-hana-kaze.js` `node verify-hana-wind2.js` `node verify-hana-integration2.js` `node verify-hana-taika.js` 全緑。スクショで大小の草花が画面に増えていく様子を確認。

- [ ] **Step 6: Commit** `git add website/flora/hana.js` → `feat(ichi): 自生を画面いっぱいの構成に(FILL_TARGET44・大輪級/中/小の強弱・美術的配置)`

---

### Task 2: 背景の移ろい（暗い庭→明るい生成り）＋明地での花の可読性

**Files:** Modify `website/flora/hana.js`（＋必要なら `website/flora/index.html` の stage フック）／Test `<scratchpad>/verify-hana-phase2g.js`（拡張）

**Interfaces:**
- Consumes: `.hana-stage`（既存の季節連動 光だまり背景・CSS）・`flowers[]`・`FILL_TARGET`・`reduce`・redraw ループ。
- Produces: `fillRatio = Math.min(1, flowers.length / FILL_TARGET)`。ステージ背景を warm-black → 生成りbeige へ fillRatio で lerp（JSから `.hana-stage` の背景を更新）。明地(fillRatio高)では花描画を軽く押し花寄り補正。テスト用 `stageBgSample()` or `__hanaFill`（fillRatio公開）。

- [ ] **Step 1: 失敗テスト追加** verify-hana-phase2g.js:
  (a) 背景移ろい: 空/クリア直後は stage 背景が暗い（低輝度）。__fastGrow で自生が進み fillRatio が上がると stage 背景の輝度が上がる（明るい生成り側へ）。輝度サンプル（getComputedStyle background or canvas外のstage色）で before<after を確認。
  (b) 完成付近では生成りに近い明るい背景。
  (c) reduce では背景が移ろわない（暗いまま）。
  (d) 突風クリア後は暗い背景に戻る（fillRatio=0）。
  Run→FAIL。

- [ ] **Step 2: fillRatio と背景 lerp**。redraw（or 要素増減時）で fillRatio を算出し、`.hana-stage` 背景を暗→生成りへ補間:
```js
    function updateStageTone() {
      if (!stage) return;
      var fr = reduce ? 0 : Math.min(1, flowers.length / FILL_TARGET);
      /* warm-black(暗い光の庭) → 生成りbeige。既存の光だまり(radial)は残し、地色をlerp。 */
      var dark = { r: 0x0A, g: 0x09, b: 0x06 }, beige = { r: 0xE4, g: 0xD9, b: 0xC4 };
      var base = mixRgb(dark, beige, fr);
      stage.style.background = '...'+ /* 既存の radial-gradient 光だまりを base の上に重ねる形で再構成 */;
    }
```
（既存の stage 背景生成箇所＝季節連動の CSS/JS を Read し、その地色を fillRatio で生成り側へ寄せる。光だまり・グレインは維持。reduce時は fr=0 固定。要素の増減（自生・tap・clear・散り）後に updateStageTone を呼ぶ。）

- [ ] **Step 3: 明地での花の可読性**。fillRatio が高い（明るい）ときに花の「暗い庭で光る」表現が沈む/浮くのを防ぐ:
   drawFlower は不変に保ちたいので、**redraw が drawEntity に渡す描画時に、明地補正を薄くかける**方針（例: fillRatio高で ctx に軽い彩度/コントラスト寄りの合成、またはグロー(影)のalphaを fillRatio で下げる）。最小限で、暗地(fillRatio低)では従来と完全同一に保つこと（fillRatio=0 で既存不変）。実装は redraw 側の合成パラメータで行い drawFlower 本体は触らない。詳細はスクショ目視で追い込む。

- [ ] **Step 4: テスト成功＋スクショ目視（必須）**。phase2g PASS。回帰: `node verify-hana-season.js`（stage背景を触るなら季節カバー色テストに影響しないか・必要なら正当更新し報告）・`node verify-hana-phase2b.js`（背景CSS前提があれば）・`node verify-hana-mount2.js` `node verify-hana-press.js`（press は独立・不変）・その他既存全緑。**スクショで「暗い庭→明るい生成りの密な草花の一枚」への移ろいと、明地でも花が沈まないことを確認**（沈む/濁るなら補正・生成り色を調整）。

- [ ] **Step 5: Commit** `git add website/flora/hana.js`（＋必要時 index.html）→ `feat(ichi): 充実に応じ背景が暗い庭→明るい生成りへ移ろい花を明地で可読に(自動で美術的な一枚に仕上がる)`

---

### Task 3: 総合検証・Codex2周・公開・docs

- [ ] **Step 1**: 全 hana スイート（既存＋phase2e＋phase2f＋phase2g）＋iro/fude/zukan 緑。`hana.js?v=8`→`?v=9`（index.html）。node --check OK。phase2e/2f の FILL_TARGET/背景関連の期待値更新を確定。
- [ ] **Step 2**: スクショ/実機目視（放置で暗→明るい生成りの密な一枚に仕上がる過程・完成形が参考画像の質感に近いか・大小のリズム・明地での可読性）。
- [ ] **Step 3**: **Codexレビュー2周**（`codex-review.sh custom` でブランチ差分・hana.js中心）。重点: (a)FILL_TARGET拡張で自生タイマー/停止/リーク/暴走がないか (b)背景 lerp が redraw ホットパスで過度に重くないか・fillRatio 算出の妥当性・reduce網羅 (c)明地補正が fillRatio=0 で既存完全不変か・drawFlower不変 (d)密度44＋大輪でのパフォーマンス/MAX_FLOWERS整合 (e)既存(tap/突風/press/風/散り/seed)への退行。Critical必修正・2周目Critical 0。
- [ ] **Step 4**: main へ必要ファイルのみ取込（hana.js/index.html/docs）・混入ゼロ（`git diff main...HEAD --stat` 確認）・push。
- [ ] **Step 5**: デプロイ監視・失敗時rerun・`hana.js?v=9` ライブ確認。
- [ ] **Step 6**: handoff 1行・DESIGN-NOTES §7 Phase2g追記・G-06デブリーフ。

---

## Self-Review 結果
**Spec coverage:** 密に敷き詰める(FILL_TARGET44)→T1 / 大きく画面いっぱい(サイズ強弱・大輪級)→T1 / 明るい生成りに寄せる(背景暗→beige lerp)→T2 / 完成で静止→T1(FILL_TARGET停止) / 明地の可読性→T2 / 検証公開→T3。CEOの3判断(密・完成静止・生成りトーン)を網羅。
**Placeholder scan:** FILL_TARGET44・r帯(70-100/40-65/26-46)・緑比率40%・生成り#E4D9C4〜#DED3BC・配分roll閾値(0.15/0.60)は具体値。背景lerp/明地補正は「既存stage背景をReadして地色をfillRatioで寄せる」「fillRatio=0で既存不変」と明示・視覚はスクショゲート。
**Type consistency:** FILL_TARGET は maybeSprout/ambient/fillRatio が参照。fillRatio=flowers.length/FILL_TARGET→updateStageTone。明地補正は redraw 合成側(drawFlower不変)。既存 ambientSprout/場所バイアス/__noSprout/reduce/mixRgb/currentPalette を流用。
**リスク:** 明地で花が沈む→fillRatio=0不変＋補正はスクショ目視で調整。密度44の重さ→数値調整可・完成停止。phase2e/2f期待値(28→44・背景)は正当更新のみ・報告。世界観の棲み分け(操作中=暗/自動仕上がり=明)を明記。
