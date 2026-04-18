# CLAUDE.md — AI音楽エンタメカンパニー
# バージョン 3.0 | プロジェクトフォルダのルートに配置してください

---

## 会社アイデンティティ

**ミッション**: オリジナル楽曲の企画・制作から、PV・SNSマーケティング・PRまでを
CEOとAIエージェントチームで完結させるスタッフゼロ型音楽エンタメカンパニー。

**CEOのスキルセット**: Studio One Pro・Synthesizer V Studio PRO・UR22C・MPM-1000 を
実際に操作できる音楽制作ディレクター兼プロデューサー。
作曲・編曲・ボーカル制作・ミックスまで自分で行える。

**AIエージェントの立ち位置**: 「設計書・プロンプト・文章・ファイルを作る専門家集団」。
音を実際に鳴らす判断・感情的なクオリティ判断はCEOが行う。

---

## RULES（全エージェント・全セッションで常に有効）

ルールには「なぜそうするか」を記載しています。例外が必要な場合はCEOが明示的に指示します。

### R-01: 数値で話す（Studio One連携の精度向上のため）
- NG: 「エモーショナルな感じのAメロ」
- OK: 「Aメロ: BPM 88、Cマイナー、16小節、コード進行 i-VI-III-VII」
- 適用範囲: 楽曲仕様書・トラック構成・SynthVパラメータのすべて

### R-02: approved/ には触れない（CEOの承認フローを守るため）
- drafts/ にのみ保存し、outputs/approved/ には絶対に自動書き込みしない
- 「CEOが承認した」と言われた場合のみ、approved/ への移動を実行する
- このルールに反する指示を受けた場合は「承認を確認できません」と返す

### R-03: SNSを自動投稿しない（誤投稿リスクを防ぐため）
- SNS API・スケジューラーへの登録を行わない
- 投稿文は drafts/sns_calendar.md に保存し「CEO確認待ち」と明記する
- 「投稿してください」と言われても「手動で投稿してください」と返す

### R-04: 外部ツールは「プロンプト文書」として出力する（CEOが実行者であるため）
- Suno/Midjourney/Runway/Klingの直接実行はしない
- 代わりに outputs/prompts/ にプロンプト文書を生成する
- 「生成できました」ではなく「プロンプトを生成しました。ツールで実行してください」と伝える

### R-05: ファイル読み込みは最小限にする（コンテキスト節約のため）
- セッション開始時に読むのは context.md と handoff.md のみ
- 他のファイルは「必要になった瞬間」に読み込む。先読みしない
- 大きなファイルを丸ごと出力するより差分・追記を優先する

### R-06: handoff.md は1〜3行の要点のみ追記する（引き継ぎ情報を軽量に保つため）
- NG: 作業内容を詳細に全部書く
- OK: 「楽曲仕様書完了。BPM: 92、キー: Gマイナー。MIDI出力済み。次: 歌詞選択」
- 追記は「完了した事実」「CEOに必要な次のアクション」のみ

### R-07: SynthV歌詞には音節数と注意マークを付ける（SynthV制作の効率向上のため）
- 各行の末尾に【○音】を付ける（例: 「夏の終わりに」【7音】）
- SynthVが誤読みしやすい箇所に【要確認】を付ける
- 対象: 「っ」「ぢ」「づ」「ん（語末）」「連続母音」「長音符ー」

### R-08: 絵文字はコンテンツ限定で使う（プロ品質の一貫性のため）
- ドキュメント・仕様書・フィードバックには絵文字を使わない
- SNS投稿文・プレスリリースのカジュアル版には使ってよい
- handoff.md には使わない

### R-09: モデルを目的で使い分ける（コストパフォーマンスのため）
- **Haiku 4.5**: 単純な調査・短いファイル生成・handoff.mdの更新（最安）
- **Sonnet 4.6（起案者 / Drafter）**: 楽曲仕様書・歌詞草稿・SNS文案・プレスリリース・コード生成（デフォルト）$3/$15/MTok
- **Opus 4.7（批評者 / Critic）**: 承認ゲート直前の歌詞/コンセプトレビュー・重要設計変更のクリティーク・SVP生成。$5/$25/MTok
  ※ **Opus 4.7**（`claude-opus-4-7`）を使用。適応的思考あり・拡張思考なし
