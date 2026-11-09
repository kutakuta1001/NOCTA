import {CONFIG,brand} from './config.js';
import {cases,quotes,sources} from './content.js';
import {diagram} from './diagrams.js';
import {bridges} from './bridges.js';
import {thoughtView,workView} from './reflection.js';
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url=(c,mode='map')=>`./study.html?case=${encodeURIComponent(c.id)}&mode=${mode}`;
let store={favorites:[],notes:{}}, storageFailed=false;
try{const x=JSON.parse(localStorage.getItem(CONFIG.storageKey)||'null');if(x&&typeof x==='object'){store.favorites=Array.isArray(x.favorites)?x.favorites.filter(id=>cases.some(c=>c.id===id)):[];if(x.notes&&typeof x.notes==='object'&&!Array.isArray(x.notes))for(const c of cases)if(typeof x.notes[c.id]==='string')store.notes[c.id]=x.notes[c.id].slice(0,3000);}}catch{storageFailed=true;}
function warn(){if($('#storage-warning')){$('#storage-warning').hidden=false;$('#storage-warning').textContent='このブラウザに保存できません。メモは画面を閉じる前に「メモをまとめて保存」で書き出してください。';}if($('#save-status'))$('#save-status').textContent='未保存・この画面内のみ保持';}
function persist(){try{localStorage.setItem(CONFIG.storageKey,JSON.stringify(store));storageFailed=false;if($('#storage-warning'))$('#storage-warning').hidden=true;return true;}catch{storageFailed=true;warn();return false;}}
for(const el of document.querySelectorAll('[data-brand]'))el.textContent=brand();
document.title=brand()+' — NOCTA';
const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
let hash=0;for(const x of day)hash=(hash*31+x.charCodeAt(0))>>>0;
const today=cases[hash%cases.length];
function sourceHTML(id){const s=sources[id];return `<div class="source-item"><span class="meta">${esc(s.kind)}</span><br><a class="text-link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a><p>${esc(s.publisher)}</p></div>`;}
function caseCard(c,mode='map'){return `<a class="case-card" href="${url(c,mode)}">${diagram(c,0)}<span class="meta">${esc(c.era)} · ${esc(c.theme)} ${store.favorites.includes(c.id)?'<span class="saved-tag">栞あり</span>':''}</span><h3>${esc(c.title)}</h3><p>${esc(c.subtitle)}</p></a>`;}
function quoteHTML(q,compact=false){return `<span class="meta">${esc(q.type)}</span><blockquote>「${esc(q.translation)}」</blockquote><p class="quote-original" lang="en">${esc(q.original)}</p><p class="quote-attribution">${esc(q.attribution)}<br>${esc(q.locator)}</p><p class="quote-context">${esc(q.context)}</p><a class="text-link" href="${esc(sources[q.source].url)}" target="_blank" rel="noopener noreferrer">出典をひらく ↗</a>`;}
if($('#hero-map')){
 $('#hero-map').innerHTML=diagram(cases.find(c=>c.id==='water'),3);
 $('#today').href=url(today);
 $('#filters').innerHTML=`<div class="filters"><label>言葉・人物で探す<input id="search" type="search" placeholder="情報、孫子、レイトン…"></label><label>時代<select id="era"><option value="">すべての時代</option>${[...new Set(cases.map(c=>c.era))].map(x=>`<option>${esc(x)}</option>`).join('')}</select></label><label>考えるテーマ<select id="theme"><option value="">すべてのテーマ</option>${[...new Set(cases.map(c=>c.theme))].map(x=>`<option>${esc(x)}</option>`).join('')}</select></label><button id="only-favorites" aria-pressed="false">栞のある題だけ</button><button id="clear-filters">条件を戻す</button></div>`;
 let favoritesOnly=false;
 function filter(){const term=$('#search').value.normalize('NFKC').trim().toLocaleLowerCase();const list=cases.filter(c=>(!$('#era').value||c.era===$('#era').value)&&(!$('#theme').value||c.theme===$('#theme').value)&&(!favoritesOnly||store.favorites.includes(c.id))&&[c.title,c.subtitle,c.people,c.theme,c.intro,c.business].join(' ').normalize('NFKC').toLocaleLowerCase().includes(term));$('#count').textContent=`${list.length} / ${cases.length} 題`;$('#case-list').innerHTML=list.length?list.map(c=>caseCard(c)).join(''):'<p class="empty">まだ見つかりません。言葉を短くするか、条件を戻してみてください。</p>';}
 $('#search').addEventListener('input',filter);$('#era').addEventListener('change',filter);$('#theme').addEventListener('change',filter);$('#only-favorites').addEventListener('click',e=>{favoritesOnly=!favoritesOnly;e.currentTarget.setAttribute('aria-pressed',String(favoritesOnly));filter();});$('#clear-filters').addEventListener('click',()=>{$('#search').value='';$('#era').value='';$('#theme').value='';favoritesOnly=false;$('#only-favorites').setAttribute('aria-pressed','false');filter();});filter();
}
if($('#all-sources')){$('#all-sources').innerHTML=Object.keys(sources).map(sourceHTML).join('');$('#quote-index').innerHTML=Object.values(quotes).map(q=>`<article class="editorial">${quoteHTML(q)}</article>`).join('');}
if($('#case-title')){
 let current,mode,step,think;
 function readURL(){const p=new URLSearchParams(location.search);current=cases.find(c=>c.id===p.get('case'))||today;mode=['map','thought','work'].includes(p.get('mode'))?p.get('mode'):'map';const n=Number(p.get('step'));step=Number.isInteger(n)&&n>=0&&n<=3?n:0;const t=Number(p.get('think'));think=Number.isInteger(t)&&t>=0&&t<=4?t:0;}
 function writeURL(push=false){const u=new URL(location.href);u.search=new URLSearchParams({case:current.id,mode,step:String(step),think:String(think)});history[push?'pushState':'replaceState'](null,'',u);}
 function favorite(){const yes=store.favorites.includes(current.id);$('#favorite').setAttribute('aria-pressed',String(yes));$('#favorite').textContent=yes?'栞を外す':'栞を挟む';}
 function renderCase(){document.title=current.subtitle+' — '+brand();$('#case-title').textContent=current.title;$('#case-subtitle').textContent=current.subtitle+' · '+current.date;$('#people').textContent=current.people;$('#case-limit').textContent=current.limit;$('#case-sources').innerHTML=`<p>${esc(current.locator)}</p>`+current.sources.map(sourceHTML).join('');$('#note').value=store.notes[current.id]||'';$('#note-count').textContent=`${$('#note').value.length} / 3000`;$('#save-status').textContent=store.notes[current.id]?'このブラウザから復元しました':'このブラウザに保存します';$('#export-status').textContent='';favorite();renderMode();$('#related').innerHTML=[1,2,3].map(offset=>cases[(cases.indexOf(current)+offset)%cases.length]).map(c=>caseCard(c,mode)).join('');if(storageFailed)warn();}
 function renderMode(){for(const b of document.querySelectorAll('[data-mode]'))b.setAttribute('aria-pressed',String(b.dataset.mode===mode));
 if(mode==='map'){
 const s=current.steps[step];
 $('#mode-content').innerHTML=`<div class="workspace"><div><div class="map-shell"><div class="map-toolbar"><span>${current.kind==='theory'?'古典の考えを描いた概念図':'歴史の関係を描いた概略図'}</span><button id="zoom-map" type="button">大きく見る ＋</button></div>${diagram(current,step)}<div class="legend"><span class="ally">● ${esc(current.sides[0])}</span>${['baggage','mulberry'].includes(current.id)?'':`<span class="enemy">◆ ${esc(current.sides[1])}</span>`}<span>──→ ${current.kind==='theory'?'説明上の経路':'実際の行動'}</span><span>┄┄→ 計画・見立て</span></div></div><p class="disclaimer">縮尺・兵力・正確な位置の再現ではありません。${current.kind==='theory'?'実在の戦いではなく、本文の比喩を示します。':''}</p><nav class="timeline" aria-label="図の段階">${['状況','判断','展開','結果'].map((t,i)=>`<button data-step="${i}" type="button" aria-pressed="${step===i}"><span>0${i+1}</span>${t}</button>`).join('')}</nav><div class="step-navigation"><button id="previous-step" ${step===0?'disabled':''}>← 前へ</button><button id="next-step" ${step===3?'disabled':''}>次へ →</button></div></div><article class="reading" aria-live="polite"><div><span class="step-number">0${step+1}</span><h2>${esc(s.title)}</h2><p>${esc(s.text)}</p></div><div class="knowledge"><div><h3>${current.kind==='theory'?'ここで置く条件':'この段階で見えていたこと'}</h3><p>${esc(s.known)}</p></div><div><h3>${current.kind==='theory'?'この図では決められないこと':'まだわからないこと・復元の限界'}</h3><p>${esc(s.unknown)}</p></div></div></article></div>${step===3?`<div class="map-to-thought"><div><span class="meta">この布陣から、考え方へ</span><p>${esc(bridges[current.id].look)}</p></div><button class="primary" type="button" data-go-thought="0">五つの段階で、思考を拾う →</button></div>`:''}`;
 const setStep=(n,focus)=>{step=n;writeURL();renderMode();$(focus)?.focus({preventScroll:true});};
 for(const b of document.querySelectorAll('[data-step]'))b.addEventListener('click',()=>setStep(Number(b.dataset.step),`[data-step="${b.dataset.step}"]`));
 $('#previous-step').addEventListener('click',()=>setStep(Math.max(0,step-1),step-1===0?'[data-step="0"]':'#previous-step'));
 $('#next-step').addEventListener('click',()=>setStep(Math.min(3,step+1),step+1===3?'[data-step="3"]':'#next-step'));
 $('#zoom-map').addEventListener('click',()=>{$('#zoom-content').innerHTML=diagram(current,step);$('#zoom-caption').textContent=s.text;$('#map-dialog').showModal();});
 }else if(mode==='thought'){
 $('#mode-content').innerHTML=thoughtView(current,bridges[current.id],think,{diagram,quoteHTML,quotes});
 }else{
 $('#mode-content').innerHTML=workView(current,bridges[current.id],{diagram,quoteHTML,quotes});
 }
 }
 function focusReading(){const title=$(mode==='thought'?'#reflection-title':mode==='work'?'#work-title':'.reading h2');if(!title)return;title.setAttribute('tabindex','-1');title.focus({preventScroll:true});const rect=title.getBoundingClientRect();if(rect.top<0||rect.bottom>innerHeight)title.scrollIntoView({block:'start',behavior:'auto'});}
 $('#mode-content').addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  const b=bridges[current.id];
  if(button.hasAttribute('data-reflection-zoom')){$('#zoom-content').innerHTML=diagram(current,b.mapStep);$('#zoom-caption').textContent=current.steps[b.mapStep].text;$('#map-dialog').showModal();return;}
  if(button.hasAttribute('data-write-note')){$('#note').focus();$('#note').scrollIntoView({block:'center',behavior:'auto'});return;}
  if(button.hasAttribute('data-reflect-step')){think=Number(button.dataset.reflectStep);mode='thought';}
  else if(button.hasAttribute('data-go-thought')){think=Number(button.dataset.goThought);mode='thought';}
  else if(button.hasAttribute('data-go-work'))mode='work';
  else if(button.hasAttribute('data-return-map')){mode='map';step=b.mapStep;}
  else return;
  writeURL(true);renderMode();focusReading();
 });
 for(const b of document.querySelectorAll('[data-mode]'))b.addEventListener('click',()=>{mode=b.dataset.mode;writeURL(true);renderMode();});
 $('#favorite').addEventListener('click',()=>{store.favorites=store.favorites.includes(current.id)?store.favorites.filter(id=>id!==current.id):[...store.favorites,current.id];persist();favorite();});
 $('#random').addEventListener('click',()=>{const pool=cases.filter(c=>c.id!==current.id);current=pool[Math.floor(Math.random()*pool.length)];step=0;think=0;writeURL(true);renderCase();});
 $('#note').addEventListener('input',()=>{store.notes[current.id]=$('#note').value;$('#note-count').textContent=`${$('#note').value.length} / 3000`;if(persist())$('#save-status').textContent='このブラウザに保存しました';});
 $('#close-map').addEventListener('click',()=>$('#map-dialog').close());
 window.addEventListener('popstate',()=>{if($('#map-dialog').open)$('#map-dialog').close();readURL();renderCase();});
 function download(blob,name){const href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(href),60000);}
 $('#export-notes').addEventListener('click',()=>{const list=cases.filter(c=>store.notes[c.id]);if(!list.length){$('#export-status').textContent='まだメモがありません。一文を書いてから保存できます。';return;}const text=brand()+' — メモ\n\n'+list.map(c=>c.subtitle+'\n'+store.notes[c.id]+'\n\n出典\n'+c.sources.map(id=>sources[id].title+'\n'+sources[id].url).join('\n')).join('\n\n────────\n\n');download(new Blob([text],{type:'text/plain;charset=utf-8'}),'nocta-thought-notes.txt');$('#export-status').textContent='メモのテキストファイルを作成しました。';});
 $('#export-card').addEventListener('click',async()=>{
 const button=$('#export-card');button.disabled=true;
 try{
 const q=quotes[mode==='work'?current.relatedQuote:current.quote], source=sources[q.source], canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1500;const ctx=canvas.getContext('2d');
 ctx.fillStyle='#0a0906';ctx.fillRect(0,0,1200,1500);ctx.strokeStyle='#b8b4ae66';ctx.strokeRect(55,55,1090,1390);
 const write=(t,y,size,color='#e8e0d0',family='serif',maxWidth=990)=>{ctx.fillStyle=color;ctx.font=`${size}px ${family}`;let row='',lines=[];for(const ch of t){if(ctx.measureText(row+ch).width>maxWidth&&row){lines.push(row);row=ch;}else row+=ch;}if(row)lines.push(row);for(const line of lines){ctx.fillText(line,105,y);y+=size*1.75;}return y;};
 write(brand(),125,23,'#b8b4ae');write('言葉を、手もとに。',220,21,'#b8b4ae');
 let y=write('「'+q.translation+'」',335,46);y=write(q.original,y+25,24,'#b8b4ae','Georgia');y=write(q.attribution,y+35,23);y=write(q.locator,y+10,19,'#b8b4ae');y=write(q.type,y+15,17,'#b8b4ae');
 y=write('関連する題：'+current.subtitle,y+45,21);y=write('問い（本作の編集）',y+28,18,'#b8b4ae');y=write(current.question,y+10,26);y=write(source.publisher,y+40,17,'#b8b4ae');y=write(source.url,y+6,14,'#b8b4ae','sans-serif');
 if(y>1380)throw new Error('card overflow');write('NOCTA · 原文と文脈は出典のページで。',1400,17,'#b8b4ae');
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('image failed');download(blob,`nocta-${current.id}-${mode}.png`);$('#export-status').textContent='出典を添えた言葉の画像を作成しました。';
 }catch{$('#export-status').textContent='画像を保存できませんでした。もう一度試してください。';}finally{button.disabled=false;}
 });
 readURL();writeURL();renderCase();
}
