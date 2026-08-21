# ベストプラクティスレビュー（インボックス一括）

日付: 2026-08-21
次回レビュー推奨: 2026-09-20 以降（またはインボックスに5件貯まった時点）
対象: 30件（manual 18件 / xmcp 12件）
重複除去: 0件

ソース:
- CHANGELOG v2.1.229〜v2.1.238（6件・github.com）
- モデル一覧（4件・platform.claude.com）
- 概要 / ベストプラクティス / 動的ワークフロー（8件・code.claude.com）
- X ツイート（12件・x.com）

除外URL: なし（インジェクション検査で除外0件。要注意2件は除外せず本レポートで分離）
過去分との重複: 4件（アーカイブに既存。下記「収集の取りこぼし」参照）

## 要約

今回の30件は「機構で保証する」方向に一貫して収束した。文章によるルールではなく、
設定・フラグ・hook で行動を縛る手段（`disable-model-invocation`・コンパクション保持指示・
Dynamic workflow size・Concise 出力スタイル）が公式側から次々に提供されている。
NOCTA は文章ルール（R-01〜R-17）で運用してきたため、同じ意図を機構に移せる箇所が複数見つかった。
ただし本レビューで最も重要な発見は収集内容ではない。**過去に収集した知見が CLAUDE.md に反映されず、
数ヶ月かけて繰り返し再収集されている**という運用上の穴が見つかった（下記）。

## 収集の取りこぼし（今回最優先の発見）

今回の manual 18件のうち4件は、過去のレビューで既に収集・処理済みだった。

| 今回のエントリ | 過去の処理 | 状態 |
|---|---|---|
| Opus 5 / Sonnet 5 の effort 既定が high | 2026-06-15（Opus 4.8 について）、2026-07-29（Sonnet 5 について） | **3回目の収集。CLAUDE.md R-09 に未反映のまま** |
| Chrome 連携でライブ Web アプリをデバッグ | 2026-07-29「Chrome 統合でライブWebアプリのデバッグが可能に」 | 2回目の収集。未活用 |
| Batches API の300k出力ベータ | 2026-05-04「Batch APIで最大300kトークン出力可能（output-300k-2026-03-24ベータヘッダー）」 | 2回目の収集 |
| Haiku 4.5 の思考モードとカットオフ | 2026-05-12「Haiku 4.5拡張思考対応あり」、2026-05-28「knowledge cutoff は 2025年2月」 | 部分重複（コンテキスト200k・最大出力64k は新規） |

**原因**: `/claude-docs-review` と `/x-practices-search` の重複チェックが
インボックスの「未処理」「処理済み」セクションのみを対象とし、
`drafts/best-practices-archive.md` / `best-practices-archive-xmcp.md`（過去の処理済み・合計370件）を見ていない。
処理済みが20件を超えるとアーカイブへ移されるため、1〜2ヶ月前の知見は重複チェックをすり抜ける。

**帰結**: 同じ情報を何度も収集するコストが発生しているだけでなく、
「収集した」ことと「CLAUDE.md に反映した」ことが区別されないまま処理済みに送られている。
effort 既定 high は3回収集されて一度も R-09 に書かれていない。

## NOCTAへの適用提案（未実装のもののみ）

