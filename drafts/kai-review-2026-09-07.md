# Kai（軍師コレクション）公開前レビュー — 2026-09-07

対象: `website/strategy/`（未追跡・13ファイル）、`website/apps-data.js`、`website/hina/index.html`、`drafts/2026-09-07-strategy-collection.md`、`handoff.md`
実装: Codex / レビュー: Claude（Fable 5.1）
検証環境: Chromium 1243（Playwright 1.63.0）・DPR 2・ローカル静的サーバー
Codex 側の表示・操作検証とは独立に実施。commit / push / デプロイは未実施。
証跡（一時ファイル）: `/private/tmp/hina-realism-review/kai/`

---

## 判定

**本番公開して問題ない。** 修正2件（出典リンク切れ1件・320px 幅の表示1件）を反映済み。

| 重要度 | 件数 | 内容 |
|---|---|---|
| Medium（修正済み） | 1 | 出典リンク切れ: 新城市 広報ほのか 2025年8月号 PDF が 404 |
| Low（修正済み） | 1 | 320px 幅で読み方タブ3本目が横スクロール領域に19px隠れる |
| 提案（未変更） | 1 | Apps カードと HiNa 第五部の表示名が「Kai」単独で、他の4部「HiNa Kihi」形式と並びが違う |
| 未確認 | 3 | iPhone Safari 実機、Historic England の1ページ（bot 判定で自動確認不可）、今日の一題の日付境界 |

---

## 修正内容

### 1. `content.js` — nagashinoDebate の URL（Medium）

`https://www.city.shinshiro.lg.jp/shisei/koho-kocho/koho/2025/8.files/03-11.pdf` は実ブラウザ・curl とも 404（新城市の「ページが見つかりません」）。
新城市サイトは月号が更新されると前号を `backnumber/` 配下へ移す構成で、8月号は
`https://www.city.shinshiro.lg.jp/shisei/koho-kocho/koho/backnumber/2025/8.html` に移っていた。
リンク先を `.../backnumber/2025/8.files/03-11.pdf` に修正。

修正後の確認: HTTP 200・`application/pdf`・16,946,177 bytes。pdftotext で本文を抽出し、
「企画展『設楽原決戦 最大の謎 鉄砲三段撃ちはあったのか？』」（長篠城址史跡保存館・問合せ 設楽原歴史資料館）
の記載を確認。引用として成立する。画面側（study の出典・sources.html）は content.js から実行時描画のため再生成不要。
`/strategy/` の3ページと study の出典欄に新 URL が出ることを確認。

### 2. `style.css` — 360px 以下の読み方タブ（Low）

`.modes`（01 布陣を読む／02 思考を拾う／03 仕事に映す）は `overflow-x:auto` のため文書全体は横にはみ出さないが、
320px 幅では scrollWidth 303 / clientWidth 284 で「03 仕事に映す」の右端が 1px 欠け、19px 分が
スクロールしないと見えない状態だった（スクロール可能である手掛かりも無い）。
`@media(max-width:360px){.modes{gap:12px}.modes button{font-size:11px}}` を末尾に追加。

修正後: 320px で scrollWidth 284 = clientWidth 284・3本とも表示。360px も同様。375 / 390 / 1440px は
このメディアクエリの対象外で従来どおり（gap 22px・12px、1440px は gap 30px・14px）。

---

## 実行した確認

### 名称・入口
- 「Kai」が `config.js`・3 HTML の title／ブランド・HiNa 第五部・Apps カードで一致。`sync-brand.mjs` を実行しても差分ゼロ（同期済み・冪等）。
- 仮称の残存なし（`provisional:false`。「仮」のヒットは本文の「仮想の状況」「仮説」のみ）。`hina/index.html` に「三部作」「四つ」の残りなし。meta description は「五つの蒐集」。
- 導線: NOCTA トップ Apps カード（先頭・`./strategy/index.html`・cover.svg 読込OK）→ `/strategy/`。HiNa 05 行（`Kai「思考」`・`../strategy/`・下線は05のみ）→ `/strategy/`。棚のカード → `study.html?case=…&mode=map&step=0&think=0`。「← 思考の棚へ」→ `index.html#shelf`。ヘッダー「出典の棚」→ sources.html、「Collection ↗」→ `../hina/`。

