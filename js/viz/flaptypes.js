// Secondary flight controls in 2D. Wing: plain, split, slotted and Fowler flaps, a fixed slot, a movable slat and a
// spoiler on an airfoil cross-section, with lift and drag bars and an angle-of-attack slider that shows where the wing
// stalls. Tail: trim, balance, servo and antiservo tabs, showing which way the tab moves against its surface.
// Facts, PHAK 6 (Flaps, Leading Edge Devices, Spoilers, Trim Systems): plain flap = simplest, more lift and drag, center of
// pressure moves aft (nose-down pitch); split flap = hinged from the lower surface, slightly more lift than plain but more
// drag; slotted flap = a slot lets high-energy air from below flow over the flap, delaying separation, more lift than plain
// or split; Fowler flap = slides aft on tracks before hinging down, adding camber and wing area: the largest lift increase
// with the least drag. Slots route air to the upper surface and slats move forward to open a slot; both delay separation to
// a higher angle of attack. Spoilers kill lift and add drag (descent, roll control on some airplanes, after touchdown).
// Trim tab: moves opposite the surface and holds it. Balance tab: linked so it moves opposite the surface and helps move it.
// Servo tab: the cockpit control moves only the tab, and the tab's force moves the surface. Antiservo tab: moves in the
// same direction as the stabilator's trailing edge, making it less sensitive (more feel); it also trims.
// Lift/drag bar lengths, deflection angles and stall angles are illustrative, not published values.
import { chips, slider, row } from "./base.js?v=c8fe6c3cee";
import { pxScene, T, L, P, C, R, INK, GRAY, DIM, ACC } from "./kit.js?v=c8fe6c3cee";
import { anim, toward, COL } from "./dial.js?v=c8fe6c3cee";
const D = Math.PI / 180;
export const WING = {
  plain: { name: "Plain flap", dl: 0.5, dd: 0.6, crit: 16, say: ["Plain flap", "The simplest flap: more camber, more lift and a lot more drag. The nose tends to pitch down."] },
  split: { name: "Split flap", dl: 0.55, dd: 0.9, crit: 16, say: ["Split flap", "Only the lower surface hinges down: a little more lift than a plain flap, but even more drag."] },
  slotted: { name: "Slotted flap", dl: 0.7, dd: 0.45, crit: 16, say: ["Slotted flap", "Air from below flows through the slot and keeps the flow attached: more lift than plain or split."] },
  fowler: { name: "Fowler flap", dl: 0.9, dd: 0.35, crit: 16, say: ["Fowler flap", "It slides aft, then down: more camber and more wing area. The most lift for the least drag."] },
  slot: { name: "Slot", dl: 0, dd: 0.05, crit: 22, say: ["Fixed slot", "A gap near the leading edge feeds fast air over the top, so the wing stalls at a higher angle."] },
  slat: { name: "Slat", dl: 0.15, dd: 0.1, crit: 22, say: ["Slat", "The leading edge moves forward to open a slot, delaying the stall to a higher angle of attack."] },
  spoiler: { name: "Spoiler", dl: -0.6, dd: 0.8, crit: 16, say: ["Spoiler", "A panel on top spoils the airflow: less lift, more drag. Descend without speeding up."] },
};
export const TAIL = {
  trim: { name: "Trim tab", say: ["Trim tab", "The trim wheel moves the tab; air on the tab holds the elevator the opposite way. Pressure relieved."] },
  balance: { name: "Balance tab", say: ["Balance tab", "Linked to move opposite the elevator, so air on the tab helps move it. Lighter control forces."] },
  servo: { name: "Servo tab", say: ["Servo tab", "The cockpit control moves only the tab; air on the tab moves the surface the opposite way."] },
  anti: { name: "Antiservo tab", say: ["Antiservo tab", "On a stabilator, the tab moves the same way as the trailing edge. Heavier, steadier feel."] },
};
// cambered airfoil, chord 1, x 0-1, returns [upper, lower] point lists
function foil(n = 40, t = 0.13, m = 0.02, p = 0.4) { const U = [], Lo = [];
  for (let i = 0; i <= n; i++) { const x = (1 - Math.cos((i / n) * Math.PI)) / 2, yt = 5 * t * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1015 * x ** 4);
    const yc = x < p ? (m / p ** 2) * (2 * p * x - x * x) : (m / (1 - p) ** 2) * (1 - 2 * p + 2 * p * x - x * x); U.push([x, yc + yt]); Lo.push([x, yc - yt]); } return [U, Lo]; }
