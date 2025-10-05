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

  constructor(fsNodes: FileNode[]) {
    super();
    this.nodes = fsNodes;
    this._pathToNodeIdx = {};
    for (let i = 0; i < fsNodes.length; i++) {
      const f = fsNodes[i];
      this._pathToNodeIdx[f.path] = i;
    }
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
  private readonly debouncedChangeEvent: (paths: string[]) => void = (() => {
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

  // straightforward wrapper of _removeFileO1 that operates in O(n) time
  removeFiles(paths: string[]): FileNode[] {
    const pathSet = new Set(paths);
    const removedFiles = [];
    for (let path of pathSet) {
      const removedFile = this._removeFileO1(path);
      this.debouncedChangeEvent([path]);
      if (removedFile) {
        removedFiles.push(removedFile);
      }
    }

    // return for further operations, such as "undo" or "move"
    return removedFiles;
  }

  // adds file in O(1) time. Note that this does not check for conflicts, it simply overwrites.
  _addFileO1(newFile: FileNode, targetDirPath?: string): void {
    newFile.path = targetDirPath
      ? targetDirPath + newFile.path.substring(newFile.path.lastIndexOf("/"))
      : newFile.path;
    newFile.parentPath = targetDirPath ?? newFile.parentPath;
    this.nodes.push(newFile);
    this._pathToNodeIdx[newFile.path] = this.nodes.length - 1;
  }

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
    type TargetDirPath = string;
    const pathsToMove = new Map<OriginalPath, TargetDirPath>();
    const conflicts: Array<{
      originalPath: string;
      targetPath: string;
      existingFile: FileNode;
    }> = [];

    // Build the move map (same logic as before)
    for (let path of selectedPaths) {
      if (path === targetDirPath) {
        console.warn(`Cannot move directory ${path} into itself`);
      } else {
        pathsToMove.set(path, targetDirPath);
      }
    }

    // Add child files of selected directories
    for (let f of this.nodes) {
      for (let path of selectedPaths) {
        if (
          f.type === "directory" &&
          f.path.startsWith(path + "/") &&
          f.path !== path
        ) {
          pathsToMove.set(
            f.path,
            targetDirPath +
              f.path.substring(path.length, f.path.lastIndexOf("/"))
          );
        }
      }
    }

    // Check for conflicts before moving
    for (let [originalPath, newParentPath] of pathsToMove) {
      const file = this.nodes[this._pathToNodeIdx[originalPath]];
      if (!file) continue;

      const newPath =
        newParentPath === "/"
          ? `/${file.name}`
          : `${newParentPath}/${file.name}`;
      const existingFile = this.nodes[this._pathToNodeIdx[newPath]];

      if (existingFile && existingFile.path !== originalPath) {
        conflicts.push({ originalPath, targetPath: newPath, existingFile });
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
      } satisfies FileConflict;

      if (decision === "cancel") {
        return { cancelled: true, moved: [] };
      } else if (decision === "skip") {
        pathsToMove.delete(conflict.originalPath);
      }
      // 'replace' - keep in pathsToMove, will overwrite
    }

    // Now perform the actual move with progress updates
    const filesToMove = this.removeFiles(Array.from(pathsToMove.keys()));
    const movedFiles: FileNode[] = [];
    const totalFiles = filesToMove.length;

    for (let i = 0; i < filesToMove.length; i++) {
      const file = filesToMove[i];
      const newParentPath = pathsToMove.get(file.path);
      if (!newParentPath) continue;

      this._addFileO1(file, newParentPath);
      this.debouncedChangeEvent([newParentPath]);
      movedFiles.push(file);

      // Yield progress update
      yield {
        type: "progress",
        current: i + 1,
        total: totalFiles,
        currentFile: file.name,
        percentage: Math.round(((i + 1) / totalFiles) * 100),
      } satisfies ProgressUpdate;
    }

    return { cancelled: false, moved: movedFiles };
  }

  // UI helpers
  getChildNodes(targetDirPath: string): FileNode[] {
    return this.nodes.filter((f) => f.parentPath === targetDirPath);
  }
  getNode(path: string): FileNode | null {
    return this.nodes[this._pathToNodeIdx[path]] ?? null;
  }
  getNodeList(paths: string[]): FileNode[] {
    const result: FileNode[] = [];
    for (let path of paths) {
      const node = this.nodes[this._pathToNodeIdx[path]];
      if (node) {
        result.push(node);
      }
    }
    // View layer can handle what it wants to display, like total size and count
    // const totalSize = result.reduce((acc, curr) => acc + curr.size, 0);
    // const count = result.length;
    return result;
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

    this.debouncedChangeEvent([newNode.parentPath]);

    return this.nodes[this.nodes.length - 1]; // return the newly added node
  }

  searchNodesInDir(query: string, dirPath: string): FileNode[] {
    return this.nodes.filter((f) => {
      return f.path.startsWith(dirPath) && f.name.match(new RegExp(query, "i"));
    });
  }
}
