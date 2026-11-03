import { defineCollection, z, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';

const level = z.enum(['beginner', 'intermediate', 'advanced']);
const breakLevel = z.enum(['beginner', 'intermediate', 'advanced', 'expert']);
const theme = z.enum(['surf', 'yoga', 'wellness']);

const regions = defineCollection({
  loader: file('src/data/regions.json'),
  schema: z.object({
    name: z.string(),
    order: z.number(),
    coast: z.string(),
    summary: z.string(),
    season: z.string(),
    airports: z.array(z.string()),
    updated: z.string(),
  }),
});

const destinations = defineCollection({
  loader: file('src/data/destinations.json'),
  schema: z.object({
    name: z.string(),
    region: reference('regions'),
    order: z.number(),
    summary: z.string(), // answer-first sentence, also the meta description
    body: z.array(z.string()),
    levelMix: z.array(level),
    surfStyle: z.string(),
    nearestAirport: z.string(),
    bestFor: z.string(),
    wellness: z.string().optional(),
    retreat: z.boolean().default(false),
    themes: z.array(theme).default(['surf']),
    partnerPath: z.string().optional(), // page on the partner's site; falls back to the surf hub
    lat: z.number().optional(),
    lng: z.number().optional(),
    verified: z.string().nullable().default(null),
    updated: z.string(),
  }),
});

const breaks = defineCollection({
  loader: file('src/data/breaks.json'),
  schema: z.object({
    name: z.string(),
    destination: reference('destinations'),
    summary: z.string(),
    type: z.string().optional(),
    direction: z.string().optional(),
    level: z.array(breakLevel).optional(),
    swell: z.string().optional(),
    season: z.string().optional(),
    hazards: z.string().optional(),
    access: z.string().optional(),
    page: z.boolean().default(false), // true only when it passes the thin-page rule
    body: z.array(z.string()).default([]),
    verified: z.string().nullable().default(null),
    updated: z.string(),
  }),
});

const seasons = defineCollection({
  loader: file('src/data/seasons.json'),
  schema: z.object({
    name: z.string(),
    months: z.string(),
    summary: z.string(),
    body: z.array(z.string()),
    updated: z.string(),
  }),
});

const comparisons = defineCollection({
  loader: file('src/data/comparisons.json'),
  schema: z.object({
    a: reference('destinations'),
    b: reference('destinations'),
    verdict: z.string(),
    updated: z.string(),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    related: z.array(reference('destinations')).default([]),
    updated: z.string(),
  }),
});

// Reserved for when the partner's inventory arrives. Schemas are defined now so adding a
// record is a data change only. Files are optional until then.
const stays = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/stays' }),
  schema: z.object({
    name: z.string(),
    destination: reference('destinations'),
    themes: z.array(theme).default(['surf']),
    surfAccess: z.string().optional(),
    partnerUrl: z.string(),
    verified: z.string().nullable().default(null),
    updated: z.string(),
  }),
});

const programs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/programs' }),
  schema: z.object({
    name: z.string(),
    destination: reference('destinations'),
    kind: z.enum(['retreat', 'surf-camp', 'wellness-week']),
    themes: z.array(theme),
    nights: z.number().optional(),
    partnerUrl: z.string(),
    verified: z.string().nullable().default(null),
    updated: z.string(),
  }),
});

export const collections = { regions, destinations, breaks, seasons, comparisons, guides, stays, programs };
