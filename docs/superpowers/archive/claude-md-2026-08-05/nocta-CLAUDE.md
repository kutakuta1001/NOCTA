# CLAUDE.md — NOCTA クリエイティブスタジオ

## アイデンティティ
Music × Visual × Words × Code の複数領域クリエイティブスタジオ。
CEOとAIエージェントチームで企画〜制作〜公開を完結させるスタッフゼロ型会社。
各領域は独立した並行ストリームとして進む（楽曲制作はそのうちの1ストリームで、CEOペースで進行）。
CEOはStudio One Pro / Synthesizer V / UR22C / MPM-1000 を自ら操作できる制作者であり、HP・アプリ・ビジュアルのディレクションも行う。
AIの役割: 設計書・プロンプト・文章・コード・ファイルを作る。音の判断・感情判断・最終採否はCEOが行う。
（楽曲フェーズのワークフローは下記の通り維持。Visual/Apps/Words/Code は各領域のスキルで随時進める）

---

## RULES（全エージェント・全セッションで常に有効）

### R-01: 数値で話す
楽曲仕様書・SynthVパラメータはすべて数値で記述。例: 「Aメロ: BPM 88、Cマイナー、16小節、i-VI-III-VII」

### R-02: approved/ には触れない
drafts/ にのみ保存。「CEOが承認した」と言われた場合のみ approved/ へ移動。

### R-03: SNSを自動投稿しない
投稿文は drafts/sns_calendar.md に保存し「CEO確認待ち」と明記。自動投稿・API登録しない。

### R-04: 外部ツールはプロンプト文書として出力
Suno/Midjourney/Runway/Kling/Dreamina Seedance 2.0 は直接実行しない。outputs/prompts/ にプロンプト文書を生成する。
（T2V選択肢: Runway / Kling 3.0 Pro / Dreamina Seedance 2.0。品質・コスト比較して使い分ける）

### R-05: ファイル読み込みは最小限
セッション開始時は context.md と handoff.md のみ読む。他は必要になった瞬間に読む。
既存コードへの変更・機能追加時は、変更対象ファイルを実装前に Read して関連ファイルを把握する（コードベース調査フェーズを設ける）。
既存コードベースで**非自明な設計**を行う場合は、実装前に Explore（または対象ファイル群の Read）で接地する — 関連サブシステム・既存パターン・命名規約・制約を把握してから設計する。ただし接地は「現状把握」であり既存パターンへの追従を強制しない（負債は改善対象として織り込む）。自明な1-2ファイルの変更・新規ゼロのケースはスキップ可。

### R-06: handoff.md は1〜3行のみ追記
「完了した事実」と「次のアクション」のみ。絵文字は使わない。
例: 「楽曲仕様書完了。BPM: 92、Gマイナー。MIDI出力済み。次: 歌詞選択」

### R-07: SynthV歌詞に音節数と注意マークを付ける
各行末に【○音】を付ける。誤読みしやすい箇所（っ/ぢ/づ/ん語末/連続母音/長音）に【要確認】。
ブレス・間（ま）を意図的に入れたい位置には `(.pau)` と注記する（例: 「夏の終わりに(.pau)」【7音+休止】）。svp-generator はこの注記を `.pau` 音素として SynthV に反映する。

### R-08: 絵文字はコンテンツ限定
ドキュメント・仕様書・handoff.md には使わない。SNS投稿文・プレスリリースのカジュアル版のみOK。

