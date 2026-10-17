"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Check } from "lucide-react";
import { subscribe } from "@/actions/bookings";
export function NewsletterForm() {
  const t = useTranslations("Newsletter");
  const locale = useLocale();
  const [done, setDone] = useState(false);
  const schema = z.object({
    email: z.email(t("invalid")),
    consent: z.boolean().refine(Boolean, t("consentError")),
  });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", consent: false },
  });
  if (done)
    return (
      <p className="newsletter-success" role="status">
        <Check size={18} aria-hidden />
        {t("success")}
      </p>
    );
  return (
    <form
      className="newsletter-form"
      noValidate
      onSubmit={form.handleSubmit(async (values) => {
        const result = await subscribe(values, locale);
        if (result.ok) setDone(true);
        else form.setError("root", { message: t("error") });
      })}
    >
      <label className="sr-only" htmlFor="newsletter-email">
        {t("email")}
      </label>
      <div className="newsletter-input">
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          placeholder={t("placeholder")}
          {...form.register("email")}
          aria-invalid={Boolean(form.formState.errors.email)}
          aria-describedby={
            form.formState.errors.email ? "newsletter-error" : undefined
          }
        />
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          aria-label={t("submit")}
        >
          <ArrowRight size={20} />
        </button>
      </div>
      {form.formState.errors.email && (
        <p id="newsletter-error" className="field-error">
          {form.formState.errors.email.message}
        </p>
      )}
      <label className="checkbox-label">
        <input
          type="checkbox"
          {...form.register("consent")}
          aria-describedby={
            form.formState.errors.consent
              ? "newsletter-consent-error"
              : undefined
          }
          aria-invalid={Boolean(form.formState.errors.consent)}
        />
        <span>{t("consent")}</span>
      </label>
      {form.formState.errors.consent && (
        <p id="newsletter-consent-error" className="field-error">
          {form.formState.errors.consent.message}
        </p>
      )}
      {form.formState.errors.root && (
        <p role="alert" className="field-error">
          {form.formState.errors.root.message}
        </p>
      )}
    </form>
  );
}
