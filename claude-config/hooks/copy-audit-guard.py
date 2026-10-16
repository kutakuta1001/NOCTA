#!/usr/bin/env python3
"""copy-audit-guard — NOCTA の紹介ページ・カード説明文を含む git commit の前に文言監査を求める PreToolUse hook

背景: 2026-10-16、Barside の紹介ページが「説明ページ」になって公開直前まで残った。
CEO が push を頼む前の段階で、毎回自動で監査に回すための仕掛け。

動き:
  - Bash のコマンドに git commit があり、そのリポジトリに docs/tools-page-copy.md（正本）があるときだけ反応する
  - 正本の intro_pages に載っているページか、card_file の descJa / descEn の行がステージされていれば対象
  - ステージ内容の tree（git write-tree）に監査済みの印（<git-common-dir>/copy-audit/<tree>）があれば通す
  - なければ scripts/copy-lint.py の結果と手順を添えて deny する
  - git add と git commit の連結、pathspec や -a 付きの commit は、hook がステージ内容を見られないので
    分けて実行するよう deny する
  - 解釈できないコマンドや lint の故障は fail-open（通したうえで「監査を実行できなかった」を伝える）

ソースは project_NOCTA/claude-config/hooks/。~/.claude/hooks/ へは cp で配置する。
"""
import datetime
import fnmatch
import json
import os
import re
import shlex
import subprocess
import sys
import time
from pathlib import Path

RULES = "docs/tools-page-copy.md"
LINT = "scripts/copy-lint.py"
BUDGET_SEC = 20
START = time.time()

COMMIT_VALUE_SHORT = set("mFCct")
COMMIT_VALUE_LONG = {"--message", "--file", "--reuse-message", "--reedit-message", "--fixup", "--squash",
                     "--author", "--date", "--cleanup", "--template", "--trailer", "--pathspec-from-file"}
COMMIT_SCOPE_SHORT = set("ap")  # 作業ツリー全体を相手にするもの（-o / -i は pathspec の扱いを変えるだけ）
COMMIT_SCOPE_LONG = {"--all", "--patch", "--interactive"}
GIT_GLOBAL_VALUE = {"-c", "--git-dir", "--work-tree", "--namespace", "--exec-path"}


class Unparsable(Exception):
    pass


def log(msg):
    try:
        d = Path(os.environ.get("COPY_AUDIT_LOG_DIR") or (Path.home() / ".claude" / "logs"))
        d.mkdir(parents=True, exist_ok=True)
        f = d / ("copy-audit-guard-%s.log" % datetime.date.today().isoformat())
        with f.open("a", encoding="utf-8") as fh:
            fh.write("%s\t%s\n" % (datetime.datetime.now().isoformat(timespec="seconds"), msg.replace("\n", " ")[:500]))
    except OSError:
        pass


def remaining():
    left = BUDGET_SEC - (time.time() - START)
    if left <= 1:
        raise TimeoutError("時間切れ")
    return left


def run(args, cwd, check=True):
    r = subprocess.run(args, cwd=str(cwd), capture_output=True, timeout=min(10, remaining()))
    if check and r.returncode != 0:
        raise RuntimeError("%s: %s" % (" ".join(args[:3]), r.stderr.decode("utf-8", "replace").strip()))
    return r.stdout.decode("utf-8", "replace")


# ---- コマンドの解析 -------------------------------------------------------

HEREDOC = re.compile(r"<<-?\s*(['\"]?)([A-Za-z_][A-Za-z0-9_]*)\1")


def strip_heredocs(command):
    """ヒアドキュメントの本文を除く。本文の文字をコマンドとして読まないため。"""
    out, waiting = [], []
    for line in command.split("\n"):
        if waiting:
            if line.strip() == waiting[0]:
                waiting.pop(0)
            continue
        out.append(line)
        waiting.extend(m.group(2) for m in HEREDOC.finditer(line))
    return "\n".join(out)


def tokenize(command):
    lex = shlex.shlex(strip_heredocs(command), posix=True, punctuation_chars="();<>|&\n")
    lex.whitespace = " \t\r"
    lex.whitespace_split = True
    try:
        return list(lex)
    except ValueError as e:
        raise Unparsable(str(e))


