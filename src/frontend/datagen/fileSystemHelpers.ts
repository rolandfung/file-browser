// Main exports for the file generation system
export * from "../types";
export * from "./fileGenerator";
export * from "./fileGenerationTest";

// Re-export key functions for convenience
export {
  generate10kFiles,
  generateEmptyFileSystem,
  buildFileTree,
  getFileIcon,
  formatFileSize,
} from "./fileGenerator";

export {
  testFileGeneration,
  getCityFiles,
  searchFiles,
  getFilesByExtension,
} from "./fileGenerationTest";
