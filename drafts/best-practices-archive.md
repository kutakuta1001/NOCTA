# ベストプラクティス 処理済みアーカイブ

## 2026-09-06 アーカイブ分

- [changelog v2.1.236] `ANTHROPIC_DEFAULT_MODEL` 追加。新セッションの開始モデルを設定でき、`/model` の選択が優先されて再起動後も保持される（`ANTHROPIC_MODEL` とは挙動が違う） （2026-08-21 処理）
- [changelog v2.1.238] Bash ツールの権限チェックが zsh 固有のシェル条件式構文に対応強化。v2.1.221 の zsh 迂回修正の続きで approved-guard の前提に関わる （2026-08-21 処理）
- [changelog v2.1.237] 組み込み出力スタイル「Concise」追加。前置きとナレーションを省いて結果から述べる。`/config` の Output style で選択 （2026-08-21 処理）
- [changelog v2.1.229] `/commit-push-pr` で `--force`・`--amend`・`--no-verify` 等の危険フラグ付き git/gh コマンドが自動承認されなくなった （2026-08-21 処理）
- [platform.claude.com] モデル一覧 — Opus 5・Sonnet 5 は Claude API と Claude Code で `effort` 既定が `high`（Opus 4.8 は全サーフェスで high）。別の水準を使うには明示指定が必要 （2026-08-21 処理・2026-06-15 / 2026-07-29 にも収集。R-09 未反映）
- [platform.claude.com] モデル一覧 — Sonnet 5 の信頼できる知識カットオフは2026年1月で Fable 5 と同じ。R-09 は Fable 5 のみカットオフの古さに言及している （2026-08-21 処理）
- [platform.claude.com] モデル一覧 — Message Batches API で `output-300k-2026-03-24` ベータヘッダを使うと Opus 5・Sonnet 5 が最大300k出力に対応（同期 Messages API は128k） （2026-08-21 処理・2026-05-04 にも収集）
- [platform.claude.com] モデル一覧 — Haiku 4.5 は適応型思考なし・コンテキスト200k・最大出力64k（Opus 5 / Sonnet 5 は1M・128k）。調査用途に振る前提として差が大きい （2026-08-21 処理・思考モードとカットオフは 2026-05-12 / 2026-05-28 に収集済み）
- [code.claude.com] 概要 — Chrome 連携でライブ Web アプリをデバッグできる（`/docs/ja/chrome`）。HP の表示検証をスクリーンショット比較で回せる （2026-08-21 処理・2026-07-29 にも収集。未活用）
- [code.claude.com] ベストプラクティス — スキルに `disable-model-invocation: true` を書くと Claude の自動起動を止めて手動トリガー限定にできる。副作用のあるワークフロー向け （2026-08-21 処理）
- [code.claude.com] ベストプラクティス — CLAUDE.md にコンパクション指示を書ける（例「コンパクト時は変更ファイル一覧とテストコマンドを保持」）。`/compact <指示>` でも制御可 （2026-08-21 処理）
- [code.claude.com] ベストプラクティス — `/btw` は答えが会話履歴に入らないオーバーレイで返るため、確認のためにコンテキストを消費しない （2026-08-21 処理）
- [code.claude.com] ベストプラクティス — チェックポイント（`/rewind`）は Claude の編集のみ追跡し、Bash や外部プロセス経由の変更は復元できない （2026-08-21 処理）
- [code.claude.com] 動的ワークフロー — `/config` の Dynamic workflow size で規模を既定制限できる（small 5未満・medium 15未満・large 50未満・既定 unrestricted）。設定値が25エージェント警告の閾値を置き換える （2026-08-21 処理）
- [code.claude.com] 動的ワークフロー — `CLAUDE_CODE_SUBAGENT_MODEL` はセッションのモデルとスクリプト内のモデル指定の両方を上書きする （2026-08-21 処理）
- [code.claude.com] 動的ワークフロー — 実行の再開は同一セッション内のみ。ワークフロー実行中に Claude Code を終了すると次セッションでは新規実行になる （2026-08-21 処理）
- [changelog v2.1.223] Bash 権限チェックからコマンドの一部を隠せる不備を2件修正（細工したコマンド／タブと不可視 Unicode のパディング）。approved-guard は「コマンド文字列全体が見える」前提に依存 （2026-08-12 処理）
- [changelog v2.1.223] `/review` が `/code-review` のエイリアスに変更（現在の diff か PR をレビュー）。NOCTA 自作の `/review`・`/review-diff`（Codex CLI 連携）と衝突しうる （2026-08-12 処理）
- [changelog v2.1.224] サブエージェント生成上限200個/セッションが撤去（同時実行数と深さの制限は継続）。v2.1.212 由来の記載が失効 （2026-08-12 処理）
- [changelog v2.1.224] `crossSessionInbound` と `dialogExpiry` を新設。bypassPermissions で動くセッション宛のクロスセッションメッセージは承認保留になる（NOCTA は該当） （2026-08-12 処理）
- [changelog v2.1.224] フィードバック調査のトランスクリプト共有が、同意時に system prompt（CLAUDE.md の指示を含む）・ツール定義・モデルパラメータも送信するよう変更 （2026-08-12 処理）
- [changelog v2.1.228] セッションクリーンアップがプロジェクトの memory フォルダ内を削除する不具合を修正（auto-memory 14件が消えうる。v2.1.228 で解消済み） （2026-08-12 処理）
- [changelog v2.1.221] バックグラウンドセッションが作業保全のため自動で commit/push するよう変更。CLAUDE.md の git 指示に従い、必要時のみ draft PR を作成 （2026-08-05 処理）
- [changelog v2.1.221] zsh の `[[ ]]` 正規表現条件式で Bash ツールの権限チェックを回避できる脆弱性を修正（CEO 環境は zsh・要アップデート） （2026-08-05 処理）
- [changelog v2.1.222] worktree 分離セッションとそのサブエージェントが main チェックアウトに破壊的 git コマンドを実行できた問題を修正。分離が全セッション種別のファイル編集と Bash に適用 （2026-08-05 処理）
- [platform.claude.com] モデル一覧 — 【新モデル】Claude Mythos 5（claude-mythos-5）追加。Fable 5 と同スペック・同価格だが Project Glasswing 招待制で一般提供なし （2026-08-05 処理）
- [platform.claude.com] モデル一覧 — Fable 5 は Opus 4.7 導入のトークナイザを使用し同じテキストで約30%多いトークンを生成。実コストは $10/$50 の表示より高くなる （2026-08-05 処理）
- [platform.claude.com] モデル一覧 — Fable 5 の信頼できる知識カットオフは2026年1月・適応的思考は常にオン・拡張思考なし（CLAUDE.md にカットオフ未記載） （2026-08-05 処理）

