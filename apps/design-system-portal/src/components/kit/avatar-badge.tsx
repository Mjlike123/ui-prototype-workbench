import Image from "next/image";

export type AvatarBadgeKind =
  | "gender"
  | "selected"
  | "muted"
  | "noble"
  | "online"
  | "game";

type AvatarBadgeProps = {
  kind: AvatarBadgeKind;
};

export function AvatarBadge({ kind }: AvatarBadgeProps) {
  return (
    <span
      className={`avatarVisualBadge avatarVisualBadge--${kind}`}
      aria-hidden="true"
    >
      {kind === "gender" && (
        <Image
          src="/icons/avatar-badges/gender-female.svg"
          alt=""
          width={14}
          height={14}
        />
      )}
      {kind === "selected" && (
        <>
          <Image
            src="/icons/avatar-badges/selected-circle.svg"
            alt=""
            width={20}
            height={20}
          />
          <Image
            className="avatarVisualBadgeGlyph"
            src="/icons/avatar-badges/selected-check.svg"
            alt=""
            width={9}
            height={6}
          />
        </>
      )}
      {kind === "muted" && (
        <Image
          src="/icons/avatar-badges/muted.svg"
          alt=""
          width={12}
          height={12}
        />
      )}
      {kind === "noble" && (
        <Image
          src="/icons/avatar-badges/noble.png"
          alt=""
          width={18}
          height={18}
        />
      )}
      {kind === "online" && (
        <Image
          src="/icons/avatar-badges/online-dot.svg"
          alt=""
          width={12}
          height={12}
        />
      )}
      {kind === "game" && (
        <Image
          src="/icons/avatar-badges/game.png"
          alt=""
          width={20}
          height={20}
        />
      )}
    </span>
  );
}
