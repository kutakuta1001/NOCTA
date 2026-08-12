# Supabase 権限モデル（Approach A）実装計画

Vercel/Supabase アプリ（inner canvas / Seed / Verse）の収益化方式。
still のクライアントゲートとは別物。既存の Supabase 認証の上に「課金者か」を判定する。
作成: 2026-06-16 / パイロット: inner canvas（nner-canvas リポジトリ）

---

## 決定事項（CEO合意・2026-06-16）
- **権限の粒度: all-access** — 1購入でNOCTA全アプリ解錠（entitlements.product = 'all-access'）
- **ゲート方針: 無料お試し+購入でフル解錠** — ゲスト/無料は維持、購入者にプレミアム機能を解錠
- 紐付けキー: Gumroad購入時メール = アプリのログインメール

## 全体像
```
購入（Gumroad）
  → Gumroad Ping(Webhook) → Supabase Edge Function: gumroad-webhook
      → entitlements テーブルに email 単位で upsert（返金Pingで status=refunded）
アプリ側
  → ログイン済みユーザーの email で entitlements を照会（useEntitlement）
  → <PremiumGate> でプレミアム機能を出し分け（未課金者は購入導線）
```

## 実装物（パイロット: nner-canvas に作成済み・未デプロイ/未push）
| ファイル | 役割 |
|---|---|
| `supabase/migrations/20260616120000_create_entitlements.sql` | entitlements テーブル＋RLS（本人読み取り可・書き込みはservice roleのみ） |
| `supabase/functions/gumroad-webhook/index.ts` | Gumroad Ping受信→検証→entitlement upsert |
| `src/lib/entitlement.tsx` | `useEntitlement()` フック（email照会） |
| `src/components/PremiumGate.tsx` | プレミアム機能ラッパー＋購入導線 |

## CEO 設定手順（デプロイ）
1. **Gumroad**: 「NOCTA all-access」商品を作成・価格設定・ライセンス発行は不要（Ping方式）
2. Gumroad → 商品の Advanced → 「Ping」/Webhook URL に
   `https://<project>.functions.supabase.co/gumroad-webhook?secret=<任意の秘密文字列>` を設定
3. **Supabase**:
   - `supabase db push`（または Dashboard SQL）でマイグレーション適用
   - `supabase functions deploy gumroad-webhook --no-verify-jwt`（公開Webhookのため）
   - Function のシークレット設定: `supabase secrets set GUMROAD_WEBHOOK_SECRET=<上と同じ秘密文字列>`
     （SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY は自動付与）
4. **アプリ**: `PremiumGate` でプレミアムにしたい機能を囲む（どの機能をpremiumにするかは別途決定）。
   `src/components/PremiumGate.tsx` の `BUY_URL` を作成した商品URLに差し替え
5. テスト購入（Gumroadのテストモード）→ ログイン→該当機能が解錠されることを確認

## Seed / Verse（memo-app・Next.js）への展開 — 実装済み（2026-06-16）
- **重要**: memo-app と inner-canvas は**同一の Supabase プロジェクト**（afnbrzpmxdnmxtnwazdq）。
  → entitlements テーブルと gumroad-webhook は**共有**。memo-app 側は新規DB/Functionは不要、クライアントのみ追加
- 追加ファイル（~/memo-app・別repo: nuword・未push）:
  - `src/lib/entitlement.ts` — `useEntitlement()`（@supabase/ssr ブラウザクライアント `createClient()` を使用）
  - `src/components/PremiumGate.tsx` — "use client"・memo-app配色（ネイビー#060d20×#06679F）
- tsc 新規ファイルエラー 0。PremiumGate 適用箇所は未定（premium機能選定とセットで）
- 注: Verse は AuthGuard の PUBLIC_PATHS に含まれ未ログインでも閲覧可、Seed はログイン必須。
  PremiumGate はログイン有無に関係なく権限で判定する（未ログインは未課金扱い）

## 未決定（次の詳細詰め）
- inner canvas で「何をプレミアムにするか」（AI機能/保存/ポートフォリオ生成 等）
- 価格・バンドルの見せ方
- これらは PremiumGate 適用箇所の決定とセットで詰める
