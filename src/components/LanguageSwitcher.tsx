"use client";
import { useTransition } from "react";
import { hasLocale, useLocale, useTranslations } from "next-intl";
import { Select } from "radix-ui";
import { Check, ChevronDown, Globe2, LoaderCircle } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useClientLocale } from "./site-locale-provider";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const router = useRouter();
  const [pending, transition] = useTransition();
  const clientLocale = useClientLocale();
  function change(next: string) {
    if (next === locale || !hasLocale(routing.locales, next)) return;
    if (clientLocale.inMemory) {
      clientLocale.change(next);
      return;
    }
    transition(() =>
      router.replace(pathname + window.location.search + window.location.hash, {
        locale: next,
        scroll: false,
      }),
    );
  }
  return (
    <div className="locale-select">
      <Select.Root value={locale} onValueChange={change} disabled={pending}>
        <Select.Trigger className="locale-trigger" aria-label={t("language")}>
          <Globe2 size={16} aria-hidden />
          <span>{locale.toUpperCase()}</span>
          <Select.Icon asChild>
            {pending ? (
              <LoaderCircle size={14} className="spin" aria-hidden />
            ) : (
              <ChevronDown size={13} aria-hidden />
            )}
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            className="locale-menu"
            position="popper"
            align="end"
            sideOffset={8}
            collisionPadding={12}
          >
            <Select.Viewport>
              <Select.Group>
                <Select.Label className="locale-menu-label">
                  {t("language")}
                </Select.Label>
                {[
                  { code: "en", name: "English" },
                  { code: "hr", name: "Hrvatski" },
                ].map((item) => (
                  <Select.Item
                    className="locale-option"
                    value={item.code}
                    key={item.code}
                  >
                    <span className="locale-code" aria-hidden>
                      {item.code.toUpperCase()}
                    </span>
                    <Select.ItemText>
                      <span lang={item.code}>{item.name}</span>
                    </Select.ItemText>
                    <Select.ItemIndicator className="locale-check">
                      <Check size={16} aria-hidden />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      <span className="sr-only" role="status">
        {pending ? t("switching") : ""}
      </span>
    </div>
  );
}
