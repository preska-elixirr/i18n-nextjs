import { defineRouting } from "next-intl/routing";
import { supportedLocales } from "./locales";
export const routing = defineRouting({
  locales: supportedLocales,
  defaultLocale: "en",
  localePrefix:
    process.env.NEXT_PUBLIC_LOCALE_PREFIX === "always" ? "always" : "never",
  localeCookie: { maxAge: 60 * 60 * 24 * 365 },
});
export type AppLocale = (typeof routing.locales)[number];
