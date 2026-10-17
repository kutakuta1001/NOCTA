# Tools コレクション分類 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** HP の Tools 欄に 3 コレクション（NuWord / HiNa / Yori）の表紙と絞り込みを足し、今後のカード追加で分類が抜けたらコミット時に止める。

**Architecture:** コレクション定義 `NOCTA_APP_COLLECTIONS` と各カードの `collection` を `website/apps-data.js` に置き、ページ（表紙・絞り込み・バッジ）とチェック（copy-lint の `--collections` を copy-audit-guard が呼ぶ）の両方がここを正とする。ルールは `docs/tools-collections.md` に書き、`website/CLAUDE.md` から参照する。

**Tech Stack:** 素の JS + Tailwind CDN（`website/index.html`）、Python 3 標準ライブラリ（copy-lint / hook）、unittest。

**Spec:** `docs/superpowers/specs/2026-10-17-tools-collections-design.md`

## Global Constraints

- 今のカード（サムネイル・大きさ・3 列グリッド・余白・ホバー）を変えない。変えるのはバッジの文字と色だけ
- 表紙はカードより明らかに軽い見た目にし、PC で表紙を置いてもカードの 1 段目が見え始める高さに収める
- 動詞: 内省する / 集める / 学ぶ（英: Reflect / Collect / Learn）。表紙の並び順は NuWord → HiNa → Yori
- 色は確定パレット（シルバー #B8B4AE × オフホワイト #E8E0D0）に寄せたごく薄い 3 色
- Yori の名前の由来はサイト・文書・コメントのどこにも書かない
- パスは相対パス。スマホは横 16px 余白・横スクロールなし・表紙は横 3 枚のまま
- `git add` は個別指定。push しない。`drafts/copy-audit-2026-10/` と `handoff.md` の既存の変更はこのセッションのものではないので add しない
- テスト実行: `/usr/bin/python3 -m unittest discover -s tests/copy_audit -v`（`project_NOCTA/` で）

## Review Focus

1. `collection` のないカードが混ざったとき: ページは「すべて」で表示しバッジ "App"、コミットは止まる → Task 1 / Task 2 / Task 4 の確認に入れる
2. `#apps-hina` 付き URL で直接開いたとき: 絞り込まれた状態で `#apps` に着地する → Task 4 の確認に入れる
3. 英語に切り替えたあと絞り込み・モーダルを開いたとき: 表紙・バッジ・モーダルが英語のまま → Task 4 の確認に入れる
4. `apps-data.js` の `/* strategy-name:start */` の目印コメント: 分類の読み取りが壊れない → Task 1 のテストに入れる
5. `apps-data.js` を触らないコミット: 分類チェックが走らず、今まで通る → Task 2 のテストに入れる

---

### Task 1: copy-lint に分類の検査を足す

**Files:**
- Modify: `scripts/copy-lint.py`（`lint_cards` の近くに関数を追加、`main` に `--collections`）
- Test: `tests/copy_audit/test_copy_lint.py`

**Interfaces:**
- Produces: `lint_collections(text: str) -> list[Finding]`。`Finding.kind` は `COLLECTION_MISSING`（カードに `collection` がない）/ `COLLECTION_UNKNOWN`（定義にない値）。`location` はカードの `title`。`NOCTA_APP_COLLECTIONS` または `NOCTA_APPS` が見つからない・`key` が 1 つも取れないときは `LintError` を投げる
- Produces: CLI `copy-lint.py --collections --tree TREE` — tree の `card_file` を読み、`{"ok": true, "tree": TREE, "findings": [...]}` を出して終了コード 0。読めなければ終了コード 3（既存の LintError の扱い）

- [ ] **Step 1: 失敗するテストを書く**（`LintCollectionsTest`）
  - `test_all_classified`: 定義 3 件（nuword / hina / yori）とそれぞれを持つカード 3 枚 → `[]`
  - `test_missing`: `collection` のないカード "X" → kind `COLLECTION_MISSING`、location "X"
  - `test_unknown`: `collection: "music"` → `COLLECTION_UNKNOWN`、excerpt に `nuword` / `hina` / `yori` を含む
  - `test_strategy_marker`: `title: /* strategy-name:start */ "HiNa Kai" /* strategy-name:end */,` の行を持つカードが location "HiNa Kai" で正しく検査される
  - `test_collection_titles_not_cards`: `NOCTA_APP_COLLECTIONS` 内の `title` / `descJa` は カードとして数えない
  - `test_unreadable`: `NOCTA_APP_COLLECTIONS` がない文字列 → `LintError`
  - `test_cli_collections`: 既存の `make_repo` に分類なしカードの `website/apps-data.js` を足してコミットし、`--collections --tree <tree> ` の JSON に `COLLECTION_MISSING` があり終了コード 0。定義のない apps-data.js では終了コード 3

