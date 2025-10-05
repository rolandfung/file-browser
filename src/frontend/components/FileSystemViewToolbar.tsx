import * as React from "react";
/**
 * Search
 * Create New File
 * Create New Directory
 * Delete Selected File/Directory
 * Navigate Up (to parent directory)
 * Navigate Back (to previous directory)
 */

interface FileSystemViewToolbarProps {
  onNavigateUpButton: () => void;
  onNavigateBackButton: () => void;
  canNavUp: boolean;
  canNavBack: boolean;
  onExpandAllButton: () => void;
  onCollapseAllButton: () => void;
  onCreateFileButton: () => void;
  onCreateDirectoryButton: () => void;
  onDeleteSelectedButton: () => void;
  onMoveSelectedButton: () => void;
  selectedFilePaths: Set<string>;
  disableCreate?: boolean;
  disableNav?: boolean;
  disableExpansion?: boolean;
  disableDownloadCity?: boolean;
}
export function FileSystemViewToolbar({
  onNavigateUpButton,
  onNavigateBackButton,
  canNavUp,
  canNavBack,
  onExpandAllButton,
  onCollapseAllButton,
  onCreateFileButton,
  onCreateDirectoryButton,
  onDeleteSelectedButton,
  onMoveSelectedButton,
  selectedFilePaths = new Set<string>(),
  disableNav = false,
  disableCreate = false,
  disableExpansion = false,
  disableDownloadCity = false,
}: FileSystemViewToolbarProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}
    >
      <button
        title="Create New File"
        disabled={disableCreate || disableCreate}
        onClick={onCreateFileButton}
        style={{ marginBottom: 10, padding: "5px 10px" }}
      >
        +📃
      </button>
      <button
        title="Create New Directory"
        disabled={disableCreate || disableCreate}
        onClick={onCreateDirectoryButton}
        style={{ marginBottom: 10, padding: "5px 10px" }}
      >
        +📁
      </button>
      <SpacerHorizontal px={5} />
      <button
        title="Delete Selected"
        disabled={selectedFilePaths.size === 0}
        onClick={onDeleteSelectedButton}
        style={{ marginBottom: 10, padding: "5px 10px" }}
      >
        🗑️
      </button>
      <button
        title="Move Selected"
        disabled={selectedFilePaths.size === 0}
        onClick={onMoveSelectedButton}
        style={{ marginBottom: 10, padding: "5px 10px" }}
      >
        ➡️
      </button>
      <button
        title="Download City Weather File"
        disabled={disableDownloadCity}
        style={{ marginBottom: 10, padding: "5px 10px" }}
      >
        🌤️
      </button>
      <SpacerHorizontal px={5} />
      <button
        title="Navigate Up"
        disabled={disableNav || !canNavUp}
        onClick={onNavigateUpButton}
        style={{ marginBottom: 10, padding: "5px 10px" }}
      >
        ⬆️
      </button>
      <button
        title="Navigate Back"
        onClick={onNavigateBackButton}
        disabled={disableNav || !canNavBack}
        style={{ marginBottom: 10, padding: "5px 10px" }}
      >
        ⬅️
      </button>
      <SpacerHorizontal px={5} />
      <button
        title="Expand All"
        disabled={disableExpansion}
        onClick={onExpandAllButton}
        style={{ marginBottom: 10, padding: "5px 10px" }}
      >
        📂
      </button>
      <button
        title="Collapse All"
        onClick={onCollapseAllButton}
        disabled={disableExpansion}
        style={{ marginBottom: 10, padding: "5px 10px" }}
      >
        📁
      </button>
    </div>
  );
}

function SpacerHorizontal({ px }: { px: number }) {
  return <div style={{ flex: 1, margin: `0 ${px}px` }} />;
}
