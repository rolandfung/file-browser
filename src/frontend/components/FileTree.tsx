import * as React from "react";
import { FileTreeNode } from "../FileTreeNode";
import { FileItem } from "./FileItem";
import { VirtualizedList } from "./VirtualizedList";

interface FileTreeProps {
  contextNode?: FileTreeNode;
  onDrillDown?: (node: FileTreeNode) => void;
  expandedDirs: Set<FileTreeNode>;
  selectedNodes: Set<FileTreeNode>;
  handleExpandleToggle: (node: FileTreeNode) => void;
  handleRangeSelect: (nodeList: FileTreeNode[]) => void;
  lastSelectedNode?: FileTreeNode;
  handleItemSelect: (event: React.MouseEvent, node: FileTreeNode) => void;
  handleOutsideClick: (event: React.MouseEvent) => void;
  searchValue?: string;
  onFileDrop?: (droppedNodes: FileTreeNode[], targetNode: FileTreeNode) => void;
  sortingFunc?: (a: FileTreeNode, b: FileTreeNode) => number;
}

export function FileTree({
  contextNode = null,
  onDrillDown,
  expandedDirs,
  selectedNodes,
  handleExpandleToggle,
  handleRangeSelect,
  lastSelectedNode,
  handleItemSelect,
  handleOutsideClick,
  searchValue = "",
  onFileDrop,
  sortingFunc = (a, b) => a.name.localeCompare(b.name),
}: FileTreeProps) {
  const isSearchResultsMode = searchValue.trim().length > 0;

  // Flatten the tree structure for virtualization so that each item is the same height
  const flattenNodes = (
    nodes: FileTreeNode[],
    level: number = 0
  ): Array<{ node: FileTreeNode; level: number }> => {
    const result: Array<{ node: FileTreeNode; level: number }> = [];

    for (const node of nodes) {
      result.push({ node, level });

      if (node.type === "directory" && expandedDirs.has(node)) {
        const children = Array.from(node.children.values()).sort(sortingFunc);
        result.push(...flattenNodes(children, level + 1));
      }
    }

    return result;
  };

  const flattenedItems = isSearchResultsMode
    ? contextNode
        .search((node) => {
          return !!node.name.match(new RegExp(searchValue, "i"));
        })
        .sort(sortingFunc)
        .map((node) => ({ node, level: 0 }))
    : flattenNodes(Array.from(contextNode.children.values()).sort(sortingFunc));

  const handleNameClick = (event: React.MouseEvent, node: FileTreeNode) => {
    const isRangeSelect = event.shiftKey && lastSelectedNode;
    const doubleClick = event.detail === 2;
    const allItems = flattenedItems.map(({ node }) => node);

    if (isRangeSelect) {
      // Find indices of start and end items
      const startIndex = allItems.findIndex(
        (item) => item === lastSelectedNode
      );
      const endIndex = allItems.findIndex((item) => item === node);
      // sort indices and select range
      const [minIndex, maxIndex] = [
        Math.min(startIndex, endIndex),
        Math.max(startIndex, endIndex),
      ];

      if (startIndex !== -1 && endIndex !== -1) {
        const newSelectedNodes = allItems.slice(minIndex, maxIndex + 1);
        handleRangeSelect(newSelectedNodes);
      }
    } else if (doubleClick) {
      // onDrillDown(node) if directory
      if (node.type === "directory" && onDrillDown) {
        onDrillDown(node);
      }
    } else {
      handleItemSelect(event, node);
    }
  };

  return (
    <div
      style={{
        // TODO: make FileTree or FileSystemView resizable like a
        // normal OS window using react-rnd or similar
        height: 500, // Fixed height instead of maxHeight
        overflow: "hidden", // Let VirtualizedList handle scrolling
        border: "1px solid #eee",
      }}
      role="tree"
      onClick={handleOutsideClick}
      className="file-tree"
    >
      <VirtualizedList listItemHeight={21}>
        {flattenedItems.map(({ node, level }) => (
          <FileItem
            key={node.getFullNodePath()}
            selectedNodes={selectedNodes}
            level={level}
            onNameClick={handleNameClick}
            onExpandToggle={handleExpandleToggle}
            onFileDrop={onFileDrop}
            node={node}
            selected={selectedNodes.has(node)}
            expanded={expandedDirs.has(node)}
          />
        ))}
      </VirtualizedList>
    </div>
  );
}
