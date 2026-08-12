# NOCTA 収益化 — 現状と引き継ぎ（説明書）

最終更新: 2026-06-16
この文書は収益化施策の全体像・正確な現状・残作業をまとめた引き継ぎ／説明書。
詳細は同フォルダの README.md（キット）/ supabase-entitlement-plan.md（方式A）/ 各ランブックを参照。

---

## 1. 3層モデル（最重要・正確な理解のために）

収益化は「商品を作れば終わり」ではなく、3つの層に分かれる。
どこまで終われば何ができるかを正確に把握するための整理。

| 層 | 意味 | 必要な作業 | これが済むと |
|---|---|---|---|
| **層1: 決済を受け付ける** | Gumroadで購入できる | Gumroad商品作成・価格設定 | 売上は立てられる（お金は受け取れる） |
| **層2: 購入がアプリの権限に反映される** | 購入者に「権限(entitlement)」が付く | still=不要 / Vercel系=**Supabaseデプロイ＋Ping URL設定** | 「買った人＝権限あり」が成立する |
| **層3: 権限で機能が解錠される** | 権限の有無で出し分け | PremiumGateを機能に適用（still=licenses.json運用） | 課金が実際に「価値」と結びつく |

**アプリ別の正確な状況:**

| アプリ | 層1 | 層2 | 層3 |
|---|---|---|---|
| still（静的・GitHub Pages） | 商品作成で可 | **不要**（クライアント鍵照合Tier1） | キー発行運用で全体解錠（実装済） |
| inner canvas / Seed / Verse（Supabase） | 商品作成で可 | **Supabaseデプロイ必須**（未） | PremiumGate適用（後回し） |

要点:
- 「商品作成で課金環境が整う」は **still では概ね正しい**。
- **Vercel系3アプリは商品作成だけでは不十分**で、層2（Supabaseデプロイ）まで必要。
- 層3（何を有料にするか）は**プロダクト成熟後に決定**（今回ロードマップへ送り）。
  基盤は実装済みなので、後で機能を `<PremiumGate>` で囲むだけ。

---

## 2. アプリ別アーキテクチャ

| 項目 | still | inner canvas | Seed / Verse |
|---|---|---|---|
| 実体 | website/still/（NOCTA repo） | ~/nner-canvas（repo: nner-canvas） | ~/memo-app（repo: nuword・Next.js） |
| ホスティング | GitHub Pages | Vercel | Vercel |
| 認証 | なし（localStorage） | Supabase OTP（既存） | Supabase OTP（既存） |
| 収益化方式 | Tier1 クライアント鍵照合 | 方式A Supabase権限 | 方式A Supabase権限 |
| Supabaseプロジェクト | — | afnbrzpmxdnmxtnwazdq | **同左（共有）** |

重要: inner canvas と Seed/Verse は**同一Supabaseプロジェクト**。
→ `entitlements` テーブルと `gumroad-webhook` は3アプリ共有、**Supabaseデプロイは1回で済む**。
→ 権限粒度は **all-access**（1購入で全アプリ解錠）。

---

## 3. 実装の現状（done / not-done）

### 完了・push済（ライブ）
- **still**: 自前ゲートを汎用モジュール `nocta-license-gate.js` へ移行。`appId:'still'`で後方互換。
  sw.js を still-v5 にbump。commit `643fa20`・main へ push 済（GitHub Pages 反映）。

### 実装済・未デプロイ・未push
- **汎用キット**（`drafts/monetization-kit/`・NOCTA repo・drafts）:
  README.md / nocta-license-gate.js / .css / gate-snippet.html / licenses.template.json /
  keygen.html / vercel-verify-function.js / 各ランブック / post-purchase-copy.md /
  supabase-entitlement-plan.md / 本STATUS.md
- **共有Supabase基盤**（~/nner-canvas・未push・未デプロイ）:
  - `supabase/migrations/20260616120000_create_entitlements.sql`（テーブル＋RLS）
  - `supabase/functions/gumroad-webhook/index.ts`（購入Ping→upsert）
- **inner canvas クライアント**（~/nner-canvas・未push）:
  `src/lib/entitlement.tsx` / `src/components/PremiumGate.tsx`
- **Seed/Verse クライアント**（~/memo-app・未push）:
  `src/lib/entitlement.ts` / `src/components/PremiumGate.tsx`
- 検証: 全新規ファイル tsc エラー0。既存認証・既存機能は不変（追加のみ）。

### 未着手
- 層1: Gumroad商品作成（CEO）
- 層2: Supabaseデプロイ＋Ping URL設定（CEO）
- 層3: プレミアム機能の選定とPremiumGate適用（後回し・ロードマップ）
- 各repoのcommit/push、BUY_URL差し替え

---

## 4. CEOの残作業（順序）

1. **still で課金開始（最短）**: Gumroad商品作成 →（Tier1運用は license-operations-runbook.md）→ still の購入ボタンURL差し替え
2. **NOCTA all-access 商品**: Gumroad商品作成＋Ping URL `https://<project>.functions.supabase.co/gumroad-webhook?secret=<秘密>`
3. **Supabaseデプロイ（1回で3アプリ分）**: nner-canvas repo から
   `supabase db push` ＋ `supabase functions deploy gumroad-webhook --no-verify-jwt` ＋
   `supabase secrets set GUMROAD_WEBHOOK_SECRET=<秘密>`
4. 各repo（nuword / nner-canvas）の `PremiumGate` の `BUY_URL` を商品URLに差し替え → commit/push
5. （プロダクト成熟後）プレミアム機能を決めて `<PremiumGate>` で囲む

なぜSupabaseデプロイをAIがやらないか: 本番の共有DBへの取り返しの効きにくい変更であり、
CEOのSupabase認証・シークレット値が必要なため。準備（コード・手順）まではAIが完了済み。

---

## 5. 関連ドキュメント
- `README.md` — キット全体の取扱説明書・展開手順
- `supabase-entitlement-plan.md` — 方式A（Supabase権限）の詳細設計・CEO手順
- `gumroad-setup-runbook.md` / `license-operations-runbook.md` — Gumroad設定・発行運用
- `post-purchase-copy.md` — 購入導線コピー（JA/EN）
- グローバル: `~/.claude/references/codex-review-setup.md`（本件とは別。Codexレビュー設定）
