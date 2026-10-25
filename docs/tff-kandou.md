# TFF「感動したこと」の運用

The First Flower の一言日記（`website/the-first-flower/kandou/`）の書き足し方。

## 置き場所

| もの | 場所 |
|---|---|
| 公開ページ | `website/the-first-flower/kandou/index.html`（Profile 節の自己紹介文の下からリンク） |
| 公開データ | `website/the-first-flower/kandou/kandou-data.js` の `TFF_KANDOU` |
| 花の描き分け | `website/the-first-flower/kandou/flower-kinds.js`（6 種。見本と経緯は `drafts/tff-kandou/`） |
| CEO の入力ページ | https://claude.ai/artifact/6wjeg4tyEcDYtyxnHzRLHH （作者専用。元ファイルは `drafts/tff-kandou/kandou-note.html`） |

入力ページの db は `entries` コレクション。1 件 = `{date, text, blog, status, created, updated}`。
読み書きできるのはアーティファクトの持ち主（CEO）だけ（rules: root read/write owner）。

## 「日記を反映して」と言われたら

1. `ArtifactData` の `list`（collection `entries`）で全件を読む。`status` が `published` 以外のものが対象
   - `pending`: 新しく足す / `edited`: 公開データの同じ `id` を書き換える / `removed`: 公開データから外し、db からも消す
2. `kandou-data.js` の `TFF_KANDOU` を直す。1 件 = `{ id, date, text, blog }`（`id` は db の doc id。`blog` は空なら書かない）
3. 足した・直した・外したものの一覧を CEO に見せる（本文はそのまま見せる）。文面を AI が直さない
4. CEO の OK でコミット。push は CEO が指示したときだけ
5. push して本番を確かめたあと、反映したものの `status` を `published` に、`removed` は delete する（batch・`if_version` 付き）

自動では本番に出さない。必ず 3 の確認を通す。

## 年ごとの花

2026 の桜から一年さかのぼるごとに コスモス → マーガレット → 椿 → ネモフィラ → ひまわり と回す（`kandou-app.js` の `ORDER`）。
特定の年を変えたいときは `kandou-data.js` の `TFF_KANDOU_FLOWERS` に書く（例 `2027: "camellia"`）。
件数がその花の基本の枚数（桜 5・コスモス 8・マーガレット 13・椿 10・ネモフィラ 5・ひまわり 21）を超えたら、花びらの枠が増える。
