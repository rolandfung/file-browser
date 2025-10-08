// TypeScript interfaces and types for the file explorer
import { FileTreeNode } from "./FileTreeNode";
type ParentNode = FileTreeNode;

export type TreeOperation = {
  type: "delete" | "add" | "move";
  addDeleteNodes?: FileTreeNode[]; // the added or deleted nodes for type "add" or "delete"
  movedNodes?: Map<FileTreeNode, ParentNode>; // map of nodes to their original parents for type "move"
};

// Tree-based conflict types
export interface TreeFileConflict {
  type: "conflict";
  message: string;
  originalNode: FileTreeNode;
  existingNode: FileTreeNode;
  targetParent: FileTreeNode;
}

export type ConflictResolution = "replace" | "skip" | "cancel";

// Enhanced tree-based conflict resolution
export type TreeConflictResolution =
  | "replace" // Replace existing file/directory
  | "skip" // Skip this operation
  | "cancel" // Cancel entire operation
  | "rename" // Auto-rename with suffix
  | "merge"; // Merge directories (files only)

export interface MoveResult {
  cancelled: boolean;
  moved: FileTreeNode[];
}

// Tree-based move result
export interface TreeMoveResult {
  cancelled: boolean;
  moved: FileTreeNode[];
  conflicts: TreeFileConflict[];
  affectedPaths: string[];
}

export interface ProgressUpdate {
  type: "progress";
  current: number;
  total: number;
  currentFile: string;
  percentage: number;
}

// Tree-based file system structures

// Result type for tree-based file generation
export interface FileSystemTreeResult {
  root: FileTreeNode;
  totalNodes: number;
  maxDepth: number;
}

// Tree traversal and operation types
export interface TreeTraversalOptions {
  startingRoot?: FileTreeNode; // Start traversal from this node instead of root
  maxDepth?: number;
  includeDirectories?: boolean;
  includeFiles?: boolean;
  sortFunction?: (a: FileTreeNode, b: FileTreeNode) => number;
}

export interface TreeOperationResult {
  success: boolean;
  affectedPaths: string[];
  modifiedNodes: FileTreeNode[];
  error?: string;
}

// Tree-based move operation types
export interface TreeMoveOperation {
  sourceNode: FileTreeNode;
  targetParent: FileTreeNode;
  newName?: string;
  preserveStructure: boolean;
}

export interface FileTreeGenerationConfig {
  totalFiles: number;
  maxDepth: number;
  seed: number;
  fileTypes: FileType[];
}

export interface FileType {
  extension: string;
  icon: string;
  mimeType: string;
  sizeRange: {
    min: number;
    max: number;
  };
}

export type FileExtension =
  | "txt"
  | "md"
  | "doc"
  | "docx"
  | "pdf"
  | "jpg"
  | "jpeg"
  | "png"
  | "gif"
  | "svg"
  | "bmp"
  | "mp3"
  | "wav"
  | "mp4"
  | "avi"
  | "mkv"
  | "js"
  | "ts"
  | "tsx"
  | "jsx"
  | "html"
  | "css"
  | "scss"
  | "json"
  | "xml"
  | "yaml"
  | "yml"
  | "zip"
  | "rar"
  | "7z"
  | "tar"
  | "gz"
  | "exe"
  | "dmg"
  | "deb"
  | "rpm"
  | "city"; // Special extension for weather API

export type FileIconMapping = {
  [key in FileExtension]: string;
};

export const FILE_ICONS: FileIconMapping = {
  // Documents
  txt: "📄",
  md: "📝",
  doc: "📄",
  docx: "📄",
  pdf: "📋",

  // Images
  jpg: "🖼️",
  jpeg: "🖼️",
  png: "🖼️",
  gif: "🖼️",
  svg: "🖼️",
  bmp: "🖼️",

  // Media
  mp3: "🎵",
  wav: "🎵",
  mp4: "🎬",
  avi: "🎬",
  mkv: "🎬",

  // Code
  js: "💻",
  ts: "💻",
  tsx: "💻",
  jsx: "💻",
  html: "🌐",
  css: "🎨",
  scss: "🎨",

  // Data
  json: "📊",
  xml: "📊",
  yaml: "📊",
  yml: "📊",

  // Archives
  zip: "📦",
  rar: "📦",
  "7z": "📦",
  tar: "📦",
  gz: "📦",

  // Executables
  exe: "⚙️",
  dmg: "💿",
  deb: "📦",
  rpm: "📦",

  // Special
  city: "🏙️",
};

export const FOLDER_ICON = "📁";
export const EXPANDED_FOLDER_ICON = "📂";
