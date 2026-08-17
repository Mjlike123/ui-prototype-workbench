"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import { AvatarVisual } from "@/components/kit/avatar-visual";
import { BottomNavigationIcon } from "@/components/kit/bottom-navigation-icon";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { ListTag } from "@/components/kit/list-tag";
import { PrimaryNavigation } from "@/components/kit/primary-navigation";
import { SystemIcon } from "@/components/kit/system-icon";
import { SearchControl } from "@/components/kit/search-control";
import { PrimaryNavigationSearchIcon } from "@/components/primary-navigation-search-icon";
import type { PrivateChatFriend } from "@/components/prototypes/private-chat-prototype";
import { getMessageOnlineFriendStripLayout } from "@/lib/top-top-home-layout";
import {
  BOTTOM_NAV_DESTINATIONS,
  type BottomNavKey,
} from "@/lib/profile-prototype-model";

type DestinationScreen = Extract<BottomNavKey, "room" | "feed" | "message">;

type PrototypeDestinationPageProps = {
  screen: DestinationScreen;
  onNavigate: (destination: BottomNavKey) => void;
  onOpenSearch?: () => void;
  onOpenPrivateChat?: (friend: PrivateChatFriend) => void;
  onOpenCompose?: () => void;
  width?: number;
  height?: number;
  theme?: "light" | "dark";
};

const ROOM_TABS = ["Mine", "Popular", "KSA"] as const;
type RoomTab = (typeof ROOM_TABS)[number];

