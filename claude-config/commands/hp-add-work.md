HP の Works セクションに新しい楽曲を追加してください。

引数: $ARGUMENTS（形式: [曲名] [YouTubeID]）
例: /hp-add-work NuWord dQw4w9WgXcQ

以下の手順で実行してください:

1. 引数を曲名とYouTubeIDに分割する
   引数が2つ未満の場合: 「使い方: /hp-add-work [曲名] [YouTubeID]」と案内してabortする

2. YouTubeIDのバリデーション:
   11文字の英数字・ハイフン・アンダースコアのみ許可
   不正な場合: 「YouTubeIDの形式が正しくありません（例: dQw4w9WgXcQ）」と案内してabortする

3. `git status` で未コミットの変更がないことを確認する
   ある場合: 「先に song/[曲名] ブランチで変更をコミットしてください」と案内してabortする

4. `git checkout main` を実行する

5. `website/works-data.js` の NOCTA_WORKS 配列の先頭に以下のエントリを追加する:
   ```js
   {
     title: "[曲名]",
     cat: "music",
     youtubeId: "[YouTubeID]",
     thumbClass: "thumb-1",  // thumb-1〜thumb-6 から選択可能。後で変更してください
     badge: "Music",
     badgeColorClass: "bg-brand-primary/20 text-brand-primary",
     descJa: "（曲の説明を入力してください）",
     descEn: "（English description here）"
   },
   ```

6. `website/index.html` の Stats Bar「公開楽曲数」の更新案内を表示する:
   「index.html の公開楽曲数の数値を手動で更新してください（現在の値 + 1）。この編集は works-data.js の push 完了後に行い、別途 git add → commit → push してください」

7. 追加内容を表示して確認を求める:
   「以下の内容で main にプッシュしてサイトを更新します。よいですか？（yes/no）」

8. CEO が yes と答えた場合のみ以下を実行する:
   ```bash
   git add website/works-data.js
   git commit -m "feat(website): [曲名] を Works に追加"
   git push origin main
   ```
   「Netlify が自動デプロイを開始します。1〜2分後にサイトを確認してください」と案内する

   no の場合: 「キャンセルしました。works-data.js の変更は保持されています。確認後に git add → commit → push してください」と案内する

注意: descJa / descEn はプレースホルダーのままプッシュします。サイト反映後に works-data.js を直接編集してください。
