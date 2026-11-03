// Project-page hosting (GitHub Pages at user.github.io/repo/): prefix root-relative URLs with BASE_PATH.
// Runs on dist/ after the checks. Skipped when BASE_PATH is empty, so a real domain needs no step.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const base = (process.env.BASE_PATH || '').replace(/\/$/, '');
const origin = (process.env.SITE_URL || '').replace(/\/$/, '');
if (!base) { console.log('No BASE_PATH set; nothing to prefix.'); process.exit(0); }

const dist = new URL('../dist/', import.meta.url).pathname;
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });

let n = 0;
for (const f of walk(dist).filter((f) => /\.(html|xml|txt|js|css)$/.test(f))) {
  let s = readFileSync(f, 'utf8');
  const before = s;
  if (/\.(html)$/.test(f)) {
    // root-relative attributes (not protocol-relative, not already prefixed)
    s = s.replace(/(\s(?:href|src|action|poster|data-src)=")\/(?!\/)(?!saltline-cr\/)/g, `$1${base}/`);
    s = s.replace(/(\scontent=")\/(?!\/)(?!saltline-cr\/)/g, `$1${base}/`);
  }
  if (/\.css$/.test(f)) s = s.replace(/url\((['"]?)\/(?!\/)/g, `url($1${base}/`);
  if (origin) s = s.split(origin + '/').join(origin + base + '/').split(origin + base + base + '/').join(origin + base + '/');
  if (s !== before) { writeFileSync(f, s); n++; }
}
console.log(`Prefixed ${base} in ${n} files.`);
