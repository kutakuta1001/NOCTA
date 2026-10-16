# Tools 紹介ページの文言監査 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 紹介ページとカード説明文を含むコミットのたびに、文言の監査（機械チェック + 読むレビュー役）を自動で走らせる。結果と直した版を CEO に見せてからコミットする流れを作り、既存ページに一度かけて修正前後を CEO に見せる。

**Architecture:**
- ルールの正本は `docs/tools-page-copy.md` に置く。機械可読の設定 JSON を、ファイル内のコードブロックに持つ。
- `scripts/copy-lint.py` が、git の木（tree）から読んだ HTML と apps-data.js を検査する。
- PreToolUse hook `copy-audit-guard.py` は、ソースを `claude-config/hooks/` に置き、`~/.claude/hooks/` に配置してユーザー設定に登録する。NOCTA の `git commit` を検知し、ステージ内容の tree ハッシュに対応する監査済みの印がなければ拒否する。拒否するときは、その tree ハッシュを示して `copy-auditor` での監査を Claude に指示する。

**Tech Stack:** Python 3.9 標準ライブラリのみ（`/usr/bin/python3`）、git、Claude Code hooks（PreToolUse）、Claude Code サブエージェント定義

**Spec:** `docs/superpowers/specs/2026-10-16-tools-page-copy-audit-design.md`

**Codex レビュー（2026-10-16）:**
- 採用: C1〜C3、W1〜W7、W9、Nit。W8 は一部だけ採用（説明文の危険文字の検出）
- 見送り:
  - 書き込みの直列化と git pre-commit での再検証。1 人運用には重いため
  - `website/index.html` のカード組み立て（innerHTML）の修正。範囲外のため、CEO に別件として伝える

## Global Constraints

- 実行は `/usr/bin/python3`（3.9）。3.10 以降の構文（`match`・`X | Y` 型）は使わない。子プロセスの Python は `sys.executable` で起動する。外部パッケージは使わない
- 中心の問いは「初めて来た人が、試す前にこれを知りたいか」。迷ったら消す
- 直すのは文言だけ。`<svg` とその内部要素、`<img`、見本ブロック（class に `-mock` を含む要素）を減らさない
- 監査対象の紹介ページは、正本の一覧にあるものだけ（初期値: `website/lampnook/index.html` / `website/barside/index.html`）。アプリ本体の画面は対象外
- `apps-data.js` は、`descJa` / `descEn` の行が変わったときだけ対象
- 監査済みの印は、CEO が監査結果に OK を出したあとにだけ付ける。印は CEO に見せた tree ハッシュを指定して付け、ステージ内容がそれと違えば付かない
- CEO の OK なしに印を付けて hook を回避することは禁止
- push はしない（CEO の明示指示のときのみ）
- main の作業ツリーにある既存の変更を、確認作業で消さない（`git restore` / `git stash` を確認目的で使わない）
- `website/` の外にルールを置く（`website/` は丸ごと公開される）
- hook が失敗したら通す（fail-open）。ただし「監査を実行できなかった」と Claude に返す
- ドキュメント・コードコメントに絵文字を使わない

## Review Focus

1. **`cd /Users/.../project_NOCTA && git commit -m "..."` の形で、hook の `cwd` が親ディレクトリ（`~/NOCTA`）でも、正しいリポジトリを割り出すこと。** このセッションの普段の形。Task 2 の `test_cd_prefix_resolves_repo` で固定する
2. **コミットメッセージに `git add`・`&&`・対象のパスが入っていても誤判定しないこと。** Task 2 の `test_message_mentions_paths_not_combined` と `test_quoted_operators` で固定する
3. **NOCTA 以外のリポジトリ（English・barside-app など）での `git commit` を一切止めないこと。** Task 2 の `test_other_repo_passes` で固定する
4. **新規の紹介ページ（比較元にないファイル）では、構造の減少チェックだけを飛ばし、ほかのチェックは走ること。** Task 1 の `test_new_file_skips_visual_check` で固定する
5. **CEO 承認済みの lampnook（手本）には指摘が出ないこと。** 指摘が出るなら基準が厳しすぎ、毎回ノイズになる。Task 1 の `test_lampnook_is_clean` で固定する

