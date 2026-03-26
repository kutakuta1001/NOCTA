# Visual Portfolio セクション 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** NOCTA HP の Works セクション直下に Visual Portfolio セクションを追加し、Cloudinary に保存した画像をライトボックスで閲覧できるようにする。

**Architecture:** `visual-data.js`（新規）に `NOCTA_VISUALS` 配列を定義し、`index.html` の JS IIFE がカードをレンダリングする。Works セクションのパターンを踏襲しつつ、フィルター・ライトボックスは Works と独立して実装する。

**Tech Stack:** HTML / Tailwind CSS（CDN）/ Vanilla JS / Cloudinary（画像配信）/ Netlify（デプロイ）

**Spec:** `docs/superpowers/specs/2026-03-26-visual-portfolio-design.md`

---

## ファイル構成

```
website/
├── visual-data.js     ← 新規作成
└── index.html         ← 4箇所修正:
                           1. Visual セクション HTML（#works 直後）
                           2. ライトボックスモーダル HTML（#yt-modal 直後）
                           3. <script src="visual-data.js"> タグ（works-data.js 直後）
                           4. Visual JS（レンダリング + フィルター + ライトボックス）
                           5. Nav リンク（デスクトップ・モバイル・フッター）
```

---

## Task 1: `visual-data.js` を作成する

**Files:**
- Create: `website/visual-data.js`

- [ ] **Step 1: ファイルを作成する**

`website/visual-data.js` に以下の内容を書く:

```js
/**
 * NOCTA Visual Portfolio Data
 *
 * 画像を追加するときは、この配列の先頭に新しいオブジェクトを追加してください。
 *
 * cloudinaryUrl : Cloudinary のフル解像度 URL
 * thumbUrl      : サムネ用 URL（cloudinaryUrl の /upload/ 直後に w_600/ を挿入）
 *                 例: .../upload/v123/img.jpg → .../upload/w_600/v123/img.jpg
 * cat           : "art" | "photo"
 */
const NOCTA_VISUALS = [
  {
    title: "Sample Art",
    cat: "art",
    cloudinaryUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    thumbUrl: "https://res.cloudinary.com/demo/image/upload/w_600/sample.jpg",
    badge: "Art",
    badgeColorClass: "bg-brand-secondary/20 text-brand-secondary",
    descJa: "サンプル。Cloudinary の URL に差し替えてください。",
    descEn: "Sample. Replace with your Cloudinary URL."
  }
];
```

- [ ] **Step 2: 内容を検証する**

Read ツールで `website/visual-data.js` を読み込み、以下を確認する:
- `const NOCTA_VISUALS` が定義されているか
- `cat: "art"` が含まれているか（`"ai-art"` ではないこと）
- `cloudinaryUrl` と `thumbUrl` の両フィールドがあるか

- [ ] **Step 3: コミットする**

```bash
git add website/visual-data.js
git commit -m "feat(visual): visual-data.js を追加（NOCTA_VISUALS 配列）"
```

---

## Task 2: Visual セクション HTML をindex.html に追加する

**Files:**
- Modify: `website/index.html`（Works セクション末尾 line 762 の直後）

- [ ] **Step 1: Visual セクション HTML を挿入する**

`index.html` の line 762 の `</section>` の直後（line 763 の空行の後）、Services セクション（`<!-- 04. SERVICES -->`）の前に以下を挿入する:

```html

<!-- =============================================
     04.5 VISUAL PORTFOLIO
     ============================================= -->
<section id="visual" class="py-32 relative z-10 border-b border-white/5">
    <div class="max-w-[1200px] mx-auto px-6 lg:px-8">

        <div class="text-center mb-16 reveal">
            <h2 class="font-display text-[clamp(52px,8vw,100px)] text-white tracking-[4px] mb-4">VISUAL</h2>
            <p class="font-jp text-brand-sub text-[15px] tracking-wider">Art & Photography</p>

            <!-- Filter pills — Works の .filter-pill と分離するため .vfilter-pill を使用 -->
            <div class="mt-8 inline-flex bg-white/5 rounded-full p-1.5 gap-1 glass">
                <button class="vfilter-pill active" data-vfilter="all">All</button>
                <button class="vfilter-pill" data-vfilter="art">Art</button>
                <button class="vfilter-pill" data-vfilter="photo">Photo</button>
            </div>
        </div>

        <!-- Grid — visual-data.js から JS でレンダリング -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7" id="visual-grid">
        </div>
    </div>
</section>
```

