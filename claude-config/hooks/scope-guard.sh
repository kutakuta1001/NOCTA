#!/usr/bin/env bash
# scope-guard — agent 側の判断による作業の打ち切り・分割・先送り提案を検知する Stop hook
#
# 判定式: violation = new_proposal AND NOT retraction_or_quote
# 既定は warn モード（systemMessage 表示のみ・block しない）。
# 誤検知傾向を ~/.claude/logs/ で確認後、STOP_HOOK_SCOPE_MODE=block で昇格できる。
set -u
. "$HOME/.claude/hooks/stop-hook-lib.sh"

MODE="${STOP_HOOK_SCOPE_MODE:-warn}"

guard_recursion
read_hook_input
TEXT="$(extract_judge_text)"
[ -n "$TEXT" ] || exit 0

# --- Layer 1: セッション分割・スコープ縮小らしき語を広めに拾う ---
PROPOSE='(別|次の)セッション(で|に).{0,20}(続|継続|再開|やり)|(残り|続き)は(次回|別セッション|後日|後で)|コンテキスト(が|も)?.{0,6}(逼迫|限界|不足)|(後回し|先送り|見送り)にし|(一旦|ひとまず)(ここまで|保留)|(スコープ|作業範囲)を(縮小|削減|絞|分割)|(残りの?タスク|このタスク)は(スキップ|保留|割愛)'
printf '%s' "$TEXT" | grep -qE "$PROPOSE" || exit 0

# --- Layer 2: LLM 意味判定 ---
REDACTED="$(printf '%s' "$TEXT" | redact_secrets)"

JUDGE_PROMPT='以下の agent 応答本文について、agent 自身の判断で「承認済みの作業を別セッション送り・分割・保留・縮小する」新規提案をしているかを判定してください。

JSON で {"new_proposal": true|false, "retraction_or_quote": true|false, "reason": "..."} を 1 行だけ返してください。reason は日本語で簡潔に。

new_proposal=true:
- 「残りは別セッションでやります」「コンテキストが逼迫したので一部を保留します」など、agent 側からの一方的な打ち切り・deferred 化の提案。

retraction_or_quote=true（allow に倒す）:
- 引用・撤回・ルールやドキュメントの説明。
- 直前のユーザー指示の復唱（ユーザー自身が分割・後回しを指示した場合）。

new_proposal=false にするもの:
- プロダクトのロードマップ・戦略文書の内容として「Phase 2 に凍結」「後回し」等を記述・報告しているだけの場合（agent の作業自体は完走している）。
- 過去セッションの経緯説明。'

START="$(date +%s)"
VERDICT="$(call_judge scope-guard "$JUDGE_PROMPT" "$REDACTED" || true)"
ELAPSED="$(( $(date +%s) - START ))"

DECISION="$(printf '%s' "$VERDICT" | jq -r '
  if type != "object" then "fail"
  elif (.new_proposal? == true and .retraction_or_quote? != true) then "violation"
  else "allow" end
' 2>/dev/null)"
[ -n "$DECISION" ] || DECISION="fail"

REASON="$(printf '%s' "$VERDICT" | jq -r '.reason // ""' 2>/dev/null | head -c 200 | iconv -f UTF-8 -t UTF-8 -c 2>/dev/null)"
log_decision scope-guard hit "$DECISION" "mode=${MODE} redact=${REDACT_COUNT} ${ELAPSED}s ${REASON}"

if [ "$DECISION" = "violation" ]; then
  if [ "$MODE" = "block" ]; then
    echo "scope-guard: 承認済みスコープを agent 判断で縮小・分割・先送りしようとしています。ユーザーの承認なしに打ち切らず、続行するか、明示的に判断を仰いでください。判定理由: ${REASON}" >&2
    exit 2
  fi
  printf '{"systemMessage": "scope-guard: agent がスコープ縮小/セッション分割を提案しています（%s）"}\n' \
    "$(printf '%s' "$REASON" | head -c 120 | tr -d '"\\')"
fi
exit 0
