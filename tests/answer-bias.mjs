// Answer-length bias: the correct choice must not be a giveaway by being the longest one.
// Fails if the correct answer is strictly longer than every distractor in more than 40% of multiple-choice questions
// (chance for 4 choices is 25%). Also prints the length-rank spread so the trend stays visible.
const { QUESTIONS } = await import("../data/index.js");
const LIMIT = 0.40;
let n = 0, longest = 0; const rank = [0, 0, 0, 0]; const worst = [];
for (const q of Object.values(QUESTIONS)) {
  if (!Array.isArray(q.c) || q.a == null) continue; n++;
  const L = q.c.map((s) => s.length), c = L[q.a], others = L.filter((_, i) => i !== q.a);
  if (c > Math.max(...others)) { longest++; worst.push([c / Math.max(...others), q.id]); }
  rank[Math.min(3, others.filter((x) => x > c).length)]++;
}
const rate = longest / n;
console.log(`MC questions ${n}; correct strictly longest ${longest} (${(100 * rate).toFixed(1)}%), limit ${100 * LIMIT}%`);
console.log(`length rank of correct (1 = longest): ${rank.map((x, i) => `${i + 1}: ${(100 * x / n).toFixed(1)}%`).join("  ")}`);
worst.sort((a, b) => b[0] - a[0]);
console.log("largest giveaways:", worst.slice(0, 8).map(([r, id]) => `${id} ×${r.toFixed(1)}`).join(", "));
if (rate > LIMIT) { console.log("FAIL answer-length bias"); process.exit(1); }
console.log("PASS answer-length bias");
