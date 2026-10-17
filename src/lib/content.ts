import "server-only";
import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import type { AppLocale } from "@/i18n/routing";
export const getCMS = cache(() => getPayload({ config }));
export const getStudio = cache(async (locale: AppLocale) => {
  const payload = await getCMS();
  return payload.findGlobal({
    slug: "studio",
    locale,
    fallbackLocale: false,
    overrideAccess: false,
  });
});
export const getWorkshops = cache(async (locale: AppLocale) => {
  const payload = await getCMS();
  const result = await payload.find({
    collection: "workshops",
    locale,
    fallbackLocale: false,
    overrideAccess: false,
    limit: 30,
    sort: "date",
    depth: 0,
    where: {
      and: [
        { published: { equals: true } },
        { date: { greater_than: new Date().toISOString() } },
      ],
    },
  });
  return result.docs.filter((workshop) =>
    Boolean(
      workshop.title &&
      workshop.description &&
      workshop.details &&
      workshop.included &&
      workshop.imageAlt,
    ),
  );
});
export const getWorkshop = cache(async (locale: AppLocale, slug: string) => {
  const workshops = await getWorkshops(locale);
  return workshops.find((workshop) => workshop.slug === slug);
});