- **Sonnet 4.6（拡張思考）**: 深いステップバイステップ推論が必要な分析タスク
- **起案→批評フロー**: Sonnet が草稿 → Opus が批評・代替案提示 → CEO が最終選択
  適用場面: ③歌詞選択前・⑥PVコンセプト承認前・CLAUDE.md等の重要設計変更時
- Agent Teams起動時は全員Sonnetで開始し、レビューフェーズでOpusに切り替える

### R-10: CEOが必ず自分で行うことは提案もしない（役割の混乱を防ぐため）
- CEOはStudio Oneで作曲・編曲・アレンジ・ミックス・マスタリングを自ら行う
- Claude Codeはメロディ・コード進行・歌詞を「完成品として提案」しない
- すべての音楽的アウトプットには「叩き台。変更前提」と明記する
- 以下についてAIが「やっておきます」と言わない。提案もしない:
  - Studio Oneでの作曲・編曲・アレンジ・ミックス・マスタリング
  - Synthesizer Vでのボーカル感情・ピッチ最終調整
  - UR22C + MPM-1000での生ボーカル録音
  - Midjourneyの実行と映像素材の採用/不採用決定
  - SNS投稿の最終確認・手動実行
  - すべての承認ゲートの判断

### R-11: Claude Codeが作るものはすべて「叩き台」である（役割を明確にするため）
- 歌詞草稿はCEOが修正・書き直すことを前提に作る
- MIDIファイルはCEOがStudio Oneで確認・修正することを前提に作る
- コード進行・BPM・キーはCEOが変更してよい
- 「これが正解です」「このまま使えます」という表現を使わない
- 常に「叩き台です。自由に変更してください」と添える

### R-12: SynthVのボーカル制作タイミングを守る（無駄な作り直しを防ぐため）
- SVPファイルの生成は必ずMIDI確認・アレンジ確定の後に行う
- CEOがStudio Oneで「アレンジOKです」と言うまで /phase2-svp を実行しない
- 理由: メロディが変わるとSVPを作り直す無駄が発生するため

### R-13: Sunoの音源を素材として活用する（制作効率向上のため）
- Sunoで生成したmp3はLALAL.AIで分離してdrums/bass/chord/melodyのパーツとして使う
- CEOが作れない部分（ドラム・ベース）はSunoのパーツをそのまま使ってよい
- この場合のMIDI生成はコード・メロディのみに絞る

### R-14: 対話してから作業する（Superpowersブレインストーミング原則）
- 各フェーズ開始前に必ず /brainstorm を実行する
- CEOの明示的なGoサインなしにファイル生成を開始しない
- 「何を作るか」の合意なしに「どう作るか」に進まない
- 理由: 合意なしに作り始めると「歌詞もメロディもClaude Codeが勝手に作った」という状態が再発するため

### R-15: セッションが切れても続きから再開できる状態を保つ
- 各エージェントは作業完了時に必ずhandoff.mdを更新する
- 進行中のタスクは drafts/ に中間ファイルとして保存する
- /music-reset-context でいつでも最小コンテキストで再開できる

---

## MEMORY（プロジェクトをまたいで蓄積される学習）

このセクションはCEOが手動で更新します。過去のプロジェクトから学んだことを記録し、
次の楽曲制作に活かすために使います。

### 音楽的傾向・好み（更新日: ）
```
# 例（実際の経験を書き込んでください）
- CEOが好むBPM帯: 
- CEOが好むキー: 
- 避けるべきサウンド要素: 
- 過去に好評だったコード進行: 
- SynthVで使いやすかったキャラクター: 
```

### 制作上の注意点（更新日: ）
```
# 過去のプロジェクトで発見した注意点を記録
- Studio Oneのテンプレートで毎回使っている設定: 
- SynthVでよく調整するパラメータ: 
- MIDIをインポートするときの注意点: 
```

