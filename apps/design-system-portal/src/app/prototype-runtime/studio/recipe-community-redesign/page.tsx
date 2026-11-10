import { notFound } from "next/navigation";
import {
  StudioRecipeCommunityRedesignPage,
  type RecipeCommunityRedesignScene,
} from "@/components/studio/studio-recipe-community-redesign-page";

const SCENES: RecipeCommunityRedesignScene[] = [
  "compare",
  "quality",
  "filmsim",
  "fujistyle",
  "fuji-recipes",
  "recipe-room",
];

export default async function RecipeCommunityRedesignRuntimePage({
  searchParams,
}: {
  searchParams: Promise<{
    theme?: string;
    width?: string;
    height?: string;
    scene?: string;
    chrome?: string;
  }>;
}) {
  const query = await searchParams;
  const scene = parseScene(query.scene);
  if (!scene) notFound();

  const qualityScene = scene === "quality";
  const width = clampDimension(query.width, 375, 320, qualityScene ? 890 : 430);
  const height = clampDimension(query.height, 812, qualityScene ? 626 : 640, 932);
  const theme = query.theme === "light" ? "light" : "dark";
  const hideSceneChrome = query.chrome !== "1";
  const pageDark = theme === "dark" && scene !== "filmsim";

  return (
    <main
      className={`prototypeRuntimePage prototypeRuntimePage--recipeCommunity${
        pageDark ? " prototypeRuntimePage--dark" : ""
      }${scene === "filmsim" ? " prototypeRuntimePage--filmsimLight" : ""}`}
    >
      <StudioRecipeCommunityRedesignPage
        width={width}
        height={height}
        theme={theme}
        initialScene={scene}
        hideSceneChrome={hideSceneChrome}
      />
    </main>
  );
}

function parseScene(value?: string): RecipeCommunityRedesignScene | null {
  if (!value) return "quality";
  const normalized = value.trim().toLowerCase();
  return SCENES.includes(normalized as RecipeCommunityRedesignScene)
    ? (normalized as RecipeCommunityRedesignScene)
    : null;
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
