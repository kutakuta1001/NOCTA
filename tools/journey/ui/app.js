/* 旅の一枚を選ぶ — 画面の操作。文字はすべて textContent / value で入れる（計画書 K9） */
(function () {
    "use strict";
    var $ = function (s) { return document.querySelector(s); };
    var state = { region: null, regions: [], names: {}, daysPage: 0, reviewPage: 0, excludedPage: 0, rejectedPage: 0 };

    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text !== undefined && text !== null) n.textContent = text;
        return n;
    }
    function img(pid, alt) {
        var i = el("img");
        i.src = "/img/" + pid;
        i.alt = alt || "";
        i.loading = "lazy";
        return i;
    }
    function notice(text) { $("#notice").textContent = text || ""; }
    function day(ts) {
        if (!ts) return "撮影日不明";
        var d = new Date(ts * 1000);
        return d.getFullYear() + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + String(d.getDate()).padStart(2, "0");
    }

    function api(path, body) {
        var opt = body === undefined ? {} : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
        return fetch(path, opt).then(function (r) {
            return r.json().catch(function () { return {}; }).then(function (j) {
                if (!r.ok) throw new Error(j.error || ("エラー " + r.status));
                return j;
            });
        });
    }
    function fail(e) { notice(e.message); }

    /* ── 地域ごとに選ぶ ── */
    function loadRegions() {
        return api("/api/regions").then(function (j) {
            state.regions = j.regions;
            renderRegions();
        });
    }
    function renderRegions() {
        var q = $("#region-filter").value.trim();
        var list = $("#region-list");
        list.textContent = "";
        var tops = state.regions.filter(function (r) { return r.kind !== "place"; });
        tops.forEach(function (r) {
            var subs = state.regions.filter(function (p) { return p.parent_id === r.id; });
            [r].concat(subs).forEach(function (x) {
                if (q && x.name.indexOf(q) < 0) return;
                var li = el("li");
                var b = el("button");
                b.type = "button";
                if (x.kind === "place") b.classList.add("place");
                b.appendChild(el("span", "", x.name + "（" + x.photos + " 枚）"));
                b.appendChild(el("span", "count" + (x.selected >= 2 ? " full" : ""), x.selected + "/3"));
                b.setAttribute("aria-current", String(x.id === state.region));
                b.addEventListener("click", function () { openRegion(x.id); });
                li.appendChild(b);
                list.appendChild(li);
            });
        });
    }
    function openRegion(rid) {
        state.region = rid;
        renderRegions();
        return api("/api/candidates?region=" + encodeURIComponent(rid)).then(renderCandidates).catch(fail);
    }
    function renderCandidates(j) {
        $("#region-title").textContent = j.name;
        $("#region-count").textContent = "候補 " + j.photos.length + " 枚・選んだ " + j.selected + " / 3";
        var chosen = j.photos.filter(function (p) { return p.selected; });
        var ol = $("#chosen");
        ol.textContent = "";
        for (var i = 0; i < 3; i++) {
            var li = el("li");
            var p = chosen[i];
            if (p) {
                li.classList.add("filled");
                li.appendChild(img(p.id, ""));
                var input = el("input");
                input.type = "text";
                input.maxLength = 200;
                input.placeholder = "ひとこと（なくてもよい）";
                input.value = p.caption;
                input.setAttribute("aria-label", (i + 1) + " 枚目のひとこと");
                input.addEventListener("change", (function (pid, inp) {
                    return function () { decide(pid, { caption: inp.value }).then(function () { notice("ひとことを保存しました"); }); };
                })(p.id, input));
                li.appendChild(input);
            } else {
                li.appendChild(el("div", "empty", (i + 1) + " 枚目"));
            }
            ol.appendChild(li);
        }
        var grid = $("#grid");
        grid.textContent = "";
        var full = j.selected >= 3;
        j.photos.forEach(function (p) {
            var li = el("li", "tile" + (p.selected ? " is-selected" : ""));
            var b = el("button", "pick");
            b.type = "button";
            b.setAttribute("aria-pressed", String(p.selected));
            b.setAttribute("aria-label", day(p.taken_utc) + "の写真" + (p.selected ? "（選んだ）" : ""));
            b.appendChild(img(p.id, ""));
            if (!p.selected && full) b.title = "この地域はもう 3 枚選んでいます";
            b.addEventListener("click", function () {
                if (!p.selected && full) { notice("この地域はもう 3 枚選んでいます。どれかを外してから選んでください。"); return; }
                decide(p.id, { selected: !p.selected });
            });
            li.appendChild(b);
            if (p.selected) li.appendChild(el("span", "mark", (chosen.indexOf(p) + 1) + "/3"));
            var meta = el("div", "meta");
            meta.appendChild(el("span", "", day(p.taken_utc)));
            var rej = el("button", "", "却下");
            rej.type = "button";
            rej.title = "この写真をもう候補に出さない";
            rej.addEventListener("click", function () {
                if (window.confirm("この写真をどの地域の候補にも出さないようにします。「外した写真」のページから取り消せます。")) decide(p.id, { rejected: true });
            });
            meta.appendChild(rej);
            li.appendChild(meta);
            grid.appendChild(li);
        });
        if (!j.photos.length) grid.appendChild(el("li", "hint", "候補がありません。「候補を作り直す」を押すか、外した写真から戻してください。"));
    }
    function decide(pid, body) {
        body.photo_id = pid;
        body.region_id = state.region;
        return api("/api/decision", body).then(function () {
            notice("");
            return Promise.all([openRegion(state.region), loadRegions()]);
        }).catch(fail);
    }

    /* ── 日ごとの確認 ── */
    function loadDays() {
        var kind = document.querySelector('input[name="days-kind"]:checked').value;
        var q = (kind === "1" || kind === "0") ? "status=open&has_suggestion=" + kind : "status=" + kind + "&has_suggestion=any";
        api("/api/groups?" + q + "&page=" + state.daysPage).then(function (j) {
            var ul = $("#day-list");
            ul.textContent = "";
            if (!j.groups.length) ul.appendChild(el("li", "hint", "確認する日はありません。"));
            j.groups.forEach(function (g) {
                var li = el("li", "card");
                var now = g.region_id ? "：いまは " + (Object.keys(state.names).filter(function (n) { return state.names[n] === g.region_id; })[0] || g.region_id) : "";
                li.appendChild(el("h3", "", g.day.replace(/-/g, ".") + "（" + g.count + " 枚）" + now));
                var strip = el("div", "strip");
                g.sample.forEach(function (pid) { strip.appendChild(img(pid, "")); });
                li.appendChild(strip);
                var ch = el("div", "choices");
                g.suggestions.forEach(function (s) {
                    var b = el("button", "", s.name + (s.source === "album" ? "（アルバム名）" : "（同じ日 " + s.votes + " 枚）"));
                    b.type = "button";
                    b.addEventListener("click", function () { confirmGroup(g.group_id, s.region_id); });
                    ch.appendChild(b);
                });
                ch.appendChild(regionPicker("違う地域", function (rid) { confirmGroup(g.group_id, rid); }));
                var no = el("button", "quiet", "旅ではない");
                no.type = "button";
                no.addEventListener("click", function () {
                    if (window.confirm(g.day.replace(/-/g, ".") + " を旅ではない日にします。「旅ではない日」の一覧から直せます。")) confirmGroup(g.group_id, null);
                });
                ch.appendChild(no);
                li.appendChild(ch);
                ul.appendChild(li);
            });
        }).catch(fail);
    }
    function confirmGroup(gid, rid) {
        api("/api/group", { group_id: gid, region_id: rid }).then(function () {
            notice(rid ? "地域を付けました。写真の判定は「候補を作り直す」で行います。" : "旅ではない日にしました。");
            loadDays();
        }).catch(fail);
    }
    function regionPicker(label, onPick) {
        var wrap = el("span");
        var input = el("input");
        input.setAttribute("list", "region-names");
        input.placeholder = label;
        input.setAttribute("aria-label", label);
        var b = el("button", "", "この地域にする");
        b.type = "button";
        b.addEventListener("click", function () {
            var rid = state.names[input.value.trim()];
            if (!rid) { notice("地域名を一覧から選んでください（例: 京都・香港）"); return; }
            onPick(rid);
        });
        wrap.appendChild(input);
        wrap.appendChild(b);
        return wrap;
    }

    /* ── 場所の要確認 ── */
    function loadReview() {
        api("/api/review?page=" + state.reviewPage).then(function (j) {
            $("#review-total").textContent = "残り " + j.total + " 枚";
            var ul = $("#review-list");
            ul.textContent = "";
            j.photos.forEach(function (p) {
                var li = el("li", "card");
                var strip = el("div", "strip");
                strip.appendChild(img(p.id, ""));
                li.appendChild(strip);
                var ch = el("div", "choices");
                p.candidates.forEach(function (c) {
                    var b = el("button", "", c.name);
                    b.type = "button";
                    b.addEventListener("click", function () { override(p.id, c.id); });
                    ch.appendChild(b);
                });
                ch.appendChild(regionPicker("違う地域", function (rid) { override(p.id, rid); }));
                li.appendChild(ch);
                ul.appendChild(li);
            });
        }).catch(fail);
    }
    function override(pid, rid) {
        api("/api/override", { photo_id: pid, region_id: rid }).then(function () { notice("地域を付けました。"); loadReview(); }).catch(fail);
    }

    /* ── 外した写真 ── */
    var REASON = { people_tag: "人が写っている（Google の顔の判別）", person: "人が主役に見える", blurry: "ブレている" };
    function loadExcludedRegions() {
        var sel = $("#excluded-region");
        var keep = sel.value;
        sel.textContent = "";
        state.regions.forEach(function (r) {
            var o = el("option", "", r.name);
            o.value = r.id;
            sel.appendChild(o);
        });
        if (keep) sel.value = keep;
        loadExcluded();
    }
    function loadExcluded() {
        var rid = $("#excluded-region").value;
        if (!rid) return;
        api("/api/excluded?region=" + encodeURIComponent(rid) + "&page=" + state.excludedPage).then(function (j) {
            $("#excluded-total").textContent = "外した写真 " + j.total + " 枚（" + (state.excludedPage * 30 + 1) + "〜）";
            var ul = $("#excluded-list");
            ul.textContent = "";
            j.photos.forEach(function (p) {
                var li = el("li", "tile");
                li.appendChild(img(p.id, ""));
                li.appendChild(el("div", "meta", p.flags.map(function (f) { return REASON[f] || f; }).join("、")));
                var b = el("button", "", "候補に戻す");
                b.type = "button";
                b.addEventListener("click", function () {
                    api("/api/decision", { photo_id: p.id, region_id: rid, allow_excluded: true }).then(loadExcluded).catch(fail);
                });
                li.appendChild(b);
                ul.appendChild(li);
            });
            if (!j.photos.length) ul.appendChild(el("li", "hint", "この地域で外した写真はありません。"));
        }).catch(fail);
    }

    function loadRejected() {
        api("/api/rejected?page=" + state.rejectedPage).then(function (j) {
            $("#rejected-total").textContent = "却下した写真 " + j.total + " 枚";
            var ul = $("#rejected-list");
            ul.textContent = "";
            j.photos.forEach(function (p) {
                var li = el("li", "tile");
                li.appendChild(img(p.id, ""));
                var b = el("button", "", "却下を取り消す");
                b.type = "button";
                b.addEventListener("click", function () {
                    var rid = $("#excluded-region").value || (state.regions[0] && state.regions[0].id);
                    api("/api/decision", { photo_id: p.id, region_id: rid, rejected: false }).then(loadRejected).catch(fail);
                });
                li.appendChild(b);
                ul.appendChild(li);
            });
            if (!j.photos.length) ul.appendChild(el("li", "hint", "却下した写真はありません。"));
        }).catch(fail);
    }

    /* ── 地点 ── */
    function loadPlaces() {
        api("/api/places/proposals").then(function (j) {
            var ul = $("#proposal-list");
            ul.textContent = "";
            if (!j.proposals.length) ul.appendChild(el("li", "hint", "いまは提案がありません。"));
            j.proposals.forEach(function (p) {
                var li = el("li", "card");
                li.appendChild(el("h3", "", p.parent_name + "の中の " + p.count + " 枚が集まる場所（半径 " + p.radius_km + "km）"));
                var ch = el("div", "choices");
                var name = el("input");
                name.maxLength = 40;
                name.placeholder = "地点の名前（例: 小樽）";
                name.setAttribute("aria-label", "地点の名前");
                var b = el("button", "", "地点を作る");
                b.type = "button";
                b.addEventListener("click", function () {
                    if (!name.value.trim()) { notice("地点の名前を入れてください"); return; }
                    api("/api/place", { parent_id: p.parent_id, name: name.value.trim(), lat: p.lat, lng: p.lng, radius_km: p.radius_km })
                        .then(function () { notice("地点を作りました。地域の一覧に出ます。"); loadPlaces(); loadRegions(); loadNames(); }).catch(fail);
                });
                ch.appendChild(name);
                ch.appendChild(b);
                li.appendChild(ch);
                ul.appendChild(li);
            });
        }).catch(fail);
        renderReps();
    }
    function renderReps() {
        var area = $("#rep-area");
        area.textContent = "";
        var parents = state.regions.filter(function (r) {
            return r.kind !== "place" && state.regions.some(function (p) { return p.parent_id === r.id; });
        });
        if (!parents.length) { area.appendChild(el("p", "hint", "地点のある地域はまだありません。")); return; }
        parents.forEach(function (r) {
            var card = el("div", "card");
            card.appendChild(el("h3", "", r.name + "の代表"));
            var subs = state.regions.filter(function (p) { return p.parent_id === r.id; });
            var picked = [];
            var strip = el("div", "strip");
            Promise.all(subs.map(function (s) { return api("/api/candidates?region=" + encodeURIComponent(s.id)); })).then(function (lists) {
                lists.forEach(function (l) {
                    l.photos.filter(function (p) { return p.selected; }).forEach(function (p) {
                        var b = el("button", "pick");
                        b.type = "button";
                        b.setAttribute("aria-pressed", "false");
                        b.appendChild(img(p.id, ""));
                        b.addEventListener("click", function () {
                            var i = picked.indexOf(p.id);
                            if (i >= 0) picked.splice(i, 1); else if (picked.length < 3) picked.push(p.id);
                            b.setAttribute("aria-pressed", String(picked.indexOf(p.id) >= 0));
                            b.style.outline = picked.indexOf(p.id) >= 0 ? "3px solid var(--accent)" : "";
                        });
                        strip.appendChild(b);
                    });
                });
                if (!strip.childNodes.length) strip.appendChild(el("p", "hint", "先に地点で写真を選んでください。"));
            });
            card.appendChild(strip);
            var save = el("button", "", "この 2〜3 枚を代表にする");
            save.type = "button";
            save.addEventListener("click", function () {
                api("/api/representatives", { parent_id: r.id, photo_ids: picked }).then(function () { notice(r.name + "の代表を保存しました。"); }).catch(fail);
            });
            card.appendChild(save);
            area.appendChild(card);
        });
    }

    /* ── 共通 ── */
    function loadNames() {
        return api("/api/region_names").then(function (j) {
            var dl = $("#region-names");
            dl.textContent = "";
            state.names = {};
            j.regions.forEach(function (r) {
                state.names[r.name] = r.id;
                var o = el("option");
                o.value = r.name;
                dl.appendChild(o);
            });
        });
    }
    function showTab(name) {
        document.querySelectorAll("#tabs button").forEach(function (b) { b.setAttribute("aria-selected", String(b.dataset.tab === name)); });
        document.querySelectorAll(".tab").forEach(function (t) { t.hidden = t.id !== "tab-" + name; });
        notice("");
        if (name === "days") loadDays();
        if (name === "review") loadReview();
        if (name === "excluded") { loadExcludedRegions(); loadRejected(); }
        if (name === "places") loadPlaces();
        if (name === "pick") loadRegions();
    }
    document.querySelectorAll("#tabs button").forEach(function (b) { b.addEventListener("click", function () { showTab(b.dataset.tab); }); });
    document.querySelectorAll('input[name="days-kind"]').forEach(function (r) { r.addEventListener("change", function () { state.daysPage = 0; loadDays(); }); });
    $("#days-prev").addEventListener("click", function () { state.daysPage = Math.max(0, state.daysPage - 1); loadDays(); });
    $("#days-next").addEventListener("click", function () { state.daysPage += 1; loadDays(); });
    $("#review-prev").addEventListener("click", function () { state.reviewPage = Math.max(0, state.reviewPage - 1); loadReview(); });
    $("#review-next").addEventListener("click", function () { state.reviewPage += 1; loadReview(); });
    $("#excluded-region").addEventListener("change", function () { state.excludedPage = 0; loadExcluded(); });
    $("#excluded-prev").addEventListener("click", function () { state.excludedPage = Math.max(0, state.excludedPage - 1); loadExcluded(); });
    $("#excluded-next").addEventListener("click", function () { state.excludedPage += 1; loadExcluded(); });
    $("#rejected-prev").addEventListener("click", function () { state.rejectedPage = Math.max(0, state.rejectedPage - 1); loadRejected(); });
    $("#rejected-next").addEventListener("click", function () { state.rejectedPage += 1; loadRejected(); });
    $("#region-filter").addEventListener("input", renderRegions);
    $("#export").addEventListener("click", function () {
        notice("書き出しています…");
        api("/api/export", {}).then(function (r) {
            if (r.ok) notice("書き出しました: " + r.regions + " 地域・" + r.photos + " 枚。サイトに出すには、git でコミットして push してください。");
            else notice("書き出せませんでした（公開ファイルは前のまま）: " + r.reasons.join(" / "));
        }).catch(fail);
    });
    var timer = null;
    function pollReassess() {
        api("/api/reassess").then(function (s) {
            if (s.running) { notice("候補を作り直しています… " + s.done + " / " + s.total); timer = setTimeout(pollReassess, 2000); }
            else { notice(s.error ? "作り直せませんでした: " + s.error : "候補を作り直しました。"); loadRegions(); }
        });
    }
    $("#reassess").addEventListener("click", function () {
        api("/api/reassess", {}).then(function () { clearTimeout(timer); pollReassess(); }).catch(fail);
    });

    loadNames();
    loadRegions().then(function () { if (state.regions.length) openRegion(state.regions[0].id); }).catch(fail);
})();
