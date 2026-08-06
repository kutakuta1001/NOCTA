# CLAUDE.md スリム化 + ハード化層 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 常時ロードされる CLAUDE.md 群を973行→400行以下に削減し、破られたら不可逆なルール（approved/ 保護・push 禁止）を CLAUDE.md 層から deny/hooks 層へ降格する。

**Architecture:** ゼロベース再構築。旧4ファイルを git 管理下に退避し、必然性テスト（削除したら Claude が間違うか）を通った行のみ新正本に書き起こす。参照情報は `~/.claude/references/` へ移して1行ポインタを残す。正本は `project_NOCTA/CLAUDE.md`（git 管理下）とし、`NOCTA/CLAUDE.md` は import + 数行に縮める。approved/ 保護は `Edit(path)` deny ルールと PreToolUse hook の二層で行う。

**Tech Stack:** Markdown / bash / jq / Claude Code settings.json（permissions・hooks）

## Global Constraints

- 対象は CLAUDE.md 4ファイルと降格先の hooks/deny のみ。スキル51本・エージェント25本は触らない
- **ルールは1本も削除しない。** 削除するのは重複・ハーネスが自動提供する情報・空欄テンプレのみ
- 目標: 4ファイル合計 400行以下 / 非HP作業セッションの常時ロード 320行以下（before: 973行・34,507文字）
- deny のファイルルールは `Edit(path)` を使う。`Write(path)` は受け付けられるが参照されない
- ユーザー設定の deny パスは `//` 絶対パス形式（`/path` は `~/.claude/` 起点に解決される）
- **`~/.claude/settings.json` は API キーを平文で含む。リポジトリにコピーしない**
- `approved-guard.sh` は `stop-hook-lib.sh` を source しない（Stop hook 専用ライブラリのため PreToolUse では常に素通しになる）
- ドキュメントに絵文字を使わない（R-08）
- git add は対象ファイルを個別指定する。`git add -A` / `git add .` は使わない
- 本計画の実行中に `outputs/approved/` へ書き込まない（R-02）

---

### Task 1: 旧ファイルの退避とベースライン計測

**Files:**
- Create: `docs/superpowers/archive/claude-md-2026-08-05/global-CLAUDE.md`
- Create: `docs/superpowers/archive/claude-md-2026-08-05/nocta-CLAUDE.md`
- Create: `docs/superpowers/archive/claude-md-2026-08-05/project-CLAUDE.md`
- Create: `docs/superpowers/archive/claude-md-2026-08-05/website-CLAUDE.md`
- Create: `drafts/claude-md-audit-2026-08-05.md`

**Interfaces:**
- Consumes: なし（最初のタスク）
- Produces: 退避済み4ファイル（Task 3・4 が原文参照に使う）/ 監査表ファイル（Task 3・4 が判定を追記する）/ ベースライン数値（Task 6 が達成判定に使う）

- [ ] **Step 1: ベースラインを計測して記録する**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
for f in /Users/fghmacbook013/.claude/CLAUDE.md /Users/fghmacbook013/NOCTA/CLAUDE.md /Users/fghmacbook013/NOCTA/project_NOCTA/CLAUDE.md /Users/fghmacbook013/NOCTA/project_NOCTA/website/CLAUDE.md; do
  printf "%-60s %5s 行 %6s 文字\n" "$f" "$(wc -l < "$f" | tr -d ' ')" "$(wc -m < "$f" | tr -d ' ')"
done
cat /Users/fghmacbook013/.claude/CLAUDE.md /Users/fghmacbook013/NOCTA/CLAUDE.md /Users/fghmacbook013/NOCTA/project_NOCTA/CLAUDE.md /Users/fghmacbook013/NOCTA/project_NOCTA/website/CLAUDE.md | wc -l -m
```

Expected: 174 / 310 / 349 / 140 行、合計 973 行・34,507 文字。数値が違う場合は実測値を採用し、Step 4 の監査表に実測値を書く。

- [ ] **Step 2: 4ファイルを git 管理下に退避する**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
mkdir -p docs/superpowers/archive/claude-md-2026-08-05
cp /Users/fghmacbook013/.claude/CLAUDE.md                      docs/superpowers/archive/claude-md-2026-08-05/global-CLAUDE.md
cp /Users/fghmacbook013/NOCTA/CLAUDE.md                        docs/superpowers/archive/claude-md-2026-08-05/nocta-CLAUDE.md
cp /Users/fghmacbook013/NOCTA/project_NOCTA/CLAUDE.md          docs/superpowers/archive/claude-md-2026-08-05/project-CLAUDE.md
cp /Users/fghmacbook013/NOCTA/project_NOCTA/website/CLAUDE.md  docs/superpowers/archive/claude-md-2026-08-05/website-CLAUDE.md
```

- [ ] **Step 3: 退避が完全一致であることを検証する**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA/docs/superpowers/archive/claude-md-2026-08-05
cmp /Users/fghmacbook013/.claude/CLAUDE.md                     global-CLAUDE.md  && echo "global OK"
cmp /Users/fghmacbook013/NOCTA/CLAUDE.md                       nocta-CLAUDE.md   && echo "nocta OK"
cmp /Users/fghmacbook013/NOCTA/project_NOCTA/CLAUDE.md         project-CLAUDE.md && echo "project OK"
cmp /Users/fghmacbook013/NOCTA/project_NOCTA/website/CLAUDE.md website-CLAUDE.md && echo "website OK"
```

Expected: 4行すべて "OK"。差分があれば `cmp` が終了コード1で内容差分を報告する。1件でも失敗したら Step 2 をやり直す（退避は唯一のロールバック手段であり、`NOCTA/CLAUDE.md` と `~/.claude/CLAUDE.md` は git 履歴を持たない）。

- [ ] **Step 4: 監査表の骨格を作成する**

`drafts/claude-md-audit-2026-08-05.md` に以下を書く。行き先列は Task 3・4 で埋める。

```markdown
# CLAUDE.md 監査表（2026-08-05）

判定フロー（上から先に一致した行き先へ）:

| # | 判定 | 行き先 |
|---|---|---|
| 1 | 破られたら不可逆な被害か | deny/hooks へ降格 + 正本に存在告知1行 |
| 2 | ないと Claude が間違うか | 正本に残す（最大限圧縮） |
| 3 | ハーネス/ツールが同じ情報を自動提供するか | 削除 |
| 4 | 参照時にのみ必要か・頻繁に変わるか | references/ へ + 1行ポインタ |
| 5 | どれでもない | 削除 |

ベースライン: 4ファイル合計 973行 / 34,507文字
退避先: docs/superpowers/archive/claude-md-2026-08-05/

## ~/.claude/CLAUDE.md（174行）

| 旧セクション | 内容要約 | 行き先 | 理由 |
|---|---|---|---|
| G-01 モデルを目的で使い分ける | モデル4種の仕様・価格・切替通知ルール（約25行） | | |
| G-02 ファイル読み込みは最小限 | 常時適用ルール | | |
| G-03 絵文字を使わない | 常時適用ルール | | |
| G-04 対話してから作業する | 常時適用ルール + 3C + Goal/Constraints/AC | | |
| G-05 再開できる状態を保つ | handoff 運用 | | |
| G-06 納品デブリーフ | 5項目の出力形式 + 適用範囲 | | |
| セッション運用（表） | 操作と方法の対応表 | | |
| COST POLICY | Plan Mode / Subagent / Agent Teams | | |
| スキル・CLAUDE.md 設計 | 500行以内・context:fork 等 | | |
| フロントエンド作成 | frontend-design / designer 運用 | | |
| MCP管理 | ツール80以下 | | |
| セキュリティ | deny リスト | | |
| コードレビュー（Codex CLI） | /review 認証フォールバック | | |
| ベストプラクティス定期確認 | /weekly-check 等 | | |

## NOCTA/CLAUDE.md（310行）

| 旧セクション | 内容要約 | 行き先 | 理由 |
|---|---|---|---|
| アイデンティティ | スタジオ定義・CEO スキル・AI の役割 | | |
| RULES R-01〜R-14 | 全ルール（project_NOCTA 側と重複） | | |
| コード・設計作業の発散 | 多筋フレーミング | | |
| MEMORY | 空欄テンプレート | | |
| PROJECT CONTEXT | 空欄テンプレート | | |
| CODEMAP | ディレクトリ構造 | | |
| AGENTS | 3役モデル + エージェント表 | | |
| MCP管理 | ツール80以下 + X/YouTube/マルチPF 調査オプション + ローカルLLM + セキュリティ | | |
| APPROVAL GATES | ①〜⑨ | | |
| SLASH COMMANDS | 定型・複雑・HP管理・レビューの4表 | | |
| セッション運用 | 操作と方法の対応表 | | |
| COST POLICY | モード選択 + effort | | |

## project_NOCTA/CLAUDE.md（349行）

