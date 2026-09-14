import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";
import { isLocale, locales } from "@/i18n/config";
import { caseStudies, getCaseCopy, getCaseStudy } from "@/content/case-studies";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Case study";

/** One card per case per locale, matching the page routes. */
export function generateStaticParams() {
  return locales.flatMap((lang) =>
    caseStudies.map((study) => ({ lang, slug: study.slug })),
  );
}

/**
 * A case study shared as a link should show its own headline, not the site's.
 * The shape follows the home page card so the two read as one family.
 */
export default async function CaseOpengraphImage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const study = getCaseStudy(slug);
  const copy =
    study && isLocale(lang) ? getCaseCopy(study, lang) : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "radial-gradient(120% 120% at 0% 0%, #1e1b4b 0%, #0a0a0a 55%)",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #818cf8 0%, #22d3ee 100%)",
            }}
          />
          <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1 }}>
            {siteConfig.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              fontSize: 24,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#a5b4fc",
            }}
          >
            {copy?.kindLabel ?? "Case study"}
          </div>
          <div
            style={{
              fontSize: 70,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 1000,
            }}
          >
            {copy?.title ?? "Case study"}
          </div>
          {/* One string, not two nodes: satori refuses a multi-child box
              that has no explicit display. */}
          {copy?.metrics?.[0] ? (
            <div style={{ fontSize: 28, color: "#a1a1aa", maxWidth: 900 }}>
              {`${copy.metrics[0].value} ${copy.metrics[0].label}`}
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...size },
  );
}
