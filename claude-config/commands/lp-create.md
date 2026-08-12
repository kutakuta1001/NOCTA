---
description: 楽曲LP・プロダクト説明LPを新規作成するとき
argument-hint: "対象名（曲名またはサービス名）"
---

# /lp-create [対象名]

NOCTAのデザインシステムとClaude Designを使って、楽曲または説明用LPを構築する。

## フェーズ概要

```
Phase 0: 最小シード収集（CEO対話）
Phase 1: デザインブリーフ生成 → CEO確認（承認ゲート）
Phase 2: Claude Design実行（CEO手動）→ フィードバック収集
Phase 3: HTML実装
Phase 4: 確認・ブラッシュアップ → 公開
```

---

## Phase 0: 最小シード収集

1. `context.md` を Read し、現在のプロジェクト情報を確認する
2. 引数 [対象名] が楽曲名と一致すれば `drafts/music_spec.md` / `drafts/lyrics_draft.md` から世界観キーワードを自動抽出して提示する
3. CEOに以下のみ確認する（全て任意。「お任せ」可）:

```
① 感情を3単語で（例: 孤独・夜明け・希望）
② 参考URLがあれば1つ（Pinterest/好きなLP等）
③ 種別: 楽曲LP か 説明LP か
④ ブランド継承度:
     高 = NOCTA準拠（#05050F ダーク・NOCTAカラー完全使用）
     中 = カラーシステムのみ継承（レイアウトは楽曲世界観優先）
     低 = 楽曲世界観優先（独自カラースキーム・the-first-flower方式）
```

「お任せ」「分からない」 → 継承度「中」として処理する。

---

## Phase 1: デザインブリーフ生成

`website/DESIGN.md` のセクション12「感情-ビジュアル変換テーブル」を Read して参照する。

`drafts/design-brief-[対象名].md` を生成する:

```markdown
# デザインブリーフ: [対象名]
種別: 楽曲LP / 説明LP
ブランド継承度: 高 / 中 / 低
作成日: YYYY-MM-DD

## エモさ定義
感情キーワード:
色彩指示: （感情-ビジュアル変換テーブルから導出）
レイアウト傾向:
禁止要素:

## ビジュアルリファレンス
（CEOが提供したURLと抽出したポイント。なければ「なし」）

## NOCTAブランド継承
（継承度に応じてDESIGN.mdから引用する範囲。セクション番号で指定）

## Claude Design 注入プロンプト（800トークン以内）
---
[NOCTAデザインシステム抜粋（セクション1+4から必要部分のみ）]

[対象名]の[楽曲LP/説明LP]を作成します。
[エモさ定義から生成した具体的な指示]

[ワイヤーフレーム画像がある場合: 「添付の画像をレイアウト参考にしてください」と1行追加]

まず1画面分（ヒーローセクション）のHTMLをTailwind CSSで生成してください。
---

## フィードバック記録（事後）
（Phase 2のやり取りで判明したことを追記する）
```

デザインブリーフと同時に、`outputs/prompts/wireframe-[対象名].md` を生成する:

```markdown
# GPT Image 2 ワイヤーフレームプロンプト: [対象名]

## プロンプト（ChatGPT Plus に貼り付けて実行）
Wireframe layout for a music landing page. Style: clean low-fidelity wireframe,
black lines on white background, no colors, no photos.

Sections (top to bottom):
1. Hero: [感情キーワード1] typography + [感情キーワード2] visual motif, centered
2. [楽曲名 or サービス名] + tagline, large display font
3. Visual area: [世界観イメージ 1行]
4. CTA button: centered
5. Footer

Aspect ratio: 9:16 (mobile-first). Label each section in Japanese.
```

CEOがChatGPT Plus（GPT Image 2）でワイヤーフレーム画像を生成し、Phase 2でClaude Designに添付すると、レイアウト精度が向上する（任意・推奨）。

CEOに確認し、**Goサインをもらってから**「Claude Designに貼り付けてください」と伝えてPhase 2へ進む。

