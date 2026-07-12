/**
 * NOCTA Gyu — 3D宝石パストレーサ（静止時の「現像」）
 *
 * WebGLPathTracer（three-gpu-pathtracer）を Gyu 用に包む。gem3d.js から遅延importされる。
 * PBR描画用の既存 renderer とは別に、PT専用の WebGLRenderer + canvas をこのモジュール内で
 * 生成する（WebGLPathTracer は渡した renderer の domElement に直接描くため、PBRの
 * renderer と共有すると競合する。scene/camera は既存インスタンスを共有する）。
 *
 * 呼び出し側（gem3d.js）は THREE 名前空間を opts.THREE で渡す（重複import回避）。
 *
 * 公開: createDeveloper(opts) -> developer
 *   opts = { THREE, renderer, scene, camera, maxSamples, direction, intensity }
 *     THREE: 呼び出し側が import した three 名前空間
 *     renderer: 既存の WebGLRenderer（PT用canvasのサイズ参照にのみ使う。描画には使わない）
 *     scene, camera: 既存のシーン・カメラ（PTと共有）
 *     maxSamples: 累積する最大サンプル数（省略時160）
 *     direction: 静止画の小光源の向き 'center'|'left'|'right'（省略時center）
 *     intensity: 虹の強さレベル(0-3)。小光源はレベル0でも常に出す。レベルが上がると微増するのみ
 *   developer.reset(): 累積をゼロに戻す（同一姿勢で現像を仕切り直すとき）
 *   developer.resync(): 現在の scene / mesh 姿勢で BVH を再ベイクし累積もゼロに戻す
 *     （reset は累積ゼロ化のみで姿勢は初回のまま。別の向きで静止したら resync で像を更新する）
 *     ※ setScene は内部で scene.environment を読むため、呼び出し側で PMREM env を外して呼ぶ
 *   developer.setDirection(direction, intensity): 静止画の小光源の向き・強さを更新する。
 *     three-gpu-pathtracer は scene.environment の「参照」が前回と同一だとGPUへの再アップロード
 *     を省略する（updateEnvironment内の _previousEnvironment !== scene.environment 判定）ため、
 *     既存テクスチャを.update()するだけでは静止画に反映されない。必ず新しいテクスチャ
 *     インスタンスを作って差し替える（旧インスタンスはここで確実にdispose）。反映は次回の
 *     resync（呼び出し側=gem3d.jsが担当）から。
 *   developer.renderSample() -> number: 1サンプル進め、進捗0..1(=samples/maxSamples)を返す
 *   developer.getCanvas() -> HTMLCanvasElement: PT出力のcanvas（gem3d.jsがオーバレイに使う）
 *   developer.dispose(): PT関連GPUリソースを解放（PT専用rendererも含む）
 *
 * モジュールは window を汚さない（純粋ESM）。
 */
import { WebGLPathTracer, GradientEquirectTexture } from 'three-gpu-pathtracer';

/* 光の向き（中央/左/右）の水平シフト方向。gem3d.js の DIR_SIGN と同じ規約
   （screen座標で右=+1・左=-1・中央=0。world +x = screen右）。 */
var DIR_SIGN = { center: 0, left: -1, right: 1 };

