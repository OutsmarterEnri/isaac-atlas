'use strict';
(function(root){
 const roomNames={0:'tipo non noto',1:'stanza normale',2:'negozio',4:'stanza del tesoro',5:'stanza del boss',6:'miniboss',7:'stanza segreta',8:'stanza super segreta',29:'stanza ultra segreta'};
 const hearts={1:'Cuore rosso',2:'Mezzo cuore rosso',3:'Cuore anima',4:'Cuore eterno',5:'Doppio cuore rosso',6:'Cuore nero',7:'Cuore dorato',8:'Mezzo cuore anima',9:'Cuore spaventato',10:'Cuore misto',11:'Cuore osso',12:'Cuore marcio'};
 function pickupText(p,catalog=[]){
  const labels={card:'Carta',rune:'Runa',pill:'Pillola (colore)',coin:'Moneta',key:'Chiave',bomb:'Bomba',chest:'Cassa',bag:'Sacco',battery:'Batteria',trinket:'Trinket',unknown:'Pickup non classificato'};
  const name=p.hidden?'Oggetto non identificato':p.kind==='collectible'?(catalog.find(r=>r.itemId===p.subtype)?.name||`Oggetto #${p.subtype}`):p.kind==='heart'?(hearts[p.subtype]||`Cuore #${p.subtype}`):p.kind==='card'&&p.subtype===80?'Wild Card':`${labels[p.kind]||p.kind} #${p.subtype}`;
  const price=p.price>0?` · ${p.price} monete`:p.price<0?` · costo speciale (${p.price})`:'';
  return `${name}${price} · posizione ${Math.round(p.x)},${Math.round(p.y)}`;
 }
 class Observer{
  constructor(){this.entries=[];this.run='';this.status='';this.resetObservations();}
  resetObservations(){this.room='';this.clear=null;this.pickups=new Map();this.rocks=new Map();this.items=null;this.cards=null;this.events=new Set();this.map='';this.truncated=false;}
  clearLog(){this.entries=[];}
  add(kind,text){this.entries.unshift({kind,text,time:new Date().toLocaleTimeString('it-IT')});this.entries.length=Math.min(200,this.entries.length);}
  observe(data,source='',catalog=[]){
   if(data.status!==this.status){this.status=data.status;this.add('system',`Collegamento: ${data.status||'in attesa'}`);}
   if(!data.run||!['running','paused'].includes(data.status))return;
   const key=`${source}:${data.slot}:${data.run}`;
   if(key!==this.run){this.run=key;this.resetObservations();this.add('system',`Nuova sessione osservata · slot ${data.slot} · Bridge ${data.bridgeVersion||'precedente'}`);}
   const r=data.room||{}, roomKey=`${data.stage}:${data.stageType}:${r.listIndex}:${r.index}`;
   const changed=roomKey!==this.room;
   if(changed){this.room=roomKey;this.pickups=new Map();this.rocks=new Map();this.clear=null;this.add('room',`Piano ${data.stage} · stanza ${r.index??'—'} · ${roomNames[r.type]||`tipo ${r.type}`}`);}
   const rocks=new Map((data.rocks||[]).map(rock=>[rock.index,rock]));
   for(const [id,rock] of rocks)if(this.rocks.get(id)?.kind!==rock.kind)this.add('room',`${rock.kind==='super_tinted'?'Super tinted rock':'Tinted rock'} osservata · posizione ${Math.round(rock.x)},${Math.round(rock.y)} · cella ${id}`);
   for(const [id] of this.rocks)if(!rocks.has(id))this.add('room',`Roccia speciale non più presente · cella ${id}`);
   this.rocks=rocks;
   if(r.clear!==this.clear){this.clear=r.clear;this.add('room',r.clear?'Stanza ripulita':'Stanza non ripulita');}
   const next=new Map();
   for(const [i,p] of (data.pickups||[]).entries()){
    // Updated Bridges always provide an entity ID. Legacy fallback is best effort.
    const id=p.id||`${p.kind}:${p.subtype}:${i}`; next.set(id,p);
    const old=this.pickups.get(id), signature=v=>JSON.stringify([v.kind,v.subtype,v.variant,v.price,v.hidden]);
    if(!old||signature(old)!==signature(p))this.add('pickup',`${old?'Cambiato':'Presente'}${r.type===2?' nello shop':''}: ${pickupText(p,catalog)}`);
   }
   if(!changed&&!data.pickupsTruncated)for(const [id,p] of this.pickups)if(!next.has(id))this.add('pickup',`Non più presente: ${pickupText(p,catalog)}`);
   if(changed&&!next.size)this.add('pickup','Nessun pickup osservato nella stanza');
   this.pickups=next;
   if(data.pickupsTruncated&&!this.truncated)this.add('system','Molti pickup: mostrati al massimo 128; rimozioni non dedotte.');
   this.truncated=!!data.pickupsTruncated;
   for(const [field,label] of [['items','Oggetto'],['cards','Carta/runa']]){
    const now=new Set(data[field]||[]),before=this[field]||new Set();
    for(const id of now)if(!before.has(id))this.add('inventory',`${label} in inventario: ${field==='items'?(catalog.find(r=>r.itemId===id)?.name||'#'+id):'#'+id}`);
    for(const id of before)if(!now.has(id))this.add('inventory',`${label} non più in inventario: #${id}`);
    this[field]=now;
   }
   for(const e of data.events||[]){const id=`${e.boss}:${e.character}`;if(!this.events.has(id)){this.events.add(id);this.add('system',`Evento osservato: ${e.boss} con ${e.character}`);}}
   const map=JSON.stringify([data.secretCandidates,data.mapMessage]);
   if(map!==this.map){this.map=map;for(const c of data.secretCandidates||[])this.add('map',`${c.kind} · ${c.status==='known'?'nota':'indizio '+c.strength} · ${c.direction} · cella ${c.index}`);}
  }
 }
 const api={Observer,pickupText,roomNames};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AtlasLive=api;
})(globalThis);
