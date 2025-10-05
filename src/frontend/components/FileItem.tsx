import * as React from "react";
import { useDrag } from "react-dnd";
import {
  FileNode,
  FOLDER_ICON,
  EXPANDED_FOLDER_ICON,
  FILE_ICONS,
} from "../types";
import { useFileDrop } from "../../hooks/useFileDrop";

interface FileItemProps {
  node: FileNode;
  selectedFilePaths?: Set<string>;
  level?: number;
  selected: boolean;
  expanded?: boolean;
  onNameClick?: (event: React.MouseEvent) => void;
  onExpandToggle?: (event: React.MouseEvent) => void;
  onFileDrop?: (droppedPaths: string[], targetPath: string) => void;
}

export function FileItem({
  node,
  selectedFilePaths = new Set<string>(),
  level = 0,
  selected = false,
  expanded = false,
  onNameClick,
  onExpandToggle,
  onFileDrop,
}: FileItemProps) {
  const isDirectory = node.type === "directory";
  const icon = isDirectory
    ? expanded
      ? EXPANDED_FOLDER_ICON
      : FOLDER_ICON
    : FILE_ICONS[node.extension as keyof typeof FILE_ICONS] || "📄";

  /** DND controls */
  const [{ opacity }, dragRef] = useDrag(
    () => ({
      type: "file-system-node",
      item: () => {
        // If this item is selected, drag all selected items
        // Otherwise, drag just this item
        if (selected && selectedFilePaths.size > 0) {
          return [...selectedFilePaths];
        } else {
          return [node.path];
        }
      },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
      }),
    }),
    [selected, selectedFilePaths, node.path]
  );

  const { isOver, canDrop, drop } = useFileDrop({
    nodePath: node.path,
    isDirectory,
    onFileDrop,
  });

  const expandIcon = isDirectory ? (expanded ? "▼" : "▶") : null;

  return (
    <div
      ref={drop}
      style={{
        opacity,
        backgroundColor:
          isOver && canDrop ? "#e3f2fd" : selected ? "#ddd" : "transparent",
        border: isOver && canDrop ? "2px dashed #2196f3" : "none",
        padding: isOver && canDrop ? "2px" : "4px",
      }}
      role="tree-item"
      data-level={level}
      className={`file-item ${selected ? "selected" : ""}`}
    >
      <span
        ref={dragRef}
        style={{
          cursor: "default",
        }}
      >
        {icon}
        <span
          role="button"
          tabIndex={0}
          data-path={node.path}
          onClick={(e) => {
            e.stopPropagation();
            if (onNameClick) onNameClick(e);
          }}
          style={{ marginLeft: 5, marginRight: 5 }}
        >
          {node.name}
        </span>
      </span>
      {expandIcon && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            if (onExpandToggle) onExpandToggle(e);
          }}
          role="button"
          tabIndex={0}
          data-path={node.path}
          data-name={node.name}
          data-type={node.type}
          data-size={node.size}
          data-selected={selected}
          data-expanded={expanded}
          aria-expanded={expanded}
          className="expand-icon"
        >
          {expandIcon}
        </span>
      )}
    </div>
  );
}
