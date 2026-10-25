/* 感動したこと: kandou-data.js を年ごとの花と栞にして並べる（描画の部品は flower-kinds.js） */
(function () {
    var ORDER = ["sakura", "cosmos", "daisy", "camellia", "nemophila", "sunflower"];
    var BASE_YEAR = 2026;   // 桜の年。ここから一年さかのぼるごとに ORDER の次の花
    var entries = window.TFF_KANDOU || [];
    var fixed = window.TFF_KANDOU_FLOWERS || {};
    var thisYear = new Date().getFullYear();

    function kindOf(year) {
        if (fixed[year] && FLOWER_KINDS[fixed[year]]) return fixed[year];
        var n = ORDER.length;
        return ORDER[(((BASE_YEAR - year) % n) + n) % n];
    }
    // http(s) か相対パスだけを通す
    function safeHref(u) {
        u = String(u || "").trim();
        if (!u) return "";
        if (/^https?:\/\//i.test(u)) return u;
        if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return "";
        return u;
    }

    // 年ごとにまとめる（新しい年が上、年の中は日付順）。今年は書いていなくても出す
    var byYear = {};
    byYear[thisYear] = [];
    entries.forEach(function (e) {
        var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(e.date || "");
        if (!m || !e.text) return;
        var y = +m[1];
        (byYear[y] = byYear[y] || []).push({ md: m[2] + "." + m[3], date: e.date, text: e.text, blog: safeHref(e.blog) });
    });
    var years = Object.keys(byYear).map(Number).sort(function (a, b) { return b - a; });

    function bigFlower(year, kind, n) {
        var ex = function (i) { return 'data-y="' + year + '" data-i="' + i + '"'; };
        return '<svg class="fsvg" viewBox="0 0 280 360" aria-hidden="true">' + flowerStalk(kind) + flowerPetals(kind, n, 104, 140, 140, "petal", ex, true) + '</svg>' +
            '<svg class="fsvg-sm" viewBox="20 20 240 240" aria-hidden="true">' + flowerPetals(kind, n, 104, 140, 140, "petal", ex, true) + '</svg>';
    }
    function sprig(side, flip) {
        return '<div style="position:relative;height:0"><svg class="sprig" aria-hidden="true" style="' + side + ':-34px;top:-40px;' + (flip ? 'transform:scaleX(-1)' : '') + '" viewBox="0 0 46 40">' +
            '<path d="M6 38 C 10 26, 18 16, 30 6"/><ellipse cx="16" cy="24" rx="9" ry="3.6" style="--lr:-35deg"/><ellipse cx="25" cy="13" rx="8" ry="3.2" style="--lr:20deg"/></svg></div>';
    }
    function grass() {
        var s = "", i, x, h;
        for (i = 0; i < 26; i++) {
            x = 10 + i * 37 + (i % 3) * 6; h = 18 + (i * 7) % 26;
            s += '<path style="animation-delay:' + (-(i % 5)) + 's" d="M' + x + ' 60 C ' + (x + 2) + ' ' + (60 - h * .6) + ', ' + (x + 6) + ' ' + (60 - h * .85) + ', ' + (x + (i % 2 ? 9 : -7)) + ' ' + (60 - h) + '"/>';
        }
        return '<svg class="grass" aria-hidden="true" viewBox="0 0 980 60" preserveAspectRatio="none">' + s + '</svg>';
    }

    var root = document.getElementById("years");
    years.forEach(function (year) {
        var list = byYear[year].sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
        var kind = kindOf(year), K = FLOWER_KINDS[kind];
        var sec = document.createElement("section");
        sec.className = "yearsec";
        sec.setAttribute("aria-label", year + "年");

        var col = document.createElement("div");
        col.className = "flowercol";
        col.innerHTML = '<div><h2 class="year">' + year + '</h2><div class="kind">' + K.name + '</div></div>' + bigFlower(year, kind, list.length) +
            (list.length ? '<div class="hint">花びらを押すと、その日へ</div>' : '');
        sec.appendChild(col);

        var cards = document.createElement("div");
        cards.className = "cards";
        if (!list.length) {
            var p = document.createElement("p");
            p.className = "empty";
            p.textContent = "今年の花は、まだつぼみです。";
            cards.appendChild(p);
        }
        list.forEach(function (e, i) {
            var art = document.createElement("article");
            art.className = "card";
            art.id = "k" + year + "-" + i;
            art.dataset.y = year;
            art.dataset.i = i;
            art.innerHTML = '<div class="pf"><svg viewBox="0 0 100 100" aria-hidden="true">' + flowerPetals(kind, K.slots, 44, 50, 50, "p") + '</svg></div>';
            var d = document.createElement("time");
            d.className = "date";
            d.dateTime = e.date;
            d.textContent = e.md;
            var t = document.createElement("p");
            t.className = "text";
            t.textContent = e.text;
            art.appendChild(d);
            art.appendChild(t);
            if (e.blog) {
                var a = document.createElement("a");
                a.className = "blog";
                a.href = e.blog;
                a.textContent = "ブログで続きを読む →";
                art.appendChild(a);
            }
            cards.appendChild(art);
            if (i % 2 === 0 && i < list.length - 1) cards.insertAdjacentHTML("beforeend", sprig(i % 4 === 0 ? "right" : "left", i % 4 !== 0));
        });
        sec.appendChild(cards);
        sec.insertAdjacentHTML("beforeend", grass());
        root.appendChild(sec);
    });

    function petalEls(y, i) { return document.querySelectorAll('.petal[data-y="' + y + '"][data-i="' + i + '"]'); }

    // 栞が見えたら、その日の花びらが開く
    var io = new IntersectionObserver(function (es) {
        es.forEach(function (x) {
            if (!x.isIntersecting) return;
            var c = x.target;
            c.classList.add("in");
            if (c.classList.contains("card")) petalEls(c.dataset.y, c.dataset.i).forEach(function (p) { p.classList.add("open"); });
            io.unobserve(c);
        });
    }, { threshold: .45 });
    document.querySelectorAll(".card, .sprig").forEach(function (c) { io.observe(c); });

    // 花の列が見えたら、茎と葉が伸びる
    var io2 = new IntersectionObserver(function (es) {
        es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("grown"); io2.unobserve(x.target); } });
    }, { threshold: .3 });
    document.querySelectorAll(".flowercol").forEach(function (f) { io2.observe(f); });

    // 花びらを押すと、その日の栞へ
    document.querySelectorAll(".petal").forEach(function (p) {
        p.addEventListener("click", function () {
            var c = document.getElementById("k" + p.dataset.y + "-" + p.dataset.i);
            if (!c) return;
            document.querySelectorAll(".now").forEach(function (n) { n.classList.remove("now"); });
            c.classList.add("now", "in");
            petalEls(p.dataset.y, p.dataset.i).forEach(function (q) { q.classList.add("now", "open"); });
            c.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    });
})();
