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

- [changelog v2.1.284] 【新モデル】Claude Sonnet 5.5（`claude-sonnet-5-5`）追加、既定の Sonnet に昇格。1M コンテキスト・$2/$10・キャッシュ読取 $0.10/MTok（v2.1.296 で $0.20 から訂正）。R-09 の起案既定 Sonnet 5 を要再議論 （2026-10-24 処理）
- [changelog v2.1.293] 【新モデル】Claude Haiku 5.5（`claude-haiku-5-5`）追加、既定の Haiku に昇格。1M コンテキスト・$0.10/$0.50（100K 超のプロンプトは $0.50/$2.50）。R-09 の調査用 Haiku 4.5・analytics-agent の割当を要再議論 （2026-10-24 処理）
- [changelog v2.1.309] deny 迂回の修正: サブシェルを含むコマンドで Bash リダイレクトが `Edit(path)` deny をすり抜ける不具合・macOS sandbox の `denyWrite` がシンボリックリンク経由で効かない不具合。approved-guard（R-02）の前提がさらに強化 （2026-09-27 にも同系統を収集） （2026-10-24 処理）
- [changelog v2.1.309] サイズ上限を超えるネストした CLAUDE.md は先頭だけ読み込むように変更（巨大な CLAUDE.md 配下のファイルを読むと圧縮が繰り返される不具合の修正）。G-07「常時ロードを膨らませない」の裏付け （2026-10-24 処理）
- [changelog v2.1.304] 圧縮後にスキル一覧を再送するように変更、`/reload-skills` は新規・変更分だけ送る。スキル由来の hook は1ソースあたり1,024件・matcher 16,384文字が上限。NOCTA はスキル80本超のため圧縮後の常時ロード量に影響 （2026-10-24 処理）
- [changelog v2.1.304] `/auto-mode-setup` 追加: プロジェクトと直近セッションを読んで auto mode の分類器に環境を教えるガイド付き設定。NOCTA の bypassPermissions 運用を auto mode へ移す場合の入口 （2026-10-24 処理）
- [platform.claude.com] モデル一覧 — 現行ラインナップは Fable 5.1 / Opus 5.5 / Sonnet 5.5 / Haiku 5.5 の4本。Sonnet 5・Haiku 4.5 は Legacy へ（利用継続可）。4本とも知識カットオフ2026年6月・最大出力128k。廃止は Sonnet 5.5 が2027-09-28以降・Haiku 5.5 が2027-10-07以降。R-09 の「Fable 5.1 はカットオフで Opus 5 を上回る」記述も古い （2026-10-24 処理）
- [platform.claude.com] モデル一覧 — 既定 effort は Sonnet 5.5 が high・Haiku 5.5 が medium。Sonnet 5.5 は thinking を完全には切れない（`disabled` 不可・`between_tools` のみ可）。キャッシュ読取は Sonnet 5.5 も基本入力の5% （2026-10-24 処理）
- [code.claude.com] ベストプラクティス — v2.1.283 以降は全プランで auto mode が対話ターミナル・VS Code の組み込み開始権限モードに（以前は Pro / Max / Team のみ） （2026-09-27 に旧仕様で収集） （2026-10-24 処理）
- [code.claude.com] ベストプラクティス — 検証の強さを4段で整理: 1プロンプト内で検証 → `/goal` 条件 → Stop hook で決定的にゲート → 検証サブエージェント / 動的ワークフロー。`/verify` で動作中のアプリに対して確認 （`/goal` は過去にも収集） （2026-10-24 処理）
- [code.claude.com] ベストプラクティス — 敵対的レビューは「頼まれれば何か見つける」ため、追いかけると過剰設計になる。レビュアーには正しさと要件に関わる穴だけを挙げさせ、残りは任意扱いにする。/persona-review・/codex-review の指示文に反映できる （2026-10-24 処理）
- [code.claude.com] ベストプラクティス — git 管理下の CLAUDE.md に `/doctor` を実行すると、コードから導ける内容の削除案を出す。6ヶ月ごとのゼロベース見直し（次回 2027-02）の道具になる （`/doctor prompt-audit` は 2026-09-27 に収集） （2026-10-24 処理）
- [code.claude.com] 概要 — routines が「Cloud scheduled tasks」に改名（クラウド実行・API / GitHub イベントでも起動）。ローカルで動く Desktop scheduled tasks と、セッション内の `/loop` の3本立てに整理された （2026-10-24 処理）
- [changelog v2.1.280] 【新モデル】Claude Opus 5.5（`claude-opus-5-5`）追加、既定の Opus に昇格。1M コンテキスト・$4/$20・キャッシュ読取 $0.20/MTok。Opus 5（$5/$25）より2割安く R-09 の批評既定を要再議論 （2026-09-27 処理）
- [changelog v2.1.280] Pro / Team Standard の既定モデルが Sonnet → Opus に変更。`/effort` はモデル別保存になり、以前の設定は Opus 5.5 に引き継がれず既定 medium で開始する（G-01「標準は high」が自動では効かない） （2026-09-27 処理）
- [changelog v2.1.283] `/doctor prompt-audit`（`/checkup prompt-audit`）追加。CLAUDE.md・スキル・エージェント・コマンドを旧モデル向け記法・古いパス・矛盾する指示で監査 （2026-08-05 にも `claude-api` スキル版を収集・未実行） （2026-09-27 処理）
- [changelog v2.1.280/269/268] deny ルール迂回の修正3件: シンボリックリンク経由の書き込みを着地先で判定（acceptEdits / allow / auto が外への書き込みを承認しない）・Bash `tee` の書き込み先に `Edit()` deny を適用・同一行の `eval` / `env -C` で deny が外れる不具合。approved-guard（R-02）の前提が強化 （2026-09-27 処理）
- [changelog v2.1.271] エージェント定義 frontmatter に `omitClaudeMd` 追加。カスタムサブエージェントを user / project / local CLAUDE.md なしで起動できる。NOCTA の30体超のエージェント（reviewer / designer 系）で常時ロード削減の余地 （2026-09-27 処理）
- [changelog v2.1.275] claude.ai アカウントで有効なスキル・プラグインがターミナルに同期される（本セッションの `anthropic-skills:*` 群がこれ）。`syncClaudeAiSkills: false` / `syncClaudeAiPlugins: false` で停止可。G-07「常時ロードを膨らませない」に関わる （2026-09-27 処理）
- [platform.claude.com] モデル一覧 — Opus 5.5 の仕様: 1M コンテキスト・最大出力128k・知識カットオフ2026年6月（Fable 5.1 と同じ）・適応型思考常時オン・廃止は2027-09-22以降。公式推奨は「ほとんどのワークロードは Opus 5.5 から、高度な推論・長期エージェント作業や Opus 5.5 高 effort で評価が届かない場合に Fable 5.1」 （2026-09-27 処理）

（処理済みを直近20件に保ち、古い13件を drafts/best-practices-archive.md の「2026-10-24 アーカイブ分」へ移動）
