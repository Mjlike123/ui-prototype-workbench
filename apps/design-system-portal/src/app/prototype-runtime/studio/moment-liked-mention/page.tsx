import { StudioMomentLikedMentionPage } from "@/components/studio/studio-moment-liked-mention-page";

export default async function MomentLikedMentionRuntimePage({
  searchParams,
}: {
  searchParams: Promise<{
    theme?: string;
    width?: string;
    height?: string;
    scene?: string;
    region?: string;
  }>;
}) {
  const query = await searchParams;
  const width = clampDimension(query.width, 375, 320, 890);
  const height = clampDimension(query.height, 812, 568, 932);
  const theme = query.theme === "dark" ? "dark" : "light";
  const initialScene = parseScene(query.scene);
  const initialRegion = query.region === "open" ? "open" : "closed";

  return (
    <main className="prototypeRuntimePage">
      <StudioMomentLikedMentionPage
        width={width}
        height={height}
        theme={theme}
        initialScene={initialScene}
        initialRegion={initialRegion}
      />
    </main>
  );
}

const SCENES = [
  "feed-structure",
  "profile-liked",
  "liked-list",
  "compose-mention",
  "comment-mention",
  "notifications",
] as const;

function parseScene(value: string | undefined) {
  if (value && SCENES.includes(value as (typeof SCENES)[number])) {
    return value as (typeof SCENES)[number];
  }
  return "feed-structure" as const;
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
