# 設計書: Apps Portfolio セクション
**作成日**: 2026-03-26
**ステータス**: 承認済み

---

## 背景・目的

NOCTAブランドとして制作したウェブアプリケーション3本をHPで外部向けに紹介するため、TOOLS セクションを追加する。将来的にブログセクションも追加する予定のため、独立セクション方式を採用する。

---

## 方針

- Works / Visual と同じパターンで `apps-data.js` を新規作成し、運用フローを統一する
- サムネイルは Works と同じグラデーション背景クラス（`thumb-1`〜`thumb-6`）を使用
- カードクリックでモーダルを表示し、「アプリを開く」ボタンで新しいタブを開く
- フィルターピルは現時点では不要（Allのみ）。将来の拡張に備えて `cat` フィールドは保持

---

## ファイル構成

```
website/
├── apps-data.js   ← 新規: Apps ポートフォリオデータ配列
└── index.html     ← 修正: #apps セクション + #app-modal 追加
```

### `<script>` ロード順序

`visual-data.js` の直後に追加:

```html
<script src="visual-data.js"></script>
<script src="apps-data.js"></script>  ← ここに追加
```

---

## データ構造（`apps-data.js`）

```js
/**
 * NOCTA Apps Portfolio Data
 *
 * アプリを追加するときは、この配列の先頭に新しいオブジェクトを追加してください。
 *
 * title        : アプリ名
 * cat          : "app"（将来の拡張用。現時点は "app" のみ）
 * url          : アプリのURL（モーダルの「アプリを開く」ボタン先）
 * thumbClass   : Works と同じグラデーション背景クラス（"thumb-1"〜"thumb-6"）
 * badge        : バッジ表示テキスト
 * badgeColorClass : Tailwind 色クラス
 * descJa       : 日本語説明
 * descEn       : 英語説明
 */
const NOCTA_APPS = [
  {
    title: "アプリ名",
    cat: "app",
    url: "https://example.com",
    thumbClass: "thumb-1",
    badge: "App",
    badgeColorClass: "bg-brand-accent/20 text-brand-accent",
    descJa: "（説明を入力してください）",
    descEn: "（English description here）"
  }
];
```

---

## TOOLS セクション（`index.html` 追加部分）

`#visual` セクションの直下に配置する。

### 構成

```
<section id="apps">
  <h2>TOOLS</h2>

  <!-- グリッド（3カラム、Works と同じ構造） -->
  <div id="apps-grid">
    <!-- apps-data.js から JS でレンダリング -->
  </div>
</section>
```

### カードデザイン

- Works カードと同じクラス・スタイルを使用
- サムネイル部分は `thumbClass` のグラデーション背景（Works と同じ）
- `data-appurl` 属性にアプリURLを持たせる
- クリックでモーダルを起動する

### 空配列時の表示

`NOCTA_APPS` が空の場合はセクション全体を `display: none` にする。

---

## モーダル（`#app-modal`）

YouTube モーダル（`#yt-modal`）・Visual モーダル（`#visual-modal`）とは独立した別モーダル。

### 構成

```html
<div id="app-modal" class="hidden fixed inset-0 z-50 ...">
  <!-- 暗幕 -->
  <div id="app-backdrop" ...></div>

  <!-- コンテンツ -->
  <div>
    <!-- 閉じるボタン × -->
    <!-- グラデーション背景サムネイル -->
    <div id="app-modal-thumb" class="[thumbClass]"></div>
    <div>
      <span id="app-modal-badge">...</span>
      <h3 id="app-modal-title">...</h3>
      <p id="app-modal-desc">...</p>
      <a id="app-modal-link" href="" target="_blank" rel="noopener noreferrer">
        アプリを開く →
      </a>
    </div>
  </div>
</div>
```

### 操作

| 操作 | 動作 |
|---|---|
| カードクリック | モーダルを開く |
| 暗幕クリック | 閉じる |
| ESC キー | 閉じる |
| × ボタン | 閉じる |
| 「アプリを開く」ボタン | `target="_blank"` で新しいタブを開く |

### ESC キーハンドラ

既存の ESC ハンドラに `closeApp()` を追加:

```js
if (e.key === 'Escape') { closeYouTube(); closeVisual(); closeApp(); }
```

---

## ナビゲーション

デスクトップナビ・モバイルナビ・フッターに `#apps` へのリンクを追加:

```html
<a href="#apps">Tools</a>
```

---

## アプリ追加フロー

1. `apps-data.js` の `NOCTA_APPS` 配列の**先頭**に1オブジェクト追加
2. `git add website/apps-data.js`
3. `git commit -m "feat(apps): [アプリ名] を追加"`
4. Netlify に手動デプロイ

---

## スコープ外

- フィルターピル（将来アプリが増えたときに追加）
- 個別アプリページ
- ブログセクション（別仕様で後日実装）
