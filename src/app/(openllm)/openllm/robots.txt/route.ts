import { openllmUrl } from "@/config/site";

/**
 * robots.txt for the open-LLM product site.
 *
 * Next's `robots.ts` metadata convention only works at the app root, and that
 * one belongs to the agency site on the apex domain. So this is a plain route
 * handler at /openllm/robots.txt, which the host rewrite in src/proxy.ts serves
 * as openllm.aiadaptiv.com/robots.txt.
 */
export const dynamic = "force-static";

export function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/

Host: ${openllmUrl}
Sitemap: ${openllmUrl}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
