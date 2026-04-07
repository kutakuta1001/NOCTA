# ベストプラクティスレビュー（インボックス一括）
日付: 2026-04-07
次回レビュー推奨: 2026-05-07以降（インボックスに5件貯まったら）
ソース:
- https://x.com/HayattiQ/status/2021057206939156505 （本文直接使用）
- https://note.com/masa_wunder/n/n984af0385d7e
- https://x.com/Hoshino_AISales/status/2033425547989258354 （本文直接使用）
- https://x.com/ai_jitan/status/2033383556085588289 （本文直接使用）
- https://zenn.dev/lv/articles/b772312d6abf35
- https://x.com/MakeAI_CEO/status/2041363825631658448 （本文直接使用）

除外URL: なし（インジェクション検査完了・全件クリア）

---

## 要約（3行以内）

今回6件の共通テーマは「Claude Code スキル設計の深化とリアルタイム X 連携の台頭」。Anthropic 公式 skill-creator によるスキル自動作成・SKILL.md 500行制限・3層リソース構造という新設計指針が明確化された。X 公式 MCP（xmcp）と Grok API の2案が出揃い、NOCTA の `/phase1-trend` をリアルタイム X データで強化できる選択肢が具体化した（ただし xmcp は R-03 との整合性を要確認）。

---

## NOCTAへの適用提案（未実装のもののみ）

| 優先度 | 対象 | 現状 | 提案内容 | 参照記事 |
|--------|------|------|----------|---------|
| 高 | SKILL.md の長さ制限ルール | 一部スキル（best-practices-review 等）が500行超の可能性あり | CLAUDE.md に「スキルファイルは500行以内を目安にし、詳細は references/ ファイルに分離する」ガイドラインを追記。Anthropic 公式 skill-creator プラグインを試用すると新スキルを対話形式で自動生成できる（マーケットプレイス登録→プラグインインストール→再起動で導入） | zenn.dev/lv/.../b772312d6abf35 |
| 中 | `/phase1-trend` のリアルタイム X 検索 | web_search のみ。リアルタイム X 投稿の取得が困難 | **選択肢A: xmcp（X公式 MCP）** — `.mcp.json` に追加し `X_API_TOOL_ALLOWLIST=searchPostsRecent,getUsersMe` のみ許可（読み取り専用）。フェーズ1のみ有効化。**選択肢B: Grok API** — 従量課金（約0.1USD/回）で12クエリ以上投げて3〜5クラスター抽出。いずれも投稿/いいね/リポスト系ツールは R-03 に抵触するため ALLOWLIST から必ず除外 | x.com/MakeAI_CEO/... + x.com/HayattiQ/... |
| 低 | 複雑スキルの3層リソース構造 | 現在スキルはフラットな SKILL.md 1ファイル構造 | 複雑なスキルをリファクタリングする際の設計指針: `scripts/`（実行スクリプト）/ `references/`（参照ドキュメント）/ `assets/`（静的ファイル）の3層構造を採用するとコンテキスト効率が向上する | zenn.dev/lv/.../b772312d6abf35 |

---

## 記事ごとの主要ポイント

| 記事 | 要点（30文字以内） |
|------|-----------------|
| x.com/HayattiQ | Grok API で X検索をClaude Codeに統合 |
| note.com/masa_wunder | Agent Teams 並列協働の完全解説 |
| x.com/Hoshino_AISales | Claude Cowork の10機能全解説 |
| x.com/ai_jitan | NotebookLM スライド生成の全工程 |
| zenn.dev/.../b772312d6abf35 | skill-creator で Skills を自動生成 |
| x.com/MakeAI_CEO | X公式 xmcp で X連携を MCP 化 |

---

## インスピレーションメモ
（今すぐ使わなくてもよい。楽になる・創造的になる・楽しくなる可能性があるもの）

- **xmcp 読み取り専用モード × /phase1-trend** — X の音楽バズを searchPostsRecent でリアルタイム取得し「今週伸びているサウンド」を自動リポートできるようになるかも（楽になりそう）（参照: x.com/MakeAI_CEO/...）
- **Grok API × /phase1-trend** — X のバズ楽曲・制作トレンドを12クエリ以上で広く収集し論点クラスターを自動抽出。Grok は X 投稿に特化した検索精度が高い（楽になりそう）（参照: x.com/HayattiQ/...）
- **NotebookLM × PVコンセプト** — `/phase3-pv` の絵コンテ資料を NotebookLM に入れると「Apple風」「黒板チョーク風」などの世界観でビジュアル提案スライドが一発生成できるかも（創造的になりそう）（参照: x.com/ai_jitan/...）
- **skill-creator で新スキル対話生成** — 「こんなスキルが欲しい」と話しかけるだけで SKILL.md の叩き台を自動生成してくれる。スキル追加のハードルが大幅に下がりそう（楽しくなりそう）（参照: zenn.dev/lv/...）

---

## セキュリティ・安全性への影響

**⚠️ xmcp の投稿機能は R-03 に抵触する**

xmcp の `X_API_TOOL_ALLOWLIST` に `createPosts`・`likePost`・`repostPost` を含めると、Claude Code から X への自動投稿が可能になる。NOCTA の R-03「SNSを自動投稿しない」ルールに直接抵触するため、以下の対策を講じること:

- `.mcp.json` に xmcp を追加する場合は `X_API_TOOL_ALLOWLIST=searchPostsRecent,getUsersMe` のみ（読み取り専用）に限定
- `disabledMcpjsonServers` でデフォルト無効化し、フェーズ1実行時のみ手動で有効化
- 投稿系ツールを許可する設定変更は必ず CEO が手動で行う

---

## 適用しない理由がある項目

- **Claude Cowork**: NOCTA は Claude Code で同等以上の機能を実現済み。非エンジニア向け Claude Desktop GUI のため重複投資不要
- **NotebookLM の直接統合**: Google サービスで Claude Code ワークフローとは別系統。直接統合は複雑化につながる
- **xmcp の投稿機能**: R-03 に抵触。読み取り専用（searchPostsRecent のみ）でのみ採用可
- **Agent Teams（note.com/masa_wunder）**: 2026-04-06 のレビューで処理済み。CLAUDE.md に実装済み

---

## CEOが確認すべき事項

1. **SKILL.md 500行制限の確認**（優先度高）: `best-practices-review` 等の長いスキルファイルが500行を超えていないか確認し、超過していれば CLAUDE.md にガイドライン追記を検討。Anthropic 公式 skill-creator プラグインの試用も推奨（新スキル追加コストが下がる）。
2. **X リアルタイム検索の選択**（優先度中）: xmcp（読み取り専用）か Grok API か、どちらを `/phase1-trend` に組み込むかを判断してほしい。xmcp は無料・公式だが OAuth 設定が必要。Grok API は有料（従量課金）だが検索精度が高い。**どちらを採用する場合も投稿系ツールは必ず除外すること**。
