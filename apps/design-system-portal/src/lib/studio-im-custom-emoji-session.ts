export type StudioCustomEmojiItem = {
  id: string;
  label: string;
  src: string;
  status: "active" | "pending";
  createdAt: number;
};

export type StudioEmojiSelection =
  | {
      type: "unicode";
      id: string;
      label: string;
      value: string;
    }
  | {
      type: "custom";
      id: string;
      label: string;
      src: string;
    };

const CUSTOM_KEY = "toptop-studio-im-custom-emojis-v1";
const RECENT_KEY = "toptop-studio-im-recent-emojis-v1";

const DEFAULT_CUSTOM: StudioCustomEmojiItem[] = [
  {
    id: "celebration",
    label: "Celebration",
    src: "/prototypes/chat-reply/sticker.png",
    status: "active",
    createdAt: 0,
  },
  {
    id: "gg",
    label: "GG",
    src: "/prototypes/feed/andrew-avatar.png",
    status: "active",
    createdAt: 0,
  },
];

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

export function loadStudioCustomEmojis(): StudioCustomEmojiItem[] {
  return readJson<StudioCustomEmojiItem[]>(CUSTOM_KEY) ?? DEFAULT_CUSTOM;
}

export function saveStudioCustomEmojis(items: StudioCustomEmojiItem[]) {
  writeJson(CUSTOM_KEY, items);
}

export function loadStudioRecentEmojis(): StudioEmojiSelection[] {
  return readJson<StudioEmojiSelection[]>(RECENT_KEY) ?? [];
}

export function saveStudioRecentEmojis(items: StudioEmojiSelection[]) {
  writeJson(RECENT_KEY, items);
}

export function pushStudioRecentEmoji(
  recent: StudioEmojiSelection[],
  selection: StudioEmojiSelection,
  limit = 8,
) {
  return [
    selection,
    ...recent.filter((item) => item.id !== selection.id),
  ].slice(0, limit);
}

export function createStudioCustomEmoji(input: {
  label: string;
  src: string;
}): StudioCustomEmojiItem {
  return {
    id: `custom-${Date.now()}`,
    label: input.label,
    src: input.src,
    status: "pending",
    createdAt: Date.now(),
  };
}
