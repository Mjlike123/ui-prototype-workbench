import Image from "next/image";

export type AvatarSize = 72 | 60 | 48 | 40 | 36 | 24 | 20;
export type AvatarEmptyTheme = "light" | "dark";

const EMPTY_AVATAR_SRC: Record<AvatarEmptyTheme, string> = {
  light: "/icons/avatar/default-empty-light.png",
  dark: "/icons/avatar/default-empty-dark.png",
};

type AvatarVisualProps = {
  size: AvatarSize;
  framed?: boolean;
  src?: string;
  alt?: string;
  empty?: boolean;
  emptyTheme?: AvatarEmptyTheme;
};

export function AvatarVisual({
  size,
  framed = false,
  src = "/icons/list/message-avatar.png",
  alt = "",
  empty = false,
  emptyTheme = "light",
}: AvatarVisualProps) {
  const frameSize = framed ? Math.round(size * 1.5) : size;
  const resolvedSrc = empty ? EMPTY_AVATAR_SRC[emptyTheme] : src;
  const imageClassName = empty
    ? "avatarVisualImage avatarVisualImage--empty"
    : "avatarVisualImage";

  return (
    <span
      className={`avatarVisual${framed ? " avatarVisual--framed" : ""}${
        empty ? " avatarVisual--empty" : ""
      }`}
      style={{ width: frameSize, height: frameSize }}
    >
      <span
        className={imageClassName}
        style={{ width: size, height: size }}
      >
        <Image src={resolvedSrc} alt={alt} width={size} height={size} unoptimized={empty} />
      </span>
      {framed ? (
        <Image
          className="avatarVisualFrame"
          src="/icons/list/avatar-frame.png"
          alt=""
          width={frameSize}
          height={frameSize}
          aria-hidden="true"
        />
      ) : null}
    </span>
  );
}
