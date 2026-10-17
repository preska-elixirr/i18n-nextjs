import { getPayload } from "payload";
import config from "../src/payload.config";
import data from "./seed-data.json";
async function seed() {
  const payload = await getPayload({ config });
  for (const record of data.workshops) {
    const existing = await payload.find({
      collection: "workshops",
      where: { slug: { equals: record.slug } },
      limit: 1,
    });
    if (existing.docs.length) {
      console.log("Kept existing workshop: " + record.slug);
      continue;
    }
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + record.days);
    date.setUTCHours(9, 0, 0, 0);
    const doc = await payload.create({
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
    await payload.update({
      collection: "workshops",
      id: doc.id,
      locale: "hr",
      data: record.hr,
    });
    console.log("Seeded EN + HR: " + record.slug);
  }
  const current = await payload.findGlobal({ slug: "studio", locale: "en" });
  if (!current.heroTitle) {
    for (const locale of ["en", "hr"] as const)
      await payload.updateGlobal({
        slug: "studio",
        locale,
        data: {
          ...data.studio[locale],
          address: "Martićeva 14, Zagreb",
          email: "hello@atelier.example",
        },
      });
    console.log("Seeded studio content in both languages.");
  }
  console.log("Ready. Visit /admin to create your first administrator.");
  await payload.destroy();
}
seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
