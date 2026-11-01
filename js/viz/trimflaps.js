// Trim and flaps on ONE 3D stage. Trim: the wheel moves only the tab; in flight the chain plays out in order on the
// real airplane (tab -> air pushes the tab -> elevator swings opposite -> tail force -> airplane pitches). Flaps: the
// same stage flies the camera to the right wing and slices the airplane down to a thin section of that wing, so the
// camber change, the airflow and the lift/drag arrows read side-on. Title and chain sit in their own bands above and
// below the stage, never over the model. PHAK Ch 6 · AFH Ch 9 · POH Sec 2, 7.
import { h, s, clamp, reduced } from "../core/util.js?v=6932bc693e";
const D = Math.PI / 180, ACC = "#3B82F6", INK = "#F2F1EC";
const TAB_MAX = 35, ELEV_MAX = 20, PITCH_MAX = 4;          // degrees, exaggerated for clarity
const HX = -16.4, Y0 = 4.62, EL = 0.92, TL = 0.44, ZF = 1.75;  // elevator hinge, chord to the tab hinge, tab chord, span station of the cues (ft, model space)
// right-wing section used in flaps mode (matches c172-model.js at ~7 ft out): leading edge, flap hinge, chord line height,
// flap chord, upper/lower thickness, and the slab of wing that stays visible
const WLE = 1.6, WXH = -2.41, WY = 6.79, WCF = 1.34, WTU = 0.37, WTL = 0.25, ZS = 7.25, ZIN = 6.85;
const nn = (u) => { const N = (q) => 0.2969 * Math.sqrt(q) - 0.126 * q - 0.3516 * q * q + 0.2843 * q ** 3 - 0.1015 * q ** 4; return u <= 0 || u >= 1 ? 0 : N(u) / N(0.3); };
const s5 = (k) => k * k * k * (k * (k * 6 - 15) + 10);
// AFH Ch 9 / Ch 12: up to about 15 deg flaps mostly add lift; beyond that, mostly drag. Shapes for the arrow lengths only.
const liftK = (f) => (1 - Math.exp(-f / 9)) / (1 - Math.exp(-30 / 9)), dragK = (f) => Math.pow(Math.max(0, f) / 30, 2.2);
export function trimFlaps(F, S, { wheel }) {
  const phone = () => F.stage.getBoundingClientRect().width < 560;
  const VIEW = { trim: () => (phone() ? { tg: [-17.0, 4.9, 1.2], az: 112, el: 16, d: 15.5 } : { tg: [-15.4, 5.9, 1.0], az: 114, el: 15, d: 15 }),
    flaps: () => (phone() ? { tg: [-2.1, 6.9, ZS], az: 93, el: 5, d: 12.5 } : { tg: [-1.9, 7.1, ZS], az: 93, el: 5, d: 9.5 }) };
  F.root.classList.add("tf");
  // bands: big title above the stage, the step chain below it
  const title = h("div", { class: "tf-title" }), chain = h("p", { class: "tf-chain", "aria-live": "polite" });
  const tName = h("span", {}), tSub = h("span", { class: "tf-sub" }); title.append(tName, tSub);
  F.root.insertBefore(title, F.stage); F.stage.after(chain);
  // minimal airflow cues drawn over the canvas from projected model points (no text in here)
  const sv = s("svg", { class: "tf-cues", "aria-hidden": "true" }, F.stage);
  const uid = Math.random().toString(36).slice(2, 7);
  s("defs", {}, sv).innerHTML = `<marker id="tfw${uid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${INK}"/></marker><marker id="tfa${uid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${ACC}"/></marker>`;
  const gT = s("g", { class: "tf-tcues" }, sv), gF = s("g", { class: "tf-fcues" }, sv);
  const flowEl = (g) => s("path", { class: "tf-flow", fill: "none", stroke: "rgba(242,241,236,.55)", "stroke-width": 1.3, "stroke-dasharray": "6 6" }, g);
  const flows = [[0.38, 1], [0.8, 0.55], [-0.38, 1], [-0.8, 0.55]].map(([d, w]) => ({ d, w, el: flowEl(gT) }));
  const tabF = s("line", { stroke: INK, "stroke-width": 2.6, "marker-end": `url(#tfw${uid})` }, gT);
  const tailF = s("line", { stroke: ACC, "stroke-width": 3.2, "marker-end": `url(#tfa${uid})` }, gT);
  // the cut face of the wing slab: a faint airfoil fill and the flap section in accent (from the model's own section shape)
  const secW = s("path", { fill: "rgba(242,241,236,.10)", stroke: "none" }, gF), secF = s("path", { fill: ACC, "fill-opacity": 0.6, stroke: ACC, "stroke-width": 1.5, "stroke-linejoin": "round" }, gF);
  const wflows = [[0.42, 1, 1], [1.0, 0.55, 1], [-0.36, 1, -1], [-0.9, 0.5, -1]].map(([d, w, sd]) => ({ d, w, sd, el: flowEl(gF) }));
  const liftF = s("line", { stroke: ACC, "stroke-width": 3.4, "marker-end": `url(#tfa${uid})` }, gF);
  const dragF = s("line", { stroke: INK, "stroke-width": 2.8, "marker-end": `url(#tfw${uid})` }, gF);
  let mode = "trim", trim = 0, flap = 0, flap0 = 0, chainKey = "", last = 0, running = false;
  const v = { tab: 0, push: 0, elev: 0, lift: 0, pitch: 0, flap: 0, cam: 0, force: 0, path: 0, clip: 0 };
  const tau = { tab: 140, push: 340, elev: 480, lift: 340, pitch: 560, cam: 260, force: 520, path: 620 };
  const targets = () => ({ tab: trim * TAB_MAX, push: v.tab / TAB_MAX, elev: -v.push * ELEV_MAX, lift: v.elev / ELEV_MAX, pitch: -v.lift * PITCH_MAX, cam: v.flap, force: v.cam, path: v.force });
  // flaps mode slices the airplane to a thin slab of the right wing (world-space clip planes; trim mode leaves them far away)
  const T3 = S.THREE, pOut = new T3.Plane(new T3.Vector3(0, 0, -1), 60), pIn = new T3.Plane(new T3.Vector3(0, 0, 1), 60), seen = new Set();
  const clipAll = () => { S.renderer.localClippingEnabled = true; const add = (m) => { if (m && !seen.has(m)) { seen.add(m); m.clippingPlanes = [pOut, pIn]; m.needsUpdate = true; } };
    S.scene.traverse((o) => [].concat(o.material || []).forEach(add)); S.P.meshes.forEach((m) => add(m.userData.mat0)); };
  const clipTo = (k) => { const e = s5(clamp(k, 0, 1)); pOut.constant = 60 + (ZS + 0.05 - 60) * e; pIn.constant = 60 + (-ZIN - 60) * e; };
  const P = (x, y, z = ZF) => S.project([x, y, z]);
  const camber = (s0) => { const e = v.elev * D, a = (v.elev + v.tab) * D, ts = EL * Math.cos(e), ty = Y0 - EL * Math.sin(e);   // s0 = distance aft of the hinge
    if (s0 <= 0) return Y0; if (s0 <= ts) return Y0 - s0 * Math.tan(e);
    const es = ts + TL * Math.cos(a), ey = ty - TL * Math.sin(a); if (s0 <= es) return ty - (s0 - ts) * Math.tan(a);
    return ey - (s0 - es) * Math.tan(a) * Math.exp(-(s0 - es) / 0.5); };
  const smooth = (pts, k = 3) => pts.map((p, i) => { let acc = 0, n = 0; for (let j = -k; j <= k; j++) { const q = pts[i + j]; if (q) { const wt = k + 1 - Math.abs(j); acc += q[1] * wt; n += wt; } } return [p[0], acc / n]; });
  const pathD = (pp) => "M" + pp.map((p) => p.x.toFixed(1) + "," + p.y.toFixed(1)).join(" L");
  const line = (el, a, b) => { el.setAttribute("x1", a.x.toFixed(1)); el.setAttribute("y1", a.y.toFixed(1)); el.setAttribute("x2", b.x.toFixed(1)); el.setAttribute("y2", b.y.toFixed(1)); };
  const trimCues = () => {
    flows.forEach((f) => { const pts = []; for (let x = -13.2; x >= -19.4; x -= 0.15) pts.push([x, Y0 + (camber(HX - x) - Y0) * f.w + f.d]); f.el.setAttribute("d", pathD(smooth(pts).map((p) => P(p[0], p[1])))); });
    const e = v.elev * D, a = (v.elev + v.tab) * D, tx = HX - EL * Math.cos(e), ty = Y0 - EL * Math.sin(e);
    const mx = tx - (TL / 2) * Math.cos(a), my = ty - (TL / 2) * Math.sin(a), nx = -Math.sin(a), ny = Math.cos(a);   // tab middle and its upper-surface normal
    const p = v.push, sg = p > 0 ? -1 : 1, L = 0.25 + 0.75 * Math.abs(p);   // air pushes the tab up (+): the arrow comes from below
    line(tabF, P(mx + nx * sg * (L + 0.12), my + ny * sg * (L + 0.12)), P(mx + nx * sg * 0.12, my + ny * sg * 0.12)); tabF.setAttribute("opacity", clamp(Math.abs(p) * 2.5, 0, 1).toFixed(3));
    // the tail force acts on the whole tail: draw it on the stabilizer, inboard and ahead of the tab so the two arrows never bunch
    const lf = v.lift, dir = lf > 0 ? 1 : -1, LL = 0.3 + 1.6 * Math.abs(lf), sx = HX + 0.9, sy = Y0 + (dir > 0 ? 0.16 : -0.12);
    line(tailF, P(sx, sy, 3.6), P(sx, sy + dir * LL, 3.6)); tailF.setAttribute("opacity", clamp(Math.abs(lf) * 2.5, 0, 1).toFixed(3)); };
  // mean line of the wing section with the flap at angle f (deg); x in ft (model), returns y
  const wcam = (x, f) => { const a = f * D, xte = WXH - WCF * Math.cos(a), yte = WY - WCF * Math.sin(a);
    if (x >= WXH) return WY; if (x >= xte) return WY - (WXH - x) * Math.tan(a); return yte - (xte - x) * Math.tan(a) * 0.8 * Math.exp(-(xte - x) / 1.4); };
  const flapCues = () => { const f = v.cam, lk = liftK(Math.max(0, v.force)), dk = dragK(v.force), C = WLE - WXH + WCF;
    wflows.forEach((w) => { const pts = []; for (let x = WLE + 2.6; x >= WXH - 4.4; x -= 0.12) { const u = (WLE - x) / C, th = w.sd > 0 ? WTU * nn(u) : -WTL * nn(u);
        const up = x > WLE ? 0.22 * liftK(Math.max(0, f)) * Math.exp(-(x - WLE) / 1.2) : 0;   // upwash ahead of the wing grows with lift
        pts.push([x, WY + (wcam(x, f) - WY + th + up) * w.w + w.d]); }
      w.el.setAttribute("d", pathD(smooth(pts, 4).map((p) => P(p[0], p[1], ZS)))); });
    const ly = WY + WTU + 0.14, lx = -0.6; line(liftF, P(lx, ly, ZS), P(lx, ly + 0.8 + 1.1 * lk, ZS));
    const a = v.flap * D, xte = WXH - WCF * Math.cos(a), yte = WY - WCF * Math.sin(a) * 0.55; line(dragF, P(xte - 0.25, yte, ZS), P(xte - 0.25 - (0.3 + 1.7 * dk), yte, ZS)); };
  const sections = () => { const C = (WLE - WXH) / 0.75, T = (WTU + WTL) / 0.6 / 1.0, up = [], lo = [];
    for (let i = 0; i <= 16; i++) { const u = 0.75 * (i / 16) ** 2, x = WLE - u * C; up.push(P(x, WY + 0.6 * T * nn(Math.max(u, 1e-4)), 7.2)); lo.push(P(x, WY - 0.4 * T * nn(Math.max(u, 1e-4)), 7.2)); }
    secW.setAttribute("d", pathD([...up, ...lo.reverse()]) + "Z");
    const hy = WY + 0.1 * T * nn(0.75), tu = 0.6 * T * nn(0.75), tl = 0.4 * T * nn(0.75), a = v.flap * D, ca = Math.cos(a), sa = Math.sin(a);
    const pts = [[0.05, 0.1 * T - 0.1 * T * nn(0.75)], [-0.02, tu * 0.96 - 0.1 * T * nn(0.75)], [-WCF, 0.02 - 0.1 * T * nn(0.75)], [-0.02, -tl * 0.96 - 0.1 * T * nn(0.75)]]
      .map(([dx, dy]) => P(WXH + dx * ca - dy * sa, hy + dx * sa + dy * ca, 6.93));
    secF.setAttribute("d", pathD(pts) + "Z"); };
  const cues = () => { const r = F.stage.getBoundingClientRect(); sv.setAttribute("viewBox", `0 0 ${r.width} ${r.height}`); trimCues(); sections(); flapCues(); };
  const seg = (i, t) => `<span data-i="${i}">${t}</span>`, ar = ' <span class="ar" aria-hidden="true">→</span> ';
  const setChain = () => { const key = mode === "flaps" ? "f" + flap0 + ">" + flap : "t" + Math.sign(trim); if (key === chainKey) return; chainKey = key;
    if (mode === "flaps") { tName.textContent = flap ? `Flaps ${flap}°` : "Flaps up"; tSub.textContent = flap ? `Max ${flap === 10 ? 110 : 85} KIAS` : "";
      if (flap === flap0) { chain.textContent = "Move the flap lever to 10°, 20° or 30°."; return; }
      const dn = flap > flap0, big = Math.max(flap, flap0) >= 20;
      chain.innerHTML = dn ? [seg(0, "Flaps down"), seg(1, "more camber"), seg(2, big ? "more lift, much more drag" : "more lift, little drag"), seg(3, big ? "slower, steeper approach" : "slower approach")].join(ar)
        : [seg(0, "Flaps up"), seg(1, "less camber"), seg(2, big ? "much less drag, less lift" : "less lift"), seg(3, "more speed needed")].join(ar); return; }
    tSub.textContent = "";
    if (!trim) { tName.textContent = "Elevator trim"; chain.textContent = "Roll the wheel up for nose down, down for nose up."; return; }
    const up = trim < 0; tName.textContent = up ? "Nose-down trim" : "Nose-up trim";
    chain.innerHTML = [seg(0, `Tab ${up ? "up" : "down"}`), seg(1, `air pushes ${up ? "down" : "up"}`), seg(2, `elevator ${up ? "down" : "up"}`), seg(4, `nose ${up ? "down" : "up"}`)].join(ar); };
  const light = () => { let prog;
    if (mode === "flaps") { const dd = flap - flap0 || 1; prog = [v.flap, v.cam, v.force, v.path].map((x) => (x - flap0) / dd); }
    else { const k = Math.abs(trim) || 1; prog = [Math.abs(v.tab) / TAB_MAX, Math.abs(v.push), Math.abs(v.elev) / ELEV_MAX, Math.abs(v.lift), Math.abs(v.pitch) / PITCH_MAX].map((x) => x / k); }
    chain.querySelectorAll("[data-i]").forEach((el) => el.classList.toggle("on", prog[+el.dataset.i] > 0.55)); };
  const apply = () => { S.pose({ trim: v.tab, elev: v.elev, flap: v.flap }); S.setAttitude({ pitch: v.pitch }); clipTo(v.clip); cues(); light(); };
  const tick = (now) => { const dt = Math.min(64, now - (last || now)); last = now; let busy = false; const tg = targets();
    for (const k in tau) { const d = tg[k] - v[k]; if (Math.abs(d) < (k === "push" || k === "lift" ? 0.002 : 0.02)) v[k] = tg[k]; else { v[k] += d * Math.min(1, dt / tau[k]); busy = true; } }
    const df = flap - v.flap; if (Math.abs(df) < 0.05) v.flap = flap; else { v.flap += Math.sign(df) * Math.min(Math.abs(df), dt * 0.03); busy = true; }   // the flap motor runs at a steady rate
    const ct = mode === "flaps" ? 1 : 0, dc = ct - v.clip; if (Math.abs(dc) < 1e-3) v.clip = ct; else { v.clip += Math.sign(dc) * Math.min(Math.abs(dc), dt / 1400); busy = true; }   // slice in step with the camera flight
    apply(); if (!busy) { running = false; last = 0; S.animate(null); } };
  const go = () => { setChain(); if (reduced()) { for (let i = 0; i < 8; i++) Object.assign(v, targets()); v.flap = flap; Object.assign(v, { cam: flap, force: flap, path: flap, clip: mode === "flaps" ? 1 : 0 }); apply(); return; } if (!running) { running = true; last = 0; S.animate(tick); } };
  const FOCUS = { trim: ["trimtab"], flaps: ["flaps"] };
  let show = (m) => { showChips.set(m); if (m === mode) return; mode = m; flap0 = flap; F.root.classList.toggle("tf-flaps", m === "flaps"); S.focus(FOCUS[m]); S.tint(FOCUS[m]); S.setView(VIEW[m](), 1500); go(); explain(); };
  const src = (t) => `<span class="src">${t}</span>`;
  const explain = () => F.explain(mode === "flaps"
    ? "Lowering the flaps adds <b>camber</b> to the wing, so it makes more <b>lift</b> and more <b>drag</b>. The extra lift lets you fly slower; the extra drag lets you descend more steeply without speeding up. The first notch adds mostly lift; the last notches add mostly drag. " +
      src("PHAK Ch 6, flaps: increase lift and drag. AFH Ch 9: up to about 15° mostly lift, beyond 15° a large increase in drag, steeper descent angle. 172S max flap speeds: 110 KIAS at 10°, 85 KIAS from 10° to 30° (POH Sec 2); flap stops 10°, 20°, 30° (POH Sec 7). Airflow and arrows are illustrations, not to scale. Confirm with your CFI and the POH.")
    : "The trim wheel moves <b>only the tab</b>. In flight, air pushes the tab the <b>opposite</b> way. That push acts far behind the hinge, so it swings the whole elevator opposite the tab, and the elevator pitches the airplane. The tab is too small to do that itself. " +
      src("PHAK Ch 6, trim tabs: \u201cNose-down trim: tab up, elevator down.\u201d Movement exaggerated for clarity. In the 172S, roll the wheel forward (up) to trim nose down. Confirm with your CFI and the POH."));
  // one draw-on for the part in focus, then never again (switching modes only moves the camera and fades the accent)
  S.setView(VIEW.trim(), 1); S.highlight(FOCUS.trim); S.tint(FOCUS.trim); clipAll(); clipTo(0);
  const showChips = F.chipsApi([["trim", "Elevator trim"], ["flaps", "Flaps"]], "trim", (m) => show(m), "Show");
  wheel((x) => { trim = x; show("trim"); go(); });
  F.chipsApi([["0", "0°"], ["10", "10°"], ["20", "20°"], ["30", "30°"]], "0", (x) => { show("flaps"); flap0 = flap; flap = +x; go(); explain(); }, "Flap lever");
  // keep the cues glued to the model while the camera flies or the user orbits
  const ro = new ResizeObserver(() => cues()); ro.observe(F.stage);
  let craf = 0, until = 0, held = false; const follow = (now) => { cues(); craf = held || now < until ? requestAnimationFrame(follow) : 0; };
  const followFor = (ms) => { until = Math.max(until, performance.now() + ms); if (!craf) craf = requestAnimationFrame(follow); };
  const cv = F.stage.querySelector("canvas");
  const down = () => { held = true; followFor(0); }, upEv = () => { held = false; followFor(1400); };   // orbit drags (OrbitControls damps for ~1 s after release)
  cv.addEventListener("pointerdown", down); window.addEventListener("pointerup", upEv); cv.addEventListener("wheel", () => followFor(1400), { passive: true });
  const show0 = show; show = (m) => { const was = mode; show0(m); if (m !== was) followFor(1800); };
  setChain(); explain(); apply(); followFor(600);
  return () => { cancelAnimationFrame(craf); ro.disconnect(); window.removeEventListener("pointerup", upEv); clipTo(0); };
}
