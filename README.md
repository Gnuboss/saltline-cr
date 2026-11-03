# Salt Line CR

Costa Rica surf and wellness travel guide. Astro 5, static output, no client framework.
Phase 1 prototype: tracked affiliate links, a quote form and an email signup that both land in one inbox.

## Run it

```
npm install
npm run dev        # http://localhost:4321
npm run ship       # build, then run the post-build checks
```

`npm run check` runs only the checks against an existing `dist/`.

## Where things live

| Path | What |
| --- | --- |
| `src/config.ts` | Site name, domain, partner, quote endpoint, UTM scheme, draft/placeholder flags |
| `src/data/*.json` | Regions, destinations, breaks, seasons, comparisons |
| `src/content/guides/*.md` | Long-form guides |
| `src/lib/site.ts` | Loaders, path helpers, tracked-link builders, schema helpers |
| `src/pages/` | Templates |
| `public/tracking.js` | First-touch UTM capture and click events |
| `scripts/check.mjs` | Orphans, broken links, thin pages, sitemap coverage, launch warnings |

## Adding content

- **A destination or break:** add a record to `destinations.json` or `breaks.json`. Pages, sitemap entries, breadcrumbs and links are generated.
- **A break gets its own page** only when `page: true`. Use that when it has at least six filled fields and about 250 words of original copy. The check fails thin break pages.
- **Derived views** (by level, best time, compare) come from the data. Do not hand-edit them.
- **Slugs are permanent.** If one has to change, add a 301 redirect.

## Before launch

1. Set the domain in `astro.config.mjs` and `src/config.ts`.
2. Set `quote.endpoint` in `src/config.ts` to the inbox that receives leads (FormSubmit confirms the address on first submission).
3. Set `partner.affiliateParam` and `partner.affiliateId`, and the partner name if you want it shown by name.
4. Verify the facts (swell, season, level, airport) with the partner, then fill in each record's `verified` date.
5. Replace placeholder photos and set `placeholderPhotos: false`.
6. Set `showDraftBadges: false`.
7. Add a contact email to the privacy page and have it reviewed.
8. Run `npm run ship` and clear the warnings.

## Tracking

Links to the partner carry `utm_source=saltline`, `utm_medium=referral`, `utm_campaign={template}`, `utm_content={entity}` and are marked `rel="sponsored"`.
`tracking.js` stores the first-touch UTMs and referrer in sessionStorage and fills them into the quote form's hidden fields, so each lead arrives with its source page. Click events go to `window.dataLayer` and a `slcr:track` browser event.

## Design notes

- **DOM order is semantic; visual order is commercial.** Pages put the taxonomy first in the markup and use CSS `order` (`.stack` with `.o1` to `.o7`) to lead visually with booking calls to action. Nothing is hidden.
- **Known trade-off:** keyboard tab order follows the DOM, not the visual order, so a keyboard user reaches the taxonomy before the booking calls to action. A skip link is provided. Revisit if analytics show keyboard or screen-reader users missing the calls to action.

## Phase 2

Call tracking, CRM handoff, and booked-or-not reporting back from the partner. Also stays, programs and trips (the content collections exist and are empty).

## Homepage

Magazine layout: masthead, cover story with a numbered break index, section modules by coast, planning links, a trust band and an email signup. The signup posts to the same inbox as the quote form (subject "New Salt Line CR email signup"), so move it to an email provider before sending any mail to the list.
