#!/usr/bin/env python3
"""copy-lint — Tools 紹介ページとカード説明文の文言を機械的に検査する。

基準と設定の正本は docs/tools-page-copy.md（```json copy-audit-config ブロック）。
読むレビュー（copy-auditor）の前段で、数えれば分かることだけを見る。

使い方:
  copy-lint.py --tree TREE [--base REV] [--json] FILE...   TREE の版を REV と比べて検査する
  copy-lint.py --export TREE OUTDIR FILE...                 TREE の版を OUTDIR に書き出す
  copy-lint.py --mark TREE                                  ステージ内容が TREE のときだけ監査済みの印を付ける

終了コード: 0 = 正常（指摘の有無は出力で示す）/ 3 = 引数・実行の誤り / 4 = 印の対象がステージ内容と違う
"""
import argparse
import json
import os
import re
import subprocess
import sys
from collections import Counter, namedtuple
from html.parser import HTMLParser
from pathlib import Path

CONFIG_PATH = "docs/tools-page-copy.md"

Finding = namedtuple("Finding", "kind severity location excerpt")

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
        "param", "source", "track", "wbr"}
# 文字をまとめる単位。インライン要素（span・a・i など）の文字は、外側の単位に入る
BLOCKS = {"p", "dd", "dt", "li", "div", "figcaption", "h1", "h2", "h3", "h4", "h5", "h6",
          "title", "section", "article", "header", "footer", "nav", "main", "aside", "dl",
          "ul", "ol", "figure", "body", "html", "blockquote"}
# 文の数を数える単位
SENTENCE_UNITS = {"p", "dd", "div", "li", "figcaption"}
HEADINGS = {"h1", "h2", "h3"}
SENTENCE_END = re.compile(r"[。！？!?]")


class LintError(Exception):
    pass


def load_config(text):
    m = re.search(r"```json copy-audit-config\s*\n(.*?)\n```", text, re.S)
    if not m:
        raise LintError("設定ブロック（```json copy-audit-config）が見つからない")
    return json.loads(m.group(1))


class _Page(HTMLParser):
    def __init__(self, protected=("-mock",)):
        super().__init__(convert_charrefs=True)
        self.protected = tuple(protected)
        self.depth = 0
        self.captures = []   # 記録中の SVG・見本: [kind, 開始の深さ, 部品]
        self.prints = {"svg": [], "sample": []}  # 中身を丸ごと並べた文字列
        self.stack = []      # [tag, buffer, location]
        self.blocks = []     # (tag, location, text)
        self.extra = []      # (location, text): meta description・aria-label
        self.counts = {"svg": 0, "svg_inner": 0, "img": 0, "mock": 0}
        self.tag_seen = {}
        self.svg_depth = 0
        self.skip_depth = 0  # script / style

    def _location(self, tag, attrs):
        n = self.tag_seen.get(tag, 0) + 1
        self.tag_seen[tag] = n
        cls = (attrs.get("class") or "").split()
        return "%s.%s" % (tag, cls[0]) if cls else "%s#%d" % (tag, n)

    def _open(self, tag, attrs, closes):
        token = "<%s%s>" % (tag, "".join(' %s="%s"' % (k, v or "") for k, v in attrs))
        for c in self.captures:
            c[2].append(token)
        cls_raw = dict(attrs).get("class") or ""
        kind = None
        if tag == "svg" and not any(c[0] == "svg" for c in self.captures):
            kind = "svg"
        elif any(x in cls_raw for x in self.protected):
            kind = "sample"
        if not closes and tag not in VOID:
            self.depth += 1
            if kind:
                self.captures.append([kind, self.depth, [token]])
        elif kind:
            self.prints[kind].append(token)
        attrs = dict((k, v or "") for k, v in attrs)
        if self.svg_depth:
            self.counts["svg_inner"] += 1
            if tag == "svg" and not closes:
                self.svg_depth += 1
            return
        if tag == "svg":
            self.counts["svg"] += 1
            if not closes:
                self.svg_depth = 1
            return
        if tag == "img":
            self.counts["img"] += 1
        if any(x in attrs.get("class", "") for x in self.protected):
            self.counts["mock"] += 1
        if tag == "meta" and attrs.get("name") == "description":
            self.extra.append(("meta[description]", attrs.get("content", "")))
        if attrs.get("href"):
            self.extra.append(("%s[href]" % tag, attrs["href"]))
        if attrs.get("aria-label"):
            self.extra.append(("%s[aria-label]" % tag, attrs["aria-label"]))
        if tag in ("script", "style") and not closes:
            self.skip_depth += 1
            return
        if tag in BLOCKS and not closes and tag not in VOID:
            self.stack.append([tag, [], self._location(tag, attrs)])

    def handle_starttag(self, tag, attrs):
        self._open(tag, attrs, tag in VOID)

    def handle_startendtag(self, tag, attrs):
        self._open(tag, attrs, True)

    def handle_endtag(self, tag):
        if tag not in VOID and self.depth > 0:
            for c in self.captures:
                c[2].append("</%s>" % tag)
            for c in [c for c in self.captures if c[1] == self.depth]:
                self.captures.remove(c)
                self.prints[c[0]].append("".join(c[2]))
            self.depth -= 1
        if self.svg_depth:
            if tag == "svg":
                self.svg_depth -= 1
            return
        if tag in ("script", "style"):
            self.skip_depth = max(0, self.skip_depth - 1)
            return
        if tag not in BLOCKS:
            return
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                while len(self.stack) > i:
                    self._flush(self.stack.pop())
                return

    def handle_data(self, data):
        for c in self.captures:
            c[2].append(data)
        if self.svg_depth or self.skip_depth or not self.stack:
            return
        self.stack[-1][1].append(data)

    def _flush(self, item):
        tag, buf, loc = item
        text = re.sub(r"\s+", " ", "".join(buf)).strip()
        if text:
            self.blocks.append((tag, loc, text))

    def finish(self):
        self.close()
        while self.stack:
            self._flush(self.stack.pop())
        return self


