import { GLOSSARY } from "../../data/glossary.js?v=0134b87946";
import { esc } from "./util.js?v=0134b87946";
const norm = (k) => k.toLowerCase().replace(/[’']/g, "'").trim();
export const G = Object.fromEntries(Object.entries(GLOSSARY).map(([k, v]) => [norm(k), { term: k, ...v }]));
// Other spellings that point at one entry (VSO is often written VS0; ACS is the short name).
const ALIAS = { vso: "vs0", acs: "airman certification standards", vmc: "vmc (speed)", "best glide": "vg", "best glide speed": "vg" };
const find = (k) => { k = norm(k); if (ALIAS[k]) k = ALIAS[k]; if (G[k]) return k; return [k.replace(/s$/, ""), k.replace(/es$/, ""), k.replace(/ies$/, "y")].find((x) => G[x]) || null; };
export function term(key) { const k = find(key); return k ? G[k] : null; }
export const glossaryHref = (k) => "#/glossary/" + encodeURIComponent(norm(k).replace(/\s+/g, "-"));
// [[term]] or [[shown text|glossary key]] -> tappable popover term
export function rich(html) { return String(html || "").replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (m, a, b) => { const k = find(b || a); if (!k) { console.warn("glossary missing:", norm(b || a)); return a; } return `<button type="button" class="gl" data-term="${esc(k)}" aria-controls="pop" aria-expanded="false">${a}</button>`; }); }

// Auto-terms: abbreviations in lesson prose get a subtle dotted underline that opens the same popover.
// Only the first use per paragraph, never inside links, buttons, sources, headings, visuals or question text.
// Plain "VR" and "VMC" are skipped (VR routes, visual meteorological conditions); the V<sub>R</sub> form is unambiguous.
const PLAIN = { VSO: "vs0", VS0: "vs0", VS1: "vs1", VFE: "vfe", VNO: "vno", VNE: "vne", VA: "va", VX: "vx", VY: "vy", VG: "vg", VREF: "vref", VYSE: "vyse", VLE: "vle", VLO: "vlo", KIAS: "kias", KCAS: "kcas", KTAS: "ktas", POH: "poh", AFM: "afm", ACS: "airman certification standards", MSL: "msl", AGL: "agl",
  HSI: "horizontal situation indicator", LAA: "local airport advisory", HS: "hot spot", AROW: "arrow", ADC: "air data computer" };
// V<sub>XX</sub>: the subscript letters name the speed
const SUB = { SO: "vs0", S0: "vs0", "S1": "vs1", S: "vs", FE: "vfe", NO: "vno", NE: "vne", A: "va", X: "vx", Y: "vy", R: "vr", G: "vg", REF: "vref", YSE: "vyse", MC: "vmc (speed)", LE: "vle", LO: "vlo" };
// Every other abbreviation that has its own glossary entry (key = the letters) is tapped the same way.
// Ambiguous letters (VR, VMC, TC, NAV, IR, DC, ID, switch and TAF codes) stay out; tests/acronyms.mjs keeps this list honest.
export const ABBR = ["FAA", "CFR", "FAR", "AIM", "PHAK", "AFH", "AC", "VFR", "IFR", "MVFR", "LIFR", "IMC", "ATC", "CFI", "PIC", "NTSB", "ICAO", "NOAA", "UTC", "CONUS", "SM", "NM", "RPM", "GPH", "OAT", "CHT", "EGT", "ISA", "IAS", "CAS", "TAS", "GS", "WCA", "ETA", "ETE", "CG", "AOA", "ASI", "VSI", "IVSI", "PFD", "MFD", "EFB", "ADM", "SRM", "CRM", "CFIT", "TUC", "DCS", "CO", "AME", "PAVE", "CARE", "TEAM", "DECIDE", "ABCDE", "ANDS", "AV1ATE", "ARROW", "SAFETY", "ELT", "AD", "SAIB", "MEL", "TCDS", "TSO", "NOTAM", "TFR", "SFRA", "MOA", "MTR", "CFA", "NSA", "GPS", "RNAV", "RAIM", "VOR", "VORTAC", "NDB", "DME", "ILS", "CDI", "OBS", "ADS-B", "UAT", "TIS-B", "FIS-B", "IDENT", "ATIS", "ASOS", "AWOS", "FSS", "MULTICOM", "GFA", "CVA", "MEF", "TAC", "WAC", "MAYDAY", "PAN-PAN", "TH", "MH", "CH", "MC", "CC", "E6B", "VOT", "SOP", "PSI",
  "VASI", "PAPI", "REIL", "CTAF", "UNICOM", "METAR", "TAF", "PIREP", "AIRMET", "SIGMET", "G-AIRMET", "TRSA", "AHRS", "IMSAFE", "NEXRAD", "ATCRBS"];
for (const a of ABBR) PLAIN[a] = a.toLowerCase();
export { PLAIN };
// A token: not glued to a word or hyphen in front; an optional plural "s"; not followed by a letter/digit or a hyphenated code (IO-360).
const RX = "(?<![\\w-])(" + Object.keys(PLAIN).sort((a, b) => b.length - a.length).join("|") + ")(s?)(?![\\w]|-[A-Z0-9])"; const RE = new RegExp(RX, "g"), RE1 = new RegExp(RX);
const SKIP = ".gl,a,button,.src,code,svg,h1,h2,h3,h4,.label,.qtext,.choice,.viz,input,textarea,[data-noterms]";
const BLOCK = "p,li,td,th,dd,dt,figcaption,.note";
const mk = (k, html) => { const b = document.createElement("button"); b.type = "button"; b.className = "gl auto"; b.dataset.term = k; b.setAttribute("aria-controls", "pop"); b.setAttribute("aria-expanded", "false"); b.innerHTML = html; return b; };
export function autoTerms(root) {
  if (!root || typeof document === "undefined") return root;
  const seen = new WeakMap(); const once = (node, k) => { const blk = node.parentElement?.closest(BLOCK) || root; let s = seen.get(blk); if (!s) seen.set(blk, (s = new Set())); if (s.has(k)) return false; s.add(k); return true; };
  // Mark terms the lesson already links with [[...]] so the same paragraph does not get a second underline.
  root.querySelectorAll(".gl[data-term]").forEach((b) => once(b, b.dataset.term));
  // 1. V<sub>XX</sub>
  root.querySelectorAll("sub").forEach((sub) => {
    if (sub.closest(SKIP)) return; const prev = sub.previousSibling; const k = SUB[sub.textContent.trim().toUpperCase()];
    if (!k || !G[k] || !prev || prev.nodeType !== 3 || !/(^|[^A-Za-z])V$/.test(prev.nodeValue) || !once(sub, k)) return;
    prev.nodeValue = prev.nodeValue.slice(0, -1); const b = mk(k, "V<sub>" + esc(sub.textContent) + "</sub>"); sub.replaceWith(b);
  });
  // 2. plain abbreviations
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement && !n.parentElement.closest(SKIP) && RE1.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) {
    const txt = n.nodeValue; RE.lastIndex = 0; let m, last = 0; const frag = document.createDocumentFragment(); let hit = false;
    while ((m = RE.exec(txt))) { const k = PLAIN[m[1]]; if (!G[k] || !once(n, k)) continue; frag.append(txt.slice(last, m.index), mk(k, m[0])); last = m.index + m[0].length; hit = true; }
    if (hit) { frag.append(txt.slice(last)); n.replaceWith(frag); }
  }
  return root;
}

