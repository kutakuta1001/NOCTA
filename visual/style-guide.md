# NOCTA Visual Style Guide
最終更新: 2026-03-30（既存7作品の分析を反映）

---

## コアアイデンティティ

**一言で表すなら**: 「女の子/女性と、芸術的な色彩の爆発」

暗闇から明るい昼まで幅がある。陽気ではなく、美術的。
強い支配色と対比色によるコントラストが全作品に共通する核。
光・色・女性キャラクターが常に中心にある。

---

## 参照作品（Zoraコレクションより）

| タイトル | 支配色 | スタイル | 空気感 |
|---------|--------|---------|--------|
| free | ウォームゴールド | クリーンアニメ | 光の中の静かな少女 |
| Witch girl Midnight Carnival | 深紫×オレンジ | クリーンアニメ | ハロウィン夜・ゴシック祝祭 |
| Witch girl Sunny afternoon | ターコイズ×カラフル | ルーズペインタリー | 昼の魔法都市・祭り |
| wisteria flowers | バイオレット×白 | クリーンアニメ | 春・静謐・藤の下 |
| Art and information flood | ウォームイエロー×ティール×オレンジ | コンセプチュアル | 情報の洪水・美しいカオス |
| Time leap to GW | スカイブルー×マルチカラー | クリーンアニメ+コンセプチュアル | 時間の跳躍・時計と色彩が舞う昼空 |
| await in anticipation | ウォームピーチ×ティール | ルーズペインタリー（フラット寄り） | アトリエ・夢想・創造への期待 |

---

## トーン定義

