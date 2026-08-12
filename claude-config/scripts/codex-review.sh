#!/usr/bin/env bash
# Codex CLI を使ってレビューを実行するラッパー（グローバル版）。
#
# Usage:
#   codex-review.sh plan <plan.md>     # 計画書の設計レビュー
#   codex-review.sh diff               # 未コミット差分のコードレビュー
#   codex-review.sh file <path>        # 特定ファイルのコードレビュー
#   codex-review.sh custom "<prompt>"  # 自由プロンプトレビュー
#
# 前提:
#   - codex CLI がインストール済み（npm i -g @openai/codex / brew install codex）
#   - 主: ChatGPT Plus でログイン済み（codex login。トークンは ~/.codex/auth.json）
#   - 副: フォールバック用 OpenAI API キーを ~/.codex/fallback-api-key に保存（chmod 600）
#
# 認証モード（CODEX_AUTH で切替・既定 chatgpt）:
#   - chatgpt: OPENAI_API_KEY を env から外して実行 → ChatGPT Plus 連携を使う（主）
#   - apikey : フォールバックキーファイルを読み込んで従量課金で実行（副）
#   chatgpt モードで認証失敗（未ログイン・トークン失効等）した場合は、
#   特別な終了コード 75 と "CODEX_AUTH_FAILED" を出力して呼び出し側に通知する。
#   呼び出し側（/review・/review-diff スキル）はユーザーに確認した上で
#   CODEX_AUTH=apikey で再実行する。
#
# 設計意図:
#   - --sandbox read-only で安全にレビューのみ実行（書き込みなし）
#   - 作業ディレクトリは「実行時のカレント Git リポジトリのルート」を自動検出する。
#     これによりこのスクリプトを ~/.claude/scripts に置いてグローバル運用できる。
#   - Git 管理外で実行された場合は現在のディレクトリ（PWD）にフォールバック。
#   - フォールバックキーは絶対パス読みのため、env 非依存でどのターミナルからでも動く。

set -euo pipefail

# グローバル運用のため、スクリプト自身の場所ではなく
# 「呼び出されたカレントリポジトリのルート」を基準にする。
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
MODE="${1:-}"

# 認証モード。既定は ChatGPT Plus 連携（主）。フォールバック時のみ apikey。
CODEX_AUTH="${CODEX_AUTH:-chatgpt}"
FALLBACK_KEY_FILE="${CODEX_FALLBACK_KEY_FILE:-$HOME/.codex/fallback-api-key}"
# ChatGPT 連携で使うモデル。codex の既定 gpt-5.3-codex は API 専用で
# ChatGPT アカウントでは 400 拒否されるため、ChatGPT 対応モデルを明示する。
# gpt-5.6-sol（3階層中フラッグシップ。sol=最上位/terra=中位/luna=軽量・最下位）は
# CLI 0.144.6 以降で ChatGPT Plus 利用可（検証済み 2026-07-21）。
# 単体の "gpt-5.6" は非対応（metadata未定義で400拒否される）。階層名の指定が必須。
# 古い CLI では gpt-5.5 / gpt-5.4 にフォールバックすること。
CODEX_CHATGPT_MODEL="${CODEX_CHATGPT_MODEL:-gpt-5.6-sol}"
# apikey モード専用の CODEX_HOME。主の ~/.codex（ChatGPT 連携）と完全分離して
# 認証の優先順位の曖昧さを排除する。codex の状態ファイルもここに隔離される。
APIKEY_HOME="${CODEX_APIKEY_HOME:-$HOME/.codex-apikey}"

# chatgpt モードで認証失敗を検出したときの専用終了コード（呼び出し側で判別）
CODEX_AUTH_FAILED_EXIT=75

# ChatGPT Plus の Codex はおよそ5時間ローリング制限（公称値は非公開、目安として
# 呼び出し回数で追跡）。chatgpt モードのみカウントする（apikey は従量課金で上限なし）。
USAGE_LOG="${CODEX_USAGE_LOG:-$HOME/.codex/usage.log}"
USAGE_WINDOW_SEC="${CODEX_USAGE_WINDOW_SEC:-18000}"   # 5h
USAGE_WARN_AT="${CODEX_USAGE_WARN_AT:-20}"            # 残り閾値の既定
USAGE_LIMIT_ESTIMATE="${CODEX_USAGE_LIMIT_ESTIMATE:-30}"  # Plus の安全圏目安

if ! command -v codex >/dev/null 2>&1; then
  echo "ERROR: codex CLI not found. Install with: npm install -g @openai/codex" >&2
  exit 1
fi

