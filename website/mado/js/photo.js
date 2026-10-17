// 写真とクレジット
import { h, extLink } from './dom.js';

export function photoImg(p, { eager = false, className = '', sizes = '100vw' } = {}) {
  return h('img', {
    class: className,
    src: p.src,
    srcset: `${p.srcSmall} ${p.smallWidth}w, ${p.src} ${p.width}w`,
    sizes,
    width: p.width,
    height: p.height,
    alt: p.alt,
    loading: eager ? 'eager' : 'lazy',
    decoding: 'async',
    fetchpriority: eager ? 'high' : null,
  });
}

export function credit(p, className = 'credit') {
  return h('p', { class: className },
    '写真 ', extLink(p.sourceUrl, p.attribution), ' · ', extLink(p.licenseUrl, p.license));
}
