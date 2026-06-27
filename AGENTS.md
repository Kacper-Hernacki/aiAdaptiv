<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# aiAdaptiv

Marketing site (and future ecosystem) for **aiAdaptiv**. Next.js 16 (App Router,
Turbopack), React 19, Tailwind v4, TypeScript. SEO-first and agent-friendly.

## Conventions

- **i18n.** Every page lives under `app/[lang]/`. Locales are configured in
  `src/i18n/config.ts` (10: en, pl, de, no, it, fr, es, pt, cs, sk; default `en`).
  `src/proxy.ts` (Next 16's renamed middleware) detects locale from the
  `NEXT_LOCALE` cookie / `Accept-Language` and redirects `/` → `/{locale}`.
- **Content = dictionaries.** All on-page copy lives in
  `src/i18n/dictionaries/{locale}.json`, typed by `Dictionary` in
  `src/i18n/dictionaries.ts`. Only `en` + `pl` are translated; the other 8 fall
  back to `en` (see the `// TODO: translate` entries). Add a JSON file to enable
  a locale's own copy. Never hardcode user-facing strings in components.
- **SEO is centralized.** Brand constants live in `src/config/site.ts`; per-locale
  titles/descriptions come from the dictionaries via `generateMetadata` in
  `app/[lang]/layout.tsx` (canonical + full hreflang alternates). `robots.ts`,
  `sitemap.ts`, `manifest.ts`, and `llms.txt` derive from config + i18n.
- **Semantic HTML.** Landing sections use `<section aria-labelledby>` + one `h1`,
  then `h2`/`h3`; lists are `ul`/`ol`. Avoid meaningless `div` nesting.
- **Styling is deferred.** `globals.css` is intentionally empty (browser
  defaults) during the structure phase. Tailwind v4 is installed for the design
  pass; Higgsfield animations come after.
- **CTAs** link to `calendlyUrl` (`src/config/site.ts`, env-overridable).
- **Site URL** comes from `NEXT_PUBLIC_SITE_URL` (see `.env.example`); falls back
  to a placeholder. `metadataBase` depends on it, so set it before deploying.
- **Server Components by default.** The landing page is fully static/SSR for SEO.
  Only add `"use client"` for interactivity (e.g. animations).
- **Semantic, accessible markup.** One `<h1>` per page; sections use
  `aria-labelledby`; decorative elements are `aria-hidden`. Keep it that way.
- **Structured data** lives in `src/components/seo/JsonLd.tsx`.
- **Per-page SEO:** export a `metadata` object (or `generateMetadata`) from each
  new `page.tsx`. Add the route to `src/app/sitemap.ts`.

## Structure

- `src/config/site.ts` — single source of truth for site metadata/nav.
- `src/app/{robots,sitemap,manifest}.ts`, `opengraph-image.tsx`, `llms.txt/route.ts`.
- `src/components/` — `Header`, `Footer`, `seo/`, and `sections/` (landing blocks).

## Planned

- **Higgsfield MCP** for modern animations (deferred — SEO foundation first).

## Commands

- `npm run dev` · `npm run build` · `npm run start` · `npm run lint`
