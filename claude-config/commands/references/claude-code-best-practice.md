# claude-code-best-practice リポジトリ

**GitHub**: https://github.com/hellno/claude-code-best-practice  
**Stars**: 19.7K+（2026-04-13 時点）  
**著者**: Boris Cherny（Claude Code 開発責任者）ほか  

---

## 何が書かれているか

Claude Code を「ステートレスなアシスタント」から「永続的・自律的なエンジニアリングチーム」へ変えるための実践知識を集約したリポジトリ。

- **84個のソース付き Tips** — プロンプティング・計画・CLAUDE.md・エージェント・コマンド・スキル・hooks の7カテゴリ
- **主要機能の実装例** — slash commands / memory / skills / hooks / subagent / MCP server
- **8リポジトリ横断ワークフロー比較表** — 主要 OSS リポジトリの Claude Code 設定を比較
- **Boris Cherny の知見** — Claude Code 開発責任者自身の tips まとめ

---

## NOCTA での活用方針

- スキル（`~/.claude/commands/`）を新規作成・改善するときに参照する
- CLAUDE.md のルール（R-01〜R-14）を見直すときに照合する
- 月次の `/best-practices-review` で蓄積した新知見と突き合わせる

---

## 参照タイミング

| タイミング | 目的 |
|---|---|
| スキル新規作成前 | 既存 tips に類似実装がないか確認 |
| CLAUDE.md ルール追加前 | 推奨パターンとの整合確認 |
| `/best-practices-review` 後 | 新知見と比較表を照合 |

---

*初回追記: 2026-04-13（/best-practices-review より）*
