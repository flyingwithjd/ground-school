// GL7 supplement: circulation and pressure, local winds, wind shear, precipitation, air masses.
const Q = (id, t, q, c, why, src) => ({ id, t, q, c, a: 0, why, src });
export default {
  textx: true,
  topics: { "gl7.circ": "Circulation and pressure", "gl7.local": "Convective currents and obstructions", "gl7.llws": "Low-level wind shear", "gl7.precip": "Precipitation and visibility", "gl7.mass": "Air masses" },
  questions: [
    Q("gl7x-01", "gl7.circ", "What starts atmospheric circulation?", ["Uneven heating of the Earth's surface", "The moon's gravity", "Mountains", "Jet streams"], "Warm air rises; cool air sinks to replace it.", "PHAK 12"),
    Q("gl7x-02", "gl7.circ", "The three-cell circulation gives the contiguous U.S. its:", ["Prevailing westerly winds", "Northeast trade winds", "Prevailing easterly winds", "Calm winds"], "The trade winds blow between 30° latitude and the equator.", "PHAK 12"),
    Q("gl7x-03", "gl7.circ", "A station at 5,000 ft reads 24.92 \"Hg. What sea-level pressure does it report?", ["About 29.92 \"Hg", "24.92 \"Hg", "19.92 \"Hg", "34.92 \"Hg"], "Add about 1 \"Hg per 1,000 ft of elevation.", "PHAK 12"),
    Q("gl7x-04", "gl7.circ", "Steadily falling barometric pressure usually means:", ["Worsening weather is approaching", "Fair weather is approaching", "Nothing", "A temperature inversion"], "Rising pressure generally means fair weather.", "PHAK 12"),
    Q("gl7x-05", "gl7.local", "On final you pass over a large plowed field on a hot day. Expect:", ["Rising air that may make you balloon and overshoot", "Sinking air that puts you short", "Smooth air", "Wind shear from a front"], "Over water or thick trees, expect sink instead.", "PHAK 12"),
    Q("gl7x-06", "gl7.local", "During a sunny afternoon at a coastal airport, the local wind tends to blow:", ["Onshore, a sea breeze", "Offshore, a land breeze", "Parallel to the coast", "Calm"], "Land heats faster than water by day; at night it reverses.", "PHAK 12"),
    Q("gl7x-07", "gl7.local", "Crossing a ridge with a strong wind, where is the dangerous downdraft?", ["On the leeward (downwind) side", "On the windward side", "Directly over the peak only", "Nowhere; ridges cause only updrafts"], "Leeward air follows the slope down and is turbulent.", "PHAK 12"),
    Q("gl7x-08", "gl7.llws", "Low-level wind shear is commonly associated with:", ["Fronts, thunderstorms, inversions and strong upper winds", "Clear, calm high pressure", "Only mountain airports", "Only jet aircraft"], "Strong upper winds means over about 25 knots.", "PHAK 12"),
    Q("gl7x-09", "gl7.llws", "Flying into a microburst after takeoff, the first thing you'll likely notice is:", ["An increasing headwind and better performance", "A sudden tailwind", "Calm air", "Icing"], "Then comes the downdraft and the tailwind.", "PHAK 12"),
    Q("gl7x-10", "gl7.llws", "A typical microburst is about:", ["1–2 miles across and lasts 5–15 minutes", "20 miles across and lasts hours", "100 ft across", "1 mile deep and lasts all day"], "Downdrafts can reach 6,000 fpm.", "PHAK 12"),
    Q("gl7x-11", "gl7.llws", "A headwind suddenly becomes a tailwind on final. What happens?", ["Airspeed and performance drop", "Airspeed rises", "Nothing changes", "The stall speed drops"], "Be ready with power and pitch.", "PHAK 12"),
    Q("gl7x-12", "gl7.precip", "Drizzle is defined as droplets smaller than:", ["0.02 inches", "0.2 inches", "0.5 inches", "1 mm in diameter"], "It usually comes with fog or low stratus.", "PHAK 12"),
    Q("gl7x-13", "gl7.precip", "Visibility is:", ["The greatest horizontal distance at which prominent objects can be seen", "The height of the cloud base", "The distance to the nearest cloud", "Slant range to the runway"], "METARs and automated stations report it.", "PHAK 12"),
    Q("gl7x-14", "gl7.precip", "Hail forms when:", ["Drafts inside a cumulonimbus carry water droplets up and down until they're too heavy", "Rain falls through an inversion", "Fog freezes", "Snow melts"], "Hail can reach 5 inches across.", "PHAK 12"),
    Q("gl7x-15", "gl7.mass", "A maritime tropical air mass is:", ["Warm and moist", "Cold and dry", "Warm and dry", "Cold and moist"], "Maritime = moist; tropical = warm.", "PHAK 12"),
    Q("gl7x-16", "gl7.mass", "An air mass moving over a colder surface typically brings:", ["Stable air, poor visibility, low stratus or fog", "Cumulus, showers and good visibility", "Thunderstorms", "Strong turbulence"], "Cooling from below makes the air stable.", "PHAK 12"),
  ],
};
