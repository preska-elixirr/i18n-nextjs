import { getLocale, getTranslations } from "next-intl/server";
import { getWorkshops } from "@/lib/content";
import type { AppLocale } from "@/i18n/routing";
import { WorkshopBrowser } from "@/components/workshop-browser";
import { RenderingNote } from "@/components/rendering-note";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const t = await getTranslations("Catalog");
  return { title: t("metaTitle"), description: t("description") };
}
export default async function WorkshopsPage() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("Catalog");
  const workshops = await getWorkshops(locale);
  return (
    <>
      <div className="container route-intro">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h1>{t("title")}</h1>
        <p>{t("description")}</p>
        <RenderingNote mode="server" stamp={new Date().toISOString()} />
      </div>
      <WorkshopBrowser workshops={workshops} />
    </>
  );
}
