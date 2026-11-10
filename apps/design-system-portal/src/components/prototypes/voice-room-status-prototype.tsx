"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
  type UIEvent,
} from "react";
import { AvatarVisual } from "@/components/kit/avatar-visual";
import { BottomNavigation } from "@/components/kit/bottom-navigation";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { ListTag } from "@/components/kit/list-tag";
import { PagIcon } from "@/components/kit/pag-icon";
import { PrimaryNavigation } from "@/components/kit/primary-navigation";
import { RegularNavigation } from "@/components/kit/regular-navigation";
import { Switch } from "@/components/kit/switch";
import { SystemIcon } from "@/components/kit/system-icon";
import { UnderlineSecondaryTab } from "@/components/kit/underline-secondary-tab";
import type { BottomNavKey } from "@/lib/profile-prototype-model";
import type { VoiceRoomStatusScene } from "@/lib/voice-room-status-scenes";
import {
  VOICE_ROOM_VISIBILITY_OPTIONS,
  loadVoiceRoomVisibility,
  saveVoiceRoomVisibility,
  voiceRoomVisibilityLabel,
  type VoiceRoomVisibility,
} from "@/lib/voice-room-status-model";

type VoiceRoomStatusPrototypeProps = {
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  scene?: VoiceRoomStatusScene;
  onBack?: () => void;
};

const PROFILE_TABS = [
  { key: "about", label: "About me" },
  { key: "movement", label: "Movement(6)" },
] as const;

export function VoiceRoomStatusPrototype({
  width = 375,
  height = 812,
  theme = "light",
  scene = "profile-guest",
  onBack,
}: VoiceRoomStatusPrototypeProps) {
  const deviceStyle = {
    "--page-canvas-width": `${width}px`,
    "--page-canvas-height": `${height}px`,
  } as CSSProperties;

  if (scene === "feed") {
    return (
      <VoiceRoomFeedScreen
        width={width}
        height={height}
        theme={theme}
        deviceStyle={deviceStyle}
      />
    );
  }

  if (scene === "privacy" || scene === "privacy-sheet") {
    return (
      <VoiceRoomPrivacyScreen
        width={width}
        height={height}
        theme={theme}
        deviceStyle={deviceStyle}
        initialSheetOpen={scene === "privacy-sheet"}
        onBack={onBack}
      />
    );
  }

  return (
    <VoiceRoomProfileGuestScreen
      width={width}
      height={height}
      theme={theme}
      deviceStyle={deviceStyle}
      onBack={onBack}
    />
  );
}