## 2026-08-21 アーカイブ分

- [code.claude.com] 概要 — 公式「ベストプラクティス」ページと「動的ワークフロー」ページが存在（/docs/ja/best-practices・/docs/ja/workflows）。巡回対象に追加候補 （2026-08-05 処理）
- [code.claude.com] 概要 — Homebrew は2 cask 構成: claude-code（stable・約1週遅れ・重大リグレッションをスキップ）と claude-code@latest（即時）。いずれも自動更新なし （2026-08-05 処理）
- [code.claude.com] 概要 — デスクトップスケジュール済みタスクはローカル実行でローカルファイルに直接アクセス可（Routines はマシン停止中も継続）。用途で使い分ける （2026-08-05 処理）
- [code.claude.com] ベストプラクティス — CLAUDE.md は各行に「これを削除すると Claude が間違いを犯すか」を問い否なら削除する。膨らむと実際の指示が無視される。含める/除外する対照表あり （2026-08-05 処理）
- [code.claude.com] ベストプラクティス — 検証を決定論的ゲートにする手段: Stop hook がチェックを実行し合格までターン終了をブロック（8回連続ブロックで打ち切り）。`/goal` 条件は毎ターン別評価者が再チェック （2026-08-05 処理）
- [code.claude.com] 動的ワークフロー — `/effort ultracode` が新設（xhigh + 自動ワークフロー化）。CLAUDE.md の effort 記述（low/medium/high/xhigh）に未反映 （2026-08-05 処理）
- [code.claude.com] 動的ワークフロー — サブエージェント/スキル/Agent Teams/ワークフローの使い分け表（「計画を保持するのは誰か」で切り分け）。COST POLICY の3択に第4の選択肢 （2026-08-05 処理）
- [code.claude.com] 動的ワークフロー — 制約: 同時16エージェント・1実行あたり合計1,000エージェント・25エージェント超または150万トークン超で「Large workflow」警告 （2026-08-05 処理）
- [code.claude.com] 動的ワークフロー — ワークフローのサブエージェントは常に acceptEdits で動作しファイル編集が自動承認される。権限モードは起動プロンプトのみを制御 （2026-08-05 処理）
- [changelog v2.1.221] `claude-api` スキルに `prompt-audit` サブコマンド追加。古いモデル向けに書かれたプロンプト・ツール記述を監査できる（NOCTA の60本超のスキル群に有効） （2026-08-05 処理）

