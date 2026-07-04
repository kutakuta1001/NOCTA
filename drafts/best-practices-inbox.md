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

（2026-06-04 以前の処理済みエントリは drafts/best-practices-archive.md に移動）
