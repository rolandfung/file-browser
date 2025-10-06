import * as React from "react";
import { FileSystem } from "../FileSystem";
import { ConflictResolution, ProgressUpdate, FileConflict } from "../types";

/**
 * Combined generator usage - handles both conflicts and progress in one flow
 */
export async function handleMoveWithCombinedGenerator(
  fileSystem: FileSystem,
  selectedPaths: string[],
  targetDirPath: string,
  onProgress?: (progress: ProgressUpdate) => void,
  onConflict?: (conflict: FileConflict) => Promise<ConflictResolution>
): Promise<void> {
  const moveGenerator = fileSystem.moveFiles(selectedPaths, targetDirPath);
  let result = moveGenerator.next();

  while (!result.done) {
    const yielded = result.value;

    // Type guard for conflict
    if (
      typeof yielded === "object" &&
      yielded &&
      "type" in yielded &&
      yielded.type === "conflict"
    ) {
      // Handle conflict
      const conflict = yielded as FileConflict;
      let userDecision: ConflictResolution;
      if (onConflict) {
        userDecision = await onConflict(conflict);
      } else {
        userDecision = await showConflictDialog(conflict);
      }

      result = moveGenerator.next(userDecision);

      // Type guard for progress
    } else if (
      typeof yielded === "object" &&
      yielded &&
      "type" in yielded &&
      yielded.type === "progress"
    ) {
      // Handle progress update
      const progress = yielded as ProgressUpdate;
      if (onProgress) {
        onProgress(progress);
      } else {
        console.debug(
          `Moving: ${progress.percentage}% (${progress.current}/${progress.total}) - ${progress.currentFile}`
        );
      }

      result = moveGenerator.next();
    } else {
      // Unknown type, continue
      result = moveGenerator.next();
    }
  }

  const finalResult = result.value;
  if (finalResult.cancelled) {
    console.debug("Move operation was cancelled");
  } else {
    console.debug(`Successfully moved ${finalResult.moved.length} files`);
  }
}

/**
 * React hook for the combined generator approach
 */
export function useCombinedMoveGenerator(fileSystem: FileSystem) {
  const [isMoving, setIsMoving] = React.useState(false);
  const [currentConflict, setCurrentConflict] =
    React.useState<FileConflict | null>(null);
  const [progress, setProgress] = React.useState<ProgressUpdate | null>(null);
  const [resolveConflict, setResolveConflict] = React.useState<
    ((decision: ConflictResolution) => void) | null
  >(null);

  const moveFiles = async (selectedPaths: string[], targetDirPath: string) => {
    setIsMoving(true);
    setProgress(null);
    setCurrentConflict(null);

    try {
      await handleMoveWithCombinedGenerator(
        fileSystem,
        selectedPaths,
        targetDirPath,
        // Progress callback
        (progressUpdate) => {
          setProgress(progressUpdate);
        },
        // Conflict callback
        async (conflict) => {
          return new Promise<ConflictResolution>((resolve) => {
            setCurrentConflict(conflict);
            setResolveConflict(() => (decision: ConflictResolution) => {
              setCurrentConflict(null);
              setResolveConflict(null);
              resolve(decision);
            });
          });
        }
      );
    } finally {
      setIsMoving(false);
      setProgress(null);
      setCurrentConflict(null);
      setResolveConflict(null);
    }
  };

  const handleConflictDecision = (decision: ConflictResolution) => {
    if (resolveConflict) {
      resolveConflict(decision);
    }
  };

  return {
    moveFiles,
    isMoving,
    currentConflict,
    progress,
    handleConflictDecision,
  };
}

/**
 * Simple example usage
 */
export async function simpleMoveExample(
  fileSystem: FileSystem,
  selectedPaths: string[],
  targetPath: string
) {
  const generator = fileSystem.moveFiles(selectedPaths, targetPath);
  let result = generator.next();

  while (!result.done) {
    const yielded = result.value;

    // Type guard for conflict
    if (
      typeof yielded === "object" &&
      yielded &&
      "type" in yielded &&
      yielded.type === "conflict"
    ) {
      // Simple browser prompt for conflicts
      const conflict = yielded as FileConflict;
      const userInput = prompt(
        `Conflict: ${conflict.message}\\nChoose: replace, skip, or cancel`
      );
      const decision = (userInput?.toLowerCase() ||
        "cancel") as ConflictResolution;
      result = generator.next(decision);

      // Type guard for progress
    } else if (
      typeof yielded === "object" &&
      yielded &&
      "type" in yielded &&
      yielded.type === "progress"
    ) {
      // Simple console logging for progress
      const progress = yielded as ProgressUpdate;
      console.debug(
        `Progress: ${progress.percentage}% - ${progress.currentFile}`
      );
      result = generator.next();
    } else {
      // Unknown type, continue
      result = generator.next();
    }
  }

  return result.value;
}

// Helper functions
async function showConflictDialog(
  conflict: FileConflict
): Promise<ConflictResolution> {
  return new Promise((resolve) => {
    const userInput = prompt(
      `${conflict.message}\\nChoose: replace, skip, or cancel`
    );
    switch (userInput?.toLowerCase()) {
      case "replace":
        resolve("replace");
        break;
      case "skip":
        resolve("skip");
        break;
      default:
        resolve("cancel");
        break;
    }
  });
}
