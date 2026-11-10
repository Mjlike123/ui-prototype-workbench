"use client";

import { useState, type CSSProperties } from "react";
import { VoiceRoomStatusPrototype } from "@/components/prototypes/voice-room-status-prototype";
import type { VoiceRoomStatusScene } from "@/lib/voice-room-status-scenes";

const SCENES: Array<{ id: VoiceRoomStatusScene; label: string }> = [
  { id: "profile-guest", label: "个人主页客态" },
  { id: "feed", label: "动态列表" },
  { id: "privacy", label: "隐私设置" },
  { id: "privacy-sheet", label: "在房状态半窗" },
];

type StudioVoiceRoomStatusPageProps = {
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  onBack?: () => void;
};

/** Studio-only · v3.26.0 语音房在房状态非好友可见 */
export function StudioVoiceRoomStatusPage({
  width = 375,
  height = 812,
  theme = "light",
  onBack,
}: StudioVoiceRoomStatusPageProps) {
  const [scene, setScene] = useState<VoiceRoomStatusScene>("profile-guest");

  return (
    <div
      className="studioVoiceRoomStatusShell"
      style={
        {
          "--page-canvas-width": `${width}px`,
        } as CSSProperties
      }
    >
      <div
        className="studioVoiceRoomStatusScenes"
        role="tablist"
        aria-label="在房状态原型场景"
      >
        {SCENES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            className={[
              "studioVoiceRoomStatusSceneTab",
              scene === item.id ? "studioVoiceRoomStatusSceneTab--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-selected={scene === item.id}
            onClick={() => setScene(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <VoiceRoomStatusPrototype
        key={scene}
        width={width}
        height={height}
        theme={theme}
        scene={scene}
        onBack={onBack}
      />
    </div>
  );
}
