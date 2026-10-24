import { expect, test, type APIRequestContext, type Browser, type BrowserContext, type Page } from "@playwright/test";

/**
 * The whole deal through the UI, with a seller, a buyer and an admin each in
 * their own browser context (like a normal and an incognito window):
 * listing → offer → accept → NDA → due diligence (request, answer with a
 * document, approve, close) → agreement (create, upload PDF, both sign) →
 * manual payment (buyer "Пардохт кардам", admin confirms) → transfer →
 * receipt → COMPLETED, and the business is SOLD.
 *
 * Every page fails the test on a console error or a failed (>=400) request.
 *
 * Needs PAYMENT_PROVIDER=manual on the backend and an admin account:
 *   E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD (create it with `npm run admin:bootstrap`).
 */

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin-e2e@example.com";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "AdminE2E-Password1";
const PASSWORD = "CorrectHorseBattery9!";
const tok = Date.now().toString(36);
const BUSINESS = `Muhammadshop E2E ${tok}`;
const PDF = Buffer.from(`%PDF-1.4\n% VentureMarket e2e ${tok}\n%%EOF\n`);

interface Party {
  context: BrowserContext;
  page: Page;
  api: APIRequestContext;
  problems: string[];
}

/** Same-origin backend proxy — cookies land on the app's origin like a real login. */
const api = (path: string) => `/api/backend${path}`;

async function party(browser: Browser, email: string, register?: "BUYER" | "SELLER"): Promise<Party> {
  const context = await browser.newContext();
  const base = test.info().project.use.baseURL!;
  await context.addCookies([{ name: "venturemarket_locale", value: "tj", url: base }]);
  const { request } = context;
  if (register) {
    const res = await request.post(api("/auth/register"), { data: { email, password: PASSWORD, role: register } });
    expect(res.status(), await res.text()).toBe(201);
  }
  const password = register ? PASSWORD : ADMIN_PASSWORD;
  const login = await request.post(api("/auth/login"), { data: { email, password } });
  expect(login.status(), await login.text()).toBe(200);

  const page = await context.newPage();
  const problems: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") problems.push(`console: ${msg.text()}`);
  });
  page.on("pageerror", (err) => problems.push(`pageerror: ${err.message}`));
  page.on("response", (res) => {
    if (res.status() >= 400) problems.push(`${res.status()} ${res.request().method()} ${res.url()}`);
  });
  page.on("requestfailed", (req) => {
    // Navigations abort in-flight prefetches; those aren't failures.
    if (req.failure()?.errorText !== "net::ERR_ABORTED") problems.push(`failed: ${req.method()} ${req.url()}`);
  });
  return { context, page, api: request, problems };
}

async function json<T>(res: Awaited<ReturnType<APIRequestContext["get"]>>): Promise<T> {
  expect(res.ok(), `${res.status()} ${res.url()}: ${await res.text()}`).toBeTruthy();
  return ((await res.json()) as { data: T }).data;
}

async function openDeal(p: Party, dealId: string) {
  await p.page.goto(`/dashboard/deals/${dealId}`);
  await expect(p.page.getByTestId("deal-next-step")).toBeVisible();
}

async function expectStatus(p: Party, status: string) {
  await expect(p.page.getByTestId("deal-status")).toHaveAttribute("data-status", status);
}

/** Clicks the single next-step button and checks its (Tajik) label. */
async function primary(p: Party, label: string) {
  const button = p.page.getByTestId("deal-primary-action");
  await expect(button).toHaveText(label);
  await button.click();
}

async function expectWaiting(p: Party) {
  await expect(p.page.getByTestId("deal-waiting")).toContainText("Интизори амали тарафи дигар");
  await expect(p.page.getByTestId("deal-primary-action")).toHaveCount(0);
}

