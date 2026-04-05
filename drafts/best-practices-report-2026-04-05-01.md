# ベストプラクティスレビュー: Best Practices
日付: 2026-04-05
ソース: https://code.claude.com/docs/en/best-practices.md

---

## 要約（3行以内）

コンテキストウィンドウの管理が最重要テーマ。CLAUDE.mdは「削ぎ落とす」ことが品質向上につながり、肥大化が逆効果と明示されている。
Skills/Subagents/Hooks/Plugins の使い分けが整理されており、NOCTAの現在の構成と概ね一致しているが、未活用の機能が複数ある。

---

## NOCTAへの適用提案

| 優先度 | 対象 | 現状 | 提案内容 |
|--------|------|------|----------|
| 高 | CLAUDE.md の肥大化対策 | R-01〜R-15 + AGENTS + COST POLICYなど長大 | 「Claudeがコードを読めば分かること」を削除。1行ずつ「これを削ったらミスが増えるか？」で精査。Hooks化できるルールはHooksへ移行 |
| 高 | `/compact` の活用強化 | `/clear` の習慣化はレポート済み | `/compact Focus on [作業内容]` の形式を使うことで要約の質が上がる。CLAUDE.mdに「When compacting, preserve list of modified files and next action」を追加検討 |
| 高 | 自動検証の組み込み | スキル内に検証ステップが薄い | `/blog-publish` `/hp-add-work` などのスキルに「期待される出力（URLが返る、ファイルが存在するなど）」を明示し、Claudeが自己検証できるようにする |
| 中 | `/btw` コマンドの活用 | 未使用 | コンテキストを汚染せずサイドで質問できる機能。「この変数名の意味は？」など調査的な質問に使うと本筋のコンテキストを節約できる |
| 中 | `@import` 構文の活用 | CLAUDE.mdに直接記述 | `@docs/git-instructions.md` のようにルールを別ファイルに分離し、CLAUDE.mdをすっきり保てる。website/CLAUDE.mdのHP固有ルールは `@website/CLAUDE.md` でインポートが可能 |
| 中 | `/rewind` の認識 | Esc×2の操作は文書化されていない | `Esc × 2` または `/rewind` でチェックポイント復元が可能。CEOに存在を周知し、CLAUDE.mdに記載しておく価値あり |
| 低 | `claude --continue` の活用 | `/music-reset-context` で代替 | `claude --continue` でセッションを名前付き再開できる。`/rename oauth-work` で命名すれば複数ワークストリームを管理しやすい |
| 低 | Subagent 定義ファイルの整備 | `~/.claude/agents/` 未使用 | セキュリティレビュー・品質チェックなど専門サブエージェントを `.claude/agents/` に定義すると、コンテキスト汚染なしに調査を委任できる |

---

## セキュリティ・安全性への影響

**Auto mode（`--permission-mode auto`）の性質を理解する**
- Auto modeはScopeエスカレーション・不明なインフラへのアクセス・ホスティングコンテンツ由来の操作を自動ブロック
- `-p`フラグ（非対話型）でAuto modeを使う場合、ブロックが続くとAbortするため、CI/スクリプト自動化時は注意

**Checkpoints は git の代替ではない**
- Claude が行った変更のみトラック。外部プロセスによる変更は含まれない
- NOCTAの git ワークフローは変わらず必要

---

## 適用しない理由がある項目

| 項目 | 理由 |
|------|------|
| Plugins (`/plugin` マーケットプレイス) | Superpowers Plugin は既に導入済み。追加は必要に応じて判断 |
| Fan-out（大量ファイルのループ処理） | NOCTAはソロプロジェクト・少数ファイル運用のため不要 |
| CI/CD パイプラインへの `claude -p` 統合 | GitHub Actions はデプロイのみ。コード生成パイプラインは現状不要 |
| `gh` CLI 活用 | HP作業は `git push origin main` のみ。PR/Issue管理はしていない |
| Agent Teams の Writer/Reviewer パターン | `/phase2-music` で既に Agent Teams を活用。Writer/Reviewerは音楽制作には向かない |

---

## 次回CEOが確認すべき事項

1. **CLAUDE.md の精査**: 現在の `/Users/fghmacbook013/NOCTA/CLAUDE.md` をドキュメントの基準（「Claudeが自分で判断できることは書かない」）で見直す価値あり。特に R-10・R-11（役割の明確化系）はClaude自身が判断できるため、削除候補の可能性がある
2. **`/compact Focus on [内容]` の使い方**: 長セッション後に `/compact` を実行する際、`/compact Focus on HP作業・変更したファイル一覧・次のアクション` のように指示を添えると要約精度が上がる。試してみて効果を確認してほしい
