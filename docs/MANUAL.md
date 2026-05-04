# NOCTA プロジェクト 取扱説明書

最終更新: 2026-04-16（TOOLSセクション追加・DESIGN.md新設・CLAUDE.md強化・LLM Wiki導入）

---

## 概要

NOCTAは、CEOとAIエージェントチームで楽曲の企画〜リリースまでを完結させる音楽エンタメプロジェクトです。
このドキュメントでは「何をどこでどう動かすか」を一冊にまとめています。

---

## 1. ファイル構造と役割

```
/Users/fghmacbook013/NOCTA/
├── CLAUDE.md                    ← NOCTAの憲法（全ルール・エージェント定義）
└── project_NOCTA/               ← gitリポジトリ本体（GitHub: kutakuta1001/NOCTA）
    ├── context.md               ← 現在の楽曲プロジェクト情報（毎セッション読む）
    ├── handoff.md               ← 作業引き継ぎメモ（完了時に1〜3行追記）
    ├── CLAUDE.md                ← プロジェクト用ルールコピー（gitで管理）
    │
    ├── drafts/                  ← CEO未承認の全草案
    │   ├── blog_draft.txt       ← /blog-publish の入力ファイル
    │   ├── interaction-review-*.md   ← 依頼パターンレビュー結果
    │   ├── best-practices-report-*.md ← ベストプラクティスレポート（自動生成）
    │   ├── interaction-review-monthly-*.md ← 月次レポート（自動生成）
    │   └── [その他草案]
    │
    ├── outputs/
    │   ├── midi/                ← Studio Oneにドロップするファイル
    │   ├── svp/                 ← SynthVで開くファイル
    │   ├── prompts/             ← Midjourney/Runway用プロンプト
    │   └── approved/           ← CEO承認済みのみ（手動移動のみ）
    │
    ├── website/                 ← HPのソースコード
    │   ├── index.html           ← NOCTA HP本体
    │   ├── DESIGN.md            ← ブランドデザインルール集（AIがUIを生成する際の基準）← 2026-04-16 新設
    │   ├── blog-data.js         ← ブログ記事データ（/blog-publishで更新）
    │   ├── works-data.js        ← 楽曲リストデータ（/hp-add-workで更新）
    │   ├── apps-data.js         ← Appsセクションデータ（手動編集）
    │   ├── visual-data.js       ← ビジュアルギャラリーデータ
    │   ├── images/              ← カード・OGP画像（seed.jpg / verse.jpg / inner-canvas.jpg）
    │   ├── blog/post.html       ← 記事個別ページテンプレート
    │   └── the-first-flower/    ← The First Flower サブサイト
    │
    ├── drafts/
    │   └── article-notes/       ← ベストプラクティスノート（LLM Wikiパターン）← 2026-04-16 新設
    │       ├── index.md         ← ノート一覧カタログ（新ノート追加時に更新）
    │       └── log.md           ← 処理履歴ログ（時系列・追記のみ）
    │
    ├── docs/
    │   ├── MANUAL.md            ← このファイル
    │   ├── HANDOVER.md          ← 引き継ぎ書（現状・計画）
    │   ├── best-practices-registry.md ← 公式ドキュメントレビューキュー（41件）
    │   └── notebooklm-source.md ← NotebookLM用インプット文書（プロジェクト全知識）
    │
    └── claude-config/
        ├── settings.json        ← Claude Code設定
        ├── commands/            ← プロジェクト内スキル（参照用）
        └── agents/              ← 音楽制作エージェント定義
```

---

## 2. スキル一覧（スラッシュコマンド）

スキルは `~/.claude/commands/` に保存されています。Claude Codeセッション中に `/コマンド名` で呼び出します。

### 楽曲制作フロー