export function PrototypeDestinationPage({
  screen,
  onNavigate,
  onOpenSearch,
  onOpenPrivateChat,
  onOpenCompose,
  width = 375,
  height = 812,
  theme = "light",
}: PrototypeDestinationPageProps) {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <div
      className={`pageCanvasDevice prototypeDestinationDevice prototypeDestinationDevice--${screen}`}
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
      aria-label={`${destinationTitle(screen)} 原型 · ${width}×${height}`}
    >
      <PrototypeStatusBar theme={theme} />
      <div className="pageCanvasContentShell">
        {screen === "feed" ? (
          <FeedScreen onAction={setToast} />
        ) : screen === "room" ? (
          <RoomScreen onAction={setToast} />
        ) : (
          <main className="prototypeDestinationScroll">
            {screen === "message" ? (
              <MessageScreen
                width={width}
                onAction={setToast}
                onOpenSearch={onOpenSearch}
                onOpenPrivateChat={onOpenPrivateChat}
              />
            ) : null}
          </main>
        )}
        {screen === "feed" ? (
          <button
            type="button"
            className="prototypeFeedCompose"
            aria-label="发布动态"
            onClick={() =>
              onOpenCompose ? onOpenCompose() : setToast("创建新动态")
            }
          >
            <span>
              <SystemIcon name="publish" />
            </span>
          </button>
        ) : null}
        <DestinationBottomNavigation
          selected={screen}
          onChange={onNavigate}
        />
      </div>
      {toast ? (
        <div className="profilePrototypeToast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function RoomScreen({ onAction }: { onAction: (message: string) => void }) {
  const [tab, setTab] = useState<RoomTab>("KSA");
  const rooms = [
    {
      title: "Riyadh rank partners",
      need: "Need: Mid Lane / Exp Lane / Jungle",
      people: "9999",
      badge: "/prototypes/room/room-badge-gavel.png",
    },
    {
      title: "Late night stories",
      need: "Need: Support / Roamer / Friends",
      people: "5",
      badge: "/prototypes/room/room-badge-eight.png",
    },
    {
      title: "Jackaroo partners",
      need: "Need: One more player for tonight",
      people: "5",
      badge: "/prototypes/room/room-badge-game.png",
    },
    {
      title: "Arabic music live",
      need: "Need: Singers and music lovers",
      people: "5",
    },
    {
      title: "Make new friends",
      need: "Need: Friendly voices nearby",
      people: "5",
    },
    {
      title: "Morning coffee club",
      need: "Need: Early birds and easy conversation",
      people: "18",
    },
    {
      title: "Quran and reflection",
      need: "Need: Respectful listeners and readers",
      people: "26",
    },
    {
      title: "Saudi gamers",
      need: "Need: Ranked teammates for tonight",
      people: "42",
    },
    {
      title: "Weekend vibes",
      need: "Need: Music, stories and new friends",
      people: "31",
    },
  ];

  return (
    <>
      <h1 className="visuallyHidden">Room</h1>
      <PrimaryNavigation
        className="prototypeRoomNavigation"
        ariaLabel="Room 分类"
        items={ROOM_TABS.map((item) => ({ key: item, label: item }))}
        value={tab}
        onChange={(value) => setTab(value as RoomTab)}
        actions={[
          {
            key: "news",
            label: "Room 新闻",
            icon: (
              <Image
                src="/icons/product/news.png"
                alt=""
                width={28}
                height={28}
              />
            ),
            onPress: () => onAction("打开 Room 新闻"),
          },
          {
            key: "activity",
            label: "Room 活动",
            icon: (
              <Image
                src="/icons/product/party.png"
                alt=""
                width={28}
                height={28}
              />
            ),
            onPress: () => onAction("打开 Room 活动"),
          },
          {
            key: "search",
            label: "搜索 Room",
            icon: <PrimaryNavigationSearchIcon />,
            onPress: () => onAction("搜索 Room"),
          },
        ]}
      />
      <main className="prototypeDestinationScroll prototypeRoomScroll">
        <section className="prototypeRoomList" aria-label={`${tab} Rooms`}>
          {rooms.map((room) => (
            <button
              key={room.title}
              type="button"
              className="prototypeRoomRow"
              aria-label={`${room.title}，${room.need}，${room.people} 人在线`}
              onClick={() => onAction(`打开 ${room.title}`)}
            >
              <Image
                className="prototypeRoomCover"
                src="/prototypes/room/room-cover.png"
                alt=""
                width={64}
                height={64}
              />
              <span className="prototypeRoomCopy">
                <span className="prototypeRoomTitle">
                  <Image
                    src="/prototypes/room/uae-flag.png"
                    alt=""
                    width={20}
                    height={14}
                  />
                  <strong>{room.title}</strong>
                </span>
                <small>{room.need}</small>
                <span className="prototypeRoomTags" aria-hidden="true">
                  <i className="prototypeRoomRank">🏆 Gold III</i>
                  <i className="prototypeRoomEvent">13 Hello event</i>
                  <i className="prototypeRoomLevel">Lv.1</i>
                </span>
              </span>
              {room.badge ? (
                <Image
                  className="prototypeRoomBadge"
                  src={room.badge}
                  alt=""
                  width={36}
                  height={32}
                />
              ) : null}
              <span className="prototypeRoomPeople" aria-hidden="true">
                <SystemIcon
                  name="voiceStatus"
                  size={14}
                  className="prototypeRoomVoiceIcon"
                />
                {room.people}
              </span>
            </button>
          ))}
        </section>
      </main>
    </>
  );
}

function FeedScreen({ onAction }: { onAction: (message: string) => void }) {
  const [tab, setTab] = useState<"Mine" | "Recommend" | "Beijing">("Recommend");
  const [followed, setFollowed] = useState<Record<string, boolean>>({
    Andrew: true,
  });
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const posts = [
    {
      user: "Latifa Alghanim",
      avatar: "/prototypes/feed/latifa-avatar.png",
      flag: "/prototypes/feed/ukraine-flag.png",
      flagWidth: 24,
      gender: "female" as const,
      age: 28,
      level: "N8",
      vip: 13 as const,
      caption:
        "I'm 180 cm tall. I enjoy fitness, swimming and delicious food. Do you have any friends with the same hobbies? Come and chat with me. We",
      hashtags: ["#OOTD", "#While the sun is shining"],
      media: "/prototypes/feed/latifa-photo.png",
      likes: "99",
      comments: "99",
    },
    {
      user: "Andrew",
      avatar: "/prototypes/feed/andrew-avatar.png",
      flag: "/prototypes/feed/saudi-flag.png",
      flagWidth: 20,
      gender: "male" as const,
      age: 28,
      vip: 10 as const,
      caption:
        "I'm 180 cm tall. I enjoy fitness, swimming and delicious food. Do you have any friends with the same hobbies? Come and chat with me. We",
      hashtags: [],
      likes: "",
      comments: "",
    },
  ];

  return (
    <>
      <h1 className="visuallyHidden">Feed</h1>
      <PrimaryNavigation
        className="prototypeFeedNavigation"
        ariaLabel="Feed 分类"
        items={["Mine", "Recommend", "Beijing"].map((item) => ({
          key: item,
          label: item,
        }))}
        value={tab}
        onChange={(value) =>
          setTab(value as "Mine" | "Recommend" | "Beijing")
        }
        actions={[
          {
            key: "notifications",
            label: "Feed 通知",
            icon: <SystemIcon name="notification" />,
            onPress: () => onAction("打开 Feed 通知"),
          },
        ]}
      />
      <main className="prototypeDestinationScroll prototypeFeedScroll">
        <section className="prototypeFeedList" aria-label={`${tab} Feed`}>
          {posts.map((post) => (
            <article className="prototypeFeedCard" key={post.user}>
            <header className="prototypeFeedAuthor">
              <AvatarVisual size={48} src={post.avatar} alt="" />
              <div className="prototypeFeedIdentity">
                <strong>{post.user}</strong>
                <span
                  className="prototypeFeedTags"
                  aria-label={`${post.age} 岁，会员 V${post.vip}`}
                >
                  <Image
                    src={post.flag}
                    alt=""
                    width={post.flagWidth}
                    height={14}
                  />
                  <ListTag
                    kind="gender"
                    gender={post.gender}
                    age={post.age}
                  />
                  {post.level ? (
                    <Image
                      className="prototypeFeedLevel"
                      src="/prototypes/feed/n8-badge.png"
                      alt="N8"
                      width={36}
                      height={14}
                    />
                  ) : null}
                  <ListTag kind="membership" level={post.vip} />
                </span>
              </div>
              <div className="prototypeFeedAuthorActions">
                <button
                  className="prototypeFeedFollow"
                  type="button"
                  aria-label={`${followed[post.user] ? "取消关注" : "关注"} ${post.user}`}
                  aria-pressed={Boolean(followed[post.user])}
                  onClick={() => {
                    setFollowed((current) => ({
                      ...current,
                      [post.user]: !current[post.user],
                    }));
                    onAction(
                      `${followed[post.user] ? "已取消关注" : "已关注"} ${post.user}`,
                    );
                  }}
                >
                  <span>
                    <SystemIcon
                      name={followed[post.user] ? "followed" : "follow"}
                    />
                  </span>
                </button>
                <button
                  className="prototypeFeedMore"
                  type="button"
                  aria-label={`更多 ${post.user}`}
                  onClick={() => onAction(`打开 ${post.user} 的更多操作`)}
                >
                  <SystemIcon name="more" />
                </button>
              </div>
            </header>
            <div className="prototypeFeedBody">
              <p className="prototypeFeedCaption">
                {post.hashtags[0] ? <mark>{post.hashtags[0]} </mark> : null}
                {post.caption}{" "}
                {post.hashtags.slice(1).map((hashtag) => (
                  <mark key={hashtag}>{hashtag} </mark>
                ))}
                <button
                  type="button"
                  onClick={() => onAction(`展开 ${post.user} 的动态`)}
                >
                  ...see more
                </button>
              </p>
              {post.media ? (
                <button
                  type="button"
                  className="prototypeFeedMedia"
                  aria-label={`查看 ${post.user} 的动态图片`}
                  onClick={() => onAction(`查看 ${post.user} 的动态图片`)}
                >
                  <Image
                    src={post.media}
                    alt={`${post.user} 的动态照片`}
                    width={180}
                    height={180}
                  />
                </button>
              ) : null}
              <time className="prototypeFeedTime">23 minutes ago</time>
              <div className="prototypeFeedActions">
                <div>
                  <button
                    type="button"
                    aria-label={`${liked[post.user] ? "取消喜欢" : "喜欢"} ${post.user} 的动态`}
                    aria-pressed={Boolean(liked[post.user])}
                    onClick={() => {
                      setLiked((current) => ({
                        ...current,
                        [post.user]: !current[post.user],
                      }));
                      onAction(`${liked[post.user] ? "取消喜欢" : "喜欢"} ${post.user} 的动态`);
                    }}
                  >
                    <SystemIcon name="like" />
                    {post.likes ? <span>{post.likes}</span> : null}
                  </button>
                  <button
                    type="button"
                    aria-label={`评论 ${post.user} 的动态`}
                    onClick={() => onAction(`评论 ${post.user} 的动态`)}
                  >
                    <SystemIcon name="comment" />
                    {post.comments ? <span>{post.comments}</span> : null}
                  </button>
                </div>
                <button
                  className="prototypeFeedChat"
                  type="button"
                  onClick={() => onAction(`与 ${post.user} 聊天`)}
                >
                  <SystemIcon name="chat" />
                  Chat
                </button>
              </div>
            </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}

function MessageScreen({
  width = 375,
  onAction,
  onOpenSearch,
  onOpenPrivateChat,
}: {
  width?: number;
  onAction: (message: string) => void;
  onOpenSearch?: () => void;
  onOpenPrivateChat?: (friend: PrivateChatFriend) => void;
}) {
  const onlineFriendRoster = [
    { name: "Buioi", avatar: "/prototypes/message/online-1.png" },
    { name: "Andrew", avatar: "/prototypes/feed/andrew-avatar.png" },
    { name: "Latifa", avatar: "/prototypes/feed/latifa-avatar.png" },
    { name: "Felix", avatar: "/prototypes/toptop-home/avatar-felix.png" },
    { name: "Cassie", avatar: "/prototypes/toptop-home/avatar-cassie.png" },
    { name: "Estelle", avatar: "/prototypes/toptop-home/avatar-estelle.png" },
    { name: "Susan", avatar: "/prototypes/toptop-home/susan-avatar.png" },
    { name: "Mira", avatar: "/prototypes/toptop-home/friend-avatar.png" },
  ];
  const onlineStrip = getMessageOnlineFriendStripLayout(width);
  const visibleOnlineFriends = onlineFriendRoster.slice(
    0,
    onlineStrip.visibleFriendCount,
  );
  const messages = [
    {
      id: "i980",
      name: "❤️i980🌹Wo🇦🇪Weuhrvfoiwe",
      preview: "2715 Ash Dr. San Jose",
      time: "06-24",
      avatar: "/prototypes/message/conversation-1.png",
      unread: "47",
    },
    {
      id: "gaiweuvb",
      name: "1gaiweuvb456🐫789123456789123456",
      preview: "2715 Ash Dr. San Jose",
      time: "06-24",
      avatar: "/prototypes/feed/andrew-avatar.png",
      unread: "47",
    },
    {
      id: "candy",
      name: "Candy",
      preview: "2715 Ash Dr. San Jose",
      time: "06-24",
      avatar: "/prototypes/toptop-home/avatar-felix.png",
      unread: "47",
    },
    {
      id: "hawkins-room-group",
      name: "Hawkins",
      preview: "2715 Ash Dr. San Jose, South Dakota 83475",
      time: "06-24",
      avatar: "/prototypes/toptop-home/avatar-estelle.png",
      roomGroup: true,
    },
    {
      id: "black-marvin-group",
      name: "🇦🇪：🌹✨🎀 Black Marvin 🌹✨🎀",
      preview: "Bill.Sanders@example.com",
      time: "06-24",
      group: true,
      unread: "9",
    },
    {
      id: "hawkins-gift",
      name: "Hawkins",
      preview: "2715 Ash Dr. San Jose, South Dakota 83475",
      time: "06-24",
      avatar: "/prototypes/toptop-home/avatar-andrew.png",
      gift: true,
      unread: "99+",
    },
    {
      id: "marvin",
      name: "Marvin",
      preview: "2715 Ash Dr. San Jose",
      time: "06-24",
      avatar: "/prototypes/toptop-home/susan-avatar.png",
      unread: "47",
    },
  ];
  return (
    <>
      <header className="prototypeMessageNavigation">
        <h1>Message</h1>
        <div className="prototypeMessageActions">
          <button
            type="button"
            aria-label="添加好友"
            onClick={() => onAction("打开添加好友")}
          >
            <SystemIcon name="contacts" size={28} />
          </button>
          <button
            type="button"
            aria-label="创建新消息"
            onClick={() => onAction("创建新消息")}
          >
            <SystemIcon name="newMessage" />
          </button>
        </div>
      </header>
      <div className="prototypeMessageSearchBlock">
        <SearchControl
          value=""
          active={false}
          placeholder="Search by Name / Userid"
          ariaLabel="搜索消息"
          onActivate={() =>
            onOpenSearch ? onOpenSearch() : onAction("打开搜索二级页面")
          }
          onChange={() => undefined}
          onCancel={() => undefined}
        />
      </div>
      <section className="prototypeOnlineFriends" aria-labelledby="online-friends-title">
        <h2 id="online-friends-title">online friends</h2>
        <div
          className="prototypeOnlineFriendList"
          style={{
            gridTemplateColumns: `repeat(${onlineStrip.columns}, 70px)`,
            gap: `${onlineStrip.gap}px`,
          }}
        >
          {visibleOnlineFriends.map((friend, index) => (
            <button
              type="button"
              key={`${friend.avatar}-${index}`}
              onClick={() =>
                onOpenPrivateChat
                  ? onOpenPrivateChat({
                      id: `online-${index}`,
                      name: friend.name,
                      avatar: friend.avatar,
                    })
                  : onAction(`打开在线好友 ${friend.name}`)
              }
            >
              <span className="prototypeOnlineFriendAvatar">
                <Image src={friend.avatar} alt="" width={48} height={48} />
                <Image
                  className="prototypeOnlineFriendDot"
                  src="/prototypes/message/online-dot.svg"
                  alt=""
                  width={12}
                  height={12}
                />
              </span>
              <small>{friend.name}</small>
            </button>
          ))}
          <button type="button" onClick={() => onAction("查看另外 7 位在线好友")}>
            <MessageGroupAvatar />
            <small>7 more</small>
          </button>
        </div>
      </section>
      <section className="prototypeMessageList" aria-label="消息列表">
        {messages.map((message) => (
          <button
            type="button"
            className="prototypeMessageRow"
            key={message.id}
            onClick={() => {
              if (!message.group && !message.roomGroup && onOpenPrivateChat) {
                onOpenPrivateChat({
                  id: message.id,
                  name: message.name,
                  avatar:
                    message.avatar ??
                    "/prototypes/message/conversation-1.png",
                });
                return;
              }
              onAction(`打开 ${message.name}`);
            }}
          >
            {message.group ? (
              <MessageGroupAvatar />
            ) : (
              <span className="prototypeMessageAvatar">
                <Image
                  src={
                    message.avatar ??
                    "/prototypes/message/conversation-1.png"
                  }
                  alt=""
                  width={48}
                  height={48}
                />
              </span>
            )}
            <span className="prototypeMessageCopy">
              <span className="prototypeMessageName">
                <strong>{message.name}</strong>
                {message.roomGroup ? <i>Room Group</i> : null}
              </span>
              <small>
                {message.gift ? <em>[Give You A Gift] </em> : null}
                {message.preview}
              </small>
            </span>
            <span className="prototypeMessageMeta">
              <time>{message.time}</time>
              {message.unread ? <i>{message.unread}</i> : null}
            </span>
          </button>
        ))}
      </section>
    </>
  );
}

function MessageGroupAvatar() {
  const members = [
    "/prototypes/toptop-home/avatar-cassie.png",
    "/prototypes/toptop-home/avatar-andrew.png",
    "/prototypes/toptop-home/avatar-estelle.png",
    "/prototypes/toptop-home/avatar-felix.png",
  ];
  return (
    <span className="prototypeMessageGroupAvatar" aria-hidden="true">
      {members.map((member) => (
        <Image
          key={member}
          src={member}
          alt=""
          width={28}
          height={28}
        />
      ))}
    </span>
  );
}

function DestinationBottomNavigation({
  selected,
  onChange,
}: {
  selected: BottomNavKey;
  onChange: (destination: BottomNavKey) => void;
}) {
  return (
    <nav
      className="bottomNavigation bottomNavigationLight pageCanvasBottomNav prototypeDestinationBottomNav"
      aria-label="App 一级目的地"
    >
      <div className="bottomNavigationItems">
        {BOTTOM_NAV_DESTINATIONS.map((item) => (
          <button
            className={`bottomNavigationItem${selected === item.key ? " selected" : ""}`}
            key={item.key}
            type="button"
            aria-current={selected === item.key ? "page" : undefined}
            onClick={() => onChange(item.key)}
          >
            <BottomNavigationIcon
              name={item.key}
              selected={selected === item.key}
            />
            <span className="bottomNavigationLabel">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="bottomNavigationSafeArea" aria-hidden="true">
        <span className="bottomNavigationHomeIndicator" />
      </div>
    </nav>
  );
}

function PrototypeStatusBar({ theme }: { theme: "light" | "dark" }) {
  return (
    <IosStatusBar
      className="prototypeDestinationStatus"
      appearance={theme === "dark" ? "light-content" : "dark-content"}
    />
  );
}

function destinationTitle(screen: DestinationScreen) {
  return BOTTOM_NAV_DESTINATIONS.find((item) => item.key === screen)?.label ?? screen;
}