## 2026-08-12 アーカイブ分

- [changelog v2.1.222] `/usage` が MCP サーバーへの使用量を過大計上していた問題を修正。過去の MCP 別コスト内訳は水増しされていた （2026-08-05 処理）
- [changelog v2.1.221] WebSearch が effort `xhigh`・`max` で thinking 無効時に 400 エラーになる問題を修正（trend-analyst・copyright-agent に影響） （2026-08-05 処理）
- [changelog v2.1.215] `/verify` と `/code-review` スキルが自動実行されなくなり明示呼び出しが必要に。長時間ツールのハートビート進捗表示追加（2026-07-29 処理）
- [changelog v2.1.214] Windows PowerShell の権限チェックバイパス脆弱性を修正（要アップデート）。EndConversation ツール追加（2026-07-29 処理）
- [changelog v2.1.212] `/fork` がバックグラウンドセッションを作成する方式に変更。Web検索のセッション上限200回・サブエージェント生成上限200個のガード追加（2026-07-29 処理）
- [platform.claude.com] モデル一覧 — Opus 4.1（claude-opus-4-1-20250805）非推奨・2026-08-05廃止。NOCTA未使用のため影響なし（2026-07-29 処理）
- [platform.claude.com] モデル一覧 — Sonnet 5 の effort デフォルトが Claude API / Claude Code で high に（2026-07-29 処理）
- [code.claude.com] 概要 — auto-memory が公式機能としてドキュメント化（2026-07-29 処理）
- [code.claude.com] 概要 — Chrome 統合でライブWebアプリのデバッグが可能に（2026-07-29 処理）
- [platform.claude.com] モデル一覧 — 【新モデル】Claude Opus 5（claude-opus-5）が現行モデルに追加。Opus 4.8 はレガシー表へ移動（2026-07-29 処理）

## 2026-08-05 アーカイブ分

- [platform.claude.com] モデル一覧 — Fable 5 は GA 継続・輸出管理による提供終了の記載なし（2026-07-29 処理）
- [changelog v2.1.219] Claude Opus 5 が Claude Code のデフォルト Opus モデルに。/fast 対象は Opus 5・4.8（2026-07-29 処理）
- [changelog v2.1.217/219] サブエージェント同時実行上限20・ネスト生成デフォルト深さ3（2026-07-29 処理）
- [changelog v2.1.218] /code-review・context:fork スキルがバックグラウンド実行に。/deep-research は手動起動のみに（2026-07-29 処理）
- [code.claude.com] 概要 — Remote Control・Slack 連携・GitLab CI/CD が公式サポートに記載（2026-07-29 処理）
- [docs.anthropic.com] Claude Codeリリースノート — v2.1.202で`/checkup`が`/doctor`のエイリアスとしてフルセットアップ点検に拡張（CLAUDE.md短縮提案含む）（2026-07-12）
- [docs.anthropic.com] Claude Codeリリースノート — v2.1.206で`/doctor`がチェックイン済みCLAUDE.mdファイルの短縮を提案する機能を追加（2026-07-12）
- [docs.anthropic.com] Claude Codeリリースノート — v2.1.207でhooks/MCPの`${user_config.*}`シェル形式コマンドを拒否（シェルインジェクション対策強化）（2026-07-12）
- [docs.anthropic.com] モデル一覧 — Fable 5は2026-07-12時点で主要プラットフォーム全てでGA継続中、輸出管理による断続提供・利用不可の記載は見当たらない（2026-07-12）
- [docs.anthropic.com] ドキュメント構成 — docs.anthropic.comがplatform.claude.com/code.claude.comへ移転（release-notesはGitHub CHANGELOG.mdへリダイレクト）（2026-07-12）