---

### Task 1: ルールの正本と copy-lint

**Files:**
- Create: `docs/tools-page-copy.md`
- Create: `scripts/copy-lint.py`
- Create: `tests/copy_audit/test_copy_lint.py`
- Create: `tests/copy_audit/fixtures/barside_before.html`（`git show 633b183^:website/barside/index.html`）
- Create: `tests/copy_audit/fixtures/barside_approved.html`（`git show 000a733:website/barside/index.html`）
- Create: `tests/copy_audit/fixtures/lampnook_approved.html`（`git show 9a3ef4c:website/lampnook/index.html`）

**Interfaces:**
- Produces:
  - `load_config(text: str) -> dict`: 正本の本文から ```` ```json copy-audit-config ```` ブロックを読む
    - キー: `intro_pages: list[str]` / `card_file: str` / `banned_terms: list[str]` / `banned_heading_patterns: list[str]`（正規表現）/ `max_sentences: int` / `card_desc_max_chars: int`
  - `lint_html(text: Optional[str], base_text: Optional[str], cfg: dict, path: str) -> list`
    - `text=None` はファイル削除を表す。`base_text=None` は新規ファイルを表す
  - `lint_cards(text: str, cfg: dict) -> list`
  - `Finding = namedtuple("Finding", "kind severity location excerpt")`
    - severity は `"break"`（構造を壊す）か `"copy"`（文言）
    - break の kind: `VISUAL_LOST` / `PAGE_REMOVED`
    - copy の kind: `BANNED` / `HEADING` / `LONG` / `CARD_LONG` / `CARD_BANNED` / `CARD_UNSAFE`
  - CLI `copy-lint.py --tree TREE [--base REV] [--json] FILE...`
    - `TREE` から各 FILE を読み、`REV`（既定 `HEAD`）と比べる
    - `--json` は `{"ok": true, "tree": ..., "base": ..., "findings": [{kind, severity, location, excerpt}...]}` を stdout に出し、終了コードは常に 0
    - `--json` なしは `severity\tkind\tlocation\texcerpt` を 1 行 1 件で出す。終了コードは 0
    - 引数の誤りや例外は終了コード 3 と stderr
  - CLI `copy-lint.py --export TREE OUTDIR FILE...`: 各 FILE を `TREE` から `OUTDIR/<FILE>` に書き出す。レビュー役が「印を付ける版」と同じものを読むため
  - CLI `copy-lint.py --mark TREE`
    - `git write-tree` が `TREE` と同じときだけ、`<git rev-parse --git-common-dir>/copy-audit/<TREE>` を作ってパスを出す
    - 違えば終了コード 4 と「ステージ内容が変わったため再監査が必要」
  - 正本 `docs/tools-page-copy.md` と設定は、`TREE` の中の版を読む（ステージ内容と同じスナップショット）

- [ ] **Step 1: 正本 `docs/tools-page-copy.md` を書く**

  中身:
  - 設計書 第 3 節の基準（文章）
  - 紹介ページの定義と、一覧に足す運用
  - 2026-10-16 の Barside の事例。English 側メモの「最後に残ったもの」と、CEO が消した項目の一覧
  - 印の運用（CEO の OK のあとだけ、見せた tree を指定）
  - 設定ブロック:

```json copy-audit-config
{
  "intro_pages": ["website/lampnook/index.html", "website/barside/index.html"],
  "card_file": "website/apps-data.js",
  "banned_terms": ["Tailscale", "Funnel", "sql.js", "SQLite", "FSRS", "three.js", "IndexedDB", "PWA", "Gemini", "接続トークン", "作者専用", "作者の Mac", "作者用の入口", "使い方（作者用）", "灯りを確かめ"],
  "banned_heading_patterns": ["この(春|夏|秋|冬)", "増えたもの", "新しく", "アップデート", "更新履歴", "What's new"],
  "max_sentences": 3,
  "card_desc_max_chars": 60
}
```

  - `max_sentences` は 3 にする。CEO 承認済みの Barside のリード文が 3 文のため。正本の文章では「1〜2 文が目安」と書く
  - Claude / ElevenLabs は禁止語にしない。「API キーを自分で用意する」という、使うかどうかの判断に要る情報として承認済みページに残っているため
  - `card_desc_max_chars` は `descJa` にだけ適用する

- [ ] **Step 2: 失敗するテストを書く（`tests/copy_audit/test_copy_lint.py`、unittest）**

  - `test_before_flags_tech_and_author`: `barside_before` に `lint_html` をかけると、次が出る
    - kind `BANNED` で excerpt に `Tailscale` / `FSRS` / `作者の Mac` を含むもの
    - kind `HEADING` で `この秋、店に増えたもの。` を含むもの
    - kind `LONG` が 1 件以上
  - `test_approved_barside_known_finding`: `barside_approved`（base=自身）で、`BANNED`「作者専用」（meta description）が出る。ほかの kind は出ない
  - `test_lampnook_is_clean`: `lampnook_approved`（base=自身）で 0 件
  - `test_svg_removed_is_lost` / `test_svg_emptied_is_lost` / `test_img_removed_is_lost` / `test_mock_removed_is_lost`: 次の 4 つの改変を、base=元の版で検査すると `VISUAL_LOST`（severity break）が出る
    - 最初の `<svg …</svg>` を 1 つ除く
    - 中身を空にする
    - `<img>` を 1 つ除く
    - `class="board-mock"` の要素を除く
  - `test_page_removed`: `lint_html(None, fixture, ...)` で `PAGE_REMOVED`
  - `test_new_file_skips_visual_check`: base=None なら `VISUAL_LOST` は出ず、`BANNED` は出る
  - `test_svg_script_not_scanned`: `<svg><text>FSRS</text></svg><script>Tailscale</script>` では `BANNED` が出ない
  - `test_meta_and_div_text_scanned`: 次の 2 つで `BANNED` が出る
    - `<meta name="description" content="作者専用の…">`
    - `<div class="cat-note">作者<span>専用</span></div>`（インライン要素をまたいで結合する）
  - `test_sentences_per_paragraph`: 文の数は `p` / `dd` と、文字を直接持つ `div` を単位に数える。親子で重ねて数えない
    - `<li><p>一文。二文。</p><p>三文。四文。</p></li>` は `LONG` 0 件
    - `<p>一。二。三。四。</p>` は 1 件
  - `test_cards`: 次がそれぞれ出る
    - `descJa: "` + 61 字 + `"` で `CARD_LONG`
    - `descEn: "uses IndexedDB"` で `CARD_BANNED`
    - `descJa: "a<b"` で `CARD_UNSAFE`（`<` `&` と、エスケープされた `\"` を対象にする）
  - `test_cli_json_and_mark`: 一時 git リポジトリで次を確かめる
    - `--json` の `ok` が true で、終了コードは 0
    - `--mark <今の write-tree>` は印を作る
    - ステージを変えたあとの `--mark <古い tree>` は終了コード 4
    - 不正な引数は終了コード 3

