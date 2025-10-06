import { test, expect } from "@playwright/test";
import { setupTestData } from "./test-helpers";

test("Selected file(s) summary", async ({ page }) => {
  await setupTestData(page);
  await page.getByRole("listitem", { name: "audio_2726.png" }).click();
  //   await page.getByText("1 item selected: /audio_2726.").click();
  expect(
    await page.getByText("1 item selected: /audio_2726.").isVisible()
  ).toBe(true);

  await page.getByRole("listitem", { name: "config_8208.ts" }).click();
  await page.getByRole("listitem", { name: "data_1349.json" }).click({
    modifiers: ["Shift"],
  });
  // expect to see "3 items selected"
  expect(await page.getByText("3 items selected").isVisible()).toBe(true);
});
