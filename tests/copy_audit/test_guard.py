"""copy-audit-guard（PreToolUse hook）のテスト。実行: /usr/bin/python3 -m unittest discover -s tests/copy_audit -v"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
FIX = Path(__file__).resolve().parent / "fixtures"
GUARD = REPO / "claude-config" / "hooks" / "copy-audit-guard.py"
APPROVED = (FIX / "barside_approved.html").read_text(encoding="utf-8")
PAGE = "website/barside/index.html"

CARDS = '''const NOCTA_APPS = [
  {
    title: "Barside",
    url: "./barside/index.html",
    descJa: "夜のバーの常連と、英語でひとこと。",
    descEn: "A little English at the bar."
  },
  {
    title: "iro",
    url: "./iro/index.html",
    descJa: "色を選ぶ道具。",
    descEn: "Pick colors."
  }
];
'''


def git(cwd, *args):
    return subprocess.run(["git", "-C", str(cwd)] + list(args), check=True,
                          capture_output=True, text=True).stdout.strip()


def init_repo(path, with_rules=True):
    path.mkdir(parents=True)
    git(path.parent, "init", "-q", str(path))
    git(path, "config", "user.email", "t@example.com")
    git(path, "config", "user.name", "t")
    if with_rules:
        (path / "docs").mkdir()
        (path / "scripts").mkdir()
        shutil.copy(str(REPO / "docs" / "tools-page-copy.md"), str(path / "docs" / "tools-page-copy.md"))
        shutil.copy(str(REPO / "scripts" / "copy-lint.py"), str(path / "scripts" / "copy-lint.py"))
    (path / "website" / "barside").mkdir(parents=True)
    (path / "website" / "iro").mkdir()
    (path / "website" / "barside" / "index.html").write_text(APPROVED, encoding="utf-8")
    (path / "website" / "iro" / "index.html").write_text("<p>iro</p>", encoding="utf-8")
    (path / "website" / "apps-data.js").write_text(CARDS, encoding="utf-8")
    (path / "notes.txt").write_text("a", encoding="utf-8")
    git(path, "add", ".")
    git(path, "commit", "-q", "-m", "init")
    return path


class GuardTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.root = Path(self.tmp)
        self.repo = init_repo(self.root / "repo")
        self.logs = self.root / "logs"

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def hook(self, command, cwd=None):
        env = dict(os.environ, COPY_AUDIT_LOG_DIR=str(self.logs))
        payload = {"tool_name": "Bash", "tool_input": {"command": command},
                   "cwd": str(cwd or self.repo), "hook_event_name": "PreToolUse"}
        r = subprocess.run([sys.executable, str(GUARD)], input=json.dumps(payload),
                           capture_output=True, text=True, env=env, timeout=60)
        self.assertEqual(r.returncode, 0, r.stderr)
        return json.loads(r.stdout)["hookSpecificOutput"] if r.stdout.strip() else None

    def denied(self, out):
        return out is not None and out.get("permissionDecision") == "deny"

    def edit(self, rel, old, new, stage=True):
        p = self.repo / rel
        p.write_text(p.read_text(encoding="utf-8").replace(old, new, 1), encoding="utf-8")
        if stage:
            git(self.repo, "add", rel)

    def edit_page(self, stage=True):
        self.edit(PAGE, "うまく話せなくても", "Tailscale で、うまく話せなくても", stage)

    def mark(self):
        tree = git(self.repo, "write-tree")
        subprocess.run([sys.executable, "scripts/copy-lint.py", "--mark", tree], cwd=str(self.repo),
                       check=True, capture_output=True)
        return tree

    # 紹介ページ
    def test_intro_page_without_mark_denied(self):
        self.edit_page()
        tree = git(self.repo, "write-tree")
        out = self.hook("git commit -m x")
        self.assertTrue(self.denied(out))
        reason = out["permissionDecisionReason"]
        for needle in ("BANNED", "Tailscale", "copy-auditor", tree, "--export", "--mark"):
            self.assertIn(needle, reason)

    def test_intro_page_with_mark_passes(self):
        self.edit_page()
        self.mark()
        self.assertIsNone(self.hook("git commit -m x"))

    def test_edit_after_mark_denied_again(self):
        self.edit_page()
        self.mark()
        self.edit(PAGE, "大丈夫", "大丈夫です")
        self.assertTrue(self.denied(self.hook("git commit -m x")))

    def test_app_page_passes(self):
        self.edit("website/iro/index.html", "iro", "iro2")
        self.assertIsNone(self.hook("git commit -m x"))

    # カード
    def test_card_url_only_passes(self):
        self.edit("website/apps-data.js", 'url: "./iro/index.html"', 'url: "./iro/"')
        self.assertIsNone(self.hook("git commit -m x"))

    def test_card_desc_denied(self):
        self.edit("website/apps-data.js", "色を選ぶ道具。", "色を選ぶ、とても便利な道具。")
        self.assertTrue(self.denied(self.hook("git commit -m x")))

    def test_new_card_with_desc_denied_with_notice(self):
        self.edit("website/apps-data.js", "];", '''  {
    title: "newtool",
    url: "./newtool/index.html",
    descJa: "新しい道具。",
    descEn: "A new tool."
  }
];''')
        out = self.hook("git commit -m x")
        self.assertTrue(self.denied(out))
        self.assertIn("newtool", out["permissionDecisionReason"])
        self.assertIn("一覧に足すか", out["permissionDecisionReason"])

    def test_new_card_url_notice_only(self):
        self.edit("website/apps-data.js", 'url: "./iro/index.html"', 'url: "./newtool/index.html"')
        out = self.hook("git commit -m x")
        self.assertFalse(self.denied(out))
        self.assertIn("newtool", out["additionalContext"])

    # コマンドの形
    def test_combined_add_commit_denied(self):
        self.edit_page(stage=False)
        for cmd in ("git add %s && git commit -m x" % PAGE, "git add %s\ngit commit -m x" % PAGE):
            out = self.hook(cmd)
            self.assertTrue(self.denied(out), cmd)
            self.assertIn("別々", out["permissionDecisionReason"])

    def test_pathspec_commit_denied(self):
        self.edit_page(stage=False)
        for cmd in ("git commit -m x -- %s" % PAGE, "git commit -am x", "git commit -o %s -m x" % PAGE):
            out = self.hook(cmd)
            self.assertTrue(self.denied(out), cmd)
            self.assertIn("通常の git commit", out["permissionDecisionReason"])

    def test_message_mentions_paths_not_combined(self):
        self.edit("notes.txt", "a", "b")
        self.assertIsNone(self.hook('git commit -m "%s と git add の話"' % PAGE))

    def test_quoted_operators(self):
        self.edit("notes.txt", "a", "b")
        self.assertIsNone(self.hook('git commit -m "a && git add %s"' % PAGE))

    def test_heredoc_message(self):
        self.edit_page()
        cmd = "git commit -q -m \"$(cat <<'EOF'\nfix(barside): 文言\n\nCo-Authored-By: x\nEOF\n)\" && git log --oneline -1"
        self.assertTrue(self.denied(self.hook(cmd)))

    def test_cd_prefix_resolves_repo(self):
        self.edit_page()
        out = self.hook("cd %s && git commit -m x 2>&1 | tail -3" % self.repo, cwd=self.root)
        self.assertTrue(self.denied(out))

    def test_git_C_resolves_repo(self):
        self.edit_page()
        self.assertTrue(self.denied(self.hook("git -C %s commit -m x" % self.repo, cwd=self.root)))

    def test_add_in_other_repo_not_combined(self):
        other = init_repo(self.root / "other")
        self.edit("notes.txt", "a", "b")
        cmd = "git -C %s add %s; git -C %s commit -m x" % (other, PAGE, self.repo)
        self.assertIsNone(self.hook(cmd, cwd=self.root))

    def test_or_chain_ambiguous_fail_open(self):
        self.edit_page()
        out = self.hook("cd a || cd %s; git commit -m x" % self.repo, cwd=self.root)
        self.assertFalse(self.denied(out))
        self.assertIn("監査を実行できなかった", out["additionalContext"])

    def test_other_repo_passes(self):
        plain = init_repo(self.root / "plain", with_rules=False)
        p = plain / PAGE
        p.write_text(APPROVED.replace("うまく", "Tailscale"), encoding="utf-8")
        git(plain, "add", PAGE)
        self.assertIsNone(self.hook("git commit -m x", cwd=plain))

    def test_non_commit_passes(self):
        self.edit_page()
        self.assertIsNone(self.hook("git status"))

    def test_lint_crash_fail_open(self):
        (self.repo / "scripts" / "copy-lint.py").write_text("raise SystemExit(9)\n", encoding="utf-8")
        self.edit_page()
        out = self.hook("git commit -m x")
        self.assertFalse(self.denied(out))
        self.assertIn("監査を実行できなかった", out["additionalContext"])

    def test_log_written(self):
        self.edit_page()
        self.hook("git commit -m x")
        self.assertTrue(any(self.logs.glob("copy-audit-guard-*.log")))


if __name__ == "__main__":
    unittest.main()
