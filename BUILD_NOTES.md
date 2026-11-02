# Build notes: Squawk School (formerly Private Pilot Ground School), Stage 1 (v1)

These notes are updated as work goes, so an interruption loses nothing. The times are America/Boise.

## Inventory at resume (2026-10-31, 5:15 PM MDT)

### Done
- **Engine:**
  - SM-2 SRS (js/core/srs.js) in localStorage
  - mastery and blind-spot map (progress.js)
  - confidence tap
  - home screen with due reviews, weakest areas and next lesson
  - JSON export/import and reset
  - routes: lesson, review, practice, drill, map, tools, oral, sim, glossary, settings, about
- **Lessons with full content:**
  - GL1–GL5
  - GL6 (mixed stage check)
  - FL1–FL7 (prep and debrief cards, FL7 oral)
  - Totals: 267 MCQ, 33 oral. validate.mjs reports 0 bad.
- **Visualizations:**
  - aoa, asi, axes, controls, densalt, dragcurve, engine4, forces, fuelsys, groundeffect, groundref, instruments, leftturn, loadfactor, pattern, perf, pitotstatic
  - plane3d (Three.js, lazy, IO-paused)
  - rightofway, slip, stability, structure, wb
- **Airport visualizations, written this session and not yet browser-tested:**
  - compass.js (runway numbering and quiz)
  - rwymarks.js
  - holdmarks.js
  - signs.js (learn and drill)
  - lights.js (PAPI/VASI/runway/taxi/beacon/PCL)
  - segcircle.js
  - lightgun.js

### Remaining (in this order)
1. **Airport module ap1–ap7:** data/modules/airport.js plus data/text/ap*.js
2. **Wind wx1–wx4:** xwind (components + WCA) viz, wake viz; reuse densalt, slip, groundref
3. **Regs rg1–rg3, emergencies em1–em2, radio rc1, ADM ad1–ad2, flows fw1, mnemonics mn1**
4. **GL7/GL8 Stage 2 preview:** METAR/TAF/FB decoders, front cross-section, short theory
5. **Glossary:** data/glossary.js is EMPTY. About 70 keys are referenced; each needs a cited definition.
6. **LICENSES:** add Plex OFL, GSAP license; README
7. **Testing:** validate, smoke, screenshots at 1024×1366, 1366×1024, 390×844, 1440×900; SRS reload test
8. **Final report**

## Decisions
- **3D airport is deferred.** Steering 4 says to use 3D only where depth teaches. The airport is top-down SVG.
- **Sign and light colors.** Airport signs and lights use their real colors, because the color is the message. This is the only exception to the single-accent rule.
- **VASI is shown as states only (low/on/high).** The AIM gives no transition angles, so none are invented. PAPI uses the PHAK Fig 14-30 angles.
- **Light gun:** the in-flight wing-rock acknowledgment is not in the local AIM 4-3 text, so it was left out.

## Progress log

- 5:20 PM MDT: lightgun fixed (AIM 4-3-13 only). airport module ap1–7 data+text written (95 MCQ, 11 oral); facts verified against AIM 2-3 text.
- 5:25 PM MDT: airport routes smoke-tested at 1366×1024, no console errors. tests/smoke.mjs now loads about:blank before each route (fixes screenshots that showed the previous route).
- 5:26 PM MDT: wind wx1–4 data+text written; new viz xwind.js (components + WCA mode) and wake.js (land/depart/crosswind); ACS codes remapped to real element meanings.

### 5:33 PM MDT
- rc1 written (15 MCQ, 2 oral) + data/text/rc1.js using radio viz; smoke OK. Removed unverifiable "squawk 7600" (not in local AIM 4-2/4-3 text).
- New viz js/viz/mnemo.js: tap-to-unpack mnemonic sets (ATOMATOFLAMES, FLAPS, ARROW, AV1ATE, 61.89 limits, IMSAFE, PAVE, DECIDE, 3P, five attitudes, ABCDE). Learn/Recall modes.
- rg1–rg3 written (15/12/15 MCQ, 2/1/2 oral) from local 14 CFR text. AV1ATE "V" (VOR check) stated as IFR-only with no interval (91.171 not in refs).