def split_units(tokens):
    """&& ; 改行 | で単位に切る。|| は cd と組み合わさると行き先が決まらないので印を付ける。"""
    units, cur, has_or = [], [], False
    for t in tokens:
        if t and set(t) <= set("&;|\n") and t != "&":
            if "||" in t:
                has_or = True
            if cur:
                units.append(cur)
            cur = []
        elif t in ("(", ")"):
            continue
        else:
            cur.append(t)
    if cur:
        units.append(cur)
    return units, has_or


def strip_redirects(unit):
    out, skip = [], False
    for i, t in enumerate(unit):
        if skip:
            skip = False
            continue
        if t and set(t) <= set("<>&"):
            skip = True  # 続く字句はリダイレクト先
            continue
        if t.isdigit() and i + 1 < len(unit) and unit[i + 1][:1] in "<>":
            continue
        out.append(t)
    return out


def resolve(cwd, path):
    path = os.path.expandvars(os.path.expanduser(path))
    if "$" in path or "`" in path:
        raise Unparsable("行き先に展開できない変数がある: %s" % path)
    p = Path(path)
    return p if p.is_absolute() else (Path(cwd) / p)


def parse_git(unit, cwd):
    """git の単位なら (作業ディレクトリ, サブコマンド, 引数) を返す。"""
    i = 0
    while i < len(unit) and "=" in unit[i] and not unit[i].startswith("-") and unit[i] != "git":
        i += 1  # VAR=value の前置き
    if i >= len(unit) or os.path.basename(unit[i]) != "git":
        return None
    i += 1
    d = Path(cwd)
    while i < len(unit) and unit[i].startswith("-"):
        if unit[i] == "-C" and i + 1 < len(unit):
            d = resolve(d, unit[i + 1])
            i += 2
        elif unit[i] in GIT_GLOBAL_VALUE and i + 1 < len(unit):
            i += 2
        else:
            i += 1
    if i >= len(unit):
        return None
    return d, unit[i], unit[i + 1:]


def parse_commit_args(args):
    """(pathspec の一覧, 対象を変えるオプションがあるか) を返す。"""
    paths, scope, i, after_dd = [], False, 0, False
    while i < len(args):
        a = args[i]
        if after_dd:
            paths.append(a)
        elif a == "--":
            after_dd = True
        elif a.startswith("--"):
            name = a.split("=", 1)[0]
            if name in COMMIT_SCOPE_LONG:
                scope = True
            if name in COMMIT_VALUE_LONG and "=" not in a:
                i += 1
        elif a.startswith("-") and len(a) > 1:
            for j, ch in enumerate(a[1:]):
                if ch in COMMIT_SCOPE_SHORT:
                    scope = True
                if ch in COMMIT_VALUE_SHORT:
                    if j == len(a) - 2:
                        i += 1  # 値は次の字句
                    break
        else:
            paths.append(a)
        i += 1
    return paths, scope


def collect(command, cwd):
    units, has_or = split_units(tokenize(command))
    cur = Path(cwd)
    adds, commits, saw_cd = [], [], False
    for unit in units:
        unit = strip_redirects(unit)
        if not unit:
            continue
        if unit[0] == "cd":
            saw_cd = True
            cur = resolve(cur, unit[1]) if len(unit) > 1 else Path.home()
            continue
        g = parse_git(unit, cur)
        if not g:
            continue
        d, sub, args = g
        if sub == "add":
            adds.append((d, args))
        elif sub == "commit":
            commits.append((d, args))
    if commits and has_or and saw_cd:
        raise Unparsable("|| と cd の組み合わせ")
    return adds, commits


# ---- リポジトリの照会 ------------------------------------------------------

def toplevel(d):
    if not Path(d).is_dir():
        return None
    r = subprocess.run(["git", "-C", str(d), "rev-parse", "--show-toplevel"], capture_output=True,
                       timeout=min(10, remaining()))
    if r.returncode != 0:
        return None
    return Path(r.stdout.decode().strip()).resolve()


def load_rules(repo):
    staged = subprocess.run(["git", "show", ":" + RULES], cwd=str(repo), capture_output=True,
                            timeout=min(10, remaining()))
    text = staged.stdout.decode("utf-8") if staged.returncode == 0 else (repo / RULES).read_text(encoding="utf-8")
    start = text.index("```json copy-audit-config")
    body = text[text.index("\n", start) + 1:text.index("\n```", start)]
    return json.loads(body)


