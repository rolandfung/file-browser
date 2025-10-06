import { test, expect } from "@playwright/test";
import { setupTestData } from "./test-helpers";

test("Search and weather file download", async ({ page }) => {
  await setupTestData(page);
  await page.getByRole("textbox", { name: "Search..." }).click();
  await page.getByRole("textbox", { name: "Search..." }).fill("city");
  // expect every listitem to contain ".city"
  const items = page.getByRole("listitem");
  for (let i = 0; i < (await items.count()); i++) {
    await expect(items.nth(i)).toContainText("city");
  }
  await page.getByRole("listitem", { name: "athens__GR.city" }).click();
  // intercept download requests to https://api.openweathermap.org/data/2.5/weather to avoid actually downloading the file
  await page.route(
    "https://api.openweathermap.org/data/2.5/weather*",
    (route) => route.fulfill({ body: "{}" })
  );

  await page.getByRole("button", { name: "🌤️" }).click();
  const download1 = await page.waitForEvent("download");
  expect(download1.suggestedFilename()).toBe("athens__GR_weather.json");
});
