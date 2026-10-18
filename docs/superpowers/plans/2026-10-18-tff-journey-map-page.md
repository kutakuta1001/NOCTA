# 旅の地図ページ（訪れた人が見る側） Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** TFF 配下に、日本の都道府県タイル地図と国の一覧から地域を選ぶと、作者が選んだ 2〜3 枚の景色の写真が大きく出るページを作る（データは公開データファイルから読む）。

**Architecture:** 静的ページ `website/the-first-flower/journey/`。公開データ `tff-journey-data.js`（`const TFF_JOURNEY`）を、DOM に触れない純粋関数 `journey-core.js` が検証・整形し、`journey-app.js` が描画する。写真と公開データを作る側（Mac 上の候補作り・選ぶ画面）は計画 2 で扱い、本計画ではデータを手で書ける形と試し用の fixture だけを用意する。

**Tech Stack:** HTML + Tailwind CDN + 素の JS（ES2019・ビルドなし）。テストは Node 組み込みの `node:test`（core）と Playwright + ヘッドレス Chromium（ページ）。

**Spec:** `docs/superpowers/specs/2026-10-18-tff-journey-map-design.md`

**計画の分割:** 本計画 = 設計書 4-1・4-2・5（地図の状態・ひとことの扱い・公開データの許可項目）。計画 2（Takeout 到着後に実データを見て作成）= 4-3〜4-6・5 の残り（取り込み・地域判定・候補・選ぶ画面・画像の書き出しと位置情報の検査）。

## Global Constraints

- パスはすべて相対パス。Tailwind CDN。フォントは TFF と同じ Google Fonts（Cormorant Garamond / Noto Serif JP / Noto Sans JP）。
- 配色は TFF のトークン: 地の色 `#FCFBF5`、文字 `#3D2E52`、サブ `#9A86B0`、行った地域 `tff-rose #EEA4C0`、選択中 `tff-accent #B168A8`、まだの地域 `#E6E0EC`。
- 地域 ID: 都道府県は ISO 3166-2 の `JP-01`〜`JP-47`、国は ISO 3166-1 alpha-2（例 `HK`）、地点は `place-<英小文字とハイフン>`。表示名を参照キーにしない。
- 公開する地域は採用写真が 2〜3 枚のものだけ。0〜1 枚は出さない。4 枚以上はデータの誤り。
- 公開データの写真に置ける項目は `src` `thumb` `w` `h` `taken` `caption` `alt` だけ（位置情報を入れる場所を作らない）。
- 画像パスは `img/<16桁の小文字16進>.jpg`（大）と `img/<同>-s.jpg`（小）だけを受け付ける。1 ファイル 1MB 未満。
- ひとこと・地域名は `textContent` で出す。`innerHTML` に連結しない。
- `prefers-reduced-motion` ではスクロール・切り替えのアニメーションを止める。
- git: `git add` はファイルを個別に指定し、`git add` と `git commit` は別々の Bash 呼び出しにする（copy-audit-guard）。push しない（CEO の指示があるときだけ）。
- ドキュメント・コメントに絵文字を使わない。

## Review Focus

1. ひとことに `<b>` や引用符が入っている → そのまま文字として出て、ページが壊れない（Task 3 の check `caption-is-text`）。
2. 写真が 404 → 壊れた画像アイコンではなく「写真を読み込めませんでした」を出す（Task 3 `img-error`）。
3. 地域を素早く押し替える → 最後に押した地域の写真と地域名が出る（Task 3 `rapid-switch`）。
4. 公開データが空（初回公開時の状態） → 「旅の写真は準備中です。」を出し、JS エラーが出ない（Task 3 `empty-data`）。
5. スマホ幅 390px → 横スクロールが出ず、地域を押すと写真の位置まで流れる（Task 3 `mobile-390`）。

---

### Task 1: 公開データの形と検証（journey-core.js）

**Files:**
- Create: `website/the-first-flower/journey/journey-core.js`
- Create: `website/the-first-flower/journey/tff-journey-data.js`
- Create: `tests/journey/fixtures/journey-sample.js`
- Test: `tests/journey/test_core.mjs`

