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

- [changelog v2.1.233] Todo/タスク管理ツール（TaskCreate / Get / Update / List・TodoWrite）が Sonnet 5・Opus 4.8・Fable 5 以降のモデルで提供終了。`CLAUDE_CODE_ENABLE_TODO_TOOLS=1` で復活可 （2026-08-21 処理）
- [changelog v2.1.232] サブエージェントの fork が既定オン（`subagent_type: "fork"` が全会話とプロンプトキャッシュを継承）。インタラクティブセッションの非チームメイト生成も既定でバックグラウンド実行に （2026-08-21 処理）
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

（処理済みが20件を超えたため、古い10件を drafts/best-practices-archive.md の「2026-08-21 アーカイブ分」へ移動）
