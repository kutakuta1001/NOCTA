# The First Flower — 設計引き継ぎ書（DESIGN-NOTES）

最終更新: 2026-06-15（レイアウト確認のみ。デザイン変更なし）

楽曲専用ランディングページ **「The First Flower 〜いい人生とは〜」** の構成と意図を残す引き継ぎ書。

> **重要**: このページは NOCTA 本体（ダーク／シルバーの editorial）とは**意図的に別系統**のデザイン。NOCTA DESIGN.md の「Brand Inheritance Guide」でいう**継承度「低」**にあたり、独自のカラー・フォントを持つ。NOCTA 本体の廃止カラー整理・シルバー統一の対象外（＝このページの色はそのままで正しい）。2026-06-15 のサイト改修では一切変更していない。

---

## 1. コンセプト

- 人生観・詩・思い・感動をつづる**パーソナル/哲学サイト**（「いい人生とは」）。
- トーンは **ソフト・フローラル・夜明け**。桜と淡い光のグラデーションで、NOCTA本体の硬質なダークとは対照的な、やわらかく内省的な世界観。

---

## 2. パレット（独自・`tff-` 名前空間）

NOCTA グローバルカラーを上書きせず、Tailwind config 内で `tff-` 接頭辞の独自トークンを定義している。

| トークン | 値 | 役割 |
|---|---|---|
| `tff-base` | `#FCFBF5` | 背景（ライトクリーム） |
| `tff-text` / `tff-deep` | `#3D2E52` | 本文（ディープパープル） |
| `tff-dark` | `#705E92` | |
| `tff-sub` | `#9A86B0` | サブテキスト |
| `tff-accent` | `#B168A8` | アクセント（マゼンタ寄り紫） |
| `tff-rose` | `#EEA4C0` | 桜ピンク（ディバイダ・引用カード） |
| `tff-pink` | `#FDD9D9` | 淡いピンク |
| `tff-mint` / `tff-teal` | `#B8E3B7` / `#A6DDD6` | 差し色（symbols） |

- `body`: 背景 `#FCFBF5`、文字 `#3D2E52`（＝ライトモード基調。NOCTA本体はダーク専用なので真逆）。
- ヒーロー背景は `deep purple → 紫 → 桜ピンク → 淡ピンク` のグラデーション（`hero-bg`）。写真差込前のプレースホルダ。

---

## 3. フォント

| クラス | フォント | 用途 |
|---|---|---|
| `font-serif` | Cormorant Garamond + Noto Serif JP | 見出し・引用（セリフ主体） |
| `font-jpserif` | Noto Serif JP | 日本語セリフ |
| `font-jp` | Noto Sans JP | 日本語サンセリフ本文 |
| `font-display` | Bebas Neue | ナビ・ラベル |

NOCTA本体（EB Garamond/Syne）とは別フォント。セリフ主体で柔らかい印象。

---

## 4. セクション構成

`top (hero) → profile → quotes (WORDS) → blog`

- **top / hero**: フルスクリーン。`hero-bg` グラデ＋**桜の花びら**（`tff-sk-sm/md/lg` の3サイズ、`sakura-a/b/c` アニメで舞う）。見出し「The First Flower」（Cormorant Garamond 大）＋「〜 いい人生とは 〜」。
- **profile**: `profile-bg` 写真セクション。装飾シンボル（✿✦❀✧）が浮遊。プロフィール内容は `tff-profile-data.js` から。
- **quotes (WORDS)**: **引用カードの無限マーキー**。`tff-quotes.js`（約32KB の引用集）を左流れ（360s）と右流れ（440s）の2列で流す。hover で一時停止（`animation-play-state: paused`）。各カードは桜ピンクの半透明（`.quote-card`）。
- **blog**: `tff-blog-card`（半透明・hoverで浮上）。

---

## 5. 効果・仕掛け

- **桜パーティクル**: 3サイズ×複数、`sakura-a/b/c` キーフレームでランダムに舞う。
- **引用マーキー**: 左右2方向に超低速スクロール。左右端は `mask-image` でフェード。
- **ヘッダーの色切り替え**: `.tff-header.on-photo`（写真/濃色セクション上）では半透明パープル＋白系リンク、通常はライトクリーム＋ディープパープルリンク。スクロール位置で切替。
- **グレインノイズ**: 全面に `opacity: 0.25` の薄ノイズ（NOCTA本体と同思想だが薄め）。
- **reveal**: スクロールインで `tff-reveal`（24px下→フェードイン）。
- **写真差込**: `.photo-section` は `background-attachment: fixed`。`hero-bg` / `profile-bg` はグラデのプレースホルダで、コード内コメントに「写真を追加するときは `background-image: url('img/xxx.jpg')` に変更」と明記。`img/` ディレクトリあり。

---

## 6. ファイル構成・保守メモ

```
the-first-flower/
├── index.html            ← 917行。スタイル・構成・スクリプトを内包
├── tff-profile-data.js   ← プロフィール内容（約1.8KB）
├── tff-quotes.js         ← 引用集（約32KB・マーキー用）
└── img/                  ← 写真素材（hero/profile 差込用）
```

- **引用を追加**するときは `tff-quotes.js` に追記（マーキーへ自動反映）。
- **写真を入れる**ときは `hero-bg` / `profile-bg` の `background` を `url('img/...')` に差し替え（該当箇所にコメントあり）。
- NOCTA本体のデザイン変更（パレット・フォント統一）を**このページに波及させないこと**。独自世界観を保つのが正。
- NOCTA本体トップからの導線: footer の「✦ いい人生とは」リンク（`footer.tff.link`）。
