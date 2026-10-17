// 地球儀の計算（DOM を使わない部分）。正射図法で、中心 (lng0, lat0) から見た点を求める
const RAD = Math.PI / 180;

// LAND_ROWS（[緯度, 行の点の数, [始まり, 長さ, …]]）を、点ごとの [sin緯度, cos緯度, 経度(rad)] に開く
export function decodeLand(rows) {
  let total = 0;
  for (const [, , runs] of rows) for (let i = 1; i < runs.length; i += 2) total += runs[i];
  const out = new Float32Array(total * 3);
  let k = 0;
  for (const [lat, n, runs] of rows) {
    const s = Math.sin(lat * RAD);
    const c = Math.cos(lat * RAD);
    for (let i = 0; i < runs.length; i += 2) {
      for (let j = runs[i]; j < runs[i] + runs[i + 1]; j++) {
        out[k++] = s;
        out[k++] = c;
        out[k++] = (-180 + ((j + 0.5) * 360) / n) * RAD;
      }
    }
  }
  return out;
}

// 中心 (lng0, lat0) を正面に向けたとき、点が画面のどこに来るか。z が 0 以下なら裏側
export function project(sinLat, cosLat, lng, lng0, lat0) {
  const d = lng - lng0 * RAD;
  const s0 = Math.sin(lat0 * RAD);
  const c0 = Math.cos(lat0 * RAD);
  const cd = Math.cos(d);
  return {
    x: cosLat * Math.sin(d),
    y: c0 * sinLat - s0 * cosLat * cd,
    z: s0 * sinLat + c0 * cosLat * cd,
  };
}

// 経度は近いほうへ回る（東経 170 度から西経 170 度へは 20 度）
export function lerpLng(a, b, t) {
  const d = ((((b - a) % 360) + 540) % 360) - 180;
  return a + d * t;
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp01 = (t) => Math.min(1, Math.max(0, t));
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export const easeIn = (t) => t * t * t;
export const easeOut = (t) => 1 - (1 - t) ** 3;

// 時刻 t (ms) における地球儀の向きと大きさ。回る → ピンが立つ → 寄る
export const TIMELINE = { turn: 1500, pin: 1300, pinDrop: 450, zoomFrom: 1750, zoom: 1050 };
export const GLOBE_MS = TIMELINE.zoomFrom + TIMELINE.zoom;
export function frameAt(t, from, to) {
  const turn = easeInOut(clamp01(t / TIMELINE.turn));
  const zoom = easeIn(clamp01((t - TIMELINE.zoomFrom) / TIMELINE.zoom));
  return {
    lng: lerpLng(from.lng, to.lng, turn),
    lat: lerp(from.lat, to.lat, turn),
    scale: 1 + zoom * 11,
    pin: easeOut(clamp01((t - TIMELINE.pin) / TIMELINE.pinDrop)),
    zoom,
  };
}
