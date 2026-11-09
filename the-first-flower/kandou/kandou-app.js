/* 感動したこと: kandou-data.js を 6 件で一輪の花と栞にして並べる（描画の部品は flower-kinds.js） */
(function () {
    var ORDER = ["sakura", "cosmos", "daisy", "camellia", "nemophila", "sunflower"];
    var BASE_YEAR = 2026;   // 桜の年。ここから一年さかのぼるごとに ORDER の次の花（その年の一輪目）
    var PER_FLOWER = 6;     // 一輪が満開になる件数。年の中で日付順に 6 件ずつ区切り、二輪目からは ORDER の次の花
    var KANJI = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

    // 6 件でちょうど満開になるよう、花びらの数を 6 の倍数に揃える（1 件 = 満開の 1/6）
    FLOWER_KINDS.sakura.slots = 6;
    FLOWER_KINDS.cosmos.slots = 6;
    FLOWER_KINDS.nemophila.slots = 6;
    FLOWER_KINDS.daisy.slots = 12;
    FLOWER_KINDS.camellia.slots = 12;
    FLOWER_KINDS.camellia.rings = [{ n: 6, off: 0, ls: 1, layer: 0, tone: 0 }, { n: 6, off: 30, ls: .76, layer: 1, tone: 1 }];
    FLOWER_KINDS.sunflower.slots = 18;
    FLOWER_KINDS.sunflower.rings = [{ n: 12, off: 0, ls: 1, layer: 0, tone: 0 }, { n: 6, off: 15, ls: .86, layer: -1, tone: 1 }];
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
        var ph = e.photo && /^img\/[\w-]+\.jpg$/.test(e.photo.src || "") ? e.photo : null;
        var mu = e.music && /^[\w-]{11}$/.test(e.music.id || "") ? { id: e.music.id, start: Math.max(0, Math.floor(+e.music.start || 0)) } : null;
        (byYear[y] = byYear[y] || []).push({ md: m[2] + "." + m[3], date: e.date, text: e.text, blog: safeHref(e.blog), photo: ph, music: mu });
    });
    var years = Object.keys(byYear).map(Number).sort(function (a, b) { return b - a; });

    // m 件書いた一輪。花びら i は (i * 6 / 枚数) 件目の栞に結びつく
    function bigFlower(key, kind, m) {
        var S = FLOWER_KINDS[kind].slots, n = S * m / PER_FLOWER;
        var ex = function (i) { return 'data-y="' + key + '" data-i="' + Math.floor(i * PER_FLOWER / S) + '"'; };
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
    // 曲: はじめはサムネイルだけ。押したらその場で YouTube の再生に差し替える（ページを重くしない）
    function musicEl(mu, md) {
        var wrap = document.createElement("div");
        wrap.className = "music";
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "music-play";
        btn.setAttribute("aria-label", md + " の曲を再生する");
        var im = document.createElement("img");
        im.src = "https://i.ytimg.com/vi/" + mu.id + "/mqdefault.jpg";
        im.alt = "";
        im.loading = "lazy";
        btn.appendChild(im);
        btn.insertAdjacentHTML("beforeend", '<span class="music-mark" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg></span>');
        btn.addEventListener("click", function () {
            var f = document.createElement("iframe");
            f.src = "https://www.youtube-nocookie.com/embed/" + mu.id + "?autoplay=1&rel=0" + (mu.start ? "&start=" + mu.start : "");
            f.title = md + " の曲";
            f.allow = "autoplay; encrypted-media; picture-in-picture";
            f.allowFullscreen = true;
            wrap.replaceChild(f, btn);
        });
        wrap.appendChild(btn);
        var a = document.createElement("a");
        a.className = "music-out";
        a.href = "https://www.youtube.com/watch?v=" + mu.id + (mu.start ? "&t=" + mu.start + "s" : "");
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = "YouTube で開く ↗";
        var box = document.createElement("div");
        box.appendChild(wrap);
        box.appendChild(a);
        return box;
    }

    var blocks = [];
    years.forEach(function (year) {
        var all = byYear[year].sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
        var count = Math.max(1, Math.ceil(all.length / PER_FLOWER)), first = ORDER.indexOf(kindOf(year)), c;
        for (c = 0; c < count; c++) {
            blocks.push({ year: year, c: c, many: count > 1, last: c === count - 1,
                kind: ORDER[(first + c) % ORDER.length], list: all.slice(c * PER_FLOWER, (c + 1) * PER_FLOWER) });
        }
    });

    blocks.forEach(function (B) {
        var year = B.year, list = B.list, kind = B.kind, K = FLOWER_KINDS[kind], key = year + "-" + B.c;
        var nth = (KANJI[B.c] || String(B.c + 1)) + "輪目";
        var sec = document.createElement("section");
        sec.className = "yearsec" + (B.last ? "" : " same-year");
        sec.setAttribute("aria-label", year + "年" + (B.many ? " " + nth : ""));

        var col = document.createElement("div");
        col.className = "flowercol";
        col.innerHTML = '<div><h2 class="year">' + year + '</h2><div class="kind">' + (B.many ? nth + " " : "") + K.name + '</div></div>' + bigFlower(key, kind, list.length) +
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
            art.id = "k" + key + "-" + i;
            art.dataset.y = key;
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
            if (e.photo) {
                var pb = document.createElement("button");
                pb.type = "button";
                pb.className = "photo";
                pb.setAttribute("aria-label", e.md + " の写真を大きく見る");
                var im = document.createElement("img");
                im.src = e.photo.src;
                im.alt = e.md + " の写真";
                im.loading = "lazy";
                if (e.photo.w && e.photo.h) { im.width = e.photo.w; im.height = e.photo.h; }
                pb.appendChild(im);
                pb.addEventListener("click", function () { openPhoto(im); });
                art.appendChild(pb);
            }
            if (e.music) art.appendChild(musicEl(e.music, e.md));
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
        if (B.last) sec.insertAdjacentHTML("beforeend", grass());   // 下草は年の終わりだけ
        root.appendChild(sec);
    });

    // 写真を大きく見る（押すか Esc で閉じる）
    var lb = document.getElementById("lb"), lbImg = lb.querySelector("img");
    function openPhoto(im) {
        lbImg.src = im.src;
        lbImg.alt = im.alt;
        lb.showModal();
    }
    lb.addEventListener("click", function () { lb.close(); });

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
