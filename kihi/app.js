import { CRESTS, PALETTES, todayIndex, nextRandom, artCredit } from './data.js';
import { ART } from './art.js';
const $ = id => document.getElementById(id);
const KEY = 'hina:kihi:favorites:v1';
let favorites = new Set(), storageAvailable = true;
try { const stored = JSON.parse(localStorage.getItem(KEY) || '[]'); if (Array.isArray(stored)) favorites = new Set(stored.filter(id => CRESTS.some(c => c.id === id))); } catch { storageAvailable = false; }
let index = Math.max(0, CRESTS.findIndex(c => c.id === location.hash.slice(1)));
let making = false, palette = 0, layout = 'single', filter = 'all';
const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
let artSequence=0;
function artFragment(crest) { return ART[crest.id].replaceAll('__MASK_ID__',`kihi-mask-${++artSequence}`); }
function svg(crest) { return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true" fill="currentColor">${artFragment(crest)}</svg>`; }
function artAt(c,x,y,size) { return `<g transform="translate(${x} ${y}) scale(${size/100})">${artFragment(c)}</g>`; }
function cardSVG() {
 const c=CRESTS[index],p=PALETTES[palette], note=$('card-note').value;
 let art=artAt(c,230,280,740);
 if(layout==='corner') art=artAt(c,100,130,390);
 if(layout==='repeat') { art=''; for(let y=170;y<1060;y+=310) for(let x=130;x<1050;x+=310) art+=artAt(c,x,y,220); }
 const rights=artCredit(c);
 const credit=`Crest: ${rights.author} / ${rights.license}${c.file?' / adapted':''}`;
 const meta=`Crest: ${rights.author}. Source: ${rights.url || 'HiNa Kihi'}. ${rights.license}: ${rights.licenseURL}. Adapted: background removed, monochrome, scaled and arranged.`;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500"><metadata>${escape(meta)}</metadata><rect width="1200" height="1500" fill="${p.paper}"/><rect x="45" y="45" width="1110" height="1410" rx="1" fill="none" stroke="${p.ink}" opacity=".2"/><g fill="${p.ink}" color="${p.ink}">${art}<g text-anchor="middle" font-family="'Yu Mincho', 'Hiragino Mincho ProN', serif"><text x="600" y="1190" font-size="32" letter-spacing="5">${escape(note || c.line)}</text><text x="600" y="1265" font-size="22" letter-spacing="4">${escape(c.name)} · ${escape(c.clan)}</text><text x="600" y="1340" font-family="Georgia, serif" font-style="italic" font-size="32">HiNa Kihi</text><text x="600" y="1393" font-family="sans-serif" font-size="14">${escape(credit)}</text>${c.file?`<text x="600" y="1420" font-family="sans-serif" font-size="12">${escape('commons.wikimedia.org/wiki/File:'+c.file)}</text><text x="600" y="1440" font-family="sans-serif" font-size="10">${escape(rights.licenseURL.replace('https://',''))}</text>`:''}</g></g></svg>`;
}
function renderArt() { $('crest-art').innerHTML=making?cardSVG():svg(CRESTS[index]); }
function announce(message) { $('status').textContent=message; }
function render() {
 const c=CRESTS[index];
 $('stage').classList.toggle('making',making);
 $('view-panel').hidden=making; $('make-panel').hidden=!making;
 $('view-mode').setAttribute('aria-pressed',String(!making)); $('make-mode').setAttribute('aria-pressed',String(making));
 $('crest-art').setAttribute('aria-label',c.name+(making?'の作品プレビュー':''));
 $('stage-label').textContent=`FORM STUDY / ${String(index+1).padStart(2,'0')}`; $('stage-clan').textContent=c.clan;
 $('crest-number').textContent=`No. ${String(index+1).padStart(2,'0')} / ${({植物:'Botanical',幾何:'Geometric','鳥と蝶':'Birds & butterflies',道具:'Objects & knots'})[c.kind]}`;
 $('crest-reading').textContent=c.reading.split(' ')[0]; $('crest-name').textContent=c.name; $('crest-family').textContent=`${c.clan}　／　${c.person}`;
 $('crest-line').textContent=c.line; $('crest-prompt').textContent=c.prompt; $('crest-note').textContent=c.note;
 $('crest-source').textContent=c.sourceName+' ↗'; $('crest-source').href=c.source;
 const rights=artCredit(c);
 $('art-credit').textContent=`図案：${rights.author} / ${rights.license}。${c.file?'背景除去・単色化。':'基本形の鑑賞用作図。'}`;
 const saved=favorites.has(c.id); $('favorite').setAttribute('aria-pressed',String(saved)); $('favorite').textContent=saved?'✓ 留めた紋から外す':'＋ この紋を留める';
 $('position').textContent=`${String(index+1).padStart(2,'0')} / ${CRESTS.length}`; renderArt(); renderGrid();
}
function select(next, announceChange=true) {
 index=(next+CRESTS.length)%CRESTS.length;
 history.replaceState(null,'','#'+CRESTS[index].id); render();
 if(announceChange) announce(`${CRESTS[index].name} — ${CRESTS[index].clan}`);
}
function renderGrid() {
 const query=$('search').value.trim().normalize('NFKC').toLocaleLowerCase();
 const list=CRESTS.filter(c=>(filter==='all'||filter===c.kind||(filter==='saved'&&favorites.has(c.id)))&&`${c.name} ${c.clan} ${c.person} ${c.reading}`.normalize('NFKC').toLocaleLowerCase().includes(query));
 $('crest-grid').innerHTML=list.map(c=>`<button class="tile" data-id="${c.id}" aria-label="${c.name}・${c.clan}を眺める" aria-pressed="${c.id===CRESTS[index].id}">${favorites.has(c.id)?'<span class="saved-dot" aria-label="留めた紋">●</span>':''}${svg(c)}<span class="tile-name">${c.name}</span><span class="tile-clan">${c.clan}</span></button>`).join('');
 $('empty').hidden=!!list.length; $('result-count').textContent=`${list.length} 紋`; $('saved-count').textContent=favorites.size;
}
$('view-mode').onclick=()=>{making=false;render();}; $('make-mode').onclick=()=>{making=true;render();};
$('previous').onclick=()=>select(index-1); $('next').onclick=()=>select(index+1); $('random').onclick=()=>select(nextRandom(index)); $('today').onclick=()=>{select(todayIndex());announce('今日の紋（日本時間）：'+CRESTS[index].name);};
$('favorite').onclick=()=>{
 const id=CRESTS[index].id; favorites.has(id)?favorites.delete(id):favorites.add(id);
 try { localStorage.setItem(KEY,JSON.stringify([...favorites])); storageAvailable=true; } catch { storageAvailable=false; }
 render(); announce(storageAvailable?(favorites.has(id)?'この紋を、このブラウザに留めました。':'留めた紋から外しました。'):'ブラウザに保存できないため、この画面を開いている間だけ留めます。');
};
$('search').oninput=renderGrid;
document.querySelectorAll('[data-filter]').forEach(button=>button.onclick=()=>{
 filter=button.dataset.filter; document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button))); renderGrid();
});
$('crest-grid').onclick=event=>{const b=event.target.closest('[data-id]');if(!b)return;select(CRESTS.findIndex(c=>c.id===b.dataset.id)); $('view-mode').focus({preventScroll:true}); $('stage').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});};
$('palettes').innerHTML=PALETTES.map((p,i)=>`<button data-palette="${i}" aria-label="${p.name}" aria-pressed="${i===0}" style="--paper:${p.paper};--color:${p.ink}"></button>`).join('');
$('palette-name').textContent=PALETTES[0].name;
$('palettes').onclick=event=>{const b=event.target.closest('[data-palette]');if(!b)return;palette=Number(b.dataset.palette);document.querySelectorAll('[data-palette]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));$('palette-name').textContent=PALETTES[palette].name;renderArt();};
$('layouts').onclick=event=>{const b=event.target.closest('[data-layout]');if(!b)return;layout=b.dataset.layout;document.querySelectorAll('[data-layout]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));renderArt();};
$('card-note').oninput=renderArt;
$('save').onclick=async()=>{
 const button=$('save'), filename=`kihi-${CRESTS[index].id}.png`, source=cardSVG(); button.disabled=true;announce('一枚の絵を仕上げています。');
 const url=URL.createObjectURL(new Blob([source],{type:'image/svg+xml;charset=utf-8'}));
 try {
  const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url;});
  const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1500;const ctx=canvas.getContext('2d');if(!ctx)throw Error('canvas');ctx.drawImage(img,0,0);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('png');
  const download=URL.createObjectURL(blob),a=document.createElement('a');a.href=download;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(download),60000);
  announce('画像を用意しました。ダウンロード一覧をご確認ください。');
 }catch{announce('画像を保存できませんでした。もう一度お試しください。');}finally{URL.revokeObjectURL(url);button.disabled=false;}
};
window.addEventListener('hashchange',()=>{const found=CRESTS.findIndex(c=>c.id===location.hash.slice(1));if(found>=0){index=found;render();}});
render();if(!storageAvailable)announce('保存領域を読み込めませんでした。留めた紋は、この画面内でお楽しみください。');
