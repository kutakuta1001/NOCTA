# Codex レビュー設定 取扱説明書（グローバル）

このMacの全Claude Codeセッション・全ディレクトリで使える Codex CLI レビュー環境の説明書。
最終更新: 2026-09-06

---

## これは何か

`/codex-review`（計画書の設計レビュー）と `/codex-diff`（未コミット差分のコードレビュー）は、
OpenAI の Codex CLI を第三者レビュアーとして呼び出す仕組み。実体は
`~/.claude/scripts/codex-review.sh` というラッパースクリプト。

スキル定義: `~/.claude/commands/codex-review.md` / `~/.claude/commands/codex-diff.md`（ユーザーグローバル）

---

## 認証構成（定額のみ・2026-09-12 CEO 決定で副を封鎖）

| 系統 | 認証 | モデル | 課金 | いつ使うか |
|---|---|---|---|---|
| **主** | ChatGPT Plus 連携 | gpt-6-astra（effort **high**） | 定額（Plus料金内） | 既定。通常はこれで走る |
| 主の定額フォールバック | ChatGPT Plus 連携 | gpt-5.6-sol → gpt-5.5 | 定額（Plus料金内） | astra がモデル未対応で拒否されたとき自動で順に試す |
| ~~副~~ | OpenAI API キー | gpt-5.6-luna（固定） | 従量課金 | **既定で無効。`CODEX_ALLOW_METERED=1` がない限り実行を拒否** |

**課金方針: 定額のみ。従量課金へは自動でも手動確認でもフォールバックしない。**
定額枠のモデルが全滅したら exit 75 で**課金せず停止**する。対処は CLI 更新・`codex login`・
または Claude 側（Opus 5 / `/persona-review`）でのレビュー代替。

推論の深さ（`model_reasoning_effort`）は **chatgpt モードのみ** に渡す。apikey は未検証の
config キーを足して経路ごと壊すリスクを避けるため付けない。

`CODEX_CHATGPT_MODEL_FALLBACKS`（既定 `"gpt-5.6-sol gpt-5.5"`）には
**従量課金でしか使えないモデルを入れてはならない**。定額の前提が崩れる。

- 主の認証情報: `~/.codex/auth.json`（`codex login` で作成・ChatGPTトークン）
- 副のAPIキー: `~/.codex/fallback-api-key`（chmod 600）。専用 `CODEX_HOME=~/.codex-apikey` で主と完全分離
- `OPENAI_API_KEY` は環境変数に常駐させない（settings.json・launchctl から撤去済み）。
  常駐するとCodexがAPIキーを優先してしまうため。

### フォールバックの流れ（すべて定額枠内）
1. `/codex-review` 実行 → ChatGPT Plus で `gpt-6-astra`（effort high）
2. モデル未対応で拒否 → 同じ定額枠のまま `gpt-5.6-sol` → `gpt-5.5` を順に試す
3. 認証失敗（未ログイン・トークン失効）→ モデルを変えても直らないので**即停止**。他モデルは試さない
4. 定額枠が全滅 → **終了コード 75 + `CODEX_AUTH_FAILED`** を出して課金せず終了
5. Claude は `CODEX_AUTH=apikey` を提案しない。CLI 更新・再ログイン・Claude 側代替を案内する

内部的にはモデル未対応を終了コード 76 で区別して再試行に使い、呼び出し側には 75 に丸めて返す。

---

## なぜこのモデル構成か

- Codex の既定モデル `gpt-5.3-codex` は **API専用**。ChatGPTアカウントでは全モデルが
  400エラー（`not supported when using Codex with a ChatGPT account`）で拒否される（既知issue）。
- そのため ChatGPT 連携では `-m` でChatGPT対応モデルを明示する必要がある。
- **GPT-6 世代**（2026-09 時点で Codex のモデル一覧の priority 1 = `gpt-6-astra`）。
  公式説明は "Our most capable model for complex, demanding work."。階層名は不要で単体指定で通る。
  推論レベルが6段階に拡張された（**low / medium / high / xhigh / max / ultra**・モデル既定は low）。
  `ultra` は「最大推論＋タスクの自動委譲」。速度ティア `fast`（2倍速・使用量増）も選択可。
  コンテキスト長 272,000（GPT-5.x 系と同じ）。
  レビュー用途は欠陥発見の網羅性が最優先なので、既定 low ではなく **high を明示指定**している。
  ⚠️ 価格・ベンチマークは未調査。`/model-review` で埋めること（model-lineup.md が正本）。
