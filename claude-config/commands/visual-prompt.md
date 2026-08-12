---
description: "GPT Image 2 / Kling 用のビジュアルプロンプトを生成したいとき、または /visual-prompt を実行するとき"
---

# /visual-prompt [作品名(省略可)]

NOCTAのスタイルガイドに基づいてGPT Image 2 / Klingプロンプトを生成します。
GPT Image 2はChatGPT Plusで手動生成（Thinking Mode推奨）。API従量課金は使わない。

## Step 1: スタイルガイドを読む

`visual/style-guide.md` を必ず Read する。これが全プロンプトの基盤。

## Step 2: concept.mdを探す

引数 [作品名] が与えられた場合:
1. `visual/standalone/[作品名]/concept.md` を探す
2. なければ `visual/linked/[作品名]/concept.md` を探す
3. 見つかれば Read して Step 4 へ進む
4. 見つからなければ Step 3 へ

引数がない場合は Step 3 へ。

## Step 3: 情報収集（concept.mdがない場合のみ）

以下を順番に1つずつ質問する:

**Q1**: 単体作品ですか？それとも楽曲連動ですか？
```
A) 単体作品（standalone/）
B) 楽曲連動（linked/[曲名]/）
```

**Q2**: 作品名を教えてください（ディレクトリ名になります）

**Q3**: 今回のテーマ・伝えたいこと・イメージを自由に教えてください
（「夢から覚める瞬間」「森の奥で光を見つける少女」等、断片でOK）

**Q4**: 今回使いたいアクセントカラーはありますか？
スタイルガイドの6色から選ぶか「おまかせ」でも可。

**Q5**: 人物の配置は？
```
A) 正面・顔あり
B) 後ろ姿
C) 横顔・横向き
D) シルエット
E) 人物なし（風景・オブジェクト）
F) おまかせ
```

**Q6**: 制約・参考（任意）
- 色数の上限（例: 2〜3色に絞りたい、1色のグラデーションのみ）
- 禁止したい要素（例: テキスト不要、建物不要、笑顔不要）
- 参考作品URL（ムードボードとして使うIPFS画像やURLがあれば）
→ 特になければ「なし」でOK

全回答を受け取ってから生成に進む。

## Step 4: プロンプト生成

Q6 の制約（色数上限・禁止要素・参考URL）をプロンプトの骨格として先に設定し、スタイルガイドの共通パラメータ＋収集した情報を組み合わせて以下を生成する。

### GPT Image 2 プロンプト（3バリエーション）

ChatGPT Plus → GPT Image 2選択 → Thinking Mode ON → プロンプトをペーストして手動生成（API不使用）

各バリエーションは以下の構造で作る:
```
[被写体・人物描写]. [シーン・環境].
Color palette: [アクセントカラーのhex値] glow, neon green #39FF6A accent, very dark background #05050F.
Cinematic lighting, grain noise film texture, deep shadows, ethereal glow.
[雰囲気キーワード: dark atmospheric, mysterious, dreamlike, painterly fine art quality].
[日本語テキスト指定（あれば）: Include Japanese text "〇〇" at top-center in bold white lettering.]
Aspect ratio: [X:Y]. Avoid: bright colors, white background, daylight, red, pink, orange, smiling faces.
```

バリエーションの違い:
- **G1**: 標準構図（最もイメージに忠実）
- **G2**: より抽象的・象徴的（シーンの比喩・オブジェクトへの置換）
- **G3**: クローズアップまたは引きの構図変化

### Klingプロンプト（2バリエーション）

各バリエーションは以下の構造で作る:
```
[静止画の状態から始まる描写],
Motion: [緩慢な動きの種類],
Camera: [カメラワーク],
Atmosphere: [光・煙・霧の動き]
Duration: 5-10 seconds, slow motion feel
```

バリエーションの違い:
- **K1**: カメラが動く（人物は静か）
- **K2**: 人物・環境が動く（カメラは固定）

## Step 5: プレビュー表示・確認

