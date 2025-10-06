import { test, expect } from "@playwright/test";
import { setupTestData } from "./test-helpers";

test("Up and back navigation buttons", async ({ page }) => {
  await setupTestData(page);
  await page.getByText("Libraries_1_0").dblclick();
  await page.getByText("Images_2_2").dblclick();
  expect(await page.getByRole("navigation").last().textContent()).toBe(
    "Images_2_2"
  );

  await page.getByTitle("Navigate Up").click();
  expect(await page.getByRole("navigation").last().textContent()).toBe(
    "Libraries_1_0"
  );

  await page.getByRole("button", { name: "⬅️" }).click();
  expect(await page.getByRole("navigation").last().textContent()).toBe(
    "Images_2_2"
  );
});
