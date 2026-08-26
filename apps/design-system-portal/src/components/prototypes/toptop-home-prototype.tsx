"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import { BottomNavigationIcon } from "@/components/kit/bottom-navigation-icon";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { ListTag } from "@/components/kit/list-tag";
import { PrototypeAvatarImage } from "@/components/kit/prototype-avatar-image";
import { SystemIcon } from "@/components/kit/system-icon";
import {
  BOTTOM_NAV_DESTINATIONS,
  type BottomNavKey,
} from "@/lib/profile-prototype-model";
import { getTopTopFriendStripLayout } from "@/lib/top-top-home-layout";

/*
 * Screens:
 * 1. TopTop 首页 — 顶栏、好友、游戏、找朋友 → 对应动作反馈
 * 2. 其他一级目的地 — 底栏切换 → 占位页 → 返回 TopTop
 *
 * State:
 * - destination: 当前一级目的地
 * - toast: 本地原型动作反馈
 */

type TopTopHomePrototypeProps = {
  width?: number;
  height?: number;
  onNavigate?: (destination: BottomNavKey) => void;
  onOpenProfile?: () => void;
  onOpenSearch?: () => void;
};

const friendsForCollage = [
  {
    name: "Cassie",
    image: "/prototypes/toptop-home/avatar-cassie.png",
    status: "voice",
  },
  {
    name: "Andrew",
    image: "/prototypes/toptop-home/avatar-andrew.png",
    status: "game",
  },
  {
    name: "Estelle",
    image: "/prototypes/toptop-home/avatar-estelle.png",
    status: "room",
  },
  {
    name: "Felix",
    image: "/prototypes/toptop-home/avatar-felix.png",
    status: "voice",
  },
] as const;

const friendRoster = [
  ...friendsForCollage,
  {
    name: "Susan",
    image: "/prototypes/toptop-home/susan-avatar.png",
    status: "game",
  },
  {
    name: "Mira",
    image: "/prototypes/toptop-home/avatar-estelle.png",
    status: "room",
  },
  {
    name: "Nora",
    image: "/prototypes/toptop-home/friend-avatar.png",
    status: "voice",
  },
  {
    name: "Leo",
    image: "/prototypes/toptop-home/avatar-andrew.png",
    status: "game",
  },
  {
    name: "Zoe",
    image: "/prototypes/toptop-home/avatar-cassie.png",
    status: "room",
  },
] as const;

const games = [
  {
    name: "Jackaroo",
    image: "/prototypes/toptop-home/game-jackaroo-v2.png",
  },
  { name: "Carrom", image: "/prototypes/toptop-home/game-carrom-v2.png" },
  { name: "Uno", image: "/prototypes/toptop-home/game-uno-v2.png" },
  {
    name: "Candy Boom",
    image: "/prototypes/toptop-home/game-candy-boom-v2.png",
  },
  { name: "Okey", image: "/prototypes/toptop-home/game-okey-v2.png" },
  { name: "More Games", image: "/prototypes/toptop-home/game-more-v2.png" },
];

const friendSuggestions = [
  {
    name: "susan",
    avatar: "/prototypes/toptop-home/susan-avatar.png",
    membership: 10,
    gender: "female",
    age: 28,
  },
  {
    name: "namenamename",
    avatar: "/prototypes/toptop-home/friend-avatar.png",
    membership: 9,
    gender: "female",
    age: 24,
  },
  {
    name: "Mira",
    avatar: "/prototypes/toptop-home/avatar-estelle.png",
    membership: 8,
    gender: "female",
    age: 26,
  },
] as const;