- GPT-5.6 は単一モデルではなく3階層構成（**sol=フラッグシップ/最上位・$5/$30** / terra=バランス型・中位・$2.50/$15 / luna=軽量・最下位・$1/$6）。
  2026-06-26 限定プレビュー → 2026-07-09 GA（ChatGPT・API・Codex・GitHub Copilot 全対応）。
  単体の `gpt-5.6` はモデルメタデータ未定義で 400 拒否される。階層名の指定が必須。
  ⚠️ 階層名から性能を誤読しやすい（"Luna"を最上位と誤認した実例あり・2026-07-21）。
  正しい序列は Sol > Terra > Luna（価格・SWE-bench・複数の外部ソースで確認済み）。
- 検証結果（2026-09-06・CLI 0.153.4）:
  - `gpt-6-astra` → ChatGPT Plus で動作（**要 Codex CLI 0.153.4 以降**）。
    CLI 0.144.6 では同じモデル名が 400 `requires a newer version of Codex` で拒否された。
    モデル名自体はサーバー側が認識しており、エラー文面で更新を要求してくる。
  - `-c model_reasoning_effort=high` → 反映を確認（実行ヘッダが `reasoning effort: high` になる）
  - `gpt-5.4`（非 mini）→ モデル一覧から消滅。`gpt-5.4-mini` は残存
- 検証結果（2026-07-21）:
  - `gpt-5.6-sol` / `gpt-5.6-terra` / `gpt-5.6-luna` → ChatGPT Plusで動作（**要 Codex CLI 0.144.0 以降**）
  - `gpt-5.6`（階層名なし） → ChatGPT非対応（400: model metadata not found）
  - `gpt-5.5` → 引き続き動作（旧既定・フォールバック用に維持）
  - `gpt-5.4` / `gpt-5.4-mini` → 動作（古いCLIでも可）
  - `gpt-5.x-codex` / `codex-mini` → ChatGPT非対応（APIキー専用）
- ベンチマークの比較値は `~/.claude/references/model-lineup.md` に一元化する（ここでは重複させない）。
  要点: GPT-6 Astra は SWE-bench Pro 未公表。Coding Agent Index で Astra 67 対 Claude Fable 5.1 70。
  **Codex を使う理由はスコア優位ではなく「別ベンダーの別の失敗モードを見ること」。**

「Codex CLI（ツール）」は使えているが、その頭脳は gpt-6-astra（GPT-6 世代・欠陥発見精度最優先で選定）。
旧既定 gpt-5.6-sol は CLI が古い環境向けのフォールバック候補として維持する。
コード特化の `-codex` モデルは 2026-09-12 時点で API モデル一覧から消滅しており（`gpt-5.3-codex` は
価格ページにのみ残存）、かつ apikey 経路は封鎖したため**使用しない**。

---

## よくある操作

```bash
# 通常はスキル経由（ChatGPT Plus・gpt-6-astra・effort high）
/codex-review docs/plan.md
/codex-diff

# モデルを変えたい（環境変数で上書き。例: 軽い一次チェックを Terra で）
CODEX_CHATGPT_MODEL=gpt-5.6-terra ~/.claude/scripts/codex-review.sh diff

# 推論をさらに深くしたい（消費は増える）
CODEX_REASONING_EFFORT=xhigh ~/.claude/scripts/codex-review.sh diff

# 従量課金は既定で無効。下記は拒否される（定額のみの方針）
CODEX_AUTH=apikey ~/.claude/scripts/codex-review.sh diff
# どうしても必要な場合のみ明示許可する（model=gpt-5.6-luna に固定される）
# CODEX_ALLOW_METERED=1 CODEX_AUTH=apikey ~/.claude/scripts/codex-review.sh diff

# 使用量の目安を見る（ChatGPT側の5h制限の自前カウンタ）
~/.claude/scripts/codex-review.sh usage

# CLI が npm 最新に追随しているか確認（キャッシュ無視）
~/.claude/scripts/codex-review.sh version-check
```