test("seller and buyer complete a deal from the UI", async ({ browser }) => {
  const seller = await party(browser, `seller-${tok}@example.com`, "SELLER");
  const buyer = await party(browser, `buyer-${tok}@example.com`, "BUYER");

  // ── Listing, offer, acceptance (set-up through the same API the UI uses) ──
  const categories = await json<{ id: string }[]>(await seller.api.get(api("/categories")));
  const business = await json<{ id: string }>(
    await seller.api.post(api("/businesses"), {
      data: {
        name: BUSINESS,
        description: "Online shop used by the deal-room Playwright test",
        categoryId: categories[0].id,
        businessModel: "E-commerce",
        askingPrice: 50000,
        country: "TJ",
      },
    }),
  );
  await json(await seller.api.post(api(`/businesses/${business.id}/publish`)));
  const offer = await json<{ id: string }>(
    await buyer.api.post(api(`/businesses/${business.id}/offers`), { data: { amount: 45000 } }),
  );
  await json(await seller.api.post(api(`/offers/${offer.id}/accept`)));
  const deals = await json<{ id: string; businessId: string }[]>(await buyer.api.get(api("/deals")));
  const dealId = deals.find((d) => d.businessId === business.id)!.id;

  await openDeal(seller, dealId);
  await openDeal(buyer, dealId);
  await expectStatus(buyer, "INITIATED");

  // ── NDA ──
  await primary(buyer, "Оғози NDA");
  await expectStatus(buyer, "NDA");
  await primary(buyer, "Имзо кардани NDA");
  await expectWaiting(buyer);

  await seller.page.reload();
  await primary(seller, "Имзо кардани NDA");
  await expectStatus(seller, "DUE_DILIGENCE");

  // ── Due diligence: the stage label shows the real (0%) progress ──
  await buyer.page.reload();
  await expect(buyer.page.getByText("Санҷиши ҳамаҷониба (0%)").first()).toBeVisible();
  await primary(buyer, "Дархости санҷиш фиристодан");
  const ddDialog = buyer.page.getByRole("dialog");
  await ddDialog.getByLabel("Номи дархост").fill("Ҳисоботи молиявӣ 2025");
  await ddDialog.getByLabel("Банди 1").fill("Ҳисоботи фоида ва зарар");
  await ddDialog.getByRole("button", { name: "Фиристодан" }).click();
  await expect(ddDialog).toBeHidden();
  await expectWaiting(buyer);

  await seller.page.reload();
  await primary(seller, "Ба бандҳо ҷавоб додан");
  await seller.page.getByTestId("dd-answer").click();
  const answer = seller.page.getByRole("dialog");
  await answer.getByLabel("Ҷавоб", { exact: true }).fill("Ҳисобот замима шуд");
  await answer.getByLabel("Ҳуҷҷат замима кардан (ихтиёрӣ)").setInputFiles({
    name: "pnl-2025.pdf",
    mimeType: "application/pdf",
    buffer: PDF,
  });
  await answer.getByRole("button", { name: "Ҷавоб фиристодан" }).click();
  await expect(answer).toBeHidden();
  await expect(seller.page.getByTestId("dd-item-status")).toHaveText("Бор карда шуда");

  await buyer.page.reload();
  await buyer.page.getByTestId("dd-approve").click();
  await expect(buyer.page.getByTestId("dd-item-status")).toHaveText("Тасдиқшуда");
  await expect(buyer.page.getByTestId("dd-progress")).toContainText("100%");
  await primary(buyer, "Анҷом додани санҷиши ҳамаҷониба");
  await expectStatus(buyer, "AGREEMENT");

  // ── Agreement: seller drafts and uploads, both sign ──
  await seller.page.reload();
  await primary(seller, "Эҷоди шартнома");
  const create = seller.page.getByRole("dialog");
  await expect(create.getByLabel("Номи шартнома")).toHaveValue(`Шартномаи хариду фурӯши ${BUSINESS}`);
  await create.getByRole("button", { name: "Эҷод кардан" }).click();
  await expect(create).toBeHidden();

  await primary(seller, "Бор кардани файли шартнома");
  const version = seller.page.getByRole("dialog");
  await version.getByLabel("Файли шартнома (PDF)").setInputFiles({
    name: "shartnoma.pdf",
    mimeType: "application/pdf",
    buffer: PDF,
  });
  await version.getByRole("button", { name: "Бор кардан" }).click();
  await expect(version).toBeHidden();
  await expect(seller.page.getByTestId("agreement-status")).toHaveText("Интизори имзо");

  await primary(seller, "Имзо кардан");
  await expect(seller.page.getByTestId("agreement-status")).toHaveText("Қисман имзошуда");
  await expectWaiting(seller);

  await buyer.page.reload();
  await expect(buyer.page.getByTestId("agreement-signer").filter({ hasText: "Фурӯшанда" })).toContainText("имзо кард");
  await primary(buyer, "Имзо кардан");
  await expectStatus(buyer, "TRANSACTION");

  // ── Manual payment: buyer marks paid, only the admin moves it on ──
  await primary(buyer, "Пардохт кардам");
  const paid = buyer.page.getByRole("dialog");
  await paid.getByLabel("Рақами интиқол ё квитансия (ихтиёрӣ)").fill(`TRX-${tok}`);
  await paid.getByRole("button", { name: "Пардохт кардам" }).click();
  await expect(paid).toBeHidden();
  await expect(buyer.page.getByTestId("deal-actor")).toHaveText("Администратор");
  await expectWaiting(buyer);
  await expectStatus(buyer, "TRANSACTION");

  const admin = await party(browser, ADMIN_EMAIL);
  await admin.page.goto("/admin/payments");
  const row = admin.page.getByTestId("admin-payment-row").filter({ hasText: BUSINESS });
  await expect(row).toContainText(`TRX-${tok}`);
  await row.getByTestId("admin-confirm-payment").click();
  await admin.page.getByTestId("admin-confirm-payment-dialog").click();
  await expect(row).toHaveCount(0);

  // ── Transfer and receipt ──
  await buyer.page.reload();
  await expectStatus(buyer, "TRANSFER");
  await expectWaiting(buyer);

  await seller.page.reload();
  await primary(seller, "Бизнесро супурдам");
  await expectWaiting(seller);

  await buyer.page.reload();
  await primary(buyer, "Қабул кардам");
  await expectStatus(buyer, "COMPLETED");
  await expect(buyer.page.getByTestId("deal-next-step")).toContainText("Муомила анҷом ёфт");

  const sold = await json<{ status: string; listing: { status: string } }>(
    await seller.api.get(api(`/businesses/${business.id}`)),
  );
  expect(sold.status).toBe("SOLD");
  expect(sold.listing.status).toBe("SOLD");

  for (const [who, p] of Object.entries({ seller, buyer, admin })) {
    expect(p.problems, `${who} saw console errors or failed requests`).toEqual([]);
  }
});
