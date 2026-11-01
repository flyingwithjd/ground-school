// GL8 lesson text
export default {
  sections: [
    { id: "brief", label: "Briefings · PHAK 13", title: "Start with the big picture",
      body: `<p class="note">All reports here are examples from the FAA handbooks, never current weather.</p>
<p>Get a <strong>standard briefing</strong> before every flight. It runs in order: adverse conditions, "VFR flight not recommended" if applicable, synopsis, current conditions, then forecasts and more. An <strong>abbreviated</strong> briefing updates one you already have; tell the briefer when and where you got it. An <strong>outlook</strong> briefing is for departures 6 hours or more away. <span class="src">PHAK 13</span></p>
<p>"VFR flight not recommended" is advice, not a prohibition, but the PHAK says to weigh it carefully. For a student pilot, your solo endorsement limits and your CFI come first. <span class="src">PHAK 13; 14 CFR 61.87</span></p>`,
      kdr: { k: "Standard, abbreviated and outlook briefings and their order.", d: "Call for a standard briefing and take notes in the briefing order.", r: "Skipping a briefing because the sky looks fine.", codes: ["PA.I.C.K1", "PA.I.C.K2"] } },
    { id: "metar", label: "METAR · PHAK 13", title: "A sentence in code",
      body: `<p>A [[METAR]] is an observation of current surface weather. Read it left to right: type, station, date and time (UTC), modifier, wind (true, knots), visibility (statute miles), weather, sky (hundreds of feet AGL), temperature/dew point (°C), altimeter and remarks. Tap each group. <span class="src">PHAK 13</span></p>`,
      viz: { type: "metar", opts: { kind: "metar", kinds: ["metar", "metar2"] } },
      body2: `<p>Automated stations can't see clouds above 12,000 ft, so CLR from an automated station means "nothing detected below 12,000," not a clear sky. <span class="src">PHAK 13</span></p>`,
      kdr: { k: "Every METAR group; ceilings; automated-station limits.", d: "Decode a METAR aloud and say whether it's VFR.", r: "Reading wind as magnetic or heights as MSL.", codes: ["PA.I.C.K2a", "PA.I.C.R2b"] } },
    { id: "taf", label: "TAF · PHAK 13", title: "A forecast in blocks",
      body: `<p>A [[TAF]] is a forecast for the 5 SM radius around an airport, valid 24 or 30 hours. It uses METAR codes plus change groups: <strong>FM</strong> (from: a rapid change that replaces the forecast before), <strong>TEMPO</strong> (temporary fluctuations under an hour) and <strong>PROB30</strong>. P6SM means more than 6 SM. Only CB clouds are forecast. <span class="src">PHAK 13</span></p>`,
      viz: { type: "metar", opts: { kind: "taf", kinds: ["taf"] } },
      kdr: { k: "TAF valid periods, change groups and limits.", d: "Find the block that covers your arrival time.", r: "Ignoring a TEMPO or PROB30 thunderstorm that overlaps your ETA.", codes: ["PA.I.C.K2c"] } },
    { id: "fb", label: "Winds aloft · PHAK 13", title: "Pick your altitude",
      body: `<p>The [[winds aloft]] forecast (FB) gives wind (true direction, knots) and temperature (°C) at set altitudes. No wind is forecast within 1,500 ft of the station, and no temperature within 2,500 ft. 9900 means light and variable. If the first two digits are over 36, subtract 50 from the direction and add 100 to the speed. <span class="src">PHAK 13</span></p>`,
      viz: { type: "metar", opts: { kind: "fb", kinds: ["fb"] } },
      kdr: { k: "FB coding and its exceptions.", d: "Choose a cruise altitude with the best wind.", r: "Mixing true wind from the FB with magnetic headings without correcting.", codes: ["PA.I.C.K2e"] } },
    { id: "adv", label: "Inflight advisories · PHAK 13; AWH 26", title: "AIRMET, SIGMET, convective SIGMET",
      body: `<ul><li><strong>[[AIRMET]]</strong>: hazardous mainly to light aircraft. <em>Sierra</em>: IFR and mountain obscuration. <em>Tango</em>: moderate turbulence, sustained surface winds of 30 kt or more, low-level wind shear. <em>Zulu</em>: moderate icing and freezing levels. Issued every 6 hours over the CONUS, amended as needed.</li>
<li><strong>[[SIGMET]]</strong>: hazardous to all aircraft. Severe icing, severe or extreme turbulence, dust or sandstorms under 3 miles, volcanic ash. Valid 4 hours (6 for hurricanes).</li>
<li><strong>Convective SIGMET</strong>: severe thunderstorms (surface winds over 50 kt, hail 3/4 in or more, or tornadoes), embedded storms, lines of storms, or storms covering 40% or more of a 3,000 square-mile area. Valid 2 hours.</li></ul>
<p>For the big picture across the contiguous U.S., use the Graphical Forecasts for Aviation (GFA). <span class="src">PHAK 13; AWH 3, 26, 27</span></p>`,
      kdr: { k: "Advisory types, criteria and validity.", d: "Check every advisory along your route during the briefing.", r: "Treating an AIRMET as 'only moderate' in a trainer.", codes: ["PA.I.C.K2g", "PA.I.C.K2d", "PA.I.C.R1c"] } },
    { id: "pirep", label: "PIREPs and in-cockpit weather · PHAK 13", title: "What it's actually like up there",
      body: `<p>A [[PIREP]] is the only source of how conditions actually are in the air: bases, tops, turbulence, wind shear and icing. File one when you meet unexpected weather. <span class="src">PHAK 13</span></p>
<p>In-cockpit NEXRAD and datalink weather are strategic tools. The image can be older than you think, and it never replaces a preflight briefing. <span class="src">PHAK 13</span></p>`,
      kdr: { k: "PIREP content; datalink weather limits.", d: "Give a simple PIREP: location, time, altitude, aircraft type, what you saw.", r: "Using datalink radar to thread between cells.", codes: ["PA.I.C.K4", "PA.I.C.R2a"] } },
  ],
};