| コマンド | タイミング | 何をするか |
|---------|-----------|-----------|
| `/music-init [曲名]` | 新曲開始時 | context.md / handoff.md / drafts/ を初期化 |
| `/phase1-trend` | フェーズ1 | trend-analyst が市場トレンドを調査して drafts/trend_report.md を生成 |
| `/phase1-suno` | フェーズ1 | Suno用プロンプトを差別化案ごとに生成 |
| `/phase2-music` | フェーズ2-A | music-spec-writer + lyric-poet を並列起動。仕様書と歌詞草稿を同時生成 |
| `/phase2-svp [A/B/C]` | **ゲート③④後のみ** | CEO承認済み歌詞でSVPファイルを生成（アレンジ確定前は実行不可） |
| `/phase2-demo` | フェーズ2-D | quality-listener がQ&A形式でデモを評価 |
| `/phase3-pv` | フェーズ3 | concept-director + visual-prompter がPVコンセプト・プロンプトを生成 |
| `/phase4-release` | フェーズ4 | SNS/PR/著作権/分析の4エージェントを並列起動 |
| `/phase5-golive` | リリース当日 | go_live_checklist.md の⚠️がゼロになるまでチェック |

### 楽曲管理

| コマンド | 何をするか |
|---------|-----------|
| `/music-status` | context.md + handoff.md + drafts/ + outputs/ の現状を一覧表示 |
| `/music-reset-context` | コンテキストを最小限に圧縮して再開（長いセッション後に使う） |
| `/song-list` | `song/*` ブランチ一覧とフェーズ・最終更新を表示 |
| `/song-switch [曲名]` | 指定曲のブランチにコンテキストを切り替え |
| `/song-finish [曲名]` | 完成処理・アーカイブ・HP反映への導線 |

### HP管理（コンテンツ）

| コマンド | 何をするか |
|---------|-----------|
| `/blog-publish` | `drafts/blog_draft.txt` をHTMLに整形してblog-data.jsに追加しcommit/push |
| `/hp-add-work [曲名] [YouTubeID]` | works-data.jsに新曲を追加してcommit/push |

**apps-data.jsの直接編集（Appsセクション）:**
TOOLSセクションのWebアプリカードは専用スキルがないため `website/apps-data.js` を直接編集する。
フィールド: `title / cat / url / imgUrl / thumbClass / badge / badgeColorClass / descJa / descEn`
画像は `website/images/` に配置。スクリーンショットはy=120でブラウザクロムをカット、75%ズームが標準。

### デザイン・ビジュアル制作

デザイン領域は「作る（/visual-prompt）→ 登録（/visual-add）→ 確認（/design-status）」の流れで動かす。
楽曲専用ランディングページは `/lp-create`、PV制作は `/pv-create` が担当する。

| コマンド | いつ使うか | 何をするか |
|---------|-----------|-----------|
| `/design-status` | いつでも | Visual作品数・進行中LP・PV進捗・次のアクションを一覧表示 |
| `/visual-prompt [作品名]` | 画像を作りたいとき | GPT Image 2（G1〜G3）＋Kling（K1〜K2）プロンプトを生成。SNSコピーライン3案も出力 |
| `/visual-add [作品名]` | IPFS登録済みの画像をHPに載せたいとき | visual-data.jsにエントリ追加（IPFSハッシュ59文字バリデーション付き） |
| `/lp-create [対象名]` | 楽曲・プロダクトの専用LPを作るとき | design-brief生成 → Claude Design注入プロンプト → HTML実装（website/[slug]/） |
| `/pv-create [story\|prompt\|edit]` | PV制作の各フェーズで | Phase 1: 絵コンテ設計 / Phase 2: Runway/Klingプロンプト / Phase 3: FFmpeg結合 |

**スキルの使い分け早見表:**

| 作りたいもの | 使うスキル |
|---|---|
| 楽曲LP・説明LPのページ | `/lp-create` |
| 楽曲ジャケット・SNSバナー・NFTアート | `/visual-prompt` → `/visual-add` |
| PV動画のキービジュアル | `/pv-create story` → `/visual-prompt` |
| 現状確認 | `/design-status` |

**デザインシステム:** `website/DESIGN.md`（カラートークン・タイポグラフィ・感情-ビジュアル変換テーブル等）

### Claude Code運用