| 優先度 | 対象 | 現状 | 提案内容 | 参照記事 |
|--------|------|------|----------|---------|
| 高 | 収集系スキルの重複チェック範囲 | `/claude-docs-review`・`/x-practices-search`・`/best-practices-review` の重複チェックがインボックス2ファイルのみを対象とし、アーカイブ370件を見ていない。今回4件が再収集された | 各スキルの Step 0 に `drafts/best-practices-archive.md` と `best-practices-archive-xmcp.md` を重複チェック対象として追加する。全文 Read は重いので、キーワード grep で照合する形が現実的 | 本レポート「収集の取りこぼし」 |
| 高 | 収集と反映の分離 | 処理済みに送られたエントリが CLAUDE.md に反映されたかを追跡する仕組みがない。effort 既定 high は3回収集され一度も反映されていない | インボックスの「処理済み」を「反映済み」と「見送り」に分ける、またはレポートの適用提案に採否を記録して次回レビュー時に参照する。最小の変更は、処理済み行に `[反映]` / `[見送り]` のマークを付けること | 本レポート「収集の取りこぼし」 |
| 高 | 承認ゲート直結スキルの自動起動封じ | R-12 は「CEO が『アレンジOKです』と明示するまで `/phase2-svp` を実行しない」と文章で定めるのみ。モデルが状況判断で起動しうる | 該当スキルの SKILL.md に `disable-model-invocation: true` を付ける。対象候補: `phase2-svp`・`phase5-golive`・`song-finish`・`blog-publish`・`hp-add-work`（HP を更新するもの）。文章の禁止が機構の禁止になる | disable-model-invocation-manual-only |
| 高 | Todo/タスク管理ツールの挙動確認 | v2.1.233 で Sonnet 5・Opus 4.8・Fable 5 以降での提供終了が告知された。`CLAUDE_CODE_ENABLE_TODO_TOOLS` は未設定 | 本セッション（Opus 5）では TaskCreate / TaskUpdate / TaskList が引き続き提供されており、CHANGELOG の記述と実挙動が食い違う。スキルがタスクリストを前提にしている箇所があれば、告知どおり消えた場合の代替（drafts/ の中間ファイル）を用意しておく | cc-v2-1-233-todo-tools-removed |
| 中 | CLAUDE.md へのコンパクション保持指示 | コンパクション時に何を残すかの指定がない。長時間セッションで楽曲仕様の数値や承認ゲートの状態が失われうる | CLAUDE.md に1行追加する案: 「コンパクト時は現在のフェーズ・最後の承認ゲート・確定した数値仕様（BPM・キー・小節数）を必ず保持する」。R-01（数値で話す）と R-15（再開できる状態）の実効性が上がる | claude-md-compaction-instructions |
| 高 | R-09 への2点補記 | R-09 は effort の使い分けを定めるが「明示しなければ high」と書いていない。カットオフの古さは Fable 5 のみ言及。**(a) は2026-06-15・2026-07-29 にも収集され、3回とも未反映** | (a) 「Opus 5 / Sonnet 5 は Claude Code で effort 既定が `high`。low / medium は明示指定が必要」、(b) 「Sonnet 5 の知識カットオフも2026年1月。最新仕様を扱う起案では Opus 5 を選ぶ」。(a) は今回反映しないと4回目の再収集になる | effort-default-high-opus5-sonnet5（再収集） / sonnet5-knowledge-cutoff-2026-01（新規） |
| 中 | `ANTHROPIC_DEFAULT_MODEL` の設定 | 未設定。セッション開始時のモデルは手動選択に依存 | `claude-sonnet-5` を設定し、R-09 の「起案は Sonnet 5（既定）」を初期値として機構化する。`/model` の選択は優先され再起動後も保持されるため、Opus 5 切替通知ルールの運用と両立する | cc-v2-1-236-anthropic-default-model |
| 中 | Dynamic workflow size の設定 | `/config` は未設定（既定 `unrestricted`）。COST POLICY は「動的ワークフローは CEO が明示的に要求した場合のみ」と定めるが規模制限はない | `medium`（15未満）を設定する。要求された場合でも消費が跳ねにくくなる。`ultracode` を既定では使わない方針と二重の抑制になる | dynamic-workflow-size-guideline |
| 中 | Concise 出力スタイルの試用 | `outputStyle` 未設定（既定） | R-06（handoff は1〜3行）・R-08（絵文字を使わない）と方向が一致する。作業の徹底度は変えず報告の冗長さだけを削るため、出力トークンも減る。G-06 の納品デブリーフと両立するかは実地確認が必要 | cc-v2-1-237-concise-output-style |
| 中 | HP の見た目検証 | `website-reviewer` はデータ整合性（CIDv1 の文字数・相対パス・構文エラー）を検証するが、描画結果は CEO の目視。**2026-07-29 にも収集済みで未活用** | Chrome 連携でスクリーンショットを撮り、R-17 のデザイン指定との差分を Claude 側で列挙させる。確定パレット（シルバー #B8B4AE × オフホワイト #E8E0D0）の適用確認にも使える | chrome-live-web-app-debugging（再収集） |
| 低 | `/btw` の活用 | R-05 はコンテキスト節約を最優先するが、確認用の質問も本筋の履歴に入る | 作業中の確認（ファイル位置・過去ルール）は `/btw` で行う。答えがオーバーレイに出て履歴に入らない | btw-side-questions-no-context |
| 低 | GPT Image 2 プロンプトの取り込み | `visual-prompter` / `/visual-prompt` はゼロからプロンプトを生成する | 公開されているプロンプト集（TaoTips・ポスター向け）を `~/designer/patterns/` のレシピ形式に落とす。文字入りレイアウトはジャケット・LP のヒーロー画像に転用できる | x-gpt-image2-prompt-collection-1 / -2 |
| 低 | ACE-Step 1.5 ローカルツールの評価 | R-13 は Suno の音源を素材として使う運用。生成回数とサブスク費用の制約がある | ローカル完全動作の OSS デスクトップツールが出た。Mac で動くか（CUDA 前提でないか）の確認と、Suno との音質差の評価が前提。評価は CEO の耳による判断領域 | x-ace-step-15-local-desktop-tool |
| 低 | Bash 生成物の巻き戻し不可の周知 | チェックポイント（`/rewind`）は Claude の編集のみ追跡し、Bash 経由の変更を復元できない | MIDI・SVP は Python スクリプト（Bash）経由で生成しているため `/rewind` で戻せない。R-15 の「中間ファイルを drafts/ に保存」が実質のバックアップであることを明示しておく | checkpoints-do-not-track-bash |

