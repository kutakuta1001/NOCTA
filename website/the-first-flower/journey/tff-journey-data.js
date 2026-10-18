/**
 * tff-journey-data.js
 * The First Flower — 旅の地図の公開データ（作者が選んだ写真だけ）
 *
 * 計画 2 の書き出し道具が書き換える。手で直すときは項目を増やさない（journey-core.js の検証で弾かれる）。
 * 形: regions[] = { id, kind: "pref" | "country" | "place", parentId, name, photoIds }、
 *     photos{}  = { src, thumb, w, h, taken: "YYYY-MM" | null, caption: 文字列 | null, alt }
 */
const TFF_JOURNEY = {
    schemaVersion: 1,
    regions: [],
    photos: {},
};
