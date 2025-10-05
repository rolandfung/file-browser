import * as React from "react";
import { FileSystem } from "../FileSystem";
import { FileSystemView } from "./FileSystemView";

interface MultiFileSystemViewProps {
  fileSystem: FileSystem;
}
export function MultiFileSystemView({ fileSystem }: MultiFileSystemViewProps) {
  const [views, setViews] = React.useState<number[]>([0]);

  const handleAddView = () => {
    const newIndex = views.length > 0 ? Math.max(...views) + 1 : 0;
    setViews([...views, newIndex]);
  };

  const handleRemoveView = (index: number) => {
    if (views.length > 1) {
      setViews(views.filter((i) => i !== index));
    }
  };

  return (
    <div>
      <button onClick={handleAddView} style={{ marginBottom: 10 }}>
        Add View
      </button>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {views.map((index) => (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              flex: "1 1 300px",
              minWidth: 300,
              maxWidth: 600,
            }}
          >
            <FileSystemView
              showCloseIcon={views.length > 1}
              onClose={() => handleRemoveView(index)}
              fileSystem={fileSystem}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
