楽曲の完成処理を行ってください。

対象の曲名: $ARGUMENTS（省略時は現在のブランチ名から取得）

以下の手順で実行してください:

1. 現在のブランチが `song/$ARGUMENTS` であることを確認する
   異なる場合は「先に /song-switch $ARGUMENTS を実行してください」と案内してabortする

2. `outputs/approved/go_live_checklist.md` が存在するか確認する
   存在しない場合: 「/phase5-golive を先に実行してください」と案内してabortする
   存在する場合: `⚠️` マークの行数を確認する
   ゼロでない場合: 「⚠️ [N]件の未解決項目があります。/phase5-golive で確認してください」と案内してabortする

3. `handoff.md` に1行追記する:
   例: `$ARGUMENTS 完成。YouTube公開済み。HP反映待ち。`

4. 以下のチェックリストを表示する:

```
■ 完成チェックリスト: $ARGUMENTS

[ ] outputs/approved/ に最終音源があるか
[ ] outputs/svp/ に最終SVPがあるか（アーカイブ用）
[ ] YouTube動画IDが確定しているか

すべて完了したら、YouTube動画IDを教えてください。
/hp-add-work $ARGUMENTS [YouTubeID] でHPに追加します。
```

このコマンドは main へのマージを行いません。ブランチはアーカイブとして残します。
