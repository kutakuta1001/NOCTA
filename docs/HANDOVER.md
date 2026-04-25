# NOCTA プロジェクト 引き継ぎ書

最終更新: 2026-04-16（TOOLSセクション追加・ベストプラクティスレビュー8件・DESIGN.md新設・CLAUDE.md強化・LLM Wiki導入）

---

## 現在の楽曲プロジェクト: NuWord

| 項目 | 内容 |
|------|------|
| 曲名 | NuWord（読み: ニューワールド） |
| ジャンル | Jポップ・アニメソング寄り / 疾走感・期待感 |
| ターゲット | 何かを始めるすべてのアーティスト |
| SynthVキャラクター | Mai |
| BPM / キー | 152 / C#メジャー（Suno実測） |
| 採用差別化案 | 案A（森林のテクスチャー音響）+ 案B（落ちサビ→ラスサビ構成） |
| 採用歌詞 | 草稿A |
| **現在のフェーズ** | **フェーズ2-C（SVP生成待ち・アレンジ確定待ち）** |
| 通過済みゲート | ①②③ |
| SVP生成状況 | 完了（498ノート）。`outputs/svp/vocal_draft.svp` 存在。Phoneme要確認: NuWord=「ni-u-wa-a-r-u-do」 |

### NuWordの次のアクション

1. SynthV Studio PROで `outputs/svp/vocal_draft.svp` を開いてRender
2. SynthVで声の質感・感情を確認 → 承認ゲート⑤
3. 気になる箇所のPhoneme・感情パラメータをCEOが調整
4. OKなら `/phase2-demo` でQ&A評価
5. フェーズ3（PV制作）へ進む

---

## デザイン・ビジュアル制作の現状

### Visual作品（website/visual-data.js）

| カテゴリ | 件数 | 最新作品 |
|---------|------|---------|
| Works（完成品・Canva加工済み・Base chain） | 1件 | SILENCE #1 |
| Art（AI生成元画像・Zora chain） | 13件 | rainy season #1 |
| Music（楽曲連動ビジュアル） | 0件 | 未追加 |

追加手順: `/visual-prompt [作品名]` → ChatGPT PlusでGPT Image 2手動生成 → IPFS登録 → `/visual-add`

### ランディングページ（website/）

| ページ | 状態 |
|--------|------|
| the-first-flower/ | 公開済み |
| NuWord LP | 未制作（`/lp-create NuWord` で開始可能） |

### PV進捗（NuWord）

| 成果物 | 状態 |
|--------|------|
| pv_concept.md | 未作成 |
| pv_storyboard.md | あり（drafts/） |
| outputs/pv/ | 未作成 |

→ NuWord SynthV確認（ゲート⑤）通過後に `/pv-create story NuWord` で再開

### デザイン関連スキル早見表

| コマンド | 何をするか |
|---------|-----------|
| `/design-status` | Visual作品数・LP・PV進捗を一覧確認 |
| `/visual-prompt [作品名]` | GPT Image 2 / Klingプロンプト生成（G1〜G3・K1〜K2） |
| `/visual-add [作品名]` | IPFS登録済み画像をvisual-data.jsに追加 |
| `/lp-create [対象名]` | 楽曲・プロダクト専用ランディングページを構築 |
| `/pv-create [フェーズ]` | PV制作（絵コンテ / プロンプト / FFmpeg編集） |

---

## インフラ・設定の現状

### リモートトリガー（自動エージェント）

| 名前 | ID | スケジュール | 次回実行 | 状態 |
|------|-----|------------|---------|------|
| NOCTA-best-practices-review-weekly | trig_01CZbMTLSuyKmYkH8MgPfuHz | 毎週月曜 9:00 JST | 2026-03-30 | 有効 |
| NOCTA-web-practices-review | trig_01T54UiZPRmGEHpCTnxRBdU2 | 3日ごと 9:00 JST | 2026-04-01 | 有効 |
| Monthly Interaction Pattern Review | trig_01BH1fGRnG3AnUmw5eHR8B9Y | 毎月1日 9:00 JST | 2026-04-01 | 有効 |
| NOCTA-docs-weekly-update | trig_018wksvyPSNT21nWffMnX5V2 | 毎週日曜 9:00 JST | 2026-04-05 | 有効 |

