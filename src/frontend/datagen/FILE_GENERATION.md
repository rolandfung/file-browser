# File Generation System

This system generates a consistent set of 10,000 files across 6 directory levels for testing the file explorer application.

## Features

- **Consistent Generation**: Uses a seeded random number generator (seed: 42) to ensure the exact same file structure is generated every time
- **Realistic Distribution**: Files are distributed across realistic directory structures with appropriate file types and sizes
- **6 Levels Deep**: Directory structure goes 6 levels deep as required
- **Multiple File Types**: Supports various file extensions with appropriate icons and size ranges
- **Special Features**: Includes `.city` files for weather API integration testing

## Usage

### Basic Generation

```typescript
import { generate10kFiles } from "./fileSystemHelpers";

const rootNode = await generate10kFiles();

// Count all nodes in the tree
function countNodes(root) {
  const directories = [];
  const files = [];

  function traverse(node) {
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
  return { directories, files, totalItems: directories.length + files.length };
}

const { directories, files, totalItems } = countNodes(rootNode);
console.log(`Generated ${totalItems} items`);
console.log(`Directories: ${directories.length}`);
console.log(`Files: ${files.length}`);
```

### Testing and Demonstration

```typescript
import { testFileGeneration } from "./fileSystemHelpers";

// Run comprehensive test with statistics
testFileGeneration();
```

### Searching and Filtering

```typescript
import {
  getCityFiles,
  searchFiles,
  getFilesByExtension,
} from "./fileSystemHelpers";

// Get all city files for weather API testing
const cityFiles = await getCityFiles();

// Search files by pattern
const jsFiles = await getFilesByExtension("js");
const readmeFiles = await searchFiles("readme");

// Or search directly on the tree
const rootNode = await generate10kFiles();
const allJsFiles = rootNode.search((node) => node.extension === "js");
const allReadmeFiles = rootNode.search((node) => /readme/i.test(node.name));
```

### Working with Tree Structure

```typescript
import { generate10kFiles } from "./fileSystemHelpers";

const rootNode = await generate10kFiles();

// Access direct children of root
const rootChildren = Array.from(rootNode.children.values());

// Search within the tree
const jsFiles = rootNode.search((node) => node.extension === "js");

// Get full path of any node
const fullPath = someNode.getFullNodePath();

// Check relationships
const isDescendant = childNode.isDescendantOf(ancestorNode);
```

## File Types and Distribution

The generator creates files with realistic distributions:

| Category    | Extensions       | Weight | Size Range  |
| ----------- | ---------------- | ------ | ----------- |
| Documents   | txt, md          | 20%    | 1KB - 50KB  |
| Code        | js, ts, tsx, jsx | 15%    | 2KB - 100KB |
| Data        | json, xml, yaml  | 10%    | 512B - 25KB |
| Images      | jpg, png, gif    | 15%    | 50KB - 2MB  |
| Media       | mp3, mp4         | 8%     | 1MB - 50MB  |
| Office      | pdf, doc, docx   | 12%    | 100KB - 5MB |
| Web         | html, css, scss  | 8%     | 1KB - 50KB  |
| Archives    | zip, rar, 7z     | 5%     | 1MB - 100MB |
| Executables | exe, dmg         | 3%     | 5MB - 500MB |
| Special     | city             | 1%     | 256B - 1KB  |

## Directory Structure

The generator creates directories with realistic names:

- System folders: Documents, Pictures, Videos, Music, Downloads
- Development folders: Projects, Code, Development, Components, Services
- Content folders: Resources, Assets, Templates, Libraries
- And many more...

## Data Types

### Core Types

```typescript
class FileTreeNode extends EventTarget {
  children: Map<string, FileTreeNode> = new Map();
  parent: FileTreeNode | null = null;
  name: string;
  type: "file" | "directory";
  size: number; // 0 for directories
  created: Date;
  extension?: string;

  constructor(
    name: string,
    type: "file" | "directory",
    size: number = 0,
    created: Date = new Date(),
    extension?: string
  );

  getFullNodePath(): string;
  search(predicate: (node: FileTreeNode) => boolean): FileTreeNode[];
  isDescendantOf(potentialAncestor: FileTreeNode): boolean;
}
```

### Return Types

The `generate10kFiles()` function now returns a single `FileTreeNode` representing the root of the tree, rather than flat arrays. This provides a more natural tree structure with parent-child relationships.

## Performance

- Generation typically completes in under 100ms
- Generates exactly 10,000 items (files + directories)
- Uses efficient algorithms to ensure realistic distribution
- Memory efficient with flat structure and tree building utilities

## Testing

The system includes comprehensive testing utilities:

- **Consistency Test**: Verifies the same structure is generated each time
- **Distribution Analysis**: Shows file type and size distributions
- **Performance Metrics**: Measures generation time
- **Structure Validation**: Ensures proper 6-level depth

## Integration

The file generation is integrated into the main App component with:

- Generate button to create files
- Console test button for detailed analysis
- City files viewer for weather API testing
- Real-time feedback on generation progress

## Browser Console Access

When running in the browser, these functions are available globally:

- `testFileGeneration()` - Run full test suite
- `getCityFiles()` - Get all .city files
- `searchFiles(pattern)` - Search by name pattern
