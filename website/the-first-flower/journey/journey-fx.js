/**
 * journey-fx.js
 * The First Flower — 旅の地図: はじめて見た写真のときに、花びらが少しだけ舞う。
 * 8 枚の花びらが、押した場所のまわりからゆっくり落ちて、約 3 秒で消える。画面は覆わない。
 * 花びらの形は TFF の過去ブログの帯（old-blog.css の .ob-petal）と同じ。色は薄い地で見えるよう桜色に寄せる。
 * 層はコンテンツの後ろ（z-index:-1）に敷くので、写真や押せる物には重ならない。pointer-events: none。
 * 動きを減らす設定では呼ばれない（journey-app.js が判定）。
 */
(function () {
    var layer = null, timers = [];
    var COUNT = 8;

    function rand(a, b) { return a + Math.random() * (b - a); }

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
        if (layer) layer.textContent = "";
    }

    // 花びら: 押した場所のまわりから、ゆっくり揺れながら落ちて消える
    function petals(o) {
        var L = backLayer(), W = innerWidth, H = innerHeight;
        // 押した場所が取れないときは、画面の上の端から落とす
        var ok = o && isFinite(o.x) && isFinite(o.y);
        // 起点が写真の上だと後ろに隠れるので、写真の上の見出しのあたりから落とし、写真の上端で止める（スマホ）
        var frame = document.querySelector(".jr-frame"), f = frame && frame.getBoundingClientRect(), floor = H;
        if (ok && f && o.x >= f.left && o.x <= f.right && o.y >= f.top && o.y <= f.bottom) {
            o = { x: o.x, y: f.top - 40 };
            floor = f.top;
        }
        for (var i = 0; i < COUNT; i++) {
            var big = i % 2 === 0;
            var w = big ? 11 : 9, h = big ? 14 : 12;
            var x = ok ? o.x + rand(-80, 80) : rand(W * .15, W * .85);
            var y = ok ? o.y + rand(-90, -20) : -20;
            x = Math.max(8, Math.min(W - 8, x));
            var n = document.createElement("span");
            n.style.cssText = "position:absolute;left:" + x + "px;top:" + y + "px;width:" + w + "px;height:" + h + "px;" +
                "border-radius:80% 0 80% 0;background:" + (big ? "rgba(238,164,192,.8)" : "rgba(253,217,217,.95)") + ";" +
                "box-shadow:0 0 0 .5px rgba(238,164,192,.6);opacity:0";
            L.appendChild(n);
            var fall = Math.max(60, Math.min(rand(200, 280), floor - y));
            var sway = rand(-50, 20);
            n.animate([
                { transform: "translate(0,0) rotate(0deg)", opacity: 0 },
                { opacity: 1, offset: .15 },
                { transform: "translate(" + sway * .5 + "px," + fall * .55 + "px) rotate(" + rand(120, 200) + "deg)", opacity: 1, offset: .6 },
                { transform: "translate(" + sway + "px," + fall + "px) rotate(" + rand(280, 420) + "deg)", opacity: 0 }
            ], { duration: rand(2200, 2600), delay: rand(0, 450), easing: "ease-in-out", fill: "both" });
        }
        later(function () { L.textContent = ""; }, 3200);
    }

    var FX = [petals];

    // o = { x, y: 押した場所（画面の座標）, text: 地名（使わない） }
    function play(o) {
        clear();
        FX[0](o);
    }

    document.addEventListener("visibilitychange", function () { if (document.hidden) clear(); });
    window.JourneyFx = { play: play, clear: clear, effects: FX };
})();