### GitHub Pages 配下での読込
- 参照はすべて相対パス（`./`・`../`）。`/` 始まりの href/src/url なし。HTML から参照する7ファイル全て存在。
- 外部通信: `/strategy/`・study・sources の3ページで**外部リクエスト0件**（フォント・CDN・画像なし）。外部へ出るのは利用者がクリックする出典リンクのみで、全件 `target="_blank" rel="noopener noreferrer"`。

### データ整合（node で全件走査）
- 18題・ID重複なし。bridges 18件・欠落/余剰なし。各題 steps 4段階、必須14項目、quote／relatedQuote／sources の参照切れ0。引用6件・出典21件、未使用0。
- 図: 18題 × 4段階 = 72図すべて `<svg>` を生成。棚に18図を並べても marker／pattern の id 衝突なし（連番）。同一題の別段階でも id 非共有（拡大ダイアログと本図の同時表示で衝突しない）。
- 分類: theory 4／history 14。時代5種、テーマ18種（全題で異なる）。
- 構文: 7ファイル `node --check` 合格。

### 史実・帰属・出典
- 出典21件のうち17件は自動取得で 200。NHHC（ミッドウェー）は headless UA を弾くが通常 UA で 200・title「The Role of COMINT in the Battle of Midway」を確認。Historic England の mulberry は通常 UA で 200・title 一致。
- 引用原文の照合: Eisenhower（presidency.ucsb.edu）「Plans are worthless, but planning is everything.」、Drucker Institute「doing the right things well」、Churchill（Hansard 1940-06-04）「Wars are not won by evacuations.」、Adam Smith（第1編第3章の章題）はいずれも出典ページ本文と一致。孫子2件は Giles 英訳の該当節（III.2／VI.32）と一致（Gutenberg 側は引用符の表記差のみ）。
- 帰属の書き方: Eisenhower は「演説で紹介」（本人の創作と断定しない）、Drucker は「研究機関の定義」、Adam Smith は「章題」、孫子は「著者として伝承」。人物への誤帰属なし。
- 史実の記述を一通り読んだ範囲で誤りなし（高松城1582・清水宗治／ソンム準備砲撃 1916-06-24 から7日／カンブレー 1917-11-20／ダイナモ作戦・ラムゼイ／マルベリーA の嵐による放棄／赤壁208・周瑜と程普／官渡200・許攸と荀攸・賈詡／長篠1575・奥平貞昌／小田原1590・総構／第一次マルヌの第1・第2軍の間隙／ダウディング・システム1940）。
- 解釈・比喩の分離: 概念図4題は「実在の戦いではない」を図内と本文の両方に表示。全題に「わからないこと・復元の限界」欄。「問い」「拾った思考」「仕事への応用」は「本作の編集」と明記。三段撃ち・東南の風・小田原評定は「確定した史実としない」と明記。

### 操作（PC 1440px）
- 棚: 18枚。検索「孫子」4／「レイトン」1／半角カナ「ｼﾞｮｳﾎｳ」0（NFKC 正規化はカナ→カナのみで、想定どおり）。時代「戦国日本」3／テーマ「情報」1。栞のみ（0件）で空表示と aria-pressed。「条件を戻す」で18。
- study の URL: 無指定 → 今日の一題（JST）・mode=map・step=0・think=0 を replaceState。`?case=zzz&mode=foo&step=9&think=-1` → すべて既定値へ。
- 布陣: 次へ／前へ／段階ボタン、step=3 で「五つの段階で、思考を拾う →」が出現、次へは disabled。
- 思考を拾う: 5段階すべて描画（場面の再掲／条件・選択・展開の3項／対応表2列＋拾った考え／問い2つ＋自分への一問／引用＋出典リンク）。aria-current 追従。段階切替後に見出し `#reflection-title` へフォーカス移動。
- 仕事に映す: 対応表3列・3行（garden）、before/after、小さく試す、限界（details）、関連する言葉（details）。`#work-title` へフォーカス。
- 「布陣の『展開』に戻る」→ mode=map・step=bridges.mapStep。ブラウザの戻る2回で work → thought(think=4) を復元。
- 別の一題: 10回連続で題が変わり、step=0・think=0 にリセット、mode は維持。
- 栞・メモ: 栞ON→再読込で復元・ボタン文言「栞を外す」。メモ `試験メモ <&> "引用"` → 入力ごとに保存・再読込で復元・「このブラウザから復元しました」。保存キー `nocta:strategy:v1` の JSON 形状 `{favorites,notes}` を確認。**既存キー `hina:kihi:favorites:v1` は無変更**（他コレクションのデータに触れない）。
- 書き出し: TXT（`nocta-thought-notes.txt`・メモ本文・題名・出典URLを含む）。PNG（`nocta-midway-map.png`・1200×1500）。**18題 × 2モード = 36枚すべて生成成功**（`card overflow` なし）。
- 保存不能時: `setItem` を例外にした状態でメモ入力 → 警告表示・「未保存・この画面内のみ保持」・入力は保持・TXT 書き出し可・栞も画面内で動作。
- 拡大: ダイアログ open、図と説明文、フォーカスはダイアログ内、Escape で閉じて `#zoom-map` へ復帰。思考モードの「図を大きく見る」も元の布陣段階の図を表示。
- キーボード: `#next-step` に Enter で段階進行、最終段階では該当の段階ボタンへフォーカス移動。
- sources.html: 出典21件・引用6件、横はみ出し0。

