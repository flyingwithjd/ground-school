// Cache-busting stamp. Run before every deploy:  node tools/stamp-version.mjs
// GitHub Pages serves everything with max-age=600, so a phone can mix a new page with old cached modules.
// This writes one build version (a hash of the site's code, ignoring existing stamps, so it only changes when code does)
// onto every relative module import, dynamic import, the CSS link, the app entry and the import map in index.html.
// Idempotent: re-running with no code changes leaves every file untouched.
import fs from "fs"; import path from "path"; import crypto from "crypto";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith(".js") ? [path.join(d, e.name)] : []));
const files = [...walk(path.join(ROOT, "js")), ...walk(path.join(ROOT, "data"))].sort();
const CSS = path.join(ROOT, "css/app.css"), HTML = path.join(ROOT, "index.html");
const strip = (t) => t.replace(/\?v=[0-9a-f]+/g, "").replace(/<meta name="build" content="[^"]*">\n?/, "");
const hash = crypto.createHash("sha1"); for (const f of [...files, CSS, HTML]) { hash.update(path.relative(ROOT, f)); hash.update(strip(fs.readFileSync(f, "utf8"))); }
const V = hash.digest("hex").slice(0, 10), Q = "?v=" + V;
let changed = 0; const put = (f, t) => { if (fs.readFileSync(f, "utf8") !== t) { fs.writeFileSync(f, t); changed++; } };
for (const f of files) { let t = strip(fs.readFileSync(f, "utf8"));
  // static:  from "./x.js"  |  import "./x.js"     dynamic:  import(`./${a}.js`)  |  import("./x.js")
  t = t.replace(/((?:\bfrom|\bimport)\s*\(?\s*)(["'`])(\.{1,2}\/[^"'`]*?\.js)\2/g, (m, pre, q, spec) => `${pre}${q}${spec}${Q}${q}`);
  put(f, t); }
let html = strip(fs.readFileSync(HTML, "utf8"));
html = html.replace(/href="css\/app\.css"/, `href="css/app.css${Q}"`).replace(/src="js\/app\.js"/, `src="js/app.js${Q}"`)
  .replace(/("three":\s*"[^"]+?\.js)"/, `$1${Q}"`).replace(/<meta name="build" content="[^"]*">\n?/, "")
  .replace(/(<meta name="theme-color"[^>]*>\n)/, `$1<meta name="build" content="${V}">\n`);
put(HTML, html);
console.log(`build ${V}: ${changed} file(s) updated`);
