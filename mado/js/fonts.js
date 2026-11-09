// EB Garamond にない文字を使う言葉のために、必要なときだけ Google Fonts を足す
const FAMILIES = {
  ka: 'Noto+Serif+Georgian:wght@400;500',
  am: 'Noto+Serif+Ethiopic:wght@400;500',
  fa: 'Noto+Naskh+Arabic:wght@400;500',
  ar: 'Noto+Naskh+Arabic:wght@400;500',
  iu: 'Noto+Sans+Canadian+Aboriginal:wght@400;500',
  dz: 'Noto+Serif+Tibetan:wght@400;500',
  bo: 'Noto+Serif+Tibetan:wght@400;500',
  hy: 'Noto+Serif+Armenian:wght@400;500',
  th: 'Noto+Serif+Thai:wght@400;500',
  hi: 'Noto+Serif+Devanagari:wght@400;500',
  ne: 'Noto+Serif+Devanagari:wght@400;500',
  si: 'Noto+Serif+Sinhala:wght@400;500',
};
const loaded = new Set();

export function ensureFont(lang) {
  const base = String(lang ?? '').split('-')[0];
  const family = FAMILIES[base];
  if (!family || loaded.has(family)) return;
  loaded.add(family);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${family}&display=swap`;
  document.head.append(link);
}
