# SEO, AEO, GEO, and PSEO Implementation

DebugTools uses `https://debugtools.org` as the canonical domain.

## SEO

- Global metadata, Open Graph, Twitter cards, robots directives, and canonical URLs are handled in `src/app/layout.tsx` and `src/lib/seo.ts`.
- Tool metadata is centralized in `src/lib/tool-seo.ts`.
- Static tool layouts call `toolMetadata(...)`.
- Programmatic debug workflow pages under `/tools/[slug]/` generate metadata from the live tool registry.
- `SoftwareApplication`, `WebPage`, `BreadcrumbList`, and `ItemList` JSON-LD are emitted for tool and registry pages.

## AEO

- `/answers/` contains direct answer pages for common developer questions.
- Each answer page starts with a short answer, then gives practical steps and the matching DebugTools route.
- Answer pages emit `FAQPage` and `HowTo` JSON-LD.
- New answer pages should be added only for real recurring questions, not as keyword filler.

## GEO

- `public/llms.txt` gives answer engines a concise project summary and primary links.
- `public/llms-full.txt` gives a full machine-readable index of tools, answers, and trust pages.
- `public/ai.txt` gives a compact context file with product positioning, canonical URLs, privacy boundaries, and best entry pages.
- `public/robots.txt` allows `llms.txt`, `llms-full.txt`, and `ai.txt`.

## PSEO

- `/tools/[slug]/` is the programmatic route for debug workflow tools.
- `scripts/generate-sitemap.js` reads the live tool registry, debug workflow config, static tool folders, and answer-page data.
- The generator writes:
  - `public/sitemap.xml`
  - `public/llms.txt`
  - `public/llms-full.txt`
  - `public/ai.txt`

## Add A New Tool

1. Add the tool route or debug workflow config.
2. Add or confirm registry data in `src/app/tools/lib/tool-registry.ts`.
3. Add a specific metadata override in `src/lib/tool-seo.ts` only when the generated metadata is not enough.
4. Run `npm run generate-sitemap`.
5. Add an answer page only when there is a genuine search-style question.

## Verification

Run these before deployment:

```bash
npm run generate-sitemap
npm run build
npx tsc --noEmit --pretty false
```
