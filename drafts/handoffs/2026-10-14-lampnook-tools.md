# 引き継ぎ: Tools に lampnook を追加（確認と公開）

作成: 2026-10-14 / 作成元: ~/goho（lampnook）側の Claude セッション / 対象: ~/NOCTA/project_NOCTA と ~/goho

## 状態

- NOCTA 側（website/）の変更はコミット済み、push はしていない。
  - `ea926ce` feat(website): lampnook の紹介ページと Tools のカード
- lampnook 本体を `https://kutakuta1001.github.io/lampnook/` で動かす準備は、~/goho のブランチ m8 にコミット済み。
  - `eb04410` lampnook を GitHub Pages のサブパス（/lampnook/）で動かせるようにする
  - GitHub のリポジトリはまだ無い。lampnook 本体はまだどこにも公開していない。
- 公開の順番: **先に lampnook 本体を公開し、そのあと NOCTA を push する**。逆にすると、紹介ページの「作者用の入口を開く」が公開までの間 404 になる。

## NOCTA 側の変更ファイル

すべて相対パス。画像は SVG のみで、png/jpg は追加していない。

| ファイル | 内容 |
| --- | --- |
| `website/apps-data.js` | `NOCTA_APPS` の先頭に lampnook を追加（url `./lampnook/index.html`、imgUrl `./lampnook/cover.svg`、badge App、descJa/descEn） |
| `website/lampnook/index.html` | 紹介ページ。次の 5 節: 最初の画面（夜の部屋の絵と作者用の入口）、行ける場所は六つ（開く時間の順）、二十五分のあいだに起きること（1 分 1 マスの帯）、続けた分だけ部屋に残る（絵葉書・本・スタンプ帳）、仕組み |
| `website/lampnook/style.css` | ページ専用の CSS。地の色はアプリの夜の紫 #1c1722、文字 #e8e0d0、墨 #a99d8e。アクセントはランプの琥珀 #e8a94e の 1 色だけ。書体は NOCTA の系（Shippori Mincho 600・EB Garamond・Noto Sans JP、Google Fonts）。開いたときに部屋の絵がランプのともるように 1 回明るくなる（動きを減らす設定では出ない）。常に光るグローは置いていない |
| `website/lampnook/img/*.svg` | 7 枚: room-night（最初の画面）、room-day・cafe・park・camp・engawa・cabin（場所の一覧）。アプリのスクリーンショットを 1 ドット 1 マスの SVG に描き写したもの。合計は gzip で約 225KB。生成スクリプトは ~/goho/scripts/pix2svg.py |
| `website/lampnook/cover.svg` | Tools カード用 16:9（1600x900）。夜の部屋と lampnook の文字 |
| `website/lampnook/icon.svg` | ファビコン（ドットのランプ） |

## 1. NOCTA ディレクトリで確認すること

```
cd ~/NOCTA/project_NOCTA/website
python3 -m http.server 5181 --bind 127.0.0.1
```

1. http://127.0.0.1:5181/index.html#apps で、Tools の先頭に lampnook のカードが出ること。カードを押すとモーダルに cover.svg と説明が出て、「アプリを開く」が `./lampnook/index.html` へ飛ぶこと。
2. http://127.0.0.1:5181/lampnook/index.html を 1440px 幅と 390px 幅で見ること。作成時に両方の幅で確かめていて、横スクロールもコンソールエラーも無かった。
3. 文言の事実確認。開く時間（公園 15・キャンプ場 30・縁側 50・雪の山小屋 80 時間）、残り 10 分と 5 分の音、絵葉書 5 回で 1 枚・12 枚まで、本 10 回で 1 冊・24 冊まで、の 4 点。どれも lampnook の今のブランチ m8 の値。
4. 紹介ページは日本語のみ。NOCTA 本体の i18n（`data-i18n`）には載せていない。英語は descEn だけ。
5. 「作者用の入口を開く ↗」のリンク先が `https://kutakuta1001.github.io/lampnook/` であること（本体を公開するまでは 404）。

## 2. lampnook 本体を公開する（どちらか一方）

### B（推奨）: ビルド結果だけを公開する

ソース・作業メモ（~/goho/drafts）・コミット履歴（コミットに作者のメールアドレスが入っている）を外に出さずに済む。更新のたびに手で作り直す。