- [ ] **Step 2: `.vfilter-pill` の CSS を追加する**

`index.html` の CSS セクションで `.filter-pill` の定義（line 160付近）の直後に以下を追加する:

```css
/* Visual フィルターピル（Works の .filter-pill と独立） */
.vfilter-pill {
    padding: 0.35rem 1.1rem;
    border-radius: 9999px;
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #8A8A9E;
    cursor: pointer;
    transition: all 0.25s ease;
    background: transparent;
    border: none;
}
.vfilter-pill:hover, .vfilter-pill.active {
    background: rgba(200,162,255,0.12);
    color: #C8A2FF;
}
```

- [ ] **Step 3: 内容を検証する**

Read ツールで `index.html` を確認し以下をチェックする:
- `id="visual"` セクションが `</section>` (Works) の直後にあるか
- `id="visual-grid"` が含まれているか
- `vfilter-pill` CSS が追加されているか
- `.filter-pill` の既存 CSS に変更がないか

- [ ] **Step 4: コミットする**

```bash
git add website/index.html
git commit -m "feat(visual): Visual セクション HTML と vfilter-pill CSS を追加"
```

---

## Task 3: ライトボックスモーダル HTML を index.html に追加する

**Files:**
- Modify: `website/index.html`（#yt-modal の直後、line 1126 付近）

- [ ] **Step 1: ライトボックス HTML を挿入する**

`index.html` の `#yt-modal` の閉じタグ `</div>` (line 1126) の直後に以下を挿入する:

```html

<!-- =============================================
     VISUAL MODAL (LIGHTBOX)
     ============================================= -->
<div id="visual-modal" class="hidden fixed inset-0 z-[200] flex items-center justify-center p-4"
     onclick="if(event.target===this)closeVisual()">
    <div class="absolute inset-0 bg-black/85 backdrop-blur-sm" onclick="closeVisual()"></div>
    <div class="relative w-full max-w-[900px] z-10">
        <button onclick="closeVisual()"
                class="absolute -top-9 right-0 font-heading text-[11px] tracking-[2px] uppercase text-brand-sub hover:text-white transition-colors duration-200">
            ESC / CLOSE ✕
        </button>
        <img id="visual-modal-img" src="" alt=""
             class="w-full rounded-2xl object-contain max-h-[70vh] bg-black/40">
        <div class="mt-4">
            <div class="flex items-center gap-3 mb-2">
                <span id="visual-modal-badge"
                      class="text-[10px] font-heading font-bold px-2.5 py-1 rounded tracking-wider"></span>
                <h3 id="visual-modal-title"
                    class="font-heading font-bold text-[17px] text-white"></h3>
            </div>
            <p id="visual-modal-desc"
               class="font-jp text-[13px] text-brand-sub leading-relaxed"></p>
        </div>
    </div>
</div>
```

- [ ] **Step 2: 内容を検証する**

Read ツールで確認:
- `id="visual-modal"` が `#yt-modal` の直後にあるか
- `id="visual-modal-img"` / `id="visual-modal-title"` / `id="visual-modal-badge"` / `id="visual-modal-desc"` の4要素があるか
- `closeVisual()` が onclick に設定されているか

- [ ] **Step 3: コミットする**

```bash
git add website/index.html
git commit -m "feat(visual): ライトボックスモーダル HTML を追加"
```

---

## Task 4: `<script>` タグと Visual JS を index.html に追加する

**Files:**
- Modify: `website/index.html`（JS セクション）

- [ ] **Step 1: `<script src="visual-data.js">` タグを追加する**

line 1132 の `<script src="works-data.js"></script>` の直後に追加する:

```html
<script src="visual-data.js"></script>
```

- [ ] **Step 2: Visual レンダリング IIFE を追加する**

Works レンダリング IIFE の末尾 `})();`（line 1377付近）の直後に以下を追加する:

