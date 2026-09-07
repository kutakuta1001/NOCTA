// Run after editing config.js: node website/strategy/sync-brand.mjs
import {brand} from './config.js';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths=[['../hina/index.html',s=>s.replace(/<!-- strategy-name:start -->.*?<!-- strategy-name:end -->/,`<!-- strategy-name:start -->${escape(brand())}<!-- strategy-name:end -->`)],['../apps-data.js',s=>s.replace(/\/\* strategy-name:start \*\/.*?\/\* strategy-name:end \*\//,`/* strategy-name:start */ ${JSON.stringify(brand())} /* strategy-name:end */`)]];
for(const [name,fn] of paths){const p=fileURLToPath(new URL(name,import.meta.url));const s=fs.readFileSync(p,'utf8');if(!s.includes('strategy-name:start'))throw new Error('Brand marker missing: '+name);fs.writeFileSync(p,fn(s));}
for(const name of ['index.html','study.html','sources.html']){const p=fileURLToPath(new URL(name,import.meta.url));let s=fs.readFileSync(p,'utf8');s=s.replace(/<title>.*?<\/title>/,`<title>${escape(brand())} — NOCTA</title>`).replace(/(class="brand" data-brand href="\.\/index.html">).*?(<\/a>)/,`$1${escape(brand())}$2`);fs.writeFileSync(p,s);}
console.log('Updated app, collection and Apps names. URL /strategy/ and local data remain stable.');
