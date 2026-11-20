import { InlineSvgIcon } from "./inline-svg-icon";
import { SYSTEM_ICON_ASSETS, SYSTEM_ICON_SVGS } from "./generated/system-icon-svgs";

export { SYSTEM_ICON_ASSETS };

export type SystemIconName = keyof typeof SYSTEM_ICON_ASSETS;

export function SystemIcon({
  name,
  size = 24,
  className,
}: {
  name: SystemIconName;
  size?: number;
  className?: string;
}) {
  return (
    <InlineSvgIcon
      className={["systemIcon", className].filter(Boolean).join(" ")}
      markup={SYSTEM_ICON_SVGS[name]}
      size={size}
      data-system-icon={name}
      data-system-icon-asset={SYSTEM_ICON_ASSETS[name]}
    />
  );
}
