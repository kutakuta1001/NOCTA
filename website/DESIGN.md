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

### セクション見出しパターンの使い分け（必須ルール）

NOCTA HP には意図的に2パターンの見出しが使われている。混在させてよいが、セクション性格に合わせること。

| パターン | 見た目 | 使うセクション | 理由 |
|----------|--------|--------------|------|
| **A: Bebas Neue 全大文字** | `WORKS` `VISUAL` `BLOG` | ポートフォリオ・コレクション系 | 作品を「見せる」場。インパクト優先 |
| **B: section-tag + font-jp 日本語見出し** | `— About` + 「創造と革新が…」 | About / Services / Contact | 言葉で「伝える」場。読ませる文章優先 |

```html
<!-- パターン A -->
<h2 class="font-display text-[clamp(52px,8vw,100px)] text-white tracking-[4px]">WORKS</h2>

<!-- パターン B -->
<p class="section-tag">Services</p>
<h2 class="font-jp text-[clamp(34px,5vw,56px)] font-bold text-white">
    音楽を生み出し、<span class="text-gradient">世界に届ける</span>
</h2>
```

新しいセクションを追加する場合: コンテンツ主体（作品・ギャラリー）→ パターン A / 説明・CTA → パターン B。

---

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

## 11. ビジュアルアセット生成ガイド

Claude Design / Midjourney / Kling / Runway でビジュアルを作るとき、
このセクションを参照することで毎回ブランド定義を書かずに済む。

### 共通ブランド指定（全用途に適用）

```
Dark background #05050F, neon lavender #C8A2FF glow, neon green #39FF6A accent,
gold #C4942A highlight, grain noise texture overlay, Bebas Neue or Syne typography,
no bright colors, no white background, no red/pink/orange
```

---

### 楽曲ジャケット（Album Art）

| 項目 | 値 |
|------|-----|
| アスペクト比 | 1:1（3000×3000px 推奨） |
| 背景 | `#05050F` をベースに宇宙・星雲・グリッチノイズ |
| アクセントカラー | `#C8A2FF`（ラベンダー）+ `#39FF6A`（ネオングリーン）のグロー |
| タイポグラフィ | Bebas Neue または Syne。白 or グラデーション文字 |
| 禁止要素 | 写実的な人物顔写真 / 明るい背景 / 赤系カラー |

**プロンプトテンプレート:**
```
deep space noir album cover, [曲名・世界観キーワード],
neon lavender #C8A2FF light streaks, neon green #39FF6A accent glow,
dark background #05050F, grain noise film texture,
ultra detailed, cinematic, square 1:1
```

---

### SNSバナー

| プラットフォーム | サイズ | 用途 |
|----------------|--------|------|
| X（Twitter）ヘッダー | 1500×500px (3:1) | プロフィールヘッダー |
| X 投稿（横） | 1200×675px (16:9) | リリース告知・通常投稿 |
| X 投稿（縦） | 1080×1350px (4:5) | 縦型コンテンツ |
| Instagram 正方形 | 1080×1080px (1:1) | フィード投稿 |
| Instagram ストーリー | 1080×1920px (9:16) | ストーリーズ |

**プロンプトテンプレート（X リリース告知 16:9）:**
```
NOCTA music release banner, [曲名・リリース情報],
dark space noir background #05050F, lavender purple #C8A2FF neon glow,
neon green #39FF6A accent lights, glass morphism overlay,
Bebas Neue title text, Space Grotesk subtitle,
grain noise texture, 16:9 aspect ratio, ultra high quality
```

**プロンプトテンプレート（X ヘッダー 3:1）:**
```
NOCTA music entertainment brand header,
deep space noir panoramic, lavender #C8A2FF and neon green #39FF6A color scheme,
abstract sound wave or orbital rings motif, minimal text "NOCTA",
Syne bold typography, grain noise, 3:1 ultra wide
```

---

### Works セクション サムネイル（楽曲カード）

| 項目 | 値 |
|------|-----|
| アスペクト比 | 16:9（aspect-video） |
| スタイル | 楽曲タイトル + ビジュアルモチーフ |
| アクセント | `#C4942A`（ゴールド）のグロー — Works バッジカラーに統一 |
| 背景 | `#05050F`〜`#0A0A16` グラデーション |

