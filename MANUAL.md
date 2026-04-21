# NOCTA スキル取扱説明書

NOCTAで使える主要スキルの操作手順まとめ。
詳細なルールは `CLAUDE.md`、デザイン仕様は `website/DESIGN.md` を参照。

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

Midjourney / Kling向けビジュアルプロンプト生成。楽曲ジャケット・SNSバナー・アート作品に使う。
LPや画面レイアウトには使わない（→ `/lp-create` を使う）。

---

## /lp-create と /visual-prompt の使い分け

| 作りたいもの | 使うスキル |
|---|---|
| 楽曲LP・説明LPのページ | `/lp-create` |
| 楽曲ジャケット・SNSバナー | `/visual-prompt` |
| PV動画のキービジュアル | `/pv-create story` → `/visual-prompt` |
| Visualセクション用アート | `/visual-prompt` → `/visual-add` |
