# 楽曲ライフサイクル管理コマンド 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/song-list` `/song-switch` `/song-finish` `/hp-add-work` の4コマンドを実装し、月1〜2曲の量産体制における曲間コンテキスト切り替えを1コマンドで完結させる。

**Architecture:** 既存の `claude-config/commands/` ディレクトリに4つのMarkdownファイルを追加。各ファイルはClaude Codeのスラッシュコマンドとして機能し、git操作・ファイル読み書きをガイドするプロンプト文書。CLAUDE.mdのSLASH COMMANDSテーブルに4コマンドを追記して完成。

**Tech Stack:** Markdown（スラッシュコマンド定義）、Bash（git操作）、JavaScript（works-data.js編集）

**Spec:** `docs/superpowers/specs/2026-03-26-song-lifecycle-commands-design.md`

---

## ファイル構成

```
claude-config/commands/
├── song-list.md       ← 新規作成
├── song-switch.md     ← 新規作成
├── song-finish.md     ← 新規作成
└── hp-add-work.md     ← 新規作成

CLAUDE.md              ← SLASH COMMANDSテーブルに4行追記
```

---

## Task 1: `/song-list` コマンドを作成する

**Files:**
- Create: `claude-config/commands/song-list.md`

- [ ] **Step 1: コマンドファイルを作成する**

`claude-config/commands/song-list.md` に以下の内容を書く:

```markdown
現在の全楽曲ブランチのステータスを一覧表示してください。

以下の手順で実行してください:

1. `git branch` で `song/` から始まるブランチを一覧取得する
2. 現在チェックアウト中のブランチを特定する（★マークで表示）
3. 各ブランチについて以下の情報を取得する:
   - `git show song/[曲名]:context.md` で「現在のフェーズ」を読み取る
   - `git show song/[曲名]:handoff.md` の最終行（直近の状態）を取得する
   - `git log -1 --format="%ar" song/[曲名]` で最終更新日時を取得する
4. 以下のフォーマットで表示する:

```
┌─────────────┬───────────────┬──────────────────────────────┬────────────┐
│ 曲名        │ フェーズ      │ 直近の状態                   │ 最終更新   │
├─────────────┼───────────────┼──────────────────────────────┼────────────┤
│ ★NuWord     │ フェーズ2-C   │ SVP生成済み。ゲート⑤待ち     │ 2時間前    │
│  NextSong   │ フェーズ1     │ トレンド分析中               │ 3日前      │
└─────────────┴───────────────┴──────────────────────────────┴────────────┘
★ = 現在作業中
```

`song/` ブランチが存在しない場合は:
「楽曲プロジェクトが見つかりません。/music-init [曲名] で開始してください」
と表示してください。
```

- [ ] **Step 2: 内容を検証する**

Read ツールで `claude-config/commands/song-list.md` を読み込み、以下を確認する:
- `git show song/[曲名]:context.md` の記述が含まれているか
- `git show song/[曲名]:handoff.md` の記述が含まれているか
- `git log -1 --format="%ar" song/[曲名]` の記述が含まれているか
- エラー処理の案内文が含まれているか

- [ ] **Step 3: コミットする**

```bash
git add claude-config/commands/song-list.md
git commit -m "feat(commands): /song-list コマンドを追加"
```

---

## Task 2: `/song-switch` コマンドを作成する

**Files:**
- Create: `claude-config/commands/song-switch.md`

- [ ] **Step 1: コマンドファイルを作成する**

`claude-config/commands/song-switch.md` に以下の内容を書く:

```markdown
指定した楽曲ブランチにコンテキストを切り替えてください。

切り替え先の曲名: $ARGUMENTS

以下の手順で実行してください:

1. `song/$ARGUMENTS` ブランチが存在するか確認する
   存在しない場合: 「song/$ARGUMENTS ブランチが見つかりません。曲名を確認してください」と表示してabortする

2. 現在のブランチ名を記録する（stashメッセージに使用）

3. `git status` で未コミットの変更があるか確認する
   変更がある場合:
   `git stash push -u -m "song-switch: [現在のブランチ名] [現在日時]"` を実行する
   成功後「[現在のブランチ名]の変更を一時保存しました。`git stash list` で確認できます」と案内する
   失敗した場合: 「変更を保存できませんでした。先に `git status` で状態を確認してください」と表示してabortする

4. `git checkout song/$ARGUMENTS` を実行する

5. `context.md` と `handoff.md` を読み込む

6. 以下のフォーマットでステータスを表示する:

```
[曲名] の作業を再開します

■ プロジェクト: [曲名]
■ 現在のフェーズ: [フェーズ]
■ 最後の承認ゲート: [ゲート番号]
■ 次にすべき作業: [handoff.md の最終行]
```
```

- [ ] **Step 2: 内容を検証する**

