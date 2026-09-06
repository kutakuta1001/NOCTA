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

- [changelog v2.1.257] 【新モデル】Claude Fable 5.1（`claude-fable-5-1`）追加。既定の Fable モデルに昇格。1M コンテキスト・$10/$50・キャッシュ読取 $0.25/MTok （2026-09-06 処理）
- [changelog v2.1.257] `.claude/settings.json` / `settings.local.json` の `defaultMode: "bypassPermissions"` が無視されるようになった（`"auto"` と同様）。user / managed settings に置くか `--permission-mode` で渡す （2026-09-06 処理）
- [changelog v2.1.251] `CLAUDE_CODE_SUBAGENT_MODEL` が「既定値」に降格。エージェント定義の `model:` と per-spawn 指定が優先される（v2.1.238 時点の「両方を上書きする」記述は失効・処理済み #47 の訂正） （2026-09-06 処理）
- [changelog v2.1.260] パスに括弧を含む `Edit`/`Write`/`Read` 権限ルールが無効として落とされ、read-only 指定フォルダが書き込み可能になっていた不具合を修正。deny ルールの信頼性に関わる （2026-09-06 処理）
- [changelog v2.1.260] zsh の `REPORTTIME` / `REPORTMEMORY` / `DIRSTACKSIZE` 代入にコマンド置換を隠す Bash 権限迂回を修正（v2.1.221 / 223 / 238 に続く4件目。approved-guard の前提） （2026-09-06 処理）
- [changelog v2.1.261] `/skill-doctor` 追加。読み込まれたスキルのうち未使用のものとコンテキスト消費量を表示して剪定できる （2026-09-06 処理）
- [platform.claude.com] モデル一覧 — Fable 5.1 の信頼できる知識カットオフは2026年6月で Opus 5（2026年5月）より新しい。R-09 の「Fable 5 はカットオフが古いので最新仕様は Opus 5」という前提が逆転した （2026-09-06 処理）
- [platform.claude.com] モデル一覧 — 公式推奨は「ほとんどのワークロードは Opus 5 から開始、高度な推論・長期エージェント作業は Fable 5.1」。Fable 5 は Legacy へ移動（利用継続可） （2026-09-06 処理）
- [platform.claude.com] モデル一覧 — Fable 5.1 と Mythos 5.1 のみプロンプトキャッシュ読取が基本入力価格の2.5%（他モデルは10%）。長セッションの実コストが表示価格より下がる （2026-09-06 処理）
- [platform.claude.com] モデル一覧 — 廃止コミット: Fable 5.1 は2027-09-01以降・Opus 5 は2027-07-24以降・Sonnet 5 は2027-06-30以降・Haiku 4.5 は2026-10-15以降（Haiku のみ1年以内） （2026-09-06 処理）
- [code.claude.com] ベストプラクティス — 検証の決定論的ゲート: Stop hook が合格までターン終了をブロック（8回連続で打ち切り）、`/goal` 条件は毎ターン別評価者が再チェック （2026-08-05 にも収集・CLAUDE.md 未反映） （2026-09-06 処理）
- [code.claude.com] ベストプラクティス — バンドル `/code-review` スキルは新しいサブエージェントで現在の diff をバグレビューし結果をセッションに返す （2026-07-29 にも収集・`/codex-diff` との併用方針が未整理） （2026-09-06 処理）
- [code.claude.com] ベストプラクティス — ギャップを探せと指示されたレビュアーは健全な作業でも何か報告する。正確性・記載要件に影響するものだけをフラグさせ、残りはオプション扱いにする （2026-09-06 処理）
- [code.claude.com] ベストプラクティス — auto mode を `-p`（非対話）で使うと、分類器が繰り返しブロックしたときフォールバック先のユーザーがいないため中止する。バックグラウンド運用の前提 （2026-09-06 処理）
- [code.claude.com] 動的ワークフロー — 保存したワークフローは `args` で入力を受け取れる。Claude がリストを構造化データとして渡すため、スクリプト側は解析なしで配列・オブジェクトメソッドを使える （2026-09-06 処理）
- [code.claude.com] 動的ワークフロー — 実行スクリプトは `~/.claude/projects/` のセッションディレクトリに毎回書き出される。パスを尋ねて読み、編集して編集版から再起動させられる （2026-09-06 処理）
- [code.claude.com] 動的ワークフロー — `/deep-research` は v2.1.196 以降、検証エージェントがレート制限や API エラーでクレームを確認できない場合、そのクレームを「未検証」として列挙し反論扱いにしない （2026-07-29 にも収集） （2026-09-06 処理）
- [code.claude.com] 概要 — Channels: Telegram / Discord / iMessage / 独自 webhook からセッションにイベントをプッシュできる（`/docs/ja/channels`） （2026-09-06 処理）
- [changelog v2.1.233] Todo/タスク管理ツール（TaskCreate / Get / Update / List・TodoWrite）が Sonnet 5・Opus 4.8・Fable 5 以降のモデルで提供終了。`CLAUDE_CODE_ENABLE_TODO_TOOLS=1` で復活可 （2026-08-21 処理）
- [changelog v2.1.232] サブエージェントの fork が既定オン（`subagent_type: "fork"` が全会話とプロンプトキャッシュを継承）。インタラクティブセッションの非チームメイト生成も既定でバックグラウンド実行に （2026-08-21 処理）

（処理済みを直近20件に保ち、古い28件を drafts/best-practices-archive.md の「2026-09-06 アーカイブ分」へ移動）
