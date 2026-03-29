# NOCTA プロジェクト 完全ガイド（NotebookLM用ソースドキュメント）

作成日: 2026-03-29
バージョン: 1.0

---

## プロジェクトの全体像

NOCTAは、CEO1人とAIエージェントチームだけで音楽の企画・制作・リリース・マーケティングまでを完結させる「スタッフゼロ型音楽エンタメカンパニー」です。物理的なスタッフを雇わず、Claude Code（AnthropicのAI）を中心としたエージェントチームがCEOの指示のもとで動きます。

CEOは Studio One Pro（DAW）、Synthesizer V Studio PRO（AIボーカル）、UR22C（オーディオインターフェース）、MPM-1000（マイク）を自ら操作できる音楽制作者です。作曲・編曲・ボーカル制作・ミックスをすべて自分で行います。AIエージェントの役割は「設計書・プロンプト・文章・ファイルを作ること」であり、音を実際に鳴らす作業や感情的なクオリティ判断はすべてCEOが行います。

---

## 技術スタック

NOCTAの運用を支える技術は以下のとおりです。

**AI・自動化**
- Claude Code（Anthropic）：中心となるAIシステム。スキル（スラッシュコマンド）とエージェントで構成される
- リモートトリガー（claude.ai/code/scheduled）：クラウド上で定期的に自動実行されるエージェント。ローカルPCが起動していなくても動作する

**音楽制作**
- Studio One Pro：DAW（作曲・編曲・ミックス）
- Synthesizer V Studio PRO + Maiキャラクター：AIボーカル生成
- Suno：Sunoで生成した音源をLALAL.AIで分離して素材として活用
- LALAL.AI：音源分離（ドラム・ベース・メロディ等をパーツに分ける）

**Web・公開**
- GitHub（kutakuta1001/NOCTA）：ソースコード管理
- Netlify：静的サイトホスティング（手動デプロイ方式）
- NOCTA HP：Tailwind CSS CDNを使ったダークテーマの静的サイト
- The First Flower：ウォームな有機的テーマのサブサイト

---

## ファイル・ディレクトリ構成

NOCTAのすべてのファイルは以下の場所にあります。

```
/Users/fghmacbook013/NOCTA/
├── CLAUDE.md                    ← NOCTAの「憲法」。全ルール・エージェント定義・承認ゲートを記載
└── project_NOCTA/               ← gitリポジトリ本体（GitHub同期）
```

`project_NOCTA/` の中の主要ファイル：

- `context.md`：現在進行中の楽曲プロジェクト情報（曲名・ジャンル・フェーズなど）。毎セッション最初に読む。
- `handoff.md`：部門間・セッション間の引き継ぎメモ。作業完了時に1〜3行だけ追記する。
- `CLAUDE.md`：NOCTA全体のルールコピー（gitで管理）
- `drafts/`：CEO未承認のすべての草案が入るフォルダ。ここに自動生成レポートも保存される。
- `outputs/`：CEOが実際に使うファイル（MIDI・SVP・プロンプト・承認済み）
- `website/`：HPのソースコード一式
- `docs/`：取扱説明書・引き継ぎ書・ドキュメントレビューキューなど
- `claude-config/`：エージェント定義・スキル定義・設定ファイル

`website/` の構成：
- `index.html`：NOCTA HP本体。Works・Blog・Visual・Appsの各セクション
- `blog-data.js`：ブログ記事データ（music / essay / bookカテゴリ）
- `works-data.js`：楽曲リスト（YouTubeID・タイトル等）
- `the-first-flower/`：The First Flower サブサイト。CEOの個人ブログ的なサイト

---

## スキル（スラッシュコマンド）システム

スキルはClaude Codeに「この手順でこの作業をやってくれ」と伝えるプログラムのようなものです。`~/.claude/commands/` にMarkdownファイルとして保存されており、`/コマンド名` で呼び出します。

### 楽曲制作スキル（フェーズ順）

**フェーズ1：トレンド調査**
- `/phase1-trend`：trend-analyst エージェントが市場トレンド・競合曲・差別化案を調査して `drafts/trend_report.md` に出力する
- `/phase1-suno`：Sunoで仮生成するためのプロンプトを差別化案ごとに作成する

**フェーズ2-A：楽曲仕様書と歌詞の並列生成**
- `/phase2-music`：music-spec-writer（楽曲仕様書）と lyric-poet（歌詞草稿A/B/C）を並列で起動する。BPM・キー・コード進行・アレンジ構成が数値で記述された仕様書と、3パターンの歌詞が同時に生成される

