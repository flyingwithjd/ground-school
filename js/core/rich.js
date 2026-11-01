import { GLOSSARY } from "../../data/glossary.js?v=a81f689fed";
import { esc } from "./util.js?v=a81f689fed";
const norm = (k) => k.toLowerCase().replace(/[’']/g, "'").trim();
export const G = Object.fromEntries(Object.entries(GLOSSARY).map(([k, v]) => [norm(k), { term: k, ...v }]));
export function term(key) { return G[norm(key)] || null; }
// [[term]] or [[shown text|glossary key]] -> tappable popover term
export function rich(html) { return String(html || "").replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (m, a, b) => { let k = norm(b || a); if (!G[k]) k = [k.replace(/s$/, ""), k.replace(/es$/, ""), k.replace(/ies$/, "y")].find((x) => G[x]) || k; if (!G[k]) { console.warn("glossary missing:", k); return a; } return `<button type="button" class="gl" data-term="${esc(k)}">${a}</button>`; }); }
let open = null;
export function initPopovers() {
  const pop = document.getElementById("pop");
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".gl");
    if (!b) { if (open && !e.target.closest("#pop")) close(); return; }
    e.preventDefault(); const g = G[b.dataset.term]; if (!g) return; if (open === b) return close();
    pop.innerHTML = `<span class="label">${esc(g.term)}</span>${g.def}${g.src ? `<span class="src">${esc(g.src)}</span>` : ""}`; pop.hidden = false; open = b;
    const r = b.getBoundingClientRect(), pw = Math.min(380, innerWidth - 24); pop.style.width = pw + "px";
    let x = Math.min(innerWidth - pw - 12, Math.max(12, r.left + r.width / 2 - pw / 2)); pop.style.left = x + "px";
    const ph = pop.offsetHeight; const below = r.bottom + 10 + ph < innerHeight; pop.style.top = (below ? r.bottom + 10 : Math.max(12, r.top - ph - 10)) + "px";
  });
  addEventListener("keydown", (e) => e.key === "Escape" && close()); addEventListener("scroll", () => open && close(), { passive: true }); addEventListener("hashchange", close);
  function close() { pop.hidden = true; open = null; }
}
