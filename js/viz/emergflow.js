// Emergency flows: pick a scenario, choose the first action, then step through the rest. Content mirrors the lesson text (AFH 11/18, C172S POH 3).
import { htmlScene } from "./kit.js?v=714b944f7b";
import { chips } from "./base.js?v=714b944f7b";
import { h, shuffle } from "../core/util.js?v=714b944f7b";
// scenario: [chip label, cue, first-step options (first is right), why, [steps...], source]
const SETS = {
  fire: [
    ["Engine fire", "Smoke and flames from the cowling.", ["Cut off the fuel: mixture idle cutoff, fuel shutoff OFF", "Open the vents to clear the smoke", "Try a restart to blow the fire out"], "Fuel feeds the fire. Starve it first, and don't restart.",
      ["Mixture idle cutoff, fuel shutoff valve OFF", "Fuel pump and master OFF", "Cabin heat and air closed", "100 KIAS (faster within limits if the fire continues)", "Forced landing; don't restart"], "AFH 18 · C172S POH 3"],
    ["Electrical fire", "The smell of burning insulation.", ["Remove electrical power", "Open the vents to clear the smell", "Reset the popped breakers"], "Electricity is the heat source. Take it away, then fight what's left.",
      ["Master and all switches OFF except the ignition", "Vents and cabin heat closed", "Use the extinguisher", "Ventilate only once the fire is out", "If you need power: breakers checked (don't reset a popped one), circuits back one at a time", "Land as soon as possible"], "AFH 18 · C172S POH 3"],
    ["Cabin fire", "Smoke in the cabin from a heater or wiring.", ["Shut down the faulty system", "Open every vent", "Climb to find smoother air"], "Remove the source first. Airflow can feed a fire.",
      ["Shut down the faulty system", "Use the extinguisher", "Ventilate; if smoke gets worse, close the vents immediately", "Land as soon as possible"], "AFH 18"],
  ],
  ctrl: [
    ["No flaps", "Flaps won't extend.", ["Plan a wider, longer pattern", "Dive steeply to make the runway", "Flare extra high to bleed speed"], "No-flap landings need much more runway, up to about 50% more, and a shallower approach.",
      ["Wider, longer pattern so you don't need to dive", "Expect a higher nose on final; it can hide the runway", "Expect more float in the flare", "Don't over-flare and strike the tail"], "AFH 18"],
    ["Split flaps", "A sudden roll as the flaps move.", ["Opposite aileron and rudder to hold control", "Retract the flaps immediately", "Reduce power to idle"], "One flap moved and the other didn't, so you roll toward the wing with the least flap.",
      ["Opposite aileron (can take nearly full) and rudder against the yaw", "Fly the approach faster than normal", "Avoid a crosswind from the side of the extended flap", "Fly it onto the runway; don't flare into an asymmetric stall"], "AFH 18"],
    ["Elevator cable", "The yoke goes slack in one direction.", ["Use trim and power for pitch", "Pull harder on the yoke", "Lower the flaps fully"], "Separate up and down cables mean a break usually leaves partial control, and trim can still move the elevator.",
      ["Lost up-cable: trim nose-up, fly with forward pressure", "Lost down-cable: trim nose-down, fly with back pressure", "Linkage gone: in flight, airflow on the trim tab still moves the free elevator a little", "Jammed elevator: only power and flaps remain"], "AFH 18"],
  ],
  sys: [
    ["Alternator", "LOW VOLTS and the ammeter shows a discharge.", ["Shed load and plan to land", "Keep everything on and continue", "Turn the master off and on repeatedly"], "The battery alone may last only minutes under a heavy load.",
      ["Try one reset: alternator breaker, cycle the master", "If it fails: alternator off", "Shed every nonessential load; tell ATC", "Land at the nearest suitable airport; expect a no-flap landing", "With the alternator off, the compass can be off by up to 25°"], "AFH 18 · C172S POH 3"],
    ["Static blockage", "In a descent the altimeter lags and the airspeed reads fast.", ["Open the alternate static source", "Pull the pitot heat breaker", "Trust the airspeed and pitch down"], "A static blockage hides until you change altitude.",
      ["Recognize: altimeter lags, VSI shows too little, airspeed reads fast in a descent", "Open the alternate static source while climbing or descending", "If the needles jump, keep using it", "Glass cockpits: the backups may share the same ports"], "AFH 18"],
    ["Oil pressure", "Low oil pressure with high oil temperature.", ["Prepare for a forced landing and land ASAP", "Climb to cool the engine", "Ignore it if the engine sounds normal"], "Together these mean a failing engine.",
      ["Fly the airplane first", "Turn toward the nearest landing site", "Land as soon as possible, ready for a forced landing", "Use the POH table of indications and causes"], "AFH 18"],
  ],
  imc: [
    ["Inadvertent IMC", "The natural horizon is gone.", ["Wings level on the attitude indicator", "Turn back immediately with a steep bank", "Descend quickly to find the ground"], "Untrained pilots typically lose control within about 10 minutes. Keeping the wings level comes first.",
      ["Recognize and accept it: it's an emergency", "Trim for hands-off level flight; fingertip pressure", "Wings level first; pitch changes no more than one bar width", "Turns: no more than 10° of bank", "Climb at most one bar up; descend no more than 500 fpm; no climbing or descending turns", "Tell ATC you're a VFR pilot in IMC and follow their headings"], "AFH 18 · AIM 6-2"],
  ],
  night: [
    ["Engine failure at night", "Quiet, and dark below.", ["Best glide, turn toward an airport", "Turn on the landing light immediately", "Pull up to stretch the glide"], "Same first step as by day: fly the airplane.",
      ["Best glide; turn toward an airport or away from congested areas", "Look for the cause and restart if you can", "Declare the emergency; stay on the frequency you're on unless told to change", "Aim for an unlighted area if you know the terrain is suitable, near public access", "Land into the wind; before-landing checklist", "Landing light on in time to light the terrain", "Slowest airspeed in a normal landing attitude", "After landing: all switches off, get out quickly"], "AFH 11"],
  ],
};
export function mount(host, opts = {}) {
  const set = SETS[opts.set] || SETS.fire;
  let si = 0, n = 0, picked = null;
  const { F, body } = htmlScene(host);
  if (set.length > 1) { F.root.classList.add("ctrl-top"); F.root.insertBefore(F.ctrl, F.stage); } // scenario picker on top so answering never moves it
  if (set.length > 1) chips(F.ctrl, set.map((x, i) => [String(i), x[0]]), "0", (v) => { if (v == null) return; si = +v; n = 0; picked = null; render(); }, { label: "Scenario" });
  const head = h("div"), q = h("div"), list = h("ol", { class: "hv-steps" }), row = h("div", { class: "hv-row" });
  body.append(head, q, list, row);
  let order = [];
  function render() {
    const S = set[si];
    head.innerHTML = `<div class="hv-tag">${S[0]}</div><p class="hv-q">${S[1]}</p>`;
    q.innerHTML = ""; list.innerHTML = ""; row.innerHTML = "";
    if (picked == null) {
      if (!order.length || order._si !== si) { order = shuffle([0, 1, 2]); order._si = si; }
      q.append(h("div", { class: "hv-tag" }, "What do you do first?"));
      const g = h("div", { class: "hv-row", style: "flex-direction:column;align-items:stretch" });
      for (const i of order) { const b = h("button", { class: "hv-btn", type: "button", style: "text-align:left" }, S[2][i]); b.addEventListener("click", () => { picked = i; n = 1; render(); }); g.append(b); }
      q.append(g); F.caption(S[0], "Choose the first action"); return;
    }
    q.innerHTML = `<div class="hv-out"><h4 class="${picked === 0 ? "acc" : ""}">${picked === 0 ? "Right" : "Not first"}</h4><p>${S[3]} <span class="src">${S[5]}</span></p></div>`;
    S[4].slice(0, n).forEach((t, j) => list.append(h("li", { class: "hv-step " + (j === n - 1 ? "on" : "done") }, h("span", { style: "margin:0" }, t))));
    if (n < S[4].length) list.append(h("div", { class: "hv-tag", style: "margin-top:4px" }, `${S[4].length - n} more step${S[4].length - n === 1 ? "" : "s"}`));
    if (n < S[4].length) { const b = h("button", { class: "hv-btn pri", type: "button" }, "Next step"); b.addEventListener("click", () => { n++; render(); }); row.append(b); }
    const r = h("button", { class: "hv-btn", type: "button" }, "Try again"); r.addEventListener("click", () => { picked = null; n = 0; order = []; render(); }); row.append(r);
    F.caption(S[0], `Step ${n} of ${S[4].length}`);
  }
  render();
  F.explain("A memory aid, not a checklist. Confirm the details with your CFI and your aircraft's POH; the manufacturer's procedure takes precedence.");
  return { destroy() { F.destroy(); } };
}