| 要素 | YES | NO |
|------|-----|----|
| スタイル | アニメイラスト（クリーン〜ルーズペインタリー） | リアル写真・西洋油絵・3DCG |
| 明暗 | **幅がある**（深夜〜明るい昼まで可）| 単調・平坦な明るさ |
| 色彩 | **強い支配色1〜2色**＋対比アクセント | 色の主張がない・くすんだ全体 |
| カラフルさ | 絵画的・意図的・制御された色 | 無秩序・ランダム・ポップ |
| 光 | 月光・ボケ・木漏れ日・グロー・色彩そのものが光になる | ネオン・人工照明・フラッシュ |
| 人物 | **女性・女の子が必ず主役**（正面・横顔・上向き・後ろ姿） | 男性中心・群像劇のみ |
| 表情 | 静か・憂い・畏敬・感情的・穏やか・ドラマティック | 単純な笑顔・元気・陽気 |
| 背景 | ファンタジー/自然/シンプルなフラット背景/**創造的アトリエ（アート・本・植物に囲まれた室内）** | 現代リアル都市・生活感のある室内インテリア |
| テーマ | 魔法・自然・概念/哲学的・感情の可視化 | 日常・スポーツ・テクノロジー機器 |

---

## カラーパレット（実作品から抽出）

### 頻出カラー（使用頻度順）
- **Warm Amber / Gold**: 作品の光源・背景・ボケに最も多く登場
- **Deep Violet / Purple**: 夜空・藤・アクセントに頻出
- **Teal / Turquoise**: 対比色として強力（ティールとオレンジは相補）
- **White**: 人物の衣服・光の中心点のみ

### ベース（背景）
- 深夜系: `#05050F` Deep Void → `#1A0A3A` Midnight Indigo
- 昼間系: ターコイズ単色 / ウォームイエロー単色 / スカイブルー単色 / ウォームピーチ（シンプルに）

### アクセント6色（1作品2色まで）
| 名前 | カラー | 用途 |
|------|--------|------|
| Spectral Violet | `#9B4DCA` | 夜空・藤・神秘 |
| Absinthe | `#2ECC71` | 森・自然・毒のある緑 |
| Blood Amber | `#C8640A` | ランタン・夕焼け・炎 |
| Abyss Teal | `#0D7377` | 深海・対比・情報 |
| Crimson Smoke | `#8B1A1A` | 煙・深紅 |
| Lunar Gold | `#C9A84C` | 月光・ボケ・金 |

---

## キャラクタータイプ

### TYPE A: 魔女少女（Witch Girlシリーズ）
- 黒髪・長髪・ウィッチハット
- より動的・ドラマティック・カラフル
- ファンタジー都市・祭り・イベントに映える

### TYPE B: 繊細な少女
- さまざまな髪色（紫/青グラデーション等・シルバー/白も可）
- より静か・内省的・自然/概念的な背景
- 光や色彩と融合する描写に向く
- 「上を見上げる」構図（時計・花びら・情報片が降り注ぐシーンに特に合う）

**新キャラは自由に作ってよい。ただし必ず女性/女の子。**

---

## スタイルバリエーション

### Clean Anime（クリーンアニメ）
精細な線・鮮明な色・滑らかな塗り
→ ポートレート・自然・季節もの向き

### Loose Painterly（ルーズペインタリー）
見えるブラシストローク・ラフな背景・エネルギー感
→ 動きのある場面・祭り・風景向き

### Conceptual（コンセプチュアル）
シンプルな背景＋概念の視覚化（髪が情報になる等）
→ テーマ性の強い単体作品向き

---

## Midjourney 共通パラメータ（修正版）

```
--style raw
--stylize 700
--ar 1:1  （または 9:16 for SNS縦型、2:3 for ポートレート）
--no realistic photo, 3d render, western oil painting, old man, boy, group photo
```

### 必ず入れるキーワード群（ベース）
```
anime illustration, detailed anime art, female protagonist,
[キャラクター描写], [シーン・背景], [支配色 + 対比色],
[光の種類], artistic color palette, painterly quality,
[スタイルバリエーション: clean anime / loose painterly / conceptual]
```

### シーン別キーワード

**自然・季節系**
```
wisteria tunnel, ancient forest, moonlit clearing,
bioluminescent plants, soft dappled light, flower petals falling
```

**ファンタジー・魔法系（Witch Girlシリーズ向き）**
```
witch girl, pointed hat, gothic architecture, jack-o-lantern glow,
moonlit night sky, deep purple atmosphere, festive magic
```

**アトリエ・夢想系（await in anticipationスタイル）**
```
girl sitting at a desk daydreaming, walls covered with artworks and illustrations,
artist atelier, warm peach light, plants and paintings surrounding her,
loose flat illustration style, cozy creative space, anticipatory mood
```

**コンセプチュアル系**
```
figure looking upward, abstract elements emerging from hair,
color explosion, information overload visualized,
flat warm background, swirling dynamic colors,
clocks floating in sky, colorful geometric paper fragments raining down,
time visualized as objects, bright blue sky background
```

**光・ボケ系（freeスタイル）**
```
warm golden bokeh, particle light, girl surrounded by glowing light,
eyes closed in wonder, drowning in golden light
```

---

## Kling 共通パラメータ（映像版）

### 動きの方向性
- 緩慢・夢幻的を基本とする
- コンセプチュアル系は「色彩の波が広がる・流れる」動きが合う
- 推奨: `slow camera drift`, `color flowing like liquid`, `gentle particle movement`
- 禁止: `fast cut`, `energetic jump`, `zoom in fast`

### カメラワーク
- `slow dolly forward` — 吸い込まれるような前進
- `orbital rotation` — 被写体を中心にゆっくり回転
- `static camera with subject movement` — 固定カメラで色彩/要素が動く

---

## /visual-prompt での質問精度向上のための参照情報

新しい単体作品を作るとき、以下を参考に質問・提案する:

1. **キャラタイプ**: TYPE A（魔女・ダイナミック）か TYPE B（繊細・静か）か新キャラか
2. **スタイル**: Clean Anime / Loose Painterly / Conceptual のどれか
3. **支配色**: Warm Amber / Violet / Teal / その他 （対比色も選ぶ）
4. **背景**: ファンタジー場面 / 自然 / シンプルフラット
5. **光**: ボケ光 / グロー / 木漏れ日 / 色彩そのものが光
6. **テーマ/概念**: 伝えたいこと（感情・哲学・季節・物語の一場面）

---

## シリーズ管理

新しいシリーズを作るときは `visual/standalone/[シリーズ名]/concept.md` に記録する:

```markdown
# [シリーズ名]
開始日:
キャラタイプ: TYPE A / TYPE B / 新キャラ
スタイル: Clean Anime / Loose Painterly / Conceptual
使用アクセントカラー:
共通キーワード:
参照作品:
作品数:
```

---

## 参照アーティスト・作品
- Yoshitaka Amano（天野喜孝）— 線と色の溶け合い
- Zdzisław Beksiński — 暗闇と美の共存
- 映画「パーフェクトブルー」「時をかける少女」— 日本的な夢幻感
- Gustav Klimt — 装飾的な色と人物の融合
- **既存Zoraコレクション5作品**（本ガイドの根拠）

---

## 更新ルール
- 新しい作品を作ったら、効果が高かったパラメータをこのガイドに追記する
- `/visual-style-update` スキルで更新する（作成予定）
