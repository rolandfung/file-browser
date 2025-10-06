import { test, expect } from "@playwright/test";
import { setupTestData } from "./test-helpers";

test("drag between views", async ({ page }) => {
  await setupTestData(page);

  await page.getByRole("button", { name: "Add View" }).click();
  await page.getByRole("listitem", { name: "audio_2726.png" }).first().click();
  await page
    .getByRole("listitem", { name: "content_9226.7z" })
    .first()
    .click({
      modifiers: ["Shift"],
    });

  await page.getByRole("listitem", { name: "audio_2726.png" }).first().hover();
  await page.mouse.down();
  await page.getByRole("listitem", { name: "Libraries_1_0" }).nth(1).hover();
  await page.mouse.up();

  // TOOD: there is a bug here - in the first view, the file is still selected after being moved and no longer being visible!

  // wait 3 seconds for move to complete as there is an artifical delay added to simulate IO latency
  await page.waitForTimeout(1000);

  await expect(
    page.getByRole("listitem", { name: "content_9226.7z" })
  ).toHaveCount(0);

  // navigate into Libraries_1_0
  await page.getByRole("listitem", { name: "Libraries_1_0" }).nth(1).dblclick();

  // expect audio_2726 and content_9226.7z to be visible
  await expect(
    page.getByRole("listitem", { name: "audio_2726.png" })
  ).toBeVisible();
  await expect(
    page.getByRole("listitem", { name: "content_9226.7z" })
  ).toBeVisible();
});