**ワイヤーフレーム共有後の自動強化フロー（2段階実装）:**
CEOがワイヤーフレーム画像を共有したら、Claude Codeは以下を自動実行する:
1. ワイヤーフレームのレイアウト・セクション構成を読み取り、「Claude Design 注入プロンプト」を詳細版（セクション別指示・余白・タイポグラフィを明示）に自動更新する
2. 詳細版プロンプトを `design-brief-[対象名].md` の「Claude Design 注入プロンプト」に上書き保存し、CEOに「詳細プロンプトを更新しました。Claude Designに貼り付けてください」と案内する

この2段階フロー（GPT Image 2モック → 詳細プロンプト自動生成 → Claude Design）によりHTML実装との一貫性が向上する。

---

## Phase 2: Claude Design反復

CEOがClaude Designで生成した結果を共有する。

**「ここが違う」場合**: どう修正するかをCEOと確認 → 注入プロンプトを更新 → 再実行を促す

**「これでいい」場合**: Phase 3へ

このフェーズで判明したことを `design-brief-[対象名].md` の「フィードバック記録」に事後追記する（次回のための知識蓄積）。

---

## Phase 3: HTML実装

`website/[slug]/` ディレクトリに `index.html` を作成する。

実装前に以下を Read する:
- `website/the-first-flower/index.html`（既存LP参照例）
- `website/DESIGN.md`（デザインシステム全体）

**HTML生成前に `frontend-design:frontend-design` スキルを呼び出す。**
デザインブリーフの以下を渡してガイドラインを適用する:
- Tone: ブリーフの「エモさ定義」から導出（例: `"editorial serif-led warm minimal"` / `"retro-futuristic dark"` / `"brutalist raw"`）
- Constraints: Tailwind CSS CDN・相対パス・Syne/Bebas Neue フォント使用
- Differentiation: 楽曲の感情キーワード1つを「記憶に残るポイント」として指定
- NOCTAデザイン言語: 背景 `#05050F`・セリフ体見出し・brand-secondary グリーンアクセント

実装ルール:
- 楽曲LP（継承度 低/中）: 独自カラー変数を Tailwind config で定義する（the-first-flower方式）
- 説明LP（継承度 高）: NOCTAブランドカラーをそのまま使う
- スクロールアニメーション・グラスカード等はDESIGN.mdのコンポーネント仕様に従う
- パス規則: すべて相対パス（`./` または `../`）。絶対パスは使わない（GitHub Pages対応）

**CEOへの確認なしに `website/` への書き込みを開始しない（R-13）**

---

## Phase 4: ブラッシュアップ・公開

CEOが確認して修正指示を出す。

完了したら以下を案内する:

```bash
# HPを公開する（CEOが実行）
git add website/[slug]/
git commit -m "feat(lp): [対象名] LPを追加"
git push origin main
```

handoff.md に完了を1行追記して終了。

---

## IMPORTANT

- R-04: Claude Designは直接実行しない。注入プロンプトを生成してCEOに渡す
- R-13: CEO承認なしに `website/` へのファイル書き込みを開始しない
- Claude Design注入パッケージは800トークン以内に圧縮する（セッション内での切り捨て防止）
- `DESIGN.md`（グローバルブランドルール）と `design-brief-*.md`（プロジェクト固有）を混同しない
- the-first-flowerの独自カラースキーム（tff-base, tff-accent等）を参考例として活用する
- 実装HTMLは最初 `drafts/` に一時保存し、CEOのOK後に `website/[slug]/` へ移動する

## Gotchas

- 楽曲LPで継承度「低」を選んだ場合でも、Tailwind CDNとフォント（Syne/Bebas Neue）はそのまま使ってよい
- Google Stitchは任意のリサーチツール。使いたい場合はPhase 0で「参考URLを1つ」に含めてもらう（必須ではない）
- design-briefのフィードバック記録を積み重ねることで、次の楽曲LPがより速く作れるようになる
