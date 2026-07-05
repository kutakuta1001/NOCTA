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
 *   gemData: { cut, gem3d, ior, accentColor, name }
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

/* ラウンドブリリアントカット（本物の58面構造に近づけたモデル）
 *
 * 標準ブリリアントは主要8方位（メイン）＋その中間（half）でファセットが割れる。
 * ここでは mains=8 として、各セクター内をさらに分割することで
 *   クラウン: テーブル / ベゼルファセット / スターファセット / アッパーガードルファセット
 *   ガードル: 薄い帯（ジグザグの上下エッジ）
 *   パビリオン: パビリオンメインファセット / ロウワーガードルファセット（頂点は1点キュレット）
 * を表現する。全ファセット flat shading で境界を鋭く保ち、傾けたとき多点で瞬く。
 */
function brilliantGeometry(mains) {
  mains = mains || 8;
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

  function P(radius, y, angle) {
    return new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
  }
  function pushTri(a, b, c) {
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  }

  var da = (Math.PI * 2) / N;   /* ガードル頂点1つあたりの角度 */

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
    return P(girdleR, y, i * da);
  }
  function girdleBot(i) {
    var y = (i % 2 === 0) ? girdleBotY - 0.02 : girdleBotY;
    return P(girdleR, y, i * da);
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
  geo.computeBoundingSphere();
  return geo;
}

/* オーバル/クッション: ブリリアントをXZ非等方スケール */
function ovalGeometry(mains) {
  var geo = brilliantGeometry(mains || 9);
  geo.scale(1.25, 1.0, 0.85);
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

function makeGeometry(cut) {
  switch (cut) {
    case 'oval': return ovalGeometry();
    case 'step': return stepGeometry();
    case 'cabochon': return cabochonGeometry();
    case 'crystal': return crystalGeometry();
    case 'brilliant':
    default: return brilliantGeometry();
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
 * マテリアルプリセット
 * ================================================================ */
function makeMaterial(gemData) {
  var color = hexToColor(gemData.accentColor || '#D8ECEF');
  var kind = gemData.gem3d || 'transparent';
  var ior = gemData.ior || 1.9;

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

  /* transparent（デフォルト）— 屈折・分散・色吸収で本物の宝石らしさ
     v2: thickness増で屈折の深み・attenuationDistance調整・dispersionは石別 */
  var mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xffffff),
    transmission: 1.0,
    thickness: 1.8,
    ior: ior,
    roughness: 0.0,
    metalness: 0.0,
    reflectivity: 0.55,
    attenuationColor: color,
    attenuationDistance: 2.2,
    specularIntensity: 1.0,
    /* clearcoatを強めるとフラットシェーディングのファセット境界でフレネル反射が際立ち、
       稜線がキラッと光る（ベベルの視覚効果をジオメトリを増やさず材質で得る） */
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    envMapIntensity: 1.9,
    side: THREE.DoubleSide,   /* 透明石は屈折で内部の裏面ファセットも見えるため両面描画 */
    flatShading: true
  });
  /* 分散（ファイア）: three r167+ で対応。石別のdispersion（データ未指定は0.5） */
  if ('dispersion' in mat) mat.dispersion = (typeof gemData.dispersion === 'number') ? gemData.dispersion : 0.5;
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

  var renderer, scene, camera, mesh, envRT, pmrem, envScene, composer, bloomPass;
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

  /* mount途中で失敗した場合に、生成済みリソースを全解放してからnullを返す */
  function cleanupPartial() {
    try {
      if (mesh) { if (mesh.geometry) mesh.geometry.dispose(); if (mesh.material) mesh.material.dispose(); }
      disposeEnvScene();
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

    var geo = makeGeometry(gemData.cut);
    var mat = makeMaterial(gemData);
    mesh = new THREE.Mesh(geo, mat);
    /* ジオメトリを画面に収める正規化 */
    var r = geo.boundingSphere ? geo.boundingSphere.radius : 1;
    mesh.scale.setScalar(1.35 / r);
    scene.add(mesh);

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
  var targetRX = 0, targetRY = 0;
  var curRX = 0, curRY = 0;
  var autoSpin = !reduce;
  var running = true;
  var rafId = null;

  function setTilt(nx, ny) {
    /* nx,ny: -1〜1（kazasuの正規化座標） */
    targetRY = nx * 0.9;    /* 左右傾き */
    targetRX = ny * 0.7;    /* 上下傾き */
    autoSpin = false;       /* 触ったら自動回転を止める */
  }

  var clock = new THREE.Clock();
  function loop() {
    if (!running) return;
    rafId = requestAnimationFrame(loop);
    var dt = clock.getDelta();
    /* 補間 */
    curRX += (targetRX - curRX) * 0.09;
    curRY += (targetRY - curRY) * 0.09;
    if (mesh) {
      mesh.rotation.x = curRX;
      mesh.rotation.y = curRY + (autoSpin ? clock.elapsedTime * 0.25 : 0);
    }
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
    detach: function () {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onWinResize);
      try {
        if (mesh) { mesh.geometry.dispose(); mesh.material.dispose(); }
        /* 環境シーン内部のmesh/material/geometryも解放 */
        disposeEnvScene();
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
