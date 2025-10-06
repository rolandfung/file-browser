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
  // onMoveSelectedButton: () => void;
  onDownloadCityButton: () => void;
  selectedFilePaths: Set<string>;
  disableCreate?: boolean;
  disableNav?: boolean;
  disableExpansion?: boolean;
  disableDownloadCity?: boolean;
  sort: { mode: "name" | "type"; asc: boolean };
  setSort: (sort: { mode: "name" | "type"; asc: boolean }) => void;
}
export function FileSystemViewToolbar({
  onNavigateUpButton,
  onNavigateBackButton,
  canNavUp,
  canNavBack,
  onExpandAllButton,
  onCollapseAllButton,
  onCreateFileButton,
  onDownloadCityButton,
  onCreateDirectoryButton,
  onDeleteSelectedButton,
  // onMoveSelectedButton,
  selectedFilePaths = new Set<string>(),
  disableNav = false,
  disableCreate = false,
  disableExpansion = false,
  disableDownloadCity = false,
  sort = { mode: "name", asc: true },
  setSort = () => {},
}: FileSystemViewToolbarProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
      }}
    >
      <button
        title="Create New File"
        disabled={disableCreate || disableCreate}
        onClick={onCreateFileButton}
        style={{ padding: "5px 10px" }}
      >
        +📄
      </button>
      <button
        title="Create New Directory"
        disabled={disableCreate || disableCreate}
        onClick={onCreateDirectoryButton}
        style={{ padding: "5px 10px" }}
      >
        +📁
      </button>
      <SpacerHorizontal px={5} />
      <button
        title="Delete Selected"
        disabled={selectedFilePaths.size === 0}
        onClick={onDeleteSelectedButton}
        style={{ padding: "5px 10px" }}
      >
        🗑️
      </button>
      {/**
       // TODO: implement move with directory selector (see task_planning.md)
       */}
      {/* <button
        title="Move Selected"
        disabled={selectedFilePaths.size === 0}
        onClick={onMoveSelectedButton}
        style={{  padding: "5px 10px" }}
      >
        ➡️
      </button> */}
      <button
        title="Download City Weather File"
        disabled={disableDownloadCity}
        onClick={onDownloadCityButton}
        style={{ padding: "5px 10px" }}
      >
        🌤️
      </button>
      <SpacerHorizontal px={5} />
      <button
        title="Navigate Up"
        disabled={disableNav || !canNavUp}
        onClick={onNavigateUpButton}
        style={{ padding: "5px 10px" }}
      >
        ⬆️
      </button>
      <button
        title="Navigate Back"
        onClick={onNavigateBackButton}
        disabled={disableNav || !canNavBack}
        style={{ padding: "5px 10px" }}
      >
        ⬅️
      </button>
      <SpacerHorizontal px={5} />
      <button
        title="Expand All"
        disabled={disableExpansion}
        onClick={onExpandAllButton}
        style={{ padding: "5px 10px" }}
      >
        📂
      </button>
      <button
        title="Collapse All"
        onClick={onCollapseAllButton}
        disabled={disableExpansion}
        style={{ padding: "5px 10px" }}
      >
        📁
      </button>
      <SpacerHorizontal px={5} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        Sort by:
        <select
          name="Sort By"
          value={sort.mode}
          onChange={(e) =>
            setSort({ ...sort, mode: e.target.value as "name" | "type" })
          }
          style={{ marginLeft: 5 }}
        >
          <option value="name">Name</option>
          <option value="type">Type</option>
        </select>
        <button
          title="Toggle Asc/Desc"
          onClick={() => setSort({ ...sort, asc: !sort.asc })}
          style={{ marginLeft: 5, padding: "2px 5px" }}
        >
          {sort.asc ? "⬆️" : "⬇️"}
        </button>
      </div>
    </div>
  );
}

function SpacerHorizontal({ px }: { px: number }) {
  return <div style={{ flex: 1, margin: `0 ${px}px` }} />;
}