def _parse(text, protected=("-mock",)):
    p = _Page(protected)
    p.feed(text)
    return p.finish()


def _banned_hits(text, terms):
    low = text.lower()
    return [t for t in terms if t.lower() in low]


def _excerpt(text, needle=None, width=40):
    if needle:
        i = text.lower().find(needle.lower())
        start = max(0, i - 12)
        return text[start:start + width]
    return text[:width]


def _banned_excerpt(text, hits):
    """1 つの段落の禁止語を 1 件にまとめる（一覧を短く保つため）。"""
    return "%s / %s" % ("・".join(hits), _excerpt(text, hits[0]))


def lint_html(text, base_text, cfg, path):
    """紹介ページを検査する。text=None はファイル削除、base_text=None は新規ファイル。"""
    if text is None:
        return [Finding("PAGE_REMOVED", "break", path, "紹介ページが削除された")]
    protected = cfg.get("protected_classes", ["-mock"])
    page = _parse(text, protected)
    findings = []
    if base_text is not None:
        base = _parse(base_text, protected)
        for key in ("svg", "svg_inner", "img", "mock"):
            if page.counts[key] < base.counts[key]:
                findings.append(Finding("VISUAL_LOST", "break", path,
                                        "%s が %d から %d に減った" % (key, base.counts[key], page.counts[key])))
        for key, label in (("svg", "SVG"), ("sample", "見本")):
            gone = Counter(base.prints[key]) - Counter(page.prints[key])
            for fp in gone.elements():
                m = re.search(r'class="([^"]*)"', fp)
                findings.append(Finding("VISUAL_LOST", "break", path,
                                        "%s の中身が変わった・消えた: %s" % (label, m.group(1) if m else fp[:40])))
    terms = cfg["banned_terms"]
    for loc, txt in page.extra + [(loc, txt) for _, loc, txt in page.blocks]:
        hits = _banned_hits(txt, terms)
        if hits:
            findings.append(Finding("BANNED", "copy", loc, _banned_excerpt(txt, hits)))
    for tag, loc, txt in page.blocks:
        if tag in HEADINGS:
            for pat in cfg["banned_heading_patterns"]:
                if re.search(pat, txt):
                    findings.append(Finding("HEADING", "copy", loc, txt[:40]))
                    break
        if tag in SENTENCE_UNITS:
            n = len([s for s in SENTENCE_END.split(txt) if s.strip()])
            if n > cfg["max_sentences"]:
                findings.append(Finding("LONG", "copy", loc, "%d 文: %s" % (n, txt[:40])))
    return findings


CARD_RE = re.compile(r'(descJa|descEn)\s*:\s*"((?:[^"\\\n]|\\.)*)"')
TITLE_RE = re.compile(r'title\s*:[^\n]*?"([^"\n]+)"')