### R-09: モデルを目的で使い分ける
- **Haiku 4.5**: 調査・短いファイル生成・handoff更新（最安・$1/$5/MTok・コンテキスト200k・拡張思考対応あり・ナレッジカットオフ2025年2月）。phase1-trend では調査・ファイル生成のみに使用し、トレンド内容の判断はSonnet 5以上に委ねる。
- **Sonnet 5（起案者 / Drafter）**: 楽曲仕様書・歌詞草稿・SNS文案・コード生成（デフォルト）`claude-sonnet-5`・$3/$15/MTok（導入価格 $2/$10・2026-08-31まで）・コンテキスト1M・最大出力128k・ナレッジカットオフ2026年1月・適応的思考あり（拡張思考なし）。旧 Sonnet 4.6 から移行（2026-07-04）
- **Fable 5（最上位・深い推論枠）**: `claude-fable-5`・$10/$50/MTok・Anthropic 最高性能の一般提供モデル（Mythos級・Opus の上位）。輸出管理による断続提供リスクは残るが **2026-07-29 時点で GA 継続・終了日未定**（旧想定「2026-07-07 以降利用不可」は実現せず）。**深い推論が必要なタスク（超重要クリティーク・歌詞・PVコンセプト・重要設計）では第一候補**として `/model claude-fable-5` で手動選択。恒常 fallback は Opus 5
- **Opus 5（批評者 / Critic）**: 承認ゲート直前の歌詞/コンセプトレビュー・重要設計変更のクリティーク・SVP生成。`claude-opus-5`・$5/$25/MTok（Opus 4.8 と同価格）
  ※ 2026-07-24 GA・公式掲載済み。適応的思考あり・拡張思考なし・コンテキスト1M tokens（≒555k words）・最大出力 128k tokens・ナレッジカットオフ2026年5月・SWE-bench Pro 79.2%（報道値・Opus 4.8 は 69.2%）
  Batch API betaヘッダー（output-300k-2026-03-24）使用時はOpus 5/Sonnet 5ともに最大300k tokens出力可能
  最重要レビュー時（③歌詞・⑥PVコンセプト）は `/effort xhigh` を付与して最大性能で実行
  コーディング・エージェント系タスク（SVP生成・HP作業・Agent Teams起動）にも `/effort xhigh` 推奨
  /fast コマンドで同じ知能を高速で利用可能（Fastモード: $10/$50/MTok・対象は Opus 5・4.8）
  hooksから `CLAUDE_EFFORT` 環境変数を参照可能（v2.1.133〜）。フェーズ自動判定hookの将来設計に活用できる。
  出力が64k超になる見込みのタスク（大型SVP生成・長文仕様書等）でもOpus 5を優先
  デザインデフォルト: クリーム背景・セリフ体（NuWordのデザイン言語と一致・Opus 4.8 からの運用ノウハウを踏襲）
  注意: temperature / top_p / top_k はサポートなし（非デフォルト値を設定すると400エラー）。拡張思考（budget_tokens）も不可 → `thinking: {type: "adaptive"}` + `/effort` で制御
  Opus 4.8（`claude-opus-4-8`）はレガシー: Opus 5 障害時のフォールバックとして当面利用可
- **Sonnet 5（深い推論）**: 深いステップバイステップ推論は適応的思考 + `/effort` で制御（Sonnet 5 は拡張思考なし）
- **起案→批評フロー**: Sonnet 5 が草稿 → Opus 5 が批評・代替案提示 → CEO が最終選択（深い推論が必要な案件・判断が割れる超重要案件は Fable 5 にエスカレーション）
  適用場面: ③歌詞選択前・⑥PVコンセプト承認前・CLAUDE.md等の重要設計変更時
- Agent Teams: 全員Sonnet 5開始、レビュー時Opus 5切替
- **Opus 5 切替通知ルール**: 以下のタイミングになったら、作業を始める前に必ず「Opus 5 への切り替えを推奨します: `/model claude-opus-5`」と通知すること。
  - **superpowers スキル使用時（全種）**: brainstorming / systematic-debugging / writing-plans / subagent-driven-development / dispatching-parallel-agents 等、superpowers: プレフィックスを持つスキルを呼び出す前
  - 歌詞レビュー（承認ゲート③直前）
  - PVコンセプトレビュー（承認ゲート⑥直前）
  - SVP生成（/phase2-svp 実行前）
  - CLAUDE.md 等の重要設計変更のクリティーク
  - Agent Teams のレビューフェーズ（quality-listener・concept-critic）
  - 出力が 64k tokens 超になる見込みの大型タスク
  通知後は CEO の確認を待つ。切り替え不要と言われたらそのまま Sonnet 5 で続ける。

### R-10: CEOの作業に踏み込まない・すべて叩き台で作る
CEOが自分で行う作業（作曲/編曲/アレンジ/ミックス/SynthV感情調整/録音/映像採否/SNS最終確認）は提案もしない。
すべてのアウトプットは「叩き台です。自由に変更してください」と添える。

### R-11: SynthVはMIDI確認・アレンジ確定後に作る
CEOが「アレンジOKです」と言うまで /phase2-svp を実行しない。

