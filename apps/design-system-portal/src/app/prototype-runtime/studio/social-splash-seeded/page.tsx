import {
  StudioSocialSplashPage,
  type SocialSplashScene,
} from "@/components/studio/studio-social-splash-page";

export default async function SocialSplashSeededRuntimePage({
  searchParams,
}: {
  searchParams: Promise<{
    scene?: string;
    width?: string;
    height?: string;
  }>;
}) {
  const query = await searchParams;
  const width = clampDimension(query.width, 375, 320, 890);
  const height = clampDimension(query.height, 812, 568, 932);
  const scene = parseScene(query.scene);

  return (
    <main className="prototypeRuntimePage">
      <StudioSocialSplashPage
        width={width}
        height={height}
        initialScene={scene}
        hideSceneChrome
      />
    </main>
  );
}

function parseScene(value: string | undefined): SocialSplashScene {
  if (value === "social-pulse" || value === "type-gate") {
    return value;
  }
  return "brand-core";
}

function clampDimension(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? Math.min(max, Math.max(min, Math.round(parsed)))
    : fallback;
}