**フェーズ2-C：SVP生成**
- `/phase2-svp [A/B/C]`：CEOが選んだ歌詞でSynthesizerV用のSVPファイルを生成する。必ずMIDI確認とアレンジ確定後にしか実行できないルールがある（SVPを先に作ると、後でメロディが変わったときに全部作り直しになるため）

**フェーズ2-D：デモ評価**
- `/phase2-demo`：quality-listener エージェントがQ&A形式でデモを評価する

**フェーズ3：PV制作**
- `/phase3-pv`：concept-director と visual-prompter が絵コンテ・Midjourney/Runway用プロンプトを生成する

**フェーズ4：リリース準備**
- `/phase4-release`：SNS文案（sns-batch-agent）・プレスリリース（press-release-writer）・著作権確認（copyright-agent）・KPI設定（analytics-agent）の4エージェントを並列起動する

**フェーズ5：リリース当日**
- `/phase5-golive`：go_live_checklist.md の⚠️がゼロになるまで確認し、OKならリリース

### 楽曲管理スキル

- `/music-init [曲名]`：新しい楽曲プロジェクトを初期化する。context.md・handoff.md・drafts/が整備される
- `/music-status`：context.md・handoff.md・drafts/・outputs/の現状を一覧表示する
- `/music-reset-context`：長いセッション後にコンテキストを最小限に圧縮して再開する
- `/song-list`：`song/*` ブランチ一覧とフェーズ・最終更新を表形式で表示する
- `/song-switch [曲名]`：指定した曲のgitブランチに切り替える
- `/song-finish [曲名]`：楽曲完成処理・アーカイブ・HP反映への導線を実行する
- `/brainstorm`：各フェーズ開始前のブレインストーミング。CEOとの合意なしに作業開始しないためのルール

### HP管理スキル

- `/blog-publish`：`drafts/blog_draft.txt` を読み込み、HTMLに整形してblog-data.jsに追加し、commit/pushする。CEOがタイトルとカテゴリを入力し、プレビューを確認してから実行される
- `/hp-add-work [曲名] [YouTubeID]`：works-data.jsに新曲エントリを追加してcommit/pushする

### Claude Code運用スキル

- `/best-practices-review`：公式ドキュメントレジストリから未処理を1件選び、WebFetchで内容を取得し、NOCTAへの適用提案レポートを `drafts/best-practices-report-YYYY-MM-DD-docN.md` に保存してcommit/pushする
- `/interaction-review`：/insightsの結果 + git履歴からCEOの依頼パターンを分析し、改善提案レポートを `drafts/interaction-review-YYYY-MM-DD.md` に保存してcommit/pushする
- `/insights`：Claude Codeのローカルセッションデータを分析してCEOの利用パターン・強み・摩擦ポイントを可視化する（ローカル実行専用、リモートでは使えない）

---

## 自動エージェント（リモートトリガー）

ローカルPCが起動していなくてもAnthropicのクラウド上で定期実行される2つのエージェントがあります。

### 週次ベストプラクティスレビュー
- **名前**：NOCTA-best-practices-review-weekly
- **ID**：trig_01CZbMTLSuyKmYkH8MgPfuHz
- **スケジュール**：毎週月曜日 9:00 JST
- **次回実行**：2026-03-30
- **動作**：`docs/best-practices-registry.md` の `pending` のうち先頭1件のURLをWebFetchで取得し、NOCTAへの適用可否を分析してレポートを `drafts/` に保存し、レジストリのstatusを `done` に更新してcommit/pushする
- **目的**：Claude Codeの公式ドキュメント41件を週1件ずつ約10ヶ月かけて体系的にレビューする
- **CEOのアクション**：毎週月曜に生成されたレポートを読み、適用するかどうかを判断する。自動適用はしない

### 月次インタラクションレビュー
- **名前**：Monthly Interaction Pattern Review
- **ID**：trig_01BH1fGRnG3AnUmw5eHR8B9Y
- **スケジュール**：毎月1日 9:00 JST
- **次回実行**：2026-04-01
- **動作**：gitログから直近4週間のコミット種別・変更頻度・摩擦パターンを分析し、月次レポートを `drafts/interaction-review-monthly-YYYY-MM-DD.md` に保存してcommit/pushする
- **目的**：CEOの依頼パターンと作業習慣を定期的に観察し、改善点を提案する
- **制約**：/insightsはローカル専用のため、このエージェントはgitログのみを分析する

