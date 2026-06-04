# CLAUDE.md — NOCTA Website

NOCTAホームページ（`website/`）に関するルール。
上位の `/NOCTA/CLAUDE.md` のルールと併用する。

---

## ホスティング構成

| 環境 | URL | 状態 |
|------|-----|------|
| GitHub Pages | `https://kutakuta1001.github.io/NOCTA/` | 稼働中（メイン） |
| Netlify | `https://[slug].netlify.app/` | 無料枠超過中・月初リセット待ち |

- デプロイは `main` ブランチへの push で GitHub Actions が自動実行
- `website/` ディレクトリの中身がそのままサイトルートとして公開される
- **パス規則: すべて相対パス**（`./visual-data.js` など）。絶対パス（`/visual-data.js`）は GitHub Pages でパスがずれるため使わない

---

## ファイル構成

```
website/
├── index.html          ← 唯一のHTMLエントリポイント
├── visual-data.js      ← Visualセクションのデータ（3配列）
├── blog-data.js        ← Blogセクションのデータ
├── works-data.js       ← Worksセクションのデータ
├── apps-data.js        ← Appsセクションのデータ
├── brand_assets.html   ← ブランドアセット確認ページ
├── brandkit.html       ← ブランドキットページ
├── success.html        ← フォーム送信完了ページ
├── blog/               ← ブログ記事ページ（静的HTML）
└── the-first-flower/   ← 楽曲専用ランディングページ
```

---

## データファイルのルール

### visual-data.js

3つの配列で構成。**先頭に追加**する。

```js
const NOCTA_VISUALS_WORKS = [ ... ];  // 完成品（Canva加工済み・Base chain）
const NOCTA_VISUALS_ART   = [ ... ];  // AI生成元画像（Zora chain）
const NOCTA_VISUALS_MUSIC = [ ... ];  // 楽曲連動ビジュアル
```

各オブジェクトの必須フィールド:

```js
{
  title: "作品タイトル",
  imgUrl: "https://ipfs.io/ipfs/[CIDv1ハッシュ（59文字）]",
  zoraUrl: "https://zora.co/collect/[chain]:[contract]/[tokenId]",
  badge: "Works" | "Art" | "Music",
  badgeColorClass: "bg-amber-500/20 text-amber-400"       // Works
               //  "bg-brand-gold/20 text-brand-gold"  // Art/Music
  descJa: "日本語説明文",
}
```

- `imgUrl` は必ず `https://ipfs.io/ipfs/` + CIDv1（bafybei〜、59文字）
- CIDv1は59文字。60文字以上は末尾が余分（422エラーの原因）
- `zoraUrl` が不明な場合は `"https://zora.co/@kutakuta1001"` を使う

### blog-data.js

```js
const NOCTA_BLOG = [ ... ];  // 先頭が最新記事
```

各オブジェクト: `slug`, `title`, `cat`, `date`, `excerpt`, `contentHtml`
追加・更新は `/blog-publish` スキルを使う。

### works-data.js

```js
const NOCTA_WORKS = [ ... ];  // 先頭が最新楽曲
```

追加は `/hp-add-work [曲名] [YouTubeID]` スキルを使う。

### apps-data.js

```js
const NOCTA_APPS = [ ... ];
```

手動で直接編集する（専用スキルなし）。

---

## git 操作ルール（HP作業時）

- `git add` は `website/` 以下のファイルのみ指定する
- `git add -A` / `git add .` は**使わない**（他ディレクトリを巻き込むリスク）
- 実画像・動画ファイル（png/jpg/mp4等）は git に追加しない
- コミットメッセージ例:
  - `feat(blog): [タイトル] を追加`
  - `feat(visual): [作品名] を追加`
  - `fix(visual): [作品名] のIPFSハッシュを修正`
  - `feat(works): [曲名] をWorksに追加`

---

## デザインシステム

詳細仕様: `@website/DESIGN.md`（カラートークン・タイポグラフィ・ビジュアルアセット生成ガイドを含む）

- CSSフレームワーク: Tailwind CSS（CDN）
- フォント: `font-display`（見出し）/ `font-heading`（小見出し）/ `font-jp`（日本語本文）
- ブランドカラー: `text-brand-gold`（ゴールド #C4942A）
- カードの画像比率: `aspect-[3/4]`（縦長・Visualカード）/ `aspect-video`（横長・他カード）
- Visualセクションのバッジ色:
  - Works: `bg-amber-500/20 text-amber-400`
  - Art / Music: `bg-brand-gold/20 text-brand-gold`（旧: `bg-brand-secondary/20 text-brand-secondary`）

## フロントエンドデザイン強化（frontend-design スキル）

新しいHTMLページを作成・大幅改修するときは、HTML生成前に `frontend-design:frontend-design` スキルを呼び出す。

**呼び出すべき場面:**
- 楽曲LP・プロダクトLP の新規作成（`/lp-create` が自動で呼び出す）
- ブログ記事ページの新規作成
- `index.html` のセクション大幅追加・リデザイン

**NOCTA共通のコンテキスト（毎回渡す）:**
```
Tone: editorial serif-led dark
Constraints: Tailwind CSS CDN, relative paths, EB Garamond/Syne/Bebas Neue fonts
Background: #0A0906 dark base, warm cream accents (#F0EAD8)
Accent: brand-gold gold (#C4942A)
```

**禁止パターン（スキルで回避する「AI スロップ」）:**
- Inter フォント + 紫グラデーション + 白背景の組み合わせ
- 対称的な均等グリッドのみのレイアウト
- 装飾ゼロのフラットカード羅列
