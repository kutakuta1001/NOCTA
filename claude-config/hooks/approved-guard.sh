#!/usr/bin/env bash
# approved-guard — outputs/approved/ への Bash 経由の書き込みを block する PreToolUse hook
#
# 背景: permissions.deny の Edit(path) ルールは Claude の組み込みファイルツールと
# Claude Code が認識する一部の Bash ファイルコマンド（cat/head/tail/sed 等）にしか効かない。
# cp / mv / tee / リダイレクト等の経路をこの hook が塞ぐ。
#
# 設計:
#   - 判定は正規表現のみ（LLM 判定なし・決定論的・数ミリ秒）
#   - 判定前にコマンドを正規化する。2026-08-05 の敵対的レビューで、正規化なしでは
#     "outputs"/"approved" 分割・outputs/./approved・cd outputs && cp ... approved/ が
#     無検知で通過することが判明したため
#   - fail-closed: jq 不在時も raw stdin を対象に判定を続ける（無条件 allow にしない）
#   - stop-hook-lib.sh は source しない（read_hook_input が transcript_path を要求し
#     無ければ exit 0 するため、PreToolUse では常に素通しになる）
#   - CEO 自身のターミナル操作はこの hook を通らないため影響を受けない
set -u

LOG_DIR="$HOME/.claude/logs"
LOG_FILE="$LOG_DIR/approved-guard-$(date +%Y-%m-%d).log"

RAW="$(cat 2>/dev/null || true)"
[ -n "$RAW" ] || exit 0

if command -v jq >/dev/null 2>&1; then
  COMMAND="$(printf '%s' "$RAW" | jq -r '.tool_input.command // empty' 2>/dev/null)"
else
  COMMAND="$RAW"
fi

[ -n "$COMMAND" ] || exit 0

# 正規化: バックスラッシュとクォートを除去し、/./ と重複スラッシュを収約する
NORM="$(printf '%s' "$COMMAND" | tr -d '\\' | tr -d '"' | tr -d "'" \
  | sed -e ':a' -e 's;/\./;/;g' -e 'ta' -e ':b' -e 's;//;/;g' -e 'tb')"

# approved ディレクトリへの言及がなければ即通過（大多数のケース）
printf '%s' "$NORM" | grep -qE '(^|[^[:alnum:]_-])approved(/|$|[^[:alnum:]_-])' || exit 0

# 書き込みの意図を示すパターン（コマンド名の境界に引用符除去後の記号類も含める）
B='(^|[[:space:];&|(){}$`=:,])'
WRITE_INTENT="${B}(cp|mv|rsync|ditto|cpio|tee|touch|mkdir|rmdir|rm|install|ln|dd|chmod|chown|truncate|unzip|tar)([[:space:]]|$)"
WRITE_INTENT="${WRITE_INTENT}|>[[:space:]]*[^[:space:]]*approved"
WRITE_INTENT="${WRITE_INTENT}|${B}sed[[:space:]]+-i"
WRITE_INTENT="${WRITE_INTENT}|shutil\.(copy|copy2|copyfile|move|copytree)|os\.(rename|replace|link|symlink|makedirs|mkdir)"
WRITE_INTENT="${WRITE_INTENT}|open\([^)]*[,[:space:]][^)]*(w|a|x)"
WRITE_INTENT="${WRITE_INTENT}|\.(write_text|write_bytes)\(|Path\([^)]*\)\.open\("
WRITE_INTENT="${WRITE_INTENT}|(writeFile|writeFileSync|createWriteStream|copyFileSync|renameSync|appendFile)"

mkdir -p "$LOG_DIR"
TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

if printf '%s' "$NORM" | grep -qE "$WRITE_INTENT"; then
  TAG=DENY
  [ "$NORM" = "$COMMAND" ] || TAG=DENY-NORMALIZED
  printf '%s\t%s\t%s\n' "$TS" "$TAG" "$COMMAND" >> "$LOG_FILE"
  printf '%s\n' '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"outputs/approved/ への書き込みは approved-guard により禁止されています（R-02）。承認済みファイルの配置は CEO の手動操作のみです。"}}'
  exit 0
fi

printf '%s\t%s\t%s\n' "$TS" "ALLOW-READONLY" "$COMMAND" >> "$LOG_FILE"
exit 0
