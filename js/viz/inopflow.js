// Inoperative equipment without an MEL (14 CFR 91.213(d)): answer four questions about the broken item.
import { htmlScene } from "./kit.js?v=771fe5f0ea";
import { h } from "../core/util.js?v=771fe5f0ea";
const Q = [
  ["Is it part of the VFR-day type-certification equipment?", "Type-certification equipment"],
  ["Is it marked required on the equipment list or the Kinds of Operations Equipment List (KOEL) for this kind of flight?", "Equipment list / KOEL"],
  ["Is it required by 91.205 or another rule for this kind of flight?", "91.205 and other rules"],
  ["Is it required by an airworthiness directive?", "Airworthiness directive"],
];
export function mount(host) {
  const { F, body } = htmlScene(host);
  body.append(h("div", { class: "hv-tag" }, "No MEL · 14 CFR 91.213(d)"));
  const list = h("ol", { class: "hv-steps" }); body.append(list);
  const out = h("div", { class: "hv-out", "aria-live": "polite" }); body.append(out);
  const reset = h("button", { class: "hv-btn", type: "button" }, "Start over"); reset.addEventListener("click", () => go(0)); body.append(h("div", { class: "hv-row" }, reset));
  function go(i, failed) {
    list.innerHTML = ""; out.innerHTML = "";
    Q.forEach((q, j) => { const li = h("li", { class: "hv-step " + (j < i ? "done" : j === i && failed == null ? "on" : failed === j ? "on" : "hid") }, h("b", {}, q[1]), h("span", {}, q[0]));
      if (j === i && failed == null) { const row = h("div", { class: "hv-row", style: "margin-top:10px" }); const y = h("button", { class: "hv-btn", type: "button" }, "Yes"), n = h("button", { class: "hv-btn pri", type: "button" }, "No");
        y.addEventListener("click", () => go(i, i)); n.addEventListener("click", () => go(i + 1)); row.append(y, n); li.append(row); }
      list.append(li); });
    if (failed != null) out.innerHTML = `<div class="hv-tag">Result</div><h4>Not without repair</h4><p>The item is required. Get it repaired, or a special flight permit (14 CFR 21.197) to fly it to where it can be fixed. <span class="src">14 CFR 91.213(d)</span></p>`;
    else if (i >= Q.length) out.innerHTML = `<div class="hv-tag">Result</div><h4 class="acc">May be deferred</h4><p>Remove it (placard the control, enter it in the maintenance records) or deactivate it and placard it "Inoperative". A pilot or mechanic must decide it isn't a hazard for this flight. Confirm with your CFI and your aircraft's POH. <span class="src">14 CFR 91.213(d)</span></p>`;
  }
  go(0);
  F.explain("Answer for the specific item and the specific flight (day or night, VFR or IFR). Any \"yes\" grounds the airplane.");
  return { destroy() { F.destroy(); } };
}
