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
  /* シード花用パレット: accentHex(その花の代表色)を主色にした派生3色パレット。
     ground/core は季節基準(seasonName)のまま流用し、和紙地・花芯の統一感を保つ。 */
  function deriveSeededPalette(accentHex, seasonName) {
    var base = SEASONS[seasonName] || SEASONS.spring;
    var a = hexToRgb(accentHex);
    var lighten = mixRgb(a, { r: 255, g: 255, b: 255 }, 0.28);
    var tint = mixRgb(a, hexToRgb(base.ground), 0.45);
    function toHex(c) { return '#' + [c.r, c.g, c.b].map(function (v) { return ('0' + Math.round(v).toString(16)).slice(-2); }).join(''); }
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
    var farewelling = false, farewellT = 0, lastFrameT = 0, farewellTimer = null;
    var petals = [];              /* 落下花びらパーティクル(無常) */
    var fastAge = !!opts.__fastAge;  /* テスト短縮用: 本番未使用 */
    var lastAgeT = 0;
    var PART_MAX = 120;
    /* 風の一吹き: 16〜34秒(テスト短縮時は約1.2秒)に一度、庭全体がそよぎ、
       加齢期の花から花びらが数枚舞う。reduce/farewell時は発火しない(redraw側で判定)。 */
    var wind = { until: 0, start: 0, dir: 1, strength: 0 };
    var nextWindT = 0; var fastWind = !!opts.__fastWind;  /* テスト短縮用: 本番未使用 */
    function scheduleWind(t) { nextWindT = t + (fastWind ? 1200 : (16000 + Math.random() * 18000)); }

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
        if (opts.onWind) { try { opts.onWind(); } catch (_) {} }
      }
      var windAmt = 0;
      if (t < wind.until) {
        var wp = (t - wind.start) / 2500;                     /* 0..1 */
        windAmt = Math.sin(Math.PI * Math.min(1, wp)) * wind.strength;  /* ease in-out */
      }
      /* 描画は奥(depth大)から。保持はFIFO配列のまま、描画時だけdepth降順のコピーを使う
         （保持順を崩さないことで容量超過時の間引きが「最古を削除」で正しく働く） */
      var order = flowers.slice().sort(function (a, b) { return b.depth - a.depth; });
      for (var i = 0; i < order.length; i++) {
        var f = order[i];
        var bloom;
        if (farewelling) {
          bloom = Math.max(0, 1 - (t - farewellT) / 800);        /* 退場: 1→0 */
        } else {
          bloom = reduce ? 1 : Math.min(1, easeOutCubic((t - f.bornT) / f.dur));
        }
        var sway = reduce ? 0 : (0.035 * Math.sin(t * f.swayW + f.swayPhase) + windAmt * 0.2 * wind.dir * (1 - f.depth * 0.6)); /* A-5 微風 + 風の一吹き */
        /* 加齢＝花びらを1枚ずつ落とす（無常）。reduce時は行わない */
        if (!reduce && !farewelling) {
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
        drawFlower(ctx, {
          x: f.x, y: f.y, r: f.r, rot: f.baseRot + sway, bloom: bloom,
          form: f.form, palette: currentPalette(), rng: makeRng(f.seed),
          vigor: f.vigor, depth: f.depth, shed: f.shed, leaves: f.leaves
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
        var qc = hexToRgb(q.color);
        var qg = ctx.createLinearGradient(0, 0, 0, -q.r);
        qg.addColorStop(0, rgba(qc, qa)); qg.addColorStop(1, rgba(qc, qa * 0.3));
        ctx.fillStyle = qg; petal(ctx, q.r, q.r * 0.34); ctx.fill(); ctx.restore();
      }
    }
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
      drawing = true; var p = local(e); last = p; accum = 0; spawn(p.x, p.y, 0);
      if (canvas.setPointerCapture) { try { canvas.setPointerCapture(e.pointerId); } catch (_) {} }
      holdPos = { x: p.x, y: p.y };
      holdTimer = setTimeout(function () { if (holdPos) spawnGrand(holdPos.x, holdPos.y); clearHold(); }, 600);
    }
    function move(e) {
      if (!drawing) return;
      var p = local(e), dx = p.x - last.x, dy = p.y - last.y, d = Math.sqrt(dx * dx + dy * dy);
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
       後だと nextWindT=0 のまま最初の redraw が走り、開いた瞬間に風が発火してしまう */
    scheduleWind(now());
    resize();

    return {
      setSeason: function (name) { if (seed) return; if (SEASONS[name]) { seasonName = name; redraw(); } },
      clear: function () { flowers = []; petals = []; redraw(); },
      press: function () {
        var rect = canvas.getBoundingClientRect();
        var w = Math.round(rect.width), h = Math.round(rect.height);
        var pal = currentPalette();
        var out = document.createElement('canvas'); out.width = w; out.height = h;
        var octx = out.getContext('2d');
        /* 和紙地 */
        octx.fillStyle = pal.ground; octx.fillRect(0, 0, w, h);
        /* 花を平面化・退色して合成: 縦を少し潰し、彩度を落とすため半透明の地色を上掛け */
        octx.save();
        octx.translate(0, h * 0.06); octx.scale(1, 0.88);   /* 押された平面化 */
        octx.globalAlpha = 0.92;
        octx.drawImage(canvas, 0, 0, w, h);
        octx.restore();
        octx.save(); octx.globalAlpha = 0.10; octx.fillStyle = '#6b5f4a'; octx.fillRect(0, 0, w, h); octx.restore(); /* 退色の沈み */
        /* 細い枠 */
        octx.strokeStyle = 'rgba(60,54,42,0.35)'; octx.lineWidth = Math.max(1, w * 0.004);
        octx.strokeRect(w * 0.03, h * 0.03, w * 0.94, h * 0.94);
        /* ラベル（季節または花の名前）＋漢数字の日付＋署名。
           seed時は花の名で「薔薇 の 押し花 · 七月七日」、非seedは季節で「春 の 押し花 · 七月七日」。 */
        var labels = { spring: '春', summer: '夏', autumn: '秋', winter: '冬' };
        var today = new Date();
        var dateLabel = kanjiDate(today.getMonth() + 1, today.getDate());
        var head = (seed && seed.nameJa) ? seed.nameJa : (labels[seasonName] || '');
        octx.fillStyle = 'rgba(40,36,30,0.72)';
        octx.font = '600 ' + Math.round(w * 0.028) + 'px "Shippori Mincho","EB Garamond",serif';
        octx.textAlign = 'left'; octx.textBaseline = 'bottom';
        octx.fillText(head + ' の 押し花 · ' + dateLabel, w * 0.05, h * 0.955);
        octx.textAlign = 'right';
        octx.fillText('Ichi', w * 0.95, h * 0.955);
        return out.toDataURL('image/png');
      },
      snapshotCount: function () { return flowers.length; },
      /* テスト用: 少なくとも1枚花びらを落とした花の数(加齢/風どちらの契機でもshed>0になったもの)。
         風発火の舞う枚数上限を検証するための直接的な観測手段（面積の間接推定より確実）。 */
      shedFlowerCount: function () { return flowers.filter(function (f) { return f.shed > 0; }).length; },
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

  /* 季節→光だまり色マップ。.hana-stage の背景を季節に連動させる。 */
  var SEASON_GLOW = {
    spring: 'rgba(120,70,90,0.40)', summer: 'rgba(50,70,120,0.40)',
    autumn: 'rgba(120,70,40,0.42)', winter: 'rgba(90,96,110,0.36)'
  };
  function applyStageBg(container, season) {
    var stage = container.querySelector('.hana-stage');
    if (stage) stage.style.background =
      'radial-gradient(ellipse 70% 60% at 50% 62%, ' + (SEASON_GLOW[season] || SEASON_GLOW.spring) +
      ' 0%, rgba(14,12,9,0.85) 55%, #0A0906 100%)';
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
    var oto = { enabled: false, ctx: null, lastT: -1, played: 0, wind: 0 };  /* lastT負値: トグルON直後の最初の一音も鳴らす */
    function otoPublish() { if (typeof window !== 'undefined') window.__hanaOto = { played: oto.played, ctxCreated: !!oto.ctx, wind: oto.wind || 0 }; }
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
    otoPublish();   /* デフォルトオフの初期状態を即時公開（テスト観測 __hanaOto を待たせない） */

    var canvas = container.querySelector('.hana-canvas');
    var garden = createGarden(canvas, { reduce: reduce, season: opts.season || 'spring', seed: seed, __fastAge: opts.__fastAge, __fastWind: opts.__fastWind, onSpawn: otoPlay, onWind: otoPlayWind });
    applyStageBg(container, seed ? seed.seasonName : (opts.season || 'spring'));
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
    function publishCount() { if (typeof window !== 'undefined') window.__hanaCount = garden.snapshotCount(); }
    var countTimer = setInterval(publishCount, 200);

    var onClick = function (e) {
      var s = e.target.closest('.hana-season');
      if (s) {
        container.querySelectorAll('.hana-season').forEach(function (b) { b.classList.remove('is-on'); });
        s.classList.add('is-on');
        garden.setSeason(s.getAttribute('data-season'));
        applyStageBg(container, s.getAttribute('data-season'));
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
  window.NoctaHana = { _: { SEASONS: SEASONS, makeRng: makeRng, hashSeed: hashSeed, easeOutCubic: easeOutCubic, shouldSpawn: shouldSpawn, pickForm: pickForm, drawFlower: drawFlower, hexToRgb: hexToRgb, rgba: rgba, mixRgb: mixRgb, deriveSeededPalette: deriveSeededPalette, kanjiDate: kanjiDate } };
  window.NoctaHana.mount = mount;
  window.NoctaHana.createGarden = createGarden;
})();