### 公式ドキュメントレビューキュー

`docs/best-practices-registry.md` の状態:
- **pending: 41件**（すべて未処理）
- 毎週1件ずつ自動処理 → 約10ヶ月で完了予定
- 最初にレビューされるのは「Best Practices」(No.1)

### HP（Netlify）

- リポジトリ: https://github.com/kutakuta1001/NOCTA
- デプロイ: Netlify（手動トリガー方式）
- 本番URL: NOCTAウェブサイト
- **commit後は毎回 Netlify で手動デプロイが必要**

### 外部API

| API | 用途 | キー保存場所 | 状態 |
|-----|------|------------|------|
| Gemini 2.5 Flash | /web-practices-review の検索 | `~/.claude/settings.json` env.GEMINI_API_KEY | 有効（2026-03-29設定） |

---

## 直近セッションで構築・変更したもの

### 2026-04-07〜16 で新設・変更されたもの

| 対象 | 内容 |
|------|------|
| website/apps-data.js | NuWord Seed / Verse / inner canvas を TOOLSセクションに追加 |
| website/index.html | TOOLSセクション: NuWordコンセプトLPリンク追加・カード画像オーバーレイ実装 |
| website/images/seed.jpg | NuWord Seedのスクリーンショット（ブラウザクロムカット・75%ズーム） |
| website/images/verse.jpg | NuWord Verseのスクリーンショット（二段階75%ズーム） |
| website/images/inner-canvas.jpg | NuWord inner canvasのスクリーンショット（右クロップでコンテンツセンタリング） |
| website/DESIGN.md | NOCTAブランドデザインルール集を新設。Apple/Linear/Vercel/Stripe/Lusion参照。カラー・タイポ・コンポーネント・アニメ・新ページチェックリストを包括 |
| CLAUDE.md（ルート） | セッション運用にトークン最適化Tips追記（Edit→再生成・15-20msg新チャット）。MCP管理にvidIQ MCPオプション・Denyリスト設定を追加。/simplify をコマンドに追加 |
| xmcp設定 | .mcp.json の type を "sse"→"http" に修正（Streamable HTTP方式）。ポート8000で稼働中 |
| ~/.claude/commands/x-practices-search.md | X検索スキル（xmcp経由・Claude Code/AI運用・音楽ツールのツイートをインボックスへ） |
| ~/.claude/commands/claude-docs-review.md | Anthropic公式ドキュメント巡回スキル（新情報をインボックスへ自動追加） |
| ~/.claude/commands/best-practices-review.md | インボックス方式に全面改訂（5件以上で一括レビュー・article-notesにノート生成） |
| drafts/best-practices-inbox.md | インボックス方式に移行（未処理/処理済みの2セクション構成） |
| drafts/article-notes/ | LLM Wikiパターン導入。8件のノートを生成（2026-04-16） |
| drafts/article-notes/index.md | ノート一覧カタログ（カテゴリ別・クエリ時の参照用） |
| drafts/article-notes/log.md | 処理履歴ログ（時系列・追記のみ） |
| drafts/best-practices-report-2026-04-16-inbox.md | 8件レビューレポート（vidIQ MCP・DESIGN.md・LLM Wikiを主要提案として収録） |
| drafts/nuword-design-md-handoff.md | NuWordのClaudeへの引き継ぎ書（DESIGN.md概念・NOCTAでの作り方・NuWord向け適用手順） |

### 2026-03-26〜29 で新設・変更されたもの

| 対象 | 内容 |
|------|------|
| website/index.html | Zora NFTコレクションリンクを追加 |
| website/blog-data.js | 「神話の力」（book）・「仕掛け学」ブログ記事を追加 |
| website/the-first-flower/ | The First Flower サブサイトを新設 |
| CLAUDE.md（ルート） | 308行 → 185行にスリム化。ルール整理・CODEMAP更新 |
| ~/.claude/commands/ | best-practices-review / blog-publish / interaction-review / web-practices-review を追加 |
| ~/.claude/settings.json | GEMINI_API_KEY を env セクションに追加 |
| docs/best-practices-registry.md | 41件の公式ドキュメントレビューキューを新設 |
| docs/MANUAL.md / HANDOVER.md / notebooklm-source.md | 新設 |
| リモートトリガー×4 | 週次ベストプラクティス・3日ごとWebレビュー・月次インタラクションレビュー・週次ドキュメント更新 |

