# CLAUDE.md スリム化 + ハード化層 設計書

日付: 2026-08-05
ステータス: CEO 承認済み（セクション単位で合意・本書は最終レビュー用）
起案: Fable 5（ブレインストーミングセッション）

---

## 1. 背景と目的

### 背景

2026-08-05 の週次ベストプラクティスレビューで、独立した4ソースが同一の結論を示した。

| ソース | 指摘 |
|---|---|
| Anthropic 公式ベストプラクティス | 各行に「削除したら Claude が間違うか」を問い、否なら削除。膨らんだ CLAUDE.md は実際の指示が無視される原因になる |
| Gemini Web 検索（複数記事の集約） | CLAUDE.md は50〜200行に抑える |
| @kodagen（実測報告） | CLAUDE.md・Skills・Subagents・hooks・MCP を全部シンプル化したらトークン消費が体感半減 |
| Boris Cherny（Claude Code 開発者） | 6ヶ月ごとに CLAUDE.md・skills・hooks を削除して素の挙動を見よ |

NOCTA の現状は CLAUDE.md 4ファイル・973行・34,507文字（推奨値の5〜19倍）で、14セクションが2ファイル以上に重複している。Fable 5 は Opus 4.7 トークナイザで同一テキストが約30%多いトークンになるため、Fable 5 を既定モデルにした現在、この固定費はさらに増大する。

同レビューで「無確認で走る経路」の構造的リスクも特定された。

- v2.1.221: バックグラウンドセッションが作業保全のため自動 commit/push する（NOCTA では main への push = GitHub Actions 経由の本番サイト更新）
- ワークフローのサブエージェントはセッションの権限モードに関係なく常に acceptEdits で動作し、ファイル編集が自動承認される
- NOCTA は bypassPermissions 運用のため上記と合わせて二重の無確認構造
- R-02（approved/ には触れない）は CLAUDE.md 上の論理ルールのみで、permissions.deny に approved/ への Write が入っていない

### 目的

1. 常時ロードされる CLAUDE.md 群を 973行 → 400行以下に削減する（非HP作業セッションの常時ロードは320行以下）
2. 破られたら不可逆なルールを「だいたい守られる」CLAUDE.md 層から「100%実行される」deny/hooks 層へ降格する
3. ルールは1本も失わない。層を移すだけ（削除するのは重複・ハーネス二重情報・空欄テンプレのみ）

---

## 2. 合意事項（ブレインストーミングで確定）

| 論点 | 決定 |
|---|---|
| スコープ | CLAUDE.md 4ファイル + 降格先の hooks/deny。スキル51本・エージェント25本は対象外 |
| 参照情報の扱い | references/ へ移して正本に1行ポインタ |
| 正本 | project_NOCTA/CLAUDE.md（git 管理下）。NOCTA/CLAUDE.md は @import + 数行に縮小 |
| ハード化対象 | (a) approved/ の完全 CEO 手動化（deny + PreToolUse hook）(b) BG セッション push 禁止を git ルールに明記。R-03 の追加ハード化は見送り（xmcp .env ALLOWLIST で実効済み） |
| 実施方式 | 案A: ゼロベース再構築 + 全行監査表 |

---

## 3. ファイル構成（After 像）

| ファイル | 現在 | After | 内容 |
|---|---:|---:|---|
| `project_NOCTA/CLAUDE.md`（正本） | 349行 | ~250行 | アイデンティティ（3行）・R-01〜R-15 圧縮版・git 運用ルール（BG push 禁止を含む）・PROJECT CONTEXT・CODEMAP 圧縮版・承認ゲート表 |
| `~/.claude/CLAUDE.md` | 174行 | ~60行 | 全プロジェクト共通の作業原則（対話してから作業・handoff・デブリーフの要点）+ モデル使い分け3行 + model-lineup.md ポインタ |
| `NOCTA/CLAUDE.md` | 310行 | ~10行 | アイデンティティ2行 + `@project_NOCTA/CLAUDE.md` import |
| `website/CLAUDE.md` | 140行 | ~80行 | データ形式ルール（CIDv1 59文字・必須フィールド）・相対パス規則・git add 制約。NOCTA/CLAUDE.md からの @import を廃止し、子ディレクトリ自動ロード（HP 作業時のみ）に変更 |
| 合計 | 973行 | ~400行 | 非HP作業の常時ロードは ~320行 |

### references/ の構成

| ファイル | 種別 | 吸収する内容 |
|---|---|---|
| `~/.claude/references/nocta-cheatsheet.md` | 新設（CEO 向け） | セッション運用表・SLASH COMMANDS 一覧・コスト確認手段・Agent Teams デバッグ・「6ヶ月ごとゼロベース見直し」の運用メモ |
| `~/.claude/references/nocta-tools.md` | 新設 | Suno 代替（ACE-Step / Khala / Mureka）・xmcp / vidIQ / last30days 等の調査オプション詳細・ローカル LLM（Qwen） |
| `~/.claude/references/model-lineup.md` | 既存に吸収 | R-09 / G-01 のモデル仕様詳細・価格・切替通知ルールの詳細 |
| `~/.claude/references/archive/claude-md-2026-08-05/` | 退避 | 旧4ファイルの完全コピー（ロールバック・差分参照用） |

### 削除するもの（代表例。全量は監査表で確定）

| 対象 | 削除理由 |
|---|---|
| SLASH COMMANDS 表（2ファイルに重複） | ハーネスがスキル一覧を毎セッション自動提示するため二重 |
| MEMORY 空欄テンプレート | auto-memory（公式機能）を実運用中。テンプレは数ヶ月空欄のまま |
| AGENTS 詳細表 | 実体は ~/.claude/agents/ の25定義。正本にはフロー1行+モデル方針のみ残す |
| バージョン番号・価格の羅列（v2.1.XXX 機能紹介等） | 「頻繁に変わる情報」。必要分だけ references へ |

