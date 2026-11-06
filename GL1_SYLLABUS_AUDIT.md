# GL1 teaching and question audit

GL1 now has 14 lesson sections. All syllabus topics stay in GL1; the optional Flows unit supplements rather than replaces its instruction. The provided checklist has 19 grouped headings, or 21 learning targets when the first heading is separated into aircraft design, certification, and airworthiness. The map below shows all 21 targets; no proprietary lesson prose was used.

| Target | Teaching section(s) | Audit outcome |
|---|---|---|
| Aircraft design | Built to a standard; Truss, shell, or both | Already covered |
| Certification | Built to a standard | Already covered; clarified certificate validity |
| Airworthiness | Records first, then the airplane | Already covered |
| Lift and basic aerodynamics | Four forces | Added four forces, directions, relative wind, angle of attack vs pitch, CG/stability |
| Major components | Five parts make an airplane | Already covered; clarified primary vs secondary controls and trim |
| Fuselage | Five parts; Truss, shell, or both | Already covered |
| Wings | Five parts; Truss, shell, or both | Already covered, including lift struts |
| Empennage | Five parts | Already covered |
| Landing gear | Five parts; Meet the Cessna 172S | Already covered |
| Powerplant | Five parts; Meet the Cessna 172S | Already covered; added independent dual-magneto ignition for oral question |
| Subcomponents | The systems inside the structure | Added airframe, electrical system, controls, hydraulic disc brakes |
| Performance instruments | Performance, control, navigation | Already covered |
| Control instruments | Performance, control, navigation | Added explicit tachometer/power-instrument teaching |
| Navigation instruments | Performance, control, navigation | Added explicit CDI selected-course explanation |
| Preflight assessment | Records first, then the airplane | Already covered |
| Visual preflight | What you're looking for | Already covered; clarified instrument-adjustment wording |
| Outer wing surfaces and tail section | What you're looking for | Expanded control/hinge inspection and clean lifting surfaces |
| Fuel and oil | What you're looking for; Meet the Cessna 172S | Added dipstick/POH limits, cap/leak check |
| Landing gear, tires, brakes | What you're looking for; Subcomponents | Already covered; added brake-system teaching |
| Engine and propeller | What you're looking for | Already covered |
| Ground operations | Start and taxi; Hold the controls for the wind; Run-up, after landing, shutdown | Added start/propeller safety, taxi speed/steering/brake check, wind controls, weathervaning, route planning, run-up, after-landing checks and securing |

## Sources checked

- FAA-H-8083-3C, Airplane Flying Handbook, Ch 2, particularly pp 2-14–2-23 and Fig 2-15: https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/airplane_handbook/03_afh_ch2.pdf
- FAA-H-8083-25C, Pilot's Handbook of Aeronautical Knowledge, Ch 1/3 and Glossary; Ch 5 for relative-wind lift definition, Ch 6/7 for controls/ignition, Ch 16 for CDI: https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/faa-h-8083-25c.pdf
- Private Pilot Airplane ACS, FAA-S-ACS-6C, I.G and II.A/C/D/F: https://www.faa.gov/training_testing/testing/acs/private_airplane_acs_6.pdf
- C172S POH/Information Manual Sec 1/2/7; figures remain airplane-specific examples, not a replacement checklist. Always use your airplane's POH.
- 14 CFR 61.23, 61.87, 61.103, 61.109, 61.113(i), 91.7, 91.203.

## Taxi-wind accuracy

For a nosewheel airplane, quartering headwind: turn into wind, upwind aileron up, elevator neutral. Quartering tailwind: yoke forward and away, upwind aileron down, elevator down. Do not interpret “climb into” as aft elevator for a nosewheel airplane. AFH Fig 2-15 gives four quarters, not a separate exact-90-degree crosswind prescription; no unsupported direct-crosswind pose is invented. Straight ahead/astern cases are the symmetric limit with ailerons neutral. The airplane remains on the ground (no flight bank or pitch animation). Wind streams are illustrative, not aerodynamic simulation. They animate for six seconds per selection, then stop rendering.

## Every bank audited

- `data/lessons/gl1.js`: gl1-01–30, gl1-o1–o3.
  - 01–08 components/controls/powerplant → parts.
  - 09–14 structure → build.
  - 15–20 trainer data/steering → c172, ground.
  - 21–24 axes → axes.
  - 25–30 training/certification → cert.
  - o1 → parts/axes/c172, o2 → parts/c172, o3 → cert. Added trim/primary-secondary labels, magneto independence, training/endorsement and medical context to close oral-answer gaps.
- `data/lessons/x/gl1.js`: existing gl1x-01–16 and o1–o2 → design/insts/papers/walk. No moves out of GL1. Added gl1x-17–26 and gl1x-o3 to reinforce new instruction (subcomponents/brakes/drag/wind controls/start/brake check/run-up/after landing/wing inspection).
- `data/lessons/c/gl1.js`: all gl1c-01–17.
  - 01/02 → aero (topic corrected from parts).
  - 03–06 and 16/17 → insts. Added tachometer and CDI explanation; removed the oversimplified “fly toward the needle” advice from 06.
  - 07–10 → papers/walk; 11/12 → c172/walk.
  - 13/14/15 → ground/wind (topic corrected from walk, still GL1).
- Total now: 73 multiple-choice questions and 6 orals. All 63 preexisting multiple-choice IDs and 5 oral IDs remain unchanged. Question-bank correct-choice storage remains unchanged (the quiz renderer shuffles displayed choices).
- `ppg.v1` is untouched. No existing SRS history keys were renamed. Added glossary links use the existing popover system; no new progress format.
- Coverage links now explicitly point to teaching sections, not the first incidental regex hit or words inside a shared visual.

## How to access it

Open GL1 and use the lesson section dots or Next. New sections are **The systems inside the structure**, **Four forces**, **Start and taxi**, **Hold the controls for the wind**, and **Run-up, after landing, shutdown**. Stable links: `#/lesson/gl1/subs`, `#/lesson/gl1/aero`, `#/lesson/gl1/ground`, `#/lesson/gl1/wind`, `#/lesson/gl1/runup`.
