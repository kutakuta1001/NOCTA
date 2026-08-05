# NOCTA 制作ツール選択肢

CLAUDE.md から分離した参照情報。ツール選定を検討するときだけ読む。
最終更新: 2026-08-05

---

## 楽曲生成（R-13 の代替候補）

| ツール | 状態 | メモ |
|---|---|---|
| Suno | 現行 | mp3 を LALAL.AI で分離してパーツ利用。2026-08 にミュンヘン地裁が学習・出力の両面で著作権侵害を認定（違法収益の開示と損害賠償命令）。素材利用の前提を再確認する必要がある |
| ComfyUI + ACE-Step 1.5 XL | 候補 | 4B DiT・ローカル実行・日本語対応・RTX 3090 で 24GB VRAM・10秒以内生成・MIT ライセンス。Suno v5 超えの音質ベンチマーク確認済み。LoRA 微調整で NOCTA サウンドのスタイル学習も可能 |
| ACE-Step UI（fspecii） | 候補 | ACE-Step 1.5 ベースの OSS UI。ステム分離（ドラム/ベース/ボーカル）搭載で LALAL.AI 代替候補。4分超の楽曲・ボーカル生成対応 |
| Khala 1.0 | 候補 | 中央音楽学院発・OSS。RTX 3090 で動作確認後に ACE-Step と品質比較。LoRA 微調整可 |
| Mureka V9 | 候補 | 独立ブラインドテストで Suno・Udio 超えのベンチマーク1位（2026-05-28 時点）。@TadAI_official 2.1 経由でテスト可能 |

## 映像生成（R-04 の T2V 選択肢）

Runway / Kling 3.0 Pro / Dreamina Seedance 2.0 を品質・コストで使い分ける。
PV パイプラインは Runway WebUI 手動方式を採用済み（`outputs/pv/pv_edit.py` が FFmpeg 結合を担当・Runway API は有料プラン要）。

既知の制約: Midjourney / Kling / Runway / Luma / Sora / Veo / Seedance のいずれも前のショットを記憶しないため、
衣装・顔・光が飛ぶ。プロンプトでは解決しないので、単発ショット単位で使う前提で設計する。

## 調査・リサーチのオプション（/phase1-trend 強化・デフォルト無効）

| 手段 | 設定 | 注意 |
|---|---|---|
| xmcp（X 公式 MCP） | `.mcp.json` に `http://127.0.0.1:8000/mcp`。`~/xmcp/.env` の `X_API_TOOL_ALLOWLIST=searchPostsRecent,getUsersMe` で読み取り専用2ツールに制限 | 起動: `cd ~/xmcp && source .venv/bin/activate && python server.py`。二重起動でポート競合（errno 48）。`.env` で同じキーを再定義すると後勝ちで ALLOWLIST が無効化され147ツール全部（書き込み系含む）がロードされる |
| Grok API | xAI API 経由・従量課金 約0.1USD/回 | 12クエリ以上でバズ投稿を広く収集し3〜5クラスターに集約する高精度オプション |
| vidIQ MCP | `https://mcp.vidiq.com/mcp` を claude.ai/settings/connectors に追加 | 1億3,500万チャンネルのリアルタイムデータ。無料ベータ・読み取り専用 |
| `/last30days` スキル | ClawHub から導入 | Reddit・X・YouTube・TikTok・Hacker News・Polymarket・Bluesky・Web を同時走査。初期設定では Reddit・HN・Web が有効 |

**共通ルール（R-03）**: `createPosts` / `likePost` / `repostPost` 等の書き込み系ツールは絶対に ALLOWLIST に含めない。

xmcp の既知の制約: `min_faves` 演算子は現プランで使用不可（HTTP 400）。エンゲージメントフィルタは取得後に `public_metrics` で手動実施する。

## ローカル LLM（APIコストゼロ・機密情報の前処理）

Qwen（Ollama 経由）: RTX 3090（24GB VRAM）で `ollama run qwen2.5:32b`。
歌詞ラフ案出し・SynthV パラメータ検討・機密情報の前処理などの低コスト作業に使える。ACE-Step と同一マシンで動く。

## デザイン・マーケ

Claude Design（`claude.ai/design`）: マーケ素材・LP・スライドの AI デザイン。Web 版のみ・使用枠は独立（週リセット）。
Design System に CLAUDE.md を貼ると NOCTA ブランドが自動適用される。アカウントは DOCOMO R&D 企業アカウントを使う（2026-06-16 決定）。

GitHub Code Review（GitHub App）: `website/` の PR 作成時に自動コードレビュー（要 GitHub App 有効化）。

---

## MCP 管理の目安

MCP を入れすぎると 200k のコンテキストウィンドウが実質 70k まで縮小する。ツール総数は常に80以下を維持する（`/mcp` で確認）。

| 区分 | 対象 |
|---|---|
| 常時有効（最大5個まで） | `web_search`（トレンド調査・著作権確認）/ `filesystem`（ファイル操作） |
| 必要時のみ有効化 | SNS 連携 MCP（フェーズ4のリリース作業時のみ）/ Spotify API MCP（リリース後の分析時のみ） |
| 無効化推奨 | 使っていない MCP は `disabledMcpServers` に追加する。確認は `/mcp` |
