import { useRef, useCallback, useState, useEffect } from "react";
import { FileNode } from "../types";

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
  payload: {
    files: FileNode[];
    directories: FileNode[];
  };
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
  onFilesGenerated: (files: FileNode[], directories: FileNode[]) => void
): UseFileGenerationWorkerResult => {
  const workerRef = useRef<Worker | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Initialize worker
  useEffect(() => {
    // Create the worker
    workerRef.current = new Worker("/fileGenerationWorker.js");

    // Handle worker messages
    workerRef.current.onmessage = (
      event: MessageEvent<WorkerResponseMessage>
    ) => {
      const { type, payload } = event.data;

      switch (type) {
        case "PROGRESS":
          setProgress(payload.progress);
          setStatusMessage(payload.message);
          break;

        case "COMPLETE":
          setIsGenerating(false);
          setProgress(100);
          setStatusMessage("Files generated successfully!");
          onFilesGenerated(payload.files, payload.directories);

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
          console.error("Worker error:", payload);
          break;

        default:
          console.warn("Unknown worker message type:", type);
      }
    };

    // Handle worker errors
    workerRef.current.onerror = (error) => {
      setIsGenerating(false);
      setError("Worker failed to load");
      setStatusMessage("Worker initialization failed");
      console.error("Worker error:", error);
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
