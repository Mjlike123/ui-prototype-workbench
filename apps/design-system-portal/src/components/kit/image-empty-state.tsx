import Image from "next/image";

export type ImageEmptyTheme = "light" | "dark";

const PICTURE_ICON_SRC: Record<ImageEmptyTheme, string> = {
  light: "/icons/image-empty/picture-light.png",
  dark: "/icons/image-empty/picture-dark.png",
};

type ImageEmptyStateProps = {
  theme?: ImageEmptyTheme;
  className?: string;
  "aria-label"?: string;
};

export function ImageEmptyState({
  theme = "light",
  className = "",
  "aria-label": ariaLabel = "暂无图片",
}: ImageEmptyStateProps) {
  return (
    <div
      className={`imageEmptyState imageEmptyState--${theme}${className ? ` ${className}` : ""}`}
      role="img"
      aria-label={ariaLabel}
    >
      <Image
        className="imageEmptyStateIcon"
        src={PICTURE_ICON_SRC[theme]}
        alt=""
        width={72}
        height={72}
        unoptimized
        aria-hidden="true"
      />
    </div>
  );
}
