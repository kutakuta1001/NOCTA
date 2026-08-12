#!/usr/bin/env bash
# commit-guard — 検証実証なしの commit/push/deploy 提案を block する Stop hook
#
# 判定式: block = new_proposal AND NOT verification_reported
#                 AND NOT direction_query AND NOT future_step_description
# verification_reported が欠落（null）した場合も violation 側に倒す。
# それ以外の judge 障害はすべて fail-open（exit 0）。
set -u
. "$HOME/.claude/hooks/stop-hook-lib.sh"

guard_recursion
read_hook_input
TEXT="$(extract_judge_text)"
[ -n "$TEXT" ] || exit 0

# --- Layer 1: commit 提案らしき語を広めに拾う（recall 担当・~10ms） ---
PROPOSE='次の作業.*([Cc]ommit|コミット)|([Cc]ommit|コミット).*(お任せ|しますか|どうしますか|必要です|しましょう)|(進めてよい|進めますか|よろしいですか).*(コミット|[Cc]ommit|push|デプロイ|deploy)|(コミット|[Cc]ommit).*(に(進|行|移)|する|します)|(push|プッシュ|デプロイ)します'
printf '%s' "$TEXT" | grep -qE "$PROPOSE" || exit 0

# --- Layer 1 bypass: 明白な allow は LLM を経ずに素通し ---
BYPASS='(commit|コミット)[[:space:]]*(しました|済み|完了)|commit[:：]?[[:space:]]*[0-9a-f]{7,}|Q[0-9]+[:：]|(test|テスト).{0,10}(PASS|パス|通過|成功|OK)|全[[:space:]]*(PASS|pass)|pass=[0-9]+.*fail=0|rc=0|CI[[:space:]]green|build[[:space:]]PASS|workflow[[:space:]]success|cmp[[:space:]]一致|順次実行|一気通貫|後に[[:space:]]*(commit|push|コミット)'
if printf '%s' "$TEXT" | grep -qE "$BYPASS"; then
  log_decision commit-guard bypass allow "layer1-bypass"
  exit 0
fi

# --- Layer 2: LLM 意味判定（precision 担当） ---
REDACTED="$(printf '%s' "$TEXT" | redact_secrets)"

JUDGE_PROMPT='以下の agent 応答本文について、commit / push / deploy / PR 作成 等の shared-state 変更を「これから新規に提案している」か、同じ本文内に検証フェーズ完了報告があるか、ユーザー判断待ちの方向性確認か、多段手順の future step 説明かを判定してください。

JSON で {"new_proposal": true|false, "verification_reported": true|false, "direction_query": true|false, "future_step_description": true|false, "reason": "..."} を 1 行だけ返してください。reason は日本語で簡潔に。

new_proposal=true:
- 「次に commit します」「commit に進みます」「commit しましょう」のような新規提案。
- 口語形の実行要求（「そろそろ commit してよ」等）も direction_query ではなく new_proposal=true。

verification_reported=true:
- テスト実行・手動確認・E2E 等の完了報告。
- test PASS / 全 PASS / N 件 pass / build PASS / CI green / rc=0 / 疎通確認 完了。
- cmp 一致 / 配置反映の確認 / 具体的な commit SHA (7-40 桁) の完了報告。

direction_query=true:
- Q1/Q2、どちらがよいか、判断が必要、承認をもらえたら実行、などユーザー判断待ち。

future_step_description=true:
- 「〜後に commit」「〜完了後 → commit」などの順序記述。
- 「順次実行します」「フローを完走」「push まで進めます」など承認後シーケンスの説明。
- slash command 手順やルール・ドキュメントの説明。

false positive として new_proposal=false または direction_query=true にするもの:
- 過去に commit 済みの報告、backlog/TODO の記録、別 repo/session の説明、引用・撤回・禁止例の解説。
- 多段手順で commit/push/deploy を「後続ステップ」として説明しているだけの記述。'

START="$(date +%s)"
VERDICT="$(call_judge commit-guard "$JUDGE_PROMPT" "$REDACTED" || true)"
ELAPSED="$(( $(date +%s) - START ))"

DECISION="$(printf '%s' "$VERDICT" | jq -r '
  if type != "object" then "fail"
  elif (.new_proposal? == true and .verification_reported? == false
        and .direction_query? != true and .future_step_description? != true) then "violation"
  elif (.new_proposal? == true and (.verification_reported? == null)
        and .direction_query? != true and .future_step_description? != true) then "violation"
  else "allow" end
' 2>/dev/null)"
[ -n "$DECISION" ] || DECISION="fail"

REASON="$(printf '%s' "$VERDICT" | jq -r '.reason // ""' 2>/dev/null | head -c 200 | iconv -f UTF-8 -t UTF-8 -c 2>/dev/null)"
log_decision commit-guard hit "$DECISION" "redact=${REDACT_COUNT} ${ELAPSED}s ${REASON}"

if [ "$DECISION" = "violation" ]; then
  echo "commit-guard: 検証実証が本文に無いまま commit/push/deploy を提案しています。テスト実行結果（PASS/FAIL 件数・rc）や動作確認の実証を本文に示すか、実施せず選択肢としてユーザーに判断を仰いでください。判定理由: ${REASON}" >&2
  exit 2
fi
exit 0  # allow / fail はいずれも fail-open
