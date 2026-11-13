// Autopilot: a generic mode panel (AP, HDG, NAV, ALT, VS) with an annunciation strip, a small attitude and heading picture,
// single- vs two-axis, and a runaway-trim drill. Modeled loosely on the G1000 GFC 700 (two-axis) and KAP 140 (single-axis);
// your airplane's autopilot supplement is the authority.
// Facts: PHAK 6 (Autopilot): single-axis controls roll (ailerons); two- and three-axis add pitch (elevator) and yaw;
// common modes heading and altitude hold; every autopilot has a disconnect and can be overpowered. C172S NAV III POH
// (GFC 700): AP or PTRM annunciator: control wheel GRASP FIRMLY; A/P TRIM DISC PRESS and HOLD throughout recovery; elevator
// trim ADJUST MANUALLY; AUTO PILOT circuit breaker OPEN; A/P TRIM DISC RELEASE; don't re-engage until fixed. Preflight:
// verify the autopilot can be overpowered and that A/P TRIM DISC disengages it. KAP 140 supplement: avionics master or the
// airplane master also remove autopilot power. Default modes on engage (roll and pitch hold) follow the GFC 700; the
// sped-up time, turn rate and climb rate shown here are illustrative.
import { chips, row } from "./base.js?v=771fe5f0ea";
import { h } from "../core/util.js?v=771fe5f0ea";
import { pxScene, T, L, P, C, R, INK, GRAY, DIM, ACC } from "./kit.js?v=771fe5f0ea";
import { anim, COL } from "./dial.js?v=771fe5f0ea";
const tw = (v, t, s) => (Math.abs(t - v) <= s ? t : v + Math.sign(t - v) * s);
const STEPS = [["grasp", "Grasp wheel"], ["disc", "Hold A/P DISC"], ["trim", "Trim by hand"], ["cb", "Pull AP breaker"], ["rel", "Release DISC"]];
const SAY = {
  grasp: ["Wheel in hand", "Good: fly the airplane first. Now press and hold the autopilot disconnect for the whole recovery."],
  disc: ["Disconnect held", "Holding the disconnect stops the trim motor. Now retrim by hand to take the pressure off the wheel."],
  trim: ["Retrimmed", "The nose is back where you want it. Pull the autopilot circuit breaker so the trim can't run again."],
  cb: ["Breaker out", "The autopilot and its electric trim have no power now. You can let go of the disconnect button."],
  rel: ["Recovered", "Hand-fly from here. Don't re-engage the autopilot until the malfunction has been found and fixed."],
};
export function mount(host) {
  let axes = 2, ap = false, lat = "ROL", vert = "PIT", hdg = 90, bank = 0, alt = 5500, sel = 6500, pitch = 0, run = false, step = 0, cb = true, msg = null, flash = 0;
  const S = pxScene(host, { cls: "tall ap", corners: { tl: "Autopilot", tr: "PHAK 6 · POH 3, 9" } }, draw);
  chips(row(S.F.ctrl, "Type"), [["2", "Two-axis"], ["1", "Single-axis"]], "2", (k) => { axes = k === "1" ? 1 : 2; if (axes === 1) vert = "—"; else if (vert === "—") vert = "PIT"; upd(); }, { label: "Type" });
  const r1 = row(S.F.ctrl, "Mode"); const g1 = h("div", { class: "chips", role: "group", "aria-label": "Mode" }); r1.append(g1);
  const B = {}; ["AP", "HDG", "NAV", "ALT", "VS"].forEach((k) => { B[k] = h("button", { class: "chip", type: "button" }, k); g1.append(B[k]); B[k].addEventListener("click", () => press(k)); });
  const r2 = row(S.F.ctrl, "Drill"); const g2 = h("div", { class: "chips", role: "group", "aria-label": "Runaway trim drill" }); r2.append(g2);
  const rb = h("button", { class: "chip", type: "button" }, "Runaway trim"); g2.append(rb);
  const SB = STEPS.map(([k, t], i) => { const b = h("button", { class: "chip", type: "button" }, t); g2.append(b); b.addEventListener("click", () => doStep(i)); return b; });
  rb.addEventListener("click", () => { if (!cb) cb = true; ap = true; run = true; step = 0; msg = ["Runaway trim", "The nose is pitching down and the trim wheel is spinning by itself. Start the memory items now."]; upd(); });
  function press(k) { if (run) return; msg = null;
    if (k === "AP") { if (!cb) { msg = ["No power", "The autopilot breaker is out. It stays out until the malfunction is fixed on the ground."]; } else { ap = !ap; if (ap) { lat = "ROL"; vert = axes === 2 ? "PIT" : "—"; } else flash = 2; } }
    else if (!ap) msg = ["Autopilot off", "Engage AP first. Without it, the mode keys only arm the flight director on many systems."];
    else if (k === "HDG" || k === "NAV") lat = lat === k ? "ROL" : k;
    else if (axes === 1) msg = ["Single-axis", "A single-axis autopilot only controls roll. Pitch and altitude stay with you, by hand and trim."];
    else vert = vert === k ? "PIT" : k;
    upd(); }
  function doStep(i) { if (!run) return; if (i !== step) { msg = ["Out of order", `Next step: ${STEPS[step][1].toLowerCase()}. Work the memory items in order, starting with flying the airplane.`]; upd(); return; }
    const k = STEPS[i][0]; step++; msg = SAY[k]; if (k === "disc") { ap = false; flash = 2; } if (k === "cb") cb = false; if (k === "rel") run = false; upd(); }
  const A = anim(S.F, (dt) => { const k = dt * 4; let more = false;
    if (flash > 0) { flash = Math.max(0, flash - dt); more = true; }
    if (run && step < 3) { const tgt = step < 2 ? -12 : -6; pitch = tw(pitch, tgt, 4 * dt); alt -= (step < 2 ? 900 : 400) * dt / 15; more = true; }
    else if (Math.abs(pitch) > 0.05 && (!ap || vert !== "VS")) { pitch = tw(pitch, 0, 6 * dt); more = true; }
    if (ap && !run) {
      const tgt = lat === "HDG" ? 120 : lat === "NAV" ? 60 : null;
      if (tgt != null && Math.abs(tgt - hdg) > 0.3) { const d = Math.sign(tgt - hdg); hdg += d * Math.min(3 * k, Math.abs(tgt - hdg)); bank = tw(bank, d * 18, 30 * dt); more = true; }
      else if (Math.abs(bank) > 0.2) { bank = tw(bank, 0, 30 * dt); more = true; }
      if (vert === "VS") { if (alt < sel - 1) { alt = Math.min(sel, alt + (500 / 60) * k * 2); pitch = tw(pitch, 4, 8 * dt); more = true; } else { vert = "ALT"; more = true; } }
    } else if (Math.abs(bank) > 0.2) { bank = tw(bank, 0, 30 * dt); more = true; }
    S.redraw(); return more; });
  function upd() { B.AP.classList.toggle("on", ap); ["HDG", "NAV"].forEach((m) => B[m].classList.toggle("on", ap && lat === m)); ["ALT", "VS"].forEach((m) => B[m].classList.toggle("on", ap && vert === m));
    SB.forEach((b, i) => { b.disabled = !run; b.classList.toggle("on", run && i < step); }); rb.disabled = run; S.redraw(); A.kick(); }
  function draw(g, W, H, top) {
    const wide = W >= 600, sx = wide ? 30 : 14, sw = W - 2 * sx, sy = top + 8;
    // annunciation strip
    R(g, sx, sy, sw, 30, { fill: "#0A0A0B", stroke: DIM, sw: 1, rx: 4 });
    const cells = [[ap ? "AP" : flash > 0 ? "AP" : "", ap ? COL.green : COL.yellow], [ap ? lat : "", COL.green], [ap && axes === 2 ? vert : "", COL.green], [ap && vert === "VS" ? "ALTS" : "", INK], [run && step < 2 ? "PTRM" : "", COL.red]];
    cells.forEach(([t, col], i) => { if (t) T(g, sx + sw * (i + 0.5) / cells.length, sy + 20, t, { size: 13, weight: 700, anchor: "middle", fill: col }); if (i) L(g, sx + sw * i / cells.length, sy + 6, sx + sw * i / cells.length, sy + 24, { stroke: DIM, w: 1 }); });
    // attitude ball
    const r = Math.min(wide ? 110 : 90, (H - sy - 70) / 2), cx = wide ? sx + r + 20 : W / 2, cy = sy + 50 + r;
    const b = (-bank * Math.PI) / 180, off = pitch * (r / 30);
    const dx = Math.cos(b) * r * 2, dy = Math.sin(b) * r * 2;
    g.append(Object.assign(document.createElementNS("http://www.w3.org/2000/svg", "clipPath"), { id: "apclip" })); C(g.lastChild, cx, cy, r, { fill: "#000" });
    const gnd = P(g, `M${cx - dx},${cy + off - dy} L${cx + dx},${cy + off + dy} L${cx + dx - dy * 2},${cy + off + dy + dx * 2} L${cx - dx - dy * 2},${cy + off - dy + dx * 2} Z`, { fill: "#6B4A2B", stroke: "none" });
    const sky = C(g, cx, cy, r, { fill: "#2F5E8C" }); g.insertBefore(sky, gnd); gnd.setAttribute("clip-path", "url(#apclip)");
    L(g, cx - dx, cy + off - dy, cx + dx, cy + off + dy, { stroke: INK, w: 1.5 }).setAttribute("clip-path", "url(#apclip)");
    C(g, cx, cy, r, { stroke: GRAY, sw: 1.5 }); L(g, cx - r * 0.45, cy, cx - r * 0.12, cy, { stroke: COL.yellow, w: 4 }); L(g, cx + r * 0.12, cy, cx + r * 0.45, cy, { stroke: COL.yellow, w: 4 });
    // readouts
    const tx = wide ? cx + r + 40 : sx, ty = wide ? sy + 70 : cy + r + 26, cols = wide ? 1 : 3, cw = wide ? 0 : sw / 3;
    [["HEADING", String(Math.round((hdg + 360) % 360)).padStart(3, "0") + "°"], ["ALTITUDE", Math.round(alt / 10) * 10 + " ft"], ["TRIM", run && step < 2 ? "RUNNING" : "normal"]].forEach(([k, v], i) => {
      const x = wide ? tx : tx + i * cw, y = wide ? ty + i * 50 : ty; T(g, x, y, k, { size: 11, fill: GRAY }); T(g, x, y + 20, v, { size: 15, weight: 600, fill: k === "TRIM" && run && step < 2 ? COL.red : INK }); });
    if (wide) T(g, tx, ty + 150, "Bug 120° · course 060° · selected 6,500 ft", { size: 11, fill: DIM });
    const cap = msg || (!ap ? ["Autopilot off", "You're hand-flying. Press AP to engage; it starts by holding the roll and pitch you have now."]
      : lat === "HDG" ? ["Heading mode", "The autopilot turns to the heading bug and holds it. Watch it bank, and be ready to take over."]
      : lat === "NAV" ? ["Nav mode", "The autopilot steers to track the selected course. Keep checking it goes where you expect."]
      : vert === "VS" ? ["Vertical speed", "Climbing at the set rate toward the selected altitude, then it captures and holds altitude."]
      : vert === "ALT" ? ["Altitude hold", "Holding the current altitude with the elevator. Power is still yours: watch the airspeed."]
      : ["Roll and pitch hold", "Engaged in its basic modes: wings level and the current pitch. Pick a mode to do more."]);
    S.F.caption(cap[0], cap[1]);
  }
  S.F.explain(`<p>A generic panel; your airplane's autopilot supplement has the real buttons and limits. Time is sped up.</p>`);
  upd();
  return { destroy: () => { A.stop(); S.F.destroy(); } };
}
