/**
 * NOCTA Zukan Core — 図鑑アプリ共通エンジン
 *
 * gems / flora / iro の3図鑑が共有する「機構」を1箇所に集約する。
 * 方針: レンダリングHTML・フィルタの意味論・文言は各アプリ側に残し（各図鑑の自由度を守る）、
 *       バグ修正が3重になりやすい機構だけをここで持つ。
 *
 * 提供するもの:
 *  - 静的ユーティリティ: escHtml / escAttr / cssEscape / thumbUrl / imgSrcAttrs /
 *    attachImgFallback / luminance / contrastRatio / todayIndex / slugify / MONTHS_EN
 *  - NoctaZukan.createApp(config) — アプリインスタンス:
 *      i18n（data-i18n / data-ja / img[data-alt-ja] / #lang-btn）
 *      お気に入り（localStorage・.fav-btn/.idx-fav のDOM同期）
 *      ダイアログ管理（開閉・フォーカス保存/復帰/トラップ・bodyロック・背面inert・ESC・aria-expanded）
 *      セクション追跡（レールドット生成・active追随・reveal/in-view）
 *      キーボードナビ（↑↓/j/k）・スクロール・ハッシュパーマリンク
 *      クリップボードコピー（成否フィードバック）・カバー肉球
 *
 * config:
 *  { strings, idPrefix, railId, sectionClass, favKey, inertIds,
 *    solidDots?, slugs?, onLangApply?, onFavChange? }
 *
 * 更新時の注意: 読み込み側は ../zukan/zukan-core.js?v=N のクエリを上げてキャッシュを割ること。
 */