**Interfaces:**
- Produces（ブラウザでは `window.JourneyCore`、Node では `module.exports`）:
  - `validateJourney(data) -> { ok: boolean, errors: string[] }`
  - `publishedRegions(data) -> Region[]`（親が非公開の地点は含めない。元の並び順を保つ）
  - `placesOf(data, parentId: string) -> Region[]`（公開されている地点だけ）
  - `regionLabel(data, regionId: string) -> string`（地点は `"北海道 › 小樽"`、それ以外は名前だけ）
  - `isVisited(data, regionId: string) -> boolean`
- データ形（`tff-journey-data.js` と fixture で共通）:
  ```js
  const TFF_JOURNEY = {
    schemaVersion: 1,
    regions: [ { id: "JP-01", kind: "pref" | "country" | "place", parentId: null | "JP-01", name: "北海道", photoIds: ["<16hex>", ...] } ],
    photos: { "<16hex>": { src: "img/<16hex>.jpg", thumb: "img/<16hex>-s.jpg", w: 1600, h: 1067, taken: "2017-02" | null, caption: "運河の夜" | null, alt: "小樽運河の夜景" } }
  };
  ```
- fixture `journey-sample.js` は同じ形で `module.exports` も持つ。中身: 北海道（親・3 枚）＋地点 小樽（2 枚）＋地点 美瑛（1 枚＝非公開）、京都（2 枚）、長野（1 枚＝非公開）、香港 `HK`（2 枚）、`caption` に `<b>"夜"</b>` を含む写真 1 枚。

- [ ] **Step 1: Write the failing tests** — `tests/journey/test_core.mjs`（`node:test` + `assert`、fixture を `createRequire` で読む）

  - `validate-accepts-sample`: `validateJourney(sample).ok === true`
  - `validate-rejects-extra-photo-field`: 写真に `lat: 35.0` を足すと `ok === false`、errors に `"lat"` を含む
  - `validate-rejects-bad-src`: `src: "../secret.jpg"` と `src: "https://example.com/a.jpg"` がどちらも `ok === false`
  - `validate-rejects-missing-photo`: `photoIds` に存在しない ID → `ok === false`
  - `validate-rejects-four-photos`: 4 枚の地域 → `ok === false`
  - `validate-rejects-duplicate-region-id` / `validate-rejects-bad-taken`（`"2017/02"`）
  - `published-hides-one-photo`: `publishedRegions(sample).map(r => r.id)` に `JP-20`（長野）と `place-biei` を含まず、`JP-01` `place-otaru` `JP-26` `HK` を含む
  - `places-of-hokkaido`: `placesOf(sample, "JP-01").map(r => r.id)` が `["place-otaru"]`
  - `label-place`: `regionLabel(sample, "place-otaru") === "北海道 › 小樽"`、`regionLabel(sample, "HK") === "香港"`
  - `visited`: `isVisited(sample, "JP-01") === true`、`isVisited(sample, "JP-20") === false`
  - `empty-data`: `publishedRegions({schemaVersion:1, regions:[], photos:{}})` が `[]`、`validateJourney` は `ok === true`

- [ ] **Step 2: Run tests to verify they fail**

  Run: `node --test tests/journey/`
  Expected: FAIL（`journey-core.js` が見つからない）

- [ ] **Step 3: Implement `journey-core.js`**

  末尾で `if (typeof module !== "undefined") module.exports = api; else window.JourneyCore = api;`。画像パスの検査は `/^img\/[a-f0-9]{16}(-s)?\.jpg$/`、`taken` は `/^\d{4}-(0[1-9]|1[0-2])$/` か `null`。`tff-journey-data.js` は空データ `{ schemaVersion: 1, regions: [], photos: {} }` で作り、先頭コメントに「計画 2 の書き出し道具が書き換える。手で直すときは項目を増やさない」と書く。

- [ ] **Step 4: Run tests to verify they pass**

  Run: `node --test tests/journey/`
  Expected: PASS（全 12 件）

- [ ] **Step 5: Commit**

  ```bash
  git add website/the-first-flower/journey/journey-core.js website/the-first-flower/journey/tff-journey-data.js tests/journey/fixtures/journey-sample.js tests/journey/test_core.mjs
  ```
  ```bash
  git commit -m "feat(tff-journey): 公開データの形と検証を追加"
  ```

### Task 2: 都道府県タイル地図の定義（journey-map.js）

**Files:**
- Create: `website/the-first-flower/journey/journey-map.js`
- Test: `tests/journey/test_map.mjs`

