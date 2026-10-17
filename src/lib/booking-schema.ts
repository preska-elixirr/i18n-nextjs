import { z } from "zod";
export function bookingSchema(message: (key: string) => string) {
  return z.object({
    workshop: z.string().min(1, message("workshop")),
    name: z.string().trim().min(2, message("name")).max(100, message("name")),
    email: z.email(message("email")).max(254, message("email")),
    guests: z
      .number()
      .int()
      .min(1, message("guests"))
      .max(4, message("guests")),
    note: z.string().trim().max(1000, message("note")),
    consent: z.boolean().refine((value) => value, message("consent")),
    website: z.string().max(0),
  });
}
export type BookingInput = z.infer<ReturnType<typeof bookingSchema>>;
export const newsletterSchema = z.object({
  email: z.email().max(254),
  consent: z.literal(true),
});
