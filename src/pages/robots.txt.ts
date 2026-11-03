import { site } from '../config';

export const GET = () =>
  new Response(
    `User-agent: *\nAllow: /\nDisallow: /quote/\n\nSitemap: ${new URL('/sitemap.xml', site.url).toString()}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
