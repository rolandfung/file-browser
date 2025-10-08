import { useRef, useCallback, useState, useEffect } from "react";
import { FileTreeNode } from "../FileTreeNode";

interface UseFileGenerationWorkerResult {
  generateFiles: (enableDelay?: boolean) => void;
  isGenerating: boolean;
  progress: number;
  statusMessage: string;
  error: string | null;
}

interface WorkerProgressMessage {
  type: "PROGRESS";
  payload: {
    message: string;
    progress: number;
  };
}

interface WorkerCompleteMessage {
  type: "COMPLETE";
  payload: any; // Serialized FileTreeNode data
}

interface WorkerErrorMessage {
  type: "ERROR";
  payload: {
    message: string;
  };
}

type WorkerResponseMessage =
  | WorkerProgressMessage
  | WorkerCompleteMessage
  | WorkerErrorMessage;

export const useFileGenerationWorker = (
  onFilesGenerated: (root: FileTreeNode) => void
): UseFileGenerationWorkerResult => {
  const workerRef = useRef<Worker | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Initialize worker
  useEffect(() => {
    // Terminate any existing worker
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }

    // Create the worker
    try {
      workerRef.current = new Worker("/fileGenerationWorker.js");
    } catch (error) {
      setError("Failed to create worker: " + (error as Error).message);
      setStatusMessage("Worker initialization failed");
      return () => {}; // Return cleanup function for error case
    }

    if (!workerRef.current) {
      return () => {}; // Return cleanup function if worker creation failed
    }

    // Handle worker messages
    const messageHandler = (event: MessageEvent<WorkerResponseMessage>) => {
      const { type, payload } = event.data;

      switch (type) {
        case "PROGRESS":
          setProgress(payload.progress);
          setStatusMessage(payload.message);
          break;

        case "COMPLETE":
          // Reconstruct FileTreeNode from serialized data
          const deserializeNode = (data: any): FileTreeNode => {
            const node = new FileTreeNode(
              data.name,
              data.type,
              data.size,
              new Date(data.created)
            );

            // Reconstruct children
            if (data.children && Array.isArray(data.children)) {
              for (const [childName, childData] of data.children) {
                const childNode = deserializeNode(childData);
                childNode.parent = node;
                node.children.set(childName, childNode);
              }
            }

            return node;
          };

          let reconstructedRoot;
          try {
            reconstructedRoot = deserializeNode(payload);
          } catch (error) {
            console.error("Error during deserialization:", error);
            setIsGenerating(false);
            setError(
              "Failed to deserialize file structure: " +
                (error as Error).message
            );
            setStatusMessage("Deserialization failed");
            return;
          }

          setIsGenerating(false);
          setProgress(100);
          setStatusMessage("Files generated successfully!");
          onFilesGenerated(reconstructedRoot);

          // Reset after a delay
          setTimeout(() => {
            setProgress(0);
            setStatusMessage("");
          }, 2000);
          break;

        case "ERROR":
          setIsGenerating(false);
          setError(payload.message);
          setStatusMessage("Generation failed");
          break;

        default:
          break;
      }
    };

    workerRef.current.onmessage = messageHandler;

    // Handle worker errors
    workerRef.current.onerror = (error) => {
      setIsGenerating(false);
      setError("Worker failed to load");
      setStatusMessage("Worker initialization failed");
    };

    // Cleanup on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [onFilesGenerated]);

  const generateFiles = useCallback(
    (enableDelay: boolean = false) => {
      if (isGenerating || !workerRef.current) {
        return;
      }

      setIsGenerating(true);
      setProgress(0);
      setError(null);
      setStatusMessage("Initializing...");

      // Send message to worker to start generation
      workerRef.current.postMessage({
        type: "GENERATE_FILES",
        enableArtificialDelay: enableDelay,
      });
    },
    [isGenerating]
  );

  return {
    generateFiles,
    isGenerating,
    progress,
    statusMessage,
    error,
  };
};
