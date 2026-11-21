// Supplement sections (data/text/x/<id>.js) slot in after the section named by `at` ("^" = first), else at the end.
// A supplement whose anchor is itself a later supplement waits until that anchor has been placed (it used to fall to the end).
// `order` (data/order.js, by lesson): an explicit list of page ids that sets the final page order; pages it leaves out keep
// their merged order after the listed ones.
export function mergeSections(base, extra, order) { const out = base.slice(); const last = {};
  const place = (s) => { if (s.at === "^") { const k = last["^"] ? out.indexOf(last["^"]) + 1 : 0; out.splice(k, 0, s); last["^"] = s; return true; }
    const a = last[s.at] || out.find((b) => b.id === s.at); const k = s.at && a ? out.indexOf(a) : -1; if (k < 0 && s.at) return false;
    if (k >= 0) out.splice(k + 1, 0, s); else out.push(s); if (s.at) last[s.at] = s; return true; };
  // a later supplement with the same anchor goes after the earlier one, so runs keep the order written
  let wait = extra.slice(); for (let pass = 0; wait.length && pass < 8; pass++) { const left = wait.filter((s) => !place(s)); if (left.length === wait.length) break; wait = left; }
  wait.forEach((s) => out.push(s));
  if (!order || !order.length) return out;
  const rank = new Map(order.map((id, i) => [id, i])); const listed = out.filter((s) => rank.has(s.id)).sort((a, b) => rank.get(a.id) - rank.get(b.id));
  return [...listed, ...out.filter((s) => !rank.has(s.id))]; }
