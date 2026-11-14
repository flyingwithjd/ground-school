// METAR / TAF / FB decoder (PHAK Ch 13). Tap any group to decode it. Strings are the PHAK's published
// examples, shown as EXAMPLES only: never current weather and never for flight planning.
import { frame, chips } from "./base.js?v=494609bb62";
import { h, esc } from "../core/util.js?v=494609bb62";
const EX = {
  metar: { src: "PHAK Ch 13 (METAR example)", text: "METAR KGGG 161753Z AUTO 14021G26KT 3/4SM +TSRA BR BKN008 OVC012CB 18/17 A2970 RMK PRESFR" },
  metar2: { src: "PHAK Fig 12-25 (St. Louis report along a warm front; groups put in standard order)", text: "METAR KSTL 1950Z 21018KT 1SM -RA OVC010 18/18 A2960" },
  taf: { src: "PHAK Ch 13 (TAF example)", text: "TAF KPIR 111130Z 1112/1212 TEMPO 1112/1114 5SM BR FM1500 16015G25KT P6SM SCT040 BKN250 FM120000 14012KT P6SM BKN080 OVC150 PROB30 1200/1204 3SM TSRA BKN030CB FM120400 1408KT P6SM SCT040 OVC080 TEMPO 1204/1208 3SM TSRA OVC030CB" },
  fb: { src: "PHAK Fig 13-9 and its explanation (AMA and DEN groups, plus the PHAK's two coding examples)", text: "FB AMA 6000 2714 DEN 9000 2321-04 9900 731960" },
};
const WX = { MI: "shallow", BC: "patches", DR: "low drifting", BL: "blowing", SH: "showers", TS: "thunderstorm", FZ: "freezing", PR: "partial",
  DZ: "drizzle", RA: "rain", SN: "snow", SG: "snow grains", IC: "ice crystals", PL: "ice pellets", GR: "hail", GS: "small hail or snow pellets",
  BR: "mist", FG: "fog", FU: "smoke", DU: "dust", SA: "sand", HZ: "haze", PY: "spray", VA: "volcanic ash",
  PO: "dust/sand whirls", SQ: "squalls", FC: "funnel cloud", SS: "sandstorm", DS: "dust storm" };
