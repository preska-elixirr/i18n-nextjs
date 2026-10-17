"use client";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
function LoadingPlanner() {
  const t = useTranslations("Planner");
  return (
    <div className="container planner-loading" role="status">
      <span className="eyebrow">{t("eyebrow")}</span>
      <p>{t("loading")}</p>
      <div className="skeleton skeleton-hero" />
    </div>
  );
}
const Planner = dynamic(() => import("./workshop-planner"), {
  ssr: false,
  loading: LoadingPlanner,
});
export function PlannerLoader() {
  return <Planner />;
}
