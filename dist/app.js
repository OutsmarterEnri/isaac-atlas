'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let notes={},strategies={},noteLoadError='';
let catalog=[], progress=null, category='', view='all', limit=48, fetching=false, selected=null;
let slot=1;try{const value=Number(localStorage.getItem('isaac-atlas-slot'));if([1,2,3].includes(value))slot=value;}catch{}
let source='',sourceCount=0;
const slotPins={};
const pinKey=()=>source?'isaac-atlas-pins-source-'+source+'-'+slot:'isaac-atlas-pins-'+slot;
function loadPins(){const key=pinKey();if(slotPins[key])return slotPins[key];try{const legacy=sourceCount<=1?(localStorage.getItem('isaac-atlas-pins-'+slot)??(slot===1?localStorage.getItem('isaac-atlas-pins'):null)):null;const raw=localStorage.getItem(key)??legacy;const ids=JSON.parse(raw||'[]');return slotPins[key]=new Set(Array.isArray(ids)?ids.filter(Number.isInteger):[]);}catch{return slotPins[key]=new Set();}}
async function discoverSources(){
 const response=await fetch('/api/sources',{cache:'no-store'}),data=await response.json();if(!response.ok)throw Error(data.error);
 sourceCount=data.sources.length;const select=$('#save-source');select.innerHTML='<option value="">Scegli profilo…</option>';
 for(const item of data.sources){const option=document.createElement('option');option.value=item.id;option.textContent=item.label+' · slot '+item.slots.join(', ');select.append(option);}
 $('#source-picker').hidden=sourceCount<2;if(sourceCount===1){source=data.sources[0].id;select.value=source;}saved=loadPins();
}
$('#save-source').addEventListener('change',()=>{source=$('#save-source').value;switchSlot();});

