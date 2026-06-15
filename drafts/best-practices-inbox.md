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

- [docs.anthropic.com] モデル一覧 — 【新モデル】Claude Fable 5（`claude-fable-5`）2026-06-09 一般提供開始。Mythos級・最上位の widely released モデル。1M tokens・最大出力128k・$10/$50/MTok・適応的思考常時ON・拡張思考なし（要 /model-review）（2026-06-15）
- [docs.anthropic.com] モデル一覧 — 【新モデル】Claude Mythos 5（`claude-mythos-5`）Project Glasswing 限定提供（招待制・防御的サイバーセキュリティ向け）。$10/$50/MTok（2026-06-15）
- [docs.anthropic.com] モデル一覧 — Opus 4.8 の `effort` パラメータは全サーフェス（API・Claude Code）でデフォルト `high`。別レベルは明示指定が必要（2026-06-15）
- [changelog v2.1.172] サブエージェントが最大5階層までネスト可能に。plugin marketplace ブラウザに検索機能追加（2026-06-15）
- [changelog v2.1.169] `--safe-mode` フラグで全カスタマイズ（CLAUDE.md/hooks/plugins/skills/MCP）無効化。`post-session` ライフサイクルhook追加・`/cd` でprompt cacheを壊さずセッション移動（2026-06-15）
- [changelog v2.1.175] `enforceAvailableModels` managedセッティングでDefaultモデルを許可リストに制限可能（2026-06-15）
- [changelog v2.1.176] セッションタイトルが会話の言語で生成。Opus 4.8 非対応組織向けのautoモードフォールバック修正（2026-06-15）

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

（2026-05-18 以前の処理済みエントリは drafts/best-practices-archive.md に移動）
