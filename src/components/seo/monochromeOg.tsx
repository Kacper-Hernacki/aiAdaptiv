import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

/** Standard social-card size. LinkedIn, X and iMessage all expect 1.91:1. */
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

/**
 * 1200×630 card in the live site's dark monochrome palette (see
 * AIADAPTIV-STYLE: --bg #111113, --fg #f0f0f2). Used by every sub-page so a
 * shared link does not fall back to the home headline.
 */
export function monochromeOgImage({
  title,
  kicker,
}: {
  title: string;
  kicker?: string;
}) {
  const fontSize = title.length > 70 ? 48 : title.length > 48 ? 56 : 64;

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
          background: "#111113",
          color: "#f0f0f2",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#f0f0f2",
            }}
          />
          <div
            style={{
              fontSize: 32,
              fontWeight: 500,
              letterSpacing: -1,
            }}
          >
            {siteConfig.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {kicker ? (
            <div
              style={{
                fontSize: 22,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "rgba(240, 240, 242, 0.55)",
              }}
            >
              {kicker}
            </div>
          ) : null}
          <div
            style={{
              fontSize,
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: -2,
              maxWidth: 1040,
            }}
          >
            {title}
          </div>
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
