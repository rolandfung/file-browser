import * as React from "react";
import { FileSystem } from "../FileSystem";
import { ConflictResolution } from "../types";

/**
 * Example usage of the generator-based file move with conflict resolution
 */
export async function handleMoveWithConfirmation(
  fileSystem: FileSystem,
  selectedPaths: string[],
  targetDirPath: string
): Promise<void> {
  const moveGenerator = fileSystem.moveFiles(selectedPaths, targetDirPath);

  let result = moveGenerator.next();

  while (!result.done) {
    const conflict = result.value;

    // Show confirmation dialog to user
    const userDecision = await showConflictDialog(conflict);

    // Send user's decision back to generator
    result = moveGenerator.next(userDecision);
  }

  const finalResult = result.value;
  if (finalResult.cancelled) {
    console.debug("Move operation was cancelled");
  } else {
    console.debug(`Successfully moved ${finalResult.moved.length} files`);
  }
}

/**
 * Mock function to simulate user interaction
 * In a real app, this would show a modal or dialog
 */
async function showConflictDialog(conflict: any): Promise<ConflictResolution> {
  return new Promise((resolve) => {
    const message = `
${conflict.message}
Original: ${conflict.originalFile.name} (${conflict.originalFile.size} bytes)
Existing: ${conflict.existingFile.name} (${conflict.existingFile.size} bytes)
Target: ${conflict.targetPath}

Choose an action:
- replace: Overwrite the existing file
- skip: Skip this file and continue
- cancel: Cancel the entire operation
    `;

    // In a real app, you'd show a proper dialog
    const userInput = prompt(message + "\\n\\nEnter: replace, skip, or cancel");

    switch (userInput?.toLowerCase()) {
      case "replace":
        resolve("replace");
        break;
      case "skip":
        resolve("skip");
        break;
      case "cancel":
      default:
        resolve("cancel");
        break;
    }
  });
}

/**
 * React hook version for use in components
 */
export function useMoveWithConfirmation(fileSystem: FileSystem) {
  const [isMoving, setIsMoving] = React.useState(false);
  const [currentConflict, setCurrentConflict] = React.useState<any>(null);

  const moveFiles = async (selectedPaths: string[], targetDirPath: string) => {
    setIsMoving(true);

    try {
      const moveGenerator = fileSystem.moveFiles(selectedPaths, targetDirPath);
      let result = moveGenerator.next();

      while (!result.done) {
        const conflict = result.value;
        setCurrentConflict(conflict);

        // Wait for user decision (would come from a modal component)
        const decision = await waitForUserDecision();
        setCurrentConflict(null);

        result = moveGenerator.next(decision);
      }

      const finalResult = result.value;
      return finalResult;
    } finally {
      setIsMoving(false);
    }
  };

  const resolveConflict = (decision: ConflictResolution) => {
    // This would be called by the modal component
    // Implementation depends on how you handle async state
  };

  return {
    moveFiles,
    isMoving,
    currentConflict,
    resolveConflict,
  };
}

// Helper function - in real implementation this would integrate with your modal state
async function waitForUserDecision(): Promise<ConflictResolution> {
  // This is a placeholder - you'd integrate this with your React state management
  return new Promise((resolve) => {
    // Resolve when modal component calls resolveConflict
  });
}
