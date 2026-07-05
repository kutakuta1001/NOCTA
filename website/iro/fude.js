/**
 * NOCTA Hare — 筆あそび（Fude Asobi）
 *
 * 「この色に浸る」から進化した、その色のインクで書ける小さな書斎。
 * 中央に和紙、周囲にかさね配色で描いた季節の伝統文様（麻の葉/青海波/矢絣/市松）、
 * 筆・カリグラフィの2種で速度依存の太さ変化・にじみ・かすれ・払いを表現する。
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
        '<div class="fude-paper" style="background:' + escAttr(paper) + ';">' +
          '<canvas class="fude-canvas" aria-label="' + escAttr(colorData.name + 'の紙。ポインタで書けます') + '"></canvas>' +
          /* 紙の内側の縁にも同じ文様（絵巻の縁取り）— 装飾用・aria-hidden */
          '<div class="fude-paper-border" aria-hidden="true" style="background-image:' + patternUrl + ';"></div>' +
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
            '<button type="button" class="fude-pen" role="radio" aria-checked="false" data-pen="calligraphy">カリグラフィ</button>' +
          '</div>' +
          '<div class="fude-actions">' +
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
    var ink = initialInk;
    var pen = 'fude';
    var stroke = null;   /* { last:{x,y,t}, v:平滑化速度, reservoir, ink, pen } */

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var w = Math.max(1, Math.floor(rect.width * dpr));
      var h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width === w && canvas.height === h) return;
      /* 既存描画を保持してリサイズ（新サイズにフルフィットでスケール） */
      var prev = document.createElement('canvas');
      prev.width = canvas.width; prev.height = canvas.height;
      var hadPrev = canvas.width > 0 && canvas.height > 0;
      if (hadPrev) prev.getContext('2d').drawImage(canvas, 0, 0);
      canvas.width = w; canvas.height = h;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (hadPrev) {
        /* CSSピクセル座標系で全体スケール（画面回転や紙サイズ変更でも縮尺が合う） */
        var newCssW = w / dpr, newCssH = h / dpr;
        ctx.drawImage(prev, 0, 0, prev.width, prev.height, 0, 0, newCssW, newCssH);
      }
    }
    resize();

    function clientToLocal(e) {
      var rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top, t: (e.timeStamp || performance.now()) };
    }

    /* 筆スタンプ: 中心濃→縁淡のradial gradient（にじむ・柔らかい） */
    function stampFude(x, y, w, inkHex, alpha) {
      var r = w / 2;
      var g = ctx.createRadialGradient(x, y, 0, x, y, r);
      var rgb = hex2rgb(inkHex);
      g.addColorStop(0, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (alpha * 0.85).toFixed(3) + ')');
      g.addColorStop(0.5, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (alpha * 0.55).toFixed(3) + ')');
      g.addColorStop(0.85, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (alpha * 0.2).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r * 1.15, 0, Math.PI * 2);   /* 少し外側までにじませる */
      ctx.fill();
    }
    /* カリグラフィスタンプ: 斜め45°の楕円ニブ・蛍光ペン風の均一塗り
       alphaは固定・縁のフェードなし・端はhard */
    function stampCalligraphy(x, y, w, inkHex, alpha) {
      var rgb = hex2rgb(inkHex);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 4);
      /* 蛍光ペン: 均一濃度・不透明度中（source-overで同色重ねても濃くならない特性はcompositeで担保） */
      ctx.fillStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.72)';
      ctx.beginPath();
      /* 楕円ニブ・短径をやや太くしてマーカー感 */
      ctx.ellipse(0, 0, w / 2, Math.max(1.8, w * 0.36), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    function stamp(x, y, w, inkHex, alpha) {
      if (pen === 'calligraphy') stampCalligraphy(x, y, w, inkHex, alpha);
      else stampFude(x, y, w, inkHex, alpha);
    }
    /* にじみブロブ（インク溜まり）— 筆で使用 */
    function blot(x, y, w, inkHex, strength) {
      var s = strength || 1;
      var r = w * 1.8 * s;
      var rgb = hex2rgb(inkHex);
      var g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (0.28 * s).toFixed(3) + ')');
      g.addColorStop(0.6, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (0.12 * s).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    /* 筆の周辺にじみ（薄く不定形に広がる痕跡）— 数スタンプに1回 */
    function bleed(x, y, w, inkHex) {
      var rgb = hex2rgb(inkHex);
      for (var i = 0; i < 3; i++) {
        var ang = Math.random() * Math.PI * 2;
        var dist = w * (0.4 + Math.random() * 0.7);
        var bx = x + Math.cos(ang) * dist;
        var by = y + Math.sin(ang) * dist;
        var br = w * (0.5 + Math.random() * 0.5);
        var g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        g.addColorStop(0, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.09)');
        g.addColorStop(1, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function begin(e) {
      if (e.button !== undefined && e.button !== 0) return;
      try { canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId); } catch (_) { /* Safari/古いWebViewは無視 */ }
      var p = clientToLocal(e);
      stroke = { last: p, v: 0, reservoir: 1.0, ink: ink, pen: pen, dwellAt: p, dwellSince: p.t, pointerId: e.pointerId, stampCount: 0 };
      ctx.save();
      /* 筆=multiply（紙に染みる）／カリグラフィ=source-over（蛍光ペンは重ねても濃くならない） */
      ctx.globalCompositeOperation = stroke.pen === 'calligraphy' ? 'source-over' : 'multiply';
      if (stroke.pen === 'fude') {
        blot(p.x, p.y, 15, stroke.ink, 1.2);      /* 起筆のインク溜まり（強め） */
      }
      stamp(p.x, p.y, stroke.pen === 'calligraphy' ? 16 : 14, stroke.ink, 0.95);
      ctx.restore();
      e.preventDefault();
    }

    function move(e) {
      if (!stroke) return;
      var isCalli = stroke.pen === 'calligraphy';
      var p = clientToLocal(e);
      var dx = p.x - stroke.last.x, dy = p.y - stroke.last.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.6) {
        /* 完全静止でもにじみ検出だけは走らせる（筆のみ・カリグラフィは蛍光ペンなのでにじまない） */
        if (!isCalli) {
          var dwellMs0 = p.t - stroke.dwellSince;
          if (dwellMs0 > 120) {
            ctx.save();
            ctx.globalCompositeOperation = 'multiply';
            blot(stroke.last.x, stroke.last.y, 10, stroke.ink, 1.0);
            ctx.restore();
            stroke.dwellSince = p.t + 200;
          }
        }
        return;
      }
      var dt = Math.max(1, p.t - stroke.last.t);
      var vInst = dist / dt;                              /* px/ms */
      stroke.v = stroke.v * 0.6 + vInst * 0.4;            /* EMA */

      var w, alpha;
      if (isCalli) {
        /* カリグラフィ = 蛍光ペン: 速度非依存の均一太さ・alpha固定・reservoir/払い/かすれなし */
        w = 16;
        alpha = 1.0;   /* stampCalligraphy側で0.72に固定 */
      } else {
        /* 筆: 速度で太さが変わる */
        var wMax = 15, wMin = 2.8, k = 0.035;
        w = Math.max(wMin, Math.min(wMax, wMax - k * stroke.v * 1000));
        /* インク残量 */
        stroke.reservoir = Math.max(0.35, stroke.reservoir - dist / 1200);
        alpha = 0.85 * stroke.reservoir;
      }
      /* ドライブラシ: 筆のみ・reservoir<0.5でランダム間引き */
      var thin = !isCalli && stroke.reservoir < 0.5 && Math.random() < (0.5 - stroke.reservoir);
      /* 停留検出（にじみ追加）— 筆のみ */
      var moved = Math.hypot(p.x - stroke.dwellAt.x, p.y - stroke.dwellAt.y);
      if (moved > 4) { stroke.dwellAt = p; stroke.dwellSince = p.t; }
      var dwellMs = p.t - stroke.dwellSince;
      ctx.save();
      ctx.globalCompositeOperation = isCalli ? 'source-over' : 'multiply';
      if (!isCalli && dwellMs > 120 && stroke.v < 0.05) {
        blot(p.x, p.y, w, stroke.ink, 1.0);
        stroke.dwellSince = p.t + 200;  /* クールダウン */
      }
      if (!thin) {
        /* 補間スタンプ（40%オーバーラップ） */
        var step = Math.max(1, w * 0.4);
        var n = Math.ceil(dist / step);
        for (var i = 1; i <= n; i++) {
          var t = i / n;
          stamp(stroke.last.x + dx * t, stroke.last.y + dy * t, w, stroke.ink, alpha);
          stroke.stampCount++;
          /* 筆のみ: 数スタンプに1回、周辺にじみを追加 */
          if (!isCalli && stroke.stampCount % 5 === 0 && stroke.reservoir > 0.5) {
            bleed(stroke.last.x + dx * t, stroke.last.y + dy * t, w, stroke.ink);
          }
        }
      }
      ctx.restore();
      stroke.last = p;
    }

    function end(e) {
      if (!stroke) return;
      /* 払い: 筆のみ・最終速度が高ければ進行方向へ2スタンプ外挿・幅急減
         カリグラフィは蛍光ペンなので払わない（均一の切れ味） */
      if (stroke.pen !== 'calligraphy' && stroke.v > 0.3) {
        var p = clientToLocal(e);
        var dx = p.x - stroke.last.x, dy = p.y - stroke.last.y;
        var len = Math.sqrt(dx * dx + dy * dy) || 1;
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        for (var i = 1; i <= 2; i++) {
          var t = i * 6;
          var w = Math.max(1.2, 5 - i * 1.6);
          stamp(stroke.last.x + (dx / len) * t, stroke.last.y + (dy / len) * t, w, stroke.ink, 0.4 * stroke.reservoir);
        }
        ctx.restore();
      }
      try {
        if (canvas.hasPointerCapture && canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      } catch (_) { /* pointercancel後・別要素にキャプチャ移動後などは無視 */ }
      stroke = null;
    }

    /* touch-actionはcssで制御 */
    var onLeave = function (e) { if (stroke) end(e); };
    canvas.addEventListener('pointerdown', begin);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('pointerleave', onLeave);

    return {
      setInk: function (v) { ink = v; },
      setPen: function (v) { pen = v; },
      clear: function () {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      },
      resize: resize,
      canvas: canvas,
      detach: function () {
        canvas.removeEventListener('pointerdown', begin);
        canvas.removeEventListener('pointermove', move);
        canvas.removeEventListener('pointerup', end);
        canvas.removeEventListener('pointercancel', end);
        canvas.removeEventListener('pointerleave', onLeave);
      }
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
        if (a === 'clear') engine.clear();
        else if (a === 'save') savePng(canvas, {
          paper: meta.paper, name: colorData.name, romaji: colorData.romaji, hex: colorData.hex
        }, colorData.slug || colorData.romaji);
      }
    };
    container.addEventListener('click', onClick);

    /* 閉じるボタンはコアのregisterDialogが処理する（fude.js内でハンドリングしない） */

    return {
      detach: function () {
        container.removeEventListener('click', onClick);
        window.removeEventListener('resize', onWinResize);
        if (ro) ro.disconnect();
        engine.detach();
      },
      resize: engine.resize
    };
  }

  window.NoctaFude = { mount: mount };
})();
