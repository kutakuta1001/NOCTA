# NOCTA 汎用収益化キット

NOCTAアプリ（still / Seed / Verse / inner canvas、および今後の新作）を
Gumroad で有料化するための再利用可能な一式。
作成: 2026-06-16 / 状態: drafts（CEO未承認）。承認後に各アプリへ展開する。

---

## このキットが解決すること

still には既にライセンスゲート（クライアントサイドのSHA-256ハッシュ照合）が実装済みだが、
アプリごとに同じ仕組みを書き直す必要があった。本キットはそのゲートを
**1つの設定可能なモジュールに汎用化**し、Gumroad設定・発行運用・購入導線コピーまで揃えたもの。

検証方式は2段階を両対応（既定は Tier1）:
- **Tier1: ハッシュリスト** — バックエンド不要。純静的（GitHub Pages）でも動く。販売ごとに手動でハッシュ追加＆再デプロイ。still 現状と互換
- **Tier2: Gumroad License API** — リアルタイム検証・手作業ゼロ・返金/失効に自動追従。API通信が必要（Vercelアプリはサーバレス関数推奨）

---

## ファイル一覧

| ファイル | 役割 |
|---|---|
| `nocta-license-gate.js` | 中核。設定で Tier1/Tier2 を切替える汎用ゲート（`NoctaLicenseGate.init(config)`） |
| `nocta-license-gate.css` | 既定ゲートの最小スタイル（自前ゲートがあれば不要） |
| `gate-snippet.html` | 組み込み雛形（HTML＋init呼び出し例） |
| `licenses.template.json` | Tier1用の空ハッシュリスト雛形 |
| `keygen.html` | CEO専用。キー→SHA-256ハッシュ変換＋アプリ別の更新手順表示（全アプリ対応） |
| `vercel-verify-function.js` | Tier2用。Vercelサーバレスの Gumroad 検証プロキシ雛形 |
| `gumroad-setup-runbook.md` | Gumroad商品作成・ライセンス有効化・価格メモ（CEO実行） |
| `license-operations-runbook.md` | 購入有効化・返金失効の運用手順（Tier1/Tier2別） |
| `post-purchase-copy.md` | ゲート文言・購入ボタン・商品説明・成功ページのコピー（JA/EN） |

---

## アプリへの展開手順

### 新規アプリ（ゼロから）
1. `nocta-license-gate.js`（＋必要なら .css）をアプリに配置
2. `gate-snippet.html` を参考に init() を呼ぶ。`appId` / `buyUrl` / `onUnlock` を設定
3. Tier1 なら `licenses.template.json` を `licenses.json` として配置
4. `gumroad-setup-runbook.md` で商品を作る → `license-operations-runbook.md` で発行運用

### still（既存・移行は任意）
- still は既に独自ゲートで動作中。**今すぐ差し替える必要はない**
- 汎用モジュールへ寄せたい場合は、index.html の自前ゲートJS（AUTH GATEブロック）を
  `nocta-license-gate.js` + `init({appId:'still', onUnlock:startApp, buyUrl})` に置換
- licenses.json / keygen は現状と互換（ハッシュ形式・大文字正規化が一致）

### Vercelアプリ（Seed / Verse / inner canvas）
- これらは別リポジトリ（Vercel）。モジュールを各リポジトリに取り込む
- Tier1: `licenses.json` を public に置いて従来どおり
- Tier2: `vercel-verify-function.js` を `api/verify-license.js` に置き、環境変数 `GUMROAD_PRODUCT_ID` を設定 →
  `init({mode:'gumroad-api', gumroad:{productId, verifyEndpoint:'/api/verify-license'}})`

---

## 設計上の前提・注意

- **Tier1 はカジュアルゲート**。クライアントサイドのため、JS編集や localStorage 操作で回避可能。
  安価アプリの honor-system 用途として割り切る。強い enforcement が要るなら Tier2 へ
- `licenses.json` には**ハッシュのみ**（キー本体は置かない）
- オーナーは `?setup=owner` で永続解錠（自分の端末用）
- still は GitHub Pages の PWA のため、licenses.json 更新時は `sw.js` のキャッシュ版数を必ず上げる
- 価格・コピー・配色はすべて叩き台。CEOが自由に変更してよい

---

## 次のアクション（CEO）
1. このキットの方針・コピーをレビュー
2. まず still で Gumroad 商品を作成（gumroad-setup-runbook.md）
3. 最初の購入で発行運用を一度通す（license-operations-runbook.md / Tier1）
4. 販売が増えたら Tier2 へ移行
