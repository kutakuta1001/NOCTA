# NOCTA DESIGN.md

NOCTAホームページのデザインルール集。AIがこのファイルを読んで一貫したUIを生成できる粒度で記述する。

**インスピレーション源:**
- **Apple** — 呼吸する余白・ストーリーテリングレイアウト
- **Linear** — ダークモードの精度・タイポグラフィ主体の設計
- **Vercel** — コントラスト・ミニマル・テクニカルアッシュ
- **Stripe** — セクション定義の明確さ・信頼感のタイポグラフィ
- **Lusion / Locomotive** — 創造的エージェンシー系ダーク・アニメーション
- **Pitch.com** — 現代的なダークSaaS・グラスモーフィズム

---

## 1. カラーシステム

### ブランドカラー（Tailwind extend）

```css
brand-bg:        #05050F   /* ページ背景（超ダーク・ほぼ黒） */
brand-bg2:       #0A0A16   /* セクション背景・カード裏地 */
brand-primary:   #C8A2FF   /* ラベンダー／メインアクセント */
brand-secondary: #C4942A   /* ゴールド／サブアクセント */
brand-highlight: #E8D0FF   /* 薄ラベンダー／ホバー・強調 */
brand-text:      #E8E8F4   /* 本文テキスト */
brand-sub:       #8A8A9E   /* 補助テキスト・プレースホルダー */
brand-vgreen:    #39FF6A   /* バイブラント・グリーン／CTAアクセント */
```

### カラー使用ルール

