import fs from "node:fs";
import { test, expect, type Page } from "@playwright/test";
async function chooseLanguage(page: Page, locale: "en" | "hr") {
  await page.getByRole("combobox", { name: /^(Language|Jezik)$/ }).click();
  await page
    .getByRole("option", {
      name: locale === "en" ? "English" : "Hrvatski",
      exact: true,
    })
    .click();
}
const fixture = JSON.parse(
  fs.readFileSync("node_modules/.atelier-test-fixture.json", "utf8"),
) as { email: string; password: string };

test("hidden locale changes CMS content and html language without a new document", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "A little time.",
  );
  const timeOrigin = await page.evaluate(() => performance.timeOrigin);
  await page.getByLabel("Full name", { exact: true }).fill("Demo Maker");
  await page
    .getByLabel("Email address", { exact: true })
    .first()
    .fill(fixture.email);
  await chooseLanguage(page, "hr");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Malo vremena.",
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "hr");
  expect(new URL(page.url()).pathname).toBe("/");
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(timeOrigin);
  await expect(page.locator(".workshop-card").first()).toContainText(
    "Nedjelja uz keramiku",
  );
  await expect(page.getByLabel("Ime i prezime", { exact: true })).toHaveValue(
    "Demo Maker",
  );
  await expect(page).toHaveTitle(/Kreativne radionice/);
});

test("filters, search and localized detail pages use published CMS workshops", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".workshop-card")).toHaveCount(3);
  await page
    .getByRole("button", { name: "Clay & ceramics", exact: true })
    .click();
  await expect(page.locator(".workshop-card")).toHaveCount(1);
  await page
    .getByLabel("Find a workshop", { exact: true })
    .fill("not-a-real-workshop");
  await expect(page.getByText("Nothing here just yet.")).toBeVisible();
  await page.getByRole("button", { name: "Show all workshops" }).click();
  await expect(page.locator(".workshop-card")).toHaveCount(3);
  await page.locator(".workshop-card h3 a").first().click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Slow Sunday ceramics",
  );
  await expect(page.locator(".included-list li")).toHaveCount(4);
  await chooseLanguage(page, "hr");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Nedjelja uz keramiku",
  );
  expect(new URL(page.url()).pathname).toBe("/workshops/slow-sunday-ceramics");
});

test("booking validates in both languages and persists a server-priced request", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Request your place", exact: true })
    .click();
  await expect(
    page.getByText("Please choose a workshop.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Please enter a valid email address.", { exact: true }),
  ).toBeVisible();
  await chooseLanguage(page, "hr");
  await page
    .getByRole("button", { name: "Pošaljite prijavu", exact: true })
    .click();
  await expect(
    page.getByText("Odaberite radionicu.", { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Radionica", { exact: true })
    .selectOption({ label: "Nedjelja uz keramiku" });
  await page
    .getByLabel("Ime i prezime", { exact: true })
    .fill("Integration Test");
  await page
    .getByLabel("E-adresa", { exact: true })
    .first()
    .fill(fixture.email);
  await page.getByLabel("Broj mjesta", { exact: true }).selectOption("2");
  await page
    .getByLabel("Trebamo li još nešto znati?", { exact: false })
    .fill("Automated integration test.");
  await page
    .getByLabel(
      "Pristajem da studio koristi moje podatke za obradu ove prijave.",
      { exact: true },
    )
    .check();
  await page
    .getByRole("button", { name: "Pošaljite prijavu", exact: true })
    .click();
  await expect(
    page.getByText("Vaša je prijava stigla.", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".booking-success code")).toHaveText(
    /^AT-[A-F0-9]{8}$/,
  );
});

test("newsletter requires consent, saves and handles a duplicate consistently", async ({
  page,
}) => {
  await page.goto("/");
  const form = page.locator(".newsletter-form");
  await form.getByLabel("Email address", { exact: true }).fill(fixture.email);
  await form.getByRole("button", { name: "Subscribe to studio news" }).click();
  await expect(
    page.getByText("Please agree to receive studio news.", { exact: true }),
  ).toBeVisible();
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: "Subscribe to studio news" }).click();
  await expect(page.locator(".newsletter-success")).toBeVisible();
  await page.reload();
  await page
    .locator(".newsletter-form")
    .getByLabel("Email address", { exact: true })
    .fill(fixture.email);
  await page.locator(".newsletter-form").getByRole("checkbox").check();
  await page.getByRole("button", { name: "Subscribe to studio news" }).click();
  await expect(page.locator(".newsletter-success")).toBeVisible();
});

test("CMS serves translations and protects submissions; admin works", async ({
  page,
}) => {
  const publicBookings = await page.request.get("/api/bookings");
  expect([401, 403]).toContain(publicBookings.status());
  const english = await page.request.get(
    "/api/workshops?locale=en&fallback-locale=none",
  );
  const croatian = await page.request.get(
    "/api/workshops?locale=hr&fallback-locale=none",
  );
  expect(english.ok()).toBeTruthy();
  expect(croatian.ok()).toBeTruthy();
  expect(
    (await english.json()).docs.map((doc: { title: string }) => doc.title),
  ).toContain("Slow Sunday ceramics");
  expect(
    (await croatian.json()).docs.map((doc: { title: string }) => doc.title),
  ).toContain("Nedjelja uz keramiku");
  const login = await page.request.post("/api/users/login", {
    data: { email: fixture.email, password: fixture.password },
  });
  expect(login.ok()).toBeTruthy();
  await page.goto("/admin");
  await expect(
    page.getByRole("link", { name: "Workshops", exact: true }).first(),
  ).toBeVisible();
  await page.goto("/admin/collections/workshops");
  await expect(
    page.getByText("Slow Sunday ceramics", { exact: true }).first(),
  ).toBeVisible();
  const hrContent = await page.request.get(
    "/api/workshops?locale=hr&where[slug][equals]=slow-sunday-ceramics",
  );
  const record = (await hrContent.json()).docs[0];
  const changedTitle = record.title + " — CMS test";
  try {
    const updated = await page.request.patch(
      "/api/workshops/" + record.id + "?locale=hr",
      { data: { title: changedTitle } },
    );
    expect(updated.ok()).toBeTruthy();
    await page
      .context()
      .addCookies([
        { name: "NEXT_LOCALE", value: "hr", url: new URL(page.url()).origin },
      ]);
    await page.goto("/workshops/slow-sunday-ceramics");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      changedTitle,
    );
  } finally {
    await page.request.patch("/api/workshops/" + record.id + "?locale=hr", {
      data: { title: record.title },
    });
  }
  const privateBookings = await page.request.get("/api/bookings");
  expect(privateBookings.ok()).toBeTruthy();
});

