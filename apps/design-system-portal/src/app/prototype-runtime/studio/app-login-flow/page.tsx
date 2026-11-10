import { StudioAppLoginFlowPage } from "@/components/studio/studio-app-login-flow-page";

export default async function AppLoginFlowRuntimePage({
  searchParams,
}: {
  searchParams: Promise<{
    theme?: string;
    width?: string;
    height?: string;
  }>;
}) {
  const query = await searchParams;
  const width = clampDimension(query.width, 375, 320, 890);
  const height = clampDimension(query.height, 812, 568, 932);
  const theme = query.theme === "dark" ? "dark" : "light";

  return (
    <main className="prototypeRuntimePage">
      <StudioAppLoginFlowPage
        width={width}
        height={height}
        theme={theme}
      />
    </main>
  );
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
