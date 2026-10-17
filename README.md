# Atelier — a Next.js internationalization app

A bilingual creative-workshop studio with a complete responsive website, Payload CMS, SQLite, workshop detail pages, booking requests and newsletter subscriptions. The local KB article is intentionally ignored by Git.

## Start locally

1. Install Node.js 22.13+ (Node 24 LTS recommended) and run npm ci.
2. Copy .env.example to .env. Set PAYLOAD_SECRET to a random secret of at least 32 characters. A local .env has already been generated in this checkout.
3. Run npm run generate:types and npm run generate:importmap.
4. Run npm run seed. This creates three workshops and studio content in English and Croatian. Re-running seed preserves existing content.
5. Run npm run dev, then open http://localhost:3000.
6. Open /admin and create the first administrator. No default password is shipped.

The SQLite database is created at atelier.db and is ignored by Git. Production requires a persistent database, generated migrations and appropriate hosting; a temporary serverless filesystem will not retain this local database.

## Rendering routes

Explore /workshops and /studio for request-rendered CMS content, /guide for a build-time generated page, and /planner for a client-only planner body. Each page includes an expandable rendering note. On /planner the global language selector changes preloaded messages in memory and preserves the plan without a server navigation. Other pages use App Router navigation for their translated server/prebuilt content. All visible URLs remain unprefixed by default. See docs/rendering-modes.md.

## Try the translations

The language selector updates UI messages, Payload workshop data, studio content, validation messages, page metadata and html lang through App Router navigation. By default the visible URL stays unchanged (localePrefix: never). A preference cookie remembers the choice.

To try explicit language URLs, set NEXT_PUBLIC_LOCALE_PREFIX=always in .env and restart the development server (or rebuild and restart production). Routes then use /en and /hr. The same switcher works in both modes.

Booking drafts are restored from sessionStorage after a route language change. Consent is deliberately not persisted. No personal data is put in localStorage or a public content cache. If the browser blocks sessionStorage, navigation can reset the form.

UI translations live in src/messages. Editorial translations live in Payload's Workshops collection and Studio global. In /admin, change the content locale between English and Hrvatski, edit a field, save, then refresh the website to see the change. Payload has its own independent admin interface language selector. The website lists only upcoming workshops with a complete translation in the selected language; missing translations never fall back silently.

## Forms and data

- BookingForm uses React Hook Form, Zod, shadcn input/button/textarea components and localized inline errors. Server Actions validate again, fetch the published workshop and calculate the total on the server.
- A booking is saved as requested, with a unique reference. It is not a payment or seat confirmation. Staff review availability and set confirmed/cancelled in the CMS. Requests for past workshops are rejected.
- A newsletter form validates email and explicit consent and saves to the private Subscribers collection. Repeated subscriptions return the same success response.
- Bookings, subscriber data and users are private through the public REST API. There is a honeypot and an email-based daily booking request limit. Public deployment still needs infrastructure rate limits/anti-abuse measures.
- This demo does not send email. Addresses ending in .example are illustrative. Connect an email provider and real contact details before publishing.

## Checks

- npm run typecheck
- npm run build
- npm run test:e2e (against a running app; defaults to port 3215, or set TEST_BASE_URL)

Run npm run seed before testing. Install the browser once with npx playwright install chromium. The test runner creates a temporary CMS account, verifies real saved records and removes its own account and submissions. See docs/dependency-audit.md for checked versions and compatibility decisions.

## Structure

- src/app/(site)/[locale]: website routes with a locale root layout
- src/app/(payload): Payload admin and REST routes with Payload's own root layout
- src/payload.config.ts: localized collections, private submissions and SQLite
- src/actions/bookings.ts: validated server-side writes
- src/components: responsive shell, filters and forms
- scripts/seed.ts: idempotent bilingual CMS seed

Cache Components are disabled at application level for the combined Payload/Next.js runtime. The application uses request-time locale/content resolution.
