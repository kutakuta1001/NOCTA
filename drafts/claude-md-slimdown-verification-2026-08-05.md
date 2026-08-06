# CLAUDE.md スリム化 検証レポート（2026-08-05）

設計書: docs/superpowers/specs/2026-08-05-claude-md-slimdown-design.md
実装計画: docs/superpowers/plans/2026-08-05-claude-md-slimdown.md
監査表: drafts/claude-md-audit-2026-08-05.md
検証実施: Task 6（Step 1・2・6・7 をサブエージェントが実施。Step 3〜5 は新規インタラクティブセッションが必要なため CEO 実施待ち）

## 検証範囲の内訳

| ステップ | 内容 | 実施者 | 状態 |
|---|---|---|---|
| Step 1 | 削減量の実測 | サブエージェント（本レポート作成者） | 完了・独立再計測済み |
| Step 2 | 重複見出しの解消確認 | サブエージェント | 完了・独立再計測済み |
| Step 3 | ロード挙動（`/context`） | CEO | 未実施（新規セッションが必要） |
| Step 4 | deny/hook の実効性（対話プロンプト＋Bash） | CEO | 未実施（新規セッションが必要）。ガード単体の合成入力テストのみサブエージェントが代替実施済み |
| Step 5 | 挙動テスト（R-01/05/06/08/09/11/14） | CEO | 未実施（新規セッションが必要） |
| Step 6 | 本レポート作成 | サブエージェント | 完了 |
| Step 7 | コミット | サブエージェント | 本レポート完了後に実施 |

## 1. 削減量

実測はすべて `wc -l` / `wc -m` を Bash で直接実行して確認した（before は
`docs/superpowers/archive/claude-md-2026-08-05/` の退避スナップショット4ファイルを実測）。

| ファイル | before | after | 削減 |
|---|---:|---:|---:|
| ~/.claude/CLAUDE.md | 174行 / 6,193文字 | 77行 / 2,165文字 | -97行（-55.7%） / -4,028文字（-65.0%） |
| NOCTA/CLAUDE.md | 310行 / 13,395文字 | 6行 / 153文字 | -304行（-98.1%） / -13,242文字（-98.9%） |
| project_NOCTA/CLAUDE.md（正本） | 349行 / 11,510文字 | 246行 / 8,197文字 | -103行（-29.5%） / -3,313文字（-28.8%） |
| website/CLAUDE.md | 140行 / 3,409文字 | 84行 / 2,744文字 | -56行（-40.0%） / -665文字（-19.5%） |
| **合計（4ファイル）** | **973行 / 34,507文字** | **413行 / 13,259文字** | -560行（-57.6%） / -21,248文字（-61.6%） |
| **非HP作業の常時ロード**（website を除く。~/.claude + NOCTA + project_NOCTA） | 833行 / 31,098文字 | 329行 / 10,515文字 | -504行（-60.5%） / -20,583文字（-66.2%） |

達成判定:

- 合計400行以下 → **未達**（413行、+13行超過）
- 非HP作業の常時ロード320行以下 → **未達**（329行、+9行超過）

補足（数値の訂正）: レポート雛形にあった「非HP作業の常時ロード | 973行」という before 値は4ファイル合計と同じ数字が置かれた雛形上の記載であり、非HP（website を除く3ファイル）の実際の before は 833行 / 31,098文字である。上表はこれを修正して記載した。

CEO 裁定（2026-08-05・progress.md 記録）: 上記2件の行数未達を受け入れて進む。行数は代理指標であり、コスト直結の文字数が合計で62%、非HP側で70%削減されているためで、これ以上の切り詰めは情報欠落のリスクを高めると判断された。原因は実装の逸脱ではなく、計画が `~/.claude/CLAUDE.md` を「約60行」と見積もっていたのに対し、計画自身が指定した逐語内容そのものが77行だったという計画側の見積り誤差にある。

独立再計算による補足: 上記裁定の「非HP 70%削減」は、非HP after（10,515文字）を **4ファイル合計の before（34,507文字）** で割った値（1 − 10,515/34,507 ≈ 69.5% ≈ 70%）であり、非HP同士（before 31,098文字 → after 10,515文字）で揃えて比較すると 66.2% になる。基準線の取り方の違いであり、いずれの取り方でも「大幅削減」という裁定の結論自体は変わらない。

