/* Gyu パストレーサ・ハイブリッドの純粋関数（three非依存・window露出でテスト容易に）。
   対応判定と「静止」判定を描画から切り離す。 */
(function (root) {
  function canPathtrace(e) {
    if (!e) return false;
    return !!e.webgl2 && !e.reduce && !e.coarse && !e.lowCores && !!e.floatBuf;
  }
  function isStill(s) {
    if (!s || s.autoSpin) return false;
    return s.dTarget < 0.002 && s.msSinceTilt > 500;
  }
  root.NoctaGemPTUtil = { canPathtrace: canPathtrace, isStill: isStill };
})(typeof window !== 'undefined' ? window : this);
