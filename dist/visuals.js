/* Original Atlas vector artwork. No game sprites embedded. */
'use strict';
const AtlasArt=(()=>{
 const shapes={
 heart:'<path d="M32 53 11 32C-2 14 23 4 32 20 41 4 66 14 53 32Z"/><path d="m20 25 8 8-4 8"/>',
 light:'<path d="M32 13v38M19 26h26M16 9l5 6M48 9l-5 6M8 29h7M49 29h7"/><ellipse cx="32" cy="8" rx="10" ry="4"/>',
 dark:'<path d="m15 12 5 15h24l5-15 4 22-11 18H22L11 34Z"/><path d="m20 34 7 3m17-3-7 3m-11 9h12"/>',
 chest:'<rect x="9" y="24" width="46" height="30" rx="4"/><path d="M9 28v-9q23-20 46 0v9M10 34h44M22 17v36m20-36v36"/><rect x="28" y="30" width="8" height="12" rx="2"/>',
 lamb:'<path d="M19 23C1 4 3 43 19 32M45 23C63 4 61 43 45 32M20 22h24l3 17-10 14H27L17 39Z"/><path d="m24 32 5 3m11-3-5 3m-6 9h6M32 49v8"/>',
 rush:'<path d="m13 9 35 38-6 7L8 17Zm38 0L16 47l6 7 34-37ZM8 42l14 14m20 0 14-14"/>',
 hush:'<path d="M8 45C3 0 61 0 56 45l-8 9H16Z"/><ellipse cx="22" cy="29" rx="5" ry="8"/><ellipse cx="42" cy="29" rx="5" ry="8"/><path d="M24 47q8-9 16 0"/>',
 mega:'<path d="M19 22 5 8l4 28 13 8v10h20V44l13-8 4-28-14 14Z"/><path d="m18 31 10 4m18-4-10 4M26 46h12m-6-6v14"/>',
 void:'<path d="M15 12 30 7l10 9 14 4-4 14 5 15-18 8-11-7-17-5 5-16Z"/><circle cx="24" cy="28" r="5"/><circle cx="42" cy="32" r="3"/><path d="m22 45 7-4 5 7 8-3"/>',
 mother:'<path d="M13 51 18 24Q32 3 46 24l5 27Z"/><path d="M22 27q10-9 20 0M24 33h3m10 0h3M26 44q6-5 12 0"/><path d="m9 53 7-10m39 10-7-10"/>',
 beast:'<path d="M8 44 17 22l-2-14 16 12 17-7 8 17-4 21H17Z"/><path d="m28 30 7 2m11-4 5 2M29 43h21m-15 0v7m8-7v7"/>',
 coin:'<circle cx="32" cy="32" r="24"/><circle cx="32" cy="32" r="18"/><path d="M40 22H28q-10 8 4 10t4 10H24m8-26v32"/>',
 item:'<path d="M25 8h14v12l12 22q5 14-10 14H23Q8 56 13 42l12-22Z"/><path d="M23 15h18M17 39h30m-23 7h7"/><circle cx="37" cy="45" r="2"/>',
 trinket:'<path d="M27 12a6 6 0 1 1 10 0L49 31 32 55 15 31Z"/><path d="m15 31 17 8 17-8M27 12l-4 20 9 23 9-23-4-20"/>',
 star:'<path d="m32 7 7 15 17 3-12 13 2 18-14-8-14 8 2-18L8 25l17-3Z"/>',
 map:'<path d="m7 14 16-6 18 7 16-6v42l-16 6-18-7-16 6ZM23 8v42m18-35v42M14 30l3 4m-3 0 3-4"/>',
 dice:'<rect x="10" y="10" width="44" height="44" rx="8"/><circle cx="22" cy="22" r="3"/><circle cx="42" cy="22" r="3"/><circle cx="32" cy="32" r="3"/><circle cx="22" cy="42" r="3"/><circle cx="42" cy="42" r="3"/>',
 card:'<rect x="15" y="8" width="34" height="48" rx="4"/><path d="m32 20 9 12-9 12-9-12ZM22 15h3m14 34h3"/>'
 };
 const bosses={"Mom's Heart":'heart',Isaac:'light',Satan:'dark','???':'chest','The Lamb':'lamb','Boss Rush':'rush',Hush:'hush','Mega Satan':'mega',Delirium:'void',Mother:'mother','The Beast':'beast','Ultra Greed':'coin','Ultra Greedier':'coin',Mom:'mother','Ultra Pride':'dark'};
 const marks=["Mom's Heart",'Isaac','Satan','???','The Lamb','Boss Rush','Hush','Mega Satan','Delirium','Mother','The Beast','Ultra Greedier'];
 function svg(key,cls='atlas-glyph'){return `<svg class="${cls}" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[key]||shapes.star}</svg>`;}
 function reward(r){const key=/dice/i.test(r.name)?'dice':/card/i.test(r.name)?'card':r.category==='Oggetti'?'item':r.category==='Trinket'?'trinket':'star';return svg(key);}
 return {svg,reward,bosses,marks};
})();
function renderObjectiveBoard(){
 const el=document.querySelector('#objective-marks');if(!el)return;
 if(!progress){el.innerHTML='';return;}
 const character=document.querySelector('#character').value;
 document.querySelector('#marks-context').textContent=character||'Tutti i personaggi';
 el.innerHTML=AtlasArt.marks.map(b=>{
  const rows=catalog.filter(r=>r.bosses.includes(b)&&(!character||r.character===character));
  const done=rows.filter(unlocked).length,active=document.querySelector('#boss').value===b;
  const status=!rows.length?'Nessuna ricompensa associata':done===rows.length?'Ricompense completate':`${done} di ${rows.length} ricompense sbloccate`;
  return `<button class="objective-mark ${rows.length&&done===rows.length?'complete':''}" data-objective="${escapeHTML(b)}" aria-pressed="${active}" aria-label="${escapeHTML(b+': '+status)}" title="${escapeHTML(status)}">${AtlasArt.svg(AtlasArt.bosses[b])}<span>${escapeHTML(b)}</span><small>${rows.length?done+' / '+rows.length:'—'}</small></button>`;
 }).join('');
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-objective]');if(!b)return;const select=document.querySelector('#boss');select.value=select.value===b.dataset.objective?'':b.dataset.objective;limit=48;render();document.querySelector('#results').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});});
