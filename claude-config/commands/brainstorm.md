---
description: "新しい楽曲フェーズを開始する前、各フェーズの方向性をCEOと合意したいとき、または /brainstorm を実行するとき"
---

brainstorm エージェントを起動してください。

現在のフェーズ: $ARGUMENTS

context.md と handoff.md を読み込み、
該当フェーズの質問リストをCEOに提示してください。
全回答を受け取ってから drafts/brainstorm_$ARGUMENTS.md
に合意内容をまとめ、最終確認を取ってください。

## Gotchas
- $ARGUMENTS が空でも起動してよい（フェーズ未指定の場合は context.md から現在のフェーズを判断する）
- CEOの明示的なGoサインなしにファイル生成を開始しない（R-13）
- 合意内容をまとめたファイルへのCEO最終確認を省略しない
