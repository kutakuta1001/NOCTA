# Gumroad セットアップ手順書（CEO実行）

NOCTAアプリを Gumroad で販売するための初期設定。アプリ1本ごとに一度行う。
（このキットの技術側＝ライセンスゲートは実装済み。ここはCEOがGumroad上で行う作業）

---

## 0. 前提
- Gumroad アカウント（無料で開設可。決済手数料は売上から）
- 販売するアプリのURL（例: still = https://kutakuta1001.github.io/NOCTA/still/）

## 1. 商品（Product）を作成
1. Gumroad → New product → タイプは「Digital product」
2. 名前・説明・価格を設定（価格は後述の価格メモ参照）
3. カバー画像: HP の `website/images/<app>.jpg` を流用してよい
4. 「Content」: 購入者に見せる案内（アプリURL＋使い方）。後述の post-purchase-copy.md を貼る

## 2. ライセンスキー発行を有効化（最重要）
1. 商品編集画面 → 「Settings」または「Generate license keys」トグルをON
2. これで購入のたびに一意のライセンスキー（`XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX`）が発行される
3. 購入完了画面・購入メールにキーが表示されるよう、Content にキー表示の案内文を入れる

## 3. 商品IDを控える（Tier2を使う場合のみ）
- Tier2（Gumroad License API）運用にする場合は商品の「product_id」が必要
- 商品ページURL末尾や API（`/v2/products`）から取得できる
- Tier1（ハッシュリスト）運用なら不要

## 4. リンクをアプリに反映
- 発行された商品URL（例: `https://nocta.gumroad.com/l/still`）を
  ゲートの「購入」ボタン（`buyUrl`）とHPのアプリ説明に設定

---

## 価格メモ（叩き台・自由に変更）
- 瞑想/ユーティリティ系の軽量アプリ: 単品 300〜700円 / 買い切り
- 複数アプリのバンドル（still + Seed + Verse + inner canvas）も将来検討可
- 「Pay what you want」（下限価格＋任意上乗せ）も NOCTA の哲学に合う選択肢

## 運用方式の選択
- Tier1（ハッシュリスト）: 販売数が少ない初期はこれで十分。手動だが確実
- Tier2（Gumroad License API）: 販売が増えたら手作業ゼロのこちらへ。詳細は license-operations-runbook.md

次にやること: 購入が入ったら license-operations-runbook.md の手順でキーを有効化する。
