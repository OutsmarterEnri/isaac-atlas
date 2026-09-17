'use strict';
let liveSnapshot=null,liveBusy=false,liveChecklist=new Set(),liveRun='';
const debugObserver=new AtlasLive.Observer();
function debugRender(){
 const log=$('#debug-log'),filter=$('#debug-filter')?.value||'all';if(!log)return;
 const rows=debugObserver.entries.filter(e=>filter==='all'||e.kind===filter);
 log.innerHTML=rows.map(e=>`<li class="debug-row debug-${e.kind}"><time>${escapeHTML(e.time)}</time><span>${escapeHTML(e.text)}</span></li>`).join('');
 const count=$('#debug-count'),message=`${rows.length} righe mostrate · ${debugObserver.entries.length} conservate`;
 if(count&&count.textContent!==message)count.textContent=message;
}
function debugObserve(data){debugObserver.observe(data,source,catalog);debugRender();}
const clockText=frames=>{const s=Math.floor(frames/30);return [Math.floor(s/3600),Math.floor(s/60)%60,s%60].map(n=>String(n).padStart(2,'0')).join(':');};
function renderRunSignals(data){const target=$('#live-opportunities');if(target)renderAssistant(data,target);}
function liveRender(data){
 liveSnapshot=data;
 debugObserve(data);
 const version=$('#live-bridge-version');if(version&&data.bridgeVersion)version.textContent='Bridge '+data.bridgeVersion;
 const labels={running:'In partita',paused:'In pausa',ended:'Partita terminata',menu:'Nel menu',stale:'Collegamento interrotto',not_connected:'Mod non collegata',error:'Lettura in attesa'};
 const statusText=labels[data.status]||'In attesa';if($('#live-status').textContent!==statusText)$('#live-status').textContent=statusText;$('#live-status').classList.toggle('connected',['running','paused'].includes(data.status));
 const active=['running','paused'].includes(data.status);
 $('#live-data').hidden=!active;$('#live-tasks').innerHTML='';$('#live-synergies').innerHTML='';$('#live-timing').innerHTML='';
 if(!active)$('#live-opportunities').innerHTML='';
 if(!active){$('#live-message').textContent=data.status==='stale'?'Nessun aggiornamento recente: il gioco potrebbe essere chiuso o sospeso. Timer e obiettivi live sono nascosti.':data.message||'Avvia o riprendi una run con la mod abilitata.';return;}
 $('#live-character').textContent=data.character;$('#live-timer').textContent=clockText(data.frames);
 $('#live-floor').textContent='Piano '+data.stage+' · '+(['Normal','Hard','Greed','Greedier'][data.difficulty]||'Sconosciuta');$('#live-slot').textContent='Slot '+data.slot;
 renderRunSignals(data);
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
 $('#live-tasks').innerHTML='<h3>Obiettivi per questa run <span class="meta">'+rows.length+'</span></h3>'+(rows.length?rows.map(r=>{const status=AtlasPlanner.eventStatus(r,data,progress.unlocked);return `<div class="live-task"><label><input type="checkbox" data-live-check="${r.id}" ${liveChecklist.has(r.id)?'checked':''} aria-label="Segna come fatto nella checklist: ${escapeHTML(r.name)}"><span><strong>${escapeHTML(r.name)}${saved.has(r.id)?' · Da sbloccare':''}</strong><span>${escapeHTML(translate(r.requirement))}</span><span class="event-${status.code}">${escapeHTML(status.label)}</span></span></label><button class="text-button" data-detail="${r.id}">Dettagli ↗</button></div>`;}).join(''):'<p>Nessuno sblocco mancante associato a questo personaggio e a questa difficoltà.</p>');
 if(focused)document.querySelector(`[data-live-check="${focused}"]`)?.focus({preventScroll:true});
 // Suggest only authored/sourced interactions with a positively identified held item.
 function ingredients(r,n){const partners=[{name:r.name,itemId:r.itemId,cardId:r.id===610?80:null},...(n.partners||[])];return partners.map(p=>{const match=p.secretId?catalog.find(c=>c.id===p.secretId):null;const id=p.itemId||match?.itemId;const known=Number.isInteger(id)&&id>0&&id<2000;const held=known?data.items.includes(id):p.cardId?data.cards.includes(p.cardId):null;return `${escapeHTML(p.name)}: ${held===null?'da verificare':held?'presente':'mancante'}`;}).join(' · ');}
 const opportunities=catalog.filter(r=>saved.has(r.id)).flatMap(r=>interactionList(r).filter(n=>(r.itemId&&data.items.includes(r.itemId))||(n.partners||[]).some(p=>p.itemId&&data.items.includes(p.itemId))).map(n=>({r,n})));
 $('#live-synergies').innerHTML=opportunities.length?'<h3>Spunti dai tuoi “Da sbloccare”</h3>'+opportunities.slice(0,6).map(({r,n})=>`<div class="live-opportunity"><strong>${escapeHTML(r.name)} · ${escapeHTML(n.title)}</strong><p>${ingredients(r,n)}</p><p>Le condizioni della nota restano da verificare.</p><button class="text-button" data-detail="${r.id}">Leggi il caso d’uso e le fonti ↗</button></div>`).join(''):'';
}
document.addEventListener('change',e=>{if(e.target.dataset.liveCheck){const id=Number(e.target.dataset.liveCheck);if(e.target.checked)liveChecklist.add(id);else liveChecklist.delete(id);}});
$('#debug-filter')?.addEventListener('change',debugRender);
$('#clear-debug')?.addEventListener('click',()=>{debugObserver.clearLog();debugRender();});
$('#follow-live').addEventListener('click',()=>{if(liveSnapshot){$('#save-slot').value=String(liveSnapshot.slot);switchSlot();liveRender(liveSnapshot);}});
async function pollLive(){if(liveBusy)return;liveBusy=true;try{const response=await fetch('/api/live',{cache:'no-store',signal:AbortSignal.timeout(3500)});const data=await response.json();if(!response.ok)throw Error(data.error);liveRender(data);}catch{liveRender({status:'error',message:'Il collegamento live non risponde. Riprovo automaticamente.'});}finally{liveBusy=false;}}
pollLive();setInterval(pollLive,1500);
