// 旅券: 押した順に並ぶ印と一行、まだ開けていない枠、写真と出典の一覧
import { h, extLink } from './dom.js';
import { buildStamp } from './stamp.js';
import { memoInput } from './memo.js';
import { safeHttps } from './links.js';

function sourcesSection(windows, photos) {
  const rows = windows.map((w) => {
    const keys = [w.hero, ...w.fragments.map((f) => f.photo).filter(Boolean)];
    const uniq = [...new Set(keys)].filter((k) => photos[k]);
    const urls = [...new Set(w.fragments.flatMap((f) => f.sources).map(safeHttps).filter(Boolean))];
    return h('li', { class: 'pp-src-item' },
      h('p', { class: 'pp-src-name' }, w.country.ja),
      h('ul', { class: 'pp-src-photos' }, uniq.map((k) => {
        const p = photos[k];
        return h('li', {}, extLink(p.sourceUrl, p.attribution), ' · ', extLink(p.licenseUrl, p.license));
      })),
      h('p', { class: 'pp-src-links' }, urls.flatMap((u, i) => [i ? ' ' : '', extLink(u, new URL(u).hostname)])),
    );
  });
  return h('details', { class: 'pp-sources' },
    h('summary', {}, '写真と出典'),
    h('p', { class: 'pp-src-note' }, '写真は Wikimedia Commons の自由ライセンスの作品を、Commons から直接読んで表示しています。断片を読むあいだ背後に見える光は、その窓の写真をぼかしたものです。'),
    h('p', { class: 'pp-src-note' }, '最初に窓が開く映像は、MiniMax H3 で生成しました。'),
    h('ul', { class: 'pp-src-list' }, rows),
  );
}

export function renderPassport(dialog, { windows, photos, state, persistent, onOpen, onMemo, onClose }) {
  const byId = new Map(windows.map((w) => [w.id, w]));
  const stamped = state.order.filter((id) => byId.has(id));
  const editors = new Map();

  const cells = stamped.map((id) => {
    const w = byId.get(id);
    const s = state.stamps[id];
    const memo = memoInput({ value: s.memo, label: `${w.country.ja}の一行`, className: 'pp-memo', placeholder: '＋ 一行', onCommit: (t) => onMemo(id, t) });
    editors.set(id, memo);
    return h('li', { class: 'pp-stamp', style: { '--tone': w.tone } },
      h('button', { type: 'button', class: 'pp-stamp-btn', 'aria-label': `${w.country.ja}の窓をもう一度開ける`, onclick: () => onOpen(id) },
        buildStamp(document, { id, name: w.country.native, date: s.at, tone: w.tone })),
      h('p', { class: 'pp-place' }, w.country.ja),
      memo.el,
    );
  });
  const empties = Array.from({ length: Math.max(0, windows.length - stamped.length) }, () =>
    h('li', { class: 'pp-empty', 'aria-hidden': 'true' }, h('span', {})));

  dialog.replaceChildren(
    h('div', { class: 'pp' },
      h('header', { class: 'pp-cover' },
        h('p', { class: 'pp-eyebrow' }, 'HiNa Mado — Passport'),
        h('h2', { class: 'pp-title' }, '旅券'),
        h('p', { class: 'pp-count' }, h('span', { class: 'pp-num' }, String(stamped.length)), ` / ${windows.length} の窓`),
        h('p', { class: 'pp-world' }, '世界には、まだ二百ほどの窓がある。'),
        persistent ? null : h('p', { class: 'pp-warn' }, 'この端末では旅券を保存できません。ページを閉じると消えます。'),
        h('button', { type: 'button', class: 'pp-close', onclick: onClose }, '閉じる'),
      ),
      stamped.length === 0
        ? h('p', { class: 'pp-hint' }, '窓の向こうを最後まで眺めると、ここに印が押されます。')
        : null,
      h('ol', { class: 'pp-grid' }, cells, empties),
      h('section', { class: 'pp-colophon', 'aria-label': 'この旅券について' },
        h('p', { class: 'pp-colophon-title' }, 'この旅券について'),
        h('p', {}, '窓は、銀猫が図書館と旅の記憶から一枚ずつ選んでいます。選ぶ基準はひとつ、日本語のひとことには収まりきらないもの。'),
        h('p', {}, '言葉と習わしは出典にあたって確かめていますが、土地の人の暮らしは本よりずっと広いものです。叩き台として、眺めてください。'),
        h('p', {}, '文章は出典をもとに AI（Claude）を使って書き、最初に窓が開く映像は MiniMax H3 で生成しました。')),
      sourcesSection(windows, photos),
    ),
  );
  return { editors };
}