const [FU, FL] = foil();
export function mount(host) {
  let dev = "plain", tail = null, tgt = 0.7, shown = 0, aoa = 6;
  const S = pxScene(host, { cls: "xtall flaptypes", corners: { tl: "Secondary flight controls", tr: "PHAK 6" } }, draw);
  const r0 = row(S.F.ctrl, "Wing"); const wc = chips(r0, Object.entries(WING).map(([k, v]) => [k, v.name]), dev, (k) => { if (!k) return; dev = k; tail = null; tc.set(null); ra.style.display = ""; shown = 0; upd(); }, { label: "Wing" });
  const r1 = row(S.F.ctrl, "Tail"); const tc = chips(r1, Object.entries(TAIL).map(([k, v]) => [k, v.name]), null, (k) => { if (!k) return; tail = k; dev = null; wc.set(null); ra.style.display = "none"; shown = 0; upd(); }, { label: "Tail" });
  const r2 = row(S.F.ctrl, "Move"); slider(r2, { label: "Deflection", min: 0, max: 100, value: tgt * 100, fmt: (x) => x + "%", oninput: (x) => { tgt = x / 100; upd(); } });
  const ra = row(S.F.ctrl, "Wing angle"); slider(ra, { label: "Angle of attack", min: 0, max: 26, value: aoa, fmt: (x) => x + "°", oninput: (x) => { aoa = x; S.redraw(); } });
  const A = anim(S.F, (dt) => { let m; [shown, m] = toward(shown, tgt, 4, dt, 0.004); S.redraw(); return m; });
  function upd() { S.redraw(); A.kick(); }
  const tf = (pts, ox, oy, sc, rot, cx = 0, cy = 0) => pts.map(([x, y]) => { const dx = x - cx, dy = y - cy, c = Math.cos(rot), s = Math.sin(rot); return [ox + (cx + dx * c - dy * s) * sc, oy - (cy + dx * s + dy * c) * sc]; });
  const path = (pts, close = true) => "M" + pts.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join("L") + (close ? "Z" : "");
  function draw(g, W, H, top) {
    const wide = W >= 600, sc = Math.min(wide ? W * 0.62 : W * 0.7, 480), ox = sc * 0.27 + 8, oy = wide ? top + (H - top) * 0.44 : top + (H - top) * 0.36, k = shown;
    const bx = wide ? W * 0.72 : 30, by = wide ? top + 24 : H - 84, bw = wide ? W * 0.24 : W - 60;
    if (dev) {
      const Wd = WING[dev], a = aoa * D; const rot = (pts) => pts.map(([x, y]) => [x * Math.cos(a) + y * Math.sin(a), -x * Math.sin(a) + y * Math.cos(a)]);
      // build the pieces in chord units, then rotate everything by the angle of attack about the leading edge
      const hx = 0.75, cut = (pts, lo, hi) => pts.filter(([x]) => x >= lo && x <= hi);
      let main = [...cut(FU, 0, hx), ...cut(FL, 0, hx).reverse()], flap = [...cut(FU, hx, 1), ...cut(FL, hx, 1).reverse()], extra = null, slatP = null;
      const hy = 0.02, fl = (pts, dx, dy, ang, cx = hx, cy = hy) => pts.map(([x, y]) => { const X0 = x - cx, Y0 = y - cy, c = Math.cos(-ang), s = Math.sin(-ang); return [cx + dx + X0 * c - Y0 * s, cy + dy + X0 * s + Y0 * c]; });
      if (dev === "plain") flap = fl(flap, 0, 0, 40 * D * k);
      else if (dev === "split") { const plate = [[hx, FL[30][1]], [1, FL[40][1]]]; extra = fl(plate, 0, 0, 50 * D * k, hx, FL[30][1]); }
      else if (dev === "slotted") flap = fl(flap, 0.04 * k, -0.035 * k, 35 * D * k);
      else if (dev === "fowler") flap = fl(flap, 0.17 * Math.min(1, k * 1.6), -0.03 * k, 32 * D * Math.max(0, k * 1.6 - 0.6) / 1);
      else if (dev === "spoiler") extra = fl([[0.48, 0.09], [0.66, 0.08]], 0, 0, -50 * D * k, 0.48, 0.09);
      if (dev === "slat") { const sp = [...cut(FU, 0, 0.12), ...cut(FL, 0, 0.06).reverse()]; slatP = sp.map(([x, y]) => [x - 0.07 * k, y - 0.04 * k]);
        main = [[0.08, 0.0], ...cut(FU, 0.12, hx), ...cut(FL, 0.06, hx).reverse()]; }
      const toS = (pts) => tf(rot(pts), ox, oy, sc, 0);
      const crit = Wd.crit - (dev === "slat" ? (1 - k) * 6 : 0), stalled = aoa > crit && dev !== "spoiler";
      P(g, path(toS(main)), { fill: "#1a1a1c", stroke: INK, w: 1.6 });
      if (dev !== "split" && dev !== "spoiler" && dev !== "slot" && dev !== "slat") P(g, path(toS(flap)), { fill: k > 0.02 ? "rgba(59,130,246,.25)" : "#1a1a1c", stroke: k > 0.02 ? ACC : INK, w: 1.8 });
      else P(g, path(toS(flap)), { fill: "#1a1a1c", stroke: INK, w: 1.6 });
      if (extra) P(g, path(toS(extra), false), { stroke: ACC, w: 4 });
      if (slatP) P(g, path(toS(slatP)), { fill: "rgba(59,130,246,.25)", stroke: ACC, w: 1.8 });
      if (dev === "slot") { const ch = toS([[0.02, -0.03], [0.07, 0.02], [0.13, 0.075]]); P(g, path(ch, false), { stroke: "#0A0A0B", w: 7 }); P(g, path(ch, false), { stroke: ACC, w: 1.6, arrow: true }); }
      if (dev === "slotted" && k > 0.2) { const ch = toS([[0.66, -0.07], [0.76, -0.02], [0.84, 0.02]]); P(g, path(ch, false), { stroke: ACC, w: 1.6, arrow: true }); }
      if (dev === "slat" && k > 0.3) { const ch = toS([[-0.06, -0.08], [0.0, -0.01], [0.09, 0.06]]); P(g, path(ch, false), { stroke: ACC, w: 1.6, arrow: true }); }
      // airflow over the top: smooth, or separated behind a point when stalled or spoiled
      const sepX = dev === "spoiler" && k > 0.1 ? 0.6 : stalled ? Math.max(0.1, 0.7 - (aoa - crit) * 0.12) : 2;
      for (let j = 1; j <= 3; j++) { const off = 0.035 * j + 0.02; const up = FU.filter(([x]) => x <= Math.min(1, sepX)).map(([x, y]) => [x, y + off]);
        const lead = [[-0.25, up[0][1] - 0.02 * j], ...up]; P(g, path(toS(lead), false), { stroke: GRAY, w: 1.2, op: 0.8 });
        if (sepX < 1) { let sq = []; const x0 = up.at(-1)[0], y0 = up.at(-1)[1]; for (let q = 0; q <= 16; q++) { const xx = x0 + (1.15 - x0) * q / 16; sq.push([xx, y0 + 0.03 * j + Math.sin(q * 1.7 + j) * 0.025]); } P(g, path(toS(sq), false), { stroke: COL.red, w: 1.2, op: 0.8 }); } }
      const lb = toS([dev === "slot" || dev === "slat" ? [0.02, -0.17] : dev === "spoiler" ? [0.57, 0.25] : [0.85, -0.16]])[0]; T(g, Math.min(W - 60, lb[0]), lb[1] + 18, dev === "spoiler" ? "spoiler" : dev === "slot" ? "slot" : dev === "slat" ? "slat" : "flap", { size: 11, anchor: "middle", fill: ACC });
      if (stalled || (dev === "spoiler" && k > 0.1)) T(g, ox + sc * 0.5, top + 16, stalled ? "stalled" : "lift spoiled", { size: 12, anchor: "middle", fill: COL.red, weight: 600 });
      // lift and drag bars (relative)
      const liftV = Math.max(0.05, (stalled ? 0.6 : 1) * (0.35 + aoa / 30 + Wd.dl * k * 0.6)), dragV = 0.2 + aoa / 60 + Wd.dd * k * 0.6 + (stalled ? 0.3 : 0);
      [["lift", liftV, ACC], ["drag", dragV, COL.yellow]].forEach(([t, v2, col], i) => { const y = by + i * 34; T(g, bx, y, t, { size: 11, fill: GRAY }); R(g, bx, y + 8, bw, 8, { stroke: DIM, sw: 1 }); R(g, bx, y + 8, Math.min(bw, bw * v2 / 1.6), 8, { fill: col }); });
      const say = stalled ? ["Stalled", dev === "slot" || dev === "slat" ? "Even with the leading-edge device, past the critical angle of attack it stalls." : "Past the critical angle of attack. Try a slot or slat: they delay the stall."] : Wd.say;
      S.F.caption(say[0], say[1]);
    } else {
      // tail: stabilizer (or stabilator) + elevator + tab, side view, flying left
      const Tl = TAIL[tail], anti = tail === "anti", u = k; // u: pilot input or trim, 0-1
      let sAng = 0, eAng = 0, tAng = 0; // degrees, positive = trailing edge down
      if (tail === "trim") { tAng = 22 * u; eAng = -10 * u; } else if (tail === "balance") { eAng = -18 * u; tAng = 16 * u; } else if (tail === "servo") { tAng = 20 * u; eAng = -14 * u; } else { sAng = -12 * u; tAng = -10 * u; }
      const ts = sc * 0.95, x0 = ox + sc * 0.05, y0 = oy;
      const part = (pts, ang, cx, cy) => pts.map(([x, y]) => { const c = Math.cos(ang * D), s2 = Math.sin(ang * D), X0 = x - cx, Y0 = y - cy; return [x0 + (cx + X0 * c - Y0 * s2) * ts, y0 + (cy + X0 * s2 + Y0 * c) * ts]; });
      const thin = (a, b, th) => [[a, -th], [b, -th * 0.6], [b, th * 0.6], [a, th]];
      const stab = [[0, 0], [0.04, -0.04], [0.55, -0.035], [0.6, 0], [0.55, 0.035], [0.04, 0.04]], elev = thin(0.6, 0.9, 0.03), tab = thin(0.9, 1, 0.015);
      const tabFinal = (pts) => part(part(pts, tAng, 0.9, 0).map(([x, y]) => [(x - x0) / ts, (y - y0) / ts]), anti ? sAng : eAng, 0.6, 0);
      if (anti) { const whole = (pts) => part(pts, sAng, 0.3, 0); P(g, path(whole([[0, 0], [0.04, -0.04], [0.6, -0.035], [0.9, -0.012], [0.9, 0.012], [0.6, 0.035], [0.04, 0.04]])), { fill: "rgba(59,130,246,.18)", stroke: ACC, w: 1.8 }); C(g, x0 + 0.3 * ts, y0, 4, { fill: INK });
        P(g, path(part(part(tab, tAng, 0.9, 0).map(([x, y]) => [(x - x0) / ts, (y - y0) / ts]), sAng, 0.3, 0)), { fill: COL.yellow, stroke: COL.yellow, w: 1 }); }
      else { P(g, path(part(stab, 0, 0, 0)), { fill: "#1a1a1c", stroke: INK, w: 1.6 }); P(g, path(part(elev, eAng, 0.6, 0)), { fill: "rgba(59,130,246,.18)", stroke: ACC, w: 1.8 }); P(g, path(tabFinal(tab)), { fill: COL.yellow, stroke: COL.yellow, w: 1 }); }
      const lab = (x, y, t, col) => T(g, x, y, t, { size: 11, anchor: "middle", fill: col });
      lab(x0 + ts * 0.3, y0 - ts * 0.09, anti ? "stabilator" : "stabilizer", GRAY); if (!anti) lab(x0 + ts * 0.75, y0 + ts * 0.16, "elevator", ACC); lab(x0 + ts * 0.98, y0 - ts * 0.12, "tab", COL.yellow);
      for (let j = 0; j < 2; j++) L(g, x0 - 40, y0 - 30 - j * 14, x0 - 8, y0 - 30 - j * 14, { stroke: DIM, w: 1.2, arrow: "kahg" });
      const force = { trim: 0, balance: 0.3, servo: 0.25, anti: 0.85 }[tail], fl = "control force";
      T(g, bx, by, fl, { size: 11, fill: GRAY }); R(g, bx, by + 8, bw, 8, { stroke: DIM, sw: 1 }); R(g, bx, by + 8, Math.max(2, bw * force * u), 8, { fill: COL.yellow });
      S.F.caption(Tl.say[0], Tl.say[1]);
    }
  }
  S.F.explain(`<p>Pick a device, then drag the deflection. On the wing, raise the angle of attack until it stalls. Then try a slot or slat. The 172S has single-slot flaps and an elevator trim tab; your airplane's POH shows what yours has.</p>`);
  upd();
  return { destroy: () => { A.stop(); S.F.destroy(); } };
}
