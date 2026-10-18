/**
 * 旅の地図ページの試し用データ（テストとページの check で使う）。
 * 形は website/the-first-flower/journey/tff-journey-data.js と同じ。
 */
const TFF_JOURNEY = {
    schemaVersion: 1,
    regions: [
        { id: "JP-01", kind: "pref", parentId: null, name: "北海道", photoIds: ["a000000000000001", "a000000000000002", "a000000000000004"] },
        { id: "place-otaru", kind: "place", parentId: "JP-01", name: "小樽", photoIds: ["a000000000000001", "a000000000000002"] },
        { id: "place-biei", kind: "place", parentId: "JP-01", name: "美瑛", photoIds: ["a000000000000004"] },
        { id: "JP-20", kind: "pref", parentId: null, name: "長野", photoIds: ["a000000000000005"] },
        { id: "JP-26", kind: "pref", parentId: null, name: "京都", photoIds: ["a000000000000006", "a000000000000007"] },
        { id: "HK", kind: "country", parentId: null, name: "香港", photoIds: ["a000000000000008", "a000000000000009"] },
    ],
    photos: {
        a000000000000001: { src: "img/a000000000000001.jpg", thumb: "img/a000000000000001-s.jpg", w: 1600, h: 1067, taken: "2017-02", caption: "運河の夜", alt: "小樽運河の夜景" },
        a000000000000002: { src: "img/a000000000000002.jpg", thumb: "img/a000000000000002-s.jpg", w: 1600, h: 1067, taken: "2017-02", caption: "<b>\"夜\"</b>", alt: "小樽の坂" },
        a000000000000004: { src: "img/a000000000000004.jpg", thumb: "img/a000000000000004-s.jpg", w: 1600, h: 1067, taken: "2019-07", caption: null, alt: "美瑛の丘" },
        a000000000000005: { src: "img/a000000000000005.jpg", thumb: "img/a000000000000005-s.jpg", w: 1600, h: 1067, taken: null, caption: null, alt: "上高地" },
        a000000000000006: { src: "img/a000000000000006.jpg", thumb: "img/a000000000000006-s.jpg", w: 1600, h: 1067, taken: "2018-11", caption: null, alt: "嵐山の紅葉" },
        a000000000000007: { src: "img/a000000000000007.jpg", thumb: "img/a000000000000007-s.jpg", w: 1067, h: 1600, taken: "2018-11", caption: null, alt: "伏見の鳥居" },
        a000000000000008: { src: "img/a000000000000008.jpg", thumb: "img/a000000000000008-s.jpg", w: 1600, h: 1067, taken: "2016-03", caption: null, alt: "香港の夜景" },
        a000000000000009: { src: "img/a000000000000009.jpg", thumb: "img/a000000000000009-s.jpg", w: 1600, h: 1067, taken: "2016-03", caption: null, alt: "香港の市場" },
    },
};

if (typeof module !== "undefined") module.exports = TFF_JOURNEY;
