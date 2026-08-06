# CLAUDE.md — NOCTA Website

HP（`website/`）に関するルール。正本（`project_NOCTA/CLAUDE.md`）と併用する。

---

## ホスティングとパス

- 本番は GitHub Pages（`https://kutakuta1001.github.io/NOCTA/`）。`main` への push で GitHub Actions が自動デプロイする
- `website/` の中身がそのままサイトルートとして公開される
- **パスはすべて相対パス**（`./visual-data.js` など）。絶対パス（`/visual-data.js`）は GitHub Pages でずれるため使わない
- Netlify（`https://[slug].netlify.app/`）は無料枠超過中・月初リセット待ち

## ファイル構成

```
website/
├── index.html          ← 唯一のHTMLエントリポイント
├── visual-data.js      ← Visual セクション（3配列）
├── blog-data.js        ← Blog セクション
├── works-data.js       ← Works セクション
├── apps-data.js        ← Apps セクション（専用スキルなし・手動編集）
├── brandkit.html       ← ブランドガイド
├── success.html        ← フォーム送信完了ページ
├── blog/               ← ブログ記事ページ（静的HTML）
└── the-first-flower/   ← 楽曲専用ランディングページ
```

## データファイルのルール

### visual-data.js

3配列で構成し、**先頭に追加**する。
`NOCTA_VISUALS_WORKS`（完成品・Canva加工済み・Base chain）/ `NOCTA_VISUALS_ART`（AI生成元画像・Zora chain）/ `NOCTA_VISUALS_MUSIC`（楽曲連動）。

各オブジェクトの必須フィールド:

```js
{
  title: "作品タイトル",
  imgUrl: "https://ipfs.io/ipfs/[CIDv1ハッシュ]",
  zoraUrl: "https://zora.co/collect/[chain]:[contract]/[tokenId]",
  badge: "Works" | "Art" | "Music",
  badgeColorClass: "bg-amber-500/20 text-amber-400",  // Works
                // "bg-brand-gold/20 text-brand-gold" // Art / Music
  descJa: "日本語説明文",
}
```

- `imgUrl` は必ず `https://ipfs.io/ipfs/` + CIDv1（`bafybei` 始まり）
- **CIDv1 は59文字。60文字以上は末尾が余分で422エラーの原因になる**
- `zoraUrl` が不明な場合は `https://zora.co/@kutakuta1001` を使う
- 追加は `/visual-add [作品名]`（IPFSハッシュの自動バリデーション付き）

### blog-data.js / works-data.js

`NOCTA_BLOG` は先頭が最新記事。各オブジェクトは `slug` / `title` / `cat` / `date` / `excerpt` / `contentHtml`。追加は `/blog-publish`。
`NOCTA_WORKS` は先頭が最新楽曲。追加は `/hp-add-work [曲名] [YouTubeID]`。

## git 操作（HP作業時）

- `git add` は `website/` 以下のファイルのみ個別指定する。`git add -A` / `git add .` は使わない
- 実画像・動画ファイル（png / jpg / mp4 等）は git に追加しない
- `main` への push は本番デプロイを起動する。**CEO の明示的な指示がある場合のみ push する**（バックグラウンドセッション・ワークフローからは commit までにとどめる）

## デザインシステム

詳細仕様は `website/DESIGN.md`（カラートークン・タイポグラフィ・アセット生成ガイド）。

- Tailwind CSS（CDN）。フォントは `font-display`（見出し）/ `font-heading`（小見出し）/ `font-jp`（日本語本文）
- ブランドカラー: 新規制作の確定パレットはシルバー #B8B4AE × オフホワイト #E8E0D0。`text-brand-gold`（#C4942A）は旧パレットのレガシートークンで、既存コードと下記の Visual バッジクラスに残存している
- 画像比率: `aspect-[3/4]`（Visual カード・縦長）/ `aspect-video`（他カード・横長）
- Visual バッジ色: Works は `bg-amber-500/20 text-amber-400`、Art / Music は `bg-brand-gold/20 text-brand-gold`

新規ページ作成・大幅改修時は `frontend-design:frontend-design` を呼ぶ（正本 R-17）。渡すコンテキスト:

```
Tone: editorial serif-led dark
Constraints: Tailwind CSS CDN, relative paths, EB Garamond/Syne/Bebas Neue fonts
Background: #0A0906 dark base, warm cream accents (#F0EAD8)
Accent: brand-gold gold (#C4942A)
```

避けるパターン: Inter フォント + 紫グラデーション + 白背景の組み合わせ / 対称的な均等グリッドのみのレイアウト / 装飾ゼロのフラットカード羅列。
