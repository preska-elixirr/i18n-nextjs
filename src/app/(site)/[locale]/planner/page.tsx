import { getTranslations } from "next-intl/server";
import { PlannerLoader } from "@/components/planner-loader";
export const dynamic = "force-static";
export const revalidate = false;
export async function generateMetadata() {
  const t = await getTranslations("Planner");
  return { title: t("metaTitle"), description: t("intro") };
}
export default function PlannerPage() {
  return <PlannerLoader />;
}
