import { test, expect } from "@playwright/test";
import { setupTestData } from "./test-helpers";

test("Expand and collapse all", async ({ page }) => {
  await setupTestData(page);

  // expand all directories
  await page.getByRole("button", { name: "📂" }).click();

  // asert the following directories are visible
  expect(await page.getByText("Images_2_2").isVisible()).toBeTruthy();
  expect(await page.getByText("Assets_3_3").isVisible()).toBeTruthy();
  expect(await page.getByText("Media_4_29").isVisible()).toBeTruthy();

  // collapse all directories
  await page.getByRole("button", { name: "📁", exact: true }).click();

  // all directories should be collapsed
  expect(await page.getByText("Images_2_2").isVisible()).toBeFalsy();
  expect(await page.getByText("Assets_3_3").isVisible()).toBeFalsy();
  expect(await page.getByText("Media_4_29").isVisible()).toBeFalsy();
});