- [ ] **Step 2: テストを実行して失敗を確かめる** — Expected: `lint_collections` がなく FAIL

- [ ] **Step 3: 実装する**
  - `const NOCTA_APP_COLLECTIONS = [` から次の `];` までを定義ブロック、`const NOCTA_APPS = [` から `];` までをカードブロックとして切り出す（行単位）
  - 定義ブロックから `key\s*:\s*"([a-z]+)"` を集める
  - カードブロックは既存の `TITLE_RE` に当たる行で新しいカードを始め、`collection\s*:\s*"([^"]*)"` を拾う。カードの終わりで判定する
  - `main` に `--collections`（store_true）を足し、`--tree` 必須。`load_config` で `card_file` を得て `_show(tree, card_file)` を検査する

- [ ] **Step 4: テストを実行して通るのを確かめる** — Expected: 全テスト PASS（既存含む）

- [ ] **Step 5: Commit**（spec と plan もここで入れる）
```bash
git add scripts/copy-lint.py tests/copy_audit/test_copy_lint.py docs/superpowers/specs/2026-10-17-tools-collections-design.md docs/superpowers/plans/2026-10-17-tools-collections.md
git commit -m "feat(tools): copy-lint に Tools カードの分類（collection）の検査を足す"
```

### Task 2: copy-audit-guard で分類が抜けたコミットを止める

**Files:**
- Modify: `claude-config/hooks/copy-audit-guard.py`（`decide_commit`、docstring）
- Test: `tests/copy_audit/test_guard.py`
- 配置: `~/.claude/hooks/copy-audit-guard.py` へ cp

**Interfaces:**
- Consumes: Task 1 の `copy-lint.py --collections --tree TREE`
- Produces: `card_staged(repo, cfg) -> bool`（`git diff --cached --name-only --no-renames` に `cfg["card_file"]` があるか）、`collection_check(repo, tree) -> dict | None`（問題がなければ None、あれば deny の出力）

- [ ] **Step 1: テストの fixture を直す** — `CARDS` を `NOCTA_APP_COLLECTIONS`（nuword / hina / yori）と、各カードに `collection` を持つ形にする。既存テストがすべて今まで通り通ることを先に確かめる（この時点ではまだ hook は変えていない）。既存テストで新しいカードを足しているもの（`test_new_card_with_desc_denied_with_notice` / `test_new_card_url_notice_only` など）は、足すカードに `collection` を付けておく。付けないと、文言監査や通知の確認より先に分類の検査で止まってしまう

- [ ] **Step 2: 失敗するテストを書く**
  - `test_card_without_collection_denied`: `collection` 行を消したカードの変更だけ（`descJa` は触らない）→ deny。理由に `COLLECTION_MISSING`、カード名、`docs/tools-collections.md` を含む
  - `test_unknown_collection_denied_even_if_marked`: `collection: "music"` に変えて `mark()` しても deny
  - `test_card_url_only_passes`（既存）: 分類が正しければ今まで通り None
  - `test_unreadable_cards_fail_closed`: `NOCTA_APP_COLLECTIONS` を消した apps-data.js をステージ → deny（fail-open の context ではない）
  - `test_other_file_skips_collection_check`: `notes.txt` だけのコミットは None

- [ ] **Step 3: 実装する**
  - `decide_commit` で、pathspec / add 連結の判定のあと、`staged_targets` より前に `card_staged` なら `git write-tree` して `collection_check` を呼ぶ。問題があれば監査の印に関係なく deny を返す
  - `collection_check` は copy-lint の終了コードが 0 以外・JSON が不正・タイムアウトのいずれでも deny を返す（fail-closed）。理由の文: どのカードか、使える値、「`docs/tools-collections.md` を読んで `collection` を書いてから再コミット」
  - docstring の「動き」に 1 行足す

- [ ] **Step 4: テストを実行して通るのを確かめる** — Expected: 全テスト PASS

- [ ] **Step 5: 配置して Commit**
```bash
cp claude-config/hooks/copy-audit-guard.py ~/.claude/hooks/copy-audit-guard.py
git add claude-config/hooks/copy-audit-guard.py tests/copy_audit/test_guard.py
git commit -m "feat(tools): Tools カードの分類が抜けたコミットを copy-audit-guard で止める"
```
（この時点の本物の `website/apps-data.js` は未変更なので、このコミットは止まらない）

