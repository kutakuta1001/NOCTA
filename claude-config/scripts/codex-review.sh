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
#     既定モデル gpt-6-astra は CLI 0.153.4 以降が必要。追随できているかは
#     レビュー実行時に自動チェックし、`codex-review.sh version-check` で明示確認できる。
#   - 主: ChatGPT Plus でログイン済み（codex login。トークンは ~/.codex/auth.json）
#   - 副: フォールバック用 OpenAI API キーを ~/.codex/fallback-api-key に保存（chmod 600）
#
# 認証モード（CODEX_AUTH で切替・既定 chatgpt）:
#   - chatgpt: OPENAI_API_KEY を env から外して実行 → ChatGPT Plus 連携を使う（定額）
#   - apikey : 従量課金。**既定で無効**。CODEX_ALLOW_METERED=1 がない限り実行を拒否する
#
# 課金方針（2026-09-12 CEO 決定「定額のみに限定」）:
#   従量課金には自動でも手動確認でもフォールバックしない。定額枠で完結させる。
#   モデルが使えない場合（CLI が古い・提供終了等）は、同じ定額枠のまま
#   CODEX_CHATGPT_MODEL → CODEX_CHATGPT_MODEL_FALLBACKS の順に試す。
#   それでも全滅したら終了コード 75 と "CODEX_AUTH_FAILED" を出して**課金せずに停止**する。
#   呼び出し側（/codex-review・/codex-diff スキル）は apikey への切替を提案してはならない。
#   対処は CLI の更新か codex login の再実行。
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
# gpt-6-astra（GPT-6 世代のフラッグシップ・モデル一覧の priority 1）は
# CLI 0.153.4 以降で ChatGPT Plus 利用可（検証済み 2026-09-06）。
# 0.144.6 では同じモデル名が 400（requires a newer version of Codex）で拒否された。
# 古い CLI では gpt-5.6-sol / gpt-5.5 にフォールバックすること。
CODEX_CHATGPT_MODEL="${CODEX_CHATGPT_MODEL:-gpt-6-astra}"
# astra がモデル未対応で拒否されたときに、同じ ChatGPT Plus 定額枠のまま順に試すモデル。
# **従量課金でしか使えないモデルを絶対にここへ入れない**（定額のみの方針）。
# gpt-5.6-sol は CLI 0.144.0 以降・gpt-5.5 は旧既定で古い CLI でも動く。
CODEX_CHATGPT_MODEL_FALLBACKS="${CODEX_CHATGPT_MODEL_FALLBACKS:-gpt-5.6-sol gpt-5.5}"

# 推論の深さ。GPT-6 世代は low/medium/high/xhigh/max/ultra の6段階。
# astra の既定は low だが、レビューは欠陥発見の網羅性が最優先なので high を明示する。
# 空文字を渡すと指定を省略してモデル既定に委ねる。
# chatgpt モードのみに適用する。apikey モードは主が死んだときの最後の手段であり、
# 未検証の config キーを足して経路ごと壊すリスクを避ける。
CODEX_REASONING_EFFORT="${CODEX_REASONING_EFFORT:-high}"
# apikey モード専用の CODEX_HOME。主の ~/.codex（ChatGPT 連携）と完全分離して
# 認証の優先順位の曖昧さを排除する。codex の状態ファイルもここに隔離される。
APIKEY_HOME="${CODEX_APIKEY_HOME:-$HOME/.codex-apikey}"

# 従量課金の明示許可フラグ。1 以外なら apikey モードは実行を拒否する（既定で無効）。
CODEX_ALLOW_METERED="${CODEX_ALLOW_METERED:-0}"
# apikey モードで使うモデル。**必ず明示指定する。**
# 指定しないと CODEX_HOME=~/.codex-apikey に config.toml がないため CLI 組み込み既定
# （CLI 0.154.0 では priority 1 = gpt-6-astra・$10/$50）が黙って使われる。
# 最安の gpt-5.6-luna（$0.20/$1.20）を既定にして、万一の実行でも出費を最小化する。
CODEX_APIKEY_MODEL="${CODEX_APIKEY_MODEL:-gpt-5.6-luna}"

# chatgpt モードで認証失敗を検出したときの専用終了コード（呼び出し側で判別）
CODEX_AUTH_FAILED_EXIT=75
# モデル未対応。認証失敗とは原因が違い、次の定額モデルを試せば回復しうるため分ける。
# スクリプト内部でのみ使い、呼び出し側には漏らさない（全滅時は 75 に丸める）。
CODEX_MODEL_UNSUPPORTED_EXIT=76

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

