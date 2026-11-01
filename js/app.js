import { initPopovers } from "./core/rich.js?v=715aa408ea";
import { destroyAll } from "./viz/index.js?v=715aa408ea";
import * as pages from "./views/pages.js?v=715aa408ea";
import { lessonView } from "./views/lesson.js?v=715aa408ea";
const main = document.getElementById("main");
let cleanup = [];
const routes = [
  [/^#?\/?$/, () => pages.home(main), "home"],
  [/^#\/course$/, () => pages.course(main), "course"],
  [/^#\/module\/([\w-]+)$/, (m) => pages.moduleView(main, m[1]), "course"],
  [/^#\/lesson\/([\w-]+)(?:\/(\d+))?$/, (m) => lessonView(main, m[1], m[2] ? +m[2] : null), "course"],
  [/^#\/review$/, () => pages.review(main), "review"],
  [/^#\/practice\/([\w-]+)$/, (m) => pages.practice(main, m[1]), "review"],
  [/^#\/drill\/([\w.-]+)$/, (m) => pages.drill(main, m[1]), "map"],
  [/^#\/map$/, () => pages.map(main), "map"],
  [/^#\/tools$/, () => pages.tools(main), "tools"],
  [/^#\/oral(?:\/([\w-]+))?$/, (m) => pages.oral(main, m[1]), "tools"],
  [/^#\/sim$/, () => pages.sim(main), "tools"],
  [/^#\/glossary$/, () => pages.glossary(main), "tools"],
  [/^#\/settings$/, () => pages.settings(main), "tools"],
  [/^#\/about$/, () => pages.about(main), "tools"],
];
function route() {
  cleanup.forEach((f) => { try { f(); } catch (e) {} }); cleanup = []; destroyAll();
  const hash = location.hash || "#/"; main.innerHTML = "";
  for (const [re, fn, nav] of routes) { const m = hash.match(re); if (m) { const r = fn(m); if (r && r.destroy) cleanup.push(r.destroy); else if (typeof r === "function") cleanup.push(r);
      document.querySelectorAll("[data-nav]").forEach((a) => { const on = a.dataset.nav === nav; a.classList.toggle("on", on); on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"); });
      if (!/^#\/lesson\/[\w-]+\/\d+$/.test(hash) || !route.sameLesson(hash)) window.scrollTo(0, 0); route.last = hash; return; } }
  main.innerHTML = `<div class="page"><h2>Page not found.</h2><p class="dim mt"><a href="#/">Back to what to work on now</a></p></div>`;
}
route.sameLesson = (h) => (route.last || "").split("/").slice(0, 3).join("/") === h.split("/").slice(0, 3).join("/");
addEventListener("hashchange", route);
initPopovers();
route();
