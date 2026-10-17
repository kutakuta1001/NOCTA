"""copy-lint のテスト。実行: /usr/bin/python3 -m unittest discover -s tests/copy_audit -v"""
import importlib.util
import json
import re
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
FIX = Path(__file__).resolve().parent / "fixtures"
LINT_PATH = REPO / "scripts" / "copy-lint.py"


def load_lint():
    spec = importlib.util.spec_from_file_location("copy_lint", str(LINT_PATH))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


lint = load_lint()
CFG = lint.load_config((REPO / "docs" / "tools-page-copy.md").read_text(encoding="utf-8"))
BEFORE = (FIX / "barside_before.html").read_text(encoding="utf-8")
APPROVED = (FIX / "barside_approved.html").read_text(encoding="utf-8")
LAMPNOOK = (FIX / "lampnook_approved.html").read_text(encoding="utf-8")
PATH = "website/barside/index.html"


def kinds(findings):
    return [f.kind for f in findings]


def has(findings, kind, needle=""):
    return any(f.kind == kind and needle in f.excerpt for f in findings)


class LintHtmlTest(unittest.TestCase):
    def test_before_flags_tech_and_author(self):
        fs = lint.lint_html(BEFORE, BEFORE, CFG, PATH)
        for word in ("Tailscale", "FSRS", "作者の Mac"):
            self.assertTrue(has(fs, "BANNED", word), word)
        self.assertTrue(has(fs, "HEADING", "この秋、店に増えたもの。"))
        self.assertIn("LONG", kinds(fs))

    def test_approved_barside_known_finding(self):
        fs = lint.lint_html(APPROVED, APPROVED, CFG, PATH)
        self.assertTrue(has(fs, "BANNED", "作者専用"))
        self.assertEqual(set(kinds(fs)), {"BANNED"})

    def test_lampnook_is_clean(self):
        fs = lint.lint_html(LAMPNOOK, LAMPNOOK, CFG, "website/lampnook/index.html")
        self.assertEqual(fs, [])

    def test_svg_removed_is_lost(self):
        cut = re.sub(r"<svg.*?</svg>", "", APPROVED, count=1, flags=re.S)
        fs = lint.lint_html(cut, APPROVED, CFG, PATH)
        self.assertTrue(has(fs, "VISUAL_LOST"))
        self.assertTrue(all(f.severity == "break" for f in fs if f.kind == "VISUAL_LOST"))

    def test_svg_emptied_is_lost(self):
        cut = re.sub(r"(<svg[^>]*>).*?(</svg>)", r"\1\2", APPROVED, count=1, flags=re.S)
        self.assertTrue(has(lint.lint_html(cut, APPROVED, CFG, PATH), "VISUAL_LOST"))

    def test_img_removed_is_lost(self):
        cut = re.sub(r"<img[^>]*>", "", LAMPNOOK, count=1)
        fs = lint.lint_html(cut, LAMPNOOK, CFG, "website/lampnook/index.html")
        self.assertTrue(has(fs, "VISUAL_LOST"))

    def test_mock_removed_is_lost(self):
        cut = APPROVED.replace('class="board-mock"', 'class="board"')
        self.assertTrue(has(lint.lint_html(cut, APPROVED, CFG, PATH), "VISUAL_LOST"))

    def test_sample_inner_changed_is_lost(self):
        cuts = [
            re.sub(r'<div class="lines">.*?</div>', '<div class="lines"></div>', APPROVED, count=1, flags=re.S),
            re.sub(r'<div class="notebook">.*?</div>\s*</section>', "</section>", APPROVED, count=1, flags=re.S),
            APPROVED.replace("toast</p>", "</p>", 1),
            re.sub(r'(<path d=")([^"]{20})[^"]*"', r'\1\2"', APPROVED, count=1),
        ]
        for i, cut in enumerate(cuts):
            self.assertNotEqual(cut, APPROVED, i)
            self.assertTrue(has(lint.lint_html(cut, APPROVED, CFG, PATH), "VISUAL_LOST"), i)

    def test_copy_change_outside_samples_is_not_lost(self):
        cut = APPROVED.replace("前回の話題も、好きなビールも。", "前回の話題も。", 1)
        self.assertNotEqual(cut, APPROVED)
        self.assertNotIn("VISUAL_LOST", kinds(lint.lint_html(cut, APPROVED, CFG, PATH)))

    def test_page_removed(self):
        fs = lint.lint_html(None, APPROVED, CFG, PATH)
        self.assertEqual(kinds(fs), ["PAGE_REMOVED"])
        self.assertEqual(fs[0].severity, "break")

    def test_new_file_skips_visual_check(self):
        fs = lint.lint_html(BEFORE, None, CFG, PATH)
        self.assertNotIn("VISUAL_LOST", kinds(fs))
        self.assertIn("BANNED", kinds(fs))

    def test_svg_script_not_scanned(self):
        html = "<svg><text>FSRS</text></svg><script>var a='Tailscale'</script><p>ok。</p>"
        self.assertNotIn("BANNED", kinds(lint.lint_html(html, None, CFG, PATH)))

    def test_meta_and_div_text_scanned(self):
        meta = '<meta name="description" content="作者専用の練習アプリ。">'
        self.assertTrue(has(lint.lint_html(meta, None, CFG, PATH), "BANNED", "作者専用"))
        div = '<div class="cat-note">作者<span>専用</span></div>'
        self.assertTrue(has(lint.lint_html(div, None, CFG, PATH), "BANNED", "作者専用"))

    def test_author_host_in_href(self):
        html = '<footer><a href="https://barside.tail00000.ts.net/">作者用</a></footer>'
        self.assertTrue(has(lint.lint_html(html, None, CFG, PATH), "BANNED", "ts.net"))

    def test_sentences_per_paragraph(self):
        nested = "<li><p>一文。二文。</p><p>三文。四文。</p></li>"
        self.assertNotIn("LONG", kinds(lint.lint_html(nested, None, CFG, PATH)))
        four = "<p>一。二。三。四。</p>"
        self.assertEqual(kinds(lint.lint_html(four, None, CFG, PATH)).count("LONG"), 1)