# ---- CLI バージョン追随の検知 ----
# 新しいモデルは新しい CLI を要求する。実例として gpt-6-astra は CLI 0.153.4 で動くが
# 0.144.6 では 400 "requires a newer version of Codex" で拒否された（2026-09-06 実測）。
# CLI を放置すると既定モデルが突然使えなくなるため、レビュー実行時に自動で気づけるようにする。
# npm へのアクセスは INTERVAL 秒に1回だけ行い、キャッシュヒット時はネットワークに触らない
# （通常のレビュー実行に遅延を持ち込まないため）。
CODEX_VERSION_CHECK="${CODEX_VERSION_CHECK:-1}"
CODEX_VERSION_CHECK_INTERVAL_SEC="${CODEX_VERSION_CHECK_INTERVAL_SEC:-86400}"   # 24h
CODEX_VERSION_CACHE="${CODEX_VERSION_CACHE:-$HOME/.codex/.cli-version-check}"
CODEX_VERSION_CHECK_TIMEOUT_SEC="${CODEX_VERSION_CHECK_TIMEOUT_SEC:-5}"

local_cli_version() {
  codex --version 2>/dev/null | awk '{print $NF}'
}

# npm の latest を取得する。オフラインで固まらせないため watchdog 付き。
# 成功時のみバージョン文字列を stdout に出し、失敗時は非ゼロを返す。
fetch_latest_cli_version() {
  local tmp rc=0 npm_pid wd_pid
  tmp="$(mktemp -t codex-npmver.XXXXXX)"
  npm view @openai/codex version > "$tmp" 2>/dev/null &
  npm_pid=$!
  ( sleep "$CODEX_VERSION_CHECK_TIMEOUT_SEC"; kill -TERM "$npm_pid" 2>/dev/null ) &
  wd_pid=$!
  disown "$wd_pid" 2>/dev/null || true
  wait "$npm_pid" || rc=$?
  kill -TERM "$wd_pid" 2>/dev/null || true
  [[ $rc -eq 0 ]] && tr -d ' \r\n' < "$tmp"
  rm -f "$tmp"
  return $rc
}

# $1 が $2 より古いバージョンなら真
version_lt() {
  [[ "$1" != "$2" ]] \
    && [[ "$(printf '%s\n%s\n' "$1" "$2" | sort -V | head -1)" == "$1" ]]
}

# 引数に force を渡すとキャッシュを無視し、最新だった場合もその旨を表示する。
check_cli_version() {
  local force="${1:-}"
  [[ "$CODEX_VERSION_CHECK" == "1" || -n "$force" ]] || return 0

  local now local_ver cached_at cached_latest latest fetched
  now=$(date +%s)
  local_ver="$(local_cli_version)"
  cached_at=0
  cached_latest=""
  if [[ -f "$CODEX_VERSION_CACHE" ]]; then
    read -r cached_at cached_latest < "$CODEX_VERSION_CACHE" || true
    [[ "$cached_at" =~ ^[0-9]+$ ]] || cached_at=0
  fi

  latest="$cached_latest"
  if [[ -n "$force" ]] || (( now - cached_at >= CODEX_VERSION_CHECK_INTERVAL_SEC )); then
    if fetched="$(fetch_latest_cli_version)" && [[ -n "$fetched" ]]; then
      latest="$fetched"
      mkdir -p "$(dirname "$CODEX_VERSION_CACHE")"
      printf '%s %s\n' "$now" "$latest" > "$CODEX_VERSION_CACHE"
    elif [[ -n "$force" ]]; then
      echo "⚠️  npm から最新バージョンを取得できませんでした（オフライン/タイムアウト）。" >&2
      echo "   ローカル: ${local_ver:-unknown}" >&2
      return 0
    fi
  fi

  [[ -n "$latest" && -n "$local_ver" ]] || return 0

  if version_lt "$local_ver" "$latest"; then
    echo "⚠️  Codex CLI が古い: ローカル ${local_ver} / npm 最新 ${latest}" >&2
    echo "   新モデルは新版の CLI を要求する（例 gpt-6-astra は 0.153.4 以降）。" >&2
    echo "   更新: npm install -g @openai/codex@latest" >&2
  elif [[ -n "$force" ]]; then
    echo "✅ Codex CLI は最新: ${local_ver}（npm 最新 ${latest}）" >&2
  fi
}

