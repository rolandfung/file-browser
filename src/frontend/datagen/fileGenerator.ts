import {
  FileNode,
  DirectoryStructure,
  FileExtension,
  FILE_ICONS,
} from "../types";

/**
 * Seeded random number generator for consistent results
 * Based on mulberry32 algorithm
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choice<T>(array: readonly T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
}

/**
 * Configuration for file generation
 */
const GENERATION_CONFIG = {
  TOTAL_FILES: 10000,
  MAX_DEPTH: 6,
  SEED: 42, // Fixed seed for consistent results

  // File type distributions (weights)
  FILE_TYPES: [
    {
      extensions: ["txt", "md"],
      weight: 20,
      sizeRange: { min: 1024, max: 50000 },
    },
    {
      extensions: ["js", "ts", "tsx", "jsx"],
      weight: 15,
      sizeRange: { min: 2048, max: 100000 },
    },
    {
      extensions: ["json", "xml", "yaml"],
      weight: 10,
      sizeRange: { min: 512, max: 25000 },
    },
    {
      extensions: ["jpg", "png", "gif"],
      weight: 15,
      sizeRange: { min: 50000, max: 2000000 },
    },
    {
      extensions: ["mp3", "mp4"],
      weight: 8,
      sizeRange: { min: 1000000, max: 50000000 },
    },
    {
      extensions: ["pdf", "doc", "docx"],
      weight: 12,
      sizeRange: { min: 100000, max: 5000000 },
    },
    {
      extensions: ["html", "css", "scss"],
      weight: 8,
      sizeRange: { min: 1024, max: 50000 },
    },
    {
      extensions: ["zip", "rar", "7z"],
      weight: 5,
      sizeRange: { min: 1000000, max: 100000000 },
    },
    {
      extensions: ["exe", "dmg"],
      weight: 3,
      sizeRange: { min: 5000000, max: 500000000 },
    },
    { extensions: ["city"], weight: 1, sizeRange: { min: 256, max: 1024 } }, // Special weather files
  ] as const,

  // Directory name patterns
  DIRECTORY_NAMES: [
    "Documents",
    "Pictures",
    "Videos",
    "Music",
    "Downloads",
    "Desktop",
    "Projects",
    "Code",
    "Development",
    "Work",
    "Personal",
    "Archive",
    "Resources",
    "Assets",
    "Images",
    "Scripts",
    "Config",
    "Data",
    "Backup",
    "Templates",
    "Libraries",
    "Tools",
    "Utils",
    "Components",
    "Services",
    "Models",
    "Views",
    "Controllers",
    "Middleware",
    "Tests",
    "Docs",
    "Notes",
    "Reports",
    "Presentations",
    "Spreadsheets",
    "Audio",
    "Podcasts",
    "Recordings",
    "Photos",
    "Screenshots",
    "Installers",
    "Software",
    "Games",
    "Media",
    "Books",
    "Articles",
  ] as const,

  // File name patterns by type
  FILE_NAME_PATTERNS: {
    code: [
      "index",
      "main",
      "app",
      "component",
      "service",
      "model",
      "controller",
      "utils",
      "helper",
      "config",
    ],
    document: [
      "readme",
      "notes",
      "report",
      "document",
      "manual",
      "guide",
      "tutorial",
      "spec",
    ],
    media: [
      "image",
      "photo",
      "video",
      "audio",
      "recording",
      "clip",
      "track",
      "song",
    ],
    data: [
      "data",
      "config",
      "settings",
      "preferences",
      "cache",
      "temp",
      "backup",
    ],
    generic: [
      "file",
      "item",
      "content",
      "sample",
      "test",
      "demo",
      "example",
      "template",
    ],
  } as const,

  // City names for .city files
  CITY_NAMES: [
    "london",
    "new_york",
    "boston",
    "san_francisco",
    "chicago",
    "miami",
    "seattle",
    "denver",
    "austin",
    "portland",
    "tokyo",
    "paris",
    "berlin",
    "madrid",
    "rome",
    "amsterdam",
    "stockholm",
    "oslo",
    "copenhagen",
    "helsinki",
    "sydney",
    "melbourne",
    "toronto",
    "vancouver",
    "montreal",
    "dublin",
    "edinburgh",
    "barcelona",
    "vienna",
    "zurich",
    "prague",
    "budapest",
    "warsaw",
    "moscow",
    "istanbul",
    "athens",
    "lisbon",
    "brussels",
    "luxembourg",
    "geneva",
    "florence",
    "venice",
    "naples",
    "munich",
    "hamburg",
    "cologne",
    "frankfurt",
    "stuttgart",
    "lyon",
    "marseille",
    "nice",
    "bordeaux",
    "strasbourg",
  ] as const,
};