class LintCardsTest(unittest.TestCase):
    def card(self, ja, en="A tool."):
        return 'const A = [{\n    descJa: "%s",\n    descEn: "%s"\n}];\n' % (ja, en)

    def test_cards(self):
        self.assertTrue(has(lint.lint_cards(self.card("あ" * 61), CFG), "CARD_LONG"))
        self.assertEqual(lint.lint_cards(self.card("あ" * 60), CFG), [])
        self.assertTrue(has(lint.lint_cards(self.card("短い。", "uses IndexedDB"), CFG), "CARD_BANNED"))
        self.assertTrue(has(lint.lint_cards(self.card("a<b"), CFG), "CARD_UNSAFE"))
        self.assertTrue(has(lint.lint_cards(self.card('a\\"b'), CFG), "CARD_UNSAFE"))


COLLECTIONS = """const NOCTA_APP_COLLECTIONS = [
  { key: "nuword", title: "NuWord Collection", descJa: "内省。", descEn: "Reflect." },
  { key: "hina", title: "HiNa Collection", descJa: "収集。", descEn: "Collect." },
  { key: "yori", title: "Yori Collection", descJa: "学び。", descEn: "Learn." }
];
"""


def apps(*cards):
    body = ",\n".join("  {\n    title: %s,\n%s    descJa: \"説明。\"\n  }" % (
        t if t.startswith("/*") else '"%s"' % t,
        "" if c is None else '    collection: "%s",\n' % c) for t, c in cards)
    return COLLECTIONS + "const NOCTA_APPS = [\n" + body + "\n];\n"


class LintCollectionsTest(unittest.TestCase):
    def test_all_classified(self):
        self.assertEqual(lint.lint_collections(apps(("A", "nuword"), ("B", "hina"), ("C", "yori"))), [])

    def test_missing(self):
        f = lint.lint_collections(apps(("A", "nuword"), ("X", None)))
        self.assertEqual([(x.kind, x.location) for x in f], [("COLLECTION_MISSING", "X")])

    def test_unknown(self):
        f = lint.lint_collections(apps(("A", "music")))
        self.assertEqual([x.kind for x in f], ["COLLECTION_UNKNOWN"])
        for key in ("nuword", "hina", "yori"):
            self.assertIn(key, f[0].excerpt)

    def test_strategy_marker(self):
        t = '/* strategy-name:start */ "HiNa Kai" /* strategy-name:end */'
        self.assertEqual(lint.lint_collections(apps((t, "hina"))), [])
        f = lint.lint_collections(apps((t, None)))
        self.assertEqual([(x.kind, x.location) for x in f], [("COLLECTION_MISSING", "HiNa Kai")])

    def test_collection_titles_not_cards(self):
        self.assertEqual(lint.lint_collections(apps(("A", "yori"))), [])

    def test_single_quoted_title_counted(self):
        text = apps(("A", "nuword")).replace('title: "A"', "title: 'A'")
        f = lint.lint_collections(text.replace('    collection: "nuword",\n', ""))
        self.assertEqual([(x.kind, x.location) for x in f], [("COLLECTION_MISSING", "A")])

    def test_commented_collection_ignored(self):
        text = apps(("A", "yori")).replace('    collection: "yori"', '    // collection: "yori"')
        self.assertEqual([x.kind for x in lint.lint_collections(text)], ["COLLECTION_MISSING"])

    def test_subtitle_not_new_card(self):
        text = apps(("A", "yori")).replace('    collection: "yori",\n', '    collection: "yori",\n    subtitle: "sub",\n')
        self.assertEqual(lint.lint_collections(text), [])

    def test_unreadable(self):
        with self.assertRaises(lint.LintError):
            lint.lint_collections('const NOCTA_APPS = [\n  {\n    title: "A",\n  }\n];\n')
        with self.assertRaises(lint.LintError):
            lint.lint_collections(COLLECTIONS)


