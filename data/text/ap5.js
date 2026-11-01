export default {
  sections: [
    { id: "papi", label: "PAPI · PHAK Fig 14-30", title: "Two white, two red",
      body: `<p>A [[PAPI]] is a row of two or four lights, normally on the left side of the runway. Two white and two red is on a typical 3° glidepath. Three white is slightly high and four white is high; three red is slightly low and four red is low. Obstacle clearance is provided within ±10° of the centerline out to 3.4 NM. <span class="src">AIM 2-1-2; PHAK Fig 14-30</span></p>
<p>Slide the glidepath. Don't start down on it until you're aligned with the runway.</p>`,
      viz: { type: "lights", opts: { mode: "papi" } },
      kdr: { k: "Visual glideslope indicators.", d: "Stabilized approach on a visual glidepath.", r: "Descending below the glidepath at night.", codes: ["PA.XI.A.K2", "PA.IV.B.S6", "PA.IV.B.R1"] } },
    { id: "vasi", label: "VASI · AIM 2-1-2", title: "Red over white, all right",
      body: `<p>A two-bar [[VASI]] has near and far light bars. Each shows white in the upper part of its beam and red in the lower. Red over white is on the glidepath (normally 3°); white over white is high; red over red is low. Obstacle clearance: ±10° to 4 NM. Some airports use tri-color or pulsating systems instead. <span class="src">AIM 2-1-2; PHAK Ch 14</span></p>`,
      viz: { type: "lights", opts: { mode: "vasi" } },
      kdr: { k: "VASI indications.", d: "Fly the VASI glidepath.", r: "Low approaches over obstacles.", codes: ["PA.XI.A.K2", "PA.IV.B.R1"] } },
    { id: "rwy", label: "Runway and taxi lights · AIM 2-1", title: "Colors draw the airport",
      body: `<p>Runway edge lights are white, turning yellow over the last 2,000 ft (or half the runway, whichever is less) on instrument runways. End lights show green to arriving airplanes and red toward the runway. [[REIL]] flash in sync at the threshold. Taxiway edges are blue and centerlines green. A lit red stop bar is <strong>never</strong> crossed, even with a clearance. <span class="src">AIM 2-1-3, 2-1-4, 2-1-10</span></p>
<p>Real light colors are used here because the color is the message.</p>`,
      viz: { type: "lights", opts: { mode: "runway" } },
      kdr: { k: "Airport lighting.", d: "Identify the runway and taxiways at night.", r: "Incursions at night.", codes: ["PA.XI.A.K2", "PA.II.D.K3"] } },
    { id: "bcn", label: "Beacons and PCL · AIM 2-1-8, 2-1-9", title: "Find it, then light it",
      body: `<p>Airport beacons flash 24 to 30 times a minute: white and green for a lighted land airport, white and yellow for water, green-yellow-white for heliports, and dual-peaked white plus green for military. A beacon on in daylight in a surface area often means less than 3 miles visibility and/or a ceiling under 1,000 ft. <span class="src">AIM 2-1-9</span></p>
<p>[[Pilot-controlled lighting]]: key the mic 7 times within 5 seconds for high, 5 for medium and 3 for low. The lights stay on 15 minutes from the last activation. <span class="src">AIM 2-1-8</span></p>`,
      viz: { type: "lights", opts: { mode: "pcl" } },
      kdr: { k: "Beacons and pilot-controlled lighting.", d: "Activate and adjust airport lighting.", r: "Lights timing out on final.", codes: ["PA.XI.A.K2"] } },
  ],
};
