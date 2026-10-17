// 窓ごとの入国スタンプを SVG で組み立てる。文字は textContent で入れ、文字列連結で組まない
const NS = 'http://www.w3.org/2000/svg';
const SHAPES = ['circle', 'oval', 'rect', 'octagon'];
const HEX = /^#[0-9a-fA-F]{6}$/;
const SILVER = '#B8B4AE';

function hash(s) {
  let h = 2166136261;
  for (const c of s) {
    h ^= c.codePointAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const stampShape = (id) => SHAPES[hash(id) % SHAPES.length];
export const stampTilt = (id) => (hash(`${id}:tilt`) % 19) - 9;

function el(doc, tag, attrs = {}, text) {
  const e = doc.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (text !== undefined) e.textContent = text;
  return e;
}

function outline(doc, shape, inset, ink, width) {
  const c = 60;
  const r = 52 - inset;
  const base = { fill: 'none', stroke: ink, 'stroke-width': width };
  if (shape === 'circle') return el(doc, 'circle', { cx: c, cy: c, r, ...base });
  if (shape === 'oval') return el(doc, 'ellipse', { cx: c, cy: c, rx: r + 4, ry: r - 12, ...base });
  if (shape === 'rect') return el(doc, 'rect', { x: c - r, y: c - r + 10, width: r * 2, height: r * 2 - 20, rx: 6, ...base });
  const pts = Array.from({ length: 8 }, (_, i) => {
    const a = Math.PI / 8 + (i * Math.PI) / 4;
    return `${(c + r * Math.cos(a)).toFixed(1)},${(c + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  return el(doc, 'polygon', { points: pts, ...base });
}

export function buildStamp(doc, { id, name, date, tone }) {
  const ink = HEX.test(tone) ? tone : SILVER;
  const shape = stampShape(id);
  const fid = `ink-${String(id).toLowerCase().replace(/[^a-z0-9-]/g, '')}`;
  const svg = el(doc, 'svg', {
    viewBox: '0 0 120 120', class: `stamp stamp--${shape}`, role: 'img', 'aria-label': `${name} ${date}`,
  });

  // かすれ: 細かいノイズで輪郭をわずかに揺らす
  const defs = el(doc, 'defs');
  const filter = el(doc, 'filter', { id: fid, x: '-5%', y: '-5%', width: '110%', height: '110%' });
  filter.appendChild(el(doc, 'feTurbulence', { type: 'fractalNoise', baseFrequency: '0.85', numOctaves: '2', seed: String(hash(id) % 97) }));
  filter.appendChild(el(doc, 'feDisplacementMap', { in: 'SourceGraphic', scale: '2.4' }));
  defs.appendChild(filter);
  svg.appendChild(defs);

  const g = el(doc, 'g', { transform: `rotate(${stampTilt(id)} 60 60)`, filter: `url(#${fid})`, opacity: '0.9' });
  g.appendChild(outline(doc, shape, 0, ink, 2.4));
  g.appendChild(outline(doc, shape, 5, ink, 0.8));
  const label = "'Syne',sans-serif";
  g.appendChild(el(doc, 'text', { x: 60, y: 41, 'text-anchor': 'middle', 'font-family': label, 'font-size': 5.5, fill: ink, 'letter-spacing': 2 }, 'HiNa MADO'));
  g.appendChild(el(doc, 'text', {
    x: 60, y: 60, 'text-anchor': 'middle', 'font-family': "'EB Garamond','Shippori Mincho',serif",
    'font-size': [...name].length > 10 ? 10 : 13, fill: ink, 'letter-spacing': 0.6,
  }, name));
  g.appendChild(el(doc, 'line', { x1: 32, y1: 67, x2: 88, y2: 67, stroke: ink, 'stroke-width': 0.6 }));
  // 日付は字形の紛れにくい Bebas Neue で（Syne の小さな数字は 5 と 6 が見分けにくい）
  g.appendChild(el(doc, 'text', { x: 60, y: 81, 'text-anchor': 'middle', 'font-family': "'Bebas Neue',sans-serif", 'font-size': 10.5, fill: ink, 'letter-spacing': 1.4 }, date.replaceAll('-', '.')));
  svg.appendChild(g);
  return svg;
}