| 旧セクション | 内容要約 | 行き先 | 理由 |
|---|---|---|---|
| 会社アイデンティティ | ミッション・CEO スキルセット・AI の立ち位置 | | |
| RULES R-01〜R-15 | 全ルール（理由付き・詳細版） | | |
| MEMORY | 空欄テンプレート3ブロック | | |
| PROJECT CONTEXT | 空欄テンプレート | | |
| CODEMAP | ディレクトリ構造 + 担当エージェント注記 | | |
| AGENTS | 依存関係マップ + エージェント表 | | |
| MCP管理 | 常時有効・必要時・無効化推奨 | | |
| APPROVAL GATES | ①〜⑨ + コマンド列 | | |
| SLASH COMMANDS | コマンド表 | | |
| COST POLICY | モード + 判断基準 + effort | | |

## website/CLAUDE.md（140行）

| 旧セクション | 内容要約 | 行き先 | 理由 |
|---|---|---|---|
| ホスティング構成 | GitHub Pages / Netlify・パス規則 | | |
| ファイル構成 | website/ 直下の構造 | | |
| データファイルのルール | visual/blog/works/apps の各仕様 | | |
| git 操作ルール | add 個別指定・コミットメッセージ例 | | |
| デザインシステム | Tailwind・フォント・色・比率 | | |
| フロントエンドデザイン強化 | frontend-design の呼び出し場面・NOCTA コンテキスト・禁止パターン | | |

## 削除判定の一覧（CEO レビュー必須）

（Task 3・4 完了後に、行き先が「削除」の項目をここへ再掲する）
```

- [ ] **Step 5: コミット**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add docs/superpowers/archive/claude-md-2026-08-05/ drafts/claude-md-audit-2026-08-05.md
git commit -m "chore(claude-md): 旧4ファイルを退避し監査表の骨格を作成"
```

---

### Task 2: references 3ファイルの整備

**Files:**
- Create: `claude-config/references/nocta-cheatsheet.md`
- Create: `claude-config/references/nocta-tools.md`
- Modify: `/Users/fghmacbook013/.claude/references/model-lineup.md`（末尾にセクション追加）
- Copy to: `/Users/fghmacbook013/.claude/references/nocta-cheatsheet.md`, `/Users/fghmacbook013/.claude/references/nocta-tools.md`

**Interfaces:**
- Consumes: Task 1 の退避ファイル（原文の参照元）
- Produces: `~/.claude/references/nocta-cheatsheet.md` / `nocta-tools.md` / 更新済み `model-lineup.md`。Task 3・4 がこの3パスを1行ポインタで参照する

- [ ] **Step 1: claude-config/references/ を作成し cheatsheet を書く**

`claude-config/references/nocta-cheatsheet.md`:

