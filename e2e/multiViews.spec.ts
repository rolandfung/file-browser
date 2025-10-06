import { test, expect } from "@playwright/test";
import { setupTestData } from "./test-helpers";

test("Multi views can be added/removed, and filesystem change are propagated across all views", async ({
  page,
}) => {
  await setupTestData(page);

  await page.getByRole("button", { name: "Add View" }).click();

  // changes are synced across views
  await page.getByRole("listitem", { name: "audio_2726.png" }).nth(1).click();
  await page.getByRole("button", { name: "🗑️" }).nth(1).click();
  await page.getByRole("button", { name: "OK" }).click();

  // wait half a second
  await page.waitForTimeout(500);
  expect(
    await page.getByRole("listitem", { name: "audio_2726.png" }).count()
  ).toBe(0);

  // multi views can be closed
  await page
    .getByRole("button", { name: "Close File System View" })
    .nth(1)
    .click();
  expect(
    await page.getByRole("listitem", { name: "Libraries_1_0" }).count()
  ).toBe(1);
});
