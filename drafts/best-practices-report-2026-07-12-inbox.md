# ベストプラクティスレビュー（インボックス一括）
日付: 2026-07-12（2回目・manual分）
次回レビュー推奨: 2026-08-11以降（インボックスに5件貯まったら）
ソース: 本文インライン形式5件（manual: `/claude-docs-review`由来。WebFetch不要のため取得成功/失敗の区別なし）
除外URL: なし（インジェクション検査を全5件で実施し危険パターン検出なし）

※ 本日1回目（xmcp分17件）のレポートはgit履歴（コミット`483bb99`）で確認可能。同日2回目の実行のため本ファイルを上書きしている。

## 要約（3行以内）

`/checkup`（`/doctor`のエイリアス）の実在をClaude Code公式CHANGELOGで確認できた。X上の未確認情報を裏付ける結果。
Fable 5の利用可否について、公式モデル一覧では2026-07-12時点でGA継続中と確認でき、既存メモリの「利用不可想定」記述が実態と食い違っている可能性が高い。
CLAUDE.md短縮提案機能（`/doctor`）やhooks/MCPのシェルインジェクション対策強化はAnthropic側の改善であり、NOCTA側の追加対応は不要。

## NOCTAへの適用提案（未実装のもののみ）

| 優先度 | 対象 | 現状 | 提案内容 | 参照記事 |
|--------|------|------|----------|---------|
| 高 | CLAUDE.md R-09（Fable5記述）・[[project_fable5_unavailable]]メモリ | 「2026-07-07まで選択可、以降は利用不可想定」と記載 | 公式ドキュメントは2026-07-12時点でGA継続中と明記。次回`/model`での実際の選択可否確認結果に基づき記述を更新する | fable5-ga-status |
| 中 | MCP/Skill整理運用（MCP管理節） | `/mcp`手動確認＋`disabledMcpServers`追加が唯一の整理手段 | `/checkup`（`/doctor`エイリアス）の実在を確認済み。次回起動時に実際に試し、MCP/Skill整理を効率化できるか検証する | checkup-doctor-alias |
| 低 | `/claude-docs-review`スキルの取得先URL | `docs.anthropic.com/ja/...`をハードコード（現状もリダイレクト経由で正常動作） | 移転先URL（`platform.claude.com`・`code.claude.com`）に更新し、フェッチのリダイレクト段数を削減する | docs-domain-migration |

## 記事ごとの主要ポイント

| 記事 | 要点（30文字以内） |
|------|-----------------|
| docs.anthropic.com-checkup-doctor-alias | /checkupは/doctorの別名（v2.1.202） |
| docs.anthropic.com-doctor-claudemd-shorten-suggestion | /doctorがCLAUDE.md短縮を提案（v2.1.206） |
| docs.anthropic.com-hooks-mcp-shell-injection-hardening | hooks/MCPのシェルインジェクション対策強化 |
| docs.anthropic.com-fable5-ga-status | Fable5は2026-07-12時点でGA継続中 |
| docs.anthropic.com-docs-domain-migration | ドキュメントがplatform/code.claude.comへ移転 |

## インスピレーションメモ

- `/checkup`の自動整理範囲 — MCP/Skill/プラグインの棚卸しを毎回手動でやらずに済むかも（参照: Claude Code CHANGELOG v2.1.202）

## セキュリティ・安全性への影響

- v2.1.207: hooks/monitors/MCPのheadersHelperで`${user_config.*}`のシェル形式コマンド展開が拒否されるようになった（シェルインジェクション対策強化）。NOCTA側の既存hooks（`commit-guard.sh`等）に直接の変更対応は不要と判断。

## 適用しない理由がある項目

- **`/doctor`のCLAUDE.md短縮提案（v2.1.206）**: 2026-07-04のレビューで「CLAUDE.mdの行数削減論」を既に検討・不採用としている（NOCTAは意図的に詳細なルール群を保持する方針）。`/doctor`/`/checkup`実行時に同提案が出ても、この既存方針に基づき採用しない。提案は自動適用されないため実害もない。
- **hooks/MCPのシェルインジェクション対策強化（v2.1.207）**: Anthropicプラットフォーム側の防御的改善であり、NOCTA側の設定変更は不要。

## CEOが確認すべき事項

1. **[要確認・優先]** Fable 5の利用可否 — [[project_fable5_unavailable]]の「2026-07-07まで選択可、以降利用不可想定」という記録の出典を再確認してほしい。本日確認した公式モデル一覧ページ（2026-07-12時点）ではGA継続中としか記載されておらず、制限の言及が見当たらない。次回`/model`実行時に実際の選択可否を確認し、CLAUDE.md R-09・memoryを最新化する。
2. **[参考]** `/checkup`（`/doctor`のエイリアス）を次回起動時に試し、MCP/Skill整理運用の効率化に使えるか確認してほしい（低リスク・低コスト）。
