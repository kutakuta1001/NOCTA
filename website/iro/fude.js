/**
 * NOCTA Hare — 筆あそび（Fude Asobi）
 *
 * 「この色に浸る」から進化した、その色のインクで書ける小さな書斎。
 * 中央に和紙、周囲にかさね配色で描いた季節の伝統文様（麻の葉/青海波/矢絣/市松）、
 * 筆・水彩・カリグラフィの3種。筆圧・速度・毛先のかすれと、水彩の吸水を表現する。
 *
 * 依存: なし（NoctaZukan.escAttrのみ・任意）
 * 提供: window.NoctaFude.mount(container, colorData) → detach()
 *
 * colorData: { name, kana, romaji, hex, season("春/夏/秋/冬"), kasane:[名前2つ], hexes:[hex2つ] }
 *   （kasaneのhex解決は呼び出し側で行う。fude.jsは色データを配色にそのまま使う）
 */
(function () {
  "use strict";

  var SEASON_PATTERN = { "春": "asanoha", "夏": "seigaiha", "秋": "yagasuri", "冬": "ichimatsu" };
  var SUMI = "#1C1A17";
  var PAPER_TINT_RATIO = 0.06;  /* 紙にその色を6%混ぜる */

  /* お手本モチーフ — 書道の漢字・かな8種
     viewBoxは全て0 0 100 100・カリグラフィで平ペン特性が活きる筆順の骨格
     v6: v3の書道モチーフに復帰（幾何学より書き応えがあるとのCEO判断） */
  var TEGAMI = [
    /* 一 */
    { label: 'ichi', paths: ['M12 52 C 30 48, 70 48, 88 52'] },
    /* 二 */
    { label: 'ni', paths: ['M18 34 C 34 30, 66 30, 82 34', 'M12 66 C 30 62, 70 62, 88 66'] },
    /* 川 */
    { label: 'kawa', paths: ['M30 18 C 26 40, 26 62, 26 84', 'M50 14 C 46 40, 46 62, 50 88', 'M72 20 C 74 42, 74 64, 78 86'] },
    /* 山 */
    { label: 'yama', paths: ['M20 78 L 20 40', 'M20 78 L 80 78', 'M50 78 L 50 20', 'M80 78 L 80 40'] },
    /* 月 */
    { label: 'tsuki', paths: ['M30 20 L 30 82 L 72 82 L 72 20 Z', 'M30 40 L 72 40', 'M30 60 L 72 60'] },
    /* の（かな） */
    { label: 'no', paths: ['M62 22 C 32 22, 20 42, 30 62 C 40 78, 68 78, 76 60 C 82 46, 72 32, 58 34 C 46 36, 42 50, 50 60'] },
    /* さ（かな・簡略） */
    { label: 'sa', paths: ['M32 26 C 46 22, 62 22, 74 28', 'M46 14 C 42 30, 40 50, 44 70', 'M64 40 C 50 46, 40 56, 50 74 C 58 84, 74 72, 66 60'] },
    /* 花（略字風の記号） */
    { label: 'hana', paths: ['M50 20 C 40 30, 40 44, 50 50 C 60 44, 60 30, 50 20 Z', 'M30 40 C 40 30, 40 30, 50 50', 'M70 40 C 60 30, 60 30, 50 50', 'M35 65 C 45 55, 55 55, 65 65', 'M50 50 L 50 88'] }
  ];

  function tegamiSvg(index) {
    var m = TEGAMI[index % TEGAMI.length];
    var paths = m.paths.map(function (d) {
      return '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>';
    }).join('');
    return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="お手本: ' + m.label + '">' + paths + '</svg>';
  }

  /* ---- 色ユーティリティ ---- */
  function hex2rgb(hex) {
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16)
    };
  }
  /* 外部API入力の検証（NoctaFude.mount経由の任意呼び出し用・XSS対策） */
  var HEX_RE = /^#[0-9a-fA-F]{6}$/;
  function sanitizeHex(h, fallback) {
    return (typeof h === 'string' && HEX_RE.test(h)) ? h : fallback;
  }
  function rgb2hex(r, g, b) {
    var h = function (n) { return Math.round(n).toString(16).padStart(2, '0'); };
    return '#' + h(r) + h(g) + h(b);
  }
  function mix(hexA, hexB, t) {
    var a = hex2rgb(hexA), b = hex2rgb(hexB);
    return rgb2hex(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t);
  }
  function luminance(hex) {
    var c = hex2rgb(hex);
    var lin = function (x) { var v = x / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  }
  function contrast(l1, l2) { return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }

  /* 淡色は紙とのコントラスト比が1.8未満のとき濃色版（本色60% + 墨40%）に置換 */
  function ensureInkReadable(hex, paperHex) {
    if (contrast(luminance(hex), luminance(paperHex)) >= 1.8) return hex;
    return mix(hex, SUMI, 0.4);
  }

  function escAttr(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---- 伝統文様の SVG data URL 生成 ---- */
  function patternSvg(kind, colors) {
    var c1 = colors[0], c2 = colors[1] || colors[0], c3 = colors[2] || colors[0];
    var svg;
    if (kind === 'asanoha') {
      /* 麻の葉: 六角形+放射線（春） */
      svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="92" viewBox="0 0 80 92">' +
          '<g fill="none" stroke-linecap="round" stroke-width="0.9" opacity="0.55">' +
            '<g stroke="' + c1 + '">' +
              '<path d="M40 4 L76 24 L76 68 L40 88 L4 68 L4 24 Z"/>' +
              '<path d="M40 4 L40 88 M4 24 L76 68 M76 24 L4 68"/>' +
              '<path d="M40 46 L40 4 L4 24 Z" fill="' + c2 + '" fill-opacity="0.25"/>' +
              '<path d="M40 46 L40 4 L76 24 Z" fill="' + c3 + '" fill-opacity="0.25"/>' +
            '</g>' +
          '</g>' +
        '</svg>';
    } else if (kind === 'seigaiha') {
      /* 青海波: 同心円弧（夏） */
      svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40" viewBox="0 0 80 40">' +
          '<g fill="none" stroke-linecap="round" opacity="0.6">' +
            '<g stroke="' + c1 + '" stroke-width="1.1">' +
              '<path d="M-40 40 A 40 40 0 0 1 40 40"/>' +
              '<path d="M40 40 A 40 40 0 0 1 120 40"/>' +
              '<path d="M0 40 A 40 40 0 0 1 80 40"/>' +
            '</g>' +
            '<g stroke="' + c2 + '" stroke-width="0.7" opacity="0.7">' +
              '<path d="M-40 40 A 32 32 0 0 1 40 40"/>' +
              '<path d="M40 40 A 32 32 0 0 1 120 40"/>' +
              '<path d="M0 40 A 32 32 0 0 1 80 40"/>' +
            '</g>' +
            '<g stroke="' + c3 + '" stroke-width="0.6" opacity="0.55">' +
              '<path d="M-40 40 A 24 24 0 0 1 40 40"/>' +
              '<path d="M40 40 A 24 24 0 0 1 120 40"/>' +
              '<path d="M0 40 A 24 24 0 0 1 80 40"/>' +
            '</g>' +
          '</g>' +
        '</svg>';
    } else if (kind === 'yagasuri') {
      /* 矢絣: 矢羽根の縦連（秋） */
      svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="80" viewBox="0 0 60 80">' +
          '<g opacity="0.62">' +
            '<polygon points="0,0 30,20 60,0 60,20 30,40 0,20" fill="' + c1 + '" fill-opacity="0.65"/>' +
            '<polygon points="0,40 30,60 60,40 60,60 30,80 0,60" fill="' + c2 + '" fill-opacity="0.55"/>' +
            '<polygon points="0,20 30,40 60,20 60,40 30,60 0,40" fill="' + c3 + '" fill-opacity="0.35"/>' +
          '</g>' +
        '</svg>';
    } else {
      /* 市松: 2色チェッカー（冬） */
      svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">' +
          '<g opacity="0.7">' +
            '<rect x="0" y="0" width="32" height="32" fill="' + c1 + '" fill-opacity="0.55"/>' +
            '<rect x="32" y="32" width="32" height="32" fill="' + c1 + '" fill-opacity="0.55"/>' +
            '<rect x="32" y="0" width="32" height="32" fill="' + c2 + '" fill-opacity="0.4"/>' +
            '<rect x="0" y="32" width="32" height="32" fill="' + c2 + '" fill-opacity="0.4"/>' +
            '<circle cx="16" cy="16" r="3" fill="' + c3 + '" fill-opacity="0.5"/>' +
            '<circle cx="48" cy="48" r="3" fill="' + c3 + '" fill-opacity="0.5"/>' +
          '</g>' +
        '</svg>';
    }
    /* HTML属性値のダブルクォートと衝突しないようurl(...)はシングルクォートで包む */
    return "url('data:image/svg+xml;utf8," + encodeURIComponent(svg) + "')";
  }

  /* ---- HTML/UI 構築 ---- */
  function buildUi(container, colorData) {
    /* 外部API経由の不正hex（XSS等）は SUMI にフォールバック */
    var mainHex = sanitizeHex(colorData.hex, SUMI);
    var k1 = sanitizeHex((colorData.hexes || [])[0], mainHex);
    var k2 = sanitizeHex((colorData.hexes || [])[1], mainHex);
    var paper = mix('#F5EFE0', mainHex, PAPER_TINT_RATIO);
    var inkColors = [
      { key: 'main',    hex: mainHex },
      { key: 'kasane1', hex: k1 },
      { key: 'kasane2', hex: k2 },
      { key: 'sumi',    hex: SUMI }
    ].map(function (c) { return { key: c.key, orig: c.hex, hex: ensureInkReadable(c.hex, paper) }; });

    var patternKind = SEASON_PATTERN[colorData.season] || 'ichimatsu';
    var patternUrl = patternSvg(patternKind, [mainHex, k1, k2]);
    var patternBgColor = mix(paper, mainHex, 0.14);

    container.innerHTML =
      '<div class="fude-stage" style="background-color:' + escAttr(patternBgColor) + '; background-image:' + patternUrl + '; background-repeat:repeat;">' +
        '<button class="fude-close" type="button" aria-label="閉じる">×</button>' +
        '<div class="fude-paper" style="background:' + escAttr(paper) + '; --paper-color:' + escAttr(paper) + ';">' +
          /* なぞり手本レイヤ（canvasの下・薄墨） — 「お手本」ボタンでランダム表示/消去 */
          '<div class="fude-tegami" aria-hidden="true"></div>' +
          '<canvas class="fude-canvas" aria-label="' + escAttr(colorData.name + 'の紙。ポインタで書けます') + '"></canvas>' +
          /* 紙の内側の縁にも同じ文様（絵巻の縁取り）— 装飾用・aria-hidden */
          '<div class="fude-paper-border" aria-hidden="true" style="background-image:' + patternUrl + ';"></div>' +
          /* リセット時の拭き取りアニメ用のオーバーレイ帯（普段はopacity 0） */
          '<div class="fude-sweep" aria-hidden="true"></div>' +
          '<div class="fude-cornername" aria-hidden="true">' +
            '<span class="fude-cn-name">' + escAttr(colorData.name) + '</span>' +
            '<span class="fude-cn-kana">' + escAttr(colorData.kana) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="fude-bar">' +
          '<div class="fude-inks" role="radiogroup" aria-label="インクの色">' +
            inkColors.map(function (c, i) {
              return '<button type="button" class="fude-ink' + (i === 0 ? ' active' : '') +
                '" role="radio" aria-checked="' + (i === 0 ? 'true' : 'false') +
                '" data-ink="' + c.hex + '" style="background:' + c.hex + ';" aria-label="インク: ' + c.hex + '"></button>';
            }).join('') +
          '</div>' +
          '<div class="fude-pens" role="radiogroup" aria-label="筆の種類">' +
            '<button type="button" class="fude-pen active" role="radio" aria-checked="true" data-pen="fude">筆</button>' +
            '<button type="button" class="fude-pen" role="radio" aria-checked="false" data-pen="water">水彩</button>' +
            '<button type="button" class="fude-pen" role="radio" aria-checked="false" data-pen="calligraphy">カリグラフィ</button>' +
          '</div>' +
          '<div class="fude-actions">' +
            '<button type="button" class="fude-btn" data-action="tegami">お手本</button>' +
            '<button type="button" class="fude-btn" data-action="clear">まっさらに</button>' +
            '<button type="button" class="fude-btn" data-action="save">写しを残す</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    return {
      paper: paper,
      patternUrl: patternUrl,
      patternBgColor: patternBgColor,
      inkColors: inkColors,
      patternKind: patternKind
    };
  }

  /* ---- インク物理エンジン ---- */
  function createInkEngine(canvas, initialInk) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var ink = initialInk, pen = 'fude', stroke = null;
    var wet = [], raf = 0, disposed = false;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    function rgbaInk(hex, a) {
      var c = hex2rgb(hex);
      return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + Math.max(0, Math.min(1, a)) + ')';
    }
    // Deposits are bounded and settle on the same canvas used by PNG export.
    // This approximates absorption and pigment edges, rather than a fluid solver.
    function deposit(d, age) {
      var r = d.r * (1 + age * 0.19);
      var g = ctx.createRadialGradient(d.x, d.y, r * 0.35, d.x, d.y, r);
      g.addColorStop(0, rgbaInk(d.ink, 0.006));
      g.addColorStop(0.77, rgbaInk(d.ink, 0.014));
      g.addColorStop(0.9, rgbaInk(d.ink, 0.034 * (1 - age * 0.35)));
      g.addColorStop(1, rgbaInk(d.ink, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      for (var i = 0; i <= 40; i++) {
        var a = i / 40 * Math.PI * 2;
        var edge = r * (1 + 0.025 * Math.sin(a * 7 + d.x) + 0.018 * Math.sin(a * 13 + d.y));
        var x = d.x + Math.cos(a) * edge, y = d.y + Math.sin(a) * edge * 0.94;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.fill();
    }
    function tick(now) {
      raf = 0;
      if (disposed) return;
      ctx.save(); ctx.globalCompositeOperation = 'multiply';
      wet = wet.filter(function (d) {
        var step = Math.min(8, Math.floor((now - d.born) / 90));
        while (d.step < step) { d.step++; deposit(d, d.step / 8); }
        return d.step < 8;
      });
      ctx.restore();
      if (wet.length) raf = requestAnimationFrame(tick);
    }
    function absorb(x, y, r, color) {
      var d = { x: x, y: y, r: r, ink: color, born: performance.now(), step: 0 };
      if (reduce.matches) { for (var i = 1; i <= 8; i++) deposit(d, i / 8); return; }
      if (wet.length >= 96) wet.shift();
      wet.push(d);
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function stop() {
      if (stroke) {
        var id = stroke.id; stroke = null;
        try { if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id); } catch (_) {}
      }
    }
    function resize() {
      var rect = canvas.getBoundingClientRect();
      var w = Math.max(1, Math.round(rect.width * dpr)), h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width === w && canvas.height === h) return;
      stop();
      var prev = document.createElement('canvas');
      prev.width = canvas.width; prev.height = canvas.height;
      prev.getContext('2d').drawImage(canvas, 0, 0);
      wet.forEach(function (d) { d.x *= w / canvas.width; d.y *= h / canvas.height; d.r *= Math.min(w / canvas.width, h / canvas.height); });
      canvas.width = w; canvas.height = h;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.drawImage(prev, 0, 0, prev.width, prev.height, 0, 0, w / dpr, h / dpr);
    }
    function point(e, rect) {
      rect = rect || canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top, t: e.timeStamp,
        p: e.pointerType === 'pen' ? Math.max(0.025, e.pressure) : 0.55 };
    }
    function width(p, speed) {
      if (stroke.pen === 'calligraphy') return 16;
      if (stroke.pen === 'water') return 18 + 30 * p;
      return (3 + 27 * Math.pow(p, 0.7)) / (1 + Math.min(2, speed) * 0.35);
    }
    function segment(a, b, wa, wb) {
      var dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy);
      var angle = dist > 0.01 ? Math.atan2(dy, dx) : stroke.angle;
      var nx = -Math.sin(angle), ny = Math.cos(angle);
      ctx.save(); ctx.globalCompositeOperation = stroke.pen === 'calligraphy' ? 'source-over' : 'multiply';
      if (stroke.pen === 'calligraphy') {
        // Flat nib keeps its orientation, including on very fast pointer moves.
        var steps = Math.max(1, Math.ceil(dist / 1.5));
        ctx.fillStyle = rgbaInk(stroke.ink, 0.85);
        for (var s = 0; s <= steps; s++) {
          ctx.beginPath(); ctx.ellipse(a.x + dx * s / steps, a.y + dy * s / steps, 8, 2.2, -Math.PI / 4, 0, Math.PI * 2); ctx.fill();
        }
      } else if (stroke.pen === 'water') {
        var count = Math.max(1, Math.ceil(dist / 1.5));
        for (var j = 1; j <= count; j++) {
          var t = j / count, x = a.x + dx * t, y = a.y + dy * t, r = (wa + (wb - wa) * t) / 2;
          var g = ctx.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, rgbaInk(stroke.ink, 0.026));
          g.addColorStop(0.8, rgbaInk(stroke.ink, 0.032));
          g.addColorStop(1, rgbaInk(stroke.ink, 0));
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
          stroke.waterDistance += dist / count;
          if (stroke.waterDistance >= 5 || dist < 0.1) { absorb(x, y, r, stroke.ink); stroke.waterDistance = 0; }
        }
      } else {
        // Persistent bristles join between events: pressure spreads hairs, distance dries ink.
        var dry = 1 - stroke.reservoir;
        for (var i = 0; i < 38; i++) {
          var f = (i + 0.5) / 38 * 2 - 1;
          var grain = 0.5 + 0.5 * Math.sin(i * 19.73 + Math.floor(stroke.distance / 9) * 2.3);
          var aInk = (0.72 + 0.27 * (1 - Math.abs(f))) * Math.sqrt(stroke.reservoir);
          if (grain < dry * 0.65) aInk *= 0.12;
          var old = stroke.tips[i];
          var bx = b.x + nx * f * wb * 0.5, by = b.y + ny * f * wb * 0.5;
          ctx.strokeStyle = rgbaInk(stroke.ink, aInk);
          ctx.lineWidth = Math.max(0.35, wb / 38 * (0.85 + grain * 0.75)); ctx.lineCap = 'butt';
          ctx.beginPath(); ctx.moveTo(old ? old.x : a.x + nx * f * wa * 0.5, old ? old.y : a.y + ny * f * wa * 0.5);
          ctx.lineTo(bx, by); ctx.stroke(); stroke.tips[i] = { x: bx, y: by };
        }
        stroke.waterDistance += dist;
        if (stroke.reservoir > 0.7 && stroke.waterDistance > 16) { absorb(b.x, b.y, wb * 0.48, stroke.ink); stroke.waterDistance = 0; }
      }
      ctx.restore(); stroke.angle = angle;
    }
    function begin(e) {
      if (disposed || stroke || (e.button !== undefined && e.button !== 0)) return;
      var p = point(e);
      stroke = { id: e.pointerId, pen: pen, ink: ink, last: p, v: 0, reservoir: 1,
        distance: 0, waterDistance: 0, tips: [], angle: -Math.PI / 4 };
      stroke.w = width(p.p, 0);
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      if (stroke.pen === 'fude') {
        // A stationary touch leaves ink; bristle direction starts with the first move.
        ctx.save(); ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = rgbaInk(stroke.ink, 0.82);
        ctx.beginPath(); ctx.ellipse(p.x, p.y, stroke.w * 0.5, stroke.w * 0.36, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      } else segment(p, p, stroke.w, stroke.w);
      e.preventDefault();
    }
    function sample(e, rect) {
      var p = point(e, rect), a = stroke.last, dist = Math.hypot(p.x - a.x, p.y - a.y);
      if (dist < 0.05) return;
      stroke.v = stroke.v * 0.65 + dist / Math.max(1, p.t - a.t) * 0.35;
      stroke.distance += dist; stroke.reservoir = Math.max(0.28, 1 - stroke.distance / 1500);
      var w = stroke.w * 0.35 + width(p.p, stroke.v) * 0.65;
      segment(a, p, stroke.w, w); stroke.last = p; stroke.w = w;
    }
    function move(e) {
      if (!stroke || e.pointerId !== stroke.id) return;
      var events = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
      var rect = canvas.getBoundingClientRect();
      if (events.length) events.forEach(function (event) { sample(event, rect); }); else sample(e, rect);
      e.preventDefault();
    }
    function end(e) {
      if (!stroke || e.pointerId !== stroke.id) return;
      // No invented 120px tail beyond the user's actual gesture; cancel never paints.
      if (e.type === 'pointerup') sample(e);
      stop();
    }
    function leave(e) {
      if (!stroke || e.pointerId !== stroke.id) return;
      try { if (canvas.hasPointerCapture(e.pointerId)) return; } catch (_) {}
      stop();
    }
    function clear() { stop(); wet = []; cancelAnimationFrame(raf); raf = 0; ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr); }
    resize();
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    canvas.addEventListener('pointerleave', leave);
    canvas.addEventListener('pointerdown', begin);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('lostpointercapture', end);
    return { setInk: function (v) { ink = v; }, setPen: function (v) { pen = v; }, clear: clear, resize: resize, canvas: canvas,
      detach: function () { disposed = true; stop(); wet = []; cancelAnimationFrame(raf);
        window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end);
        canvas.removeEventListener('pointerleave', leave);
        canvas.removeEventListener('pointerdown', begin); canvas.removeEventListener('pointermove', move);
        canvas.removeEventListener('pointerup', end); canvas.removeEventListener('pointercancel', end); canvas.removeEventListener('lostpointercapture', end); }
    };
  }

  /* ---- 保存: 紙背景＋文様額＋描線を合成してPNGダウンロード ---- */
  function savePng(canvas, meta, slug) {
    var out = document.createElement('canvas');
    /* 紙エリアの表示サイズと同解像度で書き出し */
    var w = canvas.width, h = canvas.height;
    out.width = w; out.height = h;
    var octx = out.getContext('2d');
    /* 紙 */
    octx.fillStyle = meta.paper;
    octx.fillRect(0, 0, w, h);
    /* 描線 */
    octx.drawImage(canvas, 0, 0);
    /* 縁の色名（隅） */
    octx.save();
    octx.font = '600 ' + Math.round(w * 0.02) + 'px "Shippori Mincho","EB Garamond",serif';
    octx.fillStyle = 'rgba(28,26,23,0.6)';
    octx.textAlign = 'right';
    octx.textBaseline = 'bottom';
    octx.fillText(meta.name + ' · ' + meta.romaji + ' · ' + meta.hex, w - w * 0.03, h - w * 0.02);
    octx.restore();
    var url = out.toDataURL('image/png');
    var a = document.createElement('a');
    a.href = url;
    a.download = 'hare-' + (slug || 'iro') + '.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /* ---- マウント ---- */
  function mount(container, colorData) {
    var meta = buildUi(container, colorData);
    var canvas = container.querySelector('.fude-canvas');
    var engine = createInkEngine(canvas, meta.inkColors[0].hex);

    /* リサイズ追随（コンテナのサイズ変化に応じてキャンバスも） */
    var ro = ('ResizeObserver' in window) ? new ResizeObserver(function () { engine.resize(); }) : null;
    if (ro) ro.observe(canvas);
    var onWinResize = function () { engine.resize(); };
    window.addEventListener('resize', onWinResize);

    /* イベント委譲 */
    var onClick = function (e) {
      var ink = e.target.closest('.fude-ink');
      if (ink) {
        container.querySelectorAll('.fude-ink').forEach(function (b) {
          var on = b === ink;
          b.classList.toggle('active', on);
          b.setAttribute('aria-checked', on ? 'true' : 'false');
        });
        engine.setInk(ink.getAttribute('data-ink'));
        return;
      }
      var pen = e.target.closest('.fude-pen');
      if (pen) {
        container.querySelectorAll('.fude-pen').forEach(function (b) {
          var on = b === pen;
          b.classList.toggle('active', on);
          b.setAttribute('aria-checked', on ? 'true' : 'false');
        });
        engine.setPen(pen.getAttribute('data-pen'));
        return;
      }
      var act = e.target.closest('[data-action]');
      if (act) {
        var a = act.getAttribute('data-action');
        if (a === 'clear') triggerClearSweep();
        else if (a === 'tegami') toggleTegami();
        else if (a === 'save') savePng(canvas, {
          paper: meta.paper, name: colorData.name, romaji: colorData.romaji, hex: colorData.hex
        }, colorData.slug || colorData.romaji);
      }
    };

    /* 「まっさらに」の拭き取りアニメ — sweep帯が左から右へ通り抜けるあいだにcanvasをクリア
       - CSSキーフレームで帯を移動（900ms、reduce-motionではフェードのみ300ms）
       - 帯が画面中央を過ぎるタイミングでclearNow()を呼び、視覚的に「拭いたら消えた」感を出す */
    var sweepBusy = false;
    var uiTimers = [];
    function later(fn, ms) { var id = setTimeout(function () { uiTimers = uiTimers.filter(function (t) { return t !== id; }); fn(); }, ms); uiTimers.push(id); }
    function triggerClearSweep() {
      if (sweepBusy) return;
      var sweep = container.querySelector('.fude-sweep');
      if (!sweep) { engine.clear(); return; }
      sweepBusy = true;
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var duration = reduce ? 300 : 900;
      /* 前回のアニメ状態を確実にリセットしてから開始 */
      sweep.classList.remove('animate');
      /* 強制リフローで再アニメを効かせる */
      void sweep.offsetWidth;
      sweep.classList.add('animate');
      /* 中盤でクリア（帯が中央を横切るタイミング） */
      later(function () { engine.clear(); }, duration * 0.5);
      /* アニメ完了時にクラスを外す */
      later(function () {
        sweep.classList.remove('animate');
        sweepBusy = false;
      }, duration + 40);
    }

    /* お手本のトグル: 表示中はランダムに次の一字へ・非表示に切替 */
    var tegamiIdx = -1;
    function toggleTegami() {
      var el = container.querySelector('.fude-tegami');
      if (!el) return;
      if (el.classList.contains('on')) {
        /* 表示中→非表示に */
        el.classList.remove('on');
        later(function () { el.innerHTML = ''; }, 500);
        tegamiIdx = -1;
      } else {
        /* 非表示→ランダム表示（直前と別のものを選ぶ） */
        var next = Math.floor(Math.random() * TEGAMI.length);
        if (TEGAMI.length > 1 && next === tegamiIdx) next = (next + 1) % TEGAMI.length;
        tegamiIdx = next;
        el.innerHTML = tegamiSvg(next);
        el.classList.add('on');
      }
    }
    container.addEventListener('click', onClick);

    /* 閉じるボタンはコアのregisterDialogが処理する（fude.js内でハンドリングしない） */

    return {
      detach: function () {
        container.removeEventListener('click', onClick);
        window.removeEventListener('resize', onWinResize);
        if (ro) ro.disconnect();
        uiTimers.forEach(clearTimeout); uiTimers = [];
        engine.detach();
      },
      resize: engine.resize
    };
  }

  window.NoctaFude = { mount: mount };
})();
