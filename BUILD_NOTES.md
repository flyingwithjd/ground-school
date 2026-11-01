# Build notes: Private Pilot Ground School, Stage 1 (v1)

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

### 2026-10-31, ~8:30 PM MDT: parts explorer UI fixes (after JD's iPhone test)
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