### R-12: Sunoの音源を素材として活用
mp3はLALAL.AIで分離してパーツ利用。MIDI生成はコード・メロディのみ。
代替選択肢: ComfyUI + ACE-Step 1.5 XL（4B DiT・ローカル実行・日本語対応・RTX 3090で24GB VRAM使用・10秒以内生成・MITライセンス）。Suno v5 超えの音質ベンチマーク確認済み。品質比較して使い分ける。LoRA 微調整でNOCTAサウンドのスタイル学習も将来的に可能。
ACE-Step UI（fspecii）: ACE-Step 1.5ベースのオープンソースUIプロジェクト。ステム分離機能（ドラム/ベース/ボーカル分離）搭載 → LALAL.AI代替候補。4分超の楽曲・ボーカル生成対応。RTX 3090環境で動作確認推奨。
Khala 1.0（中央音楽学院発・OSS）: ACE-Stepと並ぶ音楽生成モデル候補。RTX 3090環境での動作確認後にACE-Stepと品質比較して使い分ける。LoRA微調整によるNOCTAサウンドのスタイル学習も可能。
Mureka V9: 独立ブラインドテストでSuno・Udio超えのベンチマーク1位（2026-05-28時点）。@TadAI_official 2.1経由でテスト可能。ACE-Stepとの品質比較後にR-12代替候補として確定判断。

### R-13: 対話してから作業する
各フェーズ開始前に /brainstorm を実行。CEOのGoサインなしにファイル生成を開始しない。
プロンプト品質の3Cルール: Concise（簡潔）・Contextual（文脈に沿う）・Constrained（制約付き）— 手戻り削減のため常に意識する。
初回プロンプトには **Goal（目的）+ Constraints（制約）+ Acceptance criteria（完了条件）** を一括して渡す。逐次指示より初回一括の方が精度が高い（Opus 4.7以降の推奨パターン）。

### R-14: セッションが切れても再開できる状態を保つ
作業完了時に handoff.md を更新。進行中タスクは drafts/ に保存。

### コード・設計作業の発散（多筋フレーミング）
HP・SVP生成・hook/スキル改修など**非自明なコード設計**では、表層が違うだけの2-3案ではなく、**本質的に異なる2-3軸**で案を出す（例: MVP優先 / リスク優先 / 制約優先）。各軸が「何を最大化し・何を捨てるか」を明示する。設計生成はメインスレッドで行う（subagentに分散しない）。自明な変更（1-2ファイルに閉じる・定型・明確指示）には適用しない。

---

## MEMORY（CEOが手動更新）
- 音楽的傾向: BPM帯 / キー / 避けるサウンド / 好評コード進行 / SynthVキャラクター
- 制作注意点: Studio Oneテンプレート / SynthVパラメータ / MIDIインポート注意
- マーケティング: 効果高ハッシュタグ / 最適投稿時刻 / 反応あり訴求ポイント

---

## PROJECT CONTEXT（プロジェクトごとに書き換え）

```
曲名（仮）:         ジャンル:          ターゲット:
世界観メモ:         リリース希望日:     SynthVキャラクター:
参考アーティスト:   禁止ワード:
現在のフェーズ: （1〜5）   最後の承認ゲート: （①〜⑨）
```

---

## CODEMAP

```
/NOCTA/
├── CLAUDE.md             ← このファイル
└── /project_NOCTA/       ← gitリポジトリ（git操作は必ずここで実行）
    ├── context.md        ← プロジェクト情報（毎回読む）
    ├── handoff.md        ← 引き継ぎ（完了時1〜3行追記）
    ├── /drafts/          ← CEO未承認の草案
    │   ├── trend_report.md / music_spec.md / lyrics_draft.md
    │   ├── pv_concept.md / sns_calendar.md / press_release.md
    │   └── legal_check.md / kpi.md / demo_feedback.md
    └── /outputs/
        ├── /midi/        ← Studio Oneにドロップ
        ├── /svp/         ← SynthVで開く
        ├── /prompts/     ← Midjourney/Runway実行用
        └── /approved/    ← CEO承認済みのみ（手動移動のみ）
```

HP作業時のルール（パス規則・データファイル構造）: @project_NOCTA/website/CLAUDE.md

