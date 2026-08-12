---
description: "使用実績が付いたデザインパターンをスキル化してグローバル昇格するとき"
argument-hint: <パターン name（patterns/ のファイル名）>
---

デザインパターンのグローバル昇格を実行してください。

## Step 1: 条件チェック

`~/designer/patterns/$ARGUMENTS.md` を Read する（存在しなければ INDEX.md から近い名前を提示して終了）。
`$ARGUMENTS` が空の場合は INDEX.md の candidate / 実績ありパターンを一覧提示して終了する

- 昇格条件: `used_in` が 2 件以上、または CEO の明示指名
- 条件を満たさない場合は現在の used_in 件数を表示し、CEO の判断を仰ぐ（指名なら続行）

## Step 2: 昇格先の提案

以下のどちらかを推奨理由つきで提案し、CEO の選択を待つ:

- (a) frontend-design 補助: `~/.claude/references/design-graduated.md` への追記
  - UI 生成時に自動で効かせたい知見向け（デフォルト推奨）
  - ファイルが存在しない場合は次の見出しで新規作成する:
    `# 卒業済みデザインパターン（design-graduated）` + 「frontend-design 適用時にこのファイルの知見を反映する」の説明 1 行
  - 追記単位: `## <name> — <title>` 見出し + 適用条件 + 核心コード断片（30 行以内/件）
- (b) 独立スキル化: `~/.claude/commands/design-<name>.md` を新規作成
  - 明示的に呼び出す手順型の知見向け（多段階の生成手順を持つものなど）
  - スキルファイルは 500 行以内・frontmatter に description 必須・絵文字なし

## Step 3: 昇格物の起案

選ばれた形式で昇格物を起案する。レシピとデモの内容を「いつ適用するか」「どう実装するか」の指示文に書き直す。レシピへの参照リンク（~/designer/patterns/<name>.md）を必ず残す。

## Step 4: Codex 厳格レビュー

`~/.claude/commands/references/design-codex-review.md` を Read し、「厳格批評テンプレート」（観点 6 つ）でプロンプトを組み立てて実行する:

    cd ~/designer && ~/.claude/scripts/codex-review.sh custom "<プロンプト + 起案した昇格物の全文>"

- 終了コード 75 / CODEX_AUTH_FAILED: 勝手に従量課金に切り替えず CEO に確認する
- Critical と Warning を反映してから配置する（昇格はグローバル影響のため Warning も原則反映）

## Step 5: 配置と状態更新

1. 昇格物をグローバルに配置する（(a) 追記 または (b) 新規作成）（(b) の場合、配置先ファイルが既に存在するときは上書きせず、CEO に別名または統合方針を確認する）
2. レシピの `status:` を `graduated` に更新する
3. `~/designer/INDEX.md` の該当行の末尾に ` (graduated)` を付ける
4. コミット:

    cd ~/designer && git add -A && git commit -m "promote: <name> をグローバル昇格"

5. (a) で design-graduated.md を初めて作成した場合: グローバル CLAUDE.md の
   「フロントエンド作成（frontend-design）」節に design-graduated.md への参照が
   あるか確認し、なければ追記案を CEO に提示する（グローバル CLAUDE.md は勝手に編集しない）