# コマンドを watchdog 付きで実行する。macOS には coreutils の `timeout` が
# 入っていない前提で、純 bash のバックグラウンド + kill 方式で実装する。
# CODEX_TIMEOUT_SEC で上書き可（既定 180 秒）。
CODEX_TIMEOUT_SEC="${CODEX_TIMEOUT_SEC:-180}"

# 1回の codex 起動を担う内部関数。モデルは呼び出し側が必ず明示する。
# 出力はライブ表示しつつ一時ファイルにも保存し、失敗理由の判定に使う。
# 戻り値: 0=成功 / 76=モデル未対応（次の定額モデルで回復しうる） /
#         75=認証失敗（モデルを変えても直らない） / その他=codex の終了コード
run_codex_once() {
  local model="$1"
  local prompt="$2"

  # 認証モードごとの起動コマンドを組み立てる。
  # chatgpt: OPENAI_API_KEY を env から外して ChatGPT Plus 連携を使う。
  # apikey : フォールバックキーファイルを env に注入して従量課金で実行。
  local -a launcher
  case "$CODEX_AUTH" in
    chatgpt)
      echo "🔑 認証モード: chatgpt（ChatGPT Plus 連携・定額 / model=${model}${CODEX_REASONING_EFFORT:+ / effort=${CODEX_REASONING_EFFORT}}）" >&2
      # 主の ~/.codex を使う。env のキーが残っていても拾わせない。
      # ChatGPT 対応モデルを明示指定（既定モデルは API 専用で拒否されるため）。
      launcher=(env -u OPENAI_API_KEY codex exec -m "$model")
      # 推論の深さを明示する。astra の既定は low で、レビューの網羅性が落ちる。
      if [[ -n "$CODEX_REASONING_EFFORT" ]]; then
        launcher+=(-c "model_reasoning_effort=${CODEX_REASONING_EFFORT}")
      fi
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
      echo "💸 認証モード: apikey（従量課金 / model=${model} / CODEX_HOME=${APIKEY_HOME}）" >&2
      # -m を必ず渡す。この CODEX_HOME には config.toml がないため、省略すると
      # CLI 組み込み既定（高額モデル）が黙って使われる。
      launcher=(env -u OPENAI_API_KEY "CODEX_HOME=${APIKEY_HOME}" codex exec -m "$model")
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

  # 出力をファイルに保存（失敗理由の判定に使う）。env が codex を exec するため
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

  # watchdog。1秒刻みで codex の生存を確認し、終わっていれば即座に自分も抜ける。
  # 単発の `sleep "$CODEX_TIMEOUT_SEC"` だと、親が kill してもその sleep が orphan として
  # 生き残り、継承した stdout を掴み続けてパイプの EOF を最大 CODEX_TIMEOUT_SEC 遅らせる
  # （出力を | に通すと固まる。定額フォールバックで1回の実行に watchdog が最大3個
  # 生まれるようになったため実測で顕在化した）。さらに時間差で PID 再利用後の
  # 無関係なプロセスへ kill が飛ぶ危険もある。
  # 対策: fd を /dev/null に落とし、ポーリングで codex の終了を検知して即時 exit する。
  (
    for (( _i = 0; _i < CODEX_TIMEOUT_SEC; _i++ )); do
      sleep 1
      kill -0 "$codex_pid" 2>/dev/null || exit 0
    done
    kill -TERM "$codex_pid" 2>/dev/null || true
    sleep 3
    kill -KILL "$codex_pid" 2>/dev/null || true
  ) >/dev/null 2>&1 &
  local watchdog_pid=$!
  # watchdog が先に死んでも wait がブロックしないよう disown する
  disown "$watchdog_pid" 2>/dev/null || true

  # set -e 下では wait が非ゼロを返すと即終了してしまい、後続の失敗検出に
  # 到達できない。|| で受けて rc を捕捉する。
  local rc=0
  wait "$codex_pid" || rc=$?

  # codex が正常終了したら watchdog を殺して後処理
  kill -TERM "$watchdog_pid" 2>/dev/null || true

  # 保存した出力をユーザーに見せる
  cat "$out_file"

  # chatgpt モードでモデル非対応/CLI更新要求 → 次の定額モデルで回復しうるので区別する
  # （再ログインしても直らないため認証失敗とは分ける）
  if [[ $rc -ne 0 && "$CODEX_AUTH" == "chatgpt" ]] \
     && grep -qiE 'not supported when using codex with a chatgpt account|requires a newer version of codex' "$out_file"; then
    echo "" >&2
    echo "CODEX_MODEL_UNSUPPORTED: ChatGPT アカウントでモデル '${model}' が使えません。" >&2
    return "$CODEX_MODEL_UNSUPPORTED_EXIT"
  fi

  # chatgpt モードで失敗 かつ 認証エラーらしき出力 → 認証失敗として通知
  if [[ $rc -ne 0 && "$CODEX_AUTH" == "chatgpt" ]] \
     && grep -qiE 'not logged in|please run .*login|run `codex login`|unauthorized|401|403|authentication failed|token (has )?expired|credentials|re-?authenticate' "$out_file"; then
    echo "" >&2
    echo "CODEX_AUTH_FAILED: ChatGPT Plus 連携の認証に失敗しました（未ログイン/トークン失効の可能性）。" >&2
    echo "  対処: ターミナルで \`codex login\` を実行して再ログインしてください。" >&2
    echo "  従量課金へはフォールバックしません（定額のみの方針）。" >&2
    return "$CODEX_AUTH_FAILED_EXIT"
  fi

  if [[ $rc -ne 0 ]]; then
    echo "⚠️  codex exited with code $rc (timeout=${CODEX_TIMEOUT_SEC}s)" >&2
  fi
  return $rc
}

