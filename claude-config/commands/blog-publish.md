---
description: "drafts/blog_draft.txt にブログ記事の下書きが書けたとき、または /blog-publish を実行するとき"
---

`drafts/blog_draft.txt` の内容をブログ記事としてHPに投稿してください。

以下の手順で実行してください:

## Step 1: 下書きを読み込む

`drafts/blog_draft.txt` を Read ツールで読み込む。
ファイルが空または存在しない場合は「drafts/blog_draft.txt に文章を書いてから実行してください」と表示して終了する。

## Step 2: タイトルを確認する

「記事のタイトルを入力してください:」と表示してCEOの入力を待つ。

## Step 3: カテゴリを確認する

「カテゴリを選択してください: music / essay / book」と表示してCEOの入力を待つ。

## Step 4: 本文をHTMLに整形する

以下のルールで平文テキストを HTML に整形する:
- すべての段落を `<p>` タグで囲む
- 話題が変わる箇所の前に `<h2>` 見出しを挿入（全体で2〜4個）
- 固有名詞・重要な概念・数値に `<strong>` を付与（1段落1〜2個まで）
- `<em>` は使わない
- excerpt を冒頭から最初の句点「。」まで抽出（なければ最初の150文字）
- title・date・excerpt はHTMLエスケープする（`<` → `&lt;`、`>` → `&gt;`、`&` → `&amp;`、`"` → `&quot;`）

## Step 5: slug を生成する

タイトルから slug を生成する:
- 英語・ローマ字に変換
- スペース・記号をハイフンに変換
- 小文字に統一、英数字とハイフンのみ
- 最大50文字

## Step 6: プレビューを表示してCEOに確認する

以下の形式でプレビューを表示する:

```
--- プレビュー ---
タイトル: [title]
slug:     [slug]
カテゴリ: [cat]
日付:     [今日の日付 YYYY-MM-DD]
excerpt:  [excerpt]

本文HTML:
[contentHtml の最初の300文字]...
-----------------
```

「この内容で投稿しますか？（ok / 修正点を入力）」と表示してCEOの確認を待つ。
修正点が入力された場合は Step 4 に戻って再整形する。

## Step 7: blog-data.js を更新する

`website/blog-data.js` を Read して `NOCTA_BLOG` 配列を確認する。
配列の**先頭**に以下のオブジェクトを追加する:

```js
  {
    slug: "[slug]",
    title: "[title]",
    cat: "[cat]",
    date: "[今日の日付 YYYY-MM-DD]",
    excerpt: "[excerpt]",
    contentHtml: "[contentHtml]"
  },
```

## Step 8: 追加内容を検証してから git commit する

`website/blog-data.js` を再度 Read して先頭エントリを確認する:
- `slug` が Step 5 で生成した値と一致すること
- `title` が Step 2 で入力した値と一致すること
- `date` が今日の日付であること
- `contentHtml` が空でないこと

不一致・空欄があれば Step 7 に戻り修正する。検証OKの場合のみ以下を実行する:

```bash
git add website/blog-data.js
git commit -m "feat(blog): [タイトル] を追加"
```

IMPORTANT: コミットメッセージに「Co-Authored-By:」を含めないこと（Netlify 無料プランの制限）。

## Step 9: draft ファイルを空にしてコミットする

コミット成功を確認してから実行する:
1. `drafts/blog_draft.txt` を空にする（Write ツールで空文字列を書き込む）
2. 続けてコミット:

```bash
git add drafts/blog_draft.txt
git commit -m "chore(blog): clear blog_draft.txt after publish"
```

コミット（Step 8）が失敗した場合はドラフトを消さず「git commit に失敗しました。手動で確認してください。」と表示して終了する。

## Step 10: 完了を伝える

「投稿完了しました。Netlify に手動デプロイしてください。」と表示する。

## Gotchas
- blog_draft.txt が空または存在しない場合は Step 1 で終了する（ファイル確認を省略しない）
- コミットメッセージに「Co-Authored-By:」を含めない（Netlify 無料プランの制限）
- Step 8（git commit）が失敗した場合は draft を空にせず終了する（Step 9 に進まない）
- `git add` は `website/blog-data.js` のみ（`git add .` で他ファイルを巻き込まない）
