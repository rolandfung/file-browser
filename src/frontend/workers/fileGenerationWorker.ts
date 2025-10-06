// Web Worker for generating file system data
// This worker runs the heavy file generation in a separate thread

// Import the file generation function
import { generate10kFiles } from "../datagen/fileSystemHelpers";

// Define message types for type safety
interface GenerateFilesMessage {
  type: "GENERATE_FILES";
}

interface ProgressMessage {
  type: "PROGRESS";
  payload: {
    message: string;
    progress: number;
  };
}

interface CompleteMessage {
  type: "COMPLETE";
  payload: {
    files: any[];
    directories: any[];
  };
}

interface ErrorMessage {
  type: "ERROR";
  payload: {
    message: string;
  };
}

type WorkerMessage = GenerateFilesMessage;

// Listen for messages from the main thread
self.addEventListener("message", async (event: MessageEvent<WorkerMessage>) => {
  const { type } = event.data;

  try {
    switch (type) {
      case "GENERATE_FILES": {
        // Create a progress callback that sends updates to main thread
        const onProgress = (
          progress: number,
          message: string,
          currentItem?: string
        ) => {
          const fullMessage = currentItem
            ? `${message} - ${currentItem}`
            : message;
          self.postMessage({
            type: "PROGRESS",
            payload: { message: fullMessage, progress: Math.round(progress) },
          } as ProgressMessage);
        };

        // Start with initial progress
        onProgress(0, "Initializing file generation...");

        // Do the actual heavy computation with real progress reporting
        const result = await generate10kFiles(onProgress);

        // Send the completed result
        self.postMessage({
          type: "COMPLETE",
          payload: {
            files: result.files,
            directories: result.directories,
          },
        } as CompleteMessage);

        break;
      }

      default:
        self.postMessage({
          type: "ERROR",
          payload: { message: `Unknown message type: ${type}` },
        } as ErrorMessage);
    }
  } catch (error) {
    self.postMessage({
      type: "ERROR",
      payload: {
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
    } as ErrorMessage);
  }
});

// Make TypeScript happy about the worker context
export {};
