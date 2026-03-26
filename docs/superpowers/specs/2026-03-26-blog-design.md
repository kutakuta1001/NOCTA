# 設計書: Blog セクション
**作成日**: 2026-03-26
**ステータス**: 承認済み

---

## 背景・目的

NOCTAブランドとして楽曲制作の裏側・エッセイを外部向けに発信するため、HPにBlogセクションを追加する。CEOが平文テキストを書くだけで、AIが自動整形してHPに投稿できるワークフローを構築する。

---

## 方針

- 記事データは `blog-data.js` で一元管理（Works/Visual/Apps と同じパターン）
- 記事ページは `blog/post.html` の1ファイルテンプレート方式（`?slug=` で記事を特定）
- `/blog-publish` スラッシュコマンドで投稿フローを自動化
- カードデザインは Works/Tools と同じグリッド構造を踏襲

---

## ファイル構成

```
website/
├── blog-data.js          ← 新規: 全記事データ（メタ情報 + 整形済みHTML本文）
├── blog/
│   └── post.html         ← 新規: 全記事共通テンプレートページ
└── index.html            ← 修正: #blog セクション + ナビリンク追加

drafts/
└── blog_draft.txt        ← 新規: 投稿前の平文テキスト置き場

~/.claude/commands/
└── blog-publish.md       ← 新規: /blog-publish スラッシュコマンド
```

### `<script>` ロード順序

`apps-data.js` の直後に追加:

```html
<script src="apps-data.js"></script>
<script src="blog-data.js"></script>  ← ここに追加
```

### ファイルパス関係

```
website/
├── blog-data.js                ← blog/post.html から ../blog-data.js で参照
├── blog/
│   └── post.html               ← <script src="../blog-data.js"> で読み込む
└── index.html
```

---

## データ構造（`blog-data.js`）

```js
/**
 * NOCTA Blog Data
 *
 * 記事は /blog-publish コマンドで自動追加されます。
 * 手動で追加する場合は配列の先頭に新しいオブジェクトを追加してください。
 *
 * slug        : URL用識別子（英数字・ハイフンのみ、最大50文字）
 * title       : 記事タイトル
 * cat         : "music" | "essay"
 * date        : "YYYY-MM-DD" 形式
 * excerpt     : カード表示用の抜粋（最初の句点まで、または150文字まで）
 * contentHtml : AI整形済みHTML本文（<h2>/<p>/<strong> を使用）
 *               ※ contentHtml は AI整形後にCEOが確認してから追加するため
 *                  スクリプトインジェクションのリスクはない
 */
const NOCTA_BLOG = [
  {
    slug: "sample-post",
    title: "サンプル記事",
    cat: "essay",
    date: "2026-03-26",
    excerpt: "これはサンプル記事です。/blog-publish で実際の記事に差し替えてください。",
    contentHtml: "<p>これはサンプル記事です。/blog-publish で実際の記事に差し替えてください。</p>"
  }
];
```

### カテゴリ定義

| cat | 意味 | バッジ表示 |
|---|---|---|
| `"music"` | 楽曲制作・音楽関連 | Music |
| `"essay"` | エッセイ・思考 | Essay |

---

## Blog セクション（`index.html` 追加部分）

`#apps` セクションの直下に配置する。

### フィルタークラス命名規則

既存との衝突を避けるため、セクションごとに独立したクラスを使用する:

| セクション | フィルタークラス | data 属性（ピル） | data 属性（カード） |
|---|---|---|---|
| Works | `.filter-pill` | `data-filter` | `data-cat` |
| Visual | `.vfilter-pill` | `data-vfilter` | `data-vcat` |
| Blog | `.bfilter-pill` | `data-bfilter` | `data-bcat` |

### 構成

```html
<section id="blog" class="py-32 relative z-10 border-b border-white/5">
  <div class="max-w-[1200px] mx-auto px-6 lg:px-8">
    <div class="text-center mb-16 reveal">
      <h2 class="font-display text-[clamp(52px,8vw,100px)] text-white tracking-[4px] mb-4">BLOG</h2>
      <p class="font-jp text-brand-sub text-[15px] tracking-wider">Music & Essays</p>

      <!-- フィルターピル（.bfilter-pill は .filter-pill / .vfilter-pill と独立） -->
      <div class="mt-8 inline-flex bg-white/5 rounded-full p-1.5 gap-1 glass">
        <button class="bfilter-pill active" data-bfilter="all">All</button>
        <button class="bfilter-pill" data-bfilter="music">Music</button>
        <button class="bfilter-pill" data-bfilter="essay">Essay</button>
      </div>
    </div>

    <!-- グリッド — blog-data.js から JS でレンダリング -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7" id="blog-grid"></div>
  </div>
</section>
```

### `.bfilter-pill` CSS