## 2026-07-29 アーカイブ分

- [changelog v2.1.200] デフォルト権限モードが全インターフェースで "Manual" に変更（`--permission-mode manual` 対応）。NOCTAは bypassPermissions 運用のため起動時のモード確認が必要（2026-07-04）
- [changelog v2.1.198] サブエージェントがデフォルトでバックグラウンド実行に。サブエージェント動作中もメインモデルが作業を継続できる（Agent Teams・並列フェーズに影響）（2026-07-04）
- [changelog v2.1.199] スキルのスタック呼び出し `/skill-a /skill-b do XYZ` で先頭スキルを最大5つまでロード可能に（2026-07-04）
- [changelog v2.1.196] MCPセキュリティ強化: committed `.claude/settings.json` で自己承認したMCPサーバは untrusted workspace では起動しなくなった（2026-07-04）
- [changelog v2.1.196] サブエージェントが extended thinking 設定とコンテキストコンパクションを継承するように（2026-07-04）
- [changelog v2.1.198] `/dataviz` スキル追加（チャート・ダッシュボード設計・カラーパレット検証機能付き）。Visual/HP領域で活用可能（2026-07-04）
- [changelog v2.1.198] Workflows: 組み込み Explore エージェントがメインセッションのモデルを継承（opus上限）（2026-07-04）
- [changelog v2.1.200] AskUserQuestion ダイアログの auto-continue がデフォルト無効に（`/config` で idle timeout を opt-in）（2026-07-04）
- [docs.anthropic.com] モデル一覧 — 【新モデル】Claude Fable 5（`claude-fable-5`）2026-06-09 一般提供開始。Mythos級・最上位の widely released モデル。1M tokens・最大出力128k・$10/$50/MTok・適応的思考常時ON・拡張思考なし（要 /model-review）（2026-06-15）
- [docs.anthropic.com] モデル一覧 — 【新モデル】Claude Mythos 5（`claude-mythos-5`）Project Glasswing 限定提供（招待制・防御的サイバーセキュリティ向け）。$10/$50/MTok（2026-06-15）
- [docs.anthropic.com] モデル一覧 — Opus 4.8 の `effort` パラメータは全サーフェス（API・Claude Code）でデフォルト `high`。別レベルは明示指定が必要（2026-06-15）
- [changelog v2.1.172] サブエージェントが最大5階層までネスト可能に。plugin marketplace ブラウザに検索機能追加（2026-06-15）
- [changelog v2.1.169] `--safe-mode` フラグで全カスタマイズ（CLAUDE.md/hooks/plugins/skills/MCP）無効化。`post-session` ライフサイクルhook追加・`/cd` でprompt cacheを壊さずセッション移動（2026-06-15）
- [changelog v2.1.175] `enforceAvailableModels` managedセッティングでDefaultモデルを許可リストに制限可能（2026-06-15）
- [changelog v2.1.176] セッションタイトルが会話の言語で生成。Opus 4.8 非対応組織向けのautoモードフォールバック修正（2026-06-15）

## 2026-07-04 アーカイブ分

- [changelog v2.1.162] `/effort` コマンドで選択レベルがデフォルト保持（2026-06-04）
- [changelog v2.1.162] `claude agents --json` に `waitingFor` フィールド追加（2026-06-04）
- [changelog v2.1.158] Bedrock/Vertex/Foundryでオートモード対応（2026-06-04）
- [docs.anthropic.com] モデル一覧 — 公式最新推奨はOpus 4.7・Opus 4.8は未掲載（2026-06-04）
- [docs.anthropic.com] Claude Code 概要 — Routines: /schedule でAnthropicインフラの定期タスク実行（2026-06-04）
- [docs.anthropic.com] Claude Code 概要 — Agent SDK: カスタムエージェントをコードで構築可能（2026-06-04）
- [docs.anthropic.com] Claude Code 概要 — Slack連携: @Claudeメンションでバグレポート→PR自動作成（2026-06-04）
- [changelog v2.1.152] スキルの disallowed-tools フロントマターでスキル実行時の特定ツール除外が可能（2026-05-28）
- [changelog v2.1.149] /usageがスキル・サブエージェント・プラグイン・MCP別のコスト内訳を表示（2026-05-28）
- [changelog v2.1.153] /modelでモデル選択をデフォルト保存可能（sキーで現セッションのみ切替）（2026-05-28）
- [docs.anthropic.com] モデル一覧 — Sonnet 4.6 が適応的思考（Adaptive Thinking）に対応（2026-05-28）
- [docs.anthropic.com] モデル一覧 — Haiku 4.5 の knowledge cutoff は 2025年2月（2026-05-28）

