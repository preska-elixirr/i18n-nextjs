"use client";
import { useEffect, useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Leaf,
  Paintbrush,
  Scissors,
  Minus,
  Plus,
  Download,
  Check,
  Lightbulb,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RenderingNote } from "./rendering-note";
type Craft = "clay" | "paper" | "textile";
const crafts = [
  { key: "clay" as const, price: 18, Icon: Leaf },
  { key: "paper" as const, price: 12, Icon: Paintbrush },
  { key: "textile" as const, price: 15, Icon: Scissors },
];
export default function WorkshopPlanner() {
  const t = useTranslations("Planner");
  const locale = useLocale();
  const id = useId();
  const [craft, setCraft] = useState<Craft>("clay");
  const [people, setPeople] = useState(2);
  const [name, setName] = useState("");
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("atelier-plan-v1");
      if (raw) {
        const plan = JSON.parse(raw);
        if (crafts.some((item) => item.key === plan.craft))
          setCraft(plan.craft);
        if (
          Number.isInteger(plan.people) &&
          plan.people >= 1 &&
          plan.people <= 8
        )
          setPeople(plan.people);
        if (typeof plan.name === "string") setName(plan.name.slice(0, 80));
      }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(
        "atelier-plan-v1",
        JSON.stringify({ craft, people, name }),
      );
    } catch {}
  }, [craft, people, name, ready]);
  const current = crafts.find((item) => item.key === craft)!;
  const money = (amount: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
  function download() {
    const text = [
      name || t("defaultName"),
      t("crafts." + craft + ".title"),
      t("peopleCount", { count: people }),
      t("estimate") + ": " + money(current.price * people),
      "",
      t("estimateHint"),
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "atelier-plan.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setSaved(true);
  }
  return (
    <div className="container planner-page" data-client-planner>
      <div className="route-intro">
        <span className="eyebrow">{t("eyebrow")}</span>
        <h1>{t("title")}</h1>
        <p>{t("intro")}</p>
        <RenderingNote mode="client" />
      </div>
      <div className="planner-grid">
        <section className="planner-controls">
          <span className="eyebrow">01 / {t("chooseCraft")}</span>
          <div
            className="craft-choices"
            role="group"
            aria-label={t("chooseCraft")}
          >
            {crafts.map(({ key, Icon }) => (
              <button
                type="button"
                key={key}
                className={
                  craft === key ? "craft-choice selected" : "craft-choice"
                }
                aria-pressed={craft === key}
                onClick={() => {
                  setCraft(key);
                  setSaved(false);
                }}
              >
                <Icon size={23} aria-hidden />
                <span>{t("crafts." + key + ".title")}</span>
                {craft === key && (
                  <Check size={15} className="craft-check" aria-hidden />
                )}
              </button>
            ))}
          </div>
          <div className="planner-field">
            <label htmlFor={id}>{t("projectName")}</label>
            <Input
              id={id}
              dir="auto"
              value={name}
              maxLength={80}
              placeholder={t("namePlaceholder")}
              onChange={(event) => {
                setName(event.target.value);
                setSaved(false);
              }}
            />
          </div>
          <div className="planner-people">
            <div>
              <h2>{t("who")}</h2>
              <p>{t("peopleHint")}</p>
            </div>
            <div className="stepper">
              <button
                type="button"
                aria-label={t("fewer")}
                disabled={people <= 1}
                onClick={() => {
                  setPeople((value) => value - 1);
                  setSaved(false);
                }}
              >
                <Minus size={17} />
              </button>
              <output aria-label={t("people")} data-planner-count>
                {new Intl.NumberFormat(locale).format(people)}
              </output>
              <button
                type="button"
                aria-label={t("more")}
                disabled={people >= 8}
                onClick={() => {
                  setPeople((value) => value + 1);
                  setSaved(false);
                }}
              >
                <Plus size={17} />
              </button>
            </div>
          </div>
          <p className="planner-tip">
            <Lightbulb size={18} aria-hidden />
            {t("tip")}
          </p>
        </section>
        <aside className="plan-preview">
          <span className="eyebrow">02 / {t("yourPlan")}</span>
          <div className="plan-preview-icon">
            <current.Icon size={35} aria-hidden />
          </div>
          <h2>
            <bdi>{name || t("defaultName")}</bdi>
          </h2>
          <p>{t("crafts." + craft + ".description")}</p>
          <div className="plan-kit">
            <span>{t("kitIncludes")}</span>
            <ul>
              {["one", "two", "three"].map((item) => (
                <li key={item}>
                  <Check size={14} aria-hidden />
                  {t("crafts." + craft + "." + item)}
                </li>
              ))}
            </ul>
          </div>
          <div className="plan-calculation">
            <span>
              {money(current.price)} × {t("peopleCount", { count: people })}
            </span>
            <strong>{money(current.price * people)}</strong>
          </div>
          <p className="plan-estimate-label">{t("estimateHint")}</p>
          <Button className="download-plan" onClick={download}>
            <Download size={16} aria-hidden />
            {t("download")}
          </Button>
          <span className="plan-save-status" role="status">
            {saved ? t("downloaded") : t("localHint")}
          </span>
        </aside>
      </div>
    </div>
  );
}
