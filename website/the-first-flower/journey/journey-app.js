/**
 * journey-app.js
 * The First Flower — 旅の地図: 描画と操作。データの検証・整形は journey-core.js。
 * 文字はすべて textContent で入れる（ひとことに記号が入ってもページを壊さない）。
 */
(function () {
    var core = window.JourneyCore;
    var raw = typeof TFF_JOURNEY !== "undefined" ? TFF_JOURNEY : null;
    var check;
    try {
        check = raw ? core.validateJourney(raw) : { ok: false, errors: ["TFF_JOURNEY がない"] };
    } catch (e) {
        check = { ok: false, errors: [String(e)] };
    }
    if (!check.ok) console.warn("旅の地図: 公開データを使えません", check.errors);
    var data = check.ok ? raw : { schemaVersion: 1, regions: [], photos: {} };

    var EMPTY_TEXT = "旅の写真は準備中です。";
    var ERROR_TEXT = "写真を読み込めませんでした";
    var LOADING_TEXT = "読み込み中";
    var LOADING_DELAY_MS = 300; // 手元にある写真で一瞬だけ出ないように待つ
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var $ = function (sel) { return document.querySelector(sel); };
    var map = $("#jr-map"), list = $("#jr-list"), thumbs = $("#jr-thumbs"), places = $("#jr-places");
    var main = $("img.jr-main"), status = $("#jr-status"), label = $("#jr-label");
    var taken = $("#jr-taken"), caption = $("#jr-caption"), photoBox = $("#jr-photo");

    var published = core.publishedRegions(data);
    var byId = {};
    data.regions.forEach(function (r) { byId[r.id] = r; });

    var state = { mode: "jp", regionId: null, photoId: null, token: 0 };

    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text !== undefined) n.textContent = text;
        return n;
    }

    // 地図の上で光らせる地域（地点なら親）
    function topRegionId(id) {
        var r = byId[id];
        return r && r.kind === "place" ? r.parentId : id;
    }

    function buildMap() {
        JP_TILES.forEach(function (t) {
            var b = el("button", "jr-tile", t.name.charAt(0));
            b.type = "button";
            b.dataset.region = t.id;
            b.style.gridColumn = String(t.col);
            b.style.gridRow = String(t.row);
            if (core.isVisited(data, t.id)) {
                b.classList.add("is-visited");
                b.setAttribute("aria-label", t.name);
                b.setAttribute("aria-pressed", "false");
            } else {
                b.setAttribute("aria-disabled", "true");
                b.setAttribute("aria-label", t.name + "（まだ写真がありません）");
                b.title = "まだ写真がありません";
            }
            b.addEventListener("click", function () {
                if (b.getAttribute("aria-disabled") === "true") return;
                selectRegion(t.id, true);
            });
            map.appendChild(b);
        });
    }

    function regionsForMode(mode) {
        var kind = mode === "jp" ? "pref" : "country";
        var rs = published.filter(function (r) { return r.kind === kind; });
        if (mode === "jp") {
            var order = {};
            JP_TILES.forEach(function (t, i) { order[t.id] = i; });
            rs.sort(function (a, b) { return order[a.id] - order[b.id]; });
        }
        return rs;
    }

    function renderList() {
        list.textContent = "";
        regionsForMode(state.mode).forEach(function (r) {
            var li = el("li");
            var b = el("button", "jr-chip", r.name);
            b.type = "button";
            b.dataset.region = r.id;
            b.setAttribute("aria-pressed", String(topRegionId(state.regionId) === r.id));
            b.addEventListener("click", function () { selectRegion(r.id, true); });
            li.appendChild(b);
            list.appendChild(li);
        });
    }

    function setMode(mode) {
        state.mode = mode;
        document.querySelectorAll("#jr-tabs button").forEach(function (b) {
            b.setAttribute("aria-selected", String(b.dataset.mode === mode));
        });
        map.hidden = mode !== "jp";
        renderList();
    }

    function renderPlaces(region) {
        places.textContent = "";
        var parentId = topRegionId(region.id);
        var subs = core.placesOf(data, parentId);
        if (!subs.length) return;
        [byId[parentId]].concat(subs).forEach(function (r) {
            var b = el("button", "jr-chip", r.kind === "place" ? r.name : r.name + "の代表");
            b.type = "button";
            b.dataset.region = r.id;
            b.setAttribute("aria-pressed", String(r.id === region.id));
            b.addEventListener("click", function () { selectRegion(r.id, false); });
            places.appendChild(b);
        });
    }

    function renderThumbs(region) {
        thumbs.textContent = "";
        region.photoIds.forEach(function (pid) {
            var p = data.photos[pid];
            var b = el("button", "jr-thumb");
            b.type = "button";
            b.dataset.photo = pid;
            b.setAttribute("aria-label", p.alt);
            var img = el("img");
            img.src = p.thumb;
            img.alt = "";
            img.loading = "lazy";
            b.appendChild(img);
            b.addEventListener("click", function () { showPhoto(pid); });
            thumbs.appendChild(b);
        });
    }

    function showPhoto(pid) {
        var p = data.photos[pid];
        var token = ++state.token;
        state.photoId = pid;
        status.textContent = "";
        main.hidden = false;
        main.classList.add("is-loading");
        setTimeout(function () {
            if (token === state.token && main.classList.contains("is-loading") && !main.hidden) status.textContent = LOADING_TEXT;
        }, LOADING_DELAY_MS);
        main.onload = function () {
            if (token !== state.token) return;
            main.classList.remove("is-loading");
            status.textContent = "";
        };
        main.onerror = function () {
            if (token !== state.token) return;
            main.hidden = true;
            status.textContent = ERROR_TEXT;
        };
        main.alt = p.alt;
        main.src = p.src;
        taken.textContent = p.taken ? p.taken.replace("-", ".") : "";
        caption.textContent = p.caption || "";
        thumbs.querySelectorAll("button").forEach(function (b) {
            b.setAttribute("aria-current", String(b.dataset.photo === pid));
        });
    }

    function selectRegion(id, fromMapOrList) {
        var region = byId[id];
        if (!region || !core.isVisited(data, id)) return;
        state.regionId = id;
        var top = topRegionId(id);
        map.querySelectorAll(".jr-tile").forEach(function (b) {
            var on = b.dataset.region === top;
            b.classList.toggle("is-current", on);
            if (b.classList.contains("is-visited")) b.setAttribute("aria-pressed", String(on));
        });
        list.querySelectorAll("button").forEach(function (b) {
            b.setAttribute("aria-pressed", String(b.dataset.region === top));
        });
        label.textContent = core.regionLabel(data, id);
        renderPlaces(region);
        renderThumbs(region);
        showPhoto(region.photoIds[0]);
        if (fromMapOrList && window.matchMedia("(max-width: 767px)").matches) {
            photoBox.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        }
    }

    function showEmpty() {
        main.hidden = true;
        status.textContent = EMPTY_TEXT;
    }

    document.querySelectorAll("#jr-tabs button").forEach(function (b) {
        b.addEventListener("click", function () { setMode(b.dataset.mode); });
    });

    buildMap();
    setMode("jp");
    var first = regionsForMode("jp")[0] || regionsForMode("world")[0];
    if (first) {
        if (first.kind === "country") setMode("world");
        selectRegion(first.id, false);
    } else {
        showEmpty();
    }
})();
