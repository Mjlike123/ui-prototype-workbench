"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { BottomNavigationIcon } from "@/components/kit/bottom-navigation-icon";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { PillSecondaryTab } from "@/components/kit/pill-secondary-tab";

export type SocialSplashScene =
  | "brand-core"
  | "social-pulse"
  | "type-gate";

type StudioSocialSplashPageProps = {
  width?: number;
  height?: number;
  initialScene?: SocialSplashScene;
  hideSceneChrome?: boolean;
};

const SCENES: ReadonlyArray<{
  key: SocialSplashScene;
  label: string;
}> = [
  { key: "brand-core", label: "A · 品牌核心" },
  { key: "social-pulse", label: "B · 好友信号" },
  { key: "type-gate", label: "C · 双层字标" },
];

/**
 * Seed translation: 96 characters became a 12×8 field, 13 digits became
 * a 13-step entrance rhythm, repeated y/x/v forms became branching paths,
 * and the near-even upper/lowercase split became balanced compositions.
 * The raw seed is intentionally neither persisted nor rendered.
 */
export function StudioSocialSplashPage({
  width = 375,
  height = 812,
  initialScene = "brand-core",
  hideSceneChrome = false,
}: StudioSocialSplashPageProps) {
  const [scene, setScene] = useState<SocialSplashScene>(initialScene);
  const compact = height <= 700;
  const wide = width >= 800;

  return (
    <div
      className="studioSocialSplashShell"
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
    >
      {!hideSceneChrome ? (
        <div className="studioSocialSplashControls">
          <PillSecondaryTab
            items={SCENES}
            value={scene}
            onChange={(next) => setScene(next as SocialSplashScene)}
            ariaLabel="启动页方案"
          />
        </div>
      ) : null}

      <section
        className={[
          "pageCanvasDevice",
          "studioSocialSplashDevice",
          `studioSocialSplashDevice--${scene}`,
          compact ? "studioSocialSplashDevice--compact" : "",
          wide ? "studioSocialSplashDevice--wide" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-scene={scene}
        aria-labelledby="studio-social-splash-title"
      >
        <IosStatusBar
          appearance={
            scene === "social-pulse" ? "light-content" : "dark-content"
          }
        />

        {scene === "brand-core" ? (
          <main className="studioSocialSplashMain studioSocialSplashBrandCore">
            <div
              className="studioSocialSplashBrandMark"
              data-kit-gap="social-splash-brand-lockup"
              aria-hidden="true"
            >
              <span className="studioSocialSplashBrandMarkInner">
                <BottomNavigationIcon name="toptop" selected />
              </span>
            </div>
            <div className="studioSocialSplashIdentity">
              <h1 id="studio-social-splash-title">TopTop</h1>
              <p>Play. Talk. Belong.</p>
            </div>
          </main>
        ) : null}

        {scene === "social-pulse" ? (
          <main className="studioSocialSplashMain">
            <div
              className="studioSocialSplashLoom"
              data-kit-gap="social-splash-social-pulse"
              aria-hidden="true"
            >
              <span className="studioSocialSplashThread studioSocialSplashThread--northWest" />
              <span className="studioSocialSplashThread studioSocialSplashThread--northEast" />
              <span className="studioSocialSplashThread studioSocialSplashThread--west" />
              <span className="studioSocialSplashThread studioSocialSplashThread--east" />
              <span className="studioSocialSplashThread studioSocialSplashThread--southWest" />
              <span className="studioSocialSplashThread studioSocialSplashThread--southEast" />

              <Image
                className="studioSocialSplashStatusIcon studioSocialSplashStatusIcon--room"
                src="/icons/product/toptop-status-room.png"
                alt=""
                width={48}
                height={48}
              />
              <Image
                className="studioSocialSplashStatusIcon studioSocialSplashStatusIcon--game"
                src="/icons/product/toptop-status-game.png"
                alt=""
                width={48}
                height={48}
              />
              <Image
                className="studioSocialSplashStatusIcon studioSocialSplashStatusIcon--voice"
                src="/icons/product/toptop-status-voice.png"
                alt=""
                width={48}
                height={48}
              />

              <span className="studioSocialSplashJunction">
                <span className="studioSocialSplashMark">
                  <BottomNavigationIcon name="toptop" selected />
                </span>
              </span>
            </div>

            <div className="studioSocialSplashIdentity">
              <h1 id="studio-social-splash-title">TopTop</h1>
              <p>Rooms, games and voices — together.</p>
            </div>
          </main>
        ) : null}

        {scene === "type-gate" ? (
          <main
            className="studioSocialSplashTypeGate"
            data-kit-gap="social-splash-type-gate"
          >
            <div className="studioSocialSplashTypeLockup">
              <h1 id="studio-social-splash-title" aria-label="TopTop">
                <span>Top</span>
                <span>Top</span>
              </h1>
            </div>
            <p>Your people are already here.</p>
          </main>
        ) : null}

        <p className="studioSocialSplashStatus" role="status">
          TopTop is ready
        </p>
        <div className="studioSocialSplashHomeArea" aria-hidden="true">
          <span className="bottomNavigationHomeIndicator" />
        </div>
      </section>
    </div>
  );
}
