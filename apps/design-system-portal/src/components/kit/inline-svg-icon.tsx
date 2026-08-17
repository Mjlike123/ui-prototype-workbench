import type { CSSProperties } from "react";

export function InlineSvgIcon({
  markup,
  size,
  className,
  title,
  ...dataAttributes
}: {
  markup: string;
  size: number;
  className?: string;
  title?: string;
} & Record<string, string | undefined>) {
  const dataProps = Object.fromEntries(
    Object.entries(dataAttributes).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    ),
  );

  return (
    <span
      className={["inlineSvgIcon", className].filter(Boolean).join(" ")}
      style={
        {
          width: size,
          height: size,
          "--inline-svg-size": `${size}px`,
        } as CSSProperties
      }
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...dataProps}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
