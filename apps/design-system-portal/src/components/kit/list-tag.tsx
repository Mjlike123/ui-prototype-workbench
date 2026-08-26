import Image from "next/image";
import { InlineSvgIcon } from "./inline-svg-icon";
import { LIST_TAG_GENDER_SVGS } from "./generated/list-tag-gender-svgs";

export const MEMBERSHIP_LEVELS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 99,
] as const;

export type MembershipLevel = (typeof MEMBERSHIP_LEVELS)[number];

type GenderListTagProps = {
  kind: "gender";
  gender: "female" | "male";
  age?: number;
  className?: string;
};

type MembershipListTagProps = {
  kind: "membership";
  level: MembershipLevel;
  className?: string;
};

export type ListTagProps = GenderListTagProps | MembershipListTagProps;

export function ListTag(props: ListTagProps) {
  if (props.kind === "membership") {
    const width = props.level < 10 ? 36 : 43;
    return (
      <span
        className={["listTag", "listTag--membership", props.className]
          .filter(Boolean)
          .join(" ")}
        data-list-tag-kind="membership"
        aria-label={`会员 V${props.level}`}
      >
        <Image
          src={`/icons/list-tags/membership-v${props.level}.png`}
          alt=""
          width={width}
          height={14}
          aria-hidden="true"
        />
      </span>
    );
  }

  const label = props.gender === "female" ? "女性" : "男性";
  return (
    <span
      className={[
        "listTag",
        "listTag--gender",
        `listTag--${props.gender}`,
        props.age === undefined ? "listTag--iconOnly" : "",
        props.className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-list-tag-kind="gender"
      aria-label={props.age === undefined ? label : `${label}，${props.age} 岁`}
    >
      <span className="listTagGenderIcon" aria-hidden="true">
        <InlineSvgIcon
          className="listTagGenderGlyph"
          markup={LIST_TAG_GENDER_SVGS[props.gender]}
          size={8}
          data-list-tag-gender={props.gender}
        />
      </span>
      {props.age === undefined ? null : (
        <span className="listTagAge" aria-hidden="true">
          {props.age}
        </span>
      )}
    </span>
  );
}
