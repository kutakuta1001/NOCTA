# CLAUDE.md 監査表（2026-08-05）

判定フロー（上から先に一致した行き先へ）:

| # | 判定 | 行き先 |
|---|---|---|
| 1 | 破られたら不可逆な被害か | deny/hooks へ降格 + 正本に存在告知1行 |
| 2 | ないと Claude が間違うか | 正本に残す（最大限圧縮） |
| 3 | ハーネス/ツールが同じ情報を自動提供するか | 削除 |
| 4 | 参照時にのみ必要か・頻繁に変わるか | references/ へ + 1行ポインタ |
| 5 | どれでもない | 削除 |

ベースライン: 4ファイル合計 973行 / 34,507文字
退避先: docs/superpowers/archive/claude-md-2026-08-05/

## ~/.claude/CLAUDE.md（174行）

| 旧セクション | 内容要約 | 行き先 | 理由 |
|---|---|---|---|
| G-01 モデルを目的で使い分ける | モデル4種の仕様・価格・切替通知ルール（約25行） | 正本 R-09 と重複するため4行に圧縮 + references/model-lineup.md | 3ファイルに同一内容が約25行ずつあった。仕様と価格は頻繁に変わる |
| G-02 ファイル読み込みは最小限 | 常時適用ルール | 残す | ないと Claude が先読みしてコンテキストを埋める |
| G-03 絵文字を使わない | 常時適用ルール | 残す | ないと Claude が既定で絵文字を使う |
| G-04 対話してから作業する | 常時適用ルール + 3C + Goal/Constraints/AC | 残す | ないと Claude が合意前に着手する |
| G-05 再開できる状態を保つ | handoff 運用 | 残す | ないと handoff が書かれない |
| G-06 納品デブリーフ | 5項目の出力形式 + 適用範囲 | 残す | ないとデブリーフが出ない。形式が具体的でないと機能しない |
| セッション運用（表） | 操作と方法の対応表 | references/nocta-cheatsheet.md | CEO が参照する情報。Claude の判断には不要 |
| COST POLICY | Plan Mode / Subagent / Agent Teams | 削除（正本 COST POLICY に一元化） | プロジェクト側と重複。NOCTA 以外のプロジェクトがない |
| スキル・CLAUDE.md 設計 | 500行以内・context:fork 等 | G-07 に統合（context:fork の詳細は削除） | 500行制限は残す価値がある。context:fork の版情報は頻繁に変わる |
| フロントエンド作成 | frontend-design / designer 運用 | 正本 R-17 へ昇格 | プロジェクト側にも同内容があった。ルールとして一元化 |
| MCP管理 | ツール80以下 | 削除（正本 MCP に一元化） | プロジェクト側と重複 |
| セキュリティ | deny リスト | 残す（approved/ を追記） | 何が実行不可かを Claude が知る必要がある |
| コードレビュー（Codex CLI） | /review 認証フォールバック | 残す（詳細は既存 references へのポインタ） | exit 75 のフォールバック手順は判断に必要 |
| ベストプラクティス定期確認 | /weekly-check 等 | references/nocta-cheatsheet.md | CEO が参照する情報 |

## NOCTA/CLAUDE.md（310行）

| 旧セクション | 内容要約 | 行き先 | 理由 |
|---|---|---|---|
| アイデンティティ | スタジオ定義 | 2行のみ残す | import 前に何のプロジェクトか分かる必要がある。roadmap.md へのポインタと「CEO ペースで進行」は正本の参照リストへ移設済み（commit 83c336f） |
| 全セクション | project_NOCTA/CLAUDE.md の簡約版（14セクションが重複） | 削除 → `@project_NOCTA/CLAUDE.md` の import 1行に置換 | 同一内容の詳細版と簡約版が両方ロードされていた。正本を1本にする |
| MCP管理の調査オプション | X / YouTube / マルチPF 調査手段の詳細（約40行） | references/nocta-tools.md | デフォルト無効のオプション。使うときだけ読む |
| ローカルLLMオプション | Qwen / Ollama | references/nocta-tools.md | 参照時にのみ必要 |
| SLASH COMMANDS（4表） | コマンド一覧 | references/nocta-cheatsheet.md | ハーネスがスキル一覧を自動提示する。CEO 用の一覧は cheatsheet へ |

## project_NOCTA/CLAUDE.md（349行）

