// GL4 lesson text
export default {
  sections: [
    { id: "legs", label: "The traffic pattern · AC 90-66C", title: "Five legs, one rectangle",
      body: `<p>Every airport's [[traffic pattern]] is the same rectangle flown around the runway: upwind (departure), crosswind, downwind, base and final. A shared shape and a shared altitude are what make traffic predictable, especially where no tower sequences anyone. <span class="src">AC 90-66C</span></p>
<p>[[Traffic pattern altitude]] is usually 1,000 ft above the airport surface for propeller airplanes, unless the [[Chart Supplement]] publishes another. Tap each leg to see what happens there.</p>`,
      viz: { type: "pattern" },
      kdr: { k: "Names and purposes of the pattern legs; pattern altitude.", d: "Fly a rectangular pattern at the correct altitude with wind correction.", r: "Low, tight or descending patterns raise collision and stall-spin risk.", codes: ["PA.III.B.K2"] } },
    { id: "entry", label: "Entering and leaving · AC 90-66C", title: "Enter level, at 45°",
      body: `<p>Figure out the runway in use and the pattern direction while still well clear, then get down to pattern altitude <em>before</em> you arrive. Descending into the pattern can put you on top of someone already in it. <span class="src">AC 90-66C 11.2–11.3</span></p>
<p>The standard entry is a 45° angle to the downwind, abeam the midpoint of the runway. Pick an entry below to see it, along with the alternatives.</p>`,
      viz: { type: "pattern", opts: { entries: true } },
      kdr: { k: "Standard and alternate entries; departure procedures.", d: "Arrive at pattern altitude and enter on the 45°.", r: "Straight-in and descending entries conflict with pattern traffic.", codes: ["PA.III.B.K2", "PA.III.B.R1"] } },
    { id: "dir", label: "Pattern direction · 14 CFR 91.126", title: "Left turns unless marked",
      body: `<p>At a non-towered airport in Class G airspace, airplanes make all turns to the <strong>left</strong> unless the airport displays approved light signals or visual markings for right turns. <span class="src">14 CFR 91.126(b)</span> Where right traffic exists, you will see it on the [[segmented circle]] and in the Chart Supplement.</p>
<p>Land and take off on the runway most nearly aligned into the wind. If you use a secondary runway, stay out of the flow of traffic to the main one. <span class="src">AC 90-66C 11.5</span></p>
<p>The Airport units cover wind indicators, runway selection and crosswind components in detail.</p>`,
      kdr: { k: "Pattern direction rules and runway selection.", d: "Check the segmented circle and Chart Supplement before entering.", r: "Flying the wrong direction puts you head-on with pattern traffic.", codes: ["PA.III.B.K2"] } },
    { id: "tower", label: "Towered vs non-towered · AIM 4-1, 4-3", title: "Clearances or self-announce",
      body: `<p><strong>Towered:</strong> you need two-way radio contact before entering the tower's airspace: prior to 4 NM from the airport, up to and including 2,500 ft AGL. <span class="src">14 CFR 91.126(d)</span> The tower clears you to taxi onto runways, take off and land, and sequences arrivals. You are still responsible for seeing and avoiding traffic.</p>
<p><strong>Non-towered:</strong> nobody clears you. Monitor the [[CTAF]] and self-announce about 10 miles out, then on each leg. Departing aircraft monitor CTAF from startup. [[UNICOM]] is a non-government station that may provide airport information; at many airports it is also the CTAF. <span class="src">AC 90-66C 10.4; AIM 4-1-9</span></p>
<p>A part-time tower that is closed turns the airport into a non-towered one: use the CTAF published for those hours.</p>`,
      kdr: { k: "Differences between towered and non-towered operations.", d: "Make standard position reports on CTAF.", r: "Assuming a quiet frequency means an empty pattern.", codes: ["PA.III.B.K1", "PA.III.A.K2"] } },
    { id: "row", label: "Right-of-way · 14 CFR 91.113", title: "Who gives way",
      body: `<p>Whether VFR or IFR, every pilot keeps watch to see and avoid other aircraft. When a rule gives another aircraft the right-of-way, you give way and do not pass over, under or ahead of it unless well clear. <span class="src">14 CFR 91.113(b)</span></p>`,
      viz: { type: "rightofway" },
      kdr: { k: "Right-of-way rules.", d: "Give way early and obviously, usually by turning right.", r: "Insisting on the right-of-way is never worth a collision.", codes: ["PA.III.B.K3"] } },
    { id: "see", label: "Collision avoidance · AIM 8-1", title: "Scan in short steps",
      body: `<p>Your eyes detect movement poorly when they sweep. The AIM recommends a series of short, regularly spaced eye movements, each no more than 10°, with each area watched for at least one second. <span class="src">AIM 8-1-6</span></p>
<p>A target that shows no relative motion and stays in one part of the windshield is likely on a collision course; if it grows without moving, take evasive action. Most collisions happen on good-weather days, and aircraft cluster near VORs and around airport surface areas. <span class="src">AIM 8-1-8</span></p>
<p>Before every turn in the pattern, clear the area in the direction of the turn. Lights on, clear radio calls and a standard pattern all make you easier to find.</p>`,
      kdr: { k: "Scanning technique and high-hazard areas.", d: "Clear before every turn; scan in 10° sectors.", r: "Heads-down time in the pattern: tablets, checklists, radio tuning.", codes: ["PA.III.B.R1", "PA.III.B.R2"] } },
  ],
};
