---
description: "visual-data.js に新しいビジュアル作品（IPFSハッシュ）を追加するとき"
argument-hint: "[作品名]（省略可）"
---

Visual セクションに新しい作品を追加してください。

引数（省略可）: $ARGUMENTS（形式: [作品名]）
例: /visual-add "rainy season #2"

以下の手順で実行してください:

---

## Step 1: 現在の visual-data.js を読み込む

`website/visual-data.js` を Read する。
3つの配列（NOCTA_VISUALS_WORKS / NOCTA_VISUALS_ART / NOCTA_VISUALS_MUSIC）が存在することを確認する。

---

## Step 2: 作品タイトルを確認する

引数に作品名がある場合はそれを使う。ない場合は「作品タイトルを入力してください:」と表示してCEOの入力を待つ。

---

## Step 3: カテゴリを確認する

「カテゴリを選択してください:
  W) Works  — 完成品（Canva加工済み・コピーライン付き / Base chain）
  A) Art    — AI生成元画像コレクション（Zora chain）
  M) Music  — 楽曲連動ビジュアル」
と表示してCEOの入力を待つ（W / A / M）。

カテゴリに応じて以下を自動設定する:
- W → badge: "Works" / badgeColorClass: "bg-amber-500/20 text-amber-400" / 追加先: NOCTA_VISUALS_WORKS
- A → badge: "Art"   / badgeColorClass: "bg-brand-secondary/20 text-brand-secondary" / 追加先: NOCTA_VISUALS_ART
- M → badge: "Music" / badgeColorClass: "bg-brand-secondary/20 text-brand-secondary" / 追加先: NOCTA_VISUALS_MUSIC

---

## Step 4: IPFS ハッシュを確認・バリデーションする

「IPFS CIDv1 ハッシュを入力してください（bafybei〜 で始まる59文字）:」と表示してCEOの入力を待つ。

**バリデーション（IMPORTANT: 必ず実行する）:**
1. `bafybei` で始まること（bafybeig, bafybeid など）
2. 文字数が正確に **59文字** であること

文字数確認方法: 入力された文字列の長さをカウントする。
- 59文字 → OK
- 60文字以上 → 「❌ ハッシュが長すぎます（入力: [N]文字 / 正しくは59文字）。末尾の余分な文字を削除してください。」と表示して再入力を求める
- 58文字以下 → 「❌ ハッシュが短すぎます（入力: [N]文字 / 正しくは59文字）。」と表示して再入力を求める
- bafybei で始まらない → 「❌ CIDv1 は bafybei で始まる必要があります。」と表示して再入力を求める

バリデーション通過後: `imgUrl: "https://ipfs.io/ipfs/[ハッシュ]"` を設定する。

---

## Step 5: Zora URL を確認する

「Zora NFT ページの URL を入力してください（不明な場合は Enter でスキップ）:」と表示してCEOの入力を待つ。

- 入力がある場合: そのURLを使う（例: `https://zora.co/collect/base:0x.../1`）
- スキップ（空Enter）の場合: `"https://zora.co/@kutakuta1001"` を使う

---

## Step 6: 日本語説明文を確認する

「作品の説明文（日本語・1〜2文）を入力してください:」と表示してCEOの入力を待つ。

---

## Step 7: エントリをプレビューして確認を求める

以下の形式でプレビューを表示する:

```
--- プレビュー ---
追加先: [NOCTA_VISUALS_WORKS / NOCTA_VISUALS_ART / NOCTA_VISUALS_MUSIC]（先頭に追加）

{
  title: "[title]",
  imgUrl: "https://ipfs.io/ipfs/[hash]",
  zoraUrl: "[zoraUrl]",
  badge: "[badge]",
  badgeColorClass: "[badgeColorClass]",
  descJa: "[descJa]",
}
-----------------
```

「この内容で追加しますか？（yes / 修正したい項目を入力）」と表示してCEOの確認を待つ。
修正が入力された場合は該当ステップに戻る。

---

## Step 8: visual-data.js を更新する

該当配列の **先頭**（`[` の直後）に以下のオブジェクトを追加する:

```js
  {
    title: "[title]",
    imgUrl: "https://ipfs.io/ipfs/[hash]",
    zoraUrl: "[zoraUrl]",
    badge: "[badge]",
    badgeColorClass: "[badgeColorClass]",
    descJa: "[descJa]",
  },
```

---

## Step 9: 追加内容を検証する（IMPORTANT）

`website/visual-data.js` を再度 Read して以下を確認する:
- 対象配列の先頭エントリの `title` が入力値と一致すること
- `imgUrl` が `https://ipfs.io/ipfs/` + 59文字のハッシュであること
- `badge` が期待値（Works / Art / Music）と一致すること

不一致があれば「❌ 検証エラー: [不一致の項目]。Step 8 の編集を確認してください。」と表示して中断する。
検証OKの場合は「✅ visual-data.js への追加を確認しました。」と表示する。

---

## Step 10: git commit して push する

```bash
git add website/visual-data.js
git commit -m "feat(visual): [作品名] を追加"
git push origin main
```

IMPORTANT: コミットメッセージに「Co-Authored-By:」を含めないこと。

---

## Step 11: 完了を伝える

「追加完了: [作品名]
カテゴリ: [Works / Art / Music]
imgUrl: https://ipfs.io/ipfs/[ハッシュ]
GitHub Pages に反映されます（Actions の完了を確認してください）。」と表示する。

---

## IMPORTANT（制約）

- IPFSハッシュのバリデーション（Step 4）は必ずスキップせずに実行する
- approved/ への書き込みはしない
- visual-data.js 以外のファイルを git add しない
- 「Co-Authored-By:」をコミットメッセージに含めない