**プロンプトテンプレート:**
```
NOCTA music track thumbnail, [曲名・ジャンル・世界観キーワード],
gold #C4942A glow accent, dark background #05050F,
Space Grotesk title typography, grain noise overlay, 16:9
```

---

### Apps セクション サムネイル（ツールカード）

| 項目 | 値 |
|------|-----|
| アスペクト比 | 16:9（aspect-video） |
| スタイル | テック系ミニマル。ツール名 + 機能をイメージするアイコン/モチーフ |
| アクセント | `#C8A2FF`（ラベンダー）グロー + グラスモーフィズム |
| 背景 | `#05050F` + 薄い幾何学グリッドまたは回路パターン |

**プロンプトテンプレート:**
```
minimal tech app thumbnail, [ツール名・機能キーワード],
dark background #05050F, lavender purple #C8A2FF glow,
subtle geometric circuit grid overlay, glass card element,
Space Grotesk label text, grain noise, 16:9
```

---

### Blog セクション ヘッダー画像（記事カバー）

| 項目 | 値 |
|------|-----|
| アスペクト比 | 16:9（aspect-video） |
| スタイル | 記事テーマに合った抽象ビジュアル + NOCTAブランド色 |
| アクセント | `#C8A2FF`（AI/Tech系記事）or `#39FF6A`（音楽/制作系記事）で使い分け |
| タグ | 記事カテゴリ（AI / Music / Tech）を左上に section-tag スタイルで配置 |

**プロンプトテンプレート（AI/Tech系）:**
```
NOCTA blog cover image, [記事テーマキーワード],
dark abstract background #05050F, lavender purple #C8A2FF neon glow,
neural network or circuit motif, editorial minimal style,
Space Grotesk category label text, grain noise texture, 16:9
```

**プロンプトテンプレート（音楽/制作系）:**
```
NOCTA blog cover image, [記事テーマキーワード],
dark abstract background #05050F, neon green #39FF6A accent,
sound wave or synthesizer motif, editorial minimal style,
Space Grotesk category label text, grain noise texture, 16:9
```

---

### Visual セクション アート（縦長カード）

| 項目 | 値 |
|------|-----|
| アスペクト比 | 3:4（aspect-[3/4]） |
| スタイル | AI生成アート。宇宙・有機物・サイバーパンク |
| バッジ色 | Art/Music: `bg-brand-secondary/20 text-brand-secondary` |

**プロンプトテンプレート:**
```
deep space concept art portrait, [作品テーマキーワード],
organic cyberpunk aesthetic, lavender #C8A2FF and neon green #39FF6A color scheme,
dark background #05050F, ultra detailed, grain film texture, 3:4 portrait
```

---

### Midjourney 共通サフィックス

```
--style raw --chaos 15 --s 200
```

**ネガティブプロンプト（除外）:**
```
--no bright colors, white background, daylight, cute, cartoon, pink, orange, red, realistic portrait photography
```

---

### Claude Design ワークフロー

**ビジュアル（ジャケット・SNSバナー等）の場合:**
1. このセクション（11）を Claude Design にペーストしてブランドコンテキストを渡す
2. 用途を指定（例: 「楽曲ジャケット、曲名：○○、世界観：深夜の孤独」）
3. 生成された画像を IPFS にアップロード
4. CIDv1 ハッシュ（59文字）を `visual-data.js` に追加（`/visual-add` スキル使用）

**LP・UIページの場合:**
1. `/lp-create [対象名]` を実行する（楽曲LP・説明LPどちらも対応）
2. スキルが `drafts/design-brief-[対象名].md` を生成 → そこの「Claude Design 注入プロンプト」を使う
3. 注入プロンプトは800トークン以内に圧縮済み

---

## 12. 感情-ビジュアル変換テーブル

`/lp-create` と Claude Designへの注入時にこのテーブルを参照する。
エモさキーワードを受け取った際、色彩・レイアウト・禁止要素に自動変換する。

