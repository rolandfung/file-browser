import * as React from "react";
import { DialogBase, DialogBaseProps } from "./DialogBase";
import { FileSystem } from "../FileSystem";
import { ConflictResolution } from "../types";
export interface MoveDialogProps extends DialogBaseProps {
  progress: { current: number; total: number } | null;
  fileSystem: FileSystem;
}

interface MoveDialogContextType {
  open: boolean;
  fileSystem: FileSystem | null;
  progress: { current: number; total: number } | null;
  closeMoveDialog: () => void;
  startMove: (filePaths: string[], targetPath: string) => void;
  conflict?: {
    originalFilePath: string;
    existingFilePath: string;
    targetPath: string;
  } | null;
  resolveConflict?: (resolution: ConflictResolution) => void;
}

export const MoveDialogContext = React.createContext<MoveDialogContextType>({
  fileSystem: null,
  open: false,
  progress: null,
  closeMoveDialog: () => {},
  startMove: () => {},
  conflict: null,
  resolveConflict: () => {},
});

export const MoveDialogContextProvider = ({
  children,
  fileSystem,
  onDialogClose,
}: {
  children: React.ReactNode;
  fileSystem: FileSystem;
  onDialogClose?: () => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const [conflict, setConflict] = React.useState<{
    originalFilePath: string;
    existingFilePath: string;
    targetPath: string;
  } | null>(null);
  const activeGeneratorRef = React.useRef<Generator<
    any,
    any,
    ConflictResolution | void
  > | null>(null);

  const resolveConflict = async (resolution: ConflictResolution) => {
    if (resolution === "cancel") {
      activeGeneratorRef.current = null;
      closeMoveDialog();
      return;
    }

    if (activeGeneratorRef.current && conflict) {
      setConflict(null);

      try {
        // Resume the generator with the user's resolution
        let result = activeGeneratorRef.current.next(resolution);

        // Continue processing the generator
        while (!result.done) {
          const value = result.value;

          if ("type" in value && value.type === "conflict") {
            // Another conflict - yield control back to user
            setConflict({
              originalFilePath: value.originalFile.path,
              existingFilePath: value.existingFile.path,
              targetPath: value.targetPath,
            });
            return; // Exit and wait for next user resolution
          } else if ("type" in value && value.type === "progress") {
            // Handle progress updates
            setProgress({ current: value.current, total: value.total });
            // Add artificial delay in demo mode
            if (process.env.DEMO_MODE === "true") {
              await new Promise((resolve) => setTimeout(resolve, 200));
            }
            result = activeGeneratorRef.current.next();
          } else {
            // Unexpected yield value or completion
            result = activeGeneratorRef.current.next();
          }
        }

        // Generator completed successfully
        activeGeneratorRef.current = null;
        closeMoveDialog();
      } catch (error) {
        console.error("Failed to resume move operation:", error);
        activeGeneratorRef.current = null;
        closeMoveDialog();
      }
    }
  };

  const [progress, setProgress] = React.useState<{
    current: number;
    total: number;
  } | null>(null);

  const closeMoveDialog = () => {
    setOpen(false);
    onDialogClose?.();
    setProgress(null);
    setConflict(null);
    activeGeneratorRef.current = null;
  };

  const startMove = async (filePaths: string[], targetPath: string) => {
    setOpen(true);
    setProgress({ current: 0, total: filePaths.length });

    try {
      // Create and store the generator
      const moveGenerator = fileSystem.moveFiles(filePaths, targetPath);
      activeGeneratorRef.current = moveGenerator;

      let result = moveGenerator.next();
      while (!result.done) {
        const value = result.value;

        if ("type" in value && value.type === "conflict") {
          // Yield control to user to resolve conflict
          setConflict({
            originalFilePath: value.originalFile.path,
            existingFilePath: value.existingFile.path,
            targetPath: value.targetPath,
          });
          return; // Exit and wait for user resolution via resolveConflict
        } else if ("type" in value && value.type === "progress") {
          // Handle progress updates
          setProgress({ current: value.current, total: value.total });
          // Add artificial delay in demo mode
          if (process.env.DEMO_MODE === "true") {
            await new Promise((resolve) => setTimeout(resolve, 200));
          }
          result = moveGenerator.next();
        } else {
          // Unexpected yield value or completion
          result = moveGenerator.next();
        }
      }

      // Generator completed successfully
      activeGeneratorRef.current = null;
      closeMoveDialog();
    } catch (error) {
      console.error("Failed to move files:", error);
      activeGeneratorRef.current = null;
      closeMoveDialog();
    }
  };

  return (
    <MoveDialogContext.Provider
      value={{
        open,
        fileSystem,
        progress,
        closeMoveDialog,
        startMove,
        conflict,
        resolveConflict,
      }}
    >
      {children}
    </MoveDialogContext.Provider>
  );
};

export const useMoveDialogContext = () => {
  const context = React.useContext(MoveDialogContext);
  if (!context.fileSystem) {
    throw new Error(
      "useMoveDialogContext must be used within a MoveDialogContext.Provider"
    );
  }
  return context;
};

export function MoveDialog() {
  const {
    progress: moveProgress,
    closeMoveDialog: onClose,
    open,
    conflict,
    resolveConflict,
  } = useMoveDialogContext();

  return (
    <DialogBase open={open} onClose={onClose} title="Moving Files">
      {conflict ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <p>
            Conflict moving {conflict.originalFilePath} to {conflict.targetPath}
            :
          </p>
          <p>
            A file already exists at {conflict.existingFilePath}. What would you
            like to do?
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => resolveConflict && resolveConflict("replace")}
            >
              Replace
            </button>
            <button onClick={() => resolveConflict && resolveConflict("skip")}>
              Skip
            </button>
            <button
              onClick={() => resolveConflict && resolveConflict("cancel")}
            >
              Cancel Move
            </button>
          </div>
        </div>
      ) : moveProgress ? (
        <p>
          {moveProgress.current} / {moveProgress.total}
        </p>
      ) : (
        <p>Preparing...</p>
      )}
      {conflict ? null : <button onClick={onClose}>Close</button>}
    </DialogBase>
  );
}
