import { sitemapTypes, index } from '../lib/sitemap';

export const GET = () =>
  new Response(index([...sitemapTypes]), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
