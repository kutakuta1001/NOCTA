---
title: "Claude Codeから5つの有能AIを呼び出す：Codex・Grok・Gemini・Qwen全部スキルにした活用事例"
url: "https://x.com/i/status/2048729561089888571"
date: "2026-04-28"
domain: "x.com"
tags: [best-practices, source:manual]
---

## 要約（3〜5行）
Claude Code を司令塔として、Grok・Qwen・Codex・Gemini CLI を全てスキルとして組み込み、30日間で6,866回他モデルを呼び出した実例。各LLMに明確な役割があり、Claude Code は指示を出すだけで自動的に最適なモデルに振り分ける。

## 主なポイント
- Grok（3,252回）= 目: X のリアルタイム検索・トレンド取得（xAI API、$0.20/Mトークン）
- Qwen（2,165回）= 手足: ローカル実行（Ollama経由・API代ゼロ）で機密情報処理・プロンプトドラフト・軽い前処理
- Codex（1,200回）= 参謀: GPT-5.4/5.5 の推論力で UIレビュー・戦略相談・リスクチェック
- Gemini CLI（249回）= セカンドオピニオン: Claude と異なるバイアスでのコードレビュー
- Claude Code はオーケストレーター: スキルとして組み込めば呼び出しは全自動

## NOCTAへの関連メモ
NOCTA はすでに Grok API を /phase1-trend オプションとして CLAUDE.md に記載済み。Qwen のローカル実行（Ollama）は API コストゼロ・機密情報対応可能なプリプロセス用として今後の検討価値がある。マルチLLM オーケストレーションの設計パターンはAgent Teams拡張の参考になる。
