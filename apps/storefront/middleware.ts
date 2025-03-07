import { NextMiddlewareResult } from "next/dist/server/web/types";
import { NextRequest, NextResponse } from "next/server";

import { GEOLOCATION } from "@/lib/const";
import { CHANNELS, DEFAULT_CHANNEL, DEFAULT_LOCALE, LOCALES } from "@/lib/regions";

export function LocaleRedirectionMiddleware({
  nextUrl,
  headers,
  geo,
}: NextRequest): NextMiddlewareResult | Promise<NextMiddlewareResult> {
  if (nextUrl.pathname !== "/") {
    // redirect should only be applied on homepage, without any region/locale chosen

    const posibbleUrls: string[] = [
      "page",
      "category",
      "products",
      "collection",
      "wishlist",
      "cart",
      "sale",
      "search",
      "account",
      // "checkout" has been removed to exclude it from redirection
    ];

    if (posibbleUrls.includes(nextUrl.pathname.split("/")[1])) {
      const url = nextUrl.clone();
      url.pathname = `/${DEFAULT_LOCALE}` + nextUrl.pathname;
      return NextResponse.redirect(url);
    } else {
      return null;
    }
  }
  if (!GEOLOCATION) {
    // redirection middleware can be turned on by setting the NEXT_PUBLIC_GEOLOCATION
    // env variable. If it's turned off we redirect to the default region
  }
  const requestLocale = headers.get("accept-language")?.split(",")?.[0] || DEFAULT_LOCALE;
  let locale = DEFAULT_LOCALE;
  if (LOCALES.find((l) => l.slug === requestLocale)) {
    // Redirect to the request language if supported by the application
    locale = requestLocale;
  }

  const requestCountry = geo?.country?.toLowerCase() || "us";
  let channel = DEFAULT_CHANNEL.slug;

  // For the demo purposes channel redirection only recognizes PLN channel by country
  if (requestCountry === "pl" && CHANNELS.find((ch) => ch.slug === "channel-pln")) {
    channel = "channel-pln";
  }

  const url = nextUrl.clone();
  url.pathname = `/${locale}`;
  return NextResponse.redirect(url);
}

export default LocaleRedirectionMiddleware;