# 過去 USAGE_WINDOW_SEC 秒以内の呼び出し回数を返す
count_recent_usage() {
  [[ -f "$USAGE_LOG" ]] || { echo 0; return; }
  local now cutoff
  now=$(date +%s)
  cutoff=$((now - USAGE_WINDOW_SEC))
  awk -v cutoff="$cutoff" '$1 >= cutoff' "$USAGE_LOG" | wc -l | tr -d ' '
}

record_usage() {
  mkdir -p "$(dirname "$USAGE_LOG")"
  date +%s >> "$USAGE_LOG"
}

warn_if_near_limit() {
  local used remaining
  used=$(count_recent_usage)
  remaining=$((USAGE_LIMIT_ESTIMATE - used))
  if (( remaining <= 0 )); then
    echo "⚠️  Codex 使用量: 直近5時間で ${used}回（推定上限 ${USAGE_LIMIT_ESTIMATE} を超過）" >&2
    echo "   実行は試みますが、レート制限エラーの可能性があります。" >&2
  elif (( used >= USAGE_WARN_AT )); then
    echo "⚠️  Codex 使用量: 直近5時間で ${used}回（残り目安 ${remaining} 回）" >&2
  else
    echo "📊 Codex 使用量: 直近5時間で ${used}回（残り目安 ${remaining} 回）" >&2
  fi
}

# コマンドを watchdog 付きで実行する。macOS には coreutils の `timeout` が
# 入っていない前提で、純 bash のバックグラウンド + kill 方式で実装する。
# CODEX_TIMEOUT_SEC で上書き可（既定 180 秒）。
CODEX_TIMEOUT_SEC="${CODEX_TIMEOUT_SEC:-180}"