---

## CEOに判断・実行を求めていること

### すぐに対応が必要なもの

| 項目 | 内容 | 場所 |
|------|------|------|
| NuWord SynthV確認 | `outputs/svp/vocal_draft.svp` をSynthV Studio PROで開いてRender・確認（承認ゲート⑤） | outputs/svp/ |
| vidIQ MCPを試す | `claude.ai/settings/connectors` でMCPサーバーURL `https://mcp.vidiq.com/mcp` を追加（無料ベータ中） | ブラウザで操作 |
| セキュリティDenyリスト | Claude Code設定画面でDenyリストに危険コマンドを登録しているか確認 | Claude Code設定 |

### 時間があるときに対応

| 項目 | 内容 | 場所 |
|------|------|------|
| NuWordのDESIGN.md作成 | `drafts/nuword-design-md-handoff.md` の手順に従ってNuWordプロジェクトに渡す | drafts/ |
| CLAUDE.md MEMORYセクション | 音楽的傾向・制作注意点・マーケティング傾向を記入する（NuWordの経験から） | CLAUDE.md |
| article-notes/index.md 更新 | 新しいノートを追加した際にカタログを更新する | drafts/article-notes/ |

### 判断保留中（CEOが決める）

| 項目 | 内容 |
|------|------|
| /x-practices-search の動作確認 | xmcpサーバー（ポート8000）再起動後に動作確認が必要 |
| web-practices-reviewのAPIキー | trig_01T54UiZPRmGEHpCTnxRBdU2 のプロンプトにAPIキー直書き（低リスク）。settings.json読み込みに変更するか否か |
| PreCompactフック | コンテキスト圧縮前にhandoff.mdを自動更新するフック（設定済みか未確認） |

---

## 既知の改善ポイント（interaction-reviewより）

1. **アニメ等の微調整はcommit前に確認** — 同一箇所を複数回fixするパターンがある
2. **新規ファイルはgitに入れるか先に判断** — sample/インシデントの再発防止
3. **website/index.htmlの変更はまとめてcommit** — 細かい変更が累積してノイズになっている
4. **CLAUDE.md MEMORYセクションの記入** — 実プロジェクト経験が蓄積されていない

## セキュリティメモ（web-practices-reviewより）

- Gemini等の外部API出力はプロンプトインジェクションの経路になりうる
- `~/.claude/commands/web-practices-review.md` にインジェクション検査を実装済み
- git操作の提案は絶対に自動適用しない（「CEOが確認すべき事項」に隔離）
- 注意パターン: 「前の指示を無視」「git push --force」「rm -rf」「curl | bash」等

---

## スキルファイルの場所

```
~/.claude/commands/          ← 実際に動くスキル（21本）
├── best-practices-review.md ← 2026-04-16 インボックス方式に全面改訂
├── blog-publish.md
├── brainstorm.md
├── claude-docs-review.md    ← 2026-04-07 追加（Anthropic公式ドキュメント巡回）
├── hp-add-work.md
├── interaction-review.md
├── music-init.md
├── music-reset-context.md
├── music-status.md
├── phase1-suno.md
├── phase1-trend.md
├── phase2-demo.md
├── phase2-music.md
├── phase2-svp.md
├── phase3-pv.md
├── phase4-release.md
├── phase5-golive.md
├── song-finish.md
├── song-list.md
├── song-switch.md
├── web-practices-review.md
└── x-practices-search.md    ← 2026-04-07 追加（X検索・xmcp連携）

project_NOCTA/claude-config/commands/  ← gitで管理している参照用コピー
```

---

## 緊急時の対処

**「どこから再開すればいい？」**
→ `/music-status` → context.md と handoff.md を確認

**「gitでエラーが出る」**
→ `project_NOCTA/` の中にいるか確認: `git rev-parse --show-toplevel`

**「自動レポートが生成されていない」**
→ https://claude.ai/code/scheduled でトリガーの状態を確認

**「HPが更新されていない」**
→ mainブランチへのpushでGitHub Pagesが自動デプロイ。数分待って確認する。

