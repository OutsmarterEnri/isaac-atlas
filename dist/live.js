'use strict';
let liveSnapshot=null,liveBusy=false,liveChecklist=new Set(),liveRun='';
let debugEntries=[],debugRun='',debugRoom='',debugPickups='',debugInventory='',debugEvents='',debugMap='';
const roomNames={0:'stanza normale',2:'negozio',5:'stanza del tesoro',6:'stanza del boss',7:'stanza segreta',8:'stanza super segreta',29:'stanza ultra segreta'};
function debugRender(){const log=$('#debug-log'),filter=$('#debug-filter')?.value||'all';if(!log)return;const rows=debugEntries.filter(e=>filter==='all'||e.kind===filter);log.innerHTML=rows.map(e=>`<li class="debug-row debug-${e.kind}"><time>${e.time}</time><span>${escapeHTML(e.text)}</span></li>`).join('');const count=$('#debug-count');if(count)count.textContent=`${rows.length} righe mostrate · ${debugEntries.length} conservate`}
function debugAdd(kind,text,data){debugEntries.unshift({kind,text,time:new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit',second:'2-digit'}),frame:data?.frames});if(debugEntries.length>200)debugEntries.length=200;debugRender()}
function pickupText(p,data){const name=p.kind==='collectible'?(catalog.find(r=>r.itemId===p.subtype)?.name||`Oggetto #${p.subtype}`):p.kind==='card'?(p.subtype===80?'Wild Card':`Carta #${p.subtype}`):p.kind==='pill'?`Pillola #${p.subtype}`:p.kind==='rune'?`Runa #${p.subtype}`:p.kind==='chest'?'Cassa':`${p.kind} #${p.subtype}`;const price=p.price?` · prezzo ${p.price}`:'';return `${name}${price} · posizione ${Math.round(p.x)},${Math.round(p.y)}`}
function debugObserve(data){const key=`${source}:${data.slot||0}:${data.run||''}`;if(debugRun!==key){debugRun=key;debugEntries=[];debugRoom=debugPickups=debugInventory=debugEvents=debugMap='';if(data.run)debugAdd('system','Nuova run osservata',data)}const room=data.room||{};const rs=`${room.index}:${room.type}:${room.clear}`;if(rs!==debugRoom){debugRoom=rs;debugAdd('room',`Stanza ${room.index??'—'} · ${roomNames[room.type]||`tipo ${room.type??'—'}`} · ${room.clear?'pulita':'non pulita'}`,data)}const ps=JSON.stringify(data.pickups||[]);if(ps!==debugPickups){debugPickups=ps;const pickups=data.pickups||[];if(pickups.length)pickups.forEach(p=>debugAdd('pickup',`${room.type===2?'Shop · ':''}${pickupText(p,data)}`,data));else debugAdd('pickup','Nessun pickup visibile',data)}const inv=JSON.stringify([data.items||[],data.cards||[]]);if(inv!==debugInventory){debugInventory=inv;debugAdd('inventory',`Inventario aggiornato · ${(data.items||[]).length} oggetti · ${(data.cards||[]).length} carte`,data)}const ev=JSON.stringify(data.events||[]);if(ev!==debugEvents){debugEvents=ev;(data.events||[]).forEach(e=>debugAdd('system',`Evento osservato: ${e.boss} con ${e.character}`,data))}const map=JSON.stringify(data.secretCandidates||[]);if(map!==debugMap){debugMap=map;(data.secretCandidates||[]).forEach(r=>debugAdd('map',`Candidata ${r.kind} · ${Math.round(r.confidence*100)}% · ${r.direction||'mappa'}`,data))}}
const clockText=frames=>{const s=Math.floor(frames/30);return [Math.floor(s/3600),Math.floor(s/60)%60,s%60].map(n=>String(n).padStart(2,'0')).join(':');};
const breakerItems={166:['D20','alta','Può ricalcolare ricompense nella stanza.'],173:['Diplopia','alta','Può duplicare la ricompensa più importante.'],628:['Death Certificate','alta','Apre un’opportunità eccezionale di scelta.'],723:['Spindown Dice','alta','Può trasformare un oggetto nella catena degli ID.'],636:['R Key','alta','Può prolungare la run e moltiplicare gli obiettivi.']};
function renderRunSignals(data){
 const target=$('#live-opportunities');if(!target)return;const signals=[];
 for(const pickup of data.pickups||[]){const special=pickup.kind==='collectible'&&breakerItems[pickup.subtype];const row=special?null:catalog.find(r=>r.itemId===pickup.subtype);
  if(special)signals.push(`<article class="run-signal critical"><strong>${escapeHTML(breakerItems[pickup.subtype][0])} nella stanza</strong><span>Confidenza ${breakerItems[pickup.subtype][1]}</span><p>${escapeHTML(breakerItems[pickup.subtype][2])}</p><small>Valuta il pickup prima di raccoglierlo.</small></article>`);
  else if(row)signals.push(`<article class="run-signal"><strong>${escapeHTML(row.name)} disponibile</strong><span>Opportunità rilevata</span><p>${escapeHTML(row.effect||'Può contribuire a un obiettivo ancora mancante.')}</p></article>`);
  else if(pickup.kind==='card'&&pickup.subtype===80)signals.push(`<article class="run-signal critical"><strong>Wild Card nella stanza</strong><span>Confidenza alta</span><p>Può duplicare una carta chiave o sostenere una combinazione di rottura della run.</p></article>`);
 }
 for(const room of data.secretCandidates||[]){const kind={secret:'Secret Room',supersecret:'Super Secret Room',ultrasecret:'Ultra Secret Room'}[room.kind]||room.kind;signals.push(`<article class="run-signal room-signal"><strong>${kind} candidata · ${Math.round(room.confidence*100)}%</strong><span>${escapeHTML(room.direction||'Mappa')}</span><p>${escapeHTML(room.reason||'Stima basata sui dati della mappa.')}</p></article>`);}
 target.innerHTML=signals.length?'<h3>Segnali della run</h3><p class="signal-caption">Suggerimenti probabilistici basati su ciò che la Bridge osserva; non modificano il gioco.</p>'+signals.slice(0,12).join(''):'<p class="signal-empty">Nessuna opportunità speciale rilevata nella stanza corrente.</p>';
}
function liveRender(data){
 liveSnapshot=data;
 debugObserve(data);
 const labels={running:'In partita',paused:'In pausa',ended:'Partita terminata',menu:'Nel menu',stale:'Collegamento interrotto',not_connected:'Mod non collegata',error:'Lettura in attesa'};
 const statusText=labels[data.status]||'In attesa';if($('#live-status').textContent!==statusText)$('#live-status').textContent=statusText;$('#live-status').classList.toggle('connected',['running','paused'].includes(data.status));
 const active=['running','paused'].includes(data.status);
 $('#live-data').hidden=!active;$('#live-tasks').innerHTML='';$('#live-synergies').innerHTML='';$('#live-timing').innerHTML='';
 $('#live-opportunities').innerHTML='';
 if(!active){$('#live-message').textContent=data.status==='stale'?'Nessun aggiornamento recente: il gioco potrebbe essere chiuso o sospeso. Timer e obiettivi live sono nascosti.':data.message||'Avvia o riprendi una run con la mod abilitata.';return;}
 $('#live-character').textContent=data.character;$('#live-timer').textContent=clockText(data.frames);
 $('#live-floor').textContent='Piano '+data.stage+' · '+(['Normal','Hard','Greed','Greedier'][data.difficulty]||'Sconosciuta');$('#live-slot').textContent='Slot '+data.slot;
 const matching=data.slot===slot&&progress&&progress.slot===slot;
 $('#follow-live').hidden=data.slot===slot;
 if(!matching){$('#live-message').textContent='La partita usa lo slot '+data.slot+'. Selezionalo per confrontare gli sblocchi; nessun obiettivo viene dedotto da un altro slot.';return;}
 if(sourceCount>1){$('#live-message').textContent='Più profili rilevati: la mod identifica lo slot ma non l’account Steam. Timer disponibile; obiettivi automatici sospesi per evitare di usare il profilo sbagliato.';return;}
 if(data.custom||data.challenge||data.players!==1){$('#live-message').textContent='Run speciale o cooperativa: timer disponibile; suggerimenti di sblocco sospesi. Verifica le regole della modalità nel gioco.';return;}
 $('#live-message').textContent=data.schema===2?'Eventi osservati dalla Bridge; lo sblocco definitivo è confermato dal salvataggio. Accessibilità e idoneità agli achievement restano da verificare.':'Bridge precedente: aggiorna da Configurazione per rilevare gli eventi della run.';
 const runKey=source+':'+data.slot+':'+data.run;
 if(liveRun!==runKey){liveRun=runKey;liveChecklist=new Set();}
 const greed=data.difficulty>=2;
 const rows=catalog.filter(r=>(!unlocked(r)||(data.events||[]).some(e=>r.bosses.includes(e.boss)&&e.character===data.character))&&r.character===data.character&&
  (!/hard/i.test(r.requirement)||data.difficulty===1||data.difficulty===3)&&
  (greed?/greed/i.test(r.requirement):!/greed/i.test(r.requirement))&&
  !(data.difficulty===2&&/greedier/i.test(r.requirement)))
  .sort((a,b)=>Number(saved.has(b.id))-Number(saved.has(a.id))||a.id-b.id);
 const limits=data.schema===2?[['Boss Rush',data.bossRushLimit],['Hush',data.hushLimit]]:[];
 const timing=limits.filter(([,limit])=>Number.isInteger(limit)&&limit>0).map(([name,limit])=>{const observed=(data.events||[]).some(e=>e.boss===name);return `<span>${name}: ${observed?'evento osservato':data.frames<limit?clockText(limit-data.frames)+' al limite ordinario':'limite ordinario superato · eccezioni possibili'}</span>`;}).join('');
 $('#live-timing').innerHTML=timing;
 const focused=document.activeElement?.dataset?.liveCheck;
 $('#live-tasks').innerHTML='<h3>Obiettivi per questa run <span class="meta">'+rows.length+'</span></h3>'+(rows.length?rows.map(r=>{const status=AtlasPlanner.eventStatus(r,data,progress.unlocked);return `<div class="live-task"><label><input type="checkbox" data-live-check="${r.id}" ${liveChecklist.has(r.id)?'checked':''} aria-label="Segna come fatto nella checklist: ${escapeHTML(r.name)}"><span><strong>${escapeHTML(r.name)}${saved.has(r.id)?' · Da provare':''}</strong><span>${escapeHTML(translate(r.requirement))}</span><span class="event-${status.code}">${escapeHTML(status.label)}</span></span></label><button class="text-button" data-detail="${r.id}">Dettagli ↗</button></div>`;}).join(''):'<p>Nessuno sblocco mancante associato a questo personaggio e a questa difficoltà.</p>');
 if(focused)document.querySelector(`[data-live-check="${focused}"]`)?.focus({preventScroll:true});
 // Suggest only authored/sourced interactions with a positively identified held item.
 function ingredients(r,n){const partners=[{name:r.name,itemId:r.itemId,cardId:r.id===610?80:null},...(n.partners||[])];return partners.map(p=>{const match=p.secretId?catalog.find(c=>c.id===p.secretId):null;const id=p.itemId||match?.itemId;const known=Number.isInteger(id)&&id>0&&id<2000;const held=known?data.items.includes(id):p.cardId?data.cards.includes(p.cardId):null;return `${escapeHTML(p.name)}: ${held===null?'da verificare':held?'presente':'mancante'}`;}).join(' · ');}
 const opportunities=catalog.filter(r=>saved.has(r.id)).flatMap(r=>interactionList(r).filter(n=>(r.itemId&&data.items.includes(r.itemId))||(n.partners||[]).some(p=>p.itemId&&data.items.includes(p.itemId))).map(n=>({r,n})));
 $('#live-synergies').innerHTML=opportunities.length?'<h3>Spunti dai tuoi “Da provare”</h3>'+opportunities.slice(0,6).map(({r,n})=>`<div class="live-opportunity"><strong>${escapeHTML(r.name)} · ${escapeHTML(n.title)}</strong><p>${ingredients(r,n)}</p><p>Le condizioni della nota restano da verificare.</p><button class="text-button" data-detail="${r.id}">Leggi il caso d’uso e le fonti ↗</button></div>`).join(''):'';
 renderRunSignals(data);
}
document.addEventListener('change',e=>{if(e.target.dataset.liveCheck){const id=Number(e.target.dataset.liveCheck);if(e.target.checked)liveChecklist.add(id);else liveChecklist.delete(id);}});
$('#debug-filter')?.addEventListener('change',debugRender);
$('#clear-debug')?.addEventListener('click',()=>{debugEntries=[];debugRender();});
$('#follow-live').addEventListener('click',()=>{if(liveSnapshot){$('#save-slot').value=String(liveSnapshot.slot);switchSlot();liveRender(liveSnapshot);}});
async function pollLive(){if(liveBusy)return;liveBusy=true;try{const response=await fetch('/api/live',{cache:'no-store',signal:AbortSignal.timeout(3500)});const data=await response.json();if(!response.ok)throw Error(data.error);liveRender(data);}catch{liveRender({status:'error',message:'Il collegamento live non risponde. Riprovo automaticamente.'});}finally{liveBusy=false;}}
pollLive();setInterval(pollLive,1500);