## 記事ごとの主要ポイント

| 記事 | 要点（30文字以内） |
|------|-----------------|
| cc-v2-1-233-todo-tools-removed | Todo ツールが新モデルで提供終了（環境変数で復活） |
| cc-v2-1-232-subagent-fork-default | fork が既定オン・生成が既定バックグラウンド |
| cc-v2-1-236-anthropic-default-model | 新セッションの開始モデルを固定できる |
| cc-v2-1-238-zsh-bash-permission-check | zsh 構文の権限チェック強化（要アップデート） |
| cc-v2-1-237-concise-output-style | 前置きを省く出力スタイルが組み込みに |
| cc-v2-1-229-commit-push-pr-dangerous-flags | 危険フラグの自動承認が廃止（安全側） |
| effort-default-high-opus5-sonnet5 | 明示しなければ effort は high になる |
| sonnet5-knowledge-cutoff-2026-01 | Sonnet 5 のカットオフも2026年1月 |
| batches-300k-output-beta | バッチ API なら300k出力（同期は128k） |
| haiku45-no-adaptive-thinking-200k | Haiku 4.5 は適応型思考なし・200k |
| chrome-live-web-app-debugging | スクリーンショット比較を検証手段にできる |
| disable-model-invocation-manual-only | スキルの自動起動を機構で封じられる |
| claude-md-compaction-instructions | 要約時に残す情報を指定できる |
| btw-side-questions-no-context | 側質問は履歴に入らずコンテキストを食わない |
| checkpoints-do-not-track-bash | Bash 生成物は巻き戻せない |
| dynamic-workflow-size-guideline | ワークフロー規模を既定で制限できる |
| subagent-model-env-overrides-all | 環境変数がモデル割当を全て上書きする |
| workflow-resume-same-session-only | ワークフローの再開は同一セッション限定 |
| x-claude-md-ignored-diagnosis | 指示無視の原因は未読込か上書き |
| x-agentjacking-sentry-dsn-attack | 外部データ経由でエージェントを乗っ取る攻撃 |
| x-40-claude-code-tips-guide | tips 40件超の無料 GitHub ガイド |
| x-22-skills-worth-adding | 追加価値のあるスキル22選（用途別） |
| x-10-repos-beyond-default-setup | 既定を超える拡張リポジトリ10選 |
| x-anthropic-13-free-courses | 公式の無料コース13本（証明書付き） |
| x-claude-code-four-layers | プロンプトより仕組み、4層で考える |
| x-opus5-system-prompt-append | 外部 system prompt で冗長さを抑える試み |
| x-ace-step-15-local-desktop-tool | ACE-Step 1.5 のローカル生成ツール |
| x-alibaba-happyshrimp-music-ai | Alibaba が音楽生成 AI を準備中 |
| x-gpt-image2-prompt-collection-1 | GPT Image 2 の再利用可能プロンプト集 |
| x-gpt-image2-prompt-collection-2 | ポスター向け（文字入り）プロンプト集 |