| 旧セクション | 内容要約 | 行き先 | 理由 |
|---|---|---|---|
| 会社アイデンティティ | ミッション・CEO スキルセット・AI の立ち位置 | 正本に残す（4行に圧縮） | ないと AI が CEO の作業領域を侵す。R-10 の前提 |
| RULES R-01〜R-15 | 全ルール（理由付き・詳細版） | 正本に残す（R-01〜R-15 として圧縮・R-16/R-17 を追加） | ないと Claude が間違う。ルールは1本も削除しない |
| R-09 のモデル仕様詳細 | 価格・コンテキスト長・切替通知ルール・注意事項（約25行） | references/model-lineup.md | 参照時にのみ必要。かつ価格と仕様は頻繁に変わる |
| R-13 の代替ツール列挙 | ACE-Step / Khala / Mureka の詳細 | references/nocta-tools.md | 参照時にのみ必要。選定候補は頻繁に変わる |
| MEMORY | 空欄テンプレート3ブロック | 削除 | 数ヶ月空欄のまま。auto-memory（公式機能）を実運用中で役割が重複 |
| PROJECT CONTEXT | 空欄テンプレート | 正本に残す | 曲ごとに埋める運用中。ないとフェーズ判断ができない |
| CODEMAP | ディレクトリ構造 + 担当エージェント注記 | 正本に残す（担当エージェント注記は削除） | 構造はないと迷う。担当注記は AGENTS と重複 |
| AGENTS 依存関係マップ（ASCII図） | 12行の矢印図 | 削除（フロー1行に圧縮） | 1行のフロー表記で同じ情報が伝わる |
| AGENTS エージェント表 | 11エージェントとモデル | references/model-lineup.md | 実体は ~/.claude/agents/。参照時にのみ必要 |
| MCP管理（常時有効・必要時・無効化推奨） | 3分類の説明 | 正本に3行 + references/nocta-tools.md | 80以下維持はルール。個別ツールの設定は参照情報 |
| APPROVAL GATES | ①〜⑨ + コマンド列 | 正本に残す | ないと AI が勝手に次フェーズへ進む |
| SLASH COMMANDS | コマンド表 | 削除 | ハーネスが利用可能スキル一覧を毎セッション自動提示する。references/nocta-cheatsheet.md に CEO 用の一覧を置く |
| COST POLICY | モード + 判断基準 + effort | 正本に残す（ワークフローを追加） | ないとコスト判断を誤る |

## website/CLAUDE.md（140行）

| 旧セクション | 内容要約 | 行き先 | 理由 |
|---|---|---|---|
| ホスティング構成 | GitHub Pages / Netlify・パス規則 | 残す（表を箇条書きに圧縮） | 相対パス規則は間違えると本番が壊れる |
| ファイル構成 | website/ 直下の構造 | 残す | ないとファイルを探せない |
| データファイルのルール | visual / blog / works / apps の各仕様 | 残す（CIDv1 59文字を強調） | 間違えると422エラーで本番が壊れる |
| git 操作ルール | add 個別指定・コミットメッセージ例 | 残す（push 制約を追記・コミット例は正本と重複分を削除） | 本番デプロイに直結する |
| デザインシステム | Tailwind・フォント・色・比率 | 残す（DESIGN.md へのポインタは維持） | UI 実装時に必要 |
| フロントエンドデザイン強化 | 呼び出し場面・NOCTA コンテキスト・禁止パターン | 圧縮して残す（呼び出し規定は正本 R-17 へ） | 渡すコンテキスト文字列は実務で必要。呼び出し条件はルールなので正本へ |
| @import の設定 | NOCTA/CLAUDE.md からの明示 import | 削除（子ディレクトリ自動ロードに変更） | HP 作業時のみ読み込めば足りる。通常セッションから約90行が消える |

## 削除判定の一覧（CEO レビュー必須）

| 削除対象 | 元の場所 | 理由 |
|---|---|---|
| MEMORY 空欄テンプレート3ブロック | project_NOCTA/CLAUDE.md | 数ヶ月空欄のまま。auto-memory と役割が重複 |
| SLASH COMMANDS 表 | project_NOCTA + NOCTA（2ファイル） | ハーネスがスキル一覧を毎セッション自動提示。CEO 用一覧は cheatsheet へ移設 |
| AGENTS 依存関係マップ（ASCII図12行） | project_NOCTA/CLAUDE.md | 1行のフロー表記で同じ情報が伝わる |
| COST POLICY（グローバル側） | ~/.claude/CLAUDE.md | プロジェクト側と重複。NOCTA 以外のプロジェクトがない |
| MCP管理（グローバル側） | ~/.claude/CLAUDE.md | プロジェクト側と重複 |
| context:fork / サブエージェント上限の版情報 | ~/.claude + project_NOCTA | 頻繁に変わる情報。必要時は公式ドキュメントを見る |
| NOCTA/CLAUDE.md の全ルール記述 | NOCTA/CLAUDE.md | 正本の簡約版。import に置換 |
| Netlify の詳細説明 | website/CLAUDE.md | 無料枠超過で停止中。1行に圧縮 |