(function () {
  "use strict";

  var MONTHS_EN = ["", "January", "February", "March", "April", "May", "June",
                   "July", "August", "September", "October", "November", "December"];

  function escHtml(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function escAttr(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function cssEscape(s) {
    return (window.CSS && CSS.escape) ? CSS.escape(s) : String(s).replace(/["\\\]]/g, '\\$&');
  }

  /* Wikimedia Commonsの原寸URLからサムネイルURLを導出（失敗時は原寸へフォールバック） */
  function thumbUrl(url, w) {
    var m = String(url).match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/([0-9a-f])\/([0-9a-f]{2})\/([^\/]+)$/);
    if (!m) return url;
    return m[1] + '/thumb/' + m[2] + '/' + m[3] + '/' + m[4] + '/' + w + 'px-' + m[4];
  }

  /* レスポンシブ読み込み。幅はWikimediaのサムネイル許可バケット（500/960/1280）に合わせる */
  function imgSrcAttrs(url) {
    var t960 = thumbUrl(url, 960);
    if (t960 === url) return 'src="' + escAttr(url) + '"';
    return 'src="' + escAttr(t960) + '"' +
      ' srcset="' + escAttr(thumbUrl(url, 500)) + ' 500w, ' + escAttr(t960) + ' 960w, ' + escAttr(thumbUrl(url, 1280)) + ' 1280w"' +
      ' sizes="(min-width:768px) 45vw, 92vw"';
  }

  /* 画像フォールバック: サムネ失敗→原寸→非表示。img[data-original] を対象にする */
  function imgFallbackHandler(img) {
    return function () {
      var original = img.getAttribute('data-original');
      if (img.hasAttribute('srcset')) {
        img.removeAttribute('srcset');
        img.removeAttribute('sizes');
        img.src = original;
      } else if (img.src !== original) {
        img.src = original;
      } else {
        img.style.visibility = 'hidden';
      }
    };
  }

  function attachImgFallback(container) {
    container.querySelectorAll('img[data-original]').forEach(function (img) {
      img.addEventListener('error', imgFallbackHandler(img));
    });
  }

  /* WCAG相対輝度・コントラスト比 */
  function luminance(hex) {
    var r = parseInt(hex.slice(1, 3), 16) / 255;
    var g = parseInt(hex.slice(3, 5), 16) / 255;
    var b = parseInt(hex.slice(5, 7), 16) / 255;
    var lin = function (c) { return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  }

  function contrastRatio(l1, l2) {
    var hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  }

  /* 今日の一つ（日付シードの決定的選出・毎日変わる） */
  function todayIndex(total) {
    var d = new Date();
    var seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    var h = seed % 2147483647;
    h = (h * 48271) % 2147483647;
    return h % total;
  }

  /* パーマリンク用スラッグ（romaji等をASCII化: Suō → suo） */
  function slugify(s) {
    return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function scrollToSection(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  }

  /* チップの選択状態をclassとariaの両方に反映 */
  function setChip(chip, on) {
    chip.classList.toggle('active', on);
    chip.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  /* ダイアログのフォーカストラップ（Tab循環） */
  function focusables(container) {
    return Array.prototype.filter.call(
      container.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])'),
      function (el) { return !el.disabled && el.getClientRects().length > 0; }
    );
  }

  function trapFocus(container, e) {
    if (e.key !== 'Tab') return;
    var f = focusables(container);
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  }

  function createApp(config) {
    var lang = 'ja';
    var strings = config.strings || {};
    var sectionIds = [];
    var dialogs = {};
    var openStack = [];

    /* ---- i18n ---- */
    function applyLang() {
      document.documentElement.lang = lang;
      document.querySelectorAll('[data-i18n]').forEach(function (el) {
        var key = el.getAttribute('data-i18n');
        if (strings[key]) el.textContent = strings[key][lang];
      });
      document.querySelectorAll('[data-ja]').forEach(function (el) {
        var t = lang === 'ja' ? el.getAttribute('data-ja') : el.getAttribute('data-en');
        if (t !== null) el.textContent = t;
      });
      document.querySelectorAll('img[data-alt-ja]').forEach(function (el) {
        el.alt = lang === 'ja' ? el.getAttribute('data-alt-ja') : el.getAttribute('data-alt-en');
      });
      if (config.onLangApply) config.onLangApply(lang);
      var btn = document.getElementById('lang-btn');
      if (btn) {
        btn.textContent = lang === 'ja' ? 'EN' : 'JA';
        btn.setAttribute('aria-label', lang === 'ja' ? 'Switch language to English' : '日本語に切り替え');
      }
    }

    /* HTML側の onclick="toggleLang()" 互換のため意図的にグローバル公開している（NoctaZukan以外で唯一） */
    window.toggleLang = function () {
      lang = lang === 'ja' ? 'en' : 'ja';
      applyLang();
    };

    /* ---- お気に入り（localStorage・肉球） ---- */
    var favs = (function () {
      try {
        var v = JSON.parse(localStorage.getItem(config.favKey) || '[]');
        return Array.isArray(v) ? v : [];
      } catch (e) { return []; }
    })();

    function saveFavs() {
      try { localStorage.setItem(config.favKey, JSON.stringify(favs)); } catch (e) { /* プライベートモード等では保存しない */ }
    }

    function favHas(id) { return favs.indexOf(id) !== -1; }

    function syncFavDom(id, faved) {
      document.querySelectorAll('.fav-btn[data-fav="' + cssEscape(id) + '"]').forEach(function (b) {
        b.classList.toggle('faved', faved);
        b.setAttribute('aria-pressed', faved ? 'true' : 'false');
      });
      document.querySelectorAll('.index-item[data-id="' + cssEscape(id) + '"] .idx-fav').forEach(function (m) {
        m.hidden = !faved;
      });
    }

    function favToggle(id) {
      var i = favs.indexOf(id);
      if (i === -1) favs.push(id); else favs.splice(i, 1);
      saveFavs();
      var faved = i === -1;
      syncFavDom(id, faved);
      if (config.onFavChange) config.onFavChange(id, faved);
      return faved;
    }

    function favInitDom() {
      favs.forEach(function (id) { syncFavDom(id, true); });
    }

    /* ---- ダイアログ管理（ロック・inert・フォーカス・ESC を一元化） ---- */
    function syncOverlayState() {
      var anyOpen = openStack.length > 0;
      var topName = anyOpen ? openStack[openStack.length - 1] : null;
      document.body.style.overflow = anyOpen ? 'hidden' : '';
      (config.inertIds || []).forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        if (anyOpen) el.setAttribute('inert', '');
        else el.removeAttribute('inert');
      });
      /* 多重表示時はスタック最上位以外のダイアログもinertにする */
      Object.keys(dialogs).forEach(function (n) {
        var d = dialogs[n];
        if (d.isOpen && n !== topName) d.el.setAttribute('inert', '');
        else d.el.removeAttribute('inert');
      });
    }

    function openDialog(name, arg) {
      var d = dialogs[name];
      if (!d || d.isOpen) return;
      d.lastFocus = document.activeElement;
      if (d.onOpen) d.onOpen(arg);
      d.el.hidden = false;
      d.isOpen = true;
      openStack.push(name);
      syncOverlayState();
      if (d.trigger) d.trigger.setAttribute('aria-expanded', 'true');
      (d.closeBtn || d.el).focus();
    }

    function closeDialog(name) {
      var d = dialogs[name];
      if (!d || !d.isOpen) return;
      /* スタック最上位を閉じたときだけフォーカスを復帰する（下位を閉じても上位からフォーカスを奪わない） */
      var wasTop = openStack[openStack.length - 1] === name;
      d.el.hidden = true;
      d.isOpen = false;
      openStack = openStack.filter(function (n) { return n !== name; });
      syncOverlayState();
      if (d.trigger) d.trigger.setAttribute('aria-expanded', 'false');
      if (d.onClose) d.onClose();
      if (wasTop && d.lastFocus && d.lastFocus.focus) d.lastFocus.focus();
      d.lastFocus = null;
    }

    function registerDialog(name, opts) {
      if (dialogs[name]) {
        /* 二重登録はリスナー重複事故のもとなので冪等に既存ハンドルを返す */
        if (window.console && console.warn) console.warn('NoctaZukan: dialog "' + name + '" は登録済みです');
        return {
          open: function (arg) { openDialog(name, arg); },
          close: function () { closeDialog(name); },
          isOpen: function () { return dialogs[name].isOpen; }
        };
      }
      var d = {
        el: opts.el, closeBtn: opts.closeBtn || null, trigger: opts.trigger || null,
        onOpen: opts.onOpen || null, onClose: opts.onClose || null,
        isOpen: false, lastFocus: null
      };
      d.el.addEventListener('click', function (e) {
        if (e.target === d.el && opts.backdropClose !== false) closeDialog(name);
      });
      d.el.addEventListener('keydown', function (e) { trapFocus(d.el, e); });
      if (d.closeBtn) d.closeBtn.addEventListener('click', function (e) { e.stopPropagation(); closeDialog(name); });
      if (d.trigger) d.trigger.addEventListener('click', function () { openDialog(name); });
      dialogs[name] = d;
      return {
        open: function (arg) { openDialog(name, arg); },
        close: function () { closeDialog(name); },
        isOpen: function () { return d.isOpen; }
      };
    }

    function anyDialogOpen() { return openStack.length > 0; }

    /* ---- セクション追跡（レール・reveal） ---- */
    function trackSection(sectionEl, dotColor, ariaLabel) {
      sectionIds.push(sectionEl.id);
      var rail = document.getElementById(config.railId);
      if (!rail) return;
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'rail-dot';
      dot.style.setProperty('--dot-color', dotColor);
      if (config.solidDots) dot.style.background = dotColor;
      dot.setAttribute('aria-label', ariaLabel);
      dot.dataset.target = sectionEl.id;
      dot.addEventListener('click', function () { scrollToSection(sectionEl.id); });
      rail.appendChild(dot);
    }

    function initObservers() {
      if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in-view'); });
        return;
      }
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add('in-view');
        });
      }, { threshold: 0.2 });
      document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });

      /* activeドットは画面内にかかる全セクションから都度計算する
         （threshold依存だと縦長セクションで取りこぼすため） */
      function updateActiveRail() {
        var viewportCenter = window.innerHeight / 2;
        var bestId = null, bestDist = Infinity;
        sectionIds.forEach(function (id) {
          var el = document.getElementById(id);
          if (!el) return;
          var rect = el.getBoundingClientRect();
          if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
          var dist = Math.abs((rect.top + rect.height / 2) - viewportCenter);
          if (dist < bestDist) { bestDist = dist; bestId = id; }
        });
        document.querySelectorAll('.rail-dot').forEach(function (d) {
          var isActive = d.dataset.target === bestId;
          d.classList.toggle('active', isActive);
          if (isActive) d.setAttribute('aria-current', 'true');
          else d.removeAttribute('aria-current');
        });
      }

      var sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle('in-view', entry.isIntersecting);
        });
        updateActiveRail();
      }, { threshold: 0.2 });
      document.querySelectorAll('.' + config.sectionClass).forEach(function (el) { sectionObserver.observe(el); });

      var railTick = false;
      window.addEventListener('scroll', function () {
        if (railTick) return;
        railTick = true;
        requestAnimationFrame(function () { railTick = false; updateActiveRail(); });
      }, { passive: true });
    }

    /* ---- キーボードナビ（↑↓ / j k・ESCは開いているダイアログを閉じる） ---- */
    function nearestSectionIdx() {
      var viewportCenter = window.innerHeight / 2;
      var best = -1, bestDist = Infinity;
      sectionIds.forEach(function (id, i) {
        var el = document.getElementById(id);
        if (!el) return;
        var r = el.getBoundingClientRect();
        var dist = Math.abs((r.top + r.height / 2) - viewportCenter);
        if (dist < bestDist) { bestDist = dist; best = i; }
      });
      return best;
    }

    function initKeyboardNav() {
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          if (openStack.length) {
            closeDialog(openStack[openStack.length - 1]);
            e.preventDefault();
          }
          return;
        }
        if (openStack.length) return;
        var dir = 0;
        if (e.key === 'ArrowDown' || e.key === 'j') dir = 1;
        if (e.key === 'ArrowUp' || e.key === 'k') dir = -1;
        if (!dir) return;
        e.preventDefault();
        var cur = nearestSectionIdx();
        var next = Math.min(Math.max(cur + dir, 0), sectionIds.length - 1);
        if (next !== cur || cur === -1) scrollToSection(sectionIds[Math.max(next, 0)]);
      });
    }

    /* ---- ジャンプ＋ハッシュパーマリンク ---- */
    function jumpTo(i) {
      scrollToSection(config.idPrefix + '-' + (i + 1));
      if (config.slugs && config.slugs[i] && history.replaceState) {
        history.replaceState(null, '', '#' + config.slugs[i]);
      }
    }

    function initHashDeepLink() {
      if (!config.slugs) return;
      var h = decodeURIComponent((location.hash || '').slice(1));
      var idx = config.slugs.indexOf(h);
      if (idx !== -1) setTimeout(function () { scrollToSection(config.idPrefix + '-' + (idx + 1)); }, 250);
    }

    /* ---- クリップボード（成否フィードバック付き） ---- */
    function copyFeedback(el, ok) {
      if (!el) return;
      if (!el.getAttribute('data-original-text')) {
        el.setAttribute('data-original-text', el.textContent);
      }
      var key = ok ? 'copy.done' : 'copy.fail';
      el.textContent = strings[key] ? strings[key][lang] : (ok ? 'Copied' : 'Copy failed');
      setTimeout(function () {
        var orig = el.getAttribute('data-original-text');
        if (orig) el.textContent = orig;
        el.removeAttribute('data-original-text');
      }, 1200);
    }

    function fallbackCopy(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    }

    function copyText(text, feedbackEl) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(
          function () { copyFeedback(feedbackEl, true); return true; },
          function () { var ok = fallbackCopy(text); copyFeedback(feedbackEl, ok); return ok; }
        );
      }
      var ok = fallbackCopy(text);
      copyFeedback(feedbackEl, ok);
      return Promise.resolve(ok);
    }

    /* ---- 銀猫: カバーの肉球トレイル ---- */
    function initCoverPaws() {
      var cover = document.getElementById('cover');
      var layer = document.getElementById('cover-paws');
      if (!cover || !layer) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      var MAX_PAWS = 40, MIN_DIST = 90, last = null;

      function addPaw(clientX, clientY) {
        var r = layer.getBoundingClientRect();
        var x = clientX - r.left, y = clientY - r.top;
        var size = 24 + Math.random() * 10;
        var rot = Math.random() * 40 - 20;
        var paw = document.createElement('span');
        paw.className = 'paw';
        paw.style.cssText = 'left:' + (x - size / 2) + 'px; top:' + (y - size / 2) + 'px; width:' + size + 'px; transform:rotate(' + rot + 'deg);';
        paw.innerHTML = '<svg class="paw-svg" viewBox="0 0 100 100" style="color:#B8B4AE"><use href="#cat-paw" filter="url(#watercolor)"/></svg>';
        layer.appendChild(paw);
        while (layer.children.length > MAX_PAWS) layer.removeChild(layer.firstChild);
      }

      cover.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        if (last) {
          var dx = e.clientX - last.x, dy = e.clientY - last.y;
          if (dx * dx + dy * dy < MIN_DIST * MIN_DIST) return;
        }
        last = { x: e.clientX, y: e.clientY };
        addPaw(e.clientX, e.clientY);
      });
      cover.addEventListener('pointerdown', function (e) { addPaw(e.clientX, e.clientY); });
    }

    return {
      lang: function () { return lang; },
      applyLang: applyLang,
      favs: { has: favHas, toggle: favToggle, initDom: favInitDom, list: function () { return favs.slice(); } },
      registerDialog: registerDialog,
      anyDialogOpen: anyDialogOpen,
      trackSection: trackSection,
      initObservers: initObservers,
      initKeyboardNav: initKeyboardNav,
      jumpTo: jumpTo,
      initHashDeepLink: initHashDeepLink,
      copyText: copyText,
      initCoverPaws: initCoverPaws,
      scrollToSection: scrollToSection,
      setChip: setChip
    };
  }

  window.NoctaZukan = {
    MONTHS_EN: MONTHS_EN,
    escHtml: escHtml,
    escAttr: escAttr,
    cssEscape: cssEscape,
    thumbUrl: thumbUrl,
    imgSrcAttrs: imgSrcAttrs,
    attachImgFallback: attachImgFallback,
    luminance: luminance,
    contrastRatio: contrastRatio,
    todayIndex: todayIndex,
    slugify: slugify,
    scrollToSection: scrollToSection,
    setChip: setChip,
    createApp: createApp
  };
})();
