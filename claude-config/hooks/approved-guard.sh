#!/usr/bin/env bash
# approved-guard — outputs/approved/ への Bash 経由の書き込みを block する PreToolUse hook
#
# 背景: permissions.deny の Edit(path) ルールは Claude の組み込みファイルツールと
# Claude Code が認識する一部の Bash ファイルコマンド（cat/head/tail/sed 等）にしか効かない。
# cp / mv / tee / リダイレクト等の経路をこの hook が塞ぐ。
#
# 設計:
#   - 判定は正規表現のみ（LLM 判定なし・決定論的・数ミリ秒）
#   - fail-closed（判定に迷ったら deny 側に倒す）
#   - stop-hook-lib.sh は source しない（read_hook_input が transcript_path を要求し
#     無ければ exit 0 するため、PreToolUse では常に素通しになる）
#   - CEO 自身のターミナル操作はこの hook を通らないため影響を受けない
set -u

LOG_DIR="$HOME/.claude/logs"
LOG_FILE="$LOG_DIR/approved-guard-$(date +%Y-%m-%d).log"

INPUT="$(cat 2>/dev/null || true)"
COMMAND="$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)"

# コマンドが取れない場合は判定対象外（他ツールの呼び出し等）
[ -n "$COMMAND" ] || exit 0

# approved/ に言及していなければ即通過（大多数のケース）
printf '%s' "$COMMAND" | grep -qE 'outputs/approved' || exit 0

# 書き込みの意図を示すパターン
WRITE_INTENT='(^|[[:space:];&|])(cp|mv|rsync|tee|touch|mkdir|rm|install|ln|dd|chmod|chown)([[:space:]]|$)|>[[:space:]]*[^[:space:]]*outputs/approved|>>[[:space:]]*[^[:space:]]*outputs/approved|sed[[:space:]]+-i|python3?[[:space:]].*open\(|node[[:space:]].*writeFile'

if printf '%s' "$COMMAND" | grep -qE "$WRITE_INTENT"; then
  mkdir -p "$LOG_DIR"
  printf '%s\tDENY\t%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$COMMAND" >> "$LOG_FILE"
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "outputs/approved/ への書き込みは approved-guard により禁止されています（R-02）。承認済みファイルの配置は CEO の手動操作のみです。"
    }
  }'
  exit 0
fi

# approved/ に言及しているが書き込み意図が読み取れないケース（読み取り専用の cat / ls / grep 等）は通過
mkdir -p "$LOG_DIR"
printf '%s\tALLOW\t%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$COMMAND" >> "$LOG_FILE"
exit 0
