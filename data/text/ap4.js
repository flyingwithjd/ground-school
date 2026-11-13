export default {
  sections: [
    { id: "learn", label: "Six sign types · AIM 2-3-7", title: "Read the color first",
      body: `<p>Airports use six kinds of signs: mandatory instruction, location, direction, destination, information and runway distance remaining. <strong>White on red</strong> means stop: a runway, approach area, ILS area or no entry. <strong>Yellow on black</strong> says where you are. <strong>Black on yellow</strong> says where to go or tells you something. <span class="src">AIM 2-3-7 to 2-3-13; AC 150/5340-18H</span></p>
<p>Tap each sign to see what it means and what you do.</p>`,
      viz: { type: "signs", opts: { mode: "learn" } },
      kdr: { k: "Airport signs and their meaning.", d: "Use signs to taxi to the correct runway.", r: "Wrong-runway departures; incursions.", codes: ["PA.II.D.K3", "PA.II.D.S7", "PA.II.D.R2"] } },
    { id: "drill", label: "Meaning and action drill", title: "What does it say?",
      body: `<p>Name the meaning of each sign before you taxi past it. The drill shows one sign at a time and four choices. Getting them right without hesitating is the goal.</p>
<p>What each sign asks of you: at a red runway holding position sign, stop at the hold line unless ATC has cleared you onto or across the runway; at a nontowered airport, make sure the runway and its approaches are clear first. A direction sign's arrows show the turn onto each taxiway, and it normally stands on the left before the intersection. A destination sign always has an arrow and names a place, such as APRON, FUEL or a runway. The yellow runway boundary sign faces the runway: once you have passed it on your way off, you are clear. Black runway distance remaining signs count the landing runway left, in thousands of feet. <span class="src">AIM 2-3-8 to 2-3-13</span></p>`,
      viz: { type: "signs", opts: { mode: "drill" } },
      kdr: { k: "Mandatory, location and direction signs.", d: "Respond correctly to each sign.", r: "Misreading a sign at a complex intersection.", codes: ["PA.II.D.K3", "PA.II.D.S8"] } },
  ],
};
