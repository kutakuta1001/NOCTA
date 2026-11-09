/* ============================================================
 * flower-kinds.js  --  The First Flower 「感動したこと」用 花の描き分け
 *
 * 6 種: sakura(桜) / cosmos(コスモス) / daisy(マーガレット) /
 *       camellia(椿) / nemophila(ネモフィラ) / sunflower(ひまわり)
 * 外部画像・ライブラリなし。インライン SVG 文字列を返す素の JS。
 *
 * ---- 使い方 ----
 *
 *  1. petals(kind, n, L, cx, cy, cls, extra, ghosts)  ->  flowerPetals(同じ引数)
 *       返り値: <defs>(花びら用グラデ) + ゴースト + 花びら + 中心 の SVG 文字列。
 *       花びら 1 枚 = <g class="cls" style="--r:角度deg" ...><g transform="translate(cx cy)">絵</g></g>
 *       なので CSS は v4 と同じ:
 *         .petal{ transform-box:view-box; transform-origin:140px 140px; transform:rotate(var(--r)) scale(.15); }
 *         .petal.open{ transform:rotate(var(--r)) scale(1); }
 *       n が K.slots を超えたら枠が n まで増える。ゴースト = <path class="ghost">（同じ輪郭）。
 *       小さい押し花は flowerPetals(kind, FLOWER_KINDS[kind].slots, 44, 50, 50, "p")。
 *
 *  2. 茎と葉:  flowerStalk(kind)  -> <path class="stem" pathLength="1"> と
 *       <g class="leafbig l1"> <g class="leafbig l2"> を返す（viewBox 0 0 280 360・花の中心 140,140 前提）。
 *       CSS 注意: 色は属性で持つので .stem の stroke / stroke-width と .leafbig の fill は CSS で指定しない。
 *         .stem{ fill:none; stroke-linecap:round; stroke-dasharray:1 2; stroke-dashoffset:1; }
 *         .grown .stem{ stroke-dashoffset:0; }
 *
 *  3. 補助:  flowerSlots(kind, n) -> 枠数 max(n, slots)
 *            flowerLeaf(kind)     -> 葉 1 枚の SVG（原点が付け根・上向き。図鑑用）
 *
 * ---- 各 kind のフィールド ----
 *  name, season, cue(見分けの一言), slots(基本の枠数),
 *  tones(花びらのグラデ。base->tip の stop 配列の配列), edge(輪郭色), vein([色,不透明度]),
 *  lscale(花全体の大きさ補正), rings(二段・八重の定義。無ければ一重),
 *  shape(L,o)  -> 花びらの輪郭 path d（中心 0,0 から上 0,-L へ）
 *  veins(L,o)  -> 筋の path d（大きい時だけ描く）  accent(L,o,big) -> 追加の絵
 *  center(L,cx,cy,big,uid) -> 中心の SVG   stem{p,color,w,leaves}  leaf() -> 葉
 *  o = { ang, ls(段の大きさ比), layer(重なり順), tone, fit(枚数が増えた時の細り), i }
 *
 * 描き分けの設計
 *  - 小さい押し花(L=44, 表示 50px) では筋・点を省き、輪郭・色・中心の形だけで見分ける。
 *  - 順番は stride で飛ばして並べる（件数が少ない年でも花が片寄らない）。
 * ============================================================ */

