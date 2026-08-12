---
description: "蓄積済みデザインパターンから用途に合うものを探して提案するとき（例: カードのホバー演出が欲しい）"
argument-hint: <用途・キーワード>
---

デザインパターンの検索を実行してください。

## Step 1: INDEX 検索

`~/designer/INDEX.md` を Read し、`$ARGUMENTS` の用途にタグ・要約がマッチするパターンを最大 5 件特定する。

- `$ARGUMENTS` が空の場合: INDEX.md の全パターンをタグごとに整理した一覧として提示し、「どの用途のパターンをお探しですか?」と尋ねて終了する（この場合は何も書き込まない）
- 0 件の場合: 「該当パターンがありません。参考記事があれば /design-extract で蓄積してください。」と表示して終了

## Step 2: レシピ提示

マッチした各パターンの `~/designer/patterns/<name>.md` を Read し、以下を提示する:

- 何が良いか / 実装の勘所（コード断片）/ 適用条件・注意
- デモがある場合: `open ~/designer/demos/<name>.html` で確認できることを案内
- 複数マッチ時はどれが今回の用途に合うかの推奨と理由を添える

## Step 3: 実績記録（採用時のみ）

CEO がパターンの採用を明言したら:

1. レシピ frontmatter の `used_in` に `{project: <プロジェクト名>, date: <YYYY-MM-DD>}` を追記する
   - project 名はカレントの作業プロジェクトから判断し、確信がなければ CEO に確認する
2. `used_in` が 2 件以上かつ `status: active` のパターンは `status: candidate` に変更し、
   「このパターンは昇格候補になりました。/design-promote <name> でスキル化できます。」と通知する
3. コミット:

    cd ~/designer && git add -A && git commit -m "used_in: <name> に実績追加"

採用されなかった場合は何も書き込まない。
