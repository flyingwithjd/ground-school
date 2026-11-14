// Walkaround with "Spot the defect" (GL1 "walk"): six stations in a generic POH order, counterclockwise from the cabin door.
// Tap a station: the camera glides there and lights only that area. Each station has a few findings; for each, decide
// Ground it or All clear, then see why (AFH Ch 2). A ring on the model marks where the finding is. Orbit on the canvas only.
// Sources: FAA-H-8083-3C AFH Ch 2 (preflight assessment); C172S POH Sec 4 (oil 5 qt minimum, 8 qt capacity).
import { frame, chips } from "./base.js?v=43931b26b4";
import { planeStage } from "./planestage.js?v=43931b26b4";
import { rich } from "../core/rich.js?v=43931b26b4";
import { h } from "../core/util.js?v=43931b26b4";
const A = "AFH 2";
export const STATIONS = [
  { k: "cabin", t: "Cabin", view: "cabin", hl: ["fuselage"], check: "Papers aboard, [[control lock]] out, switches off, fuel selector in every position including OFF, belts, seats locked in their rails, windows, instruments.",
    f: [
      { t: "Seat-rail holes worn oval", d: "The seat lock pin barely catches; the rail holes are stretched long.", bad: true, why: "Worn rail holes can let the seat slide back on takeoff, away from the controls. A mechanic must fix it first.", p: [1.2, 5.2, -1.6] },
      { t: "Red X's on the display", d: "Right after master on, a few readouts show red X's, then fill in within a minute.", bad: false, why: "Normal: an X stays until its sensor comes alive. An X that never clears is a failed sensor.", p: [2.2, 5.4, -0.6] },
      { t: "Cloudy compass with a bubble", d: "The [[magnetic compass]] face is milky and a bubble floats in it.", bad: true, why: "A compass with bubbles or a cloudy face is unusable. Write it up.", p: [2.6, 6.2, 0] } ] },
  { k: "tail", t: "Tail", view: "tail", hl: ["fin", "hstab", "rudder", "elevator", "trimtab"], check: "Control surfaces and hinges secure and free, [[trim tab]] secure, [[spar|Spars]] lines and attach points smooth, tips and fairings free of cracks.",
    f: [
      { t: "Crack past a stop-drill hole", d: "A crack in the fiberglass tip runs on past the small drilled hole at its end.", bad: true, why: "[[Stop-drilling]] is meant to end a crack. One that continues beyond it can lead to in-flight failure.", p: [-17.4, 5.0, -5.4] },
      { t: "Crack that ends at its stop-drill", d: "An old crack in a fairing stops at its drilled hole. No new cracks beside it.", bad: false, why: "A crack stopped at its stop-drill hole is an accepted repair. Look for any new or longer crack each time.", p: [-17.4, 5.0, 5.4] },
      { t: "Black ring around rivet heads", d: "Along the stabilizer's spar line, a few [[rivet]] heads have a dark, sooty ring.", bad: true, why: "That black oxide forms when a rivet works loose in its hole. Ground it until inspected.", p: [-16.2, 5.0, -2.5] } ] },
  { k: "rwing", t: "Right wing", view: "wingR", hl: ["wing", "fuel", "struts"], check: "Fuel quantity by eye, cap secure, [[fuel vent]] clear, drain each sump, skin along the spar line, [[strut]] attach points, aileron and flap.",
    f: [
      { t: "Fuel stain along a rivet line", d: "A faint blue streak runs along a rivet line under the wing, near the tank.", bad: true, why: "Any fuel stain near a tank needs a mechanic's look, no matter how old it seems. It is a sign of a leak.", p: [-2.5, 8.4, 6.5] },
      { t: "Rush of air when you open the cap", d: "The fuel cap hisses as you crack it open.", bad: true, why: "Air rushing in means the tank vent may be blocked. A blocked vent can starve the engine in flight.", p: [-1.5, 9.0, 3.2] },
      { t: "Tank full, cap seated, vent clear", d: "Fuel at the level you planned, the cap seals and locks, and the vent tube is open.", bad: false, why: "Exactly what you want. Still sample every drain before flight.", p: [-1.5, 9.0, 3.2] } ] },
  { k: "gear", t: "Main gear", view: "gear", hl: ["gear"], check: "Tires (roll the airplane to see all of them), brake disc and pads, brake line dry, gear leg and attach area, wheel pant with a flashlight.",
    f: [
      { t: "Cords showing through the tread", d: "One spot on the tire is worn through to the fabric cords.", bad: true, why: "Visible cords, cuts or bulges make a tire unairworthy.", p: [-1.3, 0.7, -3.7] },
      { t: "Wet brake line", d: "A drop of red fluid hangs from the brake line fitting.", bad: true, why: "Any amount of leaking fluid is unacceptable. A leaking brake may not stop you.", p: [-1.3, 1.2, -3.4] },
      { t: "Even wear, no cuts", d: "You rolled the airplane forward a little; the whole tire has even tread and no damage.", bad: false, why: "Good: moving the airplane lets you see the part of the tire that was sitting on the ramp.", p: [-1.3, 0.7, -3.7] } ] },
  { k: "nose", t: "Nose", view: "nose", hl: ["engine", "propeller", "cowling"], check: "Oil on the [[dipstick]], cowl fasteners, inside the cowl for leaks and nests, [[spinner]] and prop, air filter, nose strut and tire.",
    f: [
      { t: "Nick in the prop", d: "A small nick on the propeller's leading edge, near the tip.", bad: true, why: "A nick is a stress riser that can grow into a crack and throw a blade. A mechanic must dress it first.", p: [8.0, 6.6, -0.4] },
      { t: "Bird nest in the cowl", d: "Twigs and grass behind the cowl inlet.", bad: true, why: "A nest blocks cooling air and can catch fire. Remove it and check for more before you go.", p: [7.4, 3.6, -1.0] },
      { t: "Crack in the spinner", d: "A hairline crack runs back from a spinner screw.", bad: true, why: "Cracks, missing fasteners or dents make a spinner unairworthy.", p: [8.4, 4.1, -0.2] },
      { t: "Oil at 6 quarts, engine cold", d: "Clean amber oil reads 6 qt on the dipstick before the first flight of the day.", bad: false, why: "Above the 5 qt minimum (8 qt full) in the 172S POH. Remember it reads lower right after a flight.", p: [6.2, 5.2, 0.6] },
      { t: "White stain at an exhaust pipe", d: "A chalky white streak by an exhaust stack.", bad: true, why: "White stains mean an exhaust leak, which can bring carbon monoxide into the cabin.", p: [6.4, 2.6, -1.0] } ] },
  { k: "lwing", t: "Left wing", view: "wingL", hl: ["wing", "fuel", "struts"], check: "Same as the right wing, plus the [[stall warning]] opening and the [[leading edge]] for dents.",
    f: [
      { t: "Dent in the leading edge", d: "A dent the size of a coin in the leading edge, probably hangar rash.", bad: true, why: "Some dents make the structure unairworthy. Let a mechanic decide before flight.", p: [-0.4, 8.3, -10.5] },
      { t: "Ripples along the spar line", d: "Faint waves in the skin along the rivet line across the wing.", bad: true, why: "Ripples, creases or bubbles on a spar line can mean internal damage.", p: [-2.0, 8.7, -7.5] },
      { t: "Smooth leading edge", d: "No dents, the stall warning opening is clear, the fuel cap is tight.", bad: false, why: "All good. Finish the wing and the walkaround is done.", p: [-0.4, 8.3, -5.5] } ] },
];
export function mount(host) {
  const F = frame(host, { cls: "walk capin p3cap", corners: { tl: "Walkaround · POH order", tr: "" } });
  const S = planeStage(F.stage, { view: "iso", maxFps: 30 });
  const band = () => { const c = F.stage.querySelector(".corner.tl"); if (c) S.setTopBand(c.offsetTop + c.offsetHeight + 6); }; band(); requestAnimationFrame(band);   // corner labels never sit over the model
  const mark = h("div", { class: "wk-mark", "aria-hidden": "true" }); F.stage.append(mark);
  let si = 0, fi = 0, answered = false, right = 0, tries = 0;
  const st = chips(F.ctrl, STATIONS.map((s, i) => [String(i), `${i + 1} ${s.t}`]), "0", (v) => go(+v), { label: "Stations" });
  const card = h("div", { class: "wk-card" });
  const bGround = h("button", { type: "button", class: "btn wk-no" }, "Ground it"), bOk = h("button", { type: "button", class: "btn ghost" }, "All clear"), bNext = h("button", { type: "button", class: "btn ghost arrow" }, "Next finding");
  const ft = h("div", { class: "wk-f" }); card.append(h("div", { class: "wk-btns" }, bGround, bOk, bNext), ft); F.ctrl.append(card);
  // the ring follows the model while the camera glides or you orbit
  const place = () => { const f = STATIONS[si].f[fi]; const q = S.project(f.p); mark.style.transform = `translate(${q.x - 14}px, ${q.y - 14}px)`; mark.style.opacity = q.z < 1 ? 1 : 0; };
  S.animate(place, { idle: true });   // ring only needs a frame when the camera moves (glide or orbit already kicks)
  function show() { const s = STATIONS[si], f = s.f[fi]; answered = false; mark.classList.remove("bad", "ok");
    ft.innerHTML = `<span class="wk-n">Finding ${fi + 1} of ${s.f.length}</span><b>${rich(f.t)}</b><p>${rich(f.d)}</p><p class="wk-v">Your call: ground it, or all clear?</p>`;
    bGround.disabled = bOk.disabled = false; }
  function answer(sayBad) { if (answered) return; answered = true; const f = STATIONS[si].f[fi], good = sayBad === f.bad; tries++; if (good) right++;
    mark.classList.add(f.bad ? "bad" : "ok"); bGround.disabled = bOk.disabled = true;
    ft.querySelector(".wk-v").outerHTML = `<p class="wk-v ${good ? "yes" : "no"}"><b>${good ? "Right" : "Not quite"}: ${f.bad ? "ground it" : "all clear"}.</b> ${rich(f.why)} <span class="src">${A}</span></p>`;
    F.corner("tr", `${right} of ${tries} right`); }
  bGround.onclick = () => answer(true); bOk.onclick = () => answer(false);
  bNext.onclick = () => { const s = STATIONS[si]; fi = (fi + 1) % s.f.length; show(); };
  function go(i) { si = i; fi = 0; st.set(String(i)); const s = STATIONS[i]; S.highlight(s.hl); S.setView(s.view); F.caption(`Station ${i + 1} of 6`, s.t); F.explain(`<b>Check here:</b> ${rich(s.check)} <span class="src">AFH 2 · your POH</span>`); show(); }
  go(0);
  return { destroy() { S.destroy(); F.destroy(); } };
}