- [ ] **Step 3: 失敗を確かめる**

  Run: `/usr/bin/python3 -m unittest discover -s tests/copy_audit -v`
  Expected: FAIL（`scripts/copy-lint.py` がない）

- [ ] **Step 4: `scripts/copy-lint.py` を実装する**

  - テストからは、ファイルパスを指定して `importlib` で読み込む
  - `html.parser` を使い、`svg` / `script` / `style` の中は文字として扱わない
  - 禁止語の検査は、次をまとめた全文を対象にする（ブロック要素単位で連結）
    - 見える文字すべて
    - `<title>`
    - `<meta name="description">` の content
    - `aria-label`
  - 見出しの検査は `h1`〜`h3`
  - 構造の数え方:
    - `svg` 要素の数と、svg 内部の要素数（全タグ）
    - `img` の数
    - class に `-mock` を含む開始タグの数
  - いずれかが base より減れば `VISUAL_LOST`
  - location は `p#3` / `div.cat-note` のように、要素名と出現順にする

- [ ] **Step 5: テストが通ることを確かめる**

  Run: `/usr/bin/python3 -m unittest discover -s tests/copy_audit -v`
  Expected: 全 PASS

- [ ] **Step 6: Commit**

```bash
git add docs/tools-page-copy.md scripts/copy-lint.py tests/copy_audit/test_copy_lint.py tests/copy_audit/fixtures/barside_before.html tests/copy_audit/fixtures/barside_approved.html tests/copy_audit/fixtures/lampnook_approved.html
git commit -m "feat(copy-audit): 紹介ページの文言ルールの正本と copy-lint を追加"
```

