type Action = {
  type: "create" | "delete" | "move";
  files: FileNode[];
  originalPaths?: { [newPath: string]: string }; // for move actions, map of newPath to originalPath
};

import {
  FileNode,
  FileConflict,
  ConflictResolution,
  MoveResult,
  ProgressUpdate,
} from "./types";
// This class separates out the underlying file manipulation logic from the UI logic,
// so that we can easily have multiple views on the same file system. View components
// can focus on handling navigation, selection, and action logic.

// File system structure and their related operations is more of an OS concern,
// and this is a very naive implementation for the sake of getting the UI working.
// A more robust implementation might involve tree structures, indexing for search, etc.
export class FileSystem extends EventTarget {
  nodes: FileNode[];
  // makes O(1) file removal possible by doing a swap-and-pop
  private _pathToNodeIdx: { [path: string]: number };
  private _lastAction: Action | null = null;

  constructor(fsNodes: FileNode[]) {
    super();
    this.nodes = fsNodes;
    this._pathToNodeIdx = {};
    for (let i = 0; i < fsNodes.length; i++) {
      const f = fsNodes[i];
      this._pathToNodeIdx[f.path] = i;
    }
  }

  undoLastAction(): FileNode[] {
    if (!this._lastAction) {
      console.warn("No last action to undo");
      return [];
    }

    const undoneFiles: FileNode[] = [];
    if (this._lastAction.type === "create") {
      // undo create by removing the created files
      for (let file of this._lastAction.files) {
        const removedFile = this._removeFileO1(file.path);
        this._debouncedChangeEvent([file.parentPath]);
        if (removedFile) {
          undoneFiles.push(removedFile);
        }
      }
    } else if (this._lastAction.type === "delete") {
      // undo delete by re-adding the deleted files
      for (let file of this._lastAction.files) {
        this._addFileO1(file, file.parentPath);
        this._debouncedChangeEvent([file.parentPath]);
        undoneFiles.push(file);
      }
    } else if (this._lastAction.type === "move") {
      Object.entries(this._lastAction.originalPaths || {}).forEach(
        ([newPath, originalPath]) => {
          const file = this.getNode(newPath);
          if (file) {
            this._removeFileO1(file.path);
            file.path = originalPath;
            file.parentPath =
              originalPath.substring(0, originalPath.lastIndexOf("/")) || "/";
            this._addFileO1(file);
            this._debouncedChangeEvent([file.parentPath]);
            undoneFiles.push(file);
          }
        }
      );
    }

    // Clear last action after undo
    this._lastAction = null;
    return undoneFiles;
  }

  /**
   * Private methods
   * These methods are internal helpers and should not be exposed publicly.
   * They handle low-level operations like adding/removing files in O(1) time.
   * Public methods should use these helpers to ensure consistency and emit events.
   */
  // adds file in O(1) time. Note that this does not check for conflicts, it simply replaces.
  _addFileO1(newFile: FileNode, targetDirPath?: string): void {
    if (targetDirPath !== undefined) {
      // Construct the new path by combining the target directory with the filename
      const fileName = newFile.path.substring(newFile.path.lastIndexOf("/"));
      newFile.path =
        targetDirPath === "/" ? fileName : targetDirPath + fileName;
      newFile.parentPath = targetDirPath;
    }
    // if exists, remove it first
    if (this._pathToNodeIdx[newFile.path] !== undefined) {
      this._removeFileO1(newFile.path);
    }
    this.nodes.push(newFile);
    this._pathToNodeIdx[newFile.path] = this.nodes.length - 1;
  }

  // removes a file in O(1) time
  _removeFileO1(path: string): FileNode | null {
    const idx = this._pathToNodeIdx[path];
    if (idx === undefined) {
      console.warn(`File at path ${path} not found`);
      return null;
    }
    // to make this constant time, swap with last element and pop from this.nodes
    const removedFile = this.nodes[idx];
    const lastFile = this.nodes[this.nodes.length - 1];
    this.nodes[idx] = lastFile;
    this._pathToNodeIdx[lastFile.path] = idx;
    this.nodes.pop();
    delete this._pathToNodeIdx[path];

    return removedFile;
  }

