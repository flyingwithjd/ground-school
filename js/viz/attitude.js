// Hazardous-attitude drill: read a pilot's thought, name the attitude, get the antidote (PHAK Ch 2, Fig 2-4).
// The thoughts are made-up examples written for practice.
import { frame } from "./base.js?v=25fe20f25f";
import { h, shuffle } from "../core/util.js?v=25fe20f25f";
const ATT = { anti: ["Anti-authority", "Follow the rules. They are usually right."], imp: ["Impulsivity", "Not so fast. Think first."], inv: ["Invulnerability", "It could happen to me."], macho: ["Macho", "Taking chances is foolish."], res: ["Resignation", "I'm not helpless. I can make a difference."] };
const THOUGHTS = [
  ["The checklist is for beginners. I know this airplane.", "anti"], ["The weather's going down. Let's just go now, before it closes in.", "imp"],
  ["Fuel exhaustion happens to careless pilots, not to me.", "inv"], ["My friends are watching from the ramp. I'll show them a really short landing.", "macho"],
  ["The forecast is bad, but the weather will do whatever it does. Nothing I can do.", "res"], ["That TFR is probably a mistake. I'm flying my route anyway.", "anti"],
  ["The engine is running a little rough. I'll skip the runup to save time.", "imp"], ["I've flown in worse crosswinds than this. I can handle 25 knots.", "macho"],
  ["Ice? I'll be through the clouds in a minute. I'll be fine.", "inv"], ["The passenger wants to keep going, so I'll go along with it.", "res"],
];
export function mount(host) {
  const F = frame(host, { cls: "capin mnemo", corners: { tl: "Attitude drill", tr: "PHAK Fig 2-4" } });
  const wrap = h("div", { class: "mn-wrap" }); F.stage.append(wrap);
  let deck = shuffle(THOUGHTS), i = 0, right = 0;
  function draw() { const [txt, ans] = deck[i % deck.length]; wrap.innerHTML = "";
    const q = h("div", { class: "mn-det" }); q.innerHTML = `<span class="label">Thought ${(i % deck.length) + 1} of ${deck.length} · made-up example</span><h4>"${txt}"</h4>`; wrap.append(q);
    const row = h("div", { class: "mn-row" }); const out = h("div", { class: "mn-det" });
    Object.entries(ATT).forEach(([k, [name]]) => { const b = h("button", { type: "button", class: "mn-l" }); b.innerHTML = `<b>${name[0]}</b><span>${name}</span>`;
      b.addEventListener("click", () => { if (row.dataset.done) return; row.dataset.done = 1; const ok = k === ans; if (ok) right++;
        [...row.children].forEach((c, n) => { const kk = Object.keys(ATT)[n]; if (kk === ans) c.classList.add("on"); });
        out.innerHTML = `<span class="label">${ok ? "Right" : "Not quite"} · ${ATT[ans][0]}</span><h4>Antidote: ${ATT[ans][1]}</h4><p>${right} right so far.</p>`;
        const nx = h("button", { type: "button", class: "btn" }); nx.textContent = "Next thought"; nx.onclick = () => { i++; draw(); }; out.append(nx); }); row.append(b); });
    wrap.append(row, out); }
  F.caption("Name the attitude", "Five hazardous attitudes");
  F.explain(`Recognize the thought, label it hazardous, then say the antidote. Antidotes work best when memorized. <span class="src">PHAK Ch 2</span>`);
  draw(); return { destroy: () => F.destroy() };
}
