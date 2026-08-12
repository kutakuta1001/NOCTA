---
description: "デザイン・ビジュアル制作の進捗（Visual作品数・LP制作・PV状況・次のアクション）を確認したいとき、または /design-status を実行するとき"
---

デザイン・ビジュアル制作の現状を確認してください。

以下のファイルを確認し、状況をまとめてください:

## Step 1: Visual作品数を確認する

`website/visual-data.js` を Read する。
3つの配列（NOCTA_VISUALS_WORKS / NOCTA_VISUALS_ART / NOCTA_VISUALS_MUSIC）のエントリ数をカウントする。
各配列の先頭エントリ（最新作品）の `title` を取得する。

## Step 2: 進行中LPを確認する

`project_NOCTA/drafts/` 内の `design-brief-*.md` ファイルを Glob で探す。
見つかった場合: ファイルを Read し、種別・フェーズ・最終更新日を取得する。
見つからない場合: 「進行中LP なし」とする。

また `website/` 直下のディレクトリ一覧を確認し、`index.html` / `blog/` 以外のサブディレクトリ（例: `the-first-flower/`）をLP一覧として列挙する。

## Step 3: PV進捗を確認する

以下の存在有無を確認する（Read ではなく Glob でOK）:
- `project_NOCTA/drafts/pv_concept.md`
- `project_NOCTA/drafts/pv_storyboard.md`
- `project_NOCTA/outputs/pv/` ディレクトリ

## Step 4: 状況を出力する

以下のフォーマットで表示する:

```
■ Visual作品
  Works: N件   最新: [title]
  Art:   N件   最新: [title]
  Music: N件   最新: [title]
  ※ 追加: /visual-add  プロンプト生成: /visual-prompt [作品名]

■ LP
  公開済み: [LP名1]、[LP名2]…（なければ「なし」）
  制作中:
    [ファイル名] — 種別: 楽曲LP/説明LP、フェーズ: N、最終更新: YYYY-MM-DD
    （なければ「なし」）
  ※ 新規LP: /lp-create [対象名]

■ PV
  コンセプト: あり / なし
  絵コンテ:   あり / なし
  素材出力先: あり / なし（outputs/pv/）
  ※ PVコンセプト生成: /phase3-pv または /pv-create [曲名]

■ 承認待ち
  （承認待ちのデザイン成果物があれば列挙。なければ「なし」）

■ 次のアクション
  1. （優先度高いもの）
  2. （次点）
```

## Gotchas
- `website/visual-data.js` が存在しない場合は「visual-data.js なし」と表示してエラーにしない
- `design-brief-*.md` が複数ある場合はすべて列挙する
- LP公開済みディレクトリは `the-first-flower/` のような楽曲専用フォルダのみカウントする（`blog/` は除外）
- `outputs/pv/` が空でも「あり」と表示してOK（ディレクトリの存在確認のみ）
