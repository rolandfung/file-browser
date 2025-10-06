import { test, expect } from "@playwright/test";
import { setupTestData } from "./test-helpers";

test("Breadcrumbs navigation", async ({ page }) => {
  await setupTestData(page);
  await page.getByRole("listitem", { name: "Libraries_1_0" }).dblclick();
  await page.getByRole("listitem", { name: "Images_2_2" }).dblclick();
  await page.getByRole("listitem", { name: "Assets_3_3" }).dblclick();

  // Check breadcrumbs
  const breadcrumbs = page.getByRole("navigation");
  await expect(breadcrumbs.nth(0)).toHaveText("/");
  await expect(breadcrumbs.nth(1)).toHaveText("Libraries_1_0");
  await expect(breadcrumbs.nth(2)).toHaveText("Images_2_2");
  await expect(breadcrumbs.nth(3)).toHaveText("Assets_3_3");
});

test("Move files into directory by dragging onto breadcrumbs", async ({
  page,
}) => {
  await setupTestData(page);
  // nav to Libraries_1_0/Images_2_2/Assets_3_3
  await page.getByRole("listitem", { name: "Libraries_1_0" }).dblclick();
  // audio_7848.gif should not be visible at the current level
  await expect(
    page.getByRole("listitem", { name: "audio_7848.gif" })
  ).toHaveCount(0);
  await page.getByRole("listitem", { name: "Images_2_2" }).dblclick();
  await page.getByRole("listitem", { name: "Assets_3_3" }).dblclick();
  // drag audio_7848.gif into breadcrumbs "Libraries_1_0"
  await page.getByRole("listitem", { name: "audio_7848.gif" }).hover();
  await page.mouse.down();
  await page.getByRole("navigation").nth(1).hover();
  await page.mouse.up();
  // audio_7848.gif should not be visible at the current level
  await expect(
    page.getByRole("listitem", { name: "audio_7848.gif" })
  ).toHaveCount(0);

  // nav to Libraries_1_0
  await page.getByRole("navigation").nth(1).click();
  // audio_7848.gif should be visible
  await expect(
    page.getByRole("listitem", { name: "audio_7848.gif" })
  ).toBeVisible();
});