### 5:39 PM MDT
- em1–em2 written (15/16 MCQ incl. ordering; 2/2 oral) from POH Sec 3 (NAV III / G1000 edition, 172SPHBUS-00). New viz js/viz/chairfly.js (tap checklist steps in order, timed; drills roll/after/restart/forced/efire/elfire/secure/bstart).
- ad1–ad2 written (14/12 MCQ; 2/1 oral) from PHAK Ch 2. New viz js/viz/attitude.js (name-the-attitude drill, made-up example thoughts labeled).
- fw1 (15 incl. 5 ordering; 1 oral) from POH Sec 4; mn1 (10; 1 oral) using mnemo multi-set.
- Totals now 549 MCQ / 65 oral, 0 bad. Phone smoke OK for fw1/mn1/em1.
- NEXT: GL7/GL8 Stage 2 preview, glossary, licenses/README, screenshots, SRS reload test.

### 5:48 PM MDT
- GL7 Weather Theory (30 MCQ / 3 oral, 7 sections) and GL8 Aviation Weather Services (30 / 3, 6 sections) written as Stage 2 preview from PHAK Ch 12–13 and AWH Ch 3, 26, 27.
- New viz: metar.js (tap-to-decode METAR/TAF/FB using the PHAK's own example strings, labeled "example, not current weather"), front.js (cold/warm front cross-section, ahead/passing/behind readout from PHAK 12), cloudbase.js (temp/dew point convergence, spread ÷ 4.4 × 1,000).
- PHAK quirks handled: TAF example "1408KT" is printed with 4 digits (decoder explains); FB Denver 12k/18k values not used because the figure extraction was ambiguous; only the groups the PHAK explains (AMA 6000 2714, DEN 9000 2321-04, 9900, 731960).
- data/glossary.js written: 95 terms, all [[refs]] resolve. validate.mjs now normalizes keys and plurals the same way rich.js does.
- Totals: 609 MCQ, 71 oral, 0 bad, 0 missing glossary.

### 6:03 PM MDT: finish pass
- Glossary fixes checked against the refs: VASI (red over white, PHAK Glossary), PAPI (2 or 4 lights, two white and two red, PHAK Glossary), pilot-controlled lighting (7/5/3 clicks within 5 s, AIM TBL 2-1-8), TPA (AC 90-66C, propeller-driven), detonation (PHAK wording), plus source fixes for hot spot, reversed command, VA and UNICOM.
- Front viz: caption moved out of the stage (capin), labels scale 1.8× on narrow screens, WARM AIR moved, empty readouts hidden. Cloudbase: caption out of the stage, comma formatting, >12,000 ft case.
- .src now wraps (inline-block) so long figure sources don't overflow on phones.
- BUG fixed: #/oral/all had an empty pool because "all" was treated as a lesson id.
- GSAP <script> removed from index.html (it was never used, saves 76 KB). The file stays vendored. Added LICENSES/IBMPlexMono-OFL.txt and GSAP-NOTICE.txt, plus README.md.
- tests: routes.mjs (187 routes), smoke.mjs now opens a fresh page per route (one long-lived tab hung swiftshader after several WebGL scenes), srs-persist.mjs (SRS state identical after reload), shots.mjs (final screenshots).
- Full smoke: 187/187 routes, no console errors. Validate: 609 MCQ / 71 oral / 0 bad / 0 missing glossary.

### 2026-10-31 evening MDT: 3D part-switch lag fix (user report: ~1 fps when tapping parts on iPhone, orbit smooth)
- ROOT CAUSE (js/viz/planestage.js): the render loop set `raf = null` at the start of each frame, then code run inside the frame
  (`S.pose()`, `S.setAttitude()`, OrbitControls "change") called `kick()`, which saw no pending frame and scheduled a second loop;
  the loop's own tail then scheduled another. Every frame doubled the number of live render loops, so each part switch
  (camera tween + pose animation) piled up hundreds of renders per frame. Orbiting by finger was smooth because the drag
  events call kick() outside the loop. Axes of flight (fl2) was worse: its constant rocking animation kicked every frame, so loops grew without limit.
- FIX: single-loop guard (`inLoop` flag; kick() never schedules while a frame is running or one is pending; the tail schedules
  at most once; kick() is a no-op while off-screen). Also warm up the accent-line and light-sprite shader programs at mount with one invisible
  draw (0 instances / 0 opacity) and set `renderer.debug.checkShaderErrors = false`, which removes a ~100 ms first-tap compile/link stall.
  setAccent reuses one Vector3 instead of allocating per frame.
- Same pattern hardened elsewhere: base.js loop() tail now never double-schedules; drawOn() stops when its element was removed
  (SVG scenes that redraw on chip taps, e.g. structure.js, no longer keep stale draw-on loops running); plane3d animatePose snaps under reduced motion.
  All 3D visuals share planestage.js, so plane3d (explore + tour), axes and controls (primary + trim/flaps) all get the fix.
- MEASURED (playwright, 390x844 @3x, isMobile, CPU throttle 4x, swiftshader; frame intervals while the switch animates):
  before: tap Wings → 8 frames in 1.8 s (p95 533 ms), 1,032 rAF calls; the next tap got 1 frame, then the page stalled. Axes page never settled.
  after: tap Wings/Empennage/Powerplant/Ailerons → p50 16.7 ms, p95 17–67 ms, ~150–210 rAF calls (same as orbit's ~150). Orbit unchanged (16.7 ms).
  At 6x throttle the results are the same. Profiling script: /workspace/prof/prof.mjs (box only).
- Tests: validate 609 MCQ / 71 oral / 0 bad; smoke 187/187 desktop + 18 phone-size routes, no console errors; reduced-motion check OK.
- Seen, not fixed: on phone the "Wings" caption sits on top of the bottom-right "Span … length …" corner label in plane3d.

### 2026-10-31, ~8:30 PM MDT: parts explorer UI fixes (after an iPhone test)
- 172S part buttons: both rows now act as one set, so exactly one button is lit and it matches the view (aria-pressed too). Tapping the lit button again, or a quick tap on empty space in the 3D view, clears back to the default view. Orbit drags, long presses (>450 ms) and pinches never pick.
- Span/length moved to the top-right corner on two lines, so it can't collide with the part title. Top corners are capped at half the width each and wrap instead of overlapping. Chip hover only on hover-capable devices (no sticky hover after a tap).
- Same stale-button bug fixed in trim/flaps (Show buttons follow the trim wheel and flap lever) and load factor (bank buttons light only when the slider sits on that bank).
- Cache busting: run `node tools/stamp-version.mjs` before every deploy. It puts one content-hash version on every module import, the CSS, the app entry and the import map.
- New tests: tests/parts-ui.mjs (DESELECT=1 for the deselect checks), tests/overlap-audit.mjs (every route, corner/caption overlap at W px).

### 2026-10-31, ~9:40 PM MDT: major-component highlights follow PHAK Ch 3
- Wings = wing + struts + ailerons + flaps + fuel tank outlines (shown with ailerons and flaps slightly deflected so they read as separate surfaces).
- Empennage = vertical + horizontal stabilizer, rudder, elevator, elevator trim tab (no rudder tab on the 172S); shown slightly deflected. Tail cone stays with Fuselage.
- Powerplant = engine + cowling + propeller; the cowling is drawn as an outline (faces hidden) so the engine shows through.
- Landing gear = both mains, nose gear/strut, wheel fairings (unchanged). Fuselage = fuselage + wing-root fairing (unchanged).
- Kicker for every major component is now "Major component"; the text below lists what it includes. Part buttons still light only their own part.

### 2026-10-31, ~9:55 PM MDT: lesson pager + fuselage construction rebuild
- Lesson pager (every lesson section): two equal cells, each with a small mono PREVIOUS / NEXT label over a title that wraps to 2 lines and then ends in an ellipsis. Next is the blue cell on the right; on the first section the left cell is empty; on the last it reads DONE → Back to course. They can no longer overlap at any width.
- Fuselage construction (js/viz/structure.js, #/lesson/gl1/1) rebuilt as a 3/4 view of a tapered fuselage. Blue = carries the load, gray dashed = shape/covering only, with a legend.
  Truss: longerons + vertical/horizontal struts + diagonal struts (triangles), fabric ghosted and labeled not structural; end view square with corner longerons.
  Monocoque: blue stressed skin with gray formers/bulkhead rings, no lengthwise members; "Show a dent" adds a dent and dashes the shell (PHAK: a dented can collapses). End view: ring only.
  Semimonocoque: skin + bulkheads/formers + stringers all blue; end view ring with stringer dots; "used on the 172" (C172S POH Sec 7).
  Callouts are sized in screen pixels (~11.5 px) so they stay legible on a phone; one-line load statement is the caption label. Draw-on respects reduced motion.
- PHAK 25C (Ch 3) names longerons/struts for truss and bulkhead, formers, stringers, skin for (semi)monocoque; it does not name Pratt/Warren, so neither does the visual.
- overlap-audit.mjs now also checks the pager (no overlap, no spill, no clipped label) and every fuselage type (+dent) for overlapping or <10 px callouts. 0 problems at 360 and 430 px.

### 2026-10-31, ~11:30 PM MDT: exaggerated control-surface deflection (feedback: "can't see the ailerons moving" on Roll)
- axes.js: cause → effect loop (surface deflects 28° visual, then the airplane rotates; surface neutral, attitude holds; opposite; back to level). Deflected surface gets a blue face tint (planestage `tint()`) plus pinned "▲ UP / ▼ DOWN / RIGHT" tags at the trailing edges; caption reads e.g. "Right aileron UP · left aileron DOWN / Rolling right". Roll now viewed from behind (right wing on screen right). Explain text per axis (PHAK 6) + "Surface movement exaggerated for clarity." Reduced motion: one snapped pose. Same single rAF loop (tags positioned inside the frame callback).
- controls.js: full yoke/pedal = 28° visual on all three surfaces, deflected ones tinted, exaggeration note. plane3d.js: aileron/elevator/rudder poses 25°, wings/empennage 18°.
- Tests: validate 609/71/0 bad; smoke 187 desktop + 5 phone routes no errors; parts-ui DESELECT PASS; overlap-audit 360 px 0 problems.

### 2026-10-31, late evening MDT: full 19-lesson ground syllabus (content expansion)

- 2026-11-01 rebase onto b16e75f (trim wheel on the left side, larger; trim wheel overlaid in the stage, elevator floats opposite the tab via one shared animator, cause-effect caption; app.css union-merged; vertical trimWheel, forward = nose down, close-up tab view; trim wheel moves only the tab, opens on the right side, tab tinted; yoke pad elev = -y; flaps flapTo tween + show() `cur` guard; trim tab highlighted alone, viewed from the right via planestage `tailR`): controls/axes/plane3d/planestage kept from main. No yoke, pad or trim-tab view added in this branch (emergflow mentions the trim tab in text only). Trim wording aligned with 962acb3: gl2 Trim text and gl2-05 explanation now say the wheel moves only the tab and the elevator floats the opposite way only in flight from the air load on the tab; emergflow linkage line reworded; new question gl2c-29 (what moves when you roll trim on the ground). New gl2 paragraph "Why tab up means nose-down trim" (PHAK 6 Fig 6-20: tab moves the elevator, not the airplane) and question gl2c-30. Total 1,459 questions. Smoke caught x/gl3 wake viz opened with an invalid mode ("takeoff"); fixed to "dep". Same rule applied app-wide in base.js frame().caption(): caption label and headline are updated in place, so the underline draws on once per visual and no longer replays on slider or chip changes (checked on gl13 compass and gl14 VOR: same element, new text).
- **Scope:** every content item of a 19-lesson, four-stage Part 141 Appendix B private pilot ground course is now taught: explanation (cited inline, FAA sources only), 3 or more multiple-choice questions, and oral items per lesson. Mapped to FAA-S-ACS-6C. Not tailored to one student or school; no syllabus text copied.
- **Stage 1 (GL1–GL6):** supplements for GL1–GL5 (atmosphere, airports, performance, stall chart, runway factors, DA chart, wind components, reversed command, 91.103) plus coverage batches gl1c–gl5c. GL6 stage check.
- **Stage 2 (GL7–GL12):** weather theory and services (fronts, pressure measurement, Coriolis, briefings, G-AIRMET/SIGMET/convective SIGMET, FB, prog charts, datalink age), emergencies, airspace (SUA, TFR, MTR, TRSA, LAA), regulations (Parts 1/43/61/71/91/141, NTSB 830, AIM, P/CG, eCFR, ACs, ACS). GL12 stage check.
- **Stage 3 (GL13–GL18):** flight instruments, navigation, night operations, ADM, aeromedical. GL18 stage check.
- **Stage 4 (GL19):** end-of-course exam, 80% to pass, misses fed to review.
- **New visuals:** airspace, altimeter, approachillusion, crashenergy, emergflow, gyro, hypoxia, inopflow, lapse, latlong, medexpiry, nightclock, nightvision, poslights, riskmatrix, suachart, vfrmins, vor, windtri, workload, compasserr (compass turning and acceleration errors, replacing the runway-numbering dial in GL13) (shared screen-px helpers in kit.js). Rebuilt with screen-px labels: groundeffect, leftturn, fuelsys, pitotstatic, dragcurve.
- **Coverage:** data/coverage-src.js lists each item with a match pattern; tools/build-coverage.mjs writes data/coverage.json for #/coverage. Result: 366 items, 366 good (a section teaches it and 3+ questions test it), 0 thin, 0 missing.
- **Pre-solo written:** PRESOLO_TOPICS fixed. 11 topic ids didn't exist, so those topics had silently dropped out of the pool; now 29 topics, 137 questions.
- **Tests:** validate.mjs now also fails on duplicate ids, unknown topics, a stale or missing coverage.json, broken coverage links, and pre-solo topics without questions. Totals: 1,457 questions / 130 oral items.
- **Question ids:** new ids (glNc-NN) are permanent; no existing id was changed, so saved review progress ("ppg.v1") carries over.

#### Superseded references (noted briefly in the lessons, current practice taught)
- AC 00-6 / AC 00-45 → Aviation Weather Handbook FAA-H-8083-28.
- World aeronautical charts discontinued (2015–2016). Sectionals and TACs are on a 56-day cycle (PHAK 25C still says six months).
- TIBS largely discontinued. Flight Service is run by Leidos (1-800-WX-BRIEF, 1800wxbrief.com).
- Flight Watch / EFAS 122.0 ended in 2015 (JO 7210.887); use FSS frequencies or 122.2.
- Flight plans are filed on FAA Form 7233-4; proposals are kept 2 hours (PHAK says 1 hour).
- Local Airport Advisory is now Alaska-only (AIM 3-5-1, 4-1-9).
- Weather depiction chart retired; not taught beyond that note.
- NOTAM is "Notice to Airmen" again (Feb 2025). The AIM now says "Gulf of America".
- AFH 3C chapter numbers: emergencies ch 18, night ch 11. AC 60-22 is current for ADM.
- BasicMed needs a medical held after July 14, 2006. Medical durations are taught in calendar months (61.23).

#### Left out or labeled illustrative (not verifiable from FAA sources)
- nightclock example times, workload curve values, and the pitot-static and drag-curve models are illustrative and labeled as such.
- CVA (controlled visual approach) items come from the ACS wording only.
- Weather depiction chart content not taught (retired).
- No TIBS phone numbers or Flight Watch frequencies.
- No waiting period after blood donation (not confirmed in the PHAK text). No AIM paragraph numbers that couldn't be confirmed against the live AIM (chapter-level citation used instead).

#### Verified facts by lesson (working notes)
##### GL13 verified (PHAK 8 lines 19953-23590; POH)
- altimeter 75 ft check; 1 inHg~1000ft; 29.94->29.69 = 250 ft; hot to cold; mountain 1,000+ ft high; 91.121 100 NM, 29.92 at/above 18,000
- VSI lag 6-9 s, IVSI accelerometers, off-zero = use as zero
- TAS +2%/1000 ft; VA not marked
- blockages per PHAK; alt static 172S: valve below throttle, max 4 kt/30 ft windows closed (POH Sec 3/7, cal table Sec 5)
- gyro: precession 90 deg; vacuum 4.5-5.5 inHg; AI limits 100-110 bank / 60-70 pitch (some); HI ~55/55 some; HI drift up to 15 deg/hr earth rotation; reset ~15 min
- standard rate 3 deg/s; slip ball inside; skid outside
- compass: 18 deg bank pivot freedom; 15 + half latitude; ANDS; variation/deviation example TC180+10W=190, dev -2=188
- POH: alternator side off -> compass deviations up to 25 deg
##### GL14 verified
- Sectional 1:500,000 (1 in=6.86 NM ~8 SM); TAC 1:250,000 (3.43 NM ~4 SM); WAC 1:1,000,000 (13.7 NM) DISCONTINUED 2015-2016 (FAA Charting Notice EVCG 15-02; Fed Reg 2015-15271)
- Sectionals/TACs updated every 56 days (CUG) — PHAK 25C still says semiannually (superseded)
- MEF: highest elevation in quadrant (30' x 30'), rounded up to 100 ft (CUG)
- 15 deg/hr; time zones; UTC conversion EST+5 CST+6 MST+7 PST+8 (PHAK 16)
- 48 states 25-49 N, 67-125 W
- wind triangle example TC 090, wind 045/40, TAS 120 -> WCA 14 L, TH 076, GS 88 (PHAK 16)
- antennas: never approach closer than 500 ft above tallest (PHAK 16)
- VOR 108.0-117.95 MHz; ~40-45 mi at 1,000 AGL; classes T 25/12,000; L 40 below 18,000; H ...; dot ~2 deg (PHAK Fig 16-29)
- VOR checks: VOT 0 FROM/180 TO; +/-4 ground/VOT, +/-6 airborne, dual 4 deg (AIM 1-1-4; PHAK)
- DME slant range; 6,076 ft over station ~1 NM
- RNAV/GPS CDI en route full scale 5 NM (PHAK) ; RAIM 5 sats or 4+baro to detect; 6 / 5+baro to isolate; GPS 24 sats 6 planes
- VFR waypoints VPxxx five letters, not for ATC comm (PHAK)
- Lost: climb, communicate, DF, etc (PHAK) ; intercept AIM 5-6-13: follow, 121.5, 7700
- Flight plans: AIM 5-1-4 FAA Form 7233-4 required (7233-1 only DoD/stereo); proposals retained 2 h (PHAK says 1 h - superseded); SAR 30 min after ETA (AIM 6-2-7); 91.153 contents; 91.151 30/45 min

##### GL15 Night (verified)
- 14 CFR 1.1 night = end evening civil twilight → begin morning civil twilight (sun center 6° below horizon, AFH 11).
- 91.209(a) position lights sunset→sunrise; 91.209(b) anticollision may be turned off by PIC for safety. AIM 4-3-24.
- 61.57(b): 1 h after sunset→1 h before sunrise, 3 T/O + 3 full-stop landings in 90 days, sole manipulator, same cat/class/type.
- 61.109(a)(2): 3 h night training incl. XC >100 NM total + 10 T/O & 10 full-stop landings (each with traffic pattern); 61.110 Alaska exception.
- 61.87(o): student night solo — night training at solo airport, nav training nearby, M/M endorsement within 90 days.
- 91.205(c) FLAPS (fuses; landing light if for hire; anticollision; position; source).
- PHAK 17: night blind spot (fovea no rods) 5–10°; off-center 10°; 2–3 s; 30° sectors overlap 10°; dark adaptation ~30 min; N-15 sunglasses; night vision declines >4,000 ft PA without O2; smokers lose 20% night vision at SL ≈ 5,000 ft physiological altitude. Mesopic "most dangerous period for viewing". Scotopic acuity 20/200.
- AFH 11: anticollision flashes <1 s don't impair adaptation; ≥1 s bright light does; red light distorts chart colors (magenta, yellow→red; cyan→black); hypoxia >5,000 ft at night; black course lines; tap position lights; hold brakes in runup; landing light halfway down final; round out when tire marks visible / far runway lights rise above nose; low shallow approach inappropriate; engine failure → unlighted area, into wind.
- AIM 2-1-9 beacons 24–30 flashes/min airports; white-green land; white-yellow water; military dual white then green; heliport green-yellow-white; daytime beacon in B/C/D/E surface often <3 SM/<1,000 ft.
- AIM 2-1-4: yellow edge lights last 2,000 ft or half runway (whichever less) on instrument runways; end lights green out/red in. Taxiway edge blue (2-1-10). PCL 7 clicks within 5 s, 15 min.
- C172S POH 7: strobes/beacon off in clouds (vertigo); POH 4: use taxi light for visibility to extend landing light life; POH 3: conserve battery for flaps and landing lights at night.
- Removed unverified: "unlit areas less likely to have buildings" (my reasoning, not AFH).

##### GL16 ADM (verified)
- PHAK 2: ADM def; ~80% accidents human factors; landing 24.1%, takeoff 23.4% (Fig 2-1); human factors >70% (also PHAK 2 — book gives both figures); 1987 six manuals; 10–50% fewer judgment errors; 400,000 h operator 54% reduction; 6 ADM steps; risk mgmt 6 steps (Fig 2-3); 4 principles; hazard/risk definitions; 3P/PAVE/CARE/TEAM; 3 timeframes strategic/deliberate/time-critical (Fig 2-10); 5P decision points (hourly if >2 h); 5,000 ft fatigue note; attitudes; 4,000 pilots five traits; stressors (Fig 2-16); DECIDE; automatic/naturalistic; pitfalls (Fig 2-15); SA; resources; SAFETY briefing; sterile flight deck; workload; automation (NAV→ROL on source change).
- RMH (FAA-H-8083-2A) Fig 4-1 risk matrix read from rendered page: Probable H H S M; Occasional H S M L; Remote S M M L; Improbable M M M L. High/serious = no-go unless mitigated; medium = go, mitigate. Ch 6 expectation/confirmation bias.
- Superseded: PHAK "Flight Watch"/EFAS 122.0 — FAA Notice JO 7210.887 eff. 10/1/2015 realigned EFAS to Inflight; 122.0 ended (Sept 24, 2015 per AOPA); use FSS freqs / 122.2.

##### VS1 V-speeds lesson + term popovers (verified)
- New lesson vs1 (code VSP, module "vspeeds", partOf gl2, after gl2 in ORDER/S1). Linked from GL2 limits, GL13 asi, Tools cell "V-speeds · POH Sec 2", glossary hero and V-speed glossary rows.
- Values (KIAS) from C172S POH NAV III (172SPHBUS) Sec 2/3/4/5; 1998 172S Information Manual lists the same:
  VS0 40 (white arc bottom; Sec 5 40 KIAS = 48 KCAS) · VS1 48 (green arc bottom, max wt fwd CG) · VFE 110 flaps 10° / 85 flaps 10°–FULL (Fig 2-1; white arc top 85) ·
  VNO 129 (green top / yellow bottom) · yellow 129–163 · VNE 163 (red line) · VA 105/98/90 at 2,550/2,200/1,900 lb (Fig 2-1) ·
  VX 62 SL / 67 10,000 ft · VY 74 SL / 72 10,000 ft (Sec 4) · nose wheel lift 55 (Sec 4; POH has no VR symbol) · best glide 68 flaps up (Sec 3; "VG" is shorthand, not in 14 CFR 1.2) ·
  approach 65–75 flaps up, 60–70 flaps FULL, short field 61 (Sec 4; no VREF in POH) · balked landing 60 flaps 20° · engine failure after takeoff 70 up / 65 flaps 10°–FULL (Sec 3).
- AFH Ch 9: with no manufacturer speed, approach not more than 1.3 VS0, plus no more than one-half the gust factor. Definitions: 14 CFR 1.2.
- ASI viz (js/viz/vspeeds.js) uses the real arc colors, muted (color is the message, like the airport signs). Only the accent tick + selected chip glow. Tapping a speed shows only its arc/line; unmarked speeds dim all arcs and show an accent tick.
- Auto-terms (rich.js autoTerms): first use per block of V-speed symbols, KIAS/KCAS/KTAS, CTAF, POH, AFM, ACS, MSL, AGL get a dotted underline + popover (tap; hover/focus on fine pointers; Esc closes). Plain "VR"/"VMC" not auto-marked (ambiguous). Never applied to questions/choices, code, labels, the viz, or the vs1 lesson itself (defined in place).
- Glossary deep links #/glossary/<slug> highlight and scroll to the row.

##### GL1 Instrument groups drawings (verified)
- js/viz/instpanel.js: static round-gauge faces grouped as the page groups them (PHAK 3): Performance = ASI, altimeter, VSI, heading indicator, turn coordinator (the 172's turn-and-slip instrument; ball = slip-skid); Control = attitude indicator + tachometer (power); Navigation = VOR CDI. Not interactive, nothing highlighted.
- Example readings: 100 KIAS, 4,500 ft / 29.92, 0 fpm, HDG 120, wings level, 2,300 RPM, CDI course 120 centered TO.
- ASI arcs reuse the V-speeds dial geometry and colors (POH Fig 2-2). Tach: green 2,100–2,500 RPM (sea-level arc; 2,600 at 5,000 ft, 2,700 at 10,000 ft) and red line 2,700 RPM per C172S POH Fig 2-3 (NAV III). Numerals sit above hands with a face-colored halo so a hand never hides a number.
- Panel note is generic: many 172S airplanes have a G1000; the page describes the PFD layout in general terms and says to confirm with your CFI and your airplane's POH. The site is a generic course: no specific tail number, school, instructor or dates.

##### "Fix" term (verified)
- Glossary "Fix" = P/CG FIX wording verbatim ("A geographical position determined by visual reference to the surface, by reference to one or more radio NAVAIDs, by celestial plotting, or by another navigational device.") plus examples (VOR, VOR-radial intersection, GPS waypoint).
- Marked explicitly with [[fix]] (no auto-regex, to avoid the verb sense): GL1 Instrument groups prose ("navigation facility or fix"), the instrument figure's Navigation subtitle, GL16 ("final approach fix"). All other "fix" uses are the verb/remedy sense and stay plain.

## Controls stay where you expect them (chip rows)
- Runway markings: two fixed rows. Row 1 "RUNWAY" holds the runway type chips; row 2 "MARKINGS" always sits directly below and lists every marking in one fixed order. Markings a runway type does not have are dimmed (disabled), never moved.
- New `row(parent, label)` helper in js/viz/base.js gives a control group its own full-width line with a mono label; `chips().enable(keys)` dims chips without re-rendering.
- Visuals whose content changes height on a click (mnemonics, radio trainer, airport signs, METAR decoder, chair-fly, emergency flows with several scenarios) now put their picker chips on top of the visual (`ctrl-top`), so switching mode or answering never pushes them down. Radio: Mode chips come before Position. Crab/slip: the readout has its own row so its changing width no longer shoves the Technique chips sideways.
- tests/stable-controls.mjs (`W=1440|820|390 node tests/stable-controls.mjs [routes]`): clicks every button in every visual and fails if a control group jumps sideways (>32px), moves more than about a row (>70px), or moves up beside a group it used to sit below. Small shifts, wraps and groups appearing or hiding are allowed. Visuals carry `data-viz` for this.

## Entry gate (soft lock) and headline
- First visit shows a full-screen entry screen (logo, wordmark, "Learn it. Squawk it.", one "Access code" field and Enter). The code is checked case-insensitively with spaces trimmed, against a SHA-256 hash in js/gate.js (the plain code is not shipped). A small synchronous SHA-256 is used so it also works on plain http.
- Success stores `sqs.access = "1"` in localStorage (separate key; `ppg.v1` is untouched), so that device is not asked again. A wrong code shows a quiet one-line message.
- No flash: an inline script in <head> adds `html.locked` before first paint, and an inline style hides everything except #gate. app.js does not render any route or listen for hash changes until unlocked, so deep links are blocked too and open where they pointed after unlocking.
- Phone/iPad: autofocus, Enter submits (form submit, enterkeyhint="go"), 16px input so iOS does not zoom.
- `<meta name="robots" content="noindex, nofollow">` and robots.txt `Disallow: /` while gated. og:url/og:image use https://squawkschool.com (CNAME added by GitHub Pages settings).
- Tests set the flag with an init script before loading. tests/gate.mjs checks the gate at any size: first paint locked, main/nav hidden, deep link not rendered, focus, 16px input, wrong code stays locked, " TestPilot " unlocks and renders the deep link, flag stored, reload not asked again, and no plain code in shipped files.
- Home hero headline is now "Learn it. Squawk it." (was "Learn it. Keep it."); the subline was unchanged.