---

## エージェントチーム構成

NOCTAには専門に特化した12のエージェントがあります。フェーズによって使い分けます。

| エージェント | 担当フェーズ | モデル | 主な出力 |
|------------|-----------|--------|---------|
| trend-analyst | フェーズ1 | Sonnet | drafts/trend_report.md（市場分析・差別化案） |
| music-spec-writer | フェーズ2-A | Sonnet | drafts/music_spec.md（BPM・キー・コード進行・アレンジ構成） |
| lyric-poet | フェーズ2-A | Sonnet | drafts/lyrics_draft.md（歌詞A/B/Cの3パターン） |
| svp-generator | フェーズ2-C | Opus | outputs/svp/vocal_draft.svp（SynthV用ファイル） |
| quality-listener | フェーズ2-D | Sonnet | drafts/demo_feedback.md（デモ評価レポート） |
| concept-director | フェーズ3 | Sonnet | drafts/pv_concept.md（絵コンテ・演出案） |
| visual-prompter | フェーズ3 | Sonnet | outputs/prompts/visual_prompts.md（Midjourney/Runway用） |
| sns-batch-agent | フェーズ4 | Sonnet | drafts/sns_calendar.md（SNS投稿文・スケジュール） |
| press-release-writer | フェーズ4 | Sonnet | drafts/press_release.md |
| copyright-agent | フェーズ4 | Sonnet | drafts/legal_check.md（著作権確認） |
| analytics-agent | フェーズ4 | Haiku | drafts/kpi.md（KPI設定・分析） |
| brainstorm | 全フェーズ前 | Sonnet | 各フェーズのブレインストーミング進行 |

エージェントは同時に複数起動できます（並列実行）。フェーズ2-Aでは music-spec-writer と lyric-poet が並列動作し、フェーズ4では4つのエージェントが同時に動きます。

---

## 楽曲制作フロー（フェーズ1〜5）

NOCTAの楽曲制作は5つのフェーズと9つの承認ゲートで構成されています。

### フェーズ1：トレンド分析
trend-analyst がトレンドを調査し、差別化案を提案します。CEOが方向性に納得したら**ゲート①**を通過。

### フェーズ2-A：楽曲仕様書 + 歌詞
music-spec-writer と lyric-poet が並列で動き、仕様書と3パターンの歌詞を同時生成。
CEOが仕様書を確認したら**ゲート②**を通過。歌詞A/B/Cから選択したら**ゲート③**を通過。

### フェーズ2-C：SVP生成
CEOがStudio OneでMIDIを確認し「アレンジOKです」と言ってから**ゲート④**を通過。
その後 svp-generator が SynthV用SVPファイルを生成。
CEOがSynthVで声の質感を確認したら**ゲート⑤**を通過。

### フェーズ2-D：デモ評価
quality-listener がCEOとQ&Aを行いながらデモを評価します。

### フェーズ3：PV制作
concept-director が絵コンテを、visual-prompter が映像生成プロンプトを作成。
CEOがPVコンセプトを確認したら**ゲート⑥**を通過。映像素材を選択したら**ゲート⑦**を通過。

### フェーズ4：リリース準備
4エージェントが並列で動き、SNS・PR・著作権・KPIを同時処理。
CEOが全コンテンツを確認したら**ゲート⑧**を通過。

### フェーズ5：リリース当日
go_live_checklist.md のすべての⚠️がゼロになったら**ゲート⑨**を通過し、リリース。

---

## ルール体系（NOCTA 15箇条）

NOCTAの運営にあたってすべてのエージェントが守るルールです。

**R-01 数値で話す**：楽曲仕様書・SynthVパラメータはすべて数値で記述する。「エモーショナルな感じ」ではなく「BPM 88、Cマイナー、16小節、i-VI-III-VII」と書く。Studio Oneへの実装精度を上げるため。

**R-02 approved/には触れない**：drafts/にのみ保存し、outputs/approved/には自動書き込みをしない。CEOが「承認した」と言ったときのみ移動する。CEOの承認フローを守るため。

**R-03 SNSを自動投稿しない**：SNS APIへの登録・投稿を行わない。drafts/sns_calendar.md に保存して「CEO確認待ち」と明記する。誤投稿リスクを防ぐため。

