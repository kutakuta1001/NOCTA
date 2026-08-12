---
description: "フェーズ4のリリース準備（SNS/PR/著作権/KPI）を4エージェント並列で実行するとき"
---

リリース準備を並列で実行してください。

sns-batch-agent・analytics-agent・press-release-writer・copyright-agent を
Agent Teams で起動し、以下を並列実行してください:

【sns-batch-agent】: drafts/sns_calendar.md（リリース前後の投稿計画・ハッシュタグ戦略）
【analytics-agent】: drafts/kpi.md（KPI目標・計測チェックリスト・対応プレイブック）
【press-release-writer】: drafts/press_release.md（400/800/1200字版・DM文・フォローアップ）
【copyright-agent】: drafts/legal_check.md（著作権確認・JASRAC手順・AI素材の権利整理）

全完了後、outputs/approved/release_checklist.md にCEO確認待ち項目を一覧化してください。
「承認ゲート⑧：各ファイルを確認してください」と案内してください。

【GEO対応（各エージェント共通）】: 楽曲説明文・ブログ記事・プレスリリースをAI検索エンジン対応（GEO: Generative Engine Optimization）に構造化する。楽曲コンセプト・BPM・キー・ムード・ジャンルをメタデータとして明記し、AI生成検索に引っかかりやすい構造化テキストを各ドラフトに含める。
