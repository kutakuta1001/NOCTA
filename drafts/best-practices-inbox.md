# ベストプラクティス インボックス

良いと思った記事・ツイートをここに1行ずつ追加してください。
5件以上になったら `/best-practices-review` を実行すると一括レビューが始まります。

---

## 書き方

**通常の記事URL（WebFetchで自動取得）:**
```
- https://zenn.dev/example/articles/xxxx
```

**X（Twitter）など認証が必要なURL（本文を直接貼る）:**
```
- https://x.com/user/status/123 | ツイート本文をここにそのままコピペする
```

**URLなし・本文のみ（スクショから手打ちなど）:**
```
- [x.com] ツイート本文をここに書く
```

---

## 未処理

## 処理済み

- [changelog v2.1.280] 【新モデル】Claude Opus 5.5（`claude-opus-5-5`）追加、既定の Opus に昇格。1M コンテキスト・$4/$20・キャッシュ読取 $0.20/MTok。Opus 5（$5/$25）より2割安く R-09 の批評既定を要再議論 （2026-09-27 処理）
- [changelog v2.1.280] Pro / Team Standard の既定モデルが Sonnet → Opus に変更。`/effort` はモデル別保存になり、以前の設定は Opus 5.5 に引き継がれず既定 medium で開始する（G-01「標準は high」が自動では効かない） （2026-09-27 処理）
- [changelog v2.1.283] `/doctor prompt-audit`（`/checkup prompt-audit`）追加。CLAUDE.md・スキル・エージェント・コマンドを旧モデル向け記法・古いパス・矛盾する指示で監査 （2026-08-05 にも `claude-api` スキル版を収集・未実行） （2026-09-27 処理）
- [changelog v2.1.280/269/268] deny ルール迂回の修正3件: シンボリックリンク経由の書き込みを着地先で判定（acceptEdits / allow / auto が外への書き込みを承認しない）・Bash `tee` の書き込み先に `Edit()` deny を適用・同一行の `eval` / `env -C` で deny が外れる不具合。approved-guard（R-02）の前提が強化 （2026-09-27 処理）
- [changelog v2.1.271] エージェント定義 frontmatter に `omitClaudeMd` 追加。カスタムサブエージェントを user / project / local CLAUDE.md なしで起動できる。NOCTA の30体超のエージェント（reviewer / designer 系）で常時ロード削減の余地 （2026-09-27 処理）
- [changelog v2.1.275] claude.ai アカウントで有効なスキル・プラグインがターミナルに同期される（本セッションの `anthropic-skills:*` 群がこれ）。`syncClaudeAiSkills: false` / `syncClaudeAiPlugins: false` で停止可。G-07「常時ロードを膨らませない」に関わる （2026-09-27 処理）
- [platform.claude.com] モデル一覧 — Opus 5.5 の仕様: 1M コンテキスト・最大出力128k・知識カットオフ2026年6月（Fable 5.1 と同じ）・適応型思考常時オン・廃止は2027-09-22以降。公式推奨は「ほとんどのワークロードは Opus 5.5 から、高度な推論・長期エージェント作業や Opus 5.5 高 effort で評価が届かない場合に Fable 5.1」 （2026-09-27 処理）
- [platform.claude.com] モデル一覧 — Opus 5 が Legacy へ移動（利用継続可）。現行ラインナップは Fable 5.1 / Opus 5.5 / Sonnet 5 / Haiku 4.5 の4本。R-09・model-lineup.md・エージェント定義の `opus` 参照先が変わる （2026-09-27 処理）
- [platform.claude.com] モデル一覧 — Opus 5.5 の既定 effort は medium（Fable 5.1 / Sonnet 5 は high）。批評用途で従来品質を保つには `/effort high` かエージェント frontmatter の `effort:` を明示する必要 （2026-09-27 処理）
- [platform.claude.com] モデル一覧 — キャッシュ読取は Opus 5.5 が基本入力の5%（$0.20/MTok）、Fable 5.1 / Mythos 5.1 は2.5%、他は10%。前回エントリ「他モデルは10%」を訂正。Batch API の300k出力ベータに Opus 5.5 も対応 （2026-09-27 処理）
- [code.claude.com] 概要 — `/desktop` でターミナルセッションをデスクトップアプリへ引き継ぎ（差分を視覚確認・claude.ai サブスク必要）、`claude --teleport` で Web / モバイルの長時間タスクをターミナルへ、Dispatch で電話からタスク送信 （2026-09-27 処理）
- [code.claude.com] 概要 — `claude agents`（エージェントビュー・研究プレビュー）: バックグラウンドで動く複数セッションをディスパッチして1画面で監視。並列作業の選択肢が worktree / クロスセッションメッセージング / Agent Teams と並列に整理された （2026-09-27 処理）
- [code.claude.com] ベストプラクティス — auto mode が Pro / Max / Team の対話ターミナル・VS Code の組み込み開始権限モードに（他プランは Manual）。分類器がスコープ逸脱・未知インフラ・敵対的コンテンツ由来の操作だけをブロック。NOCTA の bypassPermissions 運用との比較材料 （-p 時の制約は 2026-09-06 に収集） （2026-09-27 処理）
- [code.claude.com] ベストプラクティス — 「Claude にインタビューさせる」: 最小プロンプト + AskUserQuestion で技術・UX・エッジケースを深掘りさせ SPEC.md に書かせてから新セッションで実装。R-14 `/brainstorm` の公式版に相当 （2026-09-27 処理）
- [code.claude.com] ベストプラクティス — `/batch <instruction>` で変更を5〜30サブエージェントに分割し各自の worktree で実行（`claude -p` ループの代替）。COST POLICY「動的ワークフロー」との棲み分け材料 （2026-09-27 処理）
- [code.claude.com] 動的ワークフロー — サイズ目安が変更: 既定 medium = 10エージェント未満（旧15）、Pro は small（5未満）が既定。`/config workflowSizeGuideline=small` か settings の同キーで固定可 （2026-08-05 に旧値 unrestricted / 15 で収集） （2026-09-27 処理）
- [code.claude.com] 動的ワークフロー — 使用制限到達時にランが一時停止しリセット後に自動再開（v2.1.271）。条件: 対話セッション・`autoContinueAtUsageLimit` オン・24h以内リセット・待機2回まで。-p / バックグラウンド / Agent Teams では失敗扱い （2026-09-27 処理）
- [code.claude.com] 動的ワークフロー — ファンアウトのプロンプトキャッシュ: 同一構成のエージェントは先頭のキャッシュを共有（既定 TTL 5分、`subagentPromptCacheTtl: 1h` で延長・書込は割高）。`CLAUDE_CODE_WORKFLOW_PREFIX_STAGGER_MS`（既定5000）が待機上限 （2026-09-27 処理）
- [changelog v2.1.257] 【新モデル】Claude Fable 5.1（`claude-fable-5-1`）追加。既定の Fable モデルに昇格。1M コンテキスト・$10/$50・キャッシュ読取 $0.25/MTok （2026-09-06 処理）
- [changelog v2.1.257] `.claude/settings.json` / `settings.local.json` の `defaultMode: "bypassPermissions"` が無視されるようになった（`"auto"` と同様）。user / managed settings に置くか `--permission-mode` で渡す （2026-09-06 処理）

（処理済みを直近20件に保ち、古い18件を drafts/best-practices-archive.md の「2026-09-27 アーカイブ分」へ移動）
