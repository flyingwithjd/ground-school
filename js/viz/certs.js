// Aircraft papers you can see (GL1 "design"): an AROW strip on top, and the document it names drawn below as a SAMPLE.
// A = standard airworthiness certificate (FAA Form 8100-2, white) or special (FAA Form 8130-7, pink), R = certificate of
// aircraft registration (AC Form 8050-3), O = operating limitations, W = weight and balance; the ghosted fifth tile is the
// radio station license, needed only outside the US. Tap a field to light it in blue and read what it means.
// Sources: PHAK Ch 9 (Fig 9-8, 9-9); 14 CFR 21.175, 21.181, 47.31(c), 47.40, 47.41, 91.9, 91.203.
import { pxScene, T, R, L, hit, INK, GRAY, DIM, ACC, ACCF } from "./kit.js?v=7109f603b7";
import { chips } from "./base.js?v=7109f603b7";
import { s } from "../core/util.js?v=7109f603b7";
const PINK = "#F2A7C3", PINKF = "rgba(242,167,195,.13)", WHITEF = "rgba(242,241,236,.07)";
const wrapT = (str, n) => { const out = []; let line = ""; for (const w of String(str).split(" ")) { if ((line + " " + w).trim().length > n) { out.push(line.trim()); line = w; } else line += " " + w; } if (line.trim()) out.push(line.trim()); return out; };
const TILES = [
  { k: "A", name: "Airworthiness certificate" }, { k: "R", name: "Registration certificate" },
  { k: "O", name: "Operating limitations" }, { k: "W", name: "Weight and balance" },
  { k: "X", letter: "R", name: "Radio station license", ghost: true },
];
// Each document: title lines, then fields [id, label, value, what it means, source].
const DOCS = {
  std: { tint: WHITEF, edge: INK, head: ["UNITED STATES OF AMERICA", "DEPT OF TRANSPORTATION · FAA"], title: "STANDARD AIRWORTHINESS CERTIFICATE",
    fields: [
      ["reg", "1  NATIONALITY AND REGISTRATION MARKS", "N0SQK (sample)", "N means registered in the United States. The certificate must carry the airplane's registration number, so check that it matches the number painted on the airplane.", "PHAK Ch 9 · 14 CFR 91.203(a)(1)"],
      ["mm", "2  MANUFACTURER AND MODEL", "Cessna 172S", "The make and model the certificate was issued for.", "PHAK Ch 9"],
      ["sn", "3  AIRCRAFT SERIAL NUMBER", "172S00000 (sample)", "The manufacturer's serial number, the same one on the airplane's data plate.", "PHAK Ch 9"],
      ["cat", "4  CATEGORY", "Normal / Utility", "The category the airplane must be operated in, and with it the limitations for that category. A white certificate means normal, utility, acrobatic, commuter or transport, a manned free balloon or a special class.", "PHAK Ch 9 · 14 CFR 21.175(a)"],
      ["basis", "5  AUTHORITY AND BASIS FOR ISSUANCE", "Conforms to its type certificate", "When it was issued, the airplane conformed to its type certificate and was in condition for safe operation. Any exemption is noted under Exceptions; otherwise it says NONE.", "PHAK Ch 9"],
      ["terms", "6  TERMS AND CONDITIONS", "No expiration date", "It stays effective as long as maintenance, preventive maintenance and alterations follow Parts 21, 43 and 91 and the airplane stays registered in the US. So a valid certificate depends on current inspections, not on a date.", "PHAK Ch 9 · 14 CFR 21.181(a)(1)"],
      ["disp", "MUST BE DISPLAYED", "At the cabin or cockpit entrance", "It must be displayed at the cabin or cockpit entrance where passengers or crew can read it, not tucked in a pocket.", "14 CFR 91.203(b)"],
    ] },
  spc: { tint: PINKF, edge: PINK, head: ["UNITED STATES OF AMERICA", "DEPT OF TRANSPORTATION · FAA"], title: "SPECIAL AIRWORTHINESS CERTIFICATE",
    fields: [
      ["reg", "A  REGISTRATION MARKS", "N0SQK (sample)", "Same rule as the white certificate: it carries the airplane's registration number.", "14 CFR 91.203(a)(1)"],
      ["cat", "B  CATEGORY / PURPOSE", "e.g. Light-sport · Experimental · Restricted", "Pink certificates are for primary, restricted, limited and light-sport aircraft, provisional certificates, experimental aircraft and special flight permits (ferry permits).", "PHAK Ch 3, 9 · 14 CFR 21.175(b)"],
      ["lim", "C  OPERATING LIMITATIONS", "Issued with the certificate", "A special certificate comes with operating limitations of its own, which go in the airplane with it.", "PHAK Ch 9"],
      ["ferry", "SPECIAL FLIGHT PERMIT", "Valid only for the time stated", "A ferry permit lets an airplane that may not meet airworthiness requirements fly safely to a place for repair or inspection. It lasts only as long as the permit says.", "14 CFR 21.181(a)(2), 21.197"],
      ["disp", "MUST BE DISPLAYED", "At the cabin or cockpit entrance", "Pink or white, the airworthiness certificate is displayed where passengers or crew can read it.", "14 CFR 91.203(b)"],
    ] },
  reg: { tint: WHITEF, edge: INK, head: ["UNITED STATES OF AMERICA", "DEPT OF TRANSPORTATION · FAA"], title: "CERTIFICATE OF AIRCRAFT REGISTRATION",
    fields: [
      ["mark", "NATIONALITY AND REGISTRATION MARKS", "N0SQK (sample)", "The N-number this airplane is registered under. It must match the airworthiness certificate and the airplane.", "PHAK Ch 9 · 14 CFR 91.203"],
      ["air", "MANUFACTURER, MODEL · SERIAL NO.", "Cessna 172S · 172S00000", "Identifies the airframe the registration belongs to.", "PHAK Ch 9"],
      ["own", "REGISTERED OWNER", "Sample Flying Club, Anytown USA", "Issued to the owner as evidence of registration. It is not a title: the FAA doesn't certify ownership on it. A sale, destruction or the owner losing US citizenship ends it.", "PHAK Ch 9 · 14 CFR 47.41"],
      ["iss", "DATE OF ISSUE", "March 14, 2026 (sample)", "Registration is counted from the month it was issued.", "14 CFR 47.40(a)"],
      ["exp", "EXPIRATION DATE", "March 31, 2033", "It expires 7 years after the last day of the month it was issued: issued in March 2026, good through March 31, 2033. Renewal can be filed in the 6 months before.", "14 CFR 47.40"],
      ["carry", "MUST BE IN THE AIRCRAFT", "Carried on every flight", "An effective registration certificate must be in the airplane. While a new one is on its way, the second copy of the application (often pink) works as temporary authority, inside the US only.", "14 CFR 91.203(a)(2), 47.31(c)"],
    ] },
  ops: { tint: WHITEF, edge: INK, head: ["APPROVED FLIGHT MANUAL / POH"], title: "OPERATING LIMITATIONS",
    fields: [
      ["afm", "SECTION 2 · LIMITATIONS", "Airspeeds, powerplant, weights, CG", "The approved flight manual or POH holds the limits the airplane must be flown within. It must be on board.", "14 CFR 91.9 · PHAK Ch 9"],
      ["mark", "INSTRUMENT MARKINGS", "e.g. airspeed arcs and red line", "Colored arcs and lines on the instruments are operating limitations too.", "14 CFR 91.9(a)"],
      ["plac", "PLACARDS", "e.g. fuel grade, maneuvering speed", "Placards in the cabin state limits and instructions. Flying contrary to them breaks 91.9.", "14 CFR 91.9 · PHAK Ch 9"],
    ] },
  wb: { tint: WHITEF, edge: INK, head: ["AIRPLANE WEIGHT AND BALANCE"], title: "CURRENT WEIGHT AND BALANCE",
    fields: [
      ["ew", "BASIC EMPTY WEIGHT", "1,680 lb (sample)", "This airplane's own empty weight, measured or recomputed after changes. Yours is in your airplane's records, not the brochure.", "AFH Ch 2 · PHAK Ch 10"],
      ["arm", "EMPTY CG ARM · MOMENT", "39.8 in · 66,864 lb-in (sample)", "Where that empty weight balances. You start every loading calculation from these numbers.", "PHAK Ch 10"],
      ["date", "DATE OF RECORD", "The most recent entry", "Use the current data: equipment changes alter the empty weight and CG.", "AFH Ch 2"],
    ] },
  radio: { tint: "none", edge: DIM, ghost: true, head: ["FEDERAL COMMUNICATIONS COMMISSION"], title: "RADIO STATION LICENSE",
    fields: [
      ["intl", "WHEN IT'S NEEDED", "Only for flights outside the US", "The second R of the old ARROW memory aid. It is not needed for flights within the United States, which is why this course uses AROW.", "PHAK Ch 9 · AFH Ch 2"],
    ] },
};
export function mount(host) {
  let tile = "A", kind = "std", sel = null;
  const docKey = () => (tile === "A" ? kind : tile === "R" ? "reg" : tile === "O" ? "ops" : tile === "W" ? "wb" : "radio");
  const sc = pxScene(host, { cls: "xtall certs", corners: { tl: "Papers on board · AROW", tr: "Sample" } }, draw);
  const kc = chips(sc.F.ctrl, [["std", "Standard · white"], ["spc", "Special · pink"]], kind, (v) => { kind = v; sel = null; sc.redraw(); }, { label: "Airworthiness certificate type" });
  function draw(g, W, H, top) {
    const ph = W < 520, M = ph ? 10 : 18, tw = Math.min(W - 2 * M, 640), x0 = (W - tw) / 2;
    // AROW strip
    const n = TILES.length, gap = ph ? 6 : 10, tl = (tw - gap * (n - 1)) / n, th = ph ? 46 : 52;
    TILES.forEach((t, i) => { const x = x0 + i * (tl + gap), on = tile === t.k, gg = s("g", {}, g);
      const r = R(gg, x, top, tl, th, { stroke: on ? ACC : t.ghost ? DIM : GRAY, sw: on ? 2 : 1.2, fill: on ? ACCF : "rgba(10,10,11,.6)", rx: 8, dash: t.ghost ? "4 4" : null });
      T(gg, x + tl / 2, top + th / 2 + 1, t.letter || t.k, { size: ph ? 22 : 26, anchor: "middle", base: "middle", weight: 600, fill: on ? INK : t.ghost ? DIM : INK, mono: false });
      if (t.ghost) L(gg, x + 8, top + th - 8, x + tl - 8, top + 8, { stroke: DIM, w: 1.2 });
      hit(gg, r, t.name + (t.ghost ? " (flights outside the US only)" : ""), () => { tile = t.k; sel = null; kc.enable(tile === "A" ? ["std", "spc"] : []); sc.redraw(); }); });
    const D = DOCS[docKey()], cur = TILES.find((t) => t.k === tile);
    let y = top + th + 10;
    T(g, x0, y + 6, (cur.ghost ? "Not on board for US flights · " : "") + cur.name.toUpperCase(), { size: 11, fill: cur.ghost ? DIM : GRAY, base: "middle" });
    y += 18;
    // the document card
    const dh = H - y - 10, card = s("g", {}, g); R(card, x0, y, tw, dh, { stroke: D.edge, sw: 1.4, fill: D.tint, rx: 6, dash: D.ghost ? "5 4" : null, op: D.ghost ? 0.9 : 1 });
    R(card, x0 + 4, y + 4, tw - 8, dh - 8, { stroke: D.edge, sw: 0.6, rx: 4, op: 0.45 });
    const wm = T(card, x0 + tw / 2, y + dh / 2, "SAMPLE", { size: ph ? 54 : 72, anchor: "middle", base: "middle", weight: 700, fill: D.edge, op: 0.06, mono: false });
    wm.setAttribute("transform", `rotate(-24 ${x0 + tw / 2} ${y + dh / 2})`);
    let cy = y + 16; const ix = x0 + 14, iw = tw - 28, cpl = Math.floor(iw / 6.9);
    D.head.forEach((t) => { T(card, x0 + tw / 2, cy, t, { size: 11, anchor: "middle", fill: GRAY, base: "hanging" }); cy += 14; });
    const tl2 = wrapT(D.title, Math.floor(iw / 8.7)); tl2.forEach((t) => { T(card, x0 + tw / 2, cy + 2, t, { size: 13, anchor: "middle", weight: 700, base: "hanging", ls: 0.8 }); cy += 17; });
    cy += 6; L(card, ix, cy, ix + iw, cy, { stroke: D.edge, w: 0.8, op: 0.5 }); cy += 6;
    // fields share the remaining height
    const left = y + dh - 10 - cy, fh = Math.min(64, left / D.fields.length);
    D.fields.forEach(([id, lab, val, mean, src]) => { const on = sel === id, gg = s("g", {}, card), fy = cy;
      const r = R(gg, ix - 4, fy + 2, iw + 8, fh - 4, { stroke: on ? ACC : "rgba(242,241,236,.0)", sw: on ? 2 : 1, fill: on ? ACCF : "rgba(0,0,0,0.001)", rx: 5 });
      const ll = wrapT(lab, cpl); const vl = wrapT(val, Math.floor(iw / 7.6));
      let ty = fy + 8; ll.slice(0, 2).forEach((t) => { T(gg, ix, ty, t, { size: 11, fill: on ? ACC : GRAY, base: "hanging" }); ty += 13; });
      vl.slice(0, fh > 50 ? 2 : 1).forEach((t) => { T(gg, ix, ty + 1, t, { size: 13, fill: INK, weight: 600, base: "hanging", mono: false }); ty += 16; });
      if (fy + fh < y + dh - 12) L(gg, ix, fy + fh, ix + iw, fy + fh, { stroke: D.edge, w: 0.6, op: 0.22 });
      hit(gg, r, lab + ": " + val, () => { sel = id; sc.F.caption(lab.replace(/^[0-9A-C]\s+/, "").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()), val); sc.F.explain(`${mean} <span class="src">${src}</span>`); sc.redraw(); });
      cy += fh; });
    if (!sel) { sc.F.caption(cur.name, tile === "A" ? (kind === "std" ? "White · standard" : "Pink · special") : tile === "R" ? "Expires after 7 years" : tile === "O" ? "AFM/POH, markings, placards" : tile === "W" ? "Current empty weight and CG" : "Outside the US only");
      sc.F.explain(tile === "X" ? "AROW lists what must be on board for a flight in the US. The radio station license only matters for international flights. <span class=\"src\">14 CFR 91.9, 91.203 · PHAK Ch 9</span>" : "Tap a field on the document to see what it means. The letters on top are the AROW papers that must be on board; this is a generic sample, not a real certificate. <span class=\"src\">14 CFR 91.9, 91.203 · PHAK Ch 9</span>"); }
  }
  return { destroy() { sc.F.destroy(); } };
}
