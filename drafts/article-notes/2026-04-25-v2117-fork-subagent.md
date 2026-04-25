---
title: "CHANGELOG v2.1.117 — CLAUDE_CODE_FORK_SUBAGENT=1でフォーク型サブエージェント"
url: "https://docs.anthropic.com/ja/release-notes/claude-code"
date: "2026-04-25"
domain: "docs.anthropic.com"
tags: [best-practices, anthropic, claude-code, source:manual]
---

## 要約（3〜5行）
環境変数 `CLAUDE_CODE_FORK_SUBAGENT=1` を設定するとフォーク型サブエージェントが有効化される。
フォーク型では親コンテキスト（会話履歴・読み込み済みファイル）をそのまま継承した状態でサブエージェントが並列実行されるため、従来の独立型サブエージェントより文脈共有が深い。

## 主なポイント
- `CLAUDE_CODE_FORK_SUBAGENT=1` でフォーク型有効化（デフォルト無効）
- フォーク型: 親コンテキストを継承した並列サブエージェント
- 従来の独立型: 各サブエージェントが独立したコンテキストで起動
- Agent Teamsの品質向上に貢献する可能性（楽曲仕様書・歌詞を同じ文脈で並列起草）

## NOCTAへの関連メモ
/phase2-musicでlyric-poetとmusic-spec-writerが並列起動する際、フォーク型にするとトレンド分析結果（trend-analystの出力）を両エージェントが同じ文脈で参照できる。ただしコンテキスト消費が増えるためコスト増に注意。CLAUDE.mdのAgent Teams設定への追記候補。