var FLOWER_KINDS = {

  /* ---------- 桜: 五弁・先に切れ込み・淡い桃白・長い雄しべ ---------- */
  sakura: {
    name: "桜", season: "春", cue: "五枚の花びら。先に切れ込み、中心から細い雄しべ",
    slots: 5, lscale: 1,
    tones: [
      [[0, "#EC86A6"], [.4, "#F5B5C9"], [1, "#FBE0E8"]],
      [[0, "#F09BB5"], [.4, "#F8C4D3"], [1, "#FDE9EE"]]
    ],
    edge: "#E59AB3", vein: ["#E07A9C", .5],
    shape: function (L, o) {
      var W = L * .5 * o.fit;
      return _sym([['C', .5, -.15, 1.05, -.5, .9, -.82], ['C', .8, -1.0, .4, -1.04, .14, -.96], ['L', 0, -.86]], L, W);
    },
    veins: function (L, o) { var W = L * .5 * o.fit; return _lines([[0, -.05, 0, -.5], [-.1, -.05, -.5, -.62], [.1, -.05, .5, -.62]], L, W); },
    accent: function (L, o, big) {
      var W = L * .5 * o.fit;
      return '<path d="M' + _n(-.3 * W) + ' ' + _n(-.93 * L) + ' L0 ' + _n(-.84 * L) + ' L' + _n(.3 * W) + ' ' + _n(-.93 * L) +
        '" fill="none" stroke="#DD6A90" stroke-width="' + (big ? 1.3 : 1.7) + '" stroke-opacity=".75" stroke-linecap="round" stroke-linejoin="round"/>';
    },
    center: function (L, cx, cy, big) {
      var n = big ? 16 : 10, r1 = L * .1, r2 = L * (big ? .36 : .3), dr = Math.max(1.6, L * .028), i, a, rr, c, sn, s;
      s = '<g transform="translate(' + cx + ' ' + cy + ')"><circle r="' + _n(L * .14) + '" fill="#E57C9E" opacity=".8"/>';
      for (i = 0; i < n; i++) {
        a = i / n * 6.2832 + (i % 2 ? .12 : 0); rr = r2 * (i % 2 ? .82 : 1); c = Math.cos(a); sn = Math.sin(a);
        s += '<line x1="' + _n(c * r1) + '" y1="' + _n(sn * r1) + '" x2="' + _n(c * rr) + '" y2="' + _n(sn * rr) + '" stroke="#D8678F" stroke-width="' + (big ? .9 : 1.3) + '"/>' +
          '<circle cx="' + _n(c * rr) + '" cy="' + _n(sn * rr) + '" r="' + _n(dr) + '" fill="#F2D074" stroke="#D8678F" stroke-width=".5"/>';
      }
      return s + '<circle r="' + _n(L * .045) + '" fill="#B9D68A"/></g>';
    },
    stem: { p: [[140, 160], [134, 215], [148, 280], [138, 350]], color: "#A58C84", w: 3.2,
      leaves: [{ t: .55, a: 42, s: 1 }, { t: .72, a: 40, s: .95 }] },
    leaf: function () {
      return '<path d="' + _toothLeaf(64, 17, 9, 2.4) + '" fill="#B3D7A2" stroke="#86AF7B" stroke-width=".9" stroke-linejoin="round"/>' +
        '<path d="M0 -3 L0 -58 M0 -18 L-8 -28 M0 -18 L8 -28 M0 -32 L-8 -42 M0 -32 L8 -42" fill="none" stroke="#86AF7B" stroke-width=".8" stroke-linecap="round"/>';
    }
  },

  /* ---------- コスモス: 八弁・先がギザギザ・濃い紫桃・黄色い粒の中心 ---------- */
  cosmos: {
    name: "コスモス", season: "秋", cue: "八枚の幅広い花びら。先が三つにギザギザ、中心は黄色い粒",
    slots: 8, lscale: 1,
    tones: [
      [[0, "#B168A8"], [.5, "#D58DBF"], [1, "#F2C4DD"]],
      [[0, "#A55A9C"], [.5, "#CE84B8"], [1, "#EDB9D6"]]
    ],
    edge: "#B070A6", vein: ["#8E4585", .38],
    shape: function (L, o) {
      var W = L * .42 * o.fit;
      return _sym([['C', .3, -.2, 1, -.55, 1, -.88], ['L', .66, -1], ['L', .33, -.84], ['L', 0, -1]], L, W);
    },
    veins: function (L, o) {
      var W = L * .42 * o.fit;
      return _lines([[0, -.05, 0, -.9], [-.1, -.05, -.66, -.92], [.1, -.05, .66, -.92], [-.05, -.05, -.33, -.78], [.05, -.05, .33, -.78]], L, W);
    },
    center: function (L, cx, cy, big, uid) {
      var s = '<defs><radialGradient id="' + uid + 'c"><stop offset="0" stop-color="#F7DC80"/><stop offset="1" stop-color="#DDAA44"/></radialGradient></defs>' +
        '<g transform="translate(' + cx + ' ' + cy + ')"><circle r="' + _n(L * .2) + '" fill="#A8559A" opacity=".45"/>' +
        '<circle r="' + _n(L * .14) + '" fill="url(#' + uid + 'c)"/>', n = big ? 14 : 6, i, a;
      for (i = 0; i < n; i++) { a = i / n * 6.2832; s += '<circle cx="' + _n(Math.cos(a) * L * .095) + '" cy="' + _n(Math.sin(a) * L * .095) + '" r="' + _n(Math.max(1.3, L * .017)) + '" fill="#B88428"/>'; }
      return s + '<circle r="' + _n(Math.max(1.6, L * .025)) + '" fill="#B88428"/></g>';
    },
    stem: { p: [[140, 160], [146, 215], [130, 285], [140, 350]], color: "#93C99F", w: 2.2,
      leaves: [{ t: .45, a: 35, s: 1 }, { t: .62, a: 38, s: 1 }] },
    leaf: function () {
      var s = '<g fill="none" stroke="#8CC79A" stroke-width="1.2" stroke-linecap="round"><path d="M0 0 C 1 -20, -1 -40, 0 -66"/>', k, y, w;
      for (k = 0; k < 5; k++) {
        y = -10 - k * 11; w = 17 - k * 2.4;
        s += '<path d="M0 ' + y + ' Q ' + _n(-w * .4) + ' ' + (y - 5) + ', ' + _n(-w) + ' ' + (y - 13) + '"/><path d="M0 ' + y + ' Q ' + _n(w * .4) + ' ' + (y - 5) + ', ' + _n(w) + ' ' + (y - 13) + '"/>';
      }
      return s + '</g>';
    }
  },

  /* ---------- マーガレット: 細い白い花びら十三枚・大きな黄色い円盤 ---------- */
  daisy: {
    name: "マーガレット", season: "初夏", cue: "細く長い白い花びらが放射状に十三枚、中心は大きな黄色い円盤",
    slots: 13, lscale: 1,
    tones: [
      [[0, "#EFE6F6"], [.5, "#FFFFFF"], [1, "#FCF0F4"]],
      [[0, "#F0E8F3"], [.5, "#FFFFFF"], [1, "#FFF9F2"]]
    ],
    edge: "#B9A6CF", vein: ["#CDBCE0", .9],
    shape: function (L, o) {
      var W = L * .14 * o.fit;
      return _sym([['C', .5, -.1, 1.05, -.4, 1, -.7], ['C', .95, -.93, .45, -1.0, 0, -1.0]], L, W);
    },
    veins: function (L, o) { var W = L * .14 * o.fit; return _lines([[0, -.1, 0, -.8], [-.35, -.15, -.5, -.75], [.35, -.15, .5, -.75]], L, W); },
    center: function (L, cx, cy, big, uid) {
      var R = L * (big ? .25 : .3), s = '<defs><radialGradient id="' + uid + 'c"><stop offset="0" stop-color="#F5D96E"/><stop offset="1" stop-color="#DFAE3E"/></radialGradient></defs>' +
        '<g transform="translate(' + cx + ' ' + cy + ')"><circle r="' + _n(R) + '" fill="url(#' + uid + 'c)" stroke="#C99A3A" stroke-width="' + (big ? 1 : 1.3) + '"/>';
      s += _phyl(big ? 28 : 7, R * .82, Math.max(1.2, L * .018), function () { return "#B8872C"; });
      return s + '</g>';
    },
    stem: { p: [[140, 160], [138, 220], [144, 290], [140, 350]], color: "#8FC49A", w: 2.6,
      leaves: [{ t: .5, a: 50, s: 1 }, { t: .7, a: 48, s: 1 }] },
    leaf: function () {
      return '<path d="' + _toothLeaf(62, 11, 7, 4.6) + '" fill="#A6D2A0" stroke="#74A774" stroke-width=".9" stroke-linejoin="round"/>' +
        '<path d="M0 -3 L0 -57" fill="none" stroke="#74A774" stroke-width=".8"/>';
    }
  },

  /* ---------- 椿: 丸い花びらの二段重ね(八重)・深い紅・黄色い雄しべの束 ---------- */
  camellia: {
    name: "椿", season: "冬", cue: "丸くて厚い紅の花びらを五枚ずつ二段に重ね、中心に黄色い雄しべの束",
    slots: 10, lscale: .93, overflowDir: 1,
    rings: [{ n: 5, off: 0, ls: 1, layer: 0, tone: 0 }, { n: 5, off: 36, ls: .76, layer: 1, tone: 1 }],
    tones: [
      [[0, "#A8405F"], [.45, "#CC617E"], [1, "#E896A8"]],
      [[0, "#9A3556"], [.5, "#BF5373"], [1, "#DB7E96"]]
    ],
    edge: "#9A3556", vein: ["#7E2848", .35],
    shape: function (L, o) {
      var W = L * .5 * o.fit;
      return _sym([['C', .35, -.12, 1.12, -.3, 1.05, -.62], ['C', 1.0, -.92, .45, -1.02, .12, -.97], ['L', 0, -.93]], L, W);
    },
    veins: function (L, o) {
      var W = L * .5 * o.fit;
      return _lines([[0, -.08, 0, -.7], [-.25, -.1, -.6, -.7], [.25, -.1, .6, -.7], [-.4, -.15, -.9, -.5], [.4, -.15, .9, -.5]], L, W);
    },
    center: function (L, cx, cy, big) {
      var n = big ? 28 : 14, s = '<g transform="translate(' + cx + ' ' + cy + ')"><circle r="' + _n(L * .13) + '" fill="#E3BC52" opacity=".9"/>', i, a, r, c, sn, dr = Math.max(1.4, L * .022);
      for (i = 0; i < n; i++) {
        a = i / n * 6.2832; r = L * (i % 2 ? .17 : .22); c = Math.cos(a); sn = Math.sin(a);
        s += '<line x1="' + _n(c * L * .04) + '" y1="' + _n(sn * L * .04) + '" x2="' + _n(c * r) + '" y2="' + _n(sn * r) + '" stroke="#E0B84C" stroke-width="' + (big ? .9 : 1.3) + '"/>' +
          '<circle cx="' + _n(c * r) + '" cy="' + _n(sn * r) + '" r="' + _n(dr) + '" fill="#F6DC7A" stroke="#C99A3A" stroke-width=".4"/>';
      }
      return s + '<circle r="' + _n(L * .05) + '" fill="#C99A3A"/></g>';
    },
    stem: { p: [[140, 162], [142, 215], [134, 290], [142, 350]], color: "#8A7762", w: 4,
      leaves: [{ t: .5, a: 48, s: 1.1 }, { t: .66, a: 46, s: 1.05 }] },
    leaf: function () {
      return '<path d="' + _toothLeaf(60, 21, 20, 1) + '" fill="#69A585" stroke="#437A5E" stroke-width=".9" stroke-linejoin="round"/>' +
        '<path d="M0 -3 L0 -56" fill="none" stroke="#B5DBC5" stroke-width="1.3" stroke-linecap="round"/>';
    }
  },

  /* ---------- ネモフィラ: 丸い青の五弁・白い中心・縁の黒点 ---------- */
  nemophila: {
    name: "ネモフィラ", season: "春", cue: "丸い空色の五弁。中心は白く抜け、花びらの先に小さな濃い点",
    slots: 5, lscale: 1,
    tones: [
      [[0, "#FFFFFF"], [.38, "#E4EFFA"], [.75, "#B6D2F0"], [1, "#9DC1EA"]],
      [[0, "#FFFFFF"], [.4, "#E8F1FB"], [.8, "#BCD6F1"], [1, "#A6C8EC"]]
    ],
    edge: "#86AEDC", vein: ["#7FA6D8", .4],
    shape: function (L, o) {
      var W = L * .42 * o.fit;
      return _sym([['C', .4, -.08, 1.1, -.3, 1.05, -.62], ['C', 1.0, -.92, .5, -1.02, 0, -1.0]], L, W);
    },
    veins: function (L, o) {
      var W = L * .42 * o.fit;
      return _lines([[0, -.1, 0, -.85], [-.15, -.1, -.55, -.8], [.15, -.1, .55, -.8], [-.2, -.1, -.9, -.55], [.2, -.1, .9, -.55]], L, W);
    },
    accent: function (L, o, big) {
      if (!big) return '';
      var W = L * .42 * o.fit, r = _n(Math.max(1.4, L * .022));
      return '<g fill="#4F5393" opacity=".8"><circle cx="' + _n(-.45 * W) + '" cy="' + _n(-.84 * L) + '" r="' + r + '"/><circle cx="0" cy="' + _n(-.9 * L) + '" r="' + r + '"/><circle cx="' + _n(.45 * W) + '" cy="' + _n(-.84 * L) + '" r="' + r + '"/></g>';
    },
    center: function (L, cx, cy, big) {
      var s = '<g transform="translate(' + cx + ' ' + cy + ')"><circle r="' + _n(L * .17) + '" fill="#FFFFFF" stroke="#CFE0F3" stroke-width="' + (big ? .8 : 1.1) + '"/>', i, a, n = 5;
      for (i = 0; i < n; i++) { a = i / n * 6.2832 - 1.5708; s += '<circle cx="' + _n(Math.cos(a) * L * .09) + '" cy="' + _n(Math.sin(a) * L * .09) + '" r="' + _n(Math.max(1.5, L * .035)) + '" fill="#6E72B8"/>'; }
      return s + '</g>';
    },
    stem: { p: [[140, 160], [116, 200], [164, 270], [132, 350]], color: "#9FD0B8", w: 2,
      leaves: [{ t: .5, a: 55, s: .9 }, { t: .7, a: 52, s: .9 }] },
    leaf: function () {
      var s = '<path d="M0 0 L0 -56" stroke="#8CBFA4" stroke-width="1" fill="none"/>', k, y, rx, sg, cx;
      for (k = 0; k < 4; k++) {
        y = -12 - k * 11; rx = 8 - k * 1.2;
        for (sg = -1; sg <= 1; sg += 2) {
          cx = _n(sg * (rx * .8 + 2));
          s += '<ellipse cx="' + cx + '" cy="' + y + '" rx="' + _n(rx) + '" ry="' + _n(rx * .55) + '" transform="rotate(' + (-sg * 28) + ' ' + cx + ' ' + y + ')" fill="#B7E1CA" stroke="#8CBFA4" stroke-width=".8"/>';
        }
      }
      return s + '<ellipse cx="0" cy="-58" rx="5" ry="7" fill="#B7E1CA" stroke="#8CBFA4" stroke-width=".8"/>';
    }
  },

  /* ---------- ひまわり: 大きな黒褐色の円盤・尖った黄の花びら二段 ---------- */
  sunflower: {
    name: "ひまわり", season: "夏", cue: "中心の半分近くを占める黒褐色の種の円盤と、尖った黄色い花びらの二段",
    slots: 21, lscale: .95, overflowDir: -1,
    rings: [{ n: 13, off: 0, ls: 1, layer: 0, tone: 0 }, { n: 8, off: 13.8, ls: .86, layer: -1, tone: 1 }],
    tones: [
      [[0, "#D9A93F"], [.5, "#E9C265"], [1, "#F3DA94"]],
      [[0, "#CC9A38"], [.5, "#DDB352"], [1, "#EBCB7C"]]
    ],
    edge: "#C8962F", vein: ["#B98428", .45],
    shape: function (L, o) {
      var W = L * .17 * o.fit;
      return _sym([['C', .5, -.2, 1.15, -.5, .95, -.68], ['C', .75, -.86, .25, -.95, 0, -1]], L, W);
    },
    veins: function (L, o) { var W = L * .17 * o.fit; return _lines([[0, -.3, 0, -.88]], L, W); },
    center: function (L, cx, cy, big, uid) {
      var R = L * .42, s = '<defs><radialGradient id="' + uid + 'c"><stop offset="0" stop-color="#4F3A47"/><stop offset=".75" stop-color="#6A4C4C"/><stop offset="1" stop-color="#8A6A45"/></radialGradient></defs>' +
        '<g transform="translate(' + cx + ' ' + cy + ')"><circle r="' + _n(R) + '" fill="url(#' + uid + 'c)" stroke="#A98450" stroke-width="' + _n(L * .03) + '"/>';
      s += _phyl(big ? 72 : 24, R * .9, Math.max(1.3, L * (big ? .026 : .04)), function (k) { return k % 3 ? "#A07F5A" : "#3E2C38"; });
      return s + '</g>';
    },
    stem: { p: [[140, 170], [140, 230], [143, 290], [140, 350]], color: "#8DAF76", w: 6,
      leaves: [{ t: .5, a: 64, s: 1.05 }, { t: .7, a: 60, s: 1 }] },
    leaf: function () {
      return '<path d="' + _sym([['C', .5, .15, 1.1, -.1, 1, -.35], ['C', .95, -.7, .4, -.9, 0, -1]], 76, 34) + '" fill="#AEC892" stroke="#7F9B66" stroke-width="1" stroke-linejoin="round"/>' +
        '<path d="' + _lines([[0, -.02, 0, -.88], [0, -.02, .7, -.45], [0, -.02, -.7, -.45]], 76, 34) + '" fill="none" stroke="#7F9B66" stroke-width=".9" stroke-linecap="round"/>';
    }
  }
};