**Interfaces:**
- Produces: `JP_TILES: { id: string, name: string, col: number, row: number }[]`（ブラウザでは `window.JP_TILES`）。12 列 × 14 行のグリッド。配置はブレインストーミングで見せた案 A の配置（北海道 col12/row1 … 沖縄 col1/row14）を使う。
- Produces: `COUNTRY_NAMES: { [alpha2: string]: string }`（日本語名。まず `HK` 香港・`TW` 台湾・`KR` 韓国・`US` アメリカ・`FR` フランス・`IT` イタリア・`TH` タイ・`SG` シンガポール。計画 2 で国が増えたら足す）

- [ ] **Step 1: Write the failing tests** — `test_map.mjs`
  - `tiles-47`: `JP_TILES.length === 47`、id が `JP-01`〜`JP-47` をちょうど 1 つずつ
  - `tiles-no-overlap`: `col,row` の組が重複しない、`1<=col<=12`、`1<=row<=14`
  - `tiles-names`: `JP-01` が `北海道`、`JP-13` が `東京`、`JP-47` が `沖縄`
- [ ] **Step 2: Run** `node --test tests/journey/` → Expected: FAIL（新しい 3 件）
- [ ] **Step 3: Implement `journey-map.js`**（Task 1 と同じ export の書き方）
- [ ] **Step 4: Run** `node --test tests/journey/` → Expected: PASS（全 15 件）
- [ ] **Step 5: Commit**（`journey-map.js` と `test_map.mjs` を個別に add → 別呼び出しで `git commit -m "feat(tff-journey): 都道府県タイル地図を追加"`）

### Task 3: ページの描画（index.html + journey-app.js）

**Files:**
- Create: `website/the-first-flower/journey/index.html`
- Create: `website/the-first-flower/journey/journey-app.js`
- Create: `tests/journey/check_page.cjs`

**Interfaces:**
- Consumes: Task 1 の `JourneyCore.*`・`TFF_JOURNEY`、Task 2 の `JP_TILES`・`COUNTRY_NAMES`
- Produces（DOM。check が使う）:
  - `#jr-tabs` 内に `button[data-mode="jp"]` / `button[data-mode="world"]`（`aria-selected`）
  - `#jr-map` 内に `button.jr-tile[data-region="JP-xx"]` × 47。公開地域は `.is-visited`、選択中は `.is-current` と `aria-pressed="true"`、未公開は `aria-disabled="true"`（押しても何も変わらない・`title="まだ写真がありません"`）
  - `#jr-list` 内に公開地域の `button[data-region]`（地図と同じ選択状態。世界モードでは国だけ）
  - `#jr-photo img.jr-main`、`#jr-thumbs button[data-photo]`、`#jr-places button[data-region]`（地点がある地域だけ）、`#jr-label`（地域名）、`#jr-taken`（`2017.02` 形式）、`#jr-caption`、`#jr-status`（`準備中` / `読み込み中` / `失敗` の文言）

- [ ] **Step 1: frontend-design を通す**（R-17）。`frontend-design:frontend-design` を呼び、Global Constraints の配色・フォントと案 A（左に地図、右に写真。スマホは地図が上・写真が下）を渡す。`~/designer/INDEX.md` で該当パターンを探し、使ったら `used_in` に `{project: NOCTA, date}` を記録する。ページ上部に「← The First Flower」（`../index.html#profile`）を置く。