`.vfilter-pill` と同じスタイルを使用（index.html 内の既存定義を参照し同じパターンで追加）:

```css
.bfilter-pill {
  /* .vfilter-pill と同一スタイル */
  padding: 0.375rem 1rem;
  border-radius: 9999px;
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.45);
  transition: all 0.2s ease;
  cursor: pointer;
}
.bfilter-pill:hover { color: rgba(255,255,255,0.75); }
.bfilter-pill.active {
  background: rgba(255,255,255,0.1);
  color: #fff;
}
```

### カードデザイン

Works/Tools カードと同じ `work-card glass rounded-2xl` クラスを使用。サムネイル部分（aspect-video 領域）はグラデーション背景に日付のみ表示し、抜粋テキストはメタデータ領域（下部）に配置する。

**カード HTML 構造:**

```html
<div class="work-card glass rounded-2xl overflow-hidden border border-white/5 cursor-pointer reveal[delay]"
     data-bcat="[cat]" [dstyle]
     onclick="window.open('blog/post.html?slug=[slug]', '_blank')">

  <!-- サムネイル領域（aspect-video） -->
  <div class="relative aspect-video overflow-hidden">
    <div class="thumb-[N] w-full h-full flex items-end p-4">
      <span class="font-heading text-[11px] tracking-[2px] text-white/50">[date]</span>
    </div>
    <div class="thumb-overlay"></div>
  </div>

  <!-- メタデータ領域 -->
  <div class="p-6">
    <div class="flex justify-between items-start mb-2">
      <h3 class="font-heading font-bold text-[17px] text-white">[title]</h3>
      <span class="text-[10px] font-heading font-bold px-2.5 py-1 rounded [badgeColorClass] tracking-wider">[badge]</span>
    </div>
    <p class="font-jp text-[13px] text-brand-sub leading-relaxed line-clamp-2">[excerpt]</p>
  </div>
</div>
```

**サムネイルのグラデーション割り当て:**
- cat が `"music"` → `thumb-1`（カード index % 6 で循環）
- cat が `"essay"` → `thumb-4`（カード index % 6 で循環）

**バッジカラー:**

| cat | badgeColorClass |
|---|---|
| `"music"` | `bg-brand-primary/20 text-brand-primary` |
| `"essay"` | `bg-brand-secondary/20 text-brand-secondary` |

### 空配列時の表示

`NOCTA_BLOG` が空の場合は JS レンダリング時に **`#blog` セクション全体**（`document.getElementById('blog')`）を `display: none` にする（Visual セクションと同じパターン）:

```js
var section = document.getElementById('blog');
var grid = document.getElementById('blog-grid');
if (NOCTA_BLOG.length === 0) {
  if (section) section.style.display = 'none';
  return;
}
```

### JS レンダリングパターン

Visual レンダリング IIFE（index.html 内）と同じパターンで実装する:

```js
/* ---- Blog: データ配列からカードをレンダリング ---- */
(function () {
  var section = document.getElementById('blog');
  var grid = document.getElementById('blog-grid');
  if (!grid || typeof NOCTA_BLOG === 'undefined') return;
  if (NOCTA_BLOG.length === 0) { if (section) section.style.display = 'none'; return; }

  grid.innerHTML = NOCTA_BLOG.map(function(b, i) {
    var col = i % 3;
    var delay = col === 1 ? ' reveal-delay-1' : col === 2 ? ' reveal-delay-2' : '';
    var dstyle = col > 0 ? ' style="transition-delay:' + (col * 0.1) + 's"' : '';
    var thumbNum = (i % 6) + 1;  // thumb-1 〜 thumb-6 を循環
    var badgeClass = b.cat === 'music'
      ? 'bg-brand-primary/20 text-brand-primary'
      : 'bg-brand-secondary/20 text-brand-secondary';
    var badge = b.cat === 'music' ? 'Music' : 'Essay';
    var slug = b.slug.replace(/'/g, "\\'");
    // ... カード HTML を返す
  }).join('\n');

  // フィルター（.bfilter-pill の data-bfilter と カードの data-bcat を照合）
  var bpills = document.querySelectorAll('.bfilter-pill');
  var bcards = grid.querySelectorAll('[data-bcat]');
  bpills.forEach(function(pill) {
    pill.addEventListener('click', function() {
      bpills.forEach(function(p) { p.classList.remove('active'); });
      this.classList.add('active');
      var f = this.getAttribute('data-bfilter');
      bcards.forEach(function(card) {
        var show = f === 'all' || card.getAttribute('data-bcat') === f;
        // show/hide アニメーション（Visual フィルターと同じ）
      });
    });
  });

  // Scroll Reveal
  var blogObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('active'); blogObserver.unobserve(e.target); }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });
  grid.querySelectorAll('.reveal').forEach(function(el) { blogObserver.observe(el); });
})();
```