export function createDeveloper(opts) {
  opts = opts || {};
  var THREE = opts.THREE;
  var srcRenderer = opts.renderer;
  var scene = opts.scene;
  var camera = opts.camera;
  var maxSamples = opts.maxSamples || 160;

  var size = new THREE.Vector2();
  srcRenderer.getSize(size);

  var ptRenderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  ptRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  ptRenderer.setSize(size.x, size.y);
  /* 現像像の明るさ: PBRと同じACESフィルミックトーンマッピングを使い、露出はPBR(1.4)より
     高めの1.7に。パストレースは屈折で光が減衰し暗く沈みやすいため、静止画を少し持ち上げる。
     WebGLPathTracer は最終出力に renderer のトーンマッピング/露出を反映する。 */
  ptRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  ptRenderer.toneMappingExposure = 1.7;

  var pt = new WebGLPathTracer(ptRenderer);
  pt.tiles.set(2, 2); /* 1フレームを分割してGPU占有時間を抑える */

  /* 静止画の小さな光源（グリント）— 方向('center'|'left'|'right')に応じて位置を変える
     単一のハイライト。位置は gem3d.js の backLight と同一式 (1.1 + DIR_SIGN*2.5, 1.4, -4.0)
     を単位化して使い、PBR時のリムライトと現像グリントの向きを一致させる（world +x = screen右、
     -x = screen左。center=1.1 で従来と一致。左右は raw x を ±2.5 振ってから正規化するため、
     backLight と同じだけ動く＝正規化前は左右対称）。
     intensity(虹の強さレベル0-3)はスポットをごくわずかに強めるだけに使う
     （小光源はintensity=0でも常時出す — CEO要望: 「静止画にも小さな光源」）。 */
  var SPOT_COLOR = new THREE.Color(0xfff4df);
  var SPOT_SHARPNESS = 120;    /* 大きいほど鋭く小さいスポットになる（過度に明るい面積にしない） */
  var SPOT_PEAK = 2.6;         /* HDR加算量の上限。上品なグリント程度に留める */
  var _tmpDir = new THREE.Vector3();

  function spotVecFor(direction) {
    var dsign = DIR_SIGN[direction] || 0;
    /* gem3d.js の backLight.position (1.1 + DIR_SIGN*2.5, 1.4, -4.0) と同式。 */
    return new THREE.Vector3(1.1 + dsign * 2.5, 1.4, -4.0).normalize();
  }

  /* PT専用の手続き的環境（GradientEquirectTexture: 上=暖色明・下=暗）＋小さな高輝度スポット。
     PBR用の scene.environment（PMREM RenderTarget texture）は three-gpu-pathtracer@0.0.24 が
     equirect として読もうとして例外を投げるため PT では使えない。逆に env が空(null)だと現像が
     暗く沈むので、PT が読める equirect をこちら側で用意し、setScene の瞬間だけ scene.environment に
     差し込んで取り込ませ、直後に呼び出し前の値へ復帰する（PBR側の PMREM env を汚さない）。
     env の主管理はこの developer 側（gem3d.js の withPtEnv は PMREM の一時退避のみを担う）。
     direction/intensity が変わったら「新しいテクスチャ」を作って差し替える（同一インスタンスを
     .update()するだけでは three-gpu-pathtracer 側の参照比較でGPU再アップロードがスキップされ、
     静止画に反映されないため。詳細はファイル先頭のsetDirectionコメント参照）。 */
  function buildPtEnv(direction, intensity) {
    var tex = new GradientEquirectTexture();
    tex.topColor.set(0x7c7264);      /* 環境光を明るめに（上方の柔らかいフィル光） */
    tex.bottomColor.set(0x3a3327);   /* 地平〜下側を持ち上げる。宝石の外周（グレージング角）は
                                         環境を強く反射するため、ここを明るくすると輪郭が反射光を拾って
                                         黒背景から分離する（縁が暗く溶ける問題への本質的対処）。 */
    var spot = spotVecFor(direction);
    var boost = 1 + Math.max(0, Math.min(3, intensity || 0)) * 0.1;
    tex.generationCallback = function (polar, uv, coord, color) {
      _tmpDir.setFromSpherical(polar);
      var t = _tmpDir.y * 0.5 + 0.5;
      color.lerpColors(tex.bottomColor, tex.topColor, Math.pow(t, tex.exponent));
      var cosA = _tmpDir.dot(spot);
      if (cosA > 0.75) {
        var s = Math.pow(cosA, SPOT_SHARPNESS) * SPOT_PEAK * boost;
        color.r += SPOT_COLOR.r * s;
        color.g += SPOT_COLOR.g * s;
        color.b += SPOT_COLOR.b * s;
      }
    };
    tex.update();
    return tex;
  }

  var ptDirection = (opts.direction === 'left' || opts.direction === 'right') ? opts.direction : 'center';
  var ptIntensity = opts.intensity || 0;
  var ptEnv = buildPtEnv(ptDirection, ptIntensity);

  /* setScene / resync を「PT環境を差した状態」で通すラッパー。
     setScene は内部の updateEnvironment で scene.environment を読むため、直前に ptEnv を差し、
     finally で必ず元の値へ戻す（呼び出し側が既に null 化していれば null に戻る）。 */
  function applyScene() {
    var saved = scene.environment;
    scene.environment = ptEnv;
    try { pt.setScene(scene, camera); }
    finally { scene.environment = saved; }
  }

  applyScene();

  var samples = 0;

  return {
    reset: function () {
      pt.reset();
      samples = 0;
    },
    resync: function () {
      /* setScene は scene.updateMatrixWorld(true) 後に mesh をワールド空間へ再ベイクするため、
         現在の mesh 姿勢で BVH が組み直され、別の向きで静止したときも現像像が追従する。
         applyScene 経由で PT環境を差した状態の setScene を通す。呼び出し側（gem3d.js）は
         PMREM env を外した状態で呼ぶこと（withPtEnv）。setScene は内部で reset を通るが、
         こちらの samples カウンタも明示的にゼロ化する。 */
      applyScene();
      samples = 0;
    },
    setDirection: function (direction, intensity) {
      var nextDir = (direction === 'left' || direction === 'right') ? direction : 'center';
      var nextIntensity = (typeof intensity === 'number') ? intensity : ptIntensity;
      if (nextDir === ptDirection && nextIntensity === ptIntensity) return;
      ptDirection = nextDir;
      ptIntensity = nextIntensity;
      var old = ptEnv;
      ptEnv = buildPtEnv(ptDirection, ptIntensity);
      if (old && old.dispose) old.dispose();
    },
    renderSample: function () {
      if (samples < maxSamples) {
        pt.renderSample();
        samples++;
      }
      return Math.min(1, samples / maxSamples);
    },
    getCanvas: function () {
      return ptRenderer.domElement;
    },
    dispose: function () {
      try { if (pt.dispose) pt.dispose(); } catch (e) {}
      try { if (ptEnv.dispose) ptEnv.dispose(); } catch (e) {}
      try {
        ptRenderer.dispose();
        if (ptRenderer.forceContextLoss) ptRenderer.forceContextLoss();
      } catch (e) {}
    }
  };
}
