// Supplement sections (data/text/x/<id>.js) slot in after the section named by `at` ("^" = first), else at the end.
export function mergeSections(base, extra) { const out = base.slice(); const last = {};
  // a later supplement with the same anchor goes after the earlier one, so runs keep the order written
  for (const s of extra) { if (s.at === "^") { const k = last["^"] ? out.indexOf(last["^"]) + 1 : 0; out.splice(k, 0, s); last["^"] = s; continue; }
    const a = last[s.at] || out.find((b) => b.id === s.at); const k = s.at && a ? out.indexOf(a) : -1; if (k >= 0) out.splice(k + 1, 0, s); else out.push(s); if (s.at) last[s.at] = s; }
  return out; }