### モバイル（390 / 320px・タッチ）
- 棚・study（map／thought／work）・sources で文書の横はみ出し0。図の右端検出はSVG viewBox 外の装飾パス（クリップされ表示に影響なし）。
- タップで段階切替、拡大ダイアログの開閉、ダイアログ内は横スクロール可（`overflow-x:auto`）。
- 320px の読み方タブは修正後に3本表示。

### 既存への影響
- `/hina/` は現行版・HEAD 版ともコンソール／ページエラー0（同条件で比較）。NOCTA トップも0。
- 他コレクションの localStorage キーに変更なし。`/strategy/` は独立 CSS／JS で共有ファイルを読まない。

---

## 未確認（実行できなかったもの）

1. **iPhone Safari 実機**: PNG／TXT の `a.download` の挙動（Safari では新規タブ表示や共有シートになり得る）、`<dialog>` と `showModal` の表示、フォント（Yu Mincho／Hiragino 指定・iOS では Hiragino Mincho）。
2. **Historic England の dowding ページ**: Cloudflare の bot 判定で headless からは 403「Just a moment...」のまま。同ドメインの mulberry ページは通常 UA で 200 なので実ブラウザでは開く見込みだが、リンク先の存在自体は手動クリックで確認が必要。
3. **今日の一題の日付境界**: JST の日付文字列ハッシュで選ぶ実装は読んだが、境界時刻の実測はしていない。

---

## 提案（今回は変更していない）

- **表示名の並び**: Apps カードは「HiNa Kihi／HiNa Hare／…」の中で「Kai」だけ接頭辞がなく、HiNa ページでも 01〜04 が「HiNa 〇〇」、05 だけ「Kai」。Kai を HiNa の第五部として並べるなら「HiNa Kai」、独立コレクション（YORI と同格）として扱うなら HiNa の番号から外して TOOLS ピルに「Kai コレクション →」を置く、のどちらかに揃えると迷いが消える。正式名称「Kai」自体の判断には触れない。
- `sync-brand.mjs` と `config.js` は Pages に配信されるが機密なし。配信から外したい場合は `deploy-pages.yml` の rm リストへ追加。
- 保存データの読込は既知の題IDだけを残す実装のため、将来 題IDを改名すると当該メモが静かに消える。改名時は移行処理を添える。

---

## 証跡

`/private/tmp/hina-realism-review/kai/`（一時ファイル）: `result.json`（全項目の実測値）、`v_kai.mjs`（主検証）、`v_kai2.mjs`（hina 比較・外部通信・320px・出典到達）、`v_kai3.mjs`（修正後の幅別確認）、スクリーンショット `index-pc.png` `study-map-pc.png` `study-thought-pc.png` `study-work-pc.png` `dialog-pc.png` `m390-index.png` `m390-thought.png` `m320-map.png` `m320-modes-after.png` `hina-collection.png` `hp-card.png` `sources-pc.png`。
