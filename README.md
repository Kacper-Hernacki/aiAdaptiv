# aiAdaptiv

Marketing site for **aiAdaptiv** — adaptive AI systems and automation for modern
teams. Built with Next.js 16 (App Router + Turbopack), React 19, Tailwind v4, and
TypeScript. SEO-first and agent-friendly from day one.

## Getting started

```bash
cp .env.example .env.local   # set NEXT_PUBLIC_SITE_URL to your domain
npm run dev                  # http://localhost:3000
```

## Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the dev server (Turbopack)     |
| `npm run build` | Production build                     |
| `npm run start` | Serve the production build           |
| `npm run lint`  | Lint with ESLint                     |

## SEO & agent-readiness

Everything is driven from `src/config/site.ts` (the single source of truth):

- **Metadata** — title templates, description, canonical, Open Graph, Twitter
  cards, robots directives (`src/app/layout.tsx`).
- **Dynamic OG image** — generated with `next/og` (`src/app/opengraph-image.tsx`),
  reused for Twitter.
- **Structured data** — `Organization` + `WebSite` JSON-LD
  (`src/components/seo/JsonLd.tsx`).
- **`robots.txt`, `sitemap.xml`, `manifest.webmanifest`** — generated routes.
- **`llms.txt`** — machine-readable site map for LLMs/AI agents
  ([llmstxt.org](https://llmstxt.org)), generated from config.

### Before deploying

Set `NEXT_PUBLIC_SITE_URL` to the real domain so canonical URLs, the sitemap,
and Open Graph tags resolve correctly.

## Project structure

```
src/
  app/            # routes, metadata routes, layout
  components/
    seo/          # JSON-LD
    sections/     # landing-page blocks
  config/site.ts  # single source of truth for SEO/nav
```

## Roadmap

- [ ] Confirm production domain + finalize brand copy
- [ ] Higgsfield MCP integration for modern animations
- [ ] Additional routes (blog, pricing, docs) — remember to extend the sitemap
