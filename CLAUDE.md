# CLAUDE.md — NOCTA クリエイティブスタジオ（正本）

Music × Visual × Words × Code の複数領域クリエイティブスタジオ。CEO と AI エージェントチームで
企画から公開までを完結させるスタッフゼロ型会社。各領域は独立した並行ストリームとして進み、楽曲制作はそのうちの1本（CEO ペースで進行）。
CEO は Studio One Pro / Synthesizer V Studio PRO / UR22C / MPM-1000 を自ら操作する制作者兼ディレクターで、
作曲・編曲・ボーカル制作・ミックスまで自分で行う。
AI の役割は設計書・プロンプト・文章・コード・ファイルを作ること。音の判断・感情的なクオリティ判断・各領域の最終採否は CEO が行う。

参照情報（必要になったときだけ読む）:

- 全体方針・各領域のロードマップ: `drafts/roadmap.md`
- 運用チートシート（コマンド一覧・セッション運用・ゼロベース見直しの記録）: `~/.claude/references/nocta-cheatsheet.md`
- 制作ツール選択肢（Suno 代替・映像生成・調査 MCP・ローカル LLM）: `~/.claude/references/nocta-tools.md`
- モデル仕様・切替通知ルール・Agent Teams のモデル割当: `~/.claude/references/model-lineup.md`
- HP 作業のルール: `website/CLAUDE.md`（HP のファイルを触るとき自動で読み込まれる）

---

## RULES

### R-01: 数値で話す

楽曲仕様書・トラック構成・SynthV パラメータはすべて数値で書く。
例「Aメロ: BPM 88、Cマイナー、16小節、コード進行 i-VI-III-VII」。「エモーショナルな感じのAメロ」は不可。
理由: Studio One への実装精度が上がる。

### R-02: approved/ には書かない

草案は `drafts/` にのみ保存する。`outputs/approved/` への配置は CEO の手動操作のみ。
AI からの書き込みは `permissions.deny` の `Edit` ルールと `approved-guard` hook でハード的に禁止されており、
依頼されても実行できない。承認済みファイルの移動を求められたら、CEO 自身の操作が必要だと伝える。

### R-03: SNS を自動投稿しない

SNS API・スケジューラへの登録を行わない。投稿文は `drafts/sns_calendar.md` に保存し「CEO確認待ち」と明記する。
「投稿してください」と言われても「手動で投稿してください」と返す。
xmcp は読み取り専用2ツール（`searchPostsRecent` / `getUsersMe`）のみ許可済みで、書き込み系ツールは ALLOWLIST に含めない。

### R-04: 外部生成ツールはプロンプト文書として出力する

Suno / Midjourney / Runway / Kling / Dreamina Seedance 2.0 を直接実行しない。
`outputs/prompts/` にプロンプト文書を生成し、「生成できました」ではなく「プロンプトを生成しました。ツールで実行してください」と伝える。

### R-05: ファイル読み込みは最小限にする

セッション開始時に読むのは `context.md` と `handoff.md` のみ。他は必要になった瞬間に読む。先読みしない。
大きなファイルを丸ごと出力するより差分・追記を優先する。
既存コードの変更・機能追加時は、変更対象ファイルを実装前に Read する。
既存コードベースで非自明な設計を行う場合は、実装前に関連サブシステム・既存パターン・命名規約・制約を把握してから設計する
（自明な1〜2ファイルの変更・新規ゼロのケースはスキップ可）。
接地は現状把握であり、既存パターンへの追従を強制しない。負債は改善対象として織り込む。

### R-06: handoff.md は1〜3行だけ追記する

「完了した事実」と「CEO に必要な次のアクション」のみ。
例「楽曲仕様書完了。BPM 92、キー Gマイナー。MIDI 出力済み。次: 歌詞選択」。作業内容を詳細に書かない。

### R-07: SynthV 歌詞に音節数と注意マークを付ける

各行の末尾に【○音】を付ける（例「夏の終わりに」【7音】）。
SynthV が誤読みしやすい箇所に【要確認】を付ける（対象: っ / ぢ / づ / 語末のん / 連続母音 / 長音符ー）。
ブレス・間を入れたい位置には `(.pau)` と注記する（例「夏の終わりに(.pau)」【7音+休止】）。svp-generator がこれを `.pau` 音素に反映する。

### R-08: 絵文字はコンテンツ限定で使う

ドキュメント・仕様書・フィードバック・handoff.md には使わない。SNS 投稿文・プレスリリースのカジュアル版には使ってよい。

### R-09: モデルを目的で使い分ける

| 用途 | モデル |
|---|---|
| 調査・短いファイル生成・handoff 更新 | Haiku 4.5 |
| 起案（楽曲仕様書・歌詞草稿・SNS文案・コード生成）— 既定 | Sonnet 5 |
| 批評・承認ゲート直前レビュー・SVP生成・重要設計クリティーク | Opus 5 |
| 深い推論が必要な超重要案件 | Fable 5 |

