export default {
  sections: [
    { id: "reg", label: "Regulatory · 14 CFR 91", title: "The rules behind the letters",
      body: `<p>Pick a set, tap each letter for the rule, then switch to Recall and say them from memory. <span class="src">14 CFR 91.203, 91.205, 91.207, 91.409–91.413</span></p>`,
      viz: { type: "mnemo", opts: { sets: ["atomato", "flaps", "arrow", "av1ate"] } },
      kdr: { k: "Equipment, documents and inspections.", d: "Explain each item.", r: "Rote recall without understanding.", codes: ["PA.I.B.K3", "PA.I.B.K1a", "PA.I.B.K1b"] } },
    { id: "adm", label: "ADM · PHAK Ch 2", title: "Thinking tools",
      body: `<p>These come from the PHAK, except ABCDE, which is a common training aid and not a POH checklist. <span class="src">PHAK Ch 2; C172S POH 3</span></p>`,
      viz: { type: "mnemo", opts: { sets: ["imsafe", "pave", "p3", "decide", "attitudes", "abcde"] } },
      kdr: { k: "ADM and risk management.", d: "Use the tools in a scenario.", r: "Hazardous attitudes.", codes: ["PA.I.H.K4", "PA.I.H.R2", "PA.IX.B.K1"] } },
  ],
};
