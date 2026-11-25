// Fact cards (GL17): a clean two-column "signs / what to do" card for topics where a drawing adds little. Chips pick the
// condition. Sources: PHAK FAA-H-8083-25C ch 17; FAA Aeromedical advisories. HTML scene, no animation.
import { htmlScene } from "./kit.js?v=eb00616c11";
import { chips } from "./base.js?v=eb00616c11";
import { h } from "../core/util.js?v=eb00616c11";
import { autoTerms } from "../core/rich.js?v=eb00616c11";
const SETS = {
  mot: { tl: "Queasy or poisoned?", tr: "PHAK 17", items: [
    ["Motion sickness", ["Nausea, general discomfort", "Dizziness, paleness", "Sweating, vomiting"], ["Open the fresh-air vents", "Look outside at a fixed point", "Avoid unnecessary head movement", "No drowsy medications for pilots"], "Conflicting messages from the inner ear, eyes and body. It usually fades within the first few lessons."],
    ["Carbon monoxide", ["Headache, blurred vision", "Dizziness, drowsiness", "Loss of muscle power", "Often no smell at all"], ["Heater off", "Fresh-air vents and windows open", "Oxygen if available", "Land as soon as practical"], "Colorless and odorless; it can leak in through the heater from a cracked exhaust. Carry a CO detector."]] },
  dehyd: { tl: "Water, heat and cold", tr: "PHAK 17", items: [
    ["Dehydration", ["Headache", "Fatigue (often the first sign)", "Cramps, sleepiness, dizziness"], ["Drink 2–4 quarts a day as a guide", "Drink before you're thirsty", "Limit coffee, tea and alcohol"], "Thirst shows up at about a 1.5-quart deficit, which is already too late."],
    ["Heatstroke", ["Body can't control its temperature", "First sign may be collapse"], ["Carry water on long flights", "About 1 pint an hour in moderate heat", "About 1 quart an hour in severe heat"], "Hot cockpits on the ramp are the classic setup. Ventilate and keep drinking."],
    ["Hypothermia", ["Shivering at first", "Then impaired while still feeling alert"], ["Dress for the outside temperature", "Carry seasonal survival gear", "Act early: land if you're getting cold"], "Cabin heat helps, but heater use brings carbon monoxide risk."]] },
};
export function mount(host, opts = {}) {
  const set = SETS[opts.set] || SETS.mot; let cur = 0;
  const { F, body } = htmlScene(host, { cls: "fcard ctrl-top" }); F.root.insertBefore(F.ctrl, F.stage);
  chips(F.ctrl, set.items.map((it, i) => [i, it[0]]), 0, (v) => { cur = +v; draw(); }, { label: "Condition" });
  function draw() { const [n, signs, act, note] = set.items[cur]; body.replaceChildren();
    const col = (t, list, cls) => h("div", { class: "fc-col " + cls }, h("div", { class: "hv-tag" }, t), h("ul", {}, ...list.map((x) => h("li", {}, x))));
    const card = h("div", {}, h("div", { class: "hv-tag" }, `${set.tl} · ${set.tr}`), h("h4", { class: "fc-h" }, n), h("div", { class: "fc-cols" }, col("Signs", signs, ""), col("What to do", act, "go")), h("p", { class: "fc-note" }, note));
    autoTerms(card); body.append(card); }
  draw();
  return { destroy() { F.destroy(); } };
}
