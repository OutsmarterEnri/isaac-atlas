// Synthetic image and progress: no game assets are distributed as fixtures.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.ATLAS_BROWSER?{channel:process.env.ATLAS_BROWSER}:{})});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));const image='/api/art/image/'+'a'.repeat(64)+'.png';
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
 await page.route('**/api/sources',r=>r.fulfill({json:{sources:[{id:'demo',label:'Demo',slots:[1,2,3]}]}}));
 await page.route('**/api/progress?*',r=>r.fulfill({json:{slot:1,version:'Repentance+',unlocked:[],collected:[],hash:'demo',filename:'demo',modified:new Date().toISOString(),checked:new Date().toISOString()}}));
 await page.route('**/api/live',r=>r.fulfill({json:{status:'not_connected'}}));
 await page.route('**/api/art/manifest',r=>r.fulfill({json:{version:1,rewards:{584:{url:image,width:1,height:1}},marks:{Hush:{url:image,width:1,height:1,crop:[0,0,1,1]}}}}));
 await page.route('**/api/art/image/*',r=>r.fulfill({contentType:'image/png',body:png}));
 await page.goto(process.env.ATLAS_URL||'http://127.0.0.1:8769');await page.waitForSelector('.card');await page.locator('#search').fill('Spindown Dice');
 await page.waitForFunction(()=>document.querySelector('#results img')?.naturalWidth===1);assert.equal(await page.locator('.official-mark').count(),1);
 await page.locator('.card-open').click();assert(await page.locator('#detail .reward-art img').isVisible());await page.locator('#close-detail').click();
 // Force a missing image: original SVG must become visible again.
 await page.locator('#results img').evaluate(e=>e.dispatchEvent(new Event('error')));assert.equal(await page.locator('#results img').count(),0);assert(await page.locator('#results .reward-art>svg').isVisible());
 await page.route('**/api/art/status',r=>r.fulfill({json:{status:'ready',message:'Immagini di test pronte',rewards:1,marks:1}}));
 let imported=false;await page.route('**/api/art/import',r=>{imported=true;assert(r.request().headers()['x-atlas-token']);return r.fulfill({json:{status:'importing'}});});
 await page.locator('#open-settings').click();await page.locator('#import-art').click();await page.waitForFunction(()=>document.querySelector('#art-status').textContent==='Immagini di test pronte');assert(imported);assert.deepEqual(errors,[]);
 console.log('PASS local image rendering, official mark crop, missing-image fallback and tokenized import UI.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
