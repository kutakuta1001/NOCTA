---
title: "[changelog v2.1.228] セッションクリーンアップがプロジェクトの memory フォルダ内を削除する不具合を修正"
url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"
date: "2026-08-12"
domain: "github.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code v2.1.228 で、セッションクリーンアップがプロジェクトの memory フォルダ内のコンテンツを削除してしまう不具合が修正された。auto-memory（`~/.claude/projects/<project>/memory/`）に蓄積した記憶が、セッション整理の副作用で失われる可能性があった。同バージョンではバックグラウンドのプラグインキャッシュ整理が、開発用シンボリックリンクのみのプラグインのキャッシュを削除する不具合も修正されている。

## 主なポイント
- 対象は `~/.claude/projects/<project>/memory/` の中身
- セッションクリーンアップの副作用で削除されうる状態だった
- v2.1.228 で修正済み
- auto-memory は v2.1 系で公式機能としてドキュメント化された機構（2026-07-29 処理分）

## NOCTAへの関連メモ
NOCTA の auto-memory は14ファイル（モデル方針・xmcp 設定・確定パレット・PV パイプライン・Wikimedia サムネイル仕様など）を保持しており、これが消えると復元手段がない（git 管理外）。現在14件が揃っているので実害はなかったと判断できるが、消えていた可能性のある期間が存在した。あわせて2026-08-12 に判明した事実として、起動ディレクトリを `project_NOCTA` にすると別の空ストアを参照して14件が見えなくなるため、`/NOCTA` 起点の運用維持が重要。memory の可用性は「削除バグ」と「起動ディレクトリ」の二重のリスクにさらされている。