def git(cwd, *args):
    return subprocess.run(["git", "-C", str(cwd)] + list(args), check=True,
                          capture_output=True, text=True).stdout.strip()


def make_repo(tmp):
    repo = Path(tmp) / "repo"
    (repo / "docs").mkdir(parents=True)
    (repo / "scripts").mkdir()
    (repo / "website" / "barside").mkdir(parents=True)
    (repo / "docs" / "tools-page-copy.md").write_text(
        (REPO / "docs" / "tools-page-copy.md").read_text(encoding="utf-8"), encoding="utf-8")
    (repo / "scripts" / "copy-lint.py").write_text(LINT_PATH.read_text(encoding="utf-8"), encoding="utf-8")
    (repo / "website" / "barside" / "index.html").write_text(APPROVED, encoding="utf-8")
    git(repo.parent, "init", "-q", str(repo))
    git(repo, "config", "user.email", "t@example.com")
    git(repo, "config", "user.name", "t")
    git(repo, "add", ".")
    git(repo, "commit", "-q", "-m", "init")
    return repo


class CliTest(unittest.TestCase):
    def run_lint(self, repo, *args):
        return subprocess.run([sys.executable, str(repo / "scripts" / "copy-lint.py")] + list(args),
                              cwd=str(repo), capture_output=True, text=True)

    def test_cli_json_and_mark(self):
        with tempfile.TemporaryDirectory() as tmp:
            repo = make_repo(tmp)
            page = repo / "website" / "barside" / "index.html"
            page.write_text(APPROVED.replace("うまく話せなくても", "Tailscale で"), encoding="utf-8")
            git(repo, "add", "website/barside/index.html")
            tree = git(repo, "write-tree")

            r = self.run_lint(repo, "--tree", tree, "--json", PATH)
            self.assertEqual(r.returncode, 0, r.stderr)
            payload = json.loads(r.stdout)
            self.assertTrue(payload["ok"])
            self.assertEqual(payload["tree"], tree)
            self.assertTrue(any(f["kind"] == "BANNED" for f in payload["findings"]))

            out = Path(tmp) / "export"
            r = self.run_lint(repo, "--export", tree, str(out), PATH)
            self.assertEqual(r.returncode, 0, r.stderr)
            self.assertIn("Tailscale で", (out / PATH).read_text(encoding="utf-8"))

            r = self.run_lint(repo, "--mark", tree)
            self.assertEqual(r.returncode, 0, r.stderr)
            self.assertTrue(Path(r.stdout.strip()).exists())

            page.write_text(APPROVED, encoding="utf-8")
            git(repo, "add", "website/barside/index.html")
            r = self.run_lint(repo, "--mark", tree)
            self.assertEqual(r.returncode, 4)

            r = self.run_lint(repo, "--bogus")
            self.assertEqual(r.returncode, 3)

    def test_cli_collections(self):
        with tempfile.TemporaryDirectory() as tmp:
            repo = make_repo(tmp)
            cards = repo / "website" / "apps-data.js"
            cards.write_text(apps(("A", "nuword"), ("X", None)), encoding="utf-8")
            git(repo, "add", "website/apps-data.js")
            tree = git(repo, "write-tree")
            r = self.run_lint(repo, "--collections", "--tree", tree)
            self.assertEqual(r.returncode, 0, r.stderr)
            payload = json.loads(r.stdout)
            self.assertTrue(payload["ok"])
            self.assertEqual(payload["tree"], tree)
            self.assertEqual([f["kind"] for f in payload["findings"]], ["COLLECTION_MISSING"])

            cards.write_text('const NOCTA_APPS = [\n  {\n    title: "A",\n  }\n];\n', encoding="utf-8")
            git(repo, "add", "website/apps-data.js")
            r = self.run_lint(repo, "--collections", "--tree", git(repo, "write-tree"))
            self.assertEqual(r.returncode, 3)

    def test_cli_deleted_page(self):
        with tempfile.TemporaryDirectory() as tmp:
            repo = make_repo(tmp)
            git(repo, "rm", "-q", "website/barside/index.html")
            tree = git(repo, "write-tree")
            r = self.run_lint(repo, "--tree", tree, "--json", PATH)
            self.assertEqual(r.returncode, 0, r.stderr)
            self.assertEqual([f["kind"] for f in json.loads(r.stdout)["findings"]], ["PAGE_REMOVED"])


if __name__ == "__main__":
    unittest.main()
