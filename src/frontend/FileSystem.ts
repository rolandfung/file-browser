import { FileNode } from "./types";

// This class separates out the underlying file manipulation logic from the UI logic,
// so that we can easily have multiple views on the same file system. View components
// can focus on handling navigation, selection, and action logic.

// File system structure and their related operations is more of an OS concern,
// and this is a very naive implementation for the sake of getting the UI working.
// A more robust implementation might involve tree structures, indexing for search, etc.
export class FileSystem {
  private _nodes: FileNode[];
  private _pathToNode: { [path: string]: FileNode };
  private _pathToNodeIdx: { [path: string]: number };

  constructor(files: FileNode[]) {
    this._nodes = files;
    this._pathToNode = {};
    this._pathToNodeIdx = {}; // makes O(1) file removal possible
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      this._pathToNode[f.path] = f;
      this._pathToNodeIdx[f.path] = i;
    }
  }

  // removes a file in O(1) time
  removeFileO1(path: string): FileNode | null {
    const idx = this._pathToNodeIdx[path];
    if (idx === undefined) {
      console.warn(`File at path ${path} not found`);
      return null;
    }
    // to make this constant time, swap with last element and pop from this._nodes
    const removedFile = this._nodes[idx];
    const lastFile = this._nodes[this._nodes.length - 1];
    this._nodes[idx] = lastFile;
    this._pathToNode[lastFile.path] = lastFile;
    this._pathToNodeIdx[lastFile.path] = idx;
    this._nodes.pop();
    delete this._pathToNode[path];
    delete this._pathToNodeIdx[path];

    return removedFile;
  }

  // straightforward wrapper of removeFileO1 that operates in O(n) time
  removeFiles(paths: string[]): FileNode[] {
    const pathSet = new Set(paths);
    const removedFiles = [];
    for (let path of pathSet) {
      const removedFile = this.removeFileO1(path);
      if (removedFile) {
        removedFiles.push(removedFile);
      }
    }
    // return for further operations, such as "undo" or "move"
    return removedFiles;
  }

  // adds file in O(1) time
  addFileO1(newFile: FileNode, targetDirPath?: string): void {
    if (this._pathToNode[newFile.path]) {
      console.warn(`File at path ${newFile.path} already exists`);
      return;
    }
    newFile.path = targetDirPath
      ? targetDirPath + newFile.path.substring(newFile.path.lastIndexOf("/"))
      : newFile.path;
    newFile.parentPath = targetDirPath ?? newFile.parentPath;
    this._nodes.push(newFile);
    this._pathToNode[newFile.path] = newFile;
    this._pathToNodeIdx[newFile.path] = this._nodes.length - 1;
  }

  // Search files by name (case insensitive)
  searchFiles(query: string, rootPath?: string): FileNode[] {
    const lowerQuery = query.toLowerCase();
    const filesToSearch = rootPath
      ? Object.values(this._pathToNode).filter((f) =>
          f.path.startsWith(rootPath)
        )
      : this._nodes;
    return filesToSearch.filter((file) =>
      file.name.toLowerCase().includes(lowerQuery)
    );
  }

  // user may select multiple files from anywhere in the file system
  // and drop them into a target directory
  moveFiles(selectedPaths: string[], targetDirPath: string): void {
    const targetDir = this._pathToNode[targetDirPath];
    if (!targetDir || targetDir.type !== "directory") {
      throw new Error(`Target path ${targetDirPath} is not a valid directory`);
    }

    // build up pathsToMove, making sure to capture all child nodes of selected directories and their subdirectories
    type OriginalPath = string;
    type TargetDirPath = string;
    const pathsToMove = new Map<OriginalPath, TargetDirPath>();

    // first grab the user selected nodes, whether they are directories or files
    for (let path of selectedPaths) {
      if (path === targetDirPath) {
        console.warn(`Cannot move directory ${path} into itself`);
      } else {
        pathsToMove.set(path, targetDirPath);
      }
    }

    // then simply filter through all of this._nodes to find children selected nodes
    // since this is a flat list, no need for recursion
    for (let f of this._nodes) {
      for (let path of selectedPaths) {
        // e.g. /a
        if (
          f.type === "directory" &&
          f.path.startsWith(path + "/") && // child of selected directory, /a/b/c.txt is child of /a which was selected
          f.path !== path // and not the directory itself, /a
        ) {
          pathsToMove.set(
            f.path, // original path, /a/b/c.txt
            // form the new parent path, e.g. /d (the targetDirPath) + /b (taking /b from /a/b/c.txt)
            targetDirPath +
              f.path.substring(path.length, f.path.lastIndexOf("/"))
          );
        }
      }
    }

    // remove files from current locations
    const filesToMove = this.removeFiles(Array.from(pathsToMove.keys()));

    // add files to target directory
    for (let file of filesToMove) {
      const newParentPath = pathsToMove.get(file.path);
      if (!newParentPath) {
        console.warn(`No target path found for file ${file.path}`);
        continue;
      }
      this.addFileO1(file, newParentPath);
    }
  }

  // UI helper for expanding directories
  getChildrenFiles(targetDirPath: string): FileNode[] {
    return this._nodes.filter((f) => f.parentPath === targetDirPath);
  }
}
