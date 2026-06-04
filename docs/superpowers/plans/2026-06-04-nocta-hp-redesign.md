# NOCTA HP リデザイン実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** NOCTA HP (`website/index.html`) を「AIっぽくない」デザインに刷新する。Phase B（CSS/フォントのみ）→ Phase A（HTML全面再構築）の2段階。

**Architecture:** Phase B は `<style>` ブロックと Tailwind config を差し替えるだけで既存 HTML を維持する。Phase A は HTML 構造を全面書き直し、`works-data.js` / `visual-data.js` / `apps-data.js` のデータ構造は変えずに新レイアウト用レンダリング関数に差し替える。

**Tech Stack:** HTML/CSS/JavaScript (vanilla)、Tailwind CSS CDN、Google Fonts（EB Garamond + Syne + Bebas Neue + Noto Sans JP）、相対パス（GitHub Pages 対応）

**仕様書:** `docs/superpowers/specs/2026-06-04-nocta-hp-redesign.md`

---

## ファイル構成

| ファイル | フェーズ | 変更内容 |
|---|---|---|
| `website/index.html` | B + A | メイン変更対象 |
| `website/DESIGN.md` | A 完了後 | カラートークン・フォントセクション更新 |
| `website/CLAUDE.md` | A 完了後 | デザインシステム表更新 |
| `project_NOCTA/handoff.md` | B・A 各完了後 | 1〜3行追記 |

`works-data.js` / `visual-data.js` / `apps-data.js` の構造は変更しない。

---

## Phase B: CSS差し替え（HTML最小限変更）

> Phase B 完了チェックリスト（9項目）をブラウザで全て確認してから Phase A に進む。

---

### Task B-1: Googleフォントリンク + Tailwind fontFamily 更新

**Files:**
- Modify: `website/index.html:10`（Fonts link）
- Modify: `website/index.html:30-36`（Tailwind fontFamily config）

- [ ] **Step 1: Googleフォントリンクを更新する**

`website/index.html` L10 を変更する（Inter・Space Grotesk 削除、EB Garamond 追加）:

変更前:
```html
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&family=Noto+Sans+JP:wght@300;400;500;700;900&family=Space+Grotesk:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">
```

変更後:
```html
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=EB+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Noto+Sans+JP:wght@300;400;500;700;900&family=Syne:wght@700;800&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Tailwind fontFamily を更新する**

`website/index.html` L30-36 の `fontFamily` ブロックを変更する:

変更前:
```js
                    fontFamily: {
                        heading: ['Syne', 'Space Grotesk', 'sans-serif'],
                        brand:   ['Syne', 'sans-serif'],
                        body:    ['Inter', 'sans-serif'],
                        jp:      ['Noto Sans JP', 'sans-serif'],
                        display: ['Bebas Neue', 'sans-serif'],
                    },
```

変更後:
```js
                    fontFamily: {
                        heading: ['Syne', 'sans-serif'],
                        brand:   ['Syne', 'sans-serif'],
                        body:    ['EB Garamond', 'Georgia', 'serif'],
                        jp:      ['Noto Sans JP', 'sans-serif'],
                        display: ['Bebas Neue', 'sans-serif'],
                    },
```

- [ ] **Step 3: ローカルサーバーで本文フォントを確認する**

```bash
python3 -m http.server 8888 --directory /Users/fghmacbook013/NOCTA/project_NOCTA/website
```

http://localhost:8888 を開き、DevTools Elements→Computed で `body` の `font-family` が `EB Garamond` になっていることを確認する。

- [ ] **Step 4: コミットする**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/index.html
git commit -m "style(phase-b): EB Garamond導入・Inter/Space Grotesk削除"
```

---

### Task B-2: Tailwind カラー設定 + boxShadow グロー削除

**Files:**
- Modify: `website/index.html:17-28`（Tailwind colors）
- Modify: `website/index.html:37-44`（Tailwind boxShadow → 削除）

- [ ] **Step 1: Tailwind colors を更新する**

`website/index.html` L18-28 の `colors.brand` を変更する:

変更前:
```js
                    colors: {
                        brand: {
                            bg:        '#05050F',
                            bg2:       '#0A0A16',
                            primary:   '#C8A2FF',
                            secondary: '#C4942A',
                            highlight: '#E8D0FF',
                            text:      '#E8E8F4',
                            sub:       '#8A8A9E',
                            gold:      '#C4942A',
                            vgreen:    '#39FF6A',
                        }
                    },
```

変更後:
```js
                    colors: {
                        brand: {
                            bg:        '#0A0906',
                            bg2:       '#0F0D0A',
                            primary:   '#C4942A',
                            secondary: '#C4942A',
                            highlight: '#E8D0FF',
                            text:      '#F0EAD8',
                            sub:       '#7a6a50',
                            gold:      '#C4942A',
                            vgreen:    '#C4942A',
                        }
                    },
```

- [ ] **Step 2: boxShadow のグロー定義ブロックを削除する**

`website/index.html` L37-44 の `boxShadow` ブロック全体を削除する:

削除対象:
```js
                    boxShadow: {
                        'glow-purple': '0 0 50px rgba(200,162,255,0.35)',
                        'glow-cyan':   '0 0 50px rgba(196,148,42,0.30)',
                        'glow-pink':   '0 0 50px rgba(232,208,255,0.30)',
                        'glow-gold':   '0 0 50px rgba(196,148,42,0.40)',
                        'glow-vgreen': '0 0 50px rgba(57,255,106,0.45)',
                    }
```

削除後、`extend: {` ブロックの閉じ括弧を整える（`colors` と `fontFamily` のみが残る）。

- [ ] **Step 3: コミットする**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/index.html
git commit -m "style(phase-b): Tailwindカラーをゴールド系に更新・グローboxShadow削除"
```

---

### Task B-3: `id="stats-bar"` 追加 + Stats/Services 非表示 CSS

**Files:**
- Modify: `website/index.html:649`（id 属性追加）
- Modify: `website/index.html:472`（`</style>` 直前に CSS 追加）

- [ ] **Step 1: L649 の Stats バー div に id を付与する**

`website/index.html` L649 を変更する（Phase B で許可する唯一の HTML 変更）:

変更前:
```html
<div class="border-y border-white/5 bg-white/[0.015] backdrop-blur-sm">
```

変更後:
```html
<div id="stats-bar" class="border-y border-white/5 bg-white/[0.015] backdrop-blur-sm">
```

- [ ] **Step 2: `</style>` の直前に非表示 CSS を挿入する**

`website/index.html` L472 の `    </style>` の直前に以下を挿入する:

```css
        /* Phase B: 非表示セクション */
        #stats-bar { display: none; }
        #services  { display: none; }
```

- [ ] **Step 3: ブラウザで非表示を確認する**

http://localhost:8888 をリロードし、Stats バー（数字4つ）と Services セクション（楽曲制作/PV/マーケティング）が表示されていないことを確認する。

- [ ] **Step 4: コミットする**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/index.html
git commit -m "style(phase-b): Stats・Servicesセクションを非表示"
```

---

### Task B-4: CSS 変数・scrollbar・glass・body・form-field 更新

**Files:**
- Modify: `website/index.html:50-75`（`:root`・scrollbar・body・glass）
- Modify: `website/index.html:255-259`（form-field focus）

- [ ] **Step 1: `:root` 変数を更新する**

`website/index.html` L50-56 を変更する:

変更前:
```css
        :root {
            --blur-glass:   blur(20px);
            --border-glass: 1px solid rgba(255,255,255,0.08);
            --color-gold: #C4942A;
            --color-lavender: #C8A2FF;
            --color-vgreen: #39FF6A;
        }
```

変更後:
```css
        :root {
            --blur-glass:   blur(20px);
            --border-glass: 1px solid rgba(255,255,255,0.08);
            --color-gold:       #C4942A;
            --color-cream:      #F0EAD8;
            --color-warm-gray:  #7a6a50;
            --color-warm-black: #0A0906;
            --color-lavender:   #C4942A;
            --color-vgreen:     #C4942A;
        }
```

- [ ] **Step 2: スクロールバーをゴールドに変更する**

`website/index.html` L58-61 を変更する:

変更前:
```css
        * { scrollbar-width: thin; scrollbar-color: #39FF6A transparent; }
        *::-webkit-scrollbar { width: 4px; }
        *::-webkit-scrollbar-thumb { background: #39FF6A; border-radius: 9999px; }
        *::-webkit-scrollbar-track { background: transparent; }
```

