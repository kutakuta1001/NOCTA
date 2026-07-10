# Ichi Phase 2h「密度調整・自動明るさ・図鑑連動・和の音」Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development。実装SA=Sonnet、レビュー=Codex（CEO指定・ブランチ差分を2周）。Steps は checkbox（`- [ ]`）。

**Goal:** ①完成密度44→30 ②大輪の重なり減(最小距離広め) ③背景の明るさは自動自生の分だけ連動(タップ/なぞりでは明るくしない) ④自生が操作後も再開することを回帰テストで確証 ⑤図鑑24種の実物(色/形)を自動の庭に咲かせる ⑥咲く音を和の五音階でやさしいメロディー調に。コンセプト不変。

**Architecture:** hana.js の延長。FILL_TARGET=30・大輪クリアランス強化・ambientCount カウンタで背景 fillRatio を自動由来に分離・opts.flowerKinds(index.html が NOCTA_FLORA から渡す)で ambient の花を deriveSeededPalette+hanaForm 連動・otoPlay を yo旋法にクォンタイズ。

**Tech Stack:** Vanilla JS(IIFE)・Canvas 2D・Web Audio API・Playwright。ビルドなし。

## Global Constraints
- ビルドなし・IIFE・相対パス・website配下のみ。`git add` はファイル明示（`-A`/`.` 禁止）。website/flora/hana.js と website/flora/index.html のみ対象（テストは scratchpad・git管理外）。
- コミット trailer: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`。
- 既存不変: 草花4種描画・なぞりミックス・風・散り・長押し大輪・farewell・突風クリア・アイドル駆動(IDLE_MS3000/操作リセット)・__noSprout・press標本・seed・reduce時は自生/背景移ろい/風/散りなし。既存 drawFlower('flower'経路)不変。デフォルト無音(音ONトグル時のみ)。
- 数値: FILL_TARGET=30・大輪size>=70・yo旋法(和の五音階)・IDLE_MS3000(既存)・MAX_FLOWERS400(既存)・生成りbeige #E4D9C4〜#DED3BC(既存)。
- 既存回帰: util12/forms14/seed13/engine2 9/press7/mount2 10/perflower12/phase2b19/season11/oto14/kaze10/taika14/hizuke7/kyou12/integration2 15/leaf13/wind2 17/phase2e92/phase2f33/phase2g28 ＋ iro19/fude23/zukan36。
- 既存ヘルパ流用: `deriveSeededPalette(accentHex, seasonName)`(花色パレット生成・seed時と同じ)・`pickForm`・`makeRng`・`mixRgb`・`currentPalette`・`applyStageBg`・`ambientSprout`・`otoPlay`。
- キャッシュバスター: T5完了時 `hana.js?v=9`→`hana.js?v=10`。
- scratchpad実パス: `/private/tmp/claude-501/-Users-fghmacbook013-NOCTA/d33a3808-dccb-490e-8426-ee5196f85bf3/scratchpad`。node --check/node はリポジトリ内で。テストは複数回実行で安定確認(自生絡みは特に)。
- Codexレビュー: `~/.claude/scripts/codex-review.sh custom "<prompt>"` で `git diff main...HEAD`（T5で2周）。

---

### Task 1: 密度30・大輪の重なり減（依頼1,2）

**Files:** Modify `website/flora/hana.js`／Test `<scratchpad>/verify-hana-phase2h.js`

**Interfaces:** Consumes 既存 `FILL_TARGET`(44)・大輪クリアランス配置(7x6グリッド)。Produces FILL_TARGET=30・大輪の最小クリアランス拡大。

- [ ] **Step 1: 失敗テスト** `verify-hana-phase2h.js`（既存 phase2g/phase2f の __fastGrow・時間送り流用）:
  (a) __fastGrow 放置で entityCount が **30付近**で停止（30を大きく超えない・<=32）。
  (b) 大輪級(r>=70)同士の最小中心間距離が、旧FILL44時より広い（or 縁-縁クリアランス >= 拡大した閾値。大輪が明確に重ならない）。
  Run→FAIL。

- [ ] **Step 2: FILL_TARGET=30**。`FILL_TARGET=44`→`30`。停止・fillRatio 参照箇所を確認（fillRatio は T2 で分離）。

- [ ] **Step 3: 大輪クリアランス拡大**。ambientSprout の配置で、size>=70 の大輪は最小クリアランス閾値を大きく（例 大輪は size*0.5 以上のクリアランスを要求）、候補（7x6セル×複数点）で満たすものが無ければ**その周期は中サイズ以下に格下げ**（大輪の団子回避）。中小/緑は従来。

- [ ] **Step 4: テスト成功＋スクショ**。phase2h PASS。回帰: `node verify-hana-phase2g.js`（entityCount上限44→30前提のassertを30へ正当更新・報告）・`node verify-hana-phase2e.js` `node verify-hana-phase2f.js` `node verify-hana-mount2.js` `node verify-hana-engine2.js` 全緑。スクショで密度30・大輪が重ならないこと。

- [ ] **Step 5: Commit** `git add website/flora/hana.js` → `feat(ichi): 完成密度を30に・大輪の重なりを減らす(最小距離拡大)`

---

### Task 2: 明るさを自動自生の時だけに＋自生resume回帰テスト（依頼3,4）

**Files:** Modify `website/flora/hana.js`／Test `<scratchpad>/verify-hana-phase2h.js`（拡張）

**Interfaces:** Consumes `ambientSprout`・`flowers[]`・`currentFillRatio`・`applyStageBg`・clear()。Produces `ambientCount`（ambient由来カウンタ）・fillRatio を ambientCount 連動に。テスト用 `ambientCount()` getter。

- [ ] **Step 1: 失敗テスト追加**:
  (c-明るさ自動限定) タップ相当で花を複数追加しても `__hanaFill`(fillRatio) と背景輝度が上がらない（暗いまま）。自動自生（__fastGrow放置）が進むと fillRatio↑・背景輝度↑。突風クリアで fillRatio=0・暗へ。
  (d-resume) mount→tap1回→__fastGrowで時間を進める→entityCount 増加（自生が操作後も再開）。tap直後IDLE_MS未満では増えない。
  Run→FAIL。

- [ ] **Step 2: ambientCount 導入**。createGarden state に `var ambientCount = 0;`。ambientSprout 内で要素を push した後 `ambientCount++`。tap/なぞり spawn・spawnGrand では増やさない。clear()（両分岐）で `ambientCount = 0`。

- [ ] **Step 3: fillRatio を ambientCount 連動に**。`currentFillRatio()` を `reduce ? 0 : Math.min(1, ambientCount / FILL_TARGET)` に変更（総数 flowers.length ではなく ambientCount）。applyStageBg 呼びは既存の onFill 経路のまま（値の出所だけ変更）。自生の停止は従来通り `flowers.length >= FILL_TARGET`（総数）で判定（明るさとは分離）。

- [ ] **Step 4: resume 確証**。（調査でコード修正不要の想定。）テスト(d)で mount→tap→idle 経過→自生増加を確認。**もしテストで増えなければ真のバグ**→ maybeSprout/armSproutTimer/redraw保険の該当を修正（lastInteractT/nextSproutT/timer の経路を追う）。

- [ ] **Step 5: テスト成功＋回帰**。phase2h PASS。回帰: `node verify-hana-phase2g.js`（背景輝度テストが総数連動前提なら ambient連動へ正当更新・報告）・`node verify-hana-season.js` `node verify-hana-mount2.js` `node verify-hana-phase2f.js`（clear→暗）・`node verify-hana-integration2.js` 全緑。複数回実行で安定。

- [ ] **Step 6: Commit** `git add website/flora/hana.js` → `feat(ichi): 背景の明るさを自動自生の分だけに(タップ/なぞりでは明るくしない)＋自生resume回帰テスト`

---

### Task 3: 図鑑24種の実物を咲かせる（依頼5）

**Files:** Modify `website/flora/hana.js`・`website/flora/index.html`／Test `<scratchpad>/verify-hana-phase2h.js`（拡張）

**Interfaces:** Consumes `deriveSeededPalette(accentHex, seasonName)`・`ambientSprout`・現在の季節。Produces `opts.flowerKinds`（`[{color, form, season}]`）を index.html が mount へ渡し、ambient の花要素がそれを使う。

- [ ] **Step 1: 失敗テスト追加**:
  (e) createGarden に flowerKinds=[{color:'#F7C6D4',form:'sakura',...},{color:'#C0395B',form:'kiku',...},...] を渡して __fastGrow 放置すると、自生の花要素の色が**複数種**現れる（単一season一色でない・シーンに複数の色相の花）。flowerKinds 未指定なら従来(currentPalette + pickForm)フォールバックで動作。
  Run→FAIL。

- [ ] **Step 2: ambientSprout の図鑑連動**。ambientSprout が「花」kind を生やすとき、`opts.flowerKinds` があれば1種をランダム選択し、
  `palette = deriveSeededPalette(kind.color, seasonName)`・`form = kind.form` で咲かせる（緑kindは従来通り）。
  flowerKinds 無ければ従来（`palette = currentPalette()`・`form = pickForm(rng)`）。
  （現在の季節に属する花を軽く優先してもよいが必須でない。基本は多様性。）

- [ ] **Step 3: index.html で flowerKinds を渡す**。hana の mount 呼び出し（onOpen 等）で、`NOCTA_FLORA` から
  `flowerKinds: NOCTA_FLORA.map(function(f){ return { color: f.accentColor, form: f.hanaForm, season: f.season }; })` を opts に追加。
  mount → createGarden へ `flowerKinds: opts.flowerKinds` を転送（既存 __fastAge 等と同様）。

- [ ] **Step 4: テスト成功＋スクショ**。phase2h PASS。回帰: `node verify-hana-seed.js`（seed時の色は不変か）・`node verify-hana-perflower.js` `node verify-hana-phase2g.js` `node verify-hana-mount2.js` 全緑。スクショで多彩な図鑑の花（桜/菊/薔薇…の色形）が自動の庭に咲くこと。

- [ ] **Step 5: Commit** `git add website/flora/hana.js website/flora/index.html` → `feat(ichi): 自動の庭に図鑑24種の実物(色・形)を咲かせる(季節と花種を活かす)`

---

### Task 4: 咲く音を和の五音階でやさしく（依頼6）

**Files:** Modify `website/flora/hana.js`／Test `<scratchpad>/verify-hana-phase2h.js`（拡張）

**Interfaces:** Consumes `otoPlay(f)`・`oto`。Produces otoPlay の周波数を yo旋法(和の五音階)にクォンタイズ。テスト用 `__hanaOto` に直近発音周波数 or 音度を公開（scale検証用）。

- [ ] **Step 1: 失敗テスト追加**:
  (f) 音ON+複数回 spawn で、鳴った周波数が**yo旋法の集合（基音×比の許容集合）に含まれる**（連続値でなく量子化）。音OFFで無音（played増えない）。
  Run→FAIL。

- [ ] **Step 2: otoPlay の五音階化**。yo旋法（例: 相対音度比 [1, 9/8, 4/3, 3/2, 5/3] を基音に乗ずる=ペンタトニック的な和の音階）を定義。基音（例 293.66Hz≈D4 付近）を落ち着いた低め帯に。
  花のサイズ or 咲いた順（oto.played）で音度を選ぶ（連続で咲くとやさしい旋律になる）。軽い揺らぎ可。
  例:
  ```js
  var YO = [1, 1.125, 1.333, 1.5, 1.667];        /* 和の五音(陽旋法・近似) */
  var BASE = 311;                                  /* 落ち着いた基音Hz(低め) */
  var deg = /* size or oto.played に応じ 0..4 を選ぶ(+オクターブ揺らぎ可) */;
  var freq = BASE * YO[deg] * (rareOctaveUp ? 2 : 1);
  ```
  音色（sine+triangle）・エンベロープはやさしい減衰に（角を取る）。最小発音間隔90msは維持（旋律感が出るなら微調整可）。
  `otoPublish` の `window.__hanaOto` に直近周波数 `lastFreq`（or 音度）を追加（テスト用）。

- [ ] **Step 3: テスト成功＋実機/耳で確認**。phase2h PASS。回帰: `node verify-hana-oto.js`（freq連続前提のassertがあれば五音階へ正当更新・報告。音が鳴る/OFFで無音/onended disconnect は不変）。他 hana スイート緑。可能なら実機で心地よさを一言メモ。

- [ ] **Step 4: Commit** `git add website/flora/hana.js` → `feat(ichi): 咲く音を和の五音階(陽旋法)にし心が安らぐやさしい響きに`

---

### Task 5: 総合検証・Codex2周・公開・docs

- [ ] **Step 1**: 全 hana スイート（既存＋phase2e/2f/2g/2h）＋iro/fude/zukan 緑（自生・音絡みは複数回で安定）。`hana.js?v=9`→`?v=10`（index.html）。node --check OK。phase2g/oto の期待値更新を確定。
- [ ] **Step 2**: スクショ/実機目視（密度30・大輪重ならない・タップでは暗い/自動で明るい・図鑑の多彩な花・和の音の心地よさ）。
- [ ] **Step 3**: **Codexレビュー2周**（`codex-review.sh custom` でブランチ差分・hana.js中心）。重点: (a)ambientCountとflowers.lengthの整合(クリア/散りで不整合ないか・明るさが自動限定か) (b)自生resumeが操作後に働くか (c)flowerKinds連動の疎結合/未指定フォールバック/deriveSeededPalette誤用がないか (d)otoPlay五音階のノードリーク/音OFF無音/最小間隔 (e)FILL30・大輪クリアランスで無限ループ/未配置なし (f)reduce網羅 (g)既存(press/風/突風/seed/なぞり)退行。Critical必修正・2周目Critical 0。
- [ ] **Step 4**: main へ必要ファイルのみ取込（hana.js/index.html/docs）・混入ゼロ（`git diff main...HEAD --stat`）・push。
- [ ] **Step 5**: デプロイ監視・失敗時rerun・`hana.js?v=10` ライブ確認。
- [ ] **Step 6**: handoff 1行・DESIGN-NOTES §7 Phase2h追記・G-06デブリーフ。

---

## Self-Review 結果
**Spec coverage:** 密度30→T1 / 大輪重なり減→T1 / 明るさ自動限定→T2 / 自生resume確証→T2 / 図鑑24種→T3 / 和の五音階→T4 / 検証公開→T5。6依頼を網羅。
**Placeholder scan:** FILL_TARGET30・大輪size>=70/クリアランス拡大・ambientCount連動fillRatio・flowerKinds{color,form,season}・deriveSeededPalette流用・yo旋法[1,1.125,1.333,1.5,1.667]/BASE311は具体値。resume は「テストで確証・出なければ修正」と明示。
**Type consistency:** ambientCount は ambientSprout++/clear=0→currentFillRatio。flowerKinds は index.html→mount→createGarden→ambientSprout(deriveSeededPalette)。otoPlay freq→__hanaOto.lastFreq。既存 deriveSeededPalette/applyStageBg/onFill/ambientSprout/otoPlay を流用。
**リスク:** ambientCount整合(クリア/散り)・resume(テスト確証)・図鑑疎結合(opts+フォールバック)・五音階の単調さ(揺らぎ)・phase2g/oto期待値更新(正当・報告)。視覚/音は目視/耳ゲート。
