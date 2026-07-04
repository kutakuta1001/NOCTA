# NOCTA Website — 設計引き継ぎ書（DESIGN-NOTES）

最終更新: 2026-06-15

このドキュメントは NOCTA ホームページ（`website/`）の**デザインの意図・考え方・経緯**を、後から見ても理解できるように残すための引き継ぎ書です。

- **正本（source of truth）**: 現在ライブで動いているサイト（`main` ブランチの `website/` ＝ https://kutakuta1001.github.io/NOCTA/ ）。
- **トークン仕様書**: `website/DESIGN.md`（色・タイポ・コンポーネント・ホームページ構成の機械可読スペック。`@google/design.md` 形式・lint対応）。
- **このファイル**: なぜそのデザインなのか（WHY）と意思決定の記録。

仕様（数値・トークン）は DESIGN.md を、理由・背景はこのファイルを見てください。両者が食い違ったら**ライブサイトを正**とし、DESIGN.md を合わせます（逆ではない）。

---

## 1. ブランドの核となる考え方

- **多領域クリエイティブプロジェクト**であり、音楽専門レーベルではない。4本柱 = **音楽 / ビジュアル / 言葉（ブログ）/ コード（アプリ）**。
- この4本柱は、ヒーロー下の STATS（楽曲数 / ビジュアル数 / ブログ数 / アプリ数）、About本文、価値カード「越境（Crossing）」、footerタグライン `Music × Visual × Words × Code` に一貫して現れる。
- トーンは **dark editorial serif-led**（落ち着いた・余白主体・印刷的）。声高でなく、必要な箇所だけ静かに強い。

---

## 2. パレット（確定: 2026-06-15）

| 役割 | 値 | 備考 |
|---|---|---|
| アクセント（単一） | シルバー `#B8B4AE` | ブランド唯一の差し色。CTA・section-tag・hover glow に限定使用 |
| テキスト | オフホワイト `#E8E0D0` | |
| 背景 | warm-black `#0A0906` / surface `#0F0D0A` | |
| サブテキスト | `#9A8A7A` | |