変更後:
```css
        * { scrollbar-width: thin; scrollbar-color: #C4942A transparent; }
        *::-webkit-scrollbar { width: 4px; }
        *::-webkit-scrollbar-thumb { background: #C4942A; border-radius: 9999px; }
        *::-webkit-scrollbar-track { background: transparent; }
```

- [ ] **Step 3: body の背景色をウォームブラックに変更する**

`website/index.html` L63 を変更する:

変更前:
```css
        body { background-color: #05050F; color: #F0F0F8; overflow-x: hidden; }
```

変更後:
```css
        body { background-color: #0A0906; color: #F0EAD8; overflow-x: hidden; }
```

- [ ] **Step 4: .glass をソリッド背景に変更する**

`website/index.html` L66-75 を変更する:

変更前:
```css
        .glass {
            background: rgba(255,255,255,0.03);
            backdrop-filter: var(--blur-glass);
            -webkit-backdrop-filter: var(--blur-glass);
            border: var(--border-glass);
        }
        .glass-hover:hover {
            background: rgba(255,255,255,0.06);
            border-color: rgba(255,255,255,0.14);
        }
```

変更後:
```css
        .glass {
            background: #0F0D0A;
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
            border: 1px solid #221c10;
        }
        .glass-hover:hover {
            background: #141008;
            border-color: rgba(196,148,42,0.2);
        }
```

- [ ] **Step 5: form-field のフォーカス色をゴールドに変更する**

`website/index.html` L255-259 を変更する:

変更前:
```css
        .form-field:focus {
            border-color: #C8A2FF;
            box-shadow: 0 0 0 3px rgba(200,162,255,0.14);
            background: rgba(200,162,255,0.06);
        }
```

変更後:
```css
        .form-field:focus {
            border-color: #C4942A;
            box-shadow: 0 0 0 3px rgba(196,148,42,0.14);
            background: rgba(196,148,42,0.04);
        }
```

