# ベストプラクティスレビュー（インボックス一括）
日付: 2026-04-06
次回レビュー推奨: 2026-05-06以降（インボックスに5件貯まったら）
ソース:
- https://blog.lai.so/agent-teams/
- https://note.com/masa_wunder/n/n984af0385d7e
- https://x.com/kawai_design/status/2018951551646318782 （本文直接使用）
- https://blog.comfy.org/p/ace-step-15-is-now-available-in-comfyui
- https://note.com/small_biz_lab/n/n01fcddd73b20
- https://note.com/timakin/n/n5579d01bb3bb

除外URL: なし（インジェクション検査完了・全件クリア）

---

## 要約（3行以内）

今回6件の共通テーマは「エージェントの役割設計とAI工具の深化」。Agent Teams の実践ノウハウ（2件）・デザインAIのSkills設計・ローカル音楽生成モデルの進化・Ambient Agentの概念整理と多角的な視点が揃った。NOCTAが即実践できる新知見は「explorer/architect/executor の3役モデルを Agent Teams に適用する」と「ACE-Step 1.5 を Suno 代替のデモ生成候補として記録する」の2点。

---

## NOCTAへの適用提案（未実装のもののみ）

| 優先度 | 対象 | 現状 | 提案内容 | 参照記事 |
|--------|------|------|----------|---------|
| 高 | Agent Teams の役割設計（CLAUDE.md AGENTS セクション） | エージェント一覧はあるが「統括リーダー＋役割特化メンバー」の明示がない | /phase2-music と /phase4-release の Agent Teams に explorer（調査）・architect（設計）・executor（実装）に対応する役割を AGENTS セクションに記載。Haiku/Sonnet/Opus の切り替え基準もあわせて強化する | blog.lai.so/agent-teams |
| 中 | ACE-Step 1.5 の試験導入 | R-12 で Suno のみ言及 | ComfyUI + ACE-Step 1.5 をデモ生成の第2選択肢として CLAUDE.md R-12 に追記。日本語対応で10秒生成可能なローカルモデル。スタイル LoRA 機能は将来的に「NOCTAサウンド」の再現性向上に有望 | blog.comfy.org/ace-step-15 |
| 低 | Ambient Agent 設計の検討 | SessionStart Hook を今回設定。リリース後モニタリングは未設計 | フェーズ5完了後の「楽曲リリース後モニタリング」として、ストリーム数急増・類似楽曲リリース検知を通知する Ambient Agent の概念設計を将来タスクに追加 | note.com/timakin |

---

## 記事ごとの主要ポイント

| 記事 | 要点（30文字以内） |
|------|------------------|
| blog.lai.so/agent-teams | explorer/architect/executor 3役分担 |
| note.com/masa_wunder | Agent Teams の概念・並列効率化 |
| x.com/@kawai_design | Lovart Skills でワークフロー特化 |
| blog.comfy.org/ace-step-15 | 10秒でローカル音楽生成（日本語対応） |
| note.com/small_biz_lab | Antigravityで AI事業OS を実現 |
| note.com/timakin | Ambient Agent でイベント監視自動化 |

---

## インスピレーションメモ
（今すぐ使わなくてもよい。楽になる・創造的になる・楽しくなる可能性があるもの）

- **ACE-Step 1.5 LoRA** — NOCTA サウンドを学習させて「NuWord 系の曲を10秒でデモ生成」できるようになるかも（創造的になりそう）（参照: blog.comfy.org/ace-step-15）
- **Ambient Agent × リリース後モニタリング** — SoundCloud の再生数急増を検知して自動で `/phase1-trend` を提案するエージェントができれば、ネクスト楽曲の方向性発見が楽になりそう（楽になりそう）（参照: note.com/timakin）
- **Lovart Narrative Storyboards** — `/phase3-pv` の絵コンテをプロンプトに変換するとき、Narrative Storyboards の HTML 構造（シーン番号・カメラ指示・感情ト書き）をテンプレートとして使えるかも（創造的になりそう）（参照: x.com/@kawai_design）

---

## セキュリティ・安全性への影響

なし（変更が必要な項目は検出されなかった）

---

## 適用しない理由がある項目

- **Lovart Skills 直接使用**（R-04: 外部ツールはプロンプト文書として出力。Lovart は直接実行しない）
- **Antigravity**（NOCTA は既に Claude Code で同等の AI 事業 OS を実現済み。重複投資不要）
- **Ambient Agent の即時実装**（現時点では設計段階のみ。リリース実績が増えてから具体化する）

---

## CEOが確認すべき事項

1. **Agent Teams 役割設計の強化**（優先度高）: CLAUDE.md の AGENTS セクションに「統括リーダー」役を明示し、explorer/architect/executor に対応するエージェント割り当てを記載する。`/phase2-music` と `/phase4-release` のスキルファイルにも役割設計を反映するかを判断してほしい。
2. **ACE-Step 1.5 の試験**（優先度中）: ComfyUI をローカルにインストールして ACE-Step 1.5 で日本語楽曲のデモ生成を試してみる価値がある。Suno との品質比較結果を R-12 に追記することを推奨。