def under(path_arg, add_dir, repo, target):
    """git add の引数が target（リポジトリ相対）を含むか。"""
    if path_arg in ("-A", "--all", ":/", "-u", "--update"):
        return True
    if path_arg.startswith("-"):
        return False
    if any(c in path_arg for c in "*?["):
        full = path_arg if os.path.isabs(path_arg) else os.path.join(str(Path(add_dir).resolve()), path_arg)
        root = str(repo) + "/"
        if not full.startswith(root):
            return False
        pat = os.path.normpath(full[len(root):])
        return fnmatch.fnmatch(target, pat) or fnmatch.fnmatch(target, pat.rstrip("/") + "/*")
    try:
        rel = resolve(add_dir, path_arg).resolve().relative_to(repo).as_posix()
    except ValueError:
        return False
    return rel in (".", "") or target == rel or target.startswith(rel.rstrip("/") + "/")


def card_page(line):
    """カードの url 行が指すローカルページ（website/ 相対）。ローカルでなければ None。"""
    if "url:" not in line or '"./' not in line:
        return None
    rel = line.split('"./', 1)[1].split('"', 1)[0]
    return "website/" + (rel if rel.endswith(".html") else rel.rstrip("/") + "/index.html")


def staged_targets(repo, cfg):
    intro = set(cfg["intro_pages"])
    card = cfg["card_file"]
    names = []
    for line in run(["git", "diff", "--cached", "--name-status", "--no-renames"], repo).splitlines():
        parts = line.split("\t")
        if len(parts) >= 2:
            names.append(parts[-1])
    targets = [n for n in names if n in intro]
    notices = []
    if card in names:
        diff = run(["git", "diff", "--cached", "-U0", "--", card], repo)
        changed = [l for l in diff.splitlines() if l[:1] in "+-" and not l.startswith(("+++", "---"))]
        if any("descJa:" in l or "descEn:" in l for l in changed):
            targets.append(card)
        old = run(["git", "show", "HEAD:" + card], repo, check=False)
        known = {card_page(l) for l in old.splitlines()}
        for l in changed:
            page = card_page(l) if l.startswith("+") else None
            if page and page not in intro and page not in known:
                notices.append(page)
    return targets, notices


def unstaged_or_staged_change(repo, cfg):
    tracked = cfg["intro_pages"] + [cfg["card_file"]]
    out = run(["git", "diff", "--name-only", "HEAD", "--"] + tracked, repo, check=False)
    out += run(["git", "ls-files", "--others", "--exclude-standard", "--"] + tracked, repo, check=False)
    return [l for l in out.splitlines() if l.strip()]


def common_dir(repo):
    d = run(["git", "rev-parse", "--git-common-dir"], repo).strip()
    p = Path(d)
    return p if p.is_absolute() else (repo / p)


# ---- 判定 ---------------------------------------------------------------

def deny(reason):
    return {"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny",
                                   "permissionDecisionReason": reason}}


def context(text):
    return {"hookSpecificOutput": {"hookEventName": "PreToolUse", "additionalContext": text}}


def notice_text(pages):
    return ("apps-data.js に、紹介ページの一覧にないローカルページへのカードが増えています: %s。"
            "これが紹介ページ（紹介を挟んでアプリへ進む形）なら、docs/tools-page-copy.md の intro_pages に"
            "一覧に足すかを CEO に確かめてください。" % "、".join(sorted(set(pages))))


def audit_reason(tree, targets, lint_out, notices):
    lines = ["copy-audit-guard: 紹介ページかカード説明文の変更がステージされています。コミットの前に文言監査が必要です。",
             "対象: %s" % "、".join(targets),
             "tree: %s" % tree,
             "",
             "copy-lint の結果:",
             lint_out or "（指摘なし）",
             "",
             "手順:",
             "1. python3 scripts/copy-lint.py --export %s <一時ディレクトリ> %s で、この tree の版を書き出す" % (tree, " ".join(targets)),
             "2. 書き出した版と上の lint 結果を copy-auditor エージェントに渡して監査する（基準は docs/tools-page-copy.md）。"
             "copy-auditor が見つからないセッションでは、general-purpose（model: opus）に ~/.claude/agents/copy-auditor.md を読ませて同じ指示で監査する",
             "3. 「消す / 短くする / 残す」の一覧（10 行程度）と直した版を CEO に見せる。直すのは文言だけで、SVG・見本・画像に触れない",
             "4. 直して add し直したら tree が変わるので、もう一度コミットを試してこの hook に通す",
             "5. CEO が OK を出したあとにだけ python3 scripts/copy-lint.py --mark <CEO に見せた tree> を実行し、再コミットする。"
             "CEO の OK なしに印を付けてこの hook を回避してはならない"]
    if notices:
        lines += ["", notice_text(notices)]
    return "\n".join(lines)[:6000]


