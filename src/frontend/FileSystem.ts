import {
  TreeFileConflict,
  TreeConflictResolution,
  ProgressUpdate,
  TreeOperation,
} from "./types";
import { FileTreeNode } from "./FileTreeNode";

// FileSystem separates out the underlying file manipulation logic from the UI logic,
// so that we can easily have multiple views on the same file system. View components
// can focus on handling navigation, selection, and action logic.
export class FileSystem extends EventTarget {
  root: FileTreeNode;
  // need to track last two to undo a move (which generates two change events)
  lastOperation: TreeOperation | null = null;

  constructor(startingNode: FileTreeNode | null) {
    super();
    this.root = startingNode;
  }

  /***
   * Actions
   */
  addNode(nodeToAdd: FileTreeNode, targetNode: FileTreeNode): TreeOperation {
    targetNode.children.set(nodeToAdd.name, nodeToAdd);
    nodeToAdd.parent = targetNode;
    return this.trackCompletedOperation({
      type: "add",
      addDeleteNodes: [nodeToAdd],
    });
  }

  deleteNode(
    nodeToRemove: FileTreeNode,
    parentNode: FileTreeNode
  ): TreeOperation {
    parentNode.children.delete(nodeToRemove.name);
    // nodeToRemove.parent = null; // don't do this here, as we need parent for undo
    return this.trackCompletedOperation({
      type: "delete",
      addDeleteNodes: [nodeToRemove],
    });
  }

  addNodes(
    nodesToAdd: FileTreeNode[],
    targetNode: FileTreeNode
  ): TreeOperation {
    for (let n of nodesToAdd) {
      targetNode.children.set(n.name, n);
      n.parent = targetNode;
    }
    return this.trackCompletedOperation({
      type: "add",
      addDeleteNodes: nodesToAdd,
    });
  }

  deleteNodes(nodesToRemove: FileTreeNode[]): TreeOperation {
    for (let n of nodesToRemove) {
      n.parent?.children.delete(n.name);
      // n.parent = null; // don't do this here, as we need parent for undo
    }
    return this.trackCompletedOperation({
      type: "delete",
      addDeleteNodes: nodesToRemove,
    });
  }

