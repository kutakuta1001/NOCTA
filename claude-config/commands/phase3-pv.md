PV制作を並列で実行してください。

concept-director と visual-prompter を Agent Teams で起動し、以下を並列実行してください:

【concept-director】
- handoff.md を読み込み楽曲の世界観を把握する
- PVコンセプト・カラーパレット・絵コンテ（10シーン）を drafts/pv_concept.md に生成する

【visual-prompter】（concept-director 完了後に開始）
- Midjourney用プロンプト10本（英語）を生成する
- Runway/Kling用動画プロンプト5本を生成する
- YouTubeサムネイル用プロンプト3本を生成する
- outputs/prompts/visual_prompts.md に出力する

完了後「承認ゲート⑥：PVコンセプトを確認してください」と案内してください。
