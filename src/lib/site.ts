import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { site, levelLabels } from '../config';

export type Region = CollectionEntry<'regions'>;
export type Destination = CollectionEntry<'destinations'>;
export type Break = CollectionEntry<'breaks'>;
export type Season = CollectionEntry<'seasons'>;
export type Comparison = CollectionEntry<'comparisons'>;
export type Guide = CollectionEntry<'guides'>;

let cache: Awaited<ReturnType<typeof build>> | null = null;

async function build() {
  const [regions, destinations, breaks, seasons, comparisons, guides] = await Promise.all([
    getCollection('regions'),
    getCollection('destinations'),
    getCollection('breaks'),
    getCollection('seasons'),
    getCollection('comparisons'),
    getCollection('guides'),
  ]);
  regions.sort((a, b) => a.data.order - b.data.order);
  const regionOrder = new Map(regions.map((r) => [r.id, r.data.order]));
  destinations.sort(
    (a, b) =>
      (regionOrder.get(a.data.region.id) ?? 0) - (regionOrder.get(b.data.region.id) ?? 0) ||
      a.data.order - b.data.order,
  );
  seasons.sort((a, b) => (a.id === 'dry-season' ? -1 : b.id === 'dry-season' ? 1 : 0));
  guides.sort((a, b) => a.data.title.localeCompare(b.data.title));
  return {
    regions,
    destinations,
    breaks,
    seasons,
    comparisons,
    guides,
    regionById: new Map(regions.map((r) => [r.id, r])),
    destById: new Map(destinations.map((d) => [d.id, d])),
  };
}

export async function loadAll() {
  if (!cache) cache = await build();
  return cache;
}

// ---------- paths ----------
export const regionPath = (r: Region) => `/surf/${r.id}/`;
export const destPath = (d: Destination) => `/surf/${d.data.region.id}/${d.id}/`;
export const breakPath = (b: Break, d: Destination) => `${destPath(d)}${b.id}/`;
export const retreatPath = (d: Destination) => `/retreats/${d.id}/`;
export const levelPath = (l: string) => `/surf/by-level/${l}/`;
export const seasonPath = (s: Season) => `/surf/best-time/${s.id}/`;
export const comparePath = (c: Comparison) => `/surf/compare/${c.id}/`;
export const guidePath = (g: Guide) => `/surf/guides/${g.id}/`;

// ---------- tracking ----------
// One tag scheme for links, forms and (later) calls: source, medium, campaign = template, content = entity.
export function partnerUrl(path: string | undefined, template: string, entity: string) {
  const u = new URL(path ?? site.partner.fallbackPath, site.partner.base);
  u.searchParams.set('utm_source', site.utm.source);
  u.searchParams.set('utm_medium', site.utm.medium);
  u.searchParams.set('utm_campaign', template);
  u.searchParams.set('utm_content', entity);
  if (site.partner.affiliateParam && site.partner.affiliateId) {
    u.searchParams.set(site.partner.affiliateParam, site.partner.affiliateId);
  }
  return u.toString();
}

export function quoteUrl(from: string, template: string, entity: string) {
  const q = new URLSearchParams({ from, template, entity });
  return `/quote/?${q.toString()}`;
}

// ---------- formatting ----------
export const levelText = (levels: string[] | undefined) =>
  (levels ?? []).map((l) => levelLabels[l] ?? l).join(', ');

export const absolute = (path: string) => new URL(path, site.url).toString();

// ---------- relations ----------
export function nearby(dest: Destination, all: Destination[], limit = 4) {
  const sameRegion = all.filter((d) => d.id !== dest.id && d.data.region.id === dest.data.region.id);
  const sameLevel = all.filter(
    (d) =>
      d.id !== dest.id &&
      d.data.region.id !== dest.data.region.id &&
      d.data.levelMix.some((l) => dest.data.levelMix.includes(l)),
  );
  return [...sameRegion, ...sameLevel].slice(0, limit);
}

export function breakFacts(b: Break): [string, string | undefined][] {
  return [
    ['Type', b.data.type],
    ['Direction', b.data.direction],
    ['Level', b.data.level ? levelText(b.data.level) : undefined],
    ['Swell', b.data.swell],
    ['Season', b.data.season],
    ['Hazards', b.data.hazards],
    ['Access', b.data.access],
  ];
}

export const filledFacts = (b: Break) => breakFacts(b).filter(([, v]) => v).length;

// ---------- schema.org ----------
export function breadcrumbList(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absolute(it.path),
    })),
  };
}