| コマンド | 何をするか |
|---------|-----------|
| `/best-practices-review` | インボックス（best-practices-inbox.md）に5件以上溜まったら一括レビュー・ノート生成・commit |
| `/web-practices-review` | Gemini Search Groundingで非公式Web記事からベストプラクティスを収集・分析・レポート保存 |
| `/claude-docs-review` | Anthropic公式ドキュメントを巡回し、新情報をインボックスに自動追加 |
| `/x-practices-search` | xmcp経由でXを検索し、Claude Code/AI運用・音楽ツールのツイートをインボックスに追加 |
| `/interaction-review` | /insights + git履歴から依頼パターンを分析し、改善提案レポートをdrafts/に保存してcommit |
| `/insights` | セッションの利用統計を分析（ローカルのみ、リモートでは実行不可） |
| `/brainstorm` | 各フェーズ開始前のブレインストーミング（必ず作業前に実行） |

**ベストプラクティス収集フロー（2026-04-16 改定）:**
1. `/x-practices-search` → `drafts/best-practices-inbox.md` の「未処理」に追加
2. `/claude-docs-review` → 公式ドキュメントの新情報を同インボックスに追加
3. 5件以上溜まったら `/best-practices-review` → `drafts/article-notes/` にノート生成・インボックスを処理済みへ移動
4. 生成されたノートを `article-notes/index.md` に追記（LLM Wikiパターン）

---

## 3. 自動エージェント（リモートトリガー）

Anthropicクラウド上で自動実行されるエージェントです。ローカルPCが起動していなくても動作します。
管理画面: https://claude.ai/code/scheduled

| 名前 | ID | スケジュール | 何をするか |
|------|----|------------|-----------|
| NOCTA-best-practices-review-weekly | trig_01CZbMTLSuyKmYkH8MgPfuHz | 毎週月曜 9:00 JST | best-practices-registry.md から pending を1件WebFetchし、レポートをcommit |
| NOCTA-web-practices-review | trig_01T54UiZPRmGEHpCTnxRBdU2 | 3日ごと 9:00 JST | Gemini Search Groundingで非公式Web記事を5クエリ収集・インジェクション検査・レポートcommit |
| Monthly Interaction Pattern Review | trig_01BH1fGRnG3AnUmw5eHR8B9Y | 毎月1日 9:00 JST | git履歴から作業パターンを分析し、月次レポートをcommit |
| NOCTA-docs-weekly-update | trig_018wksvyPSNT21nWffMnX5V2 | 毎週日曜 9:00 JST | git履歴を読んでMANUAL.md・HANDOVER.mdを自動更新してcommit |

**週次レビューの使い方:**
- 毎週月曜に `drafts/best-practices-report-YYYY-MM-DD-doc*.md` が自動生成される
- CEOはレポートを読んで「適用する」「適用しない」を判断する
- 適用する場合は CLAUDE.md またはスキルファイルを手動で編集する
- 自動適用はしない（CEOの判断が必要）

**月次レビューの使い方:**
- 毎月1日に `drafts/interaction-review-monthly-YYYY-MM-DD.md` が自動生成される
- ローカルで `/interaction-review` を実行すると /insights データ込みのより詳細なレポートが生成される

**Webベストプラクティスの使い方:**
- 3日ごとに `drafts/web-practices-report-YYYY-MM-DD.md` が自動生成される
- セキュリティ: Gemini出力はインジェクション検査済み（8パターン）
- git操作の提案はレポート内「要注意・手動確認が必要な項目」セクションに隔離される
- 自動適用はしない。CEOが内容を確認してから判断する
- GEMINI_API_KEY: `~/.claude/settings.json` の `env` セクションに設定済み

**取扱説明書・引き継ぎ書の自動更新:**
- 毎週日曜に MANUAL.md と HANDOVER.md が自動更新される（週次ドキュメント更新トリガー）
- 直近1週間の git ログを解析して変更内容を反映する

---

## 4. 承認ゲート

各フェーズの区切りにCEOの判断が必要です。AIが勝手に先に進まないルールです。

| # | 内容 | 次のアクション |
|---|------|--------------|
| ① | トレンド分析の方向性確認 | 合意したら `/phase2-music` |
| ② | 楽曲仕様書確認（Studio Oneで実装できる粒度か） | OKなら歌詞選択へ |
| ③ | 歌詞A/B/Cから選択 | `/phase2-svp A`（または B/C） |
| ④ | Studio OneでMIDIを鳴らして方向性確認 | OKなら `/phase2-svp` |
| ⑤ | SynthVで声の質感・感情を確認 | OKなら `/phase2-demo` |
| ⑥ | PVコンセプト・絵コンテを確認 | OKなら `/phase4-release` |
| ⑦ | 映像素材の採用/不採用を決定 | 採用素材を伝える |
| ⑧ | SNS/プレスリリース全文を確認 | OKなら手動投稿・送付 |
| ⑨ | go_live_checklist.md の⚠️がゼロ | `/phase5-golive` |