test("mobile navigation and layouts work without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBeFalsy();
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.locator("#mobile-nav")).toBeVisible();
  await page
    .locator("#mobile-nav")
    .getByRole("link", { name: "Workshops", exact: true })
    .click();
  await expect(page.locator("#mobile-nav")).toHaveCount(0);
  await page.screenshot({
    path: "test-results/atelier-mobile.png",
    fullPage: true,
  });
});

test("desktop has no broken images or browser runtime errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.goto("/");
  await page.locator(".site-footer").scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    Array.from(document.images).every((image) => image.complete),
  );
  expect(
    await page
      .locator("img")
      .evaluateAll((images) =>
        images.every((image) => (image as HTMLImageElement).naturalWidth > 0),
      ),
  ).toBeTruthy();
  expect(errors).toEqual([]);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/atelier-desktop.png",
    fullPage: true,
  });
});

test("production output includes real SSG routes and request-rendered CMS routes", async ({
  request,
}) => {
  const manifest = JSON.parse(
    fs.readFileSync(".next/prerender-manifest.json", "utf8"),
  );
  for (const route of ["/en/guide", "/hr/guide", "/en/planner", "/hr/planner"])
    expect(manifest.routes[route]).toBeDefined();
  expect(manifest.routes["/en/studio"]).toBeUndefined();
  expect(manifest.routes["/en/workshops"]).toBeUndefined();
  const guide = await request.get("/guide");
  expect(guide.ok()).toBeTruthy();
  expect(await guide.text()).toMatch(/<h1[^>]*>Made by you\./);
  const planner = await request.get("/planner");
  const plannerHTML = await planner.text();
  expect(planner.ok()).toBeTruthy();
  expect(plannerHTML).toContain("Opening your creative planner");
  expect(plannerHTML).not.toContain("data-client-planner");
});

test("client-only planner switches global language in memory and preserves its plan", async ({
  page,
}) => {
  await page.goto("/planner");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "An afternoon,\nyour way.",
  );
  await page
    .getByLabel("Give your project a name", { exact: true })
    .fill("Weekend kitchen");
  await page
    .getByRole("button", { name: "A little paper", exact: true })
    .click();
  await page
    .getByRole("button", { name: "One more person", exact: true })
    .click();
  await page
    .getByRole("button", { name: "One more person", exact: true })
    .click();
  await expect(page.locator("[data-planner-count]")).toHaveText("4");
  await page.waitForLoadState("networkidle");
  const timeOrigin = await page.evaluate(() => performance.timeOrigin);
  const serverRequests: string[] = [];
  page.on("request", (request) => {
    if (
      request.url().startsWith(new URL(page.url()).origin) &&
      ["fetch", "xhr", "document"].includes(request.resourceType())
    )
      serverRequests.push(request.url());
  });
  await chooseLanguage(page, "hr");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Poslijepodne\npo vašoj mjeri.",
  );
  await expect(
    page.getByLabel("Dajte ime svom projektu", { exact: true }),
  ).toHaveValue("Weekend kitchen");
  await expect(page.locator("[data-planner-count]")).toHaveText("4");
  await expect(
    page.getByRole("button", { name: "Malo papira", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("html")).toHaveAttribute("lang", "hr");
  await expect(page).toHaveTitle("Planer kreativnog poslijepodneva | Atelier");
  expect(new URL(page.url()).pathname).toBe("/planner");
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(timeOrigin);
  await page.waitForTimeout(250);
  expect(serverRequests).toEqual([]);
  await page.screenshot({
    path: "test-results/atelier-planner-desktop.png",
    fullPage: true,
  });
  await page
    .locator(".desktop-nav")
    .getByRole("link", { name: "Radionice", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Pronađite svoju sljedeću malu avanturu.",
  );
  await expect(page.locator(".workshop-card").first()).toContainText(
    "Nedjelja uz keramiku",
  );
});

test("language picker supports keyboard selection and Escape on an SSG route", async ({
  page,
}) => {
  await page.goto("/guide");
  const trigger = page.getByRole("combobox", { name: "Language", exact: true });
  await trigger.focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.screenshot({ path: "test-results/atelier-language-menu.png" });
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("option", { name: "Hrvatski", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("lang", "hr");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Vaših ruku djelo.\nZa godine koje dolaze.",
  );
  expect(new URL(page.url()).pathname).toBe("/guide");
  const hrTrigger = page.getByRole("combobox", { name: "Jezik", exact: true });
  await hrTrigger.click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(hrTrigger).toBeFocused();
});

test("new SSR and client-only routes fit a mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ["/workshops", "/studio", "/guide", "/planner"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBeFalsy();
  }
  await page.getByRole("combobox", { name: "Language", exact: true }).click();
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.screenshot({
    path: "test-results/atelier-planner-mobile-menu.png",
  });
  await page.keyboard.press("Escape");
});
