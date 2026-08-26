import Image, { type ImageProps } from "next/image";
import { displayImagePixels } from "@/lib/display-image-density";

type PrototypeAvatarImageProps = Omit<ImageProps, "width" | "height"> & {
  displaySize: number;
  /** When true, omit inline wrapper dimensions so parent CSS controls layout. */
  layoutFromCss?: boolean;
};

export function PrototypeAvatarImage({
  displaySize,
  layoutFromCss = false,
  sizes,
  className,
  ...props
}: PrototypeAvatarImageProps) {
  const pixelSize = displayImagePixels(displaySize);

  return (
    <span
      className={className ?? "avatarVisualImage"}
      style={
        layoutFromCss
          ? undefined
          : { width: displaySize, height: displaySize }
      }
    >
      <Image
        {...props}
        className={className}
        width={pixelSize}
        height={pixelSize}
        sizes={sizes ?? `${displaySize}px`}
      />
    </span>
  );
}
