# HP改善ブレインストーム — NOCTA
作成日: 2026-03-25

---

## 合意した前提

| 項目 | 決定内容 |
|---|---|
| Works表示方式 | YouTube iframe埋め込み（モーダル形式） |
| Stats Bar | 実数に変更（架空数値を削除） |
| SNSアカウント | X（Twitter）、note |
| Works追加方式 | 1曲ずつ増やす構造（データ配列で管理） |
| 言語 | 日英バイリンガル |

---

## 改善項目一覧（優先度順）

### P1 — リリース前に必須

#### 1. Works セクション: データ配列化 + YouTube モーダル
**現状**: カードがHTMLにハードコード。プレースホルダー作品のみ。
**改善**:
- `works-data.js` に曲データを配列で持たせる（YouTube ID・タイトル・説明・カテゴリ）
- カードクリック → YouTube iframeモーダルで再生
- 曲を追加するときは配列に1オブジェクト足すだけで自動レンダリング

```js
// 例: works-data.js のデータ構造
{ id: "NuWord", title: "NuWord", youtubeId: "XXXX", cat: "music", desc: "..." }
```

#### 2. Stats Bar: 実数化
**現状**: 300曲・120映像・50タイアップ（架空）
**改善案**:

| 指標 | リリース前 | NuWord公開後 |
|---|---|---|
| 公開楽曲数 | 0 | 1 |
| 公開PV本数 | 0 | 1 |
| SNSフォロワー合算 | 実数 | 実数 |
| 可能性 ∞ | そのまま維持 | そのまま維持 |

- `data-count` の値を手動で更新するシンプル運用で十分
- "0" から始まることで誠実さをアピールできる（スタートアップらしさ）

#### 3. SNSリンク: X と note に絞る
**現状**: おそらく複数のプラットフォームアイコンが並んでいる
**改善**:
- X: 音楽・リリース情報
- note: 制作ブログ・ライナーノーツ・舞台裏
- 不要なSNSアイコン（Instagram等）は非表示または削除

---

### P2 — NuWordリリース時に対応

#### 4. 日英バイリンガル化
**方式**: JSによる言語切り替え（ページリロードなし）
- Navbarに `JA / EN` トグルボタンを追加
- 各テキスト要素に `data-ja` / `data-en` 属性を付与
- ボタンクリックで `innerHTML` を切り替え
- `localStorage` で言語設定を保持

**優先翻訳箇所**（ファーストビュー優先）:
1. Hero キャッチコピー
2. About 本文
3. Works カードの説明文
4. Services 説明
5. Contact フォーム

#### 5. OGP / SEO メタタグ
**現状**: なし（SNSシェア時に画像・タイトルが表示されない）
**追加が必要なタグ**:
```html
<meta property="og:title" content="NOCTA — Music Entertainment">
<meta property="og:description" content="AIと人間の感性が融合する...">
<meta property="og:image" content="[アートワーク画像URL]">
<meta property="og:url" content="https://nocta-music.netlify.app">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@[X_アカウント名]">
```
- NuWordのアートワーク画像をOGP画像に使う
- SNSシェア時の見た目が一気に改善される

---

### P3 — 楽曲が3曲以上になったら

#### 6. Discographyページ分離
**現状**: Works/Portfolioが1ページにすべて混在
**将来構成案**:
```
index.html         ← 最新1〜2曲のみフィーチャー
discography.html   ← 全作品一覧（フィルター付き）
works/[曲名].html  ← 個別曲ページ（歌詞・制作メモ・試聴）
```
- 楽曲数が少ないうちは index.html 1本で十分
- 3曲以上になったタイミングで分離を検討

#### 7. note 連携ブロック
- Aboutセクション下部 or フッター上部に "Latest from note" ブロックを追加
- 最新記事タイトル + リンクを2〜3件表示
- note の RSS を fetch するか、手動更新で十分

---

## 実装の進め方（推奨順序）

```
Step 1: Works データ配列化（NuWordリリース日までに）
Step 2: Stats Bar 実数化（同上）
Step 3: SNSリンク整理（同上）
Step 4: OGP メタタグ追加（リリース当日）
Step 5: 日英バイリンガル化（リリース後1〜2週間以内）
Step 6: Discography分離（3曲目リリース前）
```

---

## 保留事項（CEOの判断が必要）

- X アカウント名（@???）→ OGPタグに必要
- note アカウントURL → リンク先に必要
- NuWordの YouTube動画ID → Works埋め込みに必要
- OGP用画像 → NuWordアートワークを使うか、NOCTAブランド画像を作るか
