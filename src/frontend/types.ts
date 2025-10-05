// TypeScript interfaces and types for the file explorer

// For UI representation of files and directories
export interface FileSystemItem {
  id: string;
  name: string;
  type: "file" | "directory";
  path: string;
  parentId: string | null;
  size: number;
  created: Date;
  modified: Date;
  extension?: string;
  children?: FileSystemItem[];
}

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "directory";
  path: string;
  parentPath: string;
  level: number;
  size: number;
  created: Date;
  modified: Date;
  extension?: string;
}

export interface FileConflict {
  type: "conflict";
  message: string;
  originalFile: FileNode;
  existingFile: FileNode;
  targetPath: string;
}

export type ConflictResolution = "replace" | "skip" | "cancel";

export interface MoveResult {
  cancelled: boolean;
  moved: FileNode[];
}

export interface ProgressUpdate {
  type: "progress";
  current: number;
  total: number;
  currentFile: string;
  percentage: number;
}

export interface DirectoryStructure {
  [path: string]: FileNode;
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
