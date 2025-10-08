import { FileSystem } from "../FileSystem";
import { FileTreeNode } from "../FileTreeNode";
import { TreeOperation } from "../types";
import * as React from "react";
import { FileTree } from "./FileTree";
import { FileSystemViewToolbar } from "./FileSystemViewToolbar";
import { Breadcrumbs } from "./Breadcrumbs";
import { Search } from "./Search";
import { ActionDialog } from "./ActionDialog";
import { SelectionInfo } from "./SelectionInfo";
import { useMoveDialogContext } from "./MoveDialog";

interface FileSystemViewProps {
  fileSystem: FileSystem;
  showCloseIcon?: boolean;
  onClose?: () => void;
}

export function FileSystemView({
  fileSystem: fsProp,
  showCloseIcon = false,
  onClose,
}: FileSystemViewProps) {
  /**
   * Navigation state and handlers
   */

  const [fs, setFs] = React.useState<FileSystem>(fsProp);
  const previousFsPropRef = React.useRef<FileSystem>(fsProp);

  const [history, setHistory] = React.useState<FileTreeNode[]>([fs.root]);
  const contextNode = history[history.length - 1];

  // _forceRender is used to re-render when the fileSystem emits a change event
  const [, _forceRender] = React.useReducer((x) => x + 1, 0);
  // forceUpdate function detects if any of the affected nodes are in the current context path
  const forceUpdate = React.useCallback(
    (event: CustomEvent<TreeOperation>) => {
      console.debug("FileSystemView detected TreeOperation:", event.detail);
      // if any of the affected nodes are in the contextNode's path, re-render. Could
      // go extra crazy and check if the an affected node is actually visible (e.g.
      // in an expanded directory), but this is probably good enough for now
      if (
        Array.from(event.detail.addDeleteNodes ?? []).some(
          (n) =>
            n.parent.isDescendantOf(contextNode) || n.parent === contextNode
        ) ||
        Array.from(event.detail.movedNodes ?? []).some(
          ([n, origParent]) =>
            // if moved node is in context path
            n.parent.isDescendantOf(contextNode) ||
            n.parent === contextNode ||
            // or if original parent is in context path
            origParent.isDescendantOf(contextNode) ||
            origParent === contextNode
        )
      ) {
        _forceRender();
      }
    },
    [contextNode]
  );

  React.useEffect(() => {
    // detect if the fsProp has changed, or if the forceUpdate function has changed due to a change in contextNode
    const fsPropChanged = previousFsPropRef.current !== fsProp;
    previousFsPropRef.current = fsProp;

    setFs((prevFs) => {
      prevFs.removeEventListener("change", forceUpdate);
      fsProp.addEventListener("change", forceUpdate);
      // reset history to root of new fs, only if the fs has changed, but not if
      // only the forceUpdate function has changed solely due to a
      // navigation/contextNode change
      if (fsPropChanged) {
        setHistory([fsProp.root]);
      }
      return fsProp;
    });
    // cleanup function to remove listener
    return () => {
      fsProp.removeEventListener("change", forceUpdate);
    };
  }, [fsProp, forceUpdate]);

  const handleDrillDown = (node: FileTreeNode) => {
    setHistory((prevHistory) => [...prevHistory, node]);
    // unselect all
    setState((prevState) => ({
      selectedNodes: new Set<FileTreeNode>(),
      expandedNodes: prevState.expandedNodes,
      lastSelectedNode: undefined,
    }));
  };

  const handleNavBack = () => {
    if (history.length <= 1) return; // already at root
    setHistory((prevHistory) => prevHistory.slice(0, -1));
    unselectAll();
  };

  const handleNavUp = () => {
    const lastNode = history[history.length - 1];
    if (lastNode.getFullNodePath() === "/") return; // already at root
    setHistory((prevHistory) => [
      ...prevHistory,
      lastNode.parent as FileTreeNode,
    ]);
    unselectAll();
  };

  const handleCrumbNav = (crumbNode: FileTreeNode) => {
    setHistory((prevHistory) => [...prevHistory, crumbNode]);
    unselectAll();
  };

  /**
   * Move dialog state and handlers
   */
  const { startMove } = useMoveDialogContext();
  // const handleMoveDialogOpen = () => {}
  const handleFileMove = async (
    droppedNodes: FileTreeNode[],
    targetNode: FileTreeNode
  ) => {
    startMove(droppedNodes, targetNode);
    // clear selection
    setState((prevState) => ({
      selectedNodes: new Set<FileTreeNode>(),
      expandedNodes: prevState.expandedNodes,
      lastSelectedNode: undefined, // for determining beginning of range selection
    }));
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
   * Search and sort state and handlers
   */
  const [searchValue, setSearchValue] = React.useState<string>("");
  const [sort, setSortMode] = React.useState<{
    mode: "name" | "type";
    asc: boolean;
  }>({ mode: "type", asc: true });
  const sortingFunc = (a: FileTreeNode, b: FileTreeNode): number => {
    // if sortMode is "type", sort by type then name
    if (sort.mode === "type") {
      const typeCompare = a.type.localeCompare(b.type);
      if (typeCompare === 0) {
        return sort.asc
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      return sort.asc ? typeCompare : -typeCompare;
    }
    // if sortMode is "name", sort by type
    return sort.asc
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name);
  };

  /**
   * Selection and expansion state and handlers
   */
  const [state, setState] = React.useState<{
    selectedNodes: Set<FileTreeNode>;
    expandedNodes: Set<FileTreeNode>;
    lastSelectedNode?: FileTreeNode;
  }>({
    selectedNodes: new Set<FileTreeNode>(),
    expandedNodes: new Set<FileTreeNode>(),
    lastSelectedNode: undefined,
  });

  const unselectAll = () => {
    setState((prevState) => ({
      selectedNodes: new Set<FileTreeNode>(),
      expandedNodes: prevState.expandedNodes,
      lastSelectedNode: undefined,
    }));
  };

  const handleCollapseAll = () => {
    setState((prevState) => ({
      selectedNodes: prevState.selectedNodes,
      expandedNodes: new Set<FileTreeNode>(),
      lastSelectedNode: prevState.lastSelectedNode,
    }));
  };

  // user clicked on expand/collapse icon of a directory
  const handleExpandleToggle = (node: FileTreeNode) => {
    setState(
      ({
        selectedNodes: prevSelectedNodes,
        expandedNodes: prevExpandedNodes,
        lastSelectedNode: prevLastSelectedNode,
      }) => {
        const newExpandedNodes = new Set(prevExpandedNodes);
        const newSelectedNodes = new Set(prevSelectedNodes);
        // collapsing directory
        if (newExpandedNodes.has(node)) {
          newExpandedNodes.delete(node);
          // unselect any files within directory being collapsed
          for (let selectedNode of newSelectedNodes) {
            if (selectedNode.isDescendantOf(node)) {
              newSelectedNodes.delete(selectedNode);
            }
          }
        } else {
          // expanding directory
          newExpandedNodes.add(node);
        }
        return {
          selectedNodes: newSelectedNodes,
          expandedNodes: newExpandedNodes,
          lastSelectedNode: prevLastSelectedNode,
        };
      }
    );
  };

  // user clicked on file/folder name to select/unselect
  const handleItemSelect = (
    event: React.MouseEvent<HTMLElement>,
    node: FileTreeNode,
    sortingFunc: (a: FileTreeNode, b: FileTreeNode) => number
  ) => {
    setState(
      ({
        selectedNodes: prevSelectedNodes,
        expandedNodes: prevExpandedNodes,
        lastSelectedNode: prevLastSelectedNode,
      }) => {
        const newSelectedNodes = new Set(prevSelectedNodes);

        // Range selection with Shift+click
        const isRangeSelect = event.shiftKey && prevLastSelectedNode;
        // Multi-select with Ctrl/Cmd+click
        const isMultiSelect = event.ctrlKey || event.metaKey;

        if (isRangeSelect) {
          // Get all items in current view (flattened)
          const allItems = isSearchResultsMode
            ? contextNode
                .search((node) => {
                  return !!node.name.match(new RegExp(searchValue, "i"));
                })
                .sort(sortingFunc)
            : getAllVisibleItems(contextNode, prevExpandedNodes, sortingFunc);

          // Find indices of start and end items
          const startIndex = allItems.findIndex(
            (item) => item === prevLastSelectedNode
          );
          const endIndex = allItems.findIndex((item) => item === node);

          if (startIndex !== -1 && endIndex !== -1) {
            // Select range between start and end (inclusive)
            const rangeStart = Math.min(startIndex, endIndex);
            const rangeEnd = Math.max(startIndex, endIndex);

            for (let i = rangeStart; i <= rangeEnd; i++) {
              newSelectedNodes.add(allItems[i]);
            }
          }
        } else if (isMultiSelect) {
          if (newSelectedNodes.has(node)) {
            // unselecting
            newSelectedNodes.delete(node);
          } else {
            // selecting
            newSelectedNodes.add(node);
          }
        } else {
          // single select
          if (newSelectedNodes.has(node) && newSelectedNodes.size === 1) {
            // unselecting when it's the only selected item
            newSelectedNodes.clear();
          } else {
            // selecting (clear others first)
            newSelectedNodes.clear();
            newSelectedNodes.add(node);
          }
        }

        return {
          selectedNodes: newSelectedNodes,
          expandedNodes: prevExpandedNodes,
          lastSelectedNode: newSelectedNodes.size > 0 ? node : undefined,
        };
      }
    );
  };

  const handleExpandAll = () => {
    const allDirs = fs.getAllDirectories();
    setState((prevState) => ({
      selectedNodes: prevState.selectedNodes,
      expandedNodes: new Set(allDirs),
      lastSelectedNode: prevState.lastSelectedNode,
    }));
  };

  const exactlyOneOrZeroDirSelected =
    state.selectedNodes.size === 0 ||
    (state.selectedNodes.size === 1 &&
      [...state.selectedNodes][0].type === "directory");

  const handleCreateNode = (newNode: FileTreeNode) => {
    if (!exactlyOneOrZeroDirSelected) return;
    // if one directory selected, create in that node, if none selected, create in current context path
    const parentNode =
      state.selectedNodes.size === 1
        ? [...state.selectedNodes][0]
        : contextNode;
    // the new node's path is parentPath + "/" + name, unless parentPath is "/", then it's just "/" + name

    fs.addNode(newNode, parentNode);
  };

  const handleDelete = () => {
    if (actionDialogState.actionType === "delete") {
      // perform delete action
      fs.deleteNodes(Array.from(state.selectedNodes));
      const newExpandedDirs = new Set<FileTreeNode>(state.expandedNodes);
      // also remove any expanded dirs that were deleted
      for (let n of state.selectedNodes) {
        newExpandedDirs.delete(n);
      }
      setState((prevState) => ({
        ...prevState,
        selectedNodes: new Set<FileTreeNode>(),
        expandedNodes: newExpandedDirs,
      }));
      setActionDialogState({ ...actionDialogState, visible: false });
    }
  };

  /**
   * City download weather handler
   */
  const handleDownloadCity = () => {
    if (state.selectedNodes.size !== 1) return;
    const node = [...state.selectedNodes][0];
    if (!node.name.endsWith(".city")) return;

    // extract city and country from filename, give the format new_york__us.city
    const [city, country] = node.name.replace(".city", "").split("__"); // download json from https://api.openweathermap.org/data/2.5/weather?q={city name},{country code}&appid={API key}
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
    node: FileTreeNode,
    expanded: Set<FileTreeNode>,
    sortingFunc: (a: FileTreeNode, b: FileTreeNode) => number
  ): FileTreeNode[] => {
    const flattenNodes = (nodes: FileTreeNode[]): FileTreeNode[] => {
      const result: FileTreeNode[] = [];
      for (const node of nodes) {
        result.push(node);
        if (node.type === "directory" && expanded.has(node)) {
          const children = node.getChildren().sort(sortingFunc);
          result.push(...flattenNodes(children));
        }
      }
      return result;
    };
    return flattenNodes(node.getChildren()).sort(sortingFunc);
  };

  const canNavUp = contextNode.getFullNodePath() !== "/";
  const canNavBack = history.length > 1;
  const isSearchMode = searchValue.trim().length > 0;
  const isSearchResultsMode = searchValue.trim().length > 0;
  const oneCitySelected =
    state.selectedNodes.size === 1 &&
    [...state.selectedNodes][0].name.endsWith(".city");

  // reset selection/expansion/search state if fileSystem changes
  React.useEffect(() => {
    setSearchValue("");
    setState({
      selectedNodes: new Set<FileTreeNode>(),
      expandedNodes: new Set<FileTreeNode>(),
      lastSelectedNode: undefined,
    });
    setActionDialogState({
      type: "file",
      actionType: "create",
      visible: false,
    });
  }, [fs]);

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
            onFileDrop={startMove}
            contextNode={contextNode}
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
          sort={sort}
          setSort={setSortMode}
          // add back when we have a directory navigator
          // onMoveSelectedButton={handleMoveDialogOpen}
          disableCreate={isSearchMode}
          disableNav={isSearchMode}
          disableExpansion={isSearchMode}
          disableDownloadCity={!oneCitySelected}
          selectedNodes={Array.from(state.selectedNodes)}
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
      </div>
      <Search
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <FileTree
        sortingFunc={sortingFunc}
        searchValue={searchValue}
        expandedDirs={state.expandedNodes}
        selectedNodes={state.selectedNodes}
        handleExpandleToggle={handleExpandleToggle}
        handleItemSelect={handleItemSelect}
        handleOutsideClick={unselectAll}
        onDrillDown={handleDrillDown}
        contextNode={contextNode}
        onFileDrop={handleFileMove}
      />
      {!isSearchMode && state.selectedNodes.size > 0 ? (
        <SelectionInfo selectedNodes={Array.from(state.selectedNodes)} />
      ) : null}
      <ActionDialog
        open={actionDialogState.visible}
        actionType={actionDialogState.actionType}
        selection={Array.from(state.selectedNodes)}
        onDelete={handleDelete}
        createType={actionDialogState.type}
        onCreate={handleCreateNode}
        onCancel={handleCancelActionDialog}
      />
    </div>
  );
}
