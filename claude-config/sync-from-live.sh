#!/usr/bin/env bash
# claude-config を ~/.claude の現状に同期する（live → 版管理コピー）
#
# 背景: 2026-08-12 の点検で、版管理コピー30件のうち28件が古くなっていた。
# 手動コピー運用ではドリフトが必ず起きるため、同期を1コマンドにまとめる。
#
# settings.json は同期しない。live 版は env に API キーを平文で持つため、
# リポジトリに入れてはならない（permissions と hooks の変更を反映したい場合は
# 該当キーのみを手で写す）。
set -eu

C="$HOME/.claude"
V="$(cd "$(dirname "$0")" && pwd)"

DIRS="commands commands/references agents references hooks scripts"

echo "同期元: $C"
echo "同期先: $V"
echo

for d in $DIRS; do
  mkdir -p "$V/$d"
  # live に存在するファイルをコピー（.DS_Store は除く）
  find "$C/$d" -maxdepth 1 -type f ! -name ".DS_Store" -exec cp {} "$V/$d/" \;
done

# live から消えたファイルを版管理側からも消す（改名の残骸対策）
removed=0
for d in $DIRS; do
  for f in "$V/$d"/*; do
    [ -f "$f" ] || continue
    n="$(basename "$f")"
    [ "$n" = ".DS_Store" ] && continue
    if [ ! -f "$C/$d/$n" ]; then
      echo "  live から消滅: $d/$n（版管理側からも削除）"
      rm "$f"
      removed=$((removed + 1))
    fi
  done
done

# 検証
same=0; diff=0
for d in $DIRS; do
  for f in "$C/$d"/*; do
    [ -f "$f" ] || continue
    n="$(basename "$f")"
    [ "$n" = ".DS_Store" ] && continue
    if cmp -s "$f" "$V/$d/$n"; then
      same=$((same + 1))
    else
      diff=$((diff + 1))
      echo "  不一致: $d/$n"
    fi
  done
done

echo
echo "一致 $same 件 / 不一致 $diff 件 / 削除 $removed 件"
echo
echo "機密スキャン:"
if grep -rlE "AIza[0-9A-Za-z_-]{30}|r8_[A-Za-z0-9]{20}|sk-[A-Za-z0-9]{20}|key_[a-f0-9]{40}|xoxb-|ghp_[A-Za-z0-9]{20}|BEGIN (RSA )?PRIVATE KEY" \
     $(for d in $DIRS; do echo "$V/$d"; done) 2>/dev/null; then
  echo "  実キーを検出。コミットせずに内容を確認すること"
  exit 1
else
  echo "  実キーの検出なし"
fi

echo
echo "次: git add claude-config/ で差分を確認してからコミットする"
[ "$diff" -eq 0 ] || exit 1