既存使用済み変数: `obs`（Works）、`obs2`（Visual）、`appsObserver`（Apps）

### サムネイルの thumbClass

`thumb-1`〜`thumb-6` は index.html に既存定義済みのCSSクラス（Works/Visual/Apps で使用中）。Blog カードも同じクラスを使用する。カード index を `(i % 6) + 1` で循環させる。

---

## `blog/post.html` テンプレート

全記事共通の独立したHTMLページ。`?slug=` パラメータで `NOCTA_BLOG` から該当記事を特定して表示する。

### 構成

```
┌─────────────────────────────────────────┐
│  NOCTA ロゴ              [← Back]       │
├─────────────────────────────────────────┤
│                                         │
│  [Music] バッジ   2026-03-26            │
│  記事タイトル                           │
│  ─────────────────────────────          │
│                                         │
│  contentHtml の内容をそのまま表示       │
│  （<h2>/<p>/<strong> が反映される）     │
│                                         │
└─────────────────────────────────────────┘
```

- HP本体と同じ Tailwind CDN・フォント・カラー変数を使用（`../` パスで共有スタイルを参照）
- `<script src="../blog-data.js">` で記事データを読み込む（相対パス: website/blog/post.html → website/blog-data.js）
- slug が存在しない場合: `<p class="font-jp text-brand-sub text-center py-32">記事が見つかりません。</p>` を表示
- Back ボタンは `../index.html#blog` にリンク
- `<title>` タグに「{記事タイトル} | NOCTA」を設定
- post.html のサムネイル（ヘッダー装飾）は **`thumb-1` 固定**（slug によって変えない。シンプルさ優先）

---

## `/blog-publish` コマンド（`~/.claude/commands/blog-publish.md`）

### 実行フロー

```
1. drafts/blog_draft.txt を読み込む
   → ファイルが空・存在しない場合は「drafts/blog_draft.txt に文章を書いてください」と表示して終了

2. CEOにタイトルを確認（入力待ち）

3. CEOにカテゴリを確認: music / essay（入力待ち）

4. AI が本文を整形:
   - 段落ごとに <p> タグ
   - 話題の切れ目（内容が変わる箇所）に <h2> 見出しを自動挿入
   - 重要キーワード・強調したい箇所に <strong> を付与
   - excerpt を抽出（最初の句点「。」まで、または150文字まで。どちらか先に達したほう）

5. slug を生成:
   - タイトルを英語に変換（例: 「NuWord 制作の裏側」→ "nuword-behind-the-scenes"）
   - スペース・記号をハイフンに変換、小文字に統一
   - 英数字・ハイフンのみ許可、最大50文字
   - CEOが変更可能（確認ステップで表示）

6. 整形結果をプレビュー表示してCEOに確認（タイトル・slug・excerpt・本文HTML）
   → NG の場合は修正点を聞いて再整形

7. OK の場合:
   - blog-data.js の NOCTA_BLOG 配列の先頭に追記
   - drafts/blog_draft.txt を空にする
   - git add website/blog-data.js drafts/blog_draft.txt
   - git commit -m "feat(blog): [タイトル] を追加"

8. 「投稿完了。Netlify に手動デプロイしてください。」と表示
```

### 整形ルール（AI への指示）

| 要素 | 条件 |
|---|---|
| `<h2>` | 話題が変わる段落の前。全体で2〜4個程度 |
| `<p>` | すべての段落を囲む |
| `<strong>` | 固有名詞・重要な概念・数値など。多用しない（1段落1〜2個まで） |
| `<em>` | 使わない（デザインとの相性） |

---

## ナビゲーション

デスクトップナビ・モバイルナビ・フッターに `#blog` へのリンクを追加。既存の `#apps`（Tools）リンクの直後に挿入する:

```html
<!-- デスクトップナビ（#apps リンクの直後） -->
<a href="#blog" class="text-brand-sub hover:text-white transition-colors duration-300">Blog</a>

<!-- モバイルナビ（#apps リンクの直後） -->
<a href="#blog" class="text-brand-sub hover:text-white transition-colors">Blog</a>

<!-- フッター（#apps リンクの直後） -->
<a href="#blog" class="hover:text-white transition-colors duration-200">Blog</a>
```

---

## 初期セットアップ

実装完了後、以下を一度だけ実行する:

```bash
touch drafts/blog_draft.txt
```

---

## 記事追加フロー（通常運用）

1. `drafts/blog_draft.txt` に平文を書く
2. `/blog-publish` を実行
3. タイトル・カテゴリ・slug を入力、整形結果を確認
4. `git commit` 後、Netlify に手動デプロイ

---

## スコープ外

- コメント機能
- 検索機能
- RSS フィード
- 記事の編集・削除コマンド（手動で blog-data.js を編集）
- 画像挿入（テキストのみ）
