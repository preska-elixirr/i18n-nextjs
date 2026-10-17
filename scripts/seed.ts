import { getPayload } from "payload";
import config from "../src/payload.config";
import data from "./seed-data.json";
import { supportedLocales } from "../src/i18n/locales";
async function seed() {
  const payload = await getPayload({ config });
  for (const record of data.workshops) {
    const existing = await payload.find({
      collection: "workshops",
      where: { slug: { equals: record.slug } },
      limit: 1,
    });
    let doc = existing.docs[0];
    if (!doc) {
      const date = new Date();
      date.setUTCDate(date.getUTCDate() + record.days);
      date.setUTCHours(9, 0, 0, 0);
      doc = await payload.create({
        collection: "workshops",
        locale: "en",
        data: {
          ...record.en,
          slug: record.slug,
          category: record.category as "clay" | "paper" | "textile",
          image: record.image,
          duration: record.duration,
          price: record.price,
          instructor: record.instructor,
          date: date.toISOString(),
          published: true,
        },
      });
    }
    for (const locale of supportedLocales) {
      const current = await payload.findByID({
        collection: "workshops",
        id: doc.id,
        locale,
        fallbackLocale: false,
      });
      const missing = Object.fromEntries(
        Object.entries(record[locale]).filter(
          ([key]) => !current[key as keyof typeof current],
        ),
      );
      if (Object.keys(missing).length)
        await payload.update({
          collection: "workshops",
          id: doc.id,
          locale,
          data: missing,
        });
    }
    console.log("Checked missing EN / HR / AR translations: " + record.slug);
  }
  for (const locale of supportedLocales) {
    const current = await payload.findGlobal({
      slug: "studio",
      locale,
      fallbackLocale: false,
    });
    const source = {
      ...data.studio[locale],
      address: "Martićeva 14, Zagreb",
      email: "hello@atelier.example",
    };
    const missing = Object.fromEntries(
      Object.entries(source).filter(
        ([key]) => !current[key as keyof typeof current],
      ),
    );
    if (Object.keys(missing).length)
      await payload.updateGlobal({ slug: "studio", locale, data: missing });
  }
  console.log(
    "Ready. Existing content and administrator accounts were preserved.",
  );
  await payload.destroy();
}
seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