| 用途 | 使うカラー |
|------|-----------|
| ページ背景 | `brand-bg` (#05050F) |
| カード・パネル背景 | `brand-bg2` (#0A0A16) + glass |
| 見出し・ロゴ | `brand-text` (#E8E8F4) |
| 補助テキスト | `brand-sub` (#8A8A9E) |
| CTA ボタン・インタラクティブ要素 | `brand-vgreen` (#39FF6A)、hover でグロー |
| セクションタグ・ラベル | `brand-secondary` (#C4942A) |
| グラデーションテキスト | purple → vgreen → gold（135deg） |
| バッジ Works | `bg-amber-500/20 text-amber-400` |
| バッジ Art / Music | `bg-brand-secondary/20 text-brand-secondary` |
| バッジ App | `bg-brand-primary/20 text-brand-primary` |

### グラデーション

```css
/* ヒーログラデーション（テキスト） */
linear-gradient(135deg, #C8A2FF 0%, #39FF6A 45%, #C4942A 100%)

/* 横グラデーション（アルト） */
linear-gradient(90deg, #C4942A, #C8A2FF, #39FF6A)

/* 統計数値 */
linear-gradient(135deg, #C4942A, #C8A2FF, #39FF6A)
```

### やってはいけないこと

- 白背景 (#FFF) は使わない。NOCTAはダークモード専用
- 純粋な赤 (#FF0000) は使わない（ブランドカラーにない）
- テキストに直接 `color: gold` や CSS名前付きカラーを使わない。変数値を使う
- アクセントカラー同士を並べてコントラストを下げない（例: vgreen on primary）

---

## 2. タイポグラフィ

### フォントファミリー

```css
font-display:  'Bebas Neue'                         /* ドラマチック大見出し・数値 */
font-brand:    'Syne'                               /* ブランドロゴ・セクション見出し */
font-heading:  'Syne', 'Space Grotesk', sans-serif  /* サブ見出し・カードタイトル */
font-body:     'Inter', sans-serif                  /* 英語本文・UIラベル */
font-jp:       'Noto Sans JP', sans-serif           /* 日本語本文・説明文 */
```

Space Grotesk は `section-tag`・`filter-pill` の小さなUIラベルに使う。

### サイズスケール

| 役割 | クラス例 | 実寸 |
|------|---------|------|
| ヒーロー数値 | `.stat-num` Bebas Neue | clamp(48px, 6vw, 72px) |
| ページタイトル | `text-5xl` Syne | 48px |
| セクション見出し | `text-3xl md:text-4xl` | 30〜36px |
| カードタイトル | `text-lg font-heading` | 18px |
| 本文 | `text-sm` Inter / Noto Sans JP | 14px |
| セクションタグ | `.section-tag` Space Grotesk | 11px / 追跡3px / 大文字 |
| バッジ | `text-xs` | 12px |

### セクションタグの書き方

```html
<span class="section-tag">WORKS</span>
```

```css
/* 自動でラインプレフィックスを付ける（CLAUDE.mdのCSS） */
.section-tag::before { content: ''; width: 24px; height: 1px; background: #C4942A; }
```

### やってはいけないこと

- serif フォントは使わない（Times / Georgia 等）
- 本文のフォントウェイトを 900 にしない（Noto Sans JP 900 は見出し限定）
- 英語テキストに `font-jp` を使わない（Noto Sans JP はラテン文字の組みが粗い）

---

## 3. 間隔・レイアウト

### グリッド

- **基本レイアウト**: `max-w-7xl mx-auto px-6 md:px-12`
- **セクション縦パディング**: `py-24 md:py-32`
- **カードグリッド**: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`
- **2カラム**: `grid grid-cols-1 md:grid-cols-2 gap-8`

### 余白の精神（Appleから学ぶ）

- コンテンツは余白に「浮く」ように配置する
- セクション間には必ず `py-24` 以上の呼吸スペースを確保する
- テキストが画面幅いっぱいに広がらないよう最大幅を設定する（本文は `max-w-2xl` が目安）

---

## 4. コンポーネント

### グラスカード（基本コンポーネント）

```html
<div class="glass glass-hover rounded-2xl p-6 transition-all duration-300">
  <!-- コンテンツ -->
</div>
```

```css
/* glass */
background: rgba(255,255,255,0.03);
backdrop-filter: blur(20px);
border: 1px solid rgba(255,255,255,0.08);

/* glass-hover */
:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.14); }
```

**カードの画像比率:**
- Visualカード（縦長作品）: `aspect-[3/4]`
- Worksカード（横長・動画サムネ）: `aspect-video`
- Appsカード（スクリーンショット）: `aspect-video`

### グローエフェクト

```css
/* 用途別グロー */
shadow-glow-purple:  0 0 50px rgba(200,162,255,0.35)  /* primary アクセント */
shadow-glow-cyan:    0 0 50px rgba(196,148,42,0.30)   /* gold アクセント */
shadow-glow-vgreen:  0 0 50px rgba(57,255,106,0.45)   /* CTA / active */
shadow-glow-gold:    0 0 50px rgba(196,148,42,0.40)   /* secondary 強調 */
```

グローはホバー時・アクティブ状態にのみ付ける。常時点灯させない（目が疲れる）。

### CTA ボタン

```html
<!-- プライマリ CTA -->
<button class="bg-brand-vgreen text-brand-bg font-heading font-bold px-8 py-3 rounded-full
               hover:shadow-glow-vgreen transition-all duration-300">
  アプリを開く
</button>

<!-- セカンダリ（アウトライン） -->
<button class="border border-brand-sub text-brand-text px-8 py-3 rounded-full
               hover:border-brand-primary hover:text-brand-primary transition-all duration-300">
  詳細を見る
</button>
```

### フィルターピル

```html
<button class="filter-pill active">ALL</button>
<button class="filter-pill">Instrumental</button>
```

アクティブ / hover 時: `background: #39FF6A; color: #05050F; box-shadow: 0 0 28px rgba(57,255,106,0.55)`

### セクション見出しパターン

```html
<!-- Linear / Vercel スタイル: タグ → 見出し → サブテキスト -->
<div>
  <span class="section-tag">WORKS</span>
  <h2 class="font-brand text-4xl md:text-5xl text-brand-text mt-2 mb-4">
    楽曲・リリース
  </h2>
  <p class="text-brand-sub text-sm max-w-lg">
    NOCTAが手がけたオリジナル楽曲。
  </p>
</div>
```

### グラデーションテキスト

```html
<span class="text-gradient">NOCTA</span>
```

ヒーロータイトル・ブランドネームのみに使う。多用しない。

---

## 5. アニメーション

### Reveal（スクロールイン）

```html
<div class="reveal reveal-delay-1">コンテンツ</div>
<div class="reveal reveal-delay-2">コンテンツ</div>
```

```css
.reveal          { opacity: 0; transform: translateY(36px); transition: 0.9s cubic-bezier(0.4,0,0.2,1); }
.reveal.active   { opacity: 1; transform: translateY(0); }
.reveal-delay-1  { transition-delay: 0.12s; }  /* ずらして順番に出す */
.reveal-delay-2  { transition-delay: 0.24s; }
.reveal-delay-3  { transition-delay: 0.36s; }
.reveal-delay-4  { transition-delay: 0.48s; }
```

### Orbit リング（ヒーローセクション）

```css
.orbit-1 { animation: spinSlow  80s linear infinite; }   /* ゆっくり正転 */
.orbit-2 { animation: spinSlowR 50s linear infinite; }  /* 逆転 */
.orbit-3 { animation: spinSlow  30s linear infinite; }   /* 速め正転 */
```

### スクロールライン（ヒーロー下部）

```css
.scroll-line { animation: scrollLine 2.2s ease-in-out infinite; }
/* 上から下へ伸びて、下から縮む繰り返し */
```

### やってはいけないこと

- アニメーション duration を 0.1s 以下にしない（カクつく）
- 複数要素を同じ delay にしない（一括で出るとぎこちない）
- テキストをスクロール追従させない（読みにくい）

---

## 6. ノイズテクスチャ

```css
/* body::before で全体に薄くノイズを重ねる（深みを出す） */
body::before {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,...fractalNoise...");
    pointer-events: none; z-index: 9999; opacity: 0.35;
}
```

このノイズは「画面の平坦さを防ぐ」ためのもの。削除すると安っぽくなる。

---

## 7. スクロールバー

```css
* { scrollbar-width: thin; scrollbar-color: #39FF6A transparent; }
*::-webkit-scrollbar { width: 4px; }
*::-webkit-scrollbar-thumb { background: #39FF6A; border-radius: 9999px; }
```

vgreen のスクロールバーはブランドのサインネチャー。変更しない。

---

## 8. レスポンシブ

| ブレイクポイント | 幅 | 使い方 |
|---|---|---|
| `sm` | 640px | 2カラムグリッド開始 |
| `md` | 768px | フォントサイズUP、パディング増 |
| `lg` | 1024px | 3カラムグリッド、サイドバーレイアウト |
| `xl` | 1280px | 最大コンテンツ幅固定 |

---

## 9. やってはいけないことまとめ

- ライトモードのスタイルを追加しない（NOCTAはダーク専用）
- ブランドカラー以外の色を新規追加しない（特にパステル・明るい色）
- フォントを新たに読み込まない（ページ速度への影響）
- `z-index` を 9999 以上に設定しない（ノイズレイヤーと競合する）
- カード内の余白を `p-2` 以下にしない（窮屈になる）
- セクション見出しに Bebas Neue を使わない（Bebas は数値・ドラマチック表現専用）
- グラデーションテキストを本文や説明文に使わない（読みにくい）

---

## 10. 新しいページ・セクションを作るときのチェックリスト

- [ ] 背景は `brand-bg` (#05050F) か `brand-bg2` (#0A0A16)
- [ ] セクション冒頭に `section-tag` でラベルを付けた
- [ ] 見出しは `font-brand` (Syne) を使った
- [ ] 日本語本文は `font-jp` (Noto Sans JP) を使った
- [ ] グラスカードは `.glass` + `.glass-hover` クラスを付けた
- [ ] CTA ボタンは `brand-vgreen` を使った
- [ ] 画像カードの aspect ratio を守った (3/4 or video)
- [ ] reveal アニメーションを delay でずらした
- [ ] 余白 `py-24` 以上でセクションを分離した
- [ ] ノイズ・スクロールバーはそのまま（削除しない）