# 認証モードに応じて codex を起動する内部関数。
# 出力はライブ表示しつつ一時ファイルにも保存し、認証失敗判定に使う。
run_codex() {
  local prompt="$1"

  # 認証モードごとの起動コマンドを組み立てる。
  # chatgpt: OPENAI_API_KEY を env から外して ChatGPT Plus 連携を使う。
  # apikey : フォールバックキーファイルを env に注入して従量課金で実行。
  local -a launcher
  case "$CODEX_AUTH" in
    chatgpt)
      warn_if_near_limit
      record_usage
      echo "🔑 認証モード: chatgpt（ChatGPT Plus 連携 / model=${CODEX_CHATGPT_MODEL}）" >&2
      # 主の ~/.codex を使う。env のキーが残っていても拾わせない。
      # ChatGPT 対応モデルを明示指定（既定モデルは API 専用で拒否されるため）。
      launcher=(env -u OPENAI_API_KEY codex exec -m "$CODEX_CHATGPT_MODEL")
      ;;
    apikey)
      if [[ ! -f "$FALLBACK_KEY_FILE" ]]; then
        echo "ERROR: フォールバックキーが見つかりません: $FALLBACK_KEY_FILE" >&2
        echo "       OpenAI API キーを chmod 600 で保存してください。" >&2
        exit 1
      fi
      local api_key
      api_key="$(tr -d '\r\n' < "$FALLBACK_KEY_FILE")"
      if [[ -z "$api_key" ]]; then
        echo "ERROR: フォールバックキーファイルが空です: $FALLBACK_KEY_FILE" >&2
        exit 1
      fi
      # 専用 CODEX_HOME に apikey 認証の auth.json を用意（ChatGPT 連携と完全分離）。
      # 毎回書き直してフォールバックキーの更新に追随する。
      mkdir -p "$APIKEY_HOME"
      chmod 700 "$APIKEY_HOME"
      printf '{"auth_mode":"apikey","OPENAI_API_KEY":"%s"}' "$api_key" > "$APIKEY_HOME/auth.json"
      chmod 600 "$APIKEY_HOME/auth.json"
      echo "🔑 認証モード: apikey（フォールバック・従量課金 / CODEX_HOME=${APIKEY_HOME}）" >&2
      launcher=(env -u OPENAI_API_KEY "CODEX_HOME=${APIKEY_HOME}" codex exec)
      ;;
    *)
      echo "ERROR: 不明な CODEX_AUTH=$CODEX_AUTH（chatgpt|apikey のみ）" >&2
      exit 1
      ;;
  esac

  local out_file
  out_file="$(mktemp -t codex-review.XXXXXX)"
  # shellcheck disable=SC2064
  trap "rm -f '$out_file'" RETURN

  # 出力をファイルに保存（認証失敗判定に使う）。env が codex を exec するため
  # $! は codex 本体の PID となり、元実装と同じ単一 PID watchdog が使える。
  # stdin は /dev/null に向ける。さもないと codex exec が標準入力からの
  # 追加入力を待ち続けてハングする（"Reading additional input from stdin..."）。
  # --skip-git-repo-check: git 管理外ディレクトリでも実行できるようにする
  # （read-only サンドボックスのため安全）。
  "${launcher[@]}" \
    --sandbox read-only \
    --skip-git-repo-check \
    --cd "$REPO_ROOT" \
    "$prompt" < /dev/null > "$out_file" 2>&1 &
  local codex_pid=$!

  ( sleep "$CODEX_TIMEOUT_SEC"; kill -TERM "$codex_pid" 2>/dev/null; sleep 3; kill -KILL "$codex_pid" 2>/dev/null ) &
  local watchdog_pid=$!
  # watchdog が先に死んでも wait がブロックしないよう disown する
  disown "$watchdog_pid" 2>/dev/null || true

  # set -e 下では wait が非ゼロを返すと即終了してしまい、後続の認証失敗検出に
  # 到達できない。|| で受けて rc を捕捉する。
  local rc=0
  wait "$codex_pid" || rc=$?

  # codex が正常終了したら watchdog を殺して後処理
  kill -TERM "$watchdog_pid" 2>/dev/null || true

  # 保存した出力をユーザーに見せる
  cat "$out_file"

  # chatgpt モードでモデル非対応/CLI更新要求 → 認証とは別問題として明示通知
  # （再ログインしても直らないため CODEX_AUTH_FAILED とは分ける）
  if [[ $rc -ne 0 && "$CODEX_AUTH" == "chatgpt" ]] \
     && grep -qiE 'not supported when using codex with a chatgpt account|requires a newer version of codex' "$out_file"; then
    echo "" >&2
    echo "CODEX_MODEL_UNSUPPORTED: ChatGPT アカウントでモデル '${CODEX_CHATGPT_MODEL}' が使えません。" >&2
    echo "  対処: CODEX_CHATGPT_MODEL に ChatGPT 対応モデル（例 gpt-5.6-terra / gpt-5.5）を指定するか、" >&2
    echo "        Codex CLI を更新してください（gpt-5.6-sol 等の新モデルは新版が必要）。" >&2
    return "$CODEX_AUTH_FAILED_EXIT"
  fi

  # chatgpt モードで失敗 かつ 認証エラーらしき出力 → 認証失敗として通知
  if [[ $rc -ne 0 && "$CODEX_AUTH" == "chatgpt" ]] \
     && grep -qiE 'not logged in|please run .*login|run `codex login`|unauthorized|401|403|authentication failed|token (has )?expired|credentials|re-?authenticate' "$out_file"; then
    echo "" >&2
    echo "CODEX_AUTH_FAILED: ChatGPT Plus 連携の認証に失敗しました（未ログイン/トークン失効の可能性）。" >&2
    echo "  対処: ターミナルで \`codex login\` を実行して再ログインするか、" >&2
    echo "        ユーザー確認の上で CODEX_AUTH=apikey で再実行してください。" >&2
    return "$CODEX_AUTH_FAILED_EXIT"
  fi

  if [[ $rc -ne 0 ]]; then
    echo "⚠️  codex exited with code $rc (timeout=${CODEX_TIMEOUT_SEC}s)" >&2
  fi
  return $rc
}