## インスピレーションメモ

- **Chrome 連携によるスクリーンショット比較** — HP とビジュアルの「見た目の確認」を毎回自分の目でやる作業が消えて楽になりそう（参照: code.claude.com/docs/ja/best-practices）
- **fork サブエージェント** — 世界観メモ・楽曲仕様をエージェントに渡し直す手間がなくなり、対話の続きとして相談できて楽になりそう（参照: CHANGELOG v2.1.232）
- **ACE-Step 1.5 のローカル生成** — 生成回数と費用の制約が消えれば「とりあえず20パターン出して聴く」ができて創造的になりそう（参照: x.com/D3VAUX/...2090461847954567262）
- **ポスター向け GPT Image 2 プロンプト** — 文字入りレイアウトが安定して作れれば、ジャケット・LP・SNS 用ビジュアルの幅が広がりそう（参照: x.com/TaoRInne/...2089593137354469688）
- **Concise 出力スタイル** — 報告が短くなって対話のテンポが上がり、使うのが楽しくなりそう（参照: CHANGELOG v2.1.237）
- **HappyShrimp（Alibaba）** — 「単純な text-to-music を超える」ものが本当に来れば、制作の入口そのものが変わりそう（参照: x.com/thisisdimm/...2089510589211038191）
- **バッチ API の300k出力** — 長尺の歌詞候補やコンセプト文書を一度に大量生成する使い方が開けそう（参照: platform.claude.com モデル一覧）

## セキュリティ・安全性への影響

1. **Agentjacking（要対応なし・現行方針が正しい）** — 公開 Sentry DSN 経由で細工したエラーイベントを送るだけで、標的への侵入も開発者の説得もなしにエージェントを動かせる攻撃クラスが報告された。NOCTA の収集系スキルが `collection-common.md` のインジェクション検査を必ずノート作成より先に実行する設計、および MCP の書き込み系ツールを ALLOWLIST に含めない方針は、この攻撃クラスへの直接的な対策になっている。現行方針を維持する
2. **v2.1.238 へのアップデート推奨** — Bash ツールの権限チェックが zsh 固有のシェル条件式構文に対応強化された。CEO 環境は zsh で、`approved-guard` hook は「コマンド文字列全体が見える」前提に依存している。権限チェック側の精度向上は hook の前提を補強する
3. **`CLAUDE_CODE_SUBAGENT_MODEL` は未設定（確認済み）** — この変数が設定されていると R-09 と AGENTS のモデル割当（批評系は Opus 5、explorer 系は Haiku）がすべて上書きされる。`~/.claude/settings.json` の env セクションを確認し、設定されていないことを確認した（設定されているのは CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS と各種 API キーのみ）

## 要注意: git・シェル操作に関わる項目（自動適用しない）

1. **co-author 署名の除去（@diguapet のツイート）** — Opus 5 の冗長さへの対処として外部 system prompt を持ち込む repo が紹介されているが、その動機の一つが「Anthropic の co-author 署名をコミットから消す」ことである。NOCTA のグローバル指示はコミットに `Co-Authored-By` を付ける運用のため、この部分は採用していない。冗長さへの対処としては公式の Concise 出力スタイル（v2.1.237）の方が保守コストが低い
2. **`/commit-push-pr` の危険フラグ自動承認廃止（v2.1.229）** — これは Claude Code 側の安全側への修正報告であり、NOCTA が何かを変更する必要はない。NOCTA は `permissions.deny` で `git push --force` / `git reset --hard` / `git clean -f` / `git rebase` を実行不可にしており、この変更より厳しい状態を既に維持している

## 適用しない理由がある項目

