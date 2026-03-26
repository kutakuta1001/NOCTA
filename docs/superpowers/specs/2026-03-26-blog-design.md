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

---

## データ構造（`blog-data.js`）

```js
/**
 * NOCTA Blog Data
 *
 * 記事は /blog-publish コマンドで自動追加されます。
 * 手動で追加する場合は配列の先頭に新しいオブジェクトを追加してください。
 *
 * slug        : URL用識別子（英数字・ハイフンのみ）
 * title       : 記事タイトル
 * cat         : "music" | "essay"
 * date        : "YYYY-MM-DD" 形式
 * excerpt     : カード表示用の抜粋（冒頭2〜3文）
 * contentHtml : AI整形済みHTML本文（<h2>/<p>/<strong> を使用）
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

### 構成

```html
<section id="blog">
  <h2>BLOG</h2>
  <p>Music & Essays</p>

  <!-- フィルターピル（Works/.filter-pill・Visual/.vfilter-pill と分離） -->
  <div>
    <button class="bfilter-pill active" data-bfilter="all">All</button>
    <button class="bfilter-pill" data-bfilter="music">Music</button>
    <button class="bfilter-pill" data-bfilter="essay">Essay</button>
  </div>

  <!-- グリッド — blog-data.js から JS でレンダリング -->
  <div id="blog-grid"></div>
</section>
```

### カードデザイン

- Works/Tools カードと同じ `work-card glass rounded-2xl` クラス
- サムネイル部分はグラデーション背景（thumbClass）ではなく、**日付と抜粋テキスト**を表示
- クリックで `blog/post.html?slug=記事のslug` を **新しいタブ**で開く
- `data-bcat` 属性でフィルタリング（`.bfilter-pill` は `.filter-pill` / `.vfilter-pill` と独立）

### カード構造

```
┌──────────────────────────────┐
│  日付（2026-03-26）          │  ← aspect-video 領域（薄いグラデーション背景）
│                              │
│  抜粋テキスト（2行まで）     │
└──────────────────────────────┘
│  タイトル        [Music]バッジ│
│  excerpt（続き）             │
└──────────────────────────────┘
```

### 空配列時の表示

`NOCTA_BLOG` が空の場合はセクション全体を `display: none` にする。

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

- HP本体と同じ Tailwind CDN・フォント・カラー変数を使用
- `<script src="../blog-data.js">` で記事データを読み込む
- slug が存在しない場合は「記事が見つかりません」を表示
- Back ボタンは `../index.html#blog` にリンク
- `<title>` タグに記事タイトルを設定

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
   - excerpt を冒頭2〜3文から自動抽出

5. slug を生成（タイトルから英語変換、CEOが変更可能）

6. 整形結果をプレビュー表示してCEOに確認
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

デスクトップナビ・モバイルナビ・フッターに `#blog` へのリンクを追加:

```html
<a href="#blog">Blog</a>
```

---

## 記事追加フロー（通常運用）

1. `drafts/blog_draft.txt` に平文を書く
2. `/blog-publish` を実行
3. タイトル・カテゴリを入力、整形結果を確認
4. `git commit` 後、Netlify に手動デプロイ

---

## スコープ外

- コメント機能
- 検索機能
- RSS フィード
- 記事の編集・削除コマンド（手動で blog-data.js を編集）
- 画像挿入（テキストのみ）