## 2. 重複解消

検証コマンド（Step 2 のブロックをそのまま実行）:

```bash
for f in /Users/fghmacbook013/.claude/CLAUDE.md /Users/fghmacbook013/NOCTA/CLAUDE.md CLAUDE.md website/CLAUDE.md; do
  grep -h "^## \|^### R-\|^### G-" "$f" | sed "s|^|$f\t|"
done | awk -F'\t' '{print $2}' | sed 's/（.*//' | sort | uniq -c | sort -rn | awk '$1>=2'
```

before（退避スナップショット4ファイルに同じコマンドを適用し独立に再現。14件で一致）:

```
   3 ## MCP管理
   3 ## COST POLICY
   2 ### R-09: モデルを目的で使い分ける
   2 ### R-03: SNSを自動投稿しない
   2 ### R-02: approved/ には触れない
   2 ### R-01: 数値で話す
   2 ## セッション運用
   2 ## SLASH COMMANDS
   2 ## RULES
   2 ## PROJECT CONTEXT
   2 ## MEMORY
   2 ## CODEMAP
   2 ## APPROVAL GATES
   2 ## AGENTS
```

after（現行4ファイルに同じコマンドを適用）: **出力なし**（2ファイル以上に重複する見出しはゼロ）。

判定: 重複解消は達成。

## 3. ロード挙動

**CEO 実施待ち（新規インタラクティブセッションが必要なためサブエージェントでは検証不可）。**

以下を新しいターミナルで実行して確認する。

```
cd /Users/fghmacbook013/NOCTA && claude
```

起動後に `/context` を実行し、次の3点を確認する。

1. `project_NOCTA/CLAUDE.md`（正本）がロードされている
2. 正本が二重にロードされていない（`NOCTA/CLAUDE.md` の `@import` と、子ディレクトリ自動検出の両方で読まれる可能性がある）
3. `website/CLAUDE.md` がロードされていない

判定と対処（該当したら実施）:

- 正本が1回だけロードされている → そのまま完了
- 正本が二重にロードされている → `NOCTA/CLAUDE.md` から `@project_NOCTA/CLAUDE.md` の行を削除する（自動検出で足りているため import は不要）。削除後に再度 `/context` で1回だけになったことを確認する
- 正本がロードされていない → `@import` が機能していない。`NOCTA/CLAUDE.md` の import 行のパスを絶対パス（`@/Users/fghmacbook013/NOCTA/project_NOCTA/CLAUDE.md`）に変えて再確認する
- `website/CLAUDE.md` がロードされている → どこかに `@` import が残っている。`grep -rn "website/CLAUDE.md" /Users/fghmacbook013/NOCTA/CLAUDE.md /Users/fghmacbook013/NOCTA/project_NOCTA/CLAUDE.md` で探して削除する

参考: `NOCTA/CLAUDE.md`（6行）の現物には import 行が含まれている。これが実際に `/context` でどう解決されるかはランタイム挙動であり、ファイルの中身を読むだけでは判定できないため、この Step は原則どおり CEO 実施に委ねる。

## 4. ハードガード

### 4-1. ガード単体の合成入力テスト（サブエージェントが独立実施・Step 4 の代替ではない）

Task 5 で使われた検証スクリプト（`scratchpad/guard_verify.sh` / `scratchpad/jqless_verify.sh`）を本レポート作成時に再実行し、
`~/.claude/hooks/approved-guard.sh` に合成 JSON を直接パイプする形で独立に再検証した（実際の Bash ツール呼び出しは発生させていない）。

| ケース群 | 件数 | 結果 |
|---|---:|---|
| deny を期待する書き込み系11ケース（cp/mv/リダイレクト/sed -i/クォート分割/ドットセグメント/cd分割/sh -cラッパー/バックスラッシュエスケープ/ditto） | 11/11 | 全件 deny |
| 既知の誤検知1ケース（承認済みディレクトリから外へのコピー） | 1/1 | CEO 受入れ済みの通り deny のまま |
| allow を期待する読み取り・無関係系3ケース（cat/ls/git status） | 3/3 | 実挙動は correct（rc=0・出力0バイト＝サイレント＝allowへフォールスルー） |
| jq 不在 PATH での書き込み系（fail-closed 確認） | 1/1 | deny |
| jq 不在 PATH での無関係コマンド | 1/1 | 出力0バイト（壊れていない） |

