// 心に残った一行の入力欄。結びと旅券で共通。IME 変換中は保存せず、確定時に 60 書記素で切る
import { h } from './dom.js';
import { clipChars, MEMO_MAX } from './text.js';

let seq = 0;

export function memoInput({ value = '', label, className, onCommit, placeholder = 'ひとこと、書き留める' }) {
  const id = `memo-${++seq}`;
  const input = h('input', {
    id, class: className, type: 'text', value, autocomplete: 'off', enterkeyhint: 'done',
    placeholder,
  });
  let composing = false;
  let last = value;
  const commit = () => {
    if (composing) return;
    const clipped = clipChars(input.value, MEMO_MAX);
    if (clipped !== input.value) input.value = clipped;
    if (clipped === last) return;
    last = clipped;
    onCommit(clipped);
  };
  input.addEventListener('compositionstart', () => { composing = true; });
  input.addEventListener('compositionend', () => { composing = false; commit(); });
  input.addEventListener('input', commit);
  input.addEventListener('change', commit);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !composing) input.blur(); });
  const wrap = h('div', { class: `${className}-field` }, h('label', { for: id, class: `${className}-label` }, label), input);
  return { el: wrap, input, set(v) { if (document.activeElement !== input) { input.value = v; last = v; } } };
}
