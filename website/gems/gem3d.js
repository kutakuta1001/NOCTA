/**
 * NOCTA Gyu — 3D宝石（Gem3d）
 *
 * 写真ではなく、コードで生成した3D宝石メッシュを傾けて遊ぶ。
 * 宝石らしさの本体はマテリアル（屈折・分散・色吸収）にあるため、
 * 幾何学的にカット形状を生成し、MeshPhysicalMaterialで光学現象を再現する。
 *
 * Three.js は importmap + CDN の ESM で読み込む（ビルドなし方針）。
 * このファイルは <script type="module"> から動的 import される。
 *
 * 公開: NoctaGem3d.mount(container, gemData, opts) → { setTilt, detach, isReady }
 *   container: canvasを入れる要素
 *   gemData: { cut, gem3d, ior, accentColor, name, hardness, dispersion }
 *     hardness: モース硬度（number か "6.5-7.5" 等の範囲文字列）。roughness算出に使用
 *     dispersion: 分散（ファイア）強度 0〜1
 *   opts.reduce: prefers-reduced-motion
 *
 * WebGL不可・three読込失敗時は mount が null を返す（呼び出し側は写真フォールバック）。
 */

/* import は bare specifier。実URLは index.html の <script type="importmap"> で解決する
   （RoomEnvironment等の examples モジュールが内部で 'three' を bare import するため統一が必要）*/
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/* ---- 色ユーティリティ ---- */
function hexToColor(hex) {
  return new THREE.Color(hex);
}

/* ================================================================
 * カット形状のジオメトリ生成
 * すべて flat shading（面法線）前提で、ファセットの境界を鋭く保つ。
 * ================================================================ */

/* 決定論的乱数（石ごとに固有だが毎回同じ）。個体差（微小な非対称）に使う。
   本物の研磨石はミクロン単位で左右非対称。完全対称のCADメッシュは「偽物っぽさ」の一因。 */
function makeRng(seed) {
  var s = (seed >>> 0) || 1;
  return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}
function hashSeed(str) {
  var h = 2166136261 >>> 0; str = String(str || '');
  for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/* ガードル輪郭（アウトライン）関数のライブラリ。angle→半径スケールを返す。
   これでブリリアントの検証済みトポロジー（テーブル/クラウン/パビリオン/キュレット）を保ったまま
   断面形だけを変形し、ラウンド/オーバル/ペア/マーキス/クッション/トリリアントを1関数から安全に生成する。 */
function ellipseR(a, ra, rb) {
  var c = Math.cos(a), s = Math.sin(a);
  return (ra * rb) / Math.sqrt(rb * rb * c * c + ra * ra * s * s);
}
var OUTLINES = {
  round: function () { return 1; },
  oval: function (a) { return ellipseR(a, 1.22, 0.82); },
  /* マーキス（舟型）: 縦長楕円の両端(θ=0,π)を絞って尖らせる */
  marquise: function (a) { return ellipseR(a, 1.5, 0.6) * (0.8 + 0.2 * Math.abs(Math.sin(a))); },
  /* ペアシェイプ（涙型）: +x側の先端を局所的に絞り、-x側は丸いまま */
  pear: function (a) { var c = Math.cos(a); return ellipseR(a, 1.28, 0.92) * (1 - 0.34 * Math.pow(Math.max(0, c), 3)); },
  /* クッション（角丸四角）: スーパー楕円。軸方向が辺、45°方向が丸い角 */
  cushion: function (a) { var n = 3.0, c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a)); return 0.92 / Math.pow(Math.pow(c, n) + Math.pow(s, n), 1 / n); },
  /* トリリアント（三角）: cos(3θ)で3つの角を持つ丸みのある三角。tsumuri参照石と同型 */
  trillion: function (a) { return 0.92 * (1 + 0.24 * Math.cos(3 * (a - Math.PI / 2))); }
};

/* ラウンドブリリアントカット（本物の58面構造に近づけたモデル）
 *
 * 標準ブリリアントは主要8方位（メイン）＋その中間（half）でファセットが割れる。
 * 各セクター内をさらに分割することで
 *   クラウン: テーブル / ベゼルファセット / スターファセット / アッパーガードルファセット
 *   ガードル: 薄い帯（ジグザグの上下エッジ）
 *   パビリオン: パビリオンメインファセット / ロウワーガードルファセット（頂点は1点キュレット）
 * を表現する。全ファセット flat shading で境界を鋭く保ち、傾けたとき多点で瞬く。
 *
 * opts.outline(angle)→半径スケールで断面形を変形（ペア/マーキス/クッション等）。
 * opts.seed で個体差（ガードルの微小な半径・高さジッターと基準回転）を与える。
 */
