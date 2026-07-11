# HiNa コンセプトページ＋誕生HiNa Implementation Plan

> REQUIRED SUB-SKILL: superpowers:subagent-driven-development。実装SA=Sonnet、レビュー=Codex（ブランチ差分2周）。frontend-design 指針適用済み。

**Goal:** NuWord同様の「HiNaコレクション」コンセプトページ(website/hina/)を新設し、3部作(Gyu/Ichi/Hare)を一つの静かな図鑑として提示。ページ内に戦略H1「誕生HiNa=12ヶ月の贈り物棚」の対話セクションを内包（月→誕生花+誕生石+HiNa誕生色+銀猫の祝福1文の1枚カード・PNG保存・?m=で直接その月・Open in HiNa）。

**Architecture:** 静的HTML+Tailwind CDN+Vanilla JS。NOCTA HP デザイン準拠。website/hina/index.html（ページ）＋ hina-birth-data.js（12ヶ月データ）＋ birth-hina.js（贈り物棚・カード・PNG・ルーティング）。

**Tech Stack:** Tailwind CSS CDN・Canvas 2D(PNG)・Playwright。ビルドなし・相対パス。

## Global Constraints（NOCTA準拠）
- website配下のみ。`git add` 明示（`-A`/`.`禁止）。実画像は追加しない。
- コミット trailer: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`。
- デザイントークン（メインHP準拠）: 背景 #0A0906(warm-black)・#0F0D0A(bg2)・シルバー #B8B4AE・オフホワイト #E8E0D0(text/highlight)・サブ #9A8A7A。**gold/neon/紫は使わない**（確定パレット・全てシルバーに寄せる）。銀のメタリックグラデ見出し: `linear-gradient(#F2EEE4 0%,#C7C3BC 26%,#8E8A83 56%,#45413B 82%,#1C1A16 100%)` を background-clip:text で。
- フォント: EB Garamond(serif editorial)・Syne(heading)・Bebas Neue(display/番号)・Noto Sans JP(本文)・Shippori Mincho 600(和文見出し)。Google Fonts CDN（メインHPと同じ family 指定）。
- 禁止（Codex/frontend-design）: マーケ臭・「〜とは」長説明・機能比較カード・CTA過多・SNS共有ボタン前面・新機能発表臭・銀猫の喋りすぎ・紫グラデ/Inter等のAIスロップ。静けさ最優先・実物を先に・言葉は短く・保存は静かに1つ。
- reduce-motion 尊重（順次フェードは prefers-reduced-motion で即表示）。相対パス（`./gems/` 等）。
- Playwright: website配信+絶対URL（既存 verify-*.js 流用）。node実行はリポジトリ内。

## 承認済みコンテンツ（そのまま使う・叩き台は後でCEO選択）

### ヒーロー
- ワードマーク: `HiNa`（銀メタリックグラデ・大）
- タグライン: `眺めることも、あそび。`
- サブ: `銀猫が見つけた、宝石と花と色の静かな図鑑。`

### 序（銀猫・2行まで）
`銀猫は、美しいものを集めて、静かに眺める。`
`ときどき手を伸ばすと、それはあそびになる。`

### 三部作（各章: Bebas番号 / 名 / 一行 / 眺める×作る / ひらく→）
- 第一部 `HiNa Gyu`「宝石」: `世界の宝石を、手のひらで光にかざす。` 眺める=石言葉・誕生石の図鑑 / 作る=かざす(光にきらめく) / `ひらく →` `./gems/`
- 第二部 `HiNa Ichi`「花」: `季節の花を、なぞって咲かせる。` 眺める=花言葉・誕生花の図鑑 / 作る=咲かせる(庭が育つ) / `./flora/`
- 第三部 `HiNa Hare`「色」: `日本の伝統色に、筆で遊ぶ。` 眺める=色の物語・かさねの図鑑 / 作る=筆あそび(選んだ色のインク) / `./iro/`

### 共通の背骨（1〜2行）
`どの図鑑にも、今日の一つと、あなたの誕生の一つがある。`
`気に入ったものは、一枚の絵として持ち帰れる。`

### 誕生HiNa
- eyebrow `誕生HiNa` / 見出し `12ヶ月の、贈り物棚。` / 一行 `生まれた月をえらぶと、花と石と色が、一枚のカードになる。`

### 12ヶ月データ（誕生花・誕生石=既存データ / HiNa誕生色=叩き台 / 祝福文=叩き台。3枚パイロット=1/5/10月）
| 月 | 誕生花(色) | 誕生石(色) | HiNa誕生色 | 祝福文(叩き台) |
|---|---|---|---|---|
| 1 | 水仙 #F2C14E | ガーネット #7B1113 | 紅 #D7003A | 冬を照らす小さな灯が、あなたのそばにありますように。 |
| 2 | 梅 #D96BA0 | アメジスト #9966CC | 梅鼠 #C099A0 | まだ寒い日にひらく梅のように、心にひとつ、ほころびを。 |
| 3 | チューリップ #E63A2E | アクアマリン #9FD8DE | 桜色 #FEF4F4 | うすももいろの風が、あなたの新しい季節を運びますように。 |
| 4 | 桜 #F7C6D4 | ダイヤモンド #C7D2DE | 若草色 #C3D825 | 芽ぶく色のなかで、あなたのはじまりがやわらかくありますように。 |
| 5 | 藤 #8172B8 | エメラルド #0F5C3D | 藤色 #BBA1CB | 風にゆれる藤の色が、あなたの五月をやわらかく包みますように。 |
| 6 | 紫陽花 #5F82BD | パール #F2ECE0 | 露草色 #38A1DB | 雨の日の青がしずかに澄んで、あなたの時間を潤しますように。 |
| 7 | 蓮 #E8A0BF | ルビー #9B111E | 浅葱色 #00A3AF | 水の上にひらく花のように、涼しい静けさがそばにありますように。 |
| 8 | ひまわり #F5C518 | ペリドット #A6BE3F | 青竹色 #7EBEAB | 陽のなかの緑のように、あなたの夏がまっすぐに伸びますように。 |
| 9 | 桔梗 #5B6FB0 | サファイア #0F52BA | 竜胆色 #9079AD | 深まる青のなかで、あなたの想いが澄んでゆきますように。 |
| 10 | 金木犀 #F08A24 | オパール #C9E4E0 | 柿色 #ED6D3D | 金木犀の香りのように、日々にそっと灯がともりますように。 |
| 11 | 菊 #D4A02C | トパーズ #6BB8E0 | 琥珀色 #BF783A | 実りの色を集めて、あなたの一年が静かに満ちますように。 |
| 12 | シクラメン #C6407A | ラピスラズリ #26619C | 鉄紺 #17184B | 夜のいちばん深い青のなかに、小さなあかりがともりますように。 |
（Open in HiNa: 各カードから ./flora/ ./gems/ ./iro/ へ静かに1つずつ or まとめて。）

---

### Task 1: HiNa コンセプトページの器（website/hina/index.html）

**Files:** Create `website/hina/index.html`／Test `<scratchpad>/verify-hina.js`

- [ ] Step1 失敗テスト verify-hina.js（既存 verify-iro/zukan 流用のPlaywright配信）: (a)ページが200で開きコンソールエラー0 (b)ヒーローに「HiNa」「眺めることも、あそび。」がある (c)3部作の3リンク(./gems/ ./flora/ ./iro/)が存在 (d)#birth セクションのアンカーが存在 (e)モバイル幅(390)で横スクロールが出ない。Run→FAIL(ページ無し)。
- [ ] Step2 実装: 上記「承認済みコンテンツ」のヒーロー/序/三部作/背骨/フッターを、NOCTAトークン・フォント・銀メタリックグラデ見出し・肉球モチーフ(任意)・順次フェード(reduce尊重)で。#birth セクションは見出し＋空コンテナ(Task2が埋める)。ナビ「← NOCTA」で ../index.html へ。frontend-design準拠(余白大・editorial・静か)。
- [ ] Step3 node/構文確認は不要(HTML)。Playwright verify-hina PASS。スクショで editorial な静けさ・三部作の格・トークン一致を目視。
- [ ] Step4 Commit `git add website/hina/index.html` → `feat(hina): HiNaコレクションのコンセプトページ(器・三部作・銀猫の序)`

### Task 2: 誕生HiNa=12ヶ月の贈り物棚（データ＋UI＋PNG＋ルーティング）

**Files:** Create `website/hina/hina-birth-data.js`・`website/hina/birth-hina.js`／Modify `website/hina/index.html`(スクリプト読み込み・#birth)／Test `<scratchpad>/verify-hina-birth.js`

- [ ] Step1 失敗テスト verify-hina-birth.js: (a)#birth に12ヶ月の棚(1〜12月のボタン/カード)がある (b)`?m=5` で開くと5月カードに「藤」「エメラルド」「藤色」と5月の祝福文が出る (c)月を選ぶとその月のカードが表示 (d)「保存」でPNG(dataURL)が生成される(toDataURL非空・暖色の贈り物カード) (e)「Open in HiNa」で ./flora/ ./gems/ ./iro/ へのリンクがある (f)コンソールエラー0・モバイルで崩れない。Run→FAIL。
- [ ] Step2 データ hina-birth-data.js: 上表の12ヶ月 `{ month, flower:{name,hex}, stone:{name,hex}, hinaColor:{name,hex}, blessing }`。3枚(1/5/10)は仕上げ基準。他9枚も表の叩き台で埋める(CEOが後で選択)。
- [ ] Step3 UI birth-hina.js: 12ヶ月の「贈り物棚」(1〜12を静かに横並び/グリッド)。月選択→1枚カード=誕生花+誕生石+HiNa誕生色の帯+銀猫の祝福1文。**カードは暖色の贈り物トーン**(生成り/和紙寄り#F0EAD8系・ダークページ上でカードだけ明るく=保存に耐える)。静かに1つ「この月を保存」でCanvasにカードを描きPNG(dataURL→a.download)。`?m=1〜12`で該当月に直接(上部の月ボタンで移動・トップを挟まない)。「Open in HiNa」=各アプリへ控えめに。SNSボタンは出さない。reduce尊重。スマホでPNGの比率/余白/文字が崩れない。
- [ ] Step4 index.html: `<script src="./hina-birth-data.js"></script><script src="./birth-hina.js"></script>` を追加、#birth を初期化。
- [ ] Step5 verify-hina-birth PASS＋回帰 verify-hina PASS。**スクショ: 3枚(1/5/10)のカードとPNGが「人に渡せる贈り物」に見えるか目視**(寄せ集めカードでないか・スマホ保存の見栄え)。DoD: ?m=1〜12直接開ける/各月に花・石・HiNa誕生色・銀猫1文/スマホPNG保存/PNGがSNS比率余白文字に耐える/Open in HiNa静かに1つ。
- [ ] Step6 Commit `git add website/hina/hina-birth-data.js website/hina/birth-hina.js website/hina/index.html` → `feat(hina): 誕生HiNa=12ヶ月の贈り物棚(花+石+HiNa誕生色+祝福・PNG保存・?m=ルーティング)`

### Task 3: HP連携・総合検証・Codex2周・公開・docs

- [ ] Step1 メインHP(website/index.html)から HiNaコンセプトページへの導線を追加（NuWord「Concept Page →」に倣い、Apps付近に「HiNa Collection →」静かなリンクで `./hina/`）。apps-dataは触らず最小のリンク追加。
- [ ] Step2 全検証: verify-hina・verify-hina-birth 緑＋既存 iro/fude/zukan/flora等が壊れていないこと（同一 zukan-core/相対パスに影響が無いか。hina/は独立なので原則無影響）。node --check（JSファイル）。
- [ ] Step3 スクショ目視（コンセプトページ全体・3部作の格・誕生HiNaの3カード・モバイル）。
- [ ] Step4 **Codexレビュー2周**（`codex-review.sh custom` でブランチ差分・website/hina/中心）。重点: (a)相対パスがGitHub Pagesで正しい(./gems/等) (b)?m=ルーティングの安全性(不正mのフォールバック) (c)PNG生成のCanvasリーク/スマホ描画 (d)トークン/フォント逸脱・禁止パターン(マーケ臭/CTA過多)がないか (e)アクセシビリティ(alt/フォーカス/コントラスト・色上テキストの可読) (f)コンソールエラー・reduce網羅。Critical必修正・2周目Critical 0。
- [ ] Step5 main へ website/hina/ 一式＋website/index.html(導線)＋docs取込・混入ゼロ・push。デプロイ監視・失敗時rerun・`kutakuta1001.github.io/NOCTA/hina/` と `?m=5` ライブ確認。
- [ ] Step6 handoff 1行・DESIGN-NOTES追記(HiNaコンセプトページ節)・drafts/roadmap.md に H1 着手を反映(任意)・G-06デブリーフ。CEOへ3枚パイロットの質・誕生色/祝福文の選択を提示。

---

## Self-Review
Spec coverage: コンセプトページ(器・三部作・哲学先行ヒーロー)→T1 / 誕生HiNa(棚・カード・PNG・?m=・Open in HiNa・3枚パイロット)→T2 / HP連携・検証・公開→T3。CEO承認(哲学先行・ページ全体+3ヶ月先行)を反映。
Placeholder scan: 全コピー・12ヶ月データ・3パイロット・トークン/フォント/グラデ具体値あり。誕生色/祝福は叩き台=CEO選択と明記。
Type consistency: hina-birth-data(月→flower/stone/hinaColor/blessing)→birth-hina(棚/カード/PNG/?m=)→index.html。相対パスで各アプリへ。NOCTAトークン統一。
リスク: 寄せ集めカード回避(暖色贈り物トーン・スクショゲート)/相対パス(GitHub Pages)/PNGスマホ見栄え/静けさ(禁止パターン)/Codex 2周。
