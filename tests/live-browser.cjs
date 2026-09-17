// Self-contained static server + synthetic API: no game/save access.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const root=path.resolve(__dirname,'../dist');
 const server=http.createServer((req,res)=>{
  const name=new URL(req.url,'http://localhost').pathname;
  const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.ATLAS_BROWSER?{channel:process.env.ATLAS_BROWSER}:{})});
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const state={schema:2,status:'running',slot:1,character:'Isaac',frames:300,stage:1,stageType:0,difficulty:1,challenge:0,custom:false,players:1,run:'demo',items:[347],cards:[80],events:[],bridgeVersion:'1.1.0',floorId:'floor-a',bossRushLimit:36000,hushLimit:54000,resources:{coins:15,bombs:1,keys:0,hearts:2,maxHearts:6,soulHearts:2},actives:[{id:347,slot:0,charge:0,battery:0}],room:{index:84,listIndex:0,type:2,clear:true},rocks:[{kind:'tinted',index:20,x:100,y:150}],pickups:[{id:'heart',kind:'heart',subtype:1,x:50,y:50,price:3}],secretCandidates:[{kind:'secret',index:85,status:'candidate',strength:'media',direction:'est',reason:'Due stanze visibili'}],mapMessage:'Indizi qualitativi'};
  await page.route('**/api/**',route=>{
   const url=route.request().url();let json={};
   if(url.includes('/sources'))json={sources:[{id:'demo',label:'Demo',slots:[1,2,3]}]};
   else if(url.includes('/progress'))json={slot:1,version:'Repentance+',unlocked:[],collected:[],hash:'demo',filename:'demo',modified:new Date().toISOString(),checked:new Date().toISOString()};
   else if(url.includes('/live'))json=state;
   return route.fulfill({json});
  });
  await page.goto(`http://127.0.0.1:${server.address().port}`);

  await page.waitForFunction(()=>document.querySelector('#results .card'));
  assert(!(await page.locator('.live-panel').isVisible()),JSON.stringify(errors));
  for(const name of ['live','planner','debug'])assert.equal(await page.locator(`[data-view=${name}] svg`).count(),1);
  await page.locator('#search').fill('Wild Card');await page.locator('#results .card-open').first().click();
  assert((await page.locator('#detail .description-section').textContent()).includes('Ripete'));
  assert(!(await page.locator('#detail').textContent()).includes('Raccolto almeno una volta'));
  await page.locator('#close-detail').click();await page.locator('#reset').click();
  await page.evaluate(()=>{delete notes[610];detail(610);});
  await page.waitForFunction(()=>document.querySelector('#detail .description-section').textContent.includes('Ripete'));
  await page.locator('#close-detail').click();

  await page.locator('[data-view=planner]').click();
  await page.locator('#plan-character').selectOption('Cain');
  assert((await page.locator('#plan-results').textContent()).includes('run previste'));
  assert(!(await page.locator('.catalog').isVisible()));
  await page.locator('[data-view=characters]').click();
  assert(await page.locator('#character-summary .character-icon').count()>20);
  await page.locator('[data-view=challenges]').click();
  assert((await page.locator('#results').textContent()).includes('Come renderla disponibile'));
  await page.locator('[data-view=live]').click();
  for(const [width,height] of [[1920,1080],[1366,768],[1280,720]]){
   await page.setViewportSize({width,height});
   const size=await page.evaluate(()=>({height:document.documentElement.scrollHeight,viewport:innerHeight,bottom:document.querySelector('.live-board').getBoundingClientRect().bottom}));
   assert(size.height<=height+1,JSON.stringify({width,height,...size}));
   assert(size.bottom<=height,JSON.stringify(size));
   const escaped=await page.evaluate(()=>[...document.querySelectorAll('.live-tile .tile-controls')].some(e=>e.getBoundingClientRect().bottom>e.closest('.live-tile').getBoundingClientRect().bottom+1));assert(!escaped,'controls outside tile '+width);
  }
  await page.waitForFunction(()=>document.querySelector('#live-bridge-version').textContent.includes('1.1.0'));
  await page.locator('[data-view=debug]').click();
  assert((await page.locator('#debug-log').textContent()).includes('Cuore rosso'));
  assert((await page.locator('#debug-log').textContent()).includes('Tinted rock'));
  assert((await page.locator('#debug-log').textContent()).includes('3 monete'));
  await page.locator('[data-view=live]').click();
  await page.waitForFunction(()=>document.querySelector('#live-opportunities').textContent.includes('Diplopia + Wild Card'));
  assert((await page.locator('.assistant-resources').textContent()).includes('15'));
  await page.locator('[data-live-details]').first().click();
  assert(await page.locator('#advice-dialog').isVisible());
  await page.evaluate(()=>liveRender(liveSnapshot));
  assert(await page.locator('#advice-dialog').isVisible());
  await page.locator('#advice-dialog [data-ignore-advice]').first().click();
  await page.locator('#advice-dialog .close').click();
  assert(await page.locator('[data-restore-advice]').isVisible());
  await page.locator('[data-restore-advice]').click();
  await page.locator('[data-view=debug]').click();
  await page.evaluate(()=>liveRender({status:'error'}));
  assert(await page.locator('#debug-log').isVisible());
  assert((await page.locator('#debug-log').textContent()).includes('Cuore rosso'));
  await page.locator('#debug-filter').selectOption('pickup');
  assert(!(await page.locator('#debug-log').textContent()).includes('Collegamento:'));
  await page.locator('#clear-debug').click();assert.equal(await page.locator('#debug-log li').count(),0);
  await page.evaluate(()=>pollLive());
  await page.locator('[data-view=live]').click();await page.waitForFunction(()=>!document.querySelector('#live-data').hidden);
  for(const width of [375,768,1440]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${width}`);}
  if(process.env.ATLAS_SCREENSHOT){await page.setViewportSize({width:1280,height:720});await page.screenshot({path:process.env.ATLAS_SCREENSHOT});}
  assert.deepEqual(errors,[]);console.log('PASS browser: live version, shop pickup, map hint, offline log, filters, clear and responsive layout.');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