const rootDir: FileNode = {
  id: "root",
  name: "root",
  type: "directory",
  path: "/",
  parentPath: "",
  level: 0,
  size: 0,
  created: new Date(),
  modified: new Date(),
};

/**
 * Generates a consistent set of 10,000 files across 6 directory levels
 */
export function generate10kFiles() {
  const rng = new SeededRandom(GENERATION_CONFIG.SEED);
  const files: FileNode[] = [];
  const directories: FileNode[] = [];
  const structure: DirectoryStructure = {};

  directories.push(rootDir);
  structure["/"] = rootDir;

  // Generate directory structure first (6 levels deep)
  let directoryCount = 1; // Start with root
  const maxDirectoriesPerLevel = [1, 8, 25, 60, 120, 200]; // Roughly exponential growth

  for (let level = 1; level <= GENERATION_CONFIG.MAX_DEPTH; level++) {
    const parentsAtPreviousLevel = directories.filter(
      (d) => d.level === level - 1
    );
    const targetDirsThisLevel = Math.min(
      maxDirectoriesPerLevel[level - 1],
      Math.floor(
        (GENERATION_CONFIG.TOTAL_FILES * 0.15) / GENERATION_CONFIG.MAX_DEPTH
      )
    );

    for (let i = 0; i < targetDirsThisLevel && directoryCount < 1500; i++) {
      const parent = rng.choice(parentsAtPreviousLevel);
      const dirName = rng.choice(GENERATION_CONFIG.DIRECTORY_NAMES);
      const uniqueName = `${dirName}_${level}_${i}`;
      const dirPath =
        parent.path === "/" ? `/${uniqueName}` : `${parent.path}/${uniqueName}`;

      const dir: FileNode = {
        id: `dir_${directoryCount}`,
        name: uniqueName,
        type: "directory",
        path: dirPath,
        parentPath: parent.path,
        level: level,
        size: 0,
        created: generateRandomDate(rng, "2025-01-01", "2025-09-01"),
        modified: generateRandomDate(rng, "2025-09-01", "2025-10-03"),
      };

      directories.push(dir);
      structure[dirPath] = dir;
      directoryCount++;
    }
  }

  // Generate files distributed across all directories
  let fileCount = 0;
  const targetFiles = GENERATION_CONFIG.TOTAL_FILES - directories.length;

  while (fileCount < targetFiles) {
    const parentDir = rng.choice(directories);
    const fileTypeGroup = selectWeightedFileType(rng);
    const extension = rng.choice(fileTypeGroup.extensions) as FileExtension;

    let uniqueName: string;

    // Special handling for .city files
    if (extension === "city") {
      const cityName = rng.choice(GENERATION_CONFIG.CITY_NAMES);
      uniqueName = `${cityName}.${extension}`;
    } else {
      const namePattern = getFileNamePattern(extension);
      const baseName = rng.choice(
        GENERATION_CONFIG.FILE_NAME_PATTERNS[namePattern]
      );
      uniqueName = `${baseName}_${fileCount + 1}.${extension}`;
    }

    const filePath =
      parentDir.path === "/"
        ? `/${uniqueName}`
        : `${parentDir.path}/${uniqueName}`;

    const file: FileNode = {
      id: `file_${fileCount}`,
      name: uniqueName,
      type: "file",
      path: filePath,
      parentPath: parentDir.path,
      level: parentDir.level + 1,
      size: rng.nextInt(
        fileTypeGroup.sizeRange.min,
        fileTypeGroup.sizeRange.max
      ),
      created: generateRandomDate(rng, "2025-01-01", "2025-09-01"),
      modified: generateRandomDate(rng, "2025-09-01", "2025-10-03"),
      extension: extension,
    };

    files.push(file);
    structure[filePath] = file;
    fileCount++;
  }

  console.log(
    `Generated ${directories.length} directories and ${files.length} files (${
      directories.length + files.length
    } total)`
  );

  return {
    files,
    directories,
    totalItems: files.length + directories.length,
    structure,
  };
}

