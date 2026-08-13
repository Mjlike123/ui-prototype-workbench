import Image from "next/image";

export type IosStatusBarAppearance = "dark-content" | "light-content";

export function IosStatusBar({
  appearance = "dark-content",
  time = "9:41",
  className,
}: {
  appearance?: IosStatusBarAppearance;
  time?: string;
  className?: string;
}) {
  const assetTone = appearance === "light-content" ? "白" : "黑";

  return (
    <div
      className={[
        "iosStatusBar",
        `iosStatusBar--${appearance}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      <time className="iosStatusBarTime">{time}</time>
      <span className="iosStatusBarIndicators">
        <Image
          className="iosStatusBarSignal"
          src={`/icons/svg/icon=ios状态栏信号-${assetTone}.svg`}
          alt=""
          width={17}
          height={11}
        />
        <Image
          className="iosStatusBarWifi"
          src={`/icons/svg/icon=ios状态栏wifi-${assetTone}.svg`}
          alt=""
          width={15}
          height={11}
        />
        <Image
          className="iosStatusBarBattery"
          src={`/icons/svg/icon=ios状态栏电池-${assetTone}.svg`}
          alt=""
          width={24}
          height={11}
        />
      </span>
    </div>
  );
}