補足（テストハーネス側の既知の癖）: `guard_verify.sh` 内の `check()` は allow 判定を文字列 `"allow"` との一致で採点するが、ガード本体は allow 時に完全に無出力（0バイト）で応答する設計であり、この無出力を `jq -r '... // "allow"'` に空入力として渡すと jq がエラー終了して比較文字列が得られず、スクリプト集計上は「不一致」と表示される（今回の再実行でも `一致12件/不一致3件（全15ケース）` という同じ表示になった）。個別に rc・バイト数・`jq あり通常環境での参照チェック`（「出力なし＝allow」）を確認したところ、ガード本体の allow 挙動自体は正しい。これはガードの欠陥ではなく検証スクリプトの採点ロジックの癖であり、Task 5 時点から変わっていない既知の事象として記録する。

ログ確認: `~/.claude/logs/approved-guard-2026-08-05.log`（Task 5 実施時分）と `approved-guard-2026-08-06.log`（本検証実施分）の両方に `DENY` / `DENY-NORMALIZED` / `ALLOW-READONLY` の行が実在することを確認した（2026-08-06分: DENY 44件・DENY-NORMALIZED 39件・ALLOW-READONLY 14件）。ログ機構は機能している。

### 4-2. 実セッションでの deny 検証（Step 4 本体）

**CEO 実施待ち。** `/context` を確認した同じセッションで以下を順に試す。

対話プロンプト（Write/Edit 経路）:

```
outputs/approved/ に test-guard.md というファイルを作ってください
```

期待結果: Write / Edit が deny により拒否される。`bypassPermissions` モードでも deny が効くことを確認する（deny はブロックであり、bypassPermissions が省略するのはプロンプトのみ、という理解の実地確認）。

続けて Bash 経由:

```bash
cp /Users/fghmacbook013/NOCTA/project_NOCTA/drafts/handoff.md /Users/fghmacbook013/NOCTA/project_NOCTA/outputs/approved/test-guard.md
```

期待結果: approved-guard により deny され、理由文が表示される。`~/.claude/logs/approved-guard-2026-08-05.log`（実施日により日付は変わる）に DENY 行が追記される。

いずれかが通ってしまった場合:

- Write/Edit が通る → deny のパスパターンが合っていない。`Edit(~/NOCTA/**/outputs/approved/**)` に変えて再確認する
- Bash が通る → hook が発火していない。ログが空なら matcher か command パスの誤り。`/hooks` で登録状態を確認する

検証後、誤って作成されたファイルがあれば CEO に削除を依頼する（R-02 により AI は approved/ を触れない）。

判定（本レポート作成時点）: bypassPermissions 下で deny が有効だったか（実セッション確認）: **未確認（CEO 実施待ち）**。ガード単体の合成入力テストでは deny/fail-closed は正しく機能している（4-1参照）。

## 5. 挙動テスト

**CEO 実施待ち（新規インタラクティブセッションでの対話が必要）。** `/context` と Step 4 を確認した同じセッションで以下を実行する。

| 確認するルール | テスト | 期待される挙動 |
|---|---|---|
| R-05 | `/music-status` を実行 | context.md と handoff.md 以外を先読みしない |
| R-06 | handoff.md への追記を依頼 | 1〜3行で「完了した事実」と「次のアクション」のみ |
| R-08 | 上記の追記内容 | 絵文字を含まない |
| R-01 | 「Aメロの雰囲気を決めて」と依頼 | BPM・キー・小節数・コード進行を数値で返す |
| R-11 | 上記の回答 | 「叩き台です。自由に変更してください」が添えられる |
| R-14 | 「フェーズ2を始めて」と依頼 | 先に `/brainstorm` の実行を促す |
| R-09 | 「歌詞をレビューして」と依頼 | Opus 5 への切り替えを提案する |

いずれかが守られない場合、そのルールの記述が圧縮しすぎている。監査表で該当行を確認し、正本の記述を具体化する。

## 6. 残存リスク