- [ ] **Step 2: Write the failing check** — `tests/journey/check_page.cjs`

  CommonJS で `require("playwright")`（実行時に `NODE_PATH` で場所を渡す）。`CHROMIUM_PATH` 環境変数でブラウザを指定。`http://localhost:8765/the-first-flower/journey/index.html` を開き、`page.route("**/tff-journey-data.js")` で fixture（`tests/journey/fixtures/journey-sample.js`）を返す。fixture の画像は `page.route("**/journey/img/**")` で 1x1 の JPEG を返す（`img-error` だけ 404）。各 check を名前つきで出力し、1 つでも落ちたら exit 1。
  - `tiles`: `.jr-tile` が 47、`.is-visited` が 2（`JP-01` `JP-26`）
  - `select-region`: `JP-01` を押す → `#jr-label` が `北海道`、`#jr-thumbs button` が 3、`#jr-places button` に `小樽`
  - `select-place`: `小樽` を押す → `#jr-label` が `北海道 › 小樽`、サムネイル 2
  - `thumb-swap`: 2 枚目のサムネイルを押す → `img.jr-main` の `src` がその写真の `src`
  - `disabled-tile`: `JP-20` を押す → `#jr-label` が変わらない
  - `world`: 世界タブ → `#jr-list` に `香港` だけ、押すと `#jr-label` が `香港`
  - `caption-is-text`: その写真の `#jr-caption` の `textContent` が `<b>"夜"</b>`、`#jr-caption b` が 0 個
  - `img-error`: 404 になる写真を選ぶ → `#jr-status` が `写真を読み込めませんでした`
  - `rapid-switch`: `JP-01` → `JP-26` を 50ms 以内に続けて押す → 1 秒後の `#jr-label` が `京都`
  - `keyboard`: Tab で `JP-01` のタイルに移り Enter → `#jr-label` が `北海道`
  - `empty-data`: 空データを返す → `#jr-status` が `旅の写真は準備中です。`、`pageerror` が 0
  - `mobile-390`: 幅 390 で `document.documentElement.scrollWidth <= 390`、`JP-26` を押した 1 秒後に `#jr-photo` の上端が画面内
  - 全体: `console` の error と `pageerror` が 0

- [ ] **Step 3: Run the check to verify it fails**

  Run（`website/` で `python3 -m http.server 8765` を起動しておく）: `NODE_PATH=<playwright の node_modules> CHROMIUM_PATH=<chromium> node tests/journey/check_page.cjs`
  Expected: FAIL（ページがない）

- [ ] **Step 4: Implement `index.html` と `journey-app.js`**

  起動時に `validateJourney(TFF_JOURNEY)` が `ok:false` なら、データを使わず `#jr-status` を `旅の写真は準備中です。` にして `console.warn` に errors を出す（公開ページを落とさない）。最初は北から最初の公開地域を選んだ状態にする（公開地域がなければ準備中）。選択のたびに連番トークンを増やし、画像の `load` / `error` は自分のトークンが最新のときだけ反映する。画像は選んだ地域の分だけ読み込む（全地域を先読みしない）。スマホ（`max-width: 767px`）で地域を押したら `#jr-photo` を `scrollIntoView`（reduced-motion なら `behavior: "auto"`）。

- [ ] **Step 5: Run the check to verify it passes**

  Run: Step 3 と同じ
  Expected: すべての check が `ok`、exit 0

- [ ] **Step 6: 目視用のスクリーンショットを撮る**（PC 1280 / スマホ 390・fixture データ）。スクラッチパッドに保存し、CEO に見せる。

- [ ] **Step 7: Commit**（`index.html` `journey-app.js` `check_page.cjs` を個別に add → 別呼び出しで `git commit -m "feat(tff-journey): 旅の地図ページを追加（データは準備中）"`）

### Task 4: 設計メモと引き継ぎ

**Files:**
- Modify: `website/the-first-flower/DESIGN-NOTES.md`（4 章の表の後に「journey（旅の地図）」の小節、6 章のファイル構成に `journey/`）
- Modify: `handoff.md`（末尾に 1 行）

- [ ] **Step 1: DESIGN-NOTES に追記**: ページの場所、データの形（Task 1 の Interfaces を 1 段落で）、公開条件（2〜3 枚）、色の対応、テストの走らせ方（`node --test tests/journey/` と check の 1 行）、Profile からのリンクは計画 2 で実データが入るまで付けないこと。
- [ ] **Step 2: handoff.md に追記**: `2026-10-18: TFF 旅の地図ページ（journey/）を準備中の状態で追加。次: Takeout の書き出しを受け取り、計画 2（候補作り・選ぶ画面）へ。`
- [ ] **Step 3: Commit**（2 ファイルを個別に add → 別呼び出しで `git commit -m "docs(tff): 旅の地図ページの設計メモと引き継ぎを追加"`）

---

## 本計画でやらないこと（計画 2 へ）

- TFF の Profile 節からのリンク（実データが 1 地域以上公開できる状態になってから付ける）
- 写真の取り込み・地域判定・候補作り・選ぶ画面・画像の書き出し・位置情報の検査
