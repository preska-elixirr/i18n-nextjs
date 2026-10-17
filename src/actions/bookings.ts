"use server";
import { isSupportedLocale } from "@/i18n/locales";
import { randomUUID } from "node:crypto";
import { getCMS } from "@/lib/content";
import { bookingSchema, newsletterSchema } from "@/lib/booking-schema";
import type { BookingInput } from "@/lib/booking-schema";

export async function requestBooking(input: BookingInput, locale: string) {
  if (!isSupportedLocale(locale)) return { error: "invalid" as const };
  const parsed = bookingSchema((key) => key).safeParse(input);
  if (!parsed.success) return { error: "invalid" as const };
  const data = parsed.data;
  try {
    const payload = await getCMS();
    const workshops = await payload.find({
      collection: "workshops",
      overrideAccess: false,
      locale,
      limit: 1,
      where: {
        and: [
          { id: { equals: data.workshop } },
          { published: { equals: true } },
        ],
      },
    });
    const workshop = workshops.docs[0];
    if (!workshop || new Date(workshop.date) <= new Date())
      return { error: "unavailable" as const };
    // A request is not a seat confirmation. Staff review availability in the CMS.
    const recent = await payload.count({
      collection: "bookings",
      where: {
        and: [
          { email: { equals: data.email.toLowerCase() } },
          {
            createdAt: {
              greater_than: new Date(Date.now() - 86400000).toISOString(),
            },
          },
        ],
      },
    });
    if (recent.totalDocs >= 5) return { error: "limit" as const };
    const reference = "AT-" + randomUUID().slice(0, 8).toUpperCase();
    await payload.create({
      collection: "bookings",
      overrideAccess: true,
      data: {
        reference,
        name: data.name,
        email: data.email.toLowerCase(),
        workshop: workshop.id,
        guests: data.guests,
        note: data.note,
        locale,
        consent: data.consent,
        total: workshop.price * data.guests,
        status: "requested",
      },
    });
    return { reference };
  } catch (error) {
    console.error("Booking request failed", error);
    return { error: "server" as const };
  }
}
export async function subscribe(input: unknown, locale: string) {
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success || !isSupportedLocale(locale)) return { ok: false };
  try {
    const payload = await getCMS();
    const email = parsed.data.email.toLowerCase();
    const existing = await payload.count({
      collection: "subscribers",
      where: { email: { equals: email } },
    });
    if (!existing.totalDocs)
      await payload.create({
        collection: "subscribers",
        data: { email, locale, consent: true },
      });
    return { ok: true };
  } catch (error) {
    console.error("Newsletter subscription failed", error);
    return { ok: false };
  }
}
