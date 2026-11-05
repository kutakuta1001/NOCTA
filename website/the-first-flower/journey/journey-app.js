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
    var caption = $("#jr-caption"), photoBox = $("#jr-photo");
    var frame = $(".jr-frame"), pos = $("#jr-pos"), found = $("#jr-found");
    var prevBtn = $(".jr-prev"), nextBtn = $(".jr-next");

    var published = core.publishedRegions(data);
    var byId = {};
    data.regions.forEach(function (r) { byId[r.id] = r; });

    var state = { mode: "jp", regionId: null, photoId: null, token: 0, scrollUntil: 0 };

    // 見た写真は見た人のブラウザにだけ覚える（消えても演出が出直すだけ）
    var SEEN_KEY = "tff-journey-seen-2"; // 演出を作り直したので数え直す（2026-11-01）
    var seen = {};
    try { (JSON.parse(localStorage.getItem(SEEN_KEY)) || []).forEach(function (id) { seen[id] = true; }); } catch (e) {}
    function markSeen(pid) {
        if (seen[pid]) return false;
        seen[pid] = true;
        try { localStorage.setItem(SEEN_KEY, JSON.stringify(Object.keys(seen))); } catch (e) {}
        return true;
    }
    var allPhotoIds = {};
    published.forEach(function (r) { r.photoIds.forEach(function (pid) { allPhotoIds[pid] = true; }); });
    var totalPhotos = Object.keys(allPhotoIds).length;
    function renderFound() {
        var n = Object.keys(allPhotoIds).filter(function (pid) { return seen[pid]; }).length;
        found.textContent = "見つけた景色 ";
        found.appendChild(el("b", "", String(n)));
        found.appendChild(document.createTextNode(" / " + totalPhotos + " 枚"));
        found.hidden = !totalPhotos;
    }

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
                if (core.placesOf(data, t.id).length) b.classList.add("has-places");
                b.setAttribute("aria-label", t.name);
                b.setAttribute("aria-pressed", "false");
            } else {
                b.setAttribute("aria-disabled", "true");
                b.setAttribute("aria-label", t.name + "（まだ写真がありません）");
                b.title = "まだ写真がありません";
            }
            b.addEventListener("click", function () {
                if (b.getAttribute("aria-disabled") === "true") return;
                selectRegion(t.id, true, true);
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
            // 県をまたぐまとまり（夏フェスなど）は地図に出さず、県の後ろに並べる
            rs = rs.concat(published.filter(function (r) { return r.kind === "theme"; }));
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
            var subs = core.placesOf(data, r.id).length;
            if (subs) b.appendChild(el("span", "jr-sub-n", subs + "か所"));
            b.setAttribute("aria-pressed", String(topRegionId(state.regionId) === r.id));
            b.addEventListener("click", function () { selectRegion(r.id, true, true); });
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

    function renderTabCounts() {
        document.querySelectorAll("#jr-tabs button").forEach(function (b) {
            var n = regionsForMode(b.dataset.mode).length;
            b.querySelector(".jr-count").textContent = String(n);
            b.setAttribute("aria-label", (b.dataset.mode === "jp" ? "日本" : "世界") + "（" + n + " 地域）");
        });
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
            b.addEventListener("click", function () { selectRegion(r.id, false, true); });
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
            b.classList.toggle("is-new", !seen[pid]);
            b.addEventListener("click", function () { showPhoto(pid, true); });
            thumbs.appendChild(b);
        });
    }

    function showPhoto(pid, byViewer) {
        var p = data.photos[pid];
        var token = ++state.token;
        var isNew = markSeen(pid);
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
            // はじめて見た写真だけ、ページに演出（journey-fx.js）。最初に自動で出る 1 枚と、動きを減らす設定では出さない
            // スマホで写真まで流している間は待ち、流れ終わってから出す
            if (isNew && byViewer && !reduceMotion && window.JourneyFx) {
                setTimeout(function () {
                    if (token !== state.token) return;
                    JourneyFx.play(fxOrigin(byId[state.regionId].name));
                }, Math.max(0, state.scrollUntil - Date.now()));
            }
        };
        main.onerror = function () {
            if (token !== state.token) return;
            main.hidden = true;
            status.textContent = ERROR_TEXT;
        };
        frame.style.setProperty("--jr-ar", String(p.w / p.h));
        main.alt = p.alt;
        main.src = p.src;
        caption.textContent = p.caption || "";
        thumbs.querySelectorAll("button").forEach(function (b) {
            b.setAttribute("aria-current", String(b.dataset.photo === pid));
            if (b.dataset.photo === pid) b.classList.remove("is-new");
        });
        var ids = byId[state.regionId].photoIds, i = ids.indexOf(pid);
        pos.textContent = (i + 1) + " / " + ids.length;
        prevBtn.hidden = nextBtn.hidden = ids.length < 2;
        renderFound();
    }

    function step(d) {
        var ids = byId[state.regionId].photoIds;
        showPhoto(ids[(ids.indexOf(state.photoId) + d + ids.length) % ids.length], true);
    }


    function selectRegion(id, fromMapOrList, byViewer) {
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
        showPhoto(region.photoIds[0], byViewer);
        if (fromMapOrList && window.matchMedia("(max-width: 767px)").matches) {
            state.scrollUntil = Date.now() + 650;
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
    // 演出の起点にする、最後に押した場所（キーボード操作なら写真の中央）
    // 押したあとにページが流れていたら（スマホ）、押した場所ではなく写真の中央を起点にする
    var lastPointer = null;
    document.addEventListener("pointerdown", function (e) { lastPointer = { x: e.clientX, y: e.clientY, sy: scrollY }; }, true);
    document.addEventListener("keydown", function () { lastPointer = null; }, true);
    function fxOrigin(text) {
        if (lastPointer && Math.abs(scrollY - lastPointer.sy) < 40) return { x: lastPointer.x, y: lastPointer.y, text: text };
        var b = frame.getBoundingClientRect();
        return { x: b.left + b.width / 2, y: b.top + b.height / 2, text: text };
    }
    prevBtn.addEventListener("click", function () { step(-1); });
    nextBtn.addEventListener("click", function () { step(1); });
    photoBox.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") step(-1);
        else if (e.key === "ArrowRight") step(1);
    });
    // スマホは写真を左右に払って次の写真へ
    var touchX = null;
    frame.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    frame.addEventListener("touchend", function (e) {
        if (touchX === null || !state.regionId) return;
        var dx = e.changedTouches[0].clientX - touchX;
        touchX = null;
        if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    });

    buildMap();
    renderTabCounts();
    setMode("jp");
    var first = regionsForMode("jp")[0] || regionsForMode("world")[0];
    if (first) {
        if (first.kind === "country") setMode("world");
        selectRegion(first.id, false);
    } else {
        showEmpty();
    }
})();