function brilliantGeometry(mains, opts) {
  mains = mains || 8;
  opts = opts || {};
  var outline = opts.outline || OUTLINES.round;
  var rng = makeRng(opts.seed || 1);
  var N = mains * 2;      /* ガードルの頂点数（メイン+ハーフ） */
  var positions = [];

  /* 寸法 — 実物の標準ラウンドブリリアントの理想プロポーション（Tolkowsky系）
     girdle半径=1.0基準。直径=2.0に対する各比率を換算:
       テーブル径 53%          → tableR = 0.53
       クラウン角 34.5°        → クラウン高 = (1-0.53)*tan(34.5°) = 0.323
       パビリオン角 40.75°     → パビリオン深 = 1.0*tan(40.75°) = 0.862（全反射で光が返る鍵）
       ガードル厚 ~3%          → 帯を薄く
     パビリオンを浅く正確にすることで、光がキュレットへ抜けず正面に返る（ライトリターン）。 */
  var girdleR = 1.0;
  var girdleTopY = 0.03, girdleBotY = -0.03;  /* ガードル帯の厚み（薄く） */
  var tableR = 0.53;
  var crownY = 0.323;     /* クラウン角34.5°に対応するテーブル面の高さ */
  var starMidY = 0.16;    /* スターとベゼルの境の高さ */
  var pavilionY = -0.862; /* パビリオン角40.75°のキュレット深さ（全反射角） */
  var pavMidR = 0.55;     /* パビリオンメインとロウワーガードルの境の半径 */
  var pavMidY = -0.38;

  /* outline(angle)で断面形を変形。半径は角度依存スケールで乗算する */
  function P(radius, y, angle) {
    var sc = outline(angle);
    return new THREE.Vector3(Math.cos(angle) * radius * sc, y, Math.sin(angle) * radius * sc);
  }
  function pushTri(a, b, c) {
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  }

  var da = (Math.PI * 2) / N;   /* ガードル頂点1つあたりの角度 */

  /* 個体差: ガードル各頂点に微小な半径・高さのジッター（±2.5%・±0.012）。
     完全対称を崩し、傾けたとき本物の研磨石のように不規則にきらめく */
  var jitR = [], jitY = [];
  for (var k = 0; k < N; k++) { jitR.push(1 + (rng() - 0.5) * 0.05); jitY.push((rng() - 0.5) * 0.024); }

  /* --- テーブル面（上面の正多角形・mains角） --- */
  var tableCenter = new THREE.Vector3(0, crownY, 0);
  var tablePts = [];
  for (var m = 0; m < mains; m++) {
    tablePts.push(P(tableR, crownY, m * 2 * da));
  }
  for (var t = 0; t < mains; t++) {
    pushTri(tablePts[t], tableCenter, tablePts[(t + 1) % mains]);
  }

  /* --- クラウン: ベゼル（メイン方位の菱形）＋スター（テーブル辺から降りる三角）＋アッパーガードル --- */
  /* ガードル上リングの頂点（メイン位置=谷、ハーフ位置=山にわずかにジグザグ） */
  function girdleTop(i) {
    var y = (i % 2 === 0) ? girdleTopY : girdleTopY + 0.02;
    return P(girdleR * jitR[i], y + jitY[i], i * da);
  }
  function girdleBot(i) {
    var y = (i % 2 === 0) ? girdleBotY - 0.02 : girdleBotY;
    return P(girdleR * jitR[i], y + jitY[i], i * da);
  }

  for (var s = 0; s < mains; s++) {
    var aMain = s * 2 * da;          /* メイン方位（ベゼルの中心） */
    var tThis = tablePts[s];
    var tNext = tablePts[(s + 1) % mains];
    /* スター頂点: テーブル辺の中点の外側・少し下 */
    var starA = aMain + da;
    var starPt = P((tableR + girdleR) * 0.5, starMidY + 0.04, starA);
    /* ベゼル頂点: メイン方位のガードル上（谷） */
    var bezThis = girdleTop(s * 2);              /* メイン位置 */
    var bezNext = girdleTop(((s + 1) % mains) * 2);
    /* スター三角: テーブル辺(tThis-tNext)から starPt へ */
    pushTri(tThis, tNext, starPt);
    /* ベゼルファセット: テーブル頂点とスターとガードル谷で構成（菱形を2三角） */
    pushTri(tThis, starPt, bezThis);
    pushTri(tNext, bezNext, starPt);
    /* アッパーガードルファセット: スターからガードルの山(ハーフ位置)へ降りる小三角 */
    var halfTop = girdleTop(s * 2 + 1);
    pushTri(starPt, bezNext, halfTop);
    pushTri(starPt, halfTop, bezThis);
  }

  /* --- ガードル帯（上リング→下リングの側面） --- */
  for (var g = 0; g < N; g++) {
    var gn = (g + 1) % N;
    var gt0 = girdleTop(g), gt1 = girdleTop(gn);
    var gb0 = girdleBot(g), gb1 = girdleBot(gn);
    /* 外向きwinding（CCW）に揃える */
    pushTri(gt0, gt1, gb0);
    pushTri(gt1, gb1, gb0);
  }

  /* --- パビリオン: メインファセット＋ロウワーガードル、キュレットへ収束 --- */
  var culet = new THREE.Vector3(0, pavilionY, 0);
  for (var p = 0; p < mains; p++) {
    var aMainP = p * 2 * da;
    /* パビリオンメイン方位の中段頂点 */
    var pavMid = P(pavMidR, pavMidY, aMainP);
    var gbMain = girdleBot(p * 2);                    /* メイン位置ガードル下 */
    var gbNext = girdleBot(((p + 1) % mains) * 2);
    var gbHalf = girdleBot(p * 2 + 1);                /* ハーフ位置ガードル下 */
    /* ロウワーガードルファセット: ガードル下(メイン→ハーフ→次メイン)から中段へ・外向きwinding */
    pushTri(gbMain, gbHalf, pavMid);
    pushTri(gbHalf, gbNext, pavMid);
    /* パビリオンメインファセット: 中段からキュレットへ（隣の中段と共有）・外向きwinding */
    var pavMidNext = P(pavMidR, pavMidY, ((p + 1) % mains) * 2 * da);
    pushTri(pavMid, pavMidNext, culet);
  }

  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();   /* flat: 各三角の面法線 */
  /* 個体差: 石ごとに基準の向きを少しずらす（同じカットでも並べたとき同一に見えない） */
  geo.rotateY(rng() * Math.PI * 2);
  geo.computeBoundingSphere();
  return geo;
}

