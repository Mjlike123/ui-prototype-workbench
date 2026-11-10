export const VOICE_ROOM_VISIBILITY_OPTIONS = [
  {
    value: "everyone",
    label: "所有人可见",
    description: "陌生人与非好友也可看到你的在房状态",
  },
  {
    value: "friends-only",
    label: "仅好友可见",
    description: "仅互相关注的好友可见",
  },
] as const;

export type VoiceRoomVisibility =
  (typeof VOICE_ROOM_VISIBILITY_OPTIONS)[number]["value"];

const STORAGE_KEY = "voice-room-status-visibility-v326";

export function loadVoiceRoomVisibility(): VoiceRoomVisibility {
  if (typeof window === "undefined") {
    return "everyone";
  }
  const stored = window.sessionStorage.getItem(STORAGE_KEY);
  return stored === "friends-only" ? "friends-only" : "everyone";
}

export function saveVoiceRoomVisibility(value: VoiceRoomVisibility) {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(STORAGE_KEY, value);
}

export function voiceRoomVisibilityLabel(value: VoiceRoomVisibility) {
  return (
    VOICE_ROOM_VISIBILITY_OPTIONS.find((option) => option.value === value)
      ?.label ?? "所有人可见"
  );
}
