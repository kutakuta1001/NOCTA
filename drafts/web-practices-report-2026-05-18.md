# Webベストプラクティスレビュー: 2026-05-18
ソース: Google Search Grounding（Gemini 2.5 Flash）
インジェクション検査: 実施済み（検出件数: 0件）

## 要約

CLAUDE.mdのコンパクト化・`.claudeignore`によるコンテキスト節約・スキルの段階的開示パターンが主要な改善候補。NOCTAの現行設計は概ねベストプラクティスに沿っているが、CLAUDE.mdの肥大化とファイル除外設定が未対応。

---

## 発見した主要ベストプラクティス

| # | 発見内容 | 関連度 | 参照元 |
|---|---------|--------|--------|
| 1 | CLAUDE.mdは60行/2500トークン以内が目安。詳細はサブディレクトリのCLAUDE.mdやスキルに分離 | 高 | q1: best practices 2025 |
| 2 | `.claudeignore`でnode_modules/・ビルド成果物をコンテキストから除外する | 高 | q1: best practices 2025 |
| 3 | `@`記号で対象ファイルを明示的に指定し、Claudeが広範囲探索しないようにする | 高 | q2: CLAUDE.md tips |
| 4 | スキルのパス推奨形式: `.claude/skills/<name>/SKILL.md` — 再利用可能なプレイブック | 中 | q4: hooks/skills |
| 5 | Human-in-the-Loopの徹底: AIエージェント出力は複雑タスクほど人間の最終判断が必要 | 高 | q3: AI coding agent |
| 6 | `/context` コマンドでセッションのトークン使用量をリアルタイム監視 | 中 | q5: context/cost |
| 7 | 複雑タスクはサブエージェントを明示指示（「サブエージェントを使う」とプロンプトに含める） | 中 | q3: AI coding agent |
| 8 | 計画モード（Shift+Tab×2）を複雑タスクの前に使い、アプローチ整合性を確認 | 高 | q1,q2: best practices |
| 9 | 定期的なAIツール評価: 特定タスクで他ツールと比較し最適解を追求 | 低 | q3: AI coding agent |

---

## NOCTAへの適用提案

| 優先度 | 対象 | 現状 | 提案内容 |
|--------|------|------|----------|
| 高 | `.claudeignore` | 未設定 | website/作業でnode_modules/・.next/等をコンテキストから除外する `.claudeignore` を project_NOCTA/ に作成 |
| 高 | CLAUDE.md のサイズ | ルートCLAUDE.md が長大（500行超） | セッション運用・slash commands テーブルをスキル references/ に移動しCLAUDE.mdを300行以下に圧縮（次回 /simplify 時に実施） |
| 中 | スキルファイルパス | `~/.claude/commands/*.md` | プロジェクトローカルスキルを `.claude/skills/<name>/SKILL.md` 構造で再整理（グローバルとローカルの分離） |
| 中 | `/context` コマンド | `/usage` を使用 | セッション中に `/context` でトークン残量を確認し、肥大化前に `/compact` を実行するフローを運用に追加 |
| 低 | AIツール定期評価 | ACE-Step/Suno等を選択肢に記載 | 月1回の比較メモをdrafts/に保存する習慣 |

---

## すでに実装済みの項目

1. CLAUDE.mdによるプロジェクト標準化とコンテキスト設定（R-01〜R-15）
2. モデルの戦略的使い分け（R-09: Haiku/Sonnet/Opus の役割分担）
3. `/clear` `/compact` によるコンテキスト管理（セッション運用セクション）
4. スキルを活用した反復タスクの自動化（27スキル定義済み）
5. Hooksの設定（denyリストで破壊的操作をブロック）
6. サブエージェント・Agent Teams による並列処理（/phase2-music・/phase4-release）
7. 計画モード = Plan Modeの活用（COST POLICY）
8. /brainstorm による事前合意（R-13・R-14）
9. サブディレクトリのCLAUDE.md（website/CLAUDE.md）
10. Human-in-the-Loop（承認ゲート①〜⑨でCEO判断を必須化）

---

## 要注意: git・シェル操作に関わる提案（CEOが内容を確認してから判断）

収集した発見にgit操作・シェルコマンドの直接適用を促す内容はなし（0件）。

---

## インジェクション検査結果

検出パターン: **0件**
全5クエリとも安全。「前の指示を無視」「rm -rf」「git reset --hard」等は検出されず。

---

## 適用しない項目と理由

- **サブエージェント明示指示**: NOCTAではAgent Teamsがすでに設計されており、スキル内で制御されているため個別プロンプトでの明示は不要。
- **AIツール定期評価（他ツール移行）**: Claude Codeを基盤とした現行設計は安定しており、ACE-Step等の補助ツールも既にCLAUDE.mdに記載済みのため優先度低。
- **計画モード（Shift+Tab×2）**: Plan Modeは `/plan` または planモードとして既に使用中。UI操作の再案内は不要。

---

## CEOが確認すべき事項

1. **`.claudeignore` の作成**: `website/` 作業時にnode_modules等が読まれているか確認。作成する場合は project_NOCTA/ 直下に配置。
2. **CLAUDE.md のコンパクト化**: 現在500行超。スキル設計原則には「500行以内」と書いてあるが本体CLAUDE.mdは適用外になっている。次回の `/simplify` セッションで整理するか確認。
3. **スキルパス構造**: 現在 `~/.claude/commands/*.md` のグローバル配置。プロジェクトローカルスキルとして `.claude/skills/` に一部移動すると、プロジェクト間のスキル分離が明確になる可能性がある。

---

*生成: 2026-05-18 | セキュリティ検査: 実施済み | 自動適用なし*