/* エメラルドカット（ステップカット）: 八角柱を段状に面取り */
function stepGeometry() {
  var positions = [];
  function octRing(radius, y) {
    var pts = [];
    for (var i = 0; i < 8; i++) {
      var a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
    }
    return pts;
  }
  /* 段: 上テーブル・上肩・腰・下肩・底 */
  var levels = [
    { r: 0.6, y: 0.5 },
    { r: 0.95, y: 0.32 },
    { r: 1.0, y: 0.0 },
    { r: 0.85, y: -0.4 },
    { r: 0.4, y: -0.8 }
  ];
  function pushTri(a, b, c) { positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z); }
  var rings = levels.map(function (l) { return octRing(l.r, l.y); });
  for (var lv = 0; lv < rings.length - 1; lv++) {
    var top = rings[lv], bot = rings[lv + 1];
    for (var i = 0; i < 8; i++) {
      var n = (i + 1) % 8;
      pushTri(top[i], bot[i], top[n]);
      pushTri(top[n], bot[i], bot[n]);
    }
  }
  /* 上面 */
  var topRing = rings[0], topC = new THREE.Vector3(0, levels[0].y, 0);
  var botRing = rings[rings.length - 1], botC = new THREE.Vector3(0, levels[levels.length - 1].y, 0);
  for (var i2 = 0; i2 < 8; i2++) {
    var n2 = (i2 + 1) % 8;
    pushTri(topRing[i2], topC, topRing[n2]);
    pushTri(botRing[i2], botRing[n2], botC);
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

/* カボション: 半球ドーム＋底の円盤で閉じる（不透明・遊色石向け）
   ドームは球なのでSphereGeometryが持つスムーズ法線をそのまま使い（computeVertexNormalsで
   潰さない）、底面のCircleは自前の下向き法線を持つため、連結後もドームは滑らか・底は平ら */
function cabochonGeometry() {
  var dome = new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  var base = new THREE.CircleGeometry(1, 48);
  base.rotateX(Math.PI / 2);   /* XZ平面・法線を下向き(-Y)に */
  /* position と normal の両方を連結（computeVertexNormalsを呼ばずスムーズ法線を保持） */
  var merged = mergeGeometriesPosNormal([dome, base]);
  merged.scale(1.1, 0.7, 1.1);
  merged.computeBoundingSphere();
  return merged;
}

/* position と normal を連結（addons非依存の最小mergeUtil）
   各ジオメトリが持つ法線を保持するため、スムーズ面（球）はスムーズなまま合成される */
function mergeGeometriesPosNormal(geos) {
  var posArrays = [], normArrays = [], totalP = 0, totalN = 0;
  geos.forEach(function (g) {
    var ng = g.index ? g.toNonIndexed() : g;
    if (!ng.getAttribute('normal')) ng.computeVertexNormals();
    var pos = ng.getAttribute('position');
    var nrm = ng.getAttribute('normal');
    posArrays.push(pos.array); totalP += pos.array.length;
    normArrays.push(nrm.array); totalN += nrm.array.length;
  });
  var mergedP = new Float32Array(totalP), mergedN = new Float32Array(totalN);
  var op = 0, on = 0;
  posArrays.forEach(function (a) { mergedP.set(a, op); op += a.length; });
  normArrays.forEach(function (a) { mergedN.set(a, on); on += a.length; });
  var out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(mergedP, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(mergedN, 3));
  return out;
}

/* 結晶原石: 六角柱＋上下の錐 */
function crystalGeometry() {
  var positions = [];
  function hexRing(radius, y) {
    var pts = [];
    for (var i = 0; i < 6; i++) {
      var a = (i / 6) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
    }
    return pts;
  }
  var mid1 = hexRing(0.7, 0.35), mid2 = hexRing(0.7, -0.35);
  var top = new THREE.Vector3(0, 1.0, 0), bot = new THREE.Vector3(0, -1.0, 0);
  function pushTri(a, b, c) { positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z); }
  for (var i = 0; i < 6; i++) {
    var n = (i + 1) % 6;
    pushTri(mid1[i], mid2[i], mid1[n]);       /* 柱側面 */
    pushTri(mid1[n], mid2[i], mid2[n]);
    pushTri(mid1[i], mid1[n], top);           /* 上錐 */
    pushTri(mid2[n], mid2[i], bot);           /* 下錐 */
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

/* ローズカット（アンティーク）: 平らな底面＋放射状の三角ファセットで低いドームを組む。
   キュレットもテーブルも無く、頂点に向かって三角形が集まる歴史的なカット。
   段を2層にして「二重ローズ」に近づけ、シードで各層の回転をずらして個体差を出す。 */
function roseGeometry(seed) {
  var rng = makeRng(seed || 1);
  var positions = [];
  function pushTri(a, b, c) { positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z); }
  function ring(radius, y, n, phase) {
    var pts = [];
    for (var i = 0; i < n; i++) { var a = (i / n) * Math.PI * 2 + phase; pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius)); }
    return pts;
  }
  var n = 8;
  var base = ring(1.0, 0.0, n, 0);                 /* 平らな底の外周 */
  var mid = ring(0.62, 0.42, n, Math.PI / n + (rng() - 0.5) * 0.1);  /* 中段（オフセットでジグザグ） */
  var apex = new THREE.Vector3(0, 0.86, 0);
  var baseC = new THREE.Vector3(0, 0.0, 0);
  for (var i = 0; i < n; i++) {
    var nx = (i + 1) % n;
    /* 底面（下向き） */
    pushTri(base[i], baseC, base[nx]);
    /* 下段クラウンファセット: 底外周→中段（三角2枚でジグザグ） */
    pushTri(base[i], base[nx], mid[i]);
    pushTri(base[nx], mid[nx], mid[i]);
    /* 上段: 中段→頂点 */
    pushTri(mid[i], mid[nx], apex);
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  geo.rotateY(rng() * Math.PI * 2);
  geo.computeBoundingSphere();
  return geo;
}

/* ブリリアント系（同一トポロジーをアウトラインで変形）のカット定義 */
var BRILLIANT_SHAPES = {
  brilliant: { mains: 8, outline: OUTLINES.round },
  round: { mains: 8, outline: OUTLINES.round },
  oval: { mains: 9, outline: OUTLINES.oval },
  pear: { mains: 9, outline: OUTLINES.pear },
  marquise: { mains: 9, outline: OUTLINES.marquise },
  cushion: { mains: 8, outline: OUTLINES.cushion },
  trillion: { mains: 9, outline: OUTLINES.trillion }
};

function makeGeometry(cut, seed) {
  if (BRILLIANT_SHAPES[cut]) {
    var sh = BRILLIANT_SHAPES[cut];
    return brilliantGeometry(sh.mains, { outline: sh.outline, seed: seed });
  }
  switch (cut) {
    case 'step': return stepGeometry();
    case 'cabochon': return cabochonGeometry();
    case 'crystal': return crystalGeometry();
    case 'rose': return roseGeometry(seed);
    default: return brilliantGeometry(8, { outline: OUTLINES.round, seed: seed });
  }
}

/* ================================================================
 * 宝石ショーケース環境シーン（PMREM用）
 * warm-blackの暗い空間に、明るいライトカードを複数配置。
 * ファセット1枚ごとに光源が映り込み、傾けると多点できらめく。
 * ================================================================ */
