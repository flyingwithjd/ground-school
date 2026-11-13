// GL8 supplement: weather sources, radar/satellite/upper-air observations, flight categories, charts, ATC and datalink weather.
const Q = (id, t, q, c, why, src) => ({ id, t, q, c, a: 0, why, src });
export default {
  textx: true,
  topics: { "gl8.sources": "Weather sources", "gl8.obs": "Radar, satellite and upper air", "gl8.charts": "Analysis and prog charts", "gl8.atcwx": "ATC and datalink weather" },
  questions: [
    Q("gl8x-01", "gl8.sources", "How do you reach Flight Service for a briefing in the contiguous U.S.?", ["1800wxbrief.com or 1-800-WX-BRIEF", "Call the nearest tower", "122.0 MHz Flight Watch", "Any weather app counts"], "Flight Watch on 122.0 was retired in 2015.", "AIM 7-1-2"),
    Q("gl8x-02", "gl8.sources", "In flight today, where do you get a weather update from Flight Service?", ["Its published frequency or 122.2 MHz", "122.0 MHz Flight Watch", "121.5 MHz only", "The ATIS"], "EFAS/Flight Watch was folded into Flight Service in 2015.", "FAA Notice JO 7210.887"),
    Q("gl8x-03", "gl8.obs", "Weather radar (NEXRAD) detects:", ["Precipitation, not clouds", "All clouds", "Turbulence in clear air", "Icing"], "Satellite shows clouds; radar shows precipitation.", "AWH 24.6 · AIM 7-1"),
    Q("gl8x-04", "gl8.obs", "Which satellite image is useful only in daylight?", ["Visible", "Infrared", "Water vapor", "GeoColor at night"], "Visible imagery is reflected sunlight.", "AWH 24.7"),
    Q("gl8x-05", "gl8.obs", "On an infrared satellite image, the coldest cloud tops are usually:", ["The highest clouds", "The lowest clouds", "Fog", "Clear air"], "Temperature normally falls with height.", "AWH 24.7"),
    Q("gl8x-06", "gl8.obs", "Weather balloons (radiosondes) are launched:", ["Twice a day, around 1100 and 2300 UTC", "Every hour", "Once a week", "Only before storms"], "The data are timed 1200 and 0000 UTC and feed the forecast models.", "AWH 24.8"),
    Q("gl8x-07", "gl8.obs", "Ceiling 2,500 ft, visibility 6 SM. Flight category?", ["MVFR", "VFR", "IFR", "LIFR"], "VFR needs a ceiling above 3,000 ft and visibility above 5 SM.", "AIM 7-1"),
    Q("gl8x-08", "gl8.obs", "Ceiling 800 ft, visibility 4 SM. Flight category?", ["IFR", "MVFR", "LIFR", "VFR"], "The lower category of ceiling or visibility applies.", "AIM 7-1"),
    Q("gl8x-09", "gl8.charts", "The surface analysis chart shows:", ["Isobars, highs and lows, and fronts at the chart time", "Forecast freezing levels", "Turbulence aloft", "Winds at 9,000 ft"], "It's an analysis of observations, issued every 3 hours.", "AWH 25.2"),
    Q("gl8x-10", "gl8.charts", "On the surface analysis chart, isobars are drawn every:", ["4 mb", "1 mb", "10 mb", "1 inch of mercury"], "That's the standard interval on the NWS chart.", "AWH 25.2"),
    Q("gl8x-11", "gl8.charts", "How should you use the Ceiling and Visibility Analysis (CVA)?", ["As a quick overview, confirmed with METARs", "As an official forecast", "As a replacement for a briefing", "For winds aloft"], "It estimates conditions between reporting stations.", "FAA-S-ACS-6C"),
    Q("gl8x-12", "gl8.charts", "A short-range surface prog chart is:", ["A forecast of fronts, pressure systems and precipitation", "An observation of current weather", "A radar summary", "A winds aloft chart"], "Each panel is a snapshot at its valid time.", "AWH 27.9"),
    Q("gl8x-13", "gl8.atcwx", "ATC reports precipitation of 45 dBZ as:", ["HEAVY", "MODERATE", "LIGHT", "EXTREME"], "Heavy is above 40 up to 50 dBZ.", "AIM 7-1"),
    Q("gl8x-14", "gl8.atcwx", "Why does ATC call all radar weather 'precipitation'?", ["Its radar can't tell rain, hail, snow or virga apart", "Clouds always mean rain", "It's required by NOTAM", "To avoid alarming pilots"], "ATC radar can't see clouds either.", "AIM 7-1"),
    Q("gl8x-15", "gl8.atcwx", "Datalink NEXRAD in the cockpit may be how much older than the time shown?", ["15 to 20 minutes", "Less than 10 seconds", "Exactly 1 minute", "It's always real time"], "It shows where the weather was.", "AIM 7-1"),
    Q("gl8x-16", "gl8.atcwx", "The right way to use datalink weather around thunderstorms is:", ["Strategically, to plan a route that avoids them entirely", "Tactically, to pick a path between cells", "To find the thinnest part of the line", "Not at all"], "Stay at least 20 miles from severe storms.", "AIM 7-1"),
  ],
};