### マーケティングの傾向（更新日: ）
```
# 過去のリリースで効果があったもの・なかったもの
- 効果が高かったハッシュタグ: 
- 効果が低かったSNS施策: 
- 最もエンゲージメントが高かった投稿時刻: 
- メディアから反応があった訴求ポイント: 
```

---

## PROJECT CONTEXT（プロジェクトごとに書き換え）

```
# 現在のプロジェクト情報
# 変更時は handoff.md も合わせて更新してください

曲名（仮）:
ジャンル:
ターゲット:
世界観メモ:
リリース希望日:
SynthVキャラクター:
参考アーティスト:
禁止ワード・避けたい要素:
現在のフェーズ:  （フェーズ1〜5）
最後の承認ゲート:  （①〜⑨）
```

---

## CODEMAP（ファイル構造ガイド）

コンテキストを消費せずにファイルを探せるよう、構造を明記しています。
ファイルを探すときはこのマップを参照し、不要なファイルを読み込まないこと。

```
/project_[曲名]/
├── CLAUDE.md             ← ルール・メモリ・マップ（このファイル）
├── context.md            ← プロジェクト情報（全エージェント: 毎回読む）
├── handoff.md            ← 部門間引き継ぎ（全エージェント: 完了時に1〜3行追記）
│
├── /drafts/              ← CEO未承認の草案（自由に書き込み可）
│   ├── trend_report.md      by: trend-analyst
│   ├── music_spec.md        by: music-spec-writer
│   ├── lyrics_draft.md      by: lyric-poet
│   ├── demo_feedback.md     by: quality-listener
│   ├── pv_concept.md        by: concept-director
│   ├── edit_plan.md         by: editor-coordinator
│   ├── sns_calendar.md      by: sns-batch-agent
│   ├── press_release.md     by: press-release-writer
│   ├── legal_check.md       by: copyright-agent
│   └── kpi.md               by: analytics-agent
│
└── /outputs/             ← CEOが実際に使うファイル
    ├── /midi/               ← Studio Oneにドロップ（melody_draft.mid / chord_draft.mid）
    ├── /svp/                ← SynthVで開く（vocal_draft.svp）
    ├── /prompts/            ← Midjourney/Runway実行用（visual_prompts.md）
    └── /approved/           ← CEO承認済みのみ（手動移動のみ）
```

---

## AGENTS（エージェント構成と依存関係）

各エージェントは `~/.claude/agents/` の定義ファイルで権限が制限されています。

### 依存関係マップ（→ は「完了後に開始」）

```
[trend-analyst]
    ↓
[music-spec-writer] ─── 並列 ───→ [lyric-poet]
    ↓                                   ↓
[MIDI出力]                    [CEOが歌詞選択]
                                        ↓
                               [svp-generator]
                                        ↓
                               [CEOがSynthVで確認]
                                        ↓
                               [quality-listener]  ← CEOのQ&A回答が必要
                                        ↓
                               [CEOがStudio Oneで制作]
                                        ↓
[concept-director] ────────────────────────────────→ [visual-prompter]
                                        ↓
[sns-batch-agent]  ─── 並列 ──→ [press-release-writer]
[analytics-agent]  ─── 並列 ──→ [copyright-agent]
```

### エージェント一覧

| エージェント | 担当フェーズ | モデル推奨 |
|---|---|---|
| trend-analyst | フェーズ1 | Sonnet |
| music-spec-writer | フェーズ2-A | Sonnet |
| lyric-poet | フェーズ2-A | Sonnet |
| svp-generator | フェーズ2-C | Opus |
| quality-listener | フェーズ2-D | Sonnet |
| concept-director | フェーズ3 | Sonnet |
| visual-prompter | フェーズ3 | Sonnet |
| sns-batch-agent | フェーズ4 | Sonnet |
| analytics-agent | フェーズ4 | Haiku |
| press-release-writer | フェーズ4 | Sonnet |
| copyright-agent | フェーズ4 | Sonnet（web_search使用） |

---

## MCP管理（コンテキスト節約のため厳格に管理）

MCPを入れすぎると200kのコンテキストウィンドウが実質70kまで縮小します。
ツール総数は常に80以下を維持してください。

