# The First Flower — 設計引き継ぎ書（DESIGN-NOTES）

最終更新: 2026-10-18（Connection を 6 つに・Self に「もうひとつの顔」を追加）

楽曲専用ランディングページ **「The First Flower 〜いい人生とは〜」** の構成と意図を残す引き継ぎ書。

> **重要**: このページは NOCTA 本体（ダーク／シルバーの editorial）とは**意図的に別系統**のデザイン。NOCTA DESIGN.md の「Brand Inheritance Guide」でいう**継承度「低」**にあたり、独自のカラー・フォントを持つ。NOCTA 本体の廃止カラー整理・シルバー統一の対象外（＝このページの色はそのままで正しい）。

---

## 1. コンセプトと元サイト

- 人生観・詩・思い・感動をつづる**パーソナル/哲学サイト**（「いい人生とは」）。
- 元サイトは Strikingly 版 `https://site-933552-7410-5224.mystrikingly.com/`。**背景写真・節の並び・スクロールの動きは元サイトに寄せる**のが方針（2026-10-18 CEO 指示）。
- 紫基調・Text Overlays の言葉が流れる表現・桜の花びらは**こちら独自の表現として残す**。紫は「文字の周りと Words の節」に置き、写真の主役を奪わない。

---

## 2. パレット（独自・`tff-` 名前空間）

NOCTA グローバルカラーを上書きせず、Tailwind config 内で `tff-` 接頭辞の独自トークンを定義している。

| トークン | 値 | 役割 |
|---|---|---|
| `tff-base` | `#FCFBF5` | 背景（ライトクリーム。Profile） |
| `tff-text` / `tff-deep` | `#3D2E52` | 本文・写真の上に重ねる紫 |
| `tff-dark` | `#705E92` | フッター |
| `tff-sub` | `#9A86B0` | サブテキスト |
| `tff-accent` | `#B168A8` | アクセント（マゼンタ寄り紫・現在地ドット） |
| `tff-rose` | `#EEA4C0` | 桜ピンク（ディバイダ・引用カード・ホバー枠） |
| `tff-pink` | `#FDD9D9` | 淡いピンク |
| `tff-mint` / `tff-teal` | `#B8E3B7` / `#A6DDD6` | 差し色 |

- 写真の上の文字は、紫の箱で囲まず `tff-text-glow`（紫の text-shadow）で読ませる。**Blog に紫の半透明パネルを敷いたら「野暮ったい」と差し戻された**（2026-10-18）。
- `tff-veil`（紫の半透明パネル）は Gallery の囲みとライトボックスのボタンにだけ残っている。

---

## 3. フォント

| クラス | フォント | 用途 |
|---|---|---|
| `font-serif` | Cormorant Garamond + Noto Serif JP | 見出し・引用（セリフ主体） |
| `font-jpserif` | Noto Serif JP | 日本語セリフ |
| `font-jp` | Noto Sans JP | 日本語サンセリフ本文 |
| `font-display` | Bebas Neue | ナビ・ラベル |

---

## 4. セクション構成

`top (hero) → credo（いい人生とは） → profile → self（Self Portrait） → quotes (Text Overlays) → gallery → blog → connection → footer`

