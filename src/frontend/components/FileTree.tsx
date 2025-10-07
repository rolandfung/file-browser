import { FileSystem } from "../FileSystem";

import * as React from "react";
import { FileNode } from "../types";
import { FileItem } from "./FileItem";
import { VirtualizedList } from "./VirtualizedList";

interface FileTreeProps {
  fileSystem: FileSystem;
  contextPath?: string;
  onDrillDown?: (node: FileNode) => void;
  expandedDirs: Set<string>;
  selectedFilePaths: Set<string>;
  handleExpandleToggle: (node: FileNode) => void;
  handleItemSelect: (
    event: React.MouseEvent,
    node: FileNode,
    sortingFunc: (a: FileNode, b: FileNode) => number
  ) => void;
  handleOutsideClick: (event: React.MouseEvent) => void;
  searchValue?: string;
  onFileDrop?: (droppedPaths: string[], targetPath: string) => void;
  sortingFunc?: (a: FileNode, b: FileNode) => number;
}

export function FileTree({
  fileSystem,
  contextPath = "/",
  onDrillDown,
  expandedDirs,
  selectedFilePaths,
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
    nodes: FileNode[],
    level: number = 0
  ): Array<{ node: FileNode; level: number }> => {
    const result: Array<{ node: FileNode; level: number }> = [];

    for (const node of nodes) {
      result.push({ node, level });

      if (node.type === "directory" && expandedDirs.has(node.path)) {
        const children = fileSystem.getChildNodes(node.path).sort(sortingFunc);
        result.push(...flattenNodes(children, level + 1));
      }
    }

    return result;
  };

  const flattenedItems = isSearchResultsMode
    ? fileSystem
        .searchNodesInPath(searchValue, contextPath)
        .sort(sortingFunc)
        .map((node) => ({ node, level: 0 }))
    : flattenNodes(fileSystem.getChildNodes(contextPath).sort(sortingFunc));

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
            key={node.path}
            selectedFilePaths={selectedFilePaths}
            level={level}
            onNameClick={(event: React.MouseEvent, node: FileNode) => {
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
            selected={selectedFilePaths.has(node.path)}
            expanded={expandedDirs.has(node.path)}
          />
        ))}
      </VirtualizedList>
    </div>
  );
}