```markdown
# NOCTA 運用チートシート

CLAUDE.md から分離した参照情報。常時ロードされないので、必要になったときだけ読む。
最終更新: 2026-08-05

---

## スラッシュコマンド

### 定型（状態確認・軽量・数秒〜数分）

| コマンド | 動作 |
|---|---|
| `/music-status` | プロジェクト状況確認 |
| `/design-status` | デザイン・ビジュアル制作の進捗確認 |
| `/music-reset-context` | コンテキスト節約再開 |
| `/song-list` | 全曲フェーズ一覧 |
| `/song-switch [曲名]` | ブランチ切替 |
| `/simplify` | フェーズ完了後のリファクタリング・文書整理 |
| `/skill-list` | 自作スキル・エージェント一覧 |

### 複雑ワークフロー（多段階・エージェント起動・数十分）

| コマンド | 動作 |
|---|---|
| `/music-init [曲名]` | プロジェクト初期化 |
| `/phase1-trend` | トレンド分析 |
| `/phase1-suno` | Suno 用プロンプトを差別化案A/B/Cで作成 |
| `/phase2-music` | 楽曲仕様書・歌詞を並列生成（Agent Teams） |
| `/phase2-svp [A/B/C]` | SVPファイル生成 |
| `/phase2-demo` | デモ評価 |
| `/phase3-pv` | PVコンセプト・プロンプト生成 |
| `/phase4-release` | リリース準備（4エージェント並列） |
| `/phase5-golive` | リリース当日チェック |
| `/song-finish [曲名]` | 楽曲完成処理 |

### HP・ビジュアル・デザイン

| コマンド | 動作 |
|---|---|
| `/hp-add-work [曲名] [YouTubeID]` | HP Works 追加 |
| `/blog-publish` | ブログ記事投稿 |
| `/visual-add [作品名]` | visual-data.js に作品追加（IPFSハッシュ自動バリデーション） |
| `/visual-prompt [作品名]` | GPT Image 2 / Kling プロンプト生成 |
| `/lp-create [対象名]` | 楽曲LP・説明LPを構築 |
| `/design-team` | デザイナー3人（凛・華・紡）に競作させる |
| `/design-review-public` | 一般人視点の評価者3人にレビューさせる |
| `/design-search` / `/design-extract` / `/design-scout` / `/design-promote` | デザインパターンの検索・蓄積・偵察・昇格 |
| `/concept-video` | コンセプト動画のプリプロ（監督3人が競作） |
| `/image-gen` | ターミナルから画像生成 |

### レビュー・分析・定期確認

| コマンド | 動作 |
|---|---|
| `/review [計画書]` / `/review-diff` | Codex CLI で第三者レビュー |
| `/persona-review` | 観点別ペルソナ6視点でレビュー |
| `/ultrareview [PR#]` | クラウドマルチエージェントコードレビュー |
| `/weekly-check` | 収集・レビュースキルの実行ガイド（3日/週1ペース） |
| `/best-practices-review` | インボックスの一括レビュー（5件以上で実行） |
| `/claude-docs-review` / `/x-practices-search` / `/web-practices-review` | 公式ドキュメント・X・Web からの収集 |
| `/model-review` | 新モデルリリース時にモデル棲み分けを再議論 |
| `/interaction-review` | 依頼パターン分析・改善提案 |
| `/insights` | セッション利用パターン分析 |
| `/research` | X と Web の並列リサーチ |

### コンサル・壁打ち

| コマンド | 動作 |
|---|---|
| `/consult` | 仮想コンサルチームへの統合エントリ |
| `/consult-analyze` / `-deck` / `-check` / `-decide` / `-sparring` / `-steerco` | 分析・資料化・検査・意思決定・壁打ち・定例レビュー |
| `/kabeuchi` | CEO 自身の判断軸で壁打ち |
| `/persona-sync` | inner-brain のインジェストを手動実行 |

---

## セッション運用

| 操作 | 方法 |
|---|---|
| タスク切替時 | `/clear` でコンテキストリセット |
| コンパクション | `/compact Focus on [作業内容]` |
| サイド質問 | `/btw [質問]` — 会話履歴に入らない |
| チェックポイント復元 | `Esc × 2` または `/rewind` |
| セッション再開 | `claude --continue`（最新）/ `claude --resume`（選択） |
| Web/iOS→CLI転送 | `/teleport` |
| CLI→Desktop転送 | `/desktop`（視覚的差分確認に） |
| モバイル→デスクトップ | Dispatch |
| 外部イベント受信 | Channels（Telegram / Discord / iMessage / webhook） |
| コスト確認 | `/usage`（スキル・サブエージェント・MCP 別内訳） |
| モデル切替 | `/model`（`s` キーで現セッションのみ） |
| effort 設定 | `/effort [level]`（選択レベルが次回起動も保持） |
| ゴール設定 | `/goal [完了条件]`（複数ターン自動継続） |
| 全エージェント監視 | Agent View（デスクトップ・Web） |
| 定期タスク（クラウド） | Routines: `/schedule` — マシンOFFでも継続 |
| 定期タスク（ローカル） | デスクトップスケジュール済みタスク — ローカルファイルに直接アクセス可 |
| セッション内の繰り返し | `/loop`（`Esc` / `Ctrl+C` でキャンセル） |
| 状態一括削除 | `claude project purge [path]` |
| 起動不具合の切り分け | `claude --safe-mode` |
| Agent Teams デバッグ | `claude agents --json` の `waitingFor` フィールド |

**プロンプト運用**: 後続メッセージを追加せず元メッセージを Edit → 再生成（msg30 は msg1 の31倍のコスト）。
会話が長くなったら15〜20メッセージを目安に `/compact` し、新セッションで要約を最初のメッセージとして引き継ぐ。
コンパクション時は変更ファイル一覧と次のアクションを必ず保持する。

---

## 承認ゲートとフェーズの対応

フェーズ1（トレンド）→ ① / フェーズ2-A（仕様書・歌詞）→ ②③ / フェーズ2-C（SVP）→ ④⑤ /
フェーズ3（PV）→ ⑥⑦ / フェーズ4（リリース準備）→ ⑧ / フェーズ5（当日）→ ⑨

---

## 6ヶ月ごとのゼロベース見直し

Claude Code 開発者（Boris Cherny）の推奨に従い、6ヶ月ごとに CLAUDE.md・スキル・hooks を
ゼロベースで見直す（削除してモデルの素の挙動を確認し、必要なものだけ戻す）。

- 前回実施: 2026-08-05（973行 → 400行以下・監査表は drafts/claude-md-audit-2026-08-05.md）
- 次回目安: 2027-02
- 判定基準: 各行に「これを削除すると Claude が間違いを犯すか」を問い、否なら削除する
```

- [ ] **Step 2: nocta-tools.md を書く**

`claude-config/references/nocta-tools.md`:

```markdown
# NOCTA 制作ツール選択肢

CLAUDE.md から分離した参照情報。ツール選定を検討するときだけ読む。
最終更新: 2026-08-05

---

## 楽曲生成（R-13 の代替候補）

| ツール | 状態 | メモ |
|---|---|---|
| Suno | 現行 | mp3 を LALAL.AI で分離してパーツ利用。2026-08 にミュンヘン地裁が学習・出力の両面で著作権侵害を認定（違法収益の開示と損害賠償命令）。素材利用の前提を再確認する必要がある |
| ComfyUI + ACE-Step 1.5 XL | 候補 | 4B DiT・ローカル実行・日本語対応・RTX 3090 で 24GB VRAM・10秒以内生成・MIT ライセンス。Suno v5 超えの音質ベンチマーク確認済み。LoRA 微調整で NOCTA サウンドのスタイル学習も可能 |
| ACE-Step UI（fspecii） | 候補 | ACE-Step 1.5 ベースの OSS UI。ステム分離（ドラム/ベース/ボーカル）搭載で LALAL.AI 代替候補。4分超の楽曲・ボーカル生成対応 |
| Khala 1.0 | 候補 | 中央音楽学院発・OSS。RTX 3090 で動作確認後に ACE-Step と品質比較。LoRA 微調整可 |
| Mureka V9 | 候補 | 独立ブラインドテストで Suno・Udio 超えのベンチマーク1位（2026-05-28 時点）。@TadAI_official 2.1 経由でテスト可能 |

## 映像生成（R-04 の T2V 選択肢）

Runway / Kling 3.0 Pro / Dreamina Seedance 2.0 を品質・コストで使い分ける。
PV パイプラインは Runway WebUI 手動方式を採用済み（`outputs/pv/pv_edit.py` が FFmpeg 結合を担当・Runway API は有料プラン要）。

既知の制約: Midjourney / Kling / Runway / Luma / Sora / Veo / Seedance のいずれも前のショットを記憶しないため、
衣装・顔・光が飛ぶ。プロンプトでは解決しないので、単発ショット単位で使う前提で設計する。

## 調査・リサーチのオプション（/phase1-trend 強化・デフォルト無効）

| 手段 | 設定 | 注意 |
|---|---|---|
| xmcp（X 公式 MCP） | `.mcp.json` に `http://127.0.0.1:8000/mcp`。`~/xmcp/.env` の `X_API_TOOL_ALLOWLIST=searchPostsRecent,getUsersMe` で読み取り専用2ツールに制限 | 起動: `cd ~/xmcp && source .venv/bin/activate && python server.py`。二重起動でポート競合（errno 48）。`.env` で同じキーを再定義すると後勝ちで ALLOWLIST が無効化され147ツール全部（書き込み系含む）がロードされる |
| Grok API | xAI API 経由・従量課金 約0.1USD/回 | 12クエリ以上でバズ投稿を広く収集し3〜5クラスターに集約する高精度オプション |
| vidIQ MCP | `https://mcp.vidiq.com/mcp` を claude.ai/settings/connectors に追加 | 1億3,500万チャンネルのリアルタイムデータ。無料ベータ・読み取り専用 |
| `/last30days` スキル | ClawHub から導入 | Reddit・X・YouTube・TikTok・Hacker News・Polymarket・Bluesky・Web を同時走査。初期設定では Reddit・HN・Web が有効 |

**共通ルール（R-03）**: `createPosts` / `likePost` / `repostPost` 等の書き込み系ツールは絶対に ALLOWLIST に含めない。

xmcp の既知の制約: `min_faves` 演算子は現プランで使用不可（HTTP 400）。エンゲージメントフィルタは取得後に `public_metrics` で手動実施する。

## ローカル LLM（APIコストゼロ・機密情報の前処理）

Qwen（Ollama 経由）: RTX 3090（24GB VRAM）で `ollama run qwen2.5:32b`。
歌詞ラフ案出し・SynthV パラメータ検討・機密情報の前処理などの低コスト作業に使える。ACE-Step と同一マシンで動く。

## デザイン・マーケ

Claude Design（`claude.ai/design`）: マーケ素材・LP・スライドの AI デザイン。Web 版のみ・使用枠は独立（週リセット）。
Design System に CLAUDE.md を貼ると NOCTA ブランドが自動適用される。アカウントは DOCOMO R&D 企業アカウントを使う（2026-06-16 決定）。

GitHub Code Review（GitHub App）: `website/` の PR 作成時に自動コードレビュー（要 GitHub App 有効化）。
```

- [ ] **Step 3: model-lineup.md に R-09 の詳細を吸収する**

`/Users/fghmacbook013/.claude/references/model-lineup.md` の末尾に追記する（既存内容は変更しない）。冒頭の「最終更新」行は `2026-08-05 rev.7` に更新する。

```markdown
---

## CLAUDE.md から移した詳細（2026-08-05 のスリム化で吸収）

### モデル仕様

| | Fable 5 | Opus 5 | Sonnet 5 | Haiku 4.5 |
|---|---|---|---|---|
| ID | `claude-fable-5` | `claude-opus-5` | `claude-sonnet-5` | `claude-haiku-4-5-20251001` |
| 価格（入力/出力 per MTok） | $10 / $50 | $5 / $25 | $3 / $15（導入価格 $2/$10・2026-08-31まで） | $1 / $5 |
| コンテキスト | 1M | 1M | 1M | 200k |
| 最大出力 | 128k | 128k | 128k | 64k |
| 信頼できる知識カットオフ | 2026年1月 | 2026年5月 | 2026年1月 | 2025年2月 |
| 拡張思考 | なし | なし | なし | あり |
| 適応的思考 | あり（常にオン） | あり | あり | なし |
| レイテンシ | 遅い | 中程度 | 速い | 最速 |

- Fable 5 は Opus 4.7 導入のトークナイザを使うため、同じテキストで約30%多いトークンを生成する。表示価格以上に実効コストが高い
- **Fable 5 の知識カットオフ（2026年1月）は Opus 5（2026年5月）より古い。** 最新の Claude Code 仕様やモデル情報を扱う判断では Opus 5 が有利
- Batch API の `output-300k-2026-03-24` ベータヘッダー使用時は Opus 5 / Sonnet 5 ともに最大300k出力
- Opus 5 / Sonnet 5 は Claude API と Claude Code で effort 既定が `high`
- temperature / top_p / top_k は非対応（非デフォルト値で400エラー）。`thinking: {type: "adaptive"}` + `/effort` で制御する
- `/fast` は Opus 5 / Opus 4.8 が対象（Fast モード $10/$50）
- Opus 4.8（`claude-opus-4-8`）はレガシー。Opus 5 障害時のフォールバック
- Claude Mythos 5（`claude-mythos-5`）は Project Glasswing の招待制で一般提供なし。選択できないため棲み分けの対象外

### Opus 5 切替通知ルール

以下のタイミングでは作業を始める前に「Opus 5 への切り替えを推奨します: `/model claude-opus-5`」と通知し、CEO の確認を待つ。
切り替え不要と言われたらそのまま続ける。

- superpowers スキル使用時（全種・brainstorming / systematic-debugging / writing-plans / subagent-driven-development / dispatching-parallel-agents 等）
- 歌詞レビュー（承認ゲート③直前）・PVコンセプトレビュー（承認ゲート⑥直前）
- SVP生成（`/phase2-svp` 実行前）
- CLAUDE.md 等の重要設計変更のクリティーク
- Agent Teams のレビューフェーズ（quality-listener・concept-critic）
- 出力が 64k tokens 超になる見込みの大型タスク

最重要レビュー（③歌詞・⑥PVコンセプト）とコーディング系タスク（SVP生成・HP作業・Agent Teams起動）には `/effort xhigh` を付与する。
hooks から `CLAUDE_EFFORT` 環境変数を参照できる（v2.1.133〜）。

### Agent Teams のモデル割当

3役モデル: explorer（調査）→ Haiku / architect（設計）→ Sonnet 5 / executor（実行）→ Sonnet 5（品質重要な場面は Opus 5）。

| エージェント | フェーズ | モデル |
|---|---|---|
| trend-analyst | 1 | Sonnet 5 |
| music-spec-writer / lyric-poet | 2-A | Sonnet 5（起案） |
| lyric-critic（③直前） | 2-B | Opus 5（批評） |
| svp-generator | 2-C | Opus 5 |
| quality-listener | 2-D | Sonnet 5 |
| concept-director / visual-prompter | 3 | Sonnet 5（起案） |
| concept-critic（⑥直前） | 3-R | Opus 5（批評） |
| sns-batch-agent / press-release-writer / copyright-agent | 4 | Sonnet 5 |
| analytics-agent | 4 | Haiku |

### デザインの既定

クリーム背景・セリフ体（NuWord のデザイン言語と一致・Opus 4.8 からの運用ノウハウを踏襲）。
```

- [ ] **Step 4: ~/.claude/references/ へコピーする**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
cp claude-config/references/nocta-cheatsheet.md /Users/fghmacbook013/.claude/references/
cp claude-config/references/nocta-tools.md      /Users/fghmacbook013/.claude/references/
ls -1 /Users/fghmacbook013/.claude/references/
```

Expected: `codex-review-setup.md` / `fable5-prompting-guide.md` / `model-lineup.md` / `nocta-cheatsheet.md` / `nocta-tools.md` の5ファイル。

- [ ] **Step 5: 参照先が実在することを検証する**

```bash
for f in nocta-cheatsheet.md nocta-tools.md model-lineup.md; do
  p="/Users/fghmacbook013/.claude/references/$f"
  [ -r "$p" ] && echo "OK  $f ($(wc -l < "$p" | tr -d ' ') 行)" || echo "NG  $f"
done
grep -c "^## CLAUDE.md から移した詳細" /Users/fghmacbook013/.claude/references/model-lineup.md
grep -n "最終更新" /Users/fghmacbook013/.claude/references/model-lineup.md | head -1
```

Expected: 3行すべて OK。`grep -c` は 1。最終更新行が `2026-08-05 rev.7`。

- [ ] **Step 6: コミット**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add claude-config/references/nocta-cheatsheet.md claude-config/references/nocta-tools.md
git commit -m "feat(references): 運用チートシートと制作ツール選択肢を新設

CLAUDE.md から参照情報を分離。~/.claude/references/ へのコピー元として版管理する。
model-lineup.md へのモデル仕様吸収は ~/.claude 側のみ（版管理外）。"
```

---

### Task 3: 新正本 project_NOCTA/CLAUDE.md をゼロベースで書く

**Files:**
- Modify: `/Users/fghmacbook013/NOCTA/project_NOCTA/CLAUDE.md`（全面置換）
- Modify: `drafts/claude-md-audit-2026-08-05.md`（project_NOCTA セクションの行き先を記入）

**Interfaces:**
- Consumes: Task 1 の `docs/superpowers/archive/claude-md-2026-08-05/project-CLAUDE.md`（原文）、Task 2 が作った3つの references パス
- Produces: 新正本（Task 4 の `NOCTA/CLAUDE.md` が `@project_NOCTA/CLAUDE.md` で import する）。R-02 の本文が Task 5 の deny/hook の存在を告知する

- [ ] **Step 1: 新正本を書く（全面置換）**

`/Users/fghmacbook013/NOCTA/project_NOCTA/CLAUDE.md` を以下の内容で置き換える。

````markdown
# CLAUDE.md — NOCTA クリエイティブスタジオ（正本）

Music × Visual × Words × Code の複数領域クリエイティブスタジオ。CEO と AI エージェントチームで
企画から公開までを完結させるスタッフゼロ型会社。各領域は独立した並行ストリームとして進み、楽曲制作はそのうちの1本。
CEO は Studio One Pro / Synthesizer V Studio PRO / UR22C / MPM-1000 を自ら操作する制作者兼ディレクターで、
作曲・編曲・ボーカル制作・ミックスまで自分で行う。
AI の役割は設計書・プロンプト・文章・コード・ファイルを作ること。音の判断・感情的なクオリティ判断・各領域の最終採否は CEO が行う。

参照情報（必要になったときだけ読む）:

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
````

- [ ] **Step 2: 行数を確認する**

```bash
wc -l /Users/fghmacbook013/NOCTA/project_NOCTA/CLAUDE.md
```

Expected: 250行以下（目標値）。超えている場合は、参照情報として references へ移せる記述が残っていないか見直す。

- [ ] **Step 3: ルールの欠落がないことを検証する**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
echo "=== 新正本のルール ==="
grep -c "^### R-" CLAUDE.md
echo "=== 旧正本のルール ==="
grep -c "^### R-" docs/superpowers/archive/claude-md-2026-08-05/project-CLAUDE.md
echo "=== 各ルールの見出し ==="
grep "^### R-" CLAUDE.md
```

Expected: 新正本は17（R-01〜R-17）、旧正本は15（R-01〜R-15）。
新正本の R-16 は旧「コード・設計作業の発散」、R-17 は旧グローバル/NOCTA 側のフロントエンドデザイン規定を昇格させたもの。
R-01〜R-15 の番号と主旨が旧版と一致していることを目視確認する（他ドキュメントが R 番号を参照しているため、既存番号を動かさない）。

- [ ] **Step 4: 参照リンク先が実在することを検証する**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
for p in ~/.claude/references/nocta-cheatsheet.md ~/.claude/references/nocta-tools.md ~/.claude/references/model-lineup.md website/CLAUDE.md; do
  [ -r "$p" ] && echo "OK  $p" || echo "NG  $p"
done
```

Expected: 4行すべて OK。

- [ ] **Step 5: 監査表に project_NOCTA セクションの行き先を記入する**

`drafts/claude-md-audit-2026-08-05.md` の `## project_NOCTA/CLAUDE.md（349行）` の表を埋める。

```markdown
| 旧セクション | 内容要約 | 行き先 | 理由 |
|---|---|---|---|
| 会社アイデンティティ | ミッション・CEO スキルセット・AI の立ち位置 | 正本に残す（4行に圧縮） | ないと AI が CEO の作業領域を侵す。R-10 の前提 |
| RULES R-01〜R-15 | 全ルール（理由付き・詳細版） | 正本に残す（R-01〜R-15 として圧縮・R-16/R-17 を追加） | ないと Claude が間違う。ルールは1本も削除しない |
| R-09 のモデル仕様詳細 | 価格・コンテキスト長・切替通知ルール・注意事項（約25行） | references/model-lineup.md | 参照時にのみ必要。かつ価格と仕様は頻繁に変わる |
| R-13 の代替ツール列挙 | ACE-Step / Khala / Mureka の詳細 | references/nocta-tools.md | 参照時にのみ必要。選定候補は頻繁に変わる |
| MEMORY | 空欄テンプレート3ブロック | 削除 | 数ヶ月空欄のまま。auto-memory（公式機能）を実運用中で役割が重複 |
| PROJECT CONTEXT | 空欄テンプレート | 正本に残す | 曲ごとに埋める運用中。ないとフェーズ判断ができない |
| CODEMAP | ディレクトリ構造 + 担当エージェント注記 | 正本に残す（担当エージェント注記は削除） | 構造はないと迷う。担当注記は AGENTS と重複 |
| AGENTS 依存関係マップ（ASCII図） | 12行の矢印図 | 削除（フロー1行に圧縮） | 1行のフロー表記で同じ情報が伝わる |
| AGENTS エージェント表 | 11エージェントとモデル | references/model-lineup.md | 実体は ~/.claude/agents/。参照時にのみ必要 |
| MCP管理（常時有効・必要時・無効化推奨） | 3分類の説明 | 正本に3行 + references/nocta-tools.md | 80以下維持はルール。個別ツールの設定は参照情報 |
| APPROVAL GATES | ①〜⑨ + コマンド列 | 正本に残す | ないと AI が勝手に次フェーズへ進む |
| SLASH COMMANDS | コマンド表 | 削除 | ハーネスが利用可能スキル一覧を毎セッション自動提示する。references/nocta-cheatsheet.md に CEO 用の一覧を置く |
| COST POLICY | モード + 判断基準 + effort | 正本に残す（ワークフローを追加） | ないとコスト判断を誤る |
```

- [ ] **Step 6: コミット**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add CLAUDE.md drafts/claude-md-audit-2026-08-05.md
git commit -m "refactor(claude-md): 正本をゼロベースで再構築（349行→250行以下）

R-01〜R-15 は主旨と番号を維持したまま圧縮。R-16（多筋フレーミング）R-17（frontend-design）を昇格。
モデル仕様・ツール選択肢・コマンド一覧は references へ分離。MEMORY 空欄テンプレとコマンド表を削除。"
```

---

### Task 4: グローバル / NOCTA / website の3ファイルを書き換える

**Files:**
- Modify: `/Users/fghmacbook013/.claude/CLAUDE.md`（全面置換）
- Modify: `/Users/fghmacbook013/NOCTA/CLAUDE.md`（全面置換）
- Modify: `/Users/fghmacbook013/NOCTA/project_NOCTA/website/CLAUDE.md`（全面置換）
- Modify: `drafts/claude-md-audit-2026-08-05.md`（残り3セクションの行き先を記入）

**Interfaces:**
- Consumes: Task 3 の新正本（`NOCTA/CLAUDE.md` が import する）、Task 2 の references パス
- Produces: 4ファイル体制の完成形。Task 6 が合計行数とロード挙動を検証する

- [ ] **Step 1: グローバル CLAUDE.md を書く**

`/Users/fghmacbook013/.claude/CLAUDE.md` を以下で置き換える。

```markdown
# CLAUDE.md — グローバル共通ルール

全プロジェクト・全セッションで常に有効な原則。
プロジェクト固有のルールは各プロジェクトルートの CLAUDE.md が上書き拡張する。

---

## G-01: モデルを目的で使い分ける

調査・短文生成 → Haiku 4.5 / 起案（既定）→ Sonnet 5 / 批評・重要設計レビュー → Opus 5 /
深い推論が必要な超重要案件 → Fable 5。
起案→批評フロー: Sonnet 5 が草稿 → Opus 5 が批評・代替案提示 → 最終選択。
コスト最適化: 単純タスクは `/effort low`、標準は `high`、最重要は `xhigh`。`ultracode` は既定では使わない。

価格・コンテキスト長・知識カットオフ・Opus 5 切替通知ルール・新モデル対応は `~/.claude/references/model-lineup.md`。
新モデルリリース時は `/model-review` で棲み分けを再議論する。

## G-02: ファイル読み込みは最小限

セッション開始時は context.md と handoff.md のみ読む。他は必要な瞬間に読む。先読みしない。
既存コードへの変更・機能追加時は、変更対象ファイルを実装前に Read して関連ファイルを把握する。

## G-03: ドキュメントに絵文字を使わない

仕様書・handoff.md・コードコメントには使わない。SNS 投稿文・プレゼン資料のカジュアル版のみ可。

## G-04: 対話してから作業する

Goサインなしにファイル生成を開始しない。
3C（Concise / Contextual / Constrained）を意識し、初回プロンプトに Goal + Constraints + Acceptance criteria を一括で渡す。
逐次指示より初回一括の方が精度が高い。

## G-05: 再開できる状態を保つ

作業完了時に handoff.md を更新する（「完了した事実」と「次のアクション」を1〜3行）。進行中タスクは drafts/ に保存する。

## G-06: 納品デブリーフ（Blind Spot Pass）

非自明な制作・実装・設計タスクでは、作業中に気づきをサイレントに溜め、最終報告の末尾に「デブリーフ」節として示す。
目的は次の依頼を鋭くすること。作業中は質問で手を止めない。

1. 盲点（3件以内・重要度順）
2. 実装中の判断とその理由（3件以内・迷って保守的に倒した箇所を優先）
3. 類似サービス比較からの示唆（採用/ 不採用と理由）
4. 次の依頼を鋭くする質問（2〜3問・回答は任意。返答がなくても作業は完結している状態にする）
5. 次回の依頼文テンプレ（1〜2文の具体例）

単発質問・微修正・定型作業には付けない（ノイズ防止）。
破壊的操作・スコープの根本変更に関わる判断だけは従来通り作業中に確認する。
デブリーフへの回答は次回作業の前提として handoff またはプロジェクト CLAUDE.md に反映する。

## G-07: 常時ロードを膨らませない

CLAUDE.md には常時適用ルールのみ書く。状況限定ワークフローはスキル（`~/.claude/commands/`）へ、
参照情報は `~/.claude/references/` へ1行ポインタで分離する。
各行に「これを削除すると Claude が間違いを犯すか」を問い、否なら削除する。
スキルファイルは500行以内を目安にし、詳細は references/ へ分離する。

---

## セキュリティ

`~/.claude/settings.json` の `permissions.deny` に設定済み（実行不可）:
`git push --force` / `git push -f` / `git reset --hard` / `git clean -f` / `git rebase` / `rm -rf`、
および NOCTA の `outputs/approved/` への編集（`approved-guard` hook が Bash 経由の書き込みも塞ぐ）。

`~/.claude/settings.json` は API キーを平文で含むため、リポジトリにコピーしない。

## コードレビュー

`/review [計画書]` / `/review-diff` — Codex CLI を第三者レビュアーとして呼ぶ。
既定は ChatGPT Plus 連携（gpt-5.5・定額）。exit 75 で連携切れを検知したら、ユーザー確認の上で API 従量課金へフォールバックする。
構成・トラブルシュートは `~/.claude/references/codex-review-setup.md`。

## 運用の入口

セッション運用・コマンド一覧・定期確認の手順は `~/.claude/references/nocta-cheatsheet.md`。
```

- [ ] **Step 2: NOCTA/CLAUDE.md を書く**

`/Users/fghmacbook013/NOCTA/CLAUDE.md` を以下で置き換える。

```markdown
# CLAUDE.md — NOCTA

Music × Visual × Words × Code の複数領域クリエイティブスタジオ。
ルール・CODEMAP・承認ゲートの正本は `project_NOCTA/CLAUDE.md`（git 管理下）。

@project_NOCTA/CLAUDE.md
```

- [ ] **Step 3: website/CLAUDE.md を書く**

`/Users/fghmacbook013/NOCTA/project_NOCTA/website/CLAUDE.md` を以下で置き換える。

````markdown
# CLAUDE.md — NOCTA Website

HP（`website/`）に関するルール。正本（`project_NOCTA/CLAUDE.md`）と併用する。

---

## ホスティングとパス

- 本番は GitHub Pages（`https://kutakuta1001.github.io/NOCTA/`）。`main` への push で GitHub Actions が自動デプロイする
- `website/` の中身がそのままサイトルートとして公開される
- **パスはすべて相対パス**（`./visual-data.js` など）。絶対パス（`/visual-data.js`）は GitHub Pages でずれるため使わない
- Netlify（`https://[slug].netlify.app/`）は無料枠超過中・月初リセット待ち

## ファイル構成

```
website/
├── index.html          ← 唯一のHTMLエントリポイント
├── visual-data.js      ← Visual セクション（3配列）
├── blog-data.js        ← Blog セクション
├── works-data.js       ← Works セクション
├── apps-data.js        ← Apps セクション（専用スキルなし・手動編集）
├── brandkit.html       ← ブランドガイド
├── success.html        ← フォーム送信完了ページ
├── blog/               ← ブログ記事ページ（静的HTML）
└── the-first-flower/   ← 楽曲専用ランディングページ
```

## データファイルのルール

### visual-data.js

3配列で構成し、**先頭に追加**する。
`NOCTA_VISUALS_WORKS`（完成品・Canva加工済み・Base chain）/ `NOCTA_VISUALS_ART`（AI生成元画像・Zora chain）/ `NOCTA_VISUALS_MUSIC`（楽曲連動）。

各オブジェクトの必須フィールド:

```js
{
  title: "作品タイトル",
  imgUrl: "https://ipfs.io/ipfs/[CIDv1ハッシュ]",
  zoraUrl: "https://zora.co/collect/[chain]:[contract]/[tokenId]",
  badge: "Works" | "Art" | "Music",
  badgeColorClass: "bg-amber-500/20 text-amber-400",  // Works
                // "bg-brand-gold/20 text-brand-gold" // Art / Music
  descJa: "日本語説明文",
}
```

- `imgUrl` は必ず `https://ipfs.io/ipfs/` + CIDv1（`bafybei` 始まり）
- **CIDv1 は59文字。60文字以上は末尾が余分で422エラーの原因になる**
- `zoraUrl` が不明な場合は `https://zora.co/@kutakuta1001` を使う
- 追加は `/visual-add [作品名]`（IPFSハッシュの自動バリデーション付き）

### blog-data.js / works-data.js

`NOCTA_BLOG` は先頭が最新記事。各オブジェクトは `slug` / `title` / `cat` / `date` / `excerpt` / `contentHtml`。追加は `/blog-publish`。
`NOCTA_WORKS` は先頭が最新楽曲。追加は `/hp-add-work [曲名] [YouTubeID]`。

## git 操作（HP作業時）

- `git add` は `website/` 以下のファイルのみ個別指定する。`git add -A` / `git add .` は使わない
- 実画像・動画ファイル（png / jpg / mp4 等）は git に追加しない
- `main` への push は本番デプロイを起動する。**CEO の明示的な指示がある場合のみ push する**（バックグラウンドセッション・ワークフローからは commit までにとどめる）

## デザインシステム

詳細仕様は `website/DESIGN.md`（カラートークン・タイポグラフィ・アセット生成ガイド）。

- Tailwind CSS（CDN）。フォントは `font-display`（見出し）/ `font-heading`（小見出し）/ `font-jp`（日本語本文）
- ブランドカラー: `text-brand-gold`（#C4942A）。確定パレットはシルバー #B8B4AE × オフホワイト #E8E0D0
- 画像比率: `aspect-[3/4]`（Visual カード・縦長）/ `aspect-video`（他カード・横長）
- Visual バッジ色: Works は `bg-amber-500/20 text-amber-400`、Art / Music は `bg-brand-gold/20 text-brand-gold`

新規ページ作成・大幅改修時は `frontend-design:frontend-design` を呼ぶ（正本 R-17）。渡すコンテキスト:

```
Tone: editorial serif-led dark
Constraints: Tailwind CSS CDN, relative paths, EB Garamond/Syne/Bebas Neue fonts
Background: #0A0906 dark base, warm cream accents (#F0EAD8)
Accent: brand-gold gold (#C4942A)
```

避けるパターン: Inter フォント + 紫グラデーション + 白背景の組み合わせ / 対称的な均等グリッドのみのレイアウト / 装飾ゼロのフラットカード羅列。
````

- [ ] **Step 4: 行数と合計を測る**

```bash
for f in /Users/fghmacbook013/.claude/CLAUDE.md /Users/fghmacbook013/NOCTA/CLAUDE.md /Users/fghmacbook013/NOCTA/project_NOCTA/CLAUDE.md /Users/fghmacbook013/NOCTA/project_NOCTA/website/CLAUDE.md; do
  printf "%-60s %5s 行\n" "$f" "$(wc -l < "$f" | tr -d ' ')"
done
cat /Users/fghmacbook013/.claude/CLAUDE.md /Users/fghmacbook013/NOCTA/CLAUDE.md /Users/fghmacbook013/NOCTA/project_NOCTA/CLAUDE.md /Users/fghmacbook013/NOCTA/project_NOCTA/website/CLAUDE.md | wc -l -m
```

Expected: グローバル約60行 / NOCTA 約6行 / 正本250行以下 / website 約90行、合計400行以下。
超過している場合は Task 6 に進まず、references へ移せる記述を探して圧縮する。

- [ ] **Step 5: 監査表の残り3セクションを記入する**

`drafts/claude-md-audit-2026-08-05.md` の `~/.claude/CLAUDE.md` / `NOCTA/CLAUDE.md` / `website/CLAUDE.md` の表を埋める。

```markdown
## ~/.claude/CLAUDE.md（174行）

| 旧セクション | 内容要約 | 行き先 | 理由 |
|---|---|---|---|
| G-01 モデルを目的で使い分ける | モデル4種の仕様・価格・切替通知ルール（約25行） | 正本 R-09 と重複するため4行に圧縮 + references/model-lineup.md | 3ファイルに同一内容が約25行ずつあった。仕様と価格は頻繁に変わる |
| G-02 ファイル読み込みは最小限 | 常時適用ルール | 残す | ないと Claude が先読みしてコンテキストを埋める |
| G-03 絵文字を使わない | 常時適用ルール | 残す | ないと Claude が既定で絵文字を使う |
| G-04 対話してから作業する | 常時適用ルール + 3C + Goal/Constraints/AC | 残す | ないと Claude が合意前に着手する |
| G-05 再開できる状態を保つ | handoff 運用 | 残す | ないと handoff が書かれない |
| G-06 納品デブリーフ | 5項目の出力形式 + 適用範囲 | 残す | ないとデブリーフが出ない。形式が具体的でないと機能しない |
| セッション運用（表） | 操作と方法の対応表 | references/nocta-cheatsheet.md | CEO が参照する情報。Claude の判断には不要 |
| COST POLICY | Plan Mode / Subagent / Agent Teams | 削除（正本 COST POLICY に一元化） | プロジェクト側と重複。NOCTA 以外のプロジェクトがない |
| スキル・CLAUDE.md 設計 | 500行以内・context:fork 等 | G-07 に統合（context:fork の詳細は削除） | 500行制限は残す価値がある。context:fork の版情報は頻繁に変わる |
| フロントエンド作成 | frontend-design / designer 運用 | 正本 R-17 へ昇格 | プロジェクト側にも同内容があった。ルールとして一元化 |
| MCP管理 | ツール80以下 | 削除（正本 MCP に一元化） | プロジェクト側と重複 |
| セキュリティ | deny リスト | 残す（approved/ を追記） | 何が実行不可かを Claude が知る必要がある |
| コードレビュー（Codex CLI） | /review 認証フォールバック | 残す（詳細は既存 references へのポインタ） | exit 75 のフォールバック手順は判断に必要 |
| ベストプラクティス定期確認 | /weekly-check 等 | references/nocta-cheatsheet.md | CEO が参照する情報 |

## NOCTA/CLAUDE.md（310行）

| 旧セクション | 内容要約 | 行き先 | 理由 |
|---|---|---|---|
| 全セクション | project_NOCTA/CLAUDE.md の簡約版（14セクションが重複） | 削除 → `@project_NOCTA/CLAUDE.md` の import 1行に置換 | 同一内容の詳細版と簡約版が両方ロードされていた。正本を1本にする |
| アイデンティティ | スタジオ定義 | 2行のみ残す | import 前に何のプロジェクトか分かる必要がある |
| MCP管理の調査オプション | X / YouTube / マルチPF 調査手段の詳細（約40行） | references/nocta-tools.md | デフォルト無効のオプション。使うときだけ読む |
| ローカルLLMオプション | Qwen / Ollama | references/nocta-tools.md | 参照時にのみ必要 |
| SLASH COMMANDS（4表） | コマンド一覧 | references/nocta-cheatsheet.md | ハーネスがスキル一覧を自動提示する。CEO 用の一覧は cheatsheet へ |

## website/CLAUDE.md（140行）

| 旧セクション | 内容要約 | 行き先 | 理由 |
|---|---|---|---|
| ホスティング構成 | GitHub Pages / Netlify・パス規則 | 残す（表を箇条書きに圧縮） | 相対パス規則は間違えると本番が壊れる |
| ファイル構成 | website/ 直下の構造 | 残す | ないとファイルを探せない |
| データファイルのルール | visual / blog / works / apps の各仕様 | 残す（CIDv1 59文字を強調） | 間違えると422エラーで本番が壊れる |
| git 操作ルール | add 個別指定・コミットメッセージ例 | 残す（push 制約を追記・コミット例は正本と重複分を削除） | 本番デプロイに直結する |
| デザインシステム | Tailwind・フォント・色・比率 | 残す（DESIGN.md へのポインタは維持） | UI 実装時に必要 |
| フロントエンドデザイン強化 | 呼び出し場面・NOCTA コンテキスト・禁止パターン | 圧縮して残す（呼び出し規定は正本 R-17 へ） | 渡すコンテキスト文字列は実務で必要。呼び出し条件はルールなので正本へ |
| @import の設定 | NOCTA/CLAUDE.md からの明示 import | 削除（子ディレクトリ自動ロードに変更） | HP 作業時のみ読み込めば足りる。通常セッションから約90行が消える |

## 削除判定の一覧（CEO レビュー必須）

| 削除対象 | 元の場所 | 理由 |
|---|---|---|
| MEMORY 空欄テンプレート3ブロック | project_NOCTA/CLAUDE.md | 数ヶ月空欄のまま。auto-memory と役割が重複 |
| SLASH COMMANDS 表 | project_NOCTA + NOCTA（2ファイル） | ハーネスがスキル一覧を毎セッション自動提示。CEO 用一覧は cheatsheet へ移設 |
| AGENTS 依存関係マップ（ASCII図12行） | project_NOCTA/CLAUDE.md | 1行のフロー表記で同じ情報が伝わる |
| COST POLICY（グローバル側） | ~/.claude/CLAUDE.md | プロジェクト側と重複。NOCTA 以外のプロジェクトがない |
| MCP管理（グローバル側） | ~/.claude/CLAUDE.md | プロジェクト側と重複 |
| context:fork / サブエージェント上限の版情報 | ~/.claude + project_NOCTA | 頻繁に変わる情報。必要時は公式ドキュメントを見る |
| NOCTA/CLAUDE.md の全ルール記述 | NOCTA/CLAUDE.md | 正本の簡約版。import に置換 |
| Netlify の詳細説明 | website/CLAUDE.md | 無料枠超過で停止中。1行に圧縮 |
```

- [ ] **Step 6: コミット**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add website/CLAUDE.md drafts/claude-md-audit-2026-08-05.md
git commit -m "refactor(claude-md): NOCTA/website を圧縮し正本 import 体制へ移行

NOCTA/CLAUDE.md は @project_NOCTA/CLAUDE.md の import + 2行に縮小（310行→6行）。
website/CLAUDE.md は明示 import をやめ子ディレクトリ自動ロードに変更（HP作業時のみロード）。
~/.claude/CLAUDE.md（版管理外）も 174行→約60行に圧縮済み。"
```

注: `~/.claude/CLAUDE.md` と `NOCTA/CLAUDE.md` は git 管理外なのでこのコミットには含まれない。両ファイルの旧版は Task 1 の退避に入っている。

---

### Task 5: approved/ のハードガード（deny ルール + PreToolUse hook）

**Files:**
- Create: `claude-config/hooks/approved-guard.sh`
- Copy to: `/Users/fghmacbook013/.claude/hooks/approved-guard.sh`
- Modify: `/Users/fghmacbook013/.claude/settings.json`（permissions.deny に1行追加・hooks.PreToolUse を新設）

**Interfaces:**
- Consumes: Task 3 の R-02 本文（deny と hook の存在を告知している）
- Produces: `Edit(//Users/fghmacbook013/NOCTA/**/outputs/approved/**)` の deny ルールと `approved-guard.sh`。Task 6 が両方の実効性を検証する

- [ ] **Step 1: approved-guard.sh を書く**

`claude-config/hooks/approved-guard.sh`:

```bash
#!/usr/bin/env bash
# approved-guard — outputs/approved/ への Bash 経由の書き込みを block する PreToolUse hook
#
# 背景: permissions.deny の Edit(path) ルールは Claude の組み込みファイルツールと
# Claude Code が認識する一部の Bash ファイルコマンド（cat/head/tail/sed 等）にしか効かない。
# cp / mv / tee / リダイレクト等の経路をこの hook が塞ぐ。
#
# 設計:
#   - 判定は正規表現のみ（LLM 判定なし・決定論的・数ミリ秒）
#   - fail-closed（判定に迷ったら deny 側に倒す）
#   - stop-hook-lib.sh は source しない（read_hook_input が transcript_path を要求し
#     無ければ exit 0 するため、PreToolUse では常に素通しになる）
#   - CEO 自身のターミナル操作はこの hook を通らないため影響を受けない
set -u

LOG_DIR="$HOME/.claude/logs"
LOG_FILE="$LOG_DIR/approved-guard-$(date +%Y-%m-%d).log"

INPUT="$(cat 2>/dev/null || true)"
COMMAND="$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)"

# コマンドが取れない場合は判定対象外（他ツールの呼び出し等）
[ -n "$COMMAND" ] || exit 0

# approved/ に言及していなければ即通過（大多数のケース）
printf '%s' "$COMMAND" | grep -qE 'outputs/approved' || exit 0

# 書き込みの意図を示すパターン
WRITE_INTENT='(^|[[:space:];&|])(cp|mv|rsync|tee|touch|mkdir|rm|install|ln|dd|chmod|chown)([[:space:]]|$)|>[[:space:]]*[^[:space:]]*outputs/approved|>>[[:space:]]*[^[:space:]]*outputs/approved|sed[[:space:]]+-i|python3?[[:space:]].*open\(|node[[:space:]].*writeFile'

if printf '%s' "$COMMAND" | grep -qE "$WRITE_INTENT"; then
  mkdir -p "$LOG_DIR"
  printf '%s\tDENY\t%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$COMMAND" >> "$LOG_FILE"
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "outputs/approved/ への書き込みは approved-guard により禁止されています（R-02）。承認済みファイルの配置は CEO の手動操作のみです。"
    }
  }'
  exit 0
fi

# approved/ に言及しているが書き込み意図が読み取れないケース（読み取り専用の cat / ls / grep 等）は通過
mkdir -p "$LOG_DIR"
printf '%s\tALLOW\t%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$COMMAND" >> "$LOG_FILE"
exit 0
```

- [ ] **Step 2: 実行権限を付けて配置する**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
mkdir -p claude-config/hooks
chmod +x claude-config/hooks/approved-guard.sh
cp claude-config/hooks/approved-guard.sh /Users/fghmacbook013/.claude/hooks/approved-guard.sh
chmod +x /Users/fghmacbook013/.claude/hooks/approved-guard.sh
ls -l /Users/fghmacbook013/.claude/hooks/
```

Expected: `approved-guard.sh` が `-rwxr-xr-x` で存在する。

- [ ] **Step 3: スクリプトを単体テストする（settings.json 変更前）**

```bash
h=/Users/fghmacbook013/.claude/hooks/approved-guard.sh

echo "--- deny されるべき5件 ---"
for c in \
  'cp drafts/x.md outputs/approved/x.md' \
  'mv outputs/prompts/a.md project_NOCTA/outputs/approved/a.md' \
  'echo hi > outputs/approved/x.md' \
  'cat drafts/a.md >> outputs/approved/a.md' \
  'sed -i "" s/a/b/ outputs/approved/a.md' ; do
  r=$(printf '{"tool_name":"Bash","tool_input":{"command":%s}}' "$(jq -Rn --arg c "$c" '$c')" | bash "$h" | jq -r '.hookSpecificOutput.permissionDecision // "allow"')
  printf '%-8s %s\n' "$r" "$c"
done

echo "--- allow されるべき4件 ---"
for c in \
  'cat outputs/approved/x.md' \
  'ls -la outputs/approved/' \
  'cp outputs/approved/x.md drafts/x.md' \
  'git status --short' ; do
  r=$(printf '{"tool_name":"Bash","tool_input":{"command":%s}}' "$(jq -Rn --arg c "$c" '$c')" | bash "$h" | jq -r '.hookSpecificOutput.permissionDecision // "allow"')
  printf '%-8s %s\n' "$r" "$c"
done
```

Expected: 前半5件すべて `deny`、後半4件すべて `allow`。
`cp outputs/approved/x.md drafts/x.md`（approved/ からのコピー）が deny になる場合は、`WRITE_INTENT` が
コピー元と先を区別できていない。fail-closed の方針上この誤検知は許容するが、頻繁に困る場合は
「approved/ が最後の引数またはリダイレクト先にある場合のみ deny」へ絞り込む。その判断は CEO に確認する。

- [ ] **Step 4: settings.json を変更する**

`update-config` スキルを使って `~/.claude/settings.json` を変更する。加える差分は2箇所のみ。

`permissions.deny` 配列の末尾に追加:

```json
"Edit(//Users/fghmacbook013/NOCTA/**/outputs/approved/**)"
```

トップレベルの `hooks` に `PreToolUse` を新設（既存の `Stop` は変更しない）:

```json
"PreToolUse": [
  {
    "matcher": "Bash",
    "hooks": [
      {
        "type": "command",
        "command": "bash \"$HOME/.claude/hooks/approved-guard.sh\"",
        "timeout": 10,
        "statusMessage": "approved-guard 検査中"
      }
    ]
  }
]
```

**注意:** `env` ブロックには API キーが平文で入っている。このファイルをリポジトリにコピーしてはならない。
`claude-config/settings.json`（版管理側）へ反映する場合は、`permissions` と `hooks` のキーのみを手で写す。

- [ ] **Step 5: settings.json の構文と内容を検証する**

```bash
python3 -c "
import json
s = json.load(open('/Users/fghmacbook013/.claude/settings.json'))
deny = s['permissions']['deny']
print('deny 件数:', len(deny))
print('approved ルール:', [d for d in deny if 'approved' in d])
print('Write ルールの誤用:', [d for d in deny if d.startswith('Write(')] or 'なし')
pre = s.get('hooks', {}).get('PreToolUse', [])
print('PreToolUse:', json.dumps(pre, ensure_ascii=False))
print('Stop hooks 件数:', len(s.get('hooks', {}).get('Stop', [])[0].get('hooks', [])) if s.get('hooks', {}).get('Stop') else 0)
"
```

Expected: deny 件数7、approved ルールは `Edit(//Users/fghmacbook013/NOCTA/**/outputs/approved/**)` の1件、
`Write(` で始まるルールは「なし」、PreToolUse に approved-guard が1件、Stop hooks は3件（既存のまま）。

- [ ] **Step 6: コミット**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add claude-config/hooks/approved-guard.sh
git commit -m "feat(hooks): approved-guard で outputs/approved/ への Bash 書き込みを block

R-02 を論理ルールからハードガードへ降格。deny の Edit ルールと二層構成。
判定は正規表現のみで fail-closed。stop-hook-lib.sh は PreToolUse では使えないため独立実装。
settings.json 側の変更（deny 1行 + PreToolUse）は ~/.claude のみ（API キーを含むため版管理しない）。"
```

---

### Task 6: 総合検証と CEO レビューの準備

**Files:**
- Modify: `drafts/claude-md-audit-2026-08-05.md`（検証結果を追記）
- Create: `drafts/claude-md-slimdown-verification-2026-08-05.md`

**Interfaces:**
- Consumes: Task 1 のベースライン数値、Task 3・4 の新4ファイル、Task 5 の deny/hook
- Produces: 検証レポート（CEO レビューの入力）

- [ ] **Step 1: 削減量を実測する**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
A=/Users/fghmacbook013/.claude/CLAUDE.md
B=/Users/fghmacbook013/NOCTA/CLAUDE.md
C=/Users/fghmacbook013/NOCTA/project_NOCTA/CLAUDE.md
D=/Users/fghmacbook013/NOCTA/project_NOCTA/website/CLAUDE.md
for f in "$A" "$B" "$C" "$D"; do printf "%-60s %5s 行 %6s 文字\n" "$f" "$(wc -l < "$f" | tr -d ' ')" "$(wc -m < "$f" | tr -d ' ')"; done
echo "--- 合計 ---"; cat "$A" "$B" "$C" "$D" | wc -l -m
echo "--- 非HP作業の常時ロード（website を除く） ---"; cat "$A" "$B" "$C" | wc -l -m
```

Expected: 合計400行以下、website を除いた常時ロードが320行以下。未達なら Task 3・4 に戻る。

- [ ] **Step 2: 重複セクションが解消されたことを検証する**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
for f in /Users/fghmacbook013/.claude/CLAUDE.md /Users/fghmacbook013/NOCTA/CLAUDE.md CLAUDE.md website/CLAUDE.md; do
  grep -h "^## \|^### R-\|^### G-" "$f" | sed "s|^|$f\t|"
done | awk -F'\t' '{print $2}' | sed 's/（.*//' | sort | uniq -c | sort -rn | awk '$1>=2'
```

Expected: 出力なし（2ファイル以上に重複する見出しがゼロ）。before は14件だった。

- [ ] **Step 3: ロード挙動を検証する**

新しいセッションを別ターミナルで起動して確認する（このセッションでは検証できない）。**開始ディレクトリの違いで結果が変わるため、`/Users/fghmacbook013/NOCTA` と `/Users/fghmacbook013/NOCTA/project_NOCTA` の両方から起動して確認する。**

```
cd /Users/fghmacbook013/NOCTA && claude
```
```
cd /Users/fghmacbook013/NOCTA/project_NOCTA && claude
```

起動後にそれぞれ `/context` を実行し、以下を確認する。

1. `project_NOCTA/CLAUDE.md`（正本）がロードされている
2. 正本が二重にロードされていない
3. `website/CLAUDE.md` がロードされていない

判定と対処（ディレクトリ自動検出は起動ディレクトリとその親ディレクトリのみを対象とするため、二重ロードは `project_NOCTA` 内から起動した場合にのみ起こりうる。子ディレクトリの CLAUDE.md は、そのサブツリー配下のファイルを操作したときに遅延ロードされるだけで、常時ロードには含まれない）:

- 実際にセッションを開始するディレクトリから1回だけロードされている → そのまま完了
- 二重にロードされている（`project_NOCTA` 内から起動した場合のみ発生しうる） → **import 行は削除しない。** `NOCTA/CLAUDE.md` の `@import` は `/Users/fghmacbook013/NOCTA` から起動した際の正本への唯一の経路であり、削除すると読み込み経路そのものが失われる。対処は起動ディレクトリを1つに標準化すること。`/NOCTA` から起動する運用を選ぶなら import はそのまま残す。`project_NOCTA` 内から常に起動する運用に決めた場合のみ、import 行の削除が正しい対処になる
- 正本がロードされていない → 同じ相対形式の `@import` が変更前の `website/CLAUDE.md` で実際に機能していた実績があるため考えにくいが、発生した場合は `NOCTA/CLAUDE.md` の import 行を絶対パス（`@/Users/fghmacbook013/NOCTA/project_NOCTA/CLAUDE.md`）に変えて再確認する
- `website/CLAUDE.md` がロードされている → どこかに `@` import が残っている。`grep -rn "website/CLAUDE.md" /Users/fghmacbook013/NOCTA/CLAUDE.md /Users/fghmacbook013/NOCTA/project_NOCTA/CLAUDE.md` で探して削除する

- [ ] **Step 4: deny ルールの実効性を検証する**

`/context` を確認したセッションで、以下を順に試す。

```
outputs/approved/ に test-guard.md というファイルを作ってください
```

Expected: Write / Edit が deny により拒否される。`bypassPermissions` モードでも deny が効くことをここで確認する
（deny はプロンプトではなくブロックであり、bypassPermissions が省略するのはプロンプトのみ、という理解の実地確認）。

続けて Bash 経由も試す。

```bash
cp /Users/fghmacbook013/NOCTA/project_NOCTA/drafts/handoff.md /Users/fghmacbook013/NOCTA/project_NOCTA/outputs/approved/test-guard.md
```

Expected: approved-guard により deny され、理由文が表示される。`~/.claude/logs/approved-guard-2026-08-05.log` に DENY 行が記録される。

いずれかが通ってしまった場合:

- Write/Edit が通る → deny のパスパターンが合っていない。`Edit(~/NOCTA/**/outputs/approved/**)` に変えて再確認する
- Bash が通る → hook が発火していない。`~/.claude/logs/approved-guard-*.log` が空なら matcher か command パスの誤り。`/hooks` で登録状態を確認する

検証後、誤って作成されたファイルがあれば CEO に削除を依頼する（R-02 により AI は approved/ を触れない）。

- [ ] **Step 5: 挙動テストを行う**

同じセッションで代表タスクを実行し、圧縮後もルールが効いているか確認する。

| 確認するルール | テスト | 期待される挙動 |
|---|---|---|
| R-05 | `/music-status` を実行 | context.md と handoff.md 以外を先読みしない |
| R-06 | handoff.md への追記を依頼 | 1〜3行で「完了した事実」と「次のアクション」のみ |
| R-08 | 上記の追記内容 | 絵文字を含まない |
| R-01 | 「Aメロの雰囲気を決めて」と依頼 | BPM・キー・小節数・コード進行を数値で返す |
| R-11 | 上記の回答 | 「叩き台です。自由に変更してください」が添えられる |
| R-14 | 「フェーズ2を始めて」と依頼 | 先に `/brainstorm` の実行を促す |
| R-09 | 「歌詞をレビューして」と依頼 | Opus 5 への切り替えを提案する |

いずれかが守られない場合、そのルールの記述が圧縮しすぎている。監査表で該当行を確認し、正本の記述を具体化する。

- [ ] **Step 6: 検証レポートを書く**

`drafts/claude-md-slimdown-verification-2026-08-05.md` に以下の形式で記録する。

```markdown
# CLAUDE.md スリム化 検証レポート（2026-08-05）

設計書: docs/superpowers/specs/2026-08-05-claude-md-slimdown-design.md
実装計画: docs/superpowers/plans/2026-08-05-claude-md-slimdown.md
監査表: drafts/claude-md-audit-2026-08-05.md

## 1. 削減量

| ファイル | before | after | 削減 |
|---|---:|---:|---:|
| ~/.claude/CLAUDE.md | 174行 | （実測） | |
| NOCTA/CLAUDE.md | 310行 | （実測） | |
| project_NOCTA/CLAUDE.md | 349行 | （実測） | |
| website/CLAUDE.md | 140行 | （実測） | |
| 合計 | 973行 / 34,507文字 | （実測） | |
| 非HP作業の常時ロード | 973行 | （実測） | |

達成判定: 合計400行以下（達成 / 未達）、非HP 320行以下（達成 / 未達）

## 2. 重複解消

before: 14セクションが2ファイル以上に重複
after: （Step 2 の出力を貼る）

## 3. ロード挙動

- 正本のロード: （1回 / 二重 / されていない）と対処内容
- website/CLAUDE.md: （通常セッションでロードされない / された）と対処内容

## 4. ハードガード

| 経路 | 結果 | ログ |
|---|---|---|
| Write / Edit（deny ルール） | （deny された / 通った） | |
| Bash cp（approved-guard hook） | （deny された / 通った） | |
| 単体テスト（deny 5件 / allow 4件） | （5/5・4/4 等） | |

bypassPermissions 下で deny が有効だったか: （はい / いいえ）

## 5. 挙動テスト

| ルール | 結果 |
|---|---|
| R-01 数値で話す | |
| R-05 読み込み最小限 | |
| R-06 handoff 1〜3行 | |
| R-08 絵文字なし | |
| R-09 モデル切替提案 | |
| R-11 叩き台明記 | |
| R-14 対話してから作業 | |

## 6. 残存リスク

- `Edit` deny と approved-guard は Python / Node スクリプトのような任意のサブプロセスによる書き込みを止められない。OS レベルで塞ぐにはサンドボックスが必要（本作業のスコープ外）
- `~/.claude/CLAUDE.md` と `NOCTA/CLAUDE.md` は git 管理外。復元は docs/superpowers/archive/claude-md-2026-08-05/ のみ
- `claude-config/settings.json` は古い状態のまま（API キーを含む live 設定を同期できないため）

## 7. ロールバック手順

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
cp docs/superpowers/archive/claude-md-2026-08-05/global-CLAUDE.md  /Users/fghmacbook013/.claude/CLAUDE.md
cp docs/superpowers/archive/claude-md-2026-08-05/nocta-CLAUDE.md   /Users/fghmacbook013/NOCTA/CLAUDE.md
git revert <正本のコミットハッシュ> <website のコミットハッシュ>
```

deny ルールと hook を戻す場合は `~/.claude/settings.json` の `permissions.deny` から approved の1行を、
`hooks.PreToolUse` から approved-guard のブロックを削除する。

## 8. 2週間後の観察項目（2026-08-19 目安）

- 挙動劣化の有無（ルールが守られなくなったケースを記録する）
- approved-guard の誤検知ログ（`~/.claude/logs/approved-guard-*.log` の DENY 行を確認）
- 劣化があれば、該当ルールだけ references から正本に戻す
```

- [ ] **Step 7: 削除判定の一覧を CEO レビュー用にまとめてコミット**

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git add drafts/claude-md-audit-2026-08-05.md drafts/claude-md-slimdown-verification-2026-08-05.md
git commit -m "docs(claude-md): スリム化の検証レポートと削除判定一覧を記録"
```

- [ ] **Step 8（任意）: Codex による第三者レビュー**

設計書（`docs/superpowers/specs/2026-08-05-claude-md-slimdown-design.md`）に対して `/review` を実行できる。
重要設計変更のクリティークとして有効だが、CEO レビュー前に実施するかは CEO の判断に委ねる。実施しない場合はスキップする。

- [ ] **Step 9: CEO レビューを依頼する**

以下を提示して確認を求める。push は CEO の指示があるまで行わない。

1. 削減量の実測値（目標達成の可否）
2. 監査表の「削除判定の一覧」全項目
3. 新正本の全文
4. ハードガードの検証結果（deny が bypassPermissions 下で効いたか）
5. 挙動テストで守られなかったルールがあればその一覧

---

## 実装後の未処理事項（本計画のスコープ外・別途判断）

- Claude Code を v2.1.222 以降へ更新する（zsh 権限チェック回避と worktree 破壊的 git の修正・Homebrew 版は自動更新されない）
- `project_NOCTA` の未コミット変更205件（削除89・未追跡115。`drafts/article-notes/` → `old/` への移動）の整理
- スキル51本・エージェント25本への `prompt-audit` 適用
- `claude-config/settings.json` の同期方針の決定（API キーを含む live 設定との分離をどう保つか）