let saved=loadPins(),requestGeneration=0;
function slotLabels(){
 $('#save-slot').value=String(slot);$('.save-icon').textContent=$('.page-stamp b').textContent=String(slot).padStart(2,'0');
 $('#slot-caption').textContent='Steam · Slot '+slot;$('#sync-dialog h2').textContent='Salvataggio · Slot '+slot;
}
function switchSlot(){
 slot=Number($('#save-slot').value);requestGeneration++;fetching=false;progress=null;selected=null;saved=loadPins();limit=48;
 try{localStorage.setItem('isaac-atlas-slot',String(slot));}catch{}
 $$('dialog[open]').forEach(d=>d.close());slotLabels();
 $('#results').innerHTML='';$('#character-summary').innerHTML='';$('#empty').hidden=true;$('#more').hidden=true;$('#error').hidden=true;$('#toast').hidden=true;
 for(const id of ['total-unlocked','missing-items','missing-trinkets','nav-count','count-all','count-items','count-trinkets','count-other'])$('#'+id).textContent='—';
 $('#saved-count').textContent=saved.size;$('#progress-fill').style.width='0%';$('.progress-track').removeAttribute('aria-valuenow');
 $('#progress-caption').textContent=$('#result-count').textContent='Lettura dello slot '+slot+'…';$('#last-save').textContent='Salvataggio in lettura';$('#sync-details').textContent='Lettura in corso…';
 $('#sync-status').textContent='Collegamento allo slot '+slot+'…';$('#sync-dot').className='';if(typeof liveSnapshot!=='undefined'&&liveSnapshot)liveRender(liveSnapshot);sync();
}
slotLabels();$('#sync-status').textContent='Collegamento allo slot '+slot+'…';$('#save-slot').addEventListener('change',switchSlot);
const bookmarkSvg=filled=>`<svg viewBox="0 0 24 24" fill="${filled?'currentColor':'none'}" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>`;
function translate(s){
 return s.replace(/Earn all Hard mode Completion Marks for all characters, including tainted ones/g,'Ottieni tutti i marchi di completamento in Hard con tutti i personaggi, inclusi i Tainted')
 .replace(/Defeat /g,'Sconfiggi ').replace(/Complete (?:the )?/g,'Completa ').replace(/ as /g,' con ')
 .replace(/ on Hard mode/gi,' in modalità Hard').replace(/ in Hard mode/gi,' in modalità Hard').replace(/ on hard/gi,' in Hard')
 .replace(/ and /g,' e ').replace(/ times/g,' volte').replace(/without taking damage/g,'senza subire danni').replace(/without /g,'senza ')
 .replace(/Hold /g,'Possiedi ').replace(/Have /g,'Ottieni ').replace(/Collect /g,'Raccogli ').replace(/Unlock /g,'Sblocca ')
 .replace(/Donate /g,'Dona ').replace(/Destroy /g,'Distruggi ').replace(/Beat /g,'Completa ').replace(/Win an Online Daily run/g,'Vinci una Daily online')
 .replace(/Win an Online game/g,'Vinci una partita online').replace(/Play an Online game/g,'Gioca una partita online');
}
function unlocked(r){return !!progress?.unlocked.includes(r.id);}
function baseRows(){return catalog.filter(r=>(view==='saved'||!$('#hide-unlocked').checked||!unlocked(r))&&(view!=='saved'||saved.has(r.id))&&(view!=='challenges'||r.method==='Sfide'));}
function visibleRows(){let q=$('#search').value.trim().toLocaleLowerCase();return baseRows().filter(r=>(!category||r.category===category)&&(!$('#character').value||r.character===$('#character').value)&&(!$('#boss').value||r.bosses.includes($('#boss').value))&&(!q||[r.name,r.achievementName,r.requirement,translate(r.requirement),r.character,r.boss,r.id,notes[r.id]?.nameIt,...(notes[r.id]?.description||[])].join(' ').toLowerCase().includes(q))).sort((a,b)=>$('#sort').value==='name'?a.name.localeCompare(b.name):$('#sort').value==='character'?(a.character||'zz').localeCompare(b.character||'zz')||a.id-b.id:a.id-b.id);}
function noteFor(r){return notes[r.id];}
function noteLinks(sources){return sources.map(source=>`<a href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(source.title)} ↗</a>`).join('');}
function descriptionBlock(r,compact=false){
 const n=noteFor(r);if(!n)return compact?'':`<p class="note-empty">Descrizione non ancora disponibile nel taccuino. La guida completa resta consultabile sulla wiki.</p>`;
 if(compact)return `<span class="effect-label">COSA FA</span><span class="effect-preview" lang="${n.language==='it'?'it':'en'}">${escapeHTML(n.description.slice(0,2).join(' · '))}</span>`;
 return `<section class="description-section"><h3>Cosa fa</h3>${n.nameIt&&n.nameIt!==r.name?`<p class="localized-name">${escapeHTML(n.nameIt)}</p>`:''}<ul lang="${n.language==='it'?'it':'en'}">${n.description.map(line=>`<li>${escapeHTML(line)}</li>`).join('')}</ul><div class="note-sources">${noteLinks([n.descriptionSource])}${n.language!=='it'?'<span>Descrizione disponibile in inglese</span>':''}</div></section>`;
}
function partnerBadge(partner,r){
 if(partner.secretId===r.id||partner.itemId===r.itemId)return '';
 const match=partner.secretId?catalog.find(c=>c.id===partner.secretId):partner.itemId?catalog.find(c=>c.itemId===partner.itemId):null;
 const state=match?(unlocked(match)?'Sbloccato nel save':'Da sbloccare'):'';
 return `<span class="partner ${match&&unlocked(match)?'available':''}">${match?`<button data-detail="${match.id}">${escapeHTML(partner.name)}</button>`:`<span>${escapeHTML(partner.name)}</span>`}${state?`<small>${state}</small>`:''}</span>`;
}
function interactionList(r){
 const curated=strategies[r.id]||[],extra=noteFor(r)?.interactions||[];
 // A specific curated explanation supersedes generic notes for the same partner.
 const used=new Set(curated.flatMap(n=>(n.partners||[]).map(p=>p.name)));
 return [...curated,...extra.filter(n=>!(n.partners||[]).some(p=>used.has(p.name)))];
}
function strategyBlock(r,compact=false){
 const list=interactionList(r);
 return `<section class="strategy-section ${compact?'compact':''}"><div class="strategy-heading"><h${compact?'4':'3'}>Casi d’uso e sinergie</h${compact?'4':'3'}>${list.length?`<span>${list.length} note</span>`:''}</div>${list.length?list.map((n,i)=>`<details class="strategy ${n.kind==='caution'?'caution':''}" ${i===0&&compact?'open':''}><summary><span class="strategy-kind">${n.kind==='caution'?'Da sapere':n.kind==='use'?'Caso d’uso':n.kind==='interaction'?'Interazione':'Sinergia'}</span><strong>${escapeHTML(n.title)}</strong></summary><div class="strategy-body" lang="${n.language==='it'?'it':'en'}">${n.body.map(line=>`<p>${escapeHTML(line)}</p>`).join('')}${n.steps?`<ol>${n.steps.map(step=>`<li>${escapeHTML(step)}</li>`).join('')}</ol>`:''}<div class="partners">${(n.partners||[]).map(p=>partnerBadge(p,r)).join('')}</div><div class="note-sources">${noteLinks(n.sources)}</div></div></details>`).join(''):`<p class="note-empty">${noteLoadError?escapeHTML(noteLoadError):'Non ci sono ancora combinazioni verificate in questa scheda.'}</p>`}<a class="wiki-synergies" href="${escapeHTML(r.wiki)}#Synergies" target="_blank" rel="noopener noreferrer">Consulta le interazioni sulla wiki ↗</a></section>`;
}
function card(r){const done=unlocked(r),pin=saved.has(r.id);return `<article class="card ${done?'unlocked':''}"><button class="bookmark ${pin?'saved':''}" data-pin="${r.id}" aria-label="${pin?'Rimuovi':'Aggiungi'} ${escapeHTML(r.name)} ${pin?'da':'a'} Da provare" aria-pressed="${pin}">${bookmarkSvg(pin)}</button><button class="card-open" data-detail="${r.id}" aria-label="Dettagli: ${escapeHTML(r.name)}"><span class="card-top"><span class="item-image ${r.icon?.includes('achievements')?'achievement':''}">${r.icon?`<img src="${r.icon}" alt="" loading="lazy" width="48" height="48">`:'<span>+</span>'}</span><span><h3>${escapeHTML(r.name)}</h3><span class="meta">${escapeHTML(r.category)} · Segreto ${String(r.id).padStart(3,'0')}</span></span></span>${descriptionBlock(r,true)}<span class="requirement-label">${done?'SBLOCCATO NEL TUO SAVE':'COME SI SBLOCCA'}</span><span class="requirement">${done?'Già disponibile nel tuo salvataggio.':escapeHTML(translate(r.requirement))}</span></button><div class="card-bottom"><span class="tag">${escapeHTML(r.character||r.method)}</span><span>${done?'Completato':r.boss?escapeHTML(r.boss):'Da sbloccare'} <span class="card-arrow" aria-hidden="true">↗</span></span></div>${view==='saved'?strategyBlock(r,true):''}</article>`;}