function buildShowcaseScene() {
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0A0906);   /* NOCTA warm-black */

  /* MeshBasicMaterialは通常0-1だが、環境マップ用に高輝度(>1)にして
     ファセットに強く映り込ませる。色×係数で明るさを表現 */
  function bright(hex, k) {
    var c = new THREE.Color(hex);
    c.multiplyScalar(k || 1);
    return c;
  }
  function cardB(w, h, hex, k, x, y, z, rx, ry) {
    var geo = new THREE.PlaneGeometry(w, h);
    var mat = new THREE.MeshBasicMaterial({ color: bright(hex, k), side: THREE.DoubleSide, toneMapped: false });
    var m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (rx) m.rotation.x = rx;
    if (ry) m.rotation.y = ry;
    scene.add(m);
  }

  /* 上方の大きな柔らかい光（キー・全体を持ち上げる） */
  cardB(7, 3, 0xfff4e2, 3.0, 0, 5, 1, -Math.PI / 2.2, 0);
  /* 前面左右の縦長ストリップ（ブリリアンスの帯） */
  cardB(0.7, 5.5, 0xffffff, 4.5, -3.6, 0, 3, 0, Math.PI / 5);
  cardB(0.7, 5.5, 0xeef2ff, 4.0, 3.6, 0, 3, 0, -Math.PI / 5);
  /* 斜め上の高輝度スポット（ファイア用の点光） */
  cardB(1.4, 1.4, 0xffffff, 6.0, -2.5, 3.2, 2, -Math.PI / 3, Math.PI / 6);
  cardB(1.1, 1.1, 0xfff0dd, 5.0, 3, 3, -1, -Math.PI / 3, -Math.PI / 4);
  /* 正面下からの照り返し（パビリオンに光を返す） */
  cardB(5, 2, 0xd8e0f0, 1.6, 0, -3.5, 3.5, Math.PI / 3, 0);
  /* 背面のリム光 */
  cardB(5, 4, 0x8892a8, 1.4, 0, 1, -5, 0, 0);

  /* シンチレーション用の小さな高輝度スポット群 — 前面ドーム状に散りばめる。
     傾けたとき多数のファセットが次々に白く瞬く（本物の宝石の煌めき）。
     角度は擬似乱数（決定的）で分散させ、Math.randomは使わない */
  var seed = 1234;
  function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
  for (var i = 0; i < 16; i++) {
    var az = rnd() * Math.PI * 2;
    var el = (rnd() - 0.3) * Math.PI * 0.7;   /* 前面上寄りに分布 */
    var dist = 4 + rnd() * 2;
    var sx = Math.cos(el) * Math.sin(az) * dist;
    var sy = Math.sin(el) * dist + 1.0;
    var sz = Math.cos(el) * Math.cos(az) * dist + 1.5;   /* カメラ側(+z)寄り */
    var sp = 0.18 + rnd() * 0.22;
    var warmth = rnd() > 0.5 ? 0xffffff : 0xfff2e0;
    var m = new THREE.Mesh(
      new THREE.PlaneGeometry(sp, sp),
      new THREE.MeshBasicMaterial({ color: bright(warmth, 7.0), side: THREE.DoubleSide, toneMapped: false })
    );
    m.position.set(sx, sy, sz);
    m.lookAt(0, 0, 0);
    scene.add(m);
  }

  return scene;
}

/* ================================================================
 * PT（現像）用の実光源群
 * three-gpu-pathtracer は emissive な MeshStandardMaterial（emissive色 × emissiveIntensity）
 * のみを光源として拾う。上の buildShowcaseScene のライトカードは MeshBasicMaterial で、
 * PBR用の PMREM 環境マップにベイクするためのものであり、PT の scene に実体として置いても発光しない
 * （PT のシーン生成は traverseVisible でメッシュを集め、発光は material.emissive*emissiveIntensity で判定する）。
 * そこで PT 専用に、ショーケースと似た配置・輝度感の emissive 板群を Group として用意する。
 * develop 中だけ visible=true にして setScene に拾わせ、宝石ファセット越しの多重反射・干渉模様を生む。
 * PBR時は visible=false（PBRは PMREM env + DirectionalLight で描くため、この群は描画も照明も一切しない）。
 * ================================================================ */
function buildEmissiveLightGroup() {
  var g = new THREE.Group();
  /* pos=位置 / size=板の一辺 / color=発光色 / intensity=emissiveIntensity。
     ショーケース（上方キー・前面左右ストリップ・斜め上スポット・下からの照り返し相当）を
     emissive 板で近似。強めの intensity で宝石内部に強い映り込みと分散を起こす。 */
  var specs = [
    { pos: [-2.4, 2.2, 2.6], size: 2.2, color: 0xfff2dc, intensity: 6 },
    { pos: [ 2.6, 1.6, 2.2], size: 1.8, color: 0xe8f0ff, intensity: 5 },
    { pos: [ 0.0, 3.0, 0.4], size: 2.6, color: 0xffffff, intensity: 7 },
    { pos: [-1.8, -1.2, 2.4], size: 1.4, color: 0xffe9cf, intensity: 4 },
    { pos: [ 2.2, -0.6, 1.6], size: 1.4, color: 0xd8e6ff, intensity: 4 }
  ];
  specs.forEach(function (s) {
    var m = new THREE.Mesh(
      new THREE.PlaneGeometry(s.size, s.size),
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissive: new THREE.Color(s.color),
        emissiveIntensity: s.intensity,
        side: THREE.DoubleSide
      })
    );
    m.position.set(s.pos[0], s.pos[1], s.pos[2]);
    m.lookAt(0, 0, 0);
    g.add(m);
  });
  return g;
}

/* ================================================================
 * マテリアルプリセット
 * ================================================================ */
