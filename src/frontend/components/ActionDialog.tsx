import * as React from "react";
import { FileNode } from "../types";
import { DialogBase, DialogBaseProps } from "./DialogBase";
interface ActionDialogProps extends DialogBaseProps {
  createType: "file" | "directory"; // only used if actionType is "create"
  actionType: "create" | "delete";
  onCreate: (partialNode?: Partial<FileNode>) => void; // only used if actionType is "create"
  selection: string[]; // only used if actionType is "delete"
  onSelectionAction: (partialNode?: Partial<FileNode>) => void;
  onCancel: () => void;
}

export function ActionDialog({
  open,
  createType,
  actionType,
  onCreate,
  onCancel,
  onSelectionAction,
  selection,
}: ActionDialogProps) {
  const [name, setName] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (actionType === "delete" && selection.length > 0) {
      onSelectionAction();
      return;
    } else {
      // create
      if (name.trim()) {
        onCreate({
          name: name.trim(),
          type: createType,
          extension: createType === "file" ? name.split(".").pop() || "" : "",
          size:
            createType === "file" ? Math.floor(Math.random() * 10000) + 100 : 0,
          created: new Date(),
          modified: new Date(),
        });
        setName("");
      }
    }
    onCancel();
  };

  return (
    <DialogBase
      open={open}
      onClose={onCancel}
      title={
        actionType === "create" ? `Create ${createType}` : "Confirm Delete"
      }
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {actionType === "delete" ? (
          <div>
            Are you sure you want to delete the selected {selection.length}{" "}
            {selection.length === 1 ? "item" : "items"}?
          </div>
        ) : (
          <label>
            {createType === "file" ? "File Name:" : "Directory Name:"}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </label>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="submit">
            {actionType === "create" ? "Create" : "OK"}
          </button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </DialogBase>
  );
}
