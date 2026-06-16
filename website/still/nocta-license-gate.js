/* ══════════════════════════════════════════════════════════════
   NOCTA License Gate — 汎用ライセンスゲート（全アプリ共通）
   ──────────────────────────────────────────────────────────────
   1ファイルでTier1（ハッシュリスト）/ Tier2（Gumroad License API）両対応。
   既定は Tier1（still 現状と互換）。アプリごとに init() の config だけ差し替える。

   使い方（最小・Tier1）:
     NoctaLicenseGate.init({
       appId: 'still',                 // localStorage プレフィックス（アプリ固有）
       buyUrl: 'https://gumroad.com/l/xxxx',
       onUnlock: () => startApp(),     // 解錠後に呼ぶアプリ起動関数
     });

   使い方（Tier2・Gumroad API）:
     NoctaLicenseGate.init({
       appId: 'seed',
       mode: 'gumroad-api',
       gumroad: {
         productId: 'YOUR_PRODUCT_ID',         // Gumroad商品のID
         verifyEndpoint: '/api/verify-license' // 任意: Vercelサーバレスのプロキシ。省略時はGumroadへ直接
       },
       buyUrl: 'https://gumroad.com/l/xxxx',
       onUnlock: () => startApp(),
     });

   DOM: 既定セレクタ（#gate / #gate-input / #gate-btn / #gate-msg / #gate-buy）が
   存在すればそれを使う。無ければ既定マークアップを自動注入する（nocta-license-gate.css 推奨）。
   ══════════════════════════════════════════════════════════════ */