case "$MODE" in
  plan)
    PLAN_FILE="${2:-}"
    if [[ -z "$PLAN_FILE" ]]; then
      echo "Usage: $0 plan <plan-file>" >&2
      exit 1
    fi
    if [[ ! -f "$REPO_ROOT/$PLAN_FILE" && ! -f "$PLAN_FILE" ]]; then
      echo "ERROR: plan file not found: $PLAN_FILE" >&2
      exit 1
    fi
    PROMPT=$(cat <<EOF
あなたは経験豊富なシニアエンジニアです。
以下の実装計画書を批判的にレビューしてください。

レビュー対象: $PLAN_FILE

観点:
1. 設計上の抜け・漏れ（エッジケース・エラーハンドリング・並行性）
2. セキュリティ上の懸念（SQLi、XSS、認証、データ漏洩）
3. 保守性（責務分離、DRY、命名）
4. テスト容易性
5. パフォーマンス懸念
6. 既存コードとの整合性

出力形式:
- 🔴 Critical / 🟡 Warning / 🟢 Nit の3分類で指摘
- 各指摘には「問題」「理由」「具体的な修正案（コード例）」を含める
- 確認不要。具体的な提案まで出力すること。

計画書は $REPO_ROOT/$PLAN_FILE にあります。まず Read してから指摘してください。
CLAUDE.md があれば参照してよい。
EOF
)
    run_codex "$PROMPT"
    ;;

  diff)
    DIFF=$(cd "$REPO_ROOT" && git diff HEAD --stat && echo "---" && git diff HEAD)
    if [[ -z "$DIFF" ]]; then
      echo "No uncommitted changes to review." >&2
      exit 0
    fi
    PROMPT=$(cat <<EOF
あなたは経験豊富なシニアエンジニアです。
以下の未コミット差分（git diff HEAD）を批判的にコードレビューしてください。

観点:
1. バグ・ロジック誤り・エッジケース
2. セキュリティ（入力検証、認証、SQL/XSS）
3. 保守性・可読性
4. 既存コードとの整合性（CLAUDE.md のパターンに従っているか）
5. 型安全性（TypeScript）
6. パフォーマンス

出力形式:
- 🔴 Critical / 🟡 Warning / 🟢 Nit の3分類
- 各指摘に「ファイル:行」「問題」「理由」「修正案」を含める
- 確認不要、具体的提案まで出力

差分は git diff HEAD で取得できます。実際のファイルも読んで良い。
EOF
)
    run_codex "$PROMPT"
    ;;

  file)
    FILE="${2:-}"
    if [[ -z "$FILE" ]]; then
      echo "Usage: $0 file <path>" >&2
      exit 1
    fi
    PROMPT=$(cat <<EOF
あなたは経験豊富なシニアエンジニアです。
以下のファイルを批判的にレビューしてください。

対象: $FILE

観点:
1. バグ・ロジック誤り
2. セキュリティ
3. 保守性・可読性
4. 既存コードとの整合性
5. 型安全性

出力形式:
- 🔴 Critical / 🟡 Warning / 🟢 Nit
- 各指摘に「行」「問題」「理由」「修正案」
- 確認不要、具体的提案まで出力
EOF
)
    run_codex "$PROMPT"
    ;;

  custom)
    CUSTOM_PROMPT="${2:-}"
    if [[ -z "$CUSTOM_PROMPT" ]]; then
      echo 'Usage: $0 custom "<prompt>"' >&2
      exit 1
    fi
    run_codex "$CUSTOM_PROMPT"
    ;;

  usage)
    used=$(count_recent_usage)
    remaining=$((USAGE_LIMIT_ESTIMATE - used))
    echo "Codex 使用量（直近 $((USAGE_WINDOW_SEC / 3600))h）"
    echo "  使用: ${used} 回"
    echo "  残り目安: ${remaining} 回（推定上限 ${USAGE_LIMIT_ESTIMATE}）"
    echo "  警告閾値: ${USAGE_WARN_AT} 回"
    echo "  ログ: $USAGE_LOG"
    ;;

  *)
    cat <<EOF
Usage: $0 <mode> [args]

Modes:
  plan <plan.md>      計画書の設計レビュー
  diff                未コミット差分のコードレビュー
  file <path>         特定ファイルのコードレビュー
  custom "<prompt>"   自由プロンプトレビュー
  usage               Codex 使用量（ローカル追跡）を表示

Examples:
  $0 plan docs/superpowers/plans/2026-04-18-seeds-m1-fts5.md
  $0 diff
  CODEX_AUTH=apikey $0 diff       # フォールバック（従量課金）で再実行
  $0 file src/app/api/cards/route.ts
  $0 custom "src/lib/db.ts のコネクションプーリングを評価せよ"
  $0 usage

認証:
  既定は chatgpt（ChatGPT Plus 連携）。認証失敗時は終了コード 75 と
  "CODEX_AUTH_FAILED" を出力する。CODEX_AUTH=apikey で従量課金に切替。

Env overrides:
  CODEX_AUTH                 認証モード（chatgpt|apikey・既定 chatgpt）
  CODEX_CHATGPT_MODEL        ChatGPT 連携で使うモデル（既定: gpt-5.6-sol・要 CLI 0.144+）
                             ※ codex 既定 gpt-5.3-codex は API 専用で ChatGPT 不可
                             ※ 単体 "gpt-5.6" は非対応。sol/terra/luna の階層名が必須
  CODEX_FALLBACK_KEY_FILE    フォールバックキーの場所（既定: ~/.codex/fallback-api-key）
  CODEX_USAGE_LOG            使用ログのパス（既定: ~/.codex/usage.log）
  CODEX_USAGE_WINDOW_SEC     追跡ウィンドウ秒数（既定: 18000 = 5h）
  CODEX_USAGE_WARN_AT        警告閾値（既定: 20 回）
  CODEX_USAGE_LIMIT_ESTIMATE ChatGPT Plus 推定上限（既定: 30 回）
EOF
    exit 1
    ;;
esac
