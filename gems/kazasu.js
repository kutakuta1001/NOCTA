/**
 * NOCTA Gyu — 光にかざす（Kazasu）
 *
 * ライトボックスに光学的な臨場感を足す。
 * マウス/デバイスの動きに追随して:
 *  - 3D傾き（perspective + rotateX/Y）
 *  - スペキュラハイライト（radial-gradient + mix-blend-mode:screen）
 *  - 色相の微妙な回転（hue-rotate）
 *  - 縁の虹色プリズム（薄く）
 * 手で石を持って光にかざしているような感覚を出す。
 *
 * 提供: window.NoctaKazasu.attach(wrap, opts) → detach()
 *   wrap: 光沢を適用するコンテナ（内側に img.gyu-gem-img が存在する必要）
 *   opts.reduce: boolean (省略時はprefers-reduced-motionから自動判定)
 *   opts.accentColor: string (虹色プリズムの主色として使う。省略時は白系のニュートラル)
 *   opts.onTilt: function(nx, ny) (入力の正規化座標-1〜1を外部通知。3Dジェムの傾き駆動等に使う)
 */
(function () {
  "use strict";

  function reducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  var HEX_RE = /^#[0-9a-fA-F]{6}$/;
  function safeHex(h, fallback) {
    return (typeof h === 'string' && HEX_RE.test(h)) ? h : fallback;
  }

  function attach(wrap, opts) {
    opts = opts || {};
    /* Nit: wrap未指定などの誤用防御 */
    if (!wrap || typeof wrap.querySelector !== 'function') {
      return { detach: function () {}, enableOrientation: function () { return Promise.resolve(false); }, setAccent: function () {} };
    }
    var reduce = opts.reduce !== undefined ? opts.reduce : reducedMotion();
    var gem = wrap.querySelector('.gyu-gem-img');
    var highlight = wrap.querySelector('.gyu-highlight');
    var prism = wrap.querySelector('.gyu-prism');
    var shadow = wrap.querySelector('.gyu-shadow');
    if (!gem) return { detach: function () {}, enableOrientation: function () { return Promise.resolve(false); }, setAccent: function () {} };
    var disposed = false;

    /* 3D傾きの最大角度・ハイライト・色相の可変量 */
    var TILT_MAX = 12;
    var HL_RANGE = 40;   /* ハイライトの移動範囲（%） */
    var HUE_MAX = 8;     /* 色相回転の最大 deg */
    var currentX = 0, currentY = 0;   /* 目標 (-1〜1) */
    var renderX = 0, renderY = 0;     /* 補間後の実描画値 */
    var rafId = null;
    /* Nit: accentColor形式検証（#RRGGBB以外はfallback） */
    var accent = safeHex(opts.accentColor, '#B8B4AE');

    function applyPrismBg() {
      if (!prism) return;
      prism.style.background = 'conic-gradient(from 0deg, ' +
        'transparent 0deg, ' + accent + '55 40deg, ' +
        'transparent 90deg, #E8E0D044 140deg, ' +
        'transparent 200deg, ' + accent + '44 260deg, ' +
        'transparent 320deg)';
    }
    applyPrismBg();

    /* 入力を外部に通知するコールバック（3Dジェムの傾き駆動などに使う） */
    var onTilt = typeof opts.onTilt === 'function' ? opts.onTilt : null;

    /* マウス座標を -1〜1 に正規化 */
    function setFromClient(clientX, clientY) {
      var rect = wrap.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      currentX = Math.max(-1, Math.min(1, (clientX - rect.left) / rect.width * 2 - 1));
      currentY = Math.max(-1, Math.min(1, (clientY - rect.top) / rect.height * 2 - 1));
      if (onTilt) onTilt(currentX, currentY);
      scheduleRender();
    }

    function setFromNormalized(x, y) {
      currentX = Math.max(-1, Math.min(1, x));
      currentY = Math.max(-1, Math.min(1, y));
      if (onTilt) onTilt(currentX, currentY);
      scheduleRender();
    }

    function scheduleRender() {
      if (rafId) return;
      rafId = requestAnimationFrame(render);
    }

    function render() {
      rafId = null;
      if (disposed) return;
      /* 目標値へ0.15の補間（マウスを離した後の慣性感） */
      renderX += (currentX - renderX) * 0.15;
      renderY += (currentY - renderY) * 0.15;
      if (reduce) {
        /* reduce-motion: transform無効・色相も静止（0deg固定）・ハイライトは中央固定 */
        gem.style.transform = '';
        gem.style.filter = 'hue-rotate(0deg) saturate(1.1) brightness(1.02)';
        if (highlight) { highlight.style.left = '50%'; highlight.style.top = '50%'; }
      } else {
        var rx = -renderY * TILT_MAX;   /* Y下方向でrotateXは負 */
        var ry = renderX * TILT_MAX;
        gem.style.transform = 'perspective(1200px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
        gem.style.filter = 'hue-rotate(' + (renderX * HUE_MAX).toFixed(1) + 'deg) saturate(1.15) brightness(1.02)';
        if (highlight) {
          highlight.style.left = (renderX * HL_RANGE + 50).toFixed(1) + '%';
          highlight.style.top = (renderY * HL_RANGE + 50).toFixed(1) + '%';
        }
      }
      if (prism && !reduce) {
        /* 石の傾きに合わせてプリズムも微妙に回転 */
        prism.style.transform = 'rotate(' + (renderX * 15).toFixed(1) + 'deg)';
      }
      if (shadow && !reduce) {
        /* 傾きに応じて影が反対方向へオフセット。CSS側のtranslateX(-50%)中央寄せを維持したまま合成 */
        shadow.style.transform = 'translateX(-50%) translate(' + (-renderX * 20).toFixed(1) + 'px, ' + (Math.abs(renderY) * 8).toFixed(1) + 'px)';
      }
      /* 目標との差がまだあるなら次フレームも描く（慣性の残り） */
      if (Math.abs(currentX - renderX) > 0.001 || Math.abs(currentY - renderY) > 0.001) {
        scheduleRender();
      }
    }

    /* イベント */
    var onMove = function (e) { setFromClient(e.clientX, e.clientY); };
    var onLeave = function () { setFromNormalized(0, 0); };   /* 中央へ戻る */

    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerleave', onLeave);
    /* Warning対応: タッチ/OSジェスチャでpointer cancelされた場合も中央に戻す */
    wrap.addEventListener('pointercancel', onLeave);

    /* デバイスの傾き（モバイル）— iOS 13+はpermission必要 */
    var orientationEnabled = false;
    var onOrientation = function (e) {
      if (e.gamma == null || e.beta == null) return;
      /* gamma: 左右 (-90〜90), beta: 前後 (-180〜180) */
      var x = e.gamma / 45;   /* ±45°でフルレンジ */
      var y = (e.beta - 45) / 45;  /* 手持ちの想定角度から±45° */
      setFromNormalized(x, y);
    };
    function enableOrientation() {
      if (disposed) return Promise.resolve(false);
      if (orientationEnabled) return Promise.resolve(true);
      /* iOS 13+ */
      var DE = window.DeviceOrientationEvent;
      if (DE && typeof DE.requestPermission === 'function') {
        return DE.requestPermission().then(function (state) {
          /* Warning対応: pending中にdetachされた場合はlistener追加しない */
          if (disposed) return false;
          if (state === 'granted') {
            window.addEventListener('deviceorientation', onOrientation);
            orientationEnabled = true;
            return true;
          }
          return false;
        }).catch(function () { return false; });
      }
      /* Android 等 */
      window.addEventListener('deviceorientation', onOrientation);
      orientationEnabled = true;
      return Promise.resolve(true);
    }
    function disableOrientation() {
      if (!orientationEnabled) return;
      window.removeEventListener('deviceorientation', onOrientation);
      orientationEnabled = false;
    }

    /* 初期描画（中央でrender） */
    scheduleRender();

    return {
      detach: function () {
        disposed = true;
        wrap.removeEventListener('pointermove', onMove);
        wrap.removeEventListener('pointerleave', onLeave);
        wrap.removeEventListener('pointercancel', onLeave);
        disableOrientation();
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        gem.style.transform = '';
        gem.style.filter = '';
        if (highlight) { highlight.style.left = '50%'; highlight.style.top = '50%'; }
        if (prism) prism.style.transform = '';
        /* CSS中央寄せを維持したクリア */
        if (shadow) shadow.style.transform = 'translateX(-50%)';
      },
      enableOrientation: enableOrientation,
      setAccent: function (color) {
        accent = safeHex(color, '#B8B4AE');
        applyPrismBg();
      }
    };
  }

  window.NoctaKazasu = { attach: attach };
})();
