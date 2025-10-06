import { Page } from "@playwright/test";

export async function setupTestData(page: Page) {
  await page.goto("http://localhost:8000/");
  await page
    .getByRole("button", { name: "Generate 10k Files/Directories" })
    .click();

  // Wait for generation to complete
  await page.waitForTimeout(2000);
}