| 節 | 背景 | 中身 |
|---|---|---|
| top | 写真 `img/hero.jpg`（Flickr 25831760540・青いカーネーション）＋中央だけ薄い紫 | 題字＋**桜の花びら**（`tff-sk-sm/md/lg`・`sakura-a/b/c`） |
| credo | 生成りの紙＋紙の目 | 作者の「いい人生とは」への答え 10 行を、右から左への縦書き・手書き風の書体（Klee One。使う字だけを `text=` で読み込む）で。番号は付けない。各行は「、」の切れ目で折り返す。結びは NOCTA と同じ一文「遊ぶことで人生を彩ろう」。署名の「— NOCTA」は答えの余韻を閉じるので外した（2026-10-18）。スマホは横にたどって読む |
| profile | 淡いメッシュグラデ（38s で揺れる）＋粒子 canvas・浮遊シンボル | 写真2枚（`img/profile-photo1/2.jpg`・風車と Budweiser。元サイトと同じ）。内容は `tff-profile-data.js` |
| self | 瓶覗（#A2D7DD）寄りの水色のグラデ（Profile の淡い地と境目を付ける） | 主役は画面幅の瓶覗の札（色面に縦書きの色名と読み仮名＋本人写真の水面 `img/kamenozoki-water.jpg`）。その下に作者の文「私は瓶覗色です。」。脇役としてストレングスファインダー上位 5（英語の正式名）と 16Personalities（ENFP 運動家）。水彩の円の画像は凛の指摘で外した（2026-10-18）。ストレングスは 10 位まで（最初は 5 位）。その右に「強みの全体像」（作者のメモを ChatGPT で清書した図 `img/strengths-map.jpg`・全体を 4:3 で見せ、押すと拡大・AI 使用を注記）と ENFP。最後に「もうひとつの顔」（`.tff-another`・丸い絵＋短文の 2 枚: ポケカで遊ぶ / 仮想通貨 FX をトレードする。文は各 X の自己紹介から。2026-10-18 追加） |
| quotes | 紫グラデの下に写真 `img/quotes-bg.jpg`（Flickr 25914083501）を透かす | **引用カードの無限マーキー**（`tff-quotes.js`・左 360s / 右 440s・hover で停止） |
| gallery | 写真 `img/gallery-bg.jpg`（Flickr 9414005395・ぼかし済み） | Flickr の写真タイル（下記 5 章）。最初は 15 枚（PC 5 列・スマホ 3 列で端数なし）、「すべて見る」で全件。`tff-veil` の囲み |
| blog | 写真 `img/blog-bg.jpg`（Flickr 9413369311・小樽運河・ぼかし済み） | 箱なしの記事カード（上に細線・`blog-data.js` の新しい3件） |
| connection | 写真 `img/connection-bg.jpg`（Flickr 25628706764・Victoria harbor） | 丸いアイコン6つ（3 列 2 段）。上段は元サイトと同じ Flickr / Old Blog=Ameblo / ブクログ 読書所感。下段は作者の別の顔の X ポケカ（@pokeasako）/ X トレード（@hanata19086）/ 7Witches Trade（FX トレードのサイト）（2026-10-18 追加） |
| footer | `tff-dark` | 冒頭の問いを返す「あなたにとっての『いい人生』は？」（Klee One）で終える。下に小さく鏡の一文「夜は NOCTA という名前で、…つくっています。→」（NOCTA の Statement 直下の「昼は The First Flower という名前で…」と対）。題字の繰り返しと BACK TO NOCTA は外した。TFF → NOCTA の案内は上部の「← NOCTA」とこの一文の 2 か所だけ（2026-10-18）。桜の花びら（`sakura-foot-a/b`） |

### journey（旅の一枚・行った場所のベストショット）

- 場所: `journey/index.html`。TFF の Profile 節からのリンクは、実データで 1 地域以上公開できるようになってから付ける（それまで誰からも辿れない）。設計書 `docs/superpowers/specs/2026-10-18-tff-journey-map-design.md`。
- 左に都道府県のタイル地図（`journey-map.js`・12 列 × 14 行・ID は JP-01〜JP-47）と行った場所の一覧、右に大きな写真と 2〜3 枚の送り。スマホは地図が上・写真が下で、押すと写真まで流れる。「日本 / 世界」で国の一覧に切り替える。
- 色: 行った地域 `tff-rose`、選択中 `tff-accent`、まだの地域 `#E6E0EC`。写真の枠は写真ごとの縦横比（データの `w` / `h`）に合わせ、縦長でも画面の高さの 78% までに収める（2026-10-18 CEO 決定。切らずに見せる）。
- データ: `tff-journey-data.js` の `TFF_JOURNEY = { schemaVersion: 1, regions: [{ id, kind: pref|country|place, parentId, name, photoIds }], photos: { <16桁16進>: { src, thumb, w, h, taken, caption, alt } } }`。公開するのは写真 2〜3 枚の地域だけ。写真の項目はこの 7 つだけで、位置情報を入れる場所はない（`journey-core.js` の検証で弾く。弾かれたらページは「準備中」になる）。ひとことは `textContent` で出す。
- テスト: `node --test "tests/journey/test_*.mjs"`（データ・地図）と `tests/journey/check_page.cjs`（ブラウザ。実行方法はファイル冒頭）。
- 公開データと `img/` は `tools/journey` の export が書く（手で写真を置かない）。写真の選び方は `tools/journey/README.md`。

