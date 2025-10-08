import * as React from "react";
import { FileTreeNode } from "../FileTreeNode";

export function SelectionInfo({
  selectedNodes,
}: {
  selectedNodes: FileTreeNode[];
}) {
  if (selectedNodes.length === 0) {
    return (
      <div style={{ marginTop: 10 }}>No files or directories selected</div>
    );
  } else if (selectedNodes.length === 1) {
    const node = selectedNodes[0];
    return (
      <div style={{ marginTop: 10 }}>
        1 item selected: {node.name} ({node.type}), size: {node.size || 0} bytes
      </div>
    );
  } else {
    const totalSize = selectedNodes.reduce(
      (acc, node) => acc + (node?.size || 0),
      0
    );
    return (
      <div aria-label="Selection Info" style={{ marginTop: 10 }}>
        {selectedNodes.length} items selected, total size: {totalSize} bytes
      </div>
    );
  }
}
