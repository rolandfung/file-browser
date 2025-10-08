import * as React from "react";
import { useDrag } from "react-dnd";
import { FOLDER_ICON, EXPANDED_FOLDER_ICON, FILE_ICONS } from "../types";
import { FileTreeNode } from "../FileTreeNode";
import { useFileDrop } from "../hooks/useFileDrop";

interface FileItemProps {
  node: FileTreeNode;
  selectedNodes?: Set<FileTreeNode>;
  level?: number;
  selected: boolean;
  expanded?: boolean;
  onNameClick?: (event: React.MouseEvent, node: FileTreeNode) => void;
  onExpandToggle?: (node: FileTreeNode) => void;
  onFileDrop?: (droppedNodes: FileTreeNode[], targetNode: FileTreeNode) => void;
}

export function FileItem({
  node,
  selectedNodes = new Set<FileTreeNode>(),
  level = 0,
  selected = false,
  expanded = false,
  onNameClick,
  onExpandToggle,
  onFileDrop,
}: FileItemProps) {
  const isDirectory = node.type === "directory";
  const extension = node.name.split(".").pop() || "";
  const icon = isDirectory
    ? expanded
      ? EXPANDED_FOLDER_ICON
      : FOLDER_ICON
    : FILE_ICONS[extension as keyof typeof FILE_ICONS] || "📄";

  /** DND controls */
  const [{ opacity }, dragRef] = useDrag(
    () => ({
      type: "file-system-node",
      item: () => {
        // If this item is selected, drag all selected items
        // Otherwise, drag just this item
        if (selected && selectedNodes.size > 0) {
          return [...selectedNodes];
        } else {
          return [node];
        }
      },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
      }),
    }),
    [selected, selectedNodes, node]
  );

  const { isOver, canDrop, drop } = useFileDrop({
    targetNode: node,
    onFileDrop,
  });

  const expandIcon = isDirectory ? (expanded ? "▼" : "▶") : null;
  return (
    <div
      ref={(i) => dragRef(drop(i))}
      style={{
        padding: isOver && canDrop ? "2px" : "4px",
        paddingLeft: isOver && canDrop ? level * 20 - 4 : level * 20,
        border: isOver && canDrop ? "2px dashed #2196f3" : "none",
        height: 29,
        backgroundColor:
          isOver && canDrop ? "#e3f2fd" : selected ? "#ddd" : "transparent",
        opacity,
        width: "100%",
      }}
      role="listitem"
      aria-label={node.name}
      className={`file-item ${selected ? "selected" : ""}`}
      data-level={level}
      data-type={node.type}
      data-name={node.name}
      data-selected={selected}
      data-expanded={expanded}
      aria-expanded={expanded}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        if (onNameClick) {
          onNameClick(e, node);
        }
      }}
    >
      {icon}
      <span
        title={node.getFullNodePath()}
        style={{ marginLeft: 5, marginRight: 5 }}
      >
        {node.name}
      </span>
      {expandIcon && (
        <span
          aria-label={"Expand/Collapse " + node.name}
          onClick={(e) => {
            e.stopPropagation();
            if (onExpandToggle) onExpandToggle(node);
          }}
          role="button"
          tabIndex={0}
          className="expand-icon"
        >
          {expandIcon}
        </span>
      )}
    </div>
  );
}
