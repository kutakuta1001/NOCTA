/**
 * NOCTA Ichi — 咲かせる（hana）
 * なぞった軌跡に手続き花が芽吹き、庭が育つ。押し花としてPNG保存。
 * Hare fude.js の対称版（Canvas 2D・ストローク距離サンプリング＋スタンプ＋保存）。
 * 提供: window.NoctaHana.mount(container, opts) → { detach }
 */
(function () {
  'use strict';

  /* 季節パレット: 花びら候補色・花芯色・淡い地色 */
  var SEASONS = {
    spring: { petals: ['#F7CAC9', '#F4A6C0', '#FBE3E8'], core: '#E8B923', ground: '#FBF3F1' },
    summer: { petals: ['#4E5EA8', '#7FA8D8', '#E8F0FF'], core: '#F2ECE0', ground: '#EEF3FA' },
    autumn: { petals: ['#E17A47', '#C0395B', '#E8B923'], core: '#7B1113', ground: '#F7EDE2' },
    winter: { petals: ['#FFFFFF', '#E8E0D0', '#D6E4EE'], core: '#B8B4AE', ground: '#F4F2EC' }
  };

  function makeRng(seed) {
    var s = (seed >>> 0) || 1;
    return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  }
  function hashSeed(str) {
    var h = 2166136261 >>> 0; str = String(str || '');
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function easeOutCubic(t) { var u = 1 - t; return 1 - u * u * u; }
  function hexToRgb(hex) {
    var h = String(hex).replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
  }
  function rgba(c, a) { return 'rgba(' + Math.round(c.r) + ',' + Math.round(c.g) + ',' + Math.round(c.b) + ',' + a + ')'; }
  function mixRgb(a, b, t) { return { r: a.r+(b.r-a.r)*t, g: a.g+(b.g-a.g)*t, b: a.b+(b.b-a.b)*t }; }
  /* {r,g,b} → "#rrggbb"。deriveSeededPalette と press() の退色パレット生成で共用する。 */
  function toHex(c) { return '#' + [c.r, c.g, c.b].map(function (v) { return ('0' + Math.max(0, Math.min(255, Math.round(v))).toString(16)).slice(-2); }).join(''); }
  /* シード花用パレット: accentHex(その花の代表色)を主色にした派生3色パレット。
     ground/core は季節基準(seasonName)のまま流用し、和紙地・花芯の統一感を保つ。 */
  function deriveSeededPalette(accentHex, seasonName) {
    var base = SEASONS[seasonName] || SEASONS.spring;
    var a = hexToRgb(accentHex);
    var lighten = mixRgb(a, { r: 255, g: 255, b: 255 }, 0.28);
    var tint = mixRgb(a, hexToRgb(base.ground), 0.45);
    return { petals: [accentHex, toHex(lighten), toHex(tint)], core: base.core, ground: base.ground };
  }
  function shouldSpawn(distAccum, step) { return distAccum >= step; }
  /* 漢数字の日付（押し花に「七月七日」と添える・今日だけの景色を留める） */
  var KANJI_NUM = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  function kanjiNum(n) {
    n = Math.floor(n);
    if (!(n >= 1 && n <= 31)) return String(n);   /* 月日想定の範囲外は算用数字にフォールバック */
    if (n <= 10) return KANJI_NUM[n];
    if (n < 20) return '十' + KANJI_NUM[n - 10];
    return KANJI_NUM[Math.floor(n / 10)] + '十' + (n % 10 ? KANJI_NUM[n % 10] : '');
  }
  function kanjiDate(m, d) { return kanjiNum(m) + '月' + kanjiNum(d) + '日'; }
  var FORMS = ['sakura', 'kiku', 'tulip', 'komori'];
  function pickForm(rng) { return FORMS[Math.floor(rng() * FORMS.length) % FORMS.length]; }

  /* 花びら1枚を中心から放射方向に描く（涙形をベジェで） */
  function petal(ctx, len, wid) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(wid, -len * 0.4, wid, -len * 0.85, 0, -len);
    ctx.bezierCurveTo(-wid, -len * 0.85, -wid, -len * 0.4, 0, 0);
    ctx.closePath();
  }
  /* 形→花びら枚数。drawFlower と createGarden(加齢の maxShed 算出)で共用する。 */
  var FORM_COUNTS = { sakura: 5, kiku: 14, tulip: 4, komori: 5, star: 5, layered: 8, bell: 6 };
  function petalCount(form) { return FORM_COUNTS[form] || 5; }
  function drawFlower(ctx, o) {
    var bloom = Math.max(0, Math.min(1, o.bloom));
    if (bloom <= 0.001) return;
    var vigor = (typeof o.vigor === 'number') ? o.vigor : 1;   /* 0=速い/淡, 1=遅い/豊か */
    var depth = (typeof o.depth === 'number') ? o.depth : 0;   /* 0=手前, 1=奥 */
    var r = o.r * (0.35 + 0.65 * bloom) * (1 - depth * 0.4);
    var pal = o.palette, rng = o.rng || makeRng(1);
    var baseA = (0.60 + 0.32 * vigor) * (1 - depth * 0.45);    /* 豊か/手前ほど濃い */
    var ground = hexToRgb(pal.ground);
    var form = o.form;
    var n = petalCount(form);
    var openAng = (0.55 + 0.45 * bloom);
    var shed = (typeof o.shed === 'number' && o.shed > 0) ? Math.min(o.shed, n - 1) : 0;  /* 最低1枚は残す */
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate(o.rot || 0);
    if (o.leaves && o.leaves.length) {
      var greenBase = { r: 0x6E, g: 0x7A, b: 0x55 };   /* セージグリーン */
      for (var li = 0; li < o.leaves.length; li++) {
        var lf = o.leaves[li];
        ctx.save();
        ctx.rotate(lf.ang);
        ctx.scale(openAng, openAng);
        var ll = r * (lf.len || 1.2);
        var lg = ctx.createLinearGradient(0, 0, 0, -ll);
        lg.addColorStop(0, rgba(greenBase, 0.82));
        lg.addColorStop(1, rgba(mixRgb(greenBase, ground, 0.5), 0.42));
        ctx.fillStyle = lg;
        petal(ctx, ll, ll * 0.32);                 /* しずく形の葉 */
        ctx.fill();
        ctx.strokeStyle = rgba(mixRgb(greenBase, { r: 0, g: 0, b: 0 }, 0.25), 0.4);
        ctx.lineWidth = Math.max(0.5, ll * 0.02);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -ll * 0.9); ctx.stroke();  /* 葉脈 */
        ctx.restore();
      }
    }
    if (depth > 0.5) { ctx.shadowColor = rgba(hexToRgb(pal.petals[0]), 0.5); ctx.shadowBlur = r * 0.5; } /* 奥は柔らかく */
    for (var i = 0; i < n - shed; i++) {
      ctx.save();
      ctx.rotate((i / n) * Math.PI * 2);
      ctx.scale(openAng, openAng);
      /* 花びら毎の色ゆらぎ（ベタ感の解消） */
      var baseCol = hexToRgb(pal.petals[Math.floor(rng() * pal.petals.length) % pal.petals.length]);
      var jitter = (rng() - 0.5) * 24;
      var pc = { r: baseCol.r + jitter, g: baseCol.g + jitter * 0.6, b: baseCol.b + jitter * 0.4 };
      var len = (form === 'kiku') ? r * 1.25 : (form === 'tulip') ? r * 1.05 : r;
      /* 付け根=濃 → 先端=淡・地色寄り・低alpha（光の透過感） */
      var grad = ctx.createLinearGradient(0, 0, 0, -len);
      grad.addColorStop(0, rgba(pc, baseA));
      grad.addColorStop(0.6, rgba(pc, baseA * 0.92));
      grad.addColorStop(1, rgba(mixRgb(pc, ground, 0.55), baseA * 0.38));
      ctx.fillStyle = grad;
      if (form === 'kiku') { petal(ctx, r * 1.25, r * 0.12); }
      else if (form === 'tulip') { petal(ctx, r * 1.05, r * 0.42); }
      else if (form === 'komori') { ctx.beginPath(); ctx.arc(0, -r * 0.6, r * 0.42, 0, Math.PI * 2); }
      else if (form === 'star') { petal(ctx, r * 1.15, r * 0.16); }               /* 尖った細弁 */
      else if (form === 'bell') { petal(ctx, r * 1.3, r * 0.30); }                /* 細長く反る弁 */
      else if (form === 'layered') { ctx.beginPath(); ctx.arc(0, -r * 0.55, r * 0.4, 0, Math.PI * 2); } /* 丸弁(外層) */
      else { petal(ctx, r, r * 0.34); }
      ctx.fill();
      if (form === 'sakura') { ctx.fillStyle = rgba(ground, baseA * 0.9); ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * 0.09, -r * 0.8); ctx.lineTo(-r * 0.09, -r * 0.8); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    }
    ctx.shadowBlur = 0;
    if (form === 'layered') {
      var inner = 5;
      for (var j = 0; j < inner; j++) {
        ctx.save();
        ctx.rotate((j / inner) * Math.PI * 2 + Math.PI / inner);   /* 外層と半ピッチずらす */
        ctx.scale(openAng * 0.62, openAng * 0.62);
        var ic = hexToRgb(pal.petals[Math.floor(rng() * pal.petals.length) % pal.petals.length]);
        var ig = ctx.createLinearGradient(0, 0, 0, -r * 0.7);
        ig.addColorStop(0, rgba(ic, baseA)); ig.addColorStop(1, rgba(mixRgb(ic, ground, 0.5), baseA * 0.5));
        ctx.fillStyle = ig; ctx.beginPath(); ctx.arc(0, -r * 0.45, r * 0.34, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }
    /* 花芯: 中心明→縁濃のラジアル */
    var coreR = r * (form === 'kiku' ? 0.28 : 0.2);
    var core = hexToRgb(pal.core);
    var cg = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR);
    cg.addColorStop(0, rgba(mixRgb(core, { r: 255, g: 255, b: 255 }, 0.4), 1));
    cg.addColorStop(1, rgba(core, 1));
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(0, 0, coreR, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  /* kind別の描画ディスパッチ。o.kind が undefined/'flower' なら花(drawFlower)、
     それ以外は草花の緑（sprig/fern/umbel/floret）へ分岐する。
     呼び出し規約は drawFlower と同一シグネチャ(ctx, o)で、5関数すべてが同一の
     自己完結型: 各drawerが内部でctx.save()+translate(o.x,o.y)+rotate(o.rot||0)+描画+
     ctx.restore()を行う。呼び出し側(drawEntity・redraw)はtranslate/rotateしない。
     flower経路は drawFlower をそのまま呼ぶだけなので挙動は完全に不変。 */
  function drawEntity(ctx, o) {
    var k = o.kind;
    if (!k || k === 'flower') { drawFlower(ctx, o); return; }
    if (k === 'sprig')  { drawSprig(ctx, o);  return; }
    if (k === 'fern')   { drawFern(ctx, o);   return; }
    if (k === 'umbel')  { drawUmbel(ctx, o);  return; }
    if (k === 'floret') { drawFloret(ctx, o); return; }
    drawFlower(ctx, o);   /* 未知kindは花にフォールバック */
  }

  var GREEN = { r: 0x6E, g: 0x7A, b: 0x55 };   /* セージグリーン（葉と共通） */
  /* 草花の緑グラデーション（付け根=濃→先端=淡・地色寄り）。leaves(drawFlower内)と同じ配色則。
     ground は呼び出し側が palette から hexToRgb 済みで渡す（drawFlower の leaves 描画と同じ取得方法）。 */
  function greenGrad(ctx, len, ground) {
    var g = ctx.createLinearGradient(0, 0, 0, -len);
    g.addColorStop(0, rgba(GREEN, 0.82));
    g.addColorStop(1, rgba(mixRgb(GREEN, ground, 0.5), 0.42));
    return g;
  }
  /* 草・つる(sprig)。o = {x, y, r, rot, bloom, palette, rng}。drawFlowerと同一の
     自己完結型: 内部でctx.save()+translate(o.x,o.y)+rotate(o.rot||0)+描画+ctx.restore()
     を行う。呼び出し側はtranslate/rotateしない（drawFern/drawUmbel/drawFloretも同一規約）。 */
  function drawSprig(ctx, o) {
    var rng = o.rng, open = easeOutCubic(Math.min(1, o.bloom || 0)), r = o.r;
    if (open < 0.02) return;
    var ground = hexToRgb(o.palette.ground);
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate(o.rot || 0);
    var segs = 5 + Math.floor(rng() * 3);
    var segLen = (r * 1.7 / segs) * open;
    var curve = (rng() - 0.5) * 0.45;
    var ang = -Math.PI / 2 + (rng() - 0.5) * 0.4, px = 0, py = 0;
    var pts = [{ x: 0, y: 0 }];
    for (var s = 0; s < segs; s++) { ang += curve; px += Math.cos(ang) * segLen; py += Math.sin(ang) * segLen; pts.push({ x: px, y: py }); }
    ctx.strokeStyle = rgba(mixRgb(GREEN, ground, 0.15), 0.7);
    ctx.lineWidth = Math.max(0.6, r * 0.045);
    ctx.beginPath(); ctx.moveTo(0, 0);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    for (var j = 1; j < pts.length; j++) {
      var side = (j % 2 === 0) ? 1 : -1;
      var lang = Math.atan2(pts[j].y - pts[j - 1].y, pts[j].x - pts[j - 1].x) + side * 1.05;
      var ll = r * 0.30 * open * (0.7 + rng() * 0.5);
      ctx.save();
      ctx.translate(pts[j].x, pts[j].y); ctx.rotate(lang - Math.PI / 2);  /* petalは-y向き→枝に沿わせる */
      ctx.fillStyle = greenGrad(ctx, ll, ground);
      petal(ctx, ll, ll * 0.42); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  /* シダ(fern)。羽状フロンド。o = {x, y, r, rot, bloom, palette, rng}。drawSprigと
     同一の自己完結型規約（save/translate(o.x,o.y)/rotate(o.rot||0)/描画/restore）。
     2026-07-08 磨き: 旧実装は各対の左右2小葉を `sd*1.15 - Math.PI/2` で回転させていたが、
     この -Math.PI/2 オフセットにより両小葉が同じ側(左)へ偏り、上下に交互反転する
     「ねじれ縄」状に見えるバグがあった(sd=+1で左上・sd=-1で左下を向く＝左右非対称)。
     petal()は既定で中軸方向(-y="上")を向くため、回転角はオフセットなしの sd*pinnaAng
     のみで良い(sd=+1→右上, sd=-1→左上に鏡映)。pinnaAngは中軸に対して50〜70°
     (基部=70°寄りで開き気味・先端=50°寄りで中軸に沿う)で先細りの自然な羽状フロンドにする。 */
  function drawFern(ctx, o) {
    var rng = o.rng, open = easeOutCubic(Math.min(1, o.bloom || 0)), r = o.r;
    if (open < 0.02) return;
    var ground = hexToRgb(o.palette.ground);
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate(o.rot || 0);
    var len = r * 1.8 * open;
    ctx.strokeStyle = rgba(mixRgb(GREEN, ground, 0.1), 0.7);
    ctx.lineWidth = Math.max(0.6, r * 0.04);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -len); ctx.stroke();   /* 中軸rachis */
    var pairs = 8 + Math.floor(rng() * 3);   /* 8〜10対: 細かい間隔で先端を滑らかに尖らせる */
    var spacing = len / (pairs + 1);
    for (var p = 1; p <= pairs; p++) {
      var t = p / (pairs + 1);
      var y = -len * t;
      /* 先端ほど小さい小葉。隣の対と団子にならないよう間隔(spacing)基準の上限も掛ける。 */
      var plBase = Math.min(r * 0.5 * (1 - t * 0.72), spacing * 1.5) * open;
      /* 中軸から50〜70°(基部70°寄り→先端50°寄りへ線形に狭める)+個体差の揺らぎ少量。 */
      var pinnaAng = (1.222 - 0.349 * t) + (rng() - 0.5) * 0.10;
      for (var sd = -1; sd <= 1; sd += 2) {
        /* 左右・対ごとに長さをわずかに揺らす(±14%)。全対が完全に相似だと造花的に見えるため、
           野生のシダらしい不揃いさを加える(過剰にならない範囲・spacing上限は既にpl側で確保済み)。 */
        var pl = plBase * (0.86 + rng() * 0.28);
        ctx.save();
        ctx.translate(0, y);
        ctx.rotate(sd * pinnaAng);   /* 中軸に対して左右対称に上外向き(オフセット無し) */
        ctx.fillStyle = greenGrad(ctx, pl, ground);
        petal(ctx, pl, pl * 0.26); ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
  }

  /* レースフラワー(umbel)。散形花序を半球状に広げる。o = {x, y, r, rot, bloom, palette, rng}。
     drawSprigと同一の自己完結型規約。 */
  function drawUmbel(ctx, o) {
    var rng = o.rng, open = easeOutCubic(Math.min(1, o.bloom || 0)), r = o.r;
    if (open < 0.02) return;
    var ground = hexToRgb(o.palette.ground);
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate(o.rot || 0);
    var rays = 9 + Math.floor(rng() * 6);
    var rad = r * 1.1 * open;
    var stem = rgba(mixRgb(GREEN, ground, 0.2), 0.5);
    var tipCol = rgba(mixRgb(GREEN, { r: 0xF0, g: 0xEA, b: 0xD8 }, 0.55), 0.8);  /* 生成り寄りの小花 */
    ctx.strokeStyle = stem; ctx.lineWidth = Math.max(0.4, r * 0.02);
    for (var i = 0; i < rays; i++) {
      var a = -Math.PI / 2 + (i / rays) * Math.PI * 2 * 0.5 - Math.PI * 0.25;  /* 半球状に広げる */
      a += (rng() - 0.5) * 0.25;
      var rr = rad * (0.7 + rng() * 0.4);
      var ex = Math.cos(a) * rr, ey = Math.sin(a) * rr;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.fillStyle = tipCol;
      ctx.beginPath(); ctx.arc(ex, ey, Math.max(0.6, r * 0.05), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  /* 小花の群れ(floret)。花色は palette.accent を優先し、無ければ palette.petals[0]
     にフォールバックする（SEASONS/deriveSeededPaletteのパレットは.accentを持たないため）。
     o = {x, y, r, rot, bloom, palette, rng}。drawSprigと同一の自己完結型規約。 */
  function drawFloret(ctx, o) {
    var rng = o.rng, open = easeOutCubic(Math.min(1, o.bloom || 0)), r = o.r;
    if (open < 0.02) return;
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate(o.rot || 0);
    var acc = hexToRgb(o.palette.accent || o.palette.petals[0]);
    var n = 3 + Math.floor(rng() * 4);
    for (var f = 0; f < n; f++) {
      var fx = (rng() - 0.5) * r * 1.4, fy = (rng() - 0.5) * r * 1.4;
      var fr = r * 0.22 * open * (0.7 + rng() * 0.5);
      ctx.save(); ctx.translate(fx, fy);
      var petals = 5;
      ctx.fillStyle = rgba(mixRgb(acc, { r: 0xF0, g: 0xEA, b: 0xD8 }, 0.25), 0.85);
      for (var pp = 0; pp < petals; pp++) {
        ctx.save(); ctx.rotate((pp / petals) * Math.PI * 2);
        petal(ctx, fr, fr * 0.5); ctx.fill(); ctx.restore();
      }
      ctx.fillStyle = rgba(mixRgb(acc, { r: 0xC4, g: 0x94, b: 0x2A }, 0.4), 0.9);  /* 芯 */
      ctx.beginPath(); ctx.arc(0, 0, fr * 0.28, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  var MAX_FLOWERS = 400, STEP = 26;   /* 距離サンプリング間隔(px) */
  function createGarden(canvas, opts) {
    opts = opts || {};
    var reduce = !!opts.reduce;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var seed = opts.seed || null;          /* {form,accentColor,seasonName,name} 指定時はその花で固定 */
    var seasonName = seed ? (seed.seasonName || 'spring') : (opts.season || 'spring');
    /* seed時のパレットは1回だけ導出しクロージャに保持（redraw毎の再生成を避ける） */
    var seededPalette = seed ? deriveSeededPalette(seed.accentColor, seasonName) : null;
    function currentPalette() { return seed ? seededPalette : SEASONS[seasonName]; }
    var flowers = [];        /* {x,y,r,baseRot,form,seed,bornT,dur,depth,vigor,swayPhase,swayW,holdMs,shed,nextShedT,maxShed} */
    var rafId = null, running = false;
    var seedCounter = 1;
    var lastPressLabel = '';   /* 直近press()のラベル文字列(テスト用snapshotLabel()の裏付け) */
    var farewelling = false, farewellT = 0, lastFrameT = 0, farewellTimer = null;
    var petals = [];              /* 落下花びらパーティクル(無常) */
    var fastAge = !!opts.__fastAge;  /* テスト短縮用: 本番未使用 */
    var lastAgeT = 0;
    var PART_MAX = 120;
    var GUST_MAX = 180;   /* clear()の突風バーストは通常の落下花びら上限(PART_MAX)より多く許容する */
    var gustUntil = 0;    /* 突風バースト中は自生(ambientSprout)を止める猶予(下のmaybeSprout参照) */
    /* 風の一吹き: 16〜34秒(テスト短縮時は約1.2秒)に一度、庭全体がそよぎ、
       加齢期の花から花びらが数枚舞う。reduce/farewell時は発火しない(redraw側で判定)。 */
    var wind = { until: 0, start: 0, dir: 1, strength: 0 };
    var nextWindT = 0; var fastWind = !!opts.__fastWind;  /* テスト短縮用: 本番未使用 */
    function scheduleWind(t) { nextWindT = t + (fastWind ? 1200 : (16000 + Math.random() * 18000)); }

    /* 庭の自生: 放置してもゆっくり芽吹く。「充実度」(flowers.length)がFILL_TARGETに
       達したら止まる（引き算・無限増殖しない）。芽吹きは大輪級/中サイズの花・緑/floretの
       大小混合で無音(onSpawn不呼び)。Phase2g: 画面いっぱいの構成にするためFILL_TARGET=44
       (旧RESTING_COUNT=28)に拡張し、芽吹く要素に大輪級(r70-100)を混ぜてサイズの強弱を出す。
       rAFが止まっていても起こす必要があるため、待機はrAFでなくsetTimeoutで行う
       (sproutTimer)。redraw内にも同じ判定の保険発火を置き、rAFが既に回っている間は
       そちら経由でも発火し得るが、nextSproutTの前進をmaybeSprout冒頭で必ず行うため
       二重発火はしない。 */
    var FILL_TARGET = 44;
    /* Phase2g Task2: 庭の充実度=fillRatio。reduceでは常に0固定(背景は移ろわず暗いまま)。
       redraw毎に再計算し、直近にopts.onFillへ通知した値(lastFillRatio)と変わった時だけ
       再通知する(要素の増減=spawn/ambientSprout/clearの後、次のkick駆動フレームで自然に発火)。 */
    var lastFillRatio = 0;
    function currentFillRatio() { return reduce ? 0 : Math.min(1, flowers.length / FILL_TARGET); }
    var nextSproutT = 0, sproutTimer = null;
    var fastGrow = !!opts.__fastGrow;  /* テスト短縮用: 本番未使用 */
    var noSprout = !!opts.__noSprout;  /* テスト専用: 自生を完全に無効化(粒子減衰など自生と無関係な検証の隔離用)。本番未使用 */
    /* Phase2f: 自生をアイドル駆動に。最後の操作(タップ/なぞり)からIDLE_MSが経つまでは芽吹かず、
       経過後はSPROUT_MIN〜SPROUT_MIN+SPROUT_SPANの間隔で1つずつ増える。ポインタハンドラ
       (begin/move)が毎回lastInteractTを更新し、scheduleSprout+armSproutTimerで次回芽吹きを
       後ろ倒しする(＝操作でリセット)。lastPointerは自生の場所バイアス(ambientSprout)に使う。 */
    var IDLE_MS = fastGrow ? 400 : 3000;
    var SPROUT_MIN = fastGrow ? 400 : 3000, SPROUT_SPAN = fastGrow ? 400 : 3000;   /* 通常間隔3〜6秒 */
    var lastInteractT = now(), lastPointer = null;
    function scheduleSprout(t) { nextSproutT = t + (SPROUT_MIN + Math.random() * SPROUT_SPAN); }
    function ambientSprout() {
      var rect = canvas.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;   /* 非表示/0サイズ時は座標NaNを避け、次回タイマーに委ねる */
      /* Phase2g: 大小のリズム。大輪級を時々・中サイズの花を主に・小花/緑で隙間を埋める
         (花が主役、緑は約40%)。sizeは後段の場所バイアス(候補数/クリアランス判定)にも使う
         ため、位置決定より先に確定する。ロール判定はMath.random()を使う(候補点選びと同じ
         乱数源)。makeRng(seedCounter)は連番の小さな整数シードだと最初の1回の出力が
         シードにほぼ線形(LCGが1回転前で未混合)になり、分岐のしきい値判定に使うと
         偏りが出る(実測: 44回自生させても常に同じ帯に入り大輪級/緑が一切出なかった)。
         baseRot/form等の分岐なしの連続値は従来通りmakeRng(seedCounter)を使ってよい。 */
      var roll = Math.random();
      var kind, size;
      if (roll < 0.15) { kind = 'flower'; size = 70 + Math.random() * 30; }              /* 主役の大輪級 r70-100 */
      else if (roll < 0.60) { kind = 'flower'; size = 40 + Math.random() * 25; }          /* 中サイズの花 r40-65 */
      else { kind = ['sprig', 'fern', 'umbel', 'floret'][Math.floor(Math.random() * 4)]; size = 26 + Math.random() * 20; } /* 緑/小花 r26-46 */

      /* 全面均等配置(仕上がりの磨き込み): 旧実装は「既存flowers/lastPointerから最も遠い点」を
         採用する最遠点バイアスだったため、新要素が常に外周へ押しやられ、中央が空いたまま
         残る「暗いドーナツ」を作っていた(参考画像は中央含む画面全体に密に敷き詰まる構成)。
         ここでは画面を緩いグリッド(GRID_COLS x GRID_ROWS)に分け、既存flowersの中心が
         属するセルの個体数が最も少ないセル(複数あれば乱択)を選び、そこへ生やす場所を
         決める(＝空いている領域を優先して埋める。中央のセルも他と同じ土俵で競う)。
         使用領域(MX0-MX1×MY0-MY1)は端の見切れを避けるための余白。 */
      var MX0 = 0.05, MX1 = 0.95, MY0 = 0.06, MY1 = 0.94;
      var areaX = rect.width * (MX1 - MX0), areaY = rect.height * (MY1 - MY0);
      var GRID_COLS = 7, GRID_ROWS = 6;
      var cellW = areaX / GRID_COLS, cellH = areaY / GRID_ROWS;
      var cellCounts = new Array(GRID_COLS * GRID_ROWS);
      for (var cci = 0; cci < cellCounts.length; cci++) cellCounts[cci] = 0;
      for (var fi0 = 0; fi0 < flowers.length; fi0++) {
        var of0 = flowers[fi0];
        var relX = (of0.x - rect.width * MX0) / areaX, relY = (of0.y - rect.height * MY0) / areaY;
        var col0 = Math.min(GRID_COLS - 1, Math.max(0, Math.floor(relX * GRID_COLS)));
        var row0 = Math.min(GRID_ROWS - 1, Math.max(0, Math.floor(relY * GRID_ROWS)));
        cellCounts[row0 * GRID_COLS + col0]++;
      }
      var minCellCount = Math.min.apply(null, cellCounts);
      var leastCells = [];
      for (var cci2 = 0; cci2 < cellCounts.length; cci2++) { if (cellCounts[cci2] === minCellCount) leastCells.push(cci2); }

      /* セル内での場所バイアス: 最小個体数のセルが複数あるとき、そのうち1つに固定して候補を
         引くと「たまたま選ばれたセルの近くに大輪が既にある」という不運で強い重なりを
         受け入れてしまう。候補ごとに毎回leastCellsから乱択することで、タイの全セルへ
         候補が分散し、既存flowers/lastPointerからのクリアランス(縁-縁の距離=中心間距離-
         両者の半径)が最大の候補を採用できる(＝「全面へ均等に広がる」(最小セル限定)と
         「団子状に重ならない・余白を保つ」(縁-縁クリアランス最大化)を両立)。大きい要素は
         団子になりやすいため候補数を増やす(小:5→6・大:12→14)。 */
      var isBig = size >= 70;
      var candidateN = isBig ? 14 : 6;
      var best = null, bestClear = -Infinity;
      for (var ci = 0; ci < candidateN; ci++) {
        var cell = leastCells[Math.floor(Math.random() * leastCells.length)];
        var cellCx = rect.width * MX0 + (cell % GRID_COLS + 0.5) * cellW;
        var cellCy = rect.height * MY0 + (Math.floor(cell / GRID_COLS) + 0.5) * cellH;
        var cx = cellCx + (Math.random() - 0.5) * cellW * 1.3;
        var cy = cellCy + (Math.random() - 0.5) * cellH * 1.3;
        cx = Math.max(rect.width * (MX0 - 0.03), Math.min(rect.width * (MX1 + 0.03), cx));
        cy = Math.max(rect.height * (MY0 - 0.03), Math.min(rect.height * (MY1 + 0.03), cy));
        var clear = Infinity;
        for (var fi = 0; fi < flowers.length; fi++) {
          var of = flowers[fi];
          var d = Math.sqrt((of.x - cx) * (of.x - cx) + (of.y - cy) * (of.y - cy));
          clear = Math.min(clear, d - of.r - size);
        }
        if (lastPointer) {
          var pd = Math.sqrt((lastPointer.x - cx) * (lastPointer.x - cx) + (lastPointer.y - cy) * (lastPointer.y - cy));
          clear = Math.min(clear, pd - size);
        }
        if (clear > bestClear) { bestClear = clear; best = { x: cx, y: cy }; }
      }
      var x = best.x, y = best.y;
      var rng2 = makeRng(seedCounter);
      var f = {
        x: x, y: y,
        r: size,
        baseRot: rng2() * Math.PI * 2,
        form: pickForm(rng2),
        kind: kind,
        seed: seedCounter++,
        bornT: now(),
        dur: 2600,
        depth: 0.2 + rng2() * 0.4,
        vigor: 0.8,
        swayPhase: rng2() * Math.PI * 2,
        swayW: 0.0005 + rng2() * 0.0004,
        holdMs: 999999,      /* 自生要素は加齢させない(shedはkind!=='flower'なら既にスキップされる) */
        shed: 0, nextShedT: 0, maxShed: 0,
        leaves: []
      };
      flowers.push(f); if (flowers.length > MAX_FLOWERS) flowers.shift();
      /* 自生は音を鳴らさない(onSpawnを呼ばない)＝静かに芽吹く */
    }
    /* t>=nextSproutTに達したら判定する共通関数。setTimeout駆動(armSproutTimer)と
       redrawの保険発火の両方から呼ばれる。呼ばれた時点でnextSproutTを必ず前進させる
       (充実/reduce/farewelling中でも)ことで、条件不成立時にゼロ待機でタイマーが
       暴走(busy-loop)することを防ぐ。Phase2f: 到達していても最後の操作からIDLE_MS未満なら
       まだ芽吹かず、nextSproutTを「最後の操作+IDLE_MS」まで巻き戻して待つ(操作によるリセットを
       反映する。この巻き戻しは決定的でbusy-loopを起こさない)。 */
    function maybeSprout(t) {
      if (noSprout) return false;
      if (t < nextSproutT) return false;
      if (t - lastInteractT < IDLE_MS) { nextSproutT = lastInteractT + IDLE_MS; return false; }
      scheduleSprout(t);   /* 到達したら reduce/farewelling/充実中でも必ず前進(nextSproutTが過去のまま→50ms再armのbusy-loopを防ぐ) */
      if (reduce || farewelling || t < gustUntil) return false;   /* 突風バーストの直後は自生で埋まらないよう猶予を置く */
      if (flowers.length >= FILL_TARGET || flowers.length >= MAX_FLOWERS) return false;  /* 充実で停止 */
      ambientSprout();
      kick();   /* rAFが止まっていても再開させる */
      return true;
    }
    function armSproutTimer() {
      if (reduce || noSprout) return;   /* reduce/自生無効では張らない */
      if (flowers.length >= FILL_TARGET) { if (sproutTimer) { clearTimeout(sproutTimer); sproutTimer = null; } return; }   /* 完成して落ち着いた庭ではタイマーを止める(静けさ・省電力。tap/clear/redraw保険で再開) */
      /* Phase2f: ポインタ操作からも呼ばれるようになったため、既存のチェーンを必ず先に解除して
         から張り直す(解除しないと操作の度に別チェーンが並走し、二重発火/タイマーリークになる)。 */
      if (sproutTimer) { clearTimeout(sproutTimer); sproutTimer = null; }
      var delay = Math.max(50, nextSproutT - now());
      sproutTimer = setTimeout(function () {
        sproutTimer = null;
        maybeSprout(now());
        armSproutTimer();
      }, delay);
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      redraw();
    }
    function now() { return (typeof performance !== 'undefined' ? performance.now() : Date.now()); }

    function redraw() {
      var rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      var t = now();
      /* Phase2g Task2: fillRatioが変わった時だけmount側(.hana-stage背景)へ通知する。 */
      var fr = currentFillRatio();
      if (fr !== lastFillRatio) { lastFillRatio = fr; if (opts.onFill) { try { opts.onFill(fr); } catch (_) {} } }
      if (!reduce && !farewelling && flowers.length > 0 && t >= nextWindT) {
        wind.start = t; wind.until = t + 2500; wind.dir = Math.random() < 0.5 ? -1 : 1;
        wind.strength = 0.6 + Math.random() * 0.4;
        scheduleWind(t);
        /* 加齢期の花から最大5輪、花びらを1枚余分に舞わせる（風方向へ強めのドリフト） */
        var blown = 0;
        for (var wi = 0; wi < flowers.length && blown < 5; wi++) {
          var wf = flowers[wi];
          if (wf.maxShed > 0 && wf.shed < wf.maxShed && petals.length < PART_MAX) {
            petals.push({ x: wf.x, y: wf.y - wf.r * 0.4, vx: wind.dir * (0.05 + Math.random() * 0.04), vy: 0.015 + Math.random() * 0.015,
              rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.006, r: wf.r * 0.42,
              color: currentPalette().petals[0], bornT: t, life: 2800 });
            wf.shed++; blown++;
          }
        }
        /* umbel(種穂)から種を放つ。開花(bloom>0.6)済みのumbelのみ・1回の風で最大3個(seeds<3)。
           種は緑/生成りの小粒パーティクル(kind:'seed')として petals 配列を共用する
           (落下花びらとは描画時にkindで分岐して区別する。下の落下花びら描画ループ参照)。 */
        var seeds = 0;
        for (var si = 0; si < flowers.length && seeds < 3; si++) {
          var sf = flowers[si];
          if (sf.kind !== 'umbel') continue;
          var sBloom = Math.min(1, easeOutCubic((t - sf.bornT) / sf.dur));
          if (sBloom > 0.6 && petals.length < PART_MAX && Math.random() < 0.5) {
            petals.push({
              x: sf.x, y: sf.y - sf.r * 0.5, vx: wind.dir * (0.3 + Math.random() * 0.4), vy: -0.1 + Math.random() * 0.2,
              rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.01, r: 1.4 + Math.random() * 1.2,
              color: mixRgb(GREEN, { r: 0xF0, g: 0xEA, b: 0xD8 }, 0.5), kind: 'seed', bornT: t, life: 2600
            });
            seeds++;
          }
        }
        if (opts.onWind) { try { opts.onWind(); } catch (_) {} }
      }
      /* 庭の自生の保険発火: rAFが既に回っている間はここでも判定する
         (主経路はrAF停止時にも起こせるsetTimeout駆動のarmSproutTimer)。 */
      maybeSprout(t);
      var windAmt = 0;
      if (t < wind.until) {
        var wp = (t - wind.start) / 2500;                     /* 0..1 */
        windAmt = Math.sin(Math.PI * Math.min(1, wp)) * wind.strength;  /* ease in-out */
      }
      /* 描画は奥(depth大)から。保持はFIFO配列のまま、描画時だけdepth降順のコピーを使う
         （保持順を崩さないことで容量超過時の間引きが「最古を削除」で正しく働く） */
      var order = flowers.slice().sort(function (a, b) { return b.depth - a.depth; });
      function computeBloom(f) {
        if (farewelling) return Math.max(0, 1 - (t - farewellT) / 800);   /* 退場: 1→0 */
        return reduce ? 1 : Math.min(1, easeOutCubic((t - f.bornT) / f.dur));
      }
      /* 明地補正(Phase2g Task2): fillRatio(地の明るさ)が高いほど、花が明るい生成りの地に
         沈んで見えなくなるのを防ぐ。drawFlower本体は不変のまま、花を描く前にredraw側で
         ごく薄い暖色の接地影を敷く(押し花標本の台紙に落ちる影に近い質感)。
         地色lerp(applyStageBg)がまだ暗い側(fr<=0.5・outer地色の輝度が中間グレーに届く前)は
         そもそも沈む問題が起きないため、compは0のまま=描かない(既存の暗い庭を1ピクセルも
         変えない。少数の花だけを咲かせる既存の画素面積テスト群もこの安全マージンで無傷)。
         花が密集するとcanvas描画は「重なるほど濃くなる」ため、影を花ごとに個別のfill()で
         重ねると密集部だけ不自然に黒ずむ(実測で確認)。1本のPathにまとめ1回のfill()で
         合成することで、重なりがあっても濃さが積み重ならないようにする(nonzero winding
         によるunion)。緑(sprig/fern/umbel/floret)は線的な描画のため影を敷くと不自然な塊に
         見えるので花(kind未設定/'flower')のみに適用する。 */
      /* Phase2polish: applyStageBg側の地色lerpをeaseOutCubic駆動に変えた(下記参照)ため、
         "地が実際に明るくなるタイミング"もeaseOutCubic(fr)基準に合わせる(旧来の生fr基準の
         ままだと、地はもう明るいのに沈み補正がまだ無効という時間差が生じる)。 */
      var stageComp = Math.max(0, (easeOutCubic(fr) - 0.5) * 2);   /* eased(fr)<=0.5:0 → eased(fr)=1:1 */
      if (stageComp > 0.001) {
        var shadowAny = false;
        ctx.beginPath();
        for (var shi = 0; shi < order.length; shi++) {
          var shf = order[shi];
          if (shf.kind && shf.kind !== 'flower') continue;
          if (computeBloom(shf) <= 0.05) continue;
          var scx = shf.x + shf.r * 0.5, scy = shf.y + shf.r * 0.20;
          ctx.moveTo(scx, scy);   /* 直前の楕円からの連結線を防ぐ(ellipse()開始点に明示moveTo) */
          ctx.ellipse(shf.x, scy, shf.r * 0.5, shf.r * 0.24, 0, 0, Math.PI * 2);
          shadowAny = true;
        }
        if (shadowAny) {
          ctx.save();
          ctx.globalAlpha = Math.min(0.18, stageComp * 0.20);
          ctx.fillStyle = 'rgb(58,46,30)';
          ctx.fill();
          ctx.restore();
        }
      }
      for (var i = 0; i < order.length; i++) {
        var f = order[i];
        var bloom = computeBloom(f);
        /* kind係数: umbel(種穂)は軽く大きく・sprig/fernは中程度・その他(花)は従来通り揺れる。
           既存の風項(windAmt*0.2*wind.dir*(1-depth*0.6))にのみ乗ずる(微風の常時sin項は不変)。 */
        var swayK = (f.kind === 'umbel') ? 1.6 : (f.kind === 'sprig' || f.kind === 'fern') ? 1.2 : 1.0;
        var sway = reduce ? 0 : (0.035 * Math.sin(t * f.swayW + f.swayPhase) + windAmt * 0.2 * wind.dir * (1 - f.depth * 0.6) * swayK); /* A-5 微風 + 風の一吹き */
        if (fastWind) f.lastSway = sway;   /* テスト用(fastWind時のみ): 直近フレームのsway値を保持(本番の描画ホットパスは触らない・kind別揺れ差の検証用) */
        /* 加齢＝花びらを1枚ずつ落とす（無常）。reduce時は行わない。
           緑(kind!=='flower')は花びらを持たないため加齢/散り(shed)対象から除外する
           （maxShedが0のまま固定され、風の一吹きの舞い散り判定(wf.maxShed>0)も自然にスキップされる）。 */
        if (!reduce && !farewelling && (!f.kind || f.kind === 'flower')) {
          if (f.maxShed === 0) f.maxShed = Math.max(1, Math.floor(petalCount(f.form) * 0.4));
          var age0 = f.bornT + f.dur + f.holdMs;    /* 加齢開始時刻 */
          if (t >= age0 && f.shed < f.maxShed && t >= f.nextShedT) {
            if (petals.length < PART_MAX) {
              var pcol = currentPalette().petals[0];
              petals.push({
                x: f.x, y: f.y - f.r * 0.5, vx: (Math.random() - 0.5) * 0.02,
                vy: 0.02 + Math.random() * 0.02, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.004,
                r: f.r * 0.42, color: pcol, bornT: t, life: 2500
              });
            }
            f.shed++;
            f.nextShedT = t + (fastAge ? 250 : (2500 + Math.random() * 3000));
          }
        }
        /* 明地での発色補正(脱濁り): 地色が明るいほど(stageComp>0)、半透明の花弁が重なる部分が
           灰色く滲みやすい(薄い色を何重にも重ねるほど彩度が落ちる)。drawFlower本体(不変)への
           入力であるvigorをこの時だけ僅かに引き上げ(最大+0.3)、1枚あたりの不透明度
           (baseA)をわずかに濃くして重なりでも花の発色が沈まないようにする。stageComp=0
           (地がまだ暗い間)ではf.vigorのまま=完全不変。 */
        drawEntity(ctx, {
          x: f.x, y: f.y, r: f.r, rot: f.baseRot + sway, bloom: bloom,
          form: f.form, palette: currentPalette(), rng: makeRng(f.seed),
          vigor: Math.min(1, f.vigor + stageComp * 0.3), depth: f.depth, shed: f.shed, leaves: f.leaves, kind: f.kind
        });
      }
      /* 落下花びらパーティクル */
      var dt = lastAgeT ? Math.min(100, t - lastAgeT) : 16; lastAgeT = t;
      for (var pi = petals.length - 1; pi >= 0; pi--) {
        var q = petals[pi];
        var qage = t - q.bornT;
        if (qage >= q.life) { petals.splice(pi, 1); continue; }
        q.vy += 0.00002 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.rot += q.vr * dt;
        var qa = (1 - qage / q.life) * 0.85;
        ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot);
        if (q.kind === 'seed') {
          /* 種: 小さな円点で描く。q.color は既に{r,g,b}オブジェクト(rgba()文字列ではない)。
             既存花びら(下のelse分岐)はcolorがhex文字列(palette由来)のため、分岐せず共用すると
             hexToRgbが破綻する — kindで完全に分離することで既存花びらの見た目を1px変えない。 */
          ctx.fillStyle = rgba(q.color, qa);
          ctx.beginPath(); ctx.arc(0, 0, q.r, 0, Math.PI * 2); ctx.fill();
        } else {
          var qc = hexToRgb(q.color);
          var qg = ctx.createLinearGradient(0, 0, 0, -q.r);
          qg.addColorStop(0, rgba(qc, qa)); qg.addColorStop(1, rgba(qc, qa * 0.3));
          ctx.fillStyle = qg; petal(ctx, q.r, q.r * 0.34); ctx.fill();
        }
        ctx.restore();
      }
    }
    /* 非reduceで庭に要素があれば常時30fpsループ(A-5微風=呼吸するそよぎ)。これはPhase2aからの
       意図的な仕様で、Phase2eの自生はユーザー操作なしでも庭を要素ありにしうるため、開いている間は
       ループが継続する。電池コストは「Ichiビューを開いている間」に限定され、detachで停止・reduceでは
       needLoop=falseで即停止する(下記)。 */
    function needLoop() {
      if (farewelling) return true;                 /* 退場アニメ中は回す */
      if (reduce) return false;                     /* reduce: 即満開・微風なし → 1描画で停止(省電力) */
      return flowers.length > 0 || petals.length > 0;  /* 非reduce: 花か落下花びらがあれば継続 */
    }
    function loop() {
      var t = now();
      if (t - lastFrameT >= 33) { lastFrameT = t; redraw(); }  /* 約30fpsスロットル */
      if (needLoop()) { rafId = requestAnimationFrame(loop); } else { running = false; rafId = null; }
    }
    function kick() { if (!running) { running = true; lastFrameT = 0; rafId = requestAnimationFrame(loop); } else { /* 継続中 */ } }

    function spawn(x, y, speed) {
      var rng = makeRng(seedCounter);
      var vmax = 2.2;
      var vigor = 1 - Math.min(1, speed / vmax);      /* 遅い=1(豊か) / 速い=0(淡) */
      var depth = rng();                              /* 0..1 空気遠近 */
      var f = {
        x: x, y: y,
        r: (14 + vigor * 22) * (0.6 + rng() * 1.0),   /* 遅い=大の傾向＋大小のランダム揺らぎ(×0.6〜1.6) */
        baseRot: rng() * Math.PI * 2,
        form: seed ? seed.form : pickForm(rng),
        seed: seedCounter++,
        bornT: now(),
        dur: 1500,                                    /* B-2 呼吸テンポ(開花を緩める) */
        depth: depth,
        vigor: vigor,
        swayPhase: rng() * Math.PI * 2,
        swayW: 0.0006 + rng() * 0.0006,                /* 微風の角速度(rad/ms) */
        holdMs: (fastAge ? 600 : (12000 + rng() * 10000)),   /* 満開後この時間で加齢開始 */
        shed: 0, nextShedT: 0, maxShed: 0             /* maxShedはredraw初回に n*0.4 で確定 */
      };
      var leafN = (rng() < 0.5) ? (rng() < 0.4 ? 2 : 1) : 0;   /* 約半数に1〜2枚 */
      f.leaves = [];
      for (var lk = 0; lk < leafN; lk++) {
        f.leaves.push({ ang: (lk === 0 ? 2.35 : -2.35) + (rng() - 0.5) * 0.5, len: 1.05 + rng() * 0.5 });
      }
      /* なぞりミックス: 花が主役・約35%を緑に混ぜる。速いなぞり(speed大)は軽い緑(sprig/umbel)、
         遅いなぞりは緑4種(sprig/fern/floret/umbel)均等。speed===0(タップ・invite招待の最初の
         一点)は常に花のまま固定する — 「なぞり」時にのみ混ぜるという意図に合わせるとともに、
         タップ単発spawnの決定的なrng消費列（既存の風/加齢/長押しテスト群が前提にしている）を
         変えないため。 */
      var kind = 'flower';
      if (speed > 0) {
        var gr = rng();
        if (gr < 0.35) {
          var fast = speed > 0.6;
          if (fast) kind = (rng() < 0.5) ? 'sprig' : 'umbel';
          else      kind = ['sprig', 'fern', 'floret', 'umbel'][Math.floor(rng() * 4)];
        }
      }
      f.kind = kind;
      /* FIFO保持（描画順は redraw 側で depth ソート）。容量超過時は最古(先頭)を削除。
         depth順に挿入して shift すると新規花自身が消え得るバグを避けるため push+shift にする。 */
      flowers.push(f);
      if (flowers.length > MAX_FLOWERS) flowers.shift();
      if (opts.onSpawn) { try { opts.onSpawn(f); } catch (_) {} }
      kick();
    }

    /* 長押しで大輪（taika）: 動かさず600ms待つと、その場に特別大きな一輪(通常の花の約3〜4倍・
       旧spawnGrand比で約2倍に拡大・2026-07-07)が、葉を添えてゆっくり(3500ms)開く。
       「遅さの報酬」の極致。move で8px超動くとキャンセル。 */
    var holdTimer = null, holdPos = null;
    function clearHold() { if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; } holdPos = null; }
    function spawnGrand(x, y) {
      var rng = makeRng(seedCounter);
      var r = 82 + rng() * 22;
      /* 大輪は花弁・葉が r*1.2〜1.3 まで伸びるため、画面端/ツールバー際でクリップされないよう
         ローカル座標系(rect.width/height)でクランプする。r は確定済みの値を使う。 */
      var rect = canvas.getBoundingClientRect();
      /* 実効margin: 極小/0幅canvasでも上限<下限で枠外に飛ばないよう rect の半分で頭打ち(中央寄せ)。 */
      var mx = Math.min(r * 1.35, rect.width / 2);
      var my = Math.min(r * 1.35, rect.height / 2);
      x = Math.max(mx, Math.min(rect.width - mx, x));
      y = Math.max(my, Math.min(rect.height - my, y));
      var f = { x: x, y: y,
        r: r, baseRot: rng() * Math.PI * 2,
        form: seed ? seed.form : pickForm(rng), seed: seedCounter++,
        bornT: now(), dur: 3500, depth: 0, vigor: 1,
        swayPhase: rng() * Math.PI * 2, swayW: 0.0005 + rng() * 0.0004,
        holdMs: (fastAge ? 600 : (20000 + rng() * 10000)), shed: 0, nextShedT: 0, maxShed: 0 };
      f.leaves = [{ ang: 2.3, len: 1.25 }, { ang: -2.3, len: 1.15 }];
      flowers.push(f); if (flowers.length > MAX_FLOWERS) flowers.shift();
      if (opts.onSpawn) { try { opts.onSpawn(f); } catch (_) {} }
      kick();
    }

    /* pointer 操作 */
    var drawing = false, last = null, accum = 0;
    function local(e) { var r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, t: (e.timeStamp || now()) }; }
    function begin(e) {
      clearHold();   /* マルチタッチ/連続入力で前の長押しタイマーが残らないよう先に解除 */
      drawing = true; var p = local(e); last = p; accum = 0;
      /* Phase2f: タップ/なぞり開始も「操作」として自生のアイドルタイマーを後ろ倒しする。
         lastPointerは自生の場所バイアス(ambientSprout)がタップ位置を避けるために使う。 */
      lastInteractT = now(); lastPointer = { x: p.x, y: p.y };
      scheduleSprout(lastInteractT); armSproutTimer();
      spawn(p.x, p.y, 0);
      if (canvas.setPointerCapture) { try { canvas.setPointerCapture(e.pointerId); } catch (_) {} }
      holdPos = { x: p.x, y: p.y };
      holdTimer = setTimeout(function () { if (holdPos) spawnGrand(holdPos.x, holdPos.y); clearHold(); }, 600);
    }
    function move(e) {
      if (!drawing) return;
      var p = local(e), dx = p.x - last.x, dy = p.y - last.y, d = Math.sqrt(dx * dx + dy * dy);
      /* Phase2f: なぞり中は(実際にspawnへ届く距離未満の細かい動きでも)操作中とみなし、
         アイドルタイマーをリセットし続ける。 */
      lastInteractT = now(); lastPointer = { x: p.x, y: p.y };
      scheduleSprout(lastInteractT); armSproutTimer();
      if (holdPos) { var hdx = p.x - holdPos.x, hdy = p.y - holdPos.y; if (hdx * hdx + hdy * hdy > 64) clearHold(); }
      if (d < 0.0001) { last = p; return; }
      var dt = Math.max(1, p.t - last.t), speed = d / dt;
      /* last→p を STEP 間隔で線形補間して花を置く（軌跡に沿って等間隔に咲かせる）。
         同一座標への積み重なり（速い/粗いストロークで団子になる）を防ぐ。fude.js のスタンプ補間と同法。
         accum は「前回spawnからの残距離(0..STEP)」。この区間の最初のspawnは need=STEP-accum の位置。 */
      var ux = dx / d, uy = dy / d;
      var effStep = STEP * (1 + Math.min(1.6, speed * 0.9));   /* 速いほど間隔広=まばら */
      var need = effStep - accum;
      if (need > d) { accum += d; last = p; return; }
      var s = need;
      while (s <= d) { spawn(last.x + ux * s, last.y + uy * s, speed); s += effStep; }
      accum = d - (s - effStep);
      last = p;
    }
    function end() { drawing = false; last = null; clearHold(); }

    canvas.addEventListener('pointerdown', begin);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('pointerleave', end);
    var onWinResize = function () { resize(); };
    window.addEventListener('resize', onWinResize);
    /* 風の初回スケジュールは初回描画(resize内のredraw)より前に行う。
       後だと nextWindT=0 のまま最初の redraw が走り、開いた瞬間に風が発火してしまう。
       自生(nextSproutT)も同じ理由で先に予約してから、setTimeout駆動のタイマーを張る。 */
    scheduleWind(now());
    scheduleSprout(now());
    armSproutTimer();
    resize();

    return {
      setSeason: function (name) { if (seed) return; if (SEASONS[name]) { seasonName = name; redraw(); } },
      /* 真っさらにする＝強い突風。reduce時は即時に空へ(演出なし・音のみ任意)。
         非reduce時は全要素を風向きへ弾き飛ばす: 花は花びらのバースト粒子(既存の落下花びらと
         同じ色型=hex文字列。下のredrawの粒子描画のelse分岐でhexToRgb()される)、
         緑(sprig/fern/floret/umbel)は種と同じ{r,g,b}緑の円粒子(kind:'seed'。if分岐でrgba()に
         直接渡る)になって流れる。flowersは即空にする(=庭はこの瞬間から見た目上も空)。
         粒子はredrawの既存ループ(寿命life経過で自然消滅)に乗るだけで、新しい消去処理は増やさない。 */
      clear: function () {
        var t = now();
        /* 「真っさらにする」も操作: アイドル基準を更新し、クリア後はIDLE_MS待ってから自生が戻る(クリア直後の静けさ)。
           armSproutTimer は flowers を空にした後に呼ぶ(満杯ガードに阻まれず再arm＝満杯からのクリアでも自生が戻る)。 */
        lastInteractT = t; scheduleSprout(t);
        if (reduce) {
          flowers = []; petals = []; redraw();
          if (opts.onGust) { try { opts.onGust(); } catch (_) {} }
          return;
        }
        var dir = (Math.random() < 0.5) ? 1 : -1;
        wind.dir = dir; wind.strength = 1; wind.start = t; wind.until = t + 1800;
        gustUntil = t + 2200;   /* バースト粒子(最大life約2100ms)が消え切るまで自生を止める */
        for (var gi = 0; gi < flowers.length && petals.length < GUST_MAX; gi++) {
          var gf = flowers[gi];
          var isGreen = !!(gf.kind && gf.kind !== 'flower');
          var burst = isGreen ? 2 : 3;
          for (var gb = 0; gb < burst && petals.length < GUST_MAX; gb++) {
            petals.push({
              x: gf.x + (Math.random() - 0.5) * gf.r, y: gf.y - gf.r * 0.4,
              vx: dir * (0.6 + Math.random() * 0.7), vy: -0.15 + Math.random() * 0.35,
              rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.02,
              r: gf.r * (isGreen ? 0.3 : 0.42),
              color: isGreen ? GREEN : currentPalette().petals[0],
              kind: isGreen ? 'seed' : undefined,
              bornT: t, life: 1600 + Math.random() * 500
            });
          }
        }
        flowers = [];                                     /* 花は吹き飛んだ→即座に空。粒子だけが流れて消える */
        armSproutTimer();                                  /* 空にしてから再arm(満杯ガードを抜ける)→クリア後IDLE_MS待って自生が再開 */
        if (opts.onGust) { try { opts.onGust(); } catch (_) {} }
        kick();                                            /* rAFを起こして粒子アニメを進める */
      },
      /* 押し花にする＝庭の要素から標本ボードを自動構成する。
         (1)生成りbeige地+紙ノイズ (2)代表選抜(花5・緑fern/umbel5・floret4・つるsprig3・上限17)を
         余白マージン付き6x4グリッドへ決定的乱数で再配置(重なり回避) (3)palette退色
         (4)隅にラベル("<花名/季節> の 標本 · <漢数字日付>")。戻り値・呼び出し側は不変。
         乱数seedは庭状態由来(各花のseed/kind/r)で決定的: 同じ庭→同じ標本、庭が変われば構成も変わる。 */
      press: function () {
        var rect = canvas.getBoundingClientRect();
        var w = Math.round(rect.width), h = Math.round(rect.height);
        var out = document.createElement('canvas'); out.width = w; out.height = h;
        var octx = out.getContext('2d');

        /* (1) 生成りbeige地のグラデーション + ごく薄い紙ノイズ */
        var bgGrad = octx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#E4D9C4'); bgGrad.addColorStop(1, '#DCC8AC');
        octx.fillStyle = bgGrad; octx.fillRect(0, 0, w, h);
        var noiseRng = makeRng(hashSeed('paper-noise-' + w + 'x' + h) || 1);
        var noiseN = Math.round((w * h) / 900);
        for (var ni = 0; ni < noiseN; ni++) {
          var na = 0.02 + noiseRng() * 0.05;
          octx.fillStyle = 'rgba(120,104,78,' + na.toFixed(3) + ')';
          octx.beginPath();
          octx.arc(noiseRng() * w, noiseRng() * h, 0.5 + noiseRng() * 0.9, 0, Math.PI * 2);
          octx.fill();
        }

        /* (2) 代表選抜: 花(大きい順5・うち2輪は主役サイズ)・緑(fern/umbel5)・floret(小花4)・
           sprig(つる。標本の縁や要素間に流れをつくる・3本)。合計上限17
           (CEO提示の押し花標本参考画像"BLOOM MAISON"系に寄せ、旧上限14→要素を増やし、
           旧maxR比0.40均一→主役の花は0.55〜0.7まで許容し強弱を付ける・2026-07-08磨き)。 */
        /* 庭状態由来の決定的seed(時刻non-determinismを排除): 同じ庭を押せば同じ標本・庭が変われば構成も変わる(一回性)。 */
        var gardenSig = flowers.map(function (f) { return f.seed + ':' + (f.kind || 'flower') + ':' + Math.round(f.r); }).join('|');
        var boardSeed = hashSeed('press-board-' + (seed ? seed.name : seasonName) + '-' + gardenSig);
        var brng = makeRng(boardSeed || 1);
        function sampleN(list, n) {
          var arr = list.slice(), m = Math.min(n, arr.length);
          for (var i = 0; i < m; i++) {
            var j = i + Math.floor(brng() * (arr.length - i));
            var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
          }
          return arr.slice(0, m);
        }
        var flowerList = flowers.filter(function (f) { return !f.kind || f.kind === 'flower'; }).slice().sort(function (a, b) { return b.r - a.r; });
        var greenList = flowers.filter(function (f) { return f.kind === 'fern' || f.kind === 'umbel'; });
        var floretList = flowers.filter(function (f) { return f.kind === 'floret'; });
        var sprigList = flowers.filter(function (f) { return f.kind === 'sprig'; });
        var pickedFlowers = flowerList.slice(0, 5);
        var pickedGreen = sampleN(greenList, 5);
        var pickedFloret = sampleN(floretList, 4);
        var pickedSprig = sampleN(sprigList, 3);
        var primary = pickedFlowers.concat(pickedGreen, pickedFloret);   /* 描画前に手前(花)/奥(緑)の順へ並べ替える */

        /* 退色パレット: 花色・花芯を灰みの暖色へ18%寄せる。ground も新しい生成り地へ
           差し替える(内部の"先端=淡・地色寄り"グラデーションが新しい地に馴染むよう)。 */
        var FADE_TARGET = { r: 0xB0, g: 0xA8, b: 0x98 }, FADE_T = 0.18;
        var basePal = currentPalette();
        var boardGround = toHex(mixRgb(hexToRgb('#E4D9C4'), hexToRgb('#DCC8AC'), 0.5));
        var pressedPal = {
          petals: basePal.petals.map(function (hex) { return toHex(mixRgb(hexToRgb(hex), FADE_TARGET, FADE_T)); }),
          core: toHex(mixRgb(hexToRgb(basePal.core), FADE_TARGET, FADE_T)),
          ground: boardGround
        };

        /* (2) 配置: 余白マージン付き6x4グリッド(24セル・上限17要素→約7割充填。旧4x4=16セルより
           密度を上げつつ、セル数>要素数の余りで「構成された標本」らしい余白を保つ)。セルを
           決定的乱数でシャッフルし、primary→sprigの順に別セルを割り当てる。要素を大きくした分、
           隣接セルへジッタが越境して重なるリスクを、ペア間最小距離を保証する分離パス(幾何補正
           のみ・新規乱数なし=決定性維持)で吸収する。 */
        var cols = 6, rows = 4;
        var sideMargin = w * 0.09, topMargin = h * 0.09, bottomMargin = h * 0.16;
        var aw = Math.max(1, w - sideMargin * 2), ah = Math.max(1, h - topMargin - bottomMargin);
        var cellW = aw / cols, cellH = ah / rows;
        var cellMin = Math.min(cellW, cellH);
        function cellCenter(idx) {
          var col = idx % cols, row = Math.floor(idx / cols);
          return { x: sideMargin + cellW * (col + 0.5), y: topMargin + cellH * (row + 0.5) };
        }
        var cellIdx = []; for (var ci = 0; ci < cols * rows; ci++) cellIdx.push(ci);
        for (var si = cellIdx.length - 1; si > 0; si--) {
          var sj = Math.floor(brng() * (si + 1)); var stmp = cellIdx[si]; cellIdx[si] = cellIdx[sj]; cellIdx[sj] = stmp;
        }
        var maxR = cellMin * 0.70;         /* 主役の花はここまで許容(旧0.40均一→強弱を付ける) */
        var heroCount = Math.min(2, pickedFlowers.length);   /* 先頭2輪(=庭で最大)を主役サイズに */
        var boardEls = [];
        for (var pi = 0; pi < primary.length; pi++) {
          var pf = primary[pi], pc = cellCenter(cellIdx[pi]);
          var sizeRatio;
          if (pi < heroCount) sizeRatio = 0.58 + brng() * 0.12;                        /* 主役の花: 0.58〜0.70 */
          else if (pf.kind === 'fern' || pf.kind === 'umbel') sizeRatio = 0.30 + brng() * 0.14;  /* 緑: 中〜小 */
          else if (pf.kind === 'floret') sizeRatio = 0.22 + brng() * 0.10;             /* floret(小花塊): 小 */
          else sizeRatio = 0.40 + brng() * 0.12;                                        /* 花(非主役): 中 */
          boardEls.push({
            x: pc.x + (brng() - 0.5) * cellW * 0.32, y: pc.y + (brng() - 0.5) * cellH * 0.32,
            r: Math.min(cellMin * sizeRatio, maxR), rot: brng() * Math.PI * 2,
            kind: pf.kind, form: pf.form, palette: pressedPal, rng: makeRng(pf.seed),
            bloom: 1, vigor: 1, depth: 0, shed: 0, leaves: pf.leaves || [],
            layer: (pf.kind === 'fern' || pf.kind === 'umbel') ? 0 : (pf.kind === 'floret' ? 1 : 2)
          });
        }
        /* 重なり回避(最小距離維持): ブロブ要素(花/緑/floret)同士のみ対象(つるは細い線で
           要素間を跨いで流れるのが意図のため対象外)。決定的な幾何補正を数回反復するのみ。 */
        for (var ov = 0; ov < 3; ov++) {
          for (var ai = 0; ai < boardEls.length; ai++) {
            for (var bi = ai + 1; bi < boardEls.length; bi++) {
              var elA = boardEls[ai], elB = boardEls[bi];
              var ddx = elB.x - elA.x, ddy = elB.y - elA.y;
              var dist = Math.sqrt(ddx * ddx + ddy * ddy) || 0.01;
              var minDist = (elA.r + elB.r) * 0.72;   /* 押し花らしい軽い重なりは残す(0.72) */
              if (dist < minDist) {
                var push = (minDist - dist) / 2, ux = ddx / dist, uy = ddy / dist;
                elA.x -= ux * push; elA.y -= uy * push;
                elB.x += ux * push; elB.y += uy * push;
              }
            }
          }
        }
        for (var ci2 = 0; ci2 < boardEls.length; ci2++) {
          var be = boardEls[ci2];   /* 分離パスで枠外へ押し出されないようマージン内へ再クランプ */
          be.x = Math.max(sideMargin + be.r, Math.min(w - sideMargin - be.r, be.x));
          be.y = Math.max(topMargin + be.r, Math.min(topMargin + ah - be.r, be.y));
        }
        var boardCx = w / 2, boardCy = topMargin + ah * 0.5;
        var maxRSprig = cellMin * 1.15;   /* つるは細線なので隣接セルへ流れるよう長めに許容 */
        for (var vi = 0; vi < pickedSprig.length; vi++) {
          var sIdx = primary.length + vi;
          if (sIdx >= cellIdx.length) break;
          var vf = pickedSprig[vi], vc = cellCenter(cellIdx[sIdx]);
          var dx = boardCx - vc.x, dy = boardCy - vc.y;
          /* drawSprigの初期成長方向(局所-Y)をboard中心へ向ける回転角(軽くジッタ)。 */
          var vrot = Math.atan2(dx, -dy) + (brng() - 0.5) * 0.4;
          boardEls.push({
            x: vc.x, y: vc.y, r: Math.min(Math.max(vf.r, cellMin * 0.85), maxRSprig) * (0.9 + brng() * 0.3), rot: vrot,
            kind: 'sprig', form: vf.form, palette: pressedPal, rng: makeRng(vf.seed),
            bloom: 1, vigor: 1, depth: 0, shed: 0, leaves: [], layer: -1
          });
        }
        boardEls.sort(function (a, b) { return a.layer - b.layer; });   /* つる/緑→floret→花の順に描く */
        for (var ei = 0; ei < boardEls.length; ei++) drawEntity(octx, boardEls[ei]);

        /* 退色の沈み: 全体にごく薄い暖灰を上掛け(彩度・明度をわずかに下げる) */
        octx.save(); octx.globalAlpha = 0.05; octx.fillStyle = '#6b5f4a'; octx.fillRect(0, 0, w, h); octx.restore();
        /* 細い枠 */
        octx.strokeStyle = 'rgba(60,54,42,0.22)'; octx.lineWidth = Math.max(1, w * 0.003);
        octx.strokeRect(w * 0.025, h * 0.025, w * 0.95, h * 0.95);

        /* (4) ラベル（季節または花の名前）＋漢数字の日付＋署名。
           seed時は花の名で「薔薇 の 標本 · 七月七日」、非seedは季節で「春 の 標本 · 七月七日」。 */
        var labels = { spring: '春', summer: '夏', autumn: '秋', winter: '冬' };
        var today = new Date();
        var dateLabel = kanjiDate(today.getMonth() + 1, today.getDate());
        var head = (seed && seed.nameJa) ? seed.nameJa : (labels[seasonName] || '');
        lastPressLabel = head + ' の 標本 · ' + dateLabel;
        octx.fillStyle = 'rgba(40,36,30,0.68)';
        octx.font = '600 ' + Math.round(w * 0.026) + 'px "Shippori Mincho","EB Garamond",serif';
        octx.textAlign = 'left'; octx.textBaseline = 'bottom';
        octx.fillText(lastPressLabel, w * 0.06, h * 0.955);
        octx.textAlign = 'right';
        octx.fillText('Ichi', w * 0.94, h * 0.955);
        return out.toDataURL('image/png');
      },
      /* テスト用: 直近press()のラベル文字列(実挙動には影響しない) */
      snapshotLabel: function () { return lastPressLabel; },
      snapshotCount: function () { return flowers.length; },
      /* テスト用: 庭の充実度(花+緑の総数)。自生(自然芽吹き)がFILL_TARGETで頭打ちすることの観測用。 */
      entityCount: function () { return flowers.length; },
      /* Phase2g Task2: 庭の充実度(0..1)。mount側が.hana-stage背景の暗→生成りlerpに使う他、
         テスト観測用にも公開する。redrawのlastFillRatio(スロットル済みの通知値)ではなく
         常に最新値を返す(呼び出し直後の状態を即座に取得できるようにする)。 */
      fillRatio: function () { return currentFillRatio(); },
      /* テスト用: 各要素の座標とkind(flower/緑)のスナップショット。自生の場所バイアス
         (既存要素・直近の操作位置から離れた場所を選ぶこと)を座標レベルで検証するための
         直接的な観測手段。 */
      snapshotPositions: function () { return flowers.map(function (f) { return { x: f.x, y: f.y, kind: f.kind || 'flower' }; }); },
      /* テスト用: 各要素のr(サイズ)のスナップショット。Phase2g: 自生に大輪級/中/小の強弱が
         出ていることを検証するための直接的な観測手段(実挙動には影響しない)。 */
      snapshotSizes: function () { return flowers.map(function (f) { return f.r; }); },
      /* テスト用: 少なくとも1枚花びらを落とした花の数(加齢/風どちらの契機でもshed>0になったもの)。
         風発火の舞う枚数上限を検証するための直接的な観測手段（面積の間接推定より確実）。 */
      shedFlowerCount: function () { return flowers.filter(function (f) { return f.shed > 0; }).length; },
      /* テスト用: 現在のパーティクル総数(落下花びら+種)。 */
      particleCount: function () { return petals.length; },
      /* テスト用: 種パーティクル(kind==='seed'。umbelが風で放つ)の数。 */
      seedParticleCount: function () { return petals.filter(function (p) { return p.kind === 'seed'; }).length; },
      /* テスト用: 直近の種パーティクル1件の色(r,g,b)。緑系であることの検証用。 */
      seedColorSample: function () {
        var s = petals.filter(function (p) { return p.kind === 'seed'; })[0];
        return s ? { r: s.color.r, g: s.color.g, b: s.color.b } : null;
      },
      invite: function () {
        var rect = canvas.getBoundingClientRect();
        spawn(rect.width / 2, rect.height * 0.5, 0);
        flowers[flowers.length - 1].dur = 2500;   /* 招待はさらにゆっくり */
      },
      farewell: function (done) {
        if (farewelling) return;                                   /* 再入ガード(二重doneを防ぐ) */
        if (reduce || flowers.length === 0) { if (done) done(); return; }
        farewelling = true; farewellT = now(); kick();
        farewellTimer = setTimeout(function () {
          /* 退場完了: 花を消し、状態を戻す。閉じずに再利用されても清浄な空庭に戻る
             （farewellingが立ちっぱなしだと新規花が二度と描かれない不具合を防ぐ） */
          farewellTimer = null;
          flowers = []; petals = []; farewelling = false;
          if (done) done();
        }, 820);
      },
      detach: function () {
        running = false; if (rafId) cancelAnimationFrame(rafId);
        clearHold();
        /* farewell待ち中に別経路(ESC等)でdetachされた場合、遅延callbackが後から
           走って古いdoneが発火しないようタイマーを解除する */
        if (farewellTimer) { clearTimeout(farewellTimer); farewellTimer = null; }
        /* 自生のsetTimeoutチェーン(sproutTimer)も確実に解除する(幽霊タイマー防止) */
        if (sproutTimer) { clearTimeout(sproutTimer); sproutTimer = null; }
        canvas.removeEventListener('pointerdown', begin);
        canvas.removeEventListener('pointermove', move);
        canvas.removeEventListener('pointerup', end);
        canvas.removeEventListener('pointercancel', end);
        canvas.removeEventListener('pointerleave', end);
        window.removeEventListener('resize', onWinResize);
      }
    };
  }

  /* 咲かせるビュー（canvas＋ツールバー）を container 内に構築する */
  function buildUi(container) {
    container.innerHTML =
      '<div class="hana-stage"><canvas class="hana-canvas"></canvas></div>' +
      '<div class="hana-tools" role="group" aria-label="咲かせる道具">' +
        '<div class="hana-seasons">' +
          '<button type="button" class="hana-season is-on" data-season="spring">春</button>' +
          '<button type="button" class="hana-season" data-season="summer">夏</button>' +
          '<button type="button" class="hana-season" data-season="autumn">秋</button>' +
          '<button type="button" class="hana-season" data-season="winter">冬</button>' +
        '</div>' +
        '<button type="button" class="hana-clear">真っさらにする</button>' +
        '<button type="button" class="hana-oto" aria-pressed="false">音を添える</button>' +
        '<button type="button" class="hana-press">押し花にする</button>' +
      '</div>';
  }

  /* 季節→光だまり色マップ。.hana-stage の背景を季節に連動させる。
     Phase2g Task2: 地色(暗い光の庭→明るい生成り)をfillRatioでlerpできるよう、
     完成済みrgba文字列ではなく{r,g,b,a}で保持する(下のapplyStageBgでrgba()合成)。 */
  var SEASON_GLOW = {
    spring: { r: 120, g: 70, b: 90, a: 0.40 }, summer: { r: 50, g: 70, b: 120, a: 0.40 },
    autumn: { r: 120, g: 70, b: 40, a: 0.42 }, winter: { r: 90, g: 96, b: 110, a: 0.36 }
  };
  /* 地色の暗(warm-black・旧来の唯一の地色)↔明(生成りbeige)の両端。
     mid(55%地点)はouter(100%地点)よりわずかに明るい(旧実装のrgba(14,12,9)とouter#0A0906の
     明度差=+4,+3,+3をbeige側にも保つ)。 */
  var STAGE_DARK_MID = { r: 14, g: 12, b: 9 }, STAGE_DARK_OUTER = { r: 0x0A, g: 0x09, b: 0x06 };
  var STAGE_BEIGE_MID = { r: 0xE4, g: 0xD9, b: 0xC4 }, STAGE_BEIGE_OUTER = { r: 0xDE, g: 0xD3, b: 0xBC };
  /* 庭の充実度(fillRatio 0..1)に応じ、地色を暗い光の庭→明るい生成りへlerpする。
     fillRatio省略/0では旧実装と数値上完全に同一(既存の暗い庭を1ピクセルも変えない)。

     Phase2polish（この磨き込みタスクでの変更）:
     (1) 中間の濁り解消: dark↔beigeの直線lerpは中間(fr≈0.4-0.6)で低彩度の茶灰色を長く
         通過して見える(=「茶色く濁る」)。ここでは補間パラメータにeaseOutCubic(既存関数を
         流用)をかけ、立ち上がりを早める。fr=0/1の両端はeaseOutCubic(0)=0・(1)=1により
         旧実装の値と数値上完全に一致するため、fr=0時点の不変条件は保たれる。
     (2) 中央の暗いドーナツ解消: 旧実装は地が明るくなるほど光だまり(グロー)のalphaを
         "下げて"いたため、.hana-stageの親要素の暗い地色(本番では#0A0906)が中央に
         透けて見え続けていた(fr=0では親の地色≒STAGE_DARK_OUTERなので気付かれなかった
         だけ)。ここではalphaを"回復"方向にする(fr上昇=不透明化。fr=1でグロー/mid両stopが
         完全不透明になり、親要素の暗さが一切透けない)。色が浮きすぎないようにする役割は
         alphaでなく「グローの色相を地色へ徐々に馴染ませる」側に持たせた。 */
  function applyStageBg(container, season, fillRatio) {
    var stage = container.querySelector('.hana-stage');
    if (!stage) return;
    var fr = Math.max(0, Math.min(1, fillRatio || 0));
    var glow = SEASON_GLOW[season] || SEASON_GLOW.spring;
    var te = easeOutCubic(fr);   /* te(0)=0, te(1)=1: 両端は旧実装と数値上完全に同一 */
    var mid = mixRgb(STAGE_DARK_MID, STAGE_BEIGE_MID, te);
    var outer = mixRgb(STAGE_DARK_OUTER, STAGE_BEIGE_OUTER, te);
    var glowColor = mixRgb(glow, mid, te);                /* fr=0: mixRgb(glow,mid,0)=glow(不変) / fr=1: mid完全一致(色染みを残さない) */
    var glowAlpha = glow.a + (1 - glow.a) * te;           /* fr=0: glow.a(不変) / fr=1: 1(完全不透明) */
    var midAlpha = 0.85 + 0.15 * te;                      /* fr=0: 0.85(不変) / fr=1: 1(完全不透明) */
    stage.style.background =
      'radial-gradient(ellipse 70% 60% at 50% 62%, ' + rgba(glowColor, glowAlpha) +
      ' 0%, ' + rgba(mid, midAlpha) + ' 55%, ' + rgba(outer, 1) + ' 100%)';
  }

  /* container 内に咲かせるビューを構築し { detach } を返す */
  function mount(container, opts) {
    opts = opts || {};
    var seed = opts.seed || null;    /* {form,accentColor,seasonName,name} 指定時はその花の色・形・季節で固定 */
    var reduce = opts.reduce || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    buildUi(container);
    if (seed) {
      var seasonsEl = container.querySelector('.hana-seasons');
      if (seasonsEl) seasonsEl.style.display = 'none';
    } else if (opts.season) {
      /* 非seedで初期季節が指定された場合（汎用CTAが今日の季節で開く等）、チップの is-on を同期する。
         これがないと配色は opts.season なのにハイライトと press() の季節参照が spring 固定のままになり、
         「夏の庭が『春の押し花』として保存される」等の不整合が生じる。 */
      container.querySelectorAll('.hana-season').forEach(function (b) {
        b.classList.toggle('is-on', b.getAttribute('data-season') === opts.season);
      });
    }
    /* なぞり音（oto）: デフォルトオフ・トグルonのユーザージェスチャでのみ AudioContext を生成する。
       エンジン(createGarden)は音を知らず、spawn毎に呼ばれる opts.onSpawn 経由で接続するのみ。 */
    var oto = { enabled: false, ctx: null, lastT: -1, played: 0, wind: 0, gust: 0 };  /* lastT負値: トグルON直後の最初の一音も鳴らす */
    function otoPublish() { if (typeof window !== 'undefined') window.__hanaOto = { played: oto.played, ctxCreated: !!oto.ctx, wind: oto.wind || 0, gust: oto.gust || 0 }; }
    function otoPlay(f) {
      if (!oto.enabled || !oto.ctx) return;
      var t = oto.ctx.currentTime;
      if ((t - oto.lastT) < 0.09) return;              /* 最小発音間隔90ms */
      oto.lastT = t;
      /* 鈴/水滴の間の短い減衰音。花が大きいほど低く（460〜830Hz帯） */
      var size01 = Math.max(0, Math.min(1, (f.r - 10) / 40));
      var freq = 830 - size01 * 370;
      var g = oto.ctx.createGain();
      g.gain.setValueAtTime(0.05, t);
      g.gain.exponentialRampToValueAtTime(0.0004, t + 0.5);
      g.connect(oto.ctx.destination);
      var o1 = oto.ctx.createOscillator(); o1.type = 'sine'; o1.frequency.setValueAtTime(freq, t);
      var o2 = oto.ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.setValueAtTime(freq * 2.01, t);
      var g2 = oto.ctx.createGain(); g2.gain.value = 0.25; o2.connect(g2); g2.connect(g);
      o1.connect(g);
      o1.start(t); o2.start(t); o1.stop(t + 0.55); o2.stop(t + 0.55);
      o1.onended = function () { try { o1.disconnect(); o2.disconnect(); g2.disconnect(); g.disconnect(); } catch (_) {} };
      oto.played++; otoPublish();
    }
    function otoPlayWind() {
      if (!oto.enabled || !oto.ctx) return;
      var ctx = oto.ctx, t = ctx.currentTime, dur = 1.8;
      var buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;   /* ホワイトノイズ */
      var src = ctx.createBufferSource(); src.buffer = buf;
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(520, t);
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.03, t + 0.5);          /* そよ風の立ち上がり */
      g.gain.linearRampToValueAtTime(0.0001, t + dur);        /* 収まり */
      src.connect(lp); lp.connect(g); g.connect(ctx.destination);
      src.start(t); src.stop(t + dur);
      src.onended = function () { try { src.disconnect(); lp.disconnect(); g.disconnect(); } catch (_) {} };
      oto.wind = (oto.wind || 0) + 1; otoPublish();
    }
    /* 真っさらにする(突風)の強い風音。otoPlayWindの強化版(音量2倍・長さ約1.2倍・低域寄り)。 */
    function otoPlayGust() {
      if (!oto.enabled || !oto.ctx) return;
      var ctx = oto.ctx, t = ctx.currentTime, dur = 2.2;
      var buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;   /* ホワイトノイズ */
      var src = ctx.createBufferSource(); src.buffer = buf;
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(700, t);
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.06, t + 0.25);         /* 一陣の立ち上がり(速い) */
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      src.connect(lp); lp.connect(g); g.connect(ctx.destination);
      src.start(t); src.stop(t + dur);
      src.onended = function () { try { src.disconnect(); lp.disconnect(); g.disconnect(); } catch (_) {} };
      oto.gust = (oto.gust || 0) + 1; otoPublish();
    }
    otoPublish();   /* デフォルトオフの初期状態を即時公開（テスト観測 __hanaOto を待たせない） */

    /* Phase2g Task2: createGarden はDOMを知らないまま(疎結合)、庭の充実度(fillRatio)が
       変わるたびに opts.onFill 経由でここへ通知される。stageSeasonName は季節チップ切替で
       更新し、onFill発火時にも直近の季節を使えるようにする。 */
    var stageSeasonName = seed ? (seed.seasonName || 'spring') : (opts.season || 'spring');
    function onGardenFill(fr) { applyStageBg(container, stageSeasonName, fr); }
    var canvas = container.querySelector('.hana-canvas');
    var garden = createGarden(canvas, { reduce: reduce, season: opts.season || 'spring', seed: seed, __fastAge: opts.__fastAge, __fastWind: opts.__fastWind, __fastGrow: opts.__fastGrow, __noSprout: opts.__noSprout, onSpawn: otoPlay, onWind: otoPlayWind, onGust: otoPlayGust, onFill: onGardenFill });
    applyStageBg(container, stageSeasonName, 0);
    /* 入場の招待花（reduce時は空庭で開始）。
       index.html 経由の open では core の openDialog が onOpen を el.hidden=false の *前* に呼ぶため、
       この時点で #hana-view はまだ display:none。canvas は 0×0 で、いま invite() すると
       中央(rect.width/2, rect.height*0.5)でなく (0,0)=左上隅に咲いてしまう。
       canvas が実寸を得る（hidden 解除後の次フレーム）まで rAF で待ってから咲かせる。
       ・可視コンテナに直接 mount した場合（テスト等）は初回同期呼びで既に実寸→即 invite（従来どおり count>=1）。
       ・detach 済み（canvas が DOM から外れた）なら中止。数フレーム待っても 0 のままなら best-effort で咲かせる。 */
    if (!reduce) {
      var inviteWhenSized = function (tries) {
        if (!canvas.isConnected) return;
        var rect = canvas.getBoundingClientRect();
        if ((rect.width > 0 && rect.height > 0) || tries <= 0) { garden.invite(); return; }
        requestAnimationFrame(function () { inviteWhenSized(tries - 1); });
      };
      if (typeof requestAnimationFrame === 'function') inviteWhenSized(10);
      else garden.invite();
    }
    function publishCount() { if (typeof window !== 'undefined') { window.__hanaCount = garden.snapshotCount(); window.__hanaFill = garden.fillRatio(); } }
    var countTimer = setInterval(publishCount, 200);

    var onClick = function (e) {
      var s = e.target.closest('.hana-season');
      if (s) {
        container.querySelectorAll('.hana-season').forEach(function (b) { b.classList.remove('is-on'); });
        s.classList.add('is-on');
        stageSeasonName = s.getAttribute('data-season');
        garden.setSeason(stageSeasonName);
        applyStageBg(container, stageSeasonName, garden.fillRatio());
        return;
      }
      if (e.target.closest('.hana-clear')) {
        var stage = container.querySelector('.hana-stage');
        if (stage && !reduce) { stage.classList.add('hana-sweep'); setTimeout(function () { stage.classList.remove('hana-sweep'); }, 900); }
        garden.clear(); publishCount(); return;
      }
      var otoBtn = e.target.closest('.hana-oto');
      if (otoBtn) {
        oto.enabled = !oto.enabled;
        if (oto.enabled && !oto.ctx) {
          /* 初回onのクリック時にのみ AudioContext を生成する（自動再生制限適合・ユーザージェスチャ内） */
          try {
            oto.ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (oto.ctx && oto.ctx.resume) { try { oto.ctx.resume(); } catch (_) {} }
          } catch (_) {}
        }
        otoBtn.setAttribute('aria-pressed', oto.enabled ? 'true' : 'false');
        otoBtn.textContent = oto.enabled ? '音を消す' : '音を添える';
        otoPublish();
        return;
      }
      if (e.target.closest('.hana-press')) {
        /* seed時は季節チップが非表示(springがis-onのまま)なので seed.seasonName を使う。
           非seed時は選択中チップから取る。保存ファイル名 ichi-<season>.png に反映。 */
        var season = seed ? (seed.seasonName || 'spring')
          : ((container.querySelector('.hana-season.is-on') || {}).getAttribute ? container.querySelector('.hana-season.is-on').getAttribute('data-season') : 'spring');
        var doSave = function () {
          /* 押すアニメ(280ms)の遅延中に閉じられると detach で canvas が DOM から外れる。
             切断後に press() すると0サイズの空PNGが誤ダウンロードされるため中止する。 */
          if (!canvas.isConnected) return;
          var url = garden.press();
          var a = document.createElement('a'); a.href = url; a.download = 'ichi-' + season + '.png';
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
        };
        if (!reduce) { canvas.style.transition = 'transform 260ms ease'; canvas.style.transform = 'scaleY(0.9)'; setTimeout(function () { canvas.style.transform = ''; doSave(); }, 280); }
        else doSave();
        return;
      }
    };
    container.addEventListener('click', onClick);

    return {
      farewell: function (done) { garden.farewell(done); },
      detach: function () {
        clearInterval(countTimer);
        container.removeEventListener('click', onClick);
        garden.detach();
        container.innerHTML = '';
        try { if (oto.ctx) oto.ctx.close(); } catch (_) {}
      }
    };
  }

  /* テスト用に純粋関数を露出 */
  window.NoctaHana = { _: { SEASONS: SEASONS, makeRng: makeRng, hashSeed: hashSeed, easeOutCubic: easeOutCubic, shouldSpawn: shouldSpawn, pickForm: pickForm, drawFlower: drawFlower, drawEntity: drawEntity, drawSprig: drawSprig, drawFern: drawFern, drawUmbel: drawUmbel, drawFloret: drawFloret, hexToRgb: hexToRgb, rgba: rgba, mixRgb: mixRgb, deriveSeededPalette: deriveSeededPalette, kanjiDate: kanjiDate, applyStageBg: applyStageBg } };
  window.NoctaHana.mount = mount;
  window.NoctaHana.createGarden = createGarden;
})();
