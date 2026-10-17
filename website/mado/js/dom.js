// 小さな要素生成。文字列の子は必ずテキストノードとして入れる（データを HTML として解釈しない）
import { safeHttps } from './links.js';

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') for (const [p, val] of Object.entries(v)) el.style.setProperty(p, val);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children.flat(Infinity)) {
    if (c === null || c === undefined || c === false || c === '') continue;
    el.append(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return el;
}

// 外部リンク。https 以外は文字だけを返す
export function extLink(url, text, attrs = {}) {
  const href = safeHttps(url);
  if (!href) return h('span', {}, text);
  return h('a', { href, target: '_blank', rel: 'noopener', ...attrs }, text);
}

const RTL = new Set(['fa', 'ar', 'he', 'ur']);
export const dirOf = (lang) => (RTL.has(String(lang).split('-')[0]) ? 'rtl' : null);
