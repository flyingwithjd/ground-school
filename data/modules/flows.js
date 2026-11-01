// Checklists and flows. Source: Cessna 172S POH (NAV III) Section 4. Confirm with your CFI and your aircraft's POH.
const A = (id, t, q, c, why, src) => ({ id, t, q, c, a: 0, why, src });
const O = (id, t, q, items, why, src) => ({ id, t, type: "order", q, items, why, src });
export default [
  { id: "fw1", code: "FW1", stage: 1, kind: "module", title: "Checklists and Flows", short: "Normal checklists in order, and why each step is where it is",
    intro: "A flow is the checklist done from memory, in a pattern around the cockpit. Then you read the checklist to confirm. Learn the order and the reason for it.",
    refs: ["C172S POH Section 4"],
    topics: { "fw1.start": "Before start and start", "fw1.to": "Takeoff", "fw1.ldg": "Landing", "fw1.sec": "After landing and securing" },
    questions: [
      O("fw1-01", "fw1.start", "Put the first items of Before Starting Engine in order.", ["Preflight inspection: COMPLETE", "Passenger briefing: COMPLETE", "Seats and seat belts: ADJUST and LOCK", "Brakes: TEST and SET", "Circuit breakers: CHECK IN"], "Confirm with your CFI and your aircraft's POH.", "C172S POH 4"),
      A("fw1-02", "fw1.start", "Why must the avionics switch be OFF during engine start?", ["To prevent possible damage to the avionics", "To save fuel", "To keep the beacon off", "To let the alternator charge"], "A POH caution.", "C172S POH 4"),
      A("fw1-03", "fw1.start", "Before starting, the fuel selector and fuel shutoff should be:", ["Selector BOTH; shutoff ON (pushed in)", "Selector LEFT; shutoff OFF", "Selector OFF; shutoff ON", "Selector RIGHT; shutoff OFF"], "Before Starting Engine, items 8 and 9.", "C172S POH 4"),
      A("fw1-04", "fw1.start", "Just before engaging the starter, you verify:", ["The propeller area is clear", "The flaps are full", "The transponder is on ALT", "The mixture is lean"], "\"Propeller area: CLEAR\" comes before master on and the beacon.", "C172S POH 4"),
      A("fw1-05", "fw1.start", "After start, oil pressure should rise into the green within:", ["30 to 60 seconds", "5 minutes", "2 seconds", "10 minutes"], "If it doesn't, shut down.", "C172S POH 4"),
      A("fw1-06", "fw1.start", "If the engine is warm, which steps of the start are omitted?", ["The priming steps (fuel pump on, mixture rich, fuel pump off)", "Propeller area clear", "Master on", "Oil pressure check"], "The POH note before step 12.", "C172S POH 4"),
      A("fw1-07", "fw1.to", "For a normal takeoff, the POH flap setting is:", ["0° to 10°, 10° preferred", "20°", "Full", "Always 0°"], "Normal Takeoff, item 1.", "C172S POH 4"),
      A("fw1-08", "fw1.to", "On a normal takeoff, lift the nosewheel at:", ["55 KIAS", "45 KIAS", "65 KIAS", "70 KIAS"], "Then climb at 70 to 80 KIAS.", "C172S POH 4"),
      O("fw1-09", "fw1.to", "Put the Normal Takeoff steps in order.", ["Wing flaps: 0°–10°", "Throttle: FULL", "Mixture: RICH", "Elevator: LIFT NOSEWHEEL at 55 KIAS", "Climb airspeed: 70–80 KIAS", "Wing flaps: RETRACT at a safe altitude"], "Confirm with your CFI and your aircraft's POH.", "C172S POH 4"),
      A("fw1-10", "fw1.ldg", "In the Before Landing checklist, the fuel selector goes to:", ["BOTH", "LEFT", "RIGHT", "The fuller tank"], "Before Landing, item 3.", "C172S POH 4"),
      A("fw1-11", "fw1.ldg", "Normal landing approach speed with flaps full is:", ["60–70 KIAS", "65–75 KIAS", "55 KIAS", "80 KIAS"], "65–75 KIAS flaps up.", "C172S POH 4"),
      A("fw1-12", "fw1.ldg", "In a balked landing (go-around), flaps are first retracted to:", ["20°", "Up", "10°", "Full"], "Then 60 KIAS, flaps 10° as obstacles are cleared, and up at a safe altitude and 65 KIAS.", "C172S POH 4"),
      O("fw1-13", "fw1.ldg", "Put the Balked Landing steps in order.", ["Throttle: FULL", "Wing flaps: RETRACT to 20°", "Climb speed: 60 KIAS", "Wing flaps: 10°, then UP"], "Power first, then reduce drag. Confirm with your CFI and your aircraft's POH.", "C172S POH 4"),
      A("fw1-14", "fw1.sec", "Why is the fuel selector set to LEFT or RIGHT when securing the airplane?", ["To prevent crossfeeding between tanks", "To drain the tanks evenly", "To lock the controls", "To save the battery"], "Securing Airplane, item 10.", "C172S POH 4"),
      O("fw1-15", "fw1.sec", "Put the first steps of Securing Airplane in order.", ["Parking brake: SET", "Throttle: IDLE", "Electrical equipment: OFF", "Avionics: OFF", "Mixture: IDLE CUTOFF", "Magnetos: OFF", "Master: OFF"], "Avionics off before shutdown; the mixture stops the engine before the magnetos go off.", "C172S POH 4"),
    ],
    oral: [
      { id: "fw1-o1", t: "fw1.start", acs: "PA.II.B.K2", q: "Why use a checklist if you've memorized the flow?", a: "<p>The flow gets things done quickly in a logical pattern; the checklist confirms nothing was missed. The ACS expects you to use the appropriate checklists, and the POH is the authority for your airplane's procedures. Confirm with your CFI and your aircraft's POH. <span class=\"src\">ACS PA.II.B; C172S POH 4</span></p>", src: "C172S POH 4" },
    ] },
];
