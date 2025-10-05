import * as React from "react";
import { DialogBase, DialogBaseProps } from "./DialogBase";

export interface MoveDialogProps extends DialogBaseProps {
  progress: { current: number; total: number } | null;
}

export function MoveDialog({
  open,
  onClose,
  progress,
}: {
  open: boolean;
  onClose: () => void;
  progress: { current: number; total: number } | null;
}) {
  return (
    <DialogBase open={open} onClose={onClose} title="Moving Files">
      {progress ? (
        <p>
          {progress.current} / {progress.total}
        </p>
      ) : (
        <p>Preparing...</p>
      )}
      <button onClick={onClose}>Close</button>
    </DialogBase>
  );
}
