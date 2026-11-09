// 窓を開ける前の旅: 点で描いた地球儀が回り、行き先にピンが立ち、そこへ寄っていく
// 地名は出さない（国名は結びで明かす）。canvas が使えなければ何もせずに終わる
import { LAND_ROWS } from '../data/globe.js';
import { decodeLand, project, frameAt, GLOBE_MS, TIMELINE } from './globe-math.js';

let land = null;

// host いっぱいに canvas を敷いて描く。center は地球儀の中心と半径（host 内の CSS px）。省略時は host の中央
// 戻り値の done は描き終えたら（または stop で）解決する
export function runGlobe(host, { from, to, tone = '#B8B4AE', center } = {}) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext?.('2d');
  if (!ctx) return { done: Promise.resolve(), stop() {} };
  land ??= decodeLand(LAND_ROWS);
  host.append(canvas);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = host.getBoundingClientRect();
  const w = Math.max(1, Math.round(rect.width * dpr));
  const hgt = Math.max(1, Math.round(rect.height * dpr));
  canvas.width = w;
  canvas.height = hgt;
  const cx = (center?.x ?? rect.width / 2) * dpr;
  const cy = (center?.y ?? rect.height / 2) * dpr;
  const R = (center?.r ?? Math.min(rect.width, rect.height) * 0.36) * dpr;

  let raf = 0;
  let finish;
  const done = new Promise((r) => { finish = r; });
  const start = performance.now();

  function draw(now) {
    const t = now - start;
    const f = frameAt(t, from, to);
    const r = R * f.scale;
    ctx.clearRect(0, 0, w, hgt);

    // 大気の薄い光と、夜の海
    const halo = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.25);
    halo.addColorStop(0, 'rgba(184, 196, 214, 0.16)');
    halo.addColorStop(1, 'rgba(184, 196, 214, 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, hgt);
    const sea = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r);
    sea.addColorStop(0, '#1A2230');
    sea.addColorStop(1, '#0B0E14');
    ctx.fillStyle = sea;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // 陸の点。縁ほど暗く、寄るほど点は大きく
    const size = Math.max(1, 1.15 * dpr * Math.sqrt(f.scale));
    const near = f.pin > 0 ? 0.09 / Math.sqrt(f.scale) : 0;
    // project() と同じ式を、一万点ぶん回すので中で展開する（一時オブジェクトを作らない）
    const lng0 = (f.lng * Math.PI) / 180;
    const s0 = Math.sin((f.lat * Math.PI) / 180);
    const c0 = Math.cos((f.lat * Math.PI) / 180);
    const near2 = near * near;
    for (let i = 0; i < land.length; i += 3) {
      const sl = land[i];
      const cl = land[i + 1];
      const d = land[i + 2] - lng0;
      const cd = Math.cos(d);
      const z = s0 * sl + c0 * cl * cd;
      if (z <= 0) continue;
      const x = cl * Math.sin(d);
      const y = c0 * sl - s0 * cl * cd;
      const sx = cx + x * r;
      const sy = cy - y * r;
      if (sx < -size || sy < -size || sx > w + size || sy > hgt + size) continue;
      const lit = near && x * x + y * y < near2;
      ctx.globalAlpha = lit ? 0.95 : 0.18 + 0.7 * z;
      ctx.fillStyle = lit ? tone : '#E8E0D0';
      ctx.fillRect(sx - size / 2, sy - size / 2, size, size);
    }
    ctx.globalAlpha = 1;

    // ピン: 行き先の上に細い線と小さな印。寄りはじめると消えていく
    if (f.pin > 0) {
      const p = project(Math.sin((to.lat * Math.PI) / 180), Math.cos((to.lat * Math.PI) / 180), (to.lng * Math.PI) / 180, f.lng, f.lat);
      if (p.z > 0) {
        const px = cx + p.x * r;
        const py = cy - p.y * r;
        const fade = 1 - f.zoom;
        const len = 38 * dpr * f.pin;
        ctx.globalAlpha = fade;
        ctx.strokeStyle = tone;
        ctx.lineWidth = 1.2 * dpr;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, py - len);
        ctx.stroke();
        ctx.fillStyle = tone;
        ctx.beginPath();
        ctx.arc(px, py - len, 3.6 * dpr * f.pin, 0, Math.PI * 2);
        ctx.fill();
        // 足もとに広がる輪
        const ring = Math.min(1, (t - TIMELINE.pin) / 900);
        if (ring > 0 && ring < 1) {
          ctx.globalAlpha = fade * (1 - ring) * 0.8;
          ctx.beginPath();
          ctx.arc(px, py, (4 + ring * 26) * dpr, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
    }

    // 寄り切る直前、行き先の光で満たす（窓の写真へ渡す）
    if (f.zoom > 0.6) {
      const a = ((f.zoom - 0.6) / 0.4) ** 2;
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, hgt) * 0.6);
      glow.addColorStop(0, `rgba(255, 246, 228, ${0.55 * a})`);
      glow.addColorStop(0.35, `rgba(255, 246, 228, ${0.12 * a})`);
      glow.addColorStop(1, 'rgba(255, 246, 228, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, hgt);
    }

    if (t >= GLOBE_MS) { finish(); return; }
    raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);

  return {
    done,
    stop() { cancelAnimationFrame(raf); finish(); },
  };
}
