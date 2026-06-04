---
title: "v2.1.162: /effort コマンドのデフォルト保持"
url: ""
date: "2026-06-04"
domain: "docs.anthropic.com"
tags: [best-practices, claude-code, source:manual]
---

## 要約

v2.1.162 で `/effort` コマンドで選択したレベルがセッション間でデフォルトとして保持されるようになった。`/model` と同様の動作で、一度設定すると次のセッションにも引き継がれる。

## 主なポイント

- `/effort low/medium/high/xhigh` のいずれかを設定すると、次回起動時もそのレベルが維持される
- `/model` でデフォルトモデルを保存する v2.1.153 と同様の「設定永続化」パターン
- 毎セッション手動で `/effort xhigh` を設定していた場合、1回設定すれば以降不要になる

## NOCTAへの関連メモ

重要レビュー（承認ゲート③⑥前）や SVP生成時に `/effort xhigh` を毎回設定していたなら、一度設定すれば引き継がれる。ただし、コスト増加に注意（デフォルトを xhigh にすると全タスクで高コストになる）。