## 2026-06-15 アーカイブ分

- [docs.anthropic.com] CHANGELOG v2.1.126 — claude project purge [path] コマンド追加（2026-05-04）
- [docs.anthropic.com] CHANGELOG v2.1.126 — context:forkスキルのdeferred toolsバグ修正（2026-05-04）
- [docs.anthropic.com] CHANGELOG v2.1.126 — Mac スリープ後のStream idle timeout修正（2026-05-04）
- [docs.anthropic.com] CHANGELOG v2.1.133 — hooksにeffort.level（CLAUDE_EFFORT）渡し対応 （2026-05-12）
- [docs.anthropic.com] CHANGELOG v2.1.139 — /goalコマンド追加（2026-05-12）
- [docs.anthropic.com] CHANGELOG v2.1.139 — Agent View追加（2026-05-12）
- [docs.anthropic.com] モデル一覧 — Opus 4.7新トークナイザー≒555k words（2026-05-12）
- [docs.anthropic.com] モデル一覧 — Haiku 4.5拡張思考対応あり（2026-05-12）
- [docs.anthropic.com] モデル一覧 — Haiku 4.5 価格: 入力 $1/MTok・出力 $5/MTok（CLAUDE.md R-09 未記載）（2026-05-18）
- [docs.anthropic.com] モデル一覧 — Claude Sonnet 4 / Opus 4 が 2026-06-15 廃止予定（NOCTA 未使用だが記録）（2026-05-18）
- [changelog v2.1.142] Fast mode のデフォルトモデルが Opus 4.6 → Opus 4.7 に変更（/fast 利用時に挙動変化）（2026-05-18）
- [changelog v2.1.142] root-level SKILL.md をプロジェクトに置くとプラグインスキルとして自動検出される（2026-05-18）
- [changelog v2.1.141] Hook 出力に terminalSequence フィールド追加・デスクトップ通知/ウィンドウタイトル生成が可能に（2026-05-18）
- [changelog v2.1.139] Hook の args フィールドで exec form 実行（シェル経由しないコマンド指定）が可能に（2026-05-18）
- [changelog v2.1.143] /loop の pending wakeup を Esc/Ctrl+C でキャンセル可能に（2026-05-18）

## 2026-04-06 アーカイブ分

- https://x.com/L_go_mrk/status/2039298726574088496 （2026-04-06）
- https://x.com/Qkn3R/status/2038069946027261985 （2026-04-06）
- https://x.com/nobel_824/status/2036953599729950862 （2026-04-06）
- https://x.com/trq212/status/2033949937936085378 （2026-04-06）
- https://x.com/shiro_life0/status/2034466595595256130 （2026-04-06）
- https://x.com/0xfene/status/2033096160299332029 （2026-04-06）
- https://zenn.dev/atamaplus/articles/claude-feature-dev （2026-04-06）
- https://zenn.dev/aki_think/articles/978556f1652aa6 （2026-04-06）
- https://developers.openai.com/blog/designing-delightful-frontends-with-gpt-5-4 （2026-04-06）
- https://dev.classmethod.jp/articles/kiro-cli-nyuumon/ （2026-04-06）

## 2026-04-13 アーカイブ分

- https://qiita.com/nogataka/items/c2e73515e65533986421 （2026-04-06）
- https://blog.lai.so/agent-teams/ （2026-04-06）
- https://note.com/masa_wunder/n/n984af0385d7e （2026-04-06）
- https://x.com/kawai_design/status/2018951551646318782 （2026-04-06）
- https://blog.comfy.org/p/ace-step-15-is-now-available-in-comfyui （2026-04-06）
- https://note.com/small_biz_lab/n/n01fcddd73b20 （2026-04-06）
- https://note.com/timakin/n/n5579d01bb3bb （2026-04-06）
- https://x.com/HayattiQ/status/2021057206939156505 （2026-04-07）
- https://x.com/Hoshino_AISales/status/2033425547989258354 （2026-04-07）
- https://x.com/ai_jitan/status/2033383556085588289 （2026-04-07）

