import type { ReactNode } from "react";
import { SystemIcon, type SystemIconName } from "./system-icon";

export type TextButtonSize = "size16" | "size14" | "size12";
export type TextButtonAppearance = "brand" | "neutral";
export type TextButtonEmphasis = "body" | "secondary";
export type TextButtonIconPosition = "none" | "leading" | "trailing";
export type TextButtonTrailingPreset = "chevron";

export type TextButtonProps = {
  label: string;
  size?: TextButtonSize;
  appearance?: TextButtonAppearance;
  emphasis?: TextButtonEmphasis;
  disabled?: boolean;
  iconPosition?: TextButtonIconPosition;
  leadingIcon?: SystemIconName;
  trailingIcon?: SystemIconName;
  trailingPreset?: TextButtonTrailingPreset;
  icon?: ReactNode;
  onPress?: () => void;
  type?: "button" | "submit";
  className?: string;
  id?: string;
  "aria-label"?: string;
};

function iconSizeForTextSize(size: TextButtonSize): number {
  return size === "size12" ? 14 : 20;
}

export function TextButton({
  label,
  size = "size16",
  appearance = "brand",
  emphasis = "body",
  disabled = false,
  iconPosition = "none",
  leadingIcon,
  trailingIcon,
  trailingPreset,
  icon,
  onPress,
  type = "button",
  className,
  id,
  "aria-label": ariaLabel,
}: TextButtonProps) {
  const iconSize = iconSizeForTextSize(size);

  const renderLeading = () => {
    if (iconPosition !== "leading") {
      return null;
    }
    if (icon) {
      return (
        <span className="kitTextButtonIcon" aria-hidden="true">
          {icon}
        </span>
      );
    }
    if (leadingIcon) {
      return (
        <SystemIcon
          name={leadingIcon}
          size={iconSize}
          className="kitTextButtonIcon"
        />
      );
    }
    return null;
  };

  const renderTrailing = () => {
    if (iconPosition !== "trailing") {
      return null;
    }
    if (icon) {
      return (
        <span className="kitTextButtonIcon" aria-hidden="true">
          {icon}
        </span>
      );
    }
    if (trailingPreset === "chevron") {
      return <span className="kitTextButtonChevron" aria-hidden="true" />;
    }
    if (trailingIcon) {
      return (
        <SystemIcon
          name={trailingIcon}
          size={iconSize}
          className="kitTextButtonIcon"
        />
      );
    }
    return null;
  };

  return (
    <button
      type={type}
      id={id}
      className={[
        "kitTextButton",
        `kitTextButton--${size}`,
        `kitTextButton--${appearance}`,
        `kitTextButton--${emphasis}`,
        disabled ? "kitTextButton--disabled" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled}
      aria-label={ariaLabel ?? label}
      onClick={onPress}
    >
      {renderLeading()}
      <span className="kitTextButtonLabel">{label}</span>
      {renderTrailing()}
    </button>
  );
}
