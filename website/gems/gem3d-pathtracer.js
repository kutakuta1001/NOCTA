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
 *   opts = { THREE, renderer, scene, camera, maxSamples }
 *     THREE: 呼び出し側が import した three 名前空間
 *     renderer: 既存の WebGLRenderer（PT用canvasのサイズ参照にのみ使う。描画には使わない）
 *     scene, camera: 既存のシーン・カメラ（PTと共有）
 *     maxSamples: 累積する最大サンプル数（省略時160）
 *   developer.reset(): 累積をゼロに戻す（同一姿勢で現像を仕切り直すとき）
 *   developer.resync(): 現在の scene / mesh 姿勢で BVH を再ベイクし累積もゼロに戻す
 *     （reset は累積ゼロ化のみで姿勢は初回のまま。別の向きで静止したら resync で像を更新する）
 *     ※ setScene は内部で scene.environment を読むため、呼び出し側で PMREM env を外して呼ぶ
 *   developer.renderSample() -> number: 1サンプル進め、進捗0..1(=samples/maxSamples)を返す
 *   developer.getCanvas() -> HTMLCanvasElement: PT出力のcanvas（gem3d.jsがオーバレイに使う）
 *   developer.dispose(): PT関連GPUリソースを解放（PT専用rendererも含む）
 *
 * モジュールは window を汚さない（純粋ESM）。
 */
import { WebGLPathTracer, GradientEquirectTexture } from 'three-gpu-pathtracer';

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

  var pt = new WebGLPathTracer(ptRenderer);
  pt.tiles.set(2, 2); /* 1フレームを分割してGPU占有時間を抑える */

  /* PT専用の手続き的環境（GradientEquirectTexture: 上=暖色明・下=暗）。
     PBR用の scene.environment（PMREM RenderTarget texture）は three-gpu-pathtracer@0.0.24 が
     equirect として読もうとして例外を投げるため PT では使えない。逆に env が空(null)だと現像が
     暗く沈むので、PT が読める equirect をこちら側で用意し、setScene の瞬間だけ scene.environment に
     差し込んで取り込ませ、直後に呼び出し前の値へ復帰する（PBR側の PMREM env を汚さない）。
     env の主管理はこの developer 側（gem3d.js の withPtEnv は PMREM の一時退避のみを担う）。 */
  var ptEnv = new GradientEquirectTexture();
  ptEnv.topColor.set(0x3a3630);
  ptEnv.bottomColor.set(0x0a0906);
  ptEnv.update();

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
