#!/bin/bash
# SessionStart Hook: context.md と handoff.md を自動読み込みしてモデルに渡す
# 実行場所: project_NOCTA/ (Claude Code の working directory)

python3 << 'PYEOF'
import json, sys

def read_file(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read().strip()
    except:
        return None

context = read_file('context.md')
handoff_content = read_file('handoff.md')

# handoff.md は直近5行のみ取得（コンテキスト節約）
if handoff_content:
    lines = [l for l in handoff_content.split('\n') if l.strip()]
    handoff = '\n'.join(lines[-5:]) if lines else None
else:
    handoff = None

if not context and not handoff:
    sys.exit(0)

parts = ['[SessionStart Auto-Load]']
if context:
    parts.append('## context.md\n' + context)
if handoff:
    parts.append('## handoff.md（直近5行）\n' + handoff)

message = '\n\n'.join(parts)

output = {
    "hookSpecificOutput": {
        "hookEventName": "SessionStart",
        "additionalContext": message
    }
}
print(json.dumps(output, ensure_ascii=False))
PYEOF
