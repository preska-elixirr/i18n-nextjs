export const dynamic = "force-dynamic";
import { getLocale, getTranslations } from "next-intl/server";
import {
  ArrowUpRight,
  ArrowDown,
  Asterisk,
  Check,
  Coffee,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getStudio, getWorkshops } from "@/lib/content";
import type { AppLocale } from "@/i18n/routing";
import { WorkshopBrowser } from "@/components/workshop-browser";
import { BookingForm } from "@/components/booking-form";
export async function generateMetadata() {
  const t = await getTranslations("Home");
  return { title: t("metaTitle"), description: t("metaDescription") };
}
export default async function Home() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("Home");
  const [studio, workshops] = await Promise.all([
    getStudio(locale),
    getWorkshops(locale),
  ]);
  const featured = workshops[0];
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="status-dot" />
            {studio.eyebrow}
          </span>
          <h1>{studio.heroTitle}</h1>
          <p>{studio.heroDescription}</p>
          <div className="hero-actions">
            <Link href="/#workshops" className="button button-accent">
              {t("explore")}
              <ArrowUpRight size={18} aria-hidden />
            </Link>
            <span className="hero-assurance">
              <Check size={15} aria-hidden />
              {t("beginners")}
            </span>
          </div>
          <div className="hero-bottom">
            <div className="avatar-stack">
              <span>MA</span>
              <span>LK</span>
              <span>IV</span>
            </div>
            <p>
              {t("smallGroups")}
              <strong>{t("humanConnection")}</strong>
            </p>
            <ArrowDown className="hero-down" size={23} aria-hidden />
          </div>
        </div>
        <div className="hero-visual">
          <img
            className="hero-image"
            src="/images/studio.jpg"
            alt={t("heroAlt")}
            width="1200"
            height="1300"
            fetchPriority="high"
          />
          <div className="hero-sticker">
            <Asterisk size={25} aria-hidden />
            <span>{t("madeByYou")}</span>
          </div>
          {featured && (
            <Link
              className="next-workshop"
              href={"/workshops/" + featured.slug}
            >
              <span className="next-icon">
                <Sparkles size={21} aria-hidden />
              </span>
              <span>
                <small>{t("nextWorkshop")}</small>
                <strong>{featured.title}</strong>
              </span>
              <ArrowUpRight size={23} aria-hidden />
            </Link>
          )}
        </div>
      </section>
      <div className="values-strip">
        <div className="container">
          <span>
            <Sparkles size={18} aria-hidden />
            {t("valueOne")}
          </span>
          <span>
            <HeartHandshake size={18} aria-hidden />
            {t("valueTwo")}
          </span>
          <span>
            <Coffee size={18} aria-hidden />
            {t("valueThree")}
          </span>
          <span className="values-signature">{t("valueFour")}</span>
        </div>
      </div>
      <WorkshopBrowser workshops={workshops} />
      <section id="studio" className="studio-section">
        <div className="container studio-grid">
          <div className="studio-photo">
            <img
              src="/images/studio-detail.jpg"
              alt={t("studioAlt")}
              width="900"
              height="1000"
              loading="lazy"
            />
            <span className="photo-caption">MARTIĆEVA 14 / ZAGREB</span>
          </div>
          <div className="studio-copy">
            <span className="eyebrow">{t("studioEyebrow")}</span>
            <h2>{studio.storyTitle}</h2>
            <p>{studio.story}</p>
            <div className="studio-signature">
              <Asterisk size={32} aria-hidden />
              <span>
                {t("signature")}
                <small>{t("signatureRole")}</small>
              </span>
            </div>
            <a
              className="text-link"
              href="https://www.openstreetmap.org/search?query=Marti%C4%87eva%2014%20Zagreb"
              target="_blank"
              rel="noreferrer"
            >
              {t("visit")}
              <ArrowUpRight size={16} aria-hidden />
            </a>
          </div>
        </div>
      </section>
      <section id="book" className="booking-section container">
        <div className="booking-intro">
          <span className="eyebrow">{t("bookingEyebrow")}</span>
          <h2>{t("bookingTitle")}</h2>
          <p>{t("bookingDescription")}</p>
          <ul className="booking-benefits">
            <li>
              <Check size={17} aria-hidden />
              {t("benefitOne")}
            </li>
            <li>
              <Check size={17} aria-hidden />
              {t("benefitTwo")}
            </li>
            <li>
              <Check size={17} aria-hidden />
              {t("benefitThree")}
            </li>
          </ul>
          <div className="booking-contact">
            <span>{t("questions")}</span>
            <a href={"mailto:" + studio.email}>
              {studio.email}
              <ArrowUpRight size={15} aria-hidden />
            </a>
          </div>
          <Asterisk className="booking-asterisk" aria-hidden />
        </div>
        <div className="booking-card">
          <BookingForm
            workshops={workshops.map(({ id, title, price }) => ({
              id,
              title,
              price,
            }))}
          />
        </div>
      </section>
      <section className="faq-section container">
        <div>
          <span className="eyebrow">{t("faqEyebrow")}</span>
          <h2>{t("faqTitle")}</h2>
        </div>
        <div className="faq-list">
          {["first", "bring", "cancel"].map((key) => (
            <details key={key}>
              <summary>{t("faq." + key + ".question")}</summary>
              <p>{t("faq." + key + ".answer")}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
