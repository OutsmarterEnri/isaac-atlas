const assert=require('node:assert/strict');
const planner=require('../dist/planner-core.js');const catalog=require('../dist/data/catalog.json');
const plans=planner.plans(catalog,[],'Tainted Eden','hard',[610]);assert(plans[0].rows.some(r=>r.id===610));
for(const plan of plans){assert(!plan.rows.some(r=>r.bosses.includes('Mother')&&r.bosses.includes('The Beast')));assert(plan.rows.every(r=>r.bosses.every(b=>[...plan.bosses,...plan.optional].includes(b))));}
assert(!planner.plans(catalog,[610],'Tainted Eden','hard',[610]).some(p=>p.rows.some(r=>r.id===610)));
const row=catalog.find(r=>r.id===610);assert.equal(planner.eventStatus(row,{character:'Tainted Eden',events:[{boss:'Mega Satan',character:'Isaac'}]},[]).code,'unknown');assert.equal(planner.eventStatus(row,{character:'Tainted Eden',events:[{boss:'Mega Satan',character:'Tainted Eden'}]},[]).code,'observed');assert.equal(planner.eventStatus(row,{events:[]},[610]).code,'confirmed');
console.log('PASS route compatibility, preference ranking, already-unlocked exclusion and event attribution.');
