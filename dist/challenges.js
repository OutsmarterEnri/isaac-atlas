'use strict';
// Conditions cross-checked against IsaacGuru's challenge table, 2026-09-17.
const challengeNames=['Pitch Black','High Brow','Head Trauma','Darkness Falls','The Tank','Solar System','Suicide King','Cat Got Your Tongue','Demo Man','Cursed!','Glass Cannon','When Life Gives You Lemons','BEANS!','It’s in the Cards','Slow Roll','Computer Savvy','Waka Waka','The Host','The Family Man','Purist','XXXXXXXXL','SPEED!','Blue Bomber','PAY TO PLAY','Have a Heart','I RULE!','BRAINS!','PRIDE DAY!',"Onan’s Streak",'The Guardian','Backasswards','Aprils Fool','Pokey Mans','Ultra Hard','Pong','Scat Man','Bloody Mary','Baptism by Fire',"Isaac’s Awakening",'Seeing Double','Pica Run','Hot Potato','Cantripped!','Red Redemption','DELETE THIS'];
const challengeUnlockIds={4:157,5:158,6:159,7:160,8:161,9:162,10:163,11:164,19:165,20:166,21:265,22:266,23:267,24:268,25:269,26:270,27:271,28:272,29:273,30:274,31:277,32:278,33:279,34:280,35:281,37:508,38:509,39:510,40:511,41:512,42:513,43:514,44:515,45:516};
// Short original corrections/additions to existing catalog requirements.
const challengeConditions={4:"Mom’s Heart ×11; ??? con Eve.",7:"Mom’s Heart ×11; Lazarus sbloccato.",11:"Completa The Family Man; sconfiggi Lokii; sblocca Judas e It Lives!",24:"Isaac con Cain; distruggi 10 tinted rock.",26:"Mega Satan sconfitto; The Negative sbloccata.",29:"Judas e It Lives! sbloccati.",31:"Mega Satan sconfitto; The Negative sbloccata.",34:"Mega Satan sconfitto; The Negative sbloccata."};
function challengeNumber(r){if(r.id===232)return 29;if(r.id===233)return 30;return Number(r.requirement.match(/challenge #(\d+)/i)?.[1])||Number(Object.keys(challengeUnlockIds).find(n=>challengeUnlockIds[n]===r.id))||0;}
function challengeBlock(r){
 const n=challengeNumber(r);if(!n)return r.method==='Sfide'?'<p class="challenge-access">Daily Challenge: accesso e ricompense seguono regole separate dalle 45 sfide numerate.</p>':'';
 const unlockRow=catalog.find(x=>x.id===challengeUnlockIds[n]);
 const condition=challengeConditions[n]||(unlockRow?translate(unlockRow.requirement):'Disponibile dall’inizio.');
 const confirmed=unlockRow&&progress?.unlocked.includes(unlockRow.id);
 return `<section class="challenge-access"><strong>Sfida #${n} · ${escapeHTML(challengeNames[n-1])}</strong><p><b>Come renderla disponibile:</b> ${escapeHTML(condition)}</p><small>${confirmed?'Accesso confermato dal segreto nel save.':unlockRow?'Segreto di accesso non presente nel save; verifica anche i prerequisiti indicati.':'Nessun requisito di sblocco aggiuntivo.'}</small><a href="https://isaacguru.com/challenges/isaac_repentance" target="_blank" rel="noopener noreferrer">Fonte requisiti ↗</a></section>`;
}
