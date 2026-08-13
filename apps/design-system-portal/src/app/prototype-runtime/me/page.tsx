import { MePagePrototype } from "@/components/prototypes/me-page-prototype";

export default async function MePrototypeRuntimePage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>;
}) {
  const { theme } = await searchParams;
  const resolvedTheme = theme === "dark" ? "dark" : "light";

  return (
    <main
      className={`prototypeRuntimePage prototypeRuntimePage--${resolvedTheme}`}
    >
      <MePagePrototype />
    </main>
  );
}
