import { notFound } from "next/navigation";
import { PrototypeAppRouter } from "@/components/prototypes/prototype-app-router";
import type { PrivateChatFriend } from "@/components/prototypes/private-chat-prototype";
import {
  PROTOTYPE_APP_SCREENS,
  type PrototypeAppScreen,
} from "@/lib/prototype-app-routes";

export function generateStaticParams() {
  return PROTOTYPE_APP_SCREENS.map((screen) => ({ screen }));
}

export default async function PrototypeAppScreenPage({
  params,
  searchParams,
}: {
  params: Promise<{ screen: string }>;
  searchParams: Promise<{
    theme?: string;
    width?: string;
    height?: string;
    friendId?: string;
    friendName?: string;
    friendAvatar?: string;
  }>;
}) {
  const { screen } = await params;
  const query = await searchParams;
  if (!PROTOTYPE_APP_SCREENS.includes(screen as PrototypeAppScreen)) {
    notFound();
  }

  const width = clampDimension(query.width, 375, 320, 430);
  const height = clampDimension(query.height, 812, 640, 932);
  const theme = query.theme === "dark" ? "dark" : "light";
  const privateChatFriend: PrivateChatFriend | undefined =
    query.friendName && query.friendAvatar
      ? {
          id: query.friendId ?? query.friendName,
          name: query.friendName,
          avatar: query.friendAvatar,
        }
      : undefined;

  return (
    <main
      className={`prototypeRuntimePage${
        theme === "dark" ? " prototypeRuntimePage--dark" : ""
      }`}
    >
      <PrototypeAppRouter
        screen={screen as PrototypeAppScreen}
        width={width}
        height={height}
        theme={theme}
        privateChatFriend={privateChatFriend}
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
