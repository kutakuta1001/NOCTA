/* 感動したこと（一言日記）のデータ
 *
 * 1 件 = { id: "入力ページの doc id", date: "YYYY-MM-DD", text: "本文（3 文ほど）",
 *         blog: "ブログ記事の URL（なければ書かない）", photo: { src: "img/<id>.jpg", w: 幅, h: 高さ }（なければ書かない） }
 * 並び順は問わない（表示側で年ごと・日付順に並べる）。
 * 年は date から決まる。足し方は docs/tff-kandou.md。
 */
window.TFF_KANDOU = [
];

/* 年ごとの花。書いていない年は、2026 の桜から順に
 * 桜 → コスモス → マーガレット → 椿 → ネモフィラ → ひまわり と一年ずつさかのぼって回す。
 * 決めたい年だけここに書く（例: 2027: "camellia"）。 */
window.TFF_KANDOU_FLOWERS = {
};
