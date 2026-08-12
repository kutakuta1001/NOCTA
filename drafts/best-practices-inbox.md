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

（処理済みが20件を超えたため、古い10件を drafts/best-practices-archive.md の「2026-08-12 アーカイブ分」へ移動）
