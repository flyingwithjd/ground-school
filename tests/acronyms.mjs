// Every abbreviation in lesson prose must be tappable: either it has a glossary entry that autoTerms (js/core/rich.js)
// wraps automatically, it is wrapped by hand with [[...]], or it is on the allowlist below with a reason.
// Part 2 renders the "Records first" page and checks its terms open a popover that stays on screen.
import { readdirSync } from "fs";
const { PLAIN, G } = await import("../js/core/rich.js");
// Letters that should NOT open a definition, with why.
const ALLOW = {
  // ambiguous: one set of letters, several meanings in this course
  VR: "VR route vs rotation speed (V<sub>R</sub> form is tapped)", VMC: "visual conditions vs minimum control speed", TC: "true course vs type certificate (both defined in place)", NAV: "radio, autopilot mode and avionics model name", IR: "IR route vs infrared satellite", DC: "direct current vs Washington, DC", ID: "plain English", TO: "VOR flag", FROM: "VOR flag",
  // switch, annunciator and placard labels quoted from the airplane
  ALT: "switch label", BAT: "switch label", VOLTS: "annunciator", LOW: "annunciator", HIGH: "annunciator", FIELD: "breaker label", ROL: "autopilot mode label", FULL: "control position", LEFT: "selector position", RIGHT: "selector position", BOTH: "selector position", ON: "switch position", OFF: "switch position", FLAPS: "label", LIGHT: "intensity word", MODERATE: "intensity word", HEAVY: "intensity word", EXTREME: "intensity word",
  // forecast/report codes, defined in place where they appear
  FM: "TAF code", TEMPO: "TAF code", PROB30: "TAF code", P6SM: "TAF code", CB: "cloud code", FB: "winds aloft product name", "WSR-88D": "radar model", "L2A": "engine suffix",
  // names, identifiers and examples, not jargon
  C172S: "model name", SP: "model name", "IO-360": "engine model", "IO-360-L2A": "engine model", G1000: "avionics model", III: "product name / roman numeral", FL600: "flight level example, defined in place", LAX: "airport identifier", KOEL: "airport identifier", N123AB: "example N-number", VIP: "plain English", JO: "FAA order prefix", "VR1207": "route number", "IR206": "route number", VP: "waypoint prefix, defined in place",
  "WX-BRIEF": "phone number", "AK-BRIEF": "phone number", WX: "phone number", AK: "phone number", BRIEF: "phone number",
  TREE: "radio pronunciation", FIFE: "radio pronunciation", NIN: "radio pronunciation", TIBS: "discontinued service, defined in place", EFAS: "discontinued service, defined in place", CAMI: "named in place", MSDS: "named in place", CLR: "METAR code, defined in place", US: "plain English", "FAA-S-ACS-6C": "document number", "FAA-H-8083-2A": "document number",
  GL3: "lesson code", GL5: "lesson code", GL7: "lesson code", GL11: "lesson code", GL13: "lesson code", GL14: "lesson code", GL17: "lesson code", FL1: "lesson code", FL6: "lesson code",
};
const D = new URL("../data/text/", import.meta.url).pathname;
const files = [...readdirSync(D).filter((f) => f.endsWith(".js")).map((f) => D + f), ...readdirSync(D + "x").map((f) => D + "x/" + f)];
// Drop what autoTerms skips: sources, headings, code, labels, hand-wrapped [[terms]], and V<sub>X</sub> speeds.
const strip = (h) => String(h || "").replace(/<(h\d|code|svg)\b[\s\S]*?<\/\1>/g, " ").replace(/<span class="(src|label)[^"]*">[\s\S]*?<\/span>/g, " ").replace(/<sub>[^<]*<\/sub>/g, "").replace(/<[^>]+>/g, " ").replace(/\[\[[^\]]*\]\]/g, " ");
const TOK = /(?<![\w-])([A-Z][A-Z0-9]+(?:-[A-Z0-9]+)*)(s?)(?![\w])/g;
let bad = 0; const miss = {}; let tapped = 0;
for (const f of files) { const m = (await import(f)).default;
  for (const s of m.sections || []) { const t = strip((s.body || "") + " " + (s.body2 || ""));
    for (const x of t.matchAll(TOK)) { const k = x[1]; if (PLAIN[k] && G[PLAIN[k]]) { tapped++; continue; } if (k in ALLOW) continue;
      (miss[k] ||= []).push(f.split("/text/")[1] + "#" + s.id); } } }
for (const [k, v] of Object.entries(PLAIN)) if (!G[v]) { console.log("NO GLOSSARY ENTRY for auto term", k, "->", v); bad++; }
for (const [k, w] of Object.entries(miss)) { console.log("UNWRAPPED", k, "in", [...new Set(w)].join(", ")); bad++; }
console.log("abbreviations tapped in prose:", tapped, "| auto terms:", Object.keys(PLAIN).length, "| glossary:", Object.keys(G).length);
if (process.argv.includes("--static")) process.exit(bad ? 1 : 0);