### Task 2: PreToolUse hook `copy-audit-guard.py`

**Files:**
- Create: `claude-config/hooks/copy-audit-guard.py`（ソースはここ。live への配置は Task 3）
- Create: `tests/copy_audit/test_guard.py`

**Interfaces:**
- Consumes: Task 1 の CLI（`--json` / `--mark` / `--export`）と終了コード
- Produces:
  - 純粋関数 `decide(command: str, cwd: str, probe) -> Optional[dict]`
    - `probe` は git の照会をまとめたオブジェクトで、テストで差し替えられる
    - 返り値は hook の出力 JSON。何もしないときは `None`
  - `main()`: stdin の JSON（`tool_input.command` / `cwd`）を読んで `decide` を呼ぶ
  - 拒否: `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"..."}}`
  - 通すが伝える: `{"hookSpecificOutput":{"hookEventName":"PreToolUse","additionalContext":"..."}}`
  - ログ先は環境変数 `COPY_AUDIT_LOG_DIR`、既定は `~/.claude/logs`
  - lint の場所は、割り出したリポジトリの `scripts/copy-lint.py`

- [ ] **Step 1: 失敗するテストを書く（`tests/copy_audit/test_guard.py`）**

  準備:
  - hook は `Path(__file__).resolve().parents[2] / "claude-config/hooks/copy-audit-guard.py"` を `sys.executable` で起動する
  - `COPY_AUDIT_LOG_DIR` は一時ディレクトリにする
  - 各テストは一時ディレクトリに git リポジトリを作り、初回コミットする。置くものは次のとおり
    - 本物の正本と `scripts/copy-lint.py`
    - `website/barside/index.html`（`barside_approved`）
    - `website/apps-data.js`（2 件の小さな版）
    - `website/iro/index.html`

  ケース:
  - `test_intro_page_without_mark_denied`: barside の文言を変えて add し、`git commit -m x` を渡すと deny。reason に次を含む
    - lint の結果
    - `copy-auditor`
    - その時点の `git write-tree` の値
    - `--export` と `--mark <tree>` の手順
  - `test_intro_page_with_mark_passes`: `copy-lint.py --mark <tree>` のあとは、出力なしで exit 0
  - `test_edit_after_mark_denied_again`: mark のあとにもう一度変えて add すると deny
  - `test_app_page_passes`: `website/iro/index.html` だけを変えたら出力なし
  - `test_card_url_only_passes`: apps-data.js の `url` 行だけの変更は通る
  - `test_card_desc_denied`: `descJa` 行の変更は deny
  - `test_new_card_with_desc_denied_with_notice`: `url: "./newtool/index.html"` と `descJa` / `descEn` を持つ項目を足すと deny。reason に「一覧に足すか」と `newtool` を含む
  - `test_new_card_url_notice_only`: 既存項目の `url` を `./newtool/index.html` に変えただけなら、deny せず `additionalContext` に `newtool` を含む
  - `test_combined_add_commit_denied`: 次の 2 つはどちらも deny。reason に「別々」を含む
    - `git add website/barside/index.html && git commit -m x`
    - 改行区切りの同じコマンド
  - `test_pathspec_commit_denied`: barside を未ステージのまま変更した状態で、次の 3 つは deny（「add してから通常の git commit」）
    - `git commit -m x -- website/barside/index.html`
    - `git commit -am x`
    - `git commit -o website/barside/index.html -m x`
  - `test_message_mentions_paths_not_combined`: 対象外のファイルだけをステージし、`git commit -m "website/barside/index.html と git add の話"` は通る
  - `test_quoted_operators`: 対象外だけをステージし、`git commit -m "a && git add website/barside/index.html"` は通る
  - `test_cd_prefix_resolves_repo`: `cwd` をリポジトリの親にし、`cd <repo> && git commit -m x` で deny（紹介ページの変更あり）
  - `test_git_C_resolves_repo`: `git -C <repo> commit -m x` でも deny
  - `test_add_in_other_repo_not_combined`: `git -C <other> add website/barside/index.html; git -C <repo> commit -m x` は「別々」の deny にならない（対象外だけをステージした repo なら通る）
  - `test_or_chain_ambiguous_fail_open`: `cd a || cd b; git commit -m x` は deny せず、`additionalContext` に「監査を実行できなかった」を含む
  - `test_other_repo_passes`: 正本のないリポジトリでは出力なし
  - `test_non_commit_passes`: `git status` は出力なし
  - `test_lint_crash_fail_open`: 一時リポジトリの `scripts/copy-lint.py` を壊すと、deny せず `additionalContext` に「監査を実行できなかった」を含む