def lint_cards(text, cfg):
    """apps-data.js のカード説明文を検査する。"""
    findings = []
    title = "?"
    for line in text.splitlines():
        t = TITLE_RE.search(line)
        if t:
            title = t.group(1)
        for m in CARD_RE.finditer(line):
            key, raw = m.group(1), m.group(2)
            loc = "%s.%s" % (title, key)
            value = raw.replace('\\"', '"')
            if key == "descJa" and len(value) > cfg["card_desc_max_chars"]:
                findings.append(Finding("CARD_LONG", "copy", loc, "%d 字: %s" % (len(value), value[:30])))
            hits = _banned_hits(value, cfg["banned_terms"])
            if hits:
                findings.append(Finding("CARD_BANNED", "copy", loc, _banned_excerpt(value, hits)))
            if "<" in raw or "&" in raw or '\\"' in raw:
                findings.append(Finding("CARD_UNSAFE", "copy", loc, "HTML に埋め込むと崩れる文字: " + value[:30]))
    return findings


def _git(*args):
    r = subprocess.run(["git"] + list(args), capture_output=True)
    if r.returncode != 0:
        raise LintError("git %s: %s" % (" ".join(args), r.stderr.decode("utf-8", "replace").strip()))
    return r.stdout.decode("utf-8")


def _show(rev, path):
    """rev:path の中身。存在しなければ None。"""
    r = subprocess.run(["git", "cat-file", "-e", "%s:%s" % (rev, path)], capture_output=True)
    if r.returncode != 0:
        return None
    return _git("show", "%s:%s" % (rev, path))


def run_check(tree, base, paths):
    cfg_text = _show(tree, CONFIG_PATH)
    if cfg_text is None:
        raise LintError("%s が tree %s にない" % (CONFIG_PATH, tree))
    cfg = load_config(cfg_text)
    findings = []
    for path in paths:
        text = _show(tree, path)
        if path == cfg["card_file"]:
            if text is not None:
                findings.extend(lint_cards(text, cfg))
            continue
        base_text = _show(base, path) if base else None
        findings.extend(lint_html(text, base_text, cfg, path))
    return findings


def git_common_dir():
    d = _git("rev-parse", "--git-common-dir").strip()
    return Path(d) if os.path.isabs(d) else (Path.cwd() / d)


def mark(tree):
    current = _git("write-tree").strip()
    if current != tree:
        print("ステージ内容が変わったため再監査が必要（ステージ %s / 指定 %s）" % (current, tree), file=sys.stderr)
        return 4
    d = git_common_dir() / "copy-audit"
    d.mkdir(parents=True, exist_ok=True)
    p = d / tree
    p.write_text("", encoding="utf-8")
    print(p.resolve())
    return 0


def export(tree, outdir, paths):
    for path in paths:
        text = _show(tree, path)
        if text is None:
            continue
        dest = Path(outdir) / path
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(text, encoding="utf-8")
        print(dest)
    return 0


class _Parser(argparse.ArgumentParser):
    def error(self, message):
        print("copy-lint: " + message, file=sys.stderr)
        sys.exit(3)


def main(argv=None):
    ap = _Parser(prog="copy-lint.py")
    ap.add_argument("--tree")
    ap.add_argument("--base", default="HEAD")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--export", nargs=2, metavar=("TREE", "OUTDIR"))
    ap.add_argument("--mark", metavar="TREE")
    ap.add_argument("files", nargs="*")
    a = ap.parse_args(argv)
    try:
        if a.mark:
            return mark(a.mark)
        if a.export:
            return export(a.export[0], a.export[1], a.files)
        if not a.tree or not a.files:
            ap.error("--tree と FILE が必要")
        base = a.base
        if subprocess.run(["git", "rev-parse", "--verify", "-q", base], capture_output=True).returncode != 0:
            base = None  # 初回コミット前など
        findings = run_check(a.tree, base, a.files)
    except (LintError, ValueError, OSError) as e:
        print("copy-lint: %s" % e, file=sys.stderr)
        return 3
    if a.json:
        print(json.dumps({"ok": True, "tree": a.tree, "base": base,
                          "findings": [f._asdict() for f in findings]}, ensure_ascii=False))
    else:
        for f in findings:
            print("\t".join((f.severity, f.kind, f.location, f.excerpt)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
