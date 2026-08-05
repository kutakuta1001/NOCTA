# ベストプラクティスレビュー（インボックス一括）

日付: 2026-08-05
次回レビュー推奨: 2026-09-04 以降（インボックスに5件貯まったら）
ソース: 26件（manual 18件 / xmcp 8件・全件本文インライン済みのため WebFetch 0回。一覧は「記事ごとの主要ポイント」参照）
除外URL: なし（インジェクション検査 全26件パス・取得失敗 0件）

## 要約（3行以内）

今回の最大テーマは「設定資産の削り込み」。CLAUDE.md 群973行・34,507文字という肥大が、公式ベストプラクティス・Gemini Web検索・X実測報告（@kodagen）・Boris Cherny 発言の**独立4ソースから同じ結論**で指摘された。
次いで「無確認で走る経路の増加」。v2.1.221 でバックグラウンドセッションが自動 commit/push するようになり、ワークフローのサブエージェントは権限モードに関係なく acceptEdits で動く。bypassPermissions 運用の NOCTA では二重に無確認になる。
さらにセキュリティ修正2件（zsh 権限チェック回避・worktree 破壊的 git）が見つかり、Homebrew 版は自動更新されないため未適用の可能性がある。

## NOCTAへの適用提案（未実装のもののみ）

| 優先度 | 対象 | 現状 | 提案内容 | 参照記事 |
|--------|------|------|----------|---------|
| 最高 | Claude Code 本体のバージョン | 導入方式が未確認。Homebrew 版なら自動更新されない | v2.1.222 以降へ更新。zsh の `[[ ]]` 権限チェック回避（v2.1.221 修正）は `permissions.deny` の前提を崩す種類の不備で、worktree 分離の破壊的 git（v2.1.222 修正）は未コミット205件を抱える現状で被害が大きい | cc-v2-1-221-zsh-permission-bypass-fix / cc-v2-1-222-worktree-git-isolation-fix / homebrew-two-casks-no-autoupdate |
| 高 | website/CLAUDE.md | バックグラウンドセッションの push を禁じる記載がない | 「バックグラウンドセッションでも push しない」を明記する。`main` への push は GitHub Actions を起動して本番サイトを更新するため、CEO 確認前に公開される経路になる | cc-v2-1-221-background-auto-commit-push |
| 高 | CLAUDE.md 群（4ファイル973行） | 公式推奨50〜200行に対し5〜19倍。14セクションが2ファイル以上に重複 | 公式の削除基準「これを削除すると Claude が間違いを犯すか。否なら削除」で全行を判定する。目標は合計400行以下。`NOCTA/CLAUDE.md` と `project_NOCTA/CLAUDE.md` のどちらを正本にするか決める | claude-md-deletion-criterion / x-kodagen-simplify-halved-tokens / x-where-to-put-claude-settings |
| 高 | R-02（approved/ には触れない） | CLAUDE.md 上の論理ルールのみ。`permissions.deny` に approved/ への Write がない | approved/ への Write を deny に追加してハード化する。ワークフローのサブエージェントは権限モードに関係なく acceptEdits で動くため、論理ルールだけでは技術的に守れない | workflow-subagents-acceptedits / x-hooks-are-enforcement-not-request |
| 中 | R-09 / グローバル G-01 | Fable 5 の知識カットオフとトークナイザ特性が未記載 | Fable 5 はカットオフ2026年1月で **Opus 5（2026年5月）より古い**、かつ Opus 4.7 トークナイザで同一テキストが約30%多いトークンになる旨を追記。「深い推論は Fable 5 / 最新情報が必要な判断は Opus 5」という切り分けに修正 | fable5-cutoff-adaptive-thinking / fable5-tokenizer-30pct-more-tokens |
| 中 | CLAUDE.md の `/effort` 記述 | low / medium / high / xhigh の4段階のみ | `ultracode`（xhigh + 全実質タスクの自動ワークフロー化）を追記し、既定では使わない方針を明記する。キーワード `ultracode` を文章に含めるだけで発動しうるため、意図しない大規模実行の入口になる | effort-ultracode-new-level |
| 中 | COST POLICY（3択） | Plan Mode / Subagent / Agent Teams のみ | 第4の選択肢としてワークフローを追加。適合するのは「対象が多く同じ処理を繰り返す」機械的作業（CLAUDE.md 重複洗い出し・website データ全件検証・スキル群への prompt-audit）。楽曲制作フェーズには使わない | workflow-vs-subagent-skill-team / workflow-agent-limits-warning |
| 中 | svp-generator の検証 | SVP は生成後の検証手段がなく、SynthV で開くまで不備が分からない | 構造バリデーション（JSON 妥当性・歌詞行と【○音】の一致・`.pau` 注記の反映）をスクリプト化し、Stop hook で完了をゲートする。「成功を主張せず証拠を示す」原則は R-11 と整合 | stop-hook-goal-verification-gate |
| 中 | 60本超のスキル・11エージェント定義 | Sonnet 4.6 / Opus 4.8 世代に書かれたまま | `claude-api` スキルの `prompt-audit` サブコマンド（v2.1.221 追加）で旧モデル向けパターンを機械的に洗い出す。拡張思考前提・temperature 指定などが残っている可能性 | cc-v2-1-221-claude-api-prompt-audit |
| 低 | MCP 運用判断 | `/usage` の MCP 別コスト内訳を判断材料にしている | v2.1.222 で「一度呼ぶと以降の全ターンが当該サーバーに帰属」する過大計上が修正された。修正後の数値で xmcp・voicevox のコストを再確認する | cc-v2-1-222-usage-mcp-overattribution-fix |
| 低 | セッション運用表 | Routines と `/loop` のみ記載 | デスクトップスケジュール済みタスク（ローカル実行・ローカルファイル直接アクセス可）を追加。ローカル検査系の定期タスク（website データ検証・未コミット変更の検出）に適する | desktop-scheduled-tasks-vs-routines |
| 低 | trend-analyst / copyright-agent | `/effort xhigh` + WebSearch を使う | v2.1.221 で「effort xhigh/max かつ thinking 無効で WebSearch が 400」が修正された。過去のフェーズ1で検索結果が薄かった場合の原因候補 | cc-v2-1-221-websearch-xhigh-400-fix |
| 低 | R-07 / R-12 / svp-generator | SynthV 一本足の構成 | Dreamtonics が SynthV API と Solaria を第三者 AI 音楽生成に提供してきたという指摘（憶測ベース）。公式発表までウォッチ扱いだが、R-13 の ACE-Step / Khala 1.0 検討と同じ「依存先1社」論点 | x-dreamtonics-synthv-api-ai-music |
| 低 | `/claude-docs-review` スキル | 巡回対象に best-practices / workflows が未登録だった（同日修正済み） | 今後は `code.claude.com/docs/llms.txt`（全ページ索引）を起点に巡回対象の抜けを定期点検する | docs-best-practices-workflows-pages |