def format_findings(payload):
    fs = payload.get("findings")
    if not isinstance(fs, list):
        raise ValueError("findings がない")
    out = ["%s\t%s\t%s\t%s" % (f["severity"], f["kind"], f["location"], f["excerpt"]) for f in fs]
    text = "\n".join(out)
    return text[:2000] + ("\n…（以下略）" if len(text) > 2000 else "")


def decide_commit(repo, commit_dir, adds, args):
    cfg = load_rules(repo)
    changed = None  # 対象のうち、HEAD から変わっている・まだ追跡していないもの（必要になったときだけ調べる）

    def changed_targets():
        nonlocal changed
        if changed is None:
            changed = unstaged_or_staged_change(repo, cfg)
        return changed

    for add_dir, add_args in adds:
        if toplevel(add_dir) != repo:
            continue
        if any(under(a, add_dir, repo, t) for a in add_args for t in changed_targets()):
            return deny("copy-audit-guard: git add と git commit が 1 つのコマンドにつながっていて、紹介ページかカードの"
                        "ファイルが含まれています。hook はコミット前のステージ内容しか見られないので、"
                        "git add と git commit を別々の Bash で実行してください。")

    paths, scope = parse_commit_args(args)
    hit = scope and changed_targets()
    if paths and not hit:
        hit = any(under(a, commit_dir, repo, t) for a in paths for t in changed_targets())
    if hit:
        return deny("copy-audit-guard: pathspec や -a / -o / -i / -p 付きの git commit は、ステージしていない紹介ページや"
                    "カードの変更までコミットするため監査できません。対象を個別に git add してから、"
                    "通常の git commit を別の Bash で実行してください。")

    targets, notices = staged_targets(repo, cfg)
    if not targets:
        return context(notice_text(notices)) if notices else None

    tree = run(["git", "write-tree"], repo).strip()
    if (common_dir(repo) / "copy-audit" / tree).exists():
        log("PASS-MARKED\t%s\t%s" % (repo, tree))
        return context(notice_text(notices)) if notices else None

    r = subprocess.run([sys.executable, str(repo / LINT), "--tree", tree, "--json"] + targets,
                       cwd=str(repo), capture_output=True, timeout=min(10, remaining()))
    if r.returncode != 0:
        raise RuntimeError("copy-lint の終了コード %d: %s" % (r.returncode, r.stderr.decode("utf-8", "replace")[:300]))
    payload = json.loads(r.stdout.decode("utf-8"))
    if payload.get("ok") is not True or payload.get("tree") != tree:
        raise ValueError("copy-lint の出力が不正")
    log("DENY\t%s\t%s\t%s" % (repo, tree, ",".join(targets)))
    return deny(audit_reason(tree, targets, format_findings(payload), notices))


def decide(command, cwd):
    if "commit" not in command or "git" not in command:
        return None
    try:
        adds, commits = collect(command, cwd)
    except Unparsable as e:
        log("UNPARSABLE\t%s\t%s" % (e, command))
        return context("copy-audit-guard: コマンドを解釈できず、文言の監査を実行できなかった（%s）。"
                       "紹介ページやカード説明文を含むコミットなら、コマンドを単純な形に分けてやり直してください。" % e)
    for d, args in commits:
        repo = toplevel(d)
        if repo is None or not (repo / RULES).exists():
            continue
        return decide_commit(repo, d, adds, args)
    return None


def main():
    try:
        data = json.loads(sys.stdin.read() or "{}")
        command = (data.get("tool_input") or {}).get("command") or ""
        cwd = data.get("cwd") or os.getcwd()
        out = decide(command, cwd)
    except Exception as e:  # fail-open
        log("ERROR\t%r" % e)
        out = context("copy-audit-guard: 文言の監査を実行できなかった（%s）。紹介ページやカード説明文を含むコミットなら、"
                      "python3 scripts/copy-lint.py と copy-auditor で手動で監査してから CEO に見せてください。" % e)
    if out:
        print(json.dumps(out, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
