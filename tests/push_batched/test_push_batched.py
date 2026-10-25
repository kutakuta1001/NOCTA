"""push-batched のテスト。実行: /usr/bin/python3 -m unittest discover -s tests/push_batched -v"""
import contextlib
import importlib.util
import io
import subprocess
import tempfile
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]


def load():
    spec = importlib.util.spec_from_file_location("push_batched", str(REPO / "scripts" / "push-batched.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


pb = load()
CONFIG = '```json copy-audit-config\n{"intro_pages": ["website/app/index.html"], "card_file": "website/apps-data.js"}\n```\n'


def sh(cwd, *args):
    return subprocess.run(args, cwd=cwd, check=True, capture_output=True, text=True).stdout


class PlanBatchesTest(unittest.TestCase):
    def test_keeps_order_and_limit(self):
        files = [("a", 600), ("b", 600), ("c", 300), ("d", 900)]
        self.assertEqual(pb.plan_batches(files, 1000), [["a"], ["b", "c"], ["d"]])

    def test_file_over_limit_gets_own_batch(self):
        self.assertEqual(pb.plan_batches([("a", 10), ("b", 5000), ("c", 10)], 100), [["a"], ["b"], ["c"]])

    def test_empty(self):
        self.assertEqual(pb.plan_batches([], 100), [])


class PushTest(unittest.TestCase):
    """手元の bare リポジトリを origin にして、送る順番と止まり方を確かめる。"""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        root = Path(self.tmp.name)
        self.remote = root / "remote.git"
        self.work = root / "work"
        sh(root, "git", "init", "-q", "--bare", "-b", "main", str(self.remote))
        sh(root, "git", "clone", "-q", str(self.remote), str(self.work))
        for k, v in (("user.name", "t"), ("user.email", "t@example.com")):
            sh(self.work, "git", "config", k, v)
        (self.work / "docs").mkdir()
        (self.work / "docs/tools-page-copy.md").write_text(CONFIG, encoding="utf-8")
        self.img = self.work / "site/img"
        self.img.mkdir(parents=True)
        (self.img / "old.jpg").write_bytes(b"o" * 10)
        (self.work / "site/data.js").write_text("v1", encoding="utf-8")
        sh(self.work, "git", "add", "docs", "site")
        sh(self.work, "git", "commit", "-q", "-m", "init")
        sh(self.work, "git", "push", "-q", "-u", "origin", "main")
        self._repo = pb.REPO
        pb.REPO = self.work

    def tearDown(self):
        pb.REPO = self._repo
        self.tmp.cleanup()

    def run_main(self, *extra):
        args = ["--assets", "site/img", "--then", "site/data.js", "-m", "feat: 写真", "--trailer", "X-Test: 1",
                "--batch-mb", "0.001", "--yes", *extra]
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            return pb.main(args)

    def remote_log(self):
        return sh(self.remote, "git", "log", "--reverse", "--format=%s", "main").splitlines()

    def test_images_first_then_data_and_deletions(self):
        for i in range(3):
            (self.img / f"p{i}.jpg").write_bytes(bytes([i]) * 700)
        (self.img / "old.jpg").unlink()
        (self.work / "site/data.js").write_text("v2", encoding="utf-8")
        self.assertEqual(self.run_main(), 0)
        self.assertEqual(self.remote_log(), ["init", "feat: 写真（画像 1/3）", "feat: 写真（画像 2/3）",
                                             "feat: 写真（画像 3/3）", "feat: 写真"])
        last = sh(self.remote, "git", "show", "--name-status", "--format=%B", "main")
        self.assertIn("X-Test: 1", last)
        self.assertIn("D\tsite/img/old.jpg", last)
        self.assertIn("M\tsite/data.js", last)
        self.assertEqual(sh(self.work, "git", "status", "--porcelain"), "")

    def test_existing_unpushed_commits_go_first(self):
        (self.work / "note.md").write_text("n", encoding="utf-8")
        sh(self.work, "git", "add", "note.md")
        sh(self.work, "git", "commit", "-q", "-m", "docs: 先のコミット")
        (self.img / "p.jpg").write_bytes(b"p" * 10)
        self.assertEqual(self.run_main(), 0)
        self.assertEqual(self.remote_log(), ["init", "docs: 先のコミット", "feat: 写真（画像 1/1）"])

    def test_dry_run_changes_nothing(self):
        (self.img / "p.jpg").write_bytes(b"p" * 10)
        self.assertEqual(self.run_main("--dry-run"), 0)
        self.assertEqual(self.remote_log(), ["init"])
        self.assertIn("?? site/img/p.jpg", sh(self.work, "git", "status", "--porcelain"))

    def test_refuses_file_over_1mb(self):
        (self.img / "big.jpg").write_bytes(b"b" * (1024 * 1024 + 1))
        self.assertEqual(self.run_main(), 3)
        self.assertEqual(self.remote_log(), ["init"])

    def test_refuses_non_image_in_assets(self):
        (self.img / "notes.txt").write_text("x", encoding="utf-8")
        self.assertEqual(self.run_main(), 3)

    def test_refuses_html(self):
        (self.work / "site/index.html").write_text("x", encoding="utf-8")
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            r = pb.main(["--assets", "site/img", "--then", "site/index.html", "-m", "x", "--yes"])
        self.assertEqual(r, 3)

    def test_refuses_card_file(self):
        (self.work / "website").mkdir()
        (self.work / "website/apps-data.js").write_text("x", encoding="utf-8")
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            r = pb.main(["--assets", "site/img", "--then", "website/apps-data.js", "-m", "x", "--yes"])
        self.assertEqual(r, 3)

    def test_refuses_when_something_is_staged(self):
        (self.work / "x.md").write_text("x", encoding="utf-8")
        sh(self.work, "git", "add", "x.md")
        self.assertEqual(self.run_main(), 3)

    def test_refuses_when_remote_is_ahead(self):
        other = Path(self.tmp.name) / "other"
        sh(Path(self.tmp.name), "git", "clone", "-q", str(self.remote), str(other))
        sh(other, "git", "-c", "user.name=t", "-c", "user.email=t@example.com", "commit", "-q", "--allow-empty", "-m", "remote")
        sh(other, "git", "push", "-q", "origin", "main")
        (self.img / "p.jpg").write_bytes(b"p" * 10)
        self.assertEqual(self.run_main(), 3)


if __name__ == "__main__":
    unittest.main()