  // To avoid excessive re-renders in view, debounce change events to 300ms.
  // This method accumulates the changed paths and emits them in a batch
  private readonly _debouncedChangeEvent: (paths: string[]) => void = (() => {
    let timeout: NodeJS.Timeout | null = null;
    let accumulatedPaths: Set<string> = new Set();
    return (paths: string[]) => {
      paths.forEach((p) => accumulatedPaths.add(p));
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.dispatchEvent(
          new CustomEvent<string[]>("change", {
            detail: Array.from(accumulatedPaths),
          })
        );
        accumulatedPaths.clear();
        timeout = null;
      }, 300);
    };
  })();

  /**
   * Public methods
   * These methods are the main API for interacting with the file system.
   * They handle higher-level operations like moving files, creating/deleting files,
   * and searching. They should ensure consistency and emit appropriate events.
   */

  // Search files by name (case insensitive)
  searchFiles(query: string, rootPath?: string): FileNode[] {
    const lowerQuery = query.toLowerCase();
    const filesToSearch = rootPath
      ? this.nodes.filter((f) => f.path.startsWith(rootPath))
      : this.nodes;
    return filesToSearch.filter((file) =>
      file.name.toLowerCase().includes(lowerQuery)
    );
  }

  // straightforward wrapper of _removeFileO1 that operates in O(n) time
  removeFiles(paths: string[]): FileNode[] {
    const pathSet = new Set(paths);

    // Add all child files and directories of the selected paths
    for (let node of this.nodes) {
      for (let path of pathSet) {
        if (node.path.startsWith(path + "/") && node.path !== path) {
          pathSet.add(node.path);
        }
      }
    }

    const removedFiles = [];
    for (let path of pathSet) {
      const removedFile = this._removeFileO1(path);
      this._debouncedChangeEvent([path]);
      if (removedFile) {
        removedFiles.push(removedFile);
      }
    }

    // store the last action for potential undo
    this._lastAction = { type: "delete", files: removedFiles };

    // return for further operations, such as "undo" or "move"
    return removedFiles;
  }

  createFileOrDirectory(partialNode: Partial<FileNode>): FileNode {
    const newNode: Partial<FileNode> = {
      ...partialNode,
      size: partialNode.type === "file" ? 0 : 0, // directories have size 0 for simplicity
      created: new Date(),
      modified: new Date(),
      extension:
        partialNode.type === "file"
          ? partialNode.name.split(".").pop() || ""
          : undefined,
    };
    this._addFileO1(newNode as FileNode, partialNode.parentPath);

    this._debouncedChangeEvent([newNode.parentPath]);

    // store the last action for potential undo
    this._lastAction = { type: "create", files: [newNode as FileNode] };

    return this.nodes[this.nodes.length - 1]; // return the newly added node
  }

  // Generator-based file move with conflict resolution and progress updates
  *moveFiles(
    selectedPaths: string[],
    targetDirPath: string
  ): Generator<
    FileConflict | ProgressUpdate,
    MoveResult,
    ConflictResolution | void
  > {
    const targetDir = this.nodes[this._pathToNodeIdx[targetDirPath]];
    if (!targetDir || targetDir.type !== "directory") {
      throw new Error(`Target path ${targetDirPath} is not a valid directory`);
    }

    type OriginalPath = string;
    type NewPath = string;
    const oldToNewPath = new Map<OriginalPath, NewPath>();

    const conflicts: Array<{
      originalPath: string;
      targetPath: string;
      existingFile: FileNode;
    }> = [];

    // Build the move map with complete file paths
    for (let path of selectedPaths) {
      if (path === targetDirPath) {
        console.warn(`Cannot move directory ${path} into itself`);
      } else {
        const fileName = path.substring(path.lastIndexOf("/"));
        const newPath =
          targetDirPath === "/" ? fileName : targetDirPath + fileName;
        oldToNewPath.set(path, newPath);
      }
    }

    // Add child files and directories of selected directories
    for (let n of this.nodes) {
      for (let path of selectedPaths) {
        if (n.path.startsWith(path + "/") && n.path !== path) {
          // Get the new path of the parent directory
          const parentNewPath = oldToNewPath.get(path);
          if (parentNewPath) {
            // Calculate the relative path from the selected directory to this file/directory
            const relativePath = n.path.substring(path.length); // includes leading "/"

            // For nested items, preserve the directory structure under the new parent location
            const newPath = parentNewPath + relativePath;

            oldToNewPath.set(n.path, newPath);
          }
        }
      }
    }

    // Check for conflicts before moving (only check file conflicts, skip directory conflicts)
    for (let [originalPath, newPath] of oldToNewPath) {
      const existingFile = this.nodes[this._pathToNodeIdx[newPath]];

      if (existingFile && existingFile.path !== originalPath) {
        const originalFile = this.nodes[this._pathToNodeIdx[originalPath]];
        // Only report conflicts for files, directories can be merged
        if (originalFile && originalFile.type === "file") {
          conflicts.push({ originalPath, targetPath: newPath, existingFile });
        }
      }
    }

    // Yield conflicts for user decision
    for (let conflict of conflicts) {
      const decision = yield {
        type: "conflict",
        message: `File "${conflict.existingFile.name}" already exists in target directory`,
        originalFile: this.nodes[this._pathToNodeIdx[conflict.originalPath]],
        existingFile: conflict.existingFile,
        targetPath: conflict.targetPath,
      };

      if (decision === "cancel") {
        return { cancelled: true, moved: [] };
      } else if (decision === "skip") {
        oldToNewPath.delete(conflict.originalPath);
      }
    }

    // Now perform the actual move with progress updates
    const filesToMove = this.removeFiles(Array.from(oldToNewPath.keys()));
    const movedFiles: FileNode[] = [];
    const totalFiles = filesToMove.length;

    for (let i = 0; i < filesToMove.length; i++) {
      const file = filesToMove[i];
      const newPath = oldToNewPath.get(file.path);
      if (!newPath) continue;

      file.path = newPath;
      file.parentPath =
        file.path.substring(0, file.path.lastIndexOf("/")) || "/";
      this._addFileO1(file);
      movedFiles.push(file);

      // Yield progress update
      yield {
        type: "progress",
        current: i + 1,
        total: totalFiles,
        currentFile: file.name,
        percentage: Math.round(((i + 1) / totalFiles) * 100),
      };
    }

    // store the last action for potential undo
    this._lastAction = {
      type: "move",
      files: movedFiles,
      // reverse of newToOldPath, a map of newPath to originalPath
      originalPaths: Object.fromEntries(
        Array.from(oldToNewPath.entries()).map(([oldPath, newPath]) => [
          newPath,
          oldPath,
        ])
      ),
    };

    return { cancelled: false, moved: movedFiles };
  }

  // UI helpers
  getNode(path: string): FileNode | null {
    return this.nodes[this._pathToNodeIdx[path]] ?? null;
  }
  getChildNodes(targetDirPath: string): FileNode[] {
    return this.nodes.filter((f) => f.parentPath === targetDirPath);
  }
  getNodes(paths: string[]): FileNode[] {
    const result: FileNode[] = [];
    for (let path of paths) {
      const node = this.nodes[this._pathToNodeIdx[path]];
      if (node) {
        result.push(node);
      }
    }
    return result;
  }
  searchNodesInPath(query: string, dirPath: string): FileNode[] {
    return this.nodes.filter((f) => {
      return f.path.startsWith(dirPath) && f.name.match(new RegExp(query, "i"));
    });
  }
}