Read ツールで `claude-config/commands/song-switch.md` を読み込み、以下を確認する:
- `$ARGUMENTS` が使われているか
- ブランチ存在チェックの記述があるか
- `git stash push -u -m` の記述があるか
- `git checkout song/$ARGUMENTS` の記述があるか

- [ ] **Step 3: コミットする**

```bash
git add claude-config/commands/song-switch.md
git commit -m "feat(commands): /song-switch コマンドを追加"
```

---

## Task 3: `/song-finish` コマンドを作成する

**Files:**
- Create: `claude-config/commands/song-finish.md`

- [ ] **Step 1: コマンドファイルを作成する**

`claude-config/commands/song-finish.md` に以下の内容を書く:

```markdown
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
```

- [ ] **Step 2: 内容を検証する**

Read ツールで `claude-config/commands/song-finish.md` を読み込み、以下を確認する:
- `go_live_checklist.md` チェックの記述があるか
- `⚠️` ゼロチェックの記述があるか
- `handoff.md` への追記が含まれているか
- `/hp-add-work` への導線が含まれているか

- [ ] **Step 3: コミットする**

```bash
git add claude-config/commands/song-finish.md
git commit -m "feat(commands): /song-finish コマンドを追加"
```

---

## Task 4: `/hp-add-work` コマンドを作成する

**Files:**
- Create: `claude-config/commands/hp-add-work.md`

- [ ] **Step 1: コマンドファイルを作成する**

`claude-config/commands/hp-add-work.md` に以下の内容を書く:

```markdown
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
   「index.html の公開楽曲数の数値を手動で更新してください（現在の値 + 1）」

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
```

- [ ] **Step 2: 内容を検証する**

Read ツールで `claude-config/commands/hp-add-work.md` を読み込み、以下を確認する:
- YouTubeIDバリデーションの記述があるか
- 未コミット変更チェックの記述があるか
- yes/no 確認ステップがあるか
- `git push origin main` が yes の場合のみ実行される記述になっているか
- descJa / descEn がプレースホルダーである旨の案内があるか

- [ ] **Step 3: コミットする**

```bash
git add claude-config/commands/hp-add-work.md
git commit -m "feat(commands): /hp-add-work コマンドを追加"
```

---

## Task 5: CLAUDE.md の SLASH COMMANDS テーブルを更新する

**Files:**
- Modify: `CLAUDE.md`（ルートの `/Users/fghmacbook013/NOCTA/CLAUDE.md` ではなく `project_NOCTA/CLAUDE.md`）

- [ ] **Step 1: CLAUDE.md の SLASH COMMANDS テーブルを確認する**

`project_NOCTA/CLAUDE.md` を読み込み、SLASH COMMANDS セクションの末尾を確認する。

- [ ] **Step 2: 4コマンドをテーブルに追記する**

`/music-reset-context` の行の後に以下を追加する:

```markdown
| `/song-list` | 全曲のフェーズ・ステータスを一覧表示 |
| `/song-switch [曲名]` | 指定した曲のブランチにコンテキスト切り替え |
| `/song-finish [曲名]` | 曲の完成処理・アーカイブ・HP反映への導線 |
| `/hp-add-work [曲名] [YouTubeID]` | works-data.js に新曲追加（確認後push） |
```

- [ ] **Step 3: 追記内容を検証する**

Read ツールで CLAUDE.md の SLASH COMMANDS セクションを読み込み、4コマンドが正しく追加されていることを確認する。

- [ ] **Step 4: コミット & プッシュする**

```bash
git add project_NOCTA/CLAUDE.md
git commit -m "docs(CLAUDE.md): song-list/switch/finish・hp-add-work を SLASH COMMANDS に追記"
git push origin main
```

注意: この `git push origin main` により、Task 1〜4 で積み上げた4つのコマンドファイルのコミットも含めて一括でリモートに送信される。

---

## 完了の確認

全タスク完了後、以下で動作確認する:

```bash
# コマンドファイルが存在するか確認
ls claude-config/commands/song-list.md
ls claude-config/commands/song-switch.md
ls claude-config/commands/song-finish.md
ls claude-config/commands/hp-add-work.md

# CLAUDE.md に4コマンドが追記されているか確認
grep "song-list\|song-switch\|song-finish\|hp-add-work" CLAUDE.md
```

期待する出力:
```
claude-config/commands/song-list.md
claude-config/commands/song-switch.md
claude-config/commands/song-finish.md
claude-config/commands/hp-add-work.md

| `/song-list` | 全曲のフェーズ・ステータスを一覧表示 |
| `/song-switch [曲名]` | 指定した曲のブランチにコンテキスト切り替え |
| `/song-finish [曲名]` | 曲の完成処理・アーカイブ・HP反映への導線 |
| `/hp-add-work [曲名] [YouTubeID]` | works-data.js に新曲追加（確認後push） |
```