const SKY = { SKC: "clear", CLR: "clear (automated: none detected below 12,000 ft)", FEW: "few (1/8–2/8 of the sky)", SCT: "scattered (3/8–4/8)", BKN: "broken (5/8–7/8)", OVC: "overcast (8/8)", VV: "vertical visibility into an obscuration" };
const ft = (n) => (+n * 100).toLocaleString("en-US") + " ft AGL";
const hr = (s) => s.slice(0, 2) + ":" + s.slice(2, 4) + " UTC";
function decode(tok, i, all, kind) {
  let m;
  if (kind === "fb") {
    if (tok === "FB") return ["Product", "Winds and temperatures aloft forecast"];
    if (/^[A-Z]{3}$/.test(tok)) return ["Station", `${tok === "AMA" ? "Amarillo (elevation 3,605 ft, so the lowest reported level is 6,000 ft)" : tok === "DEN" ? "Denver (elevation 5,431 ft, so the lowest reported level is 9,000 ft)" : tok}. No winds are forecast within 1,500 ft of station elevation and no temperatures within 2,500 ft.`];
    if (tok === "9900") return ["Wind", "Light and variable (forecast less than 5 kt). PHAK coding example."];
    if (/^\d{4,5}$/.test(tok) && tok.endsWith("000")) return ["Altitude", `${(+tok).toLocaleString("en-US")} ft. Through 12,000 ft these are true altitudes; 18,000 ft and up are flight levels.`];
    if ((m = tok.match(/^(\d{2})(\d{2})([+-]\d{2}|\d{2})?$/))) {
      let d = +m[1] * 10, sp = +m[2], ex = ""; if (d > 360) { d -= 500; sp += 100; ex = " Direction over 360 means 50 was added to the direction and 100 subtracted from the speed. PHAK coding example."; }
      const tc = m[3] == null ? "" : `, temperature ${m[3][0] === "+" || m[3][0] === "-" ? +m[3] : -+m[3]} °C${/^\d/.test(m[3]) ? " (no sign: above 24,000 ft temperatures are negative)" : ""}`;
      return ["Wind and temp", `From ${String(d).padStart(3, "0")}° true at ${sp} kt${tc}. Winds aloft are referenced to true north.${ex}`];
    }
  }
  if (tok === "METAR") return ["Type", "Routine weather report, sent at regular intervals. SPECI is the special report for rapidly changing conditions."];
  if (tok === "SPECI") return ["Type", "Special report, issued any time conditions change rapidly."];
  if (tok === "TAF") return ["Type", "Terminal aerodrome forecast for the 5 SM radius around the airport. TAF AMD is an amended forecast."];
  if (i === 1 && /^[KP][A-Z0-9]{3}$/.test(tok)) return ["Station", `${tok}. In the 48 contiguous states, K plus the three-letter identifier. Alaska starts with PA and Hawaii with PH.`];
  if ((m = tok.match(/^(\d{2})(\d{4})Z$/))) return [kind === "taf" ? "Issued" : "Date and time", `Day ${m[1]} of the month at ${hr(m[2])} (Zulu).`];
  if ((m = tok.match(/^(\d{4})Z$/))) return ["Time", `${hr(m[1])} (Zulu). This chart-style report leaves out the day.`];
  if ((m = tok.match(/^(\d{2})(\d{2})\/(\d{2})(\d{2})$/))) return [all[i - 1] === "TEMPO" || all[i - 1] === "PROB30" ? "Period" : "Valid", `From day ${m[1]} at ${m[2]}:00 UTC to day ${m[3]} at ${m[4]}:00 UTC.`];
  if (tok === "AUTO") return ["Modifier", "From an automated station. Remarks show AO1 (no precipitation discriminator) or AO2 (with one)."];
  if (tok === "COR") return ["Modifier", "A corrected report that replaces an earlier one."];
  if ((m = tok.match(/^(\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?KT$/))) {
    if (tok === "00000KT") return ["Wind", "Calm"];
    return ["Wind", `${m[1] === "VRB" ? "Variable" : "From " + m[1] + "° true"} at ${+m[2]} kt${m[3] ? `, gusting to ${+m[3]} kt` : ""}. ${kind === "taf" ? "TAF" : "METAR"} winds are referenced to true north.`];
  }
  if (tok === "1408KT") return ["Wind", "Printed this way in the PHAK example. Standard coding is five digits (14008KT), so read it as 140° true at 8 kt."];
  if ((m = tok.match(/^(\d{3})V(\d{3})$/))) return ["Wind", `Direction varies between ${m[1]}° and ${m[2]}°.`];
  if (tok === "P6SM") return ["Visibility", "More than 6 statute miles"];
  if ((m = tok.match(/^(\d+(?: \d\/\d)?|\d\/\d)SM$/))) return ["Visibility", `${m[1]} statute mile${m[1] === "1" ? "" : "s"} prevailing visibility`];
  if ((m = tok.match(/^R(\d{2}[LRC]?)\/(\d{4})FT$/))) return ["RVR", `Runway visual range on runway ${m[1]}: ${(+m[2]).toLocaleString("en-US")} ft`];
  if ((m = tok.match(/^(FEW|SCT|BKN|OVC|VV)(\d{3})(CB|TCU)?$/))) return ["Sky", `${SKY[m[1]][0].toUpperCase() + SKY[m[1]].slice(1)} at ${ft(m[2])}${m[3] === "CB" ? ", cumulonimbus" : m[3] === "TCU" ? ", towering cumulus" : ""}.${m[1] === "BKN" || m[1] === "OVC" || m[1] === "VV" ? " Broken, overcast or vertical visibility counts as a ceiling." : ""}`];
  if (SKY[tok]) return ["Sky", SKY[tok]];
  if ((m = tok.match(/^(M?\d{2})\/(M?\d{2})$/))) { const c = (x) => (x[0] === "M" ? "−" + +x.slice(1) : +x) + " °C"; return ["Temp / dew point", `Temperature ${c(m[1])}, dew point ${c(m[2])}. M means minus. A small spread means fog or low cloud is likely.`]; }
  if ((m = tok.match(/^A(\d{2})(\d{2})$/))) return ["Altimeter", `${m[1]}.${m[2]} inches of mercury`];
  if (tok === "RMK") return ["Remarks", "Everything after RMK is remarks."];
  if (tok === "PRESFR") return ["Remark", "Pressure falling rapidly (PRESRR = rising rapidly)."];
  if ((m = tok.match(/^FM(\d{2})(\d{2})(\d{2})$/))) return ["Change: FROM", `From day ${m[1]} at ${m[2]}:${m[3]} UTC: a rapid, significant change, usually within an hour. Everything after replaces the forecast before.`];
  if ((m = tok.match(/^FM(\d{2})(\d{2})$/))) return ["Change: FROM", `From ${m[1]}:${m[2]} UTC: a rapid, significant change, usually within an hour.`];
  if (tok === "TEMPO") return ["Change: TEMPO", "Temporary fluctuations, each expected to last less than an hour."];
  if (tok === "PROB30") return ["PROB30", "A 30% probability of the conditions that follow (typically thunderstorms and precipitation)."];
  if ((m = tok.match(/^([+-]|VC)?([A-Z]{2,8})$/))) { const parts = m[2].match(/.{2}/g) || []; if (parts.length && parts.every((p) => WX[p]) && m[2].length % 2 === 0) {
    const pr = parts.some((p) => ["DZ", "RA", "SN", "SG", "IC", "PL", "GR", "GS"].includes(p));
    const inten = m[1] === "+" ? "Heavy " : m[1] === "-" ? "Light " : m[1] === "VC" ? "In the vicinity (5–10 SM): " : pr ? "Moderate " : "";
    const words = parts.map((p) => WX[p]); const desc = ["MI", "BC", "DR", "BL", "SH", "TS", "FZ", "PR"].includes(parts[0]);
    const txt = desc && words.length > 1 ? words[0] + " with " + words.slice(1).join(" and ") : words.join(" and ");
    return ["Weather", `${tok === "+FC" ? "Tornado or waterspout" : (inten + txt).replace(/^./, (c) => c.toUpperCase())}.${parts.includes("TS") ? " Thunderstorm: avoid." : ""}`]; } }
  return ["Group", "Not decoded here. Look it up in the PHAK Ch 13 or the AWH."];
}
function tokenize(t) { const a = t.split(/\s+/), out = []; for (let i = 0; i < a.length; i++) { if (/^\d$/.test(a[i]) && /^\d\/\dSM$/.test(a[i + 1] || "")) { out.push(a[i] + " " + a[i + 1]); i++; } else out.push(a[i]); } return out; }
export function mount(host, opts = {}) {
  const F = frame(host, { cls: "metar capin ctrl-top", corners: { tl: "Decoder · example strings", tr: "PHAK Ch 13" } }); F.root.insertBefore(F.ctrl, F.stage); // picker on top so switching never moves it
  const wrap = h("div", { class: "mt-wrap" }); F.stage.prepend(wrap);
  const tag = h("div", { class: "mt-tag" }, "Example from the FAA handbook · not current weather · do not use for flight");
  const line = h("div", { class: "mt-line", role: "group", "aria-label": "report groups" }); const det = h("div", { class: "mt-det", "aria-live": "polite" });
  const prog = h("div", { class: "mt-prog" }); wrap.append(tag, line, prog, det);
  let kind = opts.kind || "metar", seen = new Set();
  const keys = opts.kinds || ["metar", "metar2", "taf", "fb"];
  const names = { metar: "METAR", metar2: "METAR 2", taf: "TAF", fb: "Winds aloft (FB)" };
  function render() { const ex = EX[kind], toks = tokenize(ex.text), k = kind.startsWith("metar") ? "metar" : kind; seen = new Set(); line.innerHTML = "";
    toks.forEach((t, i) => { const b = h("button", { class: "mt-tok", type: "button" }, t); b.addEventListener("click", () => pick(i, b)); line.append(b); });
    const pick = (i, b) => { line.querySelectorAll(".mt-tok").forEach((x) => x.classList.remove("on")); b.classList.add("on"); seen.add(i); b.classList.add("seen");
      const [lab, txt] = decode(toks[i], i, toks, k); det.innerHTML = `<span class="label">${esc(lab)}</span><h4>${esc(toks[i])}</h4><p>${esc(txt)}</p>`;
      prog.textContent = `${seen.size} / ${toks.length} groups decoded`; };
    det.innerHTML = `<p class="dim">Tap each group, left to right. Try to say what it means before you tap.</p>`; prog.textContent = `0 / ${toks.length} groups decoded`;
    F.explain(`<span class="src">${esc(ex.src)}</span>`); }
  if (keys.length > 1) chips(F.ctrl, keys.map((k) => [k, names[k]]), kind, (v) => { kind = v; render(); }, { label: "Product" });
  render();
  return { destroy: () => F.destroy() };
}