### 環境変数
| 変数 | 既定 | 説明 |
|---|---|---|
| `CODEX_AUTH` | chatgpt | 認証モード（chatgpt / apikey） |
| `CODEX_CHATGPT_MODEL` | gpt-6-astra | ChatGPT連携で使うモデル（要 CLI 0.153+） |
| `CODEX_REASONING_EFFORT` | high | 推論の深さ。空文字でモデル既定に委ねる。chatgpt モードのみ適用 |
| `CODEX_FALLBACK_KEY_FILE` | ~/.codex/fallback-api-key | フォールバックキーの場所 |
| `CODEX_TIMEOUT_SEC` | 180 | codex実行のタイムアウト |
| `CODEX_VERSION_CHECK` | 1 | CLIバージョン追随チェック（0で無効） |
| `CODEX_VERSION_CHECK_INTERVAL_SEC` | 86400 | npm照会の間隔（24h） |
| `CODEX_VERSION_CHECK_TIMEOUT_SEC` | 5 | npm照会のタイムアウト |

---

## トラブルシュート

- **「requires a newer version of Codex」** → CLIが古い。`npm install -g @openai/codex@latest` で更新。
  Codex は npm グローバル導入（`/opt/homebrew/bin/codex` は node_modules へのシンボリックリンク）。
  ※ この状態は下記「CLIバージョン追随の検知」で自動的に警告される。
- **`CODEX_AUTH_FAILED`（exit 75）** → 定額枠で実行できなかった。原因は認証切れか、
  定額枠のモデル全滅のいずれか（出力に試行したモデル名が出る）。
  対処は `codex login` での再ログイン、`npm install -g @openai/codex@latest` での CLI 更新、
  または Claude 側（Opus 5 / `/persona-review`）での代替。**従量課金には切り替えない。**
- **`CODEX_MODEL_UNSUPPORTED`** → 指定モデルがChatGPTアカウントで使えない。
  `CODEX_CHATGPT_MODEL` をChatGPT対応モデル（gpt-5.6-terra / gpt-5.5）にするかCLIを更新。
  ※ GPT-5.6 系は階層名（sol/terra/luna）の指定が必須。単体の `gpt-5.6` は常に非対応。
  ※ 階層名の序列は Sol（最上位）> Terra（中位）> Luna（最下位）。名前から性能を推測しない。
- **認証状態の確認**: `codex login status`（「Logged in using ChatGPT」なら主が有効）

---

## CLIバージョン追随の検知（自動・2026-09-06 導入）

新モデルは新版の CLI を要求する。CLI を放置すると既定モデルが 400 で止まるため、2系統で検知する。

| 検知点 | タイミング | 挙動 |
|---|---|---|
| `codex-review.sh` 実行時 | レビューのたび（npm照会は24hに1回だけ・キャッシュ `~/.codex/.cli-version-check`） | 古ければ警告を出すが**レビューは続行する** |
| `/weekly-check` Step 2 | 週次ルーティン | `version-check` を実行し、古ければ更新を推奨 |

- npm 照会は watchdog 付き5秒。オフライン・タイムアウト時は黙ってスキップしてレビューを止めない
- 定額枠のモデルが全滅した時点でキャッシュを無視して即照会し、バージョン差を突き合わせて表示する
  （個々の `CODEX_MODEL_UNSUPPORTED` ごとには照会しない。再試行で npm を何度も叩かないため）
- 無効化は `CODEX_VERSION_CHECK=0`

導入の経緯: gpt-6-astra は提供開始済みだったが、手元の CLI が 0.144.6 のままで9バージョン遅れており、
CEO の「使えるようになってるはず」という勘だけが検知手段だった（2026-09-06）。

---

## 新モデルへの上げ方

新しいモデルが出たら:
1. `~/.claude/scripts/codex-review.sh version-check` で CLI の追随を確認
2. `npm install -g @openai/codex@latest` でCLI更新
3. `env -u OPENAI_API_KEY codex exec -m <新モデル> --skip-git-repo-check "Reply OK"` で動作確認
4. 動けば `codex-review.sh` の `CODEX_CHATGPT_MODEL` 既定値を更新
5. このファイル・`~/.claude/CLAUDE.md`・`~/.claude/references/model-lineup.md` の記述も合わせて直す

利用可能なモデル一覧（CLI 実行時に自動更新されるキャッシュを読む）:

```bash
python3 -c "import json;d=json.load(open('$HOME/.codex/models_cache.json'));[print(m['slug'],'|',m['default_reasoning_level'],'| priority',m['priority']) for m in d['models']]"
```
