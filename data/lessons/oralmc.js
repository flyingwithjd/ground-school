// Multiple-choice questions written from the old oral (say-it-out-loud) items whose content no other question covered.
// Grouped by lesson; merged into that lesson's bank. Each carries its section (page) in `sec`.
export default {
  fl3: [
    { id: "fl3m-01", t: "fl3.slow", sec: "slow", q: "Why do pilots practice slow flight?", c: ["To learn how the airplane feels near the critical angle of attack, so an approaching stall is recognized early", "To practice holding the highest cruise speed", "To find the speed for maximum range", "To test the stall warning horn"], a: 0, why: "Slow flight teaches the feel, sound and sight of flight at low speed and high angle of attack: mushy controls, a high nose, lots of rudder. Those cues warn of a stall before it happens.", src: "AFH Ch 5" },
  ],
  fl4: [
    { id: "fl4m-01", t: "fl4.dec", sec: "dec", q: "On short final an animal runs onto the runway. What should you do?", c: ["Go around right away", "Continue and land long, past the animal", "Slow down and land short of it", "Slip to lose altitude faster, then land"], a: 0, why: "A hazard on the runway is a reason to reject the landing. A go-around is a normal maneuver; it becomes dangerous only when it is delayed.", src: "AFH Ch 9" },
  ],
  fl6: [
    { id: "fl6m-01", t: "fl6.grm", sec: "point", q: "What skill do ground reference maneuvers mainly build?", c: ["Division of attention: holding a track and altitude while watching for traffic, a landing spot and the engine gauges", "Flying by instruments alone", "Short-field landing technique", "Navigating with a VOR"], a: 0, why: "You fly the airplane and track a path over the ground at the same time, while still scanning for traffic, a place to land and the gauges.", src: "AFH Ch 6" },
  ],
  fw1: [
    { id: "fw1m-01", t: "fw1.start", sec: "start", q: "You know the before-start flow by heart. How should you still use the checklist?", c: ["Do the flow, then read the checklist to confirm nothing was missed", "Skip it once the flow is memorized", "Use it only on the first flight of the day", "Read it after takeoff, when things are calmer"], a: 0, why: "The flow gets the items done quickly in a set order; the checklist then confirms nothing was missed. Pilots who rely on memory alone become complacent.", src: "AFH Ch 1" },
  ],
  gl8: [
    { id: "gl8m-01", t: "gl8.obs", sec: "obs", q: "Radar shows no echoes, but you want to know about fog and low stratus. Which product shows them?", c: ["Satellite imagery, which shows the clouds themselves even when they make no precipitation", "Weather radar", "The winds and temperatures aloft forecast", "A convective SIGMET"], a: 0, why: "Radar detects precipitation only. Satellite shows clouds, including fog and stratus that produce no rain. Visible images need daylight; infrared works day and night.", src: "AWH 24.7" },
  ],
  gl9: [
    { id: "gl9m-01", t: "gl9.help", sec: "help", q: "What does a Mayday (distress) call get you?", c: ["Priority over all other traffic, and radio silence from other stations on the frequency", "Only a frequency change to Flight Service", "Priority only after you file a written report", "Nothing until you squawk 7600"], a: 0, why: "Distress has priority over everything, and Mayday commands radio silence on the frequency. Urgency (Pan-Pan) has priority over everything except distress. Declare early.", src: "AIM 6-3-1" },
  ],
  gl14: [
    { id: "gl14m-01", t: "gl14.fp", sec: "fp", q: "You land at a towered airport at the end of a VFR flight plan. Who closes the flight plan?", c: ["You do, with Flight Service; the tower does not close it for you", "The tower closes it when you land", "It closes itself at your ETA", "Approach control closes it when you leave their frequency"], a: 0, why: "Close it yourself. Towers don't close VFR flight plans. If you haven't closed it or updated your ETA within 30 minutes after your ETA, search begins.", src: "AIM 5-1-14; PHAK Ch 16" },
  ],
};
