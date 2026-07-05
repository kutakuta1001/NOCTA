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
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* ---- 色ユーティリティ ---- */
function hexToColor(hex) {
  return new THREE.Color(hex);
}

/* ================================================================
 * カット形状のジオメトリ生成
 * すべて flat shading（面法線）前提で、ファセットの境界を鋭く保つ。
 * ================================================================ */

/* ラウンドブリリアントカット
 * ガードル(N角形の腰) + クラウン(上・テーブル面と星ファセット) + パビリオン(下・尖った底) */
function brilliantGeometry(segments) {
  segments = segments || 16;
  var positions = [];
  var girdleR = 1.0;
  var girdleY = 0.0;
  var tableR = 0.55;      /* テーブル面（上面）の半径 */
  var crownY = 0.42;      /* クラウンの高さ */
  var pavilionY = -0.95;  /* パビリオンの尖端 */

  function ring(radius, y, n, offset) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2 + (offset || 0);
      pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
    }
    return pts;
  }

  var girdle = ring(girdleR, girdleY, segments, 0);
  var table = ring(tableR, crownY, segments, 0);
  var apex = new THREE.Vector3(0, pavilionY, 0);
  var tableCenter = new THREE.Vector3(0, crownY, 0);

  function pushTri(a, b, c) {
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  }

  for (var i = 0; i < segments; i++) {
    var next = (i + 1) % segments;
    /* クラウン: ガードル→テーブルへ向かうファセット（2三角で台形） */
    pushTri(girdle[i], table[i], girdle[next]);
    pushTri(girdle[next], table[i], table[next]);
    /* テーブル面（上面の多角形をファンで埋める） */
    pushTri(table[i], tableCenter, table[next]);
    /* パビリオン: ガードル→尖端 */
    pushTri(girdle[i], girdle[next], apex);
  }

  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();   /* flat: 各三角の面法線 */
  geo.computeBoundingSphere();
  return geo;
}

/* オーバル/クッション: ブリリアントをXZ非等方スケール */
function ovalGeometry(segments) {
  var geo = brilliantGeometry(segments || 18);
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

  /* transparent（デフォルト）— 屈折・分散・色吸収で本物の宝石らしさ */
  var mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xffffff),
    transmission: 1.0,
    thickness: 1.4,
    ior: ior,
    roughness: 0.02,
    metalness: 0.0,
    reflectivity: 0.5,
    attenuationColor: color,
    attenuationDistance: 1.2,
    specularIntensity: 1.0,
    clearcoat: 0.4,
    flatShading: true
  });
  /* 分散（ファイア）: three r167+ で対応 */
  if ('dispersion' in mat) mat.dispersion = 0.28;
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

  var renderer, scene, camera, mesh, envRT, pmrem, roomEnv;

  /* mount途中で失敗した場合に、生成済みリソースを全解放してからnullを返す */
  function cleanupPartial() {
    try {
      if (mesh) { if (mesh.geometry) mesh.geometry.dispose(); if (mesh.material) mesh.material.dispose(); }
      if (roomEnv && roomEnv.traverse) {
        roomEnv.traverse(function (o) {
          if (o.geometry) o.geometry.dispose();
          if (o.material) { if (Array.isArray(o.material)) o.material.forEach(function (m) { m.dispose(); }); else o.material.dispose(); }
        });
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    /* 環境マップ: warm-blackの部屋。RoomEnvironmentをベースに暗く
       roomEnvは後でtraverse disposeするため変数保持 */
    pmrem = new THREE.PMREMGenerator(renderer);
    roomEnv = new RoomEnvironment();
    envRT = pmrem.fromScene(roomEnv, 0.02);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 1.35;

    /* 高輝度光源（宝石のきらめきの光源）— きらめきは主に環境マップ由来とし方向光で補助 */
    var key = new THREE.DirectionalLight(0xfff6e6, 1.4);
    key.position.set(-2.4, 2.0, 2.5);
    scene.add(key);
    var fill = new THREE.DirectionalLight(0xe8f0ff, 0.8);
    fill.position.set(2.6, -1.2, 2.2);
    scene.add(fill);
    var rim = new THREE.PointLight(0xffffff, 2.0, 12, 2);
    rim.position.set(0, 1.5, -2.5);
    scene.add(rim);

    var geo = makeGeometry(gemData.cut);
    var mat = makeMaterial(gemData);
    mesh = new THREE.Mesh(geo, mat);
    /* ジオメトリを画面に収める正規化 */
    var r = geo.boundingSphere ? geo.boundingSphere.radius : 1;
    mesh.scale.setScalar(1.35 / r);
    scene.add(mesh);
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
    renderer.render(scene, camera);
  }
  loop();

  function resize() {
    var w = container.clientWidth || width;
    var h = container.clientHeight || height;
    renderer.setSize(w, h);
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
        /* RoomEnvironment内部のmesh/material/geometryも解放 */
        if (roomEnv && roomEnv.traverse) {
          roomEnv.traverse(function (o) {
            if (o.geometry) o.geometry.dispose();
            if (o.material) { if (Array.isArray(o.material)) o.material.forEach(function (m) { m.dispose(); }); else o.material.dispose(); }
          });
        }
        if (envRT) envRT.dispose();
        if (pmrem) pmrem.dispose();
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