スキル設計原則: CLAUDE.md には常時適用ルールのみ記載。状況限定のワークフローはスキル（`~/.claude/commands/`）に分離する。
スキル frontmatter の活用: v2.1.117 以降、`context:fork` / `agent` / `mcpServers` フィールドをエージェントスキル設計に活用可能。将来のエージェントスキルで利用を検討する。v2.1.218 以降 `context:fork` スキルはデフォルトでバックグラウンド実行（同期実行には `background: false` を明示）。サブエージェントは同時実行上限20・ネスト深さ3（v2.1.219）。

スキルファイルのサイズ制限: SKILL.md は **500行以内**を目安にする。詳細な参照情報は `references/` ファイルに分離し、段階的開示でコンテキストウィンドウを保全する。Anthropic 公式 `skill-creator` プラグイン（マーケットプレイスから導入可）を使うと新スキルを対話形式で自動生成できる。

---

## AGENTS

### Agent Teams 3役モデル（/phase2-music・/phase4-release で適用）
- **explorer（調査）**: 情報収集・トレンド分析・参考楽曲調査 → Haiku 推奨
- **architect（設計）**: 仕様書設計・構成決定・歌詞草稿 → Sonnet 推奨
- **executor（実行）**: SVP生成・MIDI出力・リリース文書作成 → Sonnet / 品質重要な場面は Opus
- /phase2-music の役割分担: trend-analyst（explorer）/ music-spec-writer・lyric-poet（architect）/ svp-generator（executor・Opus）
- /phase4-release の役割分担: analytics-agent（explorer・Haiku）/ sns-batch-agent・press-release-writer・copyright-agent（executor）

フロー: trend-analyst → music-spec-writer ∥ lyric-poet → svp-generator → quality-listener → concept-director → sns/press/analytics/copyright

| エージェント | フェーズ | モデル |
|---|---|---|
| trend-analyst | 1 | Sonnet |
| music-spec-writer / lyric-poet | 2-A | Sonnet（起案） |
| **lyric-critic**（歌詞批評・③直前） | 2-B | **Opus**（批評） |
| svp-generator | 2-C | Opus |
| quality-listener | 2-D | Sonnet |
| concept-director / visual-prompter | 3 | Sonnet（起案） |
| **concept-critic**（PV批評・⑥直前） | 3-R | **Opus**（批評） |
| sns-batch-agent / press-release-writer / copyright-agent | 4 | Sonnet |
| analytics-agent | 4 | Haiku |

**Agent Teams デバッグ**: `claude agents --json` の `waitingFor` フィールドでブロック原因を確認（v2.1.162〜）

---

## MCP管理（ツール総数80以下を維持）

常時有効（最大5個）: `web_search` / `filesystem`
必要時のみ有効化: SNS連携MCP（フェーズ4）/ Spotify API（リリース後）
不要なMCPは `disabledMcpServers` に追加。確認: `/mcp`

### X リアルタイム検索オプション（/phase1-trend 強化・デフォルト無効）

フェーズ1のトレンド分析で X のバズ投稿をリアルタイム取得したい場合の選択肢:

- **xmcp（X公式 MCP）**: `github.com/xdevplatform/xmcp` を `.mcp.json` に追加し `disabledMcpjsonServers` でデフォルト無効化。`X_API_TOOL_ALLOWLIST=searchPostsRecent,getUsersMe` のみ許可（読み取り専用）。フェーズ1実行時のみ手動で有効化する。
- **Grok API**: xAI API 経由（従量課金 約0.1USD/回）。12クエリ以上でバズ投稿を広く収集し3〜5クラスターに集約する高精度オプション。

**⚠️ 共通ルール（R-03 より）**: `createPosts` / `likePost` / `repostPost` 等の書き込み系ツールは絶対に ALLOWLIST に含めない。

### YouTube リサーチオプション（/phase1-trend 強化・デフォルト無効）

- **vidIQ MCP**: `https://mcp.vidiq.com/mcp` を `claude.ai/settings/connectors` に追加。1億3,500万チャンネルのリアルタイムデータ（キーワードリサーチ・バズ動画分析・競合チャンネル監査・急成長チャンネル発掘）を自然言語で取得可能。現在**無料ベータ**（Claude Pro + vidIQアカウントが必要）。読み取り専用のため書き込み許可は不要。

