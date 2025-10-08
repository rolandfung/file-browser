import * as React from "react";
import { useFileDrop } from "../hooks/useFileDrop";
import { FileTreeNode } from "../FileTreeNode";

export interface BreadcrumbsProps {
  contextNode: FileTreeNode;
  onCrumbClick: (crumbNode: FileTreeNode) => void;
  onFileDrop: (droppedNodes: FileTreeNode[], targetNode: FileTreeNode) => void;
}

export function Breadcrumbs({
  contextNode,
  onCrumbClick,
  onFileDrop,
}: BreadcrumbsProps) {
  const renderCrumbs = (
    node: FileTreeNode | null
  ): { slug: string; node: FileTreeNode }[] => {
    // walks up the tree to root to build the breadcrumb trail
    const crumbs: { slug: string; node: FileTreeNode }[] = [];
    let current: FileTreeNode | null = node;
    while (current) {
      crumbs.unshift({
        slug: current.name === "root" ? "/" : current.name,
        node: current,
      });
      current = current.parent;
    }
    return crumbs;
  };

  return (
    <div style={{ marginBottom: 10, padding: 5 }}>
      Current Path:{" "}
      {renderCrumbs(contextNode).map(({ node, slug }, idx) => {
        return (
          <span key={node.getFullNodePath()}>
            {idx > 1 ? " / " : " "}
            <CrumbItem
              node={node}
              slug={slug}
              onClick={onCrumbClick}
              onFileDrop={onFileDrop}
            />
          </span>
        );
      })}
    </div>
  );
}

export interface CrumbItemProps {
  node: FileTreeNode;
  slug: string;
  onClick: (node: FileTreeNode) => void;
  onFileDrop: (droppedNodes: FileTreeNode[], targetNode: FileTreeNode) => void;
}

export function CrumbItem({ node, slug, onClick, onFileDrop }: CrumbItemProps) {
  const { isOver, canDrop, drop } = useFileDrop({
    targetNode: node,
    onFileDrop,
  });
  return (
    <span
      ref={drop}
      role="navigation"
      tabIndex={0}
      data-path={node.getFullNodePath()}
      onClick={() => onClick(node)}
      style={{
        display: "inline-block",
        padding: "2px 5px",
        border: isOver && canDrop ? "2px dashed #2196f3" : "none",
        cursor: "pointer",
        borderRadius: 3,
        backgroundColor: "#f0f0f0",
      }}
    >
      {slug}
    </span>
  );
}
