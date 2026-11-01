// Mnemonic unpacker: tap a letter to open the item, the reason it matters and its source.
// Recall mode hides the items so you can say each one before you tap. HTML only; every set is cited.
import { frame, chips } from "./base.js?v=b0dcfd86cb";
import { h, esc } from "../core/util.js?v=b0dcfd86cb";
export const SETS = {
  atomato: { name: "ATOMATOFLAMES", what: "Day VFR equipment", src: "14 CFR 91.205(b)", items: [
    ["A", "Airspeed indicator", "Stall and limit speeds are all indicated airspeeds."], ["T", "Tachometer for each engine", "Power settings and engine limits."],
    ["O", "Oil pressure gauge (pressure systems)", "First warning of an engine about to fail."], ["M", "Manifold pressure gauge (altitude engines)", "Not on a C172S: its engine isn't an altitude engine."],
    ["A", "Altimeter", "Terrain, traffic and airspace separation."], ["T", "Temperature gauge (liquid-cooled engines)", "Not applicable to the air-cooled C172S."],
    ["O", "Oil temperature gauge (air-cooled engines)", "Overheating shows here."], ["F", "Fuel gauge for each tank", "Know what's in each tank."],
    ["L", "Landing gear position indicator (retractable gear)", "Fixed gear on a C172S."], ["A", "Anticollision lights (small airplanes certificated after March 11, 1996)", "If one fails, you may continue to where it can be repaired."],
    ["M", "Magnetic direction indicator", "The compass is the backup when everything else fails."], ["E", "ELT, if required by 91.207", "Inspected every 12 calendar months; battery replaced after 1 cumulative hour of use or 50% of its life."],
    ["S", "Safety belts, and shoulder harnesses where required", "Belt for each occupant 2 years or older; front-seat harness for airplanes made after July 18, 1978."]] },
  flaps: { name: "FLAPS", what: "Night VFR adds", src: "14 CFR 91.205(c)", items: [
    ["F", "Fuses: one spare set, or three of each kind, accessible in flight", "Only if the airplane uses fuses; many use circuit breakers."], ["L", "Landing light, if operated for hire", ""],
    ["A", "Anticollision light system", "Aviation red or white."], ["P", "Position lights", "Red left, green right, white tail."], ["S", "Source of electrical energy, adequate for all installed equipment", ""]] },
  arrow: { name: "ARROW", what: "Documents on board", src: "14 CFR 91.203, 91.9; PHAK Ch 9", items: [
    ["A", "Airworthiness certificate", "Displayed at the cabin or cockpit entrance, legible to passengers or crew. 91.203(a)(1), (b)."], ["R", "Registration certificate", "91.203(a)(2)."],
    ["R", "Radio station license (FCC)", "Needed only when operating outside the United States. It's an FCC requirement, not an FAA one. PHAK Ch 9."],
    ["O", "Operating limitations", "The approved flight manual or POH, markings and placards. 91.9."], ["W", "Weight and balance data", "Part of the approved flight manual for the airplane."]] },
  av1ate: { name: "AV1ATE", what: "Required inspections", src: "14 CFR 91.207, 91.409, 91.411, 91.413", items: [
    ["A", "Annual inspection, within the preceding 12 calendar months", "Every aircraft. 91.409(a)."], ["V", "VOR check", "IFR only. Not needed for VFR flight."],
    ["1", "100-hour inspection, if carrying people for hire or giving flight instruction in an airplane the instructor provides", "May be exceeded by up to 10 hours to reach a place where it can be done. 91.409(b)."],
    ["A", "Altimeter and static system, within 24 calendar months", "Required for IFR in controlled airspace. 91.411."], ["T", "Transponder, within 24 calendar months", "Required to use the transponder. 91.413."],
    ["E", "ELT: inspect within 12 calendar months", "Battery replaced after 1 cumulative hour of use or 50% of its useful life. 91.207."]] },
  limits: { list: true, name: "61.89", what: "Student pilot in command may not", src: "14 CFR 61.89(a)", items: [
    ["1", "Carry a passenger", "Solo means you are the sole occupant. 61.87(a)."], ["2", "Carry property for compensation or hire", ""], ["3", "Fly for compensation or hire", ""], ["4", "Fly in furtherance of a business", ""],
    ["5", "Fly internationally", "One exception: solo training flights between certain Alaska towns and Whitehorse, Yukon."], ["6", "Fly with visibility under 3 SM by day or 5 SM at night", "Flight or surface visibility."],
    ["7", "Fly without visual reference to the surface", "No flying on top of clouds."], ["8", "Fly contrary to any limitation in your logbook", "Your instructor's written limits are binding."]] },
  imsafe: { name: "IMSAFE", what: "Am I fit to fly?", src: "PHAK Ch 2", items: [
    ["I", "Illness", "Am I sick?"], ["M", "Medication", "Am I taking anything that could affect my judgment or make me drowsy?"], ["S", "Stress", "Pressure from work, money, health or family hurts concentration."],
    ["A", "Alcohol", "Within 8 hours? Within 24? 14 CFR 91.17 sets 8 hours and 0.04 as legal minimums only."], ["F", "Fatigue", "One of the most insidious hazards: it may not show until you make serious errors."], ["E", "Emotion", "Am I emotionally upset?"]] },
  pave: { name: "PAVE", what: "Four risk categories", src: "PHAK Ch 2", items: [
    ["P", "Pilot in command", "Experience, recency, currency, physical and emotional condition (IMSAFE)."], ["A", "Aircraft", "Airworthy, equipped and able to perform the flight with the fuel and load you plan."],
    ["V", "enVironment", "Weather, terrain, airports, airspace, day or night."], ["E", "External pressures", "Schedules, passengers, the need to get there."]] },
  decide: { name: "DECIDE", what: "A decision loop", src: "PHAK Ch 2", items: [
    ["D", "Detect the problem", "Recognize that a change occurred, or that an expected change did not."], ["E", "Estimate the need to react", "Overreaction and fixation can be as dangerous as doing nothing."], ["C", "Choose a course of action", "Decide the desirable outcome first."],
    ["I", "Identify solutions", "Form a plan that gets you to that outcome."], ["D", "Do the necessary actions", "Carry out the plan."], ["E", "Evaluate the effect", "Check the result, then loop again."]] },
  p3: { name: "3P", what: "Perceive, Process, Perform", src: "PHAK Ch 2", items: [
    ["P", "Perceive", "The hazards: use PAVE (Pilot, Aircraft, enVironment, External pressures)."], ["P", "Process", "Their impact: use CARE (Consequences, Alternatives, Reality, External factors)."],
    ["P", "Perform", "The best course of action: use TEAM (Transfer, Eliminate, Accept, Mitigate). Then evaluate and repeat."]] },
  attitudes: { name: "Five attitudes", what: "Hazardous attitudes and antidotes", src: "PHAK Ch 2, Fig 2-4", items: [
    ["A", "Anti-authority: \"Don't tell me.\"", "Antidote: Follow the rules. They are usually right."], ["I", "Impulsivity: \"Do it quickly.\"", "Antidote: Not so fast. Think first."],
    ["I", "Invulnerability: \"It won't happen to me.\"", "Antidote: It could happen to me."], ["M", "Macho: \"I can do it.\"", "Antidote: Taking chances is foolish."],
    ["R", "Resignation: \"What's the use?\"", "Antidote: I'm not helpless. I can make a difference."]] },
  abcde: { name: "ABCDE", what: "Engine failure in flight (a common training mnemonic, not a POH checklist)", src: "C172S POH 3; AFH 18", items: [
    ["A", "Airspeed: 68 KIAS, best glide", "Pitch for best glide first. Altitude is time."], ["B", "Best place to land", "Pick a field within gliding distance, ideally into the wind."],
    ["C", "Checklist", "Engine failure during flight (restart): fuel shutoff ON, selector BOTH, fuel pump ON, mixture RICH, magnetos BOTH (or START if the prop has stopped)."],
    ["D", "Declare", "Mayday on 121.5 MHz with location and intentions; squawk 7700."],
    ["E", "Execute", "Emergency landing without engine power checklist: 70 KIAS flaps up, 65 KIAS flaps 10° to full; secure fuel and ignition; doors unlatched before touchdown."]] },
};
export function mount(host, opts = {}) {
  const keys = opts.sets || [opts.set || "imsafe"]; let key = keys[0], recall = false, open = -1;
  const F = frame(host, { cls: "capin mnemo", corners: { tl: "Mnemonic", tr: "" } });
  const wrap = h("div", { class: "mn-wrap" }); F.stage.append(wrap);
  function draw() { const S = SETS[key]; wrap.innerHTML = "";
    const row = h("div", { class: "mn-row" });
    S.items.forEach((it, i) => { const b = h("button", { class: "mn-l" + (i === open ? " on" : ""), type: "button", "aria-label": it[0] + ": " + it[1] }); b.innerHTML = `<b>${esc(it[0])}</b>${recall && i !== open ? "" : `<span>${esc(it[1])}</span>`}`;
      b.addEventListener("click", () => { open = open === i ? -1 : i; draw(); }); row.append(b); });
    wrap.append(row);
    const it = S.items[open]; const det = h("div", { class: "mn-det" });
    det.innerHTML = it ? `<span class="label">${esc(it[0])} · ${esc(S.name)}</span><h4>${esc(it[1])}</h4><p>${esc(it[2] || "")}</p>` : `<p class="label">Tap a letter${recall ? " after you say the item out loud" : ""}</p>`;
    wrap.append(det);
    F.caption(S.what, S.name); F.explain(`${recall ? "Say each item before you tap it. " : ""}${S.list ? "Know each item and the reason for it." : "A mnemonic is a memory aid, not the rule itself. Learn the reason behind each item."} <span class="src">${esc(S.src)}</span>`); }
  if (keys.length > 1) chips(F.ctrl, keys.map((k) => [k, SETS[k].name]), key, (v) => { key = v; open = -1; draw(); }, { label: "Set" });
  chips(F.ctrl, [["learn", "Learn"], ["recall", "Recall"]], "learn", (v) => { recall = v === "recall"; open = -1; draw(); }, { label: "Mode" });
  draw();
  return { destroy: () => F.destroy() };
}
