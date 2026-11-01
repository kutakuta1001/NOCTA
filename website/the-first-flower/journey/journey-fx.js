/**
 * journey-fx.js
 * The First Flower — 旅の地図: はじめて見た写真のときに、ページ全体に出す演出。
 * 4 つから前回と違うものを選ぶ。どれも写真には重ねず、ページの地（コンテンツの後ろ）か画面の縁に出す。
 * 手法は ~/designer の見本帳から:
 *   frame-line-draw（額装）/ ink-bleed-trail（にじみ）/ TFF の Blog と同じ波紋 / text-particle-scatter（地名の粒）
 * 押せる物の邪魔をしないよう、層はすべて pointer-events: none。動きを減らす設定では呼ばれない（journey-app.js が判定）。
 */
(function () {
    var ROSE = "238, 164, 192", PINK = "253, 217, 217", ACCENT = "177, 104, 168", TEAL = "166, 221, 214", MINT = "184, 227, 183";
    var layer = null, timers = [], raf = 0, last = -1;

    function rand(a, b) { return a + Math.random() * (b - a); }
    function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

    // コンテンツの後ろに敷く層（body の地の上・本文の下）
    function backLayer() {
        if (!layer) {
            layer = document.createElement("div");
            layer.setAttribute("aria-hidden", "true");
            layer.style.cssText = "position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden";
            document.body.appendChild(layer);
        }
        return layer;
    }
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function clear() {
        timers.forEach(clearTimeout);
        timers = [];
        cancelAnimationFrame(raf);
        if (layer) layer.textContent = "";
        document.querySelectorAll(".jr-frame-line").forEach(function (n) { n.remove(); });
    }

    // 1. 額装: 画面の四辺を一筆書きで線が走り、少し留まって消える
    function frameLine() {
        var inset = "max(10px, 1.2vw)";
        var sides = [
            { css: "top:" + inset + ";left:" + inset + ";right:" + inset + ";height:1px", from: "scaleX(0)", origin: "left" },
            { css: "top:" + inset + ";bottom:" + inset + ";right:" + inset + ";width:1px", from: "scaleY(0)", origin: "top" },
            { css: "bottom:" + inset + ";left:" + inset + ";right:" + inset + ";height:1px", from: "scaleX(0)", origin: "right" },
            { css: "top:" + inset + ";bottom:" + inset + ";left:" + inset + ";width:1px", from: "scaleY(0)", origin: "bottom" }
        ];
        sides.forEach(function (s, i) {
            var n = document.createElement("span");
            n.className = "jr-frame-line";
            n.setAttribute("aria-hidden", "true");
            n.style.cssText = "position:fixed;z-index:60;pointer-events:none;background:rgb(" + ACCENT + ");" + s.css + ";transform-origin:" + s.origin;
            document.body.appendChild(n);
            n.animate([{ transform: s.from }, { transform: "scale(1)" }],
                      { duration: 420, delay: i * 360, easing: "cubic-bezier(.65,0,.35,1)", fill: "both" });
            n.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, delay: 2300, fill: "forwards" });
        });
        later(function () { document.querySelectorAll(".jr-frame-line").forEach(function (n) { n.remove(); }); }, 3100);
    }

    // 2. にじみ: 紙に落ちた絵の具のように、桜の色が地に染みて消える
    function inkBleed(o) {
        var L = backLayer(), W = innerWidth, H = innerHeight;
        var colors = [ROSE, ROSE, ACCENT, TEAL, PINK, MINT];
        for (var i = 0; i < 6; i++) {
            var s = rand(200, 380) * Math.max(.7, Math.min(W, 1200) / 1200);
            // 押した場所のまわりに寄せつつ、画面に散らす
            var x = i < 2 ? o.x + rand(-160, 160) : rand(0, W), y = i < 2 ? o.y + rand(-140, 140) : rand(0, H);
            var c = colors[i], n = document.createElement("span");
            var r = []; for (var k = 0; k < 4; k++) r.push(Math.round(rand(35, 65)) + "%");
            n.style.cssText = "position:absolute;left:" + (x - s / 2) + "px;top:" + (y - s / 2) + "px;width:" + s + "px;height:" + s + "px;" +
                "border-radius:" + r.join(" ") + " / " + r.slice().reverse().join(" ") + ";mix-blend-mode:multiply;filter:blur(6px);" +
                "background:radial-gradient(ellipse at center, rgba(" + c + ",.9) 0%, rgba(" + c + ",.8) 18%, rgba(" + c + ",.42) 44%, rgba(" + c + ",.14) 70%, transparent 90%)";
            L.appendChild(n);
            var dx = rand(-30, 30), dy = rand(-20, 30);
            n.animate([
                { opacity: 0, transform: "translate(0,0) scale(.3)" },
                { opacity: .75, offset: .16 },
                { opacity: .6, transform: "translate(" + dx * .6 + "px," + dy * .6 + "px) scale(1.25)", offset: .55 },
                { opacity: 0, transform: "translate(" + dx + "px," + dy + "px) scale(1.9)" }
            ], { duration: rand(2600, 3200), delay: i * 140, easing: "cubic-bezier(.19,.68,.34,1)", fill: "both" });
        }
        later(function () { L.textContent = ""; }, 4000);
    }

    // 3. 波紋: 押した場所から、桜色の輪が地に広がる（TFF の Blog の節と同じ所作）
    function ripple(o) {
        var L = backLayer(), R = Math.hypot(Math.max(o.x, innerWidth - o.x), Math.max(o.y, innerHeight - o.y));
        [ROSE, ACCENT, PINK].forEach(function (c, i) {
            var n = document.createElement("span"), d = R * 2;
            n.style.cssText = "position:absolute;left:" + (o.x - R) + "px;top:" + (o.y - R) + "px;width:" + d + "px;height:" + d + "px;border-radius:50%;" +
                "background:radial-gradient(circle, transparent 60%, rgba(" + c + ",.0) 62%, rgba(" + c + ",.75) 69%, rgba(" + c + ",.0) 76%, transparent 80%)";
            L.appendChild(n);
            n.animate([{ transform: "scale(.04)", opacity: 0 }, { opacity: 1, offset: .12 }, { transform: "scale(1)", opacity: 0 }],
                      { duration: 2400, delay: i * 320, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" });
        });
        later(function () { L.textContent = ""; }, 3400);
    }

    // 4. 地名の粒: 花びらの色の粒が集まって地名になり、また散る（Canvas の画素を読む。CSS では作れない）
    // 地図と写真の後ろでは読めないので、見出しの右の空いた帯に出す。帯が取れない狭い画面では波紋にする
    function nameParticles(o) {
        var text = (o.text || "").slice(0, 8);
        var W = innerWidth, H = innerHeight;
        var tabs = document.getElementById("jr-tabs"), lead = document.getElementById("jr-found");
        var bandTop = lead ? Math.max(0, lead.getBoundingClientRect().bottom - 150) : 0;
        var bandBottom = tabs ? tabs.getBoundingClientRect().top - 8 : 0;
        var bandH = Math.min(bandBottom - Math.max(bandTop, 0), H * .4);
        if (!text || W < 900 || bandH < 140) return ripple(o);
        var cx = W * .66, cy = Math.max(bandTop, 0) + bandH / 2;
        var L = backLayer(), dpr = Math.min(devicePixelRatio || 1, 2);
        var cv = document.createElement("canvas");
        cv.width = W * dpr; cv.height = H * dpr;
        cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
        L.appendChild(cv);
        var ctx = cv.getContext("2d");
        ctx.scale(dpr, dpr);

        // 画面外で文字を描いて、塗られた画素を目標にする（getImageData は 1 回だけ）
        var off = document.createElement("canvas"), oc = off.getContext("2d", { willReadFrequently: true });
        off.width = W; off.height = H;
        var size = Math.min(W * .5 / text.length, bandH * .82, 200);
        oc.font = "600 " + size + "px 'Noto Serif JP', serif";
        oc.textAlign = "center"; oc.textBaseline = "middle";
        oc.fillText(text, cx, cy);
        var data = oc.getImageData(0, 0, W, H).data, pts = [];
        var step = Math.max(4, Math.round(size / 34));
        for (var y = 0; y < H; y += step) for (var x = 0; x < W; x += step) if (data[(y * W + x) * 4 + 3] > 128) pts.push([x, y]);
        if (pts.length > 2200) pts = pts.filter(function (_, i) { return i % Math.ceil(pts.length / 2200) === 0; });

        var cols = [ROSE, ROSE, ACCENT, PINK, TEAL];
        var ps = pts.map(function (p) {
            return { x: rand(0, W), y: rand(0, H), vx: 0, vy: 0, tx: p[0], ty: p[1], r: rand(1.4, 2.8), c: pick(cols), a: rand(.5, .85) };
        });
        var t0 = performance.now(), GATHER = 1500, HOLD = 700, SCATTER = 1100;
        function frame(now) {
            var t = now - t0;
            ctx.clearRect(0, 0, W, H);
            var fade = t < GATHER + HOLD ? 1 : Math.max(0, 1 - (t - GATHER - HOLD) / SCATTER);
            ps.forEach(function (p) {
                if (t < GATHER + HOLD) {
                    p.vx = (p.vx + (p.tx - p.x) * .07) * .87;
                    p.vy = (p.vy + (p.ty - p.y) * .07) * .87;
                } else if (!p.out) {
                    // 散らすときは目標を捨てず、速度だけ与える
                    p.out = true;
                    p.vx = rand(-4, 4); p.vy = rand(-5, 1.5);
                } else {
                    p.vy += .03;
                }
                p.x += p.vx; p.y += p.vy;
                ctx.fillStyle = "rgba(" + p.c + "," + (p.a * fade) + ")";
                ctx.beginPath();
                ctx.ellipse(p.x, p.y, p.r * 1.25, p.r * .8, (p.tx + p.ty) % 3, 0, 6.283);
                ctx.fill();
            });
            if (t < GATHER + HOLD + SCATTER) raf = requestAnimationFrame(frame);
            else L.textContent = "";
        }
        raf = requestAnimationFrame(frame);
    }

    var FX = [frameLine, inkBleed, ripple, nameParticles];

    // o = { x, y: 押した場所（画面の座標）, text: 地名 }
    function play(o) {
        clear();
        var i = Math.floor(Math.random() * (FX.length - (last >= 0 ? 1 : 0)));
        if (last >= 0 && i >= last) i++;
        last = i;
        FX[i](o);
    }

    document.addEventListener("visibilitychange", function () { if (document.hidden) clear(); });
    window.JourneyFx = { play: play, clear: clear, effects: FX };
})();
