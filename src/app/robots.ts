import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Search engines and AI crawlers are equally welcome; only the API
        // and Next's internals are off limits. /llms.txt is called out so a
        // crawler that honours the convention finds it without guessing.
        userAgent: "*",
        allow: ["/", "/llms.txt"],
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
