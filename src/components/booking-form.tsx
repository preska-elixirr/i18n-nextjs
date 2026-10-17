"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, Check, LoaderCircle, ShieldCheck } from "lucide-react";
import { bookingSchema, type BookingInput } from "@/lib/booking-schema";
import { requestBooking } from "@/actions/bookings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
type Choice = { id: number; title: string; price: number };
const draftKey = "atelier-booking-draft-v1";
export function BookingForm({
  workshops,
  selected,
}: {
  workshops: Choice[];
  selected?: number;
}) {
  const t = useTranslations("Booking");
  const errors = useTranslations("Validation");
  const locale = useLocale();
  const [ready, setReady] = useState(false);
  const [reference, setReference] = useState("");
  const [failure, setFailure] = useState("");
  const form = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema((key) => errors(key))),
    mode: "onTouched",
    defaultValues: {
      workshop: selected ? String(selected) : "",
      name: "",
      email: "",
      guests: 1,
      note: "",
      consent: false,
      website: "",
    },
  });
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(draftKey);
      if (saved) {
        const draft = JSON.parse(saved);
        form.reset({
          ...form.getValues(),
          ...draft,
          ...(selected ? { workshop: String(selected) } : {}),
          consent: false,
          website: "",
        });
      }
    } catch {
      /* Storage may be unavailable. */
    }
    setReady(true);
  }, [form, selected]);
  useEffect(() => {
    if (!ready) return;
    const subscription = form.watch((value) => {
      try {
        sessionStorage.setItem(
          draftKey,
          JSON.stringify({ ...value, consent: false }),
        );
      } catch {
        /* Storage is optional. */
      }
    });
    return () => subscription.unsubscribe();
  }, [form, ready]);
  // Re-resolve displayed error messages after an in-place provider locale change.
  useEffect(() => {
    form.setValue("consent", false);
    if (form.formState.isSubmitted) void form.trigger();
  }, [locale, form]);
  const chosen = workshops.find(
    (workshop) => String(workshop.id) === form.watch("workshop"),
  );
  const total = (chosen?.price ?? 0) * (Number(form.watch("guests")) || 1);
  const fieldError = (name: keyof BookingInput) =>
    form.formState.errors[name] ? (
      <p className="field-error" id={name + "-error"}>
        {form.formState.errors[name]?.message}
      </p>
    ) : null;
  if (reference)
    return (
      <div className="booking-success" role="status">
        <span className="success-icon">
          <Check size={30} aria-hidden />
        </span>
        <span className="eyebrow">{t("successLabel")}</span>
        <h3>{t("success")}</h3>
        <p>{t("successDescription")}</p>
        <code dir="ltr">{reference}</code>
        <Button
          variant="outline"
          onClick={() => {
            setReference("");
            form.reset();
          }}
        >
          {t("another")}
        </Button>
      </div>
    );
  return (
    <form
      className="booking-form"
      noValidate
      onSubmit={form.handleSubmit(async (values) => {
        setFailure("");
        const result = await requestBooking(values, locale);
        if ("reference" in result && result.reference) {
          setReference(result.reference);
          try {
            sessionStorage.removeItem(draftKey);
          } catch {}
          form.reset();
        } else setFailure(t("errors." + (result.error || "server")));
      })}
    >
      <div className="form-heading">
        <span className="step-number">01</span>
        <div>
          <h3>{t("choose")}</h3>
          <p>{t("chooseHint")}</p>
        </div>
      </div>
      <div className="field">
        <label htmlFor="workshop">{t("workshop")}</label>
        <select
          id="workshop"
          {...form.register("workshop")}
          aria-invalid={Boolean(form.formState.errors.workshop)}
          aria-describedby={
            form.formState.errors.workshop ? "workshop-error" : undefined
          }
        >
          <option value="">{t("selectWorkshop")}</option>
          {workshops.map((workshop) => (
            <option key={workshop.id} value={workshop.id}>
              {workshop.title}
            </option>
          ))}
        </select>
        {fieldError("workshop")}
      </div>
      <div className="form-heading second">
        <span className="step-number">02</span>
        <div>
          <h3>{t("details")}</h3>
          <p>{t("detailsHint")}</p>
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor="name">{t("name")}</label>
          <Input
            id="name"
            dir="auto"
            autoComplete="name"
            placeholder={t("namePlaceholder")}
            {...form.register("name")}
            aria-invalid={Boolean(form.formState.errors.name)}
            aria-describedby={
              form.formState.errors.name ? "name-error" : undefined
            }
          />
          {fieldError("name")}
        </div>
        <div className="field">
          <label htmlFor="email">{t("email")}</label>
          <Input
            id="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            placeholder="you@example.com"
            {...form.register("email")}
            aria-invalid={Boolean(form.formState.errors.email)}
            aria-describedby={
              form.formState.errors.email ? "email-error" : undefined
            }
          />
          {fieldError("email")}
        </div>
      </div>
      <div className="form-row guests-row">
        <div className="field">
          <label htmlFor="guests">{t("guests")}</label>
          <select
            id="guests"
            {...form.register("guests", { valueAsNumber: true })}
            aria-invalid={Boolean(form.formState.errors.guests)}
            aria-describedby={
              form.formState.errors.guests ? "guests-error" : undefined
            }
          >
            {[1, 2, 3, 4].map((number) => (
              <option key={number} value={number}>
                {t("people", { count: number })}
              </option>
            ))}
          </select>
          {fieldError("guests")}
        </div>
        <p className="small-note">{t("groupHint")}</p>
      </div>
      <div className="field">
        <label htmlFor="note">
          {t("note")} <span>{t("optional")}</span>
        </label>
        <Textarea
          id="note"
          dir="auto"
          rows={3}
          placeholder={t("notePlaceholder")}
          maxLength={1000}
          {...form.register("note")}
          aria-invalid={Boolean(form.formState.errors.note)}
          aria-describedby={
            form.formState.errors.note ? "note-error" : undefined
          }
        />
        {fieldError("note")}
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          tabIndex={-1}
          autoComplete="off"
          {...form.register("website")}
        />
      </div>
      <div className="field">
        <label className="checkbox-label">
          <input
            type="checkbox"
            {...form.register("consent")}
            aria-invalid={Boolean(form.formState.errors.consent)}
            aria-describedby={
              form.formState.errors.consent ? "consent-error" : undefined
            }
          />
          <span>{t("consent")}</span>
        </label>
        {fieldError("consent")}
      </div>
      {failure && (
        <p className="form-error" role="alert">
          {failure}
        </p>
      )}
      <div className="booking-total">
        <span>{t("total")}</span>
        <strong>
          {new Intl.NumberFormat(locale, {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
          }).format(total)}
        </strong>
      </div>
      <Button
        type="submit"
        className="booking-submit"
        disabled={form.formState.isSubmitting || !ready}
      >
        {form.formState.isSubmitting ? (
          <>
            <LoaderCircle className="spin" size={17} />
            {t("sending")}
          </>
        ) : (
          <>
            {t("submit")}
            <ArrowUpRight size={18} aria-hidden />
          </>
        )}
      </Button>
      <p className="secure-note">
        <ShieldCheck size={14} aria-hidden />
        {t("paymentHint")}
      </p>
    </form>
  );
}
