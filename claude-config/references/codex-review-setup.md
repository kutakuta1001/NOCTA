# Codex レビュー設定 取扱説明書（グローバル）

このMacの全Claude Codeセッション・全ディレクトリで使える Codex CLI レビュー環境の説明書。
最終更新: 2026-07-21

---

## これは何か

`/codex-review`（計画書の設計レビュー）と `/codex-diff`（未コミット差分のコードレビュー）は、
OpenAI の Codex CLI を第三者レビュアーとして呼び出す仕組み。実体は
`~/.claude/scripts/codex-review.sh` というラッパースクリプト。

スキル定義: `~/.claude/commands/codex-review.md` / `~/.claude/commands/codex-diff.md`（ユーザーグローバル）

---

## 認証構成（主・副の2系統）

| 系統 | 認証 | モデル | 課金 | いつ使うか |
|---|---|---|---|---|
| **主** | ChatGPT Plus 連携 | gpt-5.6-sol | 定額（Plus料金内） | 既定。通常はこれで走る |
| **副** | OpenAI API キー | gpt-5.3-codex | 従量課金 | 主が失敗したとき、ユーザー確認の上で |

- 主の認証情報: `~/.codex/auth.json`（`codex login` で作成・ChatGPTトークン）
- 副のAPIキー: `~/.codex/fallback-api-key`（chmod 600）。専用 `CODEX_HOME=~/.codex-apikey` で主と完全分離
- `OPENAI_API_KEY` は環境変数に常駐させない（settings.json・launchctl から撤去済み）。
  常駐するとCodexがAPIキーを優先してしまうため。

### フォールバックの流れ
1. `/codex-review` 実行 → 既定で ChatGPT Plus（主）で走る
2. 主が認証失敗 → スクリプトが **終了コード 75 + `CODEX_AUTH_FAILED`** を出力
3. Claude がそれを検知 → **勝手に従量課金へ切り替えず、ユーザーに確認**
4. ユーザーが承認 → `CODEX_AUTH=apikey` で再実行（API従量課金）

---

## なぜこのモデル構成か

- Codex の既定モデル `gpt-5.3-codex` は **API専用**。ChatGPTアカウントでは全モデルが
  400エラー（`not supported when using Codex with a ChatGPT account`）で拒否される（既知issue）。
- そのため ChatGPT 連携では `-m` でChatGPT対応モデルを明示する必要がある。
- GPT-5.6 は単一モデルではなく3階層構成（**sol=フラッグシップ/最上位・$5/$30** / terra=バランス型・中位・$2.50/$15 / luna=軽量・最下位・$1/$6）。
  2026-06-26 限定プレビュー → 2026-07-09 GA（ChatGPT・API・Codex・GitHub Copilot 全対応）。
  単体の `gpt-5.6` はモデルメタデータ未定義で 400 拒否される。階層名の指定が必須。
  ⚠️ 階層名から性能を誤読しやすい（"Luna"を最上位と誤認した実例あり・2026-07-21）。
  正しい序列は Sol > Terra > Luna（価格・SWE-bench・複数の外部ソースで確認済み）。
- 検証結果（2026-07-21）:
  - `gpt-5.6-sol` / `gpt-5.6-terra` / `gpt-5.6-luna` → ChatGPT Plusで動作（**要 Codex CLI 0.144.0 以降**）
  - `gpt-5.6`（階層名なし） → ChatGPT非対応（400: model metadata not found）
  - `gpt-5.5` → 引き続き動作（旧既定・フォールバック用に維持）
  - `gpt-5.4` / `gpt-5.4-mini` → 動作（古いCLIでも可）
  - `gpt-5.x-codex` / `codex-mini` → ChatGPT非対応（APIキー専用）
- ベンチマーク（SWE-bench Pro）: GPT-5.6 Sol 64.6%。参考: Claude Opus 4.8 69.2%・Fable 5 80%（Claude系が依然優位）。
  一方 Codex 内 Coding Agent Index（ターミナル作業・ツール連携）では Sol(max) が最上位評価。

「Codex CLI（ツール）」は使えているが、その頭脳は gpt-5.6-sol（フラッグシップ階層・欠陥発見精度最優先で選定）。
コード特化の `-codex` モデルを使いたい場合は apikey 副モード（従量課金）でのみ可能。

---

## よくある操作

```bash
# 通常はスキル経由（ChatGPT Plus・gpt-5.5）
/codex-review docs/plan.md
/codex-diff

# モデルを変えたい（環境変数で上書き。例: 軽い一次チェックをTerraで）
CODEX_CHATGPT_MODEL=gpt-5.6-terra ~/.claude/scripts/codex-review.sh diff

# 明示的にAPI従量課金で走らせたい
CODEX_AUTH=apikey ~/.claude/scripts/codex-review.sh diff

# 使用量の目安を見る（ChatGPT側の5h制限の自前カウンタ）
~/.claude/scripts/codex-review.sh usage
```

### 環境変数
| 変数 | 既定 | 説明 |
|---|---|---|
| `CODEX_AUTH` | chatgpt | 認証モード（chatgpt / apikey） |
| `CODEX_CHATGPT_MODEL` | gpt-5.6-sol | ChatGPT連携で使うモデル |
| `CODEX_FALLBACK_KEY_FILE` | ~/.codex/fallback-api-key | フォールバックキーの場所 |
| `CODEX_TIMEOUT_SEC` | 180 | codex実行のタイムアウト |

---

## トラブルシュート

- **「requires a newer version of Codex」** → CLIが古い。`npm install -g @openai/codex@latest` で更新。
  Codex は npm グローバル導入（`/opt/homebrew/bin/codex` は node_modules へのシンボリックリンク）。
- **`CODEX_AUTH_FAILED`（exit 75）** → ChatGPT連携が切れた。`codex login` で再ログイン、
  または確認の上で `CODEX_AUTH=apikey`。
- **`CODEX_MODEL_UNSUPPORTED`** → 指定モデルがChatGPTアカウントで使えない。
  `CODEX_CHATGPT_MODEL` をChatGPT対応モデル（gpt-5.6-terra / gpt-5.5）にするかCLIを更新。
  ※ GPT-5.6 系は階層名（sol/terra/luna）の指定が必須。単体の `gpt-5.6` は常に非対応。
  ※ 階層名の序列は Sol（最上位）> Terra（中位）> Luna（最下位）。名前から性能を推測しない。
- **認証状態の確認**: `codex login status`（「Logged in using ChatGPT」なら主が有効）

---

## 新モデルへの上げ方

新しいモデルが出たら:
1. `npm install -g @openai/codex@latest` でCLI更新
2. `env -u OPENAI_API_KEY codex exec -m <新モデル> --skip-git-repo-check "Reply OK"` で動作確認
3. 動けば `codex-review.sh` の `CODEX_CHATGPT_MODEL` 既定値を更新
