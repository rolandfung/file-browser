import { useDrop } from "react-dnd";

interface UseFileDropParams {
  nodePath: string;
  isDirectory: boolean;
  onFileDrop: (droppedPaths: string[], targetPath: string) => void;
}

export function useFileDrop({
  nodePath,
  isDirectory,
  onFileDrop,
}: UseFileDropParams) {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "file-system-node",
      drop: (item: string[]) => {
        // Only allow dropping on directories
        if (isDirectory && onFileDrop) {
          onFileDrop(item, nodePath);
        }
      },
      canDrop: () => isDirectory, // Only directories can accept drops
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [nodePath, isDirectory, onFileDrop]
  );

  return { isOver, canDrop, drop };
}
