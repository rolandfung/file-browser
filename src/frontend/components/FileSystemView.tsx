import { FileSystem } from "../FileSystem";
import { FileNode, ConflictResolution } from "../types";
import * as React from "react";
import { FileTree } from "./FileTree";
import { FileSystemViewToolbar } from "./FileSystemViewToolbar";
import { Breadcrumbs } from "./Breadcrumbs";
import { Search } from "./Search";
import { ActionDialog } from "./ActionDialog";
import { SelectionInfo } from "./SelectionInfo";
import { MoveDialog } from "./MoveDialog";

interface FileSystemViewProps {
  fileSystem: FileSystem;
  contextPath?: string;
  showCloseIcon?: boolean;
  onClose?: () => void;
}

export function FileSystemView({
  fileSystem,
  contextPath: contextPathProp = "/",
  showCloseIcon = false,
  onClose,
}: FileSystemViewProps) {
  /**
   * Subscribe to fileSystem changes and force re-render
   */
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const handleFileSystemChange = (event: CustomEvent<string[]>) => {
      // if contextPath includes any of the changed paths, re-render
      if (event.detail.some((p) => p.startsWith(contextPathProp))) {
        forceUpdate();
      }
    };
    fileSystem.addEventListener("change", handleFileSystemChange);
    return () => {
      fileSystem.removeEventListener("change", handleFileSystemChange);
    };
  }, [fileSystem]);

  /**
   * Move dialog state and handlers
   */
  const [moveDiagOpen, setMoveDiagOpen] = React.useState(false);
  const [moveProgress, setMoveProgress] = React.useState<{
    current: number;
    total: number;
  } | null>(null);
  const handleMoveDialogClose = () => setMoveDiagOpen(false);
  const handleMoveDialogOpen = () => setMoveDiagOpen(true);
  const handleFileMove = async (droppedPaths: string[], targetPath: string) => {
    // open move dialog
    setMoveDiagOpen(true);
    setMoveProgress({ current: 0, total: droppedPaths.length });

    try {
      // Use the generator-based move operation
      const moveGenerator = fileSystem.moveFiles(droppedPaths, targetPath);

      let result = moveGenerator.next();
      while (!result.done) {
        const value = result.value;

        if ("type" in value && value.type === "conflict") {
          // For now, skip conflicts - you can implement conflict resolution UI later
          result = moveGenerator.next("skip" as ConflictResolution);
        } else if ("type" in value && value.type === "progress") {
          // Handle progress updates if needed
          console.log(`Moving: ${value.current}/${value.total}`);
          setMoveProgress({ current: value.current, total: value.total });
          result = moveGenerator.next();
        } else {
          // It's a MoveResult, continue
          result = moveGenerator.next();
        }
      }

      // Clear selection after successful move
      unselectAll();
    } catch (error) {
      console.error("Failed to move files:", error);
    }
  };

  /**
   * Create Dialog state and handlers
   */
  const [actionDialogState, setActionDialogState] = React.useState<{
    type: "file" | "directory";
    actionType?: "create" | "delete";
    visible: boolean;
  }>({ type: "file", actionType: "create", visible: false });

  const handleCreateFileDiagOpen = () => {
    setActionDialogState({ type: "file", actionType: "create", visible: true });
  };
  const handleCreateDirDiagOpen = () => {
    setActionDialogState({
      type: "directory",
      actionType: "create",
      visible: true,
    });
  };
  const handleDeleleteDiagOpen = () => {
    setActionDialogState({ type: "file", actionType: "delete", visible: true });
  };
  const handleCancelActionDialog = () => {
    setActionDialogState((prevState) => ({ ...prevState, visible: false }));
  };

  /**
   * Search state and handlers
   */
  const [searchValue, setSearchValue] = React.useState<string>("");

  /**
   * Selection and expansion state and handlers
   */
  const [state, setState] = React.useState<{
    selectedFilePaths: Set<string>;
    expandedDirs: Set<string>;
    lastSelectedPath?: string;
  }>({
    selectedFilePaths: new Set<string>(),
    expandedDirs: new Set<string>(),
    lastSelectedPath: undefined,
  });

  const unselectAll = () => {
    setState((prevState) => ({
      selectedFilePaths: new Set<string>(),
      expandedDirs: prevState.expandedDirs,
      lastSelectedPath: undefined,
    }));
  };

  const handleCollapseAll = () => {
    setState((prevState) => ({
      selectedFilePaths: prevState.selectedFilePaths,
      expandedDirs: new Set<string>(),
      lastSelectedPath: prevState.lastSelectedPath,
    }));
  };

  // user clicked on expand/collapse icon of a directory
  const handleExpandleToggle = (event: React.MouseEvent) => {
    const path = (event.target as HTMLElement).dataset.path;
    setState(
      ({
        selectedFilePaths: prevSelectedFilePaths,
        expandedDirs: prevExpandedDirs,
        lastSelectedPath: prevLastSelectedPath,
      }) => {
        const newExpandedDirs = new Set(prevExpandedDirs);
        const newSelectedFilePaths = new Set(prevSelectedFilePaths);
        if (newExpandedDirs.has(path)) {
          // collapsing directory
          newExpandedDirs.delete(path);
          // unselect any files within directory being collapsed
          for (let filePath of newSelectedFilePaths) {
            if (filePath.startsWith(path + "/")) {
              newSelectedFilePaths.delete(filePath);
            }
          }
        } else {
          // expanding directory
          newExpandedDirs.add(path);
        }
        return {
          selectedFilePaths: newSelectedFilePaths,
          expandedDirs: newExpandedDirs,
          lastSelectedPath: prevLastSelectedPath,
        };
      }
    );
  };

  // user clicked on file/folder name to select/unselect
  const handleItemSelect = (event: React.MouseEvent) => {
    setState(
      ({
        selectedFilePaths: prevSelectedFilePaths,
        expandedDirs: prevExpandedDirs,
        lastSelectedPath: prevLastSelectedPath,
      }) => {
        const path = (event.target as HTMLElement).dataset.path;
        const newSelectedFilePaths = new Set(prevSelectedFilePaths);

        // Range selection with Shift+click
        const isRangeSelect = event.shiftKey && prevLastSelectedPath;
        // Multi-select with Ctrl/Cmd+click
        const isMultiSelect = event.ctrlKey || event.metaKey;

        if (isRangeSelect) {
          // Get all items in current view (flattened)
          const allItems = isSearchResultsMode
            ? fileSystem.searchNodesInDir(searchValue, contextPath)
            : getAllVisibleItems(fileSystem, contextPath, prevExpandedDirs);

          // Find indices of start and end items
          const startIndex = allItems.findIndex(
            (item) => item.path === prevLastSelectedPath
          );
          const endIndex = allItems.findIndex((item) => item.path === path);

          if (startIndex !== -1 && endIndex !== -1) {
            // Select range between start and end (inclusive)
            const rangeStart = Math.min(startIndex, endIndex);
            const rangeEnd = Math.max(startIndex, endIndex);

            for (let i = rangeStart; i <= rangeEnd; i++) {
              newSelectedFilePaths.add(allItems[i].path);
            }
          }
        } else if (isMultiSelect) {
          if (newSelectedFilePaths.has(path)) {
            // unselecting
            newSelectedFilePaths.delete(path);
          } else {
            // selecting
            newSelectedFilePaths.add(path);
          }
        } else {
          // single select
          if (
            newSelectedFilePaths.has(path) &&
            newSelectedFilePaths.size === 1
          ) {
            // unselecting when it's the only selected item
            newSelectedFilePaths.clear();
          } else {
            // selecting (clear others first)
            newSelectedFilePaths.clear();
            newSelectedFilePaths.add(path);
          }
        }

        return {
          selectedFilePaths: newSelectedFilePaths,
          expandedDirs: prevExpandedDirs,
          lastSelectedPath: newSelectedFilePaths.size > 0 ? path : undefined,
        };
      }
    );
  };

  const handleExpandAll = () => {
    const allDirs = fileSystem.nodes
      .filter((f) => f.type === "directory")
      .map((d) => d.path);
    setState((prevState) => ({
      selectedFilePaths: prevState.selectedFilePaths,
      expandedDirs: new Set(allDirs),
      lastSelectedPath: prevState.lastSelectedPath,
    }));
  };

  const exactlyOneOrZeroDirSelected =
    state.selectedFilePaths.size === 0 ||
    (state.selectedFilePaths.size === 1 &&
      [...state.selectedFilePaths][0].endsWith("/"));

  const handleCreateNode = (partialNode: Partial<FileNode>) => {
    if (!exactlyOneOrZeroDirSelected) return;
    // if one directory selected, create in that node, if none selected, create in current context path
    const parentPath =
      state.selectedFilePaths.size === 1
        ? [...state.selectedFilePaths][0]
        : contextPath;
    const path = parentPath + "/" + (partialNode.name as string);
    fileSystem.createFileOrDirectory({ ...partialNode, path, parentPath });
  };

  /**
   * Navigation state and handlers
   */
  const [history, setHistory] = React.useState<string[]>([contextPathProp]);

  const handleDrillDown = (event: React.MouseEvent) => {
    const newContextPath = (event.target as HTMLElement).dataset.path;
    setHistory((prevHistory) => [...prevHistory, newContextPath]);
    // unselect all
    setState((prevState) => ({
      selectedFilePaths: new Set<string>(),
      expandedDirs: prevState.expandedDirs,
      lastSelectedPath: undefined,
    }));
  };

  const handleNavBack = () => {
    if (history.length <= 1) return; // already at root
    setHistory((prevHistory) => prevHistory.slice(0, -1));
    unselectAll();
  };

  const handleNavUp = () => {
    const contextPath = history[history.length - 1];
    if (contextPath === "/" || contextPath === "") return; // already at root
    const parts = contextPath.split("/").filter((p) => p.length > 0);
    parts.pop(); // remove last part
    const newContextPath = "/" + parts.join("/");
    setHistory((prevHistory) => [...prevHistory, newContextPath]);
    unselectAll();
  };

  const handleCrumbNav = (event: React.MouseEvent) => {
    const targetPath = (event.target as HTMLElement).dataset.path;
    if (!targetPath) return;
    setHistory((prevHistory) => [...prevHistory, targetPath]);
    unselectAll();
  };

  /**
   * City download weather handler
   */
  const handleDownloadCity = () => {
    if (state.selectedFilePaths.size !== 1) return;
    const selectedPath = [...state.selectedFilePaths][0];
    const node = fileSystem.getNode(selectedPath);
    if (!node || !node.name.endsWith(".city")) return;

    // extract city and country from filename, give the format new_york__us.city
    const [city, country] = node.name.replace(".city", "").split("__");
    // download json from https://api.openweathermap.org/data/2.5/weather?q={city name},{country code}&appid={API key}
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${process.env.OPEN_WEATHER_API_KEY}`;
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const weatherData = JSON.stringify(data, null, 2);
        const blob = new Blob([weatherData], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        // Create a temporary link to trigger the download
        const a = document.createElement("a");
        a.href = url;
        a.download = `${city}__${country}_weather.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Failed to fetch weather data:", error);
        alert(
          "Failed to fetch weather data. Please check the city and country code."
        );
      });
  };

  // Helper function to get all visible items in current view (for range selection)
  const getAllVisibleItems = (
    fs: FileSystem,
    path: string,
    expanded: Set<string>
  ): FileNode[] => {
    const flattenNodes = (nodes: FileNode[]): FileNode[] => {
      const result: FileNode[] = [];
      for (const node of nodes) {
        result.push(node);
        if (node.type === "directory" && expanded.has(node.path)) {
          const children = fs.getChildNodes(node.path);
          result.push(...flattenNodes(children));
        }
      }
      return result;
    };
    return flattenNodes(fs.getChildNodes(path));
  };

  const contextPath = history[history.length - 1];
  const canNavBack = history.length > 1;
  const canNavUp = contextPath !== "/" && contextPath !== "";
  const isSearchMode = searchValue.trim().length > 0;
  const isSearchResultsMode = searchValue.trim().length > 0;
  const oneCitySelected =
    state.selectedFilePaths.size === 1 &&
    [...state.selectedFilePaths][0].endsWith(".city");

  // reset selection/expansion/search state if fileSystem or contextPathProp changes
  React.useEffect(() => {
    setHistory([contextPathProp]);
    setSearchValue("");
    setState({
      selectedFilePaths: new Set<string>(),
      expandedDirs: new Set(),
      lastSelectedPath: undefined,
    });
    setActionDialogState({
      type: "file",
      actionType: "create",
      visible: false,
    });
  }, [fileSystem, contextPathProp]);

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: 4,
        padding: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          marginBottom: 10,
        }}
      >
        <div style={{ flexGrow: 1 }}>
          <Breadcrumbs
            onFileDrop={handleFileMove}
            contextPath={contextPath}
            onCrumbClick={handleCrumbNav}
          />
        </div>
        {showCloseIcon && onClose && (
          <button
            onClick={onClose}
            style={{
              padding: "4px 6px",
              marginLeft: 10,
              fontSize: 15,
              cursor: "pointer",
            }}
            aria-label="Close File System View"
          >
            ｘ
          </button>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <FileSystemViewToolbar
          onMoveSelectedButton={handleMoveDialogOpen}
          disableCreate={isSearchMode}
          disableNav={isSearchMode}
          disableExpansion={isSearchMode}
          disableDownloadCity={!oneCitySelected}
          selectedFilePaths={state.selectedFilePaths}
          onDownloadCityButton={handleDownloadCity}
          onCreateFileButton={handleCreateFileDiagOpen}
          onCreateDirectoryButton={handleCreateDirDiagOpen}
          onDeleteSelectedButton={handleDeleleteDiagOpen}
          onCollapseAllButton={handleCollapseAll}
          onExpandAllButton={handleExpandAll}
          onNavigateUpButton={handleNavUp}
          onNavigateBackButton={handleNavBack}
          canNavUp={canNavUp}
          canNavBack={canNavBack}
        />
        <Search
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>
      <FileTree
        searchValue={searchValue}
        expandedDirs={state.expandedDirs}
        selectedFilePaths={state.selectedFilePaths}
        handleExpandleToggle={handleExpandleToggle}
        handleItemSelect={handleItemSelect}
        handleOutsideClick={unselectAll}
        onDrillDown={handleDrillDown}
        contextPath={contextPath}
        fileSystem={fileSystem}
        onFileDrop={handleFileMove}
      />
      {!isSearchMode && state.selectedFilePaths.size > 0 ? (
        <SelectionInfo
          selectedFilePaths={state.selectedFilePaths}
          fileSystem={fileSystem}
        />
      ) : null}
      <MoveDialog
        open={moveDiagOpen}
        onClose={handleMoveDialogClose}
        progress={moveProgress}
      />
      <ActionDialog
        open={actionDialogState.visible}
        actionType={actionDialogState.actionType}
        selection={Array.from(state.selectedFilePaths)}
        onSelectionAction={(partialNode?: Partial<FileNode>) => {
          if (actionDialogState.actionType === "delete") {
            // perform delete action
            fileSystem.removeFiles(Array.from(state.selectedFilePaths));
            const newExpandedDirs = new Set<string>(state.expandedDirs);
            // also remove any expanded dirs that were deleted
            for (let path of state.selectedFilePaths) {
              for (let dirPath of newExpandedDirs) {
                if (dirPath.startsWith(path + "/")) {
                  newExpandedDirs.delete(dirPath);
                }
              }
            }
            setState((prevState) => ({
              selectedFilePaths: new Set<string>(),
              expandedDirs: newExpandedDirs,
            }));
            setActionDialogState({ ...actionDialogState, visible: false });
          } else if (partialNode && actionDialogState.actionType === "create") {
            // perform create action
            fileSystem.createFileOrDirectory(partialNode);
            setActionDialogState({ ...actionDialogState, visible: false });
          }
        }}
        createType={actionDialogState.type}
        onCreate={handleCreateNode}
        onCancel={handleCancelActionDialog}
      />
    </div>
  );
}
