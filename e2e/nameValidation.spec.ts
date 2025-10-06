import { test, expect } from "@playwright/test";

test("User cannot create file with invalid name", async ({ page }) => {
  await page.goto("http://localhost:8000/");
  await page.getByRole("button", { name: "+📄" }).click();
  await page.getByRole("textbox", { name: "File Name:" }).fill("a");
  await expect(page.getByRole("button", { name: "Create" })).toBeEnabled();
  await page.getByRole("textbox", { name: "File Name:" }).fill("a/");
  await expect(page.getByRole("button", { name: "Create" })).toBeDisabled();
  await expect(
    page.getByText("Invalid file name. Cannot be empty or contain slashes.")
  ).toBeVisible();
});

test("User cannot create directory with invalid name", async ({ page }) => {
  await page.goto("http://localhost:8000/");
  await page.getByRole("button", { name: "+📁" }).click();
  await page.getByRole("textbox", { name: "Directory Name:" }).fill("a");
  await expect(page.getByRole("button", { name: "Create" })).toBeEnabled();
  await page.getByRole("textbox", { name: "Directory Name:" }).fill("a/");
  await expect(page.getByRole("button", { name: "Create" })).toBeDisabled();
  await expect(
    page.getByText(
      "Invalid directory name. Cannot be empty or contain slashes."
    )
  ).toBeVisible();
});