```js

/* ---- Visual: データ配列からカードをレンダリング ---- */
(function () {
    var section = document.getElementById('visual');
    var grid = document.getElementById('visual-grid');
    if (!grid || typeof NOCTA_VISUALS === 'undefined') return;

    // 空配列時はセクションごと非表示
    if (NOCTA_VISUALS.length === 0) {
        if (section) section.style.display = 'none';
        return;
    }

    grid.innerHTML = NOCTA_VISUALS.map(function (v, i) {
        var col    = i % 3;
        var delay  = col === 1 ? ' reveal-delay-1' : col === 2 ? ' reveal-delay-2' : '';
        var dstyle = col > 0 ? ' style="transition-delay:' + (col * 0.1) + 's"' : '';
        var onclick = ' onclick="openVisual(' +
            '\'' + v.cloudinaryUrl.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + '\',' +
            '\'' + v.title.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + '\',' +
            '\'' + v.badge + '\',' +
            '\'' + v.badgeColorClass + '\',' +
            '\'' + v.descJa.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + '\'' +
            ')"';

        return [
            '<div class="work-card glass rounded-2xl overflow-hidden border border-white/5 cursor-pointer reveal' + delay + '"',
            '     data-vcat="' + v.cat + '"' + dstyle + onclick + '>',
            '  <div class="relative aspect-video overflow-hidden">',
            '    <img src="' + v.thumbUrl + '" alt="' + v.title.replace(/"/g, '&quot;') + '"',
            '         class="w-full h-full object-cover transition-transform duration-500 hover:scale-105">',
            '    <div class="thumb-overlay"></div>',
            '  </div>',
            '  <div class="p-6">',
            '    <div class="flex justify-between items-start mb-2">',
            '      <h3 class="font-heading font-bold text-[17px] text-white">' + v.title + '</h3>',
            '      <span class="text-[10px] font-heading font-bold px-2.5 py-1 rounded ' + v.badgeColorClass + ' tracking-wider">' + v.badge + '</span>',
            '    </div>',
            '    <p class="font-jp text-[13px] text-brand-sub leading-relaxed">' + v.descJa + '</p>',
            '  </div>',
            '</div>'
        ].join('\n');
    }).join('\n');

    // Scroll Reveal を適用
    var obs2 = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add('active'); obs2.unobserve(e.target); }
        });
    }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });
    grid.querySelectorAll('.reveal').forEach(function (el) { obs2.observe(el); });

    // Visual フィルター
    var vpills = document.querySelectorAll('.vfilter-pill');
    var vcards = grid.querySelectorAll('[data-vcat]');
    vpills.forEach(function (pill) {
        pill.addEventListener('click', function () {
            vpills.forEach(function (p) { p.classList.remove('active'); });
            this.classList.add('active');
            var f = this.getAttribute('data-vfilter');
            vcards.forEach(function (card) {
                var show = f === 'all' || card.getAttribute('data-vcat') === f;
                if (show) {
                    card.style.display = '';
                    requestAnimationFrame(function () {
                        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                        card.style.opacity = '1';
                        card.style.transform = '';
                    });
                } else {
                    card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(12px)';
                    setTimeout(function () { card.style.display = 'none'; }, 320);
                }
            });
        });
    });
})();
```

- [ ] **Step 3: Visual ライトボックス関数を追加する**

`closeYouTube()` / `closeVisual()` の ESC キーハンドラ（line 1397付近）の直前に以下を追加する:

```js

/* ---- Visual Lightbox ---- */
function openVisual(imgUrl, title, badge, badgeClass, desc) {
    var modal = document.getElementById('visual-modal');
    document.getElementById('visual-modal-img').src = imgUrl;
    document.getElementById('visual-modal-title').textContent = title;
    var badgeEl = document.getElementById('visual-modal-badge');
    badgeEl.textContent = badge;
    badgeEl.className = 'text-[10px] font-heading font-bold px-2.5 py-1 rounded tracking-wider ' + badgeClass;
    document.getElementById('visual-modal-desc').textContent = desc;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeVisual() {
    var modal = document.getElementById('visual-modal');
    if (!modal) return;
    document.getElementById('visual-modal-img').src = '';
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}
```

