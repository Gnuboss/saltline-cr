import { site } from '../config';
import {
  loadAll, regionPath, destPath, breakPath, retreatPath, levelPath, seasonPath, comparePath, guidePath, absolute,
} from './site';

export const sitemapTypes = ['pages', 'regions', 'destinations', 'breaks', 'views', 'retreats', 'guides'] as const;
export type SitemapType = (typeof sitemapTypes)[number];

export type Entry = { loc: string; lastmod?: string };

const toDate = (v: unknown): string | undefined => {
  if (!v) return undefined;
  const d = new Date(v as string);
  return isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
};

// noindex pages (/quote/, /quote/thanks/, /404/) are intentionally absent.
export async function entriesFor(type: SitemapType): Promise<Entry[]> {
  const { regions, destinations, breaks, seasons, comparisons, guides } = await loadAll();
  const e = (path: string, lastmod?: unknown): Entry => ({ loc: absolute(path), lastmod: toDate(lastmod) });

  switch (type) {
    case 'pages':
      return ['/', '/surf/', '/retreats/', '/surf/guides/', '/about/', '/how-we-work/', '/privacy/', '/sitemap/'].map((p) => e(p));
    case 'regions':
      return regions.map((r) => e(regionPath(r), (r.data as any).updated));
    case 'destinations':
      return destinations.map((d) => e(destPath(d), (d.data as any).verified ?? (d.data as any).updated));
    case 'breaks': {
      const byId = new Map(destinations.map((d) => [d.id, d]));
      return breaks
        .filter((b) => b.data.page)
        .map((b) => e(breakPath(b, byId.get(b.data.destination.id)!), (b.data as any).verified ?? (b.data as any).updated));
    }
    case 'views':
      return [
        ...['beginner', 'intermediate', 'advanced'].map((l) => e(levelPath(l))),
        ...seasons.map((s) => e(seasonPath(s))),
        ...comparisons.map((c) => e(comparePath(c))),
      ];
    case 'retreats':
      return destinations.filter((d) => d.data.retreat).map((d) => e(retreatPath(d), (d.data as any).verified));
    case 'guides':
      return guides.map((g) => e(guidePath(g), (g.data as any).updated));
  }
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function urlset(entries: Entry[]) {
  const body = entries
    .map((x) => `  <url><loc>${esc(x.loc)}</loc>${x.lastmod ? `<lastmod>${x.lastmod}</lastmod>` : ''}</url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function index(types: SitemapType[]) {
  const body = types.map((t) => `  <sitemap><loc>${esc(new URL(`/sitemap-${t}.xml`, site.url).toString())}</loc></sitemap>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}
