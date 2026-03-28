# Apps Portfolio (TOOLS Section) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** NOCTA HP に TOOLS セクションを追加し、3本のウェブアプリをカード+モーダルで紹介する。

**Architecture:** works-data.js / visual-data.js と同じパターンで apps-data.js を新規作成する。index.html に #apps セクション・#app-modal・ナビリンク・レンダリング JS を追加する。サムネイルは Works と同じグラデーション背景（thumbClass）を使用し、カードクリックでモーダルを開き「アプリを開く」ボタンで新しいタブを開く。

**Tech Stack:** Vanilla HTML / CSS (Tailwind CDN) / JavaScript (ES5 互換)、静的ファイル

---

## ファイル構成

| ファイル | 変更種別 | 内容 |
|---|---|---|
| `website/apps-data.js` | **新規作成** | `NOCTA_APPS` 配列（アプリデータ） |
| `website/index.html` | **修正** | #apps セクション・#app-modal・ナビリンク・script タグ・レンダリング JS |

---

## Task 1: apps-data.js を作成する

**Files:**
- Create: `website/apps-data.js`

- [ ] **Step 1: apps-data.js を作成する**

`website/apps-data.js` を新規作成し、以下の内容を書く：

```js
/**
 * NOCTA Apps Portfolio Data
 *
 * アプリを追加するときは、この配列の先頭に新しいオブジェクトを追加してください。
 *
 * title        : アプリ名
 * cat          : "app"（将来の拡張用。現時点は "app" のみ）
 * url          : アプリの URL（モーダルの「アプリを開く」ボタン先）
 * thumbClass   : Works と同じグラデーション背景クラス（"thumb-1"〜"thumb-6"）
 * badge        : バッジ表示テキスト
 * badgeColorClass : Tailwind 色クラス
 * descJa       : 日本語説明
 * descEn       : 英語説明
 */
const NOCTA_APPS = [
  {
    title: "Thought Network",
    cat: "app",
    url: "https://example.com/thought-network",
    thumbClass: "thumb-3",
    badge: "App",
    badgeColorClass: "bg-brand-highlight/20 text-brand-highlight",
    descJa: "過去のメモを起点に、自分の思考をネットワーク状に可視化・記録できるウェブアプリ。",
    descEn: "A web app to visualize and record your thoughts as a network, starting from past notes."
  },
  {
    title: "Book Highlights",
    cat: "app",
    url: "https://example.com/book-highlights",
    thumbClass: "thumb-2",
    badge: "App",
    badgeColorClass: "bg-brand-secondary/20 text-brand-secondary",
    descJa: "読書中に出会った印象的な文章をストックし、ランダムに表示するウェブアプリ。",
    descEn: "A web app to store and randomly display memorable passages encountered while reading."
  },
  {
    title: "Self Reflection",
    cat: "app",
    url: "https://example.com/self-reflection",
    thumbClass: "thumb-1",
    badge: "App",
    badgeColorClass: "bg-brand-primary/20 text-brand-primary",
    descJa: "日々の内省を記録し、自己理解を深めるためのウェブアプリ。",
    descEn: "A web app for recording daily reflections and deepening self-understanding."
  }
];
```

> **注意:** `url` / `title` / `descJa` / `descEn` は仮の値。実際のデータに差し替えてください。thumbClass は thumb-1〜thumb-6 から選択。

- [ ] **Step 2: ブラウザで JS 構文エラーがないか確認する**

ターミナルで:
```bash
node -e "$(cat website/apps-data.js); console.log('OK:', NOCTA_APPS.length, 'apps')"
```

期待する出力:
```
OK: 3 apps
```

- [ ] **Step 3: コミット**

```bash
git add website/apps-data.js
git commit -m "feat(apps): add apps-data.js with 3 placeholder entries"
```

---

## Task 2: index.html に HTML を追加する

**Files:**
- Modify: `website/index.html`

4箇所を変更する: ① #apps セクション ② #app-modal ③ ナビリンク ④ script タグ

### ① #apps セクション

- [ ] **Step 1: #apps セクションを #visual の直後に挿入する**

`website/index.html` の **line 808** （`#visual` セクションの閉じタグ `</section>` の直後）に以下を挿入:

```html
        <!-- =============================================
             04.6 APPS PORTFOLIO
             ============================================= -->
        <section id="apps" class="py-32 relative z-10 border-b border-white/5">
            <div class="max-w-[1200px] mx-auto px-6 lg:px-8">

                <div class="text-center mb-16 reveal">
                    <h2 class="font-display text-[clamp(52px,8vw,100px)] text-white tracking-[4px] mb-4">TOOLS</h2>
                    <p class="font-jp text-brand-sub text-[15px] tracking-wider">Web Applications</p>
                </div>

                <!-- Grid — apps-data.js から JS でレンダリング -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7" id="apps-grid">
                </div>
            </div>
        </section>
```

### ② #app-modal

