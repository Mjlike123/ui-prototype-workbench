export type SelectorButtonSize = "default" | "compact";
export type SelectorButtonSelectionMode = "single" | "multiple";

export type SelectorButtonProps = {
  selected: boolean;
  onChange: (selected: boolean) => void;
  disabled?: boolean;
  size?: SelectorButtonSize;
  selectionMode?: SelectorButtonSelectionMode;
  className?: string;
  id?: string;
  name?: string;
  "aria-label"?: string;
};

export function SelectorButton({
  selected,
  onChange,
  disabled = false,
  size = "default",
  selectionMode = "multiple",
  className,
  id,
  name,
  "aria-label": ariaLabel,
}: SelectorButtonProps) {
  return (
    <input
      type={selectionMode === "single" ? "radio" : "checkbox"}
      id={id}
      name={name}
      className={[
        "kitSelectorButton",
        size === "compact" ? "kitSelectorButton--compact" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      checked={selected}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(event) => onChange(event.currentTarget.checked)}
    />
  );
}
