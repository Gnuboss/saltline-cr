import type { APIRoute } from 'astro';
import { sitemapTypes, entriesFor, urlset, type SitemapType } from '../lib/sitemap';

export function getStaticPaths() {
  return sitemapTypes.map((type) => ({ params: { type } }));
}

export const GET: APIRoute = async ({ params }) =>
  new Response(urlset(await entriesFor(params.type as SitemapType)), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
