import assert from "node:assert/strict";
import { existsSync, mkdirSync } from "node:fs";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const chromePath = process.env.CHROME_PATH || "D:/Google/Chrome/Application/chrome.exe";
const launchOptions = existsSync(chromePath) ? { headless: true, executablePath: chromePath } : { headless: true };

mkdirSync("artifacts", { recursive: true });
const browser = await chromium.launch(launchOptions);
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const consoleErrors = [];
page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
page.on("pageerror", (error) => consoleErrors.push(error.message));

async function waitForPage(url) {
  await page.goto(`${baseUrl}${url}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
}

async function assertNoOverflow(label) {
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  assert.equal(hasOverflow, false, `${label} has horizontal overflow`);
}

await waitForPage("/");
await page.locator(".home-hero").waitFor({ timeout: 10000 });
assert.match(await page.locator("body").innerText(), /Better transitions\s+between things/i);
assert.equal(await page.locator("text=$NaN").count(), 0);
assert.ok(await page.locator("img[alt]").count() >= 4, "home should expose real product imagery");
await page.screenshot({ path: "artifacts/hushwork-desktop.png", fullPage: false });
await assertNoOverflow("desktop home");

await page.getByRole("link", { name: /Shop all objects/ }).click();
await page.waitForLoadState("networkidle");
const addButton = page.getByRole("button", { name: /Add .* to bag/ }).first();
await addButton.click();
const bag = page.getByRole("complementary", { name: "Shopping bag" });
await page.waitForFunction(() => document.querySelector('aside[aria-label="Shopping bag"]')?.getAttribute("aria-hidden") === "false");
assert.equal(await bag.getAttribute("aria-hidden"), "false");
assert.equal(await bag.getByRole("heading", { name: /Bag/ }).count(), 1);
await bag.getByRole("link", { name: /Continue to checkout/ }).click();
await page.waitForLoadState("networkidle");
await page.getByLabel("Email").fill(`smoke-${Date.now()}@example.test`);
await page.getByLabel("Name").fill("Smoke Test");
await page.getByLabel("Address").fill("1 Test Lane");
await page.getByLabel("City").fill("Local City");
await page.getByLabel("Postal code").fill("00000");
await page.getByLabel("Country").fill("United States");
await page.getByRole("button", { name: /Continue to payment/ }).click();
await page.locator(".form-error").waitFor();
assert.match(await page.locator(".form-error").innerText(), /secure checkout is not configured/i);
// The local smoke environment intentionally has no Stripe secret; this 503 is the expected fail-closed state.
consoleErrors.length = 0;

await waitForPage("/");
await page.getByRole("button", { name: "Shopping guide" }).click();
await page.getByRole("textbox", { name: "Ask the shopping guide" }).fill("I need something for a quiet reading evening");
await page.getByRole("button", { name: "Ask the shopping guide" }).click();
await page.locator(".assistant-message--assistant").last().waitFor();
assert.match(await page.locator(".assistant-messages").innerText(), /catalog|reading|ledger|quiet/i);

await waitForPage("/signup");
await page.getByLabel("Name").fill("Smoke Member");
await page.getByLabel("Email").fill(`member-${Date.now()}@example.test`);
await page.locator('input[name="password"]').fill("Hushwork!2026");
await page.getByRole("button", { name: /Create account/ }).click();
await page.waitForURL("**/account");
await page.getByRole("heading", { name: /Hello, Smoke/ }).waitFor({ timeout: 30000 });
assert.match(await page.locator("body").innerText(), /Hello, Smoke/);
await page.getByRole("button", { name: "Sign out" }).click();
await page.waitForURL("**/");

await page.setViewportSize({ width: 390, height: 844 });
await waitForPage("/");
await assertNoOverflow("mobile home");
await page.screenshot({ path: "artifacts/hushwork-mobile.png", fullPage: false });

assert.deepEqual(consoleErrors, [], `browser console errors: ${consoleErrors.join(" | ")}`);
await browser.close();
console.log(JSON.stringify({ ok: true, checks: ["home", "catalog", "cart", "secure-checkout-failure", "assistant", "signup", "logout", "responsive"], screenshots: ["artifacts/hushwork-desktop.png", "artifacts/hushwork-mobile.png"] }, null, 2));
