"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties, type UIEvent } from "react";
import { AvatarVisual } from "@/components/kit/avatar-visual";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { ListTag } from "@/components/kit/list-tag";
import { PagIcon } from "@/components/kit/pag-icon";
import { SystemIcon } from "@/components/kit/system-icon";
import { UnderlineSecondaryTab } from "@/components/kit/underline-secondary-tab";
import type { BottomNavKey } from "@/lib/profile-prototype-model";

type ProfilePagePrototypeProps = {
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  className?: string;
  onNavigate?: (destination: BottomNavKey) => void;
  onBack?: () => void;
};

type ProfileTab = "about" | "movement";

const ROOM_FOLLOW_COPY = {
  status: "In room voice",
  action: "Join room",
} as const;

const PROFILE_TABS = [
  { key: "about", label: "About me" },
  { key: "movement", label: "Movement(6)" },
] as const;

const movementPosts = [
  {
    id: "movement-1",
    text: "I'm 180 cm tall. I enjoy fitness, swimming and delicious food. Do you have any friends with the same hobbies? Come and chat with me. We",
  },
  {
    id: "movement-2",
    text: "I'm 180 cm tall. I enjoy fitness, swimming and delicious food. Do you have any friends with the same hobbies? Come and chat with me. We",
  },
  {
    id: "movement-3",
    text: "I'm 180 cm tall. I enjoy fitness, swimming and delicious food. Do you have any friends with the same hobbies?",
  },
] as const;

