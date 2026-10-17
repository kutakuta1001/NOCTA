// 一つの窓を描く: 窓（写真と一行）→ 断片 → 結び（国名・外への道・印・一行）
import { h, dirOf } from './dom.js';
import { outsideUrl, cssUrl } from './links.js';
import { ensureFont } from './fonts.js';
import { memoInput } from './memo.js';
import { photoImg, credit } from './photo.js';

const KIND_LABEL = {
  word: ['言葉', 'Word'],
  thought: ['考え方', 'Thought'],
  custom: ['風習', 'Custom'],
  view: ['景色', 'View'],
};

function langAttrs(lang) {
  ensureFont(lang);
  return { lang, dir: dirOf(lang) };
}

function windowPane(win, hero, onPhotoError, onPhotoLoad) {
  const img = hero ? photoImg(hero, { eager: true, className: 'hero' }) : null;
  img?.addEventListener('error', onPhotoError, { once: true });
  img?.addEventListener('load', () => onPhotoLoad?.(img.currentSrc || img.src), { once: true });
  const line = win.line;
  return h('section', { class: 'pane pane--window', 'aria-label': '窓' },
    h('div', { class: 'hero-wrap' }, img),
    h('div', { class: 'frame', 'aria-hidden': 'true' }),
    h('div', { class: 'line reveal is-in' },
      h('p', { class: 'line-text', ...langAttrs(line.lang) }, h('span', {}, line.text)),
      line.reading ? h('p', { class: 'line-reading' }, line.reading) : null,
      h('p', { class: 'line-ja' }, line.ja),
      h('p', { class: 'line-source' }, `— ${line.source}`),
    ),
    h('span', { class: 'cue', 'aria-hidden': 'true' }),
    hero ? credit(hero, 'credit credit--hero') : null,
  );
}

// 写真だけの画面。題も種類の札も置かず、添えるなら一行だけ
// 写真が読めなければ写真を外す。一行もなければ、その画面ごと畳む
function still(f, p, index) {
  const img = p ? photoImg(p, { className: 'frag-img', sizes: '100vw' }) : null;
  const el = h('article', { class: 'frag frag--still reveal', style: { '--i': String(index) } },
    img ? h('figure', { class: 'frag-figure' }, img, credit(p)) : null,
    f.body ? h('p', { class: 'still-line', ...langAttrs(f.lang) }, f.body) : null,
  );
  const fail = () => { el.classList.add('is-nophoto'); if (!f.body) el.hidden = true; };
  if (img) img.addEventListener('error', fail, { once: true });
  else fail();
  return el;
}

function fragment(f, photos, index) {
  const [ja, en] = KIND_LABEL[f.kind] ?? ['', ''];
  const p = f.photo ? photos[f.photo] : null;
  if (f.kind === 'still') return still(f, p, index);
  const isWord = f.kind === 'word';
  return h('article', { class: `frag frag--${f.kind} reveal`, style: { '--i': String(index) } },
    p && f.kind === 'view'
      ? h('figure', { class: 'frag-figure' }, photoImg(p, { className: 'frag-img', sizes: '100vw' }), credit(p))
      : null,
    h('div', { class: 'frag-text' },
      h('p', { class: 'frag-kind', 'data-en': en }, ja),
      h('h2', { class: `frag-title${isWord ? ' frag-title--word' : ''}`, ...langAttrs(f.lang) }, f.title),
      f.reading ? h('p', { class: 'frag-reading' }, f.reading) : null,
      h('p', { class: 'frag-body' }, f.body),
      f.aside ? h('p', { class: 'frag-aside' }, f.aside) : null,
      p && f.kind !== 'view'
        ? h('figure', { class: 'frag-figure frag-figure--small' }, photoImg(p, { className: 'frag-img', sizes: '(min-width: 900px) 34rem, 100vw' }), credit(p))
        : null,
    ),
  );
}