function VoiceRoomProfileGuestScreen({
  theme,
  deviceStyle,
  onBack,
}: {
  width: number;
  height: number;
  theme: "light" | "dark";
  deviceStyle: CSSProperties;
  onBack?: () => void;
}) {
  const [tab, setTab] = useState<"about" | "movement">("about");
  const [navigationSolid, setNavigationSolid] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setNavigationSolid(event.currentTarget.scrollTop >= 205);
  };

  const enterRoom = () => {
    setToast("正在进入语音房…");
  };

  return (
    <div
      className="pageCanvasDevice profileV3Device"
      style={deviceStyle}
      aria-label="语音房在房状态 · 个人主页客态"
    >
      <IosStatusBar
        appearance={theme === "dark" ? "light-content" : "dark-content"}
      />
      <div className="pageCanvasContentShell">
        <div className="profileV3Scroll" onScroll={handleScroll}>
          <ProfileV3Navigation
            solid={navigationSolid}
            onBack={onBack}
            onMore={() => setToast("更多操作")}
          />
          <section className="profileV3Hero" aria-label="个人资料背景">
            <Image
              src="/prototypes/profile-v3/cover.png"
              alt=""
              fill
              sizes="375px"
              priority
            />
            <Image
              className="profileV3HeroFigure"
              src="/prototypes/profile-v3/pixel-figure.png"
              alt=""
              width={64}
              height={140}
            />
          </section>
          <article className="profileV3Card">
            <header className="profileV3Identity">
              <button
                type="button"
                className="profileV3AvatarButton"
                aria-label="查看 Intisar 的头像"
              >
                <AvatarVisual
                  size={72}
                  src="/prototypes/profile-v3/feed-avatar.png"
                  alt=""
                />
              </button>
              <button
                type="button"
                className="profileV3RoomFollow"
                aria-label="进入 Intisar 的语音房"
                onClick={enterRoom}
              >
                <span className="profileV3RoomFollowIcon profileV3RoomFollowIcon--animated">
                  <PagIcon
                    src="/icons/animated/profile-mini-card-room.pag"
                    size={20}
                    fallback={<SystemIcon name="voiceStatus" size={20} />}
                  />
                </span>
                <span className="profileV3RoomFollowCopy">
                  <small>在语音房</small>
                  <strong>进入房间</strong>
                </span>
                <SystemIcon name="chevronRight" size={16} />
              </button>
              <h1>Intisar</h1>
              <button type="button" className="profileV3Id">
                <strong>ID</strong> 1231231
              </button>
            </header>
            <div className="profileV3StickyTabs">
              <UnderlineSecondaryTab
                items={PROFILE_TABS}
                value={tab}
                ariaLabel="个人资料内容"
                onChange={(key) => setTab(key as "about" | "movement")}
              />
            </div>
            {tab === "about" ? (
              <div className="profileV3About">
                <button type="button" className="profileV3SectionHeader">
                  <strong>About me</strong>
                </button>
                <p className="profileV3AboutCopy">
                  Dubai · 热爱音乐与语音社交，欢迎来房间聊天。
                </p>
              </div>
            ) : (
              <section className="profileV3Movement" aria-label="Movement 动态">
                <p className="profileV3AboutCopy">暂无更多动态</p>
              </section>
            )}
          </article>
        </div>
        <div className="voiceRoomStatusGuestBar">
          <button
            type="button"
            className="kitButton kitButton--height48 kitButton--secondary"
          >
            Add
          </button>
          <button
            type="button"
            className="kitButton kitButton--height48 kitButton--primary"
          >
            Chat
          </button>
        </div>
        <PrototypeBottomNav value="me" />
      </div>
      {toast ? (
        <div className="profilePrototypeToast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function ProfileV3Navigation({
  solid,
  onBack,
  onMore,
}: {
  solid: boolean;
  onBack?: () => void;
  onMore: () => void;
}) {
  return (
    <nav
      className={`profileV3Navigation${solid ? " isSolid" : ""}`}
      aria-label="个人资料导航"
    >
      <button type="button" aria-label="返回" onClick={onBack}>
        <SystemIcon name="back" />
      </button>
      <span className="profileV3NavigationTitle">
        <strong>Intisar</strong>
        <small>ID:1231231</small>
      </span>
      <span className="profileV3NavigationActions">
        <button type="button" aria-label="更多" onClick={onMore}>
          <SystemIcon name="more" />
        </button>
      </span>
    </nav>
  );
}

function VoiceRoomFeedScreen({
  theme,
  deviceStyle,
}: {
  width: number;
  height: number;
  theme: "light" | "dark";
  deviceStyle: CSSProperties;
}) {
  const [tab, setTab] = useState<"Mine" | "Recommend">("Recommend");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <div
      className="pageCanvasDevice prototypeDestinationDevice prototypeDestinationDevice--feed"
      style={deviceStyle}
      aria-label="语音房在房状态 · 动态列表"
    >
      <IosStatusBar
        appearance={theme === "dark" ? "light-content" : "dark-content"}
      />
      <div className="pageCanvasContentShell">
        <PrimaryNavigation
          className="prototypeFeedNavigation"
          ariaLabel="Feed 分类"
          items={[
            { key: "Mine", label: "Mine" },
            { key: "Recommend", label: "Recommend" },
          ]}
          value={tab}
          onChange={(value) => setTab(value as "Mine" | "Recommend")}
          actions={[
            {
              key: "notifications",
              label: "Feed 通知",
              icon: <SystemIcon name="notification" />,
              onPress: () => setToast("打开 Feed 通知"),
            },
          ]}
        />
        <main className="prototypeDestinationScroll prototypeFeedScroll">
          <section className="prototypeFeedList" aria-label={`${tab} Feed`}>
            <article className="prototypeFeedCard">
              <header className="prototypeFeedAuthor">
                <button
                  type="button"
                  className="prototypeFeedAvatarInRoom"
                  aria-label="Kann 正在语音房，点击进入房间"
                  onClick={() => setToast("正在进入语音房…")}
                >
                  <AvatarVisual
                    size={40}
                    src="/prototypes/toptop-home/friend-avatar.png"
                    alt=""
                  />
                  <span className="prototypeFeedAvatarInRoomBadge" aria-hidden="true">
                    <SystemIcon name="voiceStatus" size={14} />
                  </span>
                </button>
                <div className="prototypeFeedIdentity">
                  <strong>Kann</strong>
                  <span
                    className="prototypeFeedTags"
                    aria-label="28 岁，会员 V10"
                  >
                    <Image
                      src="/prototypes/feed/saudi-flag.png"
                      alt=""
                      width={20}
                      height={14}
                    />
                    <ListTag kind="gender" gender="female" age={28} />
                    <ListTag kind="membership" level={10} />
                  </span>
                  <span className="prototypeFeedInRoomLabel">In room voice</span>
                </div>
                <button
                  type="button"
                  className="prototypeFeedFollow"
                  onClick={() => setToast("打开聊天")}
                >
                  Chat
                </button>
              </header>
              <div className="prototypeFeedMedia">
                <Image
                  src="/prototypes/feed/latifa-photo.png"
                  alt=""
                  width={180}
                  height={180}
                />
              </div>
              <div className="prototypeFeedActions">
                <span>♡ 12 · 💬 3</span>
                <span>Share</span>
              </div>
            </article>
            <article className="prototypeFeedCard">
              <header className="prototypeFeedAuthor">
                <AvatarVisual
                  size={48}
                  src="/prototypes/feed/andrew-avatar.png"
                  alt=""
                />
                <div className="prototypeFeedIdentity">
                  <strong>Andrew</strong>
                  <span className="prototypeFeedTags">
                    <Image
                      src="/prototypes/feed/saudi-flag.png"
                      alt=""
                      width={20}
                      height={14}
                    />
                    <ListTag kind="gender" gender="male" age={28} />
                    <ListTag kind="membership" level={10} />
                  </span>
                </div>
                <button type="button" className="prototypeFeedFollow">
                  Follow
                </button>
              </header>
            </article>
          </section>
        </main>
        <PrototypeBottomNav value="feed" />
      </div>
      {toast ? (
        <div className="profilePrototypeToast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function VoiceRoomPrivacyScreen({
  theme,
  deviceStyle,
  initialSheetOpen = false,
  onBack,
}: {
  width: number;
  height: number;
  theme: "light" | "dark";
  deviceStyle: CSSProperties;
  initialSheetOpen?: boolean;
  onBack?: () => void;
}) {
  const [invisibleInRoom, setInvisibleInRoom] = useState(false);
  const [visibility, setVisibility] = useState<VoiceRoomVisibility>("everyone");
  const [sheetOpen, setSheetOpen] = useState(initialSheetOpen);
  const [sheetEntering, setSheetEntering] = useState(initialSheetOpen);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setVisibility(loadVoiceRoomVisibility());
  }, []);

  useEffect(() => {
    if (!sheetOpen) {
      setSheetEntering(false);
      return;
    }
    const frame = window.requestAnimationFrame(() => setSheetEntering(true));
    return () => window.cancelAnimationFrame(frame);
  }, [sheetOpen]);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = window.setTimeout(() => setStatusMessage(null), 2200);
    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  const openSheet = () => {
    if (invisibleInRoom) {
      setStatusMessage("隐身时已对他人不可见在房状态");
      return;
    }
    setSheetOpen(true);
  };

  const selectVisibility = useCallback((next: VoiceRoomVisibility) => {
    setVisibility(next);
    saveVoiceRoomVisibility(next);
    setSheetOpen(false);
    setStatusMessage(`已设为${voiceRoomVisibilityLabel(next)}`);
  }, []);

  const visibilityDisabled = invisibleInRoom;

  return (
    <div
      className="pageCanvasDevice meSecondaryDevice"
      style={deviceStyle}
      aria-label="语音房在房状态 · 隐私设置"
    >
      <IosStatusBar
        appearance={theme === "dark" ? "light-content" : "dark-content"}
      />
      <div className="pageCanvasContentShell">
        <RegularNavigation title="Privacy" onBack={onBack} />
        <main className="meSecondaryScroll">
          <SettingsGroup title="Room">
            <SettingsSwitch
              label="Invisible in Room"
              description="Hide your presence while in a voice room"
              checked={invisibleInRoom}
              onChange={setInvisibleInRoom}
            />
          </SettingsGroup>
          <SettingsGroup title="Voice room status">
            <button
              type="button"
              className={[
                "meSecondaryActionRow",
                visibilityDisabled ? "voiceRoomStatusRow--disabled" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label="语音房在房状态"
              aria-disabled={visibilityDisabled}
              onClick={openSheet}
            >
              <span>
                <strong>语音房在房状态</strong>
                <small>可设置可见范围：所有人或仅好友</small>
                {visibilityDisabled ? (
                  <small className="voiceRoomStatusRowHint">
                    隐身时已对他人不可见
                  </small>
                ) : null}
              </span>
              <span className="voiceRoomStatusRowValue">
                {voiceRoomVisibilityLabel(visibility)}
                <SystemIcon name="chevronRight" size={20} />
              </span>
            </button>
          </SettingsGroup>
          <SettingsGroup title="Social">
            <SettingsSwitch
              label="Block strangers' messages"
              description="Only people you follow can message you"
              checked
              onChange={() => undefined}
            />
          </SettingsGroup>
        </main>
        <PrototypeBottomNav value="me" />
      </div>

      {sheetOpen ? (
        <VoiceRoomVisibilitySheet
          entering={sheetEntering}
          value={visibility}
          onDismiss={() => setSheetOpen(false)}
          onSelect={selectVisibility}
        />
      ) : null}

      {statusMessage ? (
        <div className="profilePrototypeToast" role="status" aria-live="polite">
          {statusMessage}
        </div>
      ) : null}
    </div>
  );
}

function VoiceRoomVisibilitySheet({
  entering,
  value,
  onDismiss,
  onSelect,
}: {
  entering: boolean;
  value: VoiceRoomVisibility;
  onDismiss: () => void;
  onSelect: (value: VoiceRoomVisibility) => void;
}) {
  return (
    <div
      className={[
        "voiceRoomStatusOverlay",
        entering ? "voiceRoomStatusOverlay--enter" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="presentation"
    >
      <button
        type="button"
        className="voiceRoomStatusBackdrop"
        aria-label="关闭在房状态设置"
        onClick={onDismiss}
      />
      <section
        className="voiceRoomStatusSheet"
        aria-label="语音房在房状态设置"
      >
        <div className="voiceRoomStatusSheetHandle" aria-hidden="true" />
        <header className="voiceRoomStatusSheetHeader">
          <h2>语音房在房状态</h2>
          <p>选择谁可以看到你正在语音房中</p>
        </header>
        <div className="voiceRoomStatusSheetList" role="listbox" aria-label="可见范围">
          {VOICE_ROOM_VISIBILITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              className="voiceRoomStatusSheetOption"
              aria-selected={value === option.value}
              onClick={() => onSelect(option.value)}
            >
              <strong>{option.label}</strong>
              <small>{option.description}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function SettingsGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      className="meSecondarySettingsGroup"
      aria-labelledby={`voice-room-settings-${title}`}
    >
      <h2 id={`voice-room-settings-${title}`}>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function SettingsSwitch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const fieldId = `voice-room-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <label className="meSecondarySwitchRow" htmlFor={fieldId}>
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <Switch id={fieldId} checked={checked} onChange={onChange} />
    </label>
  );
}

function PrototypeBottomNav({ value }: { value: BottomNavKey }) {
  const [destination, setDestination] = useState<BottomNavKey>(value);

  return (
    <BottomNavigation
      value={destination}
      onChange={setDestination}
      ariaLabel="底部导航"
    />
  );
}
