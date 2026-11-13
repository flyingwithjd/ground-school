// Trim and flaps on ONE 3D stage. Trim: the wheel moves only the tab; in flight the chain plays out in order on the
// real airplane (tab -> air pushes the tab -> elevator swings opposite -> tail force -> airplane pitches). Flaps: the
// same stage slides along the right side, square to the fuselage, to frame the right wing and flap (both modes default to a right rear 3/4 view from slightly above; orbit is still free)
// while the flap, the 3D airflow lines over and under that wing and the 3D lift/drag arrows (scene objects, so they stay attached when orbiting) show the camber change. Title and chain sit in their own bands above and
// below the stage, never over the model. PHAK Ch 6 · AFH Ch 9 · POH Sec 2, 7.
import { h, clamp, reduced } from "../core/util.js?v=ff9d939563";
const D = Math.PI / 180, ACC = "#3B82F6", INK = "#F2F1EC";
const TAB_MAX = 35, ELEV_MAX = 25, PITCH_MAX = 2.5;          // degrees, exaggerated for clarity
const HX = -16.4, Y0 = 4.62, EL = 0.92, TL = 0.44, ZF = 1.75, SLE = -14.33;  // elevator hinge, chord to the tab hinge, tab chord, span station of the cues, stabilizer leading edge at that station (ft, model space)
// right-wing section used for the flaps cues (matches c172-model.js at ~7 ft out): leading edge, flap hinge, chord line height,
// flap chord, upper/lower thickness, and the span station of the cues (flaps run 2.0-9.4 ft out)
const WLE = 1.6, WXH = -2.41, WY = 6.79, WCF = 1.34, WTU = 0.37, WTL = 0.25, ZS = 7.25;
const nn = (u) => { const N = (q) => 0.2969 * Math.sqrt(q) - 0.126 * q - 0.3516 * q * q + 0.2843 * q ** 3 - 0.1015 * q ** 4; return u <= 0 || u >= 1 ? 0 : N(u) / N(0.3); };
const s5 = (k) => k * k * k * (k * (k * 6 - 15) + 10);
// AFH Ch 9 / Ch 12: up to about 15 deg flaps mostly add lift; beyond that, mostly drag. Shapes for the arrow lengths only.
const liftK = (f) => (1 - Math.exp(-f / 9)) / (1 - Math.exp(-30 / 9)), dragK = (f) => Math.pow(Math.max(0, f) / 30, 2.2);
export function trimFlaps(F, S, { wheel }) {
  const phone = () => F.stage.getBoundingClientRect().width < 560;
  // Both modes default to a right rear 3/4 view (camera swung about 20 deg aft of square, a few degrees above), so the
  // surfaces read as surfaces while the airflow still runs across the screen. Both modes share one azimuth, so switching only slides.
  // w = feet of airplane to fit across the stage; the distance follows from the lens and the stage shape.
  // w x h = feet of airplane to fit around (cx, cy); reserve = stage pixels kept clear on the right for the trim wheel.
  const FOV = 6, TN = Math.tan((FOV / 2) * D);
  // az 90 = square to the right side; larger az swings the camera toward the tail (right rear 3/4, like the orbited reference views)
  const side = (cx, cy, [w, h], [wp, hp], { reserve = 0, cz = 1.0, el = 3, az = 90 } = {}) => { const r = F.stage.getBoundingClientRect(), W = Math.max(1, r.width - reserve), H = Math.max(1, r.height), ph = phone();
    const ww = ph ? wp : w, hh = ph ? hp : h, d = Math.max(ww / (2 * TN * (W / H)), hh / (2 * TN)), ftPx = (2 * TN * d) / H, sh = (reserve / 2) * ftPx, rx = Math.sin(az * D), rz = -Math.cos(az * D);
    return { tg: [cx - sh * rx, cy, cz - sh * rz], az, el, fov: FOV, d }; };   // slide the target against screen-right to leave the wheel gap
  const wheelPx = () => (phone() ? 92 : 124);
  const AZ = 110;   // right rear 3/4: about 20 deg from square toward the tail
  const VIEW = { trim: () => side(-16.2, 4.75, [6.0, 4.6], [4.6, 4.9], { reserve: wheelPx(), cz: ZF, el: 6, az: AZ }),
    flaps: () => (phone() ? side(-2.3, 7.9, [11.5, 5.9], [12, 5.9], { cz: ZS, el: 4, az: AZ }) : side(-1.7, 7.9, [11.5, 5.9], [11.5, 5.9], { cz: ZS, el: 4, az: AZ })) };
  F.root.classList.add("tf");
  // bands: big title above the stage, the step chain below it
  const title = h("div", { class: "tf-title" }), chain = h("p", { class: "tf-chain", "aria-live": "polite" });
  const tName = h("span", {}), tSub = h("span", { class: "tf-sub" }); title.append(tName, tSub);
  F.root.insertBefore(title, F.stage); F.stage.after(chain);
  // airflow lines and force arrows are real 3D objects in model space (planestage cueLine/cueArrow), so they stay attached
  // to the tail and the right wing in the default views AND whenever the user orbits. No flat 2D overlays.
  const TD = [0.32, 0.26], WD = [0.7, 0.55];   // dash/gap in feet: short on the small tail, longer on the wing
  const NT = 42, NW = Math.floor((WLE + 2.6 - (WXH - 4.4)) / 0.12) + 1;
  const flows = [[0.38, 1], [0.8, 0.55], [-0.38, 1], [-0.8, 0.55]].map(([d, w]) => ({ d, w, el: S.cueLine(NT, { dash: TD, width: 1.4, opacity: 0.6 }) }));
  const tabF = S.cueArrow({ color: 0xf2f1ec, width: 2.8, head: 0.2 });
  const tailF = S.cueArrow({ color: 0x3b82f6, width: 3.4, head: 0.28 });
  const wflows = [[0.42, 1, 1], [1.0, 0.55, 1], [-0.36, 1, -1], [-0.9, 0.5, -1]].map(([d, w, sd]) => ({ d, w, sd, el: S.cueLine(NW, { dash: WD, width: 1.4, opacity: 0.6 }) }));
  const liftF = S.cueArrow({ color: 0x3b82f6, width: 3.4, head: 0.55 });
  const dragF = S.cueArrow({ color: 0xf2f1ec, width: 2.8, head: 0.5 });
  let fadeT0 = -1e9, fadeFrom = 1;   // trim cues fade out / flap cues fade in when the mode changes
  let mode = "trim", trim = 0, flap = 0, flap0 = 0, chainKey = "", last = 0, running = false;
  const v = { tab: 0, push: 0, elev: 0, lift: 0, pitch: 0, flap: 0, cam: 0, force: 0, path: 0 };
  const tau = { tab: 140, push: 340, elev: 480, lift: 340, pitch: 560, cam: 260, force: 520, path: 620 };
  const targets = () => ({ tab: trim * TAB_MAX, push: v.tab / TAB_MAX, elev: -v.push * ELEV_MAX, lift: v.elev / ELEV_MAX, pitch: -v.lift * PITCH_MAX, cam: v.flap, force: v.cam, path: v.force });
  const P = (x, y, z = ZF) => [x, y, z];
  const camber = (s0) => { const e = v.elev * D, a = (v.elev + v.tab) * D, ts = EL * Math.cos(e), ty = Y0 - EL * Math.sin(e);   // s0 = distance aft of the hinge
    if (s0 <= 0) return Y0; if (s0 <= ts) return Y0 - s0 * Math.tan(e);
    const es = ts + TL * Math.cos(a), ey = ty - TL * Math.sin(a); if (s0 <= es) return ty - (s0 - ts) * Math.tan(a);
    return ey - (s0 - es) * Math.tan(a) * Math.exp(-(s0 - es) / 0.5); };
  const smooth = (pts, k = 3) => pts.map((p, i) => { let acc = 0, n = 0; for (let j = -k; j <= k; j++) { const q = pts[i + j]; if (q) { const wt = k + 1 - Math.abs(j); acc += q[1] * wt; n += wt; } } return [p[0], acc / n]; });
  // mode cross-fade of the two cue sets (0 = trim cues, 1 = flap cues); instant with reduced motion
  const mixF = () => { const k = reduced() ? 1 : clamp((performance.now() - fadeT0) / 500, 0, 1), to = mode === "flaps" ? 1 : 0; return fadeFrom + (to - fadeFrom) * k; };
  const trimCues = () => {
    flows.forEach((f) => { const pts = []; for (let i = 0; i < NT; i++) { const x = -13.2 - i * 0.15; pts.push([x, Y0 + (camber(HX - x) - Y0) * f.w + f.d]); } f.el.set(smooth(pts).map((p) => P(p[0], p[1]))); f.el.opacity = 0.6 * mT; });
    const e = v.elev * D, a = (v.elev + v.tab) * D, tx = HX - EL * Math.cos(e), ty = Y0 - EL * Math.sin(e);
    const mx = tx - (TL / 2) * Math.cos(a), my = ty - (TL / 2) * Math.sin(a), nx = -Math.sin(a), ny = Math.cos(a);   // tab middle and its upper-surface normal
    const p = v.push, sg = p > 0 ? -1 : 1, L = 0.25 + 0.75 * Math.abs(p);   // air pushes the tab up (+): the arrow comes from below
    tabF.set(P(mx + nx * sg * (L + 0.12), my + ny * sg * (L + 0.12)), P(mx + nx * sg * 0.12, my + ny * sg * 0.12)); tabF.opacity = clamp(Math.abs(p) * 2.5, 0, 1) * mT;
    // the tail force acts on the whole tail: draw it on the stabilizer, inboard and ahead of the tab so the two arrows never bunch
    const lf = v.lift, dir = lf > 0 ? 1 : -1, LL = 0.25 + 0.75 * Math.abs(lf), sx = HX + 0.9, sy = Y0 + (dir > 0 ? 0.16 : -0.12);
    tailF.set(P(sx, sy, 3.6), P(sx, sy + dir * LL, 3.6)); tailF.opacity = clamp(Math.abs(lf) * 2.5, 0, 1) * mT; };
  // mean line of the wing section with the flap at angle f (deg); x in ft (model), returns y
  const wcam = (x, f) => { const a = f * D, xte = WXH - WCF * Math.cos(a), yte = WY - WCF * Math.sin(a);
    if (x >= WXH) return WY; if (x >= xte) return WY - (WXH - x) * Math.tan(a); return yte - (xte - x) * Math.tan(a) * 0.8 * Math.exp(-(xte - x) / 1.4); };
  const flapCues = () => { const f = v.cam, lk = liftK(Math.max(0, v.force)), dk = dragK(v.force), C = WLE - WXH + WCF;
    wflows.forEach((w) => { const pts = []; for (let i = 0; i < NW; i++) { const x = WLE + 2.6 - i * 0.12, u = (WLE - x) / C, th = w.sd > 0 ? WTU * nn(u) : -WTL * nn(u);
        const up = x > WLE ? 0.22 * liftK(Math.max(0, f)) * Math.exp(-(x - WLE) / 1.2) : 0;   // upwash ahead of the wing grows with lift
        pts.push([x, WY + (wcam(x, f) - WY + th + up) * w.w + w.d]); }
      w.el.set(smooth(pts, 4).map((p) => P(p[0], p[1], ZS))); w.el.opacity = 0.6 * mF; });
    const ly = WY + WTU + 0.14, lx = -0.6; liftF.set(P(lx, ly, ZS), P(lx, ly + 1.1 + 1.7 * lk, ZS)); liftF.opacity = mF;
    const a = v.flap * D, xte = WXH - WCF * Math.cos(a), yte = WY - WCF * Math.sin(a) * 0.55; dragF.set(P(xte - 0.25, yte, ZS), P(xte - 0.25 - (0.8 + 2.6 * dk), yte, ZS)); dragF.opacity = mF; };
  let mT = 1, mF = 0; const cues = () => { const m = mixF(); mF = m; mT = 1 - m; trimCues(); flapCues(); };
  const seg = (i, t) => `<span data-i="${i}">${t}</span>`, ar = ' <span class="ar" aria-hidden="true">→</span> ';
  const setChain = () => { const key = mode === "flaps" ? "f" + flap0 + ">" + flap : "t" + Math.sign(trim); if (key === chainKey) return; chainKey = key;
    if (mode === "flaps") { tName.textContent = flap ? `Flaps ${flap}°` : "Flaps up"; tSub.textContent = flap ? `Max ${flap === 10 ? 110 : 85} KIAS` : "";
      if (flap === flap0) { chain.textContent = "Move the flap lever to 10°, 20° or 30°."; return; }
      const dn = flap > flap0, big = Math.max(flap, flap0) >= 20;
      const act = dn ? `Flaps ${flap0 ? "further " : ""}down to ${flap}°` : flap ? `Flaps partly up, to ${flap}°` : "Flaps fully up";
      chain.innerHTML = dn ? [seg(0, act), seg(1, "more camber"), seg(2, big ? "more lift, much more drag" : "more lift, little drag"), seg(3, big ? "slower, steeper approach" : "slower approach")].join(ar)
        : [seg(0, act), seg(1, "less camber"), seg(2, big ? "much less drag, less lift" : "less lift"), seg(3, "flatter descent, needs more speed")].join(ar); return; }
    tSub.textContent = "";
    if (!trim) { tName.textContent = "Elevator trim"; chain.textContent = "Roll the wheel up for nose down, down for nose up."; return; }
    const up = trim < 0; tName.textContent = up ? "Nose-down trim" : "Nose-up trim";
    chain.innerHTML = [seg(0, `Tab ${up ? "up" : "down"}`), seg(1, `air pushes ${up ? "down" : "up"}`), seg(2, `elevator ${up ? "down" : "up"}`), seg(4, `nose ${up ? "down" : "up"}`)].join(ar); };
  const light = () => { let prog;
    if (mode === "flaps") { const dd = flap - flap0 || 1; prog = [v.flap, v.cam, v.force, v.path].map((x) => (x - flap0) / dd); }
    else { const k = Math.abs(trim) || 1; prog = [Math.abs(v.tab) / TAB_MAX, Math.abs(v.push), Math.abs(v.elev) / ELEV_MAX, Math.abs(v.lift), Math.abs(v.pitch) / PITCH_MAX].map((x) => x / k); }
    chain.querySelectorAll("[data-i]").forEach((el) => el.classList.toggle("on", prog[+el.dataset.i] > 0.55)); };
  const apply = () => { S.pose({ trim: v.tab, elev: v.elev, flap: v.flap }); S.setAttitude({ pitch: v.pitch }); cues(); light(); };
  const tick = (now) => { const dt = Math.min(64, now - (last || now)); last = now; let busy = false; const tg = targets();
    for (const k in tau) { const d = tg[k] - v[k]; if (Math.abs(d) < (k === "push" || k === "lift" ? 0.002 : 0.02)) v[k] = tg[k]; else { v[k] += d * Math.min(1, dt / tau[k]); busy = true; } }
    const df = flap - v.flap; if (Math.abs(df) < 0.05) v.flap = flap; else { v.flap += Math.sign(df) * Math.min(Math.abs(df), dt * 0.03); busy = true; }   // the flap motor runs at a steady rate
    apply(); if (!busy) { running = false; last = 0; S.animate(null); } };
  const go = () => { setChain(); if (reduced()) { for (let i = 0; i < 8; i++) Object.assign(v, targets()); v.flap = flap; Object.assign(v, { cam: flap, force: flap, path: flap }); apply(); return; } if (!running) { running = true; last = 0; S.animate(tick); } };
  const FOCUS = { trim: ["trimtab"], flaps: ["flaps"] };
  let show = (m) => { showChips.set(m); if (m === mode) return; fadeFrom = mixF(); fadeT0 = performance.now(); mode = m; flap0 = flap; F.root.classList.toggle("tf-flaps", m === "flaps"); S.focus(FOCUS[m]); S.tint(FOCUS[m]); S.setView(VIEW[m](), 1500); go(); explain(); };
  const src = (t) => `<span class="src">${t}</span>`;
  const explain = () => F.explain(mode === "flaps"
    ? "Lowering the flaps adds <b>camber</b> to the wing, so it makes more <b>lift</b> and more <b>drag</b>. The extra lift lets you fly slower; the extra drag lets you descend more steeply without speeding up. The first notch adds mostly lift; the last notches add mostly drag. " +
      src("PHAK Ch 6, flaps: increase lift and drag. AFH Ch 9: up to about 15° mostly lift, beyond 15° a large increase in drag, steeper descent angle. 172S max flap speeds: 110 KIAS at 10°, 85 KIAS from 10° to 30° (POH Sec 2); flap stops 10°, 20°, 30° (POH Sec 7). Airflow and arrows are illustrations, not to scale. Confirm with your CFI and the POH.")
    : "The trim wheel moves <b>only the tab</b>. In flight, air pushes the tab the <b>opposite</b> way. That push acts far behind the hinge, so it swings the whole elevator opposite the tab, and the elevator pitches the airplane. The tab is too small to do that itself. " +
      src("PHAK Ch 6, trim tabs: \u201cNose-down trim: tab up, elevator down.\u201d Movement exaggerated for clarity. In the 172S, roll the wheel forward (up) to trim nose down. Confirm with your CFI and the POH."));
  // one draw-on for the part in focus, then never again (switching modes only moves the camera and fades the accent)
  S.setView(VIEW.trim(), 1); S.highlight(FOCUS.trim); S.tint(FOCUS.trim);
  const showChips = F.chipsApi([["trim", "Elevator trim"], ["flaps", "Flaps"]], "trim", (m) => show(m), "Show");
  wheel((x) => { trim = x; show("trim"); go(); });
  F.chipsApi([["0", "0°"], ["10", "10°"], ["20", "20°"], ["30", "30°"]], "0", (x) => { show("flaps"); flap0 = flap; flap = +x; go(); explain(); }, "Flap lever");
  // the cues are 3D objects, so they follow the camera and orbit by themselves; this loop only runs the mode cross-fade
  let craf = 0, until = 0; const follow = (now) => { cues(); craf = now < until ? requestAnimationFrame(follow) : 0; };
  const followFor = (ms) => { until = Math.max(until, performance.now() + ms); if (!craf) craf = requestAnimationFrame(follow); };
  const show0 = show; show = (m) => { const was = mode; show0(m); if (m !== was) followFor(700); };
  setChain(); explain(); apply(); followFor(600); S.setFlow(true);   // airflow drifts continuously while the stage is on screen
  return () => { cancelAnimationFrame(craf); };
}