function makeMaterial(gemData) {
  var color = hexToColor(gemData.accentColor || '#D8ECEF');
  var kind = gemData.gem3d || 'transparent';
  var ior = gemData.ior || 1.9;

  /* 硬度依存の表面粗さ（記事の知見: 完全な透明roughness=0は「作り物臭い/安っぽい」。
     硬度の低い石ほど表面を軽く曇らせ透過光を適度にぼかすと自然な深みが出る）。
     モース硬度10(ダイヤ)=0 → 6=約0.04。roughnessは屈折のぼかしも兼ねるので控えめに上限0.05。 */
  /* "6.5-7.5"等の範囲は parseFloat が下限を返す（=より軟らかい側=わずかに曇る方向）。
     保守的に曇り寄りへ倒す意図で下限採用。数値・範囲文字列どちらも可 */
  var hardness = parseFloat(gemData.hardness);
  if (!(hardness > 0)) hardness = 8;
  var rough = Math.max(0, Math.min(0.05, (10 - hardness) * 0.01));

  if (kind === 'opaque') {
    return new THREE.MeshPhysicalMaterial({
      color: color,
      roughness: 0.28,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.15,
      reflectivity: 0.6,
      flatShading: false
    });
  }

  if (kind === 'iridescent') {
    return new THREE.MeshPhysicalMaterial({
      color: color,
      roughness: 0.2,
      metalness: 0.0,
      clearcoat: 1.0,
      iridescence: 1.0,
      iridescenceIOR: 1.8,
      iridescenceThicknessRange: [120, 480],
      flatShading: false
    });
  }

  /* 色吸収の個体差（Beer-Lambert的）: 濃い（暗い）色の石ほど光の減衰距離を短く＝色濃く、
     淡い（明るい）色の石は減衰距離を長く＝光を通す。fixed 2.2 から石別に。 */
  var lum = (color.r + color.g + color.b) / 3;
  var attenDist = 1.4 + lum * 2.0;

  /* transparent（デフォルト）— 屈折・分散・色吸収で本物の宝石らしさ
     v2: thickness増で屈折の深み・attenuationは色の明度で石別・dispersionは石別 */
  var mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xffffff),
    transmission: 1.0,
    thickness: 1.8,
    ior: ior,
    roughness: rough,   /* 硬度依存: 軟らかい石ほど微かに曇り透過に深みが出る */
    metalness: 0.0,
    reflectivity: 0.55,
    attenuationColor: color,
    attenuationDistance: attenDist,
    specularIntensity: 1.0,
    /* clearcoatを強めるとフラットシェーディングのファセット境界でフレネル反射が際立ち、
       稜線がキラッと光る（ベベルの視覚効果をジオメトリを増やさず材質で得る） */
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    envMapIntensity: 1.9,
    side: THREE.DoubleSide,   /* 透明石は屈折で内部の裏面ファセットも見えるため両面描画 */
    flatShading: true
  });
  /* 分散（ファイア）: three r167+ で対応。石別のdispersion（データ未指定は0.5）。
     不正値に備え0〜1にクランプ */
  if ('dispersion' in mat) {
    var disp = (typeof gemData.dispersion === 'number') ? gemData.dispersion : 0.5;
    mat.dispersion = Math.max(0, Math.min(1, disp));
  }
  return mat;
}

/* ================================================================
 * マウント
 * ================================================================ */
