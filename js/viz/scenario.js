// Scenario cards (review plan item 3): made-up situations at generic airports, two decisions each, every choice graded and
// explained, tagged with the ACS risk-management elements it practices. Data: data/scenarios.js. HTML scene, no animation.
import { htmlScene } from "./kit.js?v=27c70f9d2b";
import { chips } from "./base.js?v=27c70f9d2b";
import { h } from "../core/util.js?v=27c70f9d2b";
import { autoTerms } from "../core/rich.js?v=27c70f9d2b";
import { SCEN } from "../../data/scenarios.js?v=27c70f9d2b";
const GR = { best: ["Best choice", "go"], ok: ["Workable, not best", "ok"], poor: ["Risky", "no"] };
// stable shuffle per scenario step, so the best answer isn't always first
const order = (seed, n) => { let x = 0; for (const c of seed) x = (x * 31 + c.charCodeAt(0)) >>> 0; const a = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { x = (x * 1103515245 + 12345) >>> 0; const j = x % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const terms = (el) => { autoTerms(el); return el; };   // run before the element joins the .viz, which the auto-linker skips
export function mount(host, opts = {}) {
  const list = (SCEN[opts.set] || []).filter((s) => !opts.only || s.id === opts.only); let cur = 0, step = 0, picks = [];
  const { F, body } = htmlScene(host, { cls: "scen ctrl-top" }); F.root.insertBefore(F.ctrl, F.stage);   // chips on top: the card below can never push them
  if (list.length > 1) chips(F.ctrl, list.map((s, i) => [i, s.t]), 0, (v) => { cur = +v; step = 0; picks = []; draw(); }, { label: "Scenario" });
  function draw() {
    const S = list[cur]; if (!S) return; body.replaceChildren();
    const st = S.steps[step];
    body.append(h("div", { class: "hv-tag" }, `Made-up scenario · decision ${step + 1} of ${S.steps.length}`));
    if (step === 0) body.append(terms(h("p", { class: "sc-set" }, S.set)));
    else body.append(h("p", { class: "sc-prev" }, `Your last choice: ${GR[picks[picks.length - 1]][0].toLowerCase()}.`));
    body.append(terms(h("p", { class: "sc-q" }, st.q)));
    const box = h("div", { class: "sc-opts", role: "group", "aria-label": "Choices" }); body.append(box);
    const out = h("div", { class: "sc-out", "aria-live": "polite" }); body.append(out);
    const btns = order(S.id + step, st.o.length).map((i) => { const [t, g, why, nx] = st.o[i];
      const b = h("button", { type: "button", class: "sc-opt" }, t); terms(b);
      b.addEventListener("click", () => { if (box.dataset.done) return; box.dataset.done = "1"; picks.push(g);
        btns.forEach(([bb, gg]) => { bb.disabled = true; bb.classList.add(gg === "best" ? "best" : "dim"); }); b.classList.add("picked", GR[g][1]);
        const next = nx != null ? nx : step + 1, last = next < 0 || next >= S.steps.length;
        const best = st.o[0], card = h("div", {});
        card.innerHTML = `<h4 class="${g === "best" ? "acc" : ""}">${GR[g][0]}</h4><p>${why}</p>${g !== "best" ? `<p><strong>Best:</strong> ${best[0]} ${best[2]}</p>` : ""}`;
        out.append(terms(card));
        if (last) { const n = picks.filter((p) => p === "best").length; if (opts.onDone) opts.onDone();
          out.append(terms(h("p", { class: "sc-deb" }, `${S.deb} You made the best choice ${n} of ${picks.length} times.`)), h("p", { class: "src" }, `ACS ${S.acs.join(", ")} · ${S.src}`));
          const again = h("button", { type: "button", class: "btn sc-next" }, "Try it again"); again.addEventListener("click", () => { step = 0; picks = []; draw(); }); out.append(h("div", {}, again)); }
        else { const nb = h("button", { type: "button", class: "btn arrow sc-next" }, "Next decision"); nb.addEventListener("click", () => { step = next; draw(); }); out.append(h("div", {}, nb)); }
      });
      box.append(b); return [b, g]; });
  }
  draw();
  F.explain(`Each scenario is a made-up example at a generic airport. Pick what you would do; every choice is explained. Then ask your CFI to run one at your own airport. <span class="src">FAA-S-ACS-6C · PHAK 2</span>`);
  return { destroy() { F.destroy(); } };
}
