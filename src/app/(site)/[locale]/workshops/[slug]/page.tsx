export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  Clock,
  CalendarDays,
  MapPin,
  Check,
  UserRound,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getWorkshop, getWorkshops } from "@/lib/content";
import type { AppLocale } from "@/i18n/routing";
import { BookingForm } from "@/components/booking-form";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const workshop = await getWorkshop(
    (await getLocale()) as AppLocale,
    (await params).slug,
  );
  return { title: workshop?.title, description: workshop?.description };
}
export default async function WorkshopDetail({ params }: Props) {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("Detail");
  const workshop = await getWorkshop(locale, (await params).slug);
  if (!workshop) notFound();
  const workshops = await getWorkshops(locale);
  const date = new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Zagreb",
  }).format(new Date(workshop.date));
  return (
    <div className="detail-page container">
      <Link href="/#workshops" className="back-link">
        <ArrowLeft size={16} aria-hidden />
        {t("back")}
      </Link>
      <div className="detail-grid">
        <article>
          <span className="eyebrow">{t(workshop.category)}</span>
          <h1>{workshop.title}</h1>
          <p className="detail-lead">{workshop.description}</p>
          <img
            className="detail-image"
            src={workshop.image}
            alt={workshop.imageAlt}
            width="1000"
            height="800"
            fetchPriority="high"
          />
          <div className="detail-facts">
            <span>
              <CalendarDays size={18} aria-hidden />
              {date}
            </span>
            <span>
              <Clock size={18} aria-hidden />
              {workshop.duration / 60} h
            </span>
            <span>
              <MapPin size={18} aria-hidden />
              Martićeva 14, Zagreb
            </span>
            <span>
              <UserRound size={18} aria-hidden />
              {workshop.instructor}
            </span>
          </div>
          <h2>{t("about")}</h2>
          <p className="detail-body">{workshop.details}</p>
          <h2>{t("included")}</h2>
          <ul className="included-list">
            {workshop.included.split("\n").map((line) => (
              <li key={line}>
                <Check size={16} aria-hidden />
                {line}
              </li>
            ))}
          </ul>
        </article>
        <aside className="detail-booking">
          <span className="eyebrow">{t("reserve")}</span>
          <h2>{t("join")}</h2>
          <p>{workshop.level}</p>
          <BookingForm
            workshops={workshops.map(({ id, title, price }) => ({
              id,
              title,
              price,
            }))}
            selected={workshop.id}
          />
        </aside>
      </div>
    </div>
  );
}
