// Autopilot in 3D: the 172 flies in a chase view while the servos (blue) move the ailerons and elevator; a generic mode panel (AP, HDG, NAV, ALT, VS) with an annunciation strip, a small attitude and heading picture,
// single- vs two-axis, and a runaway-trim drill. Modeled loosely on the G1000 GFC 700 (two-axis) and KAP 140 (single-axis);
// your airplane's autopilot supplement is the authority.
// Facts: PHAK 6 (Autopilot): single-axis controls roll (ailerons); two- and three-axis add pitch (elevator) and yaw;
// common modes heading and altitude hold; every autopilot has a disconnect and can be overpowered. C172S NAV III POH
// (GFC 700): AP or PTRM annunciator: control wheel GRASP FIRMLY; A/P TRIM DISC PRESS and HOLD throughout recovery; elevator
// trim ADJUST MANUALLY; AUTO PILOT circuit breaker OPEN; A/P TRIM DISC RELEASE; don't re-engage until fixed. Preflight:
// verify the autopilot can be overpowered and that A/P TRIM DISC disengages it. KAP 140 supplement: avionics master or the
// airplane master also remove autopilot power. Default modes on engage (roll and pitch hold) follow the GFC 700; the
// sped-up time, turn rate and climb rate shown here are illustrative.
// The servos lit here are the generic idea (roll servo -> ailerons, pitch servo -> elevator, trim servo -> trim tab).
import { frame, chips, row } from "./base.js?v=e5f54f3664";
import { h } from "../core/util.js?v=e5f54f3664";
import { planeStage } from "./planestage.js?v=e5f54f3664";
import { tags3d } from "./tags3d.js?v=e5f54f3664";
const tw = (v, t, s) => (Math.abs(t - v) <= s ? t : v + Math.sign(t - v) * s);
const STEPS = [["grasp", "1 · Grasp wheel"], ["disc", "2 · Hold A/P DISC"], ["trim", "3 · Trim by hand"], ["cb", "4 · Pull AP breaker"], ["rel", "5 · Release DISC"]];
const SAY = {
  grasp: ["Wheel in hand", "Good: fly the airplane first. Now press and hold the autopilot disconnect for the whole recovery."],
  disc: ["Disconnect held", "Holding the disconnect stops the trim motor. Now retrim by hand to take the pressure off the wheel."],
  trim: ["Retrimmed", "The nose is back where you want it. Pull the autopilot circuit breaker so the trim can't run again."],
  cb: ["Breaker out", "The autopilot and its electric trim have no power now. You can let go of the disconnect button."],
  rel: ["Recovered", "Hand-fly from here. Don't re-engage the autopilot until the malfunction has been found and fixed."],
};
export function mount(host) {
  let axes = 2, ap = false, lat = "ROL", vert = "PIT", hdg = 90, bank = 0, alt = 5500, sel = 6500, pitch = 0, run = false, step = 0, cb = true, msg = null, flash = 0;
  const F = frame(host, { cls: "ap3d capin", corners: { tl: "Autopilot", tr: "PHAK 6 · POH 3, 9" } });
  const S = planeStage(F.stage, { view: { tg: [-3.4, 4.7, 0], az: 206, el: 18, d: 50 }, maxFps: 30 });
  const ann = h("div", { class: "ap-ann" }); const AC = Array.from({ length: 5 }, () => { const c = h("span"); ann.append(c); return c; }); F.stage.append(ann);
  const band = () => S.setTopBand(ann.offsetTop + ann.offsetHeight + 6); requestAnimationFrame(band);
  const TG = tags3d(F.stage), tR = TG.add("Roll servo → ailerons", { dx: -30, dy: -44 }), tP = TG.add("Pitch servo → elevator", { dx: 30, dy: -40 }), tT = TG.add("Trim running", { dx: 30, dy: 44 });
  const tile = (t) => { const v = h("b"); const el = h("div", { class: "pr-t" }, h("span", {}, t), v); return { el, v }; };
  const tH = tile("Heading"), tA = tile("Altitude"), tTr = tile("Trim"); const tiles = h("div", { class: "pr-p" }, tH.el, tA.el, tTr.el);
  chips(row(F.ctrl, "Type"), [["2", "Two-axis"], ["1", "Single-axis"]], "2", (k) => { axes = k === "1" ? 1 : 2; if (axes === 1) vert = "—"; else if (vert === "—") vert = "PIT"; upd(); }, { label: "Type" });
  const r1 = row(F.ctrl, "Mode"); const g1 = h("div", { class: "chips", role: "group", "aria-label": "Mode" }); r1.append(g1);
  const B = {}; ["AP", "HDG", "NAV", "ALT", "VS"].forEach((k) => { B[k] = h("button", { class: "chip", type: "button" }, k); g1.append(B[k]); B[k].addEventListener("click", () => press(k)); });
  const r2 = row(F.ctrl, "Drill"); const g2 = h("div", { class: "chips", role: "group", "aria-label": "Runaway trim drill" }); r2.append(g2);
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
  F.ctrl.append(tiles);
  let last = performance.now(), capK = "", trimA = 0;
  S.animate(() => { const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now; const k = dt * 4;
    if (flash > 0) flash = Math.max(0, flash - dt);
    if (run && step < 3) { const tgt = step < 2 ? -12 : -6; pitch = tw(pitch, tgt, 4 * dt); alt -= (step < 2 ? 900 : 400) * dt / 15; }
    else if (Math.abs(pitch) > 0.05 && (!ap || vert !== "VS")) pitch = tw(pitch, 0, 6 * dt);
    if (ap && !run) {
      const tgt = lat === "HDG" ? 120 : lat === "NAV" ? 60 : null;
      if (tgt != null && Math.abs(tgt - hdg) > 0.3) { const d = Math.sign(tgt - hdg); hdg += d * Math.min(3 * k, Math.abs(tgt - hdg)); bank = tw(bank, d * 18, 30 * dt); }
      else if (Math.abs(bank) > 0.2) bank = tw(bank, 0, 30 * dt);
      if (vert === "VS") { if (alt < sel - 1) { alt = Math.min(sel, alt + (500 / 60) * k * 2); pitch = tw(pitch, 4, 8 * dt); } else { vert = "ALT"; upd(); } }
    } else if (Math.abs(bank) > 0.2) bank = tw(bank, 0, 30 * dt);
    const rolling = ap && Math.abs(bank) > 0.3 && Math.abs(bank) < 17.7, trimRun = run && step < 2; trimA = trimRun ? (trimA + dt * 6) % (Math.PI * 2) : 0;
    S.setAttitude({ yaw: hdg - 90, pitch, bank });
    S.pose({ ail: ap ? Math.max(-14, Math.min(14, (bank - (lat === "ROL" ? 0 : Math.sign(bank) * 18)) * -0.9)) : 0, elev: run && step < 2 ? 10 : ap && vert === "VS" && alt < sel - 1 ? -6 : 0, trim: trimRun ? 12 * Math.sin(trimA) : 0 });
    const hl = []; if (ap && !run) { hl.push("ailerons"); if (axes === 2) hl.push("elevator"); } if (trimRun) hl.push("trimtab", "elevator");
    const key = hl.join(); if (key !== S._apHl) { S._apHl = key; S.highlight(hl); }
    tR.on = ap && !run; tP.on = ap && !run && axes === 2; tT.on = trimRun;
    TG.place([{ t: tR, q: S.project([-1.6, 7.2, -14]) }, { t: tP, q: S.project([-17.6, 5.0, 3]) }, { t: tT, q: S.project([-17.8, 4.9, 1.6]) }], ann.offsetTop + ann.offsetHeight + 8);
    const cells = [[ap ? "AP" : flash > 0 ? "AP" : "", ap ? "g" : "y"], [ap ? lat : "", "g"], [ap && axes === 2 ? vert : "", "g"], [ap && vert === "VS" ? "ALTS" : "", "w"], [run && step < 2 ? "PTRM" : "", "r"]];
    cells.forEach(([t, c], i) => { if (AC[i].textContent !== t) AC[i].textContent = t; AC[i].className = c; });
    tH.v.textContent = String(Math.round((hdg + 360) % 360)).padStart(3, "0") + "°"; tA.v.textContent = (Math.round(alt / 10) * 10).toLocaleString() + " ft"; tTr.v.textContent = trimRun ? "RUNNING" : "normal"; tTr.el.classList.toggle("bad", trimRun);
    const cap = msg || (!ap ? ["Autopilot off", "You're hand-flying. Press AP to engage; it starts by holding the roll and pitch you have now."]
      : lat === "HDG" ? ["Heading mode", "The autopilot turns to the heading bug (120°) and holds it. Watch it bank, and be ready to take over."]
      : lat === "NAV" ? ["Nav mode", "The autopilot steers to track the selected course (060°). Keep checking it goes where you expect."]
      : vert === "VS" ? ["Vertical speed", "Climbing at the set rate toward the selected altitude (6,500 ft), then it captures and holds it."]
      : vert === "ALT" ? ["Altitude hold", "Holding the current altitude with the elevator. Power is still yours: watch the airspeed."]
      : ["Roll and pitch hold", "Engaged in its basic modes: wings level and the current pitch. Pick a mode to do more."]);
    if (cap[0] + cap[1] !== capK) { capK = cap[0] + cap[1]; F.caption(cap[0], cap[1]); }
    let busy = flash > 0 || (run && step < 3);
    if (Math.abs(pitch) > 0.05 && (!ap || vert !== "VS") && !(run && step < 3)) busy = true;
    if (ap && !run) {
      const tgt = lat === "HDG" ? 120 : lat === "NAV" ? 60 : null;
      if (tgt != null && Math.abs(tgt - hdg) > 0.3) busy = true;
      else if (Math.abs(bank) > 0.2) busy = true;
      if (vert === "VS" && alt < sel - 1) busy = true;
    } else if (Math.abs(bank) > 0.2) busy = true;
    return busy; }, { idle: true });
  function upd() { B.AP.classList.toggle("on", ap); ["HDG", "NAV"].forEach((m) => B[m].classList.toggle("on", ap && lat === m)); ["ALT", "VS"].forEach((m) => B[m].classList.toggle("on", ap && vert === m));
    SB.forEach((b, i) => {
      const visible = run && i <= Math.min(step, STEPS.length - 1);
      b.hidden = !visible; b.disabled = !(run && i === step && step < STEPS.length);
      b.classList.toggle("on", run && i < step); b.classList.toggle("pri", run && i === step && step < STEPS.length);
    });
    rb.disabled = run; S.kick(); }
  F.explain(`<p>A generic panel; your airplane's autopilot supplement has the real buttons and limits. Blue shows which surfaces the autopilot's servos are moving. Time is sped up. <span class="src">PHAK 6 · C172S POH 3, 9</span></p>`);
  upd();
  return { destroy() { S.destroy(); F.destroy(); } };
}