---

## 4. ハード化層の設計

### 4-1. approved/ の deny ルール

`~/.claude/settings.json` の permissions.deny に追加:

```json
"Write(//Users/fghmacbook013/NOCTA/**/outputs/approved/**)",
"Edit(//Users/fghmacbook013/NOCTA/**/outputs/approved/**)"
```

- `**` で複数曲プロジェクト（project_[曲名]）を将来分まで包括する
- deny ルールはサブエージェントにも継承され acceptEdits より優先されるため、ワークフローの「常に acceptEdits」経路もこれで塞がる
- パス構文（`//` 絶対パス形式）は実装時に動作検証する（検証タスクを実装計画に含める）
- この変更により approved/ への配置は完全に CEO の手動操作となる（CODEMAP の「手動移動のみ」と一致。R-02 本文の「CEO が承認したと言われた場合のみ移動を実行」は本設計で廃止し、表記を統一する）

### 4-2. approved-guard.sh（PreToolUse hook・新規）

deny は Write/Edit ツールのみ対象のため、Bash 経由の書き込みを hook で塞ぐ。

- 対象: `cp` / `mv` / `rsync` / `tee` / `>` `>>` リダイレクト / `mkdir` / `touch` / `sed -i` 等で approved/ が書き込み先として現れるコマンド
- 判定は純粋な正規表現のみ（LLM 判定なし・決定論的）。読み取り（`cat`、approved/ からのコピー）は許可
- 迷ったら過剰ブロック側に倒す（fail-closed）。CEO の手動移動はターミナル直接操作のため hook の影響を受けない
- 既存 `stop-hook-lib.sh` の流儀（ログ記録・再帰ガード）に従う
- 設定先: `~/.claude/settings.json` の hooks.PreToolUse（matcher: Bash）

### 4-3. BG セッション push 禁止（正本の git ルールに1行追加）

> git push は CEO が対話セッションで明示的に指示した場合のみ実行する。バックグラウンドセッション・自動処理・ワークフローからは push しない（commit まで）。

v2.1.221 の自動 push 挙動は「CLAUDE.md の git 指示に従う」と公式に明記されているため、この1行が正規の制御点。既存の commit-guard（Stop hook・検証実証なしの commit/push 提案をブロック）はそのまま併存する。

---

## 5. 必然性テストと監査表

### 判定フロー（上から先に一致した行き先へ）

| # | 判定 | 行き先 |
|---|---|---|
| 1 | 破られたら不可逆な被害か | deny/hooks へ降格 + 正本に存在告知1行 |
| 2 | ないと Claude が間違うか | 正本に残す（最大限圧縮） |
| 3 | ハーネス/ツールが同じ情報を自動提供するか | 削除（理由を監査表に記録） |
| 4 | 参照時にのみ必要か・頻繁に変わるか | references/ へ + 1行ポインタ |
| 5 | どれでもない | 削除（理由を記録） |

### 監査表

- 保存先: `drafts/claude-md-audit-2026-08-05.md`
- 粒度: セクション + ルール単位（行単位は973行に対して過剰）
- 形式: `| 旧位置（ファイル:セクション） | 内容要約 | 行き先 | 理由 |`
- 「削除」判定の全項目は CEO レビューの必須確認対象

---

## 6. 検証と完了条件

1. 実測: 4ファイル合計 400行以下・非HP作業の常時ロード 320行以下（before: 973行 / 34,507字）
2. ロード検証: 新セッションで @import 経由の正本ロードを確認。website/CLAUDE.md が通常セッションでロードされないことを確認
3. ガード検証: approved/ への Write・Bash cp を実際に試行し deny されることを確認
4. 挙動テスト: 代表タスク（/music-status・handoff 追記・visual-add ドライラン）で R-01 / R-05 / R-06 / R-08 の遵守を確認
5. CEO レビュー: 監査表の「削除」項目全件 + 新正本の全文
6. ロールバック手段: 旧4ファイルは references/archive/ に退避。正本は git 管理下のため revert 可能
7. 運用: 適用後2週間観察し、挙動劣化があれば該当ルールだけ references から正本に戻す

オプション: 新正本の執筆後・コミット前に `/review`（Codex 第三者レビュー）を実施できる（重要設計変更のクリティークとして）。

---

## 7. 実施手順の概要（詳細は writing-plans で計画化）

1. 旧4ファイルを `references/archive/claude-md-2026-08-05/` へ退避
2. references 新設2ファイル（cheatsheet / tools）を作成、model-lineup.md へ R-09 詳細を吸収
3. 新正本（project_NOCTA/CLAUDE.md）をゼロベースで執筆 + 監査表を同時作成
4. グローバル / NOCTA / website の3ファイルを書き換え（@import 設定・website の import 廃止）
5. deny 追加 + approved-guard.sh 実装（update-config スキル経由で settings.json を変更）
6. 検証（セクション6の1〜4）
7. CEO レビュー → 承認後にコミット

## 8. スコープ外

- スキル51本・エージェント25本の棚卸し（prompt-audit 適用は別件）
- R-03 の追加ハード化（xmcp .env ALLOWLIST で実効済み）
- git push 全体の PreToolUse ガード（commit-guard が Stop 層で既に類似の役割を担う）
- Claude Code 本体のアップデート（別件・ただし v2.1.221/222 のセキュリティ修正適用を推奨済み）
