#!/usr/bin/env python3
"""画像生成CLI — ChatGPT と同じ画像モデル（gpt-image-1）/ Gemini をターミナルから叩く

使い方:
  python3 ~/.claude/scripts/image-gen.py "プロンプト"                       # 生成（既定: gpt-image-1 / medium / 1024x1024）
  python3 ~/.claude/scripts/image-gen.py "プロンプト" --size 1536x1024 --quality high -n 2
  python3 ~/.claude/scripts/image-gen.py "プロンプト" --out ./public/hero.png   # 出力先指定（ディレクトリ or ファイル名）
  python3 ~/.claude/scripts/image-gen.py "修正指示" --input ref.png            # 画像編集（gpt-image-1 のみ）
  python3 ~/.claude/scripts/image-gen.py "プロンプト" --provider gemini        # Gemini (GEMINI_API_KEY) で生成

APIキーの解決順:
  openai: 環境変数 OPENAI_API_KEY → ~/memo-app/.env.local の OPENAI_API_KEY
  gemini: 環境変数 GEMINI_API_KEY
"""

from __future__ import annotations

import argparse
import base64
import json
import mimetypes
import os
import re
import sys
import time
import urllib.error
import urllib.request
import uuid
from pathlib import Path

ENV_FALLBACK_FILES = [Path.home() / "memo-app" / ".env.local"]
TIMEOUT = 300

# gpt-image-1 の概算コスト（USD / 枚、1024x1024）。サイズが大きいと最大 1.5 倍程度
COST_ESTIMATE = {"low": 0.011, "medium": 0.042, "high": 0.167, "auto": 0.042}


def resolve_key(name: str) -> str | None:
    if os.environ.get(name):
        return os.environ[name]
    for f in ENV_FALLBACK_FILES:
        if f.exists():
            m = re.search(rf"^{name}=(.+)$", f.read_text(), re.MULTILINE)
            if m:
                return m.group(1).strip().strip('"').strip("'")
    return None


def http_json(url: str, payload: dict, headers: dict) -> dict:
    req = urllib.request.Request(
        url, data=json.dumps(payload).encode(), headers=headers, method="POST"
    )
    with urllib.request.urlopen(req, timeout=TIMEOUT) as res:
        return json.load(res)


def http_multipart(url: str, fields: list[tuple[str, str]],
                   files: list[tuple[str, Path]], headers: dict) -> dict:
    boundary = uuid.uuid4().hex
    body = b""
    for key, val in fields:
        body += (f"--{boundary}\r\nContent-Disposition: form-data; "
                 f'name="{key}"\r\n\r\n{val}\r\n').encode()
    for key, path in files:
        ctype = mimetypes.guess_type(str(path))[0] or "application/octet-stream"
        body += (f"--{boundary}\r\nContent-Disposition: form-data; "
                 f'name="{key}"; filename="{path.name}"\r\n'
                 f"Content-Type: {ctype}\r\n\r\n").encode()
        body += path.read_bytes() + b"\r\n"
    body += f"--{boundary}--\r\n".encode()
    headers = dict(headers)
    headers["Content-Type"] = f"multipart/form-data; boundary={boundary}"
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=TIMEOUT) as res:
        return json.load(res)


def gen_openai(args, key: str) -> list[bytes]:
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    if args.input:  # 画像編集（edits エンドポイント・multipart）
        fields = [("model", args.model_id or "gpt-image-1"),
                  ("prompt", args.prompt), ("n", str(args.n)),
                  ("size", args.size), ("quality", args.quality)]
        files = [("image[]", Path(p)) for p in args.input]
        data = http_multipart("https://api.openai.com/v1/images/edits",
                              fields, files,
                              {"Authorization": f"Bearer {key}"})
    else:
        payload = {"model": args.model_id or "gpt-image-1",
                   "prompt": args.prompt, "n": args.n,
                   "size": args.size, "quality": args.quality}
        data = http_json("https://api.openai.com/v1/images/generations",
                         payload, headers)
    return [base64.b64decode(d["b64_json"]) for d in data["data"]]


def gen_gemini(args, key: str) -> list[bytes]:
    model = args.model_id or "gemini-2.5-flash-image"
    url = (f"https://generativelanguage.googleapis.com/v1beta/models/"
           f"{model}:generateContent?key={key}")
    payload = {
        "contents": [{"parts": [{"text": args.prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE", "TEXT"]},
    }
    data = http_json(url, payload, {"Content-Type": "application/json"})
    images = []
    for cand in data.get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            inline = part.get("inlineData") or part.get("inline_data")
            if inline and inline.get("data"):
                images.append(base64.b64decode(inline["data"]))
    if not images:
        raise RuntimeError(f"Gemini が画像を返しませんでした: {json.dumps(data)[:400]}")
    return images


def output_paths(args, count: int) -> list[Path]:
    slug = re.sub(r"[^a-zA-Z0-9ぁ-んァ-ヶ一-龠]+", "-", args.prompt)[:24].strip("-") or "image"
    stamp = time.strftime("%Y%m%d-%H%M%S")
    out = Path(args.out) if args.out else Path.cwd()
    if args.out and (out.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp")):
        if count == 1:
            return [out]
        return [out.with_name(f"{out.stem}-{i+1}{out.suffix}") for i in range(count)]
    out.mkdir(parents=True, exist_ok=True)
    return [out / f"img-{stamp}-{slug}-{i+1}.png" for i in range(count)]


def main():
    p = argparse.ArgumentParser(description="画像生成CLI (gpt-image-1 / Gemini)")
    p.add_argument("prompt", help="生成プロンプト（日本語可）")
    p.add_argument("--provider", choices=["openai", "gemini"], default="openai")
    p.add_argument("--model-id", default=None,
                   help="モデルID上書き（例: dall-e-3, gemini-2.5-flash-image）")
    p.add_argument("--size", default="1024x1024",
                   help="gpt-image-1: 1024x1024 / 1536x1024 / 1024x1536 / auto")
    p.add_argument("--quality", default="low",
                   choices=["low", "medium", "high", "auto"])
    p.add_argument("-n", type=int, default=1, help="生成枚数")
    p.add_argument("--out", default=None, help="出力先（ディレクトリ or ファイルパス）")
    p.add_argument("--input", nargs="*", default=None,
                   help="編集元画像（gpt-image-1 の画像編集モード）")
    args = p.parse_args()

    key_name = "OPENAI_API_KEY" if args.provider == "openai" else "GEMINI_API_KEY"
    key = resolve_key(key_name)
    if not key:
        print(f"ERROR: {key_name} が見つかりません（環境変数 or ~/memo-app/.env.local）",
              file=sys.stderr)
        sys.exit(2)

    try:
        images = gen_openai(args, key) if args.provider == "openai" else gen_gemini(args, key)
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")[:600]
        print(f"ERROR: API {e.code}: {body}", file=sys.stderr)
        if e.code == 403 and "verif" in body.lower():
            print("HINT: gpt-image-1 は組織のverificationが必要な場合があります。"
                  "`--model-id dall-e-3` か `--provider gemini` を試してください。",
                  file=sys.stderr)
        sys.exit(1)

    paths = output_paths(args, len(images))
    for img, path in zip(images, paths):
        path.write_bytes(img)
        print(f"SAVED: {path}")
    if args.provider == "openai" and not args.model_id:
        est = COST_ESTIMATE.get(args.quality, 0.042) * len(images)
        print(f"COST(approx): ${est:.3f}")


if __name__ == "__main__":
    main()
