'use strict';
const pageNames={all:'Sblocchi',saved:'Da sbloccare',characters:'Per personaggio',challenges:'Sfide',live:'Live Assistant',planner:'Run Planner',debug:'Registro live'};
const mainElement=document.querySelector('main');
const livePage=document.createElement('section');livePage.id='page-live';livePage.className='dedicated-page';livePage.append($('.live-panel'));mainElement.prepend(livePage);
const debugPage=document.createElement('section');debugPage.id='page-debug';debugPage.className='dedicated-page';debugPage.innerHTML='<h1>Registro live</h1><p>Osservazioni della Bridge · ultime 200 righe, conservate solo in questa finestra.</p>';debugPage.append($('#debug-panel'));mainElement.prepend(debugPage);$('#debug-panel').open=true;
const plannerPage=document.createElement('section');plannerPage.id='page-planner';plannerPage.className='dedicated-page';plannerPage.innerHTML='<h1>Run Planner</h1>';plannerPage.append($('#planner'));mainElement.prepend(plannerPage);$('#planner').open=true;
const catalogElements=['.heading','.progress-panel','.catalog','.preference-actions','footer'].map(s=>$(s));
function navigatePage(next,history=true){
 if(!pageNames[next])next='all';const changed=view!==next;view=next;
 document.body.dataset.page=next;$('.skip').href=['live','debug','planner'].includes(next)?'#page-'+next:'#results';
 for(const name of ['live','debug','planner'])$('#page-'+name).hidden=next!==name;
 const isCatalog=['all','saved','characters','challenges'].includes(next);for(const el of catalogElements)el.hidden=!isCatalog;
 $('.app-actions').hidden=next==='live';document.body.classList.remove('compact-mode');$('#compact-mode').textContent='Vista compatta';
 $('#breadcrumb').textContent=pageNames[next];
 $('#page-title').textContent={all:'La prossima scoperta.',characters:'Scegli il tuo personaggio.',challenges:'Una sfida, una ricompensa.',saved:'I tuoi sblocchi prioritari.'}[next]||pageNames[next];
 $$('[data-view]').forEach(b=>{const active=b.dataset.view===next;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 if(history&&location.hash!=='#'+next)location.hash=next;
 if(changed&&isCatalog)resetFilters();if(next==='planner')renderPlanner();
}
window.addEventListener('hashchange',()=>navigatePage(location.hash.slice(1),false));
navigatePage(location.hash.slice(1)||'all',false);
// Full text remains available without changing the dashboard's geometry.
const adviceDialog=document.createElement('dialog');adviceDialog.id='advice-dialog';adviceDialog.setAttribute('aria-label','Dettagli live');adviceDialog.innerHTML='<button class="close icon-button" aria-label="Chiudi dettaglio live">×</button><div id="advice-body"></div>';document.body.append(adviceDialog);
adviceDialog.querySelector('button').onclick=()=>adviceDialog.close();
adviceDialog.addEventListener('close',()=>{$('#advice-body').innerHTML='';});
document.addEventListener('click',e=>{const b=e.target.closest('[data-live-details]');if(!b)return;const kind=b.dataset.liveDetails;
 const contents=kind==='tasks'?$('#live-tasks').innerHTML:assistantDetails.get(kind);
 $('#advice-body').innerHTML=contents||'<p>Il segnale non è più disponibile.</p>';adviceDialog.showModal();
});

const taskSummary=document.createElement('div');taskSummary.className='live-task-summary';$('#live-data').append(taskSummary);
const originalLiveRender=liveRender;
liveRender=function(data){originalLiveRender(data);const tasks=$$('#live-tasks .live-task');taskSummary.innerHTML=tasks.length?`<span><strong>${tasks.length} obiettivi di sblocco</strong> · ${tasks.slice(0,3).map(t=>escapeHTML(t.querySelector('strong').textContent)).join(' · ')}${tasks.length>3?' …':''}</span><button data-live-details="tasks">Tutti gli obiettivi</button>`:'';};