- [ ] **Step 6: コミットする**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/index.html
git commit -m "style(phase-b): CSS変数・glass・フォーム色をゴールド系に更新"
```

---

### Task B-5: グラデーションテキスト・stat-num・filter-pill・vfilter-pill 更新

**Files:**
- Modify: `website/index.html:78-89`（.text-gradient / .text-gradient-alt）
- Modify: `website/index.html:136-144`（.stat-num）
- Modify: `website/index.html:160-172`（.filter-pill）
- Modify: `website/index.html:174-192`（.vfilter-pill hover/active）

- [ ] **Step 1: .text-gradient をゴールド単色にする**

`website/index.html` L78-89 を変更する:

変更前:
```css
        .text-gradient {
            background: linear-gradient(135deg, #C8A2FF 0%, #39FF6A 45%, #C4942A 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .text-gradient-alt {
            background: linear-gradient(90deg, #C4942A, #C8A2FF, #39FF6A);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
```

変更後:
```css
        .text-gradient {
            background: none;
            -webkit-background-clip: unset;
            -webkit-text-fill-color: #F0EAD8;
            background-clip: unset;
            color: #F0EAD8;
        }
        .text-gradient-alt {
            background: none;
            -webkit-background-clip: unset;
            -webkit-text-fill-color: #C4942A;
            background-clip: unset;
            color: #C4942A;
        }
```

- [ ] **Step 2: .stat-num をゴールド単色にする**

`website/index.html` L136-144 を変更する:

変更前:
```css
        .stat-num {
            font-family: 'Bebas Neue', sans-serif;
            font-size: clamp(48px, 6vw, 72px);
            line-height: 1;
            background: linear-gradient(135deg, #C4942A, #C8A2FF, #39FF6A);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
```

変更後:
```css
        .stat-num {
            font-family: 'Bebas Neue', sans-serif;
            font-size: clamp(48px, 6vw, 72px);
            line-height: 1;
            background: none;
            -webkit-background-clip: unset;
            -webkit-text-fill-color: #C4942A;
            background-clip: unset;
            color: #C4942A;
        }
```

- [ ] **Step 3: .filter-pill のホバーをゴールドにする**

`website/index.html` L160-172 を変更する:

変更前:
```css
        .filter-pill {
            padding: 9px 22px; border-radius: 9999px;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 12px; font-weight: 600; letter-spacing: 0.5px;
            cursor: pointer; transition: all 0.3s ease;
            border: 1px solid rgba(255,255,255,0.1);
            color: #8A8A9E; background: transparent;
        }
        .filter-pill:hover, .filter-pill.active {
            background: #39FF6A; color: #05050F;
            border-color: #39FF6A;
            box-shadow: 0 0 28px rgba(57,255,106,0.55);
        }
```

変更後:
```css
        .filter-pill {
            padding: 9px 22px; border-radius: 9999px;
            font-family: 'Syne', sans-serif;
            font-size: 12px; font-weight: 600; letter-spacing: 0.5px;
            cursor: pointer; transition: all 0.3s ease;
            border: 1px solid rgba(255,255,255,0.1);
            color: #7a6a50; background: transparent;
        }
        .filter-pill:hover, .filter-pill.active {
            background: #C4942A; color: #0A0906;
            border-color: #C4942A;
            box-shadow: 0 0 20px rgba(196,148,42,0.4);
        }
```

- [ ] **Step 4: .vfilter-pill のホバーをゴールドにする**

`website/index.html` L188-191 の hover/active のみ変更する:

変更前:
```css
        .vfilter-pill:hover, .vfilter-pill.active {
            background: rgba(200,162,255,0.12);
            color: #C8A2FF;
        }
```

変更後:
```css
        .vfilter-pill:hover, .vfilter-pill.active {
            background: rgba(196,148,42,0.12);
            color: #C4942A;
        }
```

- [ ] **Step 5: コミットする**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/index.html
git commit -m "style(phase-b): グラデーションテキスト・filter-pill色をゴールドに更新"
```

---

### Task B-6: service-card・bar・btn-submit・btn-primary-cta・shimmer・vgreen 更新

**Files:**
- Modify: `website/index.html:224-228`（.service-card hover）
- Modify: `website/index.html:236-239`（.bar-purple / .bar-pink）
- Modify: `website/index.html:263-275`（.btn-submit）
- Modify: `website/index.html:279-296`（.btn-primary-cta）
- Modify: `website/index.html:381`（.text-vgreen）
- Modify: `website/index.html:385-395`（.vocaloid-bar）
- Modify: `website/index.html:406-415`（.shimmer-text）

- [ ] **Step 1: service-card の全ホバー色をゴールドに統一する**

`website/index.html` L225-228 を変更する:

変更前:
```css
        .service-card.c-purple:hover { border-color: rgba(200,162,255,0.5); box-shadow: 0 0 60px rgba(200,162,255,0.18); }
        .service-card.c-cyan:hover   { border-color: rgba(196,148,42,0.5);  box-shadow: 0 0 60px rgba(196,148,42,0.18); }
        .service-card.c-pink:hover   { border-color: rgba(57,255,106,0.5);  box-shadow: 0 0 60px rgba(57,255,106,0.18); }
        .service-card.c-gold:hover   { border-color: rgba(196,148,42,0.6);  box-shadow: 0 0 60px rgba(196,148,42,0.20); }
```

変更後:
```css
        .service-card.c-purple:hover,
        .service-card.c-cyan:hover,
        .service-card.c-pink:hover,
        .service-card.c-gold:hover { border-color: rgba(196,148,42,0.5); box-shadow: 0 0 60px rgba(196,148,42,0.18); }
```

- [ ] **Step 2: bar-purple・bar-pink をゴールドに変更する**

`website/index.html` L236-239 を変更する:

変更前:
```css
        .bar-purple { background: linear-gradient(90deg, transparent, #C8A2FF, transparent); }
        .bar-cyan   { background: linear-gradient(90deg, transparent, #C4942A, transparent); }
        .bar-pink   { background: linear-gradient(90deg, transparent, #39FF6A, transparent); }
        .bar-gold   { background: linear-gradient(90deg, transparent, #C4942A, transparent); }
```

変更後:
```css
        .bar-purple,
        .bar-cyan,
        .bar-pink,
        .bar-gold { background: linear-gradient(90deg, transparent, #C4942A, transparent); }
```

- [ ] **Step 3: .btn-submit をゴールド単色に変更する**

`website/index.html` L264-275 を変更する:

変更前:
```css
        .btn-submit {
            width: 100%; padding: 16px;
            background: linear-gradient(135deg, #C4942A, #C8A2FF, #39FF6A);
            color: #fff; border: none; border-radius: 12px;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 14px; font-weight: 700; letter-spacing: 0.5px;
            cursor: pointer; transition: all 0.3s ease;
            box-shadow: 0 0 32px rgba(196,148,42,0.35), 0 0 20px rgba(200,162,255,0.2);
        }
        .btn-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 60px rgba(196,148,42,0.5), 0 0 30px rgba(200,162,255,0.35);
        }
```

変更後:
```css
        .btn-submit {
            width: 100%; padding: 16px;
            background: #C4942A;
            color: #0A0906; border: none; border-radius: 6px;
            font-family: 'Syne', sans-serif;
            font-size: 13px; font-weight: 700; letter-spacing: 1px;
            text-transform: uppercase;
            cursor: pointer; transition: all 0.3s ease;
            box-shadow: 0 0 32px rgba(196,148,42,0.35);
        }
        .btn-submit:hover {
            transform: translateY(-1px);
            box-shadow: 0 0 60px rgba(196,148,42,0.5);
        }
```

- [ ] **Step 4: .btn-primary-cta をゴールドアウトラインに変更する**

`website/index.html` L279-296 を変更する:

変更前:
```css
        .btn-primary-cta {
            display: inline-flex; align-items: center; justify-content: center;
            padding: 15px 40px; border-radius: 9999px;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 13px; font-weight: 700; letter-spacing: 1px;
            text-transform: uppercase;
            background: transparent; color: #fff;
            border: 2px solid #C8A2FF;
            box-shadow: 0 0 30px rgba(200,162,255,0.35);
            transition: all 0.3s ease;
        }
        .btn-primary-cta:hover {
            background: #C8A2FF;
            box-shadow: 0 0 60px rgba(200,162,255,0.6);
            color: #05050F; transform: translateY(-2px);
        }
```

変更後:
```css
        .btn-primary-cta {
            display: inline-flex; align-items: center; justify-content: center;
            padding: 15px 40px; border-radius: 9999px;
            font-family: 'Syne', sans-serif;
            font-size: 13px; font-weight: 700; letter-spacing: 1px;
            text-transform: uppercase;
            background: transparent; color: #F0EAD8;
            border: 1px solid rgba(196,148,42,0.33);
            transition: all 0.3s ease;
        }
        .btn-primary-cta:hover {
            background: rgba(196,148,42,0.1);
            border-color: #C4942A;
            color: #C4942A; transform: translateY(-2px);
        }
```

- [ ] **Step 5: .text-vgreen・.vocaloid-bar をゴールドに変更する**

`website/index.html` L381 を変更する:

変更前:
```css
        .text-vgreen { color: #39FF6A; }
```

変更後:
```css
        .text-vgreen { color: #C4942A; }
```

L385-395 の `.vocaloid-bar` を変更する:

変更前:
```css
        .vocaloid-bar {
            display: inline-block;
            padding: 2px 10px;
            background: rgba(57,255,106,0.1);
            border-left: 2px solid #39FF6A;
            border-radius: 0 4px 4px 0;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 11px; font-weight: 700;
            letter-spacing: 1px;
            color: #39FF6A;
        }
```

変更後:
```css
        .vocaloid-bar {
            display: inline-block;
            padding: 2px 10px;
            background: rgba(196,148,42,0.08);
            border-left: 2px solid #C4942A;
            border-radius: 0 4px 4px 0;
            font-family: 'Syne', sans-serif;
            font-size: 11px; font-weight: 700;
            letter-spacing: 1px;
            color: #C4942A;
        }
```

- [ ] **Step 6: .shimmer-text をゴールド単色にする（シマーアニメ削除）**

`website/index.html` L406-415 を変更する:

変更前:
```css
        @keyframes shimmer {
            0%   { background-position: -200% center; }
            100% { background-position:  200% center; }
        }
        .shimmer-text {
            background: linear-gradient(90deg, #C8A2FF, #39FF6A, #C4942A, #C8A2FF, #39FF6A);
            background-size: 200% auto;
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
            animation: shimmer 6s linear infinite;
        }
```

変更後:
```css
        .shimmer-text { color: #F0EAD8; }
```

- [ ] **Step 7: コミットする**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/index.html
git commit -m "style(phase-b): service-card・btn・vgreen・shimmer色をゴールド系に更新"
```

---

### Task B-7: パーティクルキャンバス + 軌道リング 削除

**Files:**
- Modify: `website/index.html:104-109`（`#particle-canvas` CSS）
- Modify: `website/index.html:128-133`（orbit CSS）
- Modify: `website/index.html:541`（`<canvas>` 要素）
- Modify: `website/index.html:742-744`（orbit ring HTML 要素）
- Modify: `website/index.html:1368-1451`（particle canvas JS IIFE）

- [ ] **Step 1: `#particle-canvas` CSS を削除する**

`website/index.html` L104-109 を削除する:

削除対象:
```css
        /* Particle canvas */
        #particle-canvas {
            position: absolute; inset: 0;
            width: 100%; height: 100%;
            z-index: 0;
        }
```

- [ ] **Step 2: orbit ring CSS アニメーションを削除する**

`website/index.html` L128-133 を削除する:

削除対象:
```css
        /* Orbit rings */
        @keyframes spinSlow  { from { transform: rotate(0deg); }   to { transform: rotate(360deg); } }
        @keyframes spinSlowR { from { transform: rotate(0deg); }   to { transform: rotate(-360deg); } }
        .orbit-1 { animation: spinSlow  80s linear infinite; }
        .orbit-2 { animation: spinSlowR 50s linear infinite; }
        .orbit-3 { animation: spinSlow  30s linear infinite; }
```

- [ ] **Step 3: Hero セクションの `<canvas>` 要素を削除する**

まず行番号を確認する:

```bash
grep -n "particle-canvas" /Users/fghmacbook013/NOCTA/project_NOCTA/website/index.html
```

L541 付近の `<canvas id="particle-canvas"></canvas>` 行を削除する。

- [ ] **Step 4: About セクションの orbit ring HTML 要素を削除する**

`website/index.html` の About セクション内の orbit ring 要素（L742-744 付近）を削除する:

削除対象:
```html
                    <!-- Orbit rings -->
                    <div class="absolute inset-0 rounded-full border border-white/5 orbit-1"></div>
                    <div class="absolute inset-6 rounded-full border border-brand-primary/15 orbit-2"></div>
                    <div class="absolute inset-14 rounded-full border border-brand-secondary/15 orbit-3"></div>
```

確認コマンド:
```bash
grep -n "orbit-1\|orbit-2\|orbit-3" /Users/fghmacbook013/NOCTA/project_NOCTA/website/index.html
```

- [ ] **Step 5: パーティクルキャンバス JS の IIFE を削除する**

`website/index.html` の `/* ---- Particle Canvas ---- */` から始まる IIFE（L1368-L1451 付近）を削除する。

削除の開始マーカー:
```js
/* ---- Particle Canvas ---- */
(function () {
    const canvas = document.getElementById('particle-canvas');
```

削除の終了マーカー:
```js
    window.addEventListener('resize', resize);
})();
```

確認コマンド:
```bash
grep -n "Particle Canvas\|particle-canvas\|initParticles" /Users/fghmacbook013/NOCTA/project_NOCTA/website/index.html
```

- [ ] **Step 6: コミットする**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/index.html
git commit -m "style(phase-b): パーティクルキャンバス・軌道リング削除"
```

---

### Task B-8: Phase B 完了チェック + handoff 更新

**Files:**
- Modify: `project_NOCTA/handoff.md`

- [ ] **Step 1: ブラウザで完了チェックリスト 9 項目を全て確認する**

http://localhost:8888 をリロードして以下を確認:

1. ラベンダー（`#C8A2FF`）がどこにも表示されていない（DevTools Color Picker で検証）
2. ネオングリーン（`#39FF6A`）がどこにも表示されていない
3. パーティクルキャンバスが非表示（Hero に動くドットが見えない）
4. 軌道リングが非表示（About のビジュアルエリアに回転リングが見えない）
5. Stats バーが非表示（hero 直下の数字4つのバーが消えている）
6. Services セクションが非表示（楽曲制作/PV/マーケティングのカードが消えている）
7. 本文フォントが EB Garamond になっている（DevTools Elements → Computed → font-family）
8. CTA ボタンがゴールドになっている
9. スクロールバーがゴールドになっている

- [ ] **Step 2: handoff.md を更新する**

`project_NOCTA/handoff.md` に追記する:

```
2026-06-04 Phase B完了（CSS差し替え・EB Garamond・パーティクル削除）。ブラウザ確認待ち → CEO承認後にPhase A開始。
```

- [ ] **Step 3: コミットする**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add project_NOCTA/handoff.md
git commit -m "docs: Phase B完了をhandoffに記録"
```

---

## Phase A: HTML 全面刷新

> Phase B のブラウザ確認・CEO 承認後に開始する。

---

### Task A-1: `<head>` セクション + `<style>` ブロック全面刷新

Phase A では `<head>` の Tailwind config と `<style>` ブロックを Phase B の差し替えパッチなしの最終形にクリーンアップする。

**Files:**
- Modify: `website/index.html:1-473`（`<head>` 〜 `</style></head>` 全体を置換）

- [ ] **Step 1: `<head>` ブロック全体（L1-L473）を以下に置換する**

```html
<!DOCTYPE html>
<html lang="ja" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NOCTA — Music Entertainment</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=EB+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Noto+Sans+JP:wght@300;400;500;700;900&family=Syne:wght@700;800&display=swap" rel="stylesheet">

    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        brand: {
                            bg:        '#0A0906',
                            bg2:       '#0F0D0A',
                            primary:   '#C4942A',
                            secondary: '#C4942A',
                            gold:      '#C4942A',
                            text:      '#F0EAD8',
                            sub:       '#7a6a50',
                        }
                    },
                    fontFamily: {
                        heading: ['Syne', 'sans-serif'],
                        brand:   ['Syne', 'sans-serif'],
                        body:    ['EB Garamond', 'Georgia', 'serif'],
                        jp:      ['Noto Sans JP', 'sans-serif'],
                        display: ['Bebas Neue', 'sans-serif'],
                    },
                }
            }
        }
    </script>

    <style>
        :root {
            --color-gold:       #C4942A;
            --color-cream:      #F0EAD8;
            --color-warm-gray:  #7a6a50;
            --color-warm-black: #0A0906;
        }

        * { box-sizing: border-box; scrollbar-width: thin; scrollbar-color: #C4942A transparent; }
        *::-webkit-scrollbar { width: 4px; }
        *::-webkit-scrollbar-thumb { background: #C4942A; border-radius: 9999px; }
        *::-webkit-scrollbar-track { background: transparent; }

        body { background-color: #0A0906; color: #F0EAD8; overflow-x: hidden; }

        /* Film grain overlay */
        body::before {
            content: '';
            position: fixed; inset: 0;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height%3D'100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
            pointer-events: none; z-index: 9999; opacity: 0.35;
        }

        /* Scroll reveal */
        .reveal {
            opacity: 0;
            transform: translateY(28px);
            transition: opacity 0.9s cubic-bezier(0.4,0,0.2,1), transform 0.9s cubic-bezier(0.4,0,0.2,1);
        }
        .reveal.active { opacity: 1; transform: translateY(0); }
        .reveal-delay-1 { transition-delay: 0.12s; }
        .reveal-delay-2 { transition-delay: 0.24s; }
        .reveal-delay-3 { transition-delay: 0.36s; }

        /* Page horizontal rule */
        .page-rule { border: none; border-top: 1px solid #221c10; margin: 0; }

        /* Navbar */
        #navbar.scrolled {
            background: rgba(10,9,6,0.92);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-bottom: 1px solid #221c10;
        }

        /* Play ring (Featured Track) */
        .play-ring {
            width: 52px; height: 52px;
            border: 1px solid rgba(196,148,42,0.5);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            transition: border-color 0.3s;
        }
        .play-ring::after {
            content: '';
            width: 0; height: 0;
            border-top: 9px solid transparent;
            border-bottom: 9px solid transparent;
            border-left: 16px solid #C4942A;
            margin-left: 4px;
        }
        .feat-thumb:hover .play-ring { border-color: #C4942A; }

        /* Discography row hover */
        .disc-row { transition: background 0.2s; }
        .disc-row:hover { background: #0F0D0A; }

        /* Visual cell hover */
        .visual-cell { cursor: pointer; transition: opacity 0.3s; }
        .visual-cell:hover { opacity: 0.8; }

        /* Tool card hover */
        .tool-card { transition: background 0.2s; }
        .tool-card:hover { background: #141008; }

        /* Contact form */
        .form-field {
            width: 100%;
            background: rgba(255,255,255,0.03);
            border: 1px solid #221c10;
            border-radius: 6px;
            padding: 14px 18px;
            color: #F0EAD8;
            font-family: 'Noto Sans JP', sans-serif;
            font-size: 14px;
            transition: border-color 0.3s, box-shadow 0.3s;
            outline: none;
            -webkit-appearance: none;
        }
        .form-field:focus {
            border-color: #C4942A;
            box-shadow: 0 0 0 3px rgba(196,148,42,0.14);
            background: rgba(196,148,42,0.04);
        }
        .form-field::placeholder { color: rgba(240,234,216,0.2); }
        .form-field option { background: #0F0D0A; }

        /* Submit button */
        .btn-submit {
            width: 100%; padding: 16px;
            background: #C4942A;
            color: #0A0906; border: none; border-radius: 6px;
            font-family: 'Syne', sans-serif;
            font-size: 13px; font-weight: 700; letter-spacing: 1px;
            text-transform: uppercase;
            cursor: pointer; transition: all 0.3s;
        }
        .btn-submit:hover { transform: translateY(-1px); filter: brightness(1.1); }

        /* YouTube Modal */
        #yt-modal { background: rgba(0,0,0,0.88); }
        #yt-modal .yt-frame-wrap { position: relative; width: 100%; padding-top: 56.25%; }
        #yt-modal iframe { position: absolute; inset: 0; width: 100%; height: 100%; border-radius: 8px; }
    </style>
</head>
```

- [ ] **Step 2: コミットする**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/index.html
git commit -m "feat(phase-a): headセクション再構築・CSSを最終形に整理"
```

---

### Task A-2: Masthead + Hero + Three Ways セクション

**Files:**
- Modify: `website/index.html`（`<body>` 開始〜 Hero `</section>` までを置換）

- [ ] **Step 1: 旧 Navbar〜Hero セクション全体を新しい Masthead + Hero + Three Ways に置換する**

`website/index.html` の `<body class="font-jp antialiased">` から Hero `</section>` （L643 付近）までを以下に置換する:

```html
<body class="font-jp antialiased">

<!-- MASTHEAD -->
<header id="navbar" class="fixed top-0 w-full z-50 transition-all duration-300">
    <div class="max-w-[900px] mx-auto px-10">
        <div class="grid items-center gap-4 py-5" style="grid-template-columns: 1fr auto 1fr;">
            <a href="#hero" class="font-brand text-[15px] tracking-[5px] text-brand-text font-extrabold uppercase">NOCTA</a>
            <nav class="hidden md:flex gap-6">
                <a href="#discography" class="font-heading text-[9px] tracking-[2px] text-brand-sub hover:text-brand-text transition-colors uppercase">Discography</a>
                <a href="#visual"      class="font-heading text-[9px] tracking-[2px] text-brand-sub hover:text-brand-text transition-colors uppercase">Visual</a>
                <a href="#tools"       class="font-heading text-[9px] tracking-[2px] text-brand-sub hover:text-brand-text transition-colors uppercase">Tools</a>
                <a href="#about"       class="font-heading text-[9px] tracking-[2px] text-brand-sub hover:text-brand-text transition-colors uppercase">About</a>
            </nav>
            <div class="hidden md:flex gap-4 justify-end">
                <a href="https://x.com/nocta_music" target="_blank" rel="noopener"
                   class="font-heading text-[9px] tracking-[1px] text-[#3a2a18] hover:text-brand-sub transition-colors uppercase">X</a>
                <a href="https://www.youtube.com/@nocta_music" target="_blank" rel="noopener"
                   class="font-heading text-[9px] tracking-[1px] text-[#3a2a18] hover:text-brand-sub transition-colors uppercase">YouTube</a>
                <a href="#contact"
                   class="font-heading text-[9px] tracking-[1px] text-[#3a2a18] hover:text-brand-sub transition-colors uppercase">Contact</a>
            </div>
            <button id="hamburger" class="md:hidden flex flex-col gap-[5px] p-2 col-start-3 justify-self-end" aria-label="メニュー">
                <span class="w-5 h-[1px] bg-brand-text block transition-all duration-300" id="hb-1"></span>
                <span class="w-5 h-[1px] bg-brand-text block transition-all duration-300" id="hb-2"></span>
                <span class="w-5 h-[1px] bg-brand-text block transition-all duration-300" id="hb-3"></span>
            </button>
        </div>
        <hr class="page-rule">
    </div>
    <div id="mobile-menu" class="hidden md:hidden bg-brand-bg border-t border-[#221c10]">
        <div class="max-w-[900px] mx-auto px-10 py-6 flex flex-col gap-4">
            <a href="#discography" class="font-heading text-[10px] tracking-[2px] text-brand-sub uppercase" onclick="closeMobileMenu()">Discography</a>
            <a href="#visual"      class="font-heading text-[10px] tracking-[2px] text-brand-sub uppercase" onclick="closeMobileMenu()">Visual</a>
            <a href="#tools"       class="font-heading text-[10px] tracking-[2px] text-brand-sub uppercase" onclick="closeMobileMenu()">Tools</a>
            <a href="#about"       class="font-heading text-[10px] tracking-[2px] text-brand-sub uppercase" onclick="closeMobileMenu()">About</a>
            <a href="#contact"     class="font-heading text-[10px] tracking-[2px] text-brand-sub uppercase" onclick="closeMobileMenu()">Contact</a>
            <hr class="page-rule mt-2">
            <div class="flex gap-6">
                <a href="https://x.com/nocta_music" target="_blank" rel="noopener"
                   class="font-heading text-[9px] tracking-[1px] text-[#3a2a18] uppercase">X</a>
                <a href="https://www.youtube.com/@nocta_music" target="_blank" rel="noopener"
                   class="font-heading text-[9px] tracking-[1px] text-[#3a2a18] uppercase">YouTube</a>
            </div>
        </div>
    </div>
</header>


<!-- HERO -->
<section id="hero" class="pt-32 pb-12 scroll-mt-20">
    <div class="max-w-[900px] mx-auto px-10">
        <div class="font-heading text-[9px] tracking-[3px] text-[#4a3a28] uppercase mb-6 reveal">NOCTA — Music Entertainment</div>
        <h1 class="font-body font-semibold leading-[0.93] tracking-[-3px] mb-6 reveal reveal-delay-1"
            style="font-size: clamp(68px, 11vw, 112px); color: #F0EAD8;">
            これからの<br>
            人間の<br>
            <span class="text-[#C4942A]">遊び方。</span>
        </h1>
        <div class="flex items-center gap-4 mb-5 reveal reveal-delay-2">
            <div class="flex-1 h-px bg-[#221c10]"></div>
            <span class="font-heading text-[9px] tracking-[3px] text-brand-gold uppercase whitespace-nowrap">Latest Release</span>
            <div class="flex-1 h-px bg-[#221c10]"></div>
        </div>
        <p class="font-body text-[16px] italic text-[#6a5a40] leading-relaxed reveal reveal-delay-3" style="max-width:460px;">消費するだけでも、生産するだけでもなく。</p>
    </div>
</section>

<div class="max-w-[900px] mx-auto px-10"><hr class="page-rule"></div>


<!-- THREE WAYS -->
<section id="three-ways" class="scroll-mt-20">
    <div class="max-w-[900px] mx-auto px-10">
        <div class="bg-[#221c10] grid grid-cols-1 md:grid-cols-3" style="gap:1px;">
            <div class="bg-brand-bg px-6 py-8 reveal">
                <div class="font-display text-[48px] text-[#1c1408] leading-none mb-1">01</div>
                <div class="font-heading text-[8px] tracking-[2px] text-[#3a2a18] uppercase mb-3">Music</div>
                <div class="font-body font-semibold text-[20px] text-brand-text mb-3">音楽を作る</div>
                <p class="font-body text-[13px] italic text-[#5a4a30] leading-relaxed">曲を書き、声を吹き込み、世界に届ける。創ることそのものを楽しむ。</p>
            </div>
            <div class="bg-brand-bg px-6 py-8 reveal reveal-delay-1">
                <div class="font-display text-[48px] text-[#1c1408] leading-none mb-1">02</div>
                <div class="font-heading text-[8px] tracking-[2px] text-[#3a2a18] uppercase mb-3">Visual</div>
                <div class="font-body font-semibold text-[20px] text-brand-text mb-3">絵を生む</div>
                <p class="font-body text-[13px] italic text-[#5a4a30] leading-relaxed">新しい道具で描くビジュアル。見る人の感情を動かす表現を探す。</p>
            </div>
            <div class="bg-brand-bg px-6 py-8 reveal reveal-delay-2">
                <div class="font-display text-[48px] text-[#1c1408] leading-none mb-1">03</div>
                <div class="font-heading text-[8px] tracking-[2px] text-[#3a2a18] uppercase mb-3">Tools</div>
                <div class="font-body font-semibold text-[20px] text-brand-text mb-3">道具を育てる</div>
                <p class="font-body text-[13px] italic text-[#5a4a30] leading-relaxed">自分が使いたいツールを自分で作る。遊ぶための道具は、遊びそのものになる。</p>
            </div>
        </div>
    </div>
</section>

<div class="max-w-[900px] mx-auto px-10"><hr class="page-rule"></div>
```

- [ ] **Step 2: コミットする**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/index.html
git commit -m "feat(phase-a): Masthead・Hero・Three Waysを実装"
```

---

### Task A-3: Featured Track + Discography セクション

**Files:**
- Modify: `website/index.html`（旧 Stats Bar + About + Works セクションを置換）

- [ ] **Step 1: Stats Bar・旧 About・旧 Works セクションを Featured Track + Discography に置換する**

`website/index.html` の `<!-- STATS BAR -->` コメントから始まる div（または前のステップで残っているセクション）から、Works セクション終わり `</section>` までを以下に置換する:

```html
<!-- FEATURED TRACK -->
<section id="featured" class="scroll-mt-20">
    <div class="max-w-[900px] mx-auto px-10 py-12">
        <div class="grid grid-cols-1 md:grid-cols-[5fr_6fr] gap-10 items-start">
            <div>
                <div class="font-heading text-[9px] tracking-[3px] text-brand-gold uppercase mb-3">Featured Track</div>
                <div id="featured-thumb"
                     class="feat-thumb relative bg-brand-bg2 border border-[#2a1a08] flex items-center justify-center flex-col gap-3 cursor-pointer"
                     style="aspect-ratio:16/9; display:flex; align-items:center; justify-content:center;">
                    <div class="play-ring" id="featured-play-ring"></div>
                    <div class="font-heading text-[8px] tracking-[2px] text-[#3a2a18] uppercase">YouTube で再生</div>
                </div>
            </div>
            <div>
                <div class="font-display text-[88px] text-[#1c1408] leading-none" style="margin-bottom:-14px;">01</div>
                <h2 class="font-body font-semibold text-[38px] text-brand-text leading-tight" id="featured-title">—</h2>
                <div class="font-heading text-[9px] tracking-[2px] text-[#5a4a30] mt-2 mb-4" id="featured-meta">—</div>
                <p class="font-body text-[14px] italic text-[#7a6a50] leading-[1.75] border-l-2 border-[#221c10] pl-4 mb-5" id="featured-desc">—</p>
                <button id="featured-cta"
                        class="inline-flex items-center gap-2 font-heading text-[9px] tracking-[2px] text-brand-gold uppercase border border-[#C4942A55] px-5 py-3 hover:border-brand-gold hover:bg-[rgba(196,148,42,0.05)] transition-all duration-200">
                    YouTube で聴く →
                </button>
            </div>
        </div>
    </div>
</section>

<div class="max-w-[900px] mx-auto px-10"><hr class="page-rule"></div>


<!-- DISCOGRAPHY -->
<section id="discography" class="scroll-mt-20">
    <div class="max-w-[900px] mx-auto px-10 py-12">
        <div class="flex justify-between items-baseline mb-6">
            <div class="font-display text-[42px] tracking-[3px] text-brand-text">DISCOGRAPHY</div>
            <a href="https://www.youtube.com/@nocta_music" target="_blank" rel="noopener"
               class="font-body text-[14px] italic text-brand-gold hover:opacity-80 transition-opacity">すべての楽曲 →</a>
        </div>
        <div id="discography-list"></div>
    </div>
</section>

<div class="max-w-[900px] mx-auto px-10"><hr class="page-rule"></div>
```

- [ ] **Step 2: コミットする**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/index.html
git commit -m "feat(phase-a): Featured Track・Discographyセクションを実装"
```

---

### Task A-4: Visual セクション置換

**Files:**
- Modify: `website/index.html`（旧 Visual セクション全体を置換）

- [ ] **Step 1: 旧 Visual セクション全体を非対称グリッドに置換する**

まず旧 Visual セクションの範囲を確認する:

```bash
grep -n "id=\"visual\"" /Users/fghmacbook013/NOCTA/project_NOCTA/website/index.html
```

`<section id="visual"` から `</section>` まで全体を以下に置換する:

```html
<!-- VISUAL -->
<section id="visual" class="scroll-mt-20">
    <div class="max-w-[900px] mx-auto px-10 py-12">
        <div class="flex justify-between items-baseline mb-6">
            <div class="font-display text-[42px] tracking-[3px] text-brand-text">VISUAL</div>
            <a href="https://zora.co/@kutakuta1001" target="_blank" rel="noopener"
               class="font-body text-[14px] italic text-brand-gold hover:opacity-80 transition-opacity">アーカイブ →</a>
        </div>
        <!-- Non-symmetric grid: 2fr 1fr 1fr / 170px 170px — populated by JS -->
        <div id="visual-grid"
             class="reveal"
             style="display:grid; gap:8px; grid-template-columns: 2fr 1fr 1fr; grid-template-rows: 170px 170px;">
        </div>
    </div>
</section>

<div class="max-w-[900px] mx-auto px-10"><hr class="page-rule"></div>
```

- [ ] **Step 2: コミットする**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/index.html
git commit -m "feat(phase-a): Visualセクションを非対称グリッドに刷新"
```

---

### Task A-5: Tools セクション置換

**Files:**
- Modify: `website/index.html`（旧 Apps セクションを Tools に置換）

- [ ] **Step 1: 旧 Apps セクション全体を Tools セクションに置換する**

```bash
grep -n "id=\"apps\"" /Users/fghmacbook013/NOCTA/project_NOCTA/website/index.html
```

`<section id="apps"` から `</section>` まで全体を以下に置換する:

```html
<!-- TOOLS -->
<section id="tools" class="scroll-mt-20">
    <div class="max-w-[900px] mx-auto px-10 py-12">
        <div class="flex justify-between items-baseline mb-6">
            <div class="font-display text-[42px] tracking-[3px] text-brand-text">TOOLS</div>
            <a href="https://nuword-nu.vercel.app" target="_blank" rel="noopener"
               class="font-body text-[14px] italic text-brand-gold hover:opacity-80 transition-opacity">すべてのツール →</a>
        </div>
        <!-- grid gap=1px Three-Ways パターン — populated by JS -->
        <div class="bg-[#221c10]" style="gap:1px; display:block;">
            <div class="grid grid-cols-1 md:grid-cols-3" style="gap:1px;" id="tools-grid"></div>
        </div>
    </div>
</section>

<div class="max-w-[900px] mx-auto px-10"><hr class="page-rule"></div>
```

- [ ] **Step 2: コミットする**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/index.html
git commit -m "feat(phase-a): ToolsセクションをAppsから刷新"
```

---

### Task A-6: About セクション置換

**Files:**
- Modify: `website/index.html`（旧 About セクションを置換）

- [ ] **Step 1: 旧 About セクション（軌道リング付きの大きなセクション）を2カラムに置換する**

```bash
grep -n "id=\"about\"" /Users/fghmacbook013/NOCTA/project_NOCTA/website/index.html
```

`<section id="about"` から `</section>` まで全体を以下に置換する:

```html
<!-- ABOUT -->
<section id="about" class="scroll-mt-20">
    <div class="max-w-[900px] mx-auto px-10 py-12">
        <div class="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 items-start reveal">
            <div>
                <div class="font-heading text-[9px] tracking-[3px] text-brand-gold uppercase mb-3">About</div>
                <h2 class="font-body font-semibold text-[26px] text-brand-text leading-snug">遊ぶように、<br>作る。</h2>
            </div>
            <div class="font-body text-[15px] italic text-[#7a6a50] leading-[1.85]">
                <p>AIが仕事や消費の多くを担うようになる時代、人間には新しい営みが必要になります。</p>
                <p class="mt-4">NOCTAは、その問いに音楽・映像・ツールで答えます。消費でも生産でもない、「遊び」と「創造」の境界を探し続けます。</p>
            </div>
        </div>
    </div>
</section>

<div class="max-w-[900px] mx-auto px-10"><hr class="page-rule"></div>
```

- [ ] **Step 2: コミットする**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/index.html
git commit -m "feat(phase-a): Aboutセクションを新コピー・2カラムに刷新"
```

---

### Task A-7: Contact セクション更新 + Footer 置換

**Files:**
- Modify: `website/index.html`（Contact 内のコピー・SNS URL + Footer）

- [ ] **Step 1: Contact セクションの glow bg と h2 を更新する**

Contact セクション内の glow bg 要素（`rgba(200,162,255,...)` のグラデーション div）を削除する:

```bash
grep -n "rgba(200,162,255" /Users/fghmacbook013/NOCTA/project_NOCTA/website/index.html
```

該当する div を削除する。

Contact h2 を変更する:

変更前（`data-i18n-html="contact.h2"` のある h2）:
```html
                <h2 class="font-jp text-[clamp(30px,4.5vw,48px)] font-bold text-white leading-tight mb-5 reveal reveal-delay-1" data-i18n-html="contact.h2">
                    一緒に、<span class="text-gradient">未来の音楽</span>を<br>作りませんか
                </h2>
```

変更後:
```html
                <h2 class="font-body text-[clamp(26px,4vw,40px)] font-semibold text-brand-text leading-tight mb-5 reveal reveal-delay-1">
                    一緒に、<span class="text-[#C4942A] italic">音楽</span>を<br>作りませんか
                </h2>
```

- [ ] **Step 2: Contact 内の X リンクの TODO href を実際の URL に更新する**

変更前:
```html
                    <!-- TODO: href に X アカウント URL を設定 例: https://x.com/nocta_music -->
                    <a href="#" class="social-link">
```

変更後:
```html
                    <a href="https://x.com/nocta_music" target="_blank" rel="noopener" class="social-link">
```

- [ ] **Step 3: `<footer>` 全体を新しいデザインに置換する**

```bash
grep -n "<footer\|</footer>" /Users/fghmacbook013/NOCTA/project_NOCTA/website/index.html
```

`<footer` から `</footer>` まで全体を以下に置換する:

```html
<footer>
    <div class="max-w-[900px] mx-auto px-10 py-12">
        <div class="flex justify-between items-end mb-7">
            <div class="font-body font-semibold text-[22px] text-brand-text leading-snug">
                遊び方は、<br>
                <em class="text-[#C4942A] not-italic italic">自分で決める。</em>
            </div>
            <a href="#contact"
               class="font-heading text-[9px] tracking-[2px] text-brand-gold uppercase border border-[#C4942A55] px-6 py-3 hover:border-brand-gold hover:bg-[rgba(196,148,42,0.05)] transition-all duration-200 whitespace-nowrap">
                お問い合わせ →
            </a>
        </div>
        <hr class="page-rule mb-5">
        <div class="flex justify-between items-center">
            <div class="font-body text-[12px] italic text-[#3a2a18]">© 2024 NOCTA Music Entertainment</div>
            <div class="flex gap-5">
                <a href="https://x.com/nocta_music" target="_blank" rel="noopener"
                   class="font-heading text-[9px] tracking-[2px] text-[#4a3a28] hover:text-brand-sub transition-colors uppercase">X (Twitter)</a>
                <a href="https://www.youtube.com/@nocta_music" target="_blank" rel="noopener"
                   class="font-heading text-[9px] tracking-[2px] text-[#4a3a28] hover:text-brand-sub transition-colors uppercase">YouTube</a>
            </div>
        </div>
    </div>
</footer>
```

- [ ] **Step 4: コミットする**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/index.html
git commit -m "feat(phase-a): Contact・Footer を新デザインに刷新"
```

---

### Task A-8: JavaScript 全面刷新（新レンダリング関数 + 既存モーダル維持）

**Files:**
- Modify: `website/index.html`（`<script>` ブロックの大部分を置換）

- [ ] **Step 1: 削除する旧 JS 関数を特定する**

```bash
grep -n "function\|IIFE\|works-grid\|apps-grid\|visual-grid\|particle\|toggleLang\|initParticles" \
    /Users/fghmacbook013/NOCTA/project_NOCTA/website/index.html | head -40
```

維持する関数: `openYouTube()`, `closeYouTube()`, `openVisual()`, `closeVisual()`
削除する IIFE: Particle Canvas, Works render, Visual render（旧）, Apps render, Count-up, Works Filter, Lang toggle

- [ ] **Step 2: 旧レンダリング IIFE を削除し、新しい JS ブロックに置換する**

`website/index.html` の `<script src="works-data.js">` から末尾の `</script>` まで全体を以下に置換する:

```html
<script src="./works-data.js"></script>
<script src="./visual-data.js"></script>
<script src="./apps-data.js"></script>
<script src="./blog-data.js"></script>
<script>

/* ---- YouTube Modal ---- */
function openYouTube(id, title) {
    const modal = document.getElementById('yt-modal');
    const iframe = document.getElementById('yt-iframe');
    if (!modal || !iframe) return;
    iframe.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1';
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}
function closeYouTube() {
    const modal = document.getElementById('yt-modal');
    const iframe = document.getElementById('yt-iframe');
    if (modal) modal.classList.add('hidden');
    if (iframe) iframe.src = '';
    document.body.style.overflow = '';
}
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { closeYouTube(); closeVisual(); }
});


/* ---- Visual Modal ---- */
function openVisual(imgUrl, title, badge, badgeColorClass, desc) {
    const modal = document.getElementById('visual-modal');
    if (!modal) return;
    document.getElementById('visual-modal-img').src   = imgUrl || '';
    document.getElementById('visual-modal-title').textContent = title || '';
    document.getElementById('visual-modal-badge').textContent = badge || '';
    document.getElementById('visual-modal-badge').className   =
        'text-[10px] font-heading font-bold px-2.5 py-1 rounded tracking-wider ' + (badgeColorClass || '');
    document.getElementById('visual-modal-desc').textContent  = desc || '';
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}
function closeVisual() {
    const modal = document.getElementById('visual-modal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
}


/* ---- Navbar scroll ---- */
(function () {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    window.addEventListener('scroll', function () {
        nav.classList.toggle('scrolled', window.scrollY > 60);
    });
})();


/* ---- Hamburger ---- */
function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const hb1  = document.getElementById('hb-1');
    const hb2  = document.getElementById('hb-2');
    const hb3  = document.getElementById('hb-3');
    if (menu) menu.classList.add('hidden');
    if (hb1) hb1.style.transform = '';
    if (hb2) hb2.style.opacity   = '1';
    if (hb3) hb3.style.transform = '';
}
(function () {
    const btn  = document.getElementById('hamburger');
    const menu = document.getElementById('mobile-menu');
    const hb1  = document.getElementById('hb-1');
    const hb2  = document.getElementById('hb-2');
    const hb3  = document.getElementById('hb-3');
    if (!btn) return;
    let open = false;
    btn.addEventListener('click', function () {
        open = !open;
        menu.classList.toggle('hidden', !open);
        hb1.style.transform = open ? 'translateY(5px) rotate(45deg)'  : '';
        hb2.style.opacity   = open ? '0' : '1';
        hb3.style.transform = open ? 'translateY(-5px) rotate(-45deg)' : '';
    });
})();


/* ---- Scroll Reveal ---- */
(function () {
    const obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add('active'); obs.unobserve(e.target); }
        });
    }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });
})();


/* ---- Smooth Scroll ---- */
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
        const el = document.querySelector(this.getAttribute('href'));
        if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
    });
});


/* ---- Featured Track (NOCTA_WORKS[0]) ---- */
(function () {
    if (typeof NOCTA_WORKS === 'undefined' || !NOCTA_WORKS.length) return;
    var w = NOCTA_WORKS[0];

    var titleEl = document.getElementById('featured-title');
    var metaEl  = document.getElementById('featured-meta');
    var descEl  = document.getElementById('featured-desc');
    var ctaEl   = document.getElementById('featured-cta');
    var thumb   = document.getElementById('featured-thumb');

    if (titleEl) titleEl.textContent = w.title || '';
    if (metaEl) {
        var parts = [];
        if (w.cat)  parts.push(w.cat.toUpperCase());
        if (w.bpm)  parts.push('BPM ' + w.bpm);
        if (w.key)  parts.push(w.key);
        if (w.year) parts.push(String(w.year));
        metaEl.textContent = parts.join(' · ');
    }
    if (descEl) descEl.textContent = w.descJa || '';

    if (w.youtubeId && thumb) {
        var img = document.createElement('img');
        img.src = 'https://img.youtube.com/vi/' + w.youtubeId + '/maxresdefault.jpg';
        img.alt = w.title || '';
        img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
        img.onerror = function () { img.remove(); };
        thumb.insertBefore(img, thumb.firstChild);
        thumb.addEventListener('click', function () { openYouTube(w.youtubeId, w.title); });
        if (ctaEl) ctaEl.addEventListener('click', function () { openYouTube(w.youtubeId, w.title); });
    } else if (ctaEl) {
        ctaEl.style.display = 'none';
    }
})();


/* ---- Discography (NOCTA_WORKS 全件) ---- */
(function () {
    var list = document.getElementById('discography-list');
    if (!list || typeof NOCTA_WORKS === 'undefined') return;

    list.innerHTML = NOCTA_WORKS.map(function (w, i) {
        var num    = String(i + 1).padStart(2, '0');
        var year   = w.year  ? String(w.year)  : '';
        var bpmStr = w.bpm   ? 'BPM ' + w.bpm  : '';
        var catStr = w.cat   ? w.cat.toUpperCase() : '';
        var meta   = [catStr, bpmStr].filter(Boolean).join(' · ');
        var hasVid = !!w.youtubeId;
        var cursor = hasVid ? 'cursor-pointer' : 'cursor-default';
        var click  = hasVid
            ? ' onclick="openYouTube(\'' + w.youtubeId + '\',\'' + w.title.replace(/'/g,"\\'") + '\')"'
            : '';
        return [
            '<div class="disc-row ' + cursor + ' grid items-center border-b border-[#1e1408]"',
            '     style="grid-template-columns:36px 1fr auto; gap:16px; padding:15px 0;"' + click + '>',
            '  <div class="font-display text-[18px] text-[#2a2010]">' + num + '</div>',
            '  <div>',
            '    <div class="font-body text-[18px] text-brand-text">' + w.title + '</div>',
            '    <div class="font-heading text-[8px] tracking-[1px] text-[#4a3a28] mt-1">' + meta + '</div>',
            '  </div>',
            '  <div class="font-body text-[13px] italic text-[#3a2a18] hidden sm:block">' + year + '</div>',
            '</div>'
        ].join('');
    }).join('');
})();


/* ---- Visual Grid (非対称) ---- */
(function () {
    var grid = document.getElementById('visual-grid');
    if (!grid) return;
    var WK = typeof NOCTA_VISUALS_WORKS !== 'undefined' ? NOCTA_VISUALS_WORKS : [];
    var ART = typeof NOCTA_VISUALS_ART   !== 'undefined' ? NOCTA_VISUALS_ART   : [];
    var MU  = typeof NOCTA_VISUALS_MUSIC !== 'undefined' ? NOCTA_VISUALS_MUSIC : [];
    var all = WK.concat(ART).concat(MU);
    if (!all.length) return;

    function esc(s) { return (s||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }
    function cell(v, spanRow) {
        var s = '<div class="visual-cell relative overflow-hidden bg-brand-bg2 border border-[#1e1408]"';
        if (spanRow) s += ' style="grid-row:span 2;"';
        s += ' onclick="openVisual(\'' + esc(v.imgUrl) + '\',\'' + esc(v.title) + '\',\'' +
             esc(v.badge) + '\',\'' + esc(v.badgeColorClass) + '\',\'' + esc(v.descJa) + '\')">';
        if (v.imgUrl) {
            s += '<img src="' + v.imgUrl + '" alt="' + esc(v.title) + '" class="w-full h-full object-cover">';
        } else {
            s += '<div class="flex items-center justify-center h-full font-heading text-[8px] tracking-[2px] text-[#2a2010] uppercase">img</div>';
        }
        s += '<div class="absolute bottom-2 left-2 font-heading text-[8px] tracking-[1px] uppercase px-2 py-0.5 border border-[#C4942A33] text-[#C4942A]">' + (v.badge||'') + '</div>';
        s += '</div>';
        return s;
    }
    function placeholder() {
        return '<div class="bg-brand-bg2 border border-[#1e1408] flex items-center justify-center">' +
               '<span class="font-heading text-[7px] tracking-[2px] text-[#2a2010] uppercase">img</span>' +
               '</div>';
    }

    var html = cell(all[0], true);
    for (var i = 1; i < 5; i++) {
        html += (i < all.length) ? cell(all[i], false) : placeholder();
    }
    grid.innerHTML = html;

    /* Scroll reveal を新要素に適用 */
    var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add('active'); obs.unobserve(e.target); }
        });
    }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });
    obs.observe(grid);
})();


/* ---- Tools Grid (NOCTA_APPS) ---- */
(function () {
    var grid = document.getElementById('tools-grid');
    if (!grid || typeof NOCTA_APPS === 'undefined') return;

    grid.innerHTML = NOCTA_APPS.map(function (a) {
        return [
            '<a href="' + (a.url||'#') + '" target="_blank" rel="noopener noreferrer"',
            '   class="tool-card bg-brand-bg block px-6 py-8">',
            '  <div class="font-heading text-[8px] tracking-[2px] text-[#3a2a18] uppercase mb-3">' + (a.badge||'App') + '</div>',
            '  <div class="font-body font-semibold text-[18px] text-brand-text mb-2">' + (a.title||'') + '</div>',
            '  <p class="font-body text-[13px] italic text-[#5a4a30] leading-relaxed">' + (a.descJa||'') + '</p>',
            '</a>'
        ].join('');
    }).join('');
})();



</script>
```

- [ ] **Step 3: コミットする**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/index.html
git commit -m "feat(phase-a): 新レンダリング関数（Featured・Discography・Visual・Tools）を実装"
```

---

### Task A-9: 動作確認 + 不要要素の最終クリーンアップ

**Files:**
- Modify: `website/index.html`（残存する旧セクション / data-i18n 属性 / lang toggle 等の削除）

- [ ] **Step 1: 残存する旧セクションを確認する**

```bash
grep -n "id=\"services\"\|id=\"blog\"\|id=\"works\"\|shimmer-text\|star-float\|brand-badge\|vocaloid\|data-i18n\|lang-btn\|toggleLang" \
    /Users/fghmacbook013/NOCTA/project_NOCTA/website/index.html | head -30
```

- Services セクション（`id="services"`）が残っている場合は削除する
- Blog セクション（`id="blog"`）は維持するかCEOに確認する（仕様書では記載なし）
- `data-i18n` 属性は残っていても動作に影響しないためそのままでよい
- `shimmer-text` クラスが Hero h1 に使われている場合は削除して通常の `text-brand-text` に変える

- [ ] **Step 2: ローカルサーバーで全セクションを目視確認する**

```bash
python3 -m http.server 8888 --directory /Users/fghmacbook013/NOCTA/project_NOCTA/website
```

以下を全て確認する:
- Masthead が固定表示・スクロール時に半透明背景が付く
- Hero タイトルが EB Garamond で表示、「遊び方。」がゴールド
- Three Ways の3列が正しく表示
- Featured Track が `NOCTA_WORKS[0]` のデータ（タイトル・説明）を表示
- Discography リストが全 NOCTA_WORKS を行形式で表示
- Visual グリッドが非対称（左列2行span）で表示
- Tools が3列グリッドで表示
- About・Footer が正しく表示
- Contact フォームが動作
- スムーズスクロールが機能（ナビリンクをクリック）
- YouTube モーダルが `NOCTA_WORKS[0]` に youtubeId がある場合に動作
- スマホ幅（375px）でレイアウトが崩れない（DevTools でエミュレート）

- [ ] **Step 3: コミットする（問題があれば修正後）**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/index.html
git commit -m "feat(phase-a): 動作確認・残存旧要素クリーンアップ"
```

---

### Task A-10: ドキュメント更新 + 最終コミット

**Files:**
- Modify: `website/DESIGN.md`
- Modify: `website/CLAUDE.md`
- Modify: `project_NOCTA/handoff.md`

- [ ] **Step 1: DESIGN.md のカラートークン・フォントセクションを更新する**

`website/DESIGN.md` を読んでカラートークンとフォントの記述箇所を特定し、以下の値に更新する:

```markdown
## カラートークン（2026-06-04 更新）

| Tailwind クラス | 値 | 用途 |
|---|---|---|
| brand-bg | `#0A0906` | ページ背景（ウォームブラック） |
| brand-bg2 | `#0F0D0A` | カード背景 |
| brand-primary / brand-gold | `#C4942A` | ゴールド（ラベンダー廃止） |
| brand-text | `#F0EAD8` | メインテキスト（クリーム） |
| brand-sub | `#7a6a50` | サブテキスト（ウォームグレー） |
| `#221c10` | — | ボーダー・ルーラー |
| `#1c1408` | — | Bebas Neue 背景数字 |
| `#4a3a28` | — | eyebrow テキスト |
| `#3a2a18` | — | SNSリンク・最も薄いテキスト |

廃止: `#C8A2FF`（ラベンダー）・`#39FF6A`（ネオングリーン）

## フォント（2026-06-04 更新）

| クラス | ファミリー | 用途 |
|---|---|---|
| font-body | EB Garamond, Georgia, serif | 見出し・本文・イタリック引用 |
| font-heading | Syne | ラベル・ナビ・メタ情報 |
| font-display | Bebas Neue | 大番号・セクション見出し |
| font-jp | Noto Sans JP | フォーム・日本語細部 |

廃止: Inter / Space Grotesk
```

- [ ] **Step 2: website/CLAUDE.md のデザインシステム表を更新する**

`website/CLAUDE.md` の「デザインシステム」セクション内の以下を変更する:

変更前:
```markdown
- ブランドカラー: `text-brand-secondary`（グリーン系アクセント）
```

変更後:
```markdown
- ブランドカラー: `text-brand-gold` / `text-[#C4942A]`（ゴールドのみ。ラベンダー・ネオングリーン廃止）
```

「NOCTA共通のコンテキスト」ブロックを更新する:

変更前:
```
Tone: editorial serif-led dark
Constraints: Tailwind CSS CDN, relative paths, Syne/Bebas Neue fonts
Background: #05050F dark base, warm cream accents
Accent: brand-secondary green
```

変更後:
```
Tone: editorial serif-led dark
Constraints: Tailwind CSS CDN, relative paths, EB Garamond/Syne/Bebas Neue fonts
Background: #0A0906 warm dark base, cream accents #F0EAD8
Accent: brand-gold #C4942A (only accent color)
```

- [ ] **Step 3: handoff.md を更新する**

`project_NOCTA/handoff.md` に追記する:

```
2026-06-04 Phase A完了（HTML全面刷新・EB Garamond・ゴールド2色体制）。DESIGN.md・website/CLAUDE.md更新済み。GitHub Pagesでのデプロイ確認要。
```

- [ ] **Step 4: 最終コミット**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/DESIGN.md website/CLAUDE.md project_NOCTA/handoff.md
git commit -m "docs: Phase A完了 — DESIGN.md・CLAUDE.mdをリデザイン後の仕様に更新"
```

---

## 注意事項

### SNS URL
- X: `https://x.com/nocta_music`（仮。CEO に実際の URL を確認すること）
- YouTube: `https://www.youtube.com/@nocta_music`（仮。実際の URL を確認すること）

### NOCTA_WORKS の `year`・`bpm`・`key` フィールド
現在の `works-data.js` にこれらのフィールドは未定義。
Featured Track と Discography のメタ表示は `cat` のみになる（`parts.join(' · ')` のため空配列は無視される）。
将来これらを追加する場合は `works-data.js` の各オブジェクトに `year: 2024, bpm: 152, key: 'C# Major'` を追記する。

### Phase A のスコープ外
- Blog セクション（`#blog`）の扱いは仕様書に明記なし。残す場合は既存 HTML を維持し、新レンダリング関数の IIFE でカバーする。
- `the-first-flower/` LP は変更しない。
- データファイル（`works-data.js` / `visual-data.js` / `apps-data.js`）の構造は変更しない。

### GitHub Pages デプロイ
```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git push origin main
```
push 後、`https://kutakuta1001.github.io/NOCTA/` で反映を確認する（GitHub Actions が数十秒〜数分で完了）。
