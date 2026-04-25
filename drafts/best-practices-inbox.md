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

- [docs.anthropic.com] モデル一覧 — Opus 4.7 ナレッジカットオフ2026年1月 vs Sonnet 4.6 は2025年8月（批評者役に最新情報の優位性あり） （2026-04-25）
- [docs.anthropic.com] Claude Code 概要 — `/desktop` コマンドでターミナルセッションをデスクトップアプリに転送可能（視覚的差分確認環境へシームレスに切り替え） （2026-04-25）
- [docs.anthropic.com] Claude Code 概要 — Dispatch機能: モバイルデバイスからデスクトップセッションへタスク送信可能（外出中の非同期制作作業を支援） （2026-04-25）
- [openai.com] ChatGPT Images 2.0 — GPT Image 2 にThinking Mode搭載（生成前に推論・Web参照・自己修正）。DALL-E 3後継・2026-04-21リリース （2026-04-25）
- [openai.com] GPT Image 2 — CJKテキスト精度約99%（日本語の歌詞・楽曲タイトルを画像内に正確描画可能）。NOCTAのSNSグラフィック制作に直接活用可能 （2026-04-25）
- [openai.com] GPT Image 2 — 1プロンプト最大8枚の一貫画像・2K解像度・アスペクト比3:1〜1:3対応（SNSフォーマット一括生成可能） （2026-04-25）
- [openai.com] GPT Image 2 vs Midjourney — テキスト精度・API・多言語はGPT Image 2優位。純アート性・構図美はMidjourney v8優位。NOCTAはGPT Image 2に移行 （2026-04-25）
- [docs.anthropic.com] CHANGELOG v2.1.119 — `--agent <name>` が agent frontmatter の `permissionMode` を適用するように。`/config` 設定が `~/.claude/settings.json` に永続保存 （2026-04-25）
- [docs.anthropic.com] CHANGELOG v2.1.118 — Hooks から MCP ツールを直接呼び出せるように（`type: "mcp_tool"` 形式追加）xmcp連携フックが可能に （2026-04-25）
- [docs.anthropic.com] CHANGELOG v2.1.117 — Opus 4.7 の `/context` 計算バグ修正: 200K設定だったのが正しい1M context windowに修正（以前は過剰なauto-compactionが発生） （2026-04-25）
- [docs.anthropic.com] モデル一覧 — Opus 4.7 / Sonnet 4.6 のコンテキストウィンドウが1Mトークン（Haiku 4.5は200k）。Opus 4.7は新トークナイザー使用 （2026-04-25）
- [docs.anthropic.com] モデル一覧 — Message Batches API で Opus 4.7/Sonnet 4.6 が最大300k出力トークンをサポート（`output-300k-2026-03-24` betaヘッダー要） （2026-04-25）
- [docs.anthropic.com] Claude Code 概要 — `/teleport` コマンド: Web/iOSで開始したクラウドセッションをCLIターミナルに引き込んで継続可能 （2026-04-25）
- [docs.anthropic.com] CHANGELOG v2.1.118 — `/cost` と `/stats` が `/usage` に統合（セッション中のコスト確認コマンドが変更） （2026-04-25）
- [docs.anthropic.com] CHANGELOG v2.1.117 — `CLAUDE_CODE_FORK_SUBAGENT=1` でフォーク型サブエージェント有効化（親コンテキスト継承の並列実行・Agent Teams強化に関連） （2026-04-25）
- [docs.anthropic.com] CHANGELOG v2.1.117 — `/resume` に大規模セッション要約オプション追加（最大67%高速・長期プロジェクト再開の効率改善） （2026-04-25）
