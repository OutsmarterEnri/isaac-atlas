'use strict';
const floorAssistant=new AtlasAssistant.Assistant();
function renderAssistantFull(data,target){
 floorAssistant.observe(data,source);
 const model=floorAssistant.model(data,catalog),escape=escapeHTML;
 const icon=kind=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${({now:'<path d="m13 2-8 12h6l-1 8 9-13h-7z"/>',later:'<path d="M5 3h14v18l-7-4-7 4z"/>',combo:'<path d="m8 9-3 3 3 3m8-6 3 3-3 3M14 5l-4 14"/>',map:'<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2zM9 3v16M15 5v16"/>'})[kind]||''}</svg>`;
 const open=new Set([...target.querySelectorAll?.('details[open][data-advice]')||[]].map(d=>d.dataset.advice));
 function card(entry){
  const row=entry.itemId?catalog.find(r=>r.itemId===entry.itemId):null;
  const art=row&&typeof rewardImage==='function'?rewardImage(row):null;
  return `<article class="advice-card ${entry.blocked?'advice-blocked':''}"><div class="advice-top"><span class="advice-art">${art?`<img src="${escape(art)}" alt="" width="40" height="40">`:icon(entry.category)}</span><div><span class="advice-badge">${escape(entry.badge)}</span><h4>${escape(entry.title)}</h4></div></div>${entry.location?`<p class="advice-location">${escape(entry.location)}${entry.category==='later'?' · vista a '+clockText(entry.frame):''}</p>`:''}<p>${escape(entry.text)}</p>${entry.highlight?`<p class="advice-highlight">${escape(entry.highlight)}</p>`:''}<details data-advice="${escape(entry.id)}" ${open.has(entry.id)?'open':''}><summary>Condizioni${entry.sources?.length?' e fonti':''}</summary>${row?.effect?`<p>${escape(row.effect)}</p>`:''}<ul>${(entry.checks||[]).map(c=>`<li>${escape(c)}</li>`).join('')}</ul>${entry.steps?.length?`<ol>${entry.steps.map(s=>`<li>${escape(s)}</li>`).join('')}</ol>`:''}${entry.limits?.map(s=>`<p class="advice-limit">${escape(s)}</p>`).join('')||''}${entry.sources?.map(s=>`<a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.title)} ↗</a>`).join(' · ')||''}${entry.reviewed?`<small>Verifica fonti: ${escape(entry.reviewed)} · ${escape(entry.scope)}</small>`:''}</details><button type="button" class="advice-ignore" data-ignore-advice="${escape(entry.id)}" aria-label="Ignora per questo piano: ${escape(entry.title)}">Ignora per questo piano</button></article>`;
 }
 function section(key,title,subtitle,entries){
  return `<section class="advice-section"><div class="advice-section-heading">${icon(key)}<h3>${title} <span>${entries.length}</span></h3></div><p class="advice-caption">${escape(subtitle)}</p>${entries.length?entries.slice(0,3).map(card).join(''):'<p class="advice-empty">Nessuna opportunità rilevata.</p>'}${entries.length>3?`<details class="advice-more" data-advice="more:${key}" ${open.has('more:'+key)?'open':''}><summary>Altre ${entries.length-3} opportunità</summary>${entries.slice(3).map(card).join('')}</details>`:''}</section>`;
 }
 const r=model.resources;
 const resourceHTML=r?`<span><b>${r.coins}</b> monete</span><span><b>${r.bombs}</b> bombe</span><span><b>${r.keys}</b> chiavi</span><span><b>${r.hearts/2}/${r.maxHearts/2}</b> cuori rossi</span><span><b>${r.soulHearts/2}</b> anima/neri</span>`:'<span>Risorse non disponibili · aggiorna Bridge a 1.1.0</span>';
 const activeHTML=(data.actives||[]).map(a=>`${AtlasRules.names[a.id]||catalog.find(r=>r.itemId===a.id)?.name||'Attivo #'+a.id}: ${a.id===347?'monouso':a.charge+' cariche + '+a.battery+' extra'} (slot ${a.slot+1})`).join(' · ');
 const html=`<div class="assistant-heading"><div><p class="eyebrow">LE OCCASIONI DEL PIANO</p><h2>La prossima decisione</h2></div><span class="assistant-memory">${model.roomCount} ${model.roomCount===1?'stanza osservata':'stanze osservate'}</span></div><div class="assistant-resources" aria-label="Risorse osservate">${resourceHTML}</div>${activeHTML?`<p class="advice-caption">${escape(activeHTML)}</p>`:''}<p class="assistant-note">Priorità basate su risorse e ingredienti osservati. Le stanze lasciate vanno ricontrollate; la memoria si azzera cambiando piano o ricaricando la pagina.</p>${data.players!==1?'<p class="advice-limit">Cooperativa: combinazioni sospese. Risorse e inventario si riferiscono al primo giocatore.</p>':''}<div class="assistant-grid">${section('now','Da valutare adesso','Oggetti, shop e risorse nella stanza corrente.',model.now)}${section('combo','Combinazioni','Ingredienti posseduti o incontrati; leggi le condizioni prima di agire.',model.combos)}${section('later','Prima di scendere','Opportunità ricordate nelle stanze visitate, non monitorate a distanza.',model.later)}${section('map','Esplorazione',data.mapMessage||'Indizi basati sulla mappa visibile.',model.exploration)}</div>${model.ignored?`<button type="button" class="advice-restore" data-restore-advice>Ripristina ${model.ignored} suggerimenti ignorati</button>`:''}`;
 if(target.innerHTML!==html){
  const focused=document.activeElement?.dataset?.ignoreAdvice;
  target.innerHTML=html;
  if(focused){const button=[...target.querySelectorAll('[data-ignore-advice]')].find(b=>b.dataset.ignoreAdvice===focused);button?.focus({preventScroll:true});}
 }
}
document.addEventListener('click',event=>{
 const button=event.target.closest?.('[data-ignore-advice], [data-restore-advice]');if(!button)return;
 if(button.hasAttribute('data-ignore-advice'))floorAssistant.ignore(button.dataset.ignoreAdvice);else floorAssistant.restore();
 if(liveSnapshot)renderAssistant(liveSnapshot,$('#live-opportunities'));
});

const assistantDetails=new Map(),assistantPositions={now:0,combo:0,later:0,map:0};
function renderAssistant(data,target){
 const full=document.createElement('div');renderAssistantFull(data,full);
 const model=floorAssistant.model(data,catalog);assistantDetails.clear();
 for(const detail of full.querySelectorAll('.advice-card')){const id=detail.querySelector('[data-ignore-advice]').dataset.ignoreAdvice;detail.querySelector('details').open=true;assistantDetails.set(id,detail.outerHTML);}
 const group=(key,title,entries)=>{
  const pos=Math.min(assistantPositions[key],Math.max(0,entries.length-1));assistantPositions[key]=pos;const e=entries[pos];
  return `<section class="live-tile"><div class="tile-heading"><h3>${title}</h3><span>${entries.length}</span></div>${e?`<span class="advice-badge">${escapeHTML(e.badge)}</span><h4>${escapeHTML(e.title)}</h4><p class="tile-text">${escapeHTML(e.location?e.location+' · '+e.text:e.text)}</p><p class="tile-fact">${escapeHTML(e.highlight||e.checks?.[0]||e.location||'Verifica le condizioni')}</p><div class="tile-controls"><button data-live-details="${escapeHTML(e.id)}">Condizioni e fonti</button><div><button data-advice-page="${key}" data-step="-1" aria-label="Precedente: ${title}" ${pos===0?'disabled':''}>‹</button><span>${pos+1}/${entries.length}</span><button data-advice-page="${key}" data-step="1" aria-label="Successivo: ${title}" ${pos>=entries.length-1?'disabled':''}>›</button></div></div>`:'<p class="advice-empty">Nessun segnale rilevato.</p>'}</section>`;
 };
 const resources=full.querySelector('.assistant-resources').outerHTML;
 const html=resources+`<div class="live-board">${group('now','Qui e ora',model.now)}${group('combo','Combinazioni',model.combos)}${group('later','Prima di scendere',model.later)}${group('map','Esplorazione',model.exploration)}</div><div class="live-board-footer"><span>${model.roomCount} ${model.roomCount===1?'stanza osservata':'stanze osservate'} · memoria del piano · dettagli su richiesta</span>${model.ignored?`<button data-restore-advice>Ripristina ignorati (${model.ignored})</button>`:''}</div>`;
 if(target.innerHTML!==html){const active=document.activeElement;const focusKey=active?.dataset?.liveDetails,groupKey=active?.dataset?.advicePage,step=active?.dataset?.step;target.innerHTML=html;const next=[...target.querySelectorAll('button')].find(b=>focusKey?b.dataset.liveDetails===focusKey:groupKey&&b.dataset.advicePage===groupKey&&b.dataset.step===step);next?.focus({preventScroll:true});}
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-advice-page]');if(!b)return;assistantPositions[b.dataset.advicePage]+=Number(b.dataset.step);if(liveSnapshot)renderAssistant(liveSnapshot,$('#live-opportunities'));});
