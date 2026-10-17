# Next.js i18n article examples

Companion to `internationalization-in-nextjs.md` in the workspace root.

## Run

```bash
npm ci
npm run dev
```

Open `/en` or `/hr`. The source defaults to explicit locale prefixes.

`/en/client-demo` contains the independent client-only translation panel. Increase its counter, then change the panel's language: the counter remains unchanged and the surrounding server content retains its original language. The separate switcher above the panel changes the whole route.

## Hidden locale variant

In `src/i18n/routing.ts`, change `localePrefix` to `'never'`. Open `/` or `/client-demo`. The same route-level switcher changes the language while keeping the visible path unchanged.

Also update `generateMetadata` in the home page: remove the prefixed language alternatives and use the actual unprefixed canonical, or the metadata policy appropriate to a private application. The article explains why the public prefixed URLs are not suitable in this mode.

For production validation after edits:

```bash
npm run build
npm run start
```

Restart the production server after rebuilding. The source is restored to the prefixed variant; rebuild before using any generated build output left by validation.

## Scope

- Next.js 16.4.1, next-intl 4.14.9, React 19.3.0.
- TypeScript, Cache Components and Partial Prefetching enabled.
- The article's cookie-only and Payload snippets are alternative integration excerpts. They are not additional files to paste into this example.
- This example is intentionally unstyled and contains no CMS or database.
- Replace `example.com`, define your editorial/access policies, and verify dependency compatibility before adapting it to production.
