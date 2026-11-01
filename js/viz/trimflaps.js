// Trim and flaps on ONE 3D stage. Trim: the wheel moves only the tab; in flight the chain plays out in order on the
// real airplane (tab -> air pushes the tab -> elevator swings opposite -> tail force -> airplane pitches). Flaps: the
// same stage flies the camera to the right wing and the flap motor runs the flaps. Title and chain sit in their own
// bands above and below the stage, never over the model. PHAK Ch 6 · POH Sec 7.
import { h, s, clamp, reduced } from "../core/util.js?v=25fe20f25f";
const D = Math.PI / 180, ACC = "#3B82F6", INK = "#F2F1EC";
const TAB_MAX = 35, ELEV_MAX = 20, PITCH_MAX = 4;          // degrees, exaggerated for clarity
const HX = -16.4, Y0 = 4.62, EL = 0.92, TL = 0.44, ZF = 1.75;  // elevator hinge, chord to the tab hinge, tab chord, span station of the cues (ft, model space)
export function trimFlaps(F, S, { wheel }) {
  const phone = () => F.stage.getBoundingClientRect().width < 560;
  const VIEW = { trim: () => (phone() ? { tg: [-17.0, 4.9, 1.2], az: 112, el: 16, d: 15.5 } : { tg: [-15.6, 5.5, 1.0], az: 114, el: 15, d: 13.5 }),
    flaps: () => (phone() ? { tg: [-3.2, 6.3, 6.2], az: 128, el: 30, d: 21 } : { tg: [-3, 6.3, 6.5], az: 130, el: 30, d: 20 }) };
  F.root.classList.add("tf");
  // bands: big title above the stage, the step chain below it
  const title = h("div", { class: "tf-title" }), chain = h("p", { class: "tf-chain", "aria-live": "polite" });
  F.root.insertBefore(title, F.stage); F.stage.after(chain);
  // minimal airflow cues drawn over the canvas from projected model points (no text in here)
  const sv = s("svg", { class: "tf-cues", "aria-hidden": "true" }, F.stage);
  const uid = Math.random().toString(36).slice(2, 7);
  s("defs", {}, sv).innerHTML = `<marker id="tfw${uid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${INK}"/></marker><marker id="tfa${uid}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${ACC}"/></marker>`;
  const flows = [[0.38, 1], [0.8, 0.55], [-0.38, 1], [-0.8, 0.55]].map(([d, w]) => ({ d, w, el: s("path", { class: "tf-flow", fill: "none", stroke: "rgba(242,241,236,.55)", "stroke-width": 1.3, "stroke-dasharray": "6 6" }, sv) }));
  const tabF = s("line", { stroke: INK, "stroke-width": 2.6, "marker-end": `url(#tfw${uid})` }, sv);
  const tailF = s("line", { stroke: ACC, "stroke-width": 3.2, "marker-end": `url(#tfa${uid})` }, sv);
  let mode = "trim", trim = 0, flap = 0, chainKey = "", last = 0, running = false;
  const v = { tab: 0, push: 0, elev: 0, lift: 0, pitch: 0, flap: 0 };
  const tau = { tab: 140, push: 340, elev: 480, lift: 340, pitch: 560 };
  const targets = () => ({ tab: trim * TAB_MAX, push: v.tab / TAB_MAX, elev: -v.push * ELEV_MAX, lift: v.elev / ELEV_MAX, pitch: -v.lift * PITCH_MAX });
  const P = (x, y, z = ZF) => S.project([x, y, z]);
  const camber = (s0) => { const e = v.elev * D, a = (v.elev + v.tab) * D, ts = EL * Math.cos(e), ty = Y0 - EL * Math.sin(e);   // s0 = distance aft of the hinge
    if (s0 <= 0) return Y0; if (s0 <= ts) return Y0 - s0 * Math.tan(e);
    const es = ts + TL * Math.cos(a), ey = ty - TL * Math.sin(a); if (s0 <= es) return ty - (s0 - ts) * Math.tan(a);
    return ey - (s0 - es) * Math.tan(a) * Math.exp(-(s0 - es) / 0.5); };
  const line = (el, a, b) => { el.setAttribute("x1", a.x.toFixed(1)); el.setAttribute("y1", a.y.toFixed(1)); el.setAttribute("x2", b.x.toFixed(1)); el.setAttribute("y2", b.y.toFixed(1)); };
  const cues = () => { const r = F.stage.getBoundingClientRect(); sv.setAttribute("viewBox", `0 0 ${r.width} ${r.height}`);
    flows.forEach((f) => { const pts = []; for (let x = -13.2; x >= -19.4; x -= 0.15) pts.push([x, camber(HX - x)]);
      const sm = pts.map((p, i) => { let acc = 0, n = 0; for (let k = -3; k <= 3; k++) { const q = pts[i + k]; if (q) { const wt = 4 - Math.abs(k); acc += q[1] * wt; n += wt; } } return P(p[0], Y0 + (acc / n - Y0) * f.w + f.d); });
      f.el.setAttribute("d", "M" + sm.map((p) => p.x.toFixed(1) + "," + p.y.toFixed(1)).join(" L")); });
    const e = v.elev * D, a = (v.elev + v.tab) * D, tx = HX - EL * Math.cos(e), ty = Y0 - EL * Math.sin(e);
    const mx = tx - (TL / 2) * Math.cos(a), my = ty - (TL / 2) * Math.sin(a), nx = -Math.sin(a), ny = Math.cos(a);   // tab middle and its upper-surface normal
    const p = v.push, sg = p > 0 ? -1 : 1, L = 0.25 + 0.75 * Math.abs(p);   // air pushes the tab up (+): the arrow comes from below
    line(tabF, P(mx + nx * sg * (L + 0.12), my + ny * sg * (L + 0.12)), P(mx + nx * sg * 0.12, my + ny * sg * 0.12)); tabF.setAttribute("opacity", clamp(Math.abs(p) * 2.5, 0, 1).toFixed(3));
    const ex = HX - 0.45 * Math.cos(e), ey = Y0 - 0.45 * Math.sin(e), lf = v.lift, dir = lf > 0 ? 1 : -1, LL = 0.3 + 1.6 * Math.abs(lf);
    line(tailF, P(ex, ey + dir * 0.18, 0.9), P(ex, ey + dir * (0.18 + LL), 0.9)); tailF.setAttribute("opacity", clamp(Math.abs(lf) * 2.5, 0, 1).toFixed(3)); };
  const setChain = () => { const key = mode === "flaps" ? "f" + flap : "t" + Math.sign(trim); if (key === chainKey) return; chainKey = key;
    if (mode === "flaps") { title.textContent = `Flaps ${flap}°`; chain.textContent = flap ? `Max ${flap === 10 ? 110 : 85} KIAS with this setting.` : "Flaps up. Stops at 10°, 20° and 30°."; return; }
    if (!trim) { title.textContent = "Elevator trim"; chain.textContent = "Roll the wheel up for nose down, down for nose up."; return; }
    const up = trim < 0, seg = (i, t) => `<span data-i="${i}">${t}</span>`, ar = ' <span class="ar" aria-hidden="true">→</span> ';
    title.textContent = up ? "Nose-down trim" : "Nose-up trim";
    chain.innerHTML = [seg(0, `Tab ${up ? "up" : "down"}`), seg(1, `air pushes ${up ? "down" : "up"}`), seg(2, `elevator ${up ? "down" : "up"}`), seg(4, `nose ${up ? "down" : "up"}`)].join(ar); };
  const light = () => { const k = Math.abs(trim) || 1, prog = [Math.abs(v.tab) / TAB_MAX, Math.abs(v.push), Math.abs(v.elev) / ELEV_MAX, Math.abs(v.lift), Math.abs(v.pitch) / PITCH_MAX];
    chain.querySelectorAll("[data-i]").forEach((el) => el.classList.toggle("on", prog[+el.dataset.i] / k > 0.55)); };
  const apply = () => { S.pose({ trim: v.tab, elev: v.elev, flap: v.flap }); S.setAttitude({ pitch: v.pitch }); cues(); light(); };
  const tick = (now) => { const dt = Math.min(64, now - (last || now)); last = now; let busy = false; const tg = targets();
    for (const k in tau) { const d = tg[k] - v[k]; if (Math.abs(d) < (k === "push" || k === "lift" ? 0.002 : 0.02)) v[k] = tg[k]; else { v[k] += d * Math.min(1, dt / tau[k]); busy = true; } }
    const df = flap - v.flap; if (Math.abs(df) < 0.05) v.flap = flap; else { v.flap += Math.sign(df) * Math.min(Math.abs(df), dt * 0.03); busy = true; }   // the flap motor runs at a steady rate
    apply(); if (!busy) { running = false; last = 0; S.animate(null); } };
  const go = () => { setChain(); if (reduced()) { for (let i = 0; i < 6; i++) Object.assign(v, targets()); v.flap = flap; apply(); return; } if (!running) { running = true; last = 0; S.animate(tick); } };
  let show = (m) => { showChips.set(m); if (m === mode) return; mode = m; F.root.classList.toggle("tf-flaps", m === "flaps"); S.setView(VIEW[m](), 1500); go(); explain(); };
  const explain = () => F.explain(mode === "flaps" ? (flap ? "Both flaps move down together, adding lift and drag so you can fly slower and descend more steeply. <span class=\"src\">POH Sec 2, 7</span>" : "Retracted. The 172S flap motor has stops at 10°, 20° and 30°. <span class=\"src\">POH Sec 7</span>")
    : "The trim wheel moves <b>only the tab</b>. In flight, air pushes the tab the <b>opposite</b> way. That push acts far behind the hinge, so it swings the whole elevator opposite the tab, and the elevator pitches the airplane. The tab is too small to do that itself. <span class=\"src\">PHAK Ch 6, trim tabs: \u201cNose-down trim: tab up, elevator down.\u201d Movement exaggerated for clarity. In the 172S, roll the wheel forward (up) to trim nose down. Confirm with your CFI and the POH.</span>");
  // one draw-on for everything this stage teaches, then never again (switching views only moves the camera)
  S.setView(VIEW.trim(), 1); S.highlight(["trimtab", "elevator", "flaps"]); S.tint(["trimtab", "flaps"]);
  const showChips = F.chipsApi([["trim", "Elevator trim"], ["flaps", "Flaps"]], "trim", (m) => show(m), "Show");
  wheel((x) => { trim = x; show("trim"); go(); });
  F.chipsApi([["0", "0°"], ["10", "10°"], ["20", "20°"], ["30", "30°"]], "0", (x) => { flap = +x; show("flaps"); go(); explain(); }, "Flap lever");
  // keep the cues glued to the model while the camera flies or the user orbits
  const ro = new ResizeObserver(() => cues()); ro.observe(F.stage);
  let craf = 0, until = 0, held = false; const follow = (now) => { cues(); craf = held || now < until ? requestAnimationFrame(follow) : 0; };
  const followFor = (ms) => { until = Math.max(until, performance.now() + ms); if (!craf) craf = requestAnimationFrame(follow); };
  const cv = F.stage.querySelector("canvas");
  const down = () => { held = true; followFor(0); }, upEv = () => { held = false; followFor(1400); };   // orbit drags (OrbitControls damps for ~1 s after release)
  cv.addEventListener("pointerdown", down); window.addEventListener("pointerup", upEv); cv.addEventListener("wheel", () => followFor(1400), { passive: true });
  const show0 = show; show = (m) => { const was = mode; show0(m); if (m !== was) followFor(1800); };
  setChain(); explain(); apply(); followFor(600);
  return () => { cancelAnimationFrame(craf); ro.disconnect(); window.removeEventListener("pointerup", upEv); };
}