---

## 5. HP管理の手順

### ブログ記事を投稿する
1. `drafts/blog_draft.txt` に本文を書く（Plain textでOK）
2. Claude Codeで `/blog-publish` を実行
3. タイトルとカテゴリ（music / essay / book）を入力
4. プレビューを確認して「ok」
5. commit/pushが完了したら GitHub Pages に自動デプロイ（mainブランチpushで即反映）

### 楽曲（Works）を追加する
1. YouTubeにアップロード済みであることを確認
2. `/hp-add-work [曲名] [YouTubeのID]` を実行
3. commit/push後、GitHub Pages に自動デプロイ

### Appsセクション（TOOLSセクション）にアプリを追加する
1. アプリのスクリーンショットを `website/sankou/` に配置
2. Pythonで画像処理: ブラウザクロム(y=120)をカット、75%センタークロップ、JPEG圧縮 → `website/images/` に保存
3. `website/apps-data.js` の `NOCTA_APPS` 配列先頭に新エントリを追加
4. `git add website/apps-data.js website/images/[ファイル名]` → commit/push
5. 注意: 画像ファイル（.jpg等）は gitignore で管理対象外のため個別に add すること

### デザインに関わる変更をする場合
- `website/DESIGN.md` を必ず先に読む
- 新しいページ・セクションはチェックリスト（DESIGN.md §10）に従う
- 新しいカラートークンを追加しない（既存トークンで解決する）

### NuWord Still（PWAアプリ）を更新する

`website/still/` がPWA（ホーム画面にインストールできるWebアプリ）として動作している。

**インストール方法（Android Chrome）:**
1. `https://kutakuta1001.github.io/NOCTA/still/` を開く
2. 右上の ⋮（3点メニュー）→「アプリをインストール」または「ホーム画面に追加」

**アプリを更新したとき（必須）:**
`website/still/sw.js` の先頭行のキャッシュバージョンを必ずインクリメントする。

```js
// 現在: still-v4
// 次回更新時: still-v5、その次: still-v6 ...
const CACHE = 'still-v4';  // ← ここを上げないと古いキャッシュが残る
```

バージョンを上げずにデプロイすると、インストール済みユーザーに更新が届かない。

**インストール済みPWAに更新を反映させる手順（Android）:**
1. PWAアプリをタスク一覧から完全に閉じる
2. Chrome ブラウザで `https://kutakuta1001.github.io/NOCTA/still/` を開く（SW が裏で更新される）
3. 再度 PWA アイコンから起動 → 新しいバージョンが反映される

---

### NuWord Still — ライセンスゲート（Gumroad販売設定）

購入者にライセンスキーを発行して認証させる仕組みが実装済み。

**認証の仕組み:**
- Gumroad発行のライセンスキーを SHA-256 ハッシュ化して `licenses.json` に登録
- アプリ起動時にキーのハッシュ値と照合し、一致すれば `localStorage` に保存
- 以降はキー入力なしで起動できる（ブラウザ/端末ごとに初回のみ）

**新しいライセンスキーを追加する手順:**
1. `https://kutakuta1001.github.io/NOCTA/still/keygen.html` を開く（CEO専用）
2. Gumroad 発行のライセンスキーを入力 →「ハッシュを生成」
3. 生成されたハッシュを `website/still/licenses.json` の `hashes` 配列に追加
4. `sw.js` の CACHE バージョンをインクリメント（例: `still-v4` → `still-v5`）
5. `git add website/still/licenses.json website/still/sw.js` → commit/push

**licenses.json の形式:**
```json
{
  "hashes": [
    "abc123...（SHA-256ハッシュ）",
    "def456...（追加するたびに配列に追加）"
  ]
}
```

---

### NuWord Still — CEOオーナー認証（認証スキップ）

CEOは認証なしで即起動できる永続バイパスが実装済み。

**初回設定（デバイスごとに一度だけ）:**