/* ============================ 共通の部品 ============================ */

function _n(v) { return Math.round(v * 100) / 100; }
function _gcd(a, b) { return b ? _gcd(b, a % b) : a; }
// n 枚を円に配るときの飛ばし幅（n と互いに素）。少ない件数でも片寄らない
function _stride(S) { if (S < 4) return 1; var s = Math.max(2, Math.round(S * .38)); while (_gcd(S, s) !== 1) s++; return s; }
function _bez(P, t) {
  var m = 1 - t, a = m * m * m, b = 3 * m * m * t, c = 3 * m * t * t, d = t * t * t;
  return [a * P[0][0] + b * P[1][0] + c * P[2][0] + d * P[3][0], a * P[0][1] + b * P[1][1] + c * P[2][1] + d * P[3][1]];
}
// 左右対称の輪郭。segs は右半分を (0,0) から軸上の終点まで。x は W 倍、y は L 倍
function _sym(segs, L, W) {
  var d = 'M0 0', from = [0, 0], list = [], k, it, c;
  function P(a, sx) { var o = [], j; for (j = 0; j < a.length; j += 2) o.push(_n(a[j] * W * sx) + ' ' + _n(a[j + 1] * L)); return o.join(', '); }
  for (k = 0; k < segs.length; k++) { c = segs[k]; list.push({ t: c[0], a: c.slice(1), f: from }); from = c.slice(-2); }
  for (k = 0; k < list.length; k++) { it = list[k]; d += ' ' + it.t + ' ' + P(it.a, 1); }
  for (k = list.length - 1; k >= 0; k--) {
    it = list[k];
    if (it.t === 'C') d += ' C ' + P([it.a[2], it.a[3], it.a[0], it.a[1], it.f[0], it.f[1]], -1);
    else d += ' L ' + P(it.f, -1);
  }
  return d + ' Z';
}
function _lines(list, L, W) {
  var d = '';
  list.forEach(function (a) { d += 'M' + _n(a[0] * W) + ' ' + _n(a[1] * L) + ' L' + _n(a[2] * W) + ' ' + _n(a[3] * L) + ' '; });
  return d;
}
// ギザギザの葉。付け根 (0,0) から上へ len。teeth 個の歯
function _toothLeaf(len, wid, teeth, amp) {
  var segs = [], k, tv, tp, hv, hp;
  function hw(t) { return wid * Math.pow(Math.sin(Math.PI * Math.pow(t, .75)), .85); }
  for (k = 0; k < teeth; k++) {
    tv = (k + .25) / teeth * .96; tp = (k + .9) / teeth * .96;
    hv = hw(tv); hp = hw(tp) + amp * Math.sqrt(hw(tp) / wid);
    segs.push(['L', hv, -len * tv]); segs.push(['L', hp, -len * tp]);
  }
  segs.push(['L', 0, -len]);
  return _sym(segs, 1, 1);
}
// 種のならび（ひまわり・マーガレットの中心）
function _phyl(N, R, dotR, fillFn) {
  var s = '', k, r, a;
  for (k = 1; k <= N; k++) {
    r = R * Math.sqrt(k / N); a = k * 2.399963;
    s += '<circle cx="' + _n(Math.cos(a) * r) + '" cy="' + _n(Math.sin(a) * r) + '" r="' + _n(dotR) + '" fill="' + fillFn(k) + '"/>';
  }
  return s;
}

