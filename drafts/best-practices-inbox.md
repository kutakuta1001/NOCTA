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

- [changelog v2.1.215] `/verify` と `/code-review` スキルが自動実行されなくなり明示呼び出しが必要に。長時間ツールのハートビート進捗表示追加（2026-07-29 処理）
- [changelog v2.1.214] Windows PowerShell の権限チェックバイパス脆弱性を修正（要アップデート）。EndConversation ツール追加（2026-07-29 処理）
- [changelog v2.1.212] `/fork` がバックグラウンドセッションを作成する方式に変更。Web検索のセッション上限200回・サブエージェント生成上限200個のガード追加（2026-07-29 処理）
- [platform.claude.com] モデル一覧 — Opus 4.1（claude-opus-4-1-20250805）非推奨・2026-08-05廃止。NOCTA未使用のため影響なし（2026-07-29 処理）
- [platform.claude.com] モデル一覧 — Sonnet 5 の effort デフォルトが Claude API / Claude Code で high に（2026-07-29 処理）
- [code.claude.com] 概要 — auto-memory が公式機能としてドキュメント化（2026-07-29 処理）
- [code.claude.com] 概要 — Chrome 統合でライブWebアプリのデバッグが可能に（2026-07-29 処理）
- [platform.claude.com] モデル一覧 — 【新モデル】Claude Opus 5（claude-opus-5）が現行モデルに追加。Opus 4.8 はレガシー表へ移動（2026-07-29 処理）
- [platform.claude.com] モデル一覧 — Fable 5 は GA 継続・輸出管理による提供終了の記載なし（2026-07-29 処理）
- [changelog v2.1.219] Claude Opus 5 が Claude Code のデフォルト Opus モデルに。/fast 対象は Opus 5・4.8（2026-07-29 処理）
- [changelog v2.1.217/219] サブエージェント同時実行上限20・ネスト生成デフォルト深さ3（2026-07-29 処理）
- [changelog v2.1.218] /code-review・context:fork スキルがバックグラウンド実行に。/deep-research は手動起動のみに（2026-07-29 処理）
- [code.claude.com] 概要 — Remote Control・Slack 連携・GitLab CI/CD が公式サポートに記載（2026-07-29 処理）

- [docs.anthropic.com] Claude Codeリリースノート — v2.1.202で`/checkup`が`/doctor`のエイリアスとしてフルセットアップ点検に拡張（CLAUDE.md短縮提案含む）（2026-07-12）
- [docs.anthropic.com] Claude Codeリリースノート — v2.1.206で`/doctor`がチェックイン済みCLAUDE.mdファイルの短縮を提案する機能を追加（2026-07-12）
- [docs.anthropic.com] Claude Codeリリースノート — v2.1.207でhooks/MCPの`${user_config.*}`シェル形式コマンドを拒否（シェルインジェクション対策強化）（2026-07-12）
- [docs.anthropic.com] モデル一覧 — Fable 5は2026-07-12時点で主要プラットフォーム全てでGA継続中、輸出管理による断続提供・利用不可の記載は見当たらない（2026-07-12）
- [docs.anthropic.com] ドキュメント構成 — docs.anthropic.comがplatform.claude.com/code.claude.comへ移転（release-notesはGitHub CHANGELOG.mdへリダイレクト）（2026-07-12）

（2026-07-04 以前の処理済みエントリは drafts/best-practices-archive.md に移動）
