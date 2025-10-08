import { test, expect } from "@playwright/test";
import { setupTestData } from "./test-helpers";

test("Selected file(s) summary", async ({ page }) => {
  await setupTestData(page);
  await page.getByRole("listitem", { name: "app_7857.js" }).click();
  expect(await page.getByText("1 item selected: app_7857.js").isVisible()).toBe(
    true
  );

  await page.getByRole("listitem", { name: "clip_1329.gif" }).click();
  await page.getByRole("listitem", { name: "controller_5316.tsx" }).click({
    modifiers: ["Shift"],
  });
  // expect to see "3 items selected"
  expect(await page.getByText("3 items selected").isVisible()).toBe(true);
});
