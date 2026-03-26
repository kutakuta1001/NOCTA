# 設計書: Visual Portfolio セクション
**作成日**: 2026-03-26
**ステータス**: 承認済み

---

## 背景・目的

NOCTAブランドとして音楽以外にも、AIで生成したアートワーク（Art）および撮影した写真（Photo）を外部向けに発信するため、HPに Visual Portfolio セクションを追加する。

---

## 方針

- 画像ファイルは **Cloudinary** に保存し、URL参照のみを `visual-data.js` で管理する（Netlify のストレージ容量を消費しない）
- 既存の `works-data.js` パターンを踏襲し、運用フローを統一する
- Works セクションとは**独立した別セクション**として `index.html` に追加する

---

## ファイル構成

```
website/
├── visual-data.js   ← 新規: Visual ポートフォリオデータ配列
└── index.html       ← 修正: Visual セクション + ライトボックス追加
```

### `<script>` ロード順序

`index.html` の `<script src="works-data.js"></script>`（line 1132付近）の**直後**に追加する:

```html
<script src="works-data.js"></script>
<script src="visual-data.js"></script>  ← ここに追加
```

Visual グリッドのレンダリングスクリプトはこの後に記述する。

---

## データ構造（`visual-data.js`）

```js
/**
 * NOCTA Visual Portfolio Data
 *
 * 画像を追加するときは、この配列の先頭に新しいオブジェクトを追加してください。
 *
 * cloudinaryUrl : Cloudinary のフル解像度URL
 * thumbUrl      : Cloudinary の変換パラメータでサムネ生成（例: URL に /w_600/ を挿入）
 * cat           : "art" | "photo"
 */
const NOCTA_VISUALS = [
  {
    title: "タイトル",
    cat: "art",                        // "art" | "photo"
    cloudinaryUrl: "https://res.cloudinary.com/[cloud_name]/image/upload/v.../sample.jpg",
    thumbUrl: "https://res.cloudinary.com/[cloud_name]/image/upload/w_600/v.../sample.jpg",
    badge: "Art",
    badgeColorClass: "bg-brand-secondary/20 text-brand-secondary",
    descJa: "（説明を入力してください）",
    descEn: "（English description here）"
  }
];
```

### カテゴリ定義

| cat | 意味 | バッジ表示 |
|---|---|---|
| `"art"` | AIで生成したアートワーク | Art |
| `"photo"` | 撮影した写真 | Photo |

---

## Visual セクション（`index.html` 追加部分）

Works セクション（`#works`）の直下に配置する。

### 構成

```
<section id="visual">
  <h2>VISUAL WORKS</h2>

  <!-- フィルターピル -->
  [All]  [Art]  [Photo]

  <!-- グリッド（3カラム、Works と同じ構造） -->
  <div id="visual-grid">
    <!-- visual-data.js から JS でレンダリング -->
  </div>
</section>
```

### カードデザイン

- Works カードと同じクラス・スタイルを使用
- サムネイル部分は `thumbUrl` の `<img>` タグで実際の画像を表示（Works のグラデーション背景との差別化）
- `youtubeId` の代わりに `cloudinaryUrl` を `data-img` 属性としてカードに持たせる
- `youtubeId: null` のカードと同様に、クリックイベントでライトボックスを起動する

### フィルターピルの active クラス

既存 Works と同じ `active` CSS クラスを使用する（`.filter-pill.active`）。初期状態は All ピルに `active` を付与。切り替え時は全ピルから `active` を除去し、クリックされたピルに付与する。

### 空配列時の表示

`NOCTA_VISUALS` が空の場合はグリッドを非表示にし、Visual セクション自体を `display: none` にする。セクション見出しが孤立して表示されることを防ぐ。

---

## ライトボックスモーダル（`#visual-modal`）

YouTube モーダル（`#yt-modal`）とは別の独立したモーダル。

### 構成

```html
<div id="visual-modal" class="hidden fixed inset-0 z-50 ...">
  <!-- 暗幕 -->
  <div id="visual-backdrop" ...></div>

  <!-- コンテンツ -->
  <div>
    <!-- 閉じるボタン × -->
    <img id="visual-modal-img" src="" alt="">
    <div>
      <span id="visual-modal-badge">...</span>
      <h3 id="visual-modal-title">...</h3>
      <p id="visual-modal-desc">...</p>
    </div>
  </div>
</div>
```

### 説明文の表示ルール

ライトボックスの `#visual-modal-desc` には `descJa` を表示する。言語切り替え機能が将来実装された場合は Works セクションと同じ仕組みに従う（現時点では日本語固定）。

### 操作

| 操作 | 動作 |
|---|---|
| カードクリック | ライトボックスを開く（`cloudinaryUrl` をフル表示） |
| 暗幕クリック | 閉じる |
| ESC キー | 閉じる |
| × ボタン | 閉じる |

---

## 画像追加フロー

1. Cloudinary にアップロード → `cloudinaryUrl` と `thumbUrl` を取得
   - `thumbUrl` は `cloudinaryUrl` の `/upload/` の直後に `w_600/` を挿入するだけ
   - 例: `https://res.cloudinary.com/xxx/image/upload/v123/sample.jpg`
     → `https://res.cloudinary.com/xxx/image/upload/w_600/v123/sample.jpg`
2. `visual-data.js` の `NOCTA_VISUALS` 配列の**先頭**に1オブジェクト追加
3. `git add website/visual-data.js`
4. `git commit -m "feat(visual): [タイトル] を追加"`
5. `git push origin main`
6. Netlify が自動デプロイ（1〜2分）

---

## スコープ外

- `/visual-add` スラッシュコマンド（今回は実装しない）
- Works セクションへの画像混在（今回は別セクション）
- 個別画像ページ（今回は不要）
- NOCTA_VISUALS が空のときのフォールバック表示（任意実装）
