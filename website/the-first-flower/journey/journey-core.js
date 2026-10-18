/**
 * journey-core.js
 * The First Flower — 旅の地図: 公開データ（TFF_JOURNEY）の検証と整形。DOM には触れない。
 *
 * 公開する地域は採用写真が 2〜3 枚のものだけ。写真に置ける項目は PHOTO_FIELDS だけで、
 * 位置情報を入れる場所は作らない（設計書 docs/superpowers/specs/2026-10-18-tff-journey-map-design.md）。
 */
(function () {
    var PHOTO_FIELDS = ["src", "thumb", "w", "h", "taken", "caption", "alt"];
    var REGION_FIELDS = ["id", "kind", "parentId", "name", "photoIds"];
    var KINDS = ["pref", "country", "place"];
    var IMG_RE = /^img\/[a-f0-9]{16}(-s)?\.jpg$/;
    var TAKEN_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
    var ID_RE = /^(JP-(0[1-9]|[1-3][0-9]|4[0-7])|[A-Z]{2}|place-[a-z0-9-]+)$/;
    var MIN_PHOTOS = 2;
    var MAX_PHOTOS = 3;

    function validateJourney(data) {
        var errors = [];
        if (!data || data.schemaVersion !== 1) errors.push("schemaVersion は 1");
        var regions = (data && Array.isArray(data.regions)) ? data.regions : [];
        var photos = (data && data.photos && typeof data.photos === "object") ? data.photos : {};
        if (data && !Array.isArray(data.regions)) errors.push("regions は配列");

        Object.keys(photos).forEach(function (pid) {
            var p = photos[pid];
            if (!p || typeof p !== "object") { errors.push("写真 " + pid + " が不正"); return; }
            if (!/^[a-f0-9]{16}$/.test(pid)) errors.push("写真 ID が不正: " + pid);
            Object.keys(p).forEach(function (k) {
                if (PHOTO_FIELDS.indexOf(k) < 0) errors.push("写真 " + pid + " に許可されない項目: " + k);
            });
            if (p.src !== "img/" + pid + ".jpg" || !IMG_RE.test(p.src)) errors.push("写真 " + pid + " の src が不正");
            if (p.thumb !== "img/" + pid + "-s.jpg" || !IMG_RE.test(p.thumb)) errors.push("写真 " + pid + " の thumb が不正");
            if (!(p.w > 0) || !(p.h > 0)) errors.push("写真 " + pid + " の w/h が不正");
            if (p.taken !== null && !TAKEN_RE.test(p.taken)) errors.push("写真 " + pid + " の taken が不正");
            if (p.caption !== null && typeof p.caption !== "string") errors.push("写真 " + pid + " の caption が不正");
            if (typeof p.alt !== "string") errors.push("写真 " + pid + " の alt が不正");
        });

        var seen = {};
        regions = regions.filter(function (r) {
            if (r && typeof r === "object") return true;
            errors.push("地域に不正な項目がある");
            return false;
        });
        regions.forEach(function (r) {
            Object.keys(r).forEach(function (k) {
                if (REGION_FIELDS.indexOf(k) < 0) errors.push("地域 " + r.id + " に許可されない項目: " + k);
            });
            if (!ID_RE.test(r.id)) errors.push("地域 ID が不正: " + r.id);
            if (seen[r.id]) errors.push("地域 ID が重複: " + r.id);
            seen[r.id] = true;
            if (KINDS.indexOf(r.kind) < 0) errors.push("地域 " + r.id + " の kind が不正");
            if (typeof r.name !== "string" || !r.name) errors.push("地域 " + r.id + " の name が不正");
            if (!Array.isArray(r.photoIds)) { errors.push("地域 " + r.id + " の photoIds は配列"); return; }
            if (r.photoIds.length > MAX_PHOTOS) errors.push("地域 " + r.id + " の写真が " + MAX_PHOTOS + " 枚を超える");
            r.photoIds.forEach(function (pid) {
                if (!photos[pid]) errors.push("地域 " + r.id + " が存在しない写真を参照: " + pid);
            });
        });
        regions.forEach(function (r) {
            if (r.kind === "place") {
                if (!seen[r.parentId]) errors.push("地点 " + r.id + " の親が存在しない");
            } else if (r.parentId !== null) {
                errors.push("地域 " + r.id + " の parentId は null");
            }
        });
        return { ok: errors.length === 0, errors: errors };
    }

    function find(data, id) {
        for (var i = 0; i < data.regions.length; i++) if (data.regions[i].id === id) return data.regions[i];
        return null;
    }

    function hasEnough(r) {
        return r.photoIds.length >= MIN_PHOTOS && r.photoIds.length <= MAX_PHOTOS;
    }

    function publishedRegions(data) {
        return data.regions.filter(function (r) {
            if (!hasEnough(r)) return false;
            if (r.kind !== "place") return true;
            var parent = find(data, r.parentId);
            return !!parent && hasEnough(parent);
        });
    }

    function placesOf(data, parentId) {
        return publishedRegions(data).filter(function (r) { return r.kind === "place" && r.parentId === parentId; });
    }

    function regionLabel(data, regionId) {
        var r = find(data, regionId);
        if (!r) return "";
        if (r.kind !== "place") return r.name;
        var parent = find(data, r.parentId);
        return (parent ? parent.name + " › " : "") + r.name;
    }

    function isVisited(data, regionId) {
        return publishedRegions(data).some(function (r) { return r.id === regionId; });
    }

    var api = {
        validateJourney: validateJourney,
        publishedRegions: publishedRegions,
        placesOf: placesOf,
        regionLabel: regionLabel,
        isVisited: isVisited,
    };
    if (typeof module !== "undefined") module.exports = api; else window.JourneyCore = api;
})();
