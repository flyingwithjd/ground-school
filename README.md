# Private Pilot Ground School · Stage 1 (v1)

A static, offline study app for student pilots. Lessons follow a Part 141 Appendix B style syllabus and map to the Private Pilot ACS (FAA-S-ACS-6C). Content comes from PHAK (FAA-H-8083-25C), AFH (FAA-H-8083-3C), the AIM, AC 90-66C, the Aviation Weather Handbook and 14 CFR, with sources cited inline. Cessna 172S figures come from the manufacturer's POH. Procedures say "Confirm with your CFI and your aircraft's POH."

## Run
Any static file server works, for example `python3 -m http.server 8765`, then open http://localhost:8765/. Opening `index.html` from `file://` does not work because ES modules need http. There's no backend, no build step and no network calls. Progress is kept in localStorage, and Settings has export, import and reset.

## Layout
- `index.html`, `css/app.css`
- `js/app.js`: the router
- `js/core/`: SRS (SM-2), the store, rich text and glossary popovers, utilities
- `js/views/`: pages, lessons, quiz and oral sessions
- `js/viz/`: one module per visualization, lazy-loaded, mounted only when in view
- `data/course.js`: stages and modules. Add Stages 2–4 here.
- `data/index.js`: lesson registry
- `data/lessons/*.js`, `data/modules/*.js`: questions, oral items, topics and ACS codes
- `data/text/*.js`: lesson section text and visualization config, lazy-loaded per lesson
- `data/glossary.js`: terms with their sources
- `vendor/three` (MIT), `vendor/gsap` (vendored, not loaded), `fonts/` (OFL), `LICENSES/`

## Test
- `node tests/validate.mjs`: question shape, ACS codes, counts and glossary links
- `node tests/routes.mjs`: lists every route
- `node tests/smoke.mjs <routes...>`: Playwright console-error check. Env options: `W`, `H`, `SHOT=/path/%.png`, `VIZ=1`, `FULL=1`. Needs playwright-core and a server on :8765.

## Deploy
Upload the folder to any static host as is. This build has not been deployed.
