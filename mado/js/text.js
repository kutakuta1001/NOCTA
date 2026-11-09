// 字数（書記素）と日付の小さな関数
export const MEMO_MAX = 60;

const seg = typeof Intl !== 'undefined' && Intl.Segmenter
  ? new Intl.Segmenter('ja', { granularity: 'grapheme' }) : null;
const graphemes = (s) => (seg ? Array.from(seg.segment(s), (x) => x.segment) : [...s]);

export const countChars = (s) => graphemes(s).length;
export const clipChars = (s, max) => graphemes(s).slice(0, max).join('');

// 押印日は端末のローカル日付で記録する（UTC で切ると日本の午前が前日になる）
export function localDate(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function isValidDate(v) {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === v;
}
