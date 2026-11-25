// Staying legal after the checkride: the flight review (14 CFR 61.56), passenger currency (61.57(a)) and change of address
// (61.60) on one timeline. Pick a rule, slide the date and see whether you're current today. Static scene.
import { slider, chips } from "./base.js?v=0e1a30e374";
import { pxScene, T, L, R, ACC, INK, GRAY, DIM, ACCF, ACCM } from "./kit.js?v=0e1a30e374";
const MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY = 864e5, fmtD = (d) => `${MO[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
export function mount(host) {
  const today = new Date(); today.setHours(12, 0, 0, 0);
  let mode = "fr", fr = 20, ld = 40, mv = 20;
  const S = pxScene(host, { corners: { tl: "Current today?", tr: "Today " + fmtD(today) } }, draw);
  chips(S.F.ctrl, [["fr", "Flight review"], ["pax", "Passengers"], ["addr", "New address"]], mode, (v) => { mode = v; show(); S.redraw(); }, { label: "Rule" });
  const sl = {
    fr: slider(S.F.ctrl, { label: "Last review", min: 0, max: 30, step: 1, value: fr, fmt: (v) => v + " months ago", oninput: (v) => { fr = v; S.redraw(); } }),
    pax: slider(S.F.ctrl, { label: "3rd-last landing", min: 0, max: 120, step: 1, value: ld, fmt: (v) => v + " days ago", oninput: (v) => { ld = v; S.redraw(); } }),
    addr: slider(S.F.ctrl, { label: "Moved", min: 0, max: 60, step: 1, value: mv, fmt: (v) => v + " days ago", oninput: (v) => { mv = v; S.redraw(); } }),
  };
  // same label and value widths on all three, so the track never moves when the rule changes
  for (const k in sl) { const e = sl[k].el; e.querySelector("label").style.minWidth = "9.5em"; e.querySelector("output").style.minWidth = "7.5em"; }
  function show() { for (const k in sl) sl[k].el.style.display = k === mode ? "" : "none"; }
  show();
  function draw(g, W, H, top) {
    const ph = W < 520, x0 = 16, x1 = W - 16;
    let a0, a1, rows, head, big, ex;
    if (mode === "fr") {
      const rv = new Date(today.getFullYear(), today.getMonth() - fr, 15), end = new Date(rv.getFullYear(), rv.getMonth() + 25, 0);
      a0 = new Date(today.getFullYear(), today.getMonth() - 31, 1); a1 = new Date(today.getFullYear(), today.getMonth() + 25, 0);
      const ok = today <= end;
      rows = [{ lab: "ACT AS PILOT IN COMMAND", src: "61.56(c)", s: rv, e: end, on: ok, a: "REVIEW " + MO[rv.getMonth()].toUpperCase() + " " + rv.getFullYear(), b: "THRU " + fmtD(end).toUpperCase() }];
      head = ok ? "Current: you may act as PIC" : "Not current: get a flight review"; big = ok ? "Good through " + fmtD(end) : "Expired " + fmtD(end);
      ex = `A flight review lasts to the <b>end of the 24th calendar month</b> after the month you did it, not to the same day. It needs 1 hour of ground and 1 hour of flight training with an authorized instructor, who endorses your logbook. A new certificate or rating checkride, or a WINGS phase, counts instead. <span class="src">14 CFR 61.56</span>`;
    } else if (mode === "pax") {
      const ls = new Date(+today - ld * DAY), end = new Date(+ls + 90 * DAY);
      a0 = new Date(+today - 125 * DAY); a1 = new Date(+today + 95 * DAY);
      const ok = today <= end;
      rows = [{ lab: "CARRY PASSENGERS BY DAY", src: "61.57(a)", s: ls, e: end, on: ok, a: "3RD-LAST LANDING", b: "THRU " + fmtD(end).toUpperCase() }];
      head = ok ? "Current: you may carry passengers" : "Not current for passengers"; big = ok ? `${Math.round((end - today) / DAY)} days left` : "No passengers today";
      ex = `To carry anyone you need <b>3 takeoffs and 3 landings in the preceding 90 days</b>, as sole manipulator, in the same category and class. Touch-and-goes count in a nosewheel airplane; a tailwheel airplane needs full stops. At night (1 hour after sunset to 1 hour before sunrise) the 3 must be full stops made in that period. To get current again, fly them with no passengers, or with an instructor. <span class="src">14 CFR 61.57(a)–(b)</span>`;
    } else {
      const mvd = new Date(+today - mv * DAY), end = new Date(+mvd + 30 * DAY);
      a0 = new Date(+today - 62 * DAY); a1 = new Date(+today + 32 * DAY);
      const ok = today <= end;
      rows = [{ lab: "TOLD THE FAA", src: "61.60", s: mvd, e: a1, on: true, a: "MOVED", b: "" },
        { lab: "HAVEN'T TOLD THE FAA", src: "61.60", s: mvd, e: end, on: ok, a: "MOVED", b: "DAY 30", one: true }];
      head = ok ? "Notify the FAA within 30 days" : "Grounded until you notify the FAA"; big = ok ? `Tell the FAA by ${fmtD(end)}` : "Can't use your certificate";
      ex = `After a change of permanent mailing address, you may not use your pilot certificate after 30 days unless you've notified the FAA Airman Certification Branch. The rule says in writing; the FAA also takes it online. <span class="src">14 CFR 61.60</span>`;
    }
    const X = (d) => x0 + ((d - a0) / (a1 - a0)) * (x1 - x0), y0 = top + 8, rh = mode === "addr" ? (ph ? 92 : 104) : ph ? 118 : 132, bh = ph ? 28 : 38, xt = X(today);
    rows.forEach((r, i) => { const y = y0 + i * rh, by = y + 34, xs = Math.max(x0, X(r.s)), xe = Math.min(x1, X(r.e));
      T(g, x0, y + 4, r.lab, { size: 11, fill: r.on ? INK : GRAY }); T(g, x1, y + 4, r.src, { size: 11, fill: GRAY, anchor: "end" });
      // today marker above the bar
      T(g, xt, y + 22, "TODAY", { size: 11, anchor: "middle", fill: INK, weight: 700 });
      R(g, x0, by, x1 - x0, bh, { fill: "rgba(242,241,236,.05)", rx: 3 });
      R(g, xs, by, Math.max(2, xe - xs), bh, { fill: r.on ? ACC : ACCM, rx: 3 });
      if (r.e < a1 && xe < x1 - 4) R(g, xe, by, x1 - xe, bh, { stroke: DIM, sw: 1, dash: "3 3", rx: 3 });
      if (r.e < a1) L(g, xe, by - 4, xe, by + bh + (r.one ? 8 : 26), { stroke: INK, w: 1.5 });
      L(g, xt, y + 26, xt, by + bh + 4, { stroke: INK, w: 2.5 });
      T(g, xs, by + bh + 18, r.a, { size: 11, fill: GRAY, anchor: xs > W * 0.6 ? "end" : "start" });
      if (r.b && r.one) T(g, xe < x1 - 60 ? xe + 6 : xe - 6, by + bh + 18, r.b, { size: 11, fill: r.on ? INK : GRAY, weight: 700, anchor: xe < x1 - 60 ? "start" : "end" });
      else if (r.b) T(g, xe, by + bh + 40, r.b, { size: ph ? 11 : 12, fill: r.on ? INK : GRAY, weight: 600, anchor: xe > W * 0.5 ? "end" : "start" });
    });
    // axis: years (flight review) or 30-day steps
    const ya = y0 + rows.length * rh - 6; L(g, x0, ya, x1, ya, { stroke: DIM, w: 1 });
    if (mode === "fr") { for (let yr = a0.getFullYear() + 1; yr <= a1.getFullYear(); yr++) { const xx = X(new Date(yr, 0, 1)); if (xx > x0 + 14 && xx < x1 - 14) { L(g, xx, ya - 4, xx, ya + 4, { stroke: GRAY, w: 1 }); T(g, xx, ya + 18, String(yr), { size: 11, anchor: "middle", fill: GRAY }); } } }
    else { const step = mode === "pax" ? 30 : 15; for (let k = -150; k <= 150; k += step) { const xx = X(new Date(+today + k * DAY)); if (xx > x0 + 14 && xx < x1 - 14) { L(g, xx, ya - 4, xx, ya + 4, { stroke: GRAY, w: 1 }); T(g, xx, ya + 18, k === 0 ? "0" : (k > 0 ? "+" : "−") + Math.abs(k) + "d", { size: 11, anchor: "middle", fill: GRAY }); } } }
    const yb = ya + 32;
    const ok = mode === "addr" ? rows[1].on : rows[0].on;
    R(g, x0, yb + 2, x1 - x0, 44, { stroke: ok ? ACC : INK, sw: 1.5, fill: ok ? ACCF : "#111113", rx: 6 });
    T(g, x0 + 14, yb + 29, head, { size: ph ? 14 : 15, fill: ok ? ACC : INK, weight: 700, mono: false });
    S.F.caption(mode === "fr" ? "Flight review" : mode === "pax" ? "Passenger currency" : "Change of address", big);
    S.F.explain(ex + ` Currency is the legal minimum; being proficient for today's flight can take more.`);
  }
  return { destroy() { S.F.destroy(); } };
}
