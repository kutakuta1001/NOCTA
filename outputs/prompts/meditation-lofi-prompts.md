# 瞑想用ローファイ・環境音 — Suno v5 プロンプト集

用途: NOCTAアプリ内BGM（Seed / Verse / inner canvas）
生成日: 2026-04-26
参照: drafts/brainstorm_meditation-lofi.md

---

## 使い方

1. Suno v5（suno.com）にアクセス
2. 「Instrumental」モードをONにする（ボーカルなし）
3. 各トラックのプロンプトをペーストして生成
4. 気に入ったバージョンをダウンロード（MP3）
5. 必要に応じてビットレートを64〜96kbpsに変換し3MB以下を確認

**エンコード確認コマンド（ffmpegがある場合）:**
```bash
ffmpeg -i input.mp3 -b:a 96k -ac 2 output_96k.mp3
ls -lh output_96k.mp3
```

---

## Track 01 — 茶室の朝

**アプリ割当案**: Verse（言葉・静寂）

```
[lo-fi, Japanese ambient, meditation, instrumental, no vocals]

A peaceful Japanese tearoom at dawn. The soft sound of rain against shoji screens, 
water being poured into a ceramic bowl, occasional sparse piano notes played with 
long silences in between. Deep, meditative stillness. Wabi-sabi aesthetic — 
imperfect, quiet beauty. Very slow tempo around 55 BPM. Reverberant piano in 
a distant room. Gentle low drone underneath. Seamlessly loopable.

Mood: reflective, calm, ceremonial, breath-like
Avoid: drums, percussion, melody-heavy, energetic, bright
```

---

## Track 02 — 森の夜明け

**アプリ割当案**: Seed（創造・始まり）

```
[nature ambient, lo-fi, forest, meditation, instrumental, no vocals]

A Japanese forest at first light. Morning birds calling softly in the distance, 
dewdrops falling from leaves, a gentle breeze through bamboo. Barely audible 
acoustic piano plays a simple two-note motif that repeats and fades. 
The forest breathes slowly. BPM around 60. Layered field recordings of woodland 
atmosphere. Occasional bell-like piano overtones ringing into silence.

Mood: awakening, pure, open, gentle optimism
Avoid: drums, bass, chord progression, dynamic changes, energetic builds
```

---

## Track 03 — 川辺の静寂

**アプリ割当案**: （汎用）

```
[water ambient, lo-fi, meditation, instrumental, no vocals]

A shallow mountain stream in Japan. The continuous, hypnotic sound of water 
over smooth stones. A slow synthesizer pad — warm, slightly detuned — drifts 
underneath like fog on the water. No melody. Pure texture and flow. 
BPM around 65. Binaural-style panning of the water. Occasional distant 
wind chime, very faint. The stream never stops, constant and reassuring.

Mood: release, flow, letting go, quiet presence
Avoid: piano, percussion, melody, bright sounds, tempo-driven patterns
```

---

## Track 04 — 雨のカフェ

**アプリ割当案**: （汎用）

```
[lo-fi café, rainy day ambient, meditation, instrumental, no vocals]

Early morning in a small Japanese café before opening. Rain against the window. 
The faint sound of distant coffee brewing, ceramic cups placed gently. 
A soft, slightly muffled upright piano plays slow, impressionistic chords — 
Satie-like, unhurried. Vinyl crackle texture in the background. 
BPM around 70. The scene is intimate and interior, inviting inward attention.

Mood: introspective, cozy, slightly melancholic, focused
Avoid: drums, bass beat, bright melody, upbeat, vocals
```

---

## Track 05 — 内省

**アプリ割当案**: inner canvas（内向き・深層）

```
[deep ambient, meditation, drone, instrumental, no vocals]

Pure meditative space. A Tibetan singing bowl struck once, its overtones fading 
slowly into silence, then struck again. Underneath, a barely audible low-frequency 
drone — like a room's natural resonance. No rhythm, no melody, no time signature. 
Absolute stillness punctuated by the bowl's harmonic ring. 
The space between sounds is as important as the sounds themselves. 
BPM: none (free-form). Reverb tail of 8+ seconds.

Mood: depth, non-thought, dissolution, pure awareness
Avoid: piano, nature sounds, melody, rhythm, any busy elements
```

---

## 生成後チェックリスト

各トラック生成後に以下を確認する:

- [ ] ボーカル・歌声が入っていないか
- [ ] ファイルサイズが3MB以下か（エンコード後）
- [ ] 2〜4分の尺か
- [ ] ループ再生したとき繋ぎ目が不自然でないか
- [ ] アプリの世界観（Seed / Verse / inner canvas）と合っているか

採用した音源は `outputs/audio/meditation/` に保存する（gitignore対象）。
アプリへの組み込みは別セッションで設計する。
