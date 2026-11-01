export default {
  sections: [
    { id: "tech", label: "Technique · AIM 4-2-2, 4-2-3", title: "Listen, think, then talk",
      body: `<p>Listen before you transmit, and know what you'll say before you key the mic. A call has four parts, in order: who you're calling, who you are, where you are, what you want. <span class="src">AIM 4-2-2, 4-2-3</span></p>
<p>Brevity matters, but clarity comes first. If you don't understand an instruction, ask for it again. Saying "unable" is always an option.</p>`,
      kdr: { k: "Radio procedures and phraseology.", d: "Transmit using standard phraseology.", r: "Unclear or non-standard calls.", codes: ["PA.III.A.K2", "PA.III.A.S2", "PA.III.A.R4"] } },
    { id: "phon", label: "Phonetics · AIM 4-2-7", title: "Spell it so it can't be misheard",
      body: `<p>Letters use the ICAO phonetic alphabet. Some numbers have special pronunciations, like TREE, FIFE and NIN-er. Type a call sign and tap each tile to hear how it's said in your head. <span class="src">AIM 4-2-7</span></p>`,
      viz: { type: "radio", opts: { mode: "phon" } },
      body2: `<p>Altitudes are given in thousands and hundreds: "four thousand five hundred." Frequencies are given digit by digit, with "point": "one two two point eight." Headings are magnetic and given in three digits. Times are UTC. <span class="src">AIM 4-2-8 to 4-2-12</span></p>`,
      kdr: { k: "Phonetic alphabet and number procedures.", d: "Say call signs, altitudes and frequencies correctly.", r: "Misunderstood numbers.", codes: ["PA.III.A.K2", "PA.III.A.S2", "PA.III.A.R1"] } },
    { id: "call", label: "CTAF calls · AIM 4-1-9", title: "Build the call, leg by leg",
      body: `<p>At a nontowered airport, self-announce on the [[CTAF]]: about 10 miles out, entering downwind, on base, on final, and when clear of the runway. Start and end with the airport name, and say the runway number. <span class="src">AIM 4-1-9</span></p>
<p>Pick a leg and read the call aloud before you look at the answer. Example Field is a made-up airport.</p>`,
      viz: { type: "radio", opts: { mode: "call" } },
      kdr: { k: "Self-announce procedures.", d: "Make the right call on each leg.", r: "Missed position reports.", codes: ["PA.III.A.K1", "PA.III.A.S1", "PA.III.A.S2"] } },
    { id: "lost", label: "Lost comm · AIM 4-2-13", title: "When the radio goes quiet",
      body: `<p>Troubleshoot first: volume, squelch, frequency, audio panel, headset plug and circuit breakers. If only the receiver has failed, stay outside or above the Class D airspace until you know the traffic, tell the tower your type, position, altitude and intent to land, and call about 3 to 5 miles out. Then watch the tower for light signals. <span class="src">AIM 4-2-13, 4-3-13</span></p>`,
      viz: { type: "lightgun", opts: { where: "air" } },
      kdr: { k: "Lost communication procedures and light signals.", d: "Respond to light signals.", r: "Loss of communication near an airport.", codes: ["PA.III.A.K5", "PA.III.A.K3", "PA.III.A.K6"] } },
  ],
};
