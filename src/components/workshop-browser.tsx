"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Search, ArrowUpRight, Clock, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getIntlLocale } from "@/i18n/locales";
import type { Workshop } from "@/payload-types";
const categories = ["all", "clay", "paper", "textile"] as const;
export function WorkshopBrowser({ workshops }: { workshops: Workshop[] }) {
  const t = useTranslations("Workshops");
  const locale = useLocale();
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const filtered = workshops.filter(
    (workshop) =>
      (category === "all" || workshop.category === category) &&
      (workshop.title + " " + workshop.description)
        .toLocaleLowerCase(locale)
        .includes(query.toLocaleLowerCase(locale)),
  );
  return (
    <section id="workshops" className="workshop-section container">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{t("eyebrow")}</span>
          <h2>{t("title")}</h2>
        </div>
        <p>{t("description")}</p>
      </div>
      <div className="filter-bar">
        <div className="filter-tabs" aria-label={t("categories")}>
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={category === item}
              className={category === item ? "filter active" : "filter"}
              onClick={() => setCategory(item)}
            >
              {t(item)}
            </button>
          ))}
        </div>
        <search className="search-box">
          <Search size={17} aria-hidden />
          <label className="sr-only" htmlFor="workshop-search">
            {t("search")}
          </label>
          <input
            id="workshop-search"
            type="search"
            placeholder={t("search")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </search>
      </div>
      <div className="workshop-grid">
        {filtered.map((workshop, index) => (
          <article className="workshop-card" key={workshop.id}>
            <Link href={"/workshops/" + workshop.slug} className="card-photo">
              <img
                src={workshop.image}
                alt={workshop.imageAlt}
                width="800"
                height="600"
                loading="lazy"
              />
              <span className="card-tag">{t(workshop.category)}</span>
              <span className="photo-arrow">
                <ArrowUpRight size={21} aria-hidden />
              </span>
            </Link>
            <div className="card-meta">
              <span>
                {new Intl.DateTimeFormat(getIntlLocale(locale), {
                  day: "numeric",
                  month: "short",
                  timeZone: "Europe/Zagreb",
                }).format(new Date(workshop.date))}
              </span>
              <span>
                <Clock size={13} aria-hidden />
                {workshop.duration / 60} h
              </span>
            </div>
            <h3>
              <Link href={"/workshops/" + workshop.slug}>{workshop.title}</Link>
            </h3>
            <p>{workshop.description}</p>
            <div className="card-bottom">
              <span>
                {new Intl.NumberFormat(locale, {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(workshop.price)}{" "}
                <small>/ {t("person")}</small>
              </span>
              <Link href={"/workshops/" + workshop.slug}>
                {t("details")}
                <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <Search size={28} aria-hidden />
          <h3>{t("empty")}</h3>
          <p>{t("emptyHint")}</p>
          <button
            className="button button-outline"
            onClick={() => {
              setQuery("");
              setCategory("all");
            }}
          >
            {t("reset")}
          </button>
        </div>
      )}
      <p className="results-count" aria-live="polite">
        {t("count", { count: filtered.length })}
      </p>
    </section>
  );
}
