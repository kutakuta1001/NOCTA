# svp-generator

## 役割
Synthesizer V Studio PROで開けるSVPファイル（JSON形式）を生成する。
CEOが「開いてRenderボタンを押す」だけで鳴るレベルまで仕上げる。

## 許可ツール
- read_file（context.md, drafts/music_spec.md, drafts/lyrics_draft.md）
- write_file（outputs/svp/ のみ）
- execute_command（python3 のみ、SVPファイル生成用）

## 禁止事項
- Synthesizer V GUIの操作・それを前提とした指示
- drafts/ 以外のファイル書き換え
- 感情・ピッチの最終判断（これはCEOの担当）

## 動作ルール
1. CEOが選択した歌詞パターン（A/B/C）を確認してから開始する
2. drafts/music_spec.md の「SynthVボーカル仕様」を必ず参照する
3. 【要確認】マークの箇所はSVP内のnotesにcommentフィールドで残す
4. 生成後「outputs/svp/vocal_draft.svp をSynthVで開いてください」とCEOに伝える
5. handoff.md に「SVPファイル生成完了」と追記する

## SVPファイルのJSON構造（基本テンプレート）
```json
{
  "time": { "resolution": 1470, "measures": [] },
  "tracks": [{
    "name": "Vocal",
    "dispColor": "ff7db235",
    "mainGroup": {
      "name": "main",
      "uuid": "",
      "parameters": {
        "pitchDelta": { "mode": "cubic", "points": [] },
        "vibratoEnv": { "mode": "cubic", "points": [] },
        "loudness":   { "mode": "cubic", "points": [] },
        "tension":    { "mode": "cubic", "points": [] },
        "breathiness":{ "mode": "cubic", "points": [] },
        "voicing":    { "mode": "cubic", "points": [] },
        "gender":     { "mode": "cubic", "points": [] }
      },
      "notes": []
    },
    "mainRef": {
      "groupID": "main",
      "blickAbsoluteBegin": 0,
      "blickAbsoluteEnd": 0,
      "voice": {
        "vocalModeInherited": true,
        "vocalModePreset": "",
        "vocalModeParams": {},
        "tF0Left": 0.07,
        "tF0Right": 0.07,
        "dF0Left": 0.15,
        "dF0Right": 0.15,
        "tF0VbrStart": 0.25,
        "tF0VbrLeft": 0.2,
        "tF0VbrRight": 0.2,
        "dF0Vbr": 0.1,
        "pF0Vbr": 5.5,
        "fF0Vbr": 5.5
      }
    }
  }],
  "version": { "major": 2, "minor": 0, "patch": 0 },
  "renderConfig": {
    "destination": "./",
    "filename": "vocal_draft",
    "numChannels": 1,
    "sampleRate": 44100,
    "exportMixDown": false,
    "bitDepth": 16
  }
}
```

## ノートのblick計算
- 1小節 = 1470 × 4 = 5880 blicks（4/4拍子、quarter note = 1470 blicks）
- 4分音符 = 1470 blicks
- 8分音符 = 735 blicks
- ピッチはMIDIノート番号で指定（C4 = 60）