- [ ] **Step 2: #app-modal を #visual-modal の直後に挿入する**

`website/index.html` の **line 1200** （`#visual-modal` の `</div>` の直後）に以下を挿入:

```html
        <!-- =============================================
             APP MODAL
             ============================================= -->
        <div id="app-modal" class="hidden fixed inset-0 z-[200] flex items-center justify-center p-4"
             onclick="if(event.target===this)closeApp()">
            <div class="absolute inset-0 bg-black/85 backdrop-blur-sm" onclick="closeApp()"></div>
            <div class="relative w-full max-w-[640px] z-10">
                <button onclick="closeApp()"
                        class="absolute -top-9 right-0 font-heading text-[11px] tracking-[2px] uppercase text-brand-sub hover:text-white transition-colors duration-200">
                    ESC / CLOSE ✕
                </button>
                <div id="app-modal-thumb" class="thumb-1 w-full aspect-video rounded-2xl flex items-center justify-center">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <circle cx="24" cy="24" r="22" stroke="rgba(200,162,255,0.35)" stroke-width="1"/>
                        <path d="M20 16 L34 24 L20 32 Z" fill="rgba(200,162,255,0.55)"/>
                    </svg>
                </div>
                <div class="mt-4">
                    <div class="flex items-center gap-3 mb-2">
                        <span id="app-modal-badge"
                              class="text-[10px] font-heading font-bold px-2.5 py-1 rounded tracking-wider"></span>
                        <h3 id="app-modal-title"
                            class="font-heading font-bold text-[17px] text-white"></h3>
                    </div>
                    <p id="app-modal-desc"
                       class="font-jp text-[13px] text-brand-sub leading-relaxed mb-4"></p>
                    <a id="app-modal-link" href="" target="_blank" rel="noopener noreferrer"
                       class="inline-flex items-center gap-2 font-heading text-[12px] tracking-[2px] uppercase text-brand-primary hover:text-white transition-colors duration-200">
                        アプリを開く →
                    </a>
                </div>
            </div>
        </div>
```

### ③ ナビリンク（3箇所）

- [ ] **Step 3: デスクトップナビに #apps リンクを追加する**

`website/index.html` の **line 472** の `<a href="#visual" ...>Visual</a>` の**直後（line 473 の前）**に以下を挿入:

```html
<a href="#apps" class="text-brand-sub hover:text-white transition-colors duration-300">Tools</a>
```

- [ ] **Step 4: モバイルナビに #apps リンクを追加する**

`website/index.html` の **line 494** （モバイルの `<a href="#visual" ...>Visual</a>` の直後）に以下を挿入:

```html
<a href="#apps" class="text-brand-sub hover:text-white transition-colors">Tools</a>
```

- [ ] **Step 5: フッターに #apps リンクを追加する**

`website/index.html` の **line 1131** （フッターの `<a href="#visual" ...>Visual</a>` の直後）に以下を挿入:

```html
<a href="#apps" class="hover:text-white transition-colors duration-200">Tools</a>
```

### ④ script タグ

- [ ] **Step 6: apps-data.js の script タグを追加する**

`website/index.html` の **line 1207** （`<script src="visual-data.js"></script>` の直後）に以下を挿入:

```html
<script src="apps-data.js"></script>
```

- [ ] **Step 7: ブラウザで表示確認する**

`website/index.html` をブラウザで開き、以下を確認:
- TOOLS セクションが `#visual` の下に表示される（JS未追加なのでグリッドは空）
- ナビに「Tools」リンクが表示される
- 「Tools」クリックで #apps にスクロールする
- フッターに「Tools」リンクが表示される

- [ ] **Step 8: コミット**

```bash
git add website/index.html
git commit -m "feat(apps): add #apps section HTML, #app-modal, nav links, script tag"
```

---

## Task 3: index.html に JS を追加する

**Files:**
- Modify: `website/index.html`

3箇所を変更する: ① Apps レンダリング IIFE ② openApp/closeApp 関数 ③ ESC ハンドラ

### ① Apps レンダリング IIFE

- [ ] **Step 1: Apps レンダリング IIFE を追加する**

`website/index.html` の Visual レンダリング IIFE の直後（`})();` の次の行）に以下を挿入:

