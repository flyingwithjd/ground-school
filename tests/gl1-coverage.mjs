// GL1 syllabus/questions remain aligned, glossary links resolve, permanent SRS keys are preserved.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {LESSONS,QUESTIONS,ORAL} from '../data/index.js';
import text from '../data/text/gl1.js';import extra from '../data/text/x/gl1.js';
import {term} from '../js/core/rich.js';
import {COVERAGE} from '../data/coverage-src.js';
const l=LESSONS.gl1,secs=[...text.sections,...extra.sections];
assert.equal(l.questions.length,73);assert.equal(l.oral.length,6);
for(const [prefix,n] of [['gl1-',30],['gl1x-',16],['gl1c-',17]])for(let i=1;i<=n;i++)assert.equal(QUESTIONS[prefix+String(i).padStart(2,'0')].lesson,'gl1');
for(const id of ['gl1-o1','gl1-o2','gl1-o3','gl1x-o1','gl1x-o2'])assert.equal(ORAL[id].lesson,'gl1');
for(const s of secs)for(const m of ((s.body||'')+(s.body2||'')).matchAll(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g))assert.ok(term(m[2]||m[1]),`${s.id}: ${m[0]}`);
for(const [label,rx,taught] of COVERAGE.gl1.items){assert.ok(taught.length);for(const id of taught)assert.ok(secs.some(s=>s.id===id),label+' teaching section '+id);}
assert.equal(COVERAGE.gl1.items.length,19); // grouped headings; first contains design, certification, airworthiness (21 targets)
for(const id of ['gl1c-13','gl1c-14','gl1c-15'])assert.equal(QUESTIONS[id].t,'gl1.ground');
assert.ok(secs.find(s=>s.id==='wind').viz.opts.mode==='taxi');
assert.ok(fs.readFileSync(new URL('../js/core/store.js',import.meta.url),'utf8').includes('const KEY = "ppg.v1"'));
console.log('GL1 PASS: 21 targets / 19 grouped headings, 73 questions + 6 orals, original IDs preserved, all glossary references resolve, taxi question stays GL1, progress key untouched');