- [ ] **Step 2: 失敗を確かめる**

  Run: `/usr/bin/python3 -m unittest tests.copy_audit.test_guard -v`
  Expected: FAIL（hook がない）

- [ ] **Step 3: `claude-config/hooks/copy-audit-guard.py` を実装する**

  - コマンドの解析: `shlex.shlex(posix=True, punctuation_chars=True)` で引用を保ったまま字句に分ける
    - 区切りは `&&` / `;` / 改行
    - `||` と `|` を含むコマンドで `git commit` があるときは、判定不能として fail-open で通知する
  - 単位ごとに `cd X` を追って作業ディレクトリを決める。`git -C X` も解釈する
  - サブコマンドが `commit` の単位があるときだけ反応する。リポジトリは `git -C <dir> rev-parse --show-toplevel` で割り出す
  - 正本 `docs/tools-page-copy.md` がそのリポジトリになければ通す
  - 次の場合は「対象を個別に `git add` してから、通常の `git commit` を別の Bash で実行して」と deny する
    - commit の引数に pathspec（`--` 以降、またはオプション以外の引数）か、`-a` / `--all` / `-o` / `--only` / `-i` / `--include` / `-p` / `--patch` / `--interactive` があり、かつ作業ツリーかステージに対象ファイルの変更がある
    - `-m` / `-F` / `-C` / `-c` / `--author` / `--date` などの値は、引数として扱わない
  - 同じリポジトリに向けた `git add` の単位が同じコマンド内にあり、その引数に次のどれかがあれば「別々」で deny する
    - 一覧のページか `card_file`
    - `-A` / `--all` / `.`
    - それらを含むディレクトリ
  - 対象の判定には次を使う
    - `git diff --cached --name-status`（削除の `D` も拾う）
    - `git diff --cached -U0 -- <card_file>`
  - `card_file` は、`+` / `-` 行に `descJa:` / `descEn:` を含むときだけ対象にする
  - 新規カードの通知: `+` 行に `url: "./X/index.html"` があり、`website/X/index.html` が一覧にないとき
    - 説明文も監査対象なら、deny の reason に通知を加える
    - そうでなければ `additionalContext` で伝える
  - 印: `TREE = git write-tree`。`<git-common-dir>/copy-audit/<TREE>` があれば通す
  - 印がなければ `sys.executable copy-lint.py --tree TREE --json <対象>` を timeout 10 秒で実行する
    - 結果は、出力の長さを 2000 字までに切ってから deny の reason に入れる
    - reason には次の手順（日本語）を含める
      1. lint の結果
      2. `python3 scripts/copy-lint.py --export TREE <一時ディレクトリ> <対象>` で書き出した版を、`copy-auditor` に渡して監査する
      3. 「消す / 短くする / 残す」の一覧（10 行程度）と直した版を CEO に見せる。直すのは文言だけで、SVG に触れない
      4. 直したら add し直す。その場合は tree が変わるので、もう一度この hook に通す
      5. CEO の OK のあとにだけ `python3 scripts/copy-lint.py --mark <TREE>` を実行し、再コミットする
  - git 呼び出しを含めた全体の時間予算は 20 秒（登録時の timeout は 30 秒）
  - 例外・timeout・lint の異常（終了コード 0 以外、JSON の `ok` が false、JSON の崩れ）は fail-open にし、「監査を実行できなかった」を `additionalContext` で返す
  - ログは `COPY_AUDIT_LOG_DIR/copy-audit-guard-YYYY-MM-DD.log` に 1 行ずつ書く

