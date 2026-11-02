// Airport signs (AIM 2-3-7 to 2-3-13; AC 150/5340-18H). Learn: tap a sign for what it means and what you do.
// Drill: a random sign, pick its meaning. Real sign colors are used here because the color IS the message.
import { frame, chips } from "./base.js?v=69d1e15885";
import { h, shuffle } from "../core/util.js?v=69d1e15885";
const R = "sg-red", K = "sg-loc", Yl = "sg-dir", B = "sg-dist";
const HOLD4 = `<svg viewBox="0 0 40 30" class="sg-g"><path d="M2,6H38M2,12H38" stroke="currentColor" stroke-width="2.4" stroke-dasharray="5 3"/><path d="M2,18H38M2,24H38" stroke="currentColor" stroke-width="2.4"/></svg>`;
const LADDER = `<svg viewBox="0 0 40 30" class="sg-g"><path d="M2,9H38M2,21H38" stroke="currentColor" stroke-width="2.4"/><path d="M6,9V21M10,9V21M18,9V21M22,9V21M30,9V21M34,9V21" stroke="currentColor" stroke-width="2"/></svg>`;
export const SIGNS = [
  { id: "hold", cls: R, html: "15-33", kind: "Mandatory · runway holding position", mean: "You are at the holding position for runway 15-33. Runway 15's threshold is to the left, 33's to the right.", act: "Stop. Towered: do not cross or enter without an ATC clearance. Nontowered: cross only after making sure the runway and approaches are clear.", src: "AIM 2-3-8" },
  { id: "toff", cls: R, html: "33", kind: "Mandatory · holding position at the runway's beginning", mean: "Holding position for runway 33, where the taxiway meets the beginning of the takeoff runway.", act: "Stop. Enter only with a clearance (towered) or when clear and announced (nontowered).", src: "AIM 2-3-8" },
  { id: "apch", cls: R, html: "15-APCH", kind: "Mandatory · approach area holding position", mean: "You are holding in the approach area of runway 15. Taxiing past could interfere with aircraft on approach.", act: "When ATC says to hold short of the runway 15 approach area, stop so no part of the airplane extends past the marking.", src: "AIM 2-3-8" },
  { id: "ils", cls: R, html: "ILS", kind: "Mandatory · ILS critical area holding position", mean: "Holding position for the ILS critical area.", act: "Hold here when instructed. Do not cross without an ATC clearance.", src: "AIM 2-3-5, 2-3-8" },
  { id: "noent", cls: R + " sg-noentry", html: `<svg viewBox="0 0 40 40" class="sg-ne"><circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" stroke-width="3.4"/><path d="M9,20H31" stroke="currentColor" stroke-width="5"/></svg>`, kind: "Mandatory · no entry", mean: "Aircraft are prohibited from entering this area, such as a one-way taxiway or a vehicle roadway.", act: "Do not enter. Stop and get directions.", src: "AIM 2-3-8" },
  { id: "tloc", cls: K, html: "B", kind: "Location · taxiway", mean: "You are on taxiway B.", act: "Confirm you are where your clearance or plan says you should be.", src: "AIM 2-3-9" },
  { id: "rloc", cls: K, html: "22", kind: "Location · runway", mean: "You are on runway 22.", act: "Cross-check with your heading indicator and compass that this is the runway you meant.", src: "AIM 2-3-9" },
  { id: "rbound", cls: Yl, html: HOLD4, kind: "Location · runway boundary", mean: "Faces the runway; seen as you exit. Marks the edge of the runway's protected area.", act: "Taxi until the whole airplane is past it. Then you are clear of the runway.", src: "AIM 2-3-9" },
  { id: "ibound", cls: Yl, html: LADDER, kind: "Location · ILS critical area boundary", mean: "Seen as you leave the ILS critical area.", act: "Taxi until the whole airplane is past it. Then you are clear of the ILS critical area.", src: "AIM 2-3-9" },
  { id: "dir", cls: "sg-array", html: `<span class="sg-dir">&#8598;&nbsp;A</span><span class="sg-loc">B</span><span class="sg-dir">C&nbsp;&#8594;</span>`, kind: "Direction, with a location sign", mean: "You are on B. Taxiway A goes off to the left, C to the right. Designations run clockwise from your left.", act: "Pick the arrow that matches your cleared route; turns left are left of the location sign.", src: "AIM 2-3-10" },
  { id: "dest", cls: Yl, html: "FUEL&nbsp;&#8594;", kind: "Destination", mean: "The taxi route to the fuel area is to the right.", act: "Follow it if fuel is where you are going. A destination sign always has an arrow.", src: "AIM 2-3-11" },
  { id: "dest2", cls: Yl, html: "&#8592;&nbsp;22&#8226;27", kind: "Destination · outbound", mean: "Runways 22 and 27 share a common taxi route to the left (the dot joins them).", act: "Turn left for either departure runway.", src: "AIM 2-3-11" },
  { id: "info", cls: Yl, html: "CTAF&nbsp;122.8", kind: "Information (example)", mean: "Information from the airport operator: here a radio frequency. Other examples: areas the tower can't see, noise abatement.", act: "Read it and use it. It is not an instruction to stop.", src: "AIM 2-3-12" },
  { id: "dist", cls: B, html: "3", kind: "Runway distance remaining", mean: "3,000 feet of runway remain.", act: "Use it to judge takeoff and landing progress, such as when to abort.", src: "AIM 2-3-13" },
];
const GROUPS = [["all", "All"], ["mand", "Mandatory (red)"], ["loc", "Location (black)"], ["dir", "Direction & info (yellow)"]];
const inGroup = (sg, gr) => gr === "all" || (gr === "mand" && sg.cls.includes(R)) || (gr === "loc" && (sg.cls === K || sg.id.endsWith("bound"))) || (gr === "dir" && ["dir", "dest", "dest2", "info", "dist"].includes(sg.id));
const signEl = (sg, big) => { const e = h("span", { class: "sg " + sg.cls + (big ? " big" : ""), role: "img", "aria-label": sg.kind }); e.innerHTML = sg.html; return e; };
export function mount(host, opts = {}) {
  const F = frame(host, { cls: "capin signs", corners: { tl: "Airport signs", tr: "AIM 2-3-7 to 2-3-13" } });
  const wall = h("div", { class: "sg-wall" }); F.stage.append(wall);
  let mode = opts.mode || "learn", grp = "all", score = [0, 0];
  function learn() { wall.innerHTML = ""; wall.className = "sg-wall";
    for (const sg of SIGNS.filter((x) => inGroup(x, grp))) { const b = h("button", { class: "sg-btn", type: "button", "aria-label": sg.kind }, signEl(sg)); b.addEventListener("click", () => show(sg, b)); wall.append(b); }
    F.caption("Tap a sign", "Red means stop"); F.explain("Red with white: mandatory, an entrance to a runway or critical area, or no entry. Black with yellow: where you are. Yellow with black: where to go, or information. Black with white: runway distance remaining. <span class=\"src\">AIM 2-3-7 to 2-3-13</span>"); }
  function show(sg, b) { wall.querySelectorAll(".sg-btn").forEach((x) => x.classList.toggle("on", x === b)); F.caption(sg.kind, sg.id === "info" ? "Information" : sg.kind.split(" · ")[0]);
    F.explain(`<b>What it means:</b> ${sg.mean}<br><b>What you do:</b> ${sg.act} <span class="src">${sg.src}</span>`); }
  function drill() { wall.innerHTML = ""; wall.className = "sg-wall drill"; const pool = SIGNS.filter((x) => inGroup(x, grp)); const sg = pool[Math.floor(Math.random() * pool.length)];
    wall.append(signEl(sg, true)); F.caption(`Drill · ${score[0]}/${score[1]}`, "What does it mean?"); F.explain("");
    const others = shuffle(SIGNS.filter((x) => x.id !== sg.id && x.mean !== sg.mean)).slice(0, 3); const opts2 = shuffle([sg, ...others]);
    const box = h("div", { class: "sg-choices" }); wall.append(box);
    opts2.forEach((o) => { const b = h("button", { class: "chip", type: "button" }, o.mean); b.addEventListener("click", () => { if (box.dataset.done) return; box.dataset.done = 1; const ok = o.id === sg.id; score[1]++; if (ok) score[0]++;
      b.classList.add(ok ? "ok" : "bad"); box.querySelectorAll("button").forEach((x, i) => { if (opts2[i].id === sg.id) x.classList.add("ok"); });
      F.caption(`Drill · ${score[0]}/${score[1]}`, ok ? "Correct" : "Not quite"); F.explain(`<b>${sg.kind}.</b> ${sg.act} <span class="src">${sg.src}</span>`);
      const nx = h("button", { class: "chip on", type: "button" }, "Next sign"); nx.addEventListener("click", drill); box.append(nx); }); box.append(b); }); }
  chips(F.ctrl, [["learn", "Learn"], ["drill", "Drill"]], mode, (v) => { mode = v; v === "learn" ? learn() : drill(); }, { label: "Mode" });
  chips(F.ctrl, GROUPS, grp, (v) => { grp = v; mode === "learn" ? learn() : drill(); }, { label: "Sign family" });
  mode === "learn" ? learn() : drill();
  return { destroy: () => F.destroy() };
}
