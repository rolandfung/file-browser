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
import { generate10kFiles } from './fileSystemHelpers';

const result = generate10kFiles();
console.log(`Generated ${result.totalItems} items`);
console.log(`Directories: ${result.directories.length}`);
console.log(`Files: ${result.files.length}`);
```

### Testing and Demonstration

```typescript
import { testFileGeneration } from './fileSystemHelpers';

// Run comprehensive test with statistics
testFileGeneration();
```

### Searching and Filtering

```typescript
import { getCityFiles, searchFiles, getFilesByExtension } from './fileSystemHelpers';

// Get all city files for weather API testing
const cityFiles = getCityFiles();

// Search files by pattern
const jsFiles = getFilesByExtension('js');
const readmeFiles = searchFiles('readme');
```

### Building Tree Structure

```typescript
import { buildFileTree } from './fileSystemHelpers';

const result = generate10kFiles();
const tree = buildFileTree([...result.directories, ...result.files]);

// tree is a Map<string, FileNode[]> where key is parent path
const rootChildren = tree.get('/'); // Get root level items
```

## File Types and Distribution

The generator creates files with realistic distributions:

| Category | Extensions | Weight | Size Range |
|----------|------------|--------|------------|
| Documents | txt, md | 20% | 1KB - 50KB |
| Code | js, ts, tsx, jsx | 15% | 2KB - 100KB |
| Data | json, xml, yaml | 10% | 512B - 25KB |
| Images | jpg, png, gif | 15% | 50KB - 2MB |
| Media | mp3, mp4 | 8% | 1MB - 50MB |
| Office | pdf, doc, docx | 12% | 100KB - 5MB |
| Web | html, css, scss | 8% | 1KB - 50KB |
| Archives | zip, rar, 7z | 5% | 1MB - 100MB |
| Executables | exe, dmg | 3% | 5MB - 500MB |
| Special | city | 1% | 256B - 1KB |

## Directory Structure

The generator creates directories with realistic names:
- System folders: Documents, Pictures, Videos, Music, Downloads
- Development folders: Projects, Code, Development, Components, Services
- Content folders: Resources, Assets, Templates, Libraries
- And many more...

## Data Types

### Core Types

```typescript
interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  path: string;
  parentPath: string;
  level: number;
  size: number;
  created: Date;
  modified: Date;
  extension?: string;
}

interface FileSystemHelpers {
  files: FileNode[];
  directories: FileNode[];
  totalItems: number;
  structure: DirectoryStructure;
}

interface DirectoryStructure {
  [path: string]: FileNode;
}
```

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