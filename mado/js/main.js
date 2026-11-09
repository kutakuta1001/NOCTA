// 起動とルーティング。ハッシュ #w=<id> を正とし、なければ次の窓を選ぶ
import { WINDOWS } from '../data/windows.js';
import { PHOTOS } from '../data/photos.js';
import { createStore, STORE_KEY } from './store.js';
import { pickNext } from './pick.js';
import { localDate } from './text.js';
import { buildStamp } from './stamp.js';
import { renderWindow } from './window-view.js';
import { renderPassport } from './passport-view.js';
import { runIntro, OPENING_TALL } from './intro.js';
import { runGlobe } from './globe.js';

const ids = WINDOWS.map((w) => w.id);
const byId = new Map(WINDOWS.map((w) => [w.id, w]));
const stage = document.getElementById('stage');
const dialog = document.getElementById('passport');
const intro = document.getElementById('intro');
const globeLayer = document.getElementById('globe');
const bar = document.querySelector('.bar');
const barNote = document.querySelector('.bar-note');
const barCount = document.querySelector('.bar-count');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

let storage = null;
try { storage = window.localStorage; } catch { storage = null; }

const showNote = (persistent) => { barNote.hidden = persistent; };
const store = createStore({ storage, knownIds: ids, onPersistChange: showNote });
showNote(store.isPersistent());

let current = null; // { id, token, view }
let tokenSeq = 0;

// 旅券の印の数を帯に出す
function updateCount() {
  const n = store.get().order.length;
  barCount.textContent = n ? String(n) : '';
  barCount.hidden = n === 0;
}

const idFromHash = () => {
  const m = /^#w=([a-z]{2})$/.exec(location.hash);
  return m && byId.has(m[1]) ? m[1] : null;
};

function pressStamp(slot, w, at, animate) {
  const svg = buildStamp(document, { id: w.id, name: w.country.native, date: at, tone: w.tone });
  slot.replaceChildren(svg);
  slot.classList.toggle('is-pressing', animate && !reducedMotion);
  slot.classList.add('is-stamped');
}

// 最初の旅は日本から
const HOME = { lat: 35.68, lng: 139.77 };
const placeOf = (w) => ({ lat: w.outside.lat, lng: w.outside.lng });

// 窓を開ける前の旅。いま見ていた窓の場所から、次の窓の場所へ地球儀を回し、ピンを立てて寄る
// 触れるか Esc でとばせる。戻り値は旅が終わったら解決する
let travelling = null;
let travelSeq = 0;
// 旅のあいだ、背後の本文と帯は操作もスクロールもできないようにする
const behindLayers = () => [stage, bar];
function hold(on) {
  behindLayers().forEach((el) => { el.inert = on; });
  document.documentElement.style.overflow = on ? 'hidden' : '';
}
function travel(from, w) {
  travelling?.stop();
  const run = ++travelSeq;
  hold(true);
  globeLayer.replaceChildren();
  globeLayer.hidden = false;
  globeLayer.classList.remove('is-done');
  requestAnimationFrame(() => globeLayer.classList.add('is-on'));
  const trip = runGlobe(globeLayer, { from, to: placeOf(w), tone: w.tone });
  travelling = trip;
  const skip = () => trip.stop();
  const onKey = (e) => { if (e.key === 'Escape') skip(); };
  globeLayer.addEventListener('click', skip, { once: true });
  document.addEventListener('keydown', onKey);
  return trip.done.then(() => {
    document.removeEventListener('keydown', onKey);
    globeLayer.removeEventListener('click', skip);
    if (run !== travelSeq) return;
    travelling = null;
    hold(false);
    window.scrollTo(0, 0);
    globeLayer.classList.add('is-done');
    setTimeout(() => {
      if (run !== travelSeq) return;
      globeLayer.hidden = true;
      globeLayer.classList.remove('is-on', 'is-done');
      globeLayer.replaceChildren();
    }, 700);
  });
}