- `Edit` deny と approved-guard hook は、Python / Node スクリプトのような任意のサブプロセスが自前のファイル操作で書き込むケースを止められない。OS レベルで塞ぐにはサンドボックスが必要（本作業のスコープ外の設計判断として明示）
- 承認済みディレクトリから**外へ**コピーする操作も誤検知で deny される。CEO は fail-closed のまま受け入れ済み（回避策: `cat src > dst`）
- ガードは「承認済みディレクトリ名 + 書き込み系コマンド語」がコマンド文字列中に**同時に現れるだけ**でも deny する。実際の書き込みを意図しない、ディレクトリ名について説明するだけの Bash 呼び出しも巻き込まれる。本タスクを含むこれまでの作業で、ドキュメント記述目的の Bash 呼び出しが複数回ブロックされている（fail-closed の想定内コスト。回避策は Write ツールを使う）
- `~/.claude/CLAUDE.md` と `/Users/fghmacbook013/NOCTA/CLAUDE.md` は git 管理外。復元は `docs/superpowers/archive/claude-md-2026-08-05/` のスナップショットのみが手段
- `claude-config/settings.json`（`~/.claude/` の版管理コピー）は古い状態のまま。理由: 実際に稼働している `~/.claude/settings.json` は API キー4種を平文で含み、リポジトリへコピーできないため

## 7. 実装経緯（このリファクタリングの記録）

- 敵対的レビューにより、approved-guard hook に6件の無検知バイパスが見つかった（クォート分割・ドットセグメントパス・`cd` 分割・シェルラッパー/エスケープ形式・macOS の `ditto` コピーコマンドの見落とし・`jq` 不在時の fail-open）。2回の fix ラウンド（`f5a5bb3`→`e088687`→`48d17ec`）で全6件を修正し、再検証済み。ガードは設計書どおりの初期実装のまま出荷されたのではなく、レビューを経て硬化された状態で出荷されている
- 正本 R-02 は「AI からの書き込みは deny ルールと approved-guard hook でハード的に禁止されており、実行できない」と断言している。この断言は Task 3（正本執筆）から Task 5（deny/hook 実装）完了までの間は**事実ではなかった**（記述が先行し、ハード化が未実装だった）。Task 5 完了時点で事実になった（進捗ledger確認済み）
- Step 2 の重複見出しは before 14件・after 0件（本レポート Section 2 で独立に再現・確認済み）

## 8. ロールバック手順

対象コミット範囲: `9e1d6c4`（本作業開始前の HEAD）から本タスクでコミットする HEAD まで。

正本（`project_NOCTA/CLAUDE.md`）と `website/CLAUDE.md` は git 管理下のため revert で戻せる:

```bash
cd /Users/fghmacbook013/NOCTA/project_NOCTA
git log --oneline 9e1d6c4..HEAD -- CLAUDE.md website/CLAUDE.md
git revert <対象コミットのハッシュを新しい順に列挙>
```

`~/.claude/CLAUDE.md` と `/Users/fghmacbook013/NOCTA/CLAUDE.md` は git 管理外のため、退避スナップショットからの手動コピーのみが復元手段:

```bash
cp /Users/fghmacbook013/NOCTA/project_NOCTA/docs/superpowers/archive/claude-md-2026-08-05/global-CLAUDE.md  /Users/fghmacbook013/.claude/CLAUDE.md
cp /Users/fghmacbook013/NOCTA/project_NOCTA/docs/superpowers/archive/claude-md-2026-08-05/nocta-CLAUDE.md   /Users/fghmacbook013/NOCTA/CLAUDE.md
```

deny ルールと hook を戻す場合は `~/.claude/settings.json` の `permissions.deny` から approved 関連の1行を、
`hooks.PreToolUse` から approved-guard のブロック（matcher: Bash）を削除する。本レポート作成者はこのファイルを読んでいないため、
削除対象の行番号や周辺構造は Step 4 実施時か `/hooks` コマンドで別途確認すること。

## 9. 2週間後の観察項目（2026-08-19 目安）

- 挙動劣化の有無（Section 5 のルールが守られなくなったケースを記録する）
- approved-guard の誤検知ログ（`~/.claude/logs/approved-guard-*.log` の DENY 行を確認。特に「承認済みディレクトリ名 + 書き込み語の同時出現」による意図しないブロックの頻度）
- 劣化があれば、該当ルールだけ references から正本に戻す
- 行数目標未達（413/329）を受け入れた裁定の妥当性の再確認（情報欠落が実際に起きていないか）