  // Method to track completed operations (used by decorator and for generator completion)
  trackCompletedOperation(treeOperation: TreeOperation) {
    this.lastOperation = treeOperation;

    if (treeOperation.type === "add") {
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: treeOperation,
        })
      );
    } else if (treeOperation.type === "delete") {
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: treeOperation,
        })
      );
    } else if (treeOperation.type === "move" && treeOperation.movedNodes) {
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: treeOperation,
        })
      );
    }

    return treeOperation;
  }

  search(
    predicate: (node: FileTreeNode) => boolean,
    rootNode?: FileTreeNode
  ): FileTreeNode[] {
    const result: FileTreeNode[] = [];
    const startingNode = rootNode || this.root;

    const traverse = (node: FileTreeNode) => {
      if (predicate(node)) {
        result.push(node);
      }
      node.children.forEach((child) => traverse(child));
    };

    traverse(startingNode);
    return result;
  }

  getAllDirectories(): Set<FileTreeNode> {
    const dirs = new Set<FileTreeNode>();

    const traverse = (node: FileTreeNode) => {
      if (node.type === "directory") {
        dirs.add(node);
        node.children.forEach((child) => traverse(child));
      }
    };

    traverse(this.root);
    return dirs;
  }

  undoLastOperation(): void {
    if (!this.lastOperation) {
      console.warn("No last operation to undo");
      return;
    }

    if (this.lastOperation.type === "add") {
      // undo add by removing the added files
      for (let node of this.lastOperation.addDeleteNodes || []) {
        this.deleteNode(node, node.parent);
      }
    } else if (this.lastOperation.type === "delete") {
      // undo delete by re-adding the deleted files
      for (let node of this.lastOperation.addDeleteNodes || []) {
        this.addNode(node, node.parent);
      }
    } else if (this.lastOperation.type === "move") {
      // undo move by moving files back to original parents
      if (this.lastOperation.movedNodes) {
        this.lastOperation.movedNodes.forEach((originalParent, node) => {
          if (node.parent) {
            this.deleteNode(node, node.parent);
            this.addNode(node, originalParent);
          }
        });
      }
    }

    this.lastOperation = null;
  }

  // Generator-based file move with conflict resolution and progress updates
  *moveFiles(
    selectedNodes: FileTreeNode[],
    targetNode: FileTreeNode
  ): Generator<
    TreeFileConflict | ProgressUpdate,
    TreeOperation | null,
    TreeConflictResolution | void
  > {
    // Build move plan - maps source node to target parent
    const movePlan = new Map<FileTreeNode, FileTreeNode>();
    const nodesToOriginalParents = new Map<FileTreeNode, FileTreeNode>();
    const nodesToSkip = new Set<FileTreeNode>();

    // Store original parents for undo
    for (const node of selectedNodes) {
      if (node.parent) {
        nodesToOriginalParents.set(node, node.parent);
      }
    }

    // Phase 1: Conflict detection and resolution
    for (const sourceNode of selectedNodes) {
      if (nodesToSkip.has(sourceNode)) continue;

      const result = yield* this.resolveNodeConflicts(
        sourceNode,
        targetNode,
        nodesToSkip
      );
      if (result === "cancel") {
        return null; // Entire operation cancelled
      }

      if (result !== "skip") {
        movePlan.set(sourceNode, targetNode);
      }
    }

    // Phase 2: Execute move plan with progress updates
    const nodesToMove = Array.from(movePlan.keys());
    let movedCount = 0;
    const totalNodes = nodesToMove.length;

    for (const [sourceNode, targetParent] of movePlan) {
      // Yield progress update
      yield {
        type: "progress" as const,
        current: movedCount + 1,
        total: totalNodes,
        currentFile: sourceNode.name,
        percentage: Math.round(((movedCount + 1) / totalNodes) * 100),
      };

      // Perform the actual move
      if (sourceNode.parent) {
        sourceNode.parent.children.delete(sourceNode.name);
      }
      targetParent.children.set(sourceNode.name, sourceNode);
      sourceNode.parent = targetParent;

      movedCount++;
    }

    if (nodesToMove.length > 0) {
      return this.trackCompletedOperation({
        type: "move",
        movedNodes: nodesToOriginalParents, // map of nodes to their original parents
      });
    }

    return null;
  }

  // Helper method to resolve conflicts for a single node and its potential children
  private *resolveNodeConflicts(
    sourceNode: FileTreeNode,
    targetParent: FileTreeNode,
    nodesToSkip: Set<FileTreeNode>
  ): Generator<
    TreeFileConflict,
    "cancel" | "skip" | "proceed",
    TreeConflictResolution | void
  > {
    // Check if source node conflicts with existing child in target
    const existingNode = targetParent.children.get(sourceNode.name);

    // Yield conflict to user for resolution (files only, not directories)
    if (existingNode && sourceNode.type === "file") {
      const conflict: TreeFileConflict = {
        message: `File "${sourceNode.name}" already exists in destination.`,
        type: "conflict",
        originalNode: sourceNode,
        existingNode: existingNode,
        targetParent: targetParent,
      };

      const resolution = yield conflict;

      if (resolution === "cancel") {
        return "cancel";
      } else if (resolution === "skip") {
        nodesToSkip.add(sourceNode);
        return "skip";
      } else if (resolution === "replace") {
        // Delete existing node before move
        targetParent.children.delete(existingNode.name);
        // Continue with move
      }
    }

    // If source is a directory and we're merging or no conflict, check children
    if (sourceNode.type === "directory" && existingNode?.type === "directory") {
      // For directory merges, recursively resolve conflicts for all children
      for (const childNode of sourceNode.children.values()) {
        const childResult = yield* this.resolveNodeConflicts(
          childNode,
          existingNode,
          nodesToSkip
        );
        if (childResult === "cancel") {
          return "cancel";
        }
      }
    }

    return "proceed";
  }
}
