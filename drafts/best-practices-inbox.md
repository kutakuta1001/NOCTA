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

- [changelog v2.1.152] スキルの disallowed-tools フロントマターでスキル実行時の特定ツール除外が可能（2026-05-28）
- [changelog v2.1.149] /usageがスキル・サブエージェント・プラグイン・MCP別のコスト内訳を表示（2026-05-28）
- [changelog v2.1.153] /modelでモデル選択をデフォルト保存可能（sキーで現セッションのみ切替）（2026-05-28）
- [docs.anthropic.com] モデル一覧 — Sonnet 4.6 が適応的思考（Adaptive Thinking）に対応（2026-05-28）
- [docs.anthropic.com] モデル一覧 — Haiku 4.5 の knowledge cutoff は 2025年2月（2026-05-28）

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