```js
    /* ---- Apps: データ配列からカードをレンダリング ---- */
    (function () {
        var section = document.getElementById('apps');
        var grid = document.getElementById('apps-grid');
        if (!grid || typeof NOCTA_APPS === 'undefined') return;

        // 空配列時はセクションごと非表示
        if (NOCTA_APPS.length === 0) {
            if (section) section.style.display = 'none';
            return;
        }

        grid.innerHTML = NOCTA_APPS.map(function (a, i) {
            var col    = i % 3;
            var delay  = col === 1 ? ' reveal-delay-1' : col === 2 ? ' reveal-delay-2' : '';
            var dstyle = col > 0 ? ' style="transition-delay:' + (col * 0.1) + 's"' : '';
            var onclick = ' onclick="openApp(' +
                '\'' + a.url.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + '\',' +
                '\'' + a.title.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + '\',' +
                '\'' + a.thumbClass + '\',' +
                '\'' + a.badge + '\',' +
                '\'' + a.badgeColorClass + '\',' +
                '\'' + a.descJa.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + '\'' +
                ')"';

            return [
                '<div class="work-card glass rounded-2xl overflow-hidden border border-white/5 cursor-pointer reveal' + delay + '"',
                '     data-acat="' + a.cat + '"' + dstyle + onclick + '>',
                '  <div class="relative aspect-video overflow-hidden">',
                '    <div class="' + a.thumbClass + ' w-full h-full flex items-center justify-center">',
                '      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">',
                '        <circle cx="24" cy="24" r="22" stroke="rgba(200,162,255,0.35)" stroke-width="1"/>',
                '        <path d="M20 16 L34 24 L20 32 Z" fill="rgba(200,162,255,0.55)"/>',
                '      </svg>',
                '    </div>',
                '    <div class="thumb-overlay"></div>',
                '  </div>',
                '  <div class="p-6">',
                '    <div class="flex justify-between items-start mb-2">',
                '      <h3 class="font-heading font-bold text-[17px] text-white">' + a.title + '</h3>',
                '      <span class="text-[10px] font-heading font-bold px-2.5 py-1 rounded ' + a.badgeColorClass + ' tracking-wider">' + a.badge + '</span>',
                '    </div>',
                '    <p class="font-jp text-[13px] text-brand-sub leading-relaxed">' + a.descJa + '</p>',
                '  </div>',
                '</div>'
            ].join('\n');
        }).join('\n');

        // Scroll Reveal（obs / obs2 は既存コードで使用済みのため appsObserver を使用）
        var appsObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) { e.target.classList.add('active'); appsObserver.unobserve(e.target); }
            });
        }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });
        grid.querySelectorAll('.reveal').forEach(function (el) { appsObserver.observe(el); });
    })();
```

### ② openApp / closeApp 関数

- [ ] **Step 2: openApp と closeApp 関数を追加する**

`website/index.html` の `closeVisual()` 関数（**line 1553** 付近）の直後に以下を挿入:

```js
    /* ---- App Modal ---- */
    function openApp(url, title, thumbClass, badge, badgeClass, desc) {
        var modal = document.getElementById('app-modal');
        var thumb = document.getElementById('app-modal-thumb');
        thumb.className = thumbClass + ' w-full aspect-video rounded-2xl flex items-center justify-center';
        document.getElementById('app-modal-title').textContent = title;
        var badgeEl = document.getElementById('app-modal-badge');
        badgeEl.textContent = badge;
        badgeEl.className = 'text-[10px] font-heading font-bold px-2.5 py-1 rounded tracking-wider ' + badgeClass;
        document.getElementById('app-modal-desc').textContent = desc;
        document.getElementById('app-modal-link').href = url;
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeApp() {
        var modal = document.getElementById('app-modal');
        if (!modal) return;
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
```

### ③ ESC ハンドラ

- [ ] **Step 3: ESC ハンドラに closeApp() を追加する**

`website/index.html` の **line 1572-1574** 付近、以下の行を:

```js
    if (e.key === 'Escape') { closeYouTube(); closeVisual(); }
```

以下に変更する:

```js
    if (e.key === 'Escape') { closeYouTube(); closeVisual(); closeApp(); }
```

- [ ] **Step 4: ブラウザで動作確認する**

`website/index.html` をブラウザで開き、以下をすべて確認:

1. TOOLS セクションにカードが3枚表示される
2. カードをクリックするとモーダルが開く
3. モーダルにタイトル・バッジ・説明文が表示される
4. 「アプリを開く →」をクリックすると新しいタブでURLが開く
5. 暗幕クリックでモーダルが閉じる
6. ESC キーでモーダルが閉じる
7. × ボタンでモーダルが閉じる
8. TOOLS セクションのスクロールアニメーションが動作する

- [ ] **Step 5: コミット**

```bash
git add website/index.html
git commit -m "feat(apps): add Apps render JS, openApp/closeApp, ESC handler"
```

---

## 実装完了後: apps-data.js を実際のデータに更新する

3本のアプリの実際のデータを `website/apps-data.js` に入力してください:

| フィールド | 内容 |
|---|---|
| `title` | アプリ名（日本語可） |
| `url` | 実際のアプリ URL |
| `thumbClass` | `thumb-1`〜`thumb-6` から選択（カードの背景グラデーション） |
| `descJa` | 日本語説明（1〜2文） |
| `descEn` | 英語説明（オプション） |

更新後:
```bash
git add website/apps-data.js
git commit -m "feat(apps): update apps-data.js with real app data"
```

その後 Netlify に手動デプロイしてください。
