import { whenUnlocked } from "./gate.js?v=7534528db0";
import { initPopovers } from "./core/rich.js?v=7534528db0";
import { destroyAll } from "./viz/index.js?v=7534528db0";
import * as pages from "./views/pages.js?v=7534528db0";
import { lessonView } from "./views/lesson.js?v=7534528db0";
const main = document.getElementById("main");
let cleanup = [];
const routes = [
  [/^#?\/?$/, () => pages.home(main), "home"],
  [/^#\/course$/, () => pages.course(main), "course"],
  [/^#\/module\/([\w-]+)$/, (m) => pages.moduleView(main, m[1]), "course"],
  [/^#\/lesson\/([\w-]+)(?:\/([\w-]+))?$/, (m) => lessonView(main, m[1], m[2] == null ? null : /^\d+$/.test(m[2]) ? +m[2] : m[2]), "course"],
  [/^#\/coverage$/, () => pages.coverage(main), "course"],
  [/^#\/presolo$/, () => pages.presolo(main), "tools"],
  [/^#\/check\/(s[1-4])(?:\/(written|oral))?$/, (m) => pages.check(main, m[1], m[2] && "written"), "tools"],   // an old oral link opens the written
  [/^#\/review$/, () => pages.review(main), "review"],
  [/^#\/blindspots(?:\/(\d+|quiz))?$/, (m) => pages.blindspots(main, m[1]), "map"],
  [/^#\/practice\/([\w-]+)$/, (m) => pages.practice(main, m[1]), "review"],
  [/^#\/drill\/([\w.-]+)$/, (m) => pages.drill(main, m[1]), "map"],
  [/^#\/map$/, () => pages.map(main), "map"],
  [/^#\/tools$/, () => pages.tools(main), "tools"],
  [/^#\/oral(?:\/([\w-]+))?$/, () => pages.tools(main), "tools"],   // oral practice was retired; old links land on Tools
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
      if (!/^#\/lesson\/[\w-]+\/\d+$/.test(hash) || !route.sameLesson(hash)) { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" })); } route.last = hash; setTitle(nav === "home", nav); return; } }
  main.innerHTML = `<div class="page"><h2>Page not found.</h2><p class="dim mt"><a href="#/">Back to what to work on now</a></p></div>`; setTitle();
}
route.sameLesson = (h) => (route.last || "").split("/").slice(0, 3).join("/") === h.split("/").slice(0, 3).join("/");
// the app handles scroll itself: without this, Back/Forward restores the old (often bottom) position after the new page renders
try { history.scrollRestoration = "manual"; } catch (e) {}
initPopovers();
whenUnlocked(() => { addEventListener("hashchange", route); route(); }); // nothing renders until the entry gate is passed
// Stale-cache guard: GitHub Pages lets a browser keep index.html for up to 10 minutes (longer for a home-screen app), so
// a phone can keep running an old build. On load and whenever the tab comes back, fetch the page uncached and compare its
// build stamp; if it is newer, reload once from a fresh URL (the ?b= query bypasses the cached page), then tidy the URL.
(function freshBuild() {
  if (/[?&]b=/.test(location.search)) history.replaceState(null, "", location.pathname + location.hash);
  const cur = (document.querySelector('meta[name="build"]') || {}).content; if (!cur || !window.fetch) return;
  const check = () => fetch(location.pathname + "?nc=" + Date.now(), { cache: "no-store" }).then((r) => (r.ok ? r.text() : "")).then((t) => {
    const m = t.match(/<meta name=.build. content="([0-9a-f]+)"/);  /* name=.build. on purpose: stamp-version strips the literal tag */ if (!m || m[1] === cur) return;
    const k = "sqs.build." + m[1]; try { if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, "1"); } catch (e) {}
    location.replace(location.pathname + "?b=" + m[1] + location.hash); }).catch(() => {});
  setTimeout(check, 1500); document.addEventListener("visibilitychange", () => { if (!document.hidden) check(); });
})();