### Task 3: apps-data.js に分類を入れる

**Files:**
- Modify: `website/apps-data.js`

**Interfaces:**
- Produces: `NOCTA_APP_COLLECTIONS: Array<{key, title, label, verbJa, verbEn, descJa, descEn, accent, badgeClass, pageUrl}>`（`NOCTA_APPS` より前に置く）。各カードに `collection: "nuword" | "hina" | "yori"`
  - `title` は "NuWord Collection" 等（lint の位置表示に使われる）、`label` はバッジ用の短い名前 "NuWord" / "HiNa" / "Yori"
  - `descJa` / `descEn` は表紙の説明 1 行。キー名をカードとそろえ、既存の文言監査を効かせる
  - `accent` は表紙の色（hex）、`badgeClass` は Tailwind の任意値クラス（例 `bg-[#D8C9A8]/15 text-[#D8C9A8]`）
  - `pageUrl`: nuword `https://nuword-nu.vercel.app`、hina `./hina/`、yori `""`

- [ ] **Step 1: 定義を書く**。叩き台の値（CEO が文言監査で直す前提）:

| key | verbJa / verbEn | descJa | descEn | accent |
|---|---|---|---|---|
| nuword | 内省する / Reflect | 心を静め、日々の気づきを点から線へ結んでいく。 | Quiet the mind, and connect each day's small noticings into lines. | #D8C9A8 |
| hina | 集める / Collect | 石や花、世界の国々。いろいろな見方を集めて眺める。 | Stones, flowers, countries of the world. Collect ways of seeing. | #B9C4B1 |
| yori | 学ぶ / Learn | 好きなことを入り口に、英語や集中を深めていく。 | Start from what you enjoy, and go deeper into English, focus and more. | #B3BCCB |

- [ ] **Step 2: 13 枚に `collection` を付ける** — NuWord before / still / Seed / Verse / Inner Canvas → nuword、HiNa Mado / Kai / Kihi / Hare / Ichi / Gyu → hina、lampnook / Barside → yori。`badge` と `badgeColorClass` はカードから消す（ページがコレクションから決める）。`descJa` / `descEn` の行は 1 文字も変えない。`strategy-name` の目印コメントは残す

- [ ] **Step 3: 冒頭のコメントを書き直す** — 項目一覧に `collection`（必須・`docs/tools-collections.md` を読む）を足し、`badge` / `badgeColorClass` を消す。`NOCTA_APP_COLLECTIONS` の項目も 1 行ずつ

- [ ] **Step 4: 検査する**
  Run: `/usr/bin/python3 -c "import importlib.util as u;s=u.spec_from_file_location('l','scripts/copy-lint.py');m=u.module_from_spec(s);s.loader.exec_module(m);print(m.lint_collections(open('website/apps-data.js',encoding='utf-8').read()))"` と `node --check website/apps-data.js`
  Expected: `[]`、構文エラーなし

（コミットは Task 6。`descJa` の行が増えるので文言監査を通す必要がある）

### Task 4: index.html に表紙・絞り込み・バッジを入れる

**Files:**
- Modify: `website/index.html`（`#apps` セクション 935-956 行付近、Apps レンダリング 1556-1616 行付近、`openApp` 1727 行付近、I18N 辞書の `tools.hina` / `tools.nuword`）

**Interfaces:**
- Consumes: Task 3 の `NOCTA_APP_COLLECTIONS` と `collection`
- Produces: `<div id="apps-collections">`（表紙 3 枚）、各カードに `data-collection="<key>"`

- [ ] **Step 1: デザインの下準備** — `frontend-design:frontend-design` を呼ぶ（website/CLAUDE.md のコンテキストを渡す）。`~/designer/INDEX.md` を読み、該当パターン（フィルタチップ・セグメント・カテゴリ表紙など）があればレシピを適用し used_in に `{project: NOCTA, date: 2026-10-17}` を記録する

- [ ] **Step 2: 見出し下を差し替える** — 「HiNa コレクション →」「NuWord コレクション →」の 2 ボタンと辞書の `tools.hina` / `tools.nuword`（日英）を消し、空の `#apps-collections` を置く

