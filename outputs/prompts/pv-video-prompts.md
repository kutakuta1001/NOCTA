# Runway 動画生成プロンプト: NOCTA Visual 01
作成日: 2026-04-19（v2: モーション重視に改訂）
比率: 3:4（縦）
モデル: Gen4
参照画像: outputs/pv/images/key/pixai-1740507823417249341-zora girl #3.png

## 改訂方針（v2）
カメラ指示を減らし「シーン内の要素が実際に動く」描写を前面に出す。
Runwayはカメラ指示が強すぎるとズームのみの静止画になりやすい。

---

## Scene 01 — opening

画像: outputs/pv/images/key/pixai-1740507823417249341-zora girl #3.png
Duration: 10s | Ratio: 3:4

**prompt_text（Runway に貼り付け）:**
> Wisteria blossoms sway and tremble in a gentle breeze,
> long purple petals detach and drift slowly downward through the air,
> the girl's long hair flows softly to one side,
> dappled light shifts and shimmers through the flower clusters,
> more and more petals fill the air as seconds pass,
> dreamy painterly anime style, soft pastel purple and white,
> slow motion, melancholic and serene

保存先: outputs/pv/clips/scene01.mp4

---

## Scene 02 — introspection

画像: outputs/pv/images/key/pixai-1740507823417249341-zora girl #3.png
Duration: 10s | Ratio: 3:4

**prompt_text（Runway に貼り付け）:**
> Purple wisteria petals fall slowly downward in front of the girl's face,
> her long purple hair sways gently to one side in a quiet breeze,
> soft light reflects and shimmers in her blue eyes,
> petals drift down past her shoulders and disappear below,
> warm bokeh glows softly pulse in the background,
> painterly anime style, pastel lavender tones,
> slow motion, intimate and still, dreamy atmosphere

保存先: outputs/pv/clips/scene02.mp4

---

## Scene 03 — ending

画像: outputs/pv/images/key/pixai-1740507823417249341-zora girl #3.png
Duration: 10s | Ratio: 3:4

**prompt_text（Runway に貼り付け）:**
> A cascade of purple wisteria petals falls heavily from above,
> petals swirl and spiral around the girl in slow motion,
> the air fills with soft floating petals until the scene is dense with them,
> the overall light gradually brightens to a soft white glow,
> the girl remains still as the world of petals dissolves around her,
> ethereal painterly anime style, pastel lavender and white,
> slow motion, fading into light

保存先: outputs/pv/clips/scene03.mp4

---

## Runway での操作手順

1. Runway Web UI（app.runwayml.com）を開く
2. **Gen4** → **Image to Video** を選択
3. 参照画像をアップロード: `pixai-1740507823417249341-zora girl #3.png`
4. 上記の prompt_text を貼り付け
5. Duration・Ratio を設定（各シーンの指定通り）
6. 生成後、以下の命名で保存:
   - Scene 01 → `outputs/pv/clips/scene01.mp4`
   - Scene 02 → `outputs/pv/clips/scene02.mp4`
   - Scene 03 → `outputs/pv/clips/scene03.mp4`
7. 3ファイル配置完了したら `/pv-create edit` を実行

## うまくいかない場合の追加ヒント

- **Motion Brush**: Runwayに搭載されている場合、藤・花びらのエリアを手動でブラシ指定するとモーションが集中しやすい
- **短くする**: プロンプトが長すぎるときは太字部分の最初の2〜3行だけに絞るとシンプルに動く
- **「cinematic」「slow motion」を末尾に必ず残す**: スタイルの安定に効く
