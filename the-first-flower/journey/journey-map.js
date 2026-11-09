/**
 * journey-map.js
 * The First Flower — 旅の地図: 都道府県のタイル配置（12 列 × 14 行）と国名。
 * ID は ISO 3166-2（JP-01〜JP-47）。配置はブレインストーミングで選んだ案 A のもの。
 */
(function () {
    var JP_TILES = [
        { id: "JP-01", name: "北海道", col: 12, row: 1 },
        { id: "JP-02", name: "青森", col: 11, row: 3 },
        { id: "JP-03", name: "岩手", col: 11, row: 4 },
        { id: "JP-04", name: "宮城", col: 11, row: 5 },
        { id: "JP-05", name: "秋田", col: 10, row: 4 },
        { id: "JP-06", name: "山形", col: 10, row: 5 },
        { id: "JP-07", name: "福島", col: 11, row: 6 },
        { id: "JP-08", name: "茨城", col: 12, row: 8 },
        { id: "JP-09", name: "栃木", col: 12, row: 7 },
        { id: "JP-10", name: "群馬", col: 11, row: 7 },
        { id: "JP-11", name: "埼玉", col: 11, row: 8 },
        { id: "JP-12", name: "千葉", col: 12, row: 9 },
        { id: "JP-13", name: "東京", col: 11, row: 9 },
        { id: "JP-14", name: "神奈川", col: 10, row: 9 },
        { id: "JP-15", name: "新潟", col: 10, row: 6 },
        { id: "JP-16", name: "富山", col: 9, row: 6 },
        { id: "JP-17", name: "石川", col: 8, row: 6 },
        { id: "JP-18", name: "福井", col: 8, row: 7 },
        { id: "JP-19", name: "山梨", col: 10, row: 8 },
        { id: "JP-20", name: "長野", col: 10, row: 7 },
        { id: "JP-21", name: "岐阜", col: 9, row: 7 },
        { id: "JP-22", name: "静岡", col: 9, row: 9 },
        { id: "JP-23", name: "愛知", col: 9, row: 8 },
        { id: "JP-24", name: "三重", col: 8, row: 10 },
        { id: "JP-25", name: "滋賀", col: 8, row: 8 },
        { id: "JP-26", name: "京都", col: 7, row: 8 },
        { id: "JP-27", name: "大阪", col: 7, row: 9 },
        { id: "JP-28", name: "兵庫", col: 6, row: 9 },
        { id: "JP-29", name: "奈良", col: 8, row: 9 },
        { id: "JP-30", name: "和歌山", col: 7, row: 10 },
        { id: "JP-31", name: "鳥取", col: 5, row: 9 },
        { id: "JP-32", name: "島根", col: 4, row: 9 },
        { id: "JP-33", name: "岡山", col: 5, row: 10 },
        { id: "JP-34", name: "広島", col: 4, row: 10 },
        { id: "JP-35", name: "山口", col: 3, row: 10 },
        { id: "JP-36", name: "徳島", col: 5, row: 12 },
        { id: "JP-37", name: "香川", col: 5, row: 11 },
        { id: "JP-38", name: "愛媛", col: 4, row: 11 },
        { id: "JP-39", name: "高知", col: 4, row: 12 },
        { id: "JP-40", name: "福岡", col: 2, row: 11 },
        { id: "JP-41", name: "佐賀", col: 1, row: 11 },
        { id: "JP-42", name: "長崎", col: 1, row: 12 },
        { id: "JP-43", name: "熊本", col: 2, row: 12 },
        { id: "JP-44", name: "大分", col: 3, row: 12 },
        { id: "JP-45", name: "宮崎", col: 3, row: 13 },
        { id: "JP-46", name: "鹿児島", col: 2, row: 13 },
        { id: "JP-47", name: "沖縄", col: 1, row: 14 },
    ];

    // 国の日本語名（ISO 3166-1 alpha-2）。計画 2 で国が増えたら足す
    var COUNTRY_NAMES = {
        HK: "香港",
        TW: "台湾",
        KR: "韓国",
        US: "アメリカ",
        FR: "フランス",
        IT: "イタリア",
        TH: "タイ",
        SG: "シンガポール",
    };

    var api = { JP_TILES: JP_TILES, COUNTRY_NAMES: COUNTRY_NAMES };
    if (typeof module !== "undefined") module.exports = api;
    else { window.JP_TILES = JP_TILES; window.COUNTRY_NAMES = COUNTRY_NAMES; }
})();
