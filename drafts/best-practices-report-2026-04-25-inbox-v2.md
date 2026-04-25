# ベストプラクティスレビュー（インボックス一括）v2
日付: 2026-04-25
次回レビュー推奨: 2026-05-25以降（インボックスに5件貯まったら）
ソース: docs.anthropic.com（3件）/ openai.com（4件）/ x.com（2件）全9件テキスト直接参照
除外URL: なし（インジェクション検出0件・取得失敗0件）

---

## 要約（3行以内）

今回のテーマは「マルチデバイスワークフロー強化（/desktop・Dispatch）」「GPT Image 2移行の確認・完了」「オーケストレーション層こそが長期資産」の3つ。GPT Image 2関連4件は前セッション（2026-04-25）で実装済み。/desktop・Dispatch の2機能はセッション運用テーブルへの追記が残っている。

---

## NOCTAへの適用提案（未実装のもののみ）

| 優先度 | 対象 | 現状 | 提案内容 | 参照記事 |
|--------|------|------|----------|---------|
| 中 | CLAUDE.md セッション運用テーブル | `/desktop` 未記載 | `CLI→Desktopアプリ転送` として追記（/teleportの逆方向） | desktop-command |
| 中 | CLAUDE.md セッション運用テーブル | Dispatch未記載 | `モバイル→デスクトップセッションへタスク送信` として補記 | dispatch-feature |
| 低 | R-09 Opus 4.7 | ナレッジカットオフ未記載 | 「批評者Opusは知識カットオフ2026年1月（Sonnet 4.6は2025年8月）」を補記。批評精度の根拠が明確になる | opus47-knowledge-cutoff |

---

## 記事ごとの主要ポイント

| 記事 | 要点（30文字以内） |
|------|-----------------|
| docs.anthropic.com / opus47-knowledge-cutoff | Opusは2026/1・Sonnetは2025/8 |
| docs.anthropic.com / desktop-command | CLI→デスクトップアプリ転送 |
| docs.anthropic.com / dispatch-feature | モバイル→デスクトップへタスク送信 |
| openai.com / gpt-image2-thinking-mode | Thinking Mode搭載・実装済み |
| openai.com / gpt-image2-cjk-text-precision | CJK精度99%・実装済み |
| openai.com / gpt-image2-8-images-2k | 1プロンプト8枚・2K解像度 |
| openai.com / gpt-image2-vs-midjourney | NOCTAはGPT Image 2移行済み |
| x.com / claude-code-tips-10-diff-makers | Hooksでformat自動化が未対応 |
| x.com / orchestration-layer-lock-in | CLAUDE.md/Hooksが長期資産 |

---

## インスピレーションメモ

- **Dispatch × スタジオ外制作** — 移動中にスマートフォンで楽曲タイトル案・歌詞メモをデスクトップCLIへ送信し、帰宅後に成果物を確認できるかも（参照: dispatch-feature）
- **1プロンプト8枚同時生成** — /visual-promptのG1〜G3を別々に貼る代わりに1回のChatGPT Plusプロンプトで8バリエーション生成して比較選択できる可能性（参照: gpt-image2-8-images-2k）
- **Hooksでhandoff.mdフォーマット確認** — PostToolUse hookでhandoff.mdへの書き込み後にR-06（1〜3行ルール）違反を自動検出できるかも（参照: claude-code-tips-10-diff-makers）
- **オーケストレーション層の定期エクスポート** — CLAUDE.md + Skills + Agent configs をバックアップ・バージョン管理することがモデル移行時の保険になる（参照: orchestration-layer-lock-in）

---

## セキュリティ・安全性への影響

なし

---

## 適用しない理由がある項目

| 項目 | 理由 |
|------|------|
| GPT Image 2 × API（$0.211/枚） | コスト方針（ChatGPT Plus手動生成・従量課金なし）を維持 |
| Dispatchの自動タスクスケジューリング | R-03（自動投稿禁止）の精神に従い、完全自動化は採用しない |

---

## CEOが確認すべき事項

1. **`/desktop` コマンドの追記**: `/teleport`（Web→CLI）とセットでセッション運用テーブルに追記すると、マルチデバイスワークフローが一覧になる
2. **Dispatch機能の活用**: スタジオ外でのアイデア捕捉に使えるか検討推奨。「モバイルでDispatch → スタジオで確認 → CEOが判断」の非同期フローはR-13（対話してから作業）と相性が良い
3. **R-09 ナレッジカットオフ差の明記**: Opus 4.7（2026/1）vs Sonnet 4.6（2025/8）を補記するとOpusをCriticに使う根拠がより明確になる（低優先度）
