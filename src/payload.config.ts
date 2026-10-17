import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig, type CollectionConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { en } from "@payloadcms/translations/languages/en";
import { ar } from "@payloadcms/translations/languages/ar";
import { hr } from "@payloadcms/translations/languages/hr";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const staff = ({ req }: { req: { user?: unknown } }) => Boolean(req.user);
const workshops: CollectionConfig = {
  slug: "workshops",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "date", "published"],
  },
  access: {
    read: ({ req }) => (req.user ? true : { published: { equals: true } }),
    create: staff,
    update: staff,
    delete: staff,
  },
  fields: [
    { name: "title", type: "text", localized: true, required: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "description", type: "textarea", localized: true, required: true },
    { name: "details", type: "textarea", localized: true, required: true },
    { name: "included", type: "textarea", localized: true, required: true },
    {
      name: "category",
      type: "select",
      options: ["clay", "paper", "textile"],
      required: true,
    },
    {
      name: "image",
      type: "text",
      required: true,
      admin: { description: "A local /images/... path or HTTPS photo URL." },
    },
    { name: "imageAlt", type: "text", localized: true, required: true },
    {
      name: "date",
      type: "date",
      required: true,
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
    { name: "duration", type: "number", required: true, min: 30 },
    { name: "price", type: "number", required: true, min: 0 },
    { name: "instructor", type: "text", required: true },
    { name: "level", type: "text", localized: true, required: true },
    { name: "published", type: "checkbox", defaultValue: false },
  ],
};
export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || "",
  admin: { user: "users", importMap: { baseDir: path.resolve(dirname) } },
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URL || "file:./atelier.db" },
  }),
  editor: lexicalEditor(),
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  localization: {
    locales: [
      { code: "en", label: "English" },
      { code: "hr", label: "Hrvatski" },
      { code: "ar", label: "العربية", rtl: true },
    ],
    defaultLocale: "en",
    fallback: false,
  },
  i18n: { fallbackLanguage: "en", supportedLanguages: { en, hr, ar } },
  collections: [
    {
      slug: "users",
      auth: true,
      admin: { useAsTitle: "email" },
      access: { read: staff, create: staff, update: staff, delete: staff },
      fields: [{ name: "name", type: "text" }],
    },
    workshops,
    {
      slug: "bookings",
      admin: {
        useAsTitle: "reference",
        defaultColumns: [
          "reference",
          "name",
          "workshop",
          "status",
          "createdAt",
        ],
      },
      access: { read: staff, create: staff, update: staff, delete: staff },
      fields: [
        { name: "reference", type: "text", required: true, unique: true },
        { name: "name", type: "text", required: true },
        { name: "email", type: "email", required: true },
        {
          name: "workshop",
          type: "relationship",
          relationTo: "workshops",
          required: true,
        },
        { name: "guests", type: "number", min: 1, max: 4, required: true },
        { name: "note", type: "textarea" },
        {
          name: "locale",
          type: "select",
          options: ["en", "hr", "ar"],
          required: true,
        },
        { name: "consent", type: "checkbox", required: true },
        {
          name: "total",
          type: "number",
          required: true,
          admin: { readOnly: true },
        },
        {
          name: "status",
          type: "select",
          options: ["requested", "confirmed", "cancelled"],
          defaultValue: "requested",
          required: true,
        },
      ],
    },
    {
      slug: "subscribers",
      admin: { useAsTitle: "email" },
      access: { read: staff, create: staff, update: staff, delete: staff },
      fields: [
        { name: "email", type: "email", required: true, unique: true },
        {
          name: "locale",
          type: "select",
          options: ["en", "hr", "ar"],
          required: true,
        },
        { name: "consent", type: "checkbox", required: true },
      ],
    },
  ],
  globals: [
    {
      slug: "studio",
      access: { read: () => true, update: staff },
      fields: [
        { name: "eyebrow", type: "text", localized: true, required: true },
        {
          name: "heroTitle",
          type: "textarea",
          localized: true,
          required: true,
        },
        {
          name: "heroDescription",
          type: "textarea",
          localized: true,
          required: true,
        },
        { name: "storyTitle", type: "text", localized: true, required: true },
        { name: "story", type: "textarea", localized: true, required: true },
        { name: "address", type: "text", required: true },
        { name: "email", type: "email", required: true },
      ],
    },
  ],
});
