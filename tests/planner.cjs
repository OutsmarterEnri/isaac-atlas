const assert=require('node:assert/strict');
const planner=require('../dist/planner-core.js');const catalog=require('../dist/data/catalog.json');
const plans=planner.plans(catalog,[],'Tainted Eden','hard',[610]);assert(plans[0].rows.some(r=>r.id===610));
for(const plan of plans){assert(!plan.rows.some(r=>r.bosses.includes('Mother')&&r.bosses.includes('The Beast')));assert(plan.rows.every(r=>r.bosses.every(b=>[...plan.bosses,...plan.optional].includes(b))));}
assert(!planner.plans(catalog,[610],'Tainted Eden','hard',[610]).some(p=>p.rows.some(r=>r.id===610)));
const row=catalog.find(r=>r.id===610);assert.equal(planner.eventStatus(row,{character:'Tainted Eden',events:[{boss:'Mega Satan',character:'Isaac'}]},[]).code,'unknown');assert.equal(planner.eventStatus(row,{character:'Tainted Eden',events:[{boss:'Mega Satan',character:'Tainted Eden'}]},[]).code,'observed');assert.equal(planner.eventStatus(row,{events:[]},[610]).code,'confirmed');
console.log('PASS route compatibility, preference ranking, already-unlocked exclusion and event attribution.');
const seq=planner.sequence(catalog,[],'Cain','auto',[445]);
assert.equal(seq.runs[0].id,'beast');
assert(seq.runs.some(r=>r.id==='greedier'));
const ids=seq.runs.flatMap(r=>r.rows.map(r=>r.id));assert.equal(ids.length,new Set(ids).size);
assert(!planner.sequence(catalog,[445],'Cain','auto',[445]).covered.some(r=>r.id===445));
assert(seq.runs.find(r=>r.id==='beast').rows.some(r=>r.id===476));
assert(seq.covered.some(r=>r.id===261));
assert(!planner.sequence(catalog,[],'Cain','normal').covered.some(r=>r.id===171));
assert.equal(planner.sequence(catalog,catalog.map(r=>r.id),'Cain').runs.length,0);
console.log('PASS sequence: priority order, cumulative coverage, no duplicate rewards, difficulty and completed saves.');
