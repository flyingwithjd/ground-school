// Special use airspace (AIM 3-4): tap a type to see whether you can go in and who to ask.
import { htmlScene } from "./kit.js?v=2481aa7edd";
import { h } from "../core/util.js?v=2481aa7edd";
const TY = [
  ["P", "Prohibited", "No", "Flight is prohibited, for security or other reasons of national welfare. Regulatory.", "AIM 3-4-2"],
  ["R", "Restricted", "Only with authorization", "Often invisible hazards like artillery, aerial gunnery or guided missiles. Entering without authorization from the using or controlling agency may be extremely hazardous. Regulatory. Temporary restricted areas aren't charted.", "AIM 3-4-3"],
  ["W", "Warning", "Yes, at your own risk", "Like restricted, but beginning 3 NM off the coast, so it can be over international water. Nonregulatory.", "AIM 3-4-4"],
  ["MOA", "Military operations area", "Yes, VFR is legal: use extreme caution", "Separates military training (air combat tactics, aerobatics, low-altitude tactics) from IFR traffic. For its status, call any FSS within 100 miles; before entering an active MOA, contact the controlling agency for traffic advisories. Nonregulatory.", "AIM 3-4-5"],
  ["A", "Alert", "Yes, stay alert", "High volume of pilot training or unusual activity. Everyone is equally responsible for collision avoidance. Nonregulatory.", "AIM 3-4-6"],
  ["CFA", "Controlled firing area", "Yes", "Not charted, because the activity is suspended immediately when spotters or radar see an aircraft approaching. Nonregulatory.", "AIM 3-4-7"],
  ["NSA", "National security area", "Avoid voluntarily", "Pilots are asked to voluntarily avoid flying through. Flight can be temporarily prohibited under 14 CFR 99.7, announced by NOTAM. Nonregulatory.", "AIM 3-4-8"],
];
export function mount(host) {
  const { F, body } = htmlScene(host, { corners: {} });
  body.append(h("div", { class: "hv-tag" }, "Special use airspace · tap a type · AIM 3-4"));
  const grid = h("div", { class: "hv-cards" }); body.append(grid);
  const out = h("div", { class: "hv-out", "aria-live": "polite" }); body.append(out);
  const btns = TY.map((t, i) => { const b = h("button", { class: "hv-cell", type: "button", "aria-pressed": "false" }, t[0] + " · " + t[1]); b.addEventListener("click", () => pick(i)); grid.append(b); return b; });
  function pick(i) { const t = TY[i]; btns.forEach((b, j) => { b.classList.toggle("sel", i === j); b.setAttribute("aria-pressed", i === j); });
    out.innerHTML = `<div class="hv-tag">Can a VFR pilot enter?</div><h4 class="${t[2] === "No" ? "" : "acc"}">${t[2]}</h4><p>${t[3]} <span class="src">${t[4]}</span></p>`; }
  pick(1);
  F.explain("Permanent areas are charted with their altitudes, times of use and controlling agency. Temporary restricted areas and temporary MOAs aren't charted, so check NOTAMs. <span class=\"src\">AIM 3-4-1</span>");
  return { destroy() { F.destroy(); } };
}