| 項目 | 理由 |
|---|---|
| 外部 system prompt（`--append-system-prompt-file`）の導入 | 冗長さの抑制は公式の Concise 出力スタイルで達成できる。外部ファイルはバージョン追随の保守コストが発生し、co-author 署名の除去という受け入れられない要素を含む |
| スキル22選・拡張リポジトリ10選の一括導入 | MCP セクションの「ツール総数80以下を維持」と衝突する。両まとめの内容も重複が予想される。導入するなら Context & Token Discipline 分類の1〜2本に絞る |
| Anthropic 公式コース13本の受講 | 教材としての価値はあるが、NOCTA のルール群は既に公式ベストプラクティスを取り込んでおり、新情報の反映は `/claude-docs-review` の定期巡回の方が速い |
| 「Claude Code を4層で考える」の取り込み | NOCTA は既に多層構成（CLAUDE.md 4階層・60本超のスキル・hooks・エージェント定義）で実践済み。層の数え方は書き手ごとに異なり（08-05 は「5層」）、追う意味が薄い |
| 批評系エージェントへの fork 適用 | fork はコンテキストを継承するため、`lyric-critic` / `concept-critic` の「新鮮な目で見る」という役割を損なう。公式も「新しいコンテキストは、Claude がちょうど書いたコードに偏らないためコードレビューを改善する」と述べている |
| HappyShrimp の代替候補リストへの追加 | リリース前で仕様・時期・価格が未確定。観測対象に留める |

## 既に実装済みだった項目（提案テーブルから除外）

1. ワークフローのステージ分割 — COST POLICY が「承認ゲートを含む工程を1つのワークフローにまとめてはならない」と既に定めている。ワークフローの再開が同一セッション限定である事実は、この制約が中断耐性の面でも正しいことを裏付けた
2. 収集データのインジェクション検査 — `collection-common.md` が統一パターンの正本として機能している（Agentjacking への対策）
3. MCP 書き込み系ツールの排除 — R-03 と MCP セクションで既定済み
4. git の危険フラグ禁止 — `permissions.deny` が v2.1.229 の変更より厳しい
5. スキルの段階的開示 — SKILL.md 500行以内・詳細は `references/` へ分離
6. 「仕組みで解く」構成 — CLAUDE.md 階層・スキル・hooks・エージェント定義の多層構成
7. モデルの目的別使い分け — R-09 の割当表（`CLAUDE_CODE_SUBAGENT_MODEL` による上書きも受けていないことを確認済み）

## CEOが確認すべき事項

0. **収集ループの穴を埋めるか（今回最優先）。** 重複チェックにアーカイブを含める修正と、「収集した」と「反映した」を区別する仕組み。前者はスキル3本の Step 0 に1行追加するだけで済む。後者は処理済み行への `[反映]` / `[見送り]` マークが最小の変更。この2つを入れないと、来月も同じ知見を収集して同じ提案を出すことになる（effort 既定 high は既に3周した）
1. **`disable-model-invocation: true` を付けるスキルの範囲。** 提案は `phase2-svp`・`phase5-golive`・`song-finish`・`blog-publish`・`hp-add-work` の5本。副作用（ファイル生成・HP 更新・ブランチ操作）があり、CEO の明示的な判断を前提とするものを選んだ。範囲を広げる / 狭める判断を求める
2. **Todo/タスク管理ツールの扱い。** CHANGELOG は Sonnet 5 以降で提供終了と告知しているが、Opus 5 の本セッションでは引き続き提供されている。告知どおり消えた場合に困るスキルがあるかを洗い出すか、様子見にするか
3. **CLAUDE.md への追記2件（コンパクション保持指示・R-09 の補記2点）を行うか。** 「スキル設計」の方針（各行に「削除すると Claude が間違いを犯すか」を問う）に照らして、コンパクション指示は「保持されないと数値仕様が失われる」ため残す価値があると判断した
4. **設定変更3件を行うか。** `ANTHROPIC_DEFAULT_MODEL=claude-sonnet-5` / Dynamic workflow size = `medium` / `outputStyle` = Concise。いずれも `~/.claude/settings.json` または `/config` の変更で、CLAUDE.md の文章は変えずに方針を機構化する
5. **要注意項目1（co-author 署名の除去）は採用しない方針で問題ないか。** グローバル指示との衝突があるため推奨しないが、判断は CEO に委ねる
