import { test, expect } from "@playwright/test";
import { setupTestData } from "./test-helpers";

test("User can create and delete directory", async ({ page }) => {
  await setupTestData(page);
  await page.getByTitle("Create New Directory").click();
  await page
    .getByRole("textbox", { name: "Directory Name:" })
    .fill("Playwright");
  await page.getByRole("button", { name: "Create" }).click();
  await expect(
    page.getByRole("listitem", { name: "Playwright" })
  ).toBeVisible();
  await page.getByRole("listitem", { name: "Playwright" }).click();
  await page.getByRole("button", { name: "🗑️" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(
    page.getByRole("listitem", { name: "Playwright" })
  ).not.toBeVisible();
});

test("user can drag a directory into another directory", async ({ page }) => {
  await setupTestData(page);
  // create directory "ParentDir", "ChildDir"
  await page.getByTitle("Create New Directory").click();
  await page
    .getByRole("textbox", { name: "Directory Name:" })
    .fill("ParentDir");
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByTitle("Create New Directory").click();
  await page.getByRole("textbox", { name: "Directory Name:" }).fill("ChildDir");
  await page.getByRole("button", { name: "Create" }).click();
  // drag and drop "ChildDir" into "ParentDir"
  await page.getByRole("listitem", { name: "ChildDir" }).hover();
  await page.mouse.down();
  await page.getByRole("listitem", { name: "ParentDir" }).hover();
  await page.mouse.up();
  // "ChildDir" should not be visible at the root level
  await expect(
    page.getByRole("listitem", { name: "ChildDir" })
  ).not.toBeVisible();
  // expand "ParentDir"
  await page.getByLabel("Expand/Collapse ParentDir").click();
  // "ChildDir" should be visible inside "ParentDir"
  await expect(page.getByRole("listitem", { name: "ChildDir" })).toBeVisible();
});