- [ ] **Step 4: ESC キーハンドラを更新する**

既存の ESC キーハンドラ（line 1397付近）を以下に置き換える:

```js
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeYouTube(); closeVisual(); }
});
```

- [ ] **Step 5: 内容を検証する**

Read ツールで確認:
- `<script src="visual-data.js">` が `works-data.js` の直後にあるか
- `NOCTA_VISUALS` の IIFE が存在するか
- `openVisual` / `closeVisual` 関数が存在するか
- ESC ハンドラに `closeVisual()` が含まれているか
- `obs2` という別名が使われているか（Works の `obs` と衝突しないこと）

- [ ] **Step 6: コミットする**

```bash
git add website/index.html
git commit -m "feat(visual): script タグ・レンダリング IIFE・ライトボックス JS を追加"
```

---

## Task 5: Nav・フッターに Visual リンクを追加し push する

**Files:**
- Modify: `website/index.html`（Nav デスクトップ・モバイル・フッター）

- [ ] **Step 1: デスクトップ Nav に Visual リンクを追加する**

line 452 の Works リンクの直後に追加する:

変更前:
```html
<a href="#works"    class="text-brand-sub hover:text-white transition-colors duration-300">Works</a>
<a href="#services" class="text-brand-sub hover:text-white transition-colors duration-300">Services</a>
```

変更後:
```html
<a href="#works"    class="text-brand-sub hover:text-white transition-colors duration-300">Works</a>
<a href="#visual"   class="text-brand-sub hover:text-white transition-colors duration-300">Visual</a>
<a href="#services" class="text-brand-sub hover:text-white transition-colors duration-300">Services</a>
```

- [ ] **Step 2: モバイル Nav に Visual リンクを追加する**

line 473 の Works リンクの直後に追加する:

変更前:
```html
<a href="#works"    class="text-brand-sub hover:text-white transition-colors">Works</a>
<a href="#services" class="text-brand-sub hover:text-white transition-colors">Services</a>
```

変更後:
```html
<a href="#works"    class="text-brand-sub hover:text-white transition-colors">Works</a>
<a href="#visual"   class="text-brand-sub hover:text-white transition-colors">Visual</a>
<a href="#services" class="text-brand-sub hover:text-white transition-colors">Services</a>
```

- [ ] **Step 3: フッターの Company リンクに Visual を追加する**

line 1084 の Works リンクの直後に追加する:

変更前:
```html
<a href="#about"   class="hover:text-white transition-colors duration-200">About</a>
<a href="#works"   class="hover:text-white transition-colors duration-200">Works</a>
<a href="#news"    class="hover:text-white transition-colors duration-200">News</a>
```

変更後:
```html
<a href="#about"   class="hover:text-white transition-colors duration-200">About</a>
<a href="#works"   class="hover:text-white transition-colors duration-200">Works</a>
<a href="#visual"  class="hover:text-white transition-colors duration-200">Visual</a>
<a href="#news"    class="hover:text-white transition-colors duration-200">News</a>
```

- [ ] **Step 4: 内容を検証する**

Read ツールで確認:
- デスクトップ Nav: Works → Visual → Services の順になっているか
- モバイル Nav: Works → Visual → Services の順になっているか
- フッター: Works → Visual → News の順になっているか

- [ ] **Step 5: コミット & プッシュする**

```bash
git add website/index.html
git commit -m "feat(visual): Nav・フッターに Visual リンクを追加"
git push origin main
```

注意: この push により Task 1〜4 のコミットも含めて一括でリモートに送信される。

---

## 完了の確認

全タスク完了後、以下で動作確認する:

```bash
# ファイルが存在するか
ls website/visual-data.js

# index.html に必要な要素が含まれているか
grep "visual-data.js\|id=\"visual\"\|id=\"visual-grid\"\|id=\"visual-modal\"\|openVisual\|closeVisual\|vfilter-pill\|href=\"#visual\"" website/index.html
```

期待する出力（各行が1件以上ヒット）:
```
visual-data.js
id="visual"
id="visual-grid"
id="visual-modal"
openVisual
closeVisual
vfilter-pill
href="#visual"
```
