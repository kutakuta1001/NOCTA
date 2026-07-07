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
    var vigor = (typeof o.vigor === 'number') ? o.vigor : 1;   /* 0=速い/淡, 1=遅い/豊か */
    var depth = (typeof o.depth === 'number') ? o.depth : 0;   /* 0=手前, 1=奥 */
    var r = o.r * (0.35 + 0.65 * bloom) * (1 - depth * 0.4);
    var pal = o.palette, rng = o.rng || makeRng(1);
    var baseA = (0.60 + 0.32 * vigor) * (1 - depth * 0.45);    /* 豊か/手前ほど濃い */
    var ground = hexToRgb(pal.ground);
    var form = o.form;
    var counts = { sakura: 5, kiku: 14, tulip: 4, komori: 5 };
    var n = counts[form] || 5;
    var openAng = (0.55 + 0.45 * bloom);
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate(o.rot || 0);
    if (depth > 0.5) { ctx.shadowColor = rgba(hexToRgb(pal.petals[0]), 0.5); ctx.shadowBlur = r * 0.5; } /* 奥は柔らかく */
    for (var i = 0; i < n; i++) {
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
      else { petal(ctx, r, r * 0.34); }
      ctx.fill();
      if (form === 'sakura') { ctx.fillStyle = rgba(ground, baseA * 0.9); ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * 0.09, -r * 0.8); ctx.lineTo(-r * 0.09, -r * 0.8); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    }
    ctx.shadowBlur = 0;
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
    var seasonName = opts.season || 'spring';
    var flowers = [];        /* {x,y,r,baseRot,form,seed,bornT,dur,depth,vigor,swayPhase,swayW} */
    var rafId = null, running = false;
    var seedCounter = 1;
    var farewelling = false, farewellT = 0, lastFrameT = 0;

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
        var sway = reduce ? 0 : 0.035 * Math.sin(t * f.swayW + f.swayPhase); /* A-5 微風 */
        drawFlower(ctx, {
          x: f.x, y: f.y, r: f.r, rot: f.baseRot + sway, bloom: bloom,
          form: f.form, palette: SEASONS[seasonName], rng: makeRng(f.seed),
          vigor: f.vigor, depth: f.depth
        });
      }
    }
    function needLoop() {
      if (farewelling) return true;                 /* 退場アニメ中は回す */
      if (reduce) return false;                     /* reduce: 即満開・微風なし → 1描画で停止(省電力) */
      return flowers.length > 0;                    /* 非reduce: 花があれば微風のため継続・無ければ停止 */
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
        r: (14 + vigor * 22) * (0.9 + rng() * 0.2),   /* 遅い=大 */
        baseRot: rng() * Math.PI * 2,
        form: pickForm(rng),
        seed: seedCounter++,
        bornT: now(),
        dur: 1500,                                    /* B-2 呼吸テンポ(開花を緩める) */
        depth: depth,
        vigor: vigor,
        swayPhase: rng() * Math.PI * 2,
        swayW: 0.0006 + rng() * 0.0006                /* 微風の角速度(rad/ms) */
      };
      /* FIFO保持（描画順は redraw 側で depth ソート）。容量超過時は最古(先頭)を削除。
         depth順に挿入して shift すると新規花自身が消え得るバグを避けるため push+shift にする。 */
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
      var effStep = STEP * (1 + Math.min(1.6, speed * 0.9));   /* 速いほど間隔広=まばら */
      var need = effStep - accum;
      if (need > d) { accum += d; last = p; return; }
      var s = need;
      while (s <= d) { spawn(last.x + ux * s, last.y + uy * s, speed); s += effStep; }
      accum = d - (s - effStep);
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
      invite: function () {
        var rect = canvas.getBoundingClientRect();
        spawn(rect.width / 2, rect.height * 0.5, 0);
        flowers[flowers.length - 1].dur = 2500;   /* 招待はさらにゆっくり */
      },
      farewell: function (done) {
        if (farewelling) return;                                   /* 再入ガード(二重doneを防ぐ) */
        if (reduce || flowers.length === 0) { if (done) done(); return; }
        farewelling = true; farewellT = now(); kick();
        setTimeout(function () {
          /* 退場完了: 花を消し、状態を戻す。閉じずに再利用されても清浄な空庭に戻る
             （farewellingが立ちっぱなしだと新規花が二度と描かれない不具合を防ぐ） */
          flowers = []; farewelling = false;
          if (done) done();
        }, 820);
      },
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
    var reduce = opts.reduce || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    buildUi(container);
    var canvas = container.querySelector('.hana-canvas');
    var garden = createGarden(canvas, { reduce: reduce, season: opts.season || 'spring' });
    applyStageBg(container, opts.season || 'spring');
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
      farewell: function (done) { garden.farewell(done); },
      detach: function () {
        clearInterval(countTimer);
        container.removeEventListener('click', onClick);
        garden.detach();
        container.innerHTML = '';
      }
    };
  }

  /* テスト用に純粋関数を露出 */
  window.NoctaHana = { _: { SEASONS: SEASONS, makeRng: makeRng, hashSeed: hashSeed, easeOutCubic: easeOutCubic, shouldSpawn: shouldSpawn, pickForm: pickForm, drawFlower: drawFlower, hexToRgb: hexToRgb, rgba: rgba, mixRgb: mixRgb } };
  window.NoctaHana.mount = mount;
  window.NoctaHana.createGarden = createGarden;
})();
