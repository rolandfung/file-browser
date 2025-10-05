import { generate10kFiles, buildFileTree, getFileIcon, formatFileSize } from './fileGenerator';
import { FileNode } from './types';

/**
 * Test function to demonstrate the file generation
 */
export function testFileGeneration(): void {
  console.log('Generating 10,000 test files...');
  const startTime = performance.now();
  
  const result = generate10kFiles();
  
  const endTime = performance.now();
  console.log(`Generation completed in ${(endTime - startTime).toFixed(2)}ms`);
  
  // Display statistics
  console.log('\n=== Generation Statistics ===');
  console.log(`Total items: ${result.totalItems}`);
  console.log(`Directories: ${result.directories.length}`);
  console.log(`Files: ${result.files.length}`);
  
  // Show depth distribution
  const depthStats = new Map<number, number>();
  [...result.directories, ...result.files].forEach(item => {
    depthStats.set(item.level, (depthStats.get(item.level) || 0) + 1);
  });
  
  console.log('\n=== Depth Distribution ===');
  for (const [level, count] of depthStats.entries()) {
    console.log(`Level ${level}: ${count} items`);
  }
  
  // Show file type distribution
  const extensionStats = new Map<string, number>();
  result.files.forEach(file => {
    const ext = file.extension || 'no-extension';
    extensionStats.set(ext, (extensionStats.get(ext) || 0) + 1);
  });
  
  console.log('\n=== File Type Distribution ===');
  for (const [ext, count] of extensionStats.entries()) {
    const icon = getFileIcon(ext === 'no-extension' ? undefined : ext);
    console.log(`${icon} .${ext}: ${count} files`);
  }
  
  // Show size statistics
  const totalSize = result.files.reduce((sum, file) => sum + file.size, 0);
  const avgSize = totalSize / result.files.length;
  const maxSize = Math.max(...result.files.map(f => f.size));
  const minSize = Math.min(...result.files.map(f => f.size));
  
  console.log('\n=== Size Statistics ===');
  console.log(`Total size: ${formatFileSize(totalSize)}`);
  console.log(`Average file size: ${formatFileSize(avgSize)}`);
  console.log(`Largest file: ${formatFileSize(maxSize)}`);
  console.log(`Smallest file: ${formatFileSize(minSize)}`);
  
  // Build tree structure
  const tree = buildFileTree([...result.directories, ...result.files]);
  
  // Show sample directory contents
  console.log('\n=== Sample Directory Structure ===');
  displayDirectoryContents(tree, '/', 0, 3); // Show first 3 levels
  
  // Verify consistency - run generation again and compare
  console.log('\n=== Consistency Test ===');
  const result2 = generate10kFiles();
  const isConsistent = 
    result.totalItems === result2.totalItems &&
    result.files.length === result2.files.length &&
    result.directories.length === result2.directories.length &&
    result.files.every((file, index) => 
      file.name === result2.files[index].name &&
      file.path === result2.files[index].path &&
      file.size === result2.files[index].size
    );
  
  console.log(`Consistency check: ${isConsistent ? '✅ PASSED' : '❌ FAILED'}`);
  
  return;
}

/**
 * Recursively display directory contents up to a certain depth
 */
function displayDirectoryContents(
  tree: Map<string, FileNode[]>, 
  path: string, 
  currentDepth: number, 
  maxDepth: number
): void {
  if (currentDepth >= maxDepth) return;
  
  const children = tree.get(path) || [];
  const indent = '  '.repeat(currentDepth);
  
  children.slice(0, 5).forEach(child => { // Show max 5 items per directory
    const icon = child.type === 'directory' ? '📁' : getFileIcon(child.extension);
    const sizeInfo = child.type === 'file' ? ` (${formatFileSize(child.size)})` : '';
    console.log(`${indent}${icon} ${child.name}${sizeInfo}`);
    
    if (child.type === 'directory') {
      displayDirectoryContents(tree, child.path, currentDepth + 1, maxDepth);
    }
  });
  
  if (children.length > 5) {
    console.log(`${indent}... and ${children.length - 5} more items`);
  }
}

/**
 * Function to get files by extension for testing specific functionality
 */
export function getFilesByExtension(extension: string): FileNode[] {
  const result = generate10kFiles();
  return result.files.filter(file => file.extension === extension);
}

/**
 * Function to get all city files for weather API testing
 */
export function getCityFiles(): FileNode[] {
  return getFilesByExtension('city');
}

/**
 * Function to search files by name pattern
 */
export function searchFiles(pattern: string): FileNode[] {
  const result = generate10kFiles();
  const regex = new RegExp(pattern, 'i');
  return [...result.files, ...result.directories].filter(item => 
    regex.test(item.name)
  );
}

// Export the test function for use in development
if (typeof window !== 'undefined') {
  (window as any).testFileGeneration = testFileGeneration;
  (window as any).getCityFiles = getCityFiles;
  (window as any).searchFiles = searchFiles;
}