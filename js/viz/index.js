// Lazy visualization registry: each viz is its own module exporting mount(host, opts) -> { destroy }.
const live = new Set();
export async function mountViz(host, spec) {
  const ph = document.createElement("div"); host.append(ph);
  try { const mod = await import(`./${spec.type}.js?v=69d1e15885`); if (!ph.isConnected) return; const v = await mod.mount(ph, spec.opts || {}); live.add(v); return v; }
  catch (e) { console.error("viz failed", spec.type, e); ph.innerHTML = `<p class="dim" style="font-size:15px">This visualization could not start in this browser (${String(e.message || e).slice(0, 80)}).</p>`; }
}
export function destroyAll() { live.forEach((v) => { try { v && v.destroy && v.destroy(); } catch (e) {} }); live.clear(); }
