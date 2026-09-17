/* Optional integration suite. npm install --no-save playwright; npx playwright install chromium */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const url=process.env.ATLAS_URL||'http://127.0.0.1:8765';
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.ATLAS_BROWSER?{channel:process.env.ATLAS_BROWSER}:{})});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 // Synthetic progress only; no user's unlock data required.
 const progress=slot=>({slot,version:'Repentance+',unlocked:slot===1?[1,2]:[],collected:[],hash:'fixture-'+slot,filename:'synthetic.dat',modified:new Date().toISOString(),checked:new Date().toISOString()});
 let state={status:'running',slot:1,character:'Tainted Eden',frames:3600,stage:2,difficulty:1,challenge:0,custom:false,players:1,run:'test-run',items:[451],cards:[]};
 await page.route('**/api/sources',r=>r.fulfill({json:{sources:[{id:'fixture-profile',label:'Profilo sintetico',slots:[1,2,3]}]}}));
 await page.route('**/api/progress?*',async r=>{const slot=Number(new URL(r.request().url()).searchParams.get('slot'));await r.fulfill({json:progress(slot)});});
 await page.route('**/api/live',r=>r.fulfill({json:state}));
 await page.goto(url);await page.waitForFunction(()=>document.querySelector('#total-unlocked').textContent==='2');
 await page.waitForFunction(()=>document.querySelector('#live-tasks').textContent.includes('Wild Card'));
 assert.equal(await page.locator('#live-timer').textContent(),'00:02:00');
 await page.locator('[data-view=live]').click();await page.locator('[data-live-details=tasks]').click();
 const wild=page.locator('#advice-dialog .live-task').filter({hasText:'Wild Card'});await wild.locator('input').check();await page.waitForTimeout(1800);assert(await wild.locator('input').isChecked());
 await page.locator('#advice-dialog .close').click();await page.locator('#save-slot').selectOption('2');await page.waitForFunction(()=>document.querySelector('#total-unlocked').textContent==='0');assert.equal(await page.locator('.live-task').count(),0);await page.locator('#follow-live').click();await page.waitForFunction(()=>document.querySelector('#live-tasks').textContent.includes('Wild Card'));
 state={...state,status:'paused'};await page.waitForFunction(()=>document.querySelector('#live-status').textContent==='In pausa');
 state={...state,status:'stale'};await page.waitForFunction(()=>document.querySelector('#live-data').hidden);assert.equal(await page.locator('.live-task').count(),0);
 state={...state,status:'running',custom:true};await page.waitForFunction(()=>document.querySelector('#live-message').textContent.includes('Run speciale'));assert.equal(await page.locator('.live-task').count(),0);
 state={...state,custom:false,run:'second-run'};await page.waitForFunction(()=>document.querySelector('#live-tasks').textContent.includes('Wild Card'));assert.equal(await page.locator('#live-tasks .live-task').filter({hasText:'Wild Card'}).locator('input').isChecked(),false);
 for(const width of [375,768,1440]){await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow '+width);}
 if(process.env.ATLAS_SCREENSHOT){await page.setViewportSize({width:1440,height:1050});await page.screenshot({path:process.env.ATLAS_SCREENSHOT,fullPage:false});}
 // Generic public build must work without EID or game images.
 await page.locator('[data-view=all]').click();await page.locator('#search').fill('Wild Card');await page.locator('#results .card-open').click();assert((await page.locator('#detail').textContent()).includes('Casi d’uso'));await page.keyboard.press('Escape');
 // Multiple profiles require a deliberate choice; per-profile favourites must stay distinct.
 await page.route('**/api/sources',r=>r.fulfill({json:{sources:[{id:'a',label:'Profilo A',slots:[1]},{id:'b',label:'Profilo B',slots:[1]}]}}));
 await page.reload();await page.locator('#save-source').selectOption('a');await page.waitForSelector('#results .card');await page.locator('.bookmark').first().click();assert.equal(await page.locator('#saved-count').textContent(),'1');await page.locator('#save-source').selectOption('b');await page.waitForFunction(()=>document.querySelector('#sync-status').textContent.includes('sincronizzato'));assert.equal(await page.locator('#saved-count').textContent(),'0');await page.locator('#save-source').selectOption('a');await page.waitForFunction(()=>document.querySelector('#saved-count').textContent==='1');
 assert.deepEqual(errors,[]);console.log('PASS live UI, slot isolation, timer, pause/stale, manual checklist, special runs, profiles, favourites, responsive layout, details, no JS errors.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
