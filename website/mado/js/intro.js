// 初回だけの導入。暗い部屋の閉じた鎧戸（映像の最初の一コマ）が画面いっぱいにあり、窓に触れると開く。
// 映像の最後に見える窓の開口へ、その窓の写真をはめ込み、そのまま全画面へ広げる。
// 映像が始まらない・止まる・失敗するときは、同じ構図の CSS の開扉に切り替える。
import { h } from './dom.js';
import { cssUrl } from './links.js';
import { runGlobe } from './globe.js';

// 映像の最後の一コマで、窓の開口が占める範囲（映像の幅・高さに対する割合）。横長版の値
const OPENING = { x0: 0.322, x1: 0.667, y0: 0.108, y1: 0.885 };
// 縦長版（intro-tall.mp4）の値
export const OPENING_TALL = { x0: 0.17, x1: 0.82, y0: 0.165, y1: 0.71 };

// object-fit: cover で敷いた映像の中の開口を、画面上の四辺（px）に直す
function openingBox(vw, vh, mediaW, mediaH, o = OPENING) {
  const scale = Math.max(vw / mediaW, vh / mediaH);
  const w = mediaW * scale;
  const hgt = mediaH * scale;
  const n = (v) => Math.max(0, Math.round(v));
  return {
    top: n((vh - hgt) / 2 + o.y0 * hgt),
    right: n(vw - ((vw - w) / 2 + o.x1 * w)),
    bottom: n(vh - ((vh - hgt) / 2 + o.y1 * hgt)),
    left: n((vw - w) / 2 + o.x0 * w),
  };
}
const insetOf = (b) => `inset(${b.top}px ${b.right}px ${b.bottom}px ${b.left}px)`;

export function runIntro(root, { videoSrc, posterSrc, opening = OPENING, heroSrc, heroPos = '50% 50%', startTimeoutMs = 4000, totalMs = 15000, heroWaitMs = 2500, globe = null }) {
  return new Promise((resolve) => {
    const events = new AbortController();
    const on = (el, type, fn) => el.addEventListener(type, fn, { signal: events.signal });
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    let finished = false;
    let opened = false;

    const poster = h('div', { class: 'intro-poster', style: posterSrc ? { 'background-image': cssUrl(posterSrc) } : {} });
    const video = h('video', { class: 'intro-video', muted: true, playsinline: true, preload: 'auto', 'aria-hidden': 'true' });
    video.muted = true;
    const globeHost = h('div', { class: 'intro-globe', 'aria-hidden': 'true' });
    let trip = null;
    const reveal = h('div', { class: 'intro-reveal', style: heroSrc ? { 'background-image': cssUrl(heroSrc), 'background-position': heroPos } : {} });
    const frame = h('div', { class: 'intro-frame', 'aria-hidden': 'true' },
      h('span', { class: 'intro-door intro-door--l' }), h('span', { class: 'intro-door intro-door--r' }),
      h('span', { class: 'intro-gap' }));
    const open = h('button', { type: 'button', class: 'intro-open', 'aria-label': '窓を開ける' }, frame);
    const skip = h('button', { type: 'button', class: 'intro-skip' }, 'とばす');
    root.replaceChildren(
      poster,
      video,
      globeHost,
      reveal,
      h('div', { class: 'intro-room' },
        open,
        h('div', { class: 'intro-words' },
          h('p', { class: 'intro-eyebrow' }, 'HiNa Mado'),
          h('p', { class: 'intro-lead' }, '知らない国の窓を、ひとつ開ける。'),
          h('p', { class: 'intro-hint' }, '窓に触れる')),
        h('p', { class: 'intro-note' }, '映像は生成（MiniMax H3）')),
      skip,
    );
    root.hidden = false;
    root.classList.remove('is-done');
    root.classList.toggle('has-poster', Boolean(posterSrc));
    // ポスターが読めなければ、CSS で描いた窓枠に切り替える
    if (posterSrc) {
      const probe = new Image();
      probe.onerror = () => root.classList.remove('has-poster');
      probe.src = posterSrc;
    }
    if (videoSrc) video.src = videoSrc;
    // 写真は Commons から読むので、ポスターを見ているあいだに先に取りに行く
    const heroReady = new Promise((done) => {
      if (!heroSrc) { done(); return; }
      const img = new Image();
      img.onload = img.onerror = () => done();
      img.src = heroSrc;
    });
    const whenHero = (fn) => {
      let called = false;
      const go = () => { if (!called && !finished) { called = true; fn(); } };
      heroReady.then(go);
      later(go, heroWaitMs);
    };

    function finish() {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      events.abort();
      trip?.stop();
      try { video.pause(); } catch { /* 何もしない */ }
      root.classList.add('is-done');
      setTimeout(() => {
        root.hidden = true;
        root.replaceChildren();
        resolve();
      }, 800);
    }

    // 開口から全画面へ。from は開始時の clip-path
    function expandFrom(from) {
      reveal.style.transition = 'none';
      reveal.style.clipPath = from;
      root.classList.add('is-revealing');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        reveal.style.transition = '';
        reveal.style.clipPath = 'inset(0px 0px 0px 0px)';
      }));
      later(finish, 1700);
    }

    // 開いた窓の向こうに地球が見え、行き先へ旅をしてから、その窓の写真が開口から広がる
    function openThrough(box) {
      const go = () => whenHero(() => expandFrom(insetOf(box)));
      if (!globe) { go(); return; }
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const ow = vw - box.left - box.right;
      const oh = vh - box.top - box.bottom;
      globeHost.style.clipPath = insetOf(box);
      root.classList.add('is-globe');
      trip = runGlobe(globeHost, { ...globe, center: { x: box.left + ow / 2, y: box.top + oh / 2, r: Math.min(ow, oh) * 0.42 } });
      trip.done.then(go);
    }

    function cssOpen() {
      if (finished || root.classList.contains('is-opening')) return;
      // 映像が使えないときは、ポスターを外して CSS の扉を見せてから開く
      root.classList.remove('has-poster', 'is-video');
      root.classList.add('is-opening');
      later(() => {
        if (finished) return;
        const r = frame.getBoundingClientRect();
        const n = (v) => Math.max(0, Math.round(v));
        openThrough({ top: n(r.top), right: n(window.innerWidth - r.right), bottom: n(window.innerHeight - r.bottom), left: n(r.left) });
      }, 900);
    }

    function start() {
      if (opened) return;
      opened = true;
      later(finish, totalMs);
      if (!videoSrc) { cssOpen(); return; }
      let playing = false;
      const fallback = () => { if (!playing) cssOpen(); };
      on(video, 'playing', () => {
        if (playing || finished) return;
        playing = true;
        root.classList.add('is-video');
      });
      on(video, 'ended', () => {
        openThrough(openingBox(window.innerWidth, window.innerHeight, video.videoWidth || 864, video.videoHeight || 480, opening));
      });
      on(video, 'error', () => (playing ? finish() : fallback()));
      later(fallback, startTimeoutMs);
      video.play()?.catch(() => fallback());
    }

    on(open, 'click', start);
    on(skip, 'click', finish);
    on(document, 'keydown', (e) => { if (e.key === 'Escape') finish(); });
  });
}
