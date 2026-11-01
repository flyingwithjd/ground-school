// GL8 supplement text: weather sources, observations (radar, satellite, upper air), analysis and prog charts, flight categories, ATC radar weather and datalink limits.
export default {
  sections: [
    { id: "sources", at: "^", label: "Where to get weather · AIM 7-1 · AWH", title: "Your weather sources",
      body: `<p><strong>Flight Service</strong> is the FAA's weather briefing program. Get briefings online at <strong>1800wxbrief.com</strong> or call <strong>1-800-WX-BRIEF</strong> (Alaska: 1-833-AK-BRIEF). <span class="src">AIM 7-1-2</span></p>
<p>The National Weather Service's <strong>Aviation Weather Center</strong> (aviationweather.gov) publishes the reports, forecasts, advisories and the <strong>Graphical Forecasts for Aviation (GFA)</strong> tool. Commercial EFB apps repackage the same data, usually for a subscription fee. <span class="src">FAA-H-8083-28 (AWH) 3</span></p>
<p class="note">Older texts mention the Telephone Information Briefing Service (TIBS) and En Route Flight Advisory Service ("Flight Watch," 122.0). In 2015 the FAA folded Flight Watch into regular Flight Service and ended 122.0; TIBS has largely been discontinued. In flight today, call Flight Service on its published frequency or 122.2, or use FIS-B. <span class="src">FAA Notice JO 7210.887</span></p>`,
      kdr: { k: "Name the official weather sources and how to reach Flight Service.", d: "Get and document a briefing from an approved source before every flight.", r: "Relying on an unofficial app or an old printout.", codes: ["PA.I.C.K1", "PA.I.C.S1"] } },
    { id: "obs", at: "pirep", label: "Radar, satellite, balloons · AWH 24", title: "Observations beyond the METAR",
      body: `<p><strong>Weather radar (WSR-88D, "NEXRAD")</strong> detects precipitation, not clouds. The network has about 160 radars. One complete scan takes 4–11 minutes, and the product time is the <em>end</em> of the scan. <span class="src">AWH 24.6</span></p>
<p><strong>Satellite imagery</strong> shows clouds where radar can't: <span class="src">AWH 24.7</span></p>
<ul><li><strong>Visible</strong>: reflected sunlight, like a black-and-white photo. Daylight only.</li>
<li><strong>Infrared</strong>: temperature of cloud tops (or the ground). Colder tops are higher clouds. Works day and night.</li>
<li><strong>Water vapor</strong>: moisture in the middle and upper atmosphere, day and night.</li></ul>
<p><strong>Upper-air observations</strong>: weather balloons carrying radiosondes are launched twice daily, around 1100 and 2300 UTC, and measure pressure, temperature, moisture and wind aloft. Those soundings feed the computer models behind forecasts. <span class="src">AWH 24.8</span></p>
<p><strong>Flight categories</strong>, used on many charts: <span class="src">AIM 7-1</span></p>
<ul><li><strong>VFR</strong>: ceiling above 3,000 ft and visibility above 5 SM.</li>
<li><strong>MVFR</strong>: ceiling 1,000–3,000 ft and/or visibility 3–5 SM.</li>
<li><strong>IFR</strong>: ceiling 500 to below 1,000 ft and/or visibility 1 to below 3 SM.</li>
<li><strong>LIFR</strong>: ceiling below 500 ft and/or visibility below 1 SM.</li></ul>`,
      kdr: { k: "Explain what radar, satellite and radiosonde observations show, and the flight categories.", d: "Use IR satellite at night and radar for precipitation; treat MVFR as a caution for a new pilot.", r: "Reading a clear radar picture as clear skies.", codes: ["PA.I.C.K2", "PA.I.C.K2a", "PA.I.C.R2b"] } },
    { id: "charts", at: "obs", label: "Charts · AWH 25, 27 · ACS", title: "The big picture on a chart",
      body: `<p>The <strong>surface analysis chart</strong> is the classic weather map: isobars (every 4 mb), highs and lows, ridges, troughs, and fronts. Pressure is reduced to sea level; everything else is plotted as observed at the station. It's issued for North America eight times a day, every 3 hours from 00 UTC. <span class="src">AWH 25.2</span></p>
<p>The ACS also lists the <strong>Ceiling and Visibility Analysis (CVA)</strong>: a map of current ceiling, visibility and flight category, estimated between reporting stations. Treat it as an overview; confirm with the METARs. <span class="src">FAA-S-ACS-6C PA.I.C.K2b</span></p>
<p><strong>Short-range surface prog charts</strong> are forecasts: snapshots of expected fronts, pressure systems and precipitation at set valid times over several days. Light shading means a <em>chance</em> (25 to under 55%) and dark shading means <em>likely</em> (55% or more). <span class="src">AWH 27.9</span></p>
<p>For a VFR flight, also look at the <strong>GFA</strong> (clouds, weather, ceilings and visibility, AIRMETs) and the <strong>convective outlook</strong> before you commit. <span class="src">AWH 3 · FAA-S-ACS-6C PA.I.C.K2</span></p>`,
      kdr: { k: "Read the surface analysis, CVA and prog charts.", d: "Use charts to see the pattern before reading point reports and forecasts.", r: "Treating an interpolated map as an observation.", codes: ["PA.I.C.K2b", "PA.I.C.K2d", "PA.I.C.K2f", "PA.I.C.S3"] } },
    { id: "atcwx", at: "charts", label: "ATC and datalink weather · AIM 7-1", title: "Weather on ATC's scope and in your cockpit",
      body: `<p>ATC radar can't see clouds, only precipitation, and can't tell rain from hail or virga, so controllers call it all "precipitation." Where they can measure it, they describe intensity as: <span class="src">AIM 7-1</span></p>
<ul><li><strong>LIGHT</strong>: under 26 dBZ</li><li><strong>MODERATE</strong>: 26–40 dBZ</li><li><strong>HEAVY</strong>: over 40–50 dBZ</li><li><strong>EXTREME</strong>: over 50 dBZ</li></ul>
<p>If they can't measure it, they say "intensity unknown." Center's display can be up to 6 minutes old. <span class="src">AIM 7-1</span></p>
<p><strong>Datalink weather</strong> (FIS-B on 978 MHz UAT, or a satellite subscription) shows where the weather <em>was</em>. NEXRAD mosaic images may be <strong>15 to 20 minutes older</strong> than the time on the display. Use it <strong>strategically</strong>, to choose a route that avoids storms entirely, never <strong>tactically</strong> to pick through a gap. FIS-B NOTAMs only go back 30 days (except TFRs). <span class="src">AIM 7-1</span></p>
<p>Stay at least 20 miles from any severe thunderstorm or one that gives an intense radar echo. <span class="src">AIM 7-1</span></p>`,
      kdr: { k: "Explain ATC precipitation intensity terms and the limits of datalink weather.", d: "Use datalink weather to plan a wide avoidance route and ask ATC for help.", r: "Threading cells on a 15–20 minute old image.", codes: ["PA.I.C.K4", "PA.I.C.R2a", "PA.I.C.R2c"] } },
  ],
};
