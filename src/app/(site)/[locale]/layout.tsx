import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SiteHeader, SiteFooter } from "@/components/site-shell";
import "../globals.css";
import { SiteLocaleProvider } from "@/components/site-locale-provider";
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
export const metadata: Metadata = {
  title: { default: "Atelier — Make a little time.", template: "%s | Atelier" },
  description:
    "Creative workshops in the heart of Zagreb. A little time, something handmade.",
};
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  if (!hasLocale(routing.locales, locale)) notFound();
  const messages = await getMessages();
  return (
    <html lang={locale} dir="ltr">
      <body>
        <SiteLocaleProvider locale={locale} messages={messages}>
          <a className="skip-link" href="#main">
            {locale === "hr" ? "Preskoči na sadržaj" : "Skip to content"}
          </a>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </SiteLocaleProvider>
      </body>
    </html>
  );
}
