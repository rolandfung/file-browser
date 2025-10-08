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
  handleItemSelect: (
    event: React.MouseEvent,
    node: FileTreeNode,
    sortingFunc: (a: FileTreeNode, b: FileTreeNode) => number
  ) => void;
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
        const children = node.getChildren().sort(sortingFunc);
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
    : flattenNodes(contextNode.getChildren().sort(sortingFunc));

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
            onNameClick={(event: React.MouseEvent, node: FileTreeNode) => {
              switch (event.detail) {
                case 2:
                  if (node.type === "directory" && onDrillDown) {
                    onDrillDown(node);
                  }
                  break;
                default:
                  handleItemSelect(event, node, sortingFunc);
                  break;
              }
            }}
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