以下の形式で表示する:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 NOCTA Visual Prompt: [作品名]
使用カラー: [アクセントカラー名]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【GPT Image 2 G1 — 標準構図】
[プロンプト全文]

【GPT Image 2 G2 — 象徴的】
[プロンプト全文]

【GPT Image 2 G3 — 構図変化】
[プロンプト全文]

【Kling K1 — カメラムーブ】
[プロンプト全文]

【Kling K2 — 被写体ムーブ】
[プロンプト全文]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

「このまま保存しますか？修正点があれば教えてください。」と聞く。

## Step 6: 保存

CEOのOKが出たら:

### standalone の場合
`visual/standalone/[作品名]/` ディレクトリを作成（なければ）して
`visual/standalone/[作品名]/prompts.md` に保存。

### linked の場合
`visual/linked/[曲名]/prompts.md` に保存（または追記）。

保存フォーマット:
```markdown
# [作品名] プロンプト集
生成日: YYYY-MM-DD
使用カラー: [カラー名]
テーマ: [テーマ]

---

## GPT Image 2

> ChatGPT Plus → GPT Image 2 → Thinking Mode ON → ペーストして手動生成（API不使用）

### G1 — 標準構図
[プロンプト]

### G2 — 象徴的
[プロンプト]

### G3 — 構図変化
[プロンプト]

---

## Kling

### K1 — カメラムーブ
[プロンプト]

### K2 — 被写体ムーブ
[プロンプト]

---

## 生成結果メモ（CEOが手動で記録）
- 採用した画像:
- 採用した動画:
- 次回への改善点:
```

## Step 7: コピーライン生成

Warpcastでシェアするときに作品に添えるコピーラインを3案生成する。

ルール:
- **音楽用語 × SNS/Warpcast用語**の二重の意味を持たせる
- 例: "SILENCE ON THE TIMELINE." → SILENCE（音楽の静寂）× TIMELINE（Warpcastのフィード）
- 1行・英語・句点（.）で終わる・10〜20文字以内
- 今回のテーマ・使用カラーからインスピレーションを得る

出力形式:
```
【コピーライン案】
A. "[コピーライン1]"
   → [音楽的意味] × [SNS的意味]

B. "[コピーライン2]"
   → [音楽的意味] × [SNS的意味]

C. "[コピーライン3]"
   → [音楽的意味] × [SNS的意味]
```

採用したコピーラインは prompts.md の「生成結果メモ」に記録する。

## Step 8: git commit

```bash
git add visual/
git commit -m "feat(visual): [作品名] プロンプト生成"
git push origin main
```

コミットメッセージに「Co-Authored-By:」を含めないこと。

## Step 9: 完了を伝える

「プロンプト生成完了
保存先: visual/[standalone or linked]/[作品名]/prompts.md

ChatGPT Plus（GPT Image 2 + Thinking Mode ON）でG1〜G3を順に貼り付けて手動生成してください。
採用した画像のIPFSハッシュをprompts.mdの「生成結果メモ」に記録してください。
スタイルガイドへのフィードバックがあれば /visual-style-update で反映できます。」

---

IMPORTANT:
- style-guide.md を必ず毎回読む（キャッシュしない）
- 実画像・動画ファイルはgitに追加しない
- プロンプトは英語で書く（GPT Image 2は英語・日本語ともに高精度だが、色値・スタイル指定は英語推奨）
- 日本語テキストを画像に含める場合はカギカッコで明示する（例: Include Japanese text "夜明け" at top-center）
- GPT Image 2 APIは使わない（ChatGPT Plusで手動生成・コスト最小化）
- コミットメッセージに「Co-Authored-By:」を含めない

## Gotchas
- imgUrl の CIDv1 は必ず59文字（bafybei〜）。60文字以上は末尾が余分で 422 エラーになる
- zoraUrl が不明な場合は `"https://zora.co/@kutakuta1001"` を使う
- visual-data.js の3配列（WORKS / ART / MUSIC）のどれに追加するか先に確認する
