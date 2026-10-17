"use client";
import { useFormatter, useTranslations } from "next-intl";
import { Code2, ChevronDown } from "lucide-react";
export function RenderingNote({
  mode,
  stamp,
}: {
  mode: "server" | "static" | "client";
  stamp?: string;
}) {
  const t = useTranslations("Rendering");
  const format = useFormatter();
  return (
    <details
      className={"rendering-note rendering-" + mode}
      data-rendering={mode}
    >
      <summary>
        <span className="rendering-badge">
          <Code2 size={13} aria-hidden />
          {t(mode + ".badge")}
        </span>
        <span>{t("summary")}</span>
        <ChevronDown size={14} aria-hidden />
      </summary>
      <div className="rendering-note-body">
        <p>{t(mode + ".description")}</p>
        {stamp && (
          <p className="rendering-time">
            {t(mode === "static" ? "builtAt" : "renderedAt")}{" "}
            <time dateTime={stamp}>
              {format.dateTime(new Date(stamp), {
                dateStyle: "medium",
                timeStyle: "medium",
                timeZone: "Europe/Zagreb",
              })}
            </time>
          </p>
        )}
        <p>{t("url")}</p>
      </div>
    </details>
  );
}