Chrome ブラウザで以下の URL を開くだけ。`localStorage` にフラグが書き込まれ、以降は通常URLで開いても認証なしで起動する。

```
https://kutakuta1001.github.io/NOCTA/still/?setup=owner
```

- URL を開いた瞬間にフラグが書き込まれ、`?setup=owner` は自動で除去される
- `localStorage` は Chrome ブラウザと Android インストール済み PWA で**共有**される
- ブラウザで設定 → PWA でも認証なし（同じ origin のため）

**PWA に反映されない場合:**
SW キャッシュが古い可能性がある。PWA を完全に閉じて Chrome でアクセスし、SW を更新してから再起動する（上記「インストール済みPWAに更新を反映させる手順」参照）。

**フラグをリセットする場合:**
```js
// Chrome の DevTools コンソールで実行
localStorage.removeItem('still-owner')
```

---

**ファイル構成:**
```
website/still/
├── index.html        ← アプリ本体（ライセンスゲート・オーナーバイパス実装済み）
├── manifest.json     ← PWA設定（name / icons / display）
├── sw.js             ← Service Worker（キャッシュ・オフライン対応）
├── licenses.json     ← 有効なライセンスキーの SHA-256 ハッシュ一覧
├── keygen.html       ← ライセンスキー→ハッシュ変換ツール（CEO専用・非公開URL）
├── audio/
│   ├── track-a.mp3
│   └── track-b.mp3
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

### Netlify デプロイ手順
- https://app.netlify.com を開く
- NOCTAサイトを選択 → "Trigger deploy" → "Deploy site"

---

## 6. 主要ルール（全エージェント共通）

詳細は CLAUDE.md 参照。重要点のみ抜粋:

- **approved/ には自動書き込みしない** — CEOが明示的に「承認した」と言った場合のみ移動
- **SNS自動投稿しない** — drafts/sns_calendar.md に保存して「CEO確認待ち」と書く
- **外部ツール（Suno等）は直接実行しない** — outputs/prompts/ にプロンプト文書を生成
- **SVPはアレンジ確定後のみ** — CEOが「アレンジOKです」と言うまで /phase2-svp を実行しない
- **作業前に /brainstorm を実行** — 合意なしにファイル生成を始めない
- **handoff.md は1〜3行のみ** — 「完了した事実」と「次のアクション」のみ追記

---

## 7. 公式ドキュメントレビューキュー

`docs/best-practices-registry.md` に41件の公式ドキュメントが登録されています。

- 毎週月曜に自動で1件ずつ処理（約41週 = 約10ヶ月で全件完了）
- 各レポートはCEOが確認して、適用するか判断する
- 現在のキュー状況: 優先度高10件 → 中20件 → 低8件 → PDF3件

---

## 8. よくある質問

**Q: セッションが切れたあとどこから再開すればいい？**
→ 楽曲制作: `/music-status`。デザイン: `/design-status`。または context.md と handoff.md を読む。

**Q: コンテキストが重くなってきた**
→ `/music-reset-context` を実行。必要最小限の情報に圧縮して再開できる。

**Q: git操作でエラーになる**
→ 作業ディレクトリが `project_NOCTA/` 内にあるか確認する。`git rev-parse --show-toplevel` で確認できる。

**Q: 自動レポートはどこに保存される？**
→ `drafts/` 配下に保存される。best-practices-report-*.md と interaction-review-*.md。

**Q: スキルを追加・修正したい**
→ `~/.claude/commands/` 内の対応する.mdファイルを編集する。プロジェクト内の `claude-config/commands/` は参照用コピー。

**Q: Gemini APIが動かない**
→ `~/.claude/settings.json` の `env.GEMINI_API_KEY` を確認。または `python3 -c "import os; print(os.environ.get('GEMINI_API_KEY', 'NOT SET'))"` で確認。

**Q: web-practices-reportのインジェクション検査とは？**
→ Gemini（外部サービス）が返したテキストに「前の指示を無視」「git reset --hard」等の危険パターンが含まれないか自動チェックしている。検出された場合はレポートの「要注意」セクションに隔離され、自動適用されない。

**Q: NotebookLMにはどのファイルを入れる？**
→ `docs/notebooklm-source.md` が専用のインプット文書。プロジェクト全体の知識を散文形式で記述している。