function endPane(win, { stamped, onMemo, onNext }) {
  const url = outsideUrl(win.outside);
  const memo = memoInput({
    value: stamped?.memo ?? '',
    label: '心に残った一行',
    className: 'memo',
    onCommit: (text) => onMemo(win.id, text),
  });
  const pane = h('section', { class: 'pane pane--end reveal', 'aria-label': '結び' },
    h('p', { class: 'end-eyebrow' }, 'この窓は'),
    h('h2', { class: 'end-country-ja' }, win.country.ja),
    h('p', { class: 'end-country-native', ...langAttrs(win.line.lang) }, win.country.native),
    h('p', { class: 'end-place' }, win.place.ja),
    h('div', { class: 'stamp-trigger', 'aria-hidden': 'true' }),
    h('div', { class: 'stamp-slot', 'aria-live': 'polite' }),
  );
  const after = h('section', { class: 'pane pane--after reveal', 'aria-label': 'この窓のあとで' },
    url ? h('a', { class: 'outside', href: url, target: '_blank', rel: 'noopener' },
      h('span', { class: 'outside-label' }, '窓の外へ'),
      h('span', { class: 'outside-place' }, win.outside.label),
      h('span', { class: 'outside-arrow' }, '地図 ↗'),
    ) : null,
    memo.el,
    h('p', { class: 'memo-note' }, '書いた一行は、旅券に残ります。'),
    h('button', { class: 'next', type: 'button', onclick: onNext }, '別の窓を開ける', h('span', { 'aria-hidden': 'true' }, ' →')),
  );
  return { pane, after, memo };
}

// 戻り値は後片付け関数。Observer を必ず外す
// gate を渡すと、それが解決するまで開扉を待つ（地球儀の旅のあいだ、窓は裏で写真を読み込んでおく）
export function renderWindow(stage, win, { photos, stamped, arriving, gate = null, onReachEnd, onNext, onMemo, onPhase }) {
  const hero = photos[win.hero];
  const cls = ['window', arriving && 'is-arriving', win.form === 'short' && 'is-short'].filter(Boolean).join(' ');
  const article = h('article', { class: cls, 'data-id': win.id, style: { '--tone': win.tone, '--hero-pos': win.heroPos ?? '50% 50%' } });
  // 断片を読むあいだ、窓の外の光を背後に残す（暗く、ぼかして）
  // 背後の光には、窓で読み込んだ写真そのもの（currentSrc）を使い、二重に取得しない
  const backdrop = hero ? h('div', { class: 'backdrop', 'aria-hidden': 'true' }) : null;
  if (backdrop) article.append(backdrop);
  // 開扉は写真が読めてから始める（読み込み途中のぼけた写真を見せない）
  let photoDone = false;
  let gateDone = !gate;
  let disposed = false;
  let openTimer = 0;
  const tryOpen = () => { if (photoDone && gateDone && !disposed) article.classList.add('is-open'); };
  const opened = () => { photoDone = true; tryOpen(); };
  const noPhoto = () => { article.classList.add('is-nophoto'); opened(); };
  if (!hero) noPhoto();
  // 写真を待つのは、窓を描きはじめてから 2.5 秒まで（旅のあいだも数える）
  openTimer = setTimeout(opened, 2500);
  gate?.then(() => { gateDone = true; tryOpen(); });
  article.append(windowPane(win, hero, noPhoto, (src) => {
    backdrop?.style.setProperty('background-image', cssUrl(src));
    opened();
  }));
  win.fragments.forEach((f, i) => article.append(fragment(f, photos, i)));
  const end = endPane(win, { stamped, onMemo, onNext });
  article.append(end.pane, end.after);
  stage.replaceChildren(article);

  // いまどこを見ているか: window（窓）/ reading（断片）/ ending（結び）
  const paneWin = article.querySelector('.pane--window');
  let inWindow = true;
  let inEnd = false;
  const report = () => onPhase?.(inWindow ? 'window' : inEnd ? 'ending' : 'reading');
  const phase = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.target === paneWin) inWindow = e.intersectionRatio > 0.35;
      // 結びが少し覗いただけでは暗転しない（最後の断片を読んでいるあいだは光を残す）
      else inEnd = e.intersectionRatio > 0.25;
    }
    article.classList.toggle('is-reading', !inWindow && !inEnd);
    article.classList.toggle('is-ending', inEnd);
    report();
  }, { threshold: [0, 0.25, 0.35, 0.6] });
  phase.observe(paneWin);
  phase.observe(end.pane);
  report();

  const reveal = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-in');
      reveal.unobserve(e.target);
    }
  }, { threshold: 0.15 });
  article.querySelectorAll('.reveal:not(.is-in)').forEach((el) => reveal.observe(el));

  let reached = false;
  const arrive = new IntersectionObserver((entries) => {
    if (reached || !entries.some((e) => e.isIntersecting)) return;
    reached = true;
    arrive.disconnect();
    onReachEnd(win.id);
  }, { threshold: 0 });
  arrive.observe(end.pane.querySelector('.stamp-trigger'));

  return {
    stampSlot: end.pane.querySelector('.stamp-slot'),
    setMemo: (v) => end.memo.set(v),
    cleanup() {
      disposed = true;
      clearTimeout(openTimer);
      reveal.disconnect();
      arrive.disconnect();
      phase.disconnect();
    },
  };
}
