import { ProfilePagePrototype } from "@/components/prototypes/profile-page-prototype";

export default async function ProfilePrototypeRuntimePage({
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
      <ProfilePagePrototype />
    </main>
  );
}
