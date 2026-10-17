export const supportedLocales = ["en", "hr", "ar"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];
export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return (
    typeof value === "string" &&
    supportedLocales.some((locale) => locale === value)
  );
}
export function getDirection(locale: string): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}
export function getIntlLocale(locale: string) {
  return locale === "en" ? "en-GB" : locale === "hr" ? "hr-HR" : "ar";
}
export const localeNames = { en: "English", hr: "Hrvatski", ar: "العربية" };
