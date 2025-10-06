import { testFileGeneration } from "../src/frontend/datagen/fileSystemHelpers";

describe("File Generation Tests", () => {
  it("should generate 10,000 files and log statistics", () => {
    // Call the test function and ensure it runs without errors
    testFileGeneration();
  });
});
