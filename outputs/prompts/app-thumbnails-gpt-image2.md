# Appsサムネイル生成プロンプト — GPT Image 2（ChatGPT Plus手動生成）

作成日: 2026-07-05
用途: HPトップ Apps セクションのカード画像（宝石図鑑・花図鑑・伝統色図鑑の3枚）
仕様: 16:9（カードは aspect-video）・1536x864以上推奨・文字は入れない（タイトルはカード側で表示）

共通ブランド前提（3枚とも同じ雰囲気に揃える）:
- 背景はウォームブラック #0A0906 基調のダークエディトリアル
- アクセントはシルバー #B8B4AE とオフホワイト #E8E0D0（彩度の高い色は被写体側のみ）
- 和紙のような微細な粒子ノイズ・十分な余白・静けさ・美術館の展示のような品

---

## 1. 宝石図鑑（保存先: website/images/zukan-gems.jpg）

```
Editorial still-life photograph for a dark museum-like web app thumbnail, 16:9.
A single luminous rough gemstone (deep blue sapphire crystal) resting on warm-black
Japanese washi paper (#0A0906), lit by one soft directional light from the upper left.
Subtle silver-grey reflections (#B8B4AE), generous negative space on the right,
faint paper grain texture, shallow depth of field, quiet contemplative mood,
high-end jewelry catalogue aesthetic. No text, no watermark, no hands.
```

## 2. 花図鑑（保存先: website/images/zukan-flora.jpg）

```
Editorial still-life photograph for a dark museum-like web app thumbnail, 16:9.
A single cherry blossom branch with a few pale pink petals, floating over
warm-black background (#0A0906), one petal falling, soft rim light,
subtle silver-grey tones (#B8B4AE) in the shadows, generous negative space,
faint washi paper grain, shallow depth of field, quiet ikebana-like stillness,
Japanese editorial aesthetic. No text, no watermark, no vase, no hands.
```

## 3. 伝統色図鑑（保存先: website/images/zukan-iro.jpg）

```
Editorial graphic composition for a dark museum-like web app thumbnail, 16:9.
Overlapping rectangles of Japanese traditional color papers — madder red (#B7282E),
lapis blue (#1E50A2), wisteria purple (#BBA1CB), matcha green (#AACF53) — arranged
like layered kimono collars (kasane) on warm-black washi paper (#0A0906).
Torn paper edges, subtle fiber texture, one soft light from above,
generous negative space on the left, quiet and precise, Japanese editorial
design aesthetic. No text, no watermark, no characters.
```

---

## 生成後の反映手順

1. 3枚を上記ファイル名で `website/images/` に保存（JPG・500KB以下推奨。大きい場合は幅1536pxに縮小）
2. Claude Codeに「Appsサムネイル3枚を保存したので反映して」と伝える
   → apps-data.js の各エントリの `imgUrl` を `./images/zukan-*.jpg` に更新し、確認後push します

補足:
- 3枚は同一プロンプト構造（被写体だけ差し替え）なので、並べたときにシリーズとして揃います
- 好みで被写体は変更可（例: 宝石をアメジストに、花を椿に）。プロンプト内の被写体名だけ差し替えてください
- 本プロンプトは叩き台です。自由に変更してください