| 感情キーワード | 支配カラー | アクセントカラー | レイアウト傾向 | 禁止要素 |
|---|---|---|---|---|
| 孤独・内省 | brand-primary (#C8A2FF) 支配 | brand-vgreen 最小限 | 余白多め・中央配置・縦長 | 群衆・賑やかな色 |
| 希望・覚醒 | brand-vgreen (#39FF6A) アクセント増 | brand-primary グロー | 上方向の視線誘導・開放的 | 暗すぎる影・閉塞感 |
| 緊張・不安 | brand-bg (#05050F) 支配 | brand-primary 微量 | 狭い構図・非対称・傾斜 | 穏やかな曲線・明るさ |
| 深夜・静寂 | brand-bg2 (#0A0A16) 支配 | brand-sub (#8A8A9E) | 横方向の広がり・低コントラスト | 高彩度・賑やかな動き |
| 解放・躍動 | brand-vgreen (#39FF6A) 支配 | brand-secondary ゴールド | 余白少なめ・ダイナミック | 停滞感・暗い背景一色 |
| 哀愁・郷愁 | brand-secondary (#C4942A) 支配 | brand-primary 補助 | 中央集約・ノイズ強め | クールトーン・テクノ感 |
| 神秘・幻想 | brand-primary (#C8A2FF) + 深紫グラデ | brand-vgreen 点描 | 非線形・浮遊感 | 直線的レイアウト・無機質 |

**使い方の例:**
「孤独・夜明け・希望」→ 孤独（ラベンダー支配・余白）+ 希望（vgreen アクセント増・上昇構図）を合成。

---

## 13. レイアウトパターン集

Claude Design / `/lp-create` でLPを構築するときの参照パターン。

### パターン A: ヒーロー中央配置（楽曲LP・感情重視）

```
[フルスクリーン背景: brand-bg]
  [中央] ロゴ or キービジュアル（グロー効果）
  [中央] 楽曲タイトル（Bebas Neue・大文字）
  [中央] キャッチフレーズ（Syne・小さめ）
  [中央] CTA ボタン（brand-vgreen）
  [下部] スクロールライン
```

適用: 楽曲LP（継承度 低/中）・インパクト優先

### パターン B: テキスト + ビジュアル 2カラム（説明LP・バランス重視）

```
[左] テキストブロック（セクションタグ→見出し→本文→CTA）
[右] キービジュアル or スクリーンショット（グラスカード）
※ md以上では左右分割、sm以下では縦積み
```

適用: プロダクト説明LP・サービス紹介（継承度 高）

### パターン C: フィーチャーグリッド（機能・特徴訴求）

```
[上部] セクションタグ + 見出し（中央揃え）
[下部] 3カラムグリッド: glass カード × 3〜6
  各カード: アイコン or 数値 → 見出し → 説明文
```

適用: サービスLP・プロダクトUI紹介

### パターン D: フルブリード引用（感情的な楽曲LP）

```
[フルスクリーン] 楽曲テーマ画像（暗め処理）
  [テキストオーバーレイ] 歌詞の一節 or キャッチコピー
  [下部] 楽曲情報 + ストリーミングリンク
```

適用: 楽曲LP（継承度 低）・感情没入型

---

## 14. ブランド継承度ガイド

`/lp-create` でのブランド継承度パラメータの詳細定義。

| 継承度 | 適用場面 | 変更できるもの | 変更してはいけないもの |
|---|---|---|---|
| **高** | プロダクトUI・説明LP | レイアウト・コピー | カラーシステム・フォント・アニメーション |
| **中** | ジャンル統一感のある楽曲LP | アクセントカラーの重みづけ | brand-bg・brand-primary・フォント |
| **低** | 楽曲固有の世界観LP（the-first-flower方式） | 独自カラースキーム全体・フォント部分 | ノイズテクスチャ・スクロールバー・余白の精神 |

**継承度「低」の実装例（the-first-flower）:**
```css
/* Tailwind config で楽曲固有カラーを定義 */
'tff-base': '#FCFBF5',    /* 楽曲メイン背景 */
'tff-accent': '#B168A8',  /* 楽曲アクセント */
```
NOCTAグローバルカラーを上書きせず、別名前空間で定義する。

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