function show(id) {
  const w = byId.get(id);
  const prev = current ? byId.get(current.id) : null;
  current?.view.cleanup();
  const token = ++tokenSeq;
  const stamped = store.get().stamps[id] ?? null;
  const view = renderWindow(stage, w, {
    photos: PHOTOS,
    stamped,
    // 二つ目以降の窓は、地球儀の旅を通ってから開く
    arriving: prev !== null && !reducedMotion,
    gate: prev && !reducedMotion ? travel(placeOf(prev), w) : null,
    onPhase: (p) => bar.classList.toggle('is-solid', p !== 'window'),
    onReachEnd: (reachedId) => {
      if (!current || current.token !== token || reachedId !== current.id) return;
      const isNew = store.stamp(reachedId, localDate(new Date()));
      const s = store.get().stamps[reachedId];
      if (s) pressStamp(view.stampSlot, w, s.at, isNew);
      updateCount();
    },
    onNext: openNext,
    onMemo: (memoId, text) => {
      if (!store.get().stamps[memoId]) store.stamp(memoId, localDate(new Date()));
      store.setMemo(memoId, text);
      updateCount();
    },
  });
  current = { id, token, view };
  document.title = 'HiNa Mado | NOCTA Tools';
  window.scrollTo(0, 0);
}

function route() {
  const id = idFromHash();
  if (id) {
    if (current?.id !== id) show(id);
    return;
  }
  const next = pickNext(ids, { visited: store.get().order, current: current?.id ?? null });
  history.replaceState(null, '', `#w=${next}`);
  show(next);
}

function openNext() {
  const next = pickNext(ids, { visited: store.get().order, current: current?.id ?? null });
  location.hash = `w=${next}`;
}

// 旅券
let passportView = null;
function drawPassport() {
  passportView = renderPassport(dialog, {
    windows: WINDOWS,
    photos: PHOTOS,
    state: store.get(),
    persistent: store.isPersistent(),
    onOpen: (id) => {
      dialog.close();
      if (current?.id === id) window.scrollTo(0, 0);
      else location.hash = `w=${id}`;
    },
    onMemo: (id, text) => {
      store.setMemo(id, text);
      if (current?.id === id) current.view.setMemo(store.get().stamps[id]?.memo ?? '');
    },
    onClose: () => dialog.close(),
  });
}
document.getElementById('passport-open').addEventListener('click', () => {
  store.reload();
  drawPassport();
  dialog.showModal();
  dialog.querySelector('.pp-close')?.focus();
});
dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

// 別のタブでの変更。窓の一行欄は編集中でなければ合わせ、旅券は開いていれば閉じたあと次に開くときに描き直す
let passportStale = false;
window.addEventListener('storage', (e) => {
  if (e.key !== STORE_KEY) return;
  store.reload();
  updateCount();
  if (current) current.view.setMemo(store.get().stamps[current.id]?.memo ?? '');
  if (dialog.open) passportStale = true;
});
dialog.addEventListener('close', () => {
  if (passportStale) { passportStale = false; drawPassport(); }
});

window.addEventListener('hashchange', route);

// 起動
const firstVisit = !store.get().introSeen && !location.hash;
updateCount();
route();
if (firstVisit && !reducedMotion) {
  // 導入のあいだ、背後の本文と帯は操作もスクロールもできないようにする
  const behind = [stage, document.querySelector('.bar')];
  behind.forEach((el) => { el.inert = true; });
  document.documentElement.style.overflow = 'hidden';
  const hero = PHOTOS[byId.get(current.id).hero];
  runIntro(intro, {
    // 縦の画面では縦長版の映像を使う
    ...(matchMedia('(orientation: portrait)').matches
      ? { videoSrc: 'media/intro-tall.mp4', posterSrc: 'media/intro-tall-poster.jpg', opening: OPENING_TALL }
      : { videoSrc: 'media/intro.mp4', posterSrc: 'media/intro-poster.jpg' }),
    heroSrc: hero ? (window.innerWidth > 960 ? hero.src : hero.srcSmall) : null,
    heroPos: byId.get(current.id).heroPos,
    // 鎧戸が開いた向こうに地球が見え、日本から最初の窓の場所へ旅をする
    globe: { from: HOME, to: placeOf(byId.get(current.id)), tone: byId.get(current.id).tone },
  }).then(() => {
    behind.forEach((el) => { el.inert = false; });
    document.documentElement.style.overflow = '';
    window.scrollTo(0, 0);
    store.markIntroSeen();
  });
} else if (firstVisit) {
  store.markIntroSeen();
}
