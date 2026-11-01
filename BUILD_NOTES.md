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
