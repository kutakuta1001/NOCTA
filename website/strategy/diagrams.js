let serial=0;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function diagram(c,step=0){
 const id=`map${++serial}`, a='#bfc3be', b='#b98f7d', water='#718e9a';
 const label=(x,y,t,cls='')=>`<text x="${x}" y="${y}" class="${cls}">${esc(t)}</text>`;
 const dot=(x,y,t,side=0)=>`<g>${side?`<path d="M${x} ${y-9}l9 9-9 9-9-9z" fill="${b}"/>`:`<circle cx="${x}" cy="${y}" r="7" fill="${a}"/>`}${label(x,y+29,t)}</g>`;
 const arrow=(d,planned=false,color=a)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="2" ${planned?'stroke-dasharray="7 7"':''} marker-end="url(#${id}${color===b?'b':'a'})"/>`;
 const line=(d,color=water,width=2)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
 const terrain=Array.from({length:7},(_,i)=>`<path d="M${-100+i*29} 450 Q ${80+i*22} ${80+i*10} ${250+i*18} ${175-i*8} T ${860-i*15} ${20+i*22}" fill="none" stroke="#b8b4ae" opacity=".065"/>`).join('');
 let body='';
 if(c.diagram==='intact'){
 body=label(400,52,'目的と手段の見取り図','map-note')+dot(128,245,'自分の側')+dot(665,245,'相手の城',1)+`<rect x="628" y="207" width="74" height="74" fill="none" stroke="${b}" opacity=".5"/>`;
 if(step>=1)body+=arrow('M150 220 Q380 65 640 215',true)+label(395,114,'計画・関係に働きかける');
 if(step>=2)body+=arrow('M155 259 Q390 430 636 274',false,b)+label(390,357,'直接攻撃に伴う準備と損耗');
 if(step===3)body+=`<ellipse cx="402" cy="227" rx="100" ry="45" fill="#b8b4ae0b" stroke="#b8b4ae55"/>`+label(402,233,'何を残したいか');
 }
 if(c.diagram==='water'){
 body=label(400,52,'水の比喩を読む・実在の戦場ではありません','map-note');
 for(let i=0;i<6;i++)body+=`<ellipse cx="430" cy="218" rx="${52+i*22}" ry="${40+i*15}" fill="none" stroke="${b}" opacity="${.35-i*.04}"/>`;
 body+=dot(130,210,'自分の側')+dot(430,210,'強く抵抗される場所',1)+label(679,222,'目的');
 body+=arrow('M156 210 L346 210',true);
 if(step>=1)body+=label(442,85,'前と同じ条件だろうか');
 if(step>=2)body+=arrow('M152 234 C230 350 550 415 666 248',step===2,water)+line('M160 245 C250 376 530 430 679 260','#718e9a44',12);
 if(step===3)body+=label(435,385,'方法を変えて、目的へ');
 }
 if(c.diagram==='takamatsu'){
 body=label(400,52,'備中高松城・城と周辺環境の関係図','map-note');
 body+=line('M0 340 C180 215 198 480 465 335 S630 250 800 285','#718e9a55',20);
 if(step>=2)body+=`<path d="M180 115 Q450 65 617 188L650 335Q405 407 219 306Z" fill="#718e9a27" stroke="#718e9a77"/>`+label(512,302,'説明用の水域');
 body+=`<path d="M352 202h100v58H352z" fill="#191610" stroke="${b}"/><path d="M340 202l62-34 62 34" fill="none" stroke="${b}"/>`+dot(402,231,'高松城・清水宗治',1)+dot(125,150,'羽柴方');
 if(step>=1)body+=line('M205 110 Q625 60 650 340',a,5)+label(619,122,'水攻めの堤防');
 if(step===1)body+=arrow('M145 150 Q175 115 205 110',true);
 if(step===3)body+=label(420,403,'城跡・堤防の一部が残る');
 }
 if(c.diagram==='midway'){
 body=label(400,52,'北太平洋・位置と情報の関係を簡略化','map-note');
 for(let i=0;i<5;i++)body+=line(`M0 ${100+i*68}Q200 ${70+i*68} 420 ${100+i*68}T800 ${100+i*68}`,'#718e9a19');
 body+=dot(390,178,'ミッドウェー')+dot(663,333,'ハワイ・司令部')+dot(120,140,'日本軍',1);
 body+=`<ellipse cx="390" cy="178" rx="43" ry="25" fill="none" stroke="#718e9a66"/>`;
 if(step>=1)body+=arrow('M631 311 Q540 200 430 189',true)+label(540,237,'分析 → 目標の見立て');
 if(step>=2)body+=dot(528,100,'米空母部隊')+arrow('M640 310 Q640 170 550 115',step===2);
 if(step===3)body+=arrow('M142 142 Q225 116 345 164',false,b)+label(251,326,'索敵・判断・現場の行動も関わる');
 }
 if(c.diagram==='fortitude'){
 body=label(400,48,'英仏海峡・フォーティテュードの南側に着目','map-note');
 body+=`<path d="M0 80L500 80Q550 130 488 166T310 185Q190 218 0 208Z" fill="#b8b4ae09" stroke="#b8b4ae44"/><path d="M160 450Q180 335 343 336T586 230L800 205V450Z" fill="#b8b4ae09" stroke="#b8b4ae44"/>`;
 body+=label(235,135,'イングランド')+label(674,385,'フランス')+label(390,252,'英仏海峡','map-note')+dot(599,249,'パ・ド・カレー',1)+dot(326,344,'ノルマンディー',1)+dot(413,165,'連合軍');
 if(step>=1)body+=arrow('M431 172 Q564 134 589 226',true)+label(630,165,'抱かせたい見立て');
 if(step>=2)body+=arrow('M402 181 Q305 244 325 323')+label(187,280,'実際の上陸');
 if(step===3)body+=label(558,421,'見立てと現実のずれ');
 }
 if(c.diagram==='garden'){
 body=label(400,47,'オランダ・南から北への経路の概略','map-note');
 body+=line('M70 102Q400 136 735 97','#718e9a66',11)+line('M70 210Q370 157 735 201','#718e9a66',10);
 body+=label(695,76,'北 ↑','map-note');
 const pts=[[365,363,'アイントホーフェン周辺'],[418,215,'ナイメーヘン'],[454,106,'アーネム']];
 body+=line('M333 424L365 363 418 215 454 106','#b8b4ae22',15);
 pts.forEach(([x,y,t])=>{body+=`<path d="M${x-20} ${y-7}h40m-40 14h40" stroke="#b8b4ae"/>`+dot(x,y,'')+label(x-120,y+5,t);});
 body+=dot(333,423,'')+label(524,413,'地上部隊・南から北へ');
 if(step>=1)body+=arrow('M349 406L440 125',true)+label(575,169,'空挺部隊が橋を確保');
 if(step>=2)body+=arrow('M335 408L401 261')+dot(429,154,'ドイツ軍の抵抗',1)+label(564,300,'遅れ・通信・補給の問題');
 if(step===3)body+=`<path d="M430 119l40-28m-40 0 40 28" stroke="${b}" stroke-width="2"/>`+label(587,105,'到達できず');
 }
 if(c.diagram==='conditions'){
 body=label(400,52,'計篇の五つの観点・本作による配置','map-note')+dot(160,234,'自分の側')+dot(640,234,'比較する相手',1);
 const words=['道・まとまり','天・時と季節','地・地形','将・指揮','法・組織'];
 if(step>=1)words.forEach((t,i)=>{let y=106+i*63;body+=label(400,y,t)+line(`M290 ${y+14}H510`,'#b8b4ae44');if(step>=2)body+=line(`M180 234L275 ${y}`,'#b8b4ae33')+line(`M620 234L525 ${y}`,'#b98f7d33');});
 if(step===0)body+=label(400,233,'何で比べるか');if(step===3)body+=label(660,365,'不明な欄は、残してよい');
 }
 if(c.diagram==='baggage'){
 body=label(400,52,'速さと支えの関係を描いた概念図','map-note')+line('M95 245Q400 174 700 245','#b8b4ae33',3)+label(685,300,'目的地');
 const lead=step===0?210:step===1?390:630;body+=dot(lead,215,'先に進む人')+`<rect x="140" y="230" width="30" height="25" fill="none" stroke="${a}"/>`+label(155,286,'荷・食糧・蓄え');
 if(step>=1)body+=arrow(`M${lead+25} 212Q570 185 671 225`,true);
 if(step>=2)body+=label(407,363,'先頭と支えの間が開く');
 if(step===3)body+=arrow('M190 264Q404 404 629 253')+label(408,393,'続けるための流れをつなぐ');
 }
 if(c.diagram==='somme'){
 body=label(400,52,'初日の英軍・前提と現実の関係図','map-note');
 body+=line('M120 110v60h25v45h-25v45h25v45h-25v50',a,3)+line('M590 110v60h-25v45h25v45h-25v45h25v50',b,3)+dot(95,234,'英軍')+dot(654,234,'ドイツ軍',1);
 body+=label(360,410,'塹壕間の空間・距離は示さない');
 if(step>=1)body+=arrow('M176 160Q400 24 558 153',true)+label(365,115,'準備砲撃への期待');
 if(step>=2)body+=arrow('M174 240H443')+line('M505 164v158',b,5)+label(474,355,'残っていた防御');
 if(step===3)body+=label(341,291,'前進を阻む抵抗');
 }
 if(c.diagram==='cambrai'){
 body=label(400,52,'役割の連携と、その先の支え','map-note');
 const roles=['歩兵','戦車','砲兵・航空'];roles.forEach((t,i)=>{body+=dot(127,130+i*88,t);if(step>=1)body+=arrow(`M153 ${130+i*88}Q270 ${150+i*40} 390 225`);});
 body+=line('M440 100v240',b,3)+dot(610,180,'ドイツ軍',1)+label(439,378,'防御線');
 if(step>=1)body+=arrow('M395 226H548');
 if(step>=2)body+=label(329,415,'補給・増援・連絡の継続は？')+arrow('M290 381Q530 390 557 278',true);
 if(step===3)body+=arrow('M625 247Q555 299 478 278',false,b)+label(652,304,'反撃');
 }
 if(c.diagram==='dunkirk'){
 body=label(400,52,'ダンケルクとドーヴァー・撤退の関係図','map-note');
 body+=`<path d="M0 140Q260 98 320 157" fill="none" stroke="#b8b4ae66"/><path d="M410 340Q590 288 800 355" fill="none" stroke="#b8b4ae66"/>`+label(161,96,'イングランド')+label(660,410,'フランス')+dot(203,149,'ドーヴァー')+dot(525,327,'ダンケルク')+dot(700,360,'ドイツ軍',1);
 if(step>=1)body+=arrow('M503 307Q328 161 221 156',true)+label(375,195,'海を越える撤退');
 if(step>=2)body+=arrow('M488 329Q279 313 205 180')+label(273,314,'海軍艦艇・多様な船');
 if(step===3)body+=label(534,95,'戻る人々・残る損失');
 }
 if(c.diagram==='mulberry'){
 body=label(400,52,'人工港の機能図・配置と縮尺は説明用','map-note')+line('M0 359Q400 340 800 370','#b8b4ae88',3)+label(690,410,'陸')+label(685,111,'海');
 body+=dot(402,140,'海からの物資');
 if(step>=1)body+=`<path d="M183 303L183 200 252 170M548 170L617 200 617 303" fill="none" stroke="#b8b4ae77" stroke-width="12"/>`+label(129,161,'防波堤');
 if(step>=2)body+=`<path d="M345 278H459M402 278V354" stroke="#b8b4ae" stroke-width="9"/>`+arrow('M402 179V251')+label(503,315,'浮かぶ道路')+label(247,310,'荷揚げ地点');
 if(step===3)body+=line('M530 67Q600 115 611 176',water,3)+line('M560 71Q640 110 649 194',water,2)+label(695,238,'嵐の被害');
 }
 if(c.diagram==='chibi'){
 body=label(400,52,'赤壁・連合と川をめぐる関係','map-note')+line('M0 232Q260 167 490 247T800 221','#718e9a55',35)+label(668,268,'長江')+dot(386,143,'曹操軍',1)+dot(229,330,'劉備側')+dot(552,330,'孫権側');
 if(step>=1)body+=line('M253 330H528',a)+label(397,375,'力を合わせて対する');
 if(step>=2)body+=arrow('M380 319V189')+label(195,181,'水上・風土などの条件');
 if(step===3)body+=arrow('M410 134Q536 84 631 129',false,b)+label(669,129,'撤退');
 }
 if(c.diagram==='guandu'){
 body=label(400,52,'官渡・前線と兵糧の関係図','map-note')+dot(184,315,'曹操軍')+dot(503,315,'袁紹軍',1)+dot(549,130,'袁紹側の兵糧拠点',1)+line('M541 163L509 285','#b98f7d77',4);
 if(step>=1)body+=label(210,148,'情報と助言で、見る場所が変わる')+arrow('M196 290Q284 116 514 131',true);
 if(step>=2)body+=arrow('M211 319Q431 431 540 171')+label(602,224,'前線を支える流れ');
 if(step===3)body+=line('M529 189L559 206',b,3)+label(381,403,'規模と、支えの両方を見る');
 }
 if(c.diagram==='nagashino'){
 body=label(400,52,'設楽原・軍と備えの関係図','map-note')+dot(211,233,'織田・徳川連合軍')+dot(650,233,'武田軍',1);
 if(step===0)body+=label(421,365,'長篠城の救援から、設楽原の対峙へ');
 if(step>=1){body+=line('M421 105V337',a,3);for(let y=120;y<330;y+=32)body+=line(`M408 ${y}H434`,a,2);body+=label(424,376,'馬防柵')+label(238,139,'鉄砲と周囲の備え');}
 if(step>=2)body+=arrow('M624 252H464',false,b)+label(599,330,'配置・射撃手順は省略');
 if(step===3)body+=label(210,403,'連合軍の勝利');
 }
 if(c.diagram==='odawara'){
 body=label(400,52,'小田原・総構と外側の包囲の概略','map-note')+dot(400,238,'北条側・城と町',1)+`<rect x="367" y="180" width="67" height="26" fill="none" stroke="${b}"/>`;
 if(step>=1)body+=`<ellipse cx="400" cy="240" rx="145" ry="102" fill="none" stroke="${b}" stroke-width="3"/>`+label(400,369,'町を囲む総構');
 if(step>=2){body+=`<ellipse cx="400" cy="240" rx="277" ry="151" fill="none" stroke="${a}" stroke-dasharray="5 8"/>`;for(const [x,y] of [[130,240],[235,114],[561,118],[669,249]])body+=dot(x,y,'');body+=label(658,353,'豊臣側の包囲');}
 if(step===3)body+=label(400,422,'籠城の後、開城へ');
 }
 if(c.diagram==='marne'){
 body=label(400,52,'第一次マルヌ・軍同士の間に着目','map-note')+line('M0 332Q330 290 800 337','#718e9a44',16)+dot(208,365,'英仏軍');
 const x1=step?376:339,x2=step?649:519;body+=dot(x1,169,'ドイツ第1軍',1)+dot(x2,169,'第2軍',1);
 if(step>=1)body+=arrow(`M${x1} 201L${x1-48} 264`,false,b)+arrow(`M${x2} 201L${x2-27} 264`,false,b)+label(511,232,'軍同士の間');
 if(step>=2)body+=arrow('M234 355Q410 342 506 257')+label(445,393,'英遠征軍を含む反撃');
 if(step===3)body+=label(540,100,'エーヌ川方面へ退く');
 }
 if(c.diagram==='dowding'){
 body=label(400,52,'1940年の防空・情報の流れの概略','map-note')+dot(147,127,'レーダーの観測')+dot(147,309,'監視員の観測')+dot(652,102,'ドイツ軍',1);
 if(step>=1)body+=dot(383,218,'作戦室で整理・判断')+arrow('M167 146L354 205')+arrow('M167 289L354 232')+label(269,369,'電話などで共有');
 if(step>=2)body+=dot(643,256,'飛行部隊')+arrow('M410 223L613 250')+label(536,317,'判断を伝える');
 if(step===3)body+=label(438,419,'見つける → まとめる → 決める → 動く');
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 470" role="img" aria-labelledby="${id}title ${id}desc"><title id="${id}title">${esc(c.subtitle)}：${esc(c.steps[step].title)}</title><desc id="${id}desc">${esc(c.steps[step].text)} 縮尺・兵力・正確な位置を表す図ではありません。</desc><defs><marker id="${id}a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5 0 10" fill="${a}"/></marker><marker id="${id}b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5 0 10" fill="${b}"/></marker><pattern id="${id}grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#b8b4ae" stroke-opacity=".06"/></pattern></defs><rect width="800" height="470" fill="#11120f"/><rect x="20" y="20" width="760" height="430" fill="url(#${id}grid)" stroke="#b8b4ae22"/>${terrain}<g font-family="'Yu Mincho', 'Hiragino Mincho ProN', serif" font-size="15" fill="#ddd9cf" text-anchor="middle">${body}</g><path d="M36 40h18m-9-9v18M746 430h18m-9-9v18" stroke="#b8b4ae55"/></svg>`;
}