### マルチプラットフォーム一括検索オプション（/phase1-trend 強化）

- **`/last30days` スキル**: ClawHubから導入可能（GitHub 2万星超）。`/last30days [トピック]` と入力するだけで Reddit・X・YouTube・TikTok・Hacker News・Polymarket・Bluesky・Web検索を同時走査し、いいね/RT数スコアリング付きレポートを2〜8分で生成。YouTube動画の文字起こしも自動取得。初期設定ではReddit・Hacker News・ウェブ検索が有効。X/YouTube/TikTokはAPIキー設定が必要（任意）。

### ローカルLLMオプション（プリプロセス・機密情報処理・APIコストゼロ）

- **Qwen（Ollama経由）**: RTX 3090（24GB VRAM）環境でAPIコストゼロ実行可能。歌詞ラフ案出し・SynthVパラメータ検討・機密情報の前処理などの低コスト作業に活用できる。`ollama run qwen2.5:32b` で起動（要: Ollamaインストール）。ACE-Step 1.5 XLが動作するRTX 3090環境なら同一マシンで実行可能。

### セキュリティ設定

- **Deny リスト設定済み**（`~/.claude/settings.json` の `permissions.deny`）:
  `git push --force` / `git push -f` / `git reset --hard` / `git clean -f` / `git rebase` / `rm -rf`
  （R-02/R-03の論理ルールをハード的に補強）

---

## APPROVAL GATES

| # | ゲート | 条件 |
|---|---|---|
| ① | トレンド分析承認 | 方向性に納得 |
| ② | 楽曲仕様書承認 | Studio Oneで即実装できる粒度 |
| ③ | 歌詞選択 | A/B/Cから選択 → `/phase2-svp [A/B/C]` |
| ④ | MIDIデモ確認 | Studio Oneで鳴らして方向性OK |
| ⑤ | SynthV確認 | 声の質感OK |
| ⑥ | PVコンセプト承認 | 映像化できる絵コンテ |
| ⑦ | 映像素材選択 | 採用素材を決定 |
| ⑧ | コンテンツ一括承認 | SNS/PR全文確認 |
| ⑨ | リリース最終承認 | go_live_checklist.mdの⚠️がゼロ → `/phase5-golive` |

---

## SLASH COMMANDS

### 定型（状態確認・軽量・数秒〜数分）
| コマンド | 動作 |
|---|---|
| `/music-status` | プロジェクト状況確認 |
| `/design-status` | デザイン・ビジュアル制作の進捗確認 |
| `/music-reset-context` | コンテキスト節約再開 |
| `/song-list` | 全曲フェーズ一覧 |
| `/song-switch [曲名]` | ブランチ切替 |
| `/simplify` | フェーズ完了後のリファクタリング・文書整理 |

### 複雑ワークフロー（多段階・エージェント起動・数十分）
| コマンド | 動作 |
|---|---|
| `/music-init [曲名]` | プロジェクト初期化 |
| `/phase1-trend` | トレンド分析 |
| `/phase2-music` | 楽曲仕様書・歌詞を並列生成（Agent Teams） |
| `/phase2-svp [A/B/C]` | SVPファイル生成 |
| `/phase2-demo` | デモ評価 |
| `/phase3-pv` | PVコンセプト・プロンプト生成 |
| `/phase4-release` | リリース準備（4エージェント並列・Agent Teams） |
| `/phase5-golive` | リリース当日チェック |
| `/song-finish [曲名]` | 楽曲完成処理 |

### HP管理
| コマンド | 動作 |
|---|---|
| `/hp-add-work [曲名] [YouTubeID]` | HP Works追加 |
| `/blog-publish` | ブログ記事投稿 |
| `/visual-add [作品名]` | visual-data.jsに作品追加（IPFSハッシュ自動バリデーション付き） |
| `/visual-prompt [作品名]` | GPT Image 2/Klingプロンプト生成（ChatGPT Plus手動生成・API不使用） |
| `/lp-create [対象名]` | 楽曲LP・説明LPをClaude Designと共同で構築（design-brief生成・HTML実装） |
| Claude Design（`claude.ai/design`） | マーケ素材・LP・スライドをAIデザイン（Web版のみ・使用枠独立・週リセット。Design SystemにCLAUDE.mdを貼るとNOCTAブランド自動適用） |
| GitHub Code Review（GitHub App） | website/ PR作成時に自動コードレビュー（要GitHub App有効化・Claude Code Max） |

