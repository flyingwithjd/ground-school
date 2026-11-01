// GL5 supplement: performance speeds, cruise/range/endurance, stall chart, runway factors.
const Q = (id, t, q, c, why, src) => ({ id, t, q, c, a: 0, why, src });
export default {
  textx: true,
  topics: { "gl5.speeds": "Climb performance and V-speeds", "gl5.cruise": "Cruise, range and endurance", "gl5.stallchart": "Stall speed chart", "gl5.runway": "Runway and takeoff factors" },
  questions: [
    Q("gl5x-01", "gl5.speeds", "Trees stand at the end of a short runway. Which speed should you climb at?", ["Vx, best angle: most altitude per distance", "Vy, best rate", "Cruise climb", "Vno"], "Vy gives the most altitude per unit of time, not per distance.", "PHAK 11"),
    Q("gl5x-02", "gl5.speeds", "What are Vx and Vy for the 172S at sea level?", ["62 and 74 KIAS", "56 and 68 KIAS", "74 and 62 KIAS", "65 and 85 KIAS"], "At 10,000 ft they're 67 and 72; they converge with altitude.", "POH 4"),
    Q("gl5x-03", "gl5.speeds", "The service ceiling is the altitude where the airplane:", ["Can no longer climb faster than 100 fpm", "Can no longer climb at all", "Needs supplemental oxygen", "Reaches Vne"], "At the absolute ceiling the climb rate is zero.", "PHAK 11"),
    Q("gl5x-04", "gl5.speeds", "Which change increases climb performance?", ["Lower weight", "Higher density altitude", "Extending flaps", "Higher temperature"], "Weight, altitude and configuration all change excess power.", "PHAK 11"),
    Q("gl5x-05", "gl5.speeds", "The 172S climb table gives 2.2 gal to climb to 6,000 ft on a standard day. What else does its note tell you to add?", ["1.4 gal for start, taxi and takeoff", "Nothing", "45 minutes of fuel", "10% for wind"], "Add another 10% for each 10 °C above standard temperature.", "POH 5"),
    Q("gl5x-06", "gl5.cruise", "Maximum endurance is flown at the speed for:", ["Minimum power required (lowest fuel flow)", "L/D max", "Vno", "Vy"], "It keeps you aloft longest, not farthest.", "PHAK 11"),
    Q("gl5x-07", "gl5.cruise", "Maximum range in a propeller airplane occurs near:", ["L/D max", "Minimum power required", "Vne", "Stall speed"], "That's where the ratio of speed to fuel flow is greatest.", "PHAK 11"),
    Q("gl5x-08", "gl5.cruise", "From the 172S cruise table: 6,000 ft, standard temperature, 2,400 RPM gives:", ["57% power, 108 KTAS, 8.2 GPH", "75% power, 122 KTAS, 10.4 GPH", "65% power, 114 KTAS, 9.0 GPH", "50% power, 97 KTAS, 7.3 GPH"], "Read the row for the altitude and RPM, then the temperature column.", "POH 5"),
    Q("gl5x-09", "gl5.cruise", "Your 172S has no wheel fairings. How do you adjust the cruise table speeds?", ["Subtract 2 knots", "Add 2 knots", "Subtract 10%", "No change"], "The table assumes speed fairings are installed.", "POH 5"),
    Q("gl5x-10", "gl5.cruise", "In the 172S, what is maximum cruise power with the recommended lean mixture?", ["75% MCP", "65% MCP", "85% MCP", "100% MCP"], "Settings above 75% need full rich mixture.", "POH 5"),
    Q("gl5x-11", "gl5.stallchart", "From the 172S stall chart (2,550 lb, power off), the flaps-up stall at 60° bank is about:", ["68 KIAS", "48 KIAS", "57 KIAS", "75 KIAS"], "Wings level it's 48 KIAS; bank raises it.", "POH 5"),
    Q("gl5x-12", "gl5.stallchart", "Which change lowers the stall speed?", ["Extending flaps", "Steepening the bank", "Adding weight", "Moving the CG forward"], "Full flaps, wings level: 40 KIAS versus 48 flaps up.", "POH 5"),
    Q("gl5x-13", "gl5.stallchart", "The 172S POH says altitude loss in a stall recovery may be as much as:", ["230 ft", "50 ft", "500 ft", "1,000 ft"], "Another reason to practice stalls at a safe altitude.", "POH 5"),
    Q("gl5x-14", "gl5.runway", "An upsloping runway:", ["Lengthens the takeoff run but shortens the landing roll", "Shortens both", "Lengthens both", "Has no effect"], "Downslope does the reverse.", "PHAK 11"),
    Q("gl5x-15", "gl5.runway", "Main tires are inflated to 36 psi. Dynamic hydroplaning can begin at about:", ["54 knots", "36 knots", "72 knots", "90 knots"], "9 × √36 = 54.", "PHAK 11"),
    Q("gl5x-16", "gl5.runway", "You lift off 10% faster than the POH speed. Takeoff distance increases by about:", ["21%", "10%", "5%", "50%"], "Distance varies with the square of the lift-off speed.", "PHAK 11"),
    Q("gl5x-17", "gl5.runway", "Performance charts usually assume a runway that is:", ["Paved, level, smooth and dry", "Grass", "Wet", "Upsloping"], "Correct for anything else, using the chart notes.", "PHAK 11"),
  ],
  oral: [
    { id: "gl5x-o1", t: "gl5.speeds", acs: "PA.I.F.K1", q: "Hot day, high field, full airplane. Walk me through how you decide whether you can take off and clear the trees.", a: "<p>Find pressure altitude and temperature, then the density altitude. Enter the 172S takeoff table for pressure altitude, temperature and weight, and correct with the notes for wind and surface. Compare the over-50-ft distance with the runway available, adding margin, because the chart assumes an airplane in good condition and average technique. Check the climb rate from the climb chart and plan a Vx climb if there are obstacles. If it's marginal, lighten the load or wait for cooler air.</p>", src: "PHAK 11 · POH 5" },
    { id: "gl5x-o2", t: "gl5.cruise", acs: "PA.I.D.K3c", q: "What's the difference between range and endurance, and when would you fly for each?", a: "<p>Range is distance per fuel; it's best near L/D max. Endurance is time aloft; it's best at minimum power required, a slower speed. I'd fly for range to stretch fuel to an airport, and for endurance if I had to hold or wait for weather to clear.</p>", src: "PHAK 11" },
  ],
};
