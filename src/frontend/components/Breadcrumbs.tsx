import * as React from "react";
import { useFileDrop } from "../../hooks/useFileDrop";

export interface BreadcrumbsProps {
  contextPath: string;
  onCrumbClick: (event: React.MouseEvent) => void;
  onFileDrop: (droppedPaths: string[], targetPath: string) => void;
}

export function Breadcrumbs({
  contextPath,
  onCrumbClick,
  onFileDrop,
}: BreadcrumbsProps) {
  const parts = contextPath.split("/").filter((p) => p.length > 0);

  return (
    <div style={{ marginBottom: 10, padding: 5 }}>
      Current Path:{" "}
      <span role="button" tabIndex={0} data-path="/">
        /{" "}
      </span>
      {parts.map((part, idx) => {
        const path = "/" + parts.slice(0, idx + 1).join("/");

        return (
          <span key={path}>
            {idx !== 0 ? <span> / </span> : null}
            <CrumbItem
              part={part}
              path={path}
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
  part: string;
  path: string;
  onClick: (event: React.MouseEvent) => void;
  onFileDrop: (droppedPaths: string[], targetPath: string) => void;
}

export function CrumbItem({ part, path, onClick, onFileDrop }: CrumbItemProps) {
  const { isOver, canDrop, drop } = useFileDrop({
    nodePath: path,
    isDirectory: true,
    onFileDrop: (droppedPaths, targetPath) => {
      onFileDrop(droppedPaths, targetPath);
    },
  });
  return (
    <span
      ref={drop}
      role="button"
      tabIndex={0}
      data-path={path}
      onClick={onClick}
      style={{
        display: "inline-block",
        padding: "2px 5px",
        border: isOver && canDrop ? "2px dashed #2196f3" : "none",
        cursor: "pointer",
        borderRadius: 3,
        backgroundColor: "#f0f0f0",
      }}
    >
      {part}
    </span>
  );
}