- [ ] **Step 4: テストが通ることを確かめる**

  Run: `/usr/bin/python3 -m unittest discover -s tests/copy_audit -v`
  Expected: 全 PASS

- [ ] **Step 5: Commit**

```bash
git add claude-config/hooks/copy-audit-guard.py tests/copy_audit/test_guard.py
git commit -m "feat(copy-audit): コミット時に文言監査を求める hook を追加"
```

### Task 3: レビュー役 `copy-auditor`・hook の配置と登録・ルールの配線

**Files:**
- Create: `claude-config/agents/copy-auditor.md`。live（`~/.claude/agents/`）へは `cp` で配置する（`sync-from-live.sh` は使わない）
- Create（配置）: `~/.claude/hooks/copy-audit-guard.py`（`claude-config/hooks/` から `cp`）
- Modify: `~/.claude/settings.json`（`hooks.PreToolUse` の Bash matcher に 1 件を追加する。`update-config` スキルの手順で行う）
- Modify: `CLAUDE.md`
  - R-02 の直後に R-02b を足す。印は CEO の OK のあとだけ付け、hook を回避しない旨を 1〜2 行
  - 正本へのポインタを 1 行
- Modify: `website/CLAUDE.md`
  - 「紹介ページの文言は `docs/tools-page-copy.md`。コミット時に copy-audit-guard が監査を求める」を 1 行
- Modify: `~/.claude/projects/-Users-fghmacbook013-english/memory/nocta-intro-page-copy.md`
  - 本文を、正本へのポインタと要点 3 行に置き換える

**Interfaces:**
- Consumes: 正本と、copy-lint の `--export` で書き出した版
- Produces: エージェント `copy-auditor`
  - frontmatter: `tools: Read, Grep` / `model: opus`
  - 入力: 書き出した対象ファイルのパスと lint の結果
  - 出力: 次の形の表と、最後に 1 行の要約

  ```
  | 場所 | 今の文言（冒頭 30 字） | 判定（消す/短くする/残す） | 理由（1 文） | 置き換え後（短くするときだけ） |
  ```

- [ ] **Step 1: `copy-auditor.md` を書く**

  - 毎回、正本・`website/lampnook/index.html`・対象ファイルを Read する
  - 判定の順序: SVG・見本には触れない → 中心の問い → 書かないもの → 項目数（迷ったら少なく）
  - 言い換えで長さを保つ案は出さない
  - lampnook 自体を監査して指摘が出たら「基準の側を疑う」と注記する
  - カード説明文として渡されたときは、1 枚のカードで「何のアプリか」が分かる最短の形を出す

