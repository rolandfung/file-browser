import * as React from "react";
// import { FileNode } from "../types";
import { FileSystem } from "../FileSystem";

export function SelectionInfo({
  selectedFilePaths,
  fileSystem,
}: {
  selectedFilePaths: Set<string>;
  fileSystem: FileSystem;
}) {
  if (selectedFilePaths.size === 0) {
    return (
      <div style={{ marginTop: 10 }}>No files or directories selected</div>
    );
  } else if (selectedFilePaths.size === 1) {
    const path = Array.from(selectedFilePaths)[0];
    const node = fileSystem.getNode(path);
    return (
      <div style={{ marginTop: 10 }}>
        1 item selected: {path} ({node?.type}), size: {node?.size || 0} bytes
      </div>
    );
  } else {
    const nodeList = fileSystem.getNodeList(Array.from(selectedFilePaths));
    const totalSize = nodeList.reduce(
      (acc, node) => acc + (node?.size || 0),
      0
    );
    return (
      <div style={{ marginTop: 10 }}>
        {selectedFilePaths.size} items selected, total size: {totalSize} bytes
      </div>
    );
  }
}
