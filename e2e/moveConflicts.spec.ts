import { test, expect } from "@playwright/test";

/**
 * /a/a.txt
 * /a/b/x.txt
 * /b/x.txt
 * /b/y.txt
 *
 * move /b into /a, expect conflict on x.txt
 *
 */

test("user can resolve move conflicts", async ({ page }) => {
  await page.goto("http://localhost:8000/");
  await page.getByRole("button", { name: "+📁" }).click();
  await page.getByRole("textbox", { name: "Directory Name:" }).fill("a");
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByRole("button", { name: "+📁" }).click();
  await page.getByRole("textbox", { name: "Directory Name:" }).fill("b");
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByRole("listitem", { name: "a" }).dblclick();
  await page.getByRole("button", { name: "+📁" }).click();
  await page.getByRole("textbox", { name: "Directory Name:" }).fill("b");
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByRole("button", { name: "+📄" }).click();
  await page.getByRole("textbox", { name: "File Name:" }).fill("a.txt");
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByRole("listitem", { name: "b" }).dblclick();
  await page.getByRole("button", { name: "+📄" }).click();
  await page.getByRole("textbox", { name: "File Name:" }).fill("x.txt");
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByRole("navigation").filter({ hasText: "/" }).click();
  await page.getByText("b", { exact: true }).dblclick();
  await page.getByRole("button", { name: "+📄" }).click();
  await page.getByRole("textbox", { name: "File Name:" }).fill("x.txt");
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByRole("button", { name: "+📄" }).click();
  await page.getByRole("textbox", { name: "File Name:" }).fill("y.txt");
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByText("/", { exact: true }).click();
  // drag b into a
  const a = page.getByRole("listitem", { name: "a" });
  const b = page.getByRole("listitem", { name: "b" });
  await b.dragTo(a);
  await page.getByRole("button", { name: "Skip" }).click();

  // only a should be shown
  expect(await page.getByRole("listitem").count()).toBe(1);
  expect(await page.getByRole("listitem", { name: "a" })).toBeVisible();

  // expand a by clicking "Expand/Collapse a". b and a.txt should be visible
  await page.getByRole("button", { name: "Expand/Collapse a" }).click();
  await expect(page.getByRole("listitem", { name: "b" })).toBeVisible();
  await page.getByRole("listitem", { name: "a.txt" }).click();
  // x.txt and y.txt should not be visible
  expect(await page.getByRole("listitem", { name: "x.txt" }).count()).toBe(0);
  expect(await page.getByRole("listitem", { name: "y.txt" }).count()).toBe(0);

  // expand b. x.txt and y.txt should be visible
  await page.getByRole("button", { name: "Expand/Collapse b" }).click();
  await page.getByRole("listitem", { name: "x.txt" }).click();
  await page.getByRole("listitem", { name: "y.txt" }).click();
});
