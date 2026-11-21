// Explicit page order per lesson (page ids). The lesson's URL index (#/lesson/<id>/<n>) is the position in this list.
// Questions attach to pages by id (data/qsec.js), so reordering never touches question ids or saved progress (ppg.v1).
// Lessons not listed keep the base + supplement merge order.
export const PAGE_ORDER = {
  // GL1 (Nov 2026): how the airplane works and flies first, then the systems and engine, then preflight and ground ops,
  // and the paperwork (records and certificates, merged) and the path to the certificate last.
  gl1: ["parts", "c172", "axes", "aero", "subs", "engine", "build", "insts", "walk", "ground", "wind", "runup", "papers", "cert"],
};
