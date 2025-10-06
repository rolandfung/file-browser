import { test, expect } from "@playwright/test";
import { setupTestData } from "./test-helpers";

test("User can create and delete file", async ({ page }) => {
  await setupTestData(page);
  await page.getByTitle("Create New File").click();
  await page.getByRole("textbox", { name: "File Name:" }).click();
  await page
    .getByRole("textbox", { name: "File Name:" })
    .fill("playwright.pdf");
  await page.getByRole("button", { name: "Create" }).click();
  await expect(
    page.getByRole("listitem", { name: "playwright.pdf" })
  ).toBeVisible();
  await page.getByRole("listitem", { name: "playwright.pdf" }).click();
  await page.getByRole("button", { name: "🗑️" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(
    page.getByRole("listitem", { name: "playwright.pdf" })
  ).not.toBeVisible();
});

test("user can drag a file into a directory", async ({ page }) => {
  await setupTestData(page);
  // drag and drop audio file into Libraries_1_0 directory
  await page.getByRole("listitem", { name: "audio_2726.png" }).hover();
  await page.mouse.down();
  await page.getByRole("listitem", { name: "Libraries_1_0" }).hover();
  await page.mouse.up();
  // audio file should not be visible at the root level
  await expect(
    page.getByRole("listitem", { name: "audio_2726.png" })
  ).not.toBeVisible();
  // expand the directory
  await page.getByLabel("Expand/Collapse Libraries_1_0").click();
  // audio file should be visible inside the directory
  await expect(
    page.getByRole("listitem", { name: "audio_2726.png" })
  ).toBeVisible();
});