export function TopTopHomePrototype({
  width = 375,
  height = 812,
  onNavigate,
  onOpenProfile,
  onOpenSearch,
}: TopTopHomePrototypeProps) {
  const [destination, setDestination] = useState<BottomNavKey>("toptop");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showAction = (message: string) => setToast(message);
  const friendStrip = getTopTopFriendStripLayout(width);
  const visibleFriends = friendRoster.slice(0, friendStrip.visibleFriendCount);

  return (
    <div
      className={`pageCanvasDevice topTopHomeDevice topTopHomeDevice--${destination}`}
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
      aria-label={`TopTop 首页原型 · ${width}×${height}`}
    >
      <div className="pageCanvasContentShell">
        {destination === "toptop" ? (
          <>
            <TopTopHomeHeader
              onOpenProfile={onOpenProfile}
              onOpenSearch={onOpenSearch}
              onAction={showAction}
            />
            <main className="topTopHomeScroll" aria-label="TopTop 首页内容">
            <section
              className="topTopHomeSection topTopFriendsSection"
              aria-labelledby="toptop-friends-title"
            >
              <h2 id="toptop-friends-title">Join friends</h2>
              <div
                className="topTopFriendGrid"
                style={{
                  gridTemplateColumns: `repeat(${friendStrip.columns}, 56px)`,
                  gap: `${friendStrip.gap}px`,
                }}
              >
                {visibleFriends.map((friend) => (
                  <button
                    key={friend.name}
                    type="button"
                    className="topTopFriend"
                    aria-label={`打开 ${friend.name}`}
                    onClick={() => showAction(`打开 ${friend.name}`)}
                  >
                    <span className="topTopFriendAvatar">
                      <PrototypeAvatarImage
                        src={friend.image}
                        alt=""
                        displaySize={48}
                      />
                      <Image
                        className={`topTopFriendStatus topTopFriendStatus--${friend.status}`}
                        src={`/icons/product/toptop-status-${friend.status}.png`}
                        alt=""
                        width={20}
                        height={20}
                      />
                    </span>
                    <span>{friend.name}</span>
                  </button>
                ))}
                <button
                  type="button"
                  className="topTopFriend topTopFriend--more"
                  aria-label="打开 7 More"
                  onClick={() => showAction("打开 7 More")}
                >
                  <span className="topTopFriendCollage" aria-hidden="true">
                    {friendsForCollage.map((friend) => (
                      <PrototypeAvatarImage
                        key={friend.name}
                        src={friend.image}
                        alt=""
                        displaySize={28}
                      />
                    ))}
                  </span>
                  <span>7 More</span>
                </button>
              </div>
            </section>

            <section
              className="topTopHomeSection topTopGamesSection"
              aria-labelledby="toptop-games-title"
            >
              <div className="topTopSectionHeader">
                <h2 id="toptop-games-title">Game</h2>
                <button
                  type="button"
                  className="topTopPrivateRoomButton"
                  aria-label="创建 private room"
                  onClick={() => showAction("创建 private room")}
                >
                  private room
                  <span aria-hidden="true">＋</span>
                </button>
              </div>
              <div className="topTopGameGrid">
                {games.map((game) => (
                  <button
                    key={game.name}
                    type="button"
                    className="topTopGameCard"
                    aria-label={`打开 ${game.name}`}
                    onClick={() => showAction(`启动 ${game.name}`)}
                  >
                    <Image
                      src={game.image}
                      alt=""
                      width={109}
                      height={150}
                      sizes="(max-width: 480px) 30vw, 109px"
                      className="topTopGameCardImage"
                      loading="eager"
                    />
                  </button>
                ))}
              </div>
            </section>

            <section
              className="topTopHomeSection topTopFindSection"
              aria-labelledby="toptop-find-title"
            >
              <h2 id="toptop-find-title">find Friend</h2>
              <div className="topTopSuggestionList">
                {friendSuggestions.map((friend) => (
                  <button
                    type="button"
                    className="topTopSuggestionRow"
                    key={friend.name}
                    aria-label={`打开 ${friend.name} 的个人资料`}
                    onClick={() =>
                      showAction(`打开 ${friend.name} 的个人资料`)
                    }
                  >
                    <span className="topTopSuggestionAvatar">
                      <PrototypeAvatarImage
                        src={friend.avatar}
                        alt=""
                        displaySize={48}
                        loading="eager"
                      />
                    </span>
                    <span className="topTopSuggestionContent">
                      <strong>{friend.name}</strong>
                      <span className="topTopSuggestionBadges">
                        <ListTag
                          kind="membership"
                          level={friend.membership}
                        />
                        <ListTag
                          kind="gender"
                          gender={friend.gender}
                          age={friend.age}
                        />
                      </span>
                    </span>
                    <SystemIcon
                      name="chevronRight"
                      size={20}
                      className="topTopSuggestionChevron"
                    />
                  </button>
                ))}
              </div>
            </section>
            </main>
          </>
        ) : (
          <main className="topTopDestinationPlaceholder">
            <span className="topTopPlaceholderGlyph" aria-hidden="true" />
            <h1>
              {
                BOTTOM_NAV_DESTINATIONS.find(
                  (item) => item.key === destination,
                )?.label
              }
            </h1>
            <p>当前原型聚焦 TopTop 首页。</p>
            <button type="button" onClick={() => setDestination("toptop")}>
              返回 TopTop
            </button>
          </main>
        )}

        <TopTopBottomNavigation
          selected={destination}
          onChange={(key) => {
            if (onNavigate) {
              onNavigate(key);
              return;
            }
            setDestination(key);
            showAction(
              key === "toptop"
                ? "已回到 TopTop"
                : `切换到 ${
                    BOTTOM_NAV_DESTINATIONS.find((item) => item.key === key)
                      ?.label
                  }`,
            );
          }}
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

function TopTopHomeHeader({
  onOpenProfile,
  onOpenSearch,
  onAction,
}: {
  onOpenProfile?: () => void;
  onOpenSearch?: () => void;
  onAction: (message: string) => void;
}) {
  return (
    <header className="topTopHomeHeader">
      <IosStatusBar
        className="topTopStatusBar"
        appearance="light-content"
      />
      <div className="topTopHeaderBar">
        <button
          type="button"
          className="topTopHeaderAvatar"
          aria-label="个人资料"
          onClick={() => {
            if (onOpenProfile) {
              onOpenProfile();
              return;
            }
            onAction("打开个人资料");
          }}
        >
          <PrototypeAvatarImage
            src="/prototypes/toptop-home/header-avatar.png"
            alt=""
            displaySize={36}
          />
        </button>
        <button
          type="button"
          className="topTopCoinPill"
          aria-label="金币中心"
          onClick={() => onAction("打开金币中心")}
        >
          <Image
            src="/icons/product/toptop-coin.png"
            alt=""
            width={24}
            height={24}
          />
          <strong>99999</strong>
          <Image
            src="/icons/product/toptop-coin-add.png"
            alt=""
            width={20}
            height={20}
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          className="topTopGiftButton"
          aria-label="礼物中心"
          onClick={() => onAction("打开礼物中心")}
        >
          <Image
            src="/icons/product/toptop-gift.png"
            alt=""
            width={28}
            height={28}
          />
        </button>
        <span className="topTopHeaderSpacer" />
        <button
          type="button"
          className="topTopUtilityButton topTopUtilityButton--checkin"
          aria-label="签到"
          onClick={() => onAction("打开签到")}
        >
          <Image
            src="/icons/product/toptop-check-in.png"
            alt=""
            width={28}
            height={28}
          />
          <i aria-hidden="true" />
        </button>
        <button
          type="button"
          className="topTopUtilityButton topTopUtilityButton--rank"
          aria-label="排行榜"
          onClick={() => onAction("打开排行榜")}
        >
          <Image
            src="/icons/product/toptop-ranking.png"
            alt=""
            width={28}
            height={28}
          />
        </button>
        <button
          type="button"
          className="topTopUtilityButton topTopUtilityButton--search"
          aria-label="搜索"
          onClick={() => {
            if (onOpenSearch) {
              onOpenSearch();
              return;
            }
            onAction("打开搜索");
          }}
        >
          <SystemIcon name="search" size={24} />
        </button>
      </div>
      <h1 className="srOnly">TopTop 首页</h1>
    </header>
  );
}

function TopTopBottomNavigation({
  selected,
  onChange,
}: {
  selected: BottomNavKey;
  onChange: (key: BottomNavKey) => void;
}) {
  return (
    <nav
      className="bottomNavigation bottomNavigationDark pageCanvasBottomNav topTopHomeBottomNav"
      aria-label="App 一级目的地"
    >
      <div className="bottomNavigationItems">
        {BOTTOM_NAV_DESTINATIONS.map((item) => (
          <button
            className={`bottomNavigationItem${
              selected === item.key ? " selected" : ""
            }`}
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
