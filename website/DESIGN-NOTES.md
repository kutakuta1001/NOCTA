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