### レビュー・分析
| コマンド | 動作 |
|---|---|
| `/ultrareview [PR#]` | クラウドマルチエージェントコードレビュー（Claude Code Max） |
| `/best-practices-review` | 公式ドキュメントからベストプラクティス収集 |
| `/web-practices-review` | Web検索でベストプラクティス収集（Gemini） |
| `/interaction-review` | 依頼パターン分析・改善提案 |
| `/insights` | セッション利用パターン分析（ローカルのみ） |

---

## セッション運用

| 操作 | 方法 |
|---|---|
| タスク切替時 | `/clear` でコンテキストリセット |
| コンパクション | `/compact Focus on [作業内容]` で要約精度向上 |
| サイド質問 | `/btw [質問]` — コンテキスト汚染なし、オーバーレイ表示。調査・確認・疑問は積極活用 |
| チェックポイント復元 | `Esc × 2` または `/rewind` |
| セッション再開 | `claude --continue`（最新）/ `claude --resume`（選択・長期プロジェクトは要約オプションで最大67%高速） |
| Web/iOS→CLI転送 | `/teleport` — モバイルで開始したセッションをCLIに引き込む |
| CLI→Desktopアプリ転送 | `/desktop` — CLIセッションをデスクトップアプリへ転送（視覚的差分確認に） |
| モバイル→デスクトップ送信 | Dispatch機能 — モバイルからデスクトップセッションへタスクをプッシュ（外出先からの非同期指示） |
| 外部イベント受信 | Channels機能 — Telegram/Discord/webhookからセッションへイベントプッシュ可能（外部サービス連携） |
| コスト確認 | `/usage` — セッション費用・トークン使用量を確認。スキル・サブエージェント・MCP別コスト内訳も表示（v2.1.149〜。旧 `/cost`・`/stats` は v2.1.118 で統合） |
| モデル切替 | `/model` — モデルをデフォルト保存可能。`s` キーで現セッションのみ切替（v2.1.153〜） |
| effort 設定 | `/effort [level]` — 選択レベルがデフォルト保持（次回起動も引き継ぎ・v2.1.162〜） |
| プロンプト修正 | 後続メッセージを追加せず元メッセージを **Edit → 再生成**（履歴累積コストを防ぐ。msg30 は msg1 の31倍のコスト） |
| 会話が長くなったら | 15〜20 メッセージを目安に `/compact` → 新セッションで要約を最初のメッセージとして引き継ぐ |
| ベストプラクティス定期確認 | `/weekly-check` — 収集・レビュースキルの実行ガイド（3日/週1ペース） |
| 状態一括削除 | `claude project purge [path]` — transcripts/tasks/config を一括削除（v2.1.126） |
| 起動不具合の切り分け | `claude --safe-mode` — CLAUDE.md/hooks/plugins/skills/MCP を全無効化して素の状態で起動。設定変更後に起動・動作がおかしいとき原因を即特定（v2.1.169〜） |
| ゴール設定 | `/goal [完了条件]` — 完了条件を設定し複数ターン自動継続（/phase2-music 等の多段タスクに有効・v2.1.139） |
| 全セッション監視 | Agent View（デスクトップ・Web）— 全バックグラウンドエージェントを1画面で一覧監視（Agent Teams実行時に活用・v2.1.139） |
| 定期タスク自動化 | Routines: `/schedule` — Anthropicインフラで定期実行（マシンOFF時も継続・APIトリガー対応） |

**コンパクション保持指示**: 変更ファイル一覧・次のアクションを必ず保持する。

---

## COST POLICY

| 状況 | モード |
|---|---|
| 全体計画・タスク分解 | Plan Mode |
| 単発タスク | Subagent |
| 複数部門の並列作業 | Agent Teams |

Agent Teams は `/phase2-music` と `/phase4-release` の2回のみ推奨。

コスト最適化: 単純タスク（handoff 更新・短いファイル生成）では `/effort low` または `/effort medium` でトークン消費を削減できる。デフォルトは "high"（有料ユーザー）。
