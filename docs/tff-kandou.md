# TFF「感動したこと」の運用

The First Flower の一言日記（`website/the-first-flower/kandou/`）の書き足し方。

## 置き場所

| もの | 場所 |
|---|---|
| 公開ページ | `website/the-first-flower/kandou/index.html`（Profile 節の自己紹介文の下からリンク） |
| 公開データ | `website/the-first-flower/kandou/kandou-data.js` の `TFF_KANDOU` |
| 花の描き分け | `website/the-first-flower/kandou/flower-kinds.js`（6 種。見本と経緯は `drafts/tff-kandou/`） |
| CEO の入力ページ | https://claude.ai/artifact/6wjeg4tyEcDYtyxnHzRLHH （作者専用。元ファイルは `drafts/tff-kandou/kandou-note.html`） |

入力ページの db は `entries` コレクション。1 件 = `{date, text, blog, photo, status, created, updated}`。
`photo` は入力ページのアセット id（32 桁。なければ空）。写真は入力ページで長い辺 1600px の JPEG に縮めてから保存している（位置情報などはここで落ちる）。
読み書きできるのはアーティファクトの持ち主（CEO）だけ（rules: root read/write owner）。

## 「日記を反映して」と言われたら

1. `ArtifactData` の `list`（collection `entries`）で全件を読む。`status` が `published` 以外のものが対象
   - `pending`: 新しく足す / `edited`: 公開データの同じ `id` を書き換える / `removed`: 公開データから外し、db からも消す
2. 写真があるものは `Artifact` の `read`（`url` と `path` に photo の id）で取り出し、
   `sips -Z 1200 -s formatOptions 75 <元> --out website/the-first-flower/kandou/img/<doc id>.jpg` で縮める（1 枚 300KB 以下を目安。超えたら formatOptions を下げる）。
   幅と高さは `sips -g pixelWidth -g pixelHeight` で読む
3. `kandou-data.js` の `TFF_KANDOU` を直す。1 件 = `{ id, date, text, blog, photo: { src: "img/<doc id>.jpg", w, h } }`
   （`id` は db の doc id。`blog`・`photo` はなければ書かない）。写真を外した・差し替えたものは古い jpg も消す
4. 足した・直した・外したものの一覧を、写真も含めて CEO に見せる（本文はそのまま見せる）。文面を AI が直さない。
   写真は公開されるので、人の顔が写っていないかを CEO に確かめてもらう
5. CEO の OK でコミット。push は CEO が指示したときだけ
6. push して本番を確かめたあと、反映したものの `status` を `published` に、`removed` は delete する（batch・`if_version` 付き）。
   消した・差し替えたものの古い写真のアセットは `Artifact` の `delete`（`path` にアセット id）で消す

自動では本番に出さない。必ず 3 の確認を通す。

## 花の咲き方

6 件で一輪が満開になる（`kandou-app.js` の `PER_FLOWER`）。年の中で日付順に 6 件ずつ区切り、年はまたがない。
花びらは 6 の倍数に揃えてあり（桜・コスモス・ネモフィラ 6、マーガレット・椿 12、ひまわり 18）、1 件で満開の 1/6 が開く。
各年の一輪目は、2026 の桜から一年さかのぼるごとに コスモス → マーガレット → 椿 → ネモフィラ → ひまわり と回す（`ORDER`）。
二輪目以降は、その年の一輪目からこの順で次の花。一輪目を変えたい年は `kandou-data.js` の `TFF_KANDOU_FLOWERS` に書く（例 `2027: "camellia"`）。