const NoctaLicenseGate = (() => {
  'use strict';

  const DEFAULTS = {
    appId: 'app',
    mode: 'hashlist',                 // 'hashlist' | 'gumroad-api'
    licensesUrl: './licenses.json',   // hashlist モードのハッシュ一覧
    gumroad: null,                    // { productId, verifyEndpoint? }
    buyUrl: 'https://gumroad.com',
    ownerSetupParam: 'owner',         // ?setup=owner でオーナー永続解錠
    onUnlock: () => {},
    selectors: {
      gate: '#gate',
      input: '#gate-input',
      button: '#gate-btn',
      msg: '#gate-msg',
      buy: '#gate-buy',
    },
    text: {
      prompt: 'ライセンスキーを入力してください',
      checking: '確認中...',
      start: 'はじめる',
      invalid: 'コードが正しくありません',
      buy: 'Gumroadで購入 →',
    },
  };

  let cfg, AUTH_KEY, OWNER_KEY;

  // ── ユーティリティ ───────────────────────────────────────────
  async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function $(sel) { return document.querySelector(sel); }

  // ── 既定ゲートDOMの注入（host側に #gate が無い場合のみ）──────────
  function ensureGateDom() {
    if ($(cfg.selectors.gate)) return;
    const div = document.createElement('div');
    div.id = cfg.selectors.gate.replace(/^#/, '');
    div.innerHTML = `
      <div class="ng-title">NOCTA</div>
      <div class="ng-msg" id="${cfg.selectors.msg.replace(/^#/, '')}">${cfg.text.prompt}</div>
      <input id="${cfg.selectors.input.replace(/^#/, '')}" type="text"
             placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX" autocomplete="off" spellcheck="false">
      <button id="${cfg.selectors.button.replace(/^#/, '')}">${cfg.text.start}</button>
      <a href="${cfg.buyUrl}" id="${cfg.selectors.buy.replace(/^#/, '')}" target="_blank" rel="noopener">${cfg.text.buy}</a>`;
    document.body.appendChild(div);
  }

  // ── Tier1: ハッシュリスト照合 ────────────────────────────────
  async function loadHashes() {
    try {
      const r = await fetch(cfg.licensesUrl, { cache: 'no-store' });
      const d = await r.json();
      return d.hashes || [];
    } catch { return []; }
  }

  async function verifyHashlist(key) {
    const hash = await sha256(key);
    const hashes = await loadHashes();
    if (hashes.includes(hash)) {
      localStorage.setItem(AUTH_KEY, hash);  // 解錠状態を保存
      return true;
    }
    return false;
  }

  async function recheckHashlist() {
    const saved = localStorage.getItem(AUTH_KEY);
    if (!saved) return false;
    const hashes = await loadHashes();
    return hashes.includes(saved);          // 失効したハッシュは弾く
  }

  // ── Tier2: Gumroad License API 検証 ─────────────────────────
  // verifyEndpoint があればそこへ（Vercelサーバレス推奨）、無ければGumroadへ直接。
  // increment_uses_count: 初回検証のみ true（販売数=有効化数の管理用）、再検証は false。
  async function callGumroad(key, increment) {
    const body = {
      product_id: cfg.gumroad.productId,
      license_key: key,
      increment_uses_count: increment,
    };
    const url = cfg.gumroad.verifyEndpoint || 'https://api.gumroad.com/v2/licenses/verify';
    if (cfg.gumroad.verifyEndpoint) {
      // 自前プロキシ: JSONで投げる
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return r.json();
    }
    // Gumroad直接: x-www-form-urlencoded
    const form = new URLSearchParams();
    form.set('product_id', cfg.gumroad.productId);
    form.set('license_key', key);
    form.set('increment_uses_count', String(increment));
    const r = await fetch(url, { method: 'POST', body: form });
    return r.json();
  }

  // Gumroadの成否判定: success かつ 返金/チャージバック/無効化されていない
  function gumroadOk(res) {
    if (!res || res.success !== true) return false;
    const p = res.purchase || {};
    if (p.refunded || p.chargebacked || p.disputed || p.subscription_cancelled_at) return false;
    return true;
  }

  async function verifyGumroad(key) {
    try {
      const res = await callGumroad(key, true);
      if (gumroadOk(res)) {
        localStorage.setItem(AUTH_KEY, key);  // キー本体を保存（再検証に使う）
        return true;
      }
    } catch { /* ネットワーク等 */ }
    return false;
  }

  async function recheckGumroad() {
    const saved = localStorage.getItem(AUTH_KEY);
    if (!saved) return false;
    try {
      const res = await callGumroad(saved, false);  // 再検証はカウント増やさない
      return gumroadOk(res);
    } catch {
      // オフライン時は一度解錠済みなら通す（締め出し回避）
      return true;
    }
  }

  // ── 共通フロー ───────────────────────────────────────────────
  function isOwner() { return localStorage.getItem(OWNER_KEY) === '1'; }

  function setupOwnerFromUrl() {
    const p = new URLSearchParams(location.search);
    if (p.get('setup') === cfg.ownerSetupParam) {
      localStorage.setItem(OWNER_KEY, '1');
      history.replaceState(null, '', location.pathname);
    }
  }

  async function recheck() {
    return cfg.mode === 'gumroad-api' ? recheckGumroad() : recheckHashlist();
  }

  async function verify(key) {
    return cfg.mode === 'gumroad-api' ? verifyGumroad(key) : verifyHashlist(key);
  }

  function hideGate() {
    const gate = $(cfg.selectors.gate);
    if (!gate) return;
    gate.classList.add('hidden');
    setTimeout(() => { gate.style.display = 'none'; }, 600);
  }

  function bindEvents() {
    const btn = $(cfg.selectors.button);
    const input = $(cfg.selectors.input);
    if (!btn || !input) return;

    btn.addEventListener('click', async () => {
      const val = input.value.trim().toUpperCase();
      if (!val) return;
      btn.textContent = cfg.text.checking; btn.style.opacity = '0.5';
      const ok = await verify(val);
      if (ok) {
        hideGate();
        cfg.onUnlock();
      } else {
        btn.textContent = cfg.text.start; btn.style.opacity = '1';
        const msg = $(cfg.selectors.msg);
        if (msg) {
          msg.textContent = cfg.text.invalid;
          msg.style.color = 'rgba(255,100,100,0.8)';
        }
        input.value = '';
        setTimeout(() => {
          if (msg) { msg.textContent = cfg.text.prompt; msg.style.color = ''; }
        }, 2500);
      }
    });

    input.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });
  }

  // ── 公開API ─────────────────────────────────────────────────
  async function init(userConfig) {
    cfg = Object.assign({}, DEFAULTS, userConfig);
    cfg.selectors = Object.assign({}, DEFAULTS.selectors, userConfig.selectors);
    cfg.text = Object.assign({}, DEFAULTS.text, userConfig.text);
    if (cfg.mode === 'gumroad-api' && (!cfg.gumroad || !cfg.gumroad.productId)) {
      console.error('[NoctaLicenseGate] gumroad-api モードには gumroad.productId が必要です');
    }
    AUTH_KEY = `${cfg.appId}-auth`;
    OWNER_KEY = `${cfg.appId}-owner`;

    setupOwnerFromUrl();
    ensureGateDom();
    bindEvents();

    // 既に解錠済み（オーナー or 保存済みライセンス）なら即起動
    if (isOwner() || await recheck()) {
      hideGate();
      cfg.onUnlock();
      return true;
    }
    return false;  // ゲート表示のまま入力待ち
  }

  return { init };
})();

// CommonJS / ESM どちらでも拾えるように（ブラウザ直読みなら無視される）
if (typeof module !== 'undefined' && module.exports) module.exports = NoctaLicenseGate;
