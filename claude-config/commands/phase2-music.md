楽曲設計を並列で実行してください。

まず handoff.md と context.md を読み込んでください。
CEOが承認ゲート①で報告したBPM・キー・コード進行の情報があれば、
それを music-spec-writer への最優先情報として使ってください。
Sunoで実測した数値はトレンドレポートの推奨値より優先します。

music-spec-writer と lyric-poet を Agent Teams で起動し、以下を並列実行してください:

【music-spec-writer】
- drafts/trend_report.md を読み込む
- CEOがSunoで確認したBPM・キー・コード進行を仕様書の基準値として使う
- Studio One用楽曲仕様書を drafts/music_spec.md に生成する
- Pythonで melody_draft.mid と chord_draft.mid を outputs/midi/ に生成する
- MIDIはStudio OneのChord Trackで取得したコード進行に合わせる

【lyric-poet】（music-spec-writer 完了後に開始）
- drafts/music_spec.md を読み込む
- 歌詞草稿A/B/Cを drafts/lyrics_draft.md に生成する
- 各行に音節数【○音】と【要確認】マークを付ける

完了後「承認ゲート②：仕様書を確認、承認ゲート③：歌詞を選んでください」と案内してください。