```
cd ~/goho
git switch m8                      # 公開する版。M8b を main に統合したら main に替える
npm run build:pages                # dist/ に /lampnook/ 用のビルドができる
cd dist
touch .nojekyll
git init -b gh-pages
git add -A
git -c user.name=kutakuta1001 -c user.email=kutakuta1001@users.noreply.github.com commit -m "deploy lampnook"
gh repo create kutakuta1001/lampnook --public
git remote add origin https://github.com/kutakuta1001/lampnook.git
git push -u origin gh-pages
gh api -X POST repos/kutakuta1001/lampnook/pages -f "source[branch]=gh-pages" -f "source[path]=/"
```

更新するとき: Vite は作り直しのときも `dist/.git` を残す（vite の emptyOutDir は .git を消さない。確認済み）。なので 2 回目からは次の手順だけでよく、force push は要らない。

```
cd ~/goho && npm run build:pages
cd dist && touch .nojekyll && git add -A
git -c user.name=kutakuta1001 -c user.email=kutakuta1001@users.noreply.github.com commit -m "deploy lampnook"
git push
```

`.nojekyll` はビルドのたびに消えるので、毎回作り直す。

### A: ソースごと公開する（GitHub Actions で自動デプロイ）

~/goho に `.github/workflows/pages.yml` を用意してある（main への push で `npm ci` → `npm run build:pages` → Pages へデプロイ）。注意点が 2 つある。

- ソース・drafts（設計書・レビュー・動画・帯の画像）・コミット履歴（作者のメールアドレス入り）がすべて公開される。
- ワークフローは main への push で動くが、Pages 対応は m8 にしかない（M8b は縁側の席と雪の山小屋の夜の机のオーナー判断待ちで、main に未統合）。M8b を main に統合してから push する。

```
cd ~/goho
gh repo create kutakuta1001/lampnook --public --source=. --remote=origin
git push -u origin main
gh api -X POST repos/kutakuta1001/lampnook/pages -f build_type=workflow
```

### 公開後の確認

- https://kutakuta1001.github.io/lampnook/ で入室できること、音が鳴ること、再読み込みしても記録が残ること。
- 一度開いたあと、機内モードでも開けること（PWA のキャッシュ）。

## 3. 記録の引っ越し

記録はブラウザの中にだけあり、サイトのアドレスごとに分かれている。今まで使っていた http://localhost:4180 の記録は、新しいアドレスでは見えない。

1. 4180 の lampnook で「バックアップ」から書き出す。
2. https://kutakuta1001.github.io/lampnook/ で、同じパネルから読み込む。

lampnook は NOCTA と同じ `kutakuta1001.github.io` に乗るが、記録のデータベース名（goho）とキャッシュ名（goho-...）は NOCTA の他のページと重ならない。service worker の範囲は /lampnook/ だけ。

## 4. NOCTA を公開する

本体の公開を確かめてから:

```
cd ~/NOCTA/project_NOCTA
git log --oneline -3          # ea926ce が含まれていること
git push origin main          # GitHub Actions が GitHub Pages にデプロイする
```

デプロイ後、https://kutakuta1001.github.io/NOCTA/#apps と https://kutakuta1001.github.io/NOCTA/lampnook/ を開いて確認する。

## 直したくなったとき

- カードの説明文: `website/apps-data.js` の先頭エントリの `descJa` / `descEn`
- 紹介ページの文章: `website/lampnook/index.html`（素の HTML）
- 絵を撮り直す: lampnook を開いて 1440x900 で画面を撮り（UI を隠す）、`python3 ~/goho/scripts/pix2svg.py <png> <svg> 355 30 1085 765 32` で描き写す。屋外（公園・キャンプ場）は末尾に `opaque` を付ける（空を残す）。1 ドットが 5px であることを前提にしている
- lampnook 本体の運用: ~/goho/README.md と ~/goho/handoff.md

## 追記（2026-10-14 公開済み）

- B で公開した。リポジトリ `kutakuta1001/lampnook`（gh-pages、コミット 1196968、作者は noreply アドレス）。全 37 ファイルが 200、コンソールエラー 0、service worker の範囲は /lampnook/ のみ、オフラインでも開けることを確認。
- NOCTA を push（57e03b2、Deploy success）。本番の紹介ページは 1440px / 390px とも横スクロールなし・エラー 0、Tools の先頭が lampnook。
- 残り: 3 の記録の引っ越し（CEO のブラウザ操作）。
