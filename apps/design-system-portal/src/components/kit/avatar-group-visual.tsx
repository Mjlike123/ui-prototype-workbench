import { PrototypeAvatarImage } from "@/components/kit/prototype-avatar-image";

export type AvatarGroupVariant =
  | "list-2"
  | "list-3"
  | "list-4"
  | "list-5"
  | "home-more"
  | "home-row";

const VARIANT_MEMBER_COUNT: Record<AvatarGroupVariant, number> = {
  "list-2": 2,
  "list-3": 3,
  "list-4": 4,
  "list-5": 5,
  "home-more": 4,
  "home-row": 6,
};

export const DEFAULT_AVATAR_GROUP_MEMBERS = [
  "/prototypes/toptop-home/avatar-cassie.png",
  "/prototypes/toptop-home/avatar-andrew.png",
  "/prototypes/toptop-home/avatar-estelle.png",
  "/prototypes/toptop-home/avatar-felix.png",
  "/prototypes/toptop-home/avatar-cassie.png",
  "/prototypes/toptop-home/avatar-andrew.png",
];

type AvatarGroupVisualProps = {
  variant?: AvatarGroupVariant;
  members?: string[];
  /** Decorative group in list rows; caller supplies readable labels elsewhere. */
  decorative?: boolean;
};

function memberDisplaySize(variant: AvatarGroupVariant): number {
  switch (variant) {
    case "list-2":
      return 32;
    case "list-5":
    case "home-row":
      return 24;
    default:
      return 28;
  }
}

export function AvatarGroupVisual({
  variant = "list-4",
  members = DEFAULT_AVATAR_GROUP_MEMBERS,
  decorative = true,
}: AvatarGroupVisualProps) {
  const memberCount = VARIANT_MEMBER_COUNT[variant];
  const displaySize = memberDisplaySize(variant);
  const visibleMembers = members.slice(0, memberCount);

  return (
    <span
      className={`avatarGroupVisual avatarGroupVisual--${variant}`}
      aria-hidden={decorative ? "true" : undefined}
    >
      {visibleMembers.map((member, index) => (
        <PrototypeAvatarImage
          key={`${member}-${index}`}
          src={member}
          alt=""
          displaySize={displaySize}
          layoutFromCss
        />
      ))}
    </span>
  );
}