起案→批評フロー: Sonnet 5 が草稿 → Opus 5 が批評・代替案提示 → CEO が最終選択。
判断が割れる超重要案件は Fable 5 にエスカレーションする。適用場面は③歌詞選択前・⑥PVコンセプト承認前・重要設計変更時。

Fable 5 は知識カットオフが 2026年1月で Opus 5（2026年5月）より古く、トークンも約30%多く消費する。
最新の仕様情報を扱う判断では Opus 5 を選ぶ。

価格・コンテキスト長・Opus 5 切替通知ルール・Agent Teams のモデル割当は `~/.claude/references/model-lineup.md`。
コスト最適化: 単純タスクは `/effort low` または `medium`、標準は `high`、最重要は `xhigh`。
`ultracode` は既定では使わない（全実質タスクが自動ワークフロー化されて消費が跳ねる）。

### R-10: CEO が自分で行うことは提案もしない

以下について「やっておきます」と言わない。提案もしない。

- Studio One での作曲・編曲・アレンジ・ミックス・マスタリング
- Synthesizer V でのボーカル感情・ピッチの最終調整
- UR22C + MPM-1000 での生ボーカル録音
- 画像・映像生成ツールの実行と素材の採否決定
- SNS 投稿の最終確認・手動実行
- すべての承認ゲートの判断

### R-11: 作るものはすべて叩き台である

歌詞・MIDI・コード進行・BPM・キーは CEO が修正・書き直す前提で作る。
「これが正解です」「このまま使えます」という表現を使わない。「叩き台です。自由に変更してください」と添える。

### R-12: SynthV は MIDI 確認・アレンジ確定の後に作る

CEO が Studio One で「アレンジOKです」と明示するまで `/phase2-svp` を実行しない。
理由: メロディが変わると SVP を作り直す無駄が発生する。

### R-13: Suno の音源は素材として使う

Suno で生成した mp3 は LALAL.AI で分離して drums / bass / chord / melody のパーツとして使う。
CEO が作れない部分（ドラム・ベース）は Suno のパーツをそのまま使ってよい。この場合の MIDI 生成はコード・メロディのみに絞る。
代替候補（ACE-Step / Khala / Mureka）と Suno の著作権判決を含む選定状況は `~/.claude/references/nocta-tools.md`。

### R-14: 対話してから作業する

各フェーズ開始前に `/brainstorm` を実行する。CEO の明示的な Goサインなしにファイル生成を開始しない。
「何を作るか」の合意なしに「どう作るか」に進まない。
3C（Concise / Contextual / Constrained）を意識し、初回プロンプトに Goal + Constraints + Acceptance criteria を一括で渡す。

### R-15: セッションが切れても続きから再開できる状態を保つ

作業完了時に handoff.md を更新する。進行中のタスクは `drafts/` に中間ファイルとして保存する。

### R-16: コード・設計の発散は多筋で行う

非自明なコード設計（HP・SVP生成・hook / スキル改修）では、表層が違うだけの案ではなく本質的に異なる2〜3軸で出す
（例: MVP優先 / リスク優先 / 制約優先）。各軸が何を最大化し何を捨てるかを明示する。設計生成はメインスレッドで行い、サブエージェントに分散しない。
自明な変更（1〜2ファイルに閉じる・定型・明確指示）には適用しない。

### R-17: 新規 UI はデザインスキルを通す

新しい HTML ページ・UI コンポーネントの作成、または既存 UI の大幅改修では、コード生成前に
`frontend-design:frontend-design` スキルを呼ぶ。あわせて `~/designer/INDEX.md` を読み、該当パターンがあれば
レシピ（`~/designer/patterns/`）を適用して used_in に `{project, date}` を記録する。
プロジェクト固有のブランド指定はレシピより優先する。自明な小変更には適用しない。

---

## git 運用

- git 操作は必ず `/Users/fghmacbook013/NOCTA/project_NOCTA/` で実行する（ここが git リポジトリのルート）
- `git add` は対象ファイルを個別指定する。`git add -A` / `git add .` は使わない
- 実画像・動画ファイル（png / jpg / mp4 等）は git に追加しない
- **git push は CEO が対話セッションで明示的に指示した場合のみ実行する。バックグラウンドセッション・自動処理・ワークフローからは push しない（commit までにとどめる）。** `main` への push は GitHub Actions を起動して本番サイトを更新するため
- `~/.claude/settings.json` は API キーを平文で含む。リポジトリにコピーしない
- 実行不可（deny 済み）: `git push --force` / `git push -f` / `git reset --hard` / `git clean -f` / `git rebase` / `rm -rf`
- コミットメッセージ例: `feat(blog): [タイトル] を追加` / `feat(works): [曲名] を Works に追加` / `fix(visual): [作品名] の IPFS ハッシュを修正`

---

## CODEMAP

