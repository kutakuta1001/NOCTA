# 引き継ぎ: Tools に Barside を追加（確認と push）

作成: 2026-10-11 / 作成元: ~/english（Barside）側の Claude セッション / 対象: ~/nocta/project_NOCTA

## 状態

website/ 配下の変更はコミット済み。push はしていない（website/CLAUDE.md の規約により CEO の明示的な指示が必要）。

- `2b4fcef` feat(website): Tools に Barside の紹介ページとカードを追加
- `24acb36` feat(website): Barside 紹介ページの作者用入口を公開 URL に差し替え

変更ファイル（すべて相対パス、画像は SVG のみ、png/jpg は追加していない）:

| ファイル | 内容 |
| --- | --- |
| `website/apps-data.js` | `NOCTA_APPS` の先頭に Barside を追加（url `./barside/index.html`、imgUrl `./barside/cover.svg`、badge App、descJa/descEn） |
| `website/barside/index.html` | 紹介ページ。ヒーロー、三つの約束、ある夜の一往復（画面のモック）、仕組み、作者用の入口 |
| `website/barside/style.css` | ページ専用 CSS。NOCTA の地色 #0a0906 / 文字 #e8e0d0 / 墨 #aca89c を使い、題材の色としてランプの琥珀 #e3a44b を 1 色だけ足している。システムフォントのみ、外部リクエストなし |
| `website/barside/cover.svg` | Tools カード用 16:9（1600x900）。4 人の人物とランプ、Barside の文字 |
| `website/barside/icon.svg` | ファビコン（ランプ） |

## Barside とは

夜のバーの常連と英語で話す、作者専用の会話練習アプリ（PWA）。サーバーは作者の Mac で動き、Tailscale Funnel で https://barside.tail12dfa5.ts.net に公開。入口は接続トークンで閉じているので、訪問者がリンクを開いても「接続トークン」画面で止まる（会話はできない）。紹介ページにもその旨を明記している。コードは非公開リポジトリ。

## 確認してほしいこと

1. `website/index.html` をローカルで開き、Tools の先頭に Barside カードが出ること、カードを押すとモーダルに cover.svg と説明が出ること、「アプリを開く」が `./barside/index.html` に飛ぶこと
2. `website/barside/index.html` を 390px 幅と 1200px 幅で見て、横スクロールが出ないこと（作成時に両幅で確認済み）
3. 文言: 紹介ページは日本語のみ。NOCTA 本体の i18n（`data-i18n`）には載せていない。英語版が要るなら descEn 以外は未対応
4. 「作者用の入口 ↗」のリンク先が https://barside.tail12dfa5.ts.net/ であること

## 問題なければ

```
cd ~/nocta/project_NOCTA
git log --oneline -3          # 2b4fcef と 24acb36 が含まれていること
git push origin main          # GitHub Actions が GitHub Pages にデプロイする
```

デプロイ後、https://kutakuta1001.github.io/NOCTA/#apps と https://kutakuta1001.github.io/NOCTA/barside/ を開いて確認する。

## 直したくなったとき

- カードの説明文: `website/apps-data.js` の先頭エントリ `descJa` / `descEn`
- 紹介ページの文章: `website/barside/index.html`（本文は素の HTML）
- 人物の絵は Barside 側（~/english/client/src/components/CharacterAvatar.tsx）の SVG を静的に書き出したもの。絵を変えるなら Barside 側で変えてから書き出し直す
- Barside 本体の運用（常駐・公開・トークン）は ~/english/README.md の「外から使う」と ~/english/handoff.md
