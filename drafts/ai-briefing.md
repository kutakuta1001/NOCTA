# NOCTA — AI ブリーフィング
新しい Claude Code セッション・他のAIアシスタントへの引き継ぎ用。
このファイルを最初のメッセージに貼り付けるだけで即戦力になれる。

---

## NOCTAとは

CEOとAIエージェントチームで楽曲企画〜リリースを完結させるスタッフゼロ型音楽エンタメカンパニー。
CEOは Studio One Pro / Synthesizer V Studio PRO / UR22C / MPM-1000 を自ら操作できる制作者。

**AIの役割**: 設計書・プロンプト・文章・ファイルを作ること。音の判断・感情判断・SNS投稿の最終確認はCEOが行う。

---

## AIツールの棲み分け

### Claude Code（このセッション）

| モデル | 役割 | 使うシーン |
|--------|------|-----------|
| **Haiku 4.5** | 調査・軽量作業 | 短いファイル生成・handoff更新・phase1-trend の調査部分。ナレッジカットオフ2025年2月のためトレンド判断はSonnetに委ねる |
| **Sonnet 4.6** | 主力（起案） | 楽曲仕様書・歌詞草稿・SNS文案・コード生成。拡張思考・適応的思考（Adaptive Thinking）両対応 |
| **Opus 4.8** | 批評・高品質 | 承認ゲート直前の歌詞/PVコンセプトレビュー・SVP生成・重要設計判断。`/effort xhigh` 推奨 |

コスト（入力/出力 100万トークン）: Haiku $1/$5 / Sonnet $3/$15 / Opus $5/$25
Opus 4.8 Fastモード: `/fast` で約2.5倍高速・$10/$50/MTok（リサーチプレビュー）

起案→批評フロー: Sonnet が草稿 → Opus が批評・代替案提示 → CEO が最終選択

### 外部AIツール（CEOが直接実行・Claude Codeは実行しない）

| ツール | 用途 | Claude Codeの役割 |
|--------|------|-----------------|
| Suno v5 / Mureka V9 / ACE-Step 1.5 XL | AI音楽生成（参照素材） | プロンプト文書を outputs/prompts/ に出力 |
| GPT Image 2 / Kling 3.0 Pro / Dreamina Seedance 2.0 | ビジュアル・PV映像 | プロンプト文書を outputs/prompts/ に出力 |
| Synthesizer V Studio PRO（Mai） | ボーカル生成 | SVPファイル（.svp）を outputs/svp/ に出力 |
| Studio One Pro | 作曲・編曲・ミックス | MIDIファイルを outputs/midi/ に出力 |
| LALAL.AI | ステム分離 | 操作手順を案内するだけ |
| Claude Design（claude.ai/design） | LP・マーケ素材 | design-briefを drafts/ に出力 |

### 他のコーディングエージェント（OpenAI Codex 等）との棲み分け

| 作業 | 適切なツール |
|------|------------|
| 単純なコード補完・短い1ファイル修正 | IDE内補完（Copilot等）で完結 |
| NOCTAワークフロー（スキル実行・CLAUDE.md更新・フェーズ進行） | Claude Code |
| SVPファイル生成（Pythonスクリプト・500行超） | Claude Code Opus 4.8（`/effort xhigh`） |
| HPデータ更新（blog-data.js / works-data.js / visual-data.js） | Claude Code（`/hp-add-work` / `/blog-publish`） |
| 外部ツールのプロンプト設計 | Claude Code Sonnet 4.6 |

---

## 制作フェーズとスキル

```
フェーズ1:   /phase1-trend      トレンド分析（Sonnet）
フェーズ2-A: /phase2-music      楽曲仕様書・歌詞並列生成（Agent Teams・Sonnet起案→Opus批評）
フェーズ2-C: /phase2-svp [A/B/C] SVPファイル生成（Opus 4.8）
フェーズ2-D: /phase2-demo       デモ評価Q&A
フェーズ3:   /phase3-pv         PVコンセプト・映像プロンプト生成
フェーズ4:   /phase4-release    SNS/PR/著作権/KPI 4エージェント並列（Agent Teams）
フェーズ5:   /phase5-golive     リリース当日チェック
```

承認ゲート①〜⑨はCEOが判断。AIが勝手に次フェーズへ進まない。

---

## 最重要ルール（7つ）

1. **数値で話す** — BPM・キー・小節数を必ず記述。「エモーショナルな感じ」はNG
2. **approved/ は触れない** — drafts/ にのみ保存。CEOが「承認」と言ったときだけ移動
3. **SNS自動投稿しない** — drafts/sns_calendar.md に保存して「CEO確認待ち」と明記
4. **外部ツールを直接実行しない** — outputs/prompts/ にプロンプト文書を出力するだけ
5. **すべて叩き台として作る** — 「これが正解」と言わない。常に「自由に変更してください」を添える
6. **承認ゲートを守る** — Goサインなしにファイル生成を開始しない（`/brainstorm` から）
7. **handoff.md は1〜3行のみ** — 完了した事実と次のアクションのみ。絵文字は使わない

---

## 現在のプロジェクト状態（2026-05-29時点）

**曲名**: NuWord（読み: ニューワールド）
**フェーズ**: 2-C 完了 → **次: 承認ゲート⑤**
**承認通過済み**: ①②③

主要仕様:
```
ジャンル   : Jポップ・アニメソング寄り（参考: ろん / fhana / supercell）
BPM        : 152 / キー: C#メジャー
ボーカル   : Synthesizer V – Mai
採用歌詞   : 草稿A
サウンド設計: 案A「森林テクスチャーを音響設計に埋め込む」
構成設計   : 案B「落ちサビ→ラスサビで盛り上がる」
禁止要素   : ローファイ / クラシック / メタル
SVPファイル: outputs/svp/vocal_draft.svp（498ノート生成済み）
```

次のアクション: SynthV Studio PRO で vocal_draft.svp を開いてRenderし、承認ゲート⑤へ。

---

## ファイル構造

```
/NOCTA/
├── CLAUDE.md              ← 全ルール（常に有効）
└── /project_NOCTA/        ← gitリポジトリ（git操作はここで）
    ├── context.md         ← プロジェクト情報（セッション開始時に読む）
    ├── handoff.md         ← 引き継ぎ（完了時に1〜3行追記）
    ├── /drafts/           ← CEO未承認の草案（自由に書き込み可）
    └── /outputs/
        ├── /midi/         ← Studio Oneにドロップ
        ├── /svp/          ← SynthVで開く
        ├── /prompts/      ← 外部ツール実行用
        └── /approved/     ← CEO承認済みのみ（手動移動のみ・触らない）
```

セッション開始時は `context.md` と `handoff.md` の2ファイルのみ読む。
他は「必要になった瞬間」に読む。先読み・大量読み込み禁止（コンテキスト節約のため）。

---

## よく使うコマンド

| コマンド | 用途 |
|---------|------|
| `/music-status` | 現在の状況確認 |
| `/weekly-check` | ベストプラクティス収集ルーティン確認 |
| `/compact Focus on [作業内容]` | コンテキスト圧縮して継続 |
| `/btw [質問]` | サイドクエスチョン（コンテキスト汚染なし） |
| `/effort xhigh` | Opus 4.8 最大性能モード（重要タスク時） |
| `/fast` | Opus 4.8 Fastモード（約2.5倍高速・リサーチプレビュー） |
| `/usage` | コスト確認（スキル・サブエージェント・MCP別内訳） |
