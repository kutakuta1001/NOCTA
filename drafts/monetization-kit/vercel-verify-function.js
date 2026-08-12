// ══════════════════════════════════════════════════════════════
// Tier2 用 Vercel サーバレス関数（任意）
// Seed / Verse / inner canvas など Vercel ホストのアプリで
// Gumroad License API をサーバ側で叩くプロキシ。
//
// 目的:
//   - product_id をクライアントに晒さない
//   - CORS を気にせずブラウザから自前エンドポイントを呼べる
//   - 将来レート制限・ログ・独自ルールを差し込める余地
//
// 配置: Vercelプロジェクトの api/verify-license.js（または .ts）
//   → アプリからは fetch('/api/verify-license', {method:'POST', ...}) で呼ぶ
//   → nocta-license-gate.js の gumroad.verifyEndpoint に '/api/verify-license' を指定
//
// 環境変数（Vercel の Project Settings → Environment Variables）:
//   GUMROAD_PRODUCT_ID = 対象商品のID
// ══════════════════════════════════════════════════════════════

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }

  const { license_key, increment_uses_count = false } = req.body || {};
  if (!license_key) {
    return res.status(400).json({ success: false, error: 'missing_license_key' });
  }

  const productId = process.env.GUMROAD_PRODUCT_ID;
  if (!productId) {
    return res.status(500).json({ success: false, error: 'product_id_not_configured' });
  }

  try {
    const form = new URLSearchParams();
    form.set('product_id', productId);
    form.set('license_key', license_key);
    form.set('increment_uses_count', String(increment_uses_count));

    const gr = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      body: form,
    });
    const data = await gr.json();

    // 余計な購入者個人情報はクライアントに返さず、判定に必要な最小限だけ返す
    const p = data.purchase || {};
    const safe = {
      success: data.success === true,
      purchase: {
        refunded: !!p.refunded,
        chargebacked: !!p.chargebacked,
        disputed: !!p.disputed,
        subscription_cancelled_at: p.subscription_cancelled_at || null,
      },
    };
    return res.status(200).json(safe);
  } catch (e) {
    return res.status(502).json({ success: false, error: 'gumroad_unreachable' });
  }
}