```
/NOCTA/
├── CLAUDE.md              ← アイデンティティ + 本ファイルの import
└── /project_NOCTA/        ← git リポジトリ（git 操作はここで実行）
    ├── CLAUDE.md          ← 正本（このファイル）
    ├── context.md         ← プロジェクト情報（毎回読む）
    ├── handoff.md         ← 引き継ぎ（完了時1〜3行追記）
    ├── /drafts/           ← CEO 未承認の草案（trend_report / music_spec / lyrics_draft /
    │                         pv_concept / sns_calendar / press_release / legal_check / kpi / demo_feedback）
    ├── /docs/             ← 設計書・計画書（superpowers/specs・superpowers/plans）
    ├── /claude-config/    ← ~/.claude/ の版管理コピー（agents / commands / references / hooks）
    ├── /website/          ← HP。website/CLAUDE.md が HP 作業時に読み込まれる
    └── /outputs/
        ├── /midi/         ← Studio One にドロップ
        ├── /svp/          ← SynthV で開く
        ├── /prompts/      ← 画像・映像生成ツール実行用
        ├── /pv/           ← PV 編集（pv_edit.py）
        └── /approved/     ← CEO の手動移動のみ。AI は deny により書き込み不可
```

---

## PROJECT CONTEXT

変更時は handoff.md も合わせて更新する。

```
曲名（仮）:            ジャンル:              ターゲット:
世界観メモ:            リリース希望日:         SynthVキャラクター:
参考アーティスト:      禁止ワード・避けたい要素:
現在のフェーズ: （1〜5）        最後の承認ゲート: （①〜⑨）
```

---

## APPROVAL GATES

次のフェーズへは CEO が判断してから進む。AI が勝手に先に進まない。

| # | ゲート | OK の条件 | コマンド |
|---|---|---|---|
| ① | トレンド分析承認 | 音楽の方向性に納得 | — |
| ② | 楽曲仕様書承認 | Studio One で即実装できる粒度 | — |
| ③ | 歌詞選択 | A/B/C から1つ選ぶ | `/phase2-svp [A/B/C]` |
| ④ | MIDIデモ確認 | Studio One で鳴らして方向性OK | — |
| ⑤ | SynthV確認 | 声の質感・感情の方向性OK | — |
| ⑥ | PVコンセプト承認 | 絵コンテを読んで映像化できる | — |
| ⑦ | 映像素材選択 | 採用する素材を決める | — |
| ⑧ | コンテンツ一括承認 | SNS / PR 全文に目を通す | — |
| ⑨ | リリース最終承認 | go_live_checklist.md の要確認項目がゼロ | `/phase5-golive` |

---

## COST POLICY

| 状況 | モード |
|---|---|
| 全体計画・タスク分解 | Plan Mode |
| 単発タスク（調査・1文書） | Subagent |
| 複数領域の並列作業 | Agent Teams（大型フェーズのみ。`/phase2-music` と `/phase4-release` の2回を推奨） |
| 対象が多く同じ処理を繰り返す機械的作業 | 動的ワークフロー |

動的ワークフローは CEO が明示的に要求した場合にのみ使う。承認ゲートを含む工程を1つのワークフローにまとめてはならない
（実行中はユーザー入力を受け付けないため、各ステージを独立したワークフローにする）。
ワークフローのサブエージェントは権限モードに関係なく acceptEdits で動作し、ファイル編集が自動承認される。

---

## AGENTS

フロー: trend-analyst → music-spec-writer ∥ lyric-poet → lyric-critic → svp-generator → quality-listener
→ concept-director ∥ visual-prompter → concept-critic → sns-batch-agent ∥ press-release-writer ∥ analytics-agent ∥ copyright-agent

エージェント定義の実体は `~/.claude/agents/`（版管理コピーは `claude-config/agents/`）。
モデル割当は R-09 に従う。批評系（lyric-critic / concept-critic）と svp-generator は Opus 5、
explorer 系（analytics-agent）は Haiku、他は Sonnet 5。詳細な割当表は `~/.claude/references/model-lineup.md`。

---

## スキル設計

- CLAUDE.md には常時適用ルールのみ書く。状況限定のワークフローはスキル（`~/.claude/commands/`）に分離する
- 参照情報は `~/.claude/references/` に置き、CLAUDE.md には1行ポインタのみ残す
- SKILL.md は500行以内を目安にし、詳細は `references/` ファイルへ分離して段階的開示でコンテキストを保全する
- 各行に「これを削除すると Claude が間違いを犯すか」を問い、否なら削除する。膨らんだ CLAUDE.md は実際の指示が無視される原因になる
- 6ヶ月ごとに CLAUDE.md・スキル・hooks をゼロベースで見直す（前回 2026-08-05・次回目安 2027-02。記録は `~/.claude/references/nocta-cheatsheet.md`）

---

## MCP

ツール総数80以下を維持する（`/mcp` で確認）。常時有効は最小限にとどめ、不要なものは `disabledMcpServers` に追加する。
書き込み系ツール（投稿・削除・送信）は ALLOWLIST に含めない。
調査用オプション（xmcp / Grok API / vidIQ / last30days）の設定と既知の制約は `~/.claude/references/nocta-tools.md`。