**R-04 外部ツールはプロンプト文書として出力**：Suno・Midjourney・Runway・Klingを直接実行せず、outputs/prompts/にプロンプト文書を生成する。CEOが実行者であるため。

**R-05 ファイル読み込みは最小限**：セッション開始時に読むのは context.md と handoff.md のみ。他は必要になった瞬間に読む。200kのコンテキストウィンドウを節約するため。

**R-06 handoff.mdは1〜3行のみ追記**：「完了した事実」と「次のアクション」だけ書く。セッションが切れても再開できる状態を保つため。

**R-07 SynthV歌詞に音節数と注意マークを付ける**：各行末に【○音】を付ける。「っ」「ぢ」「づ」「ん（語末）」「連続母音」「長音符ー」には【要確認】を付ける。SynthVの誤読みを防ぐため。

**R-08 絵文字はコンテンツ限定**：ドキュメント・仕様書・handoff.mdには使わない。SNS投稿文のカジュアル版のみOK。プロ品質の一貫性のため。

**R-09 モデルを目的で使い分ける**：Haiku（単純タスク・handoff更新）、Sonnet（楽曲仕様書・歌詞・SNS文案、デフォルト）、Opus（SVP生成・複雑なコード・重要な判断）。コストパフォーマンスのため。

**R-10 CEOが自分でやることは提案もしない**：Studio Oneでの作曲・編曲・ミックス、SynthVでの感情調整、生ボーカル録音、映像素材の採用判断、SNS投稿の最終確認はCEOが行う。AIが「やっておきます」と言わない。役割の混乱を防ぐため。

**R-11 すべてのアウトプットは叩き台**：「これが正解です」「このまま使えます」という表現を使わない。常に「叩き台です。自由に変更してください」と添える。

**R-12 SVPはMIDI確認・アレンジ確定後のみ**：CEOが「アレンジOKです」と言うまでSVPファイルを生成しない。メロディが変わるとSVPを作り直す無駄が発生するため。

**R-13 Sunoの音源を素材として活用**：Sunoで生成したmp3はLALAL.AIで分離してdrums/bass/chord/melodyのパーツとして使う。この場合のMIDI生成はコード・メロディのみ。

**R-14 対話してから作業する**：各フェーズ開始前に /brainstorm を実行する。CEOのGoサインなしにファイル生成を開始しない。合意なしに作り始めると「歌詞もメロディもAIが勝手に作った」という状態が再発するため。

**R-15 セッションが切れても再開できる状態を保つ**：作業完了時に handoff.md を更新する。進行中タスクは drafts/ に中間ファイルとして保存する。

---

## HP管理フロー

### ブログ記事の投稿手順
1. `drafts/blog_draft.txt` に本文を書く（プレーンテキスト）
2. Claude Codeで `/blog-publish` を実行
3. タイトルを入力し、カテゴリ（music / essay / book）を選ぶ
4. プレビューを確認して「ok」と入力
5. blog-data.jsに追記され、commit/pushが実行される
6. Netlifyで手動デプロイする

ブログ記事には slug・title・cat・date・excerpt・contentHtml が含まれます。本文はプレーンテキストから自動的にHTMLに整形され、見出しタグや強調タグが挿入されます。XSS対策のため、タイトル・日付・概要文はHTMLエスケープ処理されます。

### 楽曲（Works）の追加手順
1. YouTubeに動画をアップロードする
2. `/hp-add-work [曲名] [YouTubeID]` を実行する
3. works-data.jsに追記され、commit/pushが実行される
4. Netlifyで手動デプロイする

---

## 現在進行中のプロジェクト：NuWord

NOCTAの最初の楽曲プロジェクト「NuWord」が現在進行中です。

- **読み方**：ニューワールド（SynthV Phoneme: ni-u-wa-a-r-u-do）
- **ジャンル**：Jポップ・アニメソング寄り。参考アーティストはろん・fhana・supercell
- **ターゲット**：何かを始めるすべてのアーティスト
- **世界観**：女性ボーカル。森林から冒険が始まる出発シーン。期待感を胸に抱く前向きな世界観
- **BPM / キー**：152 / C#メジャー（Sunoで実測）
- **SynthVキャラクター**：Mai
- **採用案**：差別化案A（森林のテクスチャーを音響設計に埋め込む）+ 案B（落ちサビ→ラスサビで盛り上がる構成）の混合
- **採用歌詞**：草稿A
- **現在のフェーズ**：フェーズ2-C（SVP生成待ち）
- **通過済みゲート**：①②③

