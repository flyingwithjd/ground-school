// Entry gate: a soft lock. The site stays hidden (html.locked, set by an inline script in <head> before first paint)
// until the access code is entered once on this device. Only a SHA-256 hash of the code ships; the flag lives in its own key.
export const GATE_KEY = "sqs.access";
const HASH = "e2a492f800ae822acfa3a524353c190c633962368dc5df75a1afabd2379fb1e5";
// Small synchronous SHA-256 so the gate also works on plain http (LAN testing), where crypto.subtle is unavailable.
function sha256(str) {
  const K = [], H = []; let n = 2, c = 0; const frac = (x) => ((x - Math.floor(x)) * 4294967296) | 0;
  while (c < 64) { let p = true; for (let f = 2; f * f <= n; f++) if (n % f === 0) { p = false; break; } if (p) { if (c < 8) H[c] = frac(Math.sqrt(n)); K[c++] = frac(Math.cbrt(n)); } n++; }
  const b = [...new TextEncoder().encode(str)], l = b.length * 8; b.push(0x80); while (b.length % 64 !== 56) b.push(0);
  for (let i = 7; i >= 0; i--) b.push(i > 3 ? 0 : (l >>> (i * 8)) & 255);
  const r = (x, k) => (x >>> k) | (x << (32 - k)), w = new Array(64);
  for (let o = 0; o < b.length; o += 64) {
    for (let i = 0; i < 16; i++) w[i] = (b[o + i * 4] << 24) | (b[o + i * 4 + 1] << 16) | (b[o + i * 4 + 2] << 8) | b[o + i * 4 + 3];
    for (let i = 16; i < 64; i++) { const s0 = r(w[i - 15], 7) ^ r(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = r(w[i - 2], 17) ^ r(w[i - 2], 19) ^ (w[i - 2] >>> 10); w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0; }
    let [A, B, C, D, E, F, G, I] = H;
    for (let i = 0; i < 64; i++) { const t1 = (I + (r(E, 6) ^ r(E, 11) ^ r(E, 25)) + ((E & F) ^ (~E & G)) + K[i] + w[i]) | 0, t2 = ((r(A, 2) ^ r(A, 13) ^ r(A, 22)) + ((A & B) ^ (A & C) ^ (B & C))) | 0; I = G; G = F; F = E; E = (D + t1) | 0; D = C; C = B; B = A; A = (t1 + t2) | 0; }
    [A, B, C, D, E, F, G, I].forEach((v, i) => { H[i] = (H[i] + v) | 0; });
  }
  return H.map((v) => (v >>> 0).toString(16).padStart(8, "0")).join("");
}
export const checkCode = (s) => sha256(String(s || "").trim().toLowerCase()) === HASH;
const unlocked = () => { try { return localStorage.getItem(GATE_KEY) === "1"; } catch (e) { return false; } };
// Run start() now if this device is unlocked; otherwise show the gate and run it after the right code.
export function whenUnlocked(start) {
  const root = document.documentElement, gate = document.getElementById("gate");
  if (unlocked() || !gate) { root.classList.remove("locked"); start(); return; }
  root.classList.add("locked"); gate.hidden = false;
  const form = gate.querySelector("form"), inp = gate.querySelector("input"), err = gate.querySelector(".gate-err");
  inp.addEventListener("input", () => { err.textContent = ""; inp.removeAttribute("aria-invalid"); });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!checkCode(inp.value)) { err.textContent = "That code didn't work. Try again."; inp.setAttribute("aria-invalid", "true"); inp.select(); return; }
    try { localStorage.setItem(GATE_KEY, "1"); } catch (x) {}
    gate.hidden = true; root.classList.remove("locked"); start();
  });
  setTimeout(() => inp.focus(), 0);
}
