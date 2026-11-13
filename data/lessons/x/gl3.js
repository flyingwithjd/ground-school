// GL3 supplement: atmosphere, Newton and airfoils, vortices, climbs/descents, planform.
const Q = (id, t, q, c, why, src) => ({ id, t, q, c, a: 0, why, src });
export default {
  textx: true,
  topics: { "gl3.atmo": "The atmosphere", "gl3.newton": "Newton's laws and airfoils", "gl3.vortex": "Wingtip vortices", "gl3.climb": "Climbs and descents", "gl3.plan": "Planform and handling" },
  questions: [
    Q("gl3x-01", "gl3.atmo", "What are standard sea-level temperature and pressure?", ["15 °C (59 °F) and 29.92 \"Hg (1,013.2 mb)", "0 °C and 30.00 \"Hg", "20 °C and 29.92 \"Hg", "15 °C and 28.92 \"Hg"], "These define the International Standard Atmosphere.", "PHAK 4"),
    Q("gl3x-02", "gl3.atmo", "What's the standard temperature lapse rate?", ["About 2 °C (3.5 °F) per 1,000 ft", "About 3 °C per 1,000 ft", "About 1 °C per 1,000 ft", "About 5.4 °F per 1,000 ft"], "It applies up to about 36,000 ft.", "PHAK 4"),
    Q("gl3x-03", "gl3.atmo", "About how much does pressure drop per 1,000 ft in the lower atmosphere?", ["1 \"Hg", "0.1 \"Hg", "2 \"Hg", "10 mb per 100 ft"], "At 18,000 ft the pressure is about half of sea level.", "PHAK 4"),
    Q("gl3x-04", "gl3.atmo", "The atmosphere is mostly:", ["Nitrogen (78%), with 21% oxygen", "Oxygen (78%)", "Nitrogen (50%) and oxygen (50%)", "Carbon dioxide"], "The remaining 1% is other gases such as argon.", "PHAK 4"),
    Q("gl3x-05", "gl3.newton", "The propeller pushes air backward and the airplane moves forward. Which law is that?", ["Newton's third law", "Newton's first law", "Newton's second law", "Bernoulli's principle"], "Action and reaction.", "PHAK 4"),
    Q("gl3x-06", "gl3.newton", "A heavier airplane accelerates more slowly with the same thrust. Which law explains it?", ["Newton's second law (force = mass × acceleration)", "Newton's first law", "Newton's third law", "Bernoulli's principle"], "This is one reason heavier airplanes need more runway.", "PHAK 4"),
    Q("gl3x-07", "gl3.newton", "The straight line from an airfoil's leading edge to its trailing edge is the:", ["Chord line", "Mean camber line", "Relative wind", "Longitudinal axis"], "Angle of attack is measured from it.", "PHAK 4"),
    Q("gl3x-08", "gl3.vortex", "Wingtip vortices are strongest when the generating aircraft is:", ["Heavy, clean and slow", "Light, dirty and fast", "Heavy and fast", "Light and slow with flaps down"], "That's typical at takeoff, climb and landing.", "PHAK 5"),
    Q("gl3x-09", "gl3.vortex", "Landing behind a larger aircraft, you should:", ["Stay above its approach path and touch down beyond its touchdown point", "Stay below its path and land short", "Land at the same point", "Fly a faster approach"], "Vortices sink below the path that made them.", "PHAK 5"),
    Q("gl3x-10", "gl3.vortex", "Taking off behind a larger aircraft, you should:", ["Rotate before the point where it rotated", "Rotate after its rotation point", "Take off immediately", "Climb below its path"], "Then stay above its climb path.", "PHAK 5"),
    Q("gl3x-11", "gl3.vortex", "How far should a small airplane stay from a hovering helicopter?", ["At least three rotor disc diameters", "At least one rotor diameter", "500 ft", "It doesn't matter"], "Its downwash acts like wake turbulence.", "PHAK 5"),
    Q("gl3x-12", "gl3.climb", "You raise the nose to climb without adding power. What happens to airspeed, and why?", ["It decreases, because part of the weight now acts backward with the drag", "It stays the same", "It increases", "It drops to zero"], "More power is needed to climb at the same airspeed.", "PHAK 5"),
    Q("gl3x-13", "gl3.climb", "A steady 10° climb needs thrust equal to:", ["Drag plus about 17% of weight", "Drag only", "Weight only", "Twice the drag"], "Climb depends on excess thrust.", "PHAK 5"),
    Q("gl3x-14", "gl3.climb", "What is an airplane's absolute ceiling?", ["The altitude where no excess thrust is left to climb", "18,000 ft", "The highest altitude on the sectional", "Where the service ceiling begins"], "At that point the airplane can't climb any further.", "PHAK 5"),
    Q("gl3x-15", "gl3.plan", "Why is a rectangular wing favored on low-speed trainers?", ["It tends to stall at the root first, giving warning and keeping the ailerons effective", "It's the fastest", "It never stalls", "It has the lowest drag at all speeds"], "It's also usually quite stable.", "PHAK 5"),
    Q("gl3x-16", "gl3.plan", "Aspect ratio is:", ["The ratio of wingspan to chord", "The angle of sweep", "Chord at the root divided by chord at the tip", "Wing area divided by weight"], "Higher aspect ratio reduces drag, especially at high angles of attack.", "PHAK 5"),
    Q("gl3x-17", "gl3.plan", "Controllability is:", ["How the airplane responds to the pilot's control inputs, regardless of its stability", "Its tendency to return to trim", "Its strength under load", "Its cruise speed"], "Maneuverability is how easily it can be maneuvered and withstand the stresses.", "PHAK 5"),
  ],
};