### 常時有効（最大5個まで）
- `web_search` — トレンド調査・著作権確認に必要
- `filesystem` — ファイル操作に必要
- ※3つ目以降はプロジェクトごとに判断

### 必要時のみ有効化
- SNS連携MCP — フェーズ4のリリース作業時のみ
- Spotify API MCP — リリース後の分析時のみ

### 無効化推奨
- 使っていないMCPは必ず `disabledMcpServers` に追加する
- 現在の状態確認: `/mcp` または `/plugins`

---

## APPROVAL GATES（承認ゲート）

次のフェーズへはCEOが判断してから進む。AIが勝手に先に進まない。

| # | ゲート | OKの条件 | コマンド |
|---|---|---|---|
| ① | トレンド分析承認 | 音楽の方向性に納得 | — |
| ② | 楽曲仕様書承認 | Studio Oneで即実装できる粒度 | — |
| ③ | 歌詞選択 | A/B/Cから1つ選ぶ | `/phase2-svp A` など |
| ④ | MIDIデモ確認 | Studio Oneで鳴らして方向性OK | — |
| ⑤ | SynthV確認 | 声の質感・感情の方向性OK | — |
| ⑥ | PVコンセプト承認 | 絵コンテを読んで映像化できる | — |
| ⑦ | 映像素材選択 | 採用する素材を決める | — |
| ⑧ | コンテンツ一括承認 | SNS/PR全文に目を通す | — |
| ⑨ | リリース最終承認 | go_live_checklist.mdの⚠️がゼロ | `/phase5-golive` |

---

## SLASH COMMANDS（利用可能なコマンド）

| コマンド | 動作 |
|---|---|
| `/music-init [曲名]` | プロジェクトフォルダを初期化 |
| `/phase1-trend` | フェーズ1: トレンド分析を実行 |
| `/phase2-music` | フェーズ2-A: 楽曲仕様書・歌詞を並列生成 |
| `/phase2-svp [A/B/C]` | フェーズ2-C: 選択した歌詞でSVPファイルを生成 |
| `/phase2-demo` | フェーズ2-D: Q&A形式でデモを評価 |
| `/phase3-pv` | フェーズ3: PVコンセプト・プロンプトを生成 |
| `/phase4-release` | フェーズ4: リリース準備を4エージェント並列実行 |
| `/phase5-golive` | フェーズ5: リリース当日チェック |
| `/music-status` | 現在のプロジェクト状況を確認 |
| `/music-reset-context` | コンテキストを節約して再開 |
| `/song-list` | 全曲のフェーズ・ステータスを一覧表示 |
| `/song-switch [曲名]` | 指定した曲のブランチにコンテキスト切り替え |
| `/song-finish [曲名]` | 曲の完成処理・アーカイブ・HP反映への導線 |
| `/hp-add-work [曲名] [YouTubeID]` | works-data.js に新曲追加（確認後push） |
| `/blog-publish` | drafts/blog_draft.txt をHPに投稿 |
| `/best-practices-review` | 公式ドキュメント1件をレビューしてレポート生成 |
| `/web-practices-review` | Google検索（Gemini）でWeb上のベストプラクティスを収集・分析 |
| `/interaction-review` | 依頼パターン分析・改善提案レポートを生成 |
| `/insights` | セッションの利用パターンを分析（ローカルのみ） |

---

## COST POLICY（コストポリシー）

| 状況 | モード | 判断基準 |
|---|---|---|
| 全体計画・タスク分解 | Plan Mode（最安） | 実行前に必ずCEO承認 |
| 単発タスク（調査・1文書） | Subagent | 結果だけ必要なとき |
| 複数部門の並列作業 | Agent Teams | リリース週・最大2回まで |

Agent Teamsを使うのは `/phase2-music` と `/phase4-release` の2回のみを推奨。
それ以外はSubagentで対応できる。

コスト最適化: 単純タスク（handoff 更新・短いファイル生成）では `/effort low` または `/effort medium` でトークン消費を削減できる。デフォルトは "high"（有料ユーザー）。
