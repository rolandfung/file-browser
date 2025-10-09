import * as React from "react";
import { FileSystem } from "./FileSystem";
import { createRoot } from "react-dom/client";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";

import { FileTreeNode } from "./FileTreeNode";
import { generateEmptyFileSystem } from "./datagen/fileSystemHelpers";
import { MultiFileSystemView } from "./components/MultiFileSystemView";
import { useFileGenerationWorker } from "./hooks/useFileGenerationWorker";

interface AppProps {}

interface AppState {
  fs: FileSystem;
}

const fs = generateEmptyFileSystem();

// Functional component to use hooks for worker
const AppContent: React.FC = () => {
  const onFilesGenerated = React.useCallback((root: FileTreeNode) => {
    fs.addNodes(Array.from(root.children.values()), fs.root);
  }, []);

  const [enableArtificialDelay, setEnableArtificialDelay] =
    React.useState(false);

  const { generateFiles, isGenerating, progress, statusMessage, error } =
    useFileGenerationWorker(onFilesGenerated);

  return (
    <DndProvider backend={HTML5Backend}>
      <h2>File Browser Demo</h2>
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => generateFiles(enableArtificialDelay)}
          disabled={isGenerating}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: isGenerating ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isGenerating ? "not-allowed" : "pointer",
            marginRight: "10px",
            marginBottom: "10px",
          }}
        >
          {isGenerating ? "Generating..." : "Generate 10k Files/Directories"}
        </button>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              checked={enableArtificialDelay}
              onChange={(e) => setEnableArtificialDelay(e.target.checked)}
              disabled={isGenerating}
            />
            Enable artificial delays (for demo purposes - slows down generation)
          </label>
        </div>

        <p>
          Files are generated in a web worker
          {enableArtificialDelay
            ? " with additional artificial delays to"
            : " to"}
          {enableArtificialDelay
            ? " demonstrate non-blocking UI"
            : " avoid blocking the UI"}
          . Note that UI remains responsive
          {enableArtificialDelay ? " even with delays" : ""}
        </p>

        {/* Progress indicator */}
        {(isGenerating || progress > 0) && (
          <div style={{ marginTop: "10px" }}>
            <div
              style={{
                width: "400px",
                backgroundColor: "#f0f0f0",
                borderRadius: "4px",
                height: "20px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  backgroundColor: "#28a745",
                  height: "100%",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <div style={{ marginTop: "5px", fontSize: "14px", color: "#666" }}>
              {statusMessage} {progress > 0 && `(${progress}%)`}
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div
            style={{
              marginTop: "10px",
              color: "#dc3545",
              padding: "10px",
              backgroundColor: "#f8d7da",
              border: "1px solid #f5c6cb",
              borderRadius: "4px",
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
      <hr style={{ marginBottom: "20px" }} />

      <MultiFileSystemView fileSystem={fs} />
    </DndProvider>
  );
};

export class App extends React.Component<AppProps, AppState> {
  render() {
    return <AppContent />;
  }
}

export function start() {
  const rootElem = document.getElementById("main");
  const root = createRoot(rootElem);
  root.render(<App />);
}
