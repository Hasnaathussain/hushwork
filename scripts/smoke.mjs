import assert from "node:assert/strict";
import { existsSync, mkdirSync } from "node:fs";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3000";
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
await page.locator(".hero-eyebrow").waitFor({ timeout: 10000 });
assert.match(await page.locator("body").innerText(), /Useful things for the hours after/i);
assert.equal(await page.locator("text=$NaN").count(), 0);
await page.screenshot({ path: "artifacts/hushwork-desktop.png", fullPage: false });
await assertNoOverflow("desktop home");

await page.getByRole("link", { name: /Shop the edit/ }).click();
await page.waitForLoadState("networkidle");
await page.getByRole("button", { name: /Add .* to bag/ }).first().click();
const bag = page.getByRole("complementary", { name: "Shopping bag" });
await assert.equal(await bag.getByText("Bag").count(), 1);
await bag.getByRole("link", { name: /Continue to checkout/ }).click();
await page.waitForLoadState("networkidle");
await page.getByLabel("Email").fill(`smoke-${Date.now()}@example.test`);
await page.getByLabel("Name").fill("Smoke Test");
await page.getByLabel("Address").fill("1 Test Lane");
await page.getByLabel("City").fill("Local City");
await page.getByLabel("Postal code").fill("00000");
await page.getByLabel("Country").fill("Testland");
await page.getByRole("button", { name: /Place demo order/ }).click();
await page.getByText("The shelf has your order").waitFor();
assert.match(await page.locator("body").innerText(), /order_[a-z0-9]+/);

await waitForPage("/");
await page.getByRole("button", { name: "Find my object" }).click();
await page.getByRole("textbox", { name: "Ask the shopping guide" }).fill("I need something for a quiet reading evening");
await page.getByRole("button", { name: "Ask the shopping guide" }).click();
await page.locator(".assistant-message--assistant").last().waitFor();
assert.match(await page.locator(".assistant-messages").innerText(), /current shelf|slower read|reading/i);

await waitForPage("/signup");
await page.getByLabel("Name").fill("Smoke Member");
await page.getByLabel("Email").fill(`member-${Date.now()}@example.test`);
await page.locator('input[name="password"]').fill("Hushwork!2026");
await page.getByRole("button", { name: /Create account/ }).click();
await page.waitForURL("**/account");
assert.match(await page.locator("body").innerText(), /Hello, Smoke/);
await page.getByRole("button", { name: "Sign out" }).click();
await page.waitForURL("**/");

await page.setViewportSize({ width: 390, height: 844 });
await waitForPage("/");
await assertNoOverflow("mobile home");
await page.screenshot({ path: "artifacts/hushwork-mobile.png", fullPage: false });

assert.deepEqual(consoleErrors, [], `browser console errors: ${consoleErrors.join(" | ")}`);
await browser.close();
console.log(JSON.stringify({ ok: true, checks: ["home", "cart", "checkout", "assistant", "signup", "logout", "responsive"], screenshots: ["artifacts/hushwork-desktop.png", "artifacts/hushwork-mobile.png"] }, null, 2));
