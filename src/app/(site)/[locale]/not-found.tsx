import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
export default async function NotFound() {
  const t = await getTranslations("NotFound");
  return (
    <div className="empty-state not-found">
      <span className="eyebrow">404</span>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
      <Link className="button button-dark" href="/">
        {t("back")}
      </Link>
    </div>
  );
}
