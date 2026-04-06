---
title: "Claude Code Agent Teamsのあそびかた"
url: "https://blog.lai.so/agent-teams/"
date: "2026-04-06"
domain: "blog.lai.so"
tags: [best-practices]
---

## 要約（3〜5行）

Claude Code Agent Teams（2026年2月5日リリース）の実践的な使い方を解説した技術ブログ。Agent Teams は Subagents を拡張してステートフルにした機能で、各エージェントが独立プロセスとして動作し、ファイルシステムをメッセージングに活用する。explorer・architect・executor の役割分担によるチーム構成と、トークン消費を抑えるプロンプトベース誘導の実践例を紹介している。

## 主なポイント

- **起動方法**: 環境変数 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` + `--teammate-mode tmux` で並列 Claude プロセスが起動
- **役割分担モデル**: explorer（調査）・architect（設計）・executor（実装）の3役で GitHub Issue を解決する実践例
- **トークン消費対策**: Haiku 活用・OpenRouter などの外部モデル設定でコストを大幅削減可能
- **使い分け基準**: Agents（単一プロセス）< Subagents（軽量スレッド）< Agent Teams（独立プロセス）の順でスケーラビリティと自律性が上がる

## NOCTAへの関連メモ

NOCTA は既に `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` を設定済み。explorer/architect/executor の役割設計は `/phase2-music`（music-spec-writer + lyric-poet 並列）や `/phase4-release`（4エージェント並列）の構成見直しに参考になる。Haiku モデルの活用（R-09）でトークンコストをさらに削減できる可能性がある。
