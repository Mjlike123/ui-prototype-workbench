export type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
};

export function Switch({
  checked,
  onChange,
  disabled = false,
  className,
  id,
  "aria-label": ariaLabel,
}: SwitchProps) {
  return (
    <input
      type="checkbox"
      role="switch"
      id={id}
      className={["kitSwitch", className].filter(Boolean).join(" ")}
      checked={checked}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(event) => onChange(event.currentTarget.checked)}
    />
  );
}
