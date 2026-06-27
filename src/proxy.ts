import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale, isLocale } from "@/i18n/config";

const COOKIE = "NEXT_LOCALE";
const ONE_YEAR = 60 * 60 * 24 * 365;

/** Pick a locale from the persisted cookie, then the Accept-Language header. */
function pickLocale(request: NextRequest): string {
  const cookie = request.cookies.get(COOKIE)?.value;
  if (cookie && isLocale(cookie)) return cookie;

  const header = request.headers.get("accept-language");
  if (header) {
    const ranked = header
      .split(",")
      .map((part) => {
        const [tag, q] = part.trim().split(";q=");
        return { base: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
      })
      .sort((a, b) => b.q - a.q);

    for (const { base } of ranked) {
      if (isLocale(base)) return base;
    }
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = pickLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(url);
  response.cookies.set(COOKIE, locale, { path: "/", maxAge: ONE_YEAR });
  return response;
}

export const config = {
  // Run on everything except internal paths, the API, and files with an
  // extension (robots.txt, sitemap.xml, manifest.webmanifest, favicon.ico, …).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