# 課金方針を適用したうえで run_codex_once を呼ぶ外側の関数。
# chatgpt（定額）: モデル未対応なら同じ定額枠の次のモデルへ。全滅したら課金せず停止。
# apikey（従量課金）: CODEX_ALLOW_METERED=1 がない限り実行を拒否する。
run_codex() {
  local prompt="$1"

  if [[ "$CODEX_AUTH" == "apikey" ]]; then
    if [[ "$CODEX_ALLOW_METERED" != "1" ]]; then
      echo "ERROR: 従量課金経路は無効化されています（定額のみの方針・2026-09-12 CEO 決定）。" >&2
      echo "       ChatGPT Plus の定額枠が使えないときは、課金せず停止するのが既定の挙動です。" >&2
      echo "       対処: npm install -g @openai/codex@latest で CLI を更新、または codex login。" >&2
      echo "       それでも従量課金で実行する必要がある場合のみ:" >&2
      echo "         CODEX_ALLOW_METERED=1 CODEX_AUTH=apikey $0 <mode>" >&2
      echo "       その場合 model=${CODEX_APIKEY_MODEL} で実行されます（最安モデルを固定）。" >&2
      exit 1
    fi
    echo "💸 警告: 従量課金で実行します（CODEX_ALLOW_METERED=1 が指定されています）。" >&2
    echo "   model=${CODEX_APIKEY_MODEL} ・ ChatGPT Plus の定額枠は使いません。" >&2
    local rc=0
    run_codex_once "$CODEX_APIKEY_MODEL" "$prompt" || rc=$?
    return $rc
  fi

  # ---- ここから定額経路 ----
  # CLI バージョン確認・使用量警告・使用量記録は1回だけ行う。
  # モデル未対応で再試行しても、Plus のレート制限を二重に数えない。
  check_cli_version
  warn_if_near_limit
  record_usage

  local -a models=("$CODEX_CHATGPT_MODEL")
  # 空白区切りの文字列を配列に展開する（意図的な word splitting）。
  # shellcheck disable=SC2206
  models+=($CODEX_CHATGPT_MODEL_FALLBACKS)

  local i rc=0
  for (( i = 0; i < ${#models[@]}; i++ )); do
    rc=0
    run_codex_once "${models[$i]}" "$prompt" || rc=$?
    # モデル未対応以外（成功・認証失敗・その他エラー）はそのまま返す。
    # モデルを変えても結果が変わらないため再試行しない。
    if [[ $rc -ne $CODEX_MODEL_UNSUPPORTED_EXIT ]]; then
      return $rc
    fi
    if (( i + 1 < ${#models[@]} )); then
      echo "   → 同じ定額枠の次のモデル（${models[$((i + 1))]}）を試します。" >&2
    fi
  done

  # 定額枠のモデルが全滅。従量課金には落とさず、ここで止める。
  echo "" >&2
  echo "CODEX_AUTH_FAILED: 定額枠で使えるモデルがありませんでした（試行: ${models[*]}）。" >&2
  echo "  従量課金へはフォールバックしません（定額のみの方針・2026-09-12 CEO 決定）。" >&2
  echo "  対処1: npm install -g @openai/codex@latest（新モデルは新版 CLI を要求する）" >&2
  echo "  対処2: codex login で再ログイン" >&2
  echo "  対処3: Claude 側（Opus 5 / /persona-review）でレビューを代替する" >&2
  check_cli_version force
  return "$CODEX_AUTH_FAILED_EXIT"
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

  version-check)
    # キャッシュを無視して npm の最新版と突き合わせる（/weekly-check から呼ばれる）。
    echo "使用モデル: ${CODEX_CHATGPT_MODEL}${CODEX_REASONING_EFFORT:+ / effort=${CODEX_REASONING_EFFORT}}" >&2
    echo "定額フォールバック: ${CODEX_CHATGPT_MODEL_FALLBACKS}" >&2
    echo "従量課金: 無効（有効化には CODEX_ALLOW_METERED=1・その場合 model=${CODEX_APIKEY_MODEL}）" >&2
    check_cli_version force
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
  version-check       CLI が npm 最新版に追随しているか確認（キャッシュ無視）

Examples:
  $0 plan docs/superpowers/plans/2026-04-18-seeds-m1-fts5.md
  $0 diff
  # 従量課金は既定で無効。必要な場合のみ明示許可する（通常は使わない）
  # CODEX_ALLOW_METERED=1 CODEX_AUTH=apikey $0 diff
  $0 file src/app/api/cards/route.ts
  $0 custom "src/lib/db.ts のコネクションプーリングを評価せよ"
  $0 usage
  $0 version-check

認証と課金方針（2026-09-12 CEO 決定「定額のみに限定」）:
  既定は chatgpt（ChatGPT Plus 連携・定額）。従量課金には自動でも手動確認でも
  フォールバックしない。
  モデルが使えない場合は同じ定額枠のまま CODEX_CHATGPT_MODEL →
  CODEX_CHATGPT_MODEL_FALLBACKS の順に試し、全滅したら終了コード 75 と
  "CODEX_AUTH_FAILED" を出して課金せず停止する。
  apikey モードは CODEX_ALLOW_METERED=1 がない限り実行を拒否する。

Env overrides:
  CODEX_AUTH                 認証モード（chatgpt|apikey・既定 chatgpt）
  CODEX_ALLOW_METERED        従量課金の明示許可（既定: 0 = 無効）
                             ※ 1 以外のとき apikey モードは実行を拒否する
  CODEX_CHATGPT_MODEL        ChatGPT 連携で使うモデル（既定: gpt-6-astra・要 CLI 0.153+）
                             ※ codex 既定 gpt-5.3-codex は API 一覧から消滅（2026-09-12）
                             ※ 単体 "gpt-5.6" は非対応。sol/terra/luna の階層名が必須
  CODEX_CHATGPT_MODEL_FALLBACKS
                             定額枠での段階フォールバック（既定: "gpt-5.6-sol gpt-5.5"）
                             ※ 従量課金でしか使えないモデルを入れてはならない
  CODEX_APIKEY_MODEL         apikey モードのモデル（既定: gpt-5.6-luna を最安で固定）
                             ※ 省略すると CLI 既定の高額モデルが使われるため必ず指定する
  CODEX_REASONING_EFFORT     推論の深さ（既定: high。空文字でモデル既定に委ねる）
                             ※ GPT-6 世代は low/medium/high/xhigh/max/ultra
                             ※ chatgpt モードのみ適用
  CODEX_FALLBACK_KEY_FILE    フォールバックキーの場所（既定: ~/.codex/fallback-api-key）
  CODEX_USAGE_LOG            使用ログのパス（既定: ~/.codex/usage.log）
  CODEX_USAGE_WINDOW_SEC     追跡ウィンドウ秒数（既定: 18000 = 5h）
  CODEX_USAGE_WARN_AT        警告閾値（既定: 20 回）
  CODEX_USAGE_LIMIT_ESTIMATE ChatGPT Plus 推定上限（既定: 30 回）
  CODEX_VERSION_CHECK        CLI バージョン追随チェック（既定: 1。0 で無効）
  CODEX_VERSION_CHECK_INTERVAL_SEC  npm 照会の間隔（既定: 86400 = 24h）
  CODEX_VERSION_CHECK_TIMEOUT_SEC   npm 照会のタイムアウト（既定: 5 秒）
EOF
    exit 1
    ;;
esac
