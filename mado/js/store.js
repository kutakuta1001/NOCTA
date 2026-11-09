// 旅券の保存。読み込み時に形を整え、書き込みは毎回「最新を読み直す → 一つ変える → 書く」
import { clipChars, isValidDate, MEMO_MAX } from './text.js';

export const STORE_KEY = 'hina-mado.v1';
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

export const emptyState = () => ({ version: 1, introSeen: false, stamps: {}, order: [] });

export function normalize(raw, knownIds) {
  const s = emptyState();
  if (!isObj(raw) || raw.version !== 1) return s;
  s.introSeen = raw.introSeen === true;
  const known = new Set(knownIds);
  if (isObj(raw.stamps)) {
    for (const id of Object.keys(raw.stamps)) {
      const v = raw.stamps[id];
      if (!known.has(id) || !isObj(v) || !isValidDate(v.at)) continue;
      s.stamps[id] = { at: v.at, memo: typeof v.memo === 'string' ? clipChars(v.memo, MEMO_MAX) : '' };
    }
  }
  const has = (id) => Object.hasOwn(s.stamps, id);
  const order = Array.isArray(raw.order)
    ? raw.order.filter((id, i, a) => typeof id === 'string' && has(id) && a.indexOf(id) === i)
    : [];
  const rest = Object.keys(s.stamps)
    .filter((id) => !order.includes(id))
    .sort((a, b) => s.stamps[a].at.localeCompare(s.stamps[b].at));
  s.order = [...order, ...rest];
  return s;
}

// storage: getItem/setItem を持つもの、または null。保存に失敗したら、それまでの状態を保ってメモリで続ける
export function createStore({ storage, knownIds, onPersistChange = () => {} }) {
  const known = new Set(knownIds);
  let state = emptyState();
  let persistent = Boolean(storage);

  function lose() {
    if (!persistent) return;
    persistent = false;
    onPersistChange(false);
  }

  function reload() {
    if (!persistent) return state;
    try {
      const text = storage.getItem(STORE_KEY);
      try {
        state = normalize(text ? JSON.parse(text) : null, knownIds);
      } catch {
        state = emptyState();
      }
    } catch {
      lose();
    }
    return state;
  }

  function update(fn) {
    const next = structuredClone(reload());
    const result = fn(next);
    state = normalize(next, knownIds);
    if (persistent) {
      try {
        storage.setItem(STORE_KEY, JSON.stringify(state));
      } catch {
        lose();
      }
    }
    return result;
  }

  reload();
  return {
    get: () => state,
    reload,
    isPersistent: () => persistent,
    markIntroSeen: () => update((s) => { s.introSeen = true; }),
    stamp: (id, date) => update((s) => {
      if (!known.has(id) || !isValidDate(date) || Object.hasOwn(s.stamps, id)) return false;
      s.stamps[id] = { at: date, memo: '' };
      s.order.push(id);
      return true;
    }),
    setMemo: (id, memo) => update((s) => {
      if (Object.hasOwn(s.stamps, id)) s.stamps[id].memo = clipChars(String(memo).trim(), MEMO_MAX);
    }),
  };
}
