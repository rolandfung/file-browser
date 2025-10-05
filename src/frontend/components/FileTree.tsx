import { FileSystem } from "../FileSystem";

import * as React from "react";
import { FileNode } from "../types";
import { FileItem } from "./FileItem";
import { VirtualizedList } from "./VirtualizedList";

interface FileTreeProps {
  fileSystem: FileSystem;
  contextPath?: string;
  onDrillDown?: (event: React.MouseEvent) => void;
  expandedDirs: Set<string>;
  selectedFilePaths: Set<string>;
  handleExpandleToggle: (event: React.MouseEvent) => void;
  handleItemSelect: (event: React.MouseEvent) => void;
  handleOutsideClick: (event: React.MouseEvent) => void;
  searchValue?: string;
  onFileDrop?: (droppedPaths: string[], targetPath: string) => void;
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
        const children = fileSystem.getChildNodes(node.path);
        result.push(...flattenNodes(children, level + 1));
      }
    }

    return result;
  };

  const flattenedItems = isSearchResultsMode
    ? fileSystem
        .searchNodesInDir(searchValue, contextPath)
        .map((node) => ({ node, level: 0 }))
    : flattenNodes(fileSystem.getChildNodes(contextPath));

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
          <div key={node.path} style={{ paddingLeft: level * 20 }}>
            <FileItem
              selectedFilePaths={selectedFilePaths}
              level={level}
              onNameClick={(event: React.MouseEvent) => {
                switch (event.detail) {
                  case 2:
                    if (node.type === "directory" && onDrillDown) {
                      onDrillDown(event);
                    }
                    break;
                  default:
                    handleItemSelect(event);
                    break;
                }
              }}
              onExpandToggle={handleExpandleToggle}
              onFileDrop={onFileDrop}
              node={node}
              selected={selectedFilePaths.has(node.path)}
              expanded={expandedDirs.has(node.path)}
            />
          </div>
        ))}
      </VirtualizedList>
    </div>
  );
}
