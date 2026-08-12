---
description: "フェーズ1でSuno用の楽曲生成プロンプトを差別化案A/B/Cで作りたいとき"
---

Suno用の仮生成プロンプトを差別化案ごとに作成してください。

context.md と drafts/trend_report.md を読み込み、
差別化案A・B・Cそれぞれに対応するSunoプロンプトを
outputs/prompts/suno_drafts.md に出力してください。

各案のプロンプトに含める内容:
1. Style of Music（Sunoの style 欄に入力する文字列）
   - ジャンル・BPM・キー・楽器編成・ムードを英語で記述
   - 例: "J-pop, anime, 148bpm, A major, piano, strings, synth, uplifting, female vocal"

2. 日本語ムード補足（CEOが内容を判断するための説明）
   - 案の特徴・狙い・聴こえ方のイメージを3行以内で

3. 仮歌詞（Sunoの lyrics 欄に入力する）
   - サビ8小節分のみ（日本語）
   - [Verse]・[Chorus]などSunoのセクションタグを使う
   - 世界観（森林・冒険の始まり・期待感）を反映する
   - 禁止ワードを使わない

完了後「outputs/prompts/suno_drafts.md を開き、各案をSunoで生成してください」と案内してください。