/**
 * Selects a file type group based on weighted probabilities
 */
function selectWeightedFileType(rng: SeededRandom) {
  const totalWeight = GENERATION_CONFIG.FILE_TYPES.reduce(
    (sum, type) => sum + type.weight,
    0
  );
  let randomWeight = rng.nextInt(1, totalWeight);

  for (const fileType of GENERATION_CONFIG.FILE_TYPES) {
    randomWeight -= fileType.weight;
    if (randomWeight <= 0) {
      return fileType;
    }
  }

  return GENERATION_CONFIG.FILE_TYPES[0]; // Fallback
}

/**
 * Determines the appropriate name pattern based on file extension
 */
function getFileNamePattern(
  extension: FileExtension
): keyof typeof GENERATION_CONFIG.FILE_NAME_PATTERNS {
  const codeExtensions = ["js", "ts", "tsx", "jsx", "html", "css", "scss"];
  const documentExtensions = ["txt", "md", "pdf", "doc", "docx"];
  const mediaExtensions = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "svg",
    "mp3",
    "wav",
    "mp4",
    "avi",
    "mkv",
  ];
  const dataExtensions = ["json", "xml", "yaml", "yml"];

  if (codeExtensions.includes(extension)) return "code";
  if (documentExtensions.includes(extension)) return "document";
  if (mediaExtensions.includes(extension)) return "media";
  if (dataExtensions.includes(extension)) return "data";

  return "generic";
}

/**
 * Generates a random date between two dates using seeded random
 */
function generateRandomDate(
  rng: SeededRandom,
  startDate: string,
  endDate: string
): Date {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const randomTime =
    start.getTime() + rng.next() * (end.getTime() - start.getTime());
  return new Date(randomTime);
}

/**
 * Helper function to get file icon based on extension
 */
export function getFileIcon(extension?: string): string {
  if (!extension) return "📄";
  return FILE_ICONS[extension as FileExtension] || "📄";
}

/**
 * Helper function to format file size
 */
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * Helper function to build a tree structure from flat file list
 */
export function buildFileTree(nodes: FileNode[]): Map<string, FileNode[]> {
  const tree = new Map<string, FileNode[]>();

  nodes.forEach((node) => {
    const parentPath = node.parentPath;
    if (!tree.has(parentPath)) {
      tree.set(parentPath, []);
    }
    tree.get(parentPath)!.push(node);
  });

  // Sort children by type (directories first) then by name
  tree.forEach((children) => {
    children.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "directory" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  });

  return tree;
}

/**
 * Small set of static files for testing purposes
 */
export const STATIC_TEST_FILES: FileNode[] = [
  {
    id: "file_1",
    name: "readme.md",
    type: "file",
    path: "/readme.md",
    parentPath: "/",
    level: 1,
    size: 1024,
    created: new Date("2025-01-01"),
    modified: new Date("2025-01-02"),
    extension: "md",
  },
  {
    id: "file_2",
    name: "index.html",
    type: "file",
    path: "/index.html",
    parentPath: "/",
    level: 1,
    size: 2048,
    created: new Date("2025-01-01"),
    modified: new Date("2025-01-02"),
    extension: "html",
  },
  {
    id: "dir_1",
    name: "Documents",
    type: "directory",
    path: "/Documents",
    parentPath: "/",
    level: 1,
    size: 0,
    created: new Date("2025-01-01"),
    modified: new Date("2025-01-02"),
  },
  {
    id: "file_3",
    name: "report.pdf",
    type: "file",
    path: "/Documents/report.pdf",
    parentPath: "/Documents",
    level: 2,
    size: 5120,
    created: new Date("2025-01-01"),
    modified: new Date("2025-01-02"),
    extension: "pdf",
  },
  {
    id: "file_4",
    name: "photo.jpg",
    type: "file",
    path: "/Documents/photo.jpg",
    parentPath: "/Documents",
    level: 2,
    size: 3072,
    created: new Date("2025-01-01"),
    modified: new Date("2025-01-02"),
    extension: "jpg",
  },
];

export function generateEmptyFileSystem() {
  return {
    files: [] as FileNode[],
    directories: [rootDir],
    totalItems: 0,
    structure: {} as DirectoryStructure,
  };
}
