# Private Pilot Ground School

A static, offline study app for student pilots. It teaches every content item of a 19-lesson, four-stage Part 141 Appendix B style private pilot ground course, with stage checks after lessons 6, 12 and 18 and an end-of-course exam (80% to pass; misses go into spaced review). Lessons and map to the Private Pilot ACS (FAA-S-ACS-6C). Content comes from PHAK (FAA-H-8083-25C), AFH (FAA-H-8083-3C), the AIM, AC 90-66C, the Aviation Weather Handbook and 14 CFR, with sources cited inline. Cessna 172S figures come from the manufacturer's POH. Procedures say "Confirm with your CFI and your aircraft's POH."

## Run
Any static file server works, for example `python3 -m http.server 8765`, then open http://localhost:8765/. Opening `index.html` from `file://` does not work because ES modules need http. There's no backend, no build step and no network calls. Progress is kept in localStorage, and Settings has export, import and reset.

## Layout
- `index.html`, `css/app.css`
- `js/app.js`: the router
- `js/core/`: SRS (SM-2), the store, rich text and glossary popovers, utilities
- `js/views/`: pages, lessons, quiz and oral sessions
- `js/viz/`: one module per visualization, lazy-loaded, mounted only when in view
- `data/course.js`: stages and modules
- `data/index.js`: lesson registry
- `data/lessons/*.js`, `data/modules/*.js`: questions, oral items, topics and ACS codes
- `data/lessons/x/`, `data/text/x/`: supplements merged into GL1–GL8
- `data/lessons/c/`: coverage batches, extra questions merged into their ground lessons. Question ids are permanent (they key saved review progress).
- `data/coverage-src.js`: the syllabus content items, each with a match pattern. `node tools/build-coverage.mjs [--report]` writes `data/coverage.json`, which drives the `#/coverage` checklist. Rebuild it after any content change.
- `data/text/*.js`: lesson section text and visualization config, lazy-loaded per lesson
- `data/glossary.js`: terms with their sources
- `vendor/three` (MIT), `vendor/gsap` (vendored, not loaded), `fonts/` (OFL), `LICENSES/`

## Test
- `node tests/validate.mjs`: question shape, ACS codes, counts, glossary links, unique question ids, known topics, an up-to-date coverage map with working links, and the pre-solo topic list. Exits 1 on any problem.
- `node tests/srs-persist.mjs`, `node tests/parts-ui.mjs`, `W=360 node tests/overlap-audit.mjs`: review state survives reload, 3D parts buttons, and label overlap on phones
- `node tests/routes.mjs`: lists every route
- `node tests/smoke.mjs <routes...>`: Playwright console-error check. Env options: `W`, `H`, `SHOT=/path/%.png`, `VIZ=1`, `FULL=1`. Needs playwright-core and a server on :8765.

## Deploy
Run `node tools/stamp-version.mjs` (cache-busting hash on every import) and `node tools/build-coverage.mjs`, then upload the folder to any static host as is. It's published with GitHub Pages from `main`; the live build hash is in `<meta name="build">`.
