import { getLocale, getTranslations } from "next-intl/server";
import {
  Asterisk,
  ArrowUpRight,
  MapPin,
  Coffee,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import { getStudio } from "@/lib/content";
import type { AppLocale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { RenderingNote } from "@/components/rendering-note";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const t = await getTranslations("StudioPage");
  return { title: t("metaTitle"), description: t("intro") };
}
export default async function StudioPage() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("StudioPage");
  const studio = await getStudio(locale);
  return (
    <div className="container studio-page">
      <div className="route-intro">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h1>{t("title")}</h1>
        <p>{t("intro")}</p>
        <RenderingNote mode="server" stamp={new Date().toISOString()} />
      </div>
      <div className="studio-page-grid">
        <figure>
          <img
            src="/images/studio-detail.jpg"
            alt={t("imageAlt")}
            width="1000"
            height="1100"
            fetchPriority="high"
          />
          <figcaption>{studio.address}</figcaption>
        </figure>
        <article>
          <Asterisk className="studio-page-mark" aria-hidden />
          <h2>{studio.storyTitle}</h2>
          <p className="studio-long-copy">{studio.story}</p>
          <div className="studio-visit">
            <MapPin size={18} aria-hidden />
            <div>
              <h3>{t("visit")}</h3>
              <p>{studio.address}</p>
              <a href={"mailto:" + studio.email}>{studio.email}</a>
            </div>
          </div>
          <Link
            prefetch={false}
            href="/workshops"
            className="button button-dark"
          >
            {t("cta")}
            <ArrowUpRight size={17} aria-hidden />
          </Link>
        </article>
      </div>
      <div className="studio-principles">
        {[
          { key: "care", Icon: HeartHandshake },
          { key: "curiosity", Icon: Sparkles },
          { key: "company", Icon: Coffee },
        ].map(({ key, Icon }) => (
          <article key={key}>
            <Icon size={25} aria-hidden />
            <h2>{t(key + ".title")}</h2>
            <p>{t(key + ".description")}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
