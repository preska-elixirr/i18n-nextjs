import fs from "node:fs";
import { randomBytes } from "node:crypto";
import { getPayload } from "payload";
import config from "../src/payload.config";
const payload = await getPayload({ config });
const file = "node_modules/.atelier-test-fixture.json";
if (process.argv.includes("--cleanup")) {
  if (fs.existsSync(file)) {
    const fixture = JSON.parse(fs.readFileSync(file, "utf8"));
    const bookings = await payload.find({
      collection: "bookings",
      where: {
        email: { in: [fixture.email, fixture.email.replace("@", "-rtl@")] },
      },
    });
    const subscribers = await payload.find({
      collection: "subscribers",
      where: {
        email: { in: [fixture.email, fixture.email.replace("@", "-rtl@")] },
      },
    });
    console.log(
      JSON.stringify({
        savedBookings: bookings.totalDocs,
        savedSubscribers: subscribers.totalDocs,
        requestStatus: bookings.docs[0]?.status,
        serverCalculatedTotal: bookings.docs[0]?.total,
      }),
    );
    const valid =
      bookings.totalDocs === 2 &&
      subscribers.totalDocs === 2 &&
      bookings.docs.every(
        (doc) => doc.total === 130 && doc.status === "requested",
      ) &&
      bookings.docs.some((doc) => doc.locale === "ar") &&
      subscribers.docs.some((doc) => doc.locale === "ar");
    await payload.delete({
      collection: "bookings",
      where: {
        email: { in: [fixture.email, fixture.email.replace("@", "-rtl@")] },
      },
    });
    await payload.delete({
      collection: "subscribers",
      where: {
        email: { in: [fixture.email, fixture.email.replace("@", "-rtl@")] },
      },
    });
    await payload.delete({ collection: "users", id: fixture.userId });
    fs.unlinkSync(file);
    if (!valid) process.exitCode = 1;
  }
} else {
  const email = "e2e-" + Date.now() + "@atelier.example";
  const password = randomBytes(24).toString("base64url");
  const user = await payload.create({
    collection: "users",
    data: { email, password, name: "Temporary test administrator" },
  });
  fs.writeFileSync(file, JSON.stringify({ email, password, userId: user.id }));
  console.log(
    "Created a temporary test account; credentials are kept in ignored node_modules.",
  );
}
await payload.destroy();
