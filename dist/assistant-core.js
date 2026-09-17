'use strict';
(function(root){
 const knowledge=typeof module!=='undefined'&&module.exports?require('./assistant-rules.js'):root.AtlasRules;
 const {rules,names,cardNames,shopNotes}=knowledge;
 const roomKey=d=>String(d.room?.listIndex??-1)+':'+String(d.room?.index??-1);
 const priceText=(p,r)=>p.price<0?'Costo speciale · verifica nel gioco':p.price>0?(r?`${p.price} monete · ${r.coins>=p.price?'puoi permettertelo':'ne mancano '+(p.price-r.coins)}`:`${p.price} monete · disponibilità da verificare`):'Nessun prezzo in monete osservato';
 class Assistant{
  constructor(){this.key='';this.rooms=new Map();this.ignored=new Set();this.current='';this.lastFrame=0;}
  observe(data,source=''){
   if(!data.run||!['running','paused'].includes(data.status))return;
   const key=`${source}:${data.slot}:${data.run}:${data.floorId||data.stage+':'+data.stageType}`;
   if(this.key!==key||data.frames<this.lastFrame){this.key=key;this.rooms.clear();this.ignored.clear();}
   this.lastFrame=data.frames;this.current=roomKey(data);
   if(!Number.isInteger(data.room?.index)||data.room.index===-1)return;
   let pickups=(data.pickups||[]).map(p=>({...p}));
   if(data.pickupsTruncated){
    const partial=new Map((this.rooms.get(this.current)?.pickups||[]).map((p,i)=>[p.id||'old-'+i,p]));
    pickups.forEach((p,i)=>partial.set(p.id||'new-'+i,p));pickups=[...partial.values()].slice(0,256);
   }
   this.rooms.delete(this.current);
   this.rooms.set(this.current,{key:this.current,index:data.room.index,type:data.room.type,frame:data.frames,
     pickups,rocks:(data.rocks||[]).map(r=>({...r})),partial:!!data.pickupsTruncated});
   if(this.rooms.size>128)this.rooms.delete(this.rooms.keys().next().value);
  }
  ignore(id){this.ignored.add(id);}
  restore(){this.ignored.clear();}
  model(data,catalog=[]){
   const resources=data.resources,items=new Set(data.items||[]),cards=new Set(data.cards||[]);
   const itemName=id=>names[id]||catalog.find(r=>r.itemId===id)?.name||`Oggetto #${id}`;
   const seen=[...this.rooms.values()].flatMap(room=>room.pickups.filter(p=>!p.hidden).map(p=>({...p,room,stale:room.key!==this.current})));
   const location=p=>p.stale?`Stanza ${p.room.index} · da ricontrollare`:'Stanza attuale';
   const ingredient=(kind,id)=>{
    const owned=(kind==='item'?items:cards).has(id);
    const matches=seen.filter(p=>(kind==='item'?p.kind==='collectible':['card','rune'].includes(p.kind))&&p.subtype===id).sort((a,b)=>Number(a.stale)-Number(b.stale));
    return {kind,id,name:kind==='item'?itemName(id):cardNames[id]||`Carta/runa #${id}`,owned,seen:matches[0]||null};
   };
   const combos=[];
   if(data.players===1)for(const rule of rules){
    const ingredients=[...rule.items.map(id=>ingredient('item',id)),...rule.cards.map(id=>ingredient('card',id))];
    if(!ingredients.some(i=>i.owned||i.seen))continue;
    const owned=ingredients.every(i=>i.owned),missing=ingredients.filter(i=>!i.owned&&!i.seen);
    const checks=ingredients.map(i=>`${i.name}: ${i.owned?'in inventario':i.seen?location(i.seen)+' · '+priceText(i.seen,resources):'non osservato'}`);
    const active=(data.actives||[]).find(a=>a.id===rule.active);
    if(rule.active)checks.push(active?(rule.active===347?'Diplopia è monouso: prepara la stanza prima di consumarlo.':`Cariche osservate: ${active.charge} + ${active.battery} extra; controlla barra e slot selezionato.`):'Attivo non equipaggiato o cariche non disponibili.');
    let blocked=false;
    if(rule.id==='d20'){
     if(items.has(584)||data.character==='Bethany'){blocked=true;checks.push('Book of Virtues/Bethany: il metodo D20 standard non è applicabile.');}
     const piles=[...this.rooms.values()].map(r=>({index:r.index,n:r.pickups.filter(p=>!['collectible','unknown'].includes(p.kind)&&p.price===0).length})).sort((a,b)=>b.n-a.n);
     checks.push(piles[0]?.n?`${piles[0].n} consumabili/trinket/casse osservati nella stanza ${piles[0].index}; ricontrolla prima del reroll.`:'Accumula prima dei pickup: nessuna riserva osservata.');
    }
    if(['d20','clear-jera','blank-diamonds'].includes(rule.id)){
     const battery=seen.find(p=>p.kind==='battery');
     checks.push(battery?`Batteria: ${location(battery)} · ${priceText(battery,resources)}. Tipo e rifornimento da verificare.`:'Nessuna batteria osservata: ricarica sostenibile non dimostrata.');
    }
    if(rule.id==='habit-plug')checks.push('Salute e attivo richiedono valutazione manuale; nessuna attivazione automatica.');
    combos.push({id:'combo:'+rule.id,category:'combo',title:rule.title,score:blocked?100:owned?90:missing.length?45:75,
     badge:blocked?'Interazione sfavorevole':owned?'Ingredienti posseduti':missing.length?'Manca un ingrediente':'Ingredienti visti sul piano',
     text:rule.reason,checks,steps:blocked?[]:rule.steps,limits:rule.limits,sources:rule.sources,reviewed:rule.reviewed,scope:rule.scope,
     highlight:blocked?'Non avviare il ciclo D20 standard con questa interazione.':missing.length?'Non osservato: '+missing.map(i=>i.name).join(', '):owned?'Verifica sequenza, cariche e condizioni prima di usare gli ingredienti.':'Da recuperare: '+ingredients.filter(i=>!i.owned).map(i=>i.name).join(', '),
     itemId:rule.items[0],blocked});
   }
   const now=[],later=[];
   for(const [index,p] of seen.entries()){
    let reason='',score=25,title='',sources=[];
    if(p.kind==='collectible'){
     title=itemName(p.subtype);score=55;
     const related=rules.filter(rule=>rule.items.includes(p.subtype)&&
       (rule.items.some(id=>id!==p.subtype&&items.has(id))||rule.cards.some(id=>cards.has(id))));
     if(related.length){score=95;reason='Può completare '+related.map(r=>r.title).join(', ')+'.';sources=related[0].sources;}
     else if(names[p.subtype]){score=70;reason='Oggetto da valutare per le opzioni che aggiunge alla run.';}
     else reason='Confronta l’effetto con il tuo inventario prima di raccoglierlo.';
     if(shopNotes[p.subtype]){reason=shopNotes[p.subtype].text;sources=[{title:'Wiki · '+title,url:shopNotes[p.subtype].url}];}
     if(items.has(p.subtype))reason+=' Ne possiedi già una copia: il vantaggio di un duplicato dipende dall’oggetto.';
    }else if(['card','rune'].includes(p.kind)&&cardNames[p.subtype]){title=cardNames[p.subtype];score=65;reason='Conservala o prepara una combinazione: consulta gli ingredienti rilevati.';}
    else if(p.kind==='battery'&&(data.actives||[]).length){title='Batteria disponibile';score=60;reason='Può contribuire a ricaricare un attivo. Confronta carica, tipo e costo prima di raccoglierla.';}
    else if(p.kind==='bomb'&&resources?.bombs<=1){title='Rifornisci le bombe';score=75;reason='Le bombe sono poche: possono servire sia per le rocce speciali sia per verificare un muro.';}
    else if(p.kind==='key'&&resources?.keys===0){title='Una chiave da recuperare';score=75;reason='Non hai chiavi: valuta questa risorsa prima di proseguire.';}
    else if(p.kind==='heart'&&[1,2,5,9].includes(p.subtype)&&resources&&resources.hearts<resources.maxHearts&&!/Keeper|Lost/.test(data.character||'')){
     title='Cuore rosso disponibile';score=80;reason='Hai contenitori rossi non pieni. Valuta il recupero prima di spendere altre risorse.';
    }else continue;
    const id=`pickup:${p.room.key}:${p.id||p.kind+':'+p.subtype+':'+index}`;
    const checks=[priceText(p,resources)];
    if(p.price>0&&resources&&resources.coins>=p.price)checks.push(`Dopo questo singolo acquisto resterebbero ${resources.coins-p.price} monete; gli altri suggerimenti usano lo stesso budget.`);
    if(p.stale)checks.push('Presenza e prezzo ricordati dall’ultima visita, non confermati adesso.');
    if(p.room.partial)checks.push('Ultima osservazione parziale: oltre il limite di pickup.');
    const entry={id,category:p.stale?'later':'now',title,score:score-(p.stale?10:0),badge:p.stale?'Da ricontrollare':p.price>0&&resources&&resources.coins<p.price?'Risparmia prima':'Da valutare adesso',text:reason,checks,
      location:location(p),frame:p.room.frame,sources,highlight:checks[0],itemId:p.kind==='collectible'?p.subtype:null};
    (p.stale?later:now).push(entry);
   }
   for(const room of this.rooms.values())for(const rock of room.rocks){
    const stale=room.key!==this.current;
    const entry={id:`rock:${room.key}:${rock.index}`,category:stale?'later':'now',title:rock.kind==='super_tinted'?'Super tinted rock':'Tinted rock',score:resources?.bombs===0?35:80,
      badge:stale?'Da ricontrollare':'Roccia osservata',location:stale?`Stanza ${room.index}`:'Stanza attuale',frame:room.frame,
      text:`Posizione ${Math.round(rock.x)}, ${Math.round(rock.y)}. Ricompensa non garantita.`,checks:[resources?(resources.bombs===0?'Nessuna bomba: serve un altro mezzo per romperla.':resources.bombs===1?'Hai una sola bomba: confronta questa roccia con gli indizi di secret room.':`${resources.bombs} bombe disponibili.`):'Risorse non disponibili: aggiorna Bridge.']};
    entry.highlight=entry.checks[0];(stale?later:now).push(entry);
   }
   const exploration=(data.secretCandidates||[]).map(c=>({id:`map:${c.kind}:${c.index}`,category:'map',title:({secret:'Secret Room',supersecret:'Super Secret Room',ultrasecret:'Ultra Secret Room'})[c.kind],badge:c.status==='known'?'Stanza nota':'Indizio '+c.strength,score:c.status==='known'?70:c.strength==='media'?55:20,text:c.reason,location:`${c.direction} · cella ${c.index}`,checks:c.status==='known'?[]:[resources?.bombs===0?'Non hai bombe: il muro non è verificabile con una bomba al momento.':resources?.bombs===1?'Ultima bomba: confronta questo indizio con le altre opportunità.':'Accesso e ostacoli restano da verificare.']}));
   const sorted=entries=>entries.filter(e=>!this.ignored.has(e.id)).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
   return {now:sorted(now),later:sorted(later),combos:sorted(combos),exploration:sorted(exploration),roomCount:this.rooms.size,ignored:this.ignored.size,resources};
  }
 }
 const api={Assistant,priceText};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AtlasAssistant=api;
})(globalThis);