export function ProfilePagePrototype({
  width = 375,
  height = 812,
  theme = "light",
  className,
  onNavigate,
  onBack,
}: ProfilePagePrototypeProps) {
  /*
   * Screen: Profile — active room entry, without occupying the honor badge
   * area. The whole entry navigates directly to Room.
   */
  const [tab, setTab] = useState<ProfileTab>("about");
  const [navigationSolid, setNavigationSolid] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setNavigationSolid(event.currentTarget.scrollTop >= 205);
  };
  const showAction = (message: string) => setToast(message);
  const enterRoom = () => {
    if (onNavigate) {
      onNavigate("room");
      return;
    }
    showAction("Enter Andrew's Music Party voice room");
  };

  return (
    <div
      className={[
        "pageCanvasDevice",
        "profileV3Device",
        navigationSolid ? "isNavigationSolid" : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
      aria-label={`个人资料原型 · ${width}×${height}`}
    >
      <IosStatusBar
        appearance={
          !navigationSolid || theme === "dark"
            ? "light-content"
            : "dark-content"
        }
      />
      <div className="pageCanvasContentShell">
        <div className="profileV3Scroll" onScroll={handleScroll}>
          <ProfileV3Navigation
            solid={navigationSolid}
            onBack={onBack ?? (() => showAction("返回上一页"))}
            onCar={() => showAction("打开座驾")}
            onMore={() => showAction("打开个人资料更多操作")}
          />

          <section className="profileV3Hero" aria-label="个人资料背景">
            <Image
              src="/prototypes/profile-v3/cover.png"
              alt=""
              fill
              sizes={`${width}px`}
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
                aria-label="查看 Andrew 的头像"
                onClick={() => showAction("查看头像大图")}
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
                aria-label="Enter Andrew's Music Party voice room"
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
                  <small>{ROOM_FOLLOW_COPY.status}</small>
                  <strong>{ROOM_FOLLOW_COPY.action}</strong>
                </span>
                <SystemIcon name="chevronRight" size={16} />
              </button>
              <h1>Andrew</h1>
              <button
                type="button"
                className="profileV3Id"
                onClick={() => showAction("已复制 ID 1231231")}
              >
                <strong>ID</strong> 1231231
              </button>
              <ProfileV3Facts />
              <ProfileV3PrivilegeCards />
              <div className="profileV3Medals" aria-label="个人成就">
                <Image
                  className="profileV3MedalImage"
                  src="/prototypes/profile-v3/medal-top-contributor-ar.png"
                  width={104}
                  height={24}
                  alt="Top contributor badge"
                />
              </div>
            </header>

            <div className="profileV3StickyTabs">
              <UnderlineSecondaryTab
                items={PROFILE_TABS}
                value={tab}
                ariaLabel="个人资料内容"
                onChange={(key) => setTab(key as ProfileTab)}
              />
            </div>

            {tab === "about" ? (
              <ProfileAbout onAction={showAction} />
            ) : (
              <ProfileMovement onAction={showAction} />
            )}
          </article>
        </div>

        {tab === "movement" ? (
          <button
            type="button"
            className="profileV3Compose"
            aria-label="发布动态"
            onClick={() => showAction("创建新动态")}
          >
            <SystemIcon name="publish" />
          </button>
        ) : null}
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
  onCar,
  onMore,
}: {
  solid: boolean;
  onBack: () => void;
  onCar: () => void;
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
        <strong>Amanda</strong>
        <small>ID:1239232</small>
      </span>
      <span className="profileV3NavigationActions">
        <button type="button" aria-label="座驾" onClick={onCar}>
          <Image
            src="/prototypes/profile-v3/car.png"
            alt=""
            width={30}
            height={18}
          />
        </button>
        <button type="button" aria-label="更多" onClick={onMore}>
          <SystemIcon name="more" />
        </button>
      </span>
    </nav>
  );
}

function ProfileV3Facts() {
  return (
    <div className="profileV3Facts" aria-label="个人基础资料">
      <ListTag kind="gender" gender="male" />
      <span>Egypt</span>
      <span>Egypt</span>
      <span>1062 Days</span>
      <span>Lv.999</span>
    </div>
  );
}

function ProfileV3PrivilegeCards() {
  return (
    <div className="profileV3Privileges" aria-label="身份权益">
      <Image
        className="profileV3PrivilegeImage"
        src="/prototypes/profile-v3/privilege-vip15.png"
        width={100}
        height={40}
        alt="VIP 15"
      />
      <Image
        className="profileV3PrivilegeImage"
        src="/prototypes/profile-v3/privilege-level-50.png"
        width={100}
        height={40}
        alt="Level 50"
      />
      <Image
        className="profileV3PrivilegeImage"
        src="/prototypes/profile-v3/privilege-wealth-12k.png"
        width={100}
        height={40}
        alt="Wealth level 12.2k"
      />
    </div>
  );
}

function ProfileAbout({
  onAction,
}: {
  onAction: (message: string) => void;
}) {
  return (
    <div className="profileV3About">
      <ProfileSectionHeader
        title="Relationship"
        meta="23"
        onPress={() => onAction("打开 Relationship")}
      />
      <div className="profileV3Relationship">
        <button type="button" onClick={() => onAction("打开 LV100 关系")}>
          <span>LV100</span>
          <AvatarVisual
            size={24}
            src="/prototypes/profile-v3/feed-avatar.png"
            alt=""
          />
        </button>
        <button type="button" onClick={() => onAction("打开 LV10 关系")}>
          <span>LV10</span>
          <AvatarVisual
            size={24}
            src="/icons/list/general-avatar.png"
            alt=""
          />
        </button>
      </div>

      <ProfileSectionHeader
        title="Supporters"
        meta="0"
        onPress={() => onAction("打开 Supporters")}
      />
      <div className="profileV3Supporters">
        {[1, 2, 3].map((supporter) => (
          <button
            type="button"
            key={supporter}
            onClick={() => onAction(`打开 Supporter ${supporter}`)}
          >
            <AvatarVisual
              size={48}
              src="/icons/list/message-avatar.png"
              alt=""
            />
            <span>999</span>
          </button>
        ))}
      </div>

      <ProfileSectionHeader
        title="Exhibition"
        onPress={() => onAction("打开 Exhibition")}
      />
      <button
        type="button"
        className="profileV3Exhibition"
        onClick={() => onAction("打开礼物展厅")}
      >
        <Image
          src="/icons/product/toptop-gift.png"
          alt=""
          width={64}
          height={64}
        />
        <span>
          <strong>467<small>/600</small></strong>
          Gifts
        </span>
        <span>
          <strong>467<small>/600</small></strong>
          Gems
        </span>
      </button>

      <ProfileSectionHeader
        title="Chat Rooms"
        meta="23"
        onPress={() => onAction("打开 Chat Rooms")}
      />
      <div className="profileV3Rooms">
        {[1, 2, 3].map((room) => (
          <button
            type="button"
            key={room}
            onClick={() => onAction(`打开 Chat Room ${room}`)}
          >
            <Image
              src="/prototypes/profile-v3/room-2.png"
              alt=""
              width={80}
              height={80}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function ProfileSectionHeader({
  title,
  meta,
  onPress,
}: {
  title: string;
  meta?: string;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      className="profileV3SectionHeader"
      onClick={onPress}
    >
      <strong>{title}</strong>
      <span>
        {meta}
        <SystemIcon name="chevronRight" size={16} />
      </span>
    </button>
  );
}

function ProfileMovement({
  onAction,
}: {
  onAction: (message: string) => void;
}) {
  return (
    <section className="profileV3Movement" aria-label="Movement 动态">
      {movementPosts.map((post) => (
        <article className="profileV3MovementCard" key={post.id}>
          <header>
            <AvatarVisual
              size={48}
              src="/prototypes/profile-v3/feed-avatar.png"
              alt=""
            />
            <span>
              <strong>Andrew</strong>
              <small>
                <Image
                  src="/prototypes/profile-v3/saudi-flag.png"
                  alt=""
                  width={20}
                  height={14}
                />
                <ListTag kind="gender" gender="male" age={28} />
                <ListTag kind="membership" level={10} />
              </small>
            </span>
            <button
              type="button"
              aria-label="更多动态操作"
              onClick={() => onAction("打开动态更多操作")}
            >
              <SystemIcon name="more" />
            </button>
          </header>
          <div className="profileV3MovementBody">
            <p>
              {post.text} <button type="button">...see more</button>
            </p>
            <time>23 minutes ago</time>
            <div>
              <button
                type="button"
                aria-label="点赞动态"
                onClick={() => onAction("已点赞动态")}
              >
                <SystemIcon name="like" />
              </button>
              <button
                type="button"
                aria-label="评论动态"
                onClick={() => onAction("打开动态评论")}
              >
                <SystemIcon name="comment" size={22} />
              </button>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
