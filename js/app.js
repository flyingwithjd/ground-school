import { whenUnlocked } from "./gate.js?v=c64a1f77b5";
import { initPopovers } from "./core/rich.js?v=c64a1f77b5";
import { destroyAll } from "./viz/index.js?v=c64a1f77b5";
import * as pages from "./views/pages.js?v=c64a1f77b5";
import { lessonView } from "./views/lesson.js?v=c64a1f77b5";
const main = document.getElementById("main");
let cleanup = [];
const routes = [
  [/^#?\/?$/, () => pages.home(main), "home"],
  [/^#\/course$/, () => pages.course(main), "course"],
  [/^#\/module\/([\w-]+)$/, (m) => pages.moduleView(main, m[1]), "course"],
  [/^#\/lesson\/([\w-]+)(?:\/([\w-]+))?$/, (m) => lessonView(main, m[1], m[2] == null ? null : /^\d+$/.test(m[2]) ? +m[2] : m[2]), "course"],
  [/^#\/coverage$/, () => pages.coverage(main), "course"],
  [/^#\/presolo$/, () => pages.presolo(main), "tools"],
  [/^#\/check\/(s[1-4])(?:\/(written|oral))?$/, (m) => pages.check(main, m[1], m[2]), "tools"],
  [/^#\/review$/, () => pages.review(main), "review"],
  [/^#\/practice\/([\w-]+)$/, (m) => pages.practice(main, m[1]), "review"],
  [/^#\/drill\/([\w.-]+)$/, (m) => pages.drill(main, m[1]), "map"],
  [/^#\/map$/, () => pages.map(main), "map"],
  [/^#\/tools$/, () => pages.tools(main), "tools"],
  [/^#\/oral(?:\/([\w-]+))?$/, (m) => pages.oral(main, m[1]), "tools"],
  [/^#\/sim$/, () => pages.sim(main), "tools"],
  [/^#\/sim\/(s[1-4])$/, (m) => pages.check(main, m[1]), "tools"],
  [/^#\/glossary(?:\/([^/]+))?$/, (m) => pages.glossary(main, m[1] ? decodeURIComponent(m[1]) : null), "tools"],
  [/^#\/settings$/, () => pages.settings(main), "tools"],
  [/^#\/about$/, () => pages.about(main), "tools"],
];
// Document title per route: "<page heading> · Squawk School" (views may render a tick later, so read the heading after it lands)
const BRAND = "Squawk School", HOME_TITLE = "Squawk School · Private pilot ground";
function setTitle(home, nav) { const put = () => { if (home) { document.title = HOME_TITLE; return; } const hd = main.querySelector("h1") || main.querySelector("h2"); const fb = nav ? (document.querySelector(`[data-nav="${nav}"]`) || {}).textContent : ""; const s = (hd ? hd.textContent.replace(/\s+/g, " ").trim().replace(/\.$/, "") : "") || (fb || "").trim(); document.title = s ? `${s} · ${BRAND}` : BRAND; };
  put(); setTimeout(put, 0); setTimeout(put, 400); }
function route() {
  cleanup.forEach((f) => { try { f(); } catch (e) {} }); cleanup = []; destroyAll();
  const hash = location.hash || "#/"; main.innerHTML = "";
  for (const [re, fn, nav] of routes) { const m = hash.match(re); if (m) { const r = fn(m); if (r && r.destroy) cleanup.push(r.destroy); else if (typeof r === "function") cleanup.push(r);
      document.querySelectorAll("[data-nav]").forEach((a) => { const on = a.dataset.nav === nav; a.classList.toggle("on", on); on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"); });
      if (!/^#\/lesson\/[\w-]+\/\d+$/.test(hash) || !route.sameLesson(hash)) window.scrollTo(0, 0); route.last = hash; setTitle(nav === "home", nav); return; } }
  main.innerHTML = `<div class="page"><h2>Page not found.</h2><p class="dim mt"><a href="#/">Back to what to work on now</a></p></div>`; setTitle();
}
route.sameLesson = (h) => (route.last || "").split("/").slice(0, 3).join("/") === h.split("/").slice(0, 3).join("/");
initPopovers();
whenUnlocked(() => { addEventListener("hashchange", route); route(); }); // nothing renders until the entry gate is passed
