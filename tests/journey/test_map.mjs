// 旅の地図: 都道府県タイル地図の定義のテスト。実行: node --test "tests/journey/test_*.mjs"
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { JP_TILES, COUNTRY_NAMES } = require("../../website/the-first-flower/journey/journey-map.js");

test("tiles-47", () => {
    assert.equal(JP_TILES.length, 47);
    const expected = Array.from({ length: 47 }, (_, i) => "JP-" + String(i + 1).padStart(2, "0"));
    assert.deepEqual(JP_TILES.map((t) => t.id).sort(), expected);
});

test("tiles-no-overlap", () => {
    const cells = new Set(JP_TILES.map((t) => t.col + "," + t.row));
    assert.equal(cells.size, 47);
    for (const t of JP_TILES) {
        assert.ok(t.col >= 1 && t.col <= 12, t.id);
        assert.ok(t.row >= 1 && t.row <= 14, t.id);
    }
});

test("tiles-names", () => {
    const byId = Object.fromEntries(JP_TILES.map((t) => [t.id, t.name]));
    assert.equal(byId["JP-01"], "北海道");
    assert.equal(byId["JP-13"], "東京");
    assert.equal(byId["JP-47"], "沖縄");
    assert.equal(COUNTRY_NAMES.HK, "香港");
});