// Part 2 (browser): GL1 "Records first, then the airplane" - every listed term is a tappable .gl button; each opens the popover,
// which stays inside the viewport, never covers its own term, and the buttons don't break the line layout. 1440, 744 and 390.
const { createRequire } = await import("module"); const { chromium } = createRequire("/workspace/pgs-build/")("playwright-core");
const BASE = process.env.BASE || "http://localhost:8765/index.html", shotDir = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : null;
const NEED = { "Records first": ["airworthy", "pilot in command", "annual inspection", "calendar month", "100-hour inspection", "transponder", "elt", "ad", "inoperative equipment", "airworthiness certificate", "registration certificate", "operating limitations", "afm", "poh", "placard", "weight and balance", "compass correction card", "data plate", "cfr", "afh"],
  "What you're looking for": ["poh", "vsi", "crazing", "spars", "100ll", "fuel sump", "strut", "shimmy damper", "cowling", "cfi"] };
const b = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const ok = (c, m) => { if (!c) { bad++; console.log("   FAIL", m); } };
for (const [w, hh] of [[1440, 900], [744, 1133], [390, 844]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: hh }, isMobile: w < 700, hasTouch: w < 1100 }); const pg = await ctx.newPage();
  await pg.addInitScript(() => { try { localStorage.setItem("sqs.access", "1"); } catch (e) {} });
  const errs = []; pg.on("pageerror", (e) => errs.push(e.message)); pg.on("console", (m) => (m.type() === "error" || /glossary missing/.test(m.text())) && errs.push(m.text()));
  await pg.goto(BASE + "#/lesson/gl1/0"); await pg.waitForSelector(".steps button"); await pg.waitForTimeout(800);
  for (const [title, need] of Object.entries(NEED)) {
  await pg.locator(title === "Records first" ? ".steps button[aria-label^='Preflight assessment']" : ".steps button[aria-label^='Visual preflight']").first().click(); await pg.waitForTimeout(900);
  const sec = pg.locator("h2", { hasText: title }).locator("xpath=ancestor::*[.//p][1]");
  ok(await sec.count(), `${w}: ${title} section not found`);
  const terms = await sec.evaluate((s) => [...s.querySelectorAll(".gl")].map((x) => x.dataset.term));
  for (const t of need) ok(terms.includes(t), `${w} ${title}: '${t}' is not tappable (have ${terms.join(", ")})`);
  ok(!(await sec.evaluate((s) => s.querySelector("h1 .gl, h2 .gl, h3 .gl, .src .gl, .label .gl"))), `${w}: a term was wrapped inside a heading/source/label`);
  // Buttons keep the text flow: same line height as the paragraph, no extra boxes.
  const lay = await sec.evaluate((s) => [...s.querySelectorAll(".gl")].filter((g) => { const lh = parseFloat(getComputedStyle(g.closest("p,li") || s).lineHeight) || 24; return [...g.getClientRects()].some((r) => r.height > lh + 2); }).map((g) => g.textContent));
  ok(!lay.length, `${w}: terms taller than their line: ${lay.join(", ")}`);
  const n = await sec.locator(".gl").count();
  for (let i = 0; i < n; i++) { const g = sec.locator(".gl").nth(i); await g.evaluate((e) => e.scrollIntoView({ block: "center" })); await pg.waitForTimeout(250);
    // tap the first line box (a term that wraps has an empty middle in its bounding box)
    const q = await g.evaluate((e) => { const r = e.getClientRects()[0]; return [r.left + r.width / 2, r.top + r.height / 2, document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.closest(".gl") === e]; }); ok(q[2], `${w}: term #${i} is covered where it is tapped`); await pg.mouse.click(q[0], q[1]); await pg.waitForTimeout(150);
    const r = await pg.evaluate(() => { const p = document.getElementById("pop"), o = document.querySelector(".gl[aria-expanded='true']"); if (!p || p.hidden || !o) return null; const a = p.getBoundingClientRect(), t = o.getBoundingClientRect();
      return { t: o.dataset.term, def: p.querySelector(".pdef")?.textContent.length || 0, out: a.left < 0 || a.top < 0 || a.right > innerWidth || a.bottom > innerHeight, cover: [...o.getClientRects()].some((q) => q.right > a.left && q.left < a.right && q.bottom > a.top && q.top < a.bottom), scroll: p.scrollHeight > p.clientHeight + 1 && a.height < 150 }; });
    ok(r && r.def > 8 && !r.out && !r.cover && !r.scroll, `${w}: popover #${i} ${JSON.stringify(r)}`);
    if (shotDir && r && r.t === "elt") await pg.screenshot({ path: `${shotDir}/glossary_elt_${w}x${hh}.png` });
    await pg.evaluate(() => document.body.click()); await pg.waitForTimeout(60); }
  console.log(w, title, "terms:", n); }
  ok(!errs.length, `${w}: console: ${errs.join(" | ")}`);
  await ctx.close();
}
await b.close();
console.log(bad ? `FAIL ${bad}` : "PASS"); process.exit(bad ? 1 : 0);
