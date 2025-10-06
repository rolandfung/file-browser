import { test, expect } from "@playwright/test";
import { setupTestData } from "./test-helpers";

test("User can switch sort order (default is sort-by-type)", async ({
  page,
}) => {
  await setupTestData(page);
  // get all listitems
  const listItems = await page.getByRole("listitem").all();
  // first list item should have data-type="directory"
  const firstItemType = await listItems[0].getAttribute("data-type");
  expect(firstItemType).toBe("directory");
  // last item should be file type
  const lastItemType = await listItems[listItems.length - 1].getAttribute(
    "data-type"
  );
  expect(lastItemType).toBe("file");

  // click button with name "Toggle Asc/Desc"
  await page.getByTitle("Toggle Asc/Desc").click();
  // first list item should have data-type="file"
  const firstItemTypeDesc = await listItems[0].getAttribute("data-type");
  expect(firstItemTypeDesc).toBe("file");
  // last item should be directory type
  const lastItemTypeDesc = await listItems[listItems.length - 1].getAttribute(
    "data-type"
  );
  expect(lastItemTypeDesc).toBe("directory");
});

test("User can sort by name in asc or desc order", async ({ page }) => {
  await setupTestData(page);

  // select "Name" from <select> with name "Sort By"
  await page.getByRole("combobox").selectOption("name");

  // get all listitems
  const listItems = await page.getByRole("listitem").all();

  // map over listItems to get data-name attribute
  const names = await Promise.all(
    listItems.map((item) => item.getAttribute("data-name"))
  );

  // check that names are in ascending order
  const sortedNames = [...names].sort((a, b) =>
    a && b ? a.localeCompare(b) : 0
  );
  expect(names).toEqual(sortedNames);

  // switch order to descending
  await page.getByTitle("Toggle Asc/Desc").click();

  // map over listItems to get data-name attribute
  const namesDesc = await Promise.all(
    listItems.map((item) => item.getAttribute("data-name"))
  );

  // check that names are in descending order
  const sortedNamesDesc = [...namesDesc]
    .sort((a, b) => (a && b ? a.localeCompare(b) : 0))
    .reverse();
  expect(namesDesc).toEqual(sortedNamesDesc);
});
