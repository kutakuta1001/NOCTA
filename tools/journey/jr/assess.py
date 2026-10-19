"""候補作りのための判定（景色らしさ・人・ブレ・暗さ）。計画書 K10。

モデル・重み・文・前処理を ASSESS_VERSION にまとめ、これが同じで ok の写真は飛ばす（途中から再開できる）。
"""
import json

import numpy as np
from PIL import Image

from jr import previews

MODEL = "ViT-B-32"
PRETRAINED = "laion2b_s34b_b79k"
LANDSCAPE_PROMPTS = ["a scenic landscape photo", "a photo of a city street", "a photo of the sea and sky", "a photo of a temple or shrine"]
PERSON_PROMPTS = ["a photo of a person", "a group photo of people"]
OTHER_PROMPTS = ["a photo of food", "a screenshot", "a photo of a document"]
PROMPTS = LANDSCAPE_PROMPTS + PERSON_PROMPTS + OTHER_PROMPTS
ASSESS_VERSION = f"{MODEL}/{PRETRAINED}|" + "|".join(PROMPTS) + f"|preview{previews.PREVIEW_EDGE}|lap|dark45"

PERSON_T = 0.5      # これを超えたら人が主役とみなして候補から外す
BLUR_T = 30.0       # 縮小画像のラプラシアンの分散がこれ未満ならブレ
DARK_T = 45.0       # 明るさの平均（0〜255）がこれ未満なら暗い（候補からは外さない）
LANDSCAPE_T = 0.3   # これ未満は景色らしくない（印だけ）
BATCH = 32


class ClipScorer:
    version = ASSESS_VERSION

    def __init__(self):
        import open_clip
        import torch

        self.torch = torch
        self.device = "mps" if torch.backends.mps.is_available() else "cpu"
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(MODEL, pretrained=PRETRAINED, device=self.device)
        self.model.eval()
        tok = open_clip.get_tokenizer(MODEL)
        with torch.no_grad():
            t = self.model.encode_text(tok(PROMPTS).to(self.device))
            self.text = t / t.norm(dim=-1, keepdim=True)

    def score(self, images):
        torch = self.torch
        with torch.no_grad():
            x = torch.stack([self.preprocess(im) for im in images]).to(self.device)
            f = self.model.encode_image(x)
            f = f / f.norm(dim=-1, keepdim=True)
            probs = (100.0 * f @ self.text.T).softmax(dim=-1).cpu().numpy()
            emb = f.cpu().numpy().astype(np.float32)
        nl, npn = len(LANDSCAPE_PROMPTS), len(PERSON_PROMPTS)
        return [{"landscape": float(p[:nl].sum()), "person": float(p[nl:nl + npn].sum()), "embedding": e}
                for p, e in zip(probs, emb)]


def blur_and_brightness(im):
    g = np.asarray(im.convert("L"), dtype=np.float32)
    lap = -4 * g[1:-1, 1:-1] + g[:-2, 1:-1] + g[2:, 1:-1] + g[1:-1, :-2] + g[1:-1, 2:]
    return float(lap.var()), float(g.mean())


def default_targets(conn):
    """判定する写真: 地域が決まったもの・作者が地域を付けたもの・候補のある/確認した日のグループの写真。"""
    rows = conn.execute(
        "SELECT photo_id FROM regions WHERE status = 'resolved' "
        "UNION SELECT photo_id FROM overrides "
        "UNION SELECT m.photo_id FROM review_group_members m JOIN review_groups g ON g.group_id = m.group_id "
        "  WHERE g.status = 'confirmed' OR (g.status = 'open' AND EXISTS (SELECT 1 FROM region_suggestions s WHERE s.group_id = g.group_id)) "
        "UNION SELECT photo_id FROM place_members").fetchall()
    return [r[0] for r in rows]


def _flags(people, s, blur, bright):
    flags = []
    if people:
        flags.append("people_tag")
    if s["person"] > PERSON_T:
        flags.append("person")
    if blur < BLUR_T:
        flags.append("blurry")
    if bright < DARK_T:
        flags.append("dark")
    if s["landscape"] < LANDSCAPE_T:
        flags.append("not_landscape")
    return flags


def run(conn, home, scorer, version, photo_ids=None, progress=None):
    ids = photo_ids if photo_ids is not None else default_targets(conn)
    people = dict(conn.execute("SELECT id, people FROM photos"))
    todo = []
    for pid in ids:
        sha, _ = previews.current_variant(conn, pid)
        if sha is None:
            continue
        row = conn.execute("SELECT version, status FROM assessments WHERE sha256 = ?", (sha,)).fetchone()
        if row and row[0] == version and row[1] == "ok" and previews.preview_path(home, sha).exists():
            continue
        todo.append(pid)
    stats = {"ok": 0, "failed": 0, "skipped": len(ids) - len(todo)}
    for start in range(0, len(todo), BATCH):
        batch, images = [], []
        for pid in todo[start:start + BATCH]:
            try:
                sha, path = previews.ensure(conn, home, pid)
                with Image.open(path) as im:
                    images.append(im.convert("RGB"))
                batch.append((pid, sha))
            except Exception as e:  # 壊れた画像 1 枚で止めない
                sha, _ = previews.current_variant(conn, pid)
                conn.execute("INSERT OR REPLACE INTO assessments(sha256, version, status, error) VALUES (?,?, 'failed', ?)",
                             (sha, version, str(e)[:200]))
                stats["failed"] += 1
        if not batch:
            continue
        scores = scorer.score(images)
        conn.execute("BEGIN")
        for (pid, sha), im, s in zip(batch, images, scores):
            blur, bright = blur_and_brightness(im)
            conn.execute(
                "INSERT OR REPLACE INTO assessments(sha256, version, status, error, flags, landscape, person, blur, embedding) "
                "VALUES (?,?, 'ok', NULL, ?,?,?,?,?)",
                (sha, version, json.dumps(_flags(people.get(pid), s, blur, bright)), s["landscape"], s["person"], blur,
                 np.asarray(s["embedding"], dtype=np.float32).tobytes()))
            stats["ok"] += 1
        conn.execute("COMMIT")
        if progress:
            progress(start + len(batch), len(todo))
    return stats