- [ ] **Step 3: 表紙を描画する**
  - 各表紙は `<button type="button" aria-pressed="false" data-collection="<key>">`。中身: 動詞（小・字間広め・`accent` 色）、`label`、`descJa`（`data-desc-ja` / `data-desc-en` を付けて既存の `setLang` に切り替えさせる。動詞も同じ方式）、ツールの数（`NOCTA_APPS` から数える）
  - 選択中の表紙だけに「コレクションのページへ →」（`pageUrl` があるときだけ。外部 URL は `target="_blank" rel="noopener noreferrer"`。リンクのクリックは表紙の切り替えを起こさない）。英語は "Collection page →"
  - 全表示に戻す「すべて」も置く（置き方は実装者に任せる。日英）
  - スマホでは横 3 枚のまま小さく、説明 1 行は隠してよい

- [ ] **Step 4: カードのバッジと絞り込み**
  - カードのバッジは `collection` の `label` と `badgeClass`。分類がない・未知ならば "App" と今の `bg-brand-highlight/20 text-brand-highlight`
  - `openApp` に渡す badge / badgeClass も同じ値にする
  - 表紙を押すとそのコレクション以外のカードを隠す（`hidden`）。同じ表紙をもう一度、または「すべて」で解除。分類のないカードは「すべて」のときだけ出る
  - 状態は `history.replaceState` で `#apps-<key>` / `#apps` に。読み込み時に `#apps-<key>` なら選択して `#apps` へスクロールする

- [ ] **Step 5: 確認する** — ローカルで `python3 -m http.server -d website 8765` を立てて、ブラウザ（使えれば Playwright 等でスクリーンショット）で次を見る
  - 初期表示で 13 枚すべて、カードの見た目が変更前と同じ（変更前のスクリーンショットと並べる）
  - PC 幅（1440×900）で表紙の下にカード 1 段目が見え始める
  - 各表紙で 5 / 6 / 2 枚に絞られ、もう一度押すと 13 枚に戻る
  - `http://localhost:8765/#apps-hina` で開くと HiNa に絞られて Tools に着地する
  - EN に切り替えると表紙・バッジ・モーダルが英語
  - 375px 幅で横スクロールなし・表紙が横 3 枚
  - 一時的に 1 枚の `collection` を消すと、そのカードは「すべて」だけに出てバッジ "App"（確認後に戻す）
  - 「アプリ数」の数字が 13 のまま

### Task 5: ルールの文書を作る

**Files:**
- Create: `docs/tools-collections.md`
- Modify: `website/CLAUDE.md`（ファイル構成の `apps-data.js` の行と、データファイルのルールに `apps-data.js` の節を 2〜3 行）

- [ ] **Step 1: `docs/tools-collections.md` を書く** — spec の「文書」の節に挙がった項目をすべて入れる（定義と見分け方の問い・迷ったら CEO に聞く・必須項目・バッジを手で書かない・名前の付け方・先頭に追加・新しいコレクションと改名は CEO の判断・コミット時に分類が抜けると copy-audit-guard が止めること）。色の具体値（`accent` / `badgeClass`）も記録する。Yori の名前の由来は書かない
- [ ] **Step 2: `website/CLAUDE.md` から参照を張る** — 「Tools のカードを足すときは `docs/tools-collections.md` を読み、`collection` を必ず書く」

### Task 6: 文言監査を通してコミットする

**Files:** Task 3〜5 の成果物

- [ ] **Step 1: ステージする** — `git add website/apps-data.js website/index.html website/CLAUDE.md docs/tools-collections.md`（`git add` と `git commit` は別の Bash で）
- [ ] **Step 2: コミットを試み、hook の指示どおり監査する** — `git commit` を実行すると copy-audit-guard が文言監査を求めて止める（分類の検査は通っているはず）。表示された手順で `--export` し、`copy-auditor` に表紙 3 件の `descJa` / `descEn` を監査させる
- [ ] **Step 3: CEO に見せる** — 監査結果と表紙の文言（直した版）、Task 4 のスクリーンショットを CEO に見せて OK を待つ。直しが入ればステージし直して Step 2 に戻る
- [ ] **Step 4: 印を付けてコミット** — CEO の OK のあとにだけ `python3 scripts/copy-lint.py --mark <見せた tree>`、続けて別の Bash で
```bash
git commit -m "feat(tools): Tools 欄を NuWord / HiNa / Yori の 3 コレクションに分け、表紙で絞り込めるようにする"
```
- [ ] **Step 5: handoff.md に 1〜3 行追記する**（既存の他セッションの変更は消さない。追記分だけを自分でコミットするかは CEO に確かめる）
