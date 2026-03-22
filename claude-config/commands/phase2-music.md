楽曲設計の叩き台を並列で生成してください。

【重要前提】
生成するものはすべて「叩き台」です。
CEOがStudio Oneで確認・修正・作り直すことを前提に
最小限の素材を提供します。

まず handoff.md と context.md を読み込んでください。
CEOが承認ゲート①で報告したBPM・キー・コード進行の情報があれば、
それを music-spec-writer への最優先情報として使ってください。
Sunoで実測した数値はトレンドレポートの推奨値より優先します。

music-spec-writer と lyric-poet を Agent Teams で起動し、以下を並列実行してください:

【music-spec-writer へのタスク】
context.md と drafts/trend_report.md を読み込む。
CEOがSunoで確認したBPM・キー・コード進行を最優先情報として使う。

drafts/music_spec.md に以下を出力する:
- 基本設定（BPM・キー・拍子・全体尺）
- セクション構成（小節数・コード進行）
- Studio Oneトラック構成の提案
- SynthVボーカル仕様（アレンジ確定後に使用）

outputs/midi/ に以下を生成する:
- chord_draft.mid（コード進行の叩き台）
- bass_draft.mid（ベースラインの叩き台）
※メロディMIDIは生成しない
※CEOがメロディはオリジナルで作るため

【lyric-poet へのタスク】
music-spec-writer 完了後に開始する。
drafts/music_spec.md を読み込む。

drafts/lyrics_draft.md に以下を出力する:
- 世界観設定書（テーマ・禁止ワード・必須要素）
- 歌詞草稿A/B/C（3パターン）
- 各行に音節数【○音】を付ける
- 【要確認】マークを付ける
- 各パターンの末尾に「叩き台です。言葉・リズム・構成は自由に変更してください」と明記する

完了後、以下のメッセージをCEOに表示する:

---
叩き台が生成されました。

【次にやること（優先順）】

STEP 1: LALAL.AIでSunoの音源を分離する
  → drums.wav / bass.wav / chord.wav を取り出す

STEP 2: Studio Oneで新規プロジェクトを開く
  → Sunoの drums.wav・bass.wav をトラックに読み込む
  → chord_draft.mid をトラックに読み込む
  → 音を鳴らして全体の雰囲気を確認する

STEP 3: メロディをオリジナルで作る
  → music_spec.mdのキー・スケールを参考に
  → SynthVまたは鍵盤で自分のメロディを作る
  → ※Claude Codeはメロディを作りません

STEP 4: 歌詞を選んで修正する
  → lyrics_draft.mdのA/B/Cから気に入ったものを選ぶ
  → 自分の言葉に書き直してOK

STEP 5: アレンジが固まったら報告する
  → 「アレンジOKです」と送ると
     /phase2-svp が実行できるようになります
---