let open = null, pinned = false, tOpen = 0, tClose = 0;
export function initPopovers() {
  const pop = document.getElementById("pop"); const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  pop.setAttribute("aria-label", "Definition");
  const show = (b, pin) => {
    const k = b.dataset.term, g = G[k]; if (!g) return; clearTimeout(tClose);
    if (open && open !== b) open.setAttribute("aria-expanded", "false");
    pop.innerHTML = `<span class="label">${esc(g.term)}</span><div class="pdef">${g.def}</div>${g.src ? `<span class="src">${esc(g.src)}</span>` : ""}<span class="plinks"><a href="${glossaryHref(k)}">Full glossary entry</a>${g.more ? `<a href="${esc(g.more[0])}">${esc(g.more[1])}</a>` : ""}</span>`;
    pop.hidden = false; open = b; pinned = !!pin; b.setAttribute("aria-expanded", "true"); place(b);
  };
  const place = (b) => {
    const r = b.getBoundingClientRect(), pw = Math.min(380, innerWidth - 24), vh = innerHeight; pop.style.width = pw + "px"; pop.style.maxHeight = ""; 
    pop.style.left = Math.min(innerWidth - pw - 12, Math.max(12, r.left + r.width / 2 - pw / 2)) + "px";
    let ph = pop.offsetHeight; const room = Math.max(vh - r.bottom - 22, r.top - 22);
    if (ph > room) { pop.style.maxHeight = Math.max(160, room) + "px"; ph = pop.offsetHeight; }
    const below = vh - r.bottom - 22 >= ph || vh - r.bottom >= r.top; pop.style.top = (below ? Math.min(r.bottom + 10, vh - ph - 12) : Math.max(12, r.top - ph - 10)) + "px";
  };
  const close = (refocus) => { clearTimeout(tOpen); if (!open) return; const b = open; pop.hidden = true; open = null; pinned = false; b.setAttribute("aria-expanded", "false"); if (refocus && b.isConnected) b.focus({ preventScroll: true }); };
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".gl");
    if (!b) { if (open && !e.target.closest("#pop")) close(); if (e.target.closest("#pop a")) close(); return; }
    e.preventDefault(); if (open === b && pinned) return close(); show(b, true);
  });
  if (canHover) {
    document.addEventListener("mouseover", (e) => { const b = e.target.closest(".gl"); if (b) { clearTimeout(tClose); if (open !== b) { clearTimeout(tOpen); tOpen = setTimeout(() => show(b, false), 180); } } else if (e.target.closest("#pop")) clearTimeout(tClose); });
    document.addEventListener("mouseout", (e) => { const from = e.target.closest(".gl, #pop"); const to = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(".gl, #pop"); if (!from || (to && (to === open || to.id === "pop"))) return; clearTimeout(tOpen); if (open && !pinned) tClose = setTimeout(() => close(), 220); });
  }
  // Keyboard: focusing a term opens it; moving focus out of both the term and the popover closes it.
  document.addEventListener("focusin", (e) => { const b = e.target.closest && e.target.closest(".gl"); if (b && b.matches(":focus-visible")) show(b, false); });
  document.addEventListener("focusout", (e) => { setTimeout(() => { const a = document.activeElement; if (open && !pinned && !(a && (a === open || a.closest("#pop")))) close(); }, 0); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && open) close(true); });
  addEventListener("scroll", () => open && !pop.matches(":hover") && close(), { passive: true }); addEventListener("resize", () => open && place(open)); addEventListener("hashchange", () => close());
}