**次のアクション**：CEOがStudio OneでMIDIを確認し「アレンジOKです」と伝えたら、`/phase2-svp A` を実行してSVPファイルを生成する。

---

## Claude Code運用の自動改善サイクル

NOCTAでは、AIシステム自体の品質を継続的に改善するための仕組みを構築しています。

### 公式ドキュメントレビューサイクル
`docs/best-practices-registry.md` に41件のClaude Code公式ドキュメントが登録されており、毎週月曜に1件ずつ自動でレビューされます。レビュー結果はCEOが確認し、適用するかどうかを判断します。自動適用はしません。約10ヶ月で全件完了の予定です。

優先度の高い10件（Best Practices・Memory & CLAUDE.md・Hooks・Skills・Security・Costs・Permissions・Common Workflows・Sub-agents）が最初にレビューされます。

### 依頼パターン改善サイクル
CEOの依頼習慣・作業パターンを2つの方法で観察しています。

1. **ローカル詳細分析**（`/interaction-review`）：月1回程度、CEOが手動で実行。/insightsのセッション統計＋git履歴を組み合わせた詳細分析。「繰り返し依頼しているタスク」「摩擦の発生パターン」「スキル化できる候補」を特定する。

2. **月次自動観察**（リモートトリガー）：毎月1日に自動実行。gitログから作業分布・修正頻度・ファイル変更パターンを分析。/insightsは使えないため、gitの客観データのみで判断する。

---

## コスト管理ポリシー

Claude Codeの利用コストを抑えるため、用途によってモードを使い分けています。

- **Plan Mode**（最安）：全体計画・タスク分解など、実行前に内容を確認したい場面
- **Subagent**：単発タスク（調査・1ドキュメント生成）など結果だけ必要な場面
- **Agent Teams**：複数部門の並列作業。`/phase2-music` と `/phase4-release` の年2回程度に限定

コンテキストウィンドウは200kありますが、MCPツールを多く有効にするほど実質的なウィンドウが縮小します。ツール総数は常に80以下に維持します。

---

## セキュリティ上の制約

- **approved/ への自動書き込み禁止**：承認されていないファイルが本番に混入しないよう
- **SNS自動投稿禁止**：誤投稿防止
- **APIキー・パスワードをレポートに含めない**：git履歴に機密情報が残らないよう
- **外部ツールはプロンプト出力のみ**：AIが意図しないコンテンツを外部に送出しないよう
- **.gitignore設定**：.env・*.key・*.pem・*.p12・*.pfx・secrets/・credentials/・sample/・*.mp4 を除外

---

## よくある操作と注意点

**「セッションが切れたあとどこから再開すればいい？」**
`/music-status` で現状確認。または `context.md` と `handoff.md` を読む。

**「コンテキストが重くなってきた」**
`/music-reset-context` を実行して必要最小限の情報に圧縮して再開する。

**「git操作でエラーになる」**
作業ディレクトリが `project_NOCTA/` 内にあるか確認する。`git rev-parse --show-toplevel` で確認できる。`/Users/fghmacbook013/NOCTA/` からgit操作をするとエラーになる（そこはgitリポジトリではない）。

**「自動レポートはどこに保存される？」**
`drafts/` 配下。`best-practices-report-*.md`（週次）と `interaction-review-monthly-*.md`（月次）。

**「Netlifyにデプロイするには？」**
`https://app.netlify.com` を開いてNOCTAサイトを選択し、「Trigger deploy」→「Deploy site」を実行する。commit/pushだけでは本番反映されない（手動デプロイ方式）。

**「スキルを追加したい」**
`~/.claude/commands/` 内に新しい `.md` ファイルを作成する。ファイル名がコマンド名になる。内容にはプロンプトとして機能する指示を書く。

---

## 参照一覧

- GitHubリポジトリ：https://github.com/kutakuta1001/NOCTA
- Netlify管理：https://app.netlify.com
- リモートトリガー管理：https://claude.ai/code/scheduled
- 週次レポート保存先：project_NOCTA/drafts/best-practices-report-*.md
- 月次レポート保存先：project_NOCTA/drafts/interaction-review-monthly-*.md
- ローカルレポート保存先：project_NOCTA/drafts/interaction-review-*.md
