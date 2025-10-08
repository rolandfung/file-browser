import * as React from "react";
import { FileTreeNode } from "../FileTreeNode";
import { DialogBase, DialogBaseProps } from "./DialogBase";
interface ActionDialogProps extends DialogBaseProps {
  createType: "file" | "directory"; // only used if actionType is "create"
  actionType: "create" | "delete";
  onCreate: (node: FileTreeNode) => void; // only used if actionType is "create"
  selection: FileTreeNode[]; // only used if actionType is "delete"
  onDelete: () => void;
  onCancel: () => void;
}

export function ActionDialog({
  open,
  createType,
  actionType,
  onCreate,
  onCancel,
  onDelete,
  selection,
}: ActionDialogProps) {
  const [name, setName] = React.useState("");
  const nameIsValid =
    createType === "file" ? fileNameValid(name) : dirNameValid(name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (actionType === "delete" && selection.length > 0) {
      onDelete();
      return;
    } else {
      // create
      if (name.trim()) {
        onCreate(
          new FileTreeNode(
            name.trim(),
            createType,
            createType === "file" ? Math.floor(Math.random() * 10000) + 100 : 0,
            new Date()
          )
        );
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
          <label style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {createType === "file" ? "File Name:" : "Directory Name:"}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </label>
        )}
        {name && !nameIsValid && (
          <div style={{ color: "red" }}>
            Invalid {createType} name. Cannot be empty or contain slashes.
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            type="submit"
            disabled={actionType === "create" && !nameIsValid}
          >
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

function fileNameValid(name: string): boolean {
  // Basic validation: non-empty, no slashes or backslashes
  if (!name || /[\/\\]/.test(name)) return false;
  return true;
}

function dirNameValid(name: string): boolean {
  // Basic validation: non-empty, no slashes or backslashes
  if (!name || /[\/\\]/.test(name)) return false;
  return true;
}
