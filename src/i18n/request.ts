import { locale as readRootLocale } from "next/root-params";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

const catalogs = {
  ar: () => import("../messages/ar.json").then((module) => module.default),
  en: () => import("../messages/en.json").then((module) => module.default),
  hr: () => import("../messages/hr.json").then((module) => module.default),
};

export default getRequestConfig(async ({ locale: override }) => {
  const candidate = override ?? (await readRootLocale());
  if (!hasLocale(routing.locales, candidate)) notFound();

  return {
    locale: candidate,
    messages: await catalogs[candidate](),
    timeZone: "Europe/Zagreb",
  };
});
