# The First Flower — Visual Prompts（Midjourney）
生成日: 2026-04-18

カラーパレット参照:
- tff-deep:  #3D2E52（最深パープル）
- tff-dark:  #705E92（ミディアムパープル）
- tff-accent: #B168A8（パープルアクセント）
- tff-rose:  #EEA4C0（ローズ）
- tff-pink:  #FDD9D9（ソフトピンク）
- tff-teal:  #A6DDD6（ティール）
- tff-mint:  #B8E3B7（ミント）
- tff-base:  #FCFBF5（クリーム白）

---

## 01. Hero 背景ビジュアル

**用途**: Hero セクション背景（`img/hero.jpg` として配置・16:9）

```
A single wild flower blooming at the edge of a misty purple valley at dawn,
soft pastel dreamscape, impressionist watercolor texture, rose and lavender sky,
gentle morning fog drifting between hills, ethereal and serene,
color palette: deep violet #3D2E52, medium purple #705E92, rose #EEA4C0, soft pink #FDD9D9,
bokeh background, painterly aesthetic, no text, no people
--ar 16:9 --v 6.1 --style raw --q 2
```

**ネガティブプロンプト（参考）**: `--no text, watermark, logo, harsh lighting, neon, digital glitch`

---

## 02. Profile 背景テクスチャ

**用途**: Profile セクション背景（`img/profile-bg.jpg` として配置・16:9）

```
Japanese washi paper texture with soft pastel watercolor wash,
delicate pink and mint teal blending gently, pale morning light filtering through,
subtle grain and fiber texture, abstract and minimalist,
color palette: soft pink #FDD9D9, teal #A6DDD6, mint #B8E3B7, cream white #FCFBF5,
very light and airy, zen aesthetic, no figures
--ar 16:9 --v 6.1 --style raw --q 2
```

**ネガティブプロンプト**: `--no text, watermark, logo, dark, bold colors, people`

---

## 03. Quotes セクション背景

**用途**: Quotes（Text Overlays）セクション背景（`img/quotes-bg.jpg` として配置・16:9）

```
Deep twilight library at midnight, floating luminous words and soft glowing pages,
purple haze filling the space between shelves, twinkling particles of light,
mysterious and contemplative, cinematic atmosphere,
color palette: deep purple #3D2E52, medium purple #705E92, soft rose #EEA4C0 glowing accents,
no readable text, abstract, impressionist
--ar 16:9 --v 6.1 --style raw --q 2
```

**ネガティブプロンプト**: `--no people, faces, readable text, bright neon, harsh shadows`

---

## 使い方

1. 上記プロンプトを Midjourney（Discord）に貼り付けて生成
2. 気に入った画像をダウンロード → `website/the-first-flower/img/` フォルダに配置
3. `index.html` の対応セクションのコメント部分のURLを更新:
   - Hero: `background-image: url('img/hero.jpg');`
   - Profile: `background-image: url('img/profile-bg.jpg');`
   - Quotes: `background-image: url('img/quotes-bg.jpg');`
4. 写真を `img/` フォルダに入れた場合、`git add` 対象に **含めない**（CLAUDE.md git規則）

---

## アスペクト比・サイズ参考

| 用途 | アスペクト比 | 推奨解像度 |
|------|------------|----------|
| Hero | 16:9 | 1920×1080 以上 |
| Profile | 16:9 | 1920×1080 以上 |
| Quotes | 16:9 | 1920×1080 以上 |
