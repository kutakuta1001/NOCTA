// 旅の地図: 公開データの検証と整形のテスト。実行: node --test tests/journey/
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const core = require("../../website/the-first-flower/journey/journey-core.js");
const SAMPLE = require("./fixtures/journey-sample.js");
const clone = () => structuredClone(SAMPLE);

test("validate-accepts-sample", () => {
    const r = core.validateJourney(SAMPLE);
    assert.equal(r.ok, true, r.errors.join("\n"));
});

test("validate-rejects-extra-photo-field", () => {
    const d = clone();
    d.photos.a000000000000001.lat = 35.0;
    const r = core.validateJourney(d);
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => e.includes("lat")));
});

test("validate-rejects-bad-src", () => {
    for (const src of ["../secret.jpg", "https://example.com/a.jpg"]) {
        const d = clone();
        d.photos.a000000000000001.src = src;
        assert.equal(core.validateJourney(d).ok, false, src);
    }
});

test("validate-rejects-missing-photo", () => {
    const d = clone();
    d.regions[4].photoIds.push("ffffffffffffffff");
    assert.equal(core.validateJourney(d).ok, false);
});

test("validate-rejects-four-photos", () => {
    const d = clone();
    d.regions[0].photoIds.push("a000000000000006");
    assert.equal(core.validateJourney(d).ok, false);
});

test("validate-rejects-duplicate-region-id", () => {
    const d = clone();
    d.regions.push({ ...d.regions[4] });
    assert.equal(core.validateJourney(d).ok, false);
});

test("validate-rejects-bad-taken", () => {
    const d = clone();
    d.photos.a000000000000001.taken = "2017/02";
    assert.equal(core.validateJourney(d).ok, false);
});

test("published-hides-one-photo", () => {
    const ids = core.publishedRegions(SAMPLE).map((r) => r.id);
    assert.ok(!ids.includes("JP-20"));
    assert.ok(!ids.includes("place-biei"));
    for (const id of ["JP-01", "place-otaru", "JP-26", "HK"]) assert.ok(ids.includes(id), id);
});

test("places-of-hokkaido", () => {
    assert.deepEqual(core.placesOf(SAMPLE, "JP-01").map((r) => r.id), ["place-otaru"]);
});

test("label-place", () => {
    assert.equal(core.regionLabel(SAMPLE, "place-otaru"), "北海道 › 小樽");
    assert.equal(core.regionLabel(SAMPLE, "HK"), "香港");
});

test("visited", () => {
    assert.equal(core.isVisited(SAMPLE, "JP-01"), true);
    assert.equal(core.isVisited(SAMPLE, "JP-20"), false);
});

test("empty-data", () => {
    const empty = { schemaVersion: 1, regions: [], photos: {} };
    assert.deepEqual(core.publishedRegions(empty), []);
    assert.equal(core.validateJourney(empty).ok, true);
});
