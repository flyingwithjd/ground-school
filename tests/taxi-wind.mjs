// Regression: AFH Ch 2 Fig 2-15 positions on the actual hinged meshes, wind, stable controls, fit, continuous animation, visibility pause, reduced motion and disposal.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire('/workspace/pgs-build/')('playwright-core');
const base=process.env.BASE||'http://localhost:8765/index.html';
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
try {
 for(const [w,h] of [[744,1133],[390,844],[1024,768]]) {
  const c=await b.newContext({viewport:{width:w,height:h}}),p=await c.newPage();
  await p.addInitScript(()=>localStorage.setItem('sqs.access','1'));
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'||m.text().includes('glossary missing')) errors.push(m.text())});
  await p.goto(base+'#/lesson/gl1/wind'); await p.waitForSelector('.tw canvas');
  await p.evaluate(()=>window.scrollTo(0,document.querySelector('.tw').getBoundingClientRect().top+scrollY-70));
  await p.waitForTimeout(2100);
  const snap=()=>p.evaluate(()=>{const s=document.querySelector('.tw .stage');return {...s.__taxi(),w:s.clientWidth,h:s.clientHeight}});
  const positions=()=>p.locator('.tw .ctrl .chip').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y+scrollY,r.width,r.height]}));
  const rows=await positions();
  const cases=[['hl',-1,0],['hr',1,0],['head',0,0],['tl',1,1],['tr',-1,1],['tail',0,1]];
  const first=await snap();
  for(const [key,a,e] of cases){
   await p.locator(`.tw .chip[data-v="${key}"]`).click();await p.waitForTimeout(1700);
   const s=await snap();assert.equal(s.cur,key);assert.equal(s.ail,a);assert.equal(s.elev,e);
   // Hinge quaternions: ailerons deflect oppositely; the elevator is neutral in headwind and trailing-edge down in tailwind.
   assert.ok(Math.abs(s.quats.ailerons[0][2]-(-a*0.17294463276))<0.00001,key+' left aileron');
   assert.ok(Math.abs(s.quats.ailerons[1][2]-(a*0.17294463276))<0.00001,key+' right aileron');
   assert.ok(Math.abs(s.quats.elevator[0][2]-Math.sin(e*16*Math.PI/360))<0.00001,key+' elevator');
   assert.ok(s.bounds[0]>=0 && s.bounds[1]>=0 && s.bounds[2]<=s.w && s.bounds[3]<=s.h,`${w} ${key} whole airplane ${s.bounds}`);
   assert.deepEqual(await positions(),rows,`${w} picker jumped`);
   assert.equal(await p.locator('.tw .chip[aria-pressed="true"]').count(),1);
   const ph1=await p.locator('.tw canvas').evaluate(e=>e._flowPhase);await p.waitForTimeout(200);
   const ph2=await p.locator('.tw canvas').evaluate(e=>e._flowPhase);assert.notEqual(ph1,ph2,'wind streaks must move');
   assert.equal(await p.locator('.tw .explain .gl[data-term="elevator"]').count()>0,true,'caption elevator glossary');
   if(w===744 && ['hl','tl','tr'].includes(key)){
    await p.evaluate(()=>window.scrollTo(0,document.querySelector('.tw').getBoundingClientRect().top+scrollY-70));
    await p.screenshot({path:`screenshots/gl1_taxi_${key}_744x1133.png`});
   }
  }
  // Regression for the reported stall: wind must still move well after eight seconds with no interaction.
  await p.locator('.tw .stage').scrollIntoViewIfNeeded(); await p.waitForTimeout(8500);
  const late = await snap(); await p.waitForTimeout(450); const later = await snap();
  assert.ok(later.frames > late.frames && later.windTick !== late.windTick,'wind must continue after >8 seconds');
  // IntersectionObserver: no frames while the whole visual is offscreen, then resumes on return.
  await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight)); await p.waitForTimeout(700);
  const off = await snap(); await p.waitForTimeout(450); assert.equal((await snap()).frames,off.frames,'offscreen must pause');
  await p.locator('.tw .stage').scrollIntoViewIfNeeded(); await p.waitForTimeout(450);
  const on = await snap(); await p.waitForTimeout(450); assert.ok((await snap()).frames>on.frames,'onscreen must resume');
  // Deterministic hidden-tab event exercises the same handler even under headless Chromium.
  await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});
  const hidden = await snap(); await p.waitForTimeout(450); assert.equal((await snap()).frames,hidden.frames,'hidden tab must pause');
  await p.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))}); await p.waitForTimeout(450);
  const shown = await snap(); await p.waitForTimeout(450); assert.ok((await snap()).frames>shown.frames,'visible tab must resume');
  // All six cases from behind, side, top-down and near-end-on views. Direction stays readable in its reserved band.
  for(const [key] of cases) {
   await p.locator(`.tw .chip[data-v="${key}"]`).click();
   for(const [az,el,name] of [[180,12,'behind'],[-90,88,'top'],[-90,18,'side'],[key==='hl'?-45:45,2,'end-on']]) {
    await p.evaluate(([az,el])=>document.querySelector('.tw .stage').__taxiView(az,el),[az,el]);
    await p.locator('.tw .stage').scrollIntoViewIfNeeded(); await p.waitForTimeout(180);
    const state=await snap();assert.ok(state.bounds[0]>=0 && state.bounds[1]>=54 && state.bounds[2]<=state.w && state.bounds[3]<=state.h,`${w} ${key} ${name} whole plane`);
    const hud=await p.locator('.tw-wind-hud').boundingBox(), stage=await p.locator('.tw .stage').boundingBox();
    assert.ok(hud.x>=stage.x && hud.y>=stage.y && hud.x+hud.width<=stage.x+stage.width+1 && hud.y+hud.height<=stage.y+stage.height,'wind arrow stays in frame');
    assert.equal(state.ribbons,42);assert.deepEqual(await positions(),rows,'orbit must not move controls');
    if(w===744 && ((key==='tl'&&name==='behind')||(key==='hl'&&name==='top')||(key==='tr'&&name==='side'))){
     await p.evaluate(()=>window.scrollTo(0,document.querySelector('.tw').getBoundingClientRect().top+scrollY-70));
     await p.screenshot({path:`screenshots/gl1_taxi_wind_${key}_${name}_744x1133.png`});
    }
   }
  }
  // Start wind again and measure the capped drawing rate.
  await p.locator('.tw .chip[data-v="hl"]').click();await p.locator('.tw .stage').scrollIntoViewIfNeeded();
  const t0=Date.now(),f0=(await snap()).frames;await p.waitForTimeout(1100);const rate=((await snap()).frames-f0)*1000/(Date.now()-t0);assert.ok(rate<=31.5,`frame cap ${rate}`);
  // Repeated selections reuse cue geometry rather than accumulating it.
  for(let i=0;i<24;i++) await p.locator(`.tw .chip[data-v="${i%2?'tr':'hl'}"]`).click();
  await p.waitForTimeout(1800);assert.deepEqual((await snap()).memory,first.memory,'geometry/texture leak');
  await p.emulateMedia({reducedMotion:'reduce'});await p.locator('.tw .chip[data-v="tl"]').click();await p.waitForTimeout(1700);
  assert.equal((await snap()).ail,1);assert.equal((await snap()).elev,1);
  const a=await snap();await p.waitForTimeout(500);assert.equal((await snap()).frames,a.frames,'reduced-motion idle');
  await p.goto(base+'#/lesson/gl1/ground');await p.waitForSelector('h2');assert.equal(await p.locator('.tw').count(),0,'unmounted on navigation');
  if(w===744) {await p.locator('h2').scrollIntoViewIfNeeded();await p.screenshot({path:'screenshots/gl1_ground_operations_744x1133.png'});}
  console.log(`PASS ${w}x${h}: 6 poses, mesh quaternions, whole plane, fixed controls, continuous wind >8s, offscreen/hidden pause/resume, 24 orbit cases, ${rate.toFixed(1)} fps, no geometry/texture growth, reduced motion, unmount`);
  await c.close();
 }
 assert.deepEqual(errors,[]);console.log('taxi-wind ALL PASS');
}finally{await b.close()}
