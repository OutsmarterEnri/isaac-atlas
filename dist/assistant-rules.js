/* Original concise notes. Sources document mechanics, not a guaranteed successful run. */
'use strict';
(function(root){
 const wiki=name=>'https://bindingofisaacrebirth.wiki.gg/wiki/'+name;
 const rules=[
  {id:'d20',title:'D20 · costruisci una riserva di pickup',items:[166],cards:[],active:166,
   reason:'Una stanza ricca di consumabili e una ricarica accessibile permettono di valutare più reroll.',
   steps:['Lascia a terra i consumabili che puoi risparmiare.','Individua come ricaricare D20 e conserva le monete necessarie.','Dopo ogni uso rivaluta ricompense e batterie: il risultato è casuale.'],
   limits:['Con Book of Virtues il D20 distrugge i pickup: questo metodo non è applicabile.','In Repentance le casse già aperte non sono materiale da reroll. Il conteggio Atlas è solo un indizio.'],
   sources:[{title:'Wiki · D20',url:wiki('D20')}]},
  {id:'diplopia-wild',title:'Diplopia + Wild Card',items:[347],cards:[80],active:347,
   reason:'La carta può ripetere la duplicazione, se prepari correttamente la stanza.',
   steps:['Lascia Wild Card a terra con ciò che vuoi duplicare.','Usa Diplopia, poi raccogli e usa una copia della carta lasciandone un’altra a terra.','Evita altri attivi o consumabili fra le copie: cambierebbero l’effetto ripetuto.'],
   limits:['Atlas non osserva l’ultimo effetto usato: verifica la sequenza.','I vincoli delle scelte multiple non vengono eliminati automaticamente.'],
   sources:[{title:'Wiki · Diplopia',url:wiki('Diplopia')},{title:'Wiki · Wild Card',url:wiki('Wild_Card')}]},
  {id:'jera-wild',title:'Jera + Wild Card',items:[],cards:[33,80],
   reason:'Jera può duplicare Wild Card e avviare una catena sui consumabili della stanza.',
   steps:['Prepara Wild Card a terra e seleziona Jera.','Usa Jera, poi una copia di Wild Card lasciandone una sul pavimento.','Controlla di non aver usato un altro effetto fra le copie.'],
   limits:['Jera non duplica piedistalli, trinket o altre rune Jera.','La selezione del consumabile e l’ultimo effetto non sono verificati da Atlas.'],
   sources:[{title:'Wiki · Jera',url:wiki('Jera')},{title:'Wiki · Wild Card',url:wiki('Wild_Card')}]},
  {id:'clear-jera',title:'Clear Rune + Jera',items:[263],cards:[33],active:263,
   reason:'Puoi ripetere Jera conservando la runa; le batterie da duplicare possono sostenere le ricariche.',
   steps:['Seleziona Jera e controlla la carica di Clear Rune.','Prepara i consumabili e valuta le batterie prima di duplicarli.','Conserva abbastanza ricariche per l’uso successivo.'],
   limits:['Jera richiede 12 cariche ordinarie: una singola batteria non garantisce il ciclo.','Il numero e il tipo delle batterie, gli spazi e le risorse restano da verificare.'],
   sources:[{title:'Wiki · Clear Rune',url:wiki('Clear_Rune')},{title:'Wiki · Jera',url:wiki('Jera')}]},
  {id:'blank-diamonds',title:'Blank Card + 2 of Diamonds',items:[286],cards:[24],active:286,
   reason:'Ripetere il raddoppio delle monete può finanziare acquisti e ricariche.',
   steps:['Seleziona 2 of Diamonds e controlla la carica di Blank Card.','Confronta il denaro ottenibile con il costo delle ricariche viste.','Rivaluta il prezzo dopo ciascun acquisto.'],
   limits:['In Repentance 2 of Diamonds richiede 12 cariche con Blank Card.','Fuori da Greed, Restock aumenta i prezzi: nessuna promessa di denaro infinito.'],
   sources:[{title:'Wiki · Blank Card',url:wiki('Blank_Card')},{title:'Wiki · Restock',url:wiki('Restock')}]},
  {id:'habit-plug',title:'Habit + Sharp Plug',items:[156,205],cards:[],
   reason:'Il danno della ricarica può attivare Habit: valuta la sinergia, senza confonderla con una fonte gratuita di cariche.',
   steps:['Controlla salute, personaggio e attivo prima di usare Sharp Plug.','Verifica l’interazione dell’attivo specifico: esistono eccezioni.'],
   limits:['Non viene consigliato di spendere salute automaticamente.','Il vecchio ciclo infinito di Tainted Magdalene è cambiato in Repentance+.'],
   sources:[{title:'Wiki · Habit',url:wiki('Habit')},{title:'Wiki · Sharp Plug',url:wiki('Sharp_Plug')}]}
 ];
 for(const rule of rules){rule.reviewed='2026-09-16';rule.scope='Repentance / Repentance+ · verifica documentale, non prova in gioco';}
 const names={166:'D20',347:'Diplopia',263:'Clear Rune',286:'Blank Card',156:'Habit',205:'Sharp Plug',64:'Steam Sale',376:'Restock',636:'R Key',628:'Death Certificate',723:'Spindown Dice'};
 const cardNames={24:'2 of Diamonds',33:'Jera',80:'Wild Card'};
 const shopNotes={64:{text:'Riduce i prezzi. Due copie non rendono gratis lo shop in Repentance.',url:wiki('Steam_Sale')},376:{text:'Rifornisce lo shop; fuori da Greed i prezzi aumentano dopo gli acquisti.',url:wiki('Restock')}};
 const api={rules,names,cardNames,shopNotes};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AtlasRules=api;
})(globalThis);
