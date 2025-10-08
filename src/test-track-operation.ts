import { FileSystem } from "./frontend/FileSystem.js";
import { FileTreeNode } from "./frontend/FileTreeNode.js";

// Create a test to verify trackCompletedOperation is called for moveFiles
function testMoveFilesTracking() {
  // Create a simple file system
  const root = new FileTreeNode("root", "directory", 0, new Date());
  const sourceDir = new FileTreeNode("source", "directory", 0, new Date());
  const targetDir = new FileTreeNode("target", "directory", 0, new Date());
  const testFile = new FileTreeNode("test.txt", "file", 100, new Date());

  // Set up the tree structure
  root.children.set("source", sourceDir);
  root.children.set("target", targetDir);
  sourceDir.parent = root;
  targetDir.parent = root;

  sourceDir.children.set("test.txt", testFile);
  testFile.parent = sourceDir;

  const fs = new FileSystem(root);

  // Track if trackCompletedOperation was called
  let operationTracked = false;
  const originalTrackCompletedOperation = fs.trackCompletedOperation.bind(fs);
  fs.trackCompletedOperation = function (operation) {
    console.log("trackCompletedOperation called with:", operation);
    operationTracked = true;
    return originalTrackCompletedOperation(operation);
  };

  // Test the moveFiles generator
  const generator = fs.moveFiles([testFile], targetDir);

  // Consume the generator to completion
  let result = generator.next();
  while (!result.done) {
    console.log("Generator yielded:", result.value);
    result = generator.next(); // No conflicts in this simple case
  }

  console.log("Final result:", result.value);
  console.log("Operation tracked:", operationTracked);
  console.log("Last operation:", fs.lastOperation);

  // Verify that the file was moved
  console.log("File moved successfully:", targetDir.children.has("test.txt"));
  console.log("File no longer in source:", !sourceDir.children.has("test.txt"));

  return operationTracked;
}

// Run the test
console.log("Testing moveFiles operation tracking...");
const success = testMoveFilesTracking();
console.log("Test result:", success ? "PASS" : "FAIL");
