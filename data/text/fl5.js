export default {
  sections: [
    { id: "what", label: "Slips · AFH 9", title: "Side into the wind",
      body: `<p>A slip is a deliberate cross-control: aileron one way, rudder the other. The airplane moves through the air partly sideways, so the fuselage adds drag. <span class="src">AFH 9</span></p>
<p>A <strong>sideslip</strong> keeps the nose pointing down the runway while the low wing stops crosswind drift. A <strong>forward slip</strong> yaws the nose well off the path to come down steeply without speeding up. Compare them with a crab.</p>`,
      viz: { type: "slip", opts: { mode: "side" } },
      kdr: { k: "When and why to slip; wind correction.", d: "Correlate crosswind with slip direction.", r: "Touchdown with the axis misaligned.", codes: ["PA.IV.M.K3", "PA.IV.M.K4", "PA.IV.M.S7", "PA.IV.M.R8"] } },
    { id: "fwd", label: "Forward slip · AFH 9", title: "Lose height, not speed",
      body: `<p>Close the throttle. Lower the upwind wing with aileron and apply opposite rudder until the nose is off the runway heading. Hold the approach airspeed with pitch. Full rudder is the practical limit. <span class="src">AFH 9</span></p>
<p>In some airplanes the airspeed indicator can be badly wrong in a slip because of where the pitot tube and static ports sit. Use the pitch attitude too. Before the flare, level the wings and center the rudder, or transition straight into a sideslip. <span class="src">AFH 9</span></p>`,
      viz: { type: "slip", opts: { mode: "fwd" } },
      kdr: { k: "Energy management in a slip.", d: "Touch down within 400 ft of the point, aligned.", r: "Fuel flowage, tail stalls with flaps, airspeed control.", codes: ["PA.IV.M.K1", "PA.IV.M.S8", "PA.IV.M.R7"] } },
    { id: "risk", label: "Limits · POH 4", title: "Know your POH",
      body: `<p>The NAV III 172S POH says steep slips with more than 20° of flap can cause a slight tendency for the elevator to oscillate. Some earlier 172 POHs say to avoid such slips. <span class="src">POH 4</span> Some airplanes limit slips in duration or by fuel quantity. <span class="src">AFH 9</span></p>
<p>Common errors: poor pitch control, reacting to wrong airspeed readings, carrying too much power, slipping the same way as the crosswind, and transitioning to a sideslip too late. <span class="src">AFH 9</span> <span class="dim">Confirm with your CFI and your aircraft's POH.</span></p>`,
      kdr: { k: "POH limitations for slips.", d: "Follow aircraft-specific guidance.", r: "Unstable approach.", codes: ["PA.IV.M.R7", "PA.IV.M.R9"] } },
  ],
  prep: {
    expect: ["Forward slips at altitude, then on final from a high approach.", "Sideslips down the runway centerline at low altitude.", "Recovery to a normal landing attitude before touchdown."],
    chairfly: ["Say the entry: \"Power idle. Upwind wing down. Opposite rudder. Pitch for speed.\"", "Practice the recovery: wings level, rudder center, flare.", "Picture which wing goes down for wind from the left and from the right."],
    mistakes: ["Letting the nose drop and speed build.", "Slipping the wrong way for the crosswind.", "Recovering late and touching down sideways."],
    debrief: ["How much rudder did it take before you ran out?", "Did airspeed read strangely in the slip?", "Where did you touch down relative to your point?"],
  },
};