- Connection の背景は元サイトの写真（Strikingly 備え付けのビルバオの街並み）を**使っていない**。素材の権利が不明なため、CEO 自身の Flickr 写真に替えた。
- アイコン `img/icon-*.jpg`（264px・CSS で円形）は本人の Flickr 写真から切り抜いたもの。Flickr＝桜（28095409850「the first flower」）、Old Blog＝万年筆（51007397898「pen」）、ブクログ＝本棚（5470813410）。下段の 3 つは各アカウントのアイコン（X ポケカ＝カヲルさん @kwr_pkc の絵・クレジットは Self の「もうひとつの顔」に記載 / X トレード＝作者のアイコン絵 / 7Witches＝ピンクのうさぎ）。2026-10-18 まで使っていた AI 生成の水彩アイコンは、レビューで「本人の写真の中で浮く・断りがない」と指摘され差し替えた。

---

## 5. 効果・仕掛け

- **スクロールの動き（元サイトに合わせた）**: 背景が止まって見えるのは **Gallery だけ**。ほかの節の背景は普通に流れる。`background-attachment: fixed` は iOS で効かないので、Gallery は `clip-path: inset(0)` の節に `position: fixed` の層（`.gallery-bg-layer`）を入れて再現している。
- **左の現在地ドット**（`#tff-dots`）: 元サイトのセクションナビを再現。画面中央にある節のドットが白く光る。hover で節名、押すとなめらかにスクロール。
- **Gallery**: 保存済みの一覧 `tff-gallery-data.js`（2026-10-18 時点の 66 枚）＋ Flickr 公開フィード（JSONP・鍵なし・新しい20枚）を重複なしで並べる。フィードが失敗・6 秒以上遅れても一覧だけで表示する。
  - Flickr の無料アカウントでは API キーを発行できないため、この形にした。
  - タイルを押すと**ページ内で拡大**（`#tff-lightbox`・`_b` サイズ）。← → キー・スワイプで送る、Esc・外側クリックで閉じる。Cmd/Ctrl+クリックは Flickr を新しいタブで開く。
- **トップ写真の粒**: `.tff-film-grain`（SVG ノイズを overlay で重ね、四隅を紫で落とす）。写真の荒さを質感に見せる。強さは今を上限にする（レビューで合意）。
- **桜パーティクル**: hero（写真の上で埋もれないよう縁取り）とフッター。
- **ヘッダーの色切り替え**: `.tff-header.on-photo`（hero 上）は半透明パープル、hero を過ぎるとライトクリーム。
- **グレインノイズ**: 全面に `opacity: 0.25` の薄ノイズ。
- **reveal**: スクロールインで `tff-reveal`（24px下→フェードイン）。

---

## 6. ファイル構成・保守メモ

```
the-first-flower/
├── index.html            ← スタイル・構成・スクリプトを内包
├── tff-profile-data.js   ← プロフィール内容・写真パス
├── tff-quotes.js         ← 引用集（マーキー用）
├── tff-gallery-data.js   ← Gallery の写真一覧（66枚・新しい順）
├── journey/              ← 旅の一枚（地図ページ・公開データ・img/）
└── img/                  ← 背景写真6枚・プロフィール写真2枚・アイコン3枚（各 175KB 以下）
```

- **背景写真を替える**: Flickr の元画像（`_o`）を幅 1920px に縮め、Blog・Gallery は元サイトに合わせてぼかしてから `img/` に置く。1 枚 1MB を超えない。
- **Flickr で写真を消した・非公開にした**ときは、`tff-gallery-data.js` から消すか一覧を作り直す（新しく上げた写真はフィードから自動で足される）。
- **引用を追加**するときは `tff-quotes.js` に追記（マーキーへ自動反映）。
- NOCTA本体のデザイン変更（パレット・フォント統一）を**このページに波及させないこと**。
- NOCTA本体トップからの導線: footer の「✦ いい人生とは」リンク（`footer.tff.link`）。
- 既知の小さな問題: Profile の光の玉（`tff-orb-2`）が画面右へはみ出している（`body { overflow-x: hidden }` で隠れて実害なし）。
