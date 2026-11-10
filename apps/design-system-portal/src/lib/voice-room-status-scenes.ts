export const VOICE_ROOM_STATUS_SCENES = [
  "profile-guest",
  "feed",
  "privacy",
  "privacy-sheet",
] as const;

export type VoiceRoomStatusScene = (typeof VOICE_ROOM_STATUS_SCENES)[number];

export function parseVoiceRoomStatusScene(
  value: string | undefined,
): VoiceRoomStatusScene | undefined {
  if (!value) {
    return undefined;
  }
  return VOICE_ROOM_STATUS_SCENES.includes(value as VoiceRoomStatusScene)
    ? (value as VoiceRoomStatusScene)
    : undefined;
}
