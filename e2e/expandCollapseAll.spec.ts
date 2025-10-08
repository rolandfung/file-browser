import { test, expect } from "@playwright/test";
import { setupTestData } from "./test-helpers";

test("Expand and collapse all", async ({ page }) => {
  await setupTestData(page);

  // expand all directories
  await page.getByRole("button", { name: "📂" }).click();

  // asert the following directories are visible
  expect(await page.getByText("Archive_2_2").isVisible()).toBeTruthy();
  expect(await page.getByText("Assets_3_7").isVisible()).toBeTruthy();
  expect(await page.getByText("Libraries_4_42").isVisible()).toBeTruthy();

  // collapse all directories
  await page.getByRole("button", { name: "📁", exact: true }).click();

  // all directories should be collapsed
  expect(await page.getByText("Archive_2_2").isVisible()).toBeFalsy();
  expect(await page.getByText("Assets_3_7").isVisible()).toBeFalsy();
  expect(await page.getByText("Libraries_4_42").isVisible()).toBeFalsy();
});