**経緯**: 2026-06-04 に gold(#C4942A) → シルバー×オフホワイトへ変更。だが DESIGN.md が gold のまま残り混乱が発生。2026-06-15 に DESIGN.md をシルバーへ再構成し、サイト側の廃止値（#39FF6A ネオングリーン / #C8A2FF ラベンダー / #C4942A gold / #05050F / Space Grotesk / Inter）を全除去して整合させた。

**やってはいけない**: 第2のアクセント色を足す／白背景・ライトモード／gold・ネオン・ラベンダーの再導入／未ロードフォント（Inter・Space Grotesk）の使用。

---

## 3. タイポグラフィの考え方

- ロードフォントは **EB Garamond（セリフ大見出し）/ Syne（見出し・ラベル）/ Bebas Neue（数字・ドラマチック大文字）/ Noto Sans JP（日本語本文）** の4種のみ。
- **「大きさで強調、太さで強調しない」**: セリフ大見出しは weight 600 が上限。強調はサイズとシルバーのコントラストで作る。
- **2つの見出しダイアレクトを使い分ける**（混在は同一セクション内では避ける）:
  - Pattern A（Bebas/EB Garamond 大文字）= ポートフォリオ系（WORKS / VISUAL）。作品を「見せる」場。
  - Pattern B（section-tag + Noto Sans JP 見出し）= About / Contact。言葉を「読ませる」場。

---

## 4. レイアウト原則（Airtable 分析から移植）

`design/DESIGN-airtable.md`（Airtable マーケサイトのトークン分析）を参照テンプレートに、**色・フォントはNOCTA値に総入れ替えしつつ「原則とスケール」だけ移植**した。NOCTAはシルバー単一アクセントなので、Airtableの「多色シグネチャカード」は**色相でなく面のトーン差・スケール**として翻案している。

実装済みの原則:

1. **96px+ のセクションリズム**（`py-32`）— 全帯で一定の呼吸。
2. **サーフェスのリズム**（2026-06-15追加）— 同じ面を連続させない。`works`/`visual` を `bg-black/30` の沈み面、`about`/`apps`/`blog` を平面にして交互の抑揚を作る。沈み面はグラスカードのコントラストも保つ。
3. **ステートメント帯（voltage moment）**（2026-06-15追加）— about と works の間に浮き面（`bg-white/[0.02]` glassy）の全幅帯。大型 EB Garamond の一文＋一語だけイタリック・シルバー。色を足さずスケールと面の浮きで「山」を作る。＝ダークモード版のシグネチャカード。1ページに1つ。
4. **featured-first グリッド**（2026-06-15追加）— Works 先頭カードを `lg:col-span-2` の横長に。均質な3列グリッドの「スペックシート感」を崩す。
5. **glass-and-noise first のelevation** — 影は最小。深さは半透明グラス＋常時のグレインノイズ＋（hover時のみの）シルバーglowで作る。glow は常時点灯しない。
6. **アクセントの希少性** — プライマリCTAは1ビューポートに1つ。シルバーは差し色として控えめに。
7. **About シグネチャビジュアル**（2026-06-15・案F）— About右の図を「中央SOULノードグラフ」から **4本柱（Music/Visual/Words/Code）が中央の動くシルバー球体に収束する図**へ刷新。中央の安っぽいテキスト（SOUL/NOCTA）は廃し、メタリックなグラデーション球体（`.nocta-orb`・`orbFloat`/`orbShine` で呼吸・浮遊）に。STATS/タグラインの4本柱と図のラベルを常に一致させる。
8. **ヒーロー背景の幾何ループ**（2026-06-15）— 旧「2026」を、同心の回転多角形・ダッシュリング・脈動ドット（シルバー線画）の **30秒シームレスループ**に置換。全要素の周期は30秒の約数（30s/15s）でぴったり最初に戻る。`prefers-reduced-motion` で停止。CSSは `.hero-geo` / `.geo-*` / `@keyframes geoSpinCW/CCW/geoBreathe/geoPulse`。

**ブランド肩書き**: 公開表記は「Music Entertainment / 音楽エンタメ」→ **「Creative / クリエイティブ」** に変更（2026-06-15・`<title>`・ヒーローeyebrow・footer）。音楽専門レーベルではないため領域中立に保つ。

**見送った案**: モノクロのプルーフ帯（ロゴストリップ相当）。リリース前で「配信中」等が事実でないため。リリース後に「配信先」帯として再検討する。

---

## 5. 2026-06-15 の変更サマリ（commit）

| 変更 | commit |
|---|---|
| DESIGN.md をシルバー基調に再構成＋サイト廃止値クリーン | `8b2711c` |
| visualセクション沈み面（サーフェスリズム） | `8568810` |
| ステートメント帯追加（"遊ぶことで人生を彩ろう"） | `ca240ae` |
| Works先頭 featured（lg:col-span-2） | `fddf98d` |
| 多領域リブランド（STATS4項目化＋About拡張＋越境カード＋タグライン） | `a0db4d2` |

---

## 6. 保守メモ

- **STATS の数値は手動更新不要**。`works/visual/blog/apps` 各データ配列の件数を JS が自動カウント（`index.html` 内「Stats bar: データ配列から件数を動的カウント」スクリプト）。
- **コンテンツデータ**は `works-data.js` / `visual-data.js`（3配列）/ `apps-data.js` / `blog-data.js`。追加は各スキル（`/hp-add-work`・`/visual-add`・`/blog-publish`）参照。
- **ステートメント帯のコピー**はブランドメッセージ＝CEO領域。現在は静的（i18n未対応）。EN切替時も日本語表示。文言確定後に i18n キー追加を検討。
- **デッドコード**: `.vocaloid-bar` / `.vocaloid-card-tag` は body 未使用の旧CSS（非表示・無害）。除去は任意。
- **未整合の独立ページ**: `brand_assets.html` / `brandkit.html` は旧パレット（gold/neon/lavender）の見本ページ。index 非リンク。機械置換でなくシルバーで**再生成が必要**な別タスク。
- **lint**: `npx @google/design.md lint DESIGN.md`。contrast/orphaned-token の warning は仕様上の既知事項（DESIGN.md「Known Gaps」参照）。
- 別ページ `the-first-flower/` は**独立した世界観（継承度 低）**。専用の引き継ぎ書 `the-first-flower/DESIGN-NOTES.md` を参照。

---

## 7. 猫モチーフとストーリー（2026-06-16 追加）

NOCTA LP には縦スクロール＝物語として、**「AI＝幾何（冷たく構造的）」と「遊び＝猫（温かく色彩）」の二項対立**が通底している。

### 二項対立のルール
- **Statement より前（Hero / About / Tools）＝幾何＝AIの領域。猫は出さない。**
  - Hero: 幾何ループ（回転多角形・リング・脈動ドット・30秒シームレス）
  - About: 4本柱オービット＋中央の動く銀球体（`.nocta-orb`）
  - Tools: **意図的に猫なし・装飾なしでクリーンに保つ**（希少性＝心地よさ／ここは"AIツール"の静かな区画）。幾何アクセント案も検討したが「入れない」で確定。
- **Statement 以降＝猫が登場し、色（遊び）を持ち込む。**

### ストーリーの流れ（ページ上→下）
1. **About** — 銀球体の周囲の4本柱（Music/Visual/Words/Code）の点と線を **赤/黄/青/紫** に色付け。これは AI フェーズの4色＝後で猫が出会って「遊び」になる色の伏線。
2. **Statement「遊ぶことで人生を彩ろう」** — 銀猫が赤い絵の具皿に前足をつける（`silver-paint.png`）。物語の起点。背後 z-0・スクロールで登場。
3. **Portfolio** — 見出し周りの空きスペースに色付き水彩足跡（**SVG**・赤黄緑青紫）が 1/3速度でゆっくり1つずつ登場（猫が歩いて残した跡）。
4. **Visual** — 銀猫が座って後ろ姿でギャラリーを眺める（`silver-sit.png`）。見出し脇に配置。
5. **Blog** — 絵の具付きで歩く銀猫（`silver-walk.png`）が見出しへ向かう。
6. **フッター直前** — 色付き足跡の水平区切り線（`paw-divider.png`）。旅の continuity。
7. **Footer** — 猫が丸くなって眠る（`silver-sleep.png`）。旅の終わり。

### なぜ銀猫か
イラストは黒猫・銀猫の両方を用意。NOCTA はダーク（`#0A0906`）なので**銀猫（ぎんねこ）を使用**（黒猫はダーク背景で消えるため／黒猫はライト系の文脈用）。

### 素材
- **切り出し済みスプライト（repo にコミット済み）**: `website/img/cat/`
  - 猫: `silver-paint / walk / sit / sleep / peek .png`
  - 色付き肉球: `paw-red / amber / green / teal / blue / purple .png`
  - 区切り線: `paw-divider.png`
- **元シート（repo外・`project_NOCTA/visual/` にローカル保管。画像はgit管理外規約のため未コミット）**: `ぎんねこ透過.png / ２ / ３ / ４`, `くろねこ透過.png`（猫＋ラベル入りの全身ストーリーボード・透過）。新ポーズが要るときは PIL で `crop` → `getbbox()` 自動トリムで切り出す（座標はラベルを避ける）。**別PCにはこの元シートは渡らない点に注意**（スプライトは渡る）。
- 「猫がレインボートレイルを歩く」全身バンドも試作したが**大きすぎて不採用**→ 細い `paw-divider.png` に置換。

### 実装の仕組み
- `.cat-scene`（IntersectionObserver が監視→ `.in-view` 付与）＋ `.cat-fig`（opacity/translate でフェード登場）。猫 `<img>` は各セクションの見出し/帯の中に `z-0`（本文は `z-10`）・`pointer-events:none`・`aria-hidden` で配置。
- 足跡は `.paw-trail`>`.paw`>`.paw-svg`（`#cat-paw` シンボル＋`#watercolor` feTurbulence フィルタの色付きSVG）。**base opacity 0.55**（JS/監視が発火しなくても見える保険）、`.in-view` で `pawPress` ポップ、`animation-delay` で歩行カデンス、速度は `--paw-dur`（Portfolio は 1.8s）。
- Observer のセレクタは `.paw-trail, .cat-scene`。`prefers-reduced-motion` で全停止。

### Do / Don't
- 猫は**間引く**（約5ビートのみ）。全セクションに入れない（Tools はクリーン維持）。
- 猫は Statement 以降のみ。Hero / About / Tools は幾何（AI）のまま。
- 肉球/4本柱の色（赤/黄/青/紫）は固定セット。About → 足跡 の色対応を崩さない。

---

## 8.5. 2026-07-04 の変更（クラフト精度向上＋ステートメント帯の遊び）

| 変更 | 意図 |
|---|---|
| 和文セリフ **Shippori Mincho 600** を導入。display スタックを `'EB Garamond','Shippori Mincho',serif` に | serif-led ブランドの核である和文大見出し（ヒーロー・ステートメント）が OS 依存の明朝フォールバックだった問題を解消。Windows での見え方を統制。和文 display は letter-spacing 0.04em・line-height をやや開放（ヒーロー 1.06 / ステートメント 1.2） |
| OGP・meta description・theme-color・favicon.svg を追加 | シェア時のカード表示。og:image は暫定で SILENCE #1（IPFS）。専用バナー（1200x630）制作後に差し替えること |
| 廃止パレット残骸の掃除 | thumb-1〜6 を warm-black 面差のみのグラデーションへ（紫/シアン/ピンク廃止）。option 背景 #1a1a2e → #0F0D0A。ナビスクロール背景を warm-black 系へ。ヒーロータグライン #7a6a50 → muted トークン。フォーム状態色（#8b6914 / #00b894 / 赤グラデ）を撤去しテキスト+不透明度で表現 |
| .btn-submit を on-accent 準拠に | シルバー地×白文字（コントラスト比 約1.9:1）→ 文字色 #0A0906・pill 形状 |
| 未使用CSS/トークン削除 | .service-card / .card-top-bar / .bar-* / .brand-badge / .text-vgreen / glow-purple・cyan・pink・vgreen、i18n の services.* / news.* 全キー |
| STATS の count-up 配線 | data-count 経由に変更しスクロール到達時に駆け上がり（従来は即時代入でアニメーション未発火） |
| ステートメント帯にインタラクション追加 | ポインタ移動/タップで水彩足跡が残る（#statement-paws・既存 #cat-paw + #watercolor + 4本柱パレット流用）。「遊ぶことで彩る」の実演。最大60個・reduced-motion で無効。**他セクションへ同種の追加はしない**（希少性維持） |
| ヒーローCTA を pill に統一 | .btn-primary-cta / .btn-glass-cta に border-radius 9999px（DESIGN.md「全ボタン pill」の署名に整合） |

## 8. brandkit.html — ブランドガイド（2026-06-16 再生成）

### 役割
`brandkit.html` は **DESIGN.md から派生した、人間が一目で把握するためのブランド見本ページ**。
設計の正本（source of truth）は機械可読の `DESIGN.md` であり、Claude／コードが設計判断で参照するのも DESIGN.md。
brandkit.html は「表示物」であって「正本」ではない。**ブランド定義を変えるときは DESIGN.md を先に直す**（brandkit.html だけ直しても Claude の挙動は変わらず、両者がズレると混乱の元）。

### 使いどころ
- 外部委託先（印刷所・デザイナー・映像編集・イラストレーター）へのブリーフ。URL を渡すだけでトーンが伝わる。
- CEO 自身の視覚的リファレンス（トークン羅列より思い出しやすい）。
- 信用の担保（提携・コラボ時にブランドの一貫性を示す名刺代わり）。
- 将来、人が加わったときのオンボーディング資料。

### 公開状態
`website/` 配下なので push すると GitHub Pages の `/brandkit.html` で**誰でも閲覧可能な準公開状態**（ナビ未リンク・直URL のみ）。社内限定にしたい場合は `website/` 外へ退避する。

### 構成・規約
- 単一シルバー `#B8B4AE` × warm-black `#0A0906` × オフホワイト `#E8E0D0`。フォントは EB Garamond / Syne / Bebas Neue / Noto Sans JP。
- 旧 `brand_assets.html` を統合し削除済み（旧 gold/neon/lavender・Space Grotesk・MUSIC ENTERTAINMENT/VOCALOID は全廃）。
- セクション: Essence / Color / Typography / Logo / Four Domains / Applications / Usage。多色グラデーションのロゴは復活させない。
