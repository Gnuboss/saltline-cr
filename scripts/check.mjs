// Post-build checks. Run after `astro build` (npm run ship does both).
// Errors fail the run. Warnings are things to fix before launch.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
if (!existsSync(dist)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const files = walk(dist);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const pathOf = (f) => '/' + relative(dist, f).replace(/index\.html$/, '').replace(/\.html$/, '');
const pages = new Map();
for (const f of htmlFiles) pages.set(pathOf(f), readFileSync(f, 'utf8'));

const errors = [];
const warnings = [];

// Sitemap coverage: every indexable page must be listed, nothing else.
const sitemapLocs = new Set();
for (const f of files.filter((f) => /sitemap-.+\.xml$/.test(f))) {
  for (const m of readFileSync(f, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) sitemapLocs.add(new URL(m[1]).pathname);
}
const indexable = [...pages].filter(([p, html]) => !/<meta name="robots" content="[^"]*noindex/.test(html) && p !== '/404');
for (const [p] of indexable) if (!sitemapLocs.has(p)) errors.push(`Not in sitemap: ${p}`);
for (const p of sitemapLocs) if (!pages.has(p)) errors.push(`Sitemap lists a page that does not exist: ${p}`);

// Internal links and orphans.
const inbound = new Map([...pages.keys()].map((p) => [p, 0]));
for (const [p, html] of pages) {
  for (const m of html.matchAll(/<a\b[^>]*\shref="([^"#?]+)[^"]*"/g)) {
    const href = m[1];
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const target = href.endsWith('/') || href.includes('.') ? href : href + '/';
    const isFile = /\.[a-z0-9]+$/i.test(target);
    if (isFile) {
      if (!existsSync(join(dist, target))) errors.push(`Broken link on ${p}: ${href}`);
      continue;
    }
    if (!pages.has(target)) errors.push(`Broken link on ${p}: ${href}`);
    else if (target !== p) inbound.set(target, (inbound.get(target) ?? 0) + 1);
  }
}
for (const [p, n] of inbound) if (n === 0 && p !== '/' && p !== '/404') warnings.push(`Orphan page (no inbound links): ${p}`);

// Thin pages: break pages should carry real copy.
for (const [p, html] of pages) {
  if (!/^\/surf\/[^/]+\/[^/]+\/[^/]+\/$/.test(p)) continue;
  const text = (html.match(/<main[\s\S]*<\/main>/)?.[0] ?? '').replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words < 250) errors.push(`Thin break page (${words} words): ${p}`);
}

// Per-page basics.
for (const [p, html] of pages) {
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`Missing <title>: ${p}`);
  if (!/<link rel="canonical"/.test(html)) errors.push(`Missing canonical: ${p}`);
  if ((html.match(/<h1\b/g) ?? []).length !== 1) errors.push(`Expected exactly one <h1>: ${p}`);
}

// Affiliate links must be marked sponsored.
for (const [p, html] of pages) {
  for (const m of html.matchAll(/<a\b[^>]*href="https?:\/\/[^"]*utm_source=saltline[^"]*"[^>]*>/g)) {
    if (!/rel="[^"]*sponsored/.test(m[0])) errors.push(`Partner link without rel="sponsored" on ${p}`);
  }
}

// Launch-readiness warnings.
const cfg = readFileSync(new URL('../src/config.ts', import.meta.url), 'utf8');
if (cfg.includes('REPLACE_WITH_EMAIL')) warnings.push('Quote form endpoint is still the placeholder (src/config.ts).');
if (/affiliateId:\s*''/.test(cfg)) warnings.push('No affiliate ID set (src/config.ts).');
if (/placeholderPhotos:\s*true/.test(cfg)) warnings.push('Placeholder photos are on.');
if (/showDraftBadges:\s*true/.test(cfg)) warnings.push('Draft badges are on.');
if (!process.env.SITE_URL && /saltlinecr\.com/.test(cfg)) warnings.push('Confirm the production domain in astro.config.mjs and src/config.ts.');
const unverified = [...pages].filter(([, h]) => h.includes('Draft: not yet verified')).length;
if (unverified) warnings.push(`${unverified} pages still show "Draft: not yet verified".`);

console.log(`Checked ${pages.size} pages, ${sitemapLocs.size} sitemap URLs.`);
for (const w of warnings) console.log('WARN  ' + w);
for (const e of errors) console.log('ERROR ' + e);
if (errors.length) {
  console.log(`\n${errors.length} error(s).`);
  process.exit(1);
}
console.log('\nNo errors.');