## 記事ごとの主要ポイント

| 記事（article-notes/2026-08-05-*） | 要点（30文字以内） |
|------|-----------------|
| cc-v2-1-221-background-auto-commit-push | BGセッションが自動commit/push |
| cc-v2-1-221-zsh-permission-bypass-fix | zsh [[ ]] で権限チェック回避（修正） |
| cc-v2-1-222-worktree-git-isolation-fix | worktree分離が Bash にも適用 |
| cc-v2-1-221-claude-api-prompt-audit | prompt-audit で旧モデル記述を監査 |
| cc-v2-1-222-usage-mcp-overattribution-fix | /usage の MCP 過大計上を修正 |
| cc-v2-1-221-websearch-xhigh-400-fix | xhigh+thinking無効でWebSearch 400 |
| claude-mythos-5-invite-only | Mythos 5 は招待制・NOCTA対象外 |
| fable5-tokenizer-30pct-more-tokens | Fable 5 はトークン約30%増 |
| fable5-cutoff-adaptive-thinking | Fable 5 のカットオフはOpus 5より古い |
| docs-best-practices-workflows-pages | 公式2ページが巡回対象に未登録だった |
| homebrew-two-casks-no-autoupdate | Homebrew版は自動更新されない |
| desktop-scheduled-tasks-vs-routines | ローカル実行の定期タスクが別にある |
| claude-md-deletion-criterion | 削除したら間違うか。否なら削除 |
| stop-hook-goal-verification-gate | 検証ゲートは4段階（Stop hook等） |
| effort-ultracode-new-level | ultracode = xhigh + 自動ワークフロー |
| workflow-vs-subagent-skill-team | 計画を保持するのは誰かで切り分け |
| workflow-agent-limits-warning | 同時16・1実行1000・25で警告 |
| workflow-subagents-acceptedits | WFのサブエージェントは常にacceptEdits |
| x-kodagen-simplify-halved-tokens | 全部シンプル化でトークン体感半減 |
| x-hooks-are-enforcement-not-request | CLAUDE.mdは「だいたい」hooksは100% |
| x-where-to-put-claude-settings | 6つの設定手段は用途が全部違う |
| x-claude-code-5-architectural-layers | 4層はプロンプティングと無関係（画像依存） |
| x-claude-architect-certification | 60問1セッション・前回記録の差分のみ |
| x-anthropic-18-free-courses | 無料コースが13→18本に増加 |
| x-dreamtonics-synthv-api-ai-music | SynthV APIは既に第三者AI音楽が利用 |
| x-seedance-2-prompt-collection | Seedance 2.0 プロンプト30選（未検証） |

