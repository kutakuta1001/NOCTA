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

/* 背後光源の「にじみ」用ソフト円形グラデーションテクスチャ（外部画像なし・Canvas 2D生成）。
   aurora プリセットの後光（halo bleed）を実シーン内のPlaneに貼って、透明キャンバス背景に
   にじみを直接描く。中心が最も明るく、外周は透明にフェードする単純な放射グラデーション。 */
function makeGlowTexture() {
  var size = 256;
  var cnv = document.createElement('canvas');
  cnv.width = cnv.height = size;
  var ctx = cnv.getContext('2d');
  var g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,244,224,0.24)');
  g.addColorStop(0.32, 'rgba(255,230,196,0.11)');
  g.addColorStop(0.62, 'rgba(214,188,255,0.03)');
  g.addColorStop(1, 'rgba(10,9,6,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  var tex = new THREE.CanvasTexture(cnv);
  if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
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
 * 虹の強さ×光の向きのパラメータ化（かざす演出の拡張）
 *
 * DIR_SIGN: 光の向き（中央/左/右）の水平シフト方向。screen座標で右=+1・左=-1・中央=0。
 *   buildShowcaseScene/buildAuroraScene のキーライト位置、gem3d-pathtracer.js のPT小光源の
 *   スポット位置決定で共通に使う符号（world +x = screen右、既存のcardB配置と同じ規約）。
 *
 * AURA_LEVELS: 虹の強さ3段（0=なし/1=弱/2=強）。0は現状のstill（退行なし）。
 *   1〜2のみ buildAuroraScene を使い、scale で発光カード強度を段階的にスケールする。
 *   レベル2(強)は旧'aurora'固定値（dispersion+0.22・envIntensity1.45・bloom strength0.60等）と
 *   一致させ、旧setEnv('aurora')の見た目をそのまま保つ（回帰防止）。
 *   bloomのthreshold（白飛び対策の収束点）は全レベル共通で固定し、strength/radiusのみ動かす。
 * ================================================================ */
var DIR_SIGN = { center: 0, left: -1, right: 1 };
var BLOOM_THRESHOLD = 0.85;
var AURA_LEVELS = {
  0: { dispInc: 0,    scale: 0,    backlight: 0,    envIntensity: 1.6,  bloomStrength: 0.55, bloomRadius: 0.60 },
  1: { dispInc: 0.10, scale: 0.62, backlight: 0.08, envIntensity: 1.50, bloomStrength: 0.57, bloomRadius: 0.60 },
  2: { dispInc: 0.22, scale: 1.00, backlight: 0.14, envIntensity: 1.45, bloomStrength: 0.60, bloomRadius: 0.60 }
};

/* ================================================================
 * 宝石ショーケース環境シーン（PMREM用）
 * warm-blackの暗い空間に、明るいライトカードを複数配置。
 * ファセット1枚ごとに光源が映り込み、傾けると多点できらめく。
 * ================================================================ */
function buildShowcaseScene(direction, bgMode) {
  var dsign = DIR_SIGN[direction] || 0;
  var lit = (bgMode === 'light');
  var scene = new THREE.Scene();
  /* dark(現状): NOCTA warm-black / light: 明るいスタジオ紙色（3D環境マップの世界。
     CSSの#lightbox可視背景とは別に、宝石のファセットが映り込む世界そのものを明るくする） */
  scene.background = new THREE.Color(lit ? 0xECE6DA : 0x0A0906);

  /* MeshBasicMaterialは通常0-1だが、環境マップ用に高輝度(>1)にして
     ファセットに強く映り込ませる。色×係数で明るさを表現 */
  function bright(hex, k) {
    var c = new THREE.Color(hex);
    c.multiplyScalar(k || 1);
    return c;
  }
  function cardB(w, h, hex, k, x, y, z, rx, ry) {
    /* 白スタジオはソフトボックス感を出すため主要ライトカードをわずかに明るく(×1.12) */
    var kk = lit ? k * 1.12 : k;
    var geo = new THREE.PlaneGeometry(w, h);
    var mat = new THREE.MeshBasicMaterial({ color: bright(hex, kk), side: THREE.DoubleSide, toneMapped: false });
    var m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (rx) m.rotation.x = rx;
    if (ry) m.rotation.y = ry;
    scene.add(m);
  }

  /* 上方の大きな柔らかい光（キー・全体を持ち上げる）。directionで水平位置を左右へ振る
     （中央=0で従来と完全一致・映り込みの向きが変わる）。 */
  cardB(7, 3, 0xfff4e2, 3.0, dsign * 2.6, 5, 1, -Math.PI / 2.2, 0);
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
 * aurora プリセットの環境シーン（PMREM用）
 * still（buildShowcaseScene）を土台に、
 *   ・背後（-z）に大きく明るい発光板＋その周囲のぼかしハロ（リムライトの本体）
 *   ・上部に弧を描くスペクトル配色（赤橙黄緑青藍紫）の高輝度カード
 * を加える。宝石を回すとファセットごとに異なる色帯を拾い、上品な範囲で虹色にきらめく。
 * カード数は buildShowcaseScene と同程度に抑え、負荷を増やしすぎない。
 * ================================================================ */
function buildAuroraScene(direction, scale, bgMode) {
  var dsign = DIR_SIGN[direction] || 0;
  scale = (typeof scale === 'number') ? scale : 1;
  var lit = (bgMode === 'light');
  var scene = new THREE.Scene();
  /* dark(現状): stillのwarm-blackより一段暗く（後光の明暗コントラストを出すため）
     light: buildShowcaseSceneと同じ明るいスタジオ紙色。scale自体がapplyAura側で既に
     控えめ（×0.6）に減らされているため、ここでは背景色を切り替えるだけでよい */
  scene.background = new THREE.Color(lit ? 0xECE6DA : 0x050402);

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
    return m;
  }

  /* 背後の発光板（カメラと反対側・-z）— リムライト/透過光の本体。
     周囲にひとまわり大きく淡いカードを重ねて縁をぼかし、ハロがにじむ見え方にする。
     stillのキーカード(明るさ3.0)より少し抑える程度に留める（円弧カード群と合算されて
     全周が同時に光ってしまう=過剰演出を避けるため、単体の輝度は低めにする）。 */
  cardB(6.5, 6.5, 0xfff2df, 2.2 * scale, dsign * 2.2, 0.3, -6.0, 0, 0);
  cardB(9.5, 9.5, 0x241f2b, 0.18 * scale, dsign * 2.2, 0.1, -7.4, 0, 0);

  /* プリズム（虹）— 上方に弧を描くスペクトル配色のカード群。
     stillの単一キーカードより多い枚数を配置するため、1枚あたりの輝度はかなり控えめにする
     （枚数×輝度の合算で全周が一斉に光る「リング状の白飛び」を避け、色の気配程度に留める）。 */
  var SPECTRUM = [0xE2574C, 0xE8892A, 0xE8C23A, 0x6FBF73, 0x4F9FE0, 0x5D6FE0, 0x9966CC];
  for (var i = 0; i < SPECTRUM.length; i++) {
    var t = i / (SPECTRUM.length - 1);      /* 0..1 */
    var az = (t - 0.5) * Math.PI * 0.92 + dsign * 0.5;    /* 左右に弧を描く。directionで弧全体を回す */
    var dist = 4.6;
    var sx = Math.sin(az) * dist;
    var sy = 2.7 - Math.abs(t - 0.5) * 1.1; /* 弧の中央がやや高い */
    var sz = Math.cos(az) * dist * 0.45 - 0.6;
    var card = cardB(0.8, 1.3, SPECTRUM[i], 1.35 * scale, sx, sy, sz, 0, 0);
    card.lookAt(0, 0, 0);
  }

  /* 前面左右の縦長ストリップ（ブリリアンスの帯・stillとほぼ同じ輝度） */
  cardB(0.7, 5.5, 0xffffff, 3.6, -3.6, 0, 3, 0, Math.PI / 5);
  cardB(0.7, 5.5, 0xf4e8ff, 3.2, 3.6, 0, 3, 0, -Math.PI / 5);
  /* 正面下からの照り返し */
  cardB(5, 2, 0xd8e0f0, 1.1, 0, -3.5, 3.5, Math.PI / 3, 0);

  /* シンチレーション用の小さな高輝度スポット群（still同数=16）。
     3個に1個をスペクトル色にして、瞬きにも虹の気配を混ぜる。 */
  var seed = 4321;
  function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
  for (var s = 0; s < 16; s++) {
    var az2 = rnd() * Math.PI * 2;
    var el2 = (rnd() - 0.3) * Math.PI * 0.7;
    var dist2 = 4 + rnd() * 2;
    var px = Math.cos(el2) * Math.sin(az2) * dist2;
    var py = Math.sin(el2) * dist2 + 1.0;
    var pz = Math.cos(el2) * Math.cos(az2) * dist2 + 1.5;
    var sp = 0.16 + rnd() * 0.2;
    var useSpectrum = (s % 3 === 0);
    var col = useSpectrum ? SPECTRUM[s % SPECTRUM.length] : (rnd() > 0.5 ? 0xffffff : 0xfff2e0);
    var m = new THREE.Mesh(
      new THREE.PlaneGeometry(sp, sp),
      new THREE.MeshBasicMaterial({ color: bright(col, useSpectrum ? 5.2 * scale : 6.0), side: THREE.DoubleSide, toneMapped: false })
    );
    m.position.set(px, py, pz);
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
  /* 虹の強さ・光の向きの初期値。旧opts.env='aurora'は intensity=2(中)へマップし旧見た目を保つ。
     既定は intensity=0(なし/現状)・direction=center。 */
  var initialIntensity = (opts.env === 'aurora') ? 2 : 0;
  var initialDirection = (opts.direction === 'left' || opts.direction === 'right') ? opts.direction : 'center';

  var width = container.clientWidth || 400;
  var height = container.clientHeight || 500;

  var renderer, scene, camera, mesh, envRT, pmrem, envScene, composer, bloomPass, ptLightGroup;
  var backLight, glowMesh = null, currentPreset = 'still', baseDispersion = 0.5;
  var currentIntensity = 0, currentDirection = 'center';   /* 虹の強さ(0-2)・光の向き(center/left/right) */
  var currentBg = 'dark';   /* 背景('dark'|'light')。既定dark=現状。setBackgroundのみが変更する */
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

  /* aurora専用の背後グロー（にじみ）Planeを遅延生成。一度作ったら再利用し、
     preset切替では visible の切替のみで済ませる（作り直しコストを避ける）。 */
  function ensureGlowMesh() {
    if (glowMesh) return glowMesh;
    var tex = makeGlowTexture();
    /* NormalBlending（加算にしない）: Bloomは自身も明るいピクセルを加算で滲ませるため、
       にじみ自体を加算にすると二重に増幅し白飛びしやすい。通常合成で上限を持たせる。 */
    var mat = new THREE.MeshBasicMaterial({
      map: tex, transparent: true, depthWrite: false, depthTest: false,
      side: THREE.DoubleSide
    });
    var geo = new THREE.PlaneGeometry(2.5, 2.5);
    glowMesh = new THREE.Mesh(geo, mat);
    glowMesh.renderOrder = -1;   /* mesh(透過)より先に描き、実際の背後にある「にじみ」として振る舞わせる */
    glowMesh.position.set(0, 0.05, -1.3);   /* 宝石のすぐ後方・カメラは静止なので常に正面を向く */
    scene.add(glowMesh);
    return glowMesh;
  }

  /* テスト・診断用に現在の演出プリセットをwindowへ反映（本番挙動は変えない）。
     getEnvPreset() が正規の観測APIで、これは補助のデバッグフック（__gem3dMode と同じ位置づけ）。 */
  function publishPreset() {
    if (typeof window !== 'undefined') window.__gem3dEnvPreset = currentPreset;
  }

  /* テスト・診断用に現在の虹の強さ・光の向きをwindowへ反映（本番挙動は変えない）。
     getAura() が正規の観測APIで、これは補助のデバッグフック（__gem3dEnvPreset と同じ位置づけ）。 */
  function publishAura() {
    if (typeof window !== 'undefined') window.__gem3dAura = { intensity: currentIntensity, direction: currentDirection };
  }

  /* テスト・診断用に現在の背景をwindowへ反映（本番挙動は変えない）。
     getBackground() が正規の観測APIで、これは補助のデバッグフック（__gem3dAura と同じ位置づけ）。 */
  function publishBg() {
    if (typeof window !== 'undefined') window.__gem3dBg = currentBg;
  }

  /* 虹の強さ×光の向きを適用する本体。envScene(PMREM)・material.dispersion・bloom強度・
     背後光源(backLight)・にじみ(glowMesh) を intensity/direction に応じて再構成する。
     mesh の geometry/rotation（tilt・autoSpin状態）は一切触らない＝回転は保持される。
     AURA_LEVELS/DIR_SIGNはモジュールスコープの定数（buildShowcaseScene/buildAuroraScene手前）。 */
  function applyAura(intensity, direction) {
    intensity = AURA_LEVELS[intensity] ? intensity : 0;
    direction = DIR_SIGN.hasOwnProperty(direction) ? direction : 'center';
    currentIntensity = intensity;
    currentDirection = direction;
    currentPreset = (intensity > 0) ? 'aurora' : 'still';   /* 後方互換の観測用フラグ（旧setEnv系） */
    var lvl = AURA_LEVELS[intensity];
    var lit = (currentBg === 'light');

    /* 白スタジオでは虹・後光・bloomを自動で控えめにし、白飛びを避ける（Part Aの値自体は再チューニング
       していない。dark時は全係数1倍・BLOOM_THRESHOLD・露出1.4のままなので現状と完全一致する）。 */
    var dispInc      = lit ? lvl.dispInc * 0.5       : lvl.dispInc;
    var backlightVal = lit ? lvl.backlight * 0.5     : lvl.backlight;
    var auraScale    = lit ? lvl.scale * 0.6         : lvl.scale;
    var bloomStr     = lit ? lvl.bloomStrength * 0.4 : lvl.bloomStrength;
    var bloomThr     = lit ? 0.92 : BLOOM_THRESHOLD;

    if (envRT) { envRT.dispose(); envRT = null; }
    disposeEnvScene();
    envScene = (intensity > 0) ? buildAuroraScene(direction, auraScale, currentBg) : buildShowcaseScene(direction, currentBg);
    envRT = pmrem.fromScene(envScene, 0.015);
    scene.environment = envRT.texture;
    scene.environmentIntensity = lvl.envIntensity;
    /* 可視背景（canvasの描画色）。Bloom用EffectComposer/OutputPassが不透明出力するため
       canvasは透明合成にできない。dark(現状)はnull=既定の黒でCSS暗背景と馴染む。lightは明るい
       studio色を敷き、CSS(#lightbox.gyu-bg-light)側をこの色のACESトーンマップ後の実測値に合わせて
       canvas矩形とCSSの段差(継ぎ目)を無くす（index.html の #lightbox.gyu-bg-light 参照）。 */
    scene.background = lit ? new THREE.Color(0xECE6DA) : null;

    /* 分散（ファイア）: レベルが上がるほどファセットが光を強く虹に分けるよう底上げ。石別baseは維持し
       なし(0)で必ず元のbase値に戻る（'dispersion' in matで対応three版のみ） */
    if (mesh && mesh.material && ('dispersion' in mesh.material)) {
      mesh.material.dispersion = Math.max(0, Math.min(1, baseDispersion + dispInc));
    }

    /* bloom: useBloom無効端末ではcomposer/bloomPassがnullなのでno-op（既存ゲートに従う）。
       白スタジオはstrength/thresholdを控えめ・高めにして白飛びを避ける。radiusはレベルの値をそのまま使う。 */
    if (bloomPass) {
      bloomPass.strength = bloomStr;
      bloomPass.radius = lvl.bloomRadius;
      bloomPass.threshold = bloomThr;
    }

    /* 背後の実光源（透過光・リムライト）。位置もdirectionで水平に振る（中央=元の1.1で従来と一致）。 */
    if (backLight) {
      backLight.intensity = backlightVal;
      backLight.position.x = 1.1 + DIR_SIGN[direction] * 2.5;
    }

    /* 後光のにじみ（実シーン内Plane・キャンバス背景に直接描く）。directionで水平位置を振る。 */
    if (intensity > 0) {
      var gm = ensureGlowMesh();
      gm.visible = true;
      gm.position.x = DIR_SIGN[direction] * 0.55;
    } else if (glowMesh) {
      glowMesh.visible = false;
    }

    /* 露出: 白スタジオは白飛びを避けるためやや低めに。darkは現状の1.4のまま（変更なし）。 */
    renderer.toneMappingExposure = lit ? 1.25 : 1.4;

    publishPreset();
    publishAura();
    publishBg();
  }

  /* mount途中で失敗した場合に、生成済みリソースを全解放してからnullを返す */
  function cleanupPartial() {
    try {
      if (mesh) { if (mesh.geometry) mesh.geometry.dispose(); if (mesh.material) mesh.material.dispose(); }
      disposeEnvScene();
      disposePtLightGroup();
      if (glowMesh) {
        if (glowMesh.geometry) glowMesh.geometry.dispose();
        if (glowMesh.material) { if (glowMesh.material.map) glowMesh.material.map.dispose(); glowMesh.material.dispose(); }
      }
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

    /* 環境マップ用のPMREM生成器（envScene自体の構築はpreset別にapplyEnvPresetへ委譲） */
    pmrem = new THREE.PMREMGenerator(renderer);

    /* 補助の方向光（環境マップだけでは出ない鋭いスペキュラを足す） */
    var key = new THREE.DirectionalLight(0xfff6e6, 1.2);
    key.position.set(-2.4, 2.0, 2.5);
    scene.add(key);
    var fill = new THREE.DirectionalLight(0xe8f0ff, 0.6);
    fill.position.set(2.6, -1.2, 2.2);
    scene.add(fill);
    /* 背後（カメラと反対側=-z）の実光源。still時はintensity=0で見た目に影響しない。
       auroraで有効化すると、宝石の背後から透過光・リムライトとして効く（applyEnvPresetが制御）。 */
    backLight = new THREE.DirectionalLight(0xfff2df, 0);
    /* カメラ軸からわずかに外し、正面全面を素通しで照らすフラッシュではなく
       縁だけがグレージング角で光る「リムライト」寄りの当たり方にする */
    backLight.position.set(1.1, 1.4, -4.0);
    scene.add(backLight);

    /* 石名からシードを作り、同じカットでも石ごとに微妙に違う個体差を与える */
    var seed = hashSeed(gemData.name || gemData.title || gemData.cut || 'gem');
    var geo = makeGeometry(gemData.cut, seed);
    var mat = makeMaterial(gemData);
    /* preset切替のたびに石別のbase値へ戻すため、生成直後の値を保持しておく */
    if ('dispersion' in mat) baseDispersion = mat.dispersion;
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

    /* 虹の強さ・光の向きの初期適用（envScene構築・dispersion・bloom・背後光源をまとめて設定）。
       mesh/bloomPass等の生成が終わった後に一箇所で行うことで、setAura切替時と同一経路を通す。 */
    applyAura(initialIntensity, initialDirection);
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
    import('./gem3d-pathtracer.js?v=5').then(function (mod) {
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
        return mod.createDeveloper({
          THREE: THREE, renderer: renderer, scene: scene, camera: camera, maxSamples: 160,
          direction: currentDirection, intensity: currentIntensity,   /* PT小光源の初期向き・強さ */
          bgMode: currentBg   /* PT現像画像の初期背景（'dark'|'light'） */
        });
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

  /* 演出プリセット切替の公開API（旧・後方互換）。'still'|'aurora' 以外は 'still' に丸め、
     intensity 0(なし)|2(中=旧aurora固定値)へマップするsetAuraの薄いラッパー。方向は現状維持。 */
  function setEnv(preset) {
    preset = (preset === 'aurora') ? 'aurora' : 'still';
    setAura({ intensity: preset === 'aurora' ? 2 : 0 });
  }

  /* 虹の強さ(0なし/1弱/2強)×光の向き(center/left/right)の公開API。
     opts省略時・不正値時は現在値を維持する（片方だけ変える呼び方が可能）。同一値の再指定はno-op。
     mesh の回転（tilt・autoSpin状態）は一切変更しない — envScene・dispersion・bloom・
     背後光源・にじみ・PT小光源の向きだけを applyAura / developer.setDirection が再構成する。 */
  function setAura(opts) {
    opts = opts || {};
    var nextIntensity = currentIntensity, nextDirection = currentDirection;
    if (typeof opts.intensity === 'number' && AURA_LEVELS[opts.intensity]) nextIntensity = opts.intensity;
    if (typeof opts.direction === 'string' && DIR_SIGN.hasOwnProperty(opts.direction)) nextDirection = opts.direction;
    if (nextIntensity === currentIntensity && nextDirection === currentDirection) return;
    var prevIntensity = currentIntensity, prevDirection = currentDirection;
    applyAura(nextIntensity, nextDirection);
    /* PT用の小光源(gem3d-pathtracer.js)にも新しい向き・強さを反映する。developerが未生成
       （まだ一度も静止していない）場合は、次回のcreateDeveloper呼び出しがcurrentDirection/
       currentIntensityを読むため、ここでは既存developerがある場合のみ更新すれば十分。 */
    if (developer && (nextDirection !== prevDirection || nextIntensity !== prevIntensity)) {
      try { developer.setDirection(nextDirection, nextIntensity); } catch (e) {}
    }
    /* PT現像済み(still)/現像中(developing)のptCanvasはopacityで覆ったまま残るため、
       envScene/dispersion/bloom/backLight/glowをここで切り替えても画面上は旧環境の
       現像画像が被さって見え続けてしまう(トグルが効かない)。switchToPbr()でPT状態を
       リセットし(ptCanvasを隠す・developer.reset()・devProgress=0・renderMode='pbr')、
       新環境がPBR描画で即見えるようにする。次の静止で新環境の下で再現像(resync)される。
       mesh.rotation(tilt・autoSpin)はswitchToPbrが一切変更しないため回転状態は保持される。 */
    if (renderMode !== 'pbr') switchToPbr();
  }

  /* 背景(黒/白)の公開API。同一値の再指定はno-op。applyAuraを同じintensity/directionで
     再実行することで、envScene・dispersion・bloom・backLight・露出を新背景の係数で再構成する。
     mesh の回転は一切変更しない（setAuraと同様）。 */
  function setBackground(mode) {
    var next = (mode === 'light') ? 'light' : 'dark';
    if (next === currentBg) return;
    currentBg = next;
    applyAura(currentIntensity, currentDirection);
    if (developer && developer.setBackground) { try { developer.setBackground(currentBg); } catch (e) {} }
    /* PT現像済み/現像中のptCanvasは新背景に切り替わらないため、switchToPbrでPT状態をリセットし
       新背景をPBRで即反映する（次の静止で新背景の下で再現像される）。setAuraと同じ理由。 */
    if (renderMode !== 'pbr') switchToPbr();
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
    setEnv: setEnv,
    setAura: setAura,
    setBackground: setBackground,
    resize: resize,
    isReady: function () { return true; },
    getRenderMode: function () { return renderMode; },   /* テスト・診断用 */
    getEnvPreset: function () { return currentPreset; },  /* テスト・診断用（後方互換） */
    getAura: function () { return { intensity: currentIntensity, direction: currentDirection }; },  /* テスト・診断用 */
    getBackground: function () { return currentBg; },  /* テスト・診断用 */
    detach: function () {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onWinResize);
      if (typeof window !== 'undefined') { window.__gem3dMode = null; window.__gem3dInspectPtLights = null; window.__gem3dEnvPreset = null; window.__gem3dAura = null; window.__gem3dBg = null; }
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
        /* auroraの背後グロー（生成済みの場合のみ・texture/material/geometryを解放） */
        if (glowMesh) {
          if (glowMesh.geometry) glowMesh.geometry.dispose();
          if (glowMesh.material) { if (glowMesh.material.map) glowMesh.material.map.dispose(); glowMesh.material.dispose(); }
          glowMesh = null;
        }
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