function flowerSlots(kind, n) { return Math.max(n || 0, FLOWER_KINDS[kind].slots); }

// i 番目の花びらの角度・段・重なり
function _fkPlace(K, i, S) {
  var a = 0, r = 0, R, j, s, last;
  if (!K.rings) {
    s = _stride(S);
    return { ang: 360 / S * ((i * s) % S), ls: 1, layer: 0, tone: i % K.tones.length, fit: Math.max(.62, Math.pow(K.slots / S, .7)) };
  }
  last = K.rings[K.rings.length - 1];
  for (;;) {
    R = K.rings[r];
    if (!R) { j = r - K.rings.length + 1; R = { n: last.n, off: last.off + 11 * j, ls: last.ls * Math.pow(.86, j), layer: last.layer + j * (K.overflowDir || 1), tone: last.tone }; }
    if (i < a + R.n) break;
    a += R.n; r++;
  }
  j = i - a; s = _stride(R.n);
  return { ang: 360 / R.n * ((j * s) % R.n) + R.off, ls: R.ls, layer: R.layer, tone: R.tone, fit: 1 };
}

var _fkUid = 0;
// v4 の petals() の置き換え
function flowerPetals(kind, n, L, cx, cy, cls, extra, ghosts) {
  var K = FLOWER_KINDS[kind], S = Math.max(n, K.slots), uid = 'fk' + (++_fkUid), LL = L * (K.lscale || 1),
    big = L >= 60, lw = big ? .9 : 1.3, i, o, items = [], s = '<defs>';
  K.tones.forEach(function (st, ti) {
    s += '<linearGradient id="' + uid + 't' + ti + '" x1="0" y1="1" x2="0" y2="0">' +
      st.map(function (p) { return '<stop offset="' + p[0] + '" stop-color="' + p[1] + '"/>'; }).join('') + '</linearGradient>';
  });
  s += '</defs>';
  if (ghosts) {
    for (i = n; i < S; i++) {
      o = _fkPlace(K, i, S);
      s += '<path class="ghost" transform="translate(' + cx + ' ' + cy + ') rotate(' + _n(o.ang) + ')" d="' + K.shape(LL * o.ls, o) + '"/>';
    }
  }
  for (i = 0; i < n; i++) { o = _fkPlace(K, i, S); o.i = i; items.push(o); }
  items.sort(function (a, b) { return (a.layer - b.layer) || (a.i - b.i); });
  items.forEach(function (o) {
    var Lp = LL * o.ls, paint, v;
    paint = '<path d="' + K.shape(Lp, o) + '" fill="url(#' + uid + 't' + o.tone + ')" stroke="' + K.edge + '" stroke-width="' + lw + '" stroke-opacity=".8" stroke-linejoin="round"/>';
    if (big && K.veins) { v = K.veins(Lp, o); if (v) paint += '<path d="' + v + '" fill="none" stroke="' + K.vein[0] + '" stroke-opacity="' + K.vein[1] + '" stroke-width=".8" stroke-linecap="round"/>'; }
    if (K.accent) paint += K.accent(Lp, o, big);
    s += '<g class="' + cls + '" style="--r:' + _n(o.ang) + 'deg" ' + (extra ? extra(o.i) : '') + '><g transform="translate(' + cx + ' ' + cy + ')">' + paint + '</g></g>';
  });
  return s + K.center(LL, cx, cy, big, uid);
}

// 茎と葉（viewBox 0 0 280 360・花の中心 140,140 前提）
function flowerStalk(kind) {
  var K = FLOWER_KINDS[kind], S = K.stem, P = S.p, s;
  s = '<path class="stem" pathLength="1" d="M' + P[0].join(' ') + ' C ' + P[1].join(' ') + ', ' + P[2].join(' ') + ', ' + P[3].join(' ') +
    '" fill="none" stroke="' + S.color + '" stroke-width="' + S.w + '"/>';
  S.leaves.forEach(function (lf, idx) {
    var pt = _bez(P, lf.t), left = idx === 0, sx = left ? lf.s : -lf.s;
    s += '<g class="leafbig l' + (idx + 1) + '"><g transform="translate(' + _n(pt[0]) + ' ' + _n(pt[1]) + ') rotate(' + (left ? -lf.a : lf.a) + ') scale(' + sx + ' ' + lf.s + ')">' + K.leaf() + '</g></g>';
  });
  return s;
}

// 葉 1 枚だけ（図鑑用）。原点が付け根
function flowerLeaf(kind) { return FLOWER_KINDS[kind].leaf(); }
