# NOCTA Visual Style Guide
最終更新: 2026-03-30

---

## コアアイデンティティ

**一言で表すなら**: 「暗闇の中に存在する、芸術的な色彩と女性」

夢の中のような不確かさと静けさ。陽気ではなく、美術的。
深い闇を背景に、宝石・光・夢幻的な色彩が女性とともに存在する世界。

---

## トーン定義

| 要素 | YES | NO |
|------|-----|----|
| 明暗 | ダーク・深夜・深淵 | 昼・明るいナチュラル光 |
| 色彩 | 宝石色（深紫・翡翠・サファイア・琥珀・緋）| ポップ・パステル・蛍光 |
| カラフルさ | 絵画的・意図的・制御された色 | 陽気・にぎやか・カジュアル |
| 光 | 月光・生物発光・炎・霧の中の光・オーラ | ネオン・人工照明・フラッシュ |
| 質感 | 油絵・水彩にじみ・霧・煙・水面反射 | リアル写真・CGすぎる質感 |
| 人物 | 女性・女の子（主役またはモチーフ）・表情は静か | 笑顔・元気・集団 |
| 空気感 | 夢・静寂・神秘・孤高 | 賑やか・躍動・スポーティ |

---

## カラーパレット

### プライマリ（常に使う）
- **Deep Void**: `#05050F` — 最も暗い背景
- **Midnight Indigo**: `#1A0A3A` — 深紫の闇
- **Ghost White**: `#E8E8F0` — 人物の肌・淡い光

### アクセント（作品に1〜2色を選んで使う）
- **Spectral Violet**: `#9B4DCA` — 霊的な紫
- **Absinthe**: `#2ECC71` — 毒のある緑
- **Blood Amber**: `#C8640A` — 深い琥珀
- **Abyss Teal**: `#0D7377` — 深海の青緑
- **Crimson Smoke**: `#8B1A1A` — 煙の中の深紅
- **Lunar Gold**: `#C9A84C` — 月光の金

### 使用ルール
- 背景は必ずDeep Void〜Midnight Indigoの範囲
- アクセントは1作品につき原則2色まで
- 白・明るいグレーは「人物の肌・光の中心点」のみに限定

---

## 人物描写ガイドライン

- **主役は女性または女の子**（単独・後ろ姿・横顔・シルエットも可）
- 表情は静か。笑っていなくてよい。むしろ無表情・憂い・内省
- 衣装: 現代的すぎず、時代不明な服装が望ましい（ドレープ・フード・長いスカート等）
- 人物と背景の境界を曖昧にする（霧・光・煙で溶け込ませる）
- 目を強調する表現は有効（光が宿る・異色・閉じている）

---

## Midjourney 共通パラメータ

```
--style raw
--stylize 750
--ar 1:1  （または 9:16 for SNS縦型、16:9 for 横型）
--no smile, happy, bright, cheerful, neon, cyberpunk
```

### 必ず入れるキーワード群（ベース）
```
dark atmospheric, cinematic lighting, oil painting texture,
mysterious, dreamlike, solitary female or young girl figure,
jewel-toned color palette, painterly, fine art quality,
deep shadows, ethereal glow
```

### シーン別追加キーワード

**森・自然系**（NuWordとの連動に使いやすい）
```
ancient forest, bioluminescent plants, moonlit clearing,
mist between trees, otherworldly nature
```

**宇宙・抽象系**（単体作品・ブランドビジュアル向け）
```
cosmic void, nebula colors bleeding, star dissolution,
figure merging with universe
```

**水・鏡系**（夢幻・反射表現向け）
```
mirror-like water surface, reflection distortion,
submerged dreamscape, liquid light
```

---

## Kling 共通パラメータ（映像版）

### 動きの方向性
- **緩慢・夢幻的**（速い動きは原則禁止）
- 推奨: `slow camera drift`, `subtle particle movement`, `gentle hair motion`
- 禁止: `fast cut`, `energetic movement`, `zoom in fast`

### カメラワーク
- `slow dolly forward` — 吸い込まれるような前進
- `orbital rotation` — 被写体を中心にゆっくり回転
- `subtle handheld` — 生きているような微細な揺れ

---

## シリーズ管理

新しいシリーズを作るときは `visual/standalone/[シリーズ名]/concept.md` に以下を記録する:

```markdown
# [シリーズ名]
開始日:
テーマ:
使用アクセントカラー:
共通キーワード:
参照作品:
作品数:
```

---

## 参照アーティスト・作品（インスピレーション）
- Yoshitaka Amano（天野喜孝）— 線と色の溶け合い
- Zdzisław Beksiński — 暗闇と美の共存
- 映画「パーフェクトブルー」「時をかける少女」— 日本的な夢幻感
- Gustav Klimt — 装飾的な色と人物の融合

---

## 更新ルール
- 新しい作品を作ったら、使ったパラメータで効果が高かったものをこのガイドに追記する
- `/visual-style-update` スキルで更新する（作成予定）
