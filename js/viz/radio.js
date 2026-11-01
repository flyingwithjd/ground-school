// Radio trainer (AIM 4-2-7 to 4-2-9, AIM 4-1-9). Phonetics: type a call sign, hear it spelled the AIM way.
// Call builder: assemble a nontowered self-announce call in the AIM order. HTML-only (no SVG), fully tap-driven.
import { frame, chips } from "./base.js?v=af7918520c";
import { h, esc } from "../core/util.js?v=af7918520c";
const PH = { A: "Alfa", B: "Bravo", C: "Charlie", D: "Delta", E: "Echo", F: "Foxtrot", G: "Golf", H: "Hotel", I: "India", J: "Juliett", K: "Kilo", L: "Lima", M: "Mike", N: "November", O: "Oscar", P: "Papa", Q: "Quebec", R: "Romeo", S: "Sierra", T: "Tango", U: "Uniform", V: "Victor", W: "Whiskey", X: "Xray", Y: "Yankee", Z: "Zulu" };
const SAY = { A: "AL-FAH", B: "BRAH-VOH", C: "CHAR-LEE", D: "DELL-TAH", E: "ECK-OH", F: "FOKS-TROT", G: "GOLF", H: "HOH-TEL", I: "IN-DEE-AH", J: "JEW-LEE-ETT", K: "KEY-LOH", L: "LEE-MAH", M: "MIKE", N: "NO-VEM-BER", O: "OSS-CAH", P: "PAH-PAH", Q: "KEH-BECK", R: "ROW-ME-OH", S: "SEE-AIR-RAH", T: "TANG-GO", U: "YOU-NEE-FORM", V: "VIK-TAH", W: "WISS-KEY", X: "ECKS-RAY", Y: "YANG-KEY", Z: "ZOO-LOO",
  0: "ZEE-RO", 1: "WUN", 2: "TOO", 3: "TREE", 4: "FOW-ER", 5: "FIFE", 6: "SIX", 7: "SEV-EN", 8: "AIT", 9: "NIN-ER" };
const DIG = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Niner"];
const LEGS = [["10", "10 miles out"], ["dw", "Entering downwind"], ["base", "Turning base"], ["fin", "Turning final"], ["clr", "Clear of the runway"], ["dep", "Departing"]];
export function mount(host, opts = {}) {
  const F = frame(host, { cls: "capin radio", corners: { tl: "Radio trainer", tr: "AIM 4-2-7, 4-1-9" } });
  const wrap = h("div", { class: "rd-wrap" }); F.stage.append(wrap);
  let mode = opts.mode || "phon", tail = "N172SP", leg = "dw", rwy = "27", apt = "Example Field";
  function spellTail(t) { return t.toUpperCase().replace(/[^A-Z0-9]/g, "").split("").map((c) => (/\d/.test(c) ? DIG[+c] : PH[c])).join(" "); }
  function phon() { wrap.innerHTML = "";
    const inp = h("input", { class: "rd-in", value: tail, maxlength: 8, "aria-label": "Call sign", autocapitalize: "characters", spellcheck: "false" });
    const out = h("div", { class: "rd-out" });
    const draw = () => { tail = inp.value; const cs = tail.toUpperCase().replace(/[^A-Z0-9]/g, "");
      out.innerHTML = `<div class="rd-big">${esc(spellTail(cs))}</div><div class="rd-tiles">${cs.split("").map((c) => `<span class="rd-tile"><b>${esc(c)}</b><i>${esc(/\d/.test(c) ? DIG[+c] : PH[c])}</i><em>${esc(SAY[c])}</em></span>`).join("")}</div>`;
      F.caption("Say it the AIM way", esc(spellTail(cs)) || "Type a call sign"); };
    inp.addEventListener("input", draw); wrap.append(h("label", { class: "label" }, "Call sign"), inp, out); draw();
    F.explain(`Use the phonetic alphabet for your call sign on initial contact. Digits are said one by one ("Three One Six Zero"), with the AIM pronunciations TREE, FOW-ER, FIFE and NIN-ER. Altitudes below 18,000 ft: "four thousand five hundred". Frequencies: "one two two point eight". Civil pilots say the aircraft type, model or manufacturer, then the registration, and drop the "N": "Skyhawk Three One Six Zero Foxtrot". Never abbreviate on initial contact; once ATC abbreviates your call sign, you may too. <span class="src">AIM 4-2-4, 4-2-7 to 4-2-9</span>`); }
  function call() { wrap.innerHTML = "";
    const cs = spellTail(tail).replace(/^November /, "");
    const pos = { "10": "one zero miles south, three thousand five hundred, inbound for left downwind runway " + rwyS(), dw: "entering left downwind runway " + rwyS(), base: "turning left base runway " + rwyS(), fin: "turning final runway " + rwyS(), clr: "clear of runway " + rwyS(), dep: "departing runway " + rwyS() + ", straight out" }[leg];
    const parts = [[`${apt} traffic`, "Who you're talking to"], [`Skyhawk ${cs}`, "Who you are"], [pos, "Where you are and what you're doing"], [apt, "Airport name again"]];
    const row = h("div", { class: "rd-call" }); parts.forEach(([t, k], i) => { const b = h("button", { class: "rd-seg", type: "button" }); b.innerHTML = `<span class="label">${i + 1} · ${esc(k)}</span><span class="rd-t">${esc(t)}</span>`; row.append(b); });
    wrap.append(row); F.caption("Self-announce on the CTAF", "Who, who, where, which airport");
    F.explain(`Start and end with the airport name, because nearby airports may share the frequency. Use the runway number, never "active runway". Report about 10 miles out, entering downwind, base, final and leaving the runway. Departing: before taxiing and before taxiing onto the runway. Example call for a fictional airport; confirm local practice with your CFI. <span class="src">AIM 4-1-9</span>`); }
  function rwyS() { return rwy.split("").map((d) => DIG[+d]).join(" "); }
  const legChips = chips(F.ctrl, LEGS, leg, (v) => { leg = v; call(); }, { label: "Position" }); legChips.el.style.display = "none";
  chips(F.ctrl, [["phon", "Phonetics"], ["call", "CTAF call"]], mode, (v) => { mode = v; legChips.el.style.display = v === "call" ? "" : "none"; v === "call" ? call() : phon(); }, { label: "Mode" });
  if (mode === "call") { legChips.el.style.display = ""; call(); } else phon();
  return { destroy: () => F.destroy() };
}
