import { test, expect } from "@playwright/test";

test("create and undo directory and file", async ({ page }) => {
  await page.goto("http://localhost:8000/");

  // create directory
  await page.getByRole("button", { name: "+📁" }).click();
  await page.getByRole("textbox", { name: "Directory Name:" }).fill("a");
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByRole("listitem", { name: "a" })).toHaveCount(1);

  // undo create directory
  await page.locator("body").press("ControlOrMeta+z");
  await expect(page.getByRole("listitem", { name: "a" })).toHaveCount(0);

  // create files
  await page.getByRole("button", { name: "+📄" }).click();
  await page.getByRole("textbox", { name: "File Name:" }).fill("a.txt");
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByRole("listitem", { name: "a.txt" })).toHaveCount(1);

  // undo create file
  await page.locator("body").press("ControlOrMeta+z");
  await expect(page.getByRole("listitem", { name: "a.txt" })).toHaveCount(0);
});

test("delete and undo", async ({ page }) => {
  await page.goto("http://localhost:8000/");

  await page.getByRole("button", { name: "+📄" }).click();
  await page.getByRole("textbox", { name: "File Name:" }).fill("z.txt");
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByRole("listitem", { name: "z.txt" })).toHaveCount(1);
  await page.getByText("z.txt").click();
  await page.getByRole("button", { name: "🗑️" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("listitem", { name: "z.txt" })).toHaveCount(0);
});

test("move nested items and undo", async ({ page }) => {
  await page.goto("http://localhost:8000/");

  // create /a/b/c.txt
  await page.getByRole("button", { name: "+📁" }).click();
  await page.getByRole("textbox", { name: "Directory Name:" }).fill("a");
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByText("a", { exact: true }).dblclick();
  await page.getByRole("button", { name: "+📁" }).click();
  await page.getByRole("textbox", { name: "Directory Name:" }).fill("b");
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByText("b", { exact: true }).dblclick();
  await page.getByRole("button", { name: "+📄" }).click();
  await page.getByRole("textbox", { name: "File Name:" }).fill("c.txt");
  await page.getByRole("button", { name: "Create" }).click();

  // go back to root view
  await page.getByRole("navigation").filter({ hasText: "/" }).click();
  // expand all /a/b/c.txt
  await page.getByRole("button", { name: "📂" }).click();
  // drag /b listitem to root
  await page
    .getByRole("listitem", { name: "b" })
    .dragTo(page.getByRole("navigation").filter({ hasText: "/" }));

  // collapse all
  await page.getByRole("button", { name: "📁", exact: true }).click();
  // only a and b should be visible at root
  await expect(page.getByRole("listitem", { name: "a" })).toHaveCount(1);
  await expect(page.getByRole("listitem", { name: "b" })).toHaveCount(1);
  // expand b
  await page.getByLabel("Expand/Collapse b").click();
  // c.txt should be visible
  await expect(page.getByRole("listitem", { name: "c.txt" })).toHaveCount(1);

  // ctrl+z to undo move
  await page.locator("body").press("ControlOrMeta+z");
  // collapse all - b and c.txt should no longer be visible
  await page.getByRole("button", { name: "📁", exact: true }).click();
  await expect(page.getByRole("listitem", { name: "b" })).toHaveCount(0);
  await expect(page.getByRole("listitem", { name: "c.txt" })).toHaveCount(0);

  // expand a. b should be visible. c.txt should not be visible
  await page.getByLabel("Expand/Collapse a").click();
  await expect(page.getByRole("listitem", { name: "b" })).toHaveCount(1);
  await expect(page.getByRole("listitem", { name: "c.txt" })).toHaveCount(0);

  // expand b. c.txt should be visible
  await page.getByLabel("Expand/Collapse b").click();
  await expect(page.getByRole("listitem", { name: "c.txt" })).toHaveCount(1);
});