function mount(container, gemData, opts) {
  opts = opts || {};
  var reduce = !!opts.reduce;

  var width = container.clientWidth || 400;
  var height = container.clientHeight || 500;

  var renderer, scene, camera, mesh, envRT, pmrem, envScene, composer, bloomPass, ptLightGroup;
  /* Bloomは高負荷なので、reduce-motionと狭幅（モバイル相当）では無効化して素のレンダリングに。
     width<480でoff、コア数が取得でき2以下なら低性能機とみなしoff。
     さらにタッチ端末（coarse pointer）は内蔵GPUが弱くBloom+MSAAで発熱・カクつきしやすいのでoff */
  var lowCores = (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 2);
  var coarse = (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches);
  var useBloom = !reduce && width >= 480 && !lowCores && !coarse;

  function disposeEnvScene() {
    if (envScene && envScene.traverse) {
      envScene.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) { if (Array.isArray(o.material)) o.material.forEach(function (m) { m.dispose(); }); else o.material.dispose(); }
      });
    }
  }

  /* PT用 emissive 光源群の geometry/material を解放（PlaneGeometry + MeshStandardMaterial） */
  function disposePtLightGroup() {
    if (ptLightGroup && ptLightGroup.traverse) {
      ptLightGroup.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) { if (Array.isArray(o.material)) o.material.forEach(function (m) { m.dispose(); }); else o.material.dispose(); }
      });
    }
  }

  /* mount途中で失敗した場合に、生成済みリソースを全解放してからnullを返す */
  function cleanupPartial() {
    try {
      if (mesh) { if (mesh.geometry) mesh.geometry.dispose(); if (mesh.material) mesh.material.dispose(); }
      disposeEnvScene();
      disposePtLightGroup();
      if (envRT) envRT.dispose();
      if (pmrem) pmrem.dispose();
      if (renderer) {
        renderer.dispose();
        if (renderer.forceContextLoss) renderer.forceContextLoss();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    } catch (_) {}
  }

  try {
    /* WebGLRenderer生成自体の失敗（WebGL不可）をここで捕捉。preflight用の別contextは作らない */
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    /* エッジのギザつきを抑えて研磨石の精度感を出す。デスクトップは上限2.5（高精細ディスプレイで効く）。
       Bloom+MSAA併用時はレンダーターゲットが巨大化するため2.0に、
       タッチ/低コア端末は発熱・電池消費を避けるため1.75に抑える（非Bloom経路でも上限を下げる） */
    var dprCap = (coarse || lowCores) ? 1.75 : (useBloom ? 2.0 : 2.5);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
    renderer.setSize(width, height);
    /* 屈折像（transmission）のレンダリング解像度を最大に保つ（既定で下がる版に備え明示）。
       ファセット越しに見える背後の像がシャープになり、研磨石の精度感が上がる。 */
    if ('transmissionResolutionScale' in renderer) renderer.transmissionResolutionScale = 1.0;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    /* 環境マップ: 宝石ショーケース（暗背景＋複数のライトカード）を専用構築。
       ファセットに光源が映り込むことがきらめきの本体。envSceneはdispose用に保持 */
    pmrem = new THREE.PMREMGenerator(renderer);
    envScene = buildShowcaseScene();
    envRT = pmrem.fromScene(envScene, 0.015);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 1.6;

    /* 補助の方向光（環境マップだけでは出ない鋭いスペキュラを足す） */
    var key = new THREE.DirectionalLight(0xfff6e6, 1.2);
    key.position.set(-2.4, 2.0, 2.5);
    scene.add(key);
    var fill = new THREE.DirectionalLight(0xe8f0ff, 0.6);
    fill.position.set(2.6, -1.2, 2.2);
    scene.add(fill);

    /* 石名からシードを作り、同じカットでも石ごとに微妙に違う個体差を与える */
    var seed = hashSeed(gemData.name || gemData.title || gemData.cut || 'gem');
    var geo = makeGeometry(gemData.cut, seed);
    var mat = makeMaterial(gemData);
    mesh = new THREE.Mesh(geo, mat);
    /* ジオメトリを画面に収める正規化 */
    var r = geo.boundingSphere ? geo.boundingSphere.radius : 1;
    mesh.scale.setScalar(1.35 / r);
    scene.add(mesh);

    /* PT（現像）専用の emissive 実光源群。scene に常駐させ、初期は visible=false。
       develop 中だけ visible=true にして PT の setScene(traverseVisible) に拾わせる。
       PBR時は不可視なので描画にもPBR照明にも一切影響しない（PBRは PMREM env + DirectionalLight）。 */
    ptLightGroup = buildEmissiveLightGroup();
    ptLightGroup.visible = false;
    scene.add(ptLightGroup);

    /* テスト・診断用フック（本番挙動は変えない・window.__gem3dMode と同じ位置づけ）。
       scene 内の emissive 実光源メッシュの数と、そのうち実効的に可視（自身と全祖先が visible）な
       ものの数を返す。detach で null 化する。
       「実光源」の判定は PT が光源として拾う条件と同じ = emissive色×emissiveIntensity が非ゼロ。
       宝石本体（MeshPhysicalMaterial は isMeshStandardMaterial===true・emissiveIntensity 既定1）は
       emissive が黒(0,0,0)なので放射ゼロ＝光源ではなく、ここから除外される。 */
    if (typeof window !== 'undefined') {
      window.__gem3dInspectPtLights = function () {
        var info = { count: 0, visibleCount: 0 };
        if (!scene) return info;
        scene.traverse(function (o) {
          if (!(o.isMesh && o.material && o.material.isMeshStandardMaterial)) return;
          var mm = o.material;
          var e = mm.emissive;
          var emits = mm.emissiveIntensity > 0 && e && (e.r + e.g + e.b) > 0;
          if (!emits) return;
          info.count++;
          var vis = true, p = o;
          while (p) { if (p.visible === false) { vis = false; break; } p = p.parent; }
          if (vis) info.visibleCount++;
        });
        return info;
      };
    }

    /* Bloomポストプロセス（最輝ファセットを滲ませて宝石の「キラッ」を再現）
       composer構築失敗時は素のrenderer.renderにフォールバック */
    if (useBloom) {
      var tmpComposer = null, tmpBloom = null, msaaRT = null;
      try {
        /* MSAA付きレンダーターゲットでcomposerを作る（Bloom経路でもエッジをアンチエイリアス）。
           サイズはgetDrawingBufferSize（=論理サイズ×pixelRatio）を使う。これはThree.js公式の
           「composerにsamples付きRTを渡す」MSAAパターンと同一で、DPRの二重適用を避ける。
           WebGL2ではsamplesが効く。作れない環境では通常のcomposerにフォールバック */
        var dbs = renderer.getDrawingBufferSize(new THREE.Vector2());
        try {
          msaaRT = new THREE.WebGLRenderTarget(dbs.x, dbs.y, { samples: 4 });
          tmpComposer = new EffectComposer(renderer, msaaRT);
        } catch (rtErr) {
          if (msaaRT && msaaRT.dispose) msaaRT.dispose();
          msaaRT = null;
          tmpComposer = new EffectComposer(renderer);
        }
        tmpComposer.addPass(new RenderPass(scene, camera));
        tmpBloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.55, 0.6, 0.85);
        /* strength 0.55・radius 0.6・threshold 0.85（明るい部分だけ滲む） */
        tmpComposer.addPass(tmpBloom);
        tmpComposer.addPass(new OutputPass());
        composer = tmpComposer; bloomPass = tmpBloom;
      } catch (be) {
        /* 構築途中の失敗でも作成済みのpass/composerを解放してからフォールバック */
        try {
          if (tmpComposer && tmpComposer.passes) tmpComposer.passes.forEach(function (p) { if (p.dispose) p.dispose(); });
          if (tmpBloom && tmpBloom.dispose) tmpBloom.dispose();
          if (tmpComposer && tmpComposer.dispose) tmpComposer.dispose();
        } catch (_) {}
        composer = null; bloomPass = null; useBloom = false;
      }
    }
  } catch (e) {
    /* 生成失敗時は生成済みリソースを完全解放してnull（呼び出し側フォールバック） */
    cleanupPartial();
    return null;
  }

  /* ---- 傾き入力 → 目標回転 ---- */
  /* 基準の見下ろし角: テーブル（上面）を手前に倒し、カットの輪郭（ペアの尖り/マーキスの舟型/
     トリリアントの三角/クッションの角丸）が一目で分かるようにする。きらめきも増える。
     カボション/ローズ/原石は上面が主役ではないので浅めにする */
  var flatTop = (gemData.cut === 'cabochon' || gemData.cut === 'rose' || gemData.cut === 'crystal');
  var baseTiltX = flatTop ? 0.12 : 0.32;
  var targetRX = 0, targetRY = 0;
  var curRX = 0, curRY = 0;
  var autoSpin = !reduce;
  var running = true;
  var rafId = null;

  /* ================================================================
   * ハイブリッド状態機械（動=PBR / 静=PT現像）
   *   renderMode: 'pbr'（動いている・PBR描画）
   *             | 'developing'（静止しPTを累積中・PTcanvasをフェードイン）
   *             | 'still'（PT現像完了・PTcanvasを表示したまま保持）
   * 傾け入力が来たら現像中でも即PBRへ戻す（体験の最優先事項）。
   * ================================================================ */
  var lastTiltMs = 0;                 /* 直近setTilt時刻 */
  var spinUntilMs = (typeof performance !== 'undefined' ? performance.now() : Date.now()) + 5000; /* autospin継続時間 */
  var renderMode = 'pbr';             /* 'pbr'|'developing'|'still' */
  var developer = null, devReq = false, ptCanvas = null, devProgress = 0;
  function nowMs() { return (typeof performance !== 'undefined' ? performance.now() : Date.now()); }
  /* テスト・診断用に現在のモードをwindowへ反映（本番挙動は変えない）。
     毎フレーム呼ばれるが renderMode が変化したときだけ書き込む（無駄なグローバル書き込みを避ける）。
     getRenderMode() が正規の観測APIで、これは補助のデバッグフック。 */
  var publishedMode;
  function publishMode() {
    if (renderMode === publishedMode) return;
    publishedMode = renderMode;
    if (typeof window !== 'undefined') window.__gem3dMode = renderMode;
  }

  /* PT対応判定（Task1の純粋関数 NoctaGemPTUtil.canPathtrace に環境を渡す）。
     coarse/lowCores は mount 冒頭で算出済みの値を再利用。opts.noPt で明示的に無効化できる */
  var ptEnv = {
    webgl2: (renderer.capabilities && renderer.capabilities.isWebGL2) || false,
    reduce: reduce,
    coarse: coarse,
    lowCores: lowCores,
    floatBuf: !!(renderer.extensions && renderer.extensions.get('EXT_color_buffer_float'))
  };
  var ptAllowed = !!(window.NoctaGemPTUtil && window.NoctaGemPTUtil.canPathtrace(ptEnv)) && !opts.noPt;

  /* PBRへ復帰（PT canvasを隠し、累積をリセット） */
  function switchToPbr() {
    renderMode = 'pbr';
    if (ptCanvas) ptCanvas.style.opacity = '0';
    /* PT用実光源を消す。以後 PBR を描いても発光板は traverseVisible に拾われず
       PBRの見た目・照明は一切変わらない（発光板は PT scene 専用）。 */
    if (ptLightGroup) ptLightGroup.visible = false;
    if (developer) developer.reset();
    devProgress = 0;
    /* devReq ラッチを解除して、傾け→再静止での再現像を許可する。
       import 未解決のまま PBR 復帰した場合も、次の静止で再度 import を試せるようにする
       （多重生成は beginDevelop の import 解決時ガードで防ぐ）。*/
    devReq = false;
    publishMode();
  }

  /* setScene を通る処理（createDeveloper / resync）の間だけ PBR用の PMREM env を外す。
     three-gpu-pathtracer@0.0.24 は scene.environment を equirect HDR として読むため、
     PMREM RenderTarget texture が入ったまま setScene() を呼ぶと例外を投げるためである。
     直後に savedEnv へ復帰させ、PBRの環境マップは維持する。
     役割分担（二重管理の回避）:
       - env の主管理は developer 側。PT が実際に使う環境（GradientEquirectTexture・上=暖色明/下=暗）は
         gem3d-pathtracer.js の createDeveloper が保持し、setScene の瞬間だけ scene.environment に差す。
       - gem3d 側（ここ）は PBR用 PMREM の一時退避だけを担う。
       - PT用 emissive 光源群の可視化は develop 状態と連動させる
         （beginDevelop で setScene 直前に visible=true / switchToPbr で false）。ここでは触らない。 */
  function withPtEnv(fn) {
    var savedEnv = scene.environment;
    scene.environment = null;
    try { return fn(); }
    finally { scene.environment = savedEnv; }
  }

  /* 静止時のPT現像を開始。初回は gem3d-pathtracer.js を遅延importし、PT専用canvasを
     containerにabsolute配置してopacityでフェードインする。2回目以降は既存developerを
     現在姿勢へ再同期して使い回す。 */
  function beginDevelop() {
    if (!ptAllowed) return;
    renderMode = 'developing';
    publishMode();
    if (developer) {
      /* 再利用: サンプル累積をゼロ化したうえで、現在の mesh 姿勢で BVH を再ベイクする。
         reset() だけだと WebGLPathTracer が初回姿勢のBVHを保持し、別の向きで静止しても
         初回の向きの像を現像してしまう。resync()（内部 setScene）で現在姿勢へ同期する。 */
      developer.reset();
      /* setScene(=resync)は traverseVisible で発光板を集めるので、resync の前に光源を可視化する。
         この時点は develop 分岐直前でありPBRは描かないため、可視化による見た目の副作用はない。 */
      ptLightGroup.visible = true;
      try {
        withPtEnv(function () { developer.resync(); });
      } catch (e) {
        /* resync(内部setScene)失敗時は develop を諦めPBRへ戻す。
           visible=true / renderMode='developing' の固着を防ぐ（初回import経路のcatchと対称）。 */
        ptAllowed = false; renderMode = 'pbr';
        if (ptLightGroup) ptLightGroup.visible = false;
        publishMode();
      }
      return;
    }
    if (devReq) return; devReq = true;
    import('./gem3d-pathtracer.js?v=3').then(function (mod) {
      /* import 解決＝in-flight 完了。ラッチを解除する（成功・早期return どちらの経路も一箇所で解除）。
         これがないと、傾け等で下の renderMode ガードにより早期returnしたとき devReq が true のまま固着し、
         以後 develop が永久に起動しなくなる。 */
      devReq = false;
      if (!running || renderMode !== 'developing') return;
      /* switchToPbr の devReq 解除により、in-flight 中に2度目の import が走った場合の多重生成を防ぐ。
         先に解決した側が developer を生成済みなら、後続の解決は何もしない。 */
      if (developer) return;
      /* 光源の可視化は「setScene 直前・かつ develop 継続が確定した後」に行う。
         import 待ちの間（developer 未生成）に可視化すると、その間 loop が PBR を描くため
         発光板がPBR画面に映ってしまう。上のガードを通過した直後（＝この行）に立てることで、
         次フレームは develop 分岐に入りPBRを描かない。傾けで早期returnした場合は visible=false のまま。 */
      ptLightGroup.visible = true;
      developer = withPtEnv(function () {
        return mod.createDeveloper({ THREE: THREE, renderer: renderer, scene: scene, camera: camera, maxSamples: 160 });
      });
      ptCanvas = developer.getCanvas();
      ptCanvas.className = 'gyu-pt-canvas';   /* PBR canvasと区別（テスト・スタイル用） */
      ptCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity .4s ease;pointer-events:none;';
      container.appendChild(ptCanvas);
    }).catch(function () { devReq = false; ptAllowed = false; renderMode = 'pbr'; if (ptLightGroup) ptLightGroup.visible = false; publishMode(); });
  }

  function setTilt(nx, ny) {
    /* nx,ny: -1〜1（kazasuの正規化座標） */
    stopAutoSpin();         /* 触ったら自動回転を止める（スピン角を curRY に畳み込み、瞬間回転を防ぐ） */
    targetRY = nx * 0.9;    /* 左右傾き */
    targetRX = ny * 0.7;    /* 上下傾き */
    lastTiltMs = nowMs();   /* settle判定の基準時刻 */
    if (renderMode !== 'pbr') switchToPbr();   /* 現像中でも即PBR復帰（即応性が最優先） */
  }

  var clock = new THREE.Clock();

  /* autoSpin を止める瞬間に、加算スピン角（rotation.y に足していた elapsedTime*0.25）を
     curRY と targetRY に畳み込む。これをしないと autoSpin=false になった瞬間に加算項が消え、
     石が約72°（5秒で約1.25rad）瞬間回転してしまう。畳み込み後は rotation.y=curRY で連続になる
     （autoSpin=false 時の rotation.y 式は加算項を含まないので二重には効かない）。 */
  function stopAutoSpin() {
    if (!autoSpin) return;
    var spun = (clock.elapsedTime * 0.25) % (Math.PI * 2);
    curRY += spun;
    targetRY += spun;
    autoSpin = false;
  }

  function loop() {
    if (!running) return;
    rafId = requestAnimationFrame(loop);
    var dt = clock.getDelta();
    if (autoSpin && nowMs() > spinUntilMs) stopAutoSpin();   /* 一定時間でautospin停止→静止へ（角度を畳み込み連続に） */
    /* 補間 */
    curRX += (targetRX - curRX) * 0.09;
    curRY += (targetRY - curRY) * 0.09;
    if (mesh) {
      mesh.rotation.x = baseTiltX + curRX;   /* 基準の見下ろし＋ユーザー傾き */
      mesh.rotation.y = curRY + (autoSpin ? clock.elapsedTime * 0.25 : 0);
    }

    /* 静止判定（Task1の純粋関数）: autospin停止・目標との差が十分小さい・傾け後500ms経過 */
    var dTarget = Math.abs(targetRX - curRX) + Math.abs(targetRY - curRY);
    var still = window.NoctaGemPTUtil && window.NoctaGemPTUtil.isStill({ autoSpin: autoSpin, dTarget: dTarget, msSinceTilt: nowMs() - lastTiltMs });

    if (ptAllowed && still && renderMode === 'pbr') beginDevelop();

    if (renderMode === 'developing' && developer) {
      /* PTは共有scene/cameraと mesh の現在姿勢を読む。静止済みなので像はブレない。
         1フレーム1サンプル累積し、序盤で素早くフェードインさせる */
      devProgress = developer.renderSample();
      if (ptCanvas) ptCanvas.style.opacity = String(Math.min(1, devProgress * 3));
      if (devProgress >= 1) {
        renderMode = 'still';
        /* 累積完了。以後この分岐に入らずPBRが裏で描かれるため、PBRを汚さぬよう光源を消す
           （PT canvasがopacity=1で覆うので見た目は現像像のまま。不変条件「PBR時は光源非表示」を厳密化）*/
        if (ptLightGroup) ptLightGroup.visible = false;
      }
      publishMode();
      /* 現像中はPBR描画をスキップしPTに委ねる（負荷削減） */
      return;
    }

    publishMode();
    if (composer) composer.render();
    else renderer.render(scene, camera);
  }
  loop();

  function resize() {
    var w = container.clientWidth || width;
    var h = container.clientHeight || height;
    width = w; height = h;   /* 次回fallback用に保持値を更新 */
    renderer.setSize(w, h);
    if (composer) composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  var onWinResize = function () { resize(); };
  window.addEventListener('resize', onWinResize);

  return {
    setTilt: setTilt,
    resize: resize,
    isReady: function () { return true; },
    getRenderMode: function () { return renderMode; },   /* テスト・診断用 */
    detach: function () {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onWinResize);
      if (typeof window !== 'undefined') { window.__gem3dMode = null; window.__gem3dInspectPtLights = null; }
      try {
        /* PT現像リソースの解放（PT専用renderer/canvasを含む）。PT環境(GradientEquirect)は
           developer.dispose() 側で解放される。 */
        if (developer) { try { developer.dispose(); } catch (e) {} developer = null; }
        if (ptCanvas && ptCanvas.parentNode) ptCanvas.parentNode.removeChild(ptCanvas);
        ptCanvas = null;
        if (mesh) { mesh.geometry.dispose(); mesh.material.dispose(); }
        /* 環境シーン内部のmesh/material/geometryも解放 */
        disposeEnvScene();
        /* PT用 emissive 光源群の geometry/material を解放 */
        disposePtLightGroup();
        if (envRT) envRT.dispose();
        if (pmrem) pmrem.dispose();
        /* UnrealBloomPass等は独自render targetを持つのでpass個別にdispose後composerをdispose */
        if (composer) {
          if (composer.passes) composer.passes.forEach(function (p) { if (p.dispose) p.dispose(); });
          if (composer.dispose) composer.dispose();
        }
        renderer.dispose();
        /* ライトボックス用途で開閉を繰り返すため、WebGL contextを明示的に失わせる */
        if (renderer.forceContextLoss) renderer.forceContextLoss();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      } catch (_) {}
    }
  };
}

window.NoctaGem3d = { mount: mount };