## インスピレーションメモ

- **Stop hook による検証ゲート** — SVP を生成したら音節数と歌詞行の一致を自動照合し、合わない限り「完成」と言わせない。CEO が SynthV を開く前に不備が潰れるので楽になりそう（参照: code.claude.com/docs/ja/best-practices）
- **`/goal` 条件** — 「go_live_checklist.md の⚠️がゼロ」を goal 条件にすれば、承認ゲート⑨の判定を毎ターン別評価者が再チェックしてくれる。リリース前の詰めが楽になりそう（参照: code.claude.com/docs/ja/best-practices）
- **動的ワークフローの「敵対的相互レビュー」** — 歌詞A/B/C案を3エージェントに独立生成させ、互いに反論させてから CEO に出す。起案→批評フローの多角化で、選択肢が今より鋭くなりそう（参照: code.claude.com/docs/ja/workflows）
- **ワークフローの `args` パラメータ** — 保存したワークフローに曲名やパスのリストを呼び出し時に渡せる。`/phase2-music [曲名]` のような形で楽曲ごとに同じ工程を回せて、運用が楽しくなりそう（参照: code.claude.com/docs/ja/workflows）
- **「Claude にインタビューさせる」パターン** — AskUserQuestion で CEO に詰めた質問をさせ、SPEC.md を書いてから新セッションで実装する。/brainstorm の精度が上がり、楽曲コンセプトの掘り方が創造的になりそう（参照: code.claude.com/docs/ja/best-practices）
- **デスクトップスケジュール済みタスク** — ローカルファイルを見られるので、outputs/ の棚卸しや未コミット変更の検出を毎朝自動で。205件放置のような事故が防げて楽になりそう（参照: code.claude.com/docs/ja/overview）
- **`prompt-audit`** — 60本超のスキルを機械的に棚卸しできる。世代交代のたびに手で見直す作業が消えて楽になりそう（参照: github.com/anthropics/claude-code CHANGELOG v2.1.221）

## セキュリティ・安全性への影響

**1. zsh の権限チェック回避（v2.1.221 で修正済み・要アップデート）**
`[[ ]]` 正規表現条件式に隠したコマンドが Bash ツールの権限チェックを通らずに実行できた。NOCTA は `permissions.deny` に `rm -rf` / `git push --force` / `git reset --hard` / `git clean -f` / `git rebase` を設定してハード的に守っているが、この経路はそのガードを回り込める。CEO 環境のシェルは zsh なので直接該当する。

