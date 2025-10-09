import * as React from "react";
export function Search({
  onChange,
  value,
}: {
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder="Search in current path..."
      onChange={onChange}
      style={{
        display: "block",
        marginBottom: 10,
        padding: "5px",
        width: "30ch",
      }}
    />
  );
}