## 2026-04-18 アーカイブ分

- https://x.com/i/status/2038286026284667239 （2026-04-16）
- https://x.com/i/status/2039840802504077655 （2026-04-16）
- https://x.com/i/status/2041489622061273471 （2026-04-16）
- https://x.com/i/status/2042601431409267004 （2026-04-16）
- https://x.com/i/status/2042237392510484504 （2026-04-16）
- https://x.com/i/status/2042555449116102988 （2026-04-16）
- https://x.com/i/status/2042758779301957823 （2026-04-16）
- https://x.com/i/status/2042241063612502162 （2026-04-16）
- [docs.anthropic.com] モデル一覧 — Opus 4.6 価格 $5/$25/MTok（旧比1/3） （2026-04-13）
- [docs.anthropic.com] モデル一覧 — 1M トークン コンテキスト（ベータ）対応 （2026-04-13）

## 2026-04-25 アーカイブ分（第2回）

- https://zenn.dev/tmasuyama1114/articles/everything-claude-code-concepts （2026-04-21）
- [docs.anthropic.com] モデル一覧 — claude-3-haiku-20240307 が2026-04-19廃止 （2026-04-21）
- [docs.anthropic.com] モデル一覧 — claude-sonnet-4/opus-4-20250514 が2026-06-15廃止予定 （2026-04-21）
- [docs.anthropic.com] モデル一覧 — Opus 4.7の最大出力が128k tokens （2026-04-21）
- [docs.anthropic.com] Claude Code 概要 — Agent SDK リリース （2026-04-21）
- [docs.anthropic.com] Claude Code 概要 — Channels機能（Telegram/Discord/webhook） （2026-04-21）
- [docs.anthropic.com] CHANGELOG v2.1.116 — MCPスタートアップ高速化 （2026-04-21）
- [docs.anthropic.com] CHANGELOG v2.1.113 — hooksのfile_pathが絶対パス形式に変更 （2026-04-21）
- [docs.anthropic.com] CHANGELOG v2.1.110 — Hooksに`if`フィールド追加 （2026-04-21）
- https://x.com/i/status/2043463258762629222 （2026-04-18）

## 2026-04-25 アーカイブ分

- https://qiita.com/masa_ClaudeCodeLab/items/8c22966fbd3c125c53dc （2026-04-18）
- https://x.com/i/status/2044707793337528701 （2026-04-18）
- [docs.anthropic.com] CHANGELOG v2.1.101 — permissions.deny バグ修正 （2026-04-13）
- [docs.anthropic.com] CHANGELOG v2.1.97 — CJK 入力後 / @メンション使用可 （2026-04-13）
- [docs.anthropic.com] CHANGELOG v2.1.97 — /agents タブ追加 （2026-04-13）
- [docs.anthropic.com] CHANGELOG v2.1.94 — デフォルト effort: high に変更 （2026-04-13）
- [docs.anthropic.com] Claude Code 概要 — /schedule クラウドタスク （2026-04-13）
- [docs.anthropic.com] Claude Code 概要 — Homebrew 2 cask（自動更新なし） （2026-04-13）
- https://zenn.dev/lv/articles/b772312d6abf35 （2026-04-07）
- https://x.com/MakeAI_CEO/status/2041363825631658448 （2026-04-07）

## 2026-04-18 アーカイブ分（第2回）