- [ ] **Step 2: hook を配置して登録する**

  - `cp claude-config/hooks/copy-audit-guard.py ~/.claude/hooks/`
  - `cp claude-config/agents/copy-auditor.md ~/.claude/agents/`
  - approved-guard と同じ Bash matcher のリストに、次を追加する

  ```json
  {"type":"command","command":"/usr/bin/python3 \"$HOME/.claude/hooks/copy-audit-guard.py\"","timeout":30,"statusMessage":"copy-audit-guard 検査中"}
  ```

  - `/usr/bin/python3 -m json.tool ~/.claude/settings.json > /dev/null` が通ることを確かめる

- [ ] **Step 3: 受け入れの確認（実物で）**

  - fixture を `copy-lint` にかける
    - Expected: `Tailscale` と `作者の Mac` が出る
  - `copy-auditor` に `barside_before` を渡す
    - Expected: CEO が実際に消した項目の大半が「消す」と判定される。項目は次のとおり
      - 聞き返していい・旅先のバー・夜を数える
      - 相手の言葉・相手の声・画面
      - 仕組みの注記
    - 外れたものは、正本の事例欄と基準に戻す

- [ ] **Step 4: 実地確認（専用の worktree で）**

  - `../NOCTA-copy-audit-check` が存在しないことを確かめてから、`git worktree add --detach ../NOCTA-copy-audit-check HEAD`
  - その中で barside に 1 文字足して add し、`git -C ../NOCTA-copy-audit-check commit --dry-run -m test` を Bash で試す
    - Expected: hook が deny する
  - `git worktree remove --force ../NOCTA-copy-audit-check` で片付ける。main の作業ツリーには触れない

- [ ] **Step 5: Commit**

```bash
git add claude-config/agents/copy-auditor.md CLAUDE.md website/CLAUDE.md
git commit -m "feat(copy-audit): 文言レビュー役と運用ルールを追加"
```

### Task 4: 既存ページへの一回目の監査と、修正前後の提示

**Files:**
- Create: `drafts/copy-audit-2026-10/report.html` と、スクリーンショットの png。どちらも git に入れない
- Modify（ブランチの作業ツリーだけ・コミットしない）: `website/lampnook/index.html` / `website/barside/index.html` / `website/apps-data.js`

- [ ] **Step 1:** main がきれいなことを確かめてから、ブランチ `copy-audit/2026-10` を main から切る
- [ ] **Step 2:** 監査をかける
  - lampnook と barside に `copy-lint --tree $(git write-tree)` と `copy-auditor` をかける
  - `apps-data.js` の 11 件の `descJa` / `descEn` を、まとめて `copy-auditor` に渡す。入力に「カード説明文として」と明記する
- [ ] **Step 3:** 直した版を、Edit の文字列置換だけで作業ツリーに反映する。そのあと次を確かめる
  - `git add -N` を使わず、一時 index で `copy-lint` をかけて `VISUAL_LOST` が出ない
  - `node --check website/apps-data.js` が通る
- [ ] **Step 4:** スクリーンショットを撮る
  - 修正前: 本番（`https://kutakuta1001.github.io/NOCTA/...`）から撮る
  - 修正後: `/usr/bin/python3 -m http.server 8765 --bind 127.0.0.1 --directory website` で出して撮る
  - それぞれ 320px / 1280px。使うのは Chrome for Testing の headless で、320px は iframe に入れて撮る
  - 修正後には Tools 一覧（`index.html#apps`）も撮る
- [ ] **Step 5:** `report.html` を作り、`open` で CEO に開いて見せる
  - ページごと・カードごとに、監査の一覧・文言の修正前と修正後・スクリーンショットの前後を並べる
  - 文言は `html.escape` を通す
- [ ] **Step 6:** 結果を CEO に伝え、項目ごとの採否を聞いてここで止める
  - 採否の反映、正本への追記、印、コミットは、CEO の回答のあとで行う
  - handoff.md への 1 行の追記は、main 側でコミットする
