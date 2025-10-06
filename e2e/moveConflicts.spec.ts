import { test, expect } from "@playwright/test";

test("user can resolve move conflicts", async ({ page }) => {
  await page.goto("http://localhost:8000/");

  // create /a/x.txt
  await page.getByRole("button", { name: "+📁" }).click();
  await page.getByRole("textbox", { name: "Directory Name:" }).fill("a");
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByRole("listitem", { name: "a" }).dblclick();
  await page.getByRole("button", { name: "+📄" }).click();
  await page.getByRole("textbox", { name: "File Name:" }).fill("x.txt");

  // create /b/y.txt
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByRole("button", { name: "+📁" }).click();
  await page.getByRole("textbox", { name: "Directory Name:" }).fill("b");
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByText("b", { exact: true }).dblclick();
  await page.getByRole("button", { name: "+📄" }).click();
  await page.getByRole("textbox", { name: "File Name:" }).fill("y.txt");
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByRole("navigation").filter({ hasText: "/" }).click();
  await page.getByRole("button", { name: "+📁" }).click();

  // create /a/b/j.txt and /a/b/y.txt
  await page.getByRole("textbox", { name: "Directory Name:" }).fill("b");
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByRole("button", { name: "Expand/Collapse a" }).click();
  await page.getByRole("button", { name: "Expand/Collapse b" }).first().click();
  await page.getByText("b").nth(3).click();
  await page.getByText("b").nth(3).click();
  await page.getByText("b").nth(3).dblclick();
  await page.getByRole("button", { name: "+📄" }).click();
  await page.getByRole("textbox", { name: "File Name:" }).fill("y.txt");
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByRole("button", { name: "+📄" }).click();
  await page.getByRole("textbox", { name: "File Name:" }).fill("j.txt");
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByText("/", { exact: true }).click();
  await page.getByText("▶").click();
  await page.getByRole("listitem", { name: "b" }).nth(1).click();

  // drag /b to /a
  const b = page.getByRole("listitem", { name: "b" }).nth(1);
  const a = page.getByRole("listitem", { name: "a" });
  await b.dragTo(a);
  await page.getByRole("button", { name: "Replace" }).click();

  // should only be one b, j.txt, y.txt, and x.txt
  await expect(page.getByRole("listitem", { name: "b" })).toHaveCount(1);
  await expect(page.getByRole("listitem", { name: "j.txt" })).toHaveCount(1);
  await expect(page.getByRole("listitem", { name: "y.txt" })).toHaveCount(1);
  await expect(page.getByRole("listitem", { name: "x.txt" })).toHaveCount(1);
});
