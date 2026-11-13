// Risk assessment matrix (Risk Management Handbook, FAA-H-8083-2A, Fig 4-1): tap a cell, then try lowering the likelihood.
import { htmlScene } from "./kit.js?v=7534528db0";
import { h } from "../core/util.js?v=7534528db0";
const LIK = [["Probable", "may occur several times", "Prob."], ["Occasional", "may occur sometime", "Occas."], ["Remote", "unlikely, but possible", "Remote"], ["Improbable", "highly unlikely", "Improb."]];
const SEV = [["Catastrophic", "fatalities or total loss"], ["Critical", "severe injury or major damage"], ["Marginal", "minor injury or damage"], ["Negligible", "less than minor"]];
const M = [["high", "high", "serious", "medium"], ["high", "serious", "medium", "low"], ["serious", "medium", "medium", "low"], ["medium", "medium", "medium", "low"]];
const SAY = { high: ["High", "No-go, unless you can lower the risk and a new assessment comes out medium or low."], serious: ["Serious", "No-go, unless you can lower the risk and a new assessment comes out medium or low."], medium: ["Medium", "Go, but mitigate where you can."], low: ["Low", "Go."] };
export function mount(host) {
  let r = 1, c = 1;
  const { F, body } = htmlScene(host);
  body.append(h("div", { class: "hv-tag" }, "Likelihood (rows) × severity (columns) · tap a cell · RMH 4"));
  const grid = h("div", { class: "hv-grid", style: "grid-template-columns: auto repeat(4, minmax(0, 1fr))" }); body.append(grid);
  const out = h("div", { class: "hv-out", "aria-live": "polite" }), row = h("div", { class: "hv-row" }); body.append(out, row);
  const mit = h("button", { class: "hv-btn pri", type: "button" }, "Mitigate: lower the likelihood"); mit.addEventListener("click", () => { if (r < 3) { r++; draw(); } }); row.append(mit);
  function draw() {
    grid.innerHTML = ""; grid.append(h("div", { class: "hv-hd" }, ""));
    SEV.forEach((s) => grid.append(h("div", { class: "hv-hd" }, s[0].slice(0, 5) + ".")));
    LIK.forEach((l, i) => { grid.append(h("div", { class: "hv-hd", style: "justify-content:flex-start;text-align:left", title: l[0] }, l[2]));
      M[i].forEach((lv, j) => { const b = h("button", { class: `hv-cell lv-${lv}${i === r && j === c ? " sel" : ""}`, type: "button", "aria-label": `${l[0]}, ${SEV[j][0]}: ${SAY[lv][0]}` }, SAY[lv][0]); b.addEventListener("click", () => { r = i; c = j; draw(); }); grid.append(b); }); });
    const lv = M[r][c];
    out.innerHTML = `<div class="hv-tag">${LIK[r][0]} (${LIK[r][1]}) × ${SEV[c][0]} (${SEV[c][1]})</div><h4 class="${lv === "high" || lv === "serious" ? "" : "acc"}">${SAY[lv][0]} risk</h4><p>${SAY[lv][1]} <span class="src">RMH 4</span></p>`;
    mit.disabled = r === 3; F.caption("Risk level", SAY[lv][0]);
  }
  draw();
  F.explain("Mitigation usually lowers the likelihood; severity rarely changes. Be honest with the inputs: wanting to go skews them.");
  return { destroy() { F.destroy(); } };
}
