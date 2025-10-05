import * as React from "react";

export interface DialogBaseProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children?: React.ReactNode;
}

// shared between MoveDialog and ActionDialog
export function DialogBase({
  open,
  onClose,
  title,
  children,
}: DialogBaseProps) {
  if (!open) return null;

  return (
    <div
      style={{
        zIndex: 1000,
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          minWidth: "300px",
          maxWidth: "90%",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 style={{ marginTop: 0 }}>{title}</h2>}
        {children}
      </div>
    </div>
  );
}
