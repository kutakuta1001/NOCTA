trend-analyst を使ってトレンド分析を実行してください。

context.md を読み込み、以下を drafts/trend_report.md に出力してください:
- 直近3ヶ月のチャート傾向（BPM帯・キー・構成の特徴）
- 参考楽曲5選（各楽曲で「何を参考にするか」を明記）
- 今避けるべきクリシェ3パターン
- 差別化の方向性提案（2〜3案）

完了後、以下のメッセージをCEOに表示してください:

---
【承認ゲート① 手順】

STEP 1: Sunoで試聴
以下のプロンプトをSuno（suno.com）に貼り付けて音を生成してください:
（trend_report.mdの推奨BPM・キー・ジャンルを元に自動生成）

STEP 2: Studio Oneで解析（気に入った音源があれば）
1. SunoのMP3をStudio Oneにドロップ
2. 「Detect Tempo」でBPMを取得
3. TunebatまたはKits AIでキーを確認
4. Chord TrackにMP3をドラッグ→「Detect Chords」でコード進行を抽出
5. 結果をメモしておく

STEP 3: 承認
以下の形式で返信してください:

承認ゲート①通過
- 採用する方向性: 案A/B/C（または独自）
- Sunoで確認したBPM: ○○
- Sunoで確認したキー: ○○
- Chord Trackで取れたコード進行の印象: ○○
- 特記事項: （任意）
---
