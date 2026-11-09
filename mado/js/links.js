// 外への道。Google マップの公式 URL 形式（API キー不要）だけを組み立てる
const round = (n) => Math.round(n * 1e6) / 1e6;

export function outsideUrl({ lat, lng, mode }) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  const ll = `${round(lat)},${round(lng)}`;
  return mode === 'pano'
    ? `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${ll}`
    : `https://www.google.com/maps/search/?api=1&query=${ll}`;
}

export function safeHttps(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' ? u.href : null;
  } catch {
    return null;
  }
}

// CSS の url("…") に入れる。URL はすでに符号化済みなので encodeURI は重ねない（%28 が %2528 になり 404 になる）
export const cssUrl = (src) => `url("${String(src).replace(/["\\\n\r]/g, (c) => encodeURIComponent(c))}")`;
