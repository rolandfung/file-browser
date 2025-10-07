import { useDrop } from "react-dnd";

interface UseFileDropParams {
  targetNode: {
    path: string;
    type: "file" | "directory";
  };
  onFileDrop: (droppedPaths: string[], targetPath: string) => void;
}

export function useFileDrop({ targetNode, onFileDrop }: UseFileDropParams) {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "file-system-node",
      drop: (item: string[]) => {
        const targetIsDir = targetNode.type === "directory";
        const targetNodePath = targetNode.path;
        // If dropping onto a file, drop into that file's parent directory
        if (!targetIsDir && onFileDrop) {
          onFileDrop(
            item,
            targetNodePath.substring(0, targetNodePath.lastIndexOf("/")) || "/"
          );
          // If dropping onto a directory, drop into that directory
        } else if (targetIsDir && onFileDrop) {
          onFileDrop(item, targetNodePath);
        }
      },
      canDrop: (item) => {
        const targetNodepath = targetNode.path;
        // If no items or no handler, cannot drop
        if (!item.length || !onFileDrop) return false;
        // Prevent dropping a single item into the directory its already in
        if (item.length === 1) {
          const parentPath = getParentPath(item[0]);
          if (targetNode.type === "directory") {
            if (parentPath === targetNodepath) return false;
          } else if (parentPath === getParentPath(targetNodepath)) {
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

function getParentPath(path: string): string {
  if (path === "/") return "/";
  const parts = path.split("/").filter((p) => p.length > 0);
  if (parts.length <= 1) return "/";
  return "/" + parts.slice(0, parts.length - 1).join("/");
}
