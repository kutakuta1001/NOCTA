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
3. 各ブランチの `context.md` から「現在のフェーズ」を読み取る
4. 各ブランチの `handoff.md` から最終行（直近の状態）を取得
5. 表形式で出力

**出力例**:
```
┌─────────────┬───────────────┬──────────────────────────────┐
│ 曲名        │ フェーズ      │ 直近の状態                   │
├─────────────┼───────────────┼──────────────────────────────┤
│ ★NuWord     │ フェーズ2-C   │ SVP生成済み。ゲート⑤待ち     │
│  NextSong   │ フェーズ1     │ トレンド分析中               │
└─────────────┴───────────────┴──────────────────────────────┘
★ = 現在作業中
```

**エラー処理**:
- `song/*` ブランチが存在しない場合: 「楽曲プロジェクトが見つかりません。/music-init [曲名] で開始してください」

---

### 2. `/song-switch [曲名]`

**前提**: `song/[曲名]` ブランチが存在すること

**処理フロー**:
1. 未コミットの変更があれば `git stash` して保存
2. `git checkout song/[曲名]` を実行
3. `context.md` と `handoff.md` を読み込む
4. `/music-status` 相当のステータスを表示
5. 「[曲名] の作業を再開します」と案内

**エラー処理**:
- ブランチが存在しない場合: 「song/[曲名] ブランチが見つかりません。曲名を確認してください」
- stash 失敗時: 「未コミットの変更があります。先に git commit または git stash を実行してください」

---

### 3. `/song-finish [曲名]`

**前提**: フェーズ5（`/phase5-golive`）が完了していること

**処理フロー**:
1. `outputs/approved/` フォルダにファイルが存在するか確認
2. `handoff.md` に完了記録を1行追記
   - 例: `NuWord 完成。YouTube公開済み。HP反映待ち。`
3. 完成チェックリストを表示:
   - outputs/approved/ に最終音源があるか
   - outputs/svp/ に最終SVPがあるか
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
1. `git checkout main`
2. `website/works-data.js` の `NOCTA_WORKS` 配列先頭に新エントリを追加:
   ```js
   {
     title: "[曲名]",
     cat: "music",
     youtubeId: "[YouTubeID]",
     thumbClass: "thumb-1",
     badge: "Music",
     badgeColorClass: "bg-brand-primary/20 text-brand-primary",
     descJa: "（CEOが入力）",
     descEn: "（CEOが入力）"
   }
   ```
3. `website/index.html` の Stats Bar「公開楽曲数」の更新箇所を明示してCEOに手動更新を案内
4. `git add website/works-data.js`
5. `git commit -m "feat(website): [曲名] を Works に追加"`
6. `git push origin main`
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
