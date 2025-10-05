import * as React from "react";
import { FileSystem } from "./FileSystem";
import { createRoot } from "react-dom/client";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";

import { FileNode } from "./types";
import { generate10kFiles } from "./datagen/fileSystemHelpers";
import { MultiFileSystemView } from "./components/MultiFileSystemView";

interface AppProps {}

interface AppState {
  fsNodes: FileNode[];
}

export class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    // const { directories, files } = generateEmptyFileSystem();
    this.state = { fsNodes: [] };
  }

  handleGenerateFiles = () => {
    const tenKNodes = generate10kFiles();
    console.log(tenKNodes);
    this.setState({ fsNodes: [...tenKNodes.files, ...tenKNodes.directories] });
  };

  render() {
    const { fsNodes } = this.state;
    return (
      <DndProvider backend={HTML5Backend}>
        <h2>File Browser Demo</h2>
        <button
          onClick={this.handleGenerateFiles}
          style={{
            padding: "10px 20px",
            marginBottom: "20px",
            fontSize: "16px",
          }}
        >
          Generate 10k Files/Directories
        </button>
        <MultiFileSystemView fileSystem={new FileSystem(fsNodes)} />
      </DndProvider>
    );
  }
}

export function start() {
  const rootElem = document.getElementById("main");
  const root = createRoot(rootElem);
  root.render(<App />);
}