- [platform.claude.com/docs] [モデル一覧] — Claude Sonnet 4・Opus 4（-20250514版）が 2026-06-15 廃止予定 （2026-04-18）
- [code.claude.com/docs] [概要] — Agent SDK 一般公開: Claude Code ツールを活用したカスタムエージェントを独自のオーケストレーション・権限で構築可能 （2026-04-18）
- [code.claude.com/docs] [概要] — GitHub Code Review 機能: 全 PR でクラウドベース自動コードレビューが可能 （2026-04-18）
- [github.com/anthropics] [CHANGELOG v2.1.111] — Opus 4.7 向け新努力レベル xhigh を追加（/effort コマンドで選択可能） （2026-04-18）
- [github.com/anthropics] [CHANGELOG v2.1.113] — /ultrareview コマンド追加: クラウド上でマルチエージェントによる包括的コードレビューを実行 （2026-04-18）
- [github.com/anthropics] [CHANGELOG v2.1.113] — /less-permission-prompts スキル追加: 読み取り専用 Bash/MCP ツールを自動スキャンし権限許可リストを提案 （2026-04-18）
- [github.com/anthropics] [CHANGELOG v2.1.113] — Bash deny ルール強化: env/sudo/watch などの exec ラッパー経由コマンドもブロック可能に （2026-04-18）
- [platform.claude.com/docs] [モデル一覧] — claude-opus-4-7 価格確定: $5/$25/MTok（Opus 4.6 と同価格）。コンテキスト 1M tokens・最大出力 128k・知識カットオフ 2026年1月 （2026-04-18）
- [platform.claude.com/docs] [モデル一覧] — Claude Haiku 3（claude-3-haiku-20240307）が 2026-04-19 廃止予定（3日後） （2026-04-18）
- [docs.anthropic.com] モデル一覧 — Opus 4.6 最大出力 128K （2026-04-13）
- [docs.anthropic.com] リリースノート v2.1.118 — hooks type:mcp_tool （2026-04-27）
- [docs.anthropic.com] Claude Code overview — クラウドスケジュール済みタスク （2026-04-27）
- [docs.anthropic.com] リリースノート v2.1.119 — prUrlTemplate （2026-04-27）
- https://qiita.com/retore/items/3688cf515c14f7471ed4 （2026-04-26）
- https://zenn.dev/acntechjp/articles/3f361da473eac8 （2026-04-26）
- https://x.com/i/status/2046930094695043199 （2026-04-26）
- https://x.com/i/status/2047272345455518009 （2026-04-26）
- https://github.com/ComposioHQ/awesome-codex-skills （2026-04-26）
- https://qiita.com/ot12/items/06420caf41a34a910c53 （2026-04-26）
- https://x.com/i/status/2047837100389876200 （2026-04-26）

## 2026-05-04 アーカイブ分

- https://x.com/i/status/2048888680354644460 （2026-04-30）
- https://x.com/i/status/2049043044130066462 （2026-04-30）
- https://x.com/i/status/2047628297086144940 （2026-04-26）
- https://x.com/i/status/2044704524125057504 （2026-04-26）
- https://x.com/i/status/2048712868032643402 （2026-04-28）
- https://x.com/i/status/2048729561089888571 （2026-04-28）
- https://qiita.com/Akira-Isegawa/items/00f23d206c504db2ac3b （2026-04-28）
- https://x.com/i/status/2048976187926720967 （2026-04-28）
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices （2026-04-28）
- [docs.anthropic.com] リリースノート v2.1.117 — スキルfrontmatterに context:fork / agent フィールド追加（エージェントスキル設計に活用可）（2026-04-28）

## 2026-05-18 アーカイブ分

- [docs.anthropic.com] リリースノート v2.1.116 — /skills メニューで t キーによるトークン数ソート（スキルファイルのサイズ管理効率化）（2026-04-28）
- [docs.anthropic.com] モデル一覧 — Sonnet 4 / Opus 4 は 2026-06-15 廃止予定（NOCTAは使用中でないが念のため確認推奨）（2026-04-28）
- [docs.anthropic.com] Claude Code overview — Channels機能: Telegram/Discord/webhookからセッションにイベントプッシュ可能（2026-04-28）
- [docs.anthropic.com] Claude Code overview — Agent SDKでオーケストレーション・ツール・権限をフルコントロールしたカスタムエージェント構築可能（2026-04-28）
- https://note.com/betaitohuman/n/nffecc168f4d3 （2026-05-04）
- https://arxiv.org/abs/2512.13564 （2026-05-04）
- https://github.com/Shichun-Liu/Agent-Memory-Paper-List （2026-05-04）
- https://x.com/i/status/2049871598883115376 （2026-05-04）
- https://x.com/i/status/2043643311039426670 （2026-05-04）
- [docs.anthropic.com] CHANGELOG v2.1.126 — Batch APIで最大300kトークン出力可能（output-300k-2026-03-24ベータヘッダー）（2026-05-04）
