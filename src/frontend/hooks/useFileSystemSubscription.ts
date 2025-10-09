import * as React from "react";
import { FileSystem } from "../FileSystem";
import { FileTreeNode } from "../FileTreeNode";

export function useFileSystemSubscription(
  fs: FileSystem,
  contextNode: FileTreeNode
) {
  // _forceRender is used to re-render when the fileSystem emits a change event
  const [, _forceRender] = React.useReducer((x) => x + 1, 0);

  const oldUnsub = React.useRef<() => void>();
  React.useEffect(() => {
    oldUnsub.current?.();
    oldUnsub.current = fs.subscribeToChanges(contextNode, _forceRender);
    return () => oldUnsub.current?.();
  }, [contextNode, fs]);
}
