import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale, isLocale } from "@/i18n/config";
import { openllmUrl, openllmHost } from "@/config/site";

const COOKIE = "NEXT_LOCALE";
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Internal path prefix for the open-LLM product site (app/(openllm)/openllm/…).
 * It is never a public URL: openllm.<domain>/x is rewritten to /openllm/x, and
 * the same path on the apex domain is redirected away so the two hosts can't
 * serve the same page as duplicates.
 */
const OPENLLM_PREFIX = "/openllm";

/**
 * Root-level text files. They are never locale-prefixed, so they bypass the
 * locale redirect entirely; on the openllm host they are rewritten into the
 * product branch, on the apex they fall through to the app-root handlers.
 */
const ROOT_FILES = new Set(["/sitemap.xml", "/robots.txt", "/llms.txt"]);

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

function hasLocalePrefix(pathname: string): boolean {
  return locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
}

/**
 * True when the request arrived on the open-LLM subdomain. Behind Vercel's
 * proxy `host` is rewritten, so `x-forwarded-host` is the authoritative value.
 * Matching on the leading label (rather than the full host) keeps preview
 * deployments and `openllm.localhost:3000` working during development.
 */
function isOpenllmHost(request: NextRequest): boolean {
  const host = (
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    ""
  ).toLowerCase();

  if (!host) return false;
  return host === openllmHost || host.split(":")[0].startsWith("openllm.");
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const onOpenllm = isOpenllmHost(request);

  if (ROOT_FILES.has(pathname)) {
    if (!onOpenllm) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = `${OPENLLM_PREFIX}${pathname}`;
    return NextResponse.rewrite(url);
  }

  if (onOpenllm) {
    // Locale first, so the redirect keeps the subdomain in the visible URL.
    if (!hasLocalePrefix(pathname)) {
      const locale = pickLocale(request);
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
      const response = NextResponse.redirect(url);
      response.cookies.set(COOKIE, locale, { path: "/", maxAge: ONE_YEAR });
      return response;
    }

    const url = request.nextUrl.clone();
    url.pathname = `${OPENLLM_PREFIX}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Apex domain: the internal openllm paths are not a second public address for
  // the product site — send them to the subdomain permanently.
  if (
    pathname === OPENLLM_PREFIX ||
    pathname.startsWith(`${OPENLLM_PREFIX}/`)
  ) {
    const rest = pathname.slice(OPENLLM_PREFIX.length);
    return NextResponse.redirect(
      new URL(`${rest || "/"}${request.nextUrl.search}`, openllmUrl),
      308,
    );
  }

  if (hasLocalePrefix(pathname)) return NextResponse.next();

  const locale = pickLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(url);
  response.cookies.set(COOKIE, locale, { path: "/", maxAge: ONE_YEAR });
  return response;
}

export const config = {
  // Run on everything except internal paths, the API, and files with an
  // extension (manifest.webmanifest, favicon.ico, …) — with the exception of
  // the three root-level text files, which the openllm host needs rewritten to
  // its own branch.
  matcher: [
    "/((?!_next|api|.*\\..*).*)",
    "/sitemap.xml",
    "/robots.txt",
    "/llms.txt",
  ],
};
