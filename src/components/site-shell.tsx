"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Asterisk, ArrowUpRight, Menu, X, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getIntlLocale } from "@/i18n/locales";
import LanguageSwitcher from "./LanguageSwitcher";
import { NewsletterForm } from "./newsletter-form";
export function SiteHeader() {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);
  return (
    <>
      <a className="skip-link" href="#main">
        {t("skip")}
      </a>
      <div className="announcement">
        <span>{t("announcement")}</span>
        <span>ZAGREB · EST. 2024</span>
      </div>
      <header className="site-header container">
        <Link
          prefetch={false}
          href="/"
          className="wordmark"
          dir="ltr"
          aria-label="Atelier"
        >
          <Asterisk aria-hidden />
          atelier<span className="wordmark-dot">.</span>
        </Link>
        <nav aria-label={t("navigation")} className="desktop-nav">
          <Link prefetch={false} href="/workshops">
            {t("workshops")}
          </Link>
          <Link prefetch={false} href="/studio">
            {t("studio")}
          </Link>
          <Link prefetch={false} href="/guide">
            {t("guide")}
          </Link>
          <Link prefetch={false} href="/planner">
            {t("planner")}
          </Link>
        </nav>
        <div className="header-actions">
          <LanguageSwitcher />
          <Link
            prefetch={false}
            href="/#book"
            className="button button-dark header-book"
          >
            {t("book")}
            <ArrowUpRight size={15} aria-hidden />
          </Link>
          <button
            className="mobile-menu"
            aria-label={open ? t("closeMenu") : t("menu")}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav
            id="mobile-nav"
            className="mobile-nav"
            aria-label={t("navigation")}
          >
            <Link
              prefetch={false}
              href="/workshops"
              onClick={() => setOpen(false)}
            >
              {t("workshops")}
            </Link>
            <Link
              prefetch={false}
              href="/studio"
              onClick={() => setOpen(false)}
            >
              {t("studio")}
            </Link>
            <Link prefetch={false} href="/guide" onClick={() => setOpen(false)}>
              {t("guide")}
            </Link>
            <Link
              prefetch={false}
              href="/planner"
              onClick={() => setOpen(false)}
            >
              {t("planner")}
            </Link>
            <Link prefetch={false} href="/#book" onClick={() => setOpen(false)}>
              {t("book")}
            </Link>
          </nav>
        )}
      </header>
    </>
  );
}
// Unsplash photographers of the images in public/images; see docs/photo-credits.md.
const photographers: Record<string, string> = {
  "Jonathan Cosens Photography": "https://unsplash.com/@jcosens",
  "Emily Underworld": "https://unsplash.com/@emilyunderworld",
  "Nahil Naseer": "https://unsplash.com/@nahilnaseer",
};
function PhotographerList() {
  const locale = useLocale();
  // ListFormat supplies the locale's separators and "and" ("i" in Croatian, "و" in Arabic).
  return new Intl.ListFormat(getIntlLocale(locale), { type: "conjunction" })
    .formatToParts(Object.keys(photographers))
    .map((part, index) =>
      part.type === "element" ? (
        <a
          key={index}
          href={photographers[part.value]}
          target="_blank"
          rel="noreferrer"
          dir="ltr"
        >
          {part.value}
        </a>
      ) : (
        part.value
      ),
    );
}
export function SiteFooter() {
  const t = useTranslations("Footer");
  return (
    <footer id="contact" className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link prefetch={false} href="/" className="wordmark" dir="ltr">
            <Asterisk aria-hidden />
            atelier.
          </Link>
          <p className="footer-intro">{t("intro")}</p>
          <p className="address">
            <MapPin size={15} aria-hidden /> Martićeva 14, Zagreb
          </p>
          <a href="mailto:hello@atelier.example">
            <bdi dir="ltr">hello@atelier.example</bdi>
          </a>
        </div>
        <div>
          <span className="eyebrow">{t("stayClose")}</span>
          <h2>{t("newsletter")}</h2>
          <NewsletterForm />
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Atelier Studio</span>
        <span>{t("made")}</span>
        <a href="/admin" target="_blank" rel="noreferrer">
          {t("cms")}
          <ArrowUpRight size={13} aria-hidden />
        </a>
      </div>
      <p className="container photo-credits">
        {t.rich("photos", {
          names: () => <PhotographerList />,
          unsplash: (chunks) => (
            <a href="https://unsplash.com" target="_blank" rel="noreferrer">
              {chunks}
            </a>
          ),
        })}
      </p>
    </footer>
  );
}
