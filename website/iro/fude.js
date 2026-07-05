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
            '<button type="button" class="fude-pen" role="radio" aria-checked="false" data-pen="fude">筆</button>' +
            '<button type="button" class="fude-pen active" role="radio" aria-checked="true" data-pen="calligraphy">カリグラフィ</button>' +
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
    var ink = initialInk;
    var pen = 'calligraphy';   /* v5: デフォルトをカリグラフィに */
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

    /* 筆スタンプ v6b: 実線コア + 縁のソフトフェードの2層構造（さらに強化）
       - 内側 (半径 w/2 * 0.92): ほぼ全径を均一濃度の実線に → 送り中の存在感を最大化
       - 外側 (半径 w/2 * 0.92 〜 w/2 * 1.25): 徐々にフェード → 縁のにじみ感 */
    function stampFude(x, y, w, inkHex, alpha) {
      var rgb = hex2rgb(inkHex);
      var coreR = w / 2 * 0.92;
      var outerR = w / 2 * 1.25;
      /* 内側コア（実線・ほぼ不透明で送り中の太さを担保） */
      ctx.fillStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (alpha * 0.95).toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(x, y, coreR, 0, Math.PI * 2);
      ctx.fill();
      /* 外側の縁フェード（にじみ感） */
      var g = ctx.createRadialGradient(x, y, coreR, x, y, outerR);
      g.addColorStop(0, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (alpha * 0.6).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, outerR, 0, Math.PI * 2);
      ctx.fill();
    }
    /* カリグラフィスタンプ: 斜め45°の平ペン（扁平楕円ニブ）
       v5: 「本物のカリグラフィ」の物理特性 — ニブを扁平化（5:1比）することで、
       動く方向に応じて線の太さが自然に変わる:
         - ニブ短軸方向(左上→右下, 逆斜め)に動かす → 太い線
         - ニブ長軸方向(右上→左下)に動かす → 細い線
         - 水平/垂直方向 → 中間の太さ
       これがカリグラフィ書体の美しさの本質。ユーザーは自由に動かせる。 */
    function stampCalligraphy(x, y, w, inkHex, alpha) {
      var rgb = hex2rgb(inkHex);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.85)';
      ctx.beginPath();
      /* 5:1の扁平楕円 — 平ペンの物理特性で方向依存の線幅変化を生む */
      ctx.ellipse(0, 0, w / 2, Math.max(1.5, w * 0.20), 0, 0, Math.PI * 2);
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
      stroke = { last: p, start: { x: p.x, y: p.y }, v: 0, reservoir: 1.0, ink: ink, pen: pen, dwellAt: p, dwellSince: p.t, pointerId: e.pointerId, stampCount: 0 };
      ctx.save();
      /* 筆=multiply（紙に染みる）／カリグラフィ=source-over（蛍光ペンは重ねても濃くならない） */
      ctx.globalCompositeOperation = stroke.pen === 'calligraphy' ? 'source-over' : 'multiply';
      if (stroke.pen === 'fude') {
        /* v6b: 起筆のインク溜まり（送りが太くなったので相対的にやや控えめ） */
        blot(p.x, p.y, 22, stroke.ink, 1.3);
      }
      /* 筆はwMax相当の24pxで存在感のある起筆点・カリグラフィは16pxでキュッと */
      stamp(p.x, p.y, stroke.pen === 'calligraphy' ? 16 : 24, stroke.ink, 0.95);
      ctx.restore();
      stroke.recentDirs = [];    /* v7: 払いの向き安定化用の方向履歴 */
      e.preventDefault();
    }

    function move(e) {
      if (!stroke) return;
      var isCalli = stroke.pen === 'calligraphy';
      var p = clientToLocal(e);
      var dx = p.x - stroke.last.x, dy = p.y - stroke.last.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      /* v5: 45°方向スナップは撤去（なぞりを阻害するため）。
         代わりにカリグラフィペンのニブを扁平化することで、動く方向に応じて
         線の太さが自然に変わる本物の平ペン特性（stampCalligraphy側）を活用する。
         斜めに動かせば太い線、水平/垂直だと細い線が自然に出る。 */
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
      /* v7: 直近5点の進行方向を保持（endの払いで平均方向として使う・向き安定化） */
      if (stroke.recentDirs) {
        stroke.recentDirs.push({ ux: dx / dist, uy: dy / dist });
        if (stroke.recentDirs.length > 5) stroke.recentDirs.shift();
      }

      var w, alpha;
      if (isCalli) {
        /* カリグラフィ = 蛍光ペン: 速度非依存の均一太さ・alpha固定・reservoir/払い/かすれなし */
        w = 16;
        alpha = 1.0;   /* stampCalligraphy側で0.72に固定 */
      } else {
        /* 筆: 「入り太・送り太・抜き細」の三段構成を実現（v6b: さらに太く）
             wMax 24px: 起筆と送りで存在感のある太い線
             wMin 15px: 速度が上がっても細くなりすぎない
             k 0.008:   速度依存を弱める */
        var wMax = 24, wMin = 15, k = 0.008;
        w = Math.max(wMin, Math.min(wMax, wMax - k * stroke.v * 1000));
        stroke.reservoir = Math.max(0.75, stroke.reservoir - dist / 5000);
        alpha = 0.95 * stroke.reservoir;
      }
      /* ドライブラシ: 筆のみ・reservoir<0.6でランダム間引き（v3: 発動条件を緩和） */
      var thin = !isCalli && stroke.reservoir < 0.6 && Math.random() < (0.6 - stroke.reservoir);
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
      /* 払い（はらい）— 筆のみ・書道の「収筆」を表現
         v7強化: 直近5点の平均方向で払いを外挿し、向きを安定化。
         尾を長く（〜120px）、送り太→抜き細の二重テーパー、筆先の揺らぎで浮遊感。 */
      if (stroke.pen !== 'calligraphy' && stroke.v > 0.2 && stroke.recentDirs && stroke.recentDirs.length > 0) {
        /* 直近5点の平均方向（ノイズに強い） */
        var avgUx = 0, avgUy = 0;
        stroke.recentDirs.forEach(function (d) { avgUx += d.ux; avgUy += d.uy; });
        avgUx /= stroke.recentDirs.length; avgUy /= stroke.recentDirs.length;
        var mag = Math.sqrt(avgUx * avgUx + avgUy * avgUy);
        if (mag > 0.01) {
          var ux = avgUx / mag, uy = avgUy / mag;
          var nx = -uy, ny = ux;                  /* 揺らぎ用の法線 */
          /* 尾の長さは速度に応じて（速いほど長く伸ばす）*/
          var tailLen = Math.min(120, 30 + stroke.v * 100);
          var steps = 8;
          /* 起点は送り幅と連続 */
          var w0 = 22;
          ctx.save();
          ctx.globalCompositeOperation = 'multiply';
          for (var i = 1; i <= steps; i++) {
            var frac = i / steps;
            /* 距離は非線形（前半緩やか・後半加速）で自然な尾の伸び */
            var t = tailLen * Math.pow(frac, 1.15);
            /* 幅テーパー: 起点22→最終0.6px（消える） */
            var wFade = Math.pow(1 - frac, 1.5);
            var w = Math.max(0.6, w0 * wFade);
            /* 濃度フェード: 最終は0付近 */
            var aFade = Math.pow(1 - frac, 1.7);
            /* 筆先が浮く揺らぎ（後半ほど大きく揺れる・穂先の割れ感） */
            var jitter = frac * 5;
            var jx = (Math.random() - 0.5) * jitter;
            var jy = (Math.random() - 0.5) * jitter;
            var px = stroke.last.x + ux * t + nx * jx;
            var py = stroke.last.y + uy * t + ny * jy;
            stamp(px, py, w, stroke.ink, 0.9 * stroke.reservoir * aFade);
          }
          ctx.restore();
        }
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

    function clearNow() {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
    return {
      setInk: function (v) { ink = v; },
      setPen: function (v) { pen = v; },
      clear: clearNow,
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
      setTimeout(function () { engine.clear(); }, duration * 0.5);
      /* アニメ完了時にクラスを外す */
      setTimeout(function () {
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
        setTimeout(function () { el.innerHTML = ''; }, 500);
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
        engine.detach();
      },
      resize: engine.resize
    };
  }

  window.NoctaFude = { mount: mount };
})();
