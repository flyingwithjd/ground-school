// Chair-fly trainer: tap the checklist items in order from memory. Items are from the C172S POH Section 3/4
// (172S NAV III, G1000). Confirm with your CFI and your aircraft's POH.
import { frame, chips } from "./base.js?v=053e7723ad";
import { h, esc, shuffle } from "../core/util.js?v=053e7723ad";
export const DRILLS = {
  roll: { name: "Engine failure, takeoff roll", src: "C172S POH 3", steps: ["Throttle: IDLE", "Brakes: APPLY", "Wing flaps: RETRACT", "Mixture: IDLE CUTOFF", "Magnetos: OFF", "STBY BATT: OFF", "Master (ALT and BAT): OFF"] },
  after: { name: "Engine failure after takeoff", src: "C172S POH 3", steps: ["Airspeed: 70 KIAS flaps up, 65 KIAS flaps 10° to full", "Mixture: IDLE CUTOFF", "Fuel shutoff valve: OFF", "Magnetos: OFF", "Wing flaps: AS REQUIRED (full recommended)", "STBY BATT: OFF", "Master (ALT and BAT): OFF", "Cabin door: UNLATCH", "Land: STRAIGHT AHEAD"] },
  restart: { name: "Engine failure in flight (restart)", src: "C172S POH 3", steps: ["Airspeed: 68 KIAS (best glide)", "Fuel shutoff valve: ON", "Fuel selector: BOTH", "Fuel pump: ON", "Mixture: RICH (if restart has not occurred)", "Magnetos: BOTH (START if the propeller has stopped)", "Fuel pump: OFF"] },
  forced: { name: "Emergency landing without power", src: "C172S POH 3", steps: ["Seat backs: MOST UPRIGHT", "Seats and seat belts: SECURE", "Airspeed: 70 KIAS flaps up, 65 KIAS flaps 10° to full", "Mixture: IDLE CUTOFF", "Fuel shutoff valve: OFF", "Magnetos: OFF", "Wing flaps: AS REQUIRED (full recommended)", "STBY BATT: OFF", "Master: OFF when landing is assured", "Doors: UNLATCH before touchdown", "Touchdown: SLIGHTLY TAIL LOW", "Brakes: APPLY HEAVILY"] },
  efire: { name: "Engine fire in flight", src: "C172S POH 3", steps: ["Mixture: IDLE CUTOFF", "Fuel shutoff valve: OFF", "Fuel pump: OFF", "Master (ALT and BAT): OFF", "Cabin vents: OPEN as needed", "Cabin heat and cabin air: OFF", "Airspeed: 100 KIAS (faster if needed, within limits)", "Forced landing: EXECUTE"] },
  elfire: { name: "Electrical fire in flight", src: "C172S POH 3", steps: ["STBY BATT: OFF", "Master (ALT and BAT): OFF", "Cabin vents: CLOSED", "Cabin heat and cabin air: OFF", "Fire extinguisher: ACTIVATE (if available)", "Avionics (BUS 1 and 2): OFF", "All other switches except magnetos: OFF", "Vents, heat and air: OPEN when the fire is out"] },
  secure: { name: "Securing airplane", src: "C172S POH 4", steps: ["Parking brake: SET", "Throttle: IDLE", "Electrical equipment: OFF", "Avionics (BUS 1 and 2): OFF", "Mixture: IDLE CUTOFF", "Magnetos: OFF", "Master (ALT and BAT): OFF", "STBY BATT: OFF", "Control lock: INSTALL", "Fuel selector: LEFT or RIGHT"] },
  bstart: { name: "Before starting engine", src: "C172S POH 4", steps: ["Preflight inspection: COMPLETE", "Passenger briefing: COMPLETE", "Seats and seat belts: ADJUST and LOCK", "Brakes: TEST and SET", "Circuit breakers: CHECK IN", "Electrical equipment: OFF", "Avionics (BUS 1 and 2): OFF", "Fuel selector: BOTH", "Fuel shutoff valve: ON"] },
};
export function mount(host, opts = {}) {
  const keys = opts.drills || ["after", "restart", "forced"]; let key = keys[0], pool, next, miss, t0;
  const F = frame(host, { cls: "capin chairfly", corners: { tl: "Chair-fly", tr: "Confirm with your CFI and POH" } });
  const wrap = h("div", { class: "cf-wrap" }); F.stage.append(wrap);
  function reset() { const D = DRILLS[key]; pool = shuffle(D.steps.map((s, i) => ({ s, i }))); next = 0; miss = 0; t0 = 0; draw(); F.caption("Tap the steps in order", D.name); }
  function draw(flash) { const D = DRILLS[key]; wrap.innerHTML = "";
    const done = h("ol", { class: "cf-done" }); D.steps.slice(0, next).forEach((s) => { const li = h("li"); li.textContent = s; done.append(li); });
    const left = h("div", { class: "cf-pool" });
    pool.filter((o) => o.i >= next).forEach((o) => { const b = h("button", { type: "button", class: "cf-item" + (flash === o.i ? " bad" : "") }); b.textContent = o.s;
      b.addEventListener("click", () => { if (!t0) t0 = performance.now(); if (o.i === next) { next++; draw(); } else { miss++; draw(o.i); } }); left.append(b); });
    const stat = h("p", { class: "label cf-stat" });
    if (next >= D.steps.length) { const sec = t0 ? ((performance.now() - t0) / 1000).toFixed(1) : "0"; stat.textContent = `Complete · ${sec} s · ${miss} wrong tap${miss === 1 ? "" : "s"}`; const again = h("button", { type: "button", class: "btn" }); again.textContent = "Again"; again.onclick = reset; wrap.append(done, stat, again); }
    else { stat.textContent = `Step ${next + 1} of ${D.steps.length}${miss ? ` · ${miss} wrong` : ""}`; wrap.append(done, stat, left); }
    F.explain(`Say each item aloud and touch the control as you tap it. Speed comes from accuracy. Items are from the C172S POH (NAV III); yours may differ. <b>Confirm with your CFI and your aircraft's POH.</b> <span class="src">${esc(D.src)}</span>`); }
  if (keys.length > 1) chips(F.ctrl, keys.map((k) => [k, DRILLS[k].name]), key, (v) => { key = v; reset(); }, { label: "Checklist" });
  reset();
  return { destroy: () => F.destroy() };
}
