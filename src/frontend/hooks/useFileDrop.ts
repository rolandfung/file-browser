import { useDrop } from "react-dnd";
import { FileTreeNode } from "../FileTreeNode";

interface UseFileDropParams {
  targetNode: FileTreeNode;
  onFileDrop: (droppedPaths: FileTreeNode[], targetNode: FileTreeNode) => void;
}

export function useFileDrop({ targetNode, onFileDrop }: UseFileDropParams) {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "file-system-node",
      drop: (droppedNodes: FileTreeNode[]) => {
        const targetIsDir = targetNode.type === "directory";
        // If dropping onto a file, drop into that file's parent
        if (!targetIsDir && onFileDrop) {
          onFileDrop(droppedNodes, targetNode.parent);
          // If dropping onto a directory, drop into that directory
        } else if (targetIsDir && onFileDrop) {
          onFileDrop(droppedNodes, targetNode);
        }
      },
      canDrop: (droppedNodes: FileTreeNode[]) => {
        // If no droppedNodes or no handler, cannot drop
        if (!droppedNodes.length || !onFileDrop) return false;
        // Prevent dropping a single node into the directory its already in
        if (droppedNodes.length === 1) {
          if (targetNode.type === "directory") {
            if (targetNode === droppedNodes[0].parent) return false;
          } else if (targetNode.parent === droppedNodes[0].parent) {
            return false;
          }
        }
        return true;
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [targetNode, onFileDrop]
  );

  return { isOver, canDrop, drop };
}
