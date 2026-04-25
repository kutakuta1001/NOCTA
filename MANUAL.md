# NOCTA スキル取扱説明書 — デザイン・ビジュアル編

NOCTAのデザイン・ビジュアル制作スキルの操作手順まとめ。
楽曲制作スキルは `docs/MANUAL.md` §2を参照。詳細ルールは `CLAUDE.md`、デザイン仕様は `website/DESIGN.md`。

## デザインスキルの全体フロー

```
/visual-prompt [作品名]
  → ChatGPT Plus で GPT Image 2 手動生成（G1〜G3から選ぶ）
    → IPFS に登録（Zora 等）
      → /visual-add [作品名]   ← HP の Visual セクションに掲載

/lp-create [対象名]
  → design-brief 生成 → Claude Design 注入 → HTML 実装 → website/[slug]/

/pv-create story → /pv-create prompt → /pv-create edit
  → 絵コンテ → Runway/Kling プロンプト → FFmpeg 結合 → outputs/pv/

/design-status          ← いつでも現状確認
```

---

## /design-status

デザイン・ビジュアル制作の進捗を一覧表示する。

**いつ使うか**
- Visual作品が何件あるか確認したいとき
- LP制作・PV制作がどこまで進んでいるか確認したいとき
- 「次に何をするか」を整理したいとき

**使い方**
```
/design-status
```

**表示内容**
- Visual作品数（Works / Art / Music 別・最新作品タイトル）
- 進行中LP（`drafts/design-brief-*.md` の有無とフェーズ）
- 公開済みLP（`website/` 内のサブディレクトリ）
- PV進捗（pv_concept.md / pv_storyboard.md / outputs/pv/ の有無）
- 次のアクション提案

---

## /visual-add [作品名]

IPFS登録済みの画像を `website/visual-data.js` に追加し、HPのVisualセクションに掲載する。

**いつ使うか**
- GPT Image 2やその他ツールで生成した画像をIPFSに登録済みで、HPに載せたいとき
- `/visual-prompt` で生成した画像を採用したとき（フローの後半ステップ）

**使い方**
```
/visual-add                  ← タイトルをその場で聞かれる
/visual-add "rainy season #2"
```

**CEOが用意するもの**
| 項目 | 内容 |
|---|---|
| IPFSハッシュ | `bafybei` で始まる59文字のCIDv1（60文字以上はエラー） |
| Zora URL | NFTページURL（不明な場合は空Enterでスキップ可） |
| カテゴリ | W（Works）/ A（Art）/ M（Music）から選択 |
| 日本語説明文 | 1〜2文 |

---

## /lp-create [対象名]

楽曲LP・プロダクト説明LPを、Claude Designと連携して構築するスキル。

**いつ使うか**
- 楽曲ごとの専用ランディングページを作りたいとき（例: the-first-flower方式）
- サービス・プロダクトの説明LPを新規で作りたいとき

**使い方**
```
/lp-create NuWorld        ← 楽曲LP
/lp-create NOCTA Studio   ← サービス説明LP
```

### フロー概要

```
Phase 0: 最小シード収集（3単語 + 参考URL）
   ↓
Phase 1: design-brief生成 → CEO確認
   ↓
Phase 2: Claude Design実行（CEO手動）→ フィードバック
   ↓
Phase 3: HTML実装（website/[slug]/index.html）
   ↓
Phase 4: 確認・git push
```

### CEOが入力するもの（Phase 0）

| 項目 | 内容 | 省略時 |
|---|---|---|
| 感情キーワード | 3単語（例: 孤独・夜明け・希望） | 楽曲コンテキストから自動抽出 |
| 参考URL | Pinterest・Dribbble等（1つ） | なしで処理 |
| 種別 | 楽曲LP か 説明LP か | 楽曲LPとして処理 |
| ブランド継承度 | 高 / 中 / 低（下記参照） | 中 |

### ブランド継承度

| 継承度 | 適用場面 | 特徴 |
|---|---|---|
| 高 | プロダクト説明LP | NOCTAカラー・フォント完全準拠 |
| 中 | ジャンル統一感のある楽曲LP | カラーシステムのみ継承 |
| 低 | 楽曲固有の世界観LP | 独自カラースキーム定義（the-first-flower方式） |

### 成果物

| ファイル | 場所 | 内容 |
|---|---|---|
| design-brief | `drafts/design-brief-[対象名].md` | エモさ定義・Claude Design注入プロンプト・フィードバック記録 |
| LP本体 | `website/[slug]/index.html` | 実装HTML（Tailwind CSS） |

### 注意

- Claude Designへの注入は800トークン以内に圧縮済み（スキルが自動処理）
- CEOのGoサインなしに `website/` への書き込みは開始しない（R-13）
- ビジュアル画像（ジャケット・バナー）は `/visual-prompt` が担当。このスキルはUI/レイアウトのみ

### 参照

- デザインシステム: `website/DESIGN.md`
- 感情-ビジュアル変換テーブル: `website/DESIGN.md` セクション12
- レイアウトパターン集: `website/DESIGN.md` セクション13
- 既存LP実装例: `website/the-first-flower/index.html`
- スキル本体: `~/.claude/commands/lp-create.md`

---

## /pv-create [story|prompt|edit]

楽曲PV制作スキル。絵コンテ設計 → Runway/Klingプロンプト生成 → FFmpeg結合の3フェーズ。

```
/pv-create              ← 現在の状態を診断して次フェーズを提案
/pv-create story [名前] ← Phase 1: 絵コンテ設計
/pv-create prompt       ← Phase 2: 動画生成プロンプト出力
/pv-create edit [BGM]   ← Phase 3: クリップ結合・BGM合成
```

詳細: スキル本体 `~/.claude/commands/pv-create.md`

---

## /visual-prompt [作品名]

GPT Image 2 / Kling向けビジュアルプロンプト生成。楽曲ジャケット・SNSバナー・アート作品・NFT用画像に使う。
LPや画面レイアウトには使わない（→ `/lp-create` を使う）。

**生成されるもの:**
- GPT Image 2プロンプト G1〜G3（標準構図・象徴的・構図変化の3案）
- Klingプロンプト K1〜K2（カメラムーブ・被写体ムーブの2案）
- SNS / Warpcastコピーライン 3案（音楽用語×SNS用語の二重の意味）

**ChatGPT Plusでの手動生成手順:**
1. ChatGPT Plus を開いて GPT Image 2 を選択
2. Thinking Mode をONにする
3. G1〜G3から選んだプロンプトを貼り付けて生成
4. 採用した画像のIPFSハッシュを `visual/[作品名]/prompts.md` の生成結果メモに記録
5. → `/visual-add` でHPに追加

---

## スキル使い分け早見表

| 作りたいもの | 使うスキル |
|---|---|
| 楽曲LP・説明LPのページ | `/lp-create` |
| 楽曲ジャケット・SNSバナー・NFTアート | `/visual-prompt` → `/visual-add` |
| PV動画のキービジュアル | `/pv-create story` → `/visual-prompt` |
| 現状確認 | `/design-status` |