function render(){
 if(!progress)return;
 const rows=visibleRows(),base=baseRows();
 $('#results').classList.toggle('saved-grid',view==='saved');$('#hide-unlocked').disabled=view==='saved';$('#visibility-label').textContent=view==='saved'?'Preferiti sempre visibili':'Nascondi sbloccati';$('#saved-explanation').hidden=view!=='saved';
 $('#results').innerHTML=rows.slice(0,limit).map(card).join('');$('#empty').hidden=rows.length!==0;$('#more').hidden=rows.length<=limit;
 $('#more').textContent=`Mostra altri ${Math.min(48,rows.length-limit)} risultati`;
 $('#result-count').textContent=`${rows.length} ${rows.length===1?'risultato':'risultati'}${view!=='saved'&&$('#hide-unlocked').checked?' da sbloccare':''}${rows.length>limit?` · primi ${limit} visibili`:''}`;
 for(const [id,cat] of [['all',''],['items','Oggetti'],['trinkets','Trinket'],['other','Altri sblocchi']])$('#count-'+id).textContent=base.filter(r=>!cat||r.category===cat).length;
 $('#nav-count').textContent=catalog.filter(r=>!unlocked(r)).length;$('#saved-count').textContent=saved.size;
 $('#section-title').textContent=view==='saved'?'I tuoi prossimi obiettivi':view==='challenges'?'Ricompense delle sfide':$('#hide-unlocked').checked?'Cosa ti manca':'Tutti gli sblocchi';
 $('#character-summary').hidden=view!=='characters';
 if(view==='characters'){
  const counts={};for(const r of base.filter(r=>r.character))counts[r.character]=(counts[r.character]||0)+1;
  $('#character-summary').innerHTML=Object.entries(counts).sort((a,b)=>a[0].localeCompare(b[0])).map(([c,n])=>`<button data-char="${escapeHTML(c)}">${escapeHTML(c)} <b>${n}</b></button>`).join('');
 }
}
function updateProgress(){
 const count=progress.unlocked.length;$('#total-unlocked').textContent=count;
 $('#progress-fill').style.width=(count/641*100)+'%';$('.progress-track').setAttribute('aria-valuenow',count);
 $('#progress-caption').textContent=`${(count/641*100).toLocaleString('it-IT',{maximumFractionDigits:1})}% completato · ${641-count} segreti ancora da scoprire`;
 $('#missing-items').textContent=catalog.filter(r=>r.category==='Oggetti'&&!unlocked(r)).length;
 $('#missing-trinkets').textContent=catalog.filter(r=>r.category==='Trinket'&&!unlocked(r)).length;
 $('#last-save').textContent='Ultimo salvataggio: '+new Date(progress.modified).toLocaleString('it-IT',{dateStyle:'short',timeStyle:'short'});
 $('#sync-details').textContent=`File: ${progress.filename}. Ultima lettura: ${new Date(progress.checked).toLocaleTimeString('it-IT')}. Integrità verificata.`;
}
async function sync(){
 if(fetching)return;fetching=true;const generation=++requestGeneration,requestedSlot=slot;
 try{
  const response=await fetch('/api/progress?slot='+requestedSlot+(source?'&source='+encodeURIComponent(source):''),{cache:'no-store',signal:AbortSignal.timeout(4000)}),data=await response.json();
  if(generation!==requestGeneration)return;
  if(!response.ok)throw Error(data.error||'Salvataggio non disponibile.');
  if(!Array.isArray(data.unlocked)||data.version!=='Repentance+'||data.slot!==requestedSlot)throw Error('Risposta del lettore non valida.');
  const changed=progress?.hash!==data.hash,oldCount=progress?.unlocked.length;progress=data;
  $('#error').hidden=true;$('#sync-status').textContent='Slot '+slot+' sincronizzato';$('#sync-dot').className='live';
  updateProgress();if(changed){render();if(oldCount!==undefined&&data.unlocked.length>oldCount)toast(`${data.unlocked.length-oldCount} nuovi sblocchi! Lista aggiornata.`);if(selected&&$('#detail').open)detail(selected,false);}
 }catch(e){if(generation!==requestGeneration)return;$('#sync-status').textContent='Sincronizzazione in attesa';$('#sync-dot').className='error-dot';$('#error').hidden=false;$('#error').textContent=(progress?'Ultimo risultato valido ancora visibile. ':'')+(e.name==='TimeoutError'?'Il lettore non risponde.':e.message)+' Nuovo tentativo automatico tra 5 secondi.';if(!progress)$('#result-count').textContent='In attesa del salvataggio: nessuno sblocco viene presunto.';}
 finally{if(generation===requestGeneration)fetching=false;}
}
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').hidden=true,2800);}
function togglePin(id){if(saved.has(id))saved.delete(id);else saved.add(id);try{localStorage.setItem(pinKey(),JSON.stringify([...saved]));}catch{toast('Preferiti mantenuti solo finché la pagina resta aperta.');}render();if(selected===id&&$('#detail').open)detail(id,false);}
function detail(id,open=true){
 const r=catalog.find(x=>x.id===id);if(!r)return;selected=id;
 const done=unlocked(r);$('#detail-body').innerHTML=`<p class="eyebrow">SEGRETO ${String(r.id).padStart(3,'0')} · ${escapeHTML(r.category).toUpperCase()}</p>${r.icon?`<img class="detail-art" src="${r.icon}" alt="${escapeHTML(r.name)}" width="85" height="85">`:''}<h2>${escapeHTML(r.name)}</h2><span class="tag">${done?'Sbloccato nello slot '+slot:'Da sbloccare'}</span><div class="notice"><strong>${done?'Obiettivo già completato':'Il tuo obiettivo'}</strong><p>${done?'Questo sblocco è già presente nel tuo salvataggio. Non viene proposto nella vista degli oggetti mancanti.':escapeHTML(translate(r.requirement))}</p></div>${!done?`<details><summary>Requisito originale della wiki</summary><p lang="en">${escapeHTML(r.requirement)}</p></details>`:''}${r.character?`<p><strong>Personaggio:</strong> ${escapeHTML(r.character)}</p>`:''}${r.boss?`<p><strong>Obiettivo:</strong> ${escapeHTML(r.boss)}</p>`:''}${r.itemId&&r.itemId<2000?`<p><strong>Raccolto almeno una volta:</strong> ${progress.collected.includes(r.itemId)?'Sì':'No'}. La raccolta è distinta dallo sblocco.</p>`:''}${descriptionBlock(r)}${strategyBlock(r)}<div class="detail-links"><a href="${escapeHTML(r.wiki)}" target="_blank" rel="noopener noreferrer">Guida completa sulla wiki ↗</a><a href="${escapeHTML(r.fandom)}" target="_blank" rel="noopener noreferrer">Fandom ↗</a></div><button class="primary" data-pin="${r.id}">${saved.has(r.id)?'Rimuovi da Da provare':'Aggiungi a Da provare'}</button>`;
 if(open&&!$('#detail').open)$('#detail').showModal();
}
document.addEventListener('click',e=>{
 const pin=e.target.closest('[data-pin]');if(pin){togglePin(Number(pin.dataset.pin));return;}
 const d=e.target.closest('[data-detail]');if(d){detail(Number(d.dataset.detail));return;}
 const c=e.target.closest('[data-char]');if(c){$('#character').value=c.dataset.char;limit=48;render();return;}
 const cat=e.target.closest('[data-category]');if(cat){category=cat.dataset.category;$$('[data-category]').forEach(b=>{b.classList.toggle('active',b===cat);b.setAttribute('aria-pressed',b===cat);});limit=48;render();return;}
 const nav=e.target.closest('[data-view]');if(nav){view=nav.dataset.view;$$('[data-view]').forEach(b=>{b.classList.toggle('active',b===nav);if(b===nav)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});$('#breadcrumb').textContent={all:'Sblocchi',characters:'Per personaggio',challenges:'Sfide',saved:'Da provare'}[view];$('#page-title').textContent={all:'La prossima scoperta.',characters:'Scegli il tuo personaggio.',challenges:'Una sfida, una ricompensa.',saved:'La tua prossima run.'}[view];resetFilters();}
});
function resetFilters(){category='';$('#search').value='';$('#character').value='';$('#boss').value='';limit=48;$$('[data-category]').forEach(b=>{b.classList.toggle('active',b.dataset.category==='');b.setAttribute('aria-pressed',b.dataset.category==='');});render();}
$('#reset').addEventListener('click',resetFilters);
for(const id of ['search','character','boss','sort','hide-unlocked'])$('#'+id).addEventListener(id==='search'?'input':'change',()=>{limit=48;render();});
$('#more').addEventListener('click',()=>{const first=limit;limit+=48;render();$$('#results .card-open[data-detail]')[first]?.focus();});
$('#refresh').addEventListener('click',sync);
$('#close-detail').addEventListener('click',()=>$('#detail').close());$('#close-sync').addEventListener('click',()=>$('#sync-dialog').close());$('#connection').addEventListener('click',()=>$('#sync-dialog').showModal());
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!$('dialog[open]')){e.preventDefault();$('#search').focus();}});
async function start(){try{await discoverSources();const response=await fetch('data/catalog.json');if(!response.ok)throw Error('Catalogo non disponibile');catalog=await response.json();const noteResults=await Promise.allSettled(['notes','strategies'].map(async name=>{const res=await fetch('data/'+name+'.json');if(!res.ok)throw Error('Note non disponibili');return (await res.json()).entries;}));if(noteResults[0].status==='fulfilled')notes=noteResults[0].value;if(noteResults[1].status==='fulfilled')strategies=noteResults[1].value;if(noteResults.some(r=>r.status==='rejected')){noteLoadError='Una parte delle note non è stata caricata. Ricarica la pagina per riprovare.';toast(noteLoadError);}for(const [id,prop] of [['character','character'],['boss','boss']]){for(const val of [...new Set(catalog.flatMap(r=>prop==='boss'?r.bosses:[r[prop]]).filter(Boolean))].sort()){const opt=document.createElement('option');opt.value=val;opt.textContent=val;$('#'+id).append(opt);}}$('#save-slot').disabled=false;await sync();setInterval(sync,5000);}catch(e){$('#error').hidden=false;$('#error').textContent=e.message;}}
start();
// Optional browser-native agent access; shares the visible filtering state.
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();
 addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
 try{Promise.resolve(document.modelContext.registerTool({
  name:'filter_missing_unlocks',title:'Filtra gli sblocchi mancanti',
  description:'Mostra nel taccuino gli sblocchi mancanti del salvataggio collegato, filtrati per testo e categoria. Non modifica il gioco.',
  inputSchema:{type:'object',properties:{query:{type:'string',maxLength:100},category:{type:'string',enum:['','Oggetti','Trinket','Altri sblocchi']}},additionalProperties:false},
  annotations:{readOnlyHint:false,untrustedContentHint:true},
  execute(input){
   if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['query','category'].includes(k))||('query'in input&&(typeof input.query!=='string'||input.query.length>100))||('category'in input&&!['','Oggetti','Trinket','Altri sblocchi'].includes(input.category)))throw Error('Filtri non validi.');
   if(!progress)throw Error('Salvataggio non ancora disponibile.');
   document.querySelector('[data-view="all"]').click();$('#hide-unlocked').checked=true;$('#search').value=input.query||'';
   category=input.category||'';$$('[data-category]').forEach(b=>{b.classList.toggle('active',b.dataset.category===category);b.setAttribute('aria-pressed',b.dataset.category===category);});render();
   const rows=visibleRows();return {total:rows.length,results:rows.slice(0,48).map(r=>({id:r.id,name:r.name,requirement:r.requirement}))};
  }
 },{signal:lifecycle.signal})).catch(()=>{});}catch{}
}
