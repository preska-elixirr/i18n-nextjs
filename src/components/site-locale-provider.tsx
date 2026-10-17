"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import { usePathname } from "next/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import en from "@/messages/en.json";
import hr from "@/messages/hr.json";

import ar from "@/messages/ar.json";
import { getDirection } from "@/i18n/locales";
const catalogs = { en, hr, ar };
const ClientLocaleContext = createContext<{
  inMemory: boolean;
  change: (locale: AppLocale) => void;
}>({ inMemory: false, change: () => {} });
export function useClientLocale() {
  return useContext(ClientLocaleContext);
}
export function SiteLocaleProvider({
  locale: serverLocale,
  messages,
  children,
}: {
  locale: AppLocale;
  messages: AbstractIntlMessages;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const visiblePath = pathname.replace(/^\/(en|hr|ar)(?=\/|$)/, "") || "/";
  const inMemory =
    visiblePath === "/planner" && routing.localePrefix === "never";
  const [override, setOverride] = useState<AppLocale | null>(null);
  const locale = inMemory ? (override ?? serverLocale) : serverLocale;
  useEffect(() => {
    setOverride(null);
  }, [serverLocale, inMemory]);
  useEffect(() => {
    if (!inMemory) return;
    document.documentElement.lang = locale;
    document.documentElement.dir = getDirection(locale);
    document.title = catalogs[locale].Planner.metaTitle + " | Atelier";
  }, [locale, inMemory]);
  function change(next: AppLocale) {
    if (!inMemory) return;
    setOverride(next);
    // Match next-intl's configured cookie so the next server navigation uses
    // the same preference. This writes locally; no Server Action is called.
    document.cookie =
      "NEXT_LOCALE=" +
      next +
      "; Path=/; Max-Age=31536000; SameSite=Lax" +
      (location.protocol === "https:" ? "; Secure" : "");
  }
  return (
    <ClientLocaleContext.Provider value={{ inMemory, change }}>
      <NextIntlClientProvider
        locale={locale}
        messages={inMemory ? catalogs[locale] : messages}
        timeZone="Europe/Zagreb"
      >
        {children}
      </NextIntlClientProvider>
    </ClientLocaleContext.Provider>
  );
}
