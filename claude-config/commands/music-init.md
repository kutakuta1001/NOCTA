新しい音楽プロジェクトを初期化してください。

以下のフォルダ構造を現在のディレクトリに作成し、
CLAUDE.mdをルートにコピーしてください:

プロジェクト名: $ARGUMENTS

/project_$ARGUMENTS/
  CLAUDE.md
  context.md（以下のテンプレートで作成）
  handoff.md（空ファイルで作成）
  /drafts/
  /outputs/midi/
  /outputs/svp/
  /outputs/prompts/
  /outputs/approved/

context.mdのテンプレート:
---
# プロジェクト情報
- 曲名（仮）: $ARGUMENTS
- ジャンル:
- ターゲット:
- 世界観メモ:
- リリース希望日:
- 使用するSynthVキャラクター:
- 参考アーティスト:
- 禁止ワード・避けたい要素:
---

作成完了後、以下のGitコマンドを実行してください:

git checkout -b song/$ARGUMENTS

これにより曲ごとに独立したブランチで作業できます。
複数曲を並行して進める場合も混在しません。

完了後「song/$ARGUMENTS ブランチで作業を開始します」と案内してください。
