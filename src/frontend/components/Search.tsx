import * as React from "react";
export function Search({
  onChange,
}: {
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const debouncedOnChange = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (debouncedOnChange.current) {
      clearTimeout(debouncedOnChange.current);
    }
    debouncedOnChange.current = setTimeout(() => {
      if (onChange) {
        onChange(event);
      }
    }, 300);
  };

  return (
    <input
      type="text"
      placeholder="Search..."
      onChange={onChangeHandler}
      style={{
        display: "block",
        marginBottom: 10,
        padding: "5px",
        width: "30ch",
      }}
    />
  );
}
