export const PROTOTYPE_APP_SCREENS = [
  "toptop",
  "room",
  "feed",
  "message",
  "me",
  "profile",
  "search",
  "private-chat",
  "wallet",
  "feed-compose",
  "community-guidelines",
  "help",
  "settings",
] as const;

export type PrototypeAppScreen = (typeof PROTOTYPE_APP_SCREENS)[number];
export type MeSecondaryScreen = Extract<
  PrototypeAppScreen,
  "wallet" | "community-guidelines" | "help" | "settings"
>;
