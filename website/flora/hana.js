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
  function shouldSpawn(distAccum, step) { return distAccum >= step; }
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
  function drawFlower(ctx, o) {
    var bloom = Math.max(0, Math.min(1, o.bloom));
    if (bloom <= 0.001) return;
    var r = o.r * (0.35 + 0.65 * bloom);          /* つぼみ(小)→満開(大) */
    var pal = o.palette, rng = o.rng || makeRng(1);
    var petalColor = pal.petals[Math.floor(rng() * pal.petals.length) % pal.petals.length];
    var form = o.form;
    var counts = { sakura: 5, kiku: 14, tulip: 4, komori: 5 };
    var n = counts[form] || 5;
    var openAng = (0.55 + 0.45 * bloom);           /* 開き具合 */
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate(o.rot || 0);
    for (var i = 0; i < n; i++) {
      ctx.save();
      ctx.rotate((i / n) * Math.PI * 2);
      ctx.scale(openAng, openAng);
      ctx.fillStyle = petalColor;
      ctx.globalAlpha = 0.92;
      if (form === 'kiku') { petal(ctx, r * 1.25, r * 0.12); }
      else if (form === 'tulip') { petal(ctx, r * 1.05, r * 0.42); }
      else if (form === 'komori') { /* 丸弁 */ ctx.beginPath(); ctx.arc(0, -r * 0.6, r * 0.42, 0, Math.PI * 2); }
      else { /* sakura: 先に切れ込み */ petal(ctx, r, r * 0.34); }
      ctx.fill();
      if (form === 'sakura') { /* 切れ込みを地色で */ ctx.fillStyle = pal.ground; ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * 0.09, -r * 0.8); ctx.lineTo(-r * 0.09, -r * 0.8); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    }
    /* 花芯 */
    ctx.fillStyle = pal.core; ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(0, 0, r * (form === 'kiku' ? 0.28 : 0.2), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  var MAX_FLOWERS = 400, STEP = 26;   /* 距離サンプリング間隔(px) */
  function createGarden(canvas, opts) {
    opts = opts || {};
    var reduce = !!opts.reduce;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var seasonName = opts.season || 'spring';
    var flowers = [];        /* {x,y,r,rot,form,palette,seed,bornT,dur} */
    var rafId = null, running = false;
    var seedCounter = 1;

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
      for (var i = 0; i < flowers.length; i++) {
        var f = flowers[i];
        var bloom = reduce ? 1 : Math.min(1, easeOutCubic((t - f.bornT) / f.dur));
        drawFlower(ctx, { x: f.x, y: f.y, r: f.r, rot: f.rot, bloom: bloom, form: f.form, palette: SEASONS[seasonName], rng: makeRng(f.seed) });
      }
    }
    function anyBlooming() {
      if (reduce) return false;
      var t = now();
      for (var i = 0; i < flowers.length; i++) { if (t - flowers[i].bornT < flowers[i].dur) return true; }
      return false;
    }
    function loop() {
      redraw();
      if (anyBlooming()) { rafId = requestAnimationFrame(loop); } else { running = false; rafId = null; }
    }
    function kick() { if (!running && !reduce) { running = true; rafId = requestAnimationFrame(loop); } else { redraw(); } }

    function spawn(x, y, speed) {
      var rng = makeRng(seedCounter);
      var f = {
        x: x, y: y,
        r: 12 + (1 - Math.min(1, speed / 2)) * 22,   /* 遅い=大 / 速い=小 */
        rot: rng() * Math.PI * 2,
        form: pickForm(rng),
        seed: seedCounter++,
        bornT: now(),
        dur: 700
      };
      flowers.push(f);
      if (flowers.length > MAX_FLOWERS) flowers.shift();
      kick();
    }

    /* pointer 操作 */
    var drawing = false, last = null, accum = 0;
    function local(e) { var r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, t: (e.timeStamp || now()) }; }
    function begin(e) { drawing = true; var p = local(e); last = p; accum = 0; spawn(p.x, p.y, 0); if (canvas.setPointerCapture) { try { canvas.setPointerCapture(e.pointerId); } catch (_) {} } }
    function move(e) {
      if (!drawing) return;
      var p = local(e), dx = p.x - last.x, dy = p.y - last.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < 0.0001) { last = p; return; }
      var dt = Math.max(1, p.t - last.t), speed = d / dt;
      /* last→p を STEP 間隔で線形補間して花を置く（軌跡に沿って等間隔に咲かせる）。
         同一座標への積み重なり（速い/粗いストロークで団子になる）を防ぐ。fude.js のスタンプ補間と同法。
         accum は「前回spawnからの残距離(0..STEP)」。この区間の最初のspawnは need=STEP-accum の位置。 */
      var ux = dx / d, uy = dy / d;
      var need = STEP - accum;
      if (need > d) { accum += d; last = p; return; }
      var s = need;
      while (s <= d) { spawn(last.x + ux * s, last.y + uy * s, speed); s += STEP; }
      accum = d - (s - STEP);
      last = p;
    }
    function end() { drawing = false; last = null; }

    canvas.addEventListener('pointerdown', begin);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('pointerleave', end);
    var onWinResize = function () { resize(); };
    window.addEventListener('resize', onWinResize);
    resize();

    return {
      setSeason: function (name) { if (SEASONS[name]) { seasonName = name; redraw(); } },
      clear: function () { flowers = []; redraw(); },
      press: function () {
        var rect = canvas.getBoundingClientRect();
        var w = Math.round(rect.width), h = Math.round(rect.height);
        var pal = SEASONS[seasonName];
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
        /* 季節ラベル＋署名 */
        var labels = { spring: '春', summer: '夏', autumn: '秋', winter: '冬' };
        octx.fillStyle = 'rgba(40,36,30,0.72)';
        octx.font = '600 ' + Math.round(w * 0.028) + 'px "Shippori Mincho","EB Garamond",serif';
        octx.textAlign = 'left'; octx.textBaseline = 'bottom';
        octx.fillText((labels[seasonName] || '') + ' の 押し花', w * 0.05, h * 0.955);
        octx.textAlign = 'right';
        octx.fillText('Ichi', w * 0.95, h * 0.955);
        return out.toDataURL('image/png');
      },
      snapshotCount: function () { return flowers.length; },
      detach: function () {
        running = false; if (rafId) cancelAnimationFrame(rafId);
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
        '<button type="button" class="hana-press">押し花にする</button>' +
      '</div>';
  }

  /* container 内に咲かせるビューを構築し { detach } を返す */
  function mount(container, opts) {
    opts = opts || {};
    var reduce = opts.reduce || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    buildUi(container);
    var canvas = container.querySelector('.hana-canvas');
    var garden = createGarden(canvas, { reduce: reduce, season: opts.season || 'spring' });
    function publishCount() { if (typeof window !== 'undefined') window.__hanaCount = garden.snapshotCount(); }
    var countTimer = setInterval(publishCount, 200);

    var onClick = function (e) {
      var s = e.target.closest('.hana-season');
      if (s) {
        container.querySelectorAll('.hana-season').forEach(function (b) { b.classList.remove('is-on'); });
        s.classList.add('is-on');
        garden.setSeason(s.getAttribute('data-season'));
        return;
      }
      if (e.target.closest('.hana-clear')) {
        var stage = container.querySelector('.hana-stage');
        if (stage && !reduce) { stage.classList.add('hana-sweep'); setTimeout(function () { stage.classList.remove('hana-sweep'); }, 900); }
        garden.clear(); publishCount(); return;
      }
      if (e.target.closest('.hana-press')) {
        var season = (container.querySelector('.hana-season.is-on') || {}).getAttribute ? container.querySelector('.hana-season.is-on').getAttribute('data-season') : 'spring';
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
      detach: function () {
        clearInterval(countTimer);
        container.removeEventListener('click', onClick);
        garden.detach();
        container.innerHTML = '';
      }
    };
  }

  /* テスト用に純粋関数を露出 */
  window.NoctaHana = { _: { SEASONS: SEASONS, makeRng: makeRng, hashSeed: hashSeed, easeOutCubic: easeOutCubic, shouldSpawn: shouldSpawn, pickForm: pickForm, drawFlower: drawFlower } };
  window.NoctaHana.mount = mount;
  window.NoctaHana.createGarden = createGarden;
})();
