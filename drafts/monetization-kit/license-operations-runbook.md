# ライセンス発行・失効 運用手順書

購入が入ったとき／返金時に行う運用。Tier1 と Tier2 で手順が異なる。

---

## Tier1: ハッシュリスト方式（手動・既定）

### 新規購入者を有効化する
1. Gumroad の購入通知でライセンスキーを確認（または購入者から申告）
2. `keygen.html` を開き、対象アプリを選択 → キーを貼って「ハッシュを生成」
3. 生成された SHA-256 ハッシュを、そのアプリの `licenses.json` の `hashes` 配列に追加
4. デプロイ:
   - **still（GitHub Pages）**: `sw.js` の CACHE 名をインクリメント（still-v4 → v5...）→
     `git add website/still/licenses.json website/still/sw.js` → commit → `git push origin main`
   - **Vercel アプリ（Seed/Verse/inner canvas）**: 各リポジトリの licenses.json を更新 → push（自動デプロイ）。
     PWA キャッシュがあれば sw.js も同様にインクリメント
5. 購入者は発行キーを入力すれば解錠（localStorage に保存され次回以降は自動）

### 失効させる（返金・チャージバック）
1. 対象キーのハッシュを `licenses.json` の `hashes` から削除
2. 上記と同じくデプロイ（still は sw.js もインクリメント）
3. 次回起動時の再チェックで解錠が外れる（既に開いている端末は次回読み込み時）

### 注意
- `licenses.json` には**ハッシュのみ**を置く。キー本体は絶対に置かない
- これはカジュアルゲート（クライアントサイド）。強固なDRMではない点を理解の上で運用する
  （JS編集や localStorage 直接操作で回避は可能。安価アプリの honor-system 用途として割り切る）

---

## Tier2: Gumroad License API 方式（自動・手作業ゼロ）

### 切り替え手順
1. Gumroad 商品の license keys を有効化（gumroad-setup-runbook.md 参照）し product_id を取得
2. アプリの `NoctaLicenseGate.init()` を `mode: 'gumroad-api'` + `gumroad.productId` に変更
3. Vercel アプリは `vercel-verify-function.js` を `api/verify-license.js` に配置し、
   環境変数 `GUMROAD_PRODUCT_ID` を設定。`gumroad.verifyEndpoint: '/api/verify-license'` を指定
   - still（静的）はサーバレスが無いので Gumroad へ直接（verifyEndpoint 省略）でも動く

### 日常運用
- **新規購入: 何もしない**。購入者がキーを入力するとリアルタイムに検証され解錠される
- **返金・チャージバック: 何もしない**。Gumroad 側のステータスを見て自動で弾く
  （gate モジュールが refunded / chargebacked / disputed / subscription_cancelled を判定）
- 再起動時は increment_uses_count=false で再検証（販売数カウントを増やさない）
- オフライン時は一度解錠済みなら通す（締め出し回避）

### Tier2 の利点
- 販売のたびの手作業・再デプロイが不要
- 返金/失効に自動追従
- 必要なら uses 上限（seat 制限）も Gumroad 側で管理可能
