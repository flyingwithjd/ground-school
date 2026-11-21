// Explicit page order per lesson (page ids). The lesson's URL index (#/lesson/<id>/<n>) is the position in this list.
// Questions attach to pages by id (data/qsec.js), so reordering never touches question ids or saved progress (ppg.v1).
// Lessons not listed keep the base + supplement merge order.
export const PAGE_ORDER = {
  // GL1 (Nov 2026): how the airplane works and flies first, then the systems and engine, then preflight and ground ops,
  // and the paperwork (records and certificates, merged) and the path to the certificate last.
  gl1: ["parts", "c172", "axes", "aero", "subs", "engine", "build", "insts", "walk", "ground", "wind", "runup", "papers", "poh", "cert", "certs"],
  // GL2 in blocks: controls | engine | fuel | electrical | instruments | airframe and cabin | beyond the trainer | paperwork last
  gl2: ["primary", "secondary", "secctl", "engine", "ignition", "starting", "induct", "mixture", "combust", "oilcool", "prop", "fuel", "fuellim", "refuel", "elec", "pitot", "gyro", "airframe", "heat", "icing", "ap", "oxygen", "press", "other", "limits", "catlim", "koel"],
  // GL3 opens with the forces visual; climbs follow drag; the standard atmosphere bridges to GL5 density altitude
  gl3: ["forces", "lift", "newton", "drag", "climb", "vortex", "load", "left", "stab", "plan", "ge", "atmo"],
  // GL4 opens with the pattern; airport data/planning last, as the bridge into the Airport units
  gl4: ["legs", "dir", "entry", "see", "row", "tower", "radar", "incursion", "kinds"],
  // GL7: air masses before fronts (a front is where two meet); wind shear next to thunderstorms
  gl7: ["circ", "press", "local", "stab", "moist", "cloud", "fog", "precip", "mass", "front", "ts", "llws"],
  // GL8 opens with the METAR decoder
  gl8: ["metar", "taf", "fb", "sources", "brief", "adv", "pirep", "obs", "charts", "atcwx"],
  // GL11 opens with the pilot's responsibilities; the rule book and course pages follow
  gl11: ["pic", "inop", "maint", "ad", "ntsb", "asrs", "system", "course", "presolo", "priv", "current"],
  // GL15: how your eyes work first, the legal definitions after
  gl15: ["vision", "illus", "poslights", "apt", "def", "equip", "prep", "ground", "climb", "land", "emerg"],
  // GL17: the body first, the medical certificate rules last
  gl17: ["hyp", "types", "hv", "ears", "sd", "opt", "eyes", "mot", "stress", "dehyd", "alc", "dcs", "med"],
};
