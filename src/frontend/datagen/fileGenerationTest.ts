import { generate10kFiles, getFileIcon, formatFileSize } from "./fileGenerator";
import { FileTreeNode } from "../FileTreeNode";

/**
 * Helper function to count all nodes in the tree
 */
function countNodes(root: FileTreeNode): {
  totalItems: number;
  directories: FileTreeNode[];
  files: FileTreeNode[];
} {
  const directories: FileTreeNode[] = [];
  const files: FileTreeNode[] = [];

  function traverse(node: FileTreeNode) {
    if (node.type === "directory") {
      directories.push(node);
      for (const child of node.children.values()) {
        traverse(child);
      }
    } else {
      files.push(node);
    }
  }

  traverse(root);
  return { totalItems: directories.length + files.length, directories, files };
}

/**
 * Helper function to calculate depths for all nodes
 */
function calculateDepths(
  root: FileTreeNode,
  depth: number,
  depthMap: Map<FileTreeNode, number>
) {
  depthMap.set(root, depth);
  for (const child of root.children.values()) {
    calculateDepths(child, depth + 1, depthMap);
  }
}

/**
 * Test function to demonstrate the file generation
 */
export async function testFileGeneration(): Promise<void> {
  console.log("Generating 10,000 test files...");
  const startTime = performance.now();

  const rootNode = await generate10kFiles();

  const endTime = performance.now();
  console.log(`Generation completed in ${(endTime - startTime).toFixed(2)}ms`);

  // Count all nodes
  const { totalItems, directories, files } = countNodes(rootNode);

  // Display statistics
  console.log("\n=== Generation Statistics ===");
  console.log(`Total items: ${totalItems}`);
  console.log(`Directories: ${directories.length}`);
  console.log(`Files: ${files.length}`);

  // Show depth distribution
  const depthStats = new Map<number, number>();
  const depthMap = new Map<FileTreeNode, number>();
  calculateDepths(rootNode, 0, depthMap);

  for (const [, depth] of depthMap.entries()) {
    depthStats.set(depth, (depthStats.get(depth) || 0) + 1);
  }

  console.log("\n=== Depth Distribution ===");
  for (const [level, count] of depthStats.entries()) {
    console.log(`Level ${level}: ${count} items`);
  }

  // Show file type distribution
  const extensionStats = new Map<string, number>();
  files.forEach((file: FileTreeNode) => {
    const ext = file.name.includes(".")
      ? file.name.split(".").pop() || "no-extension"
      : "no-extension";
    extensionStats.set(ext, (extensionStats.get(ext) || 0) + 1);
  });

  console.log("\n=== File Type Distribution ===");
  for (const [ext, count] of extensionStats.entries()) {
    const icon = getFileIcon(ext === "no-extension" ? undefined : ext);
    console.log(`${icon} .${ext}: ${count} files`);
  }

  // Show size statistics
  const totalSize = files.reduce(
    (sum: number, file: FileTreeNode) => sum + file.size,
    0
  );
  const avgSize = totalSize / files.length;
  const maxSize = Math.max(...files.map((f: FileTreeNode) => f.size));
  const minSize = Math.min(...files.map((f: FileTreeNode) => f.size));

  console.log("\n=== Size Statistics ===");
  console.log(`Total size: ${formatFileSize(totalSize)}`);
  console.log(`Average file size: ${formatFileSize(avgSize)}`);
  console.log(`Largest file: ${formatFileSize(maxSize)}`);
  console.log(`Smallest file: ${formatFileSize(minSize)}`);

  // Show sample directory contents
  console.log("\n=== Sample Directory Structure ===");
  displayDirectoryContents(rootNode, 0, 3); // Show first 3 levels

  // Verify consistency - run generation again and compare
  console.log("\n=== Consistency Test ===");
  const rootNode2 = await generate10kFiles();
  const {
    totalItems: totalItems2,
    files: files2,
    directories: directories2,
  } = countNodes(rootNode2);
  const isConsistent =
    totalItems === totalItems2 &&
    files.length === files2.length &&
    directories.length === directories2.length &&
    compareNodeStructure(rootNode, rootNode2);

  console.log(`Consistency check: ${isConsistent ? "✅ PASSED" : "❌ FAILED"}`);

  return;
}

/**
 * Helper function to compare two tree structures for consistency
 */
function compareNodeStructure(
  node1: FileTreeNode,
  node2: FileTreeNode
): boolean {
  if (
    node1.name !== node2.name ||
    node1.type !== node2.type ||
    node1.size !== node2.size
  ) {
    return false;
  }

  if (node1.children.size !== node2.children.size) {
    return false;
  }

  for (const [name, child1] of node1.children) {
    const child2 = node2.children.get(name);
    if (!child2 || !compareNodeStructure(child1, child2)) {
      return false;
    }
  }

  return true;
}

/**
 * Recursively display directory contents up to a certain depth
 */
function displayDirectoryContents(
  node: FileTreeNode,
  currentDepth: number,
  maxDepth: number,
  prefix: string = ""
): void {
  if (currentDepth >= maxDepth) return;

  const children = Array.from(node.children.values());
  const indent = "  ".repeat(currentDepth);

  children.slice(0, 5).forEach((child) => {
    // Show max 5 items per directory
    const extension = child.name.includes(".")
      ? child.name.split(".").pop() || ""
      : "";
    const icon = child.type === "directory" ? "📁" : getFileIcon(extension);
    const sizeInfo =
      child.type === "file" ? ` (${formatFileSize(child.size)})` : "";
    console.log(`${indent}${icon} ${child.name}${sizeInfo}`);

    if (child.type === "directory") {
      displayDirectoryContents(
        child,
        currentDepth + 1,
        maxDepth,
        `${prefix}${child.name}/`
      );
    }
  });

  if (children.length > 5) {
    console.log(`${indent}... and ${children.length - 5} more items`);
  }
}

/**
 * Function to get files by extension for testing specific functionality
 */
export async function getFilesByExtension(
  extension: string
): Promise<FileTreeNode[]> {
  const rootNode = await generate10kFiles();
  const { files } = countNodes(rootNode);
  return files.filter((file) => {
    return file.name.endsWith(`.${extension}`);
  });
}

/**
 * Function to get all city files for weather API testing
 */
export async function getCityFiles(): Promise<FileTreeNode[]> {
  return await getFilesByExtension("city");
}

/**
 * Function to search files by name pattern
 */
export async function searchFiles(pattern: string): Promise<FileTreeNode[]> {
  const rootNode = await generate10kFiles();
  const { files, directories } = countNodes(rootNode);
  const regex = new RegExp(pattern, "i");
  return [...files, ...directories].filter((item) => regex.test(item.name));
}

// Export the test function for use in development
if (typeof window !== "undefined") {
  (window as any).testFileGeneration = testFileGeneration;
  (window as any).getCityFiles = getCityFiles;
  (window as any).searchFiles = searchFiles;
}
