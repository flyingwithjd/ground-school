// Local-only persistence. One key, versioned. No network.
const KEY = "ppg.v1";
const blank = () => ({ v: 1, created: Date.now(), items: {}, lessons: {}, notes: {}, sims: [], blind: {}, settings: { confidence: true, newPerSession: 12 } });
let state = load();
function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 1) return { ...blank(), ...s, settings: { ...blank().settings, ...(s.settings || {}) } }; } catch (e) {}
  return blank();
}
let t = null;
export function save(now = false) { clearTimeout(t); const w = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn("save failed", e); } }; now ? w() : (t = setTimeout(w, 120)); }
export const S = () => state;
export function item(id) { return state.items[id]; }
export function setItem(id, v) { state.items[id] = v; save(); }
export function lessonState(id) { return (state.lessons[id] ||= { visited: 0, sec: 0, read: [] }); }
export function exportJSON() { return JSON.stringify({ app: "private-pilot-ground", exported: new Date().toISOString(), state }, null, 1); }
export function importJSON(text) {
  const o = JSON.parse(text); const s = o && o.state ? o.state : o;
  if (!s || s.v !== 1 || typeof s.items !== "object") throw new Error("This file is not a progress export from this app.");
  state = { ...blank(), ...s, settings: { ...blank().settings, ...(s.settings || {}) } }; migs.forEach((fn) => { try { fn(state); } catch (e) { console.warn("migration failed", e); } }); save(true);
}
export function reset() { state = blank(); state.blindInit = 1; save(true); }
// Additive migrations registered by other modules; each runs on the loaded state now and after every import.
const migs = []; export function migrate(fn) { migs.push(fn); try { fn(state); } catch (e) { console.warn("migration failed", e); } }
window.addEventListener("pagehide", () => save(true));