**2. worktree 分離の不完全性（v2.1.222 で修正済み・要アップデート）**
worktree で分離したセッションとそのサブエージェントが、分離元 main チェックアウトに破壊的 git を実行できた。分離はファイル編集と Bash の両方に全セッション種別で適用されるよう修正された。`project_NOCTA` に未コミット変更205件（削除89・未追跡115）が残る現状では被害範囲が大きい。

**3. 無確認で走る経路の増加（設計上の変更・対処が必要）**
- バックグラウンドセッションが作業保全のため自動 commit/push する（v2.1.221）。`main` への push は本番サイト更新を意味する
- ワークフローのサブエージェントはセッションの権限モードに関係なく **常に acceptEdits** で動き、ファイル編集が自動承認される
- NOCTA は bypassPermissions 運用のため、ワークフローは確認なしで起動し、その中も無確認になる二重構造
- R-02（approved/ には触れない）は論理ルールのみで、`permissions.deny` に approved/ への Write がない

**4. PreToolUse auto-allow hook の制限回避（v2.1.222 で修正済み）**
バックグラウンドエージェントのタスク（要約・コンパクション・リネーム）で PreToolUse の auto-allow hook がツール制限を回避していた。

## 適用しない理由がある項目

| 項目 | 理由 |
|---|---|
| `/model-review` の実行（新モデル Mythos 5 追加） | Mythos 5 は Project Glasswing の招待制で一般提供なし。NOCTA から選択できないため R-09 に影響しない。model-lineup.md の最終更新も7日前で30日ルール未達 |
| Claude Architect Certification 対応 | 制作ワークフローへの影響なし。認定の存在は2026-07-29 に既に記録済みで、今回は受験形式の差分のみ |
| Anthropic 無料コース18本 | 記録のみ。運用ルールの変更に結びつかない |
| Seedance 2.0 プロンプト30選の適用 | 記事本体を未取得で内容未検証。加えて同日収集の別情報が「主要T2Vはいずれも前ショットを記憶せずプロンプトでは直らない」と指摘しており、プロンプト集の効果は単発ショットに限定される可能性が高い |
| 「5つのアーキテクチャ層」の内容適用 | 本文が画像・スレッド続き依存で5層の内訳が特定できない。同一テキストが複数アカウントから投稿されるバイラルテンプレートでもあり、信頼度は中程度 |
| ワークフローの承認ゲート組み込み | ワークフロー実行中はユーザー入力を受け付けない仕様のため、承認ゲート①〜⑨を1つのワークフローに含めてはならない（各ステージを独立ワークフローにする必要がある） |

## CEOが確認すべき事項

1. **Claude Code のバージョンと導入方式**。セキュリティ修正2件（v2.1.221 / v2.1.222）が未適用の可能性がある。Homebrew 版は自動更新されず、stable cask は約1週遅れ。`claude --version` と導入方式の確認をお願いします。
2. **CLAUDE.md スリム化を実施するか**。973行→400行以下が目標で、`NOCTA/CLAUDE.md` と `project_NOCTA/CLAUDE.md` のどちらを正本にするか決める必要があります。実施時は Opus 5 での重要設計クリティークを推奨（R-09）。
3. **`permissions.deny` に approved/ への Write を追加するか**。R-02 を論理ルールからハードガードに降ろす提案です。ワークフロー導入を検討するなら必須に近くなります。
4. **バックグラウンドセッションの push 禁止を明記するか**（website/CLAUDE.md）。git 操作に関わる変更なので自動適用していません。
5. **未コミット変更205件（削除89・未追跡115）の整理**。`drafts/article-notes/*.md` → `drafts/article-notes/old/*.md` への移動が過去セッションでコミットされずに残っています。git 操作なので判断をお願いします。
6. **ワークフローを COST POLICY に加えるか**。加える場合、対象を「機械的な一括作業のみ」に絞り、承認ゲートを含む工程には使わない制約を併記する形を提案します。
