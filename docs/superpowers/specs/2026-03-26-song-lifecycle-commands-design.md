# 設計書: 楽曲ライフサイクル管理コマンド
**作成日**: 2026-03-26
**ステータス**: 承認済み

---

## 背景・目的

月1〜2曲の量産体制において、現在制作中の曲と次の曲を並行管理する際に
「どの曲がどのフェーズにいるか」「別の曲に切り替える手間」が課題となる。

既存の `song/[曲名]` ブランチ管理を活かしつつ、4つのコマンドで
「開始 → 制作 → 完成 → HP反映」のライフサイクルをカバーする。

---

## 新規コマンド一覧

| コマンド | 役割 | 使用タイミング |
|---|---|---|
| `/song-list` | 全曲ステータス一覧 | いつでも |
| `/song-switch [曲名]` | 曲のコンテキスト切り替え | 別の曲の作業を始めるとき |
| `/song-finish [曲名]` | 完成処理・アーカイブ | フェーズ5完了後 |
| `/hp-add-work [曲名] [YouTubeID]` | HP Works に新曲追加 | YouTube公開後 |

---

## 既存コマンドとの接続

```
/music-init [曲名]              ← 既存: song/[曲名] ブランチ作成
        ↓
/song-switch [曲名]             ← 新規: そのブランチで作業開始
        ↓
  /phase1-trend
  /phase2-music
  /phase2-svp
  /phase2-demo
  /phase3-pv
  /phase4-release
  /phase5-golive                ← 既存: フェーズ1〜5
        ↓
/song-finish [曲名]             ← 新規: 完成処理
        ↓
/hp-add-work [曲名] [YouTubeID] ← 新規: HP反映
```

---

## 各コマンド詳細仕様

### 1. `/song-list`

**処理フロー**:
1. `git branch` で `song/*` パターンのブランチを一覧取得
2. 現在チェックアウト中のブランチを特定（★マーク）
3. 各ブランチについて `git show song/[曲名]:context.md` で「現在のフェーズ」を取得（ブランチ切り替えなし）
4. 各ブランチについて `git show song/[曲名]:handoff.md` の最終行（直近の状態）を取得
5. 各ブランチの `git log -1 --format="%ar" song/[曲名]` で最終更新日時を取得
6. 表形式で出力

**出力例**:
```
┌─────────────┬───────────────┬──────────────────────────────┬────────────┐
│ 曲名        │ フェーズ      │ 直近の状態                   │ 最終更新   │
├─────────────┼───────────────┼──────────────────────────────┼────────────┤
│ ★NuWord     │ フェーズ2-C   │ SVP生成済み。ゲート⑤待ち     │ 2時間前    │
│  NextSong   │ フェーズ1     │ トレンド分析中               │ 3日前      │
└─────────────┴───────────────┴──────────────────────────────┴────────────┘
★ = 現在作業中
```

**エラー処理**:
- `song/*` ブランチが存在しない場合: 「楽曲プロジェクトが見つかりません。/music-init [曲名] で開始してください」

---

### 2. `/song-switch [曲名]`

**前提**: `song/[曲名]` ブランチが存在すること

**処理フロー**:
1. 未コミットの変更がある場合は `git stash push -u -m "song-switch: [元のブランチ名] [日時]"` で保存
   （`-u` オプションで未追跡ファイルも含める）
   stash成功後「[元のブランチ名]の変更を一時保存しました。`git stash list` で確認できます」と案内
2. `git checkout song/[曲名]` を実行
3. `context.md` と `handoff.md` を読み込む
4. `/music-status` 相当のステータスを表示
5. 「[曲名] の作業を再開します」と案内

**エラー処理**:
- ブランチが存在しない場合: 「song/[曲名] ブランチが見つかりません。曲名を確認してください」
- stash 失敗時: 「変更を保存できませんでした。先に `git status` で状態を確認してください」

---

### 3. `/song-finish [曲名]`

**前提**: フェーズ5（`/phase5-golive`）が完了していること

**処理フロー**:
1. `outputs/approved/go_live_checklist.md` が存在するか確認
   - 存在しない場合: 「`/phase5-golive` を先に実行してください」と案内してabort
   - 存在する場合: `⚠️` マークの行数を確認し、ゼロでなければ「⚠️ [N]件の未解決項目があります。`/phase5-golive` で確認してください」と案内してabort
2. `handoff.md` に完了記録を1行追記
   - 例: `NuWord 完成。YouTube公開済み。HP反映待ち。`
3. 完成チェックリストを表示:
   - outputs/approved/ に最終音源があるか
   - outputs/svp/ に最終SVPがあるか（参照用アーカイブとして保持）
   - YouTube 動画IDが確定しているか
4. YouTube動画IDを入力するよう案内
5. `/hp-add-work [曲名] [YouTubeID]` の実行を促す

**注意**: このコマンドは main へのマージを行わない。ブランチはアーカイブとして残す。

---

### 4. `/hp-add-work [曲名] [YouTubeID]`

**前提**:
- YouTube動画IDが確定していること（例: `dQw4w9WgXcQ`）
- `website/works-data.js` が存在すること

**処理フロー**:
0. YouTubeID のバリデーション: 11文字の英数字・ハイフン・アンダースコアのみ許可。
   不正な場合: 「YouTubeIDの形式が正しくありません（例: dQw4w9WgXcQ）」と案内してabort
1. 未コミットの変更がないことを確認。ある場合: 「先に `song/[曲名]` ブランチで変更をコミットしてください」と案内してabort
2. `git checkout main`
3. `website/works-data.js` の `NOCTA_WORKS` 配列先頭に新エントリを追加:
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
   }
   ```
4. `website/index.html` の Stats Bar「公開楽曲数」の更新箇所を明示してCEOに手動更新を案内
5. 追加内容を表示して「この内容で main にプッシュしてサイトを更新しますか？（yes/no）」と確認
6. CEO が yes と答えた場合のみ:
   `git add website/works-data.js`
   `git commit -m "feat(website): [曲名] を Works に追加"`
   `git push origin main`
7. 「Netlify が自動デプロイを開始します。1〜2分後にサイトを確認してください」と案内

**制約 (R-02準拠)**:
- `outputs/approved/` への書き込みは行わない
- SNS投稿は行わない（R-03）
- descJa / descEn はCEOが入力するまでプレースホルダーのまま

---

## ファイル配置

```
project_NOCTA/
└── claude-config/
    └── commands/
        ├── song-list.md       ← 新規
        ├── song-switch.md     ← 新規
        ├── song-finish.md     ← 新規
        └── hp-add-work.md     ← 新規
```

---

## CLAUDE.md への追記内容

SLASH COMMANDS テーブルに以下を追加:

| コマンド | 動作 |
|---|---|
| `/song-list` | 全曲のフェーズ・ステータスを一覧表示 |
| `/song-switch [曲名]` | 指定した曲のブランチにコンテキスト切り替え |
| `/song-finish [曲名]` | 曲の完成処理・アーカイブ・HP反映への導線 |
| `/hp-add-work [曲名] [YouTubeID]` | works-data.js に新曲追加 + 自動デプロイ |
