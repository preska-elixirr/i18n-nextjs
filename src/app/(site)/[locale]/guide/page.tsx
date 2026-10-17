import { getTranslations } from "next-intl/server";
import { Droplets, Sun, Scissors, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { RenderingNote } from "@/components/rendering-note";
export const dynamic = "force-static";
export const revalidate = false;
export async function generateMetadata() {
  const t = await getTranslations("Guide");
  return { title: t("metaTitle"), description: t("intro") };
}
export default async function GuidePage() {
  const t = await getTranslations("Guide");
  return (
    <div className="container guide-page">
      <div className="route-intro">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h1>{t("title")}</h1>
        <p>{t("intro")}</p>
        <RenderingNote mode="static" stamp={new Date().toISOString()} />
      </div>
      <div className="guide-grid">
        {[
          { key: "ceramics", image: "clay", Icon: Droplets },
          { key: "prints", image: "paper", Icon: Sun },
          { key: "textiles", image: "textile", Icon: Scissors },
        ].map(({ key, image, Icon }, index) => (
          <article className="guide-card" key={key}>
            <img
              src={"/images/" + image + ".jpg"}
              alt={t(key + ".imageAlt")}
              width="800"
              height="600"
              loading="lazy"
            />
            <div className="guide-card-copy">
              <span className="guide-card-number">
                0{index + 1}
                <Icon size={20} aria-hidden />
              </span>
              <h2>{t(key + ".title")}</h2>
              <p>{t(key + ".intro")}</p>
              <ul>
                {["one", "two", "three"].map((item) => (
                  <li key={item}>{t(key + "." + item)}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
      <div className="guide-callout">
        <div>
          <span className="eyebrow">{t("calloutEyebrow")}</span>
          <h2>{t("calloutTitle")}</h2>
        </div>
        <Link prefetch={false} href="/planner" className="button button-dark">
          {t("calloutLink")}
          <ArrowUpRight size={17} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
