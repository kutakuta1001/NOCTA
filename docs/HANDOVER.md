# NOCTA プロジェクト 引き継ぎ書

最終更新: 2026-03-29

---

## 現在の楽曲プロジェクト: NuWord

| 項目 | 内容 |
|------|------|
| 曲名 | NuWord（読み: ニューワールド） |
| ジャンル | Jポップ・アニメソング寄り / 疾走感・期待感 |
| ターゲット | 何かを始めるすべてのアーティスト |
| SynthVキャラクター | Mai |
| BPM / キー | 152 / C#メジャー（Suno実測） |
| 採用差別化案 | 案A（森林のテクスチャー音響）+ 案B（落ちサビ→ラスサビ構成） |
| 採用歌詞 | 草稿A |
| **現在のフェーズ** | **フェーズ2-C（SVP生成待ち）** |
| 通過済みゲート | ①②③ |

### NuWordの次のアクション

1. CEOがStudio OneでMIDIを確認し「アレンジOKです」と伝える
2. `/phase2-svp A` を実行してSVPファイルを生成
3. SynthVで確認 → ゲート⑤通過
4. `/phase2-demo` でQ&A評価

---

## インフラ・設定の現状

### リモートトリガー（自動エージェント）

| 名前 | スケジュール | 次回実行 | 状態 |
|------|------------|---------|------|
| NOCTA-best-practices-review-weekly | 毎週月曜 9:00 JST | 2026-03-30 | 有効 |
| Monthly Interaction Pattern Review | 毎月1日 9:00 JST | 2026-04-01 | 有効 |

### 公式ドキュメントレビューキュー

`docs/best-practices-registry.md` の状態:
- **pending: 41件**（すべて未処理）
- 毎週1件ずつ自動処理 → 約10ヶ月で完了予定
- 最初にレビューされるのは「Best Practices」(No.1)

### HP（Netlify）

- リポジトリ: https://github.com/kutakuta1001/NOCTA
- デプロイ: Netlify（手動トリガー方式）
- 本番URL: NOCTAウェブサイト
- **commit後は毎回 Netlify で手動デプロイが必要**

---

## 直近セッションで構築・変更したもの

### 2026-03-26〜29 で新設されたもの

| 対象 | 内容 |
|------|------|
| website/index.html | Zora NFTコレクションリンクを追加 |
| website/blog-data.js | 「神話の力」（book）・「仕掛け学」ブログ記事を追加 |
| website/the-first-flower/ | The First Flower サブサイトを新設（引用ストリーム・プロフィール・ブログ・Flickrリンク） |
| CLAUDE.md | 308行 → 185行にスリム化。ルール整理・CODEMAP更新・スラッシュコマンド追記 |
| ~/.claude/commands/ | /best-practices-review・/blog-publish・/interaction-review を追加 |
| docs/best-practices-registry.md | 41件の公式ドキュメントレビューキューを新設 |
| リモートトリガー×2 | 週次ベストプラクティスレビュー・月次インタラクションレビューを設定 |
| drafts/interaction-review-2026-03-29.md | 初回インタラクションレビュー実施済み |

---

## CEOに判断・実行を求めていること

### すぐに対応が必要なもの

| 項目 | 内容 | 場所 |
|------|------|------|
| NuWord アレンジ確認 | Studio OneでMIDIを鳴らして「アレンジOKです」を伝える | outputs/midi/ |
| 週次レポートの確認 | 毎週月曜にdrafts/に生成されるbest-practices-report-*.mdを読む | drafts/ |

### 時間があるときに対応

| 項目 | 内容 | 場所 |
|------|------|------|
| CLAUDE.md MEMORYセクション | 音楽的傾向・制作注意点・マーケティング傾向を記入する（NuWordの経験から） | CLAUDE.md |
| Netlify デプロイ | HP変更があった場合は手動でデプロイする | https://app.netlify.com |

### 判断保留中（CEOが決める）

| 項目 | 内容 |
|------|------|
| PreCompactフック | コンテキスト圧縮前にhandoff.mdを自動更新するフック（設定済みか未設定か確認） |
| .env / ~/.ssh/ のdeny設定 | settings.jsonにアクセス拒否ルールを追加するか否か |

---

## 既知の改善ポイント（interaction-reviewより）

1. **アニメ等の微調整はcommit前に確認** — 同一箇所を複数回fixするパターンがある
2. **新規ファイルはgitに入れるか先に判断** — sample/インシデントの再発防止
3. **website/index.htmlの変更はまとめてcommit** — 細かい変更が累積してノイズになっている
4. **CLAUDE.md MEMORYセクションの記入** — 実プロジェクト経験が蓄積されていない

---

## スキルファイルの場所

```
~/.claude/commands/          ← 実際に動くスキル
├── best-practices-review.md
├── blog-publish.md
├── brainstorm.md
├── hp-add-work.md
├── interaction-review.md    ← 今回追加
├── music-init.md
├── music-reset-context.md
├── music-status.md
├── phase1-suno.md
├── phase1-trend.md
├── phase2-demo.md
├── phase2-music.md
├── phase2-svp.md
├── phase3-pv.md
├── phase4-release.md
├── phase5-golive.md
├── song-finish.md
├── song-list.md
└── song-switch.md

project_NOCTA/claude-config/commands/  ← gitで管理している参照用コピー
```

---

## 緊急時の対処

**「どこから再開すればいい？」**
→ `/music-status` → context.md と handoff.md を確認

**「gitでエラーが出る」**
→ `project_NOCTA/` の中にいるか確認: `git rev-parse --show-toplevel`

**「自動レポートが生成されていない」**
→ https://claude.ai/code/scheduled でトリガーの状態を確認

**「HPが更新されていない」**
→ commit/push後に Netlify で手動デプロイしたか確認