---

## これからの計画（難易度別ロードマップ）

### EASY — すぐできる・当日中（0〜30分）

| # | タスク | 方法 | 効果 |
|---|--------|------|------|
| E-1 | vidIQ MCPを試す | `claude.ai/settings/connectors` で `https://mcp.vidiq.com/mcp` を追加。無料ベータ中 | /phase1-trendがYouTubeリアルデータで強化される |
| E-2 | Claude Code設定のDenyリスト確認 | Claude Code設定画面でDenyリストを確認・設定 | 誤操作をハード的に防止できる |
| E-3 | SynthV vocal_draft.svp を確認 | SynthV Studio PROで開いてRender→承認ゲート⑤ | NuWordフェーズ2-Cを完了できる |
| E-4 | /x-practices-search の動作確認 | Claude Code再起動 → `/mcp` で connected 確認 → `/x-practices-search` 実行 | X検索が自動化されインボックスに自動蓄積 |
| E-5 | CLAUDE.md MEMORYセクションに記入 | NuWord制作で学んだ音楽的傾向・注意点を数行書く | 次の楽曲制作から即座に活かせる |

### MEDIUM — 数時間〜半日

| # | タスク | 方法 | 効果 |
|---|--------|------|------|
| M-1 | NuWordのDESIGN.md作成 | `drafts/nuword-design-md-handoff.md` をNuWordのClaudeに渡す | NuWordプロダクトのUI一貫性が保てる |
| M-2 | NuWordフェーズ3（PV制作） | ゲート⑤通過後 `/phase3-pv` を実行 | PVコンセプト・Midjourney/Klingプロンプトを生成 |
| M-3 | article-notesのObsidian連携 | Obsidianのvaultに `drafts/article-notes/` フォルダを追加 | グラフビューでノート間のつながりが可視化される |
| M-4 | NOCTA DESIGN.mdをNuWordに適用して検証 | NuWordプロダクトのページにDESIGN.mdを渡してUI生成テスト | DESIGN.mdの実用性を検証し改善できる |
| M-5 | ブログ記事の投稿 | `drafts/blog_draft.txt` に記事を書いて `/blog-publish` を実行 | NOCTAのコンテンツが増える |

### HARD — 数日〜数週間

| # | タスク | 方法 | 難しいポイント |
|---|--------|------|-------------|
| H-1 | NuWordリリース（フェーズ4〜5） | フェーズ3完了 → `/phase4-release` → `/phase5-golive` | PV素材の選定・SNS戦略の判断がCEO作業 |
| H-2 | ACE-Step 1.5 XLの試用 | ComfyUI + RTX 3090 でローカル生成テスト。Sunoとの品質比較 | 環境セットアップ・VRAM 24GB管理が複雑 |
| H-3 | NOCTAサウンドのスタイル定義 | NuWordの完成音源を元にACE-Step用LoRA微調整の検討 | 十分な学習データが必要。2〜3曲完成後が現実的 |
| H-4 | NOCTAナレッジウィキの本格運用 | article-notes/をObsidianで育て、LLM Wiki（index.md更新・lint定期実行）を習慣化 | 継続的なメンテナンスが必要 |
| H-5 | everything-claude-codeの調査・活用 | github.com/affaan-m/everything-claude-code を調査し、NOCTAに適用できるスキルを抽出 | 27エージェント分を音楽制作ワークフローに整理する作業量 |
| H-6 | 2曲目の制作開始 | `/music-init [曲名]` → song/ブランチで管理 | NuWordの完成を先に。song/ブランチ運用開始のタイミング |

### NICE TO HAVE — いつかできたら

| # | タスク | 背景 |
|---|--------|------|
| N-1 | /voice コマンドの活用 | SynthVパラメータを口頭でClaude Codeに指示できるかもしれない |
| N-2 | /remote-control の活用 | PCで始めたセッションをスマホから操作できるようになる |
| N-3 | AgentShieldパターンの参照 | スキルのセキュリティテスト（1,282テスト・98%カバレッジ）の考え方を取り入れる |
| N-4 | notebooklm-source.mdの更新 | 現在2026-03-29時点の情報。今回追加したDESIGN.md・LLM Wiki・スキル追加を反映 |
