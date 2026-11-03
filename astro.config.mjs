import { defineConfig } from 'astro/config';

// Replace with the real domain before launch. It feeds canonical URLs, the sitemaps and schema.
export default defineConfig({
  site: 'https://saltlinecr.com',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
